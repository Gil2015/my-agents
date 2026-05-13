import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const scriptPath = new URL("./init-mission.mjs", import.meta.url);

function makeProject() {
  const projectRoot = join(
    tmpdir(),
    `dfp-init-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(projectRoot, { recursive: true });
  return projectRoot;
}

function runInit(projectRoot, missionId = "20260509-120000") {
  const output = execFileSync(
    process.execPath,
    [scriptPath.pathname, "--project-root", projectRoot, "--mission-id", missionId],
    { encoding: "utf8" },
  );
  return JSON.parse(output);
}

test("creates mission under .ai-src/dev-frontend-pro/missions", () => {
  const projectRoot = makeProject();

  const result = runInit(projectRoot);

  const missionRoot = join(
    projectRoot,
    ".ai-src",
    "dev-frontend-pro",
    "missions",
    "20260509-120000",
  );
  const configPath = join(missionRoot, "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));

  assert.equal(result.status, "DONE_WITH_CONCERNS");
  assert.equal(result.missionId, "20260509-120000");
  assert.equal(result.missionRoot, missionRoot);
  assert.equal(config.projectRoot, projectRoot);
  assert.equal(config.aiSrcRoot, join(projectRoot, ".ai-src", "dev-frontend-pro"));
  assert.equal(config.aiRoot, join(projectRoot, ".ai", "dev-frontend-pro"));
  assert.equal(config.mission.id, "20260509-120000");
  assert.equal(config.mission.root, missionRoot);
  assert.deepEqual(config.reqDocSources, []);
  assert.ok(existsSync(join(missionRoot, "reqDocs")));
  assert.ok(existsSync(join(projectRoot, ".ai-src", "dev-frontend-pro", "docs", "indexes")));
});

test("refuses to overwrite an existing mission", () => {
  const projectRoot = makeProject();
  runInit(projectRoot, "20260509-130000");

  assert.throws(
    () => runInit(projectRoot, "20260509-130000"),
    /Mission already exists/,
  );
});
