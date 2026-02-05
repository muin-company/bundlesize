import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Config } from './types';

const DEFAULT_CONFIG_PATH = '.bundlesizerc.json';

const DEFAULT_CONFIG: Config = {
  files: [
    { path: 'dist/*.js', maxSize: '100KB' },
    { path: 'dist/*.css', maxSize: '20KB' },
  ],
};

export function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): Config {
  const fullPath = resolve(process.cwd(), configPath);
  
  if (!existsSync(fullPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const content = readFileSync(fullPath, 'utf-8');
  const config = JSON.parse(content) as Config;

  if (!config.files || !Array.isArray(config.files)) {
    throw new Error('Invalid config: "files" must be an array');
  }

  return config;
}

export function initConfig(configPath: string = DEFAULT_CONFIG_PATH): void {
  const fullPath = resolve(process.cwd(), configPath);
  
  if (existsSync(fullPath)) {
    throw new Error(`Config file already exists: ${configPath}`);
  }

  const content = JSON.stringify(DEFAULT_CONFIG, null, 2);
  writeFileSync(fullPath, content, 'utf-8');
  console.log(`Created config file: ${configPath}`);
}
