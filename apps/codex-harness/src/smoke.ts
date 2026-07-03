import { runHarness } from "./lib.js";

const prompt = [
  "Use loop_tool_inventory.",
  "Then call loop_get_me.",
  "Then call loop_list_my_team_channels for the first available team.",
  "Return only JSON with these keys: tool_inventory_seen, username, roles, channel_count, first_channel_name.",
].join(" ");

const { output } = runHarness({
  prompt,
  mode: "isolated-home",
});

console.log(output);
