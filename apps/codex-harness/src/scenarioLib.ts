import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { prepareHarness, repoRoot, type HarnessMode, runHarness } from "./lib.js";

type ParsedScenarioDocument = {
  id: string;
  title: string;
  execution: {
    kind: string;
    summary?: string;
    prompt: string;
  };
  evaluation?: {
    expectTools?: string[];
    expectJsonPaths?: string[];
    expectTruthyPaths?: string[];
    expectNonEmptyPaths?: string[];
  };
};

type ScenarioCheck = {
  kind: "json" | "tool" | "path";
  name: string;
  ok: boolean;
  details?: string;
};

export type ScenarioResult = {
  id: string;
  title: string;
  ok: boolean;
  score: {
    passed: number;
    total: number;
    ratio: number;
  };
  expectedTools: string[];
  calledTools: string[];
  failedChecks: ScenarioCheck[];
  artifactDir: string;
};

export type ScenarioSuiteResult = {
  ok: boolean;
  total: number;
  passed: number;
  failed: number;
  scenarios: ScenarioResult[];
};

type ParsedScalar = string | number | boolean | null;
type ParsedNode = ParsedScalar | ParsedNode[] | { [key: string]: ParsedNode };

function leadingSpaces(value: string) {
  return value.match(/^ */)?.[0].length ?? 0;
}

function parseScalar(value: string): ParsedScalar {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function collectBlockScalar(lines: string[], startIndex: number, indent: number) {
  const collected: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      collected.push("");
      index += 1;
      continue;
    }

    const currentIndent = leadingSpaces(line);
    if (currentIndent < indent) {
      break;
    }

    collected.push(line.slice(indent));
    index += 1;
  }

  return {
    value: collected.join("\n").replace(/\n+$/u, ""),
    nextIndex: index,
  };
}

function parseNode(lines: string[], startIndex: number, indent: number): [ParsedNode, number] {
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (leadingSpaces(line) < indent) {
      return [{}, index];
    }

    break;
  }

  const currentLine = lines[index] ?? "";
  const isArray = currentLine.trim().startsWith("- ");

  if (isArray) {
    const items: ParsedNode[] = [];

    while (index < lines.length) {
      const line = lines[index] ?? "";
      if (!line.trim()) {
        index += 1;
        continue;
      }

      const currentIndent = leadingSpaces(line);
      if (currentIndent < indent) {
        break;
      }

      if (currentIndent !== indent || !line.trim().startsWith("- ")) {
        break;
      }

      const content = line.trim().slice(2).trim();
      index += 1;

      if (!content) {
        const [child, nextIndex] = parseNode(lines, index, indent + 2);
        items.push(child);
        index = nextIndex;
        continue;
      }

      items.push(parseScalar(content));
    }

    return [items, index];
  }

  const objectValue: Record<string, ParsedNode> = {};

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const currentIndent = leadingSpaces(line);
    if (currentIndent < indent) {
      break;
    }

    if (currentIndent !== indent) {
      break;
    }

    const trimmed = line.slice(indent);
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex < 0) {
      throw new Error(`Unsupported scenario syntax near line: ${line}`);
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rest = trimmed.slice(separatorIndex + 1).trim();

    if (rest === "|" || rest === "|-") {
      const { value, nextIndex } = collectBlockScalar(lines, index + 1, indent + 2);
      objectValue[key] = value;
      index = nextIndex;
      continue;
    }

    if (!rest) {
      const [child, nextIndex] = parseNode(lines, index + 1, indent + 2);
      objectValue[key] = child;
      index = nextIndex;
      continue;
    }

    objectValue[key] = parseScalar(rest);
    index += 1;
  }

  return [objectValue, index];
}

function parseScenarioBlock(markdown: string) {
  const match = markdown.match(/```yaml qa-scenario\n([\s\S]*?)```/u);
  if (!match?.[1]) {
    throw new Error("Missing ```yaml qa-scenario block.");
  }

  const [parsed] = parseNode(match[1].split(/\r?\n/u), 0, 0);
  return parsed as ParsedScenarioDocument;
}

