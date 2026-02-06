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

### Watch mode (development)

Monitor bundle sizes during development:

```bash
npx bundlesize --watch
```

**What it does:**
- Automatically re-checks bundle sizes when files change
- Shows size differences (±KB) after each change
- Perfect for optimizing bundles in real-time
- Press Ctrl+C to stop

**Example output:**
```bash
👀 Watching for changes...

Files being watched:
  - /path/to/dist/main.js
  - /path/to/dist/vendor.js

Press Ctrl+C to stop

Bundle Size Check Results:
...

📝 Change detected: main.js
10:45:32 AM

Bundle Size Check Results:
...

📊 Size Changes:
  Raw:  +2.34KB
  Gzip: +890B

👀 Watching for changes...
```

## Examples

### Example 1: All bundles passing

```bash
$ npx bundlesize

Bundle Size Check Results:

File                                     Raw          Gzip         Limit        Status
---------------------------------------- ------------ ------------ ------------ ------
dist/main.a1b2c3.js                      87.23KB      34.56KB      100KB        ✓ PASS
dist/vendor.d4e5f6.js                    156.78KB     52.34KB      200KB        ✓ PASS
dist/app.css                             12.45KB      4.23KB       20KB         ✓ PASS

✓ All files passed size checks
```

Exit code: 0

### Example 2: Bundle size violation

```bash
$ npx bundlesize

Bundle Size Check Results:

File                                     Raw          Gzip         Limit        Status
---------------------------------------- ------------ ------------ ------------ ------
dist/main.abc123.js                      245.67KB     105.34KB     100KB        ✗ FAIL (+5.34KB)
dist/vendor.def456.js                    189.23KB     65.12KB      200KB        ✓ PASS
dist/styles.css                          18.45KB      7.23KB       20KB         ✓ PASS

✗ 1 file(s) exceeded size limits
```

Exit code: 1 (fails CI pipeline)

### Example 3: JSON output for CI integration

```bash
$ npx bundlesize --json

{
  "pass": false,
  "files": [
    {
      "path": "dist/main.abc123.js",
      "size": 251566,
      "gzip": 107867,
      "limit": 102400,
      "pass": false,
      "overBy": 5467
    },
    {
      "path": "dist/vendor.def456.js",
      "size": 193772,
      "gzip": 66683,
      "limit": 204800,
      "pass": true
    }
  ]
}
```

Useful for custom CI reports or Slack notifications.

### Example 4: No matching files

```bash
$ npx bundlesize

Bundle Size Check Results:

Warning: No files matched pattern 'build/*.js'

File                                     Raw          Gzip         Limit        Status
---------------------------------------- ------------ ------------ ------------ ------
(no files found)

✗ Check your configuration - some patterns matched no files
```

Catches misconfigured paths or build failures early.

### Example 5: First-time setup

```bash
$ npx bundlesize --init

✓ Created .bundlesizerc.json

Default configuration created. Edit the file to set your size limits:
{
  "files": [
    { "path": "dist/**/*.js", "maxSize": "100KB" },
    { "path": "dist/**/*.css", "maxSize": "20KB" }
  ]
}

Run 'npx bundlesize' to check your bundles.
```

Perfect for adding bundle size checks to existing projects.

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

## Real-World Examples

### 1. Progressive Bundle Limits

Set increasingly strict limits as code matures:

```json
{
  "files": [
    {
      "path": "dist/main.*.js",
      "maxSize": "150KB",
      "compression": "gzip"
    },
    {
      "path": "dist/vendor.*.js",
      "maxSize": "200KB",
      "note": "TODO: reduce to 150KB by Q2"
    }
  ]
}
```

Update limits gradually:

```bash
# Month 1: baseline
"maxSize": "200KB"

# Month 2: -10%
"maxSize": "180KB"

# Month 3: -20%
"maxSize": "160KB"
```

### 2. Per-Environment Configs

Different limits for different builds:

```json
// .bundlesizerc.production.json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "100KB" }
  ]
}

// .bundlesizerc.development.json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "500KB" }
  ]
}
```

```bash
# In CI
npx bundlesize --config .bundlesizerc.production.json

# Locally
npx bundlesize --config .bundlesizerc.development.json
```

### 3. Size Trend Tracking

Track bundle size over time:

```bash
# Generate daily reports
npx bundlesize --json > reports/bundle-$(date +%Y%m%d).json

# Compare with last week
current=$(npx bundlesize --json | jq '.files[0].size')
baseline=$(cat reports/bundle-$(date -d '7 days ago' +%Y%m%d).json | jq '.files[0].size')
diff=$((current - baseline))
echo "Size change: ${diff}KB"
```

