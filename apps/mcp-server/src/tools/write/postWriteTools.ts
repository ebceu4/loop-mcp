import type { LoopClient } from "@carely/loop-client";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizePost } from "../../lib/summaries.js";

export function registerPostWriteTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_create_post",
    {
      channelId: z.string(),
      message: z.string().min(1),
    },
    async ({ channelId, message }) => {
      const post = await client.createPost({ channelId, message });

      return jsonResult({
        ok: true,
        action: "created",
        post: summarizePost(post),
      });
    },
  );

  server.tool(
    "loop_reply_to_post",
    {
      channelId: z.string(),
      rootPostId: z.string(),
      message: z.string().min(1),
    },
    async ({ channelId, rootPostId, message }) => {
      const post = await client.createPost({
        channelId,
        message,
        rootId: rootPostId,
      });

      return jsonResult({
        ok: true,
        action: "replied",
        post: summarizePost(post),
      });
    },
  );

  server.tool(
    "loop_update_post",
    {
      postId: z.string(),
      message: z.string().min(1),
    },
    async ({ postId, message }) => {
      const post = await client.updatePost(postId, message);

      return jsonResult({
        ok: true,
        action: "updated",
        post: summarizePost(post),
      });
    },
  );

  server.tool(
    "loop_delete_post",
    {
      postId: z.string(),
    },
    async ({ postId }) => {
      await client.deletePost(postId);

      return jsonResult({
        ok: true,
        action: "deleted",
        post_id: postId,
      });
    },
  );
}
