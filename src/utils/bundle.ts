import { PackageInfo } from "../types.js";
import { stat, mkdtemp, rm } from "fs/promises";
import { resolve } from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const CACHE = new Map<string, PackageInfo>();

async function getGzipSize(packageName: string, version: string) {
  const tmp = await mkdtemp(resolve(tmpdir(), "unravel-"));

  try {
    const { stdout } = await execFileAsync(
      "npm",
      ["pack", `${packageName}@${version}`, "--silent", "--ignore-scripts"],
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

export async function getPackageSize(
  name: string,
  version: string,
): Promise<PackageInfo> {
  const key = `${name}@${version}`;

  if (CACHE.has(key)) {
    return CACHE.get(key)!;
  }

  try {
    const gzip = await getGzipSize(name, version);

    const info: PackageInfo = {
      name,
      version,
      gzip,
      loading: false,
    };

    CACHE.set(key, info);
    return info;
  } catch (error) {
    const info: PackageInfo = {
      name,
      version,
      loading: false,
      error: error instanceof Error ? error.message : "Failed to fetch package",
    };

    CACHE.set(key, info);
    return info;
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
