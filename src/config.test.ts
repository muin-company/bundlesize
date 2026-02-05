import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { loadConfig, initConfig } from './config';

const TEST_CONFIG_PATH = '.test-bundlesizerc.json';

describe('config', () => {
  afterEach(() => {
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
  });

  describe('initConfig', () => {
    it('should create a default config file', () => {
      initConfig(TEST_CONFIG_PATH);
      expect(existsSync(TEST_CONFIG_PATH)).toBe(true);
    });

    it('should throw if config already exists', () => {
      writeFileSync(TEST_CONFIG_PATH, '{}');
      expect(() => initConfig(TEST_CONFIG_PATH)).toThrow('already exists');
    });
  });

  describe('loadConfig', () => {
    it('should load a valid config file', () => {
      const config = {
        files: [{ path: 'dist/*.js', maxSize: '50KB' }],
      };
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify(config));
      
      const loaded = loadConfig(TEST_CONFIG_PATH);
      expect(loaded.files).toHaveLength(1);
      expect(loaded.files[0].maxSize).toBe('50KB');
    });

    it('should throw if config file does not exist', () => {
      expect(() => loadConfig('nonexistent.json')).toThrow('not found');
    });

    it('should throw if config is invalid', () => {
      writeFileSync(TEST_CONFIG_PATH, '{"files": "invalid"}');
      expect(() => loadConfig(TEST_CONFIG_PATH)).toThrow('must be an array');
    });
  });
});
