import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizePost } from "../../lib/summaries.js";

export function registerPostTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_get_post",
    "Fetch one post by postId.",
    {
      postId: z.string(),
    },
    async ({ postId }) =>
      jsonResult({
        post: summarizePost(await client.getPost(postId)),
      }),
  );

  server.tool(
    "loop_list_channel_posts",
    "List posts in a channel with pagination, returning posts in server order for the requested page.",
    {
      channelId: z.string(),
      page: z.number().int().nonnegative().default(0),
      perPage: z.number().int().positive().max(50).default(10),
    },
    async ({ channelId, page, perPage }) => {
      const payload = await client.listChannelPosts(channelId, { page, perPage });

      return jsonResult({
        channel_id: channelId,
        page,
        per_page: perPage,
        order: payload.order,
        posts: payload.order.map((postId) => summarizePost(payload.posts[postId])),
      });
    },
  );

  server.tool(
    "loop_list_pinned_posts",
    "List pinned posts for a channel.",
    {
      channelId: z.string(),
    },
    async ({ channelId }) => {
      const payload = await client.listPinnedPosts(channelId);

      return jsonResult({
        channel_id: channelId,
        order: payload.order,
        count: payload.order.length,
        posts: payload.order.map((postId) => summarizePost(payload.posts[postId])),
      });
    },
  );

  server.tool(
    "loop_get_post_thread",
    "Fetch the full thread for a root post.",
    {
      postId: z.string(),
    },
    async ({ postId }) => {
      const payload = await client.getPostThread(postId);

      return jsonResult({
        root_post_id: postId,
        order: payload.order,
        posts: payload.order.map((threadPostId) =>
          summarizePost(payload.posts[threadPostId]),
        ),
      });
    },
  );
}
