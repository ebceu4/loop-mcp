import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

export type HarnessMode = "isolated-home" | "overlay";

export type HarnessRunOptions = {
  prompt: string;
  mode?: HarnessMode;
  model?: string;
  artifactName?: string;
  skipBuild?: boolean;
};

export type HarnessRunResult = {
  output: string;
  stdout: string;
  stderr: string;
  outputFile: string;
};

type LoopEnv = {
  LOOP_BASE_URL: string;
  LOOP_TOKEN?: string;
  LOOP_LOGIN_ID?: string;
  LOOP_PASSWORD?: string;
};

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "../../..");

function shellQuote(value: string) {
  return JSON.stringify(value);
}

function loadDotEnvFiles() {
  dotenv.config({ path: path.join(repoRoot, ".env.local"), override: false });
  dotenv.config({ path: path.join(repoRoot, ".env"), override: false });
}

function readLoopEnv(): LoopEnv {
  loadDotEnvFiles();

  const baseUrl = process.env.LOOP_BASE_URL;
  const token = process.env.LOOP_TOKEN;
  const loginId = process.env.LOOP_LOGIN_ID;
  const password = process.env.LOOP_PASSWORD;

  if (!baseUrl) {
    throw new Error("LOOP_BASE_URL is required for the harness.");
  }

  if (!token && !(loginId && password)) {
    throw new Error(
      "Set LOOP_TOKEN or LOOP_LOGIN_ID with LOOP_PASSWORD before running the harness.",
    );
  }

  return {
    LOOP_BASE_URL: baseUrl,
    LOOP_TOKEN: token,
    LOOP_LOGIN_ID: loginId,
    LOOP_PASSWORD: password,
  };
}

function buildServer() {
  const result = spawnSync(
    "pnpm",
    ["--dir", repoRoot, "--filter", "@carely/loop-mcp", "build"],
    {
      cwd: repoRoot,
      stdio: "inherit",
      env: process.env,
    },
  );

  if (result.status !== 0) {
    throw new Error("Failed to build @carely/loop-mcp.");
  }
}

export function prepareHarness() {
  readLoopEnv();
  buildServer();
}

function createConfigToml(loopEnv: LoopEnv) {
  const serverEntry = [
    "[mcp_servers.loop_under_test]",
    'command = "node"',
    `args = [${shellQuote(path.join(repoRoot, "apps/mcp-server/dist/index.js"))}]`,
    "",
    "[mcp_servers.loop_under_test.env]",
    `LOOP_BASE_URL = ${shellQuote(loopEnv.LOOP_BASE_URL)}`,
  ];

  if (loopEnv.LOOP_TOKEN) {
    serverEntry.push(`LOOP_TOKEN = ${shellQuote(loopEnv.LOOP_TOKEN)}`);
  }

  if (loopEnv.LOOP_LOGIN_ID) {
    serverEntry.push(`LOOP_LOGIN_ID = ${shellQuote(loopEnv.LOOP_LOGIN_ID)}`);
  }

  if (loopEnv.LOOP_PASSWORD) {
    serverEntry.push(`LOOP_PASSWORD = ${shellQuote(loopEnv.LOOP_PASSWORD)}`);
  }

  return `${serverEntry.join("\n")}\n`;
}

function copyIfExists(source: string, target: string) {
  if (existsSync(source)) {
    cpSync(source, target);
  }
}

function createIsolatedCodexHome(configToml: string) {
  const tempHome = mkdtempSync(path.join(tmpdir(), "loop-mcp-codex-home-"));
  const codexHome = path.join(tempHome, ".codex");
  const sourceCodexHome = path.join(process.env.HOME ?? "", ".codex");
  mkdirSync(codexHome, { recursive: true });

  copyIfExists(path.join(sourceCodexHome, "auth.json"), path.join(codexHome, "auth.json"));
  copyIfExists(path.join(sourceCodexHome, "config.json"), path.join(codexHome, "config.json"));
  copyIfExists(path.join(sourceCodexHome, "installation_id"), path.join(codexHome, "installation_id"));

  writeFileSync(path.join(codexHome, "config.toml"), configToml, "utf8");

  return { tempHome, codexHome };
}

