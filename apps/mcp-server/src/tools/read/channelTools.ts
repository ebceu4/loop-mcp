import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizeChannel, summarizeChannelStats } from "../../lib/summaries.js";
import { resolveTeamId } from "../../lib/team.js";

export function registerChannelTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_channel",
    {
      channelId: z.string(),
    },
    async ({ channelId }) => jsonResult(await client.getChannel(channelId)),
  );

  server.tool(
    "loop_list_channels",
    "List channels for a team so the agent can inspect candidates when only a vague or partial channel reference is known.",
    {
      teamId: z.string().optional(),
    },
    async ({ teamId }) => {
      const effectiveTeamId = await resolveTeamId(client, teamId);
      const channels = await client.listChannels(effectiveTeamId);

      return jsonResult({
        team_id: effectiveTeamId,
        count: channels.length,
        channels: channels.map(summarizeChannel),
      });
    },
  );

  server.tool(
    "loop_get_channel_stats",
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
