import { PackageInfo } from "../types.js";
import { readdir, readFile, stat } from "fs/promises";
import { join, resolve } from "path";
import { gzipSync } from "zlib";

const CACHE = new Map<string, PackageInfo>();

async function calculatePackageSizes(
  packagePath: string,
): Promise<{ size: number; gzip: number }> {
  let totalSize = 0;
  let totalGzipped = 0;

  async function processDirectory(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== "node_modules") {
          await processDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        try {
          const stats = await stat(fullPath);
          totalSize += stats.size;

          const content = await readFile(fullPath);
          const gzipped = gzipSync(content);
          totalGzipped += gzipped.length;
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }

  await processDirectory(packagePath);
  return { size: totalSize, gzip: totalGzipped };
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
    const packagePath = resolve(process.cwd(), "node_modules", name);

    await stat(packagePath);

    const { size, gzip } = await calculatePackageSizes(packagePath);

    const info: PackageInfo = {
      name,
      version,
      size,
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
      error: "Package not installed",
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
