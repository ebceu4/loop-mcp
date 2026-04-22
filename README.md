# loop-mcp

TurboRepo workspace for a Loop MCP server and a Codex testing harness.

## Packages

- `apps/mcp-server` - stdio MCP server for Loop
- `apps/codex-harness` - isolated Codex runner for MCP smoke tests
- `packages/loop-client` - Loop API auth and REST client
- `packages/shared` - shared tool metadata and helpers

## Quick start

1. Copy `.env.example` to `.env` or `.env.local`.
2. Fill either:
   - `LOOP_TOKEN`
   - or `LOOP_LOGIN_ID` + `LOOP_PASSWORD`
3. Install dependencies:

```bash
pnpm install
```

4. Build:

```bash
pnpm build
```

5. Run Codex harness smoke test:

```bash
pnpm harness:smoke
```

## Current scope

- Loop auth via `LOOP_TOKEN` or `LOOP_LOGIN_ID` / `LOOP_PASSWORD`
- Read tools implemented first
- Write tools registered as placeholders for now
- Attachments and search deferred
