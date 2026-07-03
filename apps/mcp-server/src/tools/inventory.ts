import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  LOOP_READ_TOOLS,
  LOOP_TOOL_CATALOG,
  LOOP_WRITE_TOOLS,
} from "../loop-shared/index.js";

import { jsonResult } from "../lib/results.js";

export function registerInventoryTool(server: McpServer) {
  server.tool(
    "loop_tool_inventory",
    "Return the live Loop MCP tool surface and catalog metadata. Use this first when the request depends on which read or write tools are currently available.",
    {},
    async () =>
    jsonResult({
      read_tools: LOOP_READ_TOOLS,
      write_tools: LOOP_WRITE_TOOLS,
      catalog: LOOP_TOOL_CATALOG,
    }),
  );
}
