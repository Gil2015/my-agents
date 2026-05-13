#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

function copyDir(source, target, options, copied) {
  if (!existsSync(source)) return;
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source).sort()) {
    const sourcePath = join(source, entry);
    const targetPath = join(target, entry);
    const stat = statSync(sourcePath);
    if (stat.isDirectory()) {
      copyDir(sourcePath, targetPath, options, copied);
      continue;
    }
    if (existsSync(targetPath) && !options.force) {
      throw new Error(`${targetPath} already exists. Re-run with --force to overwrite.`);
    }
    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);
    copied.push(targetPath);
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolve(String(args["project-root"] || process.cwd()));
  const force = Boolean(args.force);
  const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  const aiTargetRoot = resolve(projectRoot, ".ai", "dev-frontend-pro");
  const aiSrcTargetRoot = resolve(projectRoot, ".ai-src", "dev-frontend-pro");
  const copied = [];

  copyDir(resolve(packageRoot, "agents"), resolve(aiTargetRoot, "agents"), { force }, copied);
  copyDir(resolve(packageRoot, "skills"), resolve(aiTargetRoot, "skills"), { force }, copied);
  copyDir(resolve(packageRoot, "hooks"), resolve(aiTargetRoot, "hooks"), { force }, copied);
  copyDir(resolve(packageRoot, "ai-src"), aiSrcTargetRoot, { force }, copied);
  mkdirSync(resolve(aiSrcTargetRoot, "missions"), { recursive: true });

  process.stdout.write(
    `${JSON.stringify(
      {
        status: "DONE",
        projectRoot,
        aiRoot: aiTargetRoot,
        aiSrcRoot: aiSrcTargetRoot,
        copied: copied.map((path) => relative(projectRoot, path)),
      },
      null,
      2,
    )}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
