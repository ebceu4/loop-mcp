import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  LOOP_READ_TOOLS,
  LOOP_TOOL_CATALOG,
  LOOP_WRITE_TOOLS,
} from "@carely/loop-shared";

import { jsonResult } from "../lib/results.js";

export function registerInventoryTool(server: McpServer) {
  server.tool("loop_tool_inventory", {}, async () =>
    jsonResult({
      read_tools: LOOP_READ_TOOLS,
      write_tools: LOOP_WRITE_TOOLS,
      catalog: LOOP_TOOL_CATALOG,
    }),
  );
}
