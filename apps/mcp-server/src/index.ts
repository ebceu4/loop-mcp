#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLoopClientFromEnv } from "./loop-client/index.js";

import { loadWorkingDirEnvFiles } from "./lib/env.js";
import { registerTools } from "./registerTools.js";

loadWorkingDirEnvFiles();

const client = createLoopClientFromEnv();

const server = new McpServer({
  name: "carely-loop-mcp",
  version: "0.1.0",
});

registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
