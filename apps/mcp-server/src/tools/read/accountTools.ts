import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";

export function registerAccountTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_me",
    "Return the currently authenticated Loop account. Use this to confirm who is acting before resolving teams, channels, or recipients.",
    {},
    async () => jsonResult(await client.getMe()),
  );

  server.tool(
    "loop_get_user",
    "Fetch a single Loop user by userId. Use this when you already know the exact user id and need profile fields such as username or email.",
    {
      userId: z.string(),
    },
    async ({ userId }) => jsonResult(await client.getUser(userId)),
  );

  server.tool(
    "loop_get_users_by_ids",
    "Bulk fetch Loop users by userId. Prefer this over repeated single-user lookups when enriching direct-message channels, memberships, or other channel->user mappings.",
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
    "Resolve a human-readable Loop username into a canonical user record. Use this when the user refers to a teammate by username instead of userId.",
    {
      username: z.string().min(1),
    },
    async ({ username }) =>
      jsonResult({
        user: await client.resolveUserByUsername(username),
      }),
  );
}
