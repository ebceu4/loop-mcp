# loop-mcp context

## Goal

We are building a local MCP server for `https://carely.loop.ru/` using the official TypeScript MCP SDK:

- SDK: `https://github.com/modelcontextprotocol/typescript-sdk`
- repo: `/Users/ebceu4/projects/carely/loop-mcp`

The target is a Loop/Mattermost-compatible MCP server that supports:

- reading Loop data
- writing Loop data
- local iterative testing through an isolated Codex harness

## Current decisions

- Monorepo format: TurboRepo
- Language: TypeScript
- MCP transport: stdio
- Auth must support both:
  - `LOOP_TOKEN`
  - `LOOP_LOGIN_ID` + `LOOP_PASSWORD`
- Attachments: not in v1
- Search: not in v1
- Tool names use `loop_` prefix

## Current workspace structure

- `apps/mcp-server`
  - MCP server implementation
- `apps/codex-harness`
  - isolated Codex runner for local MCP testing
- `packages/loop-client`
  - Loop API auth + REST client
- `packages/shared`
  - shared tool catalog and helpers

## What already works

- workspace builds successfully
- typecheck passes
- isolated Codex harness works
- local MCP server is started by Codex and used successfully
- implemented read tools:
  - `loop_tool_inventory`
  - `loop_get_me`
  - `loop_list_teams`
  - `loop_list_channels`
  - `loop_list_channel_posts`
- write tools are registered as placeholders:
  - `loop_create_post`
  - `loop_reply_to_post`
  - `loop_update_post`
  - `loop_delete_post`

## Important validation already completed

The harness was tested against the real server `https://carely.loop.ru`.

Successful smoke result:

```json
{"tool_inventory_seen":true,"username":"naydenov.yuri","roles":"system_guest","channel_count":15,"first_channel_name":"58f9eai1w78sjnbzjh4qcg3q3h__eowxr7wa13bbmn6uhm7n9bigww"}
```

This proves the full path works:

`Codex -> isolated config -> local MCP server -> Loop API`

## Useful commands

```bash
cd /Users/ebceu4/projects/carely/loop-mcp
pnpm install
pnpm build
pnpm typecheck
```

Run smoke test with login/password:

```bash
LOOP_BASE_URL=https://carely.loop.ru \
LOOP_LOGIN_ID=... \
LOOP_PASSWORD=... \
pnpm harness:smoke
```

Run smoke test with token:

```bash
LOOP_BASE_URL=https://carely.loop.ru \
LOOP_TOKEN=... \
pnpm harness:smoke
```

## Next recommended steps

1. Replace write placeholders with real Loop API calls:
   - create post
   - reply to post
   - update post
   - delete post
2. Add focused smoke tests for write flows against a safe test channel.
3. Add `loop_get_post_thread`.
4. Add channel/user resolution helpers:
   - `loop_resolve_channel_by_name`
   - `loop_resolve_user_by_username`
5. Improve output formatting so tools return compact, model-friendly summaries instead of only raw JSON.

## Constraints

- Do not add attachments in this phase.
- Do not add search in this phase.
- Do not hardcode a specific team or channel in tool logic.
- Do not print credentials or tokens in logs.
- Prefer continuing from the existing repo layout instead of restructuring again.
