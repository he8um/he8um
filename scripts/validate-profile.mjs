import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = new URL("..", import.meta.url);
const REQUIRED_ASSETS = [
  "assets/control-plane.svg",
  "assets/operations.svg",
  "assets/system-map.svg",
  "assets/telemetry.svg"
];
const REQUIRED_DATA = [
  "data/profile.json",
  "data/operations.json",
  "data/system-map.json",
  "data/activity-data.json"
];
const BANNED_PATTERNS = [
  [/github-readme-stats|github-stats-extended|activity-graph|top-langs|streak-stats/i, "generic GitHub stats widgets"],
  [/readme-typing-svg|capsule-render|komarev|profile views?/i, "template vanity elements"],
  [/\bwhoami\b|neofetch|TARGET ACQUIRED|classified stamp/i, "hacker or theatrical military trope"],
  [/user-images\.githubusercontent\.com\/.*\.gif/i, "decorative GIF"]
];
const PRIVATE_DISCLOSURE_PATTERN = /(?:https:\/\/(?:airtable\.com\/app|app\.clickup\.com\/)|\/workspace\/|\blocalhost\b|api[_-]?key|secret|token\s*=)/i;
const PLACEHOLDER_PATTERN = /\b(?:REPLACE_ME|REPLACE_WITH_[A-Z0-9_]+|TODO|TBD)\b/;

async function readText(path) {
  return readFile(new URL(path, ROOT), "utf8");
}

async function readJson(path) {
  return JSON.parse(await readText(path));
}