function toStringArray(value: ParsedNode | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseScenarioDocument(markdown: string): ParsedScenarioDocument {
  const raw = parseScenarioBlock(markdown) as {
    [key: string]: ParsedNode;
  };

  const execution = raw.execution as { [key: string]: ParsedNode } | undefined;
  const evaluation = raw.evaluation as { [key: string]: ParsedNode } | undefined;
  const id = typeof raw.id === "string" ? raw.id : "";
  const title = typeof raw.title === "string" ? raw.title : id;
  const prompt = typeof execution?.prompt === "string" ? execution.prompt : "";
  const kind = typeof execution?.kind === "string" ? execution.kind : "";

  if (!id || !title || !kind || !prompt) {
    throw new Error("Scenario is missing id, title, execution.kind, or execution.prompt.");
  }

  return {
    id,
    title,
    execution: {
      kind,
      summary: typeof execution?.summary === "string" ? execution.summary : undefined,
      prompt,
    },
    evaluation: {
      expectTools: toStringArray(evaluation?.expectTools),
      expectJsonPaths: toStringArray(evaluation?.expectJsonPaths),
      expectTruthyPaths: toStringArray(evaluation?.expectTruthyPaths),
      expectNonEmptyPaths: toStringArray(evaluation?.expectNonEmptyPaths),
    },
  };
}

function getJsonPath(value: unknown, pathText: string): unknown {
  return pathText.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current) && /^\d+$/.test(segment)) {
      return current[Number(segment)];
    }

    if (typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, value);
}

function isNonEmptyValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return Boolean(value);
}

function parseCalledTools(stdout: string) {
  const matches = stdout.matchAll(/tool\s+loop_under_test\.([a-zA-Z0-9_]+)\(/gu);
  const calls = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      calls.add(match[1]);
    }
  }

  return [...calls];
}

function extractJsonCandidate(rawOutput: string) {
  const trimmed = rawOutput.trim();
  if (!trimmed) {
    return "";
  }

  const objectStart = trimmed.indexOf("{");
  const arrayStart = trimmed.indexOf("[");
  const starts = [objectStart, arrayStart].filter((value) => value >= 0);
  const start = starts.length > 0 ? Math.min(...starts) : -1;

  if (start < 0) {
    return trimmed;
  }

  return trimmed.slice(start);
}

function appendMissingClosers(value: string) {
  const stack: string[] = [];
  let inString = false;
  let isEscaped = false;

  for (const char of value) {
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      stack.push("}");
      continue;
    }

    if (char === "[") {
      stack.push("]");
      continue;
    }

    if ((char === "}" || char === "]") && stack.at(-1) === char) {
      stack.pop();
    }
  }

  return value + stack.reverse().join("");
}

function parseJsonOutput(rawOutput: string) {
  const trimmed = rawOutput.trim();
  try {
    return {
      parsed: JSON.parse(trimmed) as unknown,
      repaired: false,
      details: undefined,
    };
  } catch (initialError) {
    const candidate = extractJsonCandidate(rawOutput);

    if (candidate && candidate !== trimmed) {
      try {
        return {
          parsed: JSON.parse(candidate) as unknown,
          repaired: true,
          details: "Recovered JSON by trimming non-JSON wrapper text.",
        };
      } catch {
        // Fall through to balance repair.
      }
    }

    const repairedCandidate = appendMissingClosers(candidate || trimmed);
    if (repairedCandidate && repairedCandidate !== trimmed) {
      try {
        return {
          parsed: JSON.parse(repairedCandidate) as unknown,
          repaired: true,
          details: "Recovered JSON by balancing missing closing braces/brackets.",
        };
      } catch {
        // Keep the original parse error below.
      }
    }

    throw initialError;
  }
}

function buildScenarioPrompt(prompt: string) {
  return [
    "You are answering a real user request in a session that may expose MCP tools.",
    "If live Loop workspace data is needed, use the available MCP tools instead of guessing.",
    "Do not mention internal tool names unless the user explicitly asks for them.",
    "Return a single valid JSON object with no markdown fences and no extra commentary.",
    "",
    prompt.trim(),
  ].join("\n");
}

