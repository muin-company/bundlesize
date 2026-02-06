#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, initConfig } from './config';
import { checkFiles } from './core';
import { formatSize } from './utils';

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
bundlesize - Track and enforce bundle size limits

Usage:
  bundlesize [options]

Options:
  --init          Create a default .bundlesizerc.json config file
  --watch         Watch for file changes and re-check automatically
  --json          Output results in JSON format
  --config <path> Specify a custom config file path
  --help          Show this help message

Examples:
  bundlesize
  bundlesize --init
  bundlesize --watch
  bundlesize --json
  bundlesize --config custom-config.json
`);
}

function printTable(results: ReturnType<typeof checkFiles>) {
  console.log('\nBundle Size Check Results:\n');
  
  console.log('File'.padEnd(40), 'Raw'.padEnd(12), 'Gzip'.padEnd(12), 'Limit'.padEnd(12), 'Status');
  console.log('-'.repeat(40), '-'.repeat(11), '-'.repeat(11), '-'.repeat(11), '-'.repeat(6));

  for (const file of results.files) {
    const status = file.status === 'pass' ? '✓ PASS' : '✗ FAIL';
    const statusColor = file.status === 'pass' ? '\x1b[32m' : '\x1b[31m';
    const resetColor = '\x1b[0m';
    
    console.log(
      file.path.padEnd(40),
      formatSize(file.size).padEnd(12),
      formatSize(file.gzipSize).padEnd(12),
      formatSize(file.maxSize).padEnd(12),
      `${statusColor}${status}${resetColor}`
    );
  }

  console.log();
  
  if (results.passed) {
    console.log('\x1b[32m✓ All files passed size checks\x1b[0m');
  } else {
    console.log('\x1b[31m✗ Some files exceeded size limits\x1b[0m');
  }
}

function watchFiles(configPath: string | undefined, jsonOutput: boolean) {
  const config = loadConfig(configPath);
  
  // Get all file paths to watch
  const filesToWatch = config.files.map(f => path.resolve(f.path));
  
  console.log('\x1b[36m👀 Watching for changes...\x1b[0m\n');
  console.log('Files being watched:');
  filesToWatch.forEach(file => console.log(`  - ${file}`));
  console.log('\nPress Ctrl+C to stop\n');

  // Initial check
  let lastResults = checkFiles(config);
  if (!jsonOutput) {
    printTable(lastResults);
  } else {
    console.log(JSON.stringify(lastResults, null, 2));
  }

  // Track last modified times to debounce
  const lastModified = new Map<string, number>();
  filesToWatch.forEach(file => {
    try {
      const stats = fs.statSync(file);
      lastModified.set(file, stats.mtimeMs);
    } catch {
      lastModified.set(file, 0);
    }
  });

  // Watch each file
  const watchers = filesToWatch.map(file => {
    return fs.watch(file, (eventType) => {
      if (eventType !== 'change') return;

      try {
        const stats = fs.statSync(file);
        const last = lastModified.get(file) || 0;
        
        // Debounce: ignore if modified within last 100ms
        if (stats.mtimeMs - last < 100) return;
        
        lastModified.set(file, stats.mtimeMs);

        // Re-check sizes
        console.log(`\n\x1b[33m📝 Change detected: ${path.basename(file)}\x1b[0m`);
        console.log(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m\n`);
        
        const newResults = checkFiles(config);
        
        if (!jsonOutput) {
          printTable(newResults);
        } else {
          console.log(JSON.stringify(newResults, null, 2));
        }

        // Show size diff
        const oldFile = lastResults.files.find(f => f.path === file);
        const newFile = newResults.files.find(f => f.path === file);
        
        if (oldFile && newFile) {
          const rawDiff = newFile.size - oldFile.size;
          const gzipDiff = newFile.gzipSize - oldFile.gzipSize;
          
          if (rawDiff !== 0 || gzipDiff !== 0) {
            console.log('\n📊 Size Changes:');
            if (rawDiff !== 0) {
              const sign = rawDiff > 0 ? '+' : '';
              const color = rawDiff > 0 ? '\x1b[31m' : '\x1b[32m';
              console.log(`  Raw:  ${color}${sign}${formatSize(rawDiff)}\x1b[0m`);
            }
            if (gzipDiff !== 0) {
              const sign = gzipDiff > 0 ? '+' : '';
              const color = gzipDiff > 0 ? '\x1b[31m' : '\x1b[32m';
              console.log(`  Gzip: ${color}${sign}${formatSize(gzipDiff)}\x1b[0m`);
            }
          }
        }

        lastResults = newResults;
        console.log('\n\x1b[36m👀 Watching for changes...\x1b[0m\n');
      } catch (err) {
        console.error(`Error checking ${file}: ${err}`);
      }
    });
  });

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n\n\x1b[36m👋 Stopping watch mode...\x1b[0m\n');
    watchers.forEach(watcher => watcher.close());
    process.exit(0);
  });
}

function main() {
  if (args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--init')) {
    try {
      initConfig();
      process.exit(0);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  }

  const watchMode = args.includes('--watch');
  const jsonOutput = args.includes('--json');
  const configIndex = args.indexOf('--config');
  const configPath = configIndex !== -1 ? args[configIndex + 1] : undefined;

  try {
    if (watchMode) {
      watchFiles(configPath, jsonOutput);
      // Keep process running
      return;
    }

    const config = loadConfig(configPath);
    const results = checkFiles(config);

    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printTable(results);
    }

    process.exit(results.passed ? 0 : 1);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

main();
