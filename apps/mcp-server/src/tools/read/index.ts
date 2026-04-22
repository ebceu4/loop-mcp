import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAccountTools } from "./accountTools.js";
import { registerChannelTools } from "./channelTools.js";
import { registerMembershipTools } from "./membershipTools.js";
import { registerPostTools } from "./postTools.js";
import { registerTeamTools } from "./teamTools.js";

export function registerReadTools(server: McpServer, client: LoopClient) {
  registerAccountTools(server, client);
  registerTeamTools(server, client);
  registerChannelTools(server, client);
  registerMembershipTools(server, client);
  registerPostTools(server, client);
}
