import { gzipSync } from 'zlib';
import { readFileSync } from 'fs';

const SIZE_UNITS: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

export function parseSize(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return value * SIZE_UNITS[unit];
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

export function getGzipSize(filePath: string): number {
  const content = readFileSync(filePath);
  const compressed = gzipSync(content);
  return compressed.length;
}

export function matchGlob(pattern: string, filePath: string): boolean {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}
