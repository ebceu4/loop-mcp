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
  "Use loop_get_me and loop_list_teams first.",
  "Then call loop_list_channels for the first team and choose the channel named",
  JSON.stringify(preferredChannel),
  "if it exists, otherwise choose the first channel with type O or P.",
  "Then call loop_get_team for the first team.",
  "Then call loop_get_channel, loop_get_channel_stats, and loop_list_channel_members for that channel.",
  "Then call loop_get_channel_member for the current user in that channel.",
  "Then call loop_list_channel_posts with page 0 and perPage 5.",
  "Use the first returned post id to call loop_get_post.",
  "Use the current user id to call loop_get_user.",
  "Then call loop_create_direct_channel using the current user id and the first non-self user id from the chosen channel member list.",
  "Return only JSON with these keys:",
  "chosen_channel_name, channel_id_match, member_count_nonzero, listed_member_count_nonzero, post_id_match, user_id_match.",
  "Also include team_id_match, channel_member_user_match, direct_channel_created.",
].join(" ");

const { output } = runHarness({
  prompt,
  mode: "isolated-home",
});

console.log(output);
