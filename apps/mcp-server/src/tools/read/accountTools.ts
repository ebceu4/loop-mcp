import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";

export function registerAccountTools(server: McpServer, client: LoopClient) {
  server.tool("loop_get_me", {}, async () => jsonResult(await client.getMe()));

  server.tool(
    "loop_get_user",
    {
      userId: z.string(),
    },
    async ({ userId }) => jsonResult(await client.getUser(userId)),
  );

  server.tool(
    "loop_get_users_by_ids",
    {
      userIds: z.array(z.string()).min(1),
    },
    async ({ userIds }) =>
      jsonResult({
        users: await client.getUsersByIds(userIds),
      }),
  );

  server.tool(
    "loop_resolve_user_by_username",
    {
      username: z.string().min(1),
    },
    async ({ username }) =>
      jsonResult({
        user: await client.resolveUserByUsername(username),
      }),
  );
}
