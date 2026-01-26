import { useEffect, useState } from "react";
import { DependencyData } from "../types";
import { getDependencies } from "../utils/dependencies.js";
import { getImports } from "../utils/imports.js";

export function useDependencyData() {
  const [data, setData] = useState<DependencyData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data: DependencyData[] = [];

    const dependencies = await getDependencies();

    for (const dep of dependencies) {
      const imports = await getImports(dep.name);
      data.push({ dependency: dep, imports });
    }

    setData(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { data, loading };
}
