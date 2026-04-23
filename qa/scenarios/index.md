# Loop MCP Scenario Index

Single source of truth for markdown-driven MCP smoke and regression scenarios.

## Current scenarios

- `tool-inventory-contract`
- `named-channel-routing`

## Harness operator prompt

```text
# Loop MCP QA Operator

QA mission:

Use the scenario pack as the canonical smoke and regression plan.
Validate the real MCP path through the local Codex harness where possible.
Prefer JSON-only outputs so checks stay machine-readable.

Rules:

- Do not guess the tool surface from code or memory when the scenario asks for live MCP discovery.
- Prefer exact tool routing for channel lookup and posting flows.
- Call out blocked scenarios when the real Loop account lacks permissions for a write action.
```
