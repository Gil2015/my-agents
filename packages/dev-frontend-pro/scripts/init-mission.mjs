#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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

function makeMissionId(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

try {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolve(String(args["project-root"] || process.cwd()));
  const missionId = String(args["mission-id"] || makeMissionId());

  if (!/^[A-Za-z0-9._-]+$/.test(missionId)) {
    throw new Error("missionId may only contain letters, numbers, dot, underscore, and hyphen.");
  }

  const aiRoot = resolve(projectRoot, ".ai", "dev-frontend-pro");
  const aiSrcRoot = resolve(projectRoot, ".ai-src", "dev-frontend-pro");
  const missionsRoot = resolve(aiSrcRoot, "missions");
  const missionRoot = resolve(missionsRoot, missionId);

  if (existsSync(missionRoot)) {
    throw new Error("Mission already exists. Choose a new missionId.");
  }

  const missionSubdirs = ["reqDocs", "apiDocs", "testDocs", "bugDocs", "reports"];
  const projectAssetDirs = [
    "docs/indexes",
    "docs/rules",
    "docs/templates",
    "docs/examples",
    "templates/modules",
    "templates/components",
    "templates/pages",
    "templates/hooks",
    "templates/mocks",
    "templates/tests",
    "schemas",
    "tools",
    "fixtures",
    "references",
    "scripts",
  ];

  mkdirSync(missionRoot, { recursive: true });
  for (const dir of missionSubdirs) {
    mkdirSync(resolve(missionRoot, dir), { recursive: true });
  }
  for (const dir of projectAssetDirs) {
    mkdirSync(resolve(aiSrcRoot, dir), { recursive: true });
  }

  const createdAt = new Date().toISOString();
  const config = {
    schemaVersion: "dev-frontend-pro.mission.v1",
    projectRoot,
    aiRoot,
    aiSrcRoot,
    moduleRoot: "src/modules",
    componentRoot: "src/components",
    uiLibPackage: "",
    moduleTemplate: {
      id: "default-module",
      root: "",
    },
    module: {
      name: "",
      displayName: "",
      type: "",
    },
    source: {
      type: "manual",
      notes: "",
    },
    reqDocSources: [],
    apiDocSources: [],
    bugDocSources: [],
    mission: {
      id: missionId,
      root: missionRoot,
      createdAt,
    },
  };

  writeJson(resolve(missionRoot, "config.json"), config);

  process.stdout.write(
    `${JSON.stringify(
      {
        status: "DONE_WITH_CONCERNS",
        message:
          "Mission created. Confirm module.name and project indexes before code stages.",
        missionId,
        missionRoot,
        aiRoot,
        aiSrcRoot,
        projectRoot,
      },
      null,
      2,
    )}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
