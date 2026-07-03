import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";

export function registerTeamTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_list_teams",
    "List the teams available to the current account. Use this before channel lookup when the team is unknown or needs confirmation.",
    {},
    async () => jsonResult(await client.listTeams()),
  );

  server.tool(
    "loop_get_team",
    "Fetch one team by teamId.",
    {
      teamId: z.string(),
    },
    async ({ teamId }) => jsonResult(await client.getTeam(teamId)),
  );
}
