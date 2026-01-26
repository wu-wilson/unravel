export type DependencyInfo = {
  name: string;
  version: string;
  gzip?: number;
  error?: string;
};

export type ImportInfo = {
  file: string;
  line: number;
  importStatement: string;
};

export type DependencyData = {
  dependency: DependencyInfo;
  imports: ImportInfo[];
};
