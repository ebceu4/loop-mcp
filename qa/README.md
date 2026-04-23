# Loop MCP QA

This folder is the repo-backed QA and SDD pack for `loop-mcp`.

The goal is to keep four things in one place:

- the MCP tool contract we intend to support
- the runnable scenario pack that validates the contract
- the acceptance bar for adding or changing a tool
- the capability map that explains user-facing routing and gaps

## Workflow

1. Define or update the tool contract in `qa/tool-roadmap.md`.
2. Add or update one markdown scenario under `qa/scenarios/`.
3. Make the MCP and catalog changes.
4. Run the local harness against the scenario prompt.
5. Keep the final output machine-checkable, ideally JSON only.

## Current Harness Boundary

Today the runnable harness is `apps/codex-harness` and the main loop is:

`Codex -> temporary config -> local MCP server -> live Loop API`

This means the current smoke lane is isolated at the Codex/MCP config level, but it is still a live API test and not a mocked offline suite.

## Test Layers

- Contract checks: inventory, tool names, tool descriptions, top-level output keys.
- Live smoke checks: happy-path calls against a real Loop workspace.
- Routing checks: user intent to team/channel/post tool selection.
- Regression checks: stable prompts and stable JSON keys for model-facing consumption.

## Scenario Pack Convention

Each scenario should define:

- `id`
- `title`
- `surface`
- `objective`
- `successCriteria`
- `docsRefs`
- `codeRefs`
- `execution`

For now, `execution.kind` should usually be `codex-harness`.

## Done Criteria For A New Tool

- Add the tool to the shared catalog.
- Register the tool in the MCP server.
- Add at least one scenario that proves the main happy path.
- Add at least one routing or edge-case scenario before calling the tool stable.
- Update `CONTEXT.md` if the tool changes the project's recommended smoke flow.

## Commands

- `pnpm build`
- `pnpm typecheck`
- `pnpm harness:scenario -- --scenario <scenario-id>`
- `pnpm harness:suite`
- `pnpm harness:smoke`
- `pnpm harness:run -- --prompt "<scenario prompt>" --mode isolated-home`
