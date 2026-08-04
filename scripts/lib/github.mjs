import { writeFile } from "node:fs/promises";

function cleanString(value, max = 200) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : null;
}

async function githubJson(path, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "he8um-profile-refresh"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`GitHub API ${path} returned ${response.status}`);
  return response.json();
}

function safeRelease(release, repository) {
  if (!release || release.draft) return null;
  const tag = cleanString(release.tag_name, 80);
  const publishedAt = cleanString(release.published_at, 40);
  const url = cleanString(release.html_url, 300);
  if (!tag || !publishedAt || !url?.startsWith(`https://github.com/${repository}/releases/`)) return null;
  return { tag, publishedAt, url };
}

export async function refreshPublicMetadata(portfolio, root = process.cwd(), token = process.env.GITHUB_TOKEN) {
  const repositories = {};
  for (const project of [...portfolio.projects].sort((a, b) => a.displayOrder - b.displayOrder)) {
    const repository = project.repository;
    const [repo, releases] = await Promise.all([
      githubJson(`/repos/${repository}`, token),
      githubJson(`/repos/${repository}/releases?per_page=20`, token)
    ]);
    if (repo.full_name !== repository || repo.private) throw new Error(`${repository}: API returned an unexpected or private repository`);
    const url = cleanString(repo.html_url, 300);
    if (url !== `https://github.com/${repository}`) throw new Error(`${repository}: unexpected repository URL`);
    const latestRelease = Array.isArray(releases) ? safeRelease(releases.find((release) => !release.draft), repository) : null;
    repositories[repository] = {
      url,
      archived: repo.archived === true,
      primaryLanguage: cleanString(repo.language, 64),
      updatedAt: cleanString(repo.updated_at, 40),
      topics: Array.isArray(repo.topics) ? repo.topics.map((topic) => cleanString(topic, 64)).filter(Boolean).sort().slice(0, 30) : [],
      latestRelease
    };
  }
  const output = `${JSON.stringify({ schemaVersion: 1, repositories }, null, 2)}\n`;
  await writeFile(`${root}/portfolio/public-metadata.json`, output);
}
