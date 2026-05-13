import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const initPath = new URL("./init-mission.mjs", import.meta.url);
const validatePath = new URL("./validate-mission.mjs", import.meta.url);

function makeProject() {
  const projectRoot = join(
    tmpdir(),
    `dfp-validate-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(projectRoot, { recursive: true });
  return projectRoot;
}

function runJson(script, args) {
  const output = execFileSync(process.execPath, [script.pathname, ...args], {
    encoding: "utf8",
  });
  return JSON.parse(output);
}

test("reports missing .ai agent entry without blocking mission config validation", () => {
  const projectRoot = makeProject();
  runJson(initPath, ["--project-root", projectRoot, "--mission-id", "20260509-140000"]);

  const result = runJson(validatePath, [
    "--project-root",
    projectRoot,
    "--mission-id",
    "20260509-140000",
  ]);

  assert.equal(result.status, "DONE_WITH_CONCERNS");
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.includes("MISSING_AI_AGENT_ENTRY"));
});

test("reports missing minimum module fields as NEEDS_CONTEXT for code stages", () => {
  const projectRoot = makeProject();
  const init = runJson(initPath, [
    "--project-root",
    projectRoot,
    "--mission-id",
    "20260509-150000",
  ]);
  const configPath = join(init.missionRoot, "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.moduleRoot = "";
  config.moduleTemplate.id = "";
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  const result = runJson(validatePath, [
    "--project-root",
    projectRoot,
    "--mission-id",
    "20260509-150000",
    "--stage",
    "ui-dev",
  ]);

  assert.equal(result.status, "NEEDS_CONTEXT");
  assert.ok(result.errors.includes("MISSING_MODULE_ROOT"));
  assert.ok(result.errors.includes("MISSING_MODULE_TEMPLATE"));
  assert.ok(result.errors.includes("MISSING_MODULE_NAME"));
});
