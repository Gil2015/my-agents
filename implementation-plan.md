# dev-frontend-pro Implementation Plan

> Tracking document for the current implementation pass. This pass builds a usable v0 scaffold and deterministic tools, not the final deep content of every agent.

## Goal

Create `packages/dev-frontend-pro` with:

- `.ai` callable agent/skill/hook source tree.
- `.ai-src` resource, mission, schema, template, fixture, script, and tool source tree.
- Bootstrap, mission initialization, mission validation, and project index scripts.
- Tests proving the path conventions and config validation.
- Agent docs that encode the current architecture decisions.

## Scope

In scope:

- New package `@gai/dev-frontend-pro`.
- Core agent `AGENTS.md` files.
- Lean `SKILL.md` files for reusable methods.
- JSON schemas and Markdown templates.
- Node test files for scripts.

Out of scope for this pass:

- Fully implementing every future code-generation behavior.
- Installing into a target frontend project.
- Git commit or push.

## Task Breakdown

1. Add package skeleton and package test script.
2. Write failing tests for mission tools and project index tool.
3. Implement tools to satisfy tests.
4. Add agent and skill documentation.
5. Add schemas, templates, rules, and fixture examples.
6. Run package tests and inspect structure.

## Verification

- `npm test --workspace @gai/dev-frontend-pro`
- `find packages/dev-frontend-pro -maxdepth 4 -type f | sort`
- `rg -n "commit-agent|git commit|\\.ai/missions" packages/dev-frontend-pro`
