import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = new URL("..", import.meta.url);
const ASSETS_DIR = new URL("assets/", ROOT);
const DATA_DIR = new URL("data/", ROOT);

const TOKENS = {
  bg: "#090A0C",
  panel: "#111419",
  panel2: "#171B22",
  line: "#303741",
  lineSoft: "#222831",
  text: "#E7E4DD",
  muted: "#9CA3AF",
  dim: "#68717D",
  red: "#E33B32",
  cyan: "#7DD3D8",
  amber: "#D6A84F"
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, ROOT), "utf8"));
}

async function writeText(path, content) {
  await mkdir(new URL(".", new URL(path, ROOT)), { recursive: true });
  await writeFile(new URL(path, ROOT), `${content.trim()}\n`, "utf8");
}

function stylesheet() {
  return `
    :root {
      color-scheme: dark;
    }
    text {
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif;
      fill: ${TOKENS.text};
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    .muted { fill: ${TOKENS.muted}; }
    .dim { fill: ${TOKENS.dim}; }
    .red { fill: ${TOKENS.red}; }
    .cyan { fill: ${TOKENS.cyan}; }
    .panel { fill: ${TOKENS.panel}; stroke: ${TOKENS.line}; }
    .panel2 { fill: ${TOKENS.panel2}; stroke: ${TOKENS.line}; }
    .hair { stroke: ${TOKENS.line}; stroke-width: 1; fill: none; }
    .hair-soft { stroke: ${TOKENS.lineSoft}; stroke-width: 1; fill: none; }
    .signal { stroke: ${TOKENS.red}; stroke-width: 2; fill: none; }
    .cyan-line { stroke: ${TOKENS.cyan}; stroke-width: 1.5; fill: none; }
    .label { font-size: 13px; letter-spacing: 2px; font-weight: 700; }
    .small { font-size: 14px; }
    .micro { font-size: 11px; letter-spacing: 1.4px; }
    .scan { animation: scan 7s ease-in-out infinite; }
    .pulse { animation: pulse 4.5s ease-in-out infinite; transform-origin: center; }
    .flow { stroke-dasharray: 4 10; animation: flow 8s linear infinite; }
    @keyframes scan {
      0%, 100% { transform: translateX(-80px); opacity: 0; }
      15%, 75% { opacity: .28; }
      50% { transform: translateX(1020px); opacity: .12; }
    }
    @keyframes pulse {
      0%, 100% { opacity: .45; }
      50% { opacity: 1; }
    }
    @keyframes flow {
      to { stroke-dashoffset: -120; }
    }
    @media (prefers-reduced-motion: reduce) {
      .scan, .pulse, .flow { animation: none; }
    }
  `;
}

