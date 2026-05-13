import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const scriptPath = new URL("./build-project-index.mjs", import.meta.url);

function makeProject() {
  const projectRoot = join(
    tmpdir(),
    `dfp-index-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(join(projectRoot, "src", "components", "DataTable"), { recursive: true });
  mkdirSync(join(projectRoot, "src", "hooks"), { recursive: true });
  mkdirSync(join(projectRoot, "src", "utils"), { recursive: true });
  mkdirSync(join(projectRoot, "src", "modules", "ComplexBusinessModule"), {
    recursive: true,
  });
  writeFileSync(
    join(projectRoot, "src", "components", "DataTable", "index.tsx"),
    "export function DataTable() { return null; }\n",
  );
  writeFileSync(
    join(projectRoot, "src", "hooks", "usePagination.ts"),
    "export function usePagination() { return {}; }\n",
  );
  writeFileSync(
    join(projectRoot, "src", "utils", "formatMoney.ts"),
    "export function formatMoney(value: number) { return String(value); }\n",
  );
  writeFileSync(
    join(projectRoot, "src", "modules", "ComplexBusinessModule", "index.tsx"),
    "export default function ComplexBusinessModule() { return null; }\n",
  );
  return projectRoot;
}

test("writes lightweight project indexes without embedding full module source", () => {
  const projectRoot = makeProject();

  const output = execFileSync(
    process.execPath,
    [scriptPath.pathname, "--project-root", projectRoot],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const indexRoot = join(projectRoot, ".ai-src", "dev-frontend-pro", "docs", "indexes");

  assert.equal(result.status, "DONE");
  assert.ok(existsSync(join(indexRoot, "component-catalog.md")));
  assert.ok(existsSync(join(indexRoot, "hooks-catalog.md")));
  assert.ok(existsSync(join(indexRoot, "utils-catalog.md")));
  assert.ok(existsSync(join(indexRoot, "module-catalog.md")));

  const componentCatalog = readFileSync(join(indexRoot, "component-catalog.md"), "utf8");
  const moduleCatalog = readFileSync(join(indexRoot, "module-catalog.md"), "utf8");

  assert.match(componentCatalog, /DataTable/);
  assert.match(moduleCatalog, /ComplexBusinessModule/);
  assert.doesNotMatch(moduleCatalog, /return null/);
});
