import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAccountBatchTools } from "./accountBatchTools.js";
import { registerAccountTools } from "./accountTools.js";
import { registerChannelTools } from "./channelTools.js";
import { registerMentionTools } from "./mentionTools.js";
import { registerMembershipTools } from "./membershipTools.js";
import { registerPostTools } from "./postTools.js";
import { registerTeamLookupTools } from "./teamLookupTools.js";
import { registerTeamTools } from "./teamTools.js";

export function registerReadTools(server: McpServer, client: LoopClient) {
  registerAccountTools(server, client);
  registerAccountBatchTools(server, client);
  registerTeamTools(server, client);
  registerTeamLookupTools(server, client);
  registerChannelTools(server, client);
  registerMentionTools(server, client);
  registerMembershipTools(server, client);
  registerPostTools(server, client);
}
