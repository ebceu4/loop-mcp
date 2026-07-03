import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import { runHarness } from "./lib.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

dotenv.config({ path: path.join(repoRoot, ".env.local"), override: false });
dotenv.config({ path: path.join(repoRoot, ".env"), override: false });

const preferredChannel = process.env.LOOP_SMOKE_CHANNEL_NAME || "test-it-help";

const prompt = [
  "Use loop_tool_inventory first.",
  "Then call loop_get_me and loop_list_teams.",
  "Then call loop_list_my_team_channels for the first team.",
  `Pick the channel named ${JSON.stringify(preferredChannel)} if it exists; otherwise pick the first channel with type O or P.`,
  "Then call loop_resolve_channel_by_name for the chosen channel name.",
  "Then call loop_resolve_user_by_username for the current username.",
  "Create a root post with a clearly marked temporary MCP smoke message.",
  "Reply to that root post with another temporary MCP smoke message.",
  "Call loop_get_post_thread for the root post.",
  "Update the root post message to include the word updated.",
  "Delete the reply post.",
  "Delete the root post.",
  "Return only JSON with these keys: username, chosen_channel_name, resolved_channel_id, created_post_id, reply_post_id, thread_post_count, updated_message_contains_updated, root_deleted, reply_deleted.",
].join(" ");

const { output } = runHarness({
  prompt,
  mode: "isolated-home",
});

console.log(output);
