#!/usr/bin/env node

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
  --json          Output results in JSON format
  --config <path> Specify a custom config file path
  --help          Show this help message

Examples:
  bundlesize
  bundlesize --init
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

  const jsonOutput = args.includes('--json');
  const configIndex = args.indexOf('--config');
  const configPath = configIndex !== -1 ? args[configIndex + 1] : undefined;

  try {
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
