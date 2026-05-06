import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const scriptPath = new URL("./create-mission.sh", import.meta.url);

function runCreateMission(extraArgs = []) {
  const projectRoot = mkdtempSync(join(tmpdir(), "df-create-mission-"));
  const workspaceRoot = join(projectRoot, ".ai");
  mkdirSync(workspaceRoot, { recursive: true });
  const args = [scriptPath.pathname, workspaceRoot, "20260506-120000", ...extraArgs];
  execFileSync("sh", args, { encoding: "utf8" });
  const config = JSON.parse(
    readFileSync(
      join(workspaceRoot, "missions", "20260506-120000", "config.json"),
      "utf8",
    ),
  );
  return config;
}

test("writes default moduleTemplate id when omitted", () => {
  const config = runCreateMission();

  assert.deepEqual(config.moduleTemplate, {
    id: "m9-module",
    root: "",
  });
});
