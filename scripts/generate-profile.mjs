import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadPortfolio, validatePortfolio, displayMaturity } from "./lib/portfolio.mjs";
import { refreshPublicMetadata } from "./lib/github.mjs";
import { escapeXml, pill, svgDocument } from "./lib/svg.mjs";

const OUTPUTS = {
  hero: "assets/brand/hero.svg",
  snapshotMobile: "assets/generated/portfolio-snapshot-mobile.svg",
  snapshot: "assets/generated/portfolio-snapshot.svg",
  ecosystemMobile: "assets/generated/ecosystem-map-mobile.svg",
  ecosystem: "assets/generated/ecosystem-map.svg",
  maturityMobile: "assets/generated/maturity-matrix-mobile.svg",
  maturity: "assets/generated/maturity-matrix.svg",
  timelineMobile: "assets/generated/release-timeline-mobile.svg",
  timeline: "assets/generated/release-timeline.svg",
  technologyMobile: "assets/generated/technology-project-map-mobile.svg",
  technology: "assets/generated/technology-project-map.svg"
};

function heroSvg(profile) {
  return svgDocument({
    title: `${profile.name} portfolio header`,
    description: `${profile.positioning}. ${profile.tagline}`,
    width: 1200,
    height: 330,
    body: `  <rect x="28" y="28" width="8" height="274" rx="4" fill="#f0443e"/>
  <circle cx="1080" cy="42" r="118" fill="#f0443e" opacity="0.08"/>
  <circle cx="1135" cy="280" r="170" fill="#f0443e" opacity="0.05"/>
  <text x="76" y="92" font-size="18" font-weight="800" letter-spacing="3" class="accent">PORTFOLIO / SYSTEMS / TOOLS</text>
  <text x="76" y="158" font-size="50" font-weight="800">${escapeXml(profile.name)}</text>
  <text x="76" y="202" font-size="25" font-weight="700">${escapeXml(profile.positioning)}</text>
  <text x="76" y="242" font-size="19" class="muted">${escapeXml(profile.tagline)}</text>
  ${pill(76, 267, "PRODUCT SYSTEMS", { width: 178, accent: true })}
  ${pill(266, 267, "DEVELOPER TOOLS", { width: 178 })}
  ${pill(456, 267, "AI AGENT SKILLS", { width: 178 })}`
  });
}

function snapshotSvg(portfolio, metadata) {
  const featured = portfolio.projects.filter((project) => project.featured).length;
  const released = portfolio.projects.filter((project) => project.category !== "AI Agent Skills" && metadata.repositories[project.repository]?.latestRelease).length;
  const skills = portfolio.projects.filter((project) => project.category === "AI Agent Skills" && !metadata.repositories[project.repository]?.archived).length;
  const active = portfolio.projects.filter((project) => !metadata.repositories[project.repository]?.archived).length;
  const milestones = portfolio.milestones.length;
  const metrics = [
    [featured, "FEATURED PROJECTS"],
    [released, "RELEASED PRODUCT LINES"],
    [skills, "MAINTAINED AGENT SKILLS"],
    [active, "ACTIVE PORTFOLIO REPOS"],
    [milestones, "VERIFIED MILESTONES"]
  ];
  const cards = metrics.map(([value, label], index) => {
    const x = 28 + index * 232;
    return `<rect x="${x}" y="98" width="208" height="126" rx="16" class="surface"/>
    <text x="${x + 20}" y="158" font-size="38" font-weight="800" class="accent">${value}</text>
    <text x="${x + 20}" y="192" font-size="13" font-weight="700">${label}</text>`;
  }).join("\n  ");
  return svgDocument({
    title: "Portfolio snapshot",
    description: `${featured} featured projects, ${released} released product lines, ${skills} maintained agent Skills, ${active} active portfolio repositories, and ${milestones} verified milestones.`,
    width: 1200,
    height: 252,
    body: `  <text x="28" y="52" font-size="25" font-weight="800">Portfolio Snapshot</text>
  <text x="28" y="78" font-size="15" class="muted">Governed counts derived from portfolio/projects.json and verified public metadata.</text>
  ${cards}`
  });
}

