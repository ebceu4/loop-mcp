import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import { runHarness } from "./lib.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

dotenv.config({ path: path.join(repoRoot, ".env.local"), override: false });
dotenv.config({ path: path.join(repoRoot, ".env"), override: false });

const prompt = [
  "Use loop_get_me and loop_list_teams first.",
  "Then call loop_get_team_member for the current user in the first team.",
  "Then call loop_resolve_team_by_name using the first team's name.",
  "Then call loop_get_users_by_usernames using an array with the current username and igor.f.",
  "Then call loop_get_user_statuses_by_ids using the current user id and the first returned user id from the usernames lookup that is not the current user when available, otherwise just the current user id.",
  "Then call loop_list_my_team_unreads.",
  "Return only JSON with these keys:",
  "team_member_matches_current_user, resolved_team_matches_first_team, usernames_lookup_nonzero, statuses_lookup_nonzero, unreads_nonzero.",
].join(" ");

const { output } = runHarness({
  prompt,
  mode: "isolated-home",
});

console.log(output);
