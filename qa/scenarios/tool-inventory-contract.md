# Tool inventory contract

```yaml qa-scenario
id: tool-inventory-contract
title: Tool inventory contract
surface: agent-chat
objective: Verify the agent can discover the live Loop MCP tool surface instead of guessing from code or memory.
successCriteria:
  - The response contains the current read tools.
  - The response contains the current write tools.
  - The catalog includes the current implemented tool entries.
docsRefs:
  - README.md
  - qa/tool-roadmap.md
codeRefs:
  - packages/shared/src/catalog.ts
  - apps/mcp-server/src/tools/inventory.ts
execution:
  kind: codex-harness
  summary: Ask in natural language which Loop actions are live right now and require a JSON-only contract response.
  prompt: |-
    Мне нужен актуальный список доступных действий этого Loop MCP-сервера.
    Не угадывай по коду и не опирайся на память: сначала проверь живой MCP-инструментарий, который доступен в этой сессии.
    Верни только JSON с ключами: read_tools, write_tools, catalog.
evaluation:
  expectTools:
    - loop_tool_inventory
  expectJsonPaths:
    - read_tools
    - write_tools
    - catalog
  expectNonEmptyPaths:
    - read_tools
    - write_tools
    - catalog
```

Notes:

- This is the contract gate before downstream routing or write scenarios.
- If this scenario changes, update `packages/shared/src/catalog.ts` and `qa/tool-roadmap.md` together.
