import type {
  LoopChannel,
  LoopChannelMember,
  LoopClient,
  LoopUser,
} from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizeChannel, summarizeChannelStats } from "../../lib/summaries.js";
import { resolveTeamId } from "../../lib/team.js";

type DirectChatPartner = {
  user_id?: string;
  username?: string;
  display_name?: string;
  email?: string;
};

function buildUserDisplayName(user?: LoopUser) {
  const fullName = [user?.first_name, user?.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim();

  return user?.nickname?.trim() || fullName || user?.username;
}

function buildDirectChatPartner(userId: string | undefined, user?: LoopUser): DirectChatPartner {
  return {
    user_id: userId,
    username: user?.username,
    display_name: buildUserDisplayName(user),
    email: user?.email,
  };
}

function findOpponentIdFromMemberships(
  memberships: LoopChannelMember[],
  channelId: string,
  currentUserId: string,
) {
  return memberships.find(
    (member) => member.channel_id === channelId && member.user_id !== currentUserId,
  )?.user_id;
}

function findOpponentIdFromChannelName(channel: LoopChannel, currentUserId: string) {
  if (channel.type !== "D") {
    return undefined;
  }

  const userIds = channel.name.split("__").filter(Boolean);
  if (userIds.length < 2) {
    return undefined;
  }

  return userIds.find((userId) => userId !== currentUserId);
}

async function resolveDirectChatPartners(
  client: LoopClient,
  teamId: string,
  channels: LoopChannel[],
) {
  const directChannels = channels.filter((channel) => channel.type === "D");
  if (directChannels.length === 0) {
    return new Map<string, DirectChatPartner>();
  }

  const [me, memberships] = await Promise.all([
    client.getMe(),
    client.listMyTeamChannelMembers(teamId),
  ]);

  const opponentIdsByChannel = new Map<string, string>();
  for (const channel of directChannels) {
    const opponentId =
      findOpponentIdFromMemberships(memberships, channel.id, me.id) ??
      findOpponentIdFromChannelName(channel, me.id);

    if (opponentId) {
      opponentIdsByChannel.set(channel.id, opponentId);
    }
  }

  const opponentIds = [...new Set(opponentIdsByChannel.values())];
  const usersById =
    opponentIds.length > 0
      ? new Map((await client.getUsersByIds(opponentIds)).map((user) => [user.id, user]))
      : new Map<string, LoopUser>();

  return new Map(
    directChannels.map((channel) => {
      const opponentId = opponentIdsByChannel.get(channel.id);
      return [
        channel.id,
        buildDirectChatPartner(
          opponentId,
          opponentId ? usersById.get(opponentId) : undefined,
        ),
      ];
    }),
  );
}

async function summarizeChannelsForViewer(
  client: LoopClient,
  teamId: string,
  channels: LoopChannel[],
) {
  const directChatPartners = await resolveDirectChatPartners(client, teamId, channels);

  return channels.map((channel) => {
    const summary = summarizeChannel(channel);
    if (channel.type !== "D") {
      return summary;
    }

    const directChatPartner = directChatPartners.get(channel.id);
    return {
      ...summary,
      resolved_name:
        directChatPartner?.display_name ??
        directChatPartner?.username ??
        channel.display_name ??
        channel.name,
      direct_chat_partner: directChatPartner,
      opponent_id: directChatPartner?.user_id,
      opponent_username: directChatPartner?.username,
      opponent_display_name: directChatPartner?.display_name,
    };
  });
}

async function buildMyTeamChannelsResult(
  client: LoopClient,
  teamId: string,
) {
  const channels = await client.listChannels(teamId);

  return {
    team_id: teamId,
    count: channels.length,
    channels: await summarizeChannelsForViewer(client, teamId, channels),
  };
}

export function registerChannelTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_channel",
    "Fetch one channel by id. For direct-message channels (type D), this tool also resolves the other participant into direct_chat_partner fields when available, so you do not need to guess from the technical channel name.",
    {
      channelId: z.string(),
    },
    async ({ channelId }) => {
      const channel = await client.getChannel(channelId);
      const [summary] = await summarizeChannelsForViewer(client, channel.team_id, [channel]);
      return jsonResult({
        ...channel,
        ...summary,
      });
    },
  );

  server.tool(
    "loop_list_my_team_channels",
    "List channels the current user is joined to in a team, including direct-message, group-message, private, and open channels. Use this for the viewer's own channel set. This is not the full team-wide public channel directory.",
    {
      teamId: z.string().optional(),
    },
    async ({ teamId }) => {
      const effectiveTeamId = await resolveTeamId(client, teamId);
      return jsonResult(
        await buildMyTeamChannelsResult(client, effectiveTeamId),
      );
    },
  );

  server.tool(
    "loop_list_team_public_channels",
    "List public channels from the team directory, including channels the current user may not be joined to. Use this when the user asks for the team-wide public channel catalog rather than only their own joined channels.",
    {
      teamId: z.string().optional(),
      page: z.number().int().nonnegative().default(0),
      perPage: z.number().int().positive().max(200).default(100),
    },
    async ({ teamId, page, perPage }) => {
      const effectiveTeamId = await resolveTeamId(client, teamId);
      const channels = await client.listTeamPublicChannels(effectiveTeamId, {
        page,
        perPage,
      });

      return jsonResult({
        team_id: effectiveTeamId,
        page,
        per_page: perPage,
        count: channels.length,
        channels: channels.map(summarizeChannel),
      });
    },
  );

  server.tool(
    "loop_get_channel_stats",
    "Fetch aggregate stats for one channel such as member_count and pinnedpost_count.",
    {
      channelId: z.string(),
    },
    async ({ channelId }) =>
      jsonResult({
        stats: summarizeChannelStats(await client.getChannelStats(channelId)),
      }),
  );

  server.tool(
    "loop_resolve_channel_by_name",
    "Resolve a human-readable channel name into a canonical channel object. Use this when the user says to find a channel by name before posting or reading.",
    {
      channelName: z.string().min(1),
      teamId: z.string().optional(),
    },
    async ({ channelName, teamId }) => {
      const effectiveTeamId = await resolveTeamId(client, teamId);
      const channel = await client.resolveChannelByName(
        effectiveTeamId,
        channelName,
      );

      return jsonResult({
        team_id: effectiveTeamId,
        channel: summarizeChannel(channel),
      });
    },
  );
}