function evaluateScenario(
  scenario: ParsedScenarioDocument,
  rawOutput: string,
  calledTools: string[],
  artifactDir: string,
) {
  const checks: ScenarioCheck[] = [];
  let parsedOutput: unknown;

  try {
    const parsed = parseJsonOutput(rawOutput);
    parsedOutput = parsed.parsed;
    checks.push({
      kind: "json",
      name: "valid-json-output",
      ok: true,
      details: parsed.repaired ? parsed.details : undefined,
    });
  } catch (error) {
    checks.push({
      kind: "json",
      name: "valid-json-output",
      ok: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  for (const toolName of scenario.evaluation?.expectTools ?? []) {
    checks.push({
      kind: "tool",
      name: `tool:${toolName}`,
      ok: calledTools.includes(toolName),
      details: calledTools.includes(toolName)
        ? undefined
        : `Expected tool ${toolName}, called: ${calledTools.join(", ") || "none"}`,
    });
  }

  if (parsedOutput !== undefined) {
    for (const pathText of scenario.evaluation?.expectJsonPaths ?? []) {
      const value = getJsonPath(parsedOutput, pathText);
      checks.push({
        kind: "path",
        name: `path:${pathText}`,
        ok: value !== undefined,
        details: value !== undefined ? undefined : `Missing JSON path ${pathText}`,
      });
    }

    for (const pathText of scenario.evaluation?.expectTruthyPaths ?? []) {
      const value = getJsonPath(parsedOutput, pathText);
      checks.push({
        kind: "path",
        name: `truthy:${pathText}`,
        ok: Boolean(value),
        details: Boolean(value) ? undefined : `Expected truthy JSON path ${pathText}`,
      });
    }

    for (const pathText of scenario.evaluation?.expectNonEmptyPaths ?? []) {
      const value = getJsonPath(parsedOutput, pathText);
      checks.push({
        kind: "path",
        name: `non-empty:${pathText}`,
        ok: isNonEmptyValue(value),
        details: isNonEmptyValue(value) ? undefined : `Expected non-empty JSON path ${pathText}`,
      });
    }
  }

  const failedChecks = checks.filter((check) => !check.ok);
  const passed = checks.length - failedChecks.length;
  const total = checks.length;

  const report = {
    id: scenario.id,
    title: scenario.title,
    ok: failedChecks.length === 0,
    score: {
      passed,
      total,
      ratio: total > 0 ? Number((passed / total).toFixed(2)) : 1,
    },
    expectedTools: scenario.evaluation?.expectTools ?? [],
    calledTools,
    failedChecks,
    artifactDir,
  } satisfies ScenarioResult;

  return report;
}

function writeScenarioArtifacts(artifactDir: string, data: Record<string, unknown>) {
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(path.join(artifactDir, "result.json"), JSON.stringify(data, null, 2), "utf8");
}

export function loadScenarioById(id: string) {
  const scenariosDir = path.join(repoRoot, "qa/scenarios");
  const filePath = path.join(scenariosDir, `${id}.md`);
  const markdown = readFileSync(filePath, "utf8");
  return parseScenarioDocument(markdown);
}

export function loadAllScenarios() {
  const scenariosDir = path.join(repoRoot, "qa/scenarios");

  return readdirSync(scenariosDir)
    .filter((entry) => entry.endsWith(".md") && entry !== "index.md")
    .sort((left, right) => left.localeCompare(right))
    .map((entry) => {
      const markdown = readFileSync(path.join(scenariosDir, entry), "utf8");
      return parseScenarioDocument(markdown);
    });
}

export function runScenario(
  id: string,
  options: { mode?: HarnessMode; model?: string; skipBuild?: boolean } = {},
): ScenarioResult {
  const scenario = loadScenarioById(id);
  const artifactDir = path.join(repoRoot, ".codex-harness", "scenarios", scenario.id);
  mkdirSync(artifactDir, { recursive: true });

  const runResult = runHarness({
    prompt: buildScenarioPrompt(scenario.execution.prompt),
    mode: options.mode,
    model: options.model,
    artifactName: path.join("scenarios", scenario.id, "last-message"),
    skipBuild: options.skipBuild,
  });

  const transcript = [runResult.stdout, runResult.stderr].filter(Boolean).join("\n");
  writeFileSync(path.join(artifactDir, "stdout.log"), runResult.stdout, "utf8");
  writeFileSync(path.join(artifactDir, "stderr.log"), runResult.stderr, "utf8");
  writeFileSync(path.join(artifactDir, "transcript.log"), transcript, "utf8");
  writeFileSync(path.join(artifactDir, "final-output.txt"), runResult.output, "utf8");

  const calledTools = parseCalledTools(transcript);
  const result = evaluateScenario(scenario, runResult.output, calledTools, artifactDir);

  writeScenarioArtifacts(artifactDir, {
    scenario,
    run: {
      outputFile: runResult.outputFile,
      calledTools,
    },
    evaluation: result,
  });

  return result;
}

export function runScenarioSuite(options: { mode?: HarnessMode; model?: string } = {}) {
  const scenarios = loadAllScenarios();
  prepareHarness();

  const results = scenarios.map((scenario) =>
    runScenario(scenario.id, {
      ...options,
      skipBuild: true,
    }),
  );
  const passed = results.filter((result) => result.ok).length;

  return {
    ok: passed === results.length,
    total: results.length,
    passed,
    failed: results.length - passed,
    scenarios: results,
  } satisfies ScenarioSuiteResult;
}
