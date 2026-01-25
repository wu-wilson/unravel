import { PackageInfo } from "../types.js";

const CACHE = new Map<string, PackageInfo>();

export async function getPackageSize(
  name: string,
  version: string
): Promise<PackageInfo> {
  const key = `${name}@${version}`;

  if (CACHE.has(key)) {
    return CACHE.get(key)!;
  }

  try {
    const url = `https://bundlephobia.com/api/size?package=${name}@${version}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const info: PackageInfo = {
      name,
      version,
      size: data.size,
      gzip: data.gzip,
      loading: false,
    };

    CACHE.set(key, info);
    return info;
  } catch (error) {
    const info: PackageInfo = {
      name,
      version,
      loading: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    CACHE.set(key, info);
    return info;
  }
}
