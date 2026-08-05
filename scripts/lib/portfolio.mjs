import { readFile } from "node:fs/promises";

export const MATURITY_VALUES = new Set([
  "stable",
  "active-development",
  "public-alpha",
  "release-candidate",
  "experimental",
  "maintained",
  "archived"
]);

export async function loadPortfolio(root = process.cwd()) {
  return JSON.parse(await readFile(`${root}/portfolio/projects.json`, "utf8"));
}

export function validatePortfolio(portfolio) {
  const errors = [];
  if (portfolio.schemaVersion !== 1) errors.push("projects.json schemaVersion must be 1");
  if (!portfolio.profile?.name || !portfolio.profile?.positioning || !portfolio.profile?.tagline) {
    errors.push("profile name, positioning, and tagline are required");
  }
  if (!Array.isArray(portfolio.projects) || portfolio.projects.length === 0) {
    errors.push("projects must be a non-empty array");
    return errors;
  }
  const seen = new Set();
  for (const project of portfolio.projects) {
    if (!project.repository || seen.has(project.repository)) errors.push(`duplicate or missing repository: ${project.repository ?? "unknown"}`);
    seen.add(project.repository);
    for (const field of ["title", "category", "summary"]) {
      if (!project[field]) errors.push(`${project.repository}: ${field} is required`);
    }
    if (!MATURITY_VALUES.has(project.maturity)) errors.push(`${project.repository}: invalid maturity ${project.maturity}`);
    if (!Array.isArray(project.technologies) || !Array.isArray(project.capabilities)) errors.push(`${project.repository}: technologies and capabilities must be arrays`);
    if (!/^he8um\/[A-Za-z0-9._-]+$/.test(project.repository)) errors.push(`${project.repository}: repository identifier is invalid`);
  }
  const featured = portfolio.projects.filter((project) => project.featured);
  if (featured.length !== 6) errors.push(`expected 6 featured projects, found ${featured.length}`);
  if (new Set(featured.map((project) => project.repository)).size !== featured.length) errors.push("featured repositories must be unique");
  return errors;
}
