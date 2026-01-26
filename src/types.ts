export type PackageInfo = {
  name: string;
  version: string;
  size?: number;
  gzip?: number;
  loading: boolean;
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
