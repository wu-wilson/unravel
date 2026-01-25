import { readFile } from "fs/promises";
import { join, relative } from "path";
import { CircularDependency, FileNode } from "../types.js";
import { traverse } from "./traverse.js";

async function buildDependencyGraph(): Promise<Map<string, FileNode>> {
  const graph = new Map<string, FileNode>();
  const srcDir = join(process.cwd(), "src");

  for await (const file of traverse(srcDir)) {
    const content = await readFile(file, "utf-8");
    const imports: string[] = [];

    const regex = /(?:import|export).*from\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const path = match[1];

      if (path.startsWith(".")) {
        const resolved = join(srcDir, relative(srcDir, join(file, "..", path)));
        imports.push(resolved);
      }
    }

    graph.set(file, { path: file, imports });
  }

  return graph;
}

export async function detectCircularDependencies(): Promise<
  CircularDependency[]
> {
  const graph = await buildDependencyGraph();
  const cycles: CircularDependency[] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const fileNode = graph.get(node);
    if (!fileNode) {
      path.pop();
      recStack.delete(node);
      return false;
    }

    for (const dep of fileNode.imports) {
      if (!visited.has(dep)) {
        if (dfs(dep)) {
          return true;
        }
      } else if (recStack.has(dep)) {
        const cycleStart = path.indexOf(dep);
        const cycle = path
          .slice(cycleStart)
          .map((p) =>
            p.replace(process.cwd(), ".").replace(/\.(ts|tsx|js|jsx)$/, "")
          );
        cycle.push(cycle[0]);

        cycles.push({ cycle });
        return true;
      }
    }

    path.pop();
    recStack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}
