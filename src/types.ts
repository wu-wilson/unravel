export type PackageInfo = {
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
  package: PackageInfo;
  imports: ImportInfo[];
  dependencies: string[];
};

export type FileNode = {
  path: string;
  imports: string[];
};

export type CircularDependency = {
  cycle: string[];
};
