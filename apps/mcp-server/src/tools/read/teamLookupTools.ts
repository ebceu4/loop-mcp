import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizeTeamMember, summarizeTeamUnread } from "../../lib/summaries.js";

export function registerTeamLookupTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_team_member",
    {
      teamId: z.string(),
      userId: z.string(),
    },
    async ({ teamId, userId }) =>
      jsonResult({
        member: summarizeTeamMember(await client.getTeamMember(teamId, userId)),
      }),
  );

  server.tool(
    "loop_resolve_team_by_name",
    "Resolve a human-readable team name into a canonical team record. Use this when the request names a team instead of giving a teamId.",
    {
      teamName: z.string().min(1),
    },
    async ({ teamName }) =>
      jsonResult({
        team: await client.resolveTeamByName(teamName),
      }),
  );

  server.tool(
    "loop_list_my_team_unreads",
    {},
    async () =>
      jsonResult({
        teams: (await client.listMyTeamUnreads()).map(summarizeTeamUnread),
      }),
  );
}
