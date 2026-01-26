import { PackageInfo } from "../types.js";
import { readdir, readFile, stat, unlink } from "fs/promises";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { join, resolve } from "path";
import { gzipSync } from "zlib";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import * as tar from "tar";

const CACHE = new Map<string, PackageInfo>();

/**
 * Parse .npmignore or .gitignore to get ignore patterns
 */
async function getIgnorePatterns(packagePath: string): Promise<Set<string>> {
  const patterns = new Set<string>([
    "node_modules",
    ".git",
    ".DS_Store",
    "*.log",
    "npm-debug.log*",
    ".npmrc",
  ]);

  for (const file of [".npmignore", ".gitignore"]) {
    try {
      const ignoreFile = join(packagePath, file);
      const fileStream = createReadStream(ignoreFile);
      const rl = createInterface({ input: fileStream });

      for await (const line of rl) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          patterns.add(trimmed);
        }
      }
      break;
    } catch {
      // File doesn't exist, continue
    }
  }

  return patterns;
}

/**
 * Get files that should be included based on package.json "files" field
 */
async function getPackageFiles(
  packagePath: string,
): Promise<Set<string> | null> {
  try {
    const pkgJson = JSON.parse(
      await readFile(join(packagePath, "package.json"), "utf-8"),
    );

    if (pkgJson.files && Array.isArray(pkgJson.files)) {
      return new Set(pkgJson.files);
    }
  } catch {
    // No package.json or no files field
  }
  return null;
}

/**
 * Simple pattern matching for ignore rules
 */
function shouldIgnore(relativePath: string, patterns: Set<string>): boolean {
  for (const pattern of patterns) {
    if (relativePath === pattern) return true;

    if (pattern.endsWith("/") && relativePath.startsWith(pattern)) return true;

    if (pattern.startsWith("*.") && relativePath.endsWith(pattern.slice(1)))
      return true;

    if (pattern.includes("*")) {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      if (regex.test(relativePath)) return true;
    }
  }
  return false;
}

/**
 * Check if a file should be included based on "files" whitelist
 */
function isIncluded(
  relativePath: string,
  filesSet: Set<string> | null,
): boolean {
  if (!filesSet) return true;

  const alwaysInclude = [
    "package.json",
    "readme.md",
    "readme",
    "license",
    "licence",
    "changelog.md",
  ];
  if (alwaysInclude.some((f) => relativePath.toLowerCase().startsWith(f))) {
    return true;
  }

  for (const pattern of filesSet) {
    const normalized = pattern.replace(/\\/g, "/");
    if (
      relativePath.startsWith(normalized + "/") ||
      relativePath === normalized
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get list of files to include in the package
 */
async function getFilesToInclude(packagePath: string): Promise<string[]> {
  const ignorePatterns = await getIgnorePatterns(packagePath);
  const filesWhitelist = await getPackageFiles(packagePath);
  const result: string[] = [];

  async function walk(dir: string, relative = "") {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const relPath = relative ? `${relative}/${entry.name}` : entry.name;
      const fullPath = join(dir, entry.name);

      if (shouldIgnore(relPath, ignorePatterns)) continue;

      if (entry.isDirectory()) {
        await walk(fullPath, relPath);
      } else if (entry.isFile()) {
        if (!isIncluded(relPath, filesWhitelist)) continue;
        result.push(relPath);
      }
    }
  }

  await walk(packagePath);
  return result;
}

/**
 * Calculate package sizes using real tar + gzip (matches npm pack exactly)
 */
async function calculatePackageSizes(
  packagePath: string,
): Promise<{ size: number; gzip: number; fileCount: number }> {
  const files = await getFilesToInclude(packagePath);

  files.sort();

  const tempTarPath = join(
    tmpdir(),
    `package-${randomBytes(8).toString("hex")}.tar`,
  );

  try {
    await tar.create(
      {
        cwd: packagePath,
        file: tempTarPath,
        portable: true,
        noMtime: true,
        gzip: false,
        prefix: "package/",
      },
      files,
    );

    const tarBuffer = await readFile(tempTarPath);

    const gzipped = gzipSync(tarBuffer);

    let totalSize = 0;
    for (const file of files) {
      const stats = await stat(join(packagePath, file));
      totalSize += stats.size;
    }

    return {
      size: totalSize,
      gzip: gzipped.length,
      fileCount: files.length,
    };
  } finally {
    try {
      await unlink(tempTarPath);
    } catch {
      // Ignore cleanup errors
    }
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
    const packagePath = resolve(process.cwd(), "node_modules", name);
    await stat(packagePath);

    const { size, gzip, fileCount } = await calculatePackageSizes(packagePath);

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