function snapshotMobileSvg(portfolio, metadata) {
  const metrics = [
    [portfolio.projects.filter((project) => project.featured).length, "Featured projects"],
    [portfolio.projects.filter((project) => project.category !== "AI Agent Skills" && metadata.repositories[project.repository]?.latestRelease).length, "Released product lines"],
    [portfolio.projects.filter((project) => project.category === "AI Agent Skills" && !metadata.repositories[project.repository]?.archived).length, "Maintained agent Skills"],
    [portfolio.projects.filter((project) => !metadata.repositories[project.repository]?.archived).length, "Active portfolio repositories"],
    [portfolio.milestones.length, "Verified milestones"]
  ];
  const cards = metrics.map(([value, label], index) => {
    const y = 105 + index * 92;
    return `<rect x="24" y="${y}" width="552" height="72" rx="14" class="surface"/>
    <text x="48" y="${y + 47}" font-size="32" font-weight="800" class="accent">${value}</text>
    <text x="118" y="${y + 43}" font-size="18" font-weight="700">${escapeXml(label)}</text>`;
  }).join("\n  ");
  return svgDocument({
    title: "Mobile portfolio snapshot",
    description: metrics.map(([value, label]) => `${value} ${label}`).join(", "),
    width: 600,
    height: 595,
    body: `  <text x="24" y="48" font-size="27" font-weight="800">Portfolio Snapshot</text>
  <text x="24" y="76" font-size="16" class="muted">Governed, reproducible public portfolio counts.</text>
  ${cards}`
  });
}

function ecosystemSvg(projects) {
  const groups = [
    {
      title: "OPERATIONAL SYSTEMS",
      subtitle: "Context, safety, repeatability",
      items: projects.filter((project) => project.category === "Operational & Product Systems").map((project) => project.title)
    },
    {
      title: "DEVELOPER TOOLS",
      subtitle: "Practice and terminal workflows",
      items: projects.filter((project) => project.category === "Developer Tools").map((project) => project.title)
    },
    {
      title: "AI AGENT SKILLS",
      subtitle: "Reusable decision capabilities",
      items: projects.filter((project) => project.category === "AI Agent Skills").map((project) => project.title)
    }
  ];
  const columns = groups.map((group, index) => {
    const x = 28 + index * 386;
    const itemLines = group.items.map((item, itemIndex) => {
      const y = 180 + itemIndex * 34;
      return `<circle cx="${x + 26}" cy="${y - 5}" r="5" fill="#f0443e"/>
      <text x="${x + 42}" y="${y}" font-size="15" font-weight="650">${escapeXml(item)}</text>`;
    }).join("\n      ");
    return `<rect x="${x}" y="94" width="358" height="448" rx="18" class="surface"/>
    <rect x="${x}" y="94" width="358" height="7" rx="4" fill="#f0443e"/>
    <text x="${x + 22}" y="135" font-size="16" font-weight="800">${group.title}</text>
    <text x="${x + 22}" y="160" font-size="14" class="muted">${group.subtitle}</text>
    ${itemLines}`;
  }).join("\n  ");
  return svgDocument({
    title: "AmirHesam public project ecosystem",
    description: "Public work grouped into operational and product systems, developer tools, and AI agent Skills.",
    width: 1200,
    height: 572,
    body: `  <text x="28" y="50" font-size="25" font-weight="800">One portfolio, three connected layers</text>
  <text x="28" y="76" font-size="15" class="muted">Operational knowledge becomes products, developer tools, and reusable agent capabilities.</text>
  ${columns}`
  });
}

