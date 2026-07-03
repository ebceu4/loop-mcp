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
  "Then call loop_list_team_members for the first team with page 0 and perPage 5.",
  "Then call loop_get_users_by_ids using the current user id and the first team member user id from that result.",
  "Then call loop_list_team_channel_memberships for the first team.",
  "Then call loop_list_my_team_channels for the first team and choose the channel named",
  JSON.stringify(preferredChannel),
  "if it exists, otherwise choose the first channel with type O or P.",
  "Then call loop_list_pinned_posts for that chosen channel.",
  "Then call loop_create_group_channel using the current user id plus the first two non-self user ids from the team member list.",
  "Return only JSON with these keys:",
  "team_member_count_nonzero, users_by_ids_count_two, my_team_channel_members_nonzero, pinned_posts_accessible, group_channel_created.",
].join(" ");

const { output } = runHarness({
  prompt,
  mode: "isolated-home",
});

console.log(output);