function markdownImagePaths(markdown) {
  const markdownImages = [...markdown.matchAll(/!\[[^\]]*]\((\.\/[^)]+)\)/g)].map((match) => match[1]);
  const htmlImages = [...markdown.matchAll(/<img\s[^>]*src="(\.\/[^"]+)"/g)].map((match) => match[1]);
  return [...new Set([...markdownImages, ...htmlImages])].map((path) => path.replace(/^\.\//, ""));
}

function assert(condition, errors, message) {
  if (!condition) errors.push(message);
}

function validateProfileData(profile, errors) {
  assert(profile.schemaVersion === 1, errors, "profile.json schemaVersion must be 1");
  assert(profile.operator?.handle === "XHESAM", errors, "operator handle must be XHESAM");
  assert(Array.isArray(profile.telemetryRepositories) && profile.telemetryRepositories.length >= 6, errors, "telemetry repositories are missing");
  for (const repo of profile.telemetryRepositories ?? []) {
    assert(/^he8um\/[A-Za-z0-9._-]+$/.test(repo), errors, `invalid repository identifier: ${repo}`);
  }
  assert(Array.isArray(profile.capabilityMatrix) && profile.capabilityMatrix.length >= 7, errors, "capability matrix must cover core domains");
  assert(Array.isArray(profile.missionArchive) && profile.missionArchive.length >= 4, errors, "mission archive is too thin");
}

function validateOperationsData(operations, errors) {
  assert(operations.schemaVersion === 1, errors, "operations.json schemaVersion must be 1");
  assert(Array.isArray(operations.operations) && operations.operations.length >= 4, errors, "operations list is too short");
  for (const operation of operations.operations ?? []) {
    for (const field of ["id", "name", "type", "status", "description"]) {
      assert(Boolean(operation[field]), errors, `${operation.id ?? "operation"}: missing ${field}`);
    }
    assert(/^OP-\d{3}$/.test(operation.id), errors, `${operation.id}: invalid operation id`);
  }
}

function validateActivityData(activity, errors) {
  assert(activity.schemaVersion === 1, errors, "activity-data.json schemaVersion must be 1");
  assert(Array.isArray(activity.repositories) && activity.repositories.length >= 4, errors, "activity data needs at least four repositories");
  for (const repo of activity.repositories ?? []) {
    assert(/^he8um\/[A-Za-z0-9._-]+$/.test(repo.fullName), errors, `${repo.fullName}: invalid telemetry repository`);
    assert(Boolean(repo.url && repo.url.startsWith("https://github.com/he8um/")), errors, `${repo.fullName}: invalid repository URL`);
  }
}

async function validateSvg(path, errors) {
  const svg = await readText(path);
  assert(svg.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"), errors, `${path}: missing XML declaration`);
  assert(/<svg[^>]+role="img"/.test(svg), errors, `${path}: missing role=img`);
  assert(/aria-labelledby="title desc"/.test(svg), errors, `${path}: missing aria-labelledby`);
  assert(/<title id="title">/.test(svg) && /<desc id="desc">/.test(svg), errors, `${path}: missing title or desc`);
  assert(/viewBox="0 0 \d+ \d+"/.test(svg), errors, `${path}: missing viewBox`);
  assert(/prefers-reduced-motion:\s*reduce/.test(svg), errors, `${path}: missing reduced-motion rule`);
  assert(!/<script\b/i.test(svg), errors, `${path}: SVG must not include scripts`);
  assert(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg), errors, `${path}: SVG must not reference remote assets`);
  assert(svg.length < 70000, errors, `${path}: SVG is too large`);
}

async function validateWorkflow(path, errors, { writeAllowed }) {
  const workflow = await readText(path);
  assert(/timeout-minutes:/.test(workflow), errors, `${path}: timeout is missing`);
  assert(!/pull_request_target:/.test(workflow), errors, `${path}: pull_request_target is forbidden`);
  assert(/permissions:\n(?:  .+\n)+/.test(workflow), errors, `${path}: explicit permissions are missing`);
  if (writeAllowed) {
    assert(/contents: write/.test(workflow), errors, `${path}: update workflow needs contents: write`);
  } else {
    assert(/contents: read/.test(workflow), errors, `${path}: validation workflow should use contents: read`);
    assert(!/contents: write/.test(workflow), errors, `${path}: validation workflow must not write contents`);
  }
  assert(!/uses:\s+[^\s]+@(main|master|v\d+)/.test(workflow), errors, `${path}: third-party action must be pinned to a full SHA`);
}

export async function validateProfile() {
  const errors = [];
  for (const path of [...REQUIRED_ASSETS, ...REQUIRED_DATA]) {
    try {
      await access(new URL(path, ROOT));
    } catch {
      errors.push(`${path}: required file missing`);
    }
  }

  const [readme, profile, operations, activity] = await Promise.all([
    readText("README.md"),
    readJson("data/profile.json"),
    readJson("data/operations.json"),
    readJson("data/activity-data.json")
  ]);

  validateProfileData(profile, errors);
  validateOperationsData(operations, errors);
  validateActivityData(activity, errors);

  assert(readme.includes("XHESAM / OPERATIONS CONTROL PLANE"), errors, "README missing core product name");
  assert(readme.split("\n").length < 260, errors, "README is too long for an orchestration layer");
  assert(!PLACEHOLDER_PATTERN.test(readme), errors, "README contains unresolved placeholders");
  assert(!PRIVATE_DISCLOSURE_PATTERN.test(readme), errors, "README may disclose private workspace details or secrets");
  for (const [pattern, label] of BANNED_PATTERNS) {
    assert(!pattern.test(readme), errors, `banned element found: ${label}`);
  }
  for (const asset of REQUIRED_ASSETS) {
    assert(markdownImagePaths(readme).includes(asset), errors, `README does not reference ${asset}`);
    await validateSvg(asset, errors);
  }
  for (const contact of profile.contacts) {
    assert(readme.includes(contact.url), errors, `README missing contact URL: ${contact.url}`);
  }

  await validateWorkflow(".github/workflows/validate-profile.yml", errors, { writeAllowed: false });
  await validateWorkflow(".github/workflows/update-profile.yml", errors, { writeAllowed: true });

  if (errors.length) throw new Error(errors.map((error) => `- ${error}`).join("\n"));
  console.log(`Validated ${REQUIRED_ASSETS.length} SVG assets, ${operations.operations.length} operations, and ${activity.repositories.length} telemetry repositories.`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  validateProfile().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
