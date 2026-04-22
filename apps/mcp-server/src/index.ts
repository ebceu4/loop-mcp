import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLoopClientFromEnv } from "@carely/loop-client";

import { registerTools } from "./registerTools.js";

const client = createLoopClientFromEnv();

const server = new McpServer({
  name: "carely-loop-mcp",
  version: "0.1.0",
});

registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
