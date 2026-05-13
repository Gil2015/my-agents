import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const scriptPath = new URL("./install-to-project.mjs", import.meta.url);

function makeProject() {
  const projectRoot = join(
    tmpdir(),
    `dfp-install-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(projectRoot, { recursive: true });
  return projectRoot;
}

test("installs callable agents into .ai and resources into .ai-src", () => {
  const projectRoot = makeProject();
  const output = execFileSync(
    process.execPath,
    [scriptPath.pathname, "--project-root", projectRoot],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);

  assert.equal(result.status, "DONE");
  assert.ok(
    existsSync(
      join(projectRoot, ".ai", "dev-frontend-pro", "agents", "orchestrator", "AGENTS.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(projectRoot, ".ai", "dev-frontend-pro", "skills", "bootstrap-gate", "SKILL.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(
        projectRoot,
        ".ai-src",
        "dev-frontend-pro",
        "schemas",
        "mission-config.schema.json",
      ),
    ),
  );
  assert.ok(
    existsSync(join(projectRoot, ".ai-src", "dev-frontend-pro", "missions")),
  );
});

test("does not overwrite existing files unless --force is provided", () => {
  const projectRoot = makeProject();
  execFileSync(process.execPath, [scriptPath.pathname, "--project-root", projectRoot], {
    encoding: "utf8",
  });
  const target = join(
    projectRoot,
    ".ai",
    "dev-frontend-pro",
    "agents",
    "orchestrator",
    "AGENTS.md",
  );
  const original = readFileSync(target, "utf8");

  assert.throws(
    () =>
      execFileSync(process.execPath, [scriptPath.pathname, "--project-root", projectRoot], {
        encoding: "utf8",
      }),
    /already exists/,
  );

  execFileSync(
    process.execPath,
    [scriptPath.pathname, "--project-root", projectRoot, "--force"],
    { encoding: "utf8" },
  );
  assert.equal(readFileSync(target, "utf8"), original);
});
