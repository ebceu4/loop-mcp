import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import {
  summarizeChannelMember,
  summarizeTeamMember,
} from "../../lib/summaries.js";

async function buildTeamChannelMembershipsResult(client: LoopClient, teamId: string) {
  const memberships = await client.listMyTeamChannelMembers(teamId);

  return {
    team_id: teamId,
    count: memberships.length,
    memberships: memberships.map(summarizeChannelMember),
  };
}

export function registerMembershipTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_list_team_members",
    "List team members for a team. Use this for team roster inspection when you need team membership rather than per-channel membership.",
    {
      teamId: z.string(),
      page: z.number().int().nonnegative().default(0),
      perPage: z.number().int().positive().max(100).default(20),
    },
    async ({ teamId, page, perPage }) => {
      const members = await client.listTeamMembers(teamId, { page, perPage });

      return jsonResult({
        team_id: teamId,
        page,
        per_page: perPage,
        count: members.length,
        members: members.map(summarizeTeamMember),
      });
    },
  );

  server.tool(
    "loop_list_team_channel_memberships",
    "List channel membership rows visible to the current user for a team. Use this as a team-scoped channel membership index, for example to resolve direct-message counterparts from channel_id -> user_id mappings.",
    {
      teamId: z.string(),
    },
    async ({ teamId }) => jsonResult(await buildTeamChannelMembershipsResult(client, teamId)),
  );

  server.tool(
    "loop_list_channel_members",
    "List members in a specific channel.",
    {
      channelId: z.string(),
      page: z.number().int().nonnegative().default(0),
      perPage: z.number().int().positive().max(100).default(20),
    },
    async ({ channelId, page, perPage }) => {
      const members = await client.listChannelMembers(channelId, { page, perPage });

      return jsonResult({
        channel_id: channelId,
        page,
        per_page: perPage,
        count: members.length,
        members: members.map(summarizeChannelMember),
      });
    },
  );

  server.tool(
    "loop_get_channel_membership",
    "Fetch the membership row for one user in one channel.",
    {
      channelId: z.string(),
      userId: z.string(),
    },
    async ({ channelId, userId }) =>
      jsonResult({
        member: summarizeChannelMember(
          await client.getChannelMember(channelId, userId),
        ),
      }),
  );
}
