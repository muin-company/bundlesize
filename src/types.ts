export interface FileConfig {
  path: string;
  maxSize: string;
}

export interface Config {
  files: FileConfig[];
}

export interface FileResult {
  path: string;
  size: number;
  gzipSize: number;
  maxSize: number;
  status: 'pass' | 'fail';
}

export interface CheckResult {
  files: FileResult[];
  passed: boolean;
}
