import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadPortfolio, MATURITY_VALUES, validatePortfolio } from "../scripts/lib/portfolio.mjs";
import { isAllowedLiveImage, remoteImageUrls } from "../scripts/validate-profile.mjs";

const readme = await readFile("README.md", "utf8");
const portfolio = await loadPortfolio();
const featured = portfolio.projects.filter((project) => project.featured);

test("portfolio source is valid", () => {
  assert.deepEqual(validatePortfolio(portfolio), []);
});

test("featured repository identifiers are unique", () => {
  assert.equal(featured.length, 6);
  assert.equal(new Set(featured.map((project) => project.repository)).size, featured.length);
});

test("all maturity values belong to the governed enum", () => {
  for (const project of portfolio.projects) assert.ok(MATURITY_VALUES.has(project.maturity));
});

test("every featured project has a native Markdown box", () => {
  for (const project of featured) assert.ok(readme.includes(`| [${project.title}](https://github.com/${project.repository}) |`), project.repository);
});

test("every featured project has a live last-commit signal", () => {
  for (const project of featured) assert.ok(readme.includes(`img.shields.io/github/last-commit/${project.repository}`), project.repository);
});

test("every featured project has a live primary-language signal", () => {
  for (const project of featured) assert.ok(readme.includes(`img.shields.io/github/languages/top/${project.repository}`), project.repository);
});

test("released product lines have live release signals", () => {
  for (const repository of ["he8um/oh-my-pm", "he8um/daryaft", "he8um/AirBridge", "he8um/branchdojo"]) {
    assert.ok(readme.includes(`img.shields.io/github/v/release/${repository}`), repository);
  }
});

test("every featured project has a live GitHub Actions signal", () => {
  for (const project of featured) assert.match(readme, new RegExp(`https://github\\.com/${project.repository}/actions/workflows/[^)\"]+/badge\\.svg\\?branch=main`));
});

test("all governed repositories remain discoverable", () => {
  for (const project of portfolio.projects) assert.ok(readme.includes(`https://github.com/${project.repository}`), project.repository);
});

test("all remote image providers are explicitly approved", () => {
  const images = remoteImageUrls(readme);
  assert.ok(images.length >= 20);
  for (const url of images) assert.equal(isAllowedLiveImage(url), true, url);
});

test("committed static data visuals are no longer referenced", () => {
  assert.doesNotMatch(readme, /assets\/generated\//);
  assert.doesNotMatch(readme, /Portfolio Snapshot|Project Ecosystem Map|Release Timeline|Technology × Project Map/);
});

test("README contains no hard-coded release version", () => {
  assert.doesNotMatch(readme, /\bv\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?\b/);
});

test("removed vanity elements do not return", () => {
  assert.doesNotMatch(readme, /komarev|top-langs|streak-stats|readme-typing-svg|capsule-render|GitHub Developer Program/i);
});

test("README and source contain no unresolved placeholders", async () => {
  const source = await readFile("portfolio/projects.json", "utf8");
  assert.doesNotMatch(`${readme}\n${source}`, /\b(?:REPLACE_ME|REPLACE_WITH_[A-Z0-9_]+|TODO|TBD)\b/);
});