function ecosystemMobileSvg(projects) {
  const groups = [
    ["OPERATIONAL SYSTEMS", projects.filter((project) => project.category === "Operational & Product Systems")],
    ["DEVELOPER TOOLS", projects.filter((project) => project.category === "Developer Tools")],
    ["AI AGENT SKILLS", projects.filter((project) => project.category === "AI Agent Skills")]
  ];
  let y = 94;
  const panels = groups.map(([title, items]) => {
    const height = 67 + items.length * 31;
    const lines = items.map((project, index) => `<circle cx="49" cy="${y + 58 + index * 31}" r="5" fill="#f0443e"/>
    <text x="66" y="${y + 64 + index * 31}" font-size="17">${escapeXml(project.title)}</text>`).join("\n    ");
    const panel = `<rect x="24" y="${y}" width="552" height="${height}" rx="16" class="surface"/>
    <rect x="24" y="${y}" width="552" height="6" rx="3" fill="#f0443e"/>
    <text x="46" y="${y + 37}" font-size="18" font-weight="800">${title}</text>
    ${lines}`;
    y += height + 18;
    return panel;
  }).join("\n  ");
  return svgDocument({
    title: "Mobile public project ecosystem",
    description: "Operational systems, developer tools, and ten maintained AI agent Skills.",
    width: 600,
    height: y + 6,
    body: `  <text x="24" y="45" font-size="26" font-weight="800">Three connected portfolio layers</text>
  <text x="24" y="72" font-size="15" class="muted">Products, tools, and reusable agent capabilities.</text>
  ${panels}`
  });
}

function maturitySvg(featured, metadata) {
  const rows = featured.map((project, index) => {
    const y = 112 + index * 63;
    const release = metadata.repositories[project.repository]?.latestRelease?.tag ?? "Source milestone";
    return `<rect x="28" y="${y - 34}" width="1144" height="52" rx="12" class="surface"/>
    <text x="48" y="${y}" font-size="17" font-weight="750">${escapeXml(project.title)}</text>
    <text x="318" y="${y}" font-size="14" class="muted">${escapeXml(project.category)}</text>
    <text x="675" y="${y}" font-size="14" font-weight="700">${escapeXml(displayMaturity(project.maturity))}</text>
    <text x="932" y="${y}" font-size="14" font-weight="700" class="accent">${escapeXml(release)}</text>`;
  }).join("\n  ");
  return svgDocument({
    title: "Featured project maturity matrix",
    description: featured.map((project) => `${project.title}: ${displayMaturity(project.maturity)}`).join(". "),
    width: 1200,
    height: 500,
    body: `  <text x="28" y="48" font-size="25" font-weight="800">Project Maturity</text>
  <text x="48" y="75" font-size="12" font-weight="800" class="muted">PROJECT</text>
  <text x="318" y="75" font-size="12" font-weight="800" class="muted">CATEGORY</text>
  <text x="675" y="75" font-size="12" font-weight="800" class="muted">LIFECYCLE</text>
  <text x="932" y="75" font-size="12" font-weight="800" class="muted">LATEST VERIFIED MARKER</text>
  ${rows}`
  });
}

function maturityMobileSvg(featured, metadata) {
  const cards = featured.map((project, index) => {
    const y = 92 + index * 116;
    const release = metadata.repositories[project.repository]?.latestRelease?.tag ?? "Source milestone";
    return `<rect x="24" y="${y}" width="552" height="98" rx="14" class="surface"/>
    <text x="46" y="${y + 31}" font-size="20" font-weight="800">${escapeXml(project.title)}</text>
    <text x="46" y="${y + 60}" font-size="16" font-weight="700" class="accent">${escapeXml(displayMaturity(project.maturity))}</text>
    <text x="46" y="${y + 84}" font-size="15" class="muted">Latest marker: ${escapeXml(release)}</text>`;
  }).join("\n  ");
  return svgDocument({
    title: "Mobile featured project maturity",
    description: featured.map((project) => `${project.title}: ${displayMaturity(project.maturity)}`).join(". "),
    width: 600,
    height: 812,
    body: `  <text x="24" y="48" font-size="27" font-weight="800">Project Maturity</text>
  <text x="24" y="73" font-size="15" class="muted">Lifecycle and latest verified public marker.</text>
  ${cards}`
  });
}

