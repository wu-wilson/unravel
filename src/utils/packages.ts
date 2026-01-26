import { readFile } from "fs/promises";
import { resolve } from "path";

export async function getPackages(): Promise<Record<string, string>> {
  try {
    const path = resolve(process.cwd(), "package.json");
    const content = await readFile(path, "utf-8");
    const parsed = JSON.parse(content);

    return parsed.dependencies;
  } catch (error) {
    return {};
  }
}
