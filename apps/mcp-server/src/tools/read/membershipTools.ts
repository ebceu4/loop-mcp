import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import {
  summarizeChannelMember,
  summarizeTeamMember,
} from "../../lib/summaries.js";

export function registerMembershipTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_list_team_members",
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
    "loop_list_my_team_channel_members",
    {
      teamId: z.string(),
    },
    async ({ teamId }) => {
      const memberships = await client.listMyTeamChannelMembers(teamId);

      return jsonResult({
        team_id: teamId,
        count: memberships.length,
        memberships: memberships.map(summarizeChannelMember),
      });
    },
  );

  server.tool(
    "loop_list_channel_members",
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
    "loop_get_channel_member",
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
