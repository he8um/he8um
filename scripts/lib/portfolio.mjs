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
  const [portfolioText, metadataText] = await Promise.all([
    readFile(`${root}/portfolio/projects.json`, "utf8"),
    readFile(`${root}/portfolio/public-metadata.json`, "utf8")
  ]);
  return {
    portfolio: JSON.parse(portfolioText),
    metadata: JSON.parse(metadataText)
  };
}

export function validatePortfolio(portfolio, metadata) {
  const errors = [];
  if (portfolio.schemaVersion !== 1) errors.push("projects.json schemaVersion must be 1");
  if (metadata.schemaVersion !== 1) errors.push("public-metadata.json schemaVersion must be 1");
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
    for (const field of ["title", "category", "summary", "currentState"]) {
      if (!project[field]) errors.push(`${project.repository}: ${field} is required`);
    }
    if (!MATURITY_VALUES.has(project.maturity)) errors.push(`${project.repository}: invalid maturity ${project.maturity}`);
    if (!Array.isArray(project.technologies) || !Array.isArray(project.capabilities)) errors.push(`${project.repository}: technologies and capabilities must be arrays`);
    const entry = metadata.repositories?.[project.repository];
    if (!entry) errors.push(`${project.repository}: metadata entry is missing`);
    if (project.featured && entry?.archived && project.maturity !== "archived") errors.push(`${project.repository}: featured repository is archived`);
    if (entry?.url !== `https://github.com/${project.repository}`) errors.push(`${project.repository}: public URL is invalid`);
  }
  const featured = portfolio.projects.filter((project) => project.featured);
  if (featured.length !== 6) errors.push(`expected 6 featured projects, found ${featured.length}`);
  if (new Set(featured.map((project) => project.repository)).size !== featured.length) errors.push("featured repositories must be unique");
  for (const milestone of portfolio.milestones ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(milestone.date)) errors.push(`invalid milestone date: ${milestone.date}`);
    if (!new Set(["tag", "commit"]).has(milestone.evidenceType)) errors.push(`invalid milestone evidence type: ${milestone.evidenceType}`);
    if (!milestone.evidenceUrl?.startsWith("https://github.com/he8um/")) errors.push(`invalid milestone evidence URL: ${milestone.evidenceUrl}`);
  }
  return errors;
}

export function displayMaturity(value) {
  return ({
    stable: "Stable",
    "active-development": "Active Development",
    "public-alpha": "Public Alpha",
    "release-candidate": "Release Candidate",
    experimental: "Experimental",
    maintained: "Maintained",
    archived: "Archived"
  })[value] ?? value;
}
