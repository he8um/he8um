import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { generateAll } from "../scripts/generate-profile.mjs";
import { loadPortfolio, MATURITY_VALUES, validatePortfolio } from "../scripts/lib/portfolio.mjs";
import { escapeXml } from "../scripts/lib/svg.mjs";
import { refreshPublicMetadata } from "../scripts/lib/github.mjs";

test("portfolio schema and governed metadata are valid", async () => {
  const { portfolio, metadata } = await loadPortfolio();
  assert.deepEqual(validatePortfolio(portfolio, metadata), []);
});

test("featured repository identifiers and URLs are unique", async () => {
  const { portfolio, metadata } = await loadPortfolio();
  const featured = portfolio.projects.filter((project) => project.featured);
  assert.equal(featured.length, 6);
  assert.equal(new Set(featured.map((project) => project.repository)).size, featured.length);
  for (const project of featured) assert.equal(metadata.repositories[project.repository].url, `https://github.com/${project.repository}`);
});

test("featured repositories are not archived", async () => {
  const { portfolio, metadata } = await loadPortfolio();
  for (const project of portfolio.projects.filter((item) => item.featured)) assert.equal(metadata.repositories[project.repository].archived, false);
});

test("all maturity values belong to the allowed enum", async () => {
  const { portfolio } = await loadPortfolio();
  for (const project of portfolio.projects) assert.ok(MATURITY_VALUES.has(project.maturity));
});

test("SVG escaping blocks markup injection", () => {
  assert.equal(escapeXml(`<script>alert("x") & 'y'</script>`), "&lt;script&gt;alert(&quot;x&quot;) &amp; &apos;y&apos;&lt;/script&gt;");
});

test("generated SVG output is deterministic", async () => {
  const first = await generateAll();
  const second = await generateAll();
  assert.deepEqual(second, first);
});

test("every generated SVG is accessible and self-contained", async () => {
  const outputs = await generateAll();
  for (const [path, svg] of Object.entries(outputs)) {
    assert.match(svg, /<title(?:\s|>)/, path);
    assert.match(svg, /<desc(?:\s|>)/, path);
    assert.doesNotMatch(svg, /<(?:script|foreignObject)\b/i, path);
    assert.doesNotMatch(svg.replace("http://www.w3.org/2000/svg", ""), /https?:\/\//i, path);
  }
});

test("README references all generated local assets", async () => {
  const readme = await readFile("README.md", "utf8");
  for (const path of Object.keys(await generateAll())) assert.ok(readme.includes(`./${path}`), path);
});

test("README contains no removed vanity elements", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.doesNotMatch(readme, /komarev|top-langs|streak-stats|readme-typing-svg|capsule-render|GitHub Developer Program/i);
});

test("README and source contain no unresolved placeholders", async () => {
  const [readme, source] = await Promise.all([readFile("README.md", "utf8"), readFile("portfolio/projects.json", "utf8")]);
  assert.doesNotMatch(`${readme}\n${source}`, /\b(?:REPLACE_ME|REPLACE_WITH_[A-Z0-9_]+|TODO|TBD)\b/);
});

test("source milestones do not masquerade as public releases", async () => {
  const { portfolio, metadata } = await loadPortfolio();
  for (const repository of ["he8um/product-maestro", "he8um/marketing-maestro", "he8um/software-architecture-maestro"]) {
    assert.equal(metadata.repositories[repository].latestRelease, null);
    assert.match(portfolio.projects.find((project) => project.repository === repository).currentState, /source milestone/i);
  }
});

test("metric definitions cover every displayed snapshot metric", async () => {
  const { portfolio } = await loadPortfolio();
  assert.deepEqual(Object.keys(portfolio.metricDefinitions), [
    "featuredProjects",
    "releasedProductLines",
    "maintainedAgentSkills",
    "maintainedPortfolioProjects",
    "engineeringLanguages",
    "timelineMilestones"
  ]);
});

test("public metadata refresh is normalized and idempotent", async () => {
  const directory = await mkdtemp(join(tmpdir(), "profile-refresh-"));
  await mkdir(join(directory, "portfolio"));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/releases?per_page=20")) {
      return new Response(JSON.stringify([{ draft: false, tag_name: "v1.0.0", published_at: "2026-01-02T00:00:00Z", html_url: "https://github.com/he8um/example/releases/tag/v1.0.0" }]), { status: 200 });
    }
    return new Response(JSON.stringify({ full_name: "he8um/example", private: false, html_url: "https://github.com/he8um/example", archived: false, language: "Rust", updated_at: "2026-01-03T00:00:00Z", topics: ["zeta", "alpha"] }), { status: 200 });
  };
  try {
    const fixture = { projects: [{ repository: "he8um/example", displayOrder: 1 }] };
    await refreshPublicMetadata(fixture, directory, "test-token");
    const first = await readFile(join(directory, "portfolio/public-metadata.json"), "utf8").catch(async () => {
      throw new Error("refresh did not create the expected metadata file");
    });
    await refreshPublicMetadata(fixture, directory, "test-token");
    const second = await readFile(join(directory, "portfolio/public-metadata.json"), "utf8");
    assert.equal(second, first);
    assert.deepEqual(JSON.parse(second).repositories["he8um/example"].topics, ["alpha", "zeta"]);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});
