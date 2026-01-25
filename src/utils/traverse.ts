import { readdir } from "fs/promises";
import { join, extname } from "path";
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

export async function* traverse(dir: string): AsyncGenerator<string> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const path = join(dir, entry.name);

      if (
        entry.isDirectory() &&
        entry.name !== "node_modules" &&
        entry.name !== ".git"
      ) {
        yield* traverse(path);
      } else if (EXTENSIONS.includes(extname(entry.name))) {
        yield path;
      }
    }
  } catch (error) {
    // Directory does not exist
  }
}
