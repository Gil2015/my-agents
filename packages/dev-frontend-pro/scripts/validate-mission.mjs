#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = value;
      index += 1;
    }
  }
  return args;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const codeStages = new Set(["ui-dev", "api-integrate", "test", "bug-fix"]);

try {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolve(String(args["project-root"] || process.cwd()));
  const missionId = String(args["mission-id"] || "");
  const stage = String(args.stage || "bootstrap");

  const errors = [];
  const warnings = [];
  const aiRoot = resolve(projectRoot, ".ai", "dev-frontend-pro");
  const aiSrcRoot = resolve(projectRoot, ".ai-src", "dev-frontend-pro");

  if (!existsSync(resolve(aiRoot, "agents", "orchestrator", "AGENTS.md"))) {
    warnings.push("MISSING_AI_AGENT_ENTRY");
  }
  if (!existsSync(aiSrcRoot)) {
    errors.push("MISSING_AI_SRC_ROOT");
  }
  if (!missionId) {
    errors.push("MISSING_MISSION_ID");
  }

  const missionRoot = missionId ? resolve(aiSrcRoot, "missions", missionId) : "";
  const configPath = missionRoot ? resolve(missionRoot, "config.json") : "";
  if (missionRoot && !existsSync(missionRoot)) {
    errors.push("MISSING_MISSION_ROOT");
  }
  if (configPath && !existsSync(configPath)) {
    errors.push("MISSING_CONFIG");
  }

  let config = null;
  if (configPath && existsSync(configPath)) {
    config = readJson(configPath);
    if (config.projectRoot !== projectRoot) errors.push("PROJECT_ROOT_MISMATCH");
    if (config.aiSrcRoot !== aiSrcRoot) errors.push("AI_SRC_ROOT_MISMATCH");
    if (!config.mission?.id) errors.push("MISSING_CONFIG_MISSION_ID");
  }

  if (config && codeStages.has(stage)) {
    if (!config.moduleRoot) errors.push("MISSING_MODULE_ROOT");
    if (!config.moduleTemplate?.id && !config.moduleTemplate?.root) {
      errors.push("MISSING_MODULE_TEMPLATE");
    }
    if (!config.module?.name) errors.push("MISSING_MODULE_NAME");
  }

  const status = errors.length > 0 ? "NEEDS_CONTEXT" : warnings.length > 0 ? "DONE_WITH_CONCERNS" : "DONE";
  process.stdout.write(
    `${JSON.stringify(
      {
        status,
        projectRoot,
        aiRoot,
        aiSrcRoot,
        missionId,
        missionRoot,
        configPath,
        stage,
        errors,
        warnings,
      },
      null,
      2,
    )}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
