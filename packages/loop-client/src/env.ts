import { LoopClient } from "./loopClient.js";

export function createLoopClientFromEnv(env: NodeJS.ProcessEnv = process.env) {
  const baseUrl = env.LOOP_BASE_URL;
  if (!baseUrl) {
    throw new Error("LOOP_BASE_URL is required.");
  }

  return new LoopClient({
    baseUrl,
    token: env.LOOP_TOKEN,
    loginId: env.LOOP_LOGIN_ID,
    password: env.LOOP_PASSWORD,
  });
}
