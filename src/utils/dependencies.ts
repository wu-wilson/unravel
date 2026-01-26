import { resolve } from "path";
import { DependencyInfo } from "../types";
import { mkdtemp, readFile, rm, stat } from "fs/promises";
import { promisify } from "util";
import { execFile } from "child_process";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);
const CACHE = new Map<string, DependencyInfo>();

async function getDependencySize(
  dependencyName: string,
  version: string,
): Promise<number> {
  const tmp = await mkdtemp(resolve(tmpdir(), "unravel-"));

  try {
    const { stdout } = await execFileAsync(
      "npm",
      ["pack", `${dependencyName}@${version}`, "--silent", "--ignore-scripts"],
      { cwd: tmp },
    );

    const tarballName = stdout
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.endsWith(".tgz"));

    if (!tarballName) {
      throw new Error("Failed to find tarball");
    }

    const tarballPath = resolve(tmp, tarballName);
    const { size } = await stat(tarballPath);

    return size;
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

export async function getDependencies(): Promise<DependencyInfo[]> {
  try {
    const path = resolve(process.cwd(), "package.json");
    const content = await readFile(path, "utf-8");
    const parsed = JSON.parse(content);

    const dependencies = parsed.dependencies;
    const entries = Object.entries(dependencies);

    const dependenciesWithSizes = await Promise.all(
      entries.map(async ([name, version]) => {
        const cleanVersion = (version as string).replace(/^[\^~]/, "");

        try {
          const gzip = await getDependencySize(name, cleanVersion);

          const info: DependencyInfo = {
            name,
            version: cleanVersion,
            gzip,
          };

          CACHE.set(`${name}@${cleanVersion}`, info);
          return info;
        } catch (error) {
          const info: DependencyInfo = {
            name,
            version: cleanVersion,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch package",
          };

          CACHE.set(`${name}@${cleanVersion}`, info);
          return info;
        }
      }),
    );

    return dependenciesWithSizes;
  } catch (error) {
    return [];
  }
}
