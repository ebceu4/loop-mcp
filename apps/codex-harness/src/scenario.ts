import { runScenario } from "./scenarioLib.js";

const args = process.argv.slice(2);
const scenarioFlagIndex = args.indexOf("--scenario");
const modeFlagIndex = args.indexOf("--mode");
const modelFlagIndex = args.indexOf("--model");

const scenarioId =
  scenarioFlagIndex >= 0 && args[scenarioFlagIndex + 1]
    ? args[scenarioFlagIndex + 1]
    : "tool-inventory-contract";
const mode =
  modeFlagIndex >= 0 && args[modeFlagIndex + 1]
    ? ((args[modeFlagIndex + 1] ?? "isolated-home") as "isolated-home" | "overlay")
    : "isolated-home";
const model = modelFlagIndex >= 0 && args[modelFlagIndex + 1] ? args[modelFlagIndex + 1] : undefined;

const result = runScenario(scenarioId ?? "tool-inventory-contract", { mode, model });
console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