function timelineSvg(milestones) {
  const rows = [...milestones].sort((a, b) => a.date.localeCompare(b.date)).map((milestone, index) => {
    const y = 104 + index * 55;
    return `<line x1="190" y1="${y}" x2="1135" y2="${y}" class="line" stroke-width="1"/>
    <circle cx="190" cy="${y}" r="8" fill="#f0443e"/>
    <text x="34" y="${y + 5}" font-size="14" font-weight="750">${escapeXml(milestone.date)}</text>
    <text x="222" y="${y + 5}" font-size="16" font-weight="750">${escapeXml(milestone.project)}</text>
    <text x="522" y="${y + 5}" font-size="15" class="muted">${escapeXml(milestone.label)}</text>
    <text x="1088" y="${y + 5}" text-anchor="end" font-size="12" font-weight="800" class="accent">${milestone.evidenceType.toUpperCase()}</text>`;
  }).join("\n  ");
  return svgDocument({
    title: "Public release and milestone timeline",
    description: milestones.map((item) => `${item.date}: ${item.project}, ${item.label}`).join(". "),
    width: 1200,
    height: 520,
    body: `  <text x="28" y="48" font-size="25" font-weight="800">Release &amp; Milestone Timeline</text>
  <text x="28" y="73" font-size="14" class="muted">Only public tags and named commits are included; routine commits are excluded.</text>
  ${rows}`
  });
}

function timelineMobileSvg(milestones) {
  const rows = [...milestones].sort((a, b) => a.date.localeCompare(b.date)).map((milestone, index) => {
    const y = 91 + index * 100;
    return `<rect x="24" y="${y}" width="552" height="82" rx="14" class="surface"/>
    <circle cx="49" cy="${y + 27}" r="7" fill="#f0443e"/>
    <text x="68" y="${y + 32}" font-size="16" font-weight="800">${escapeXml(milestone.date)} · ${escapeXml(milestone.project)}</text>
    <text x="48" y="${y + 61}" font-size="16" class="muted">${escapeXml(milestone.label)}</text>`;
  }).join("\n  ");
  return svgDocument({
    title: "Mobile release and milestone timeline",
    description: milestones.map((item) => `${item.date}: ${item.project}, ${item.label}`).join(". "),
    width: 600,
    height: 815,
    body: `  <text x="24" y="47" font-size="27" font-weight="800">Release &amp; Milestone Timeline</text>
  <text x="24" y="73" font-size="15" class="muted">Public tags and named source milestones only.</text>
  ${rows}`
  });
}

function technologySvg(featured) {
  const technologies = ["Go", "Rust", "TypeScript", "React", "Tauri", "MCP", "GitHub Actions", "Python"];
  const shortNames = { "OH MY PM": "OH MY PM", Daryaft: "DARYAFT", AirBridge: "AIRBRIDGE", BranchDojo: "BRANCHDOJO", "Product Maestro": "PRODUCT", "Marketing Maestro": "MARKETING" };
  const columnWidth = 142;
  const header = featured.map((project, index) => `<text x="${330 + index * columnWidth}" y="91" text-anchor="middle" font-size="12" font-weight="800">${escapeXml(shortNames[project.title] ?? project.title.toUpperCase())}</text>`).join("\n  ");
  const rows = technologies.map((technology, rowIndex) => {
    const y = 132 + rowIndex * 49;
    const cells = featured.map((project, columnIndex) => {
      const x = 330 + columnIndex * columnWidth;
      const used = project.technologies.includes(technology);
      return used
        ? `<circle cx="${x}" cy="${y - 5}" r="10" fill="#f0443e"/><path d="M${x - 5} ${y - 5} l4 4 l7 -8" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="${x}" cy="${y - 5}" r="4" fill="#30363d"/>`;
    }).join("\n      ");
    return `<text x="40" y="${y}" font-size="15" font-weight="700">${escapeXml(technology)}</text>
    <line x1="202" y1="${y - 5}" x2="1165" y2="${y - 5}" class="line" stroke-width="1"/>
    ${cells}`;
  }).join("\n  ");
  return svgDocument({
    title: "Technology by featured project map",
    description: "A matrix showing where Go, Rust, TypeScript, React, Tauri, MCP, GitHub Actions, and Python are used across six featured projects.",
    width: 1200,
    height: 555,
    body: `  <text x="28" y="48" font-size="25" font-weight="800">Technology × Project</text>
  <text x="28" y="72" font-size="14" class="muted">A marker means the technology is documented in that repository; it is not a proficiency score.</text>
  ${header}
  ${rows}
  <circle cx="40" cy="526" r="8" fill="#f0443e"/><text x="58" y="531" font-size="13" class="muted">verified use</text>
  <circle cx="172" cy="526" r="4" fill="#30363d"/><text x="185" y="531" font-size="13" class="muted">not represented</text>`
  });
}

