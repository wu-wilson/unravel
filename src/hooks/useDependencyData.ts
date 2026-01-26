import { useState, useEffect } from "react";
import { DependencyData } from "../types.js";
import { getPackages } from "../utils/packages.js";
import { getPackageSize } from "../utils/bundle.js";
import { scanImports } from "../utils/scanner.js";

export function useDependencyData() {
  const [data, setData] = useState<DependencyData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const deps = await getPackages();
    const entries = Object.entries(deps);

    const initial: DependencyData[] = entries.map(([name, version]) => ({
      package: {
        name,
        version: version.replace(/^[\^~]/, ""),
        loading: true,
      },
      imports: [],
      dependencies: [],
    }));

    setData(initial);

    await Promise.all(
      entries.map(async ([name, version], i) => {
        const cleanVersion = version.replace(/^[\^~]/, "");

        const [packageInfo, imports] = await Promise.all([
          getPackageSize(name, cleanVersion),
          scanImports(name),
        ]);

        setData((prev) => {
          const next = [...prev];
          next[i] = {
            ...next[i],
            package: packageInfo,
            imports,
          };
          return next;
        });
      }),
    );

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { data, loading };
}
