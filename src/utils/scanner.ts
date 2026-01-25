import { readFile } from "fs/promises";
import { join } from "path";
import { ImportInfo } from "../types.js";
import { traverse } from "./traverse.js";

export async function scanImports(packageName: string): Promise<ImportInfo[]> {
  const imports: ImportInfo[] = [];
  const srcDir = join(process.cwd(), "src");

  for await (const file of traverse(srcDir)) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const importMatch = line.match(
        /(?:import|require)\s*(?:\{[^}]*\}|[^'"]*)\s*from\s*['"]([^'"]+)['"]/
      );

      if (importMatch) {
        const importPath = importMatch[1];

        if (
          importPath === packageName ||
          importPath.startsWith(`${packageName}/`)
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
