import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizeUserStatus } from "../../lib/summaries.js";

export function registerAccountBatchTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_users_by_usernames",
    "Bulk fetch Loop users by username. Use this when you have several usernames and need canonical user records in one call.",
    {
      usernames: z.array(z.string().min(1)).min(1),
    },
    async ({ usernames }) =>
      jsonResult({
        users: await client.getUsersByUsernames(usernames),
      }),
  );

  server.tool(
    "loop_get_user_statuses_by_ids",
    "Bulk fetch Loop presence/status rows by userId.",
    {
      userIds: z.array(z.string()).min(1),
    },
    async ({ userIds }) =>
      jsonResult({
        statuses: (await client.getUserStatusesByIds(userIds)).map(
          summarizeUserStatus,
        ),
      }),
  );
}
