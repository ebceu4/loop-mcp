import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";

export function registerTeamTools(server: McpServer, client: LoopClient) {
  server.tool("loop_list_teams", {}, async () => jsonResult(await client.listTeams()));

  server.tool(
    "loop_get_team",
    {
      teamId: z.string(),
    },
    async ({ teamId }) => jsonResult(await client.getTeam(teamId)),
  );
}
