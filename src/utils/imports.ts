import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
import { ImportInfo } from "../types";
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

export async function* walkDirectory(dir: string): AsyncGenerator<string> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const path = join(dir, entry.name);

      if (
        entry.isDirectory() &&
        entry.name !== "node_modules" &&
        entry.name !== ".git"
      ) {
        yield* walkDirectory(path);
      } else if (EXTENSIONS.includes(extname(entry.name))) {
        yield path;
      }
    }
  } catch (error) {
    // Directory does not exist
  }
}

export async function getImports(
  dependencyName: string,
): Promise<ImportInfo[]> {
  const imports: ImportInfo[] = [];
  const srcDir = join(process.cwd(), "src");

  for await (const file of walkDirectory(srcDir)) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const importMatch = line.match(
        /(?:import|require)\s*(?:\{[^}]*\}|[^'"]*)\s*from\s*['"]([^'"]+)['"]/,
      );

      if (importMatch) {
        const importPath = importMatch[1];

        if (
          importPath === dependencyName ||
          importPath.startsWith(`${dependencyName}/`)
        ) {
          imports.push({
            file: file.replace(process.cwd(), "."),
            line: idx + 1,
            importStatement: line.trim(),
          });
        }
      }
    });
  }

  return imports;
}
