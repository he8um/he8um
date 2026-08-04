import { readFile, access } from "node:fs/promises";
import { loadPortfolio, validatePortfolio } from "./lib/portfolio.mjs";
import { generateAll } from "./generate-profile.mjs";

const GENERATED_ASSETS = [
  "assets/brand/hero.svg",
  "assets/generated/portfolio-snapshot-mobile.svg",
  "assets/generated/portfolio-snapshot.svg",
  "assets/generated/ecosystem-map-mobile.svg",
  "assets/generated/ecosystem-map.svg",
  "assets/generated/maturity-matrix-mobile.svg",
  "assets/generated/maturity-matrix.svg",
  "assets/generated/release-timeline-mobile.svg",
  "assets/generated/release-timeline.svg",
  "assets/generated/technology-project-map-mobile.svg",
  "assets/generated/technology-project-map.svg"
];

const BANNED_README_PATTERNS = [
  [/github\/followers|Followers badge/i, "followers badge"],
  [/komarev\.com\/ghpvc|profile views?/i, "profile views"],
  [/top-langs|top languages/i, "Top Languages"],
  [/streak-stats|contribution streak/i, "streak card"],
  [/GitHub Developer Program/i, "unverified developer-program badge"],
  [/readme-typing-svg/i, "typing animation"],
  [/capsule-render/i, "remote animated hero or footer"],
  [/user-images\.githubusercontent\.com\/.*\.gif/i, "decorative GIF"]
];

const PLACEHOLDER_PATTERN = /\b(?:REPLACE_ME|REPLACE_WITH_[A-Z0-9_]+|TODO|TBD)\b/;
const FORBIDDEN_DISCLOSURE_PATTERN = /(?:https:\/\/(?:airtable\.com\/app|app\.clickup\.com\/)|\bDKM_[A-Z0-9_]+|\/workspace\/|\blocalhost\b)/i;

function markdownLinks(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
}

function localImagePaths(markdown) {
  const markdownImages = [...markdown.matchAll(/!\[[^\]]*\]\((\.\/[^)]+)\)/g)].map((match) => match[1]);
  const htmlImages = [...markdown.matchAll(/<(?:img|source)\s[^>]*(?:src|srcset)="(\.\/[^\"]+)"/g)].map((match) => match[1]);
  return [...new Set([...markdownImages, ...htmlImages].map((path) => path.replace(/^\.\//, "")))];
}

async function validate() {
  const root = process.cwd();
  const errors = [];
  const { portfolio, metadata } = await loadPortfolio(root);
  errors.push(...validatePortfolio(portfolio, metadata));

  const readme = await readFile(`${root}/README.md`, "utf8");
  if (readme.split("\n").length > 350) errors.push("README.md exceeds 350 lines");
  if (!readme.includes("## Selected Work")) errors.push("README is missing Selected Work");
  if (!readme.includes('href="#selected-work"')) errors.push("hero does not link to Selected Work");
  if (PLACEHOLDER_PATTERN.test(readme) || PLACEHOLDER_PATTERN.test(JSON.stringify(portfolio))) errors.push("unresolved placeholder found");
  if (FORBIDDEN_DISCLOSURE_PATTERN.test(`${readme}\n${JSON.stringify(portfolio)}`)) errors.push("private workspace identifier or local path found");
  for (const [pattern, label] of BANNED_README_PATTERNS) if (pattern.test(readme)) errors.push(`banned element found: ${label}`);

  const remoteImages = markdownLinks(readme).filter((link) => /^https:\/\//.test(link) && /(?:graph|stats|image|svg|png|gif)/i.test(link));
  const htmlRemoteImages = [...readme.matchAll(/<img\s[^>]*src="(https:\/\/[^\"]+)"/g)].map((match) => match[1]);
  if (new Set([...remoteImages, ...htmlRemoteImages]).size > 2) errors.push("README contains more than two remote images");

  const knownRepositories = new Set(portfolio.projects.map((project) => `https://github.com/${project.repository}`));
  for (const project of portfolio.projects) {
    if (!readme.includes(metadata.repositories[project.repository].url)) errors.push(`${project.repository}: README does not expose the public repository link`);
  }
  for (const link of markdownLinks(readme)) {
    if (link.startsWith("https://github.com/he8um/") && /^https:\/\/github\.com\/he8um\/[^/#)]+$/.test(link) && !knownRepositories.has(link)) {
      errors.push(`README links to an ungoverned repository: ${link}`);
    }
  }

  for (const path of localImagePaths(readme)) {
    try { await access(`${root}/${path}`); } catch { errors.push(`README references missing local image: ${path}`); }
  }
  for (const path of GENERATED_ASSETS) {
    const svg = await readFile(`${root}/${path}`, "utf8");
    if (!/<title(?:\s|>)/.test(svg) || !/<desc(?:\s|>)/.test(svg)) errors.push(`${path}: SVG title or description is missing`);
    if (/<(?:script|foreignObject)\b/i.test(svg)) errors.push(`${path}: executable or foreign SVG content is forbidden`);
    if (/https?:\/\//i.test(svg.replace("http://www.w3.org/2000/svg", ""))) errors.push(`${path}: external SVG dependency found`);
    if (!/viewBox="0 0 \d+ \d+"/.test(svg)) errors.push(`${path}: responsive viewBox is missing`);
  }

  const expected = await generateAll(root);
  for (const [path, content] of Object.entries(expected)) {
    const current = await readFile(`${root}/${path}`, "utf8");
    if (current !== content) errors.push(`${path}: generated output is stale or non-deterministic`);
  }

  const workflows = await Promise.all([
    readFile(`${root}/.github/workflows/validate-profile.yml`, "utf8"),
    readFile(`${root}/.github/workflows/refresh-profile.yml`, "utf8")
  ]);
  for (const [index, workflow] of workflows.entries()) {
    if (/uses:\s+[^\s]+@(?:v|main|master)/.test(workflow)) errors.push(`workflow ${index + 1}: action is not pinned to a full SHA`);
    if (/pull_request_target:/.test(workflow)) errors.push(`workflow ${index + 1}: pull_request_target is forbidden`);
    if (!/timeout-minutes:/.test(workflow)) errors.push(`workflow ${index + 1}: job timeout is missing`);
  }

  if (errors.length) throw new Error(errors.map((error) => `- ${error}`).join("\n"));
  console.log(`Validated ${portfolio.projects.length} governed projects, ${GENERATED_ASSETS.length} local SVGs, and README integrity.`);
}

validate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
