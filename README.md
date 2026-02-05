# bundlesize

Track and enforce bundle size limits. Keep your builds lean.

[![npm version](https://img.shields.io/npm/v/@muin/bundlesize.svg)](https://www.npmjs.com/package/@muin/bundlesize)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Why?

Your users don't want to download megabytes of JavaScript just to view a simple page. This tool helps you catch bundle bloat before it reaches production.

## Install

```bash
npm install --save-dev @muin/bundlesize
```

## Quick Start

1. Initialize a config file:

```bash
npx bundlesize --init
```

2. Edit `.bundlesizerc.json` to set your limits:

```json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "100KB" },
    { "path": "dist/*.css", "maxSize": "20KB" }
  ]
}
```

3. Run the check:

```bash
npx bundlesize
```

## Usage

### Basic check

```bash
npx bundlesize
```

### JSON output

```bash
npx bundlesize --json
```

### Custom config path

```bash
npx bundlesize --config custom-config.json
```

## Configuration

The `.bundlesizerc.json` file accepts an array of file patterns with size limits:

```json
{
  "files": [
    {
      "path": "dist/main.*.js",
      "maxSize": "150KB"
    },
    {
      "path": "dist/vendor.*.js",
      "maxSize": "200KB"
    },
    {
      "path": "dist/*.css",
      "maxSize": "50KB"
    }
  ]
}
```

Supported size units: `B`, `KB`, `MB`, `GB`

## CI Integration

### GitHub Actions

```yaml
name: Bundle Size Check

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npx bundlesize
```

### GitLab CI

```yaml
bundle-size:
  script:
    - npm ci
    - npm run build
    - npx bundlesize
```

### CircleCI

```yaml
- run:
    name: Check bundle size
    command: |
      npm ci
      npm run build
      npx bundlesize
```

## Exit Codes

- `0` - All files passed size checks
- `1` - One or more files exceeded limits or an error occurred

## Before/After

**Before:**

```
Build completed. Outputs created in dist/
```

No idea if your bundle just doubled in size.

**After:**

```
Bundle Size Check Results:

File                                     Raw          Gzip         Limit        Status
---------------------------------------- ------------ ------------ ------------ ------
dist/main.abc123.js                      245.67KB     89.34KB      100KB        ✗ FAIL
dist/vendor.def456.js                    189.23KB     65.12KB      200KB        ✓ PASS
dist/styles.789ghi.css                   18.45KB      7.23KB       20KB         ✓ PASS

✗ Some files exceeded size limits
```

Instant feedback when something goes wrong.

## How It Works

1. Scans your build output directory for matching files
2. Calculates both raw and gzip sizes
3. Compares gzip size against your configured limits
4. Reports results and exits with appropriate code

## License

MIT