GitHub Action to track trends:

```yaml
name: Bundle Size Trend

on: [push]

jobs:
  track:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: npm ci && npm run build
      
      - name: Check bundle size
        run: npx bundlesize --json > bundle-report.json
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: bundle-size-${{ github.sha }}
          path: bundle-report.json
      
      - name: Comment on PR with diff
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('bundle-report.json'));
            const summary = report.files.map(f => 
              `${f.path}: ${f.size} (limit: ${f.maxSize})`
            ).join('\n');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `### Bundle Size Report\n\`\`\`\n${summary}\n\`\`\``
            });
```

### 4. Split Bundles by Route

For SPA applications:

```json
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "50KB" },
    { "path": "dist/home.*.js", "maxSize": "30KB" },
    { "path": "dist/dashboard.*.js", "maxSize": "100KB" },
    { "path": "dist/admin.*.js", "maxSize": "150KB" },
    { "path": "dist/vendor.*.js", "maxSize": "200KB" }
  ]
}
```

Ensure critical routes stay fast.

### 5. Automatic Code Splitting Enforcement

Fail build if any single chunk is too large:

```json
{
  "files": [
    {
      "path": "dist/*.js",
      "maxSize": "100KB",
      "note": "No single chunk should exceed 100KB - use code splitting!"
    }
  ]
}
```

Force developers to split large features:

```javascript
// Before: 150KB bundle
import HeavyComponent from './HeavyComponent';

// After: lazy load, ~10KB initial
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### 6. Third-Party Dependency Budgets

Track vendor bundle separately:

```json
{
  "files": [
    { "path": "dist/app.*.js", "maxSize": "100KB" },
    { "path": "dist/vendor.*.js", "maxSize": "150KB" }
  ]
}
```

Alert when adding heavy dependencies:

```bash
# Before adding new dependency
npx bundlesize --json > before.json

# After npm install new-heavy-library
npm run build
npx bundlesize --json > after.json

# Calculate diff
node -e "
const before = require('./before.json');
const after = require('./after.json');
const diff = after.files[1].size - before.files[1].size;
if (diff > 10000) {
  console.error(\`Vendor bundle increased by \${diff}KB!\`);
  process.exit(1);
}
"
```

### 7. Integration with Webpack Bundle Analyzer

Combine bundlesize with analysis:

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "analyze": "webpack --mode production --analyze",
    "check:size": "bundlesize",
    "check:size:analyze": "npm run analyze && bundlesize"
  }
}
```

If bundlesize fails, run analyzer:

```bash
npx bundlesize || npm run analyze
```

### 8. Slack/Discord Notifications on Failures

Alert team when bundle size increases:

```yaml
# .github/workflows/bundle-alert.yml
name: Bundle Size Alert

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      
      - name: Check bundle size
        id: bundlesize
        run: |
          npx bundlesize --json > report.json
          echo "passed=$(jq -r '.passed' report.json)" >> $GITHUB_OUTPUT
      
      - name: Notify on Slack
        if: steps.bundlesize.outputs.passed == 'false'
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
          -H 'Content-Type: application/json' \
          -d '{
            "text": "⚠️ Bundle size limit exceeded in PR #${{ github.event.pull_request.number }}",
            "blocks": [{
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*Bundle Size Alert* 🚨\nPR: <${{ github.event.pull_request.html_url }}|#${{ github.event.pull_request.number }}>\nAuthor: @${{ github.event.pull_request.user.login }}"
              }
            }]
          }'
```

### 9. Performance Budget Dashboard

Visualize bundle size history:

```javascript
// scripts/bundle-dashboard.js
const fs = require('fs');
const reports = fs.readdirSync('reports/')
  .filter(f => f.startsWith('bundle-'))
  .map(f => JSON.parse(fs.readFileSync(`reports/${f}`)));

const chart = reports.map((r, i) => ({
  date: r.timestamp,
  size: r.files[0].size,
  limit: r.files[0].maxSize
}));

// Generate HTML chart with Chart.js
const html = `<!DOCTYPE html>
<html>
<head><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>
<body>
  <canvas id="chart"></canvas>
  <script>
    new Chart(document.getElementById('chart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(chart.map(c => c.date))},
        datasets: [{
          label: 'Bundle Size',
          data: ${JSON.stringify(chart.map(c => c.size))},
          borderColor: 'rgb(75, 192, 192)'
        }, {
          label: 'Limit',
          data: ${JSON.stringify(chart.map(c => c.limit))},
          borderColor: 'rgb(255, 99, 132)'
        }]
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync('bundle-dashboard.html', html);
```

## License

MIT
