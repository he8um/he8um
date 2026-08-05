import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadPortfolio, validatePortfolio } from "./lib/portfolio.mjs";

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
const RELEASE_BADGE_REPOSITORIES = new Set(["he8um/oh-my-pm", "he8um/daryaft", "he8um/AirBridge", "he8um/branchdojo"]);

function markdownLinks(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
}

export function remoteImageUrls(markdown) {
  const markdownImages = [...markdown.matchAll(/!\[[^\]]*\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  const htmlImages = [...markdown.matchAll(/<img\s[^>]*src="(https:\/\/[^\"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  return [...new Set([...markdownImages, ...htmlImages])];
}

export function isAllowedLiveImage(url) {
  const parsed = new URL(url);
  if (parsed.hostname === "img.shields.io") return parsed.pathname.startsWith("/github/");
  if (parsed.hostname === "github.com") return /^\/he8um\/[A-Za-z0-9._-]+\/actions\/workflows\/[A-Za-z0-9._-]+\/badge\.svg$/.test(parsed.pathname);
  return new Set(["github-stats-extended.vercel.app", "github-readme-activity-graph.vercel.app"]).has(parsed.hostname);
}

export async function validateProfile() {
  const root = process.cwd();
  const errors = [];
  const portfolio = await loadPortfolio(root);
  errors.push(...validatePortfolio(portfolio));

  const readme = await readFile(`${root}/README.md`, "utf8");
  if (readme.split("\n").length > 350) errors.push("README.md exceeds 350 lines");
  if (!readme.includes("## Live Portfolio Dashboard")) errors.push("README is missing the live portfolio dashboard");
  if (!readme.includes('href="#selected-work"')) errors.push("hero does not link to the live portfolio dashboard");
  if (PLACEHOLDER_PATTERN.test(readme) || PLACEHOLDER_PATTERN.test(JSON.stringify(portfolio))) errors.push("unresolved placeholder found");
  if (FORBIDDEN_DISCLOSURE_PATTERN.test(`${readme}\n${JSON.stringify(portfolio)}`)) errors.push("private workspace identifier or local path found");
  if (/assets\/generated\//.test(readme)) errors.push("README still references committed static data visuals");
  if (/\bv\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?\b/.test(readme)) errors.push("README contains a hard-coded semantic version instead of a live release signal");
  for (const [pattern, label] of BANNED_README_PATTERNS) if (pattern.test(readme)) errors.push(`banned element found: ${label}`);

  const knownRepositories = new Set(portfolio.projects.map((project) => `https://github.com/${project.repository}`));
  for (const project of portfolio.projects) {
    if (!readme.includes(`https://github.com/${project.repository}`)) errors.push(`${project.repository}: public repository link is missing`);
  }
  for (const link of markdownLinks(readme)) {
    if (link.startsWith("https://github.com/he8um/") && /^https:\/\/github\.com\/he8um\/[^/#)]+$/.test(link) && !knownRepositories.has(link)) {
      errors.push(`README links to an ungoverned repository: ${link}`);
    }
  }

  const featured = portfolio.projects.filter((project) => project.featured);
  for (const project of featured) {
    const repositoryUrl = `https://github.com/${project.repository}`;
    if (!readme.includes(`| [${project.title}](${repositoryUrl}) |`)) errors.push(`${project.repository}: live repository box is missing`);
    if (!readme.includes(`img.shields.io/github/last-commit/${project.repository}`)) errors.push(`${project.repository}: live last-commit badge is missing`);
    if (!readme.includes(`img.shields.io/github/languages/top/${project.repository}`)) errors.push(`${project.repository}: live language badge is missing`);
    const escapedRepository = project.repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const workflowBadge = new RegExp(`https://github\\.com/${escapedRepository}/actions/workflows/[A-Za-z0-9._-]+/badge\\.svg\\?branch=main`);
    if (!workflowBadge.test(readme)) errors.push(`${project.repository}: live CI badge is missing`);
    if (RELEASE_BADGE_REPOSITORIES.has(project.repository) && !readme.includes(`img.shields.io/github/v/release/${project.repository}`)) {
      errors.push(`${project.repository}: live release badge is missing`);
    }
  }

  const liveImages = remoteImageUrls(readme);
  if (liveImages.length < 20) errors.push(`expected a data-rich live dashboard, found only ${liveImages.length} remote signals`);
  for (const url of liveImages) {
    try {
      if (!isAllowedLiveImage(url)) errors.push(`unapproved live image provider: ${url}`);
    } catch {
      errors.push(`invalid live image URL: ${url}`);
    }
  }

  const hero = await readFile(`${root}/assets/brand/hero.svg`, "utf8");
  if (!/<title(?:\s|>)/.test(hero) || !/<desc(?:\s|>)/.test(hero)) errors.push("brand hero is missing accessible SVG metadata");
  try { await access(`${root}/assets/brand/hero.svg`); } catch { errors.push("brand hero is missing"); }
  try { await access(`${root}/.github/workflows/refresh-profile.yml`); errors.push("obsolete static refresh workflow still exists"); } catch {}

  const workflow = await readFile(`${root}/.github/workflows/validate-profile.yml`, "utf8");
  if (/uses:\s+[^\s]+@(?:v|main|master)/.test(workflow)) errors.push("validation workflow action is not pinned to a full SHA");
  if (/pull_request_target:/.test(workflow)) errors.push("pull_request_target is forbidden");
  if (!/timeout-minutes:/.test(workflow)) errors.push("validation workflow timeout is missing");

  if (errors.length) throw new Error(errors.map((error) => `- ${error}`).join("\n"));
  console.log(`Validated ${portfolio.projects.length} governed projects, ${featured.length} live repository boxes, and ${liveImages.length} approved live signals.`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  validateProfile().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
