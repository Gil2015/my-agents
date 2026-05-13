#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

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

function listFiles(root, maxDepth = 3, depth = 0) {
  if (!existsSync(root) || depth > maxDepth) return [];
  const entries = readdirSync(root).sort();
  const files = [];
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".git") continue;
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listFiles(path, maxDepth, depth + 1));
    } else if (/\.(tsx?|jsx?|less|css|md)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function extractExports(path) {
  const content = readFileSync(path, "utf8");
  const names = new Set();
  const patterns = [
    /export\s+(?:default\s+)?function\s+([A-Za-z0-9_]+)/g,
    /export\s+const\s+([A-Za-z0-9_]+)/g,
    /export\s+class\s+([A-Za-z0-9_]+)/g,
    /export\s+\{\s*([^}]+)\s*\}/g,
  ];
  for (const pattern of patterns) {
    let match = pattern.exec(content);
    while (match) {
      if (match[1].includes(",")) {
        for (const part of match[1].split(",")) {
          const name = part.trim().split(/\s+as\s+/).pop()?.trim();
          if (name) names.add(name);
        }
      } else {
        names.add(match[1]);
      }
      match = pattern.exec(content);
    }
  }
  return [...names].sort();
}

function writeCatalog(path, title, rows) {
  const lines = [`# ${title}`, "", "| 名称 | 路径 | 摘要 |", "|---|---|---|"];
  if (rows.length === 0) {
    lines.push("| 未发现 | - | 当前扫描范围内没有匹配项 |");
  } else {
    for (const row of rows) {
      lines.push(`| ${row.name} | \`${row.path}\` | ${row.summary} |`);
    }
  }
  writeFileSync(path, `${lines.join("\n")}\n`);
}

try {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = resolve(String(args["project-root"] || process.cwd()));
  const srcRoot = resolve(projectRoot, "src");
  const indexRoot = resolve(projectRoot, ".ai-src", "dev-frontend-pro", "docs", "indexes");
  mkdirSync(indexRoot, { recursive: true });

  const componentFiles = listFiles(resolve(srcRoot, "components"), 3).filter((file) =>
    /index\.(tsx?|jsx?)$/.test(file),
  );
  const hookFiles = listFiles(resolve(srcRoot, "hooks"), 2).filter((file) =>
    /use[A-Z].*\.(tsx?|jsx?)$/.test(basename(file)),
  );
  const utilFiles = listFiles(resolve(srcRoot, "utils"), 2).filter((file) =>
    /\.(tsx?|jsx?)$/.test(file),
  );
  const moduleDirs = existsSync(resolve(srcRoot, "modules"))
    ? readdirSync(resolve(srcRoot, "modules"))
        .sort()
        .filter((entry) => statSync(resolve(srcRoot, "modules", entry)).isDirectory())
    : [];

  const components = componentFiles.map((file) => {
    const exports = extractExports(file);
    return {
      name: basename(resolve(file, "..")),
      path: relative(projectRoot, file),
      summary: exports.length > 0 ? `导出：${exports.join(", ")}` : "组件入口，未识别命名导出",
    };
  });
  const hooks = hookFiles.map((file) => ({
    name: basename(file).replace(/\.(tsx?|jsx?)$/, ""),
    path: relative(projectRoot, file),
    summary: "项目 hook，使用前读取签名和调用约束",
  }));
  const utils = utilFiles.map((file) => {
    const exports = extractExports(file);
    return {
      name: basename(file).replace(/\.(tsx?|jsx?)$/, ""),
      path: relative(projectRoot, file),
      summary: exports.length > 0 ? `导出：${exports.join(", ")}` : "工具文件，使用前读取函数签名",
    };
  });
  const modules = moduleDirs.map((moduleName) => ({
    name: moduleName,
    path: relative(projectRoot, resolve(srcRoot, "modules", moduleName)),
    summary: "历史业务模块摘要。默认只作为模式参考，不读取完整源码。",
  }));

  writeCatalog(resolve(indexRoot, "component-catalog.md"), "Component Catalog", components);
  writeCatalog(resolve(indexRoot, "hooks-catalog.md"), "Hooks Catalog", hooks);
  writeCatalog(resolve(indexRoot, "utils-catalog.md"), "Utils Catalog", utils);
  writeCatalog(resolve(indexRoot, "module-catalog.md"), "Module Catalog", modules);

  process.stdout.write(
    `${JSON.stringify(
      {
        status: "DONE",
        projectRoot,
        indexRoot,
        counts: {
          components: components.length,
          hooks: hooks.length,
          utils: utils.length,
          modules: modules.length,
        },
      },
      null,
      2,
    )}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
