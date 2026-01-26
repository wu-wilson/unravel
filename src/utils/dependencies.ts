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

async function readPackageJson(path: string): Promise<any> {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("package.json not found in the current directory");
    }

    if (error instanceof SyntaxError) {
      throw new Error(`package.json contains invalid JSON: ${error.message}`);
    }

    throw new Error(
      `Failed to read package.json: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function getDependencyInfo(
  name: string,
  version: string,
): Promise<DependencyInfo> {
  const cleanVersion = version.replace(/^[\^~]/, "");

  try {
    const gzip = await getDependencySize(name, cleanVersion);
    const info: DependencyInfo = { name, version: cleanVersion, gzip };

    CACHE.set(`${name}@${cleanVersion}`, info);
    return info;
  } catch (error) {
    return {
      name,
      version: cleanVersion,
      error:
        error instanceof Error
          ? error.message
          : `Failed to fetch size for ${name}@${cleanVersion}`,
    };
  }
}

export async function getDependencies(): Promise<DependencyInfo[]> {
  const path = resolve(process.cwd(), "package.json");

  const packageJson = await readPackageJson(path);

  const dependencies = packageJson.dependencies ?? {};
  const entries = Object.entries(dependencies);

  const dependenciesWithSizes = await Promise.all(
    entries.map(([name, version]) =>
      getDependencyInfo(name, version as string),
    ),
  );

  dependenciesWithSizes.sort((a, b) => (b.gzip ?? 0) - (a.gzip ?? 0));

  return dependenciesWithSizes;
}
