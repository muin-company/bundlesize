import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { Config, FileResult, CheckResult } from './types';
import { parseSize, getGzipSize, matchGlob } from './utils';

function findFiles(basePath: string, pattern: string): string[] {
  const results: string[] = [];
  
  function scan(dir: string) {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (stat.isFile()) {
          const relativePath = relative(process.cwd(), fullPath);
          if (matchGlob(pattern, relativePath)) {
            results.push(fullPath);
          }
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  scan(basePath);
  return results;
}

export function checkFiles(config: Config): CheckResult {
  const results: FileResult[] = [];
  let allPassed = true;

  for (const fileConfig of config.files) {
    const maxSize = parseSize(fileConfig.maxSize);
    const files = findFiles(process.cwd(), fileConfig.path);

    if (files.length === 0) {
      console.warn(`Warning: No files found for pattern "${fileConfig.path}"`);
      continue;
    }

    for (const filePath of files) {
      const stat = statSync(filePath);
      const size = stat.size;
      const gzipSize = getGzipSize(filePath);
      const status = gzipSize <= maxSize ? 'pass' : 'fail';

      if (status === 'fail') {
        allPassed = false;
      }

      results.push({
        path: relative(process.cwd(), filePath),
        size,
        gzipSize,
        maxSize,
        status,
      });
    }
  }

  return {
    files: results,
    passed: allPassed,
  };
}
