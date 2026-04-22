import { runHarness } from "./lib.js";

const args = process.argv.slice(2);
const promptFlagIndex = args.indexOf("--prompt");
const modeFlagIndex = args.indexOf("--mode");

const prompt =
  promptFlagIndex >= 0 && args[promptFlagIndex + 1]
    ? args[promptFlagIndex + 1]
    : "Use the loop_tool_inventory tool first. Then call loop_get_me. Return only JSON with username and roles.";

const mode =
  modeFlagIndex >= 0 && args[modeFlagIndex + 1]
    ? (args[modeFlagIndex + 1] as "isolated-home" | "overlay")
    : "isolated-home";

const { output } = runHarness({ prompt, mode });
console.log(output);
