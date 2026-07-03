import type {
  LoopChannel,
  LoopClient,
  LoopPost,
  LoopTeam,
  LoopTeamUnread,
} from "../../loop-client/index.js";
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

function summarizeReactionedPost(post: LoopPost) {
  return {
    id: post.id,
    channel_id: post.channel_id,
    user_id: post.user_id,
    root_id: post.root_id,
    create_at: post.create_at,
    update_at: post.update_at,
    edit_at: post.edit_at,
    delete_at: post.delete_at,
    message: post.message,
    type: post.type,
    has_reactions: post.has_reactions,
    reply_count: post.reply_count,
    last_reply_at: post.last_reply_at,
    reactions: post.metadata?.reactions?.map((reaction) => ({
      user_id: reaction.user_id,
      post_id: reaction.post_id,
      emoji_name: reaction.emoji_name,
      create_at: reaction.create_at,
      update_at: reaction.update_at,
      delete_at: reaction.delete_at,
      channel_id: reaction.channel_id,
    })) ?? [],
  };
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
    "Fetch the current user's mention counters and unread state for one channel.",
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

  const registerTeamUnreadMentionTool = (name: string, description: string) => {
    server.tool(
      name,
      description,
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
  };

  registerTeamUnreadMentionTool(
    "loop_list_team_unread_mentions",
    "List unread mention counters and channel mention state for one team. Set includeZero=true to include zero-mention rows as well.",
  );

  registerTeamUnreadMentionTool(
    "loop_list_team_mentions",
    "Deprecated alias for loop_list_team_unread_mentions. Lists unread mention counters and channel mention state for one team.",
  );

  const registerAllUnreadMentionsTool = (name: string, description: string) => {
    server.tool(
      name,
      description,
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
  };

  registerAllUnreadMentionsTool(
    "loop_list_all_unread_mentions",
    "List unread mention summaries across all teams visible to the current user. Set includeZero=true to include teams and channels with zero mention counters.",
  );

  server.tool(
    "loop_list_all_mentions",
    "List the current user's recent Loop mention/reaction feed using /users/{id}/posts/reactioned. Use lastReactionUpdateAt from the previous response to page older results.",
    {
      perPage: z.number().int().positive().max(100).default(30),
      lastReactionUpdateAt: z.number().int().nonnegative().optional(),
    },
    async ({ perPage, lastReactionUpdateAt }) => {
      const me = await client.getMe();
      const payload = await client.listReactionedPosts(me.id, {
        perPage,
        lastReactionUpdateAt,
      });

      return jsonResult({
        current_user_id: me.id,
        per_page: perPage,
        order: payload.order,
        post_count: payload.order.length,
        has_next: payload.has_next,
        next_post_id: payload.next_post_id,
        prev_post_id: payload.prev_post_id,
        first_inaccessible_post_time: payload.first_inaccessible_post_time,
        last_reaction_updateat: payload.last_reaction_updateat,
        posts: payload.order.map((postId) =>
          summarizeReactionedPost(payload.posts[postId]),
        ),
      });
    },
  );
}
