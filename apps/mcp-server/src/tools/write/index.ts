import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerChannelWriteTools } from "./channelWriteTools.js";
import { registerPostWriteTools } from "./postWriteTools.js";

export function registerWriteTools(server: McpServer, client: LoopClient) {
  registerChannelWriteTools(server, client);
  registerPostWriteTools(server, client);
}
