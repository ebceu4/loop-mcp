import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerInventoryTool } from "./tools/inventory.js";
import { registerReadTools } from "./tools/read/index.js";
import { registerWriteTools } from "./tools/write/index.js";

export function registerTools(server: McpServer, client: LoopClient) {
  registerInventoryTool(server);
  registerReadTools(server, client);
  registerWriteTools(server, client);
}