function technologyMobileSvg(featured) {
  const cards = featured.map((project, index) => {
    const y = 94 + index * 122;
    const technologies = project.technologies.filter((technology) => ["Go", "Rust", "TypeScript", "React", "Tauri", "MCP", "GitHub Actions", "Python"].includes(technology));
    const midpoint = Math.ceil(technologies.length / 2);
    const first = technologies.slice(0, midpoint).join(" · ");
    const second = technologies.slice(midpoint).join(" · ");
    return `<rect x="24" y="${y}" width="552" height="104" rx="14" class="surface"/>
    <text x="46" y="${y + 34}" font-size="20" font-weight="800">${escapeXml(project.title)}</text>
    <text x="46" y="${y + 64}" font-size="16" class="accent">${escapeXml(first)}</text>
    ${second ? `<text x="46" y="${y + 88}" font-size="16" class="muted">${escapeXml(second)}</text>` : ""}`;
  }).join("\n  ");
  return svgDocument({
    title: "Mobile technology by project map",
    description: featured.map((project) => `${project.title}: ${project.technologies.join(", ")}`).join(". "),
    width: 600,
    height: 860,
    body: `  <text x="24" y="47" font-size="27" font-weight="800">Technology × Project</text>
  <text x="24" y="73" font-size="15" class="muted">Documented use—not a proficiency score.</text>
  ${cards}`
  });
}

export async function generateAll(root = process.cwd()) {
  const { portfolio, metadata } = await loadPortfolio(root);
  const errors = validatePortfolio(portfolio, metadata);
  if (errors.length) throw new Error(errors.join("\n"));
  const featured = portfolio.projects.filter((project) => project.featured).sort((a, b) => a.displayOrder - b.displayOrder);
  const outputs = {
    [OUTPUTS.hero]: heroSvg(portfolio.profile),
    [OUTPUTS.snapshotMobile]: snapshotMobileSvg(portfolio, metadata),
    [OUTPUTS.snapshot]: snapshotSvg(portfolio, metadata),
    [OUTPUTS.ecosystemMobile]: ecosystemMobileSvg(portfolio.projects),
    [OUTPUTS.ecosystem]: ecosystemSvg(portfolio.projects),
    [OUTPUTS.maturityMobile]: maturityMobileSvg(featured, metadata),
    [OUTPUTS.maturity]: maturitySvg(featured, metadata),
    [OUTPUTS.timelineMobile]: timelineMobileSvg(portfolio.milestones),
    [OUTPUTS.timeline]: timelineSvg(portfolio.milestones),
    [OUTPUTS.technologyMobile]: technologyMobileSvg(featured),
    [OUTPUTS.technology]: technologySvg(featured)
  };
  await Promise.all([mkdir(`${root}/assets/brand`, { recursive: true }), mkdir(`${root}/assets/generated`, { recursive: true })]);
  for (const [relativePath, content] of Object.entries(outputs)) await writeFile(`${root}/${relativePath}`, content);
  return outputs;
}

async function main() {
  const root = process.cwd();
  const { portfolio } = await loadPortfolio(root);
  if (process.argv.includes("--refresh")) await refreshPublicMetadata(portfolio, root);
  const outputs = await generateAll(root);
  console.log(`Generated ${Object.keys(outputs).length} profile SVGs.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
