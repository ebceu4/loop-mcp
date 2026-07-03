# `@carely/loop-mcp`

MCP server for Carely Loop.

## Default usage

The published package starts on stdio by default:

```bash
npx @carely/loop-mcp
```

Add it to Codex:

```bash
codex mcp add loop-mcp --env LOOP_BASE_URL=https://your-loop-host --env LOOP_TOKEN=... -- npx -y @carely/loop-mcp
```

Or use login credentials instead of a token:

```bash
codex mcp add loop-mcp \
  --env LOOP_BASE_URL=https://your-loop-host \
  --env LOOP_LOGIN_ID=... \
  --env LOOP_PASSWORD=... \
  -- npx -y @carely/loop-mcp
```

## Environment

Required:

- `LOOP_BASE_URL`
- `LOOP_TOKEN`

Or:

- `LOOP_BASE_URL`
- `LOOP_LOGIN_ID`
- `LOOP_PASSWORD`

For local development, the package also reads `.env.local` and `.env` from the current working directory if they exist.
