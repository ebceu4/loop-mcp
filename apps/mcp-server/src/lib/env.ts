import path from "node:path";
import dotenv from "dotenv";

export function loadWorkingDirEnvFiles(cwd: string = process.cwd()) {
  dotenv.config({ path: path.join(cwd, ".env.local"), override: false, quiet: true });
  dotenv.config({ path: path.join(cwd, ".env"), override: false, quiet: true });
}
