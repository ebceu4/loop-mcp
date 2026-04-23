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
  "Use loop_list_teams first.",
  "Then call loop_list_channels for the first team and choose the channel named",
  JSON.stringify(preferredChannel),
  "if it exists, otherwise choose the first channel with type O or P.",
  "Then call loop_get_my_channel_mention_state for that chosen channel.",
  "Then call loop_list_team_mentions for the first team.",
  "Then call loop_list_all_mentions.",
  "Return only JSON with these keys:",
  "channel_mention_state_accessible, team_mentions_accessible, all_mentions_accessible, chosen_channel_name.",
].join(" ");

const { output } = runHarness({
  prompt,
  mode: "isolated-home",
});

console.log(output);
