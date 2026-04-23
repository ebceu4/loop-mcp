import type { LoopChannel, LoopClient, LoopTeam, LoopTeamUnread } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  hasMentions,
  mentionScore,
  summarizeMentionState,
  summarizeTeamMentionUnread,
} from "../../lib/mentions.js";
import { jsonResult } from "../../lib/results.js";
import { resolveTeamId } from "../../lib/team.js";

function channelMap(channels: LoopChannel[]) {
  return new Map(channels.map((channel) => [channel.id, channel]));
}

function unreadMap(unreads: LoopTeamUnread[]) {
  return new Map(unreads.map((unread) => [unread.team_id, unread]));
}

async function getCurrentUserId(client: LoopClient) {
  const me = await client.getMe();
  return me.id;
}

async function buildTeamMentionSummary(
  client: LoopClient,
  team: LoopTeam,
  teamUnread?: LoopTeamUnread,
  includeZero = false,
) {
  const [memberships, channels] = await Promise.all([
    client.listMyTeamChannelMembers(team.id),
    client.listChannels(team.id),
  ]);

  const channelsById = channelMap(channels);
  const mentionStates = memberships
    .filter((member) => includeZero || hasMentions(member))
    .sort((left, right) => mentionScore(right) - mentionScore(left))
    .map((member) => summarizeMentionState(member, channelsById.get(member.channel_id)));

  return {
    team: {
      id: team.id,
      name: team.name,
      display_name: team.display_name,
    },
    team_unread: summarizeTeamMentionUnread(teamUnread),
    mentioned_channel_count: mentionStates.length,
    channels: mentionStates,
  };
}

export function registerMentionTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_my_channel_mention_state",
    {
      channelId: z.string(),
    },
    async ({ channelId }) => {
      const [userId, channel, member] = await Promise.all([
        getCurrentUserId(client),
        client.getChannel(channelId),
        getCurrentUserId(client).then((id) => client.getChannelMember(channelId, id)),
      ]);

      return jsonResult({
        current_user_id: userId,
        mention_state: summarizeMentionState(member, channel),
      });
    },
  );

  server.tool(
    "loop_list_team_mentions",
    {
      teamId: z.string().optional(),
      includeZero: z.boolean().default(false),
    },
    async ({ teamId, includeZero }) => {
      const effectiveTeamId = await resolveTeamId(client, teamId);
      const [team, unreads] = await Promise.all([
        client.getTeam(effectiveTeamId),
        client.listMyTeamUnreads(),
      ]);
      const unreadByTeamId = unreadMap(unreads);

      return jsonResult(
        await buildTeamMentionSummary(
          client,
          team,
          unreadByTeamId.get(effectiveTeamId),
          includeZero,
        ),
      );
    },
  );

  server.tool(
    "loop_list_all_mentions",
    {
      includeZero: z.boolean().default(false),
    },
    async ({ includeZero }) => {
      const [teams, unreads] = await Promise.all([
        client.listTeams(),
        client.listMyTeamUnreads(),
      ]);
      const unreadByTeamId = unreadMap(unreads);

      const summaries = await Promise.all(
        teams.map((team) =>
          buildTeamMentionSummary(
            client,
            team,
            unreadByTeamId.get(team.id),
            includeZero,
          ),
        ),
      );

      const filtered = summaries.filter(
        (summary) =>
          includeZero ||
          summary.mentioned_channel_count > 0 ||
          summary.team_unread.mention_count > 0 ||
          summary.team_unread.mention_count_root > 0 ||
          summary.team_unread.thread_mention_count > 0 ||
          summary.team_unread.thread_urgent_mention_count > 0,
      );

      return jsonResult({
        team_count: filtered.length,
        teams: filtered,
      });
    },
  );
}