function createOutputFile(artifactName: string | undefined) {
  const safeName = (artifactName ?? "last-message").replace(/[^a-zA-Z0-9._/-]+/g, "-");
  const outputFile = path.join(repoRoot, ".codex-harness", `${safeName}.txt`);
  mkdirSync(path.dirname(outputFile), { recursive: true });
  return outputFile;
}

function runCodexWithOverlay(
  prompt: string,
  model: string | undefined,
  artifactName: string | undefined,
): HarnessRunResult {
  const loopEnv = readLoopEnv();
  const serverPath = path.join(repoRoot, "apps/mcp-server/dist/index.js");
  const outputFile = createOutputFile(artifactName);

  const args = [
    "exec",
    "--skip-git-repo-check",
    "--ephemeral",
    "--color",
    "never",
    "--cd",
    repoRoot,
    "--output-last-message",
    outputFile,
  ];

  if (model) {
    args.push("--model", model);
  }

  args.push(
    "-c",
    `mcp_servers.loop_under_test.command=${shellQuote("node")}`,
    "-c",
    `mcp_servers.loop_under_test.args=[${shellQuote(serverPath)}]`,
    "-c",
    `mcp_servers.loop_under_test.env.LOOP_BASE_URL=${shellQuote(loopEnv.LOOP_BASE_URL)}`,
  );

  if (loopEnv.LOOP_TOKEN) {
    args.push(
      "-c",
      `mcp_servers.loop_under_test.env.LOOP_TOKEN=${shellQuote(loopEnv.LOOP_TOKEN)}`,
    );
  }

  if (loopEnv.LOOP_LOGIN_ID) {
    args.push(
      "-c",
      `mcp_servers.loop_under_test.env.LOOP_LOGIN_ID=${shellQuote(loopEnv.LOOP_LOGIN_ID)}`,
    );
  }

  if (loopEnv.LOOP_PASSWORD) {
    args.push(
      "-c",
      `mcp_servers.loop_under_test.env.LOOP_PASSWORD=${shellQuote(loopEnv.LOOP_PASSWORD)}`,
    );
  }

  args.push(prompt);

  const result = spawnSync("codex", args, {
    cwd: repoRoot,
    stdio: "pipe",
    env: process.env,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      [
        "Codex overlay run failed.",
        result.stdout?.trim() ? `stdout:\n${result.stdout}` : "",
        result.stderr?.trim() ? `stderr:\n${result.stderr}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  return {
    output: readFileSync(outputFile, "utf8").trim(),
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    outputFile,
  };
}

export function runHarness(options: HarnessRunOptions): HarnessRunResult {
  const mode = options.mode ?? "isolated-home";
  const model = options.model ?? process.env.CODEX_MODEL;

  if (!options.skipBuild) {
    buildServer();
  }

  if (mode === "overlay") {
    return runCodexWithOverlay(options.prompt, model, options.artifactName);
  }

  const loopEnv = readLoopEnv();
  const configToml = createConfigToml(loopEnv);
  const { tempHome, codexHome } = createIsolatedCodexHome(configToml);
  const outputFile = createOutputFile(options.artifactName);

  const args = [
    "exec",
    "--skip-git-repo-check",
    "--ephemeral",
    "--color",
    "never",
    "--cd",
    repoRoot,
    "--output-last-message",
    outputFile,
  ];

  if (model) {
    args.push("--model", model);
  }

  args.push(options.prompt);

  const env = {
    ...process.env,
    HOME: tempHome,
    CODEX_HOME: codexHome,
  };

  try {
    const result = spawnSync("codex", args, {
      cwd: repoRoot,
      stdio: "pipe",
      env,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      throw new Error(
        [
          "Codex isolated harness run failed.",
          result.stdout?.trim() ? `stdout:\n${result.stdout}` : "",
          result.stderr?.trim() ? `stderr:\n${result.stderr}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
    }

    return {
      output: readFileSync(outputFile, "utf8").trim(),
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      outputFile,
    };
  } finally {
    rmSync(tempHome, { recursive: true, force: true });
  }
}
