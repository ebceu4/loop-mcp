import type { LoopClient } from "../../loop-client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { jsonResult } from "../../lib/results.js";
import { summarizePost } from "../../lib/summaries.js";

export function registerPostWriteTools(server: McpServer, client: LoopClient) {
  server.tool(
    "loop_create_post",
    "Create a new root post in a channel after the target channelId is known. Use this for sending a new message to a channel.",
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
    "Reply inside an existing thread. Use this when the user wants to answer a root post instead of starting a new root message.",
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
    "Update the message body of an existing post. Use this when the user wants to edit or correct a previously sent message.",
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
    "Delete an existing post when the authenticated account has permission. Use this for cleanup of temporary smoke messages or explicit delete requests.",
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
