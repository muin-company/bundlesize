import { describe, it, expect } from 'vitest';
import { parseSize, formatSize, matchGlob } from './utils';

describe('parseSize', () => {
  it('should parse bytes correctly', () => {
    expect(parseSize('100B')).toBe(100);
    expect(parseSize('1B')).toBe(1);
  });

  it('should parse kilobytes correctly', () => {
    expect(parseSize('1KB')).toBe(1024);
    expect(parseSize('10KB')).toBe(10240);
  });

  it('should parse megabytes correctly', () => {
    expect(parseSize('1MB')).toBe(1024 * 1024);
    expect(parseSize('2.5MB')).toBe(2.5 * 1024 * 1024);
  });

  it('should throw on invalid format', () => {
    expect(() => parseSize('invalid')).toThrow('Invalid size format');
    expect(() => parseSize('100')).toThrow('Invalid size format');
  });
});

describe('formatSize', () => {
  it('should format bytes', () => {
    expect(formatSize(100)).toBe('100B');
    expect(formatSize(500)).toBe('500B');
  });

  it('should format kilobytes', () => {
    expect(formatSize(1024)).toBe('1.00KB');
    expect(formatSize(2048)).toBe('2.00KB');
  });

  it('should format megabytes', () => {
    expect(formatSize(1024 * 1024)).toBe('1.00MB');
    expect(formatSize(2.5 * 1024 * 1024)).toBe('2.50MB');
  });
});

describe('matchGlob', () => {
  it('should match exact paths', () => {
    expect(matchGlob('dist/app.js', 'dist/app.js')).toBe(true);
    expect(matchGlob('dist/app.js', 'dist/main.js')).toBe(false);
  });

  it('should match wildcards', () => {
    expect(matchGlob('dist/*.js', 'dist/app.js')).toBe(true);
    expect(matchGlob('dist/*.js', 'dist/main.js')).toBe(true);
    expect(matchGlob('dist/*.js', 'dist/style.css')).toBe(false);
  });

  it('should match multiple wildcards', () => {
    expect(matchGlob('dist/*/*.js', 'dist/assets/app.js')).toBe(true);
    expect(matchGlob('dist/*/*.js', 'dist/app.js')).toBe(false);
  });
});
