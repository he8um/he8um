import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { summarizeTelemetry } from "../scripts/generate-profile.mjs";

const readme = await readFile("README.md", "utf8");
const profile = JSON.parse(await readFile("data/profile.json", "utf8"));
const operations = JSON.parse(await readFile("data/operations.json", "utf8"));
const activity = JSON.parse(await readFile("data/activity-data.json", "utf8"));

test("the profile positions AmirHesam as product operations systems, not a language list", () => {
  assert.match(readme, /Product, Projects, Operations, Data, Automation and Systems/i);
  assert.doesNotMatch(readme, /wall of programming-language logos|top languages|streak/i);
});

test("all visual surfaces are referenced from README", () => {
  for (const asset of ["control-plane", "operations", "system-map", "telemetry"]) {
    assert.match(readme, new RegExp(`\\.\\/assets\\/${asset}\\.svg`));
  }
});

test("operations are structured and use safe visibility for private work", () => {
  assert.ok(operations.operations.length >= 4);
  const privateOperations = operations.operations.filter((operation) => operation.url === null);
  assert.ok(privateOperations.length >= 2);
  for (const operation of privateOperations) {
    assert.doesNotMatch(operation.description, /https:\/\/(?:airtable\.com|app\.clickup\.com)|\/workspace|secret|token/i);
  }
});

test("capability matrix stays capability-oriented", () => {
  assert.equal(profile.capabilityMatrix.length, 7);
  const domains = profile.capabilityMatrix.map((item) => item.domain);
  assert.deepEqual(domains, ["Product", "Project", "Operations", "Automation", "Data", "Architecture", "AI"]);
});

test("telemetry summary uses first-party repository data", () => {
  const summary = summarizeTelemetry(activity);
  assert.ok(summary.repos.length >= 4);
  assert.ok(summary.languages.length >= 2);
  assert.equal(typeof summary.merged, "number");
});

test("README avoids generic profile tropes", () => {
  assert.doesNotMatch(readme, /whoami|neofetch|TARGET ACQUIRED|ninja|guru|rockstar|10x/i);
  assert.doesNotMatch(readme, /github-readme-stats|activity-graph|komarev|readme-typing-svg|capsule-render/i);
});