function frame(width, height, title, desc, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" viewBox="0 0 ${width} ${height}">
  <title id="title">${esc(title)}</title>
  <desc id="desc">${esc(desc)}</desc>
  <style>${stylesheet()}</style>
  <rect width="${width}" height="${height}" rx="0" fill="${TOKENS.bg}"/>
  <path d="M0 44H${width}M0 ${height - 44}H${width}" class="hair-soft"/>
  <path d="M44 0V${height}M${width - 44} 0V${height}" class="hair-soft"/>
  ${body}
</svg>`;
}

function header(index, label, x = 64, y = 72) {
  return `
    <text x="${x}" y="${y}" class="mono micro red">${esc(index)} / ${esc(label)}</text>
    <path d="M${x} ${y + 14}H${x + 220}" class="signal"/>
  `;
}

function controlPlaneSvg(profile, systemMap) {
  const nodes = [
    ["PRODUCT", 850, 125],
    ["DATA", 1010, 190],
    ["AUTOMATION", 850, 255],
    ["OPERATIONS", 1010, 320],
    ["PROJECTS", 850, 385],
    ["SYSTEMS", 675, 255]
  ];
  const lines = [
    [675, 255, 850, 125],
    [675, 255, 1010, 190],
    [675, 255, 850, 255],
    [675, 255, 1010, 320],
    [675, 255, 850, 385]
  ];

  const topology = `
    <g aria-hidden="true">
      ${lines.map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}H${(x1 + x2) / 2}V${y2}H${x2}" class="hair flow"/>`).join("")}
      ${nodes.map(([label, x, y], index) => `
        <g>
          <circle cx="${x}" cy="${y}" r="${label === "SYSTEMS" ? 42 : 32}" fill="${label === "SYSTEMS" ? TOKENS.panel2 : TOKENS.panel}" stroke="${label === "SYSTEMS" ? TOKENS.red : TOKENS.line}"/>
          <circle cx="${x}" cy="${y}" r="${label === "SYSTEMS" ? 7 : 5}" fill="${index % 2 ? TOKENS.cyan : TOKENS.red}" class="pulse"/>
          <text x="${x}" y="${y + 56}" text-anchor="middle" class="mono micro ${label === "SYSTEMS" ? "red" : "muted"}">${label}</text>
        </g>
      `).join("")}
    </g>
  `;

  return frame(
    1200,
    520,
    "XHESAM Operations Control Plane",
    "Mission-control style profile header for AmirHesam Piri, showing product, operations, data, automation and systems relationships.",
    `
    <rect x="28" y="28" width="1144" height="464" rx="18" fill="none" stroke="${TOKENS.line}"/>
    <rect x="54" y="54" width="398" height="38" rx="19" fill="${TOKENS.panel}" stroke="${TOKENS.line}"/>
    <text x="78" y="79" class="mono micro muted">SYS-ID / XHESAM-OCP</text>
    <text x="300" y="79" class="mono micro red">STATUS / ${esc(profile.operator.status).toUpperCase()}</text>
    <text x="64" y="157" font-size="76" font-weight="800" letter-spacing="6">XHESAM</text>
    <text x="68" y="205" font-size="24" font-weight="700" letter-spacing="3" class="muted">OPERATIONS CONTROL PLANE</text>
    <path d="M70 236H486" class="signal"/>
    <text x="70" y="282" font-size="20" font-weight="700">${esc(profile.operator.name).toUpperCase()}</text>
    <text x="70" y="315" class="small muted">${esc(profile.operator.title)}</text>
    <g transform="translate(70 350)">
      <rect width="142" height="34" rx="17" fill="${TOKENS.red}"/>
      <text x="71" y="22" text-anchor="middle" class="mono micro" fill="#fff">PRODUCT</text>
      <rect x="154" width="134" height="34" rx="17" fill="${TOKENS.panel2}" stroke="${TOKENS.line}"/>
      <text x="221" y="22" text-anchor="middle" class="mono micro">PROJECT</text>
      <rect x="300" width="154" height="34" rx="17" fill="${TOKENS.panel2}" stroke="${TOKENS.line}"/>
      <text x="377" y="22" text-anchor="middle" class="mono micro">OPERATIONS</text>
      <rect y="48" width="232" height="34" rx="17" fill="${TOKENS.panel2}" stroke="${TOKENS.line}"/>
      <text x="116" y="70" text-anchor="middle" class="mono micro">MODE / ${esc(profile.operator.mode).toUpperCase()}</text>
    </g>
    <rect x="575" y="76" width="548" height="386" rx="16" fill="${TOKENS.panel}" stroke="${TOKENS.line}"/>
    <text x="610" y="108" class="mono micro muted">TOPOLOGY / PRODUCT-OPERATIONS-SYSTEMS</text>
    ${topology}
    <rect x="590" y="80" width="34" height="360" fill="${TOKENS.red}" opacity=".16" class="scan"/>
  `
  );
}

function operationsSvg(operationsData) {
  const rows = operationsData.operations.map((op, index) => {
    const y = 132 + index * 86;
    const statusColor = op.status === "ACTIVE" ? TOKENS.red : op.status === "OPERATIONAL" ? TOKENS.cyan : TOKENS.amber;
    return `
      <g>
        <rect x="64" y="${y - 42}" width="1072" height="68" rx="12" class="panel"/>
        <text x="94" y="${y - 14}" class="mono micro red">${esc(op.id)}</text>
        <text x="94" y="${y + 14}" font-size="20" font-weight="800">${esc(op.name)}</text>
        <text x="330" y="${y - 14}" class="mono micro muted">${esc(op.type).toUpperCase()}</text>
        <text x="330" y="${y + 14}" class="small muted">${esc(op.description)}</text>
        <circle cx="1016" cy="${y - 7}" r="7" fill="${statusColor}" class="pulse"/>
        <text x="1036" y="${y - 2}" class="mono micro">${esc(op.status)}</text>
        <text x="1036" y="${y + 19}" class="mono micro dim">${op.url ? "PUBLIC LINK" : "PRIVATE SURFACE"}</text>
      </g>
    `;
  }).join("");

  return frame(
    1200,
    590,
    "Current operations",
    "Structured list of active operations and systems, generated from data/operations.json.",
    `
    ${header("02", "CURRENT OPERATIONS")}
    <text x="64" y="112" class="small muted">Generated from structured source. Private systems are represented at a safe abstraction level.</text>
    ${rows}
  `
  );
}

function systemMapSvg(systemMap) {
  const byId = new Map(systemMap.domains.map((node) => [node.id, node]));
  const linkMarkup = systemMap.links.map(([a, b]) => {
    const from = byId.get(a);
    const to = byId.get(b);
    return `<path d="M${from.x} ${from.y}L${to.x} ${to.y}" class="hair flow"/>`;
  }).join("");
  const projectMarkup = systemMap.projects.map((project, index) => {
    const domain = byId.get(project.domain);
    const secondary = byId.get(project.secondary);
    const x = domain.x + (index % 2 === 0 ? -86 : 86);
    const y = domain.y + (index % 2 === 0 ? 48 : -48);
    return `
      <path d="M${x} ${y}L${domain.x} ${domain.y}M${x} ${y}L${secondary.x} ${secondary.y}" class="cyan-line" opacity=".45"/>
      <rect x="${x - 55}" y="${y - 16}" width="110" height="32" rx="16" fill="${TOKENS.bg}" stroke="${TOKENS.cyan}"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle" class="mono micro cyan">${esc(project.id)}</text>
    `;
  }).join("");
  const nodes = systemMap.domains.map((node) => `
    <g>
      <circle cx="${node.x}" cy="${node.y}" r="54" fill="${TOKENS.panel}" stroke="${node.id === "operations" ? TOKENS.red : TOKENS.line}" stroke-width="2"/>
      <circle cx="${node.x}" cy="${node.y}" r="8" fill="${node.id === "operations" ? TOKENS.red : TOKENS.cyan}" class="pulse"/>
      <text x="${node.x}" y="${node.y + 78}" text-anchor="middle" font-size="18" font-weight="800">${esc(node.label)}</text>
    </g>
  `).join("");

  return frame(
    1200,
    740,
    "System map",
    "Topology showing how product, operations, automation, data, AI and delivery connect across selected work.",
    `
    ${header("03", "SYSTEM MAP")}
    <text x="64" y="112" class="small muted">Connected systems, not isolated tasks. Public and private work is mapped by capability, not repository count.</text>
    <g transform="translate(0 20)">
      ${linkMarkup}
      ${projectMarkup}
      ${nodes}
    </g>
  `
  );
}

function summarizeTelemetry(activity) {
  const repos = activity.repositories ?? [];
  const active = repos.filter((repo) => {
    if (!repo.pushedAt) return false;
    const age = Date.now() - new Date(repo.pushedAt).getTime();
    return age < 1000 * 60 * 60 * 24 * 90;
  });
  const languages = [...new Set(repos.map((repo) => repo.primaryLanguage).filter(Boolean))];
  const merged = repos.reduce((sum, repo) => sum + (repo.recentMergedPullRequests ?? 0), 0);
  const releases = repos.filter((repo) => repo.latestRelease).length;
  return { repos, active, languages, merged, releases };
}

function telemetrySvg(activity) {
  const summary = summarizeTelemetry(activity);
  const metric = (x, y, label, value, hint) => `
    <rect x="${x}" y="${y}" width="246" height="126" rx="14" class="panel"/>
    <text x="${x + 24}" y="${y + 38}" class="mono micro muted">${esc(label).toUpperCase()}</text>
    <text x="${x + 24}" y="${y + 84}" font-size="42" font-weight="850">${esc(value)}</text>
    <text x="${x + 24}" y="${y + 108}" class="mono micro dim">${esc(hint)}</text>
  `;
  const repos = summary.repos
    .slice()
    .sort((a, b) => new Date(b.pushedAt ?? 0) - new Date(a.pushedAt ?? 0))
    .slice(0, 6);
  const repoRows = repos.map((repo, index) => {
    const y = 320 + index * 32;
    const date = repo.pushedAt ? repo.pushedAt.slice(0, 10) : "unknown";
    return `
      <text x="88" y="${y}" class="mono micro">${esc(repo.fullName)}</text>
      <text x="430" y="${y}" class="mono micro muted">${esc(repo.primaryLanguage ?? "n/a")}</text>
      <text x="610" y="${y}" class="mono micro dim">${esc(date)}</text>
      <path d="M84 ${y + 10}H720" class="hair-soft"/>
    `;
  }).join("");

  return frame(
    1200,
    560,
    "GitHub telemetry",
    "First-party GitHub API telemetry for selected public repositories.",
    `
    ${header("06", "TELEMETRY")}
    <text x="64" y="112" class="small muted">Generated from GitHub API for public repositories. No third-party stat widgets. No fabricated metrics.</text>
    ${metric(64, 146, "tracked repositories", summary.repos.length, "public sources")}
    ${metric(334, 146, "recently active", summary.active.length, "pushed within 90d")}
    ${metric(604, 146, "language signals", summary.languages.length, summary.languages.slice(0, 4).join(" / ") || "n/a")}
    ${metric(874, 146, "merged PR signals", summary.merged, "latest closed PR page")}
    <text x="64" y="286" class="mono micro red">RECENT ACTIVITY TRACE</text>
    ${repoRows}
    <text x="826" y="320" class="mono micro muted">LAST REFRESH</text>
    <text x="826" y="356" font-size="25" font-weight="800">${esc((activity.generatedAt ?? "").slice(0, 10))}</text>
    <text x="826" y="392" class="small muted">Source: ${esc(activity.source ?? "local snapshot")}</text>
    <path d="M826 424H1094" class="signal"/>
    <text x="826" y="462" class="mono micro dim">REFRESH CADENCE / DAILY + MANUAL</text>
  `
  );
}

async function githubJson(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "he8um-profile-generator",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}

async function fetchTelemetry(profile) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  const repositories = [];
  for (const fullName of profile.telemetryRepositories) {
    const [owner, repo] = fullName.split("/");
    const meta = await githubJson(`/repos/${owner}/${repo}`, token);
    if (!meta || meta.private || meta.archived) continue;
    const languages = await githubJson(`/repos/${owner}/${repo}/languages`, token);
    const latestRelease = await githubJson(`/repos/${owner}/${repo}/releases/latest`, token);
    const pulls = await githubJson(`/repos/${owner}/${repo}/pulls?state=closed&per_page=30`, token);
    repositories.push({
      fullName,
      name: meta.name,
      description: meta.description,
      url: meta.html_url,
      primaryLanguage: meta.language || Object.keys(languages ?? {})[0] || null,
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      openIssues: meta.open_issues_count,
      pushedAt: meta.pushed_at,
      latestRelease: latestRelease ? {
        tag: latestRelease.tag_name,
        url: latestRelease.html_url,
        publishedAt: latestRelease.published_at
      } : null,
      recentMergedPullRequests: Array.isArray(pulls) ? pulls.filter((pull) => pull.merged_at).length : 0
    });
  }
  return {
    schemaVersion: 1,
    source: "github-api",
    generatedAt: new Date().toISOString(),
    repositories
  };
}

async function generate({ fetchLive = false } = {}) {
  const [profile, operations, systemMap] = await Promise.all([
    readJson("data/profile.json"),
    readJson("data/operations.json"),
    readJson("data/system-map.json")
  ]);
  let activity = await readJson("data/activity-data.json");
  if (fetchLive) {
    activity = await fetchTelemetry(profile);
    await writeText("data/activity-data.json", JSON.stringify(activity, null, 2));
  }

  await mkdir(ASSETS_DIR, { recursive: true });
  await writeText("assets/control-plane.svg", controlPlaneSvg(profile, systemMap));
  await writeText("assets/operations.svg", operationsSvg(operations));
  await writeText("assets/system-map.svg", systemMapSvg(systemMap));
  await writeText("assets/telemetry.svg", telemetrySvg(activity));
  return { profile, operations, systemMap, activity };
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const fetchLive = process.argv.includes("--fetch") || process.env.FETCH_GITHUB === "true";
  generate({ fetchLive }).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

export { generate, summarizeTelemetry };
