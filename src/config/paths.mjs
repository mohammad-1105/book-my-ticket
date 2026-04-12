import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

export const rootDir = resolve(currentDir, "../..");
export const publicDir = resolve(rootDir, "public");
