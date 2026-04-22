import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";

export function registerChannelWriteTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_create_direct_channel",
    {
      userId1: z.string(),
      userId2: z.string(),
    },
    async ({ userId1, userId2 }) =>
      jsonResult({
        ok: true,
        action: "direct_channel_ready",
        channel: await client.createDirectChannel(userId1, userId2),
      }),
  );

  server.tool(
    "loop_create_group_channel",
    {
      userIds: z.array(z.string()).min(2),
    },
    async ({ userIds }) =>
      jsonResult({
        ok: true,
        action: "group_channel_ready",
        channel: await client.createGroupChannel(userIds),
      }),
  );
}
