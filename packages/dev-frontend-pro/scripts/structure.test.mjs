import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function listFiles(root) {
  const files = [];
  for (const entry of readdirSync(root).sort()) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

test("contains required dev-frontend-pro agent and resource files", () => {
  const requiredFiles = [
    "README.md",
    "agents/orchestrator/AGENTS.md",
    "agents/requirement-analyst/AGENTS.md",
    "agents/project-knowledge-builder/AGENTS.md",
    "agents/template-builder/AGENTS.md",
    "agents/ui-developer/AGENTS.md",
    "agents/mock-builder/AGENTS.md",
    "agents/api-integrator/AGENTS.md",
    "agents/test-planner-runner/AGENTS.md",
    "agents/bug-fixer/AGENTS.md",
    "skills/bootstrap-gate/SKILL.md",
    "skills/requirement-impact-analysis/SKILL.md",
    "skills/component-selection/SKILL.md",
    "skills/mock-scenario-design/SKILL.md",
    "skills/test-risk-classification/SKILL.md",
    "ai-src/schemas/mission-config.schema.json",
    "ai-src/schemas/impact-map.schema.json",
    "ai-src/docs/templates/req-doc-template.md",
    "ai-src/docs/templates/impact-map-template.md",
    "ai-src/docs/rules/common-rules.md",
    "ai-src/docs/rules/handoff-gates.md",
    "ai-src/docs/rules/history-module-reading.md",
    "ai-src/templates/modules/default-module/template.json",
    "ai-src/tools/README.md",
    "ai-src/docs/templates/handoff-report-template.md",
    "ai-src/docs/resource-index.md",
  ];

  for (const file of requiredFiles) {
    assert.ok(existsSync(join(packageRoot, file)), `${file} should exist`);
  }
});

test("does not reintroduce commit agent or legacy .ai mission path", () => {
  const searchableFiles = listFiles(packageRoot).filter((file) =>
    /\.(md|json|mjs|yml|yaml)$/.test(file) && !file.endsWith(".test.mjs"),
  );
  const violations = [];

  for (const file of searchableFiles) {
    const content = readFileSync(file, "utf8");
    if (content.includes("commit-agent")) {
      violations.push(`${relative(packageRoot, file)} contains commit-agent`);
    }
    if (content.includes(".ai/missions")) {
      violations.push(`${relative(packageRoot, file)} contains .ai/missions`);
    }
  }

  assert.deepEqual(violations, []);
});
