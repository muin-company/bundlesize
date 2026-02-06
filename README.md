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

## Advanced Examples

### Example 6: CI with Size Diff Comments

Automatically comment bundle size changes on PRs:

```yaml
# .github/workflows/bundle-size-pr.yml
name: Bundle Size PR Comment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  size-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout PR
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install and build PR
        run: |
          npm ci
          npm run build
      
      - name: Check PR bundle size
        run: npx bundlesize --json > pr-bundle.json
        continue-on-error: true
      
      - name: Checkout main branch
        run: |
          git fetch origin main
          git checkout origin/main
      
      - name: Install and build main
        run: |
          npm ci
          npm run build
      
      - name: Check main bundle size
        run: npx bundlesize --json > main-bundle.json
        continue-on-error: true
      
      - name: Compare and comment
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const prData = JSON.parse(fs.readFileSync('pr-bundle.json'));
            const mainData = JSON.parse(fs.readFileSync('main-bundle.json'));
            
            let comment = '## 📦 Bundle Size Report\n\n';
            comment += '| File | Main | PR | Diff | Status |\n';
            comment += '|------|------|-----|------|--------|\n';
            
            prData.files.forEach(prFile => {
              const mainFile = mainData.files.find(f => f.path === prFile.path);
              if (mainFile) {
                const diff = prFile.gzip - mainFile.gzip;
                const diffStr = diff > 0 ? `+${(diff/1024).toFixed(2)}KB` : `${(diff/1024).toFixed(2)}KB`;
                const status = prFile.pass ? '✅' : '❌';
                comment += `| ${prFile.path} | ${(mainFile.gzip/1024).toFixed(2)}KB | ${(prFile.gzip/1024).toFixed(2)}KB | ${diffStr} | ${status} |\n`;
              }
            });
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

**Example output:**

| File | Main | PR | Diff | Status |
|------|------|-----|------|--------|
| dist/main.js | 87.23KB | 92.45KB | +5.22KB | ❌ |
| dist/vendor.js | 156.78KB | 155.12KB | -1.66KB | ✅ |

### Example 7: Webpack Bundle Analyzer Integration

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Run on failure
npx bundlesize || npm run analyze
```

**webpack.config.js:**

```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  // ... your config
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json'
    })
  ]
};
```

**package.json:**

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "analyze": "ANALYZE=true webpack --mode production",
    "check:size": "bundlesize",
    "check:size:analyze": "bundlesize || npm run analyze"
  }
}
```

### Example 8: Multi-Environment Configs

```json
// .bundlesizerc.development.json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "500KB" }  // Relaxed for dev
  ]
}

// .bundlesizerc.production.json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "100KB" }  // Strict for prod
  ]
}

// .bundlesizerc.staging.json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "150KB" }  // Middle ground
  ]
}
```

**Usage:**

```bash
# Development
npm run build:dev
npx bundlesize --config .bundlesizerc.development.json

# Production
npm run build:prod
npx bundlesize --config .bundlesizerc.production.json
```

### Example 9: Gradual Size Reduction Plan

Track progress toward size goals:

```json
// Week 1 baseline
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "200KB", "note": "Baseline" }
  ]
}

// Week 5 goal
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "180KB", "note": "Goal: -10%" }
  ]
}

// Week 9 goal
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "160KB", "note": "Goal: -20%" }
  ]
}
```

**Automate tracking:**

```bash
#!/bin/bash
# scripts/track-bundle-size.sh

current_size=$(npx bundlesize --json | jq '.files[0].gzip')
goal_size=163840  # 160KB in bytes

echo "Current: $(($current_size / 1024))KB"
echo "Goal: $(($goal_size / 1024))KB"
echo "Progress: $(( 100 - (current_size * 100 / 200000) ))% reduction"

if [ $current_size -le $goal_size ]; then
  echo "🎉 Goal achieved!"
else
  echo "Keep going! $(( (current_size - goal_size) / 1024 ))KB to go"
fi
```

### Example 10: Code Splitting Enforcement

Force lazy loading for large routes:

```json
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "50KB", "note": "Initial bundle" },
    { "path": "dist/home.*.js", "maxSize": "30KB" },
    { "path": "dist/dashboard.*.js", "maxSize": "100KB" },
    { "path": "dist/admin.*.js", "maxSize": "150KB" },
    { "path": "dist/*.chunk.js", "maxSize": "100KB", "note": "Lazy-loaded chunks" }
  ]
}
```

**React example:**

```javascript
// Before: 200KB bundle
import AdminPanel from './AdminPanel';

// After: 50KB initial + 150KB lazy
const AdminPanel = React.lazy(() => import('./AdminPanel'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPanel />
    </Suspense>
  );
}
```

## Integration Guides

### Pre-commit Hook with Husky

```bash
# Install husky
npm install --save-dev husky

# Initialize
npx husky install

# Add pre-push hook (not pre-commit to avoid blocking commits)
npx husky add .husky/pre-push "npm run check:size"
```

**.husky/pre-push:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Build before checking size
echo "🏗️  Building..."
npm run build

# Check bundle size
echo "📦 Checking bundle size..."
npx bundlesize --strict

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Bundle size check failed!"
  echo "Run 'npm run analyze' to investigate"
  exit 1
fi

echo "✅ Bundle size OK"
```

### package.json Scripts (Comprehensive)

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "build:dev": "webpack --mode development",
    "build:analyze": "ANALYZE=true webpack --mode production",
    
    "check:size": "bundlesize",
    "check:size:strict": "bundlesize --strict",
    "check:size:watch": "bundlesize --watch",
    "check:size:json": "bundlesize --json > bundle-report.json",
    
    "postbuild": "bundlesize",
    "prerelease": "npm run build && bundlesize --strict",
    
    "analyze": "npm run build:analyze",
    "analyze:open": "npm run build:analyze && open bundle-stats.html",
    
    "ci:size": "npm run build && bundlesize --strict --json",
    "ci:size:report": "npm run ci:size > reports/bundle-$(date +%Y%m%d).json"
  }
}
```

### GitHub Actions (Complete Pipeline)

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check-size:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Needed for comparison
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build production bundle
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Check bundle size
        id: bundlesize
        run: |
          npx bundlesize --json > bundle-report.json
          echo "passed=$(jq -r '.pass' bundle-report.json)" >> $GITHUB_OUTPUT
        continue-on-error: true
      
      - name: Upload bundle report
        uses: actions/upload-artifact@v3
        with:
          name: bundle-report
          path: bundle-report.json
      
      - name: Fail if size exceeded
        if: steps.bundlesize.outputs.passed == 'false'
        run: |
          echo "❌ Bundle size limits exceeded"
          npx bundlesize
          exit 1
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('bundle-report.json'));
            
            let comment = '## 📊 Bundle Size Check\n\n';
            comment += '| File | Size (Gzip) | Limit | Status |\n';
            comment += '|------|-------------|-------|--------|\n';
            
            report.files.forEach(file => {
              const status = file.pass ? '✅' : '❌';
              const sizeKB = (file.gzip / 1024).toFixed(2);
              const limitKB = (file.limit / 1024).toFixed(2);
              comment += `| ${file.path} | ${sizeKB}KB | ${limitKB}KB | ${status} |\n`;
            });
            
            if (!report.pass) {
              comment += '\n⚠️  Some bundles exceeded size limits!\n';
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - analyze

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

bundle-size:
  stage: analyze
  image: node:18
  dependencies:
    - build
  script:
    - npx bundlesize --json > bundle-report.json
    - |
      if ! npx bundlesize --strict; then
        echo "Bundle size check failed"
        exit 1
      fi
  artifacts:
    reports:
      junit: bundle-report.json
    when: always
  only:
    refs:
      - merge_requests
      - main
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-and-check:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      
      - restore_cache:
          keys:
            - deps-{{ checksum "package-lock.json" }}
      
      - run:
          name: Install dependencies
          command: npm ci
      
      - save_cache:
          key: deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      
      - run:
          name: Build
          command: npm run build
      
      - run:
          name: Check bundle size
          command: npx bundlesize --strict
      
      - store_artifacts:
          path: dist/
          destination: bundle

workflows:
  build-check:
    jobs:
      - build-and-check
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Check bundle size before finalizing image
RUN npx bundlesize --strict || exit 1

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Image only built if bundle size check passed
```

### Vercel Integration

```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "github": {
    "silent": true
  }
}
```

**package.json:**

```json
{
  "scripts": {
    "build": "vite build && bundlesize --strict",
    "vercel-build": "npm run build"
  }
}
```

### Netlify Integration

```toml
# netlify.toml
[build]
  command = "npm run build && npx bundlesize --strict"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

## Troubleshooting

### Problem: "No files matched pattern"

**Symptom:**
```bash
Warning: No files matched pattern 'build/*.js'
✗ Check your configuration - some patterns matched no files
```

**Causes:**
1. Build hasn't run yet
2. Wrong output directory
3. Glob pattern doesn't match actual filenames

**Solutions:**

```bash
# 1. Ensure build runs first
npm run build
npx bundlesize

# 2. Check actual build output
ls -R dist/
ls -R build/

# 3. Update .bundlesizerc.json with correct paths
{
  "files": [
    { "path": "dist/**/*.js", "maxSize": "100KB" }  // Use ** for recursive
  ]
}

# 4. Test glob pattern
node -e "console.log(require('glob').sync('dist/**/*.js'))"
```

### Problem: Gzip Size Calculation Differs from Production

**Symptom:** bundlesize reports 87KB, but production shows 120KB.

**Causes:**
1. Different compression levels
2. Server gzip settings differ
3. Additional headers/metadata

**Solutions:**

```bash
# Check actual gzip size
gzip -c dist/main.js | wc -c

# Compare with bundlesize
npx bundlesize --json | jq '.files[0].gzip'

# Test production compression
curl -H "Accept-Encoding: gzip" https://example.com/main.js --output - | wc -c
```

**Fix in nginx:**

```nginx
# nginx.conf
gzip on;
gzip_comp_level 6;  # Match bundlesize default
gzip_types application/javascript;
```

### Problem: Hashed Filenames Not Matching

**Symptom:**
```bash
Warning: No files matched pattern 'dist/main.abc123.js'
```

**Cause:** Hash changes with each build.

**Solution:** Use wildcards:

```json
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "100KB" },  // ✅ Matches any hash
    { "path": "dist/vendor.*.js", "maxSize": "200KB" }
  ]
}
```

### Problem: Watch Mode Not Detecting Changes

**Symptom:** `bundlesize --watch` doesn't re-run after file changes.

**Causes:**
1. Watching wrong directory
2. Build tool clears directory before writing
3. IDE safe-write feature

**Solutions:**

```bash
# 1. Watch with build tool instead
npm run build -- --watch &
npx bundlesize --watch

# 2. Use nodemon
npm install --save-dev nodemon
npx nodemon --watch dist --exec "bundlesize"

# 3. Configure your build tool
# webpack.config.js
module.exports = {
  watch: true,
  watchOptions: {
    aggregateTimeout: 300
  }
};
```

### Problem: CI Passes Locally but Fails in Pipeline

**Symptoms:** 
- Local: `✅ All files passed`
- CI: `❌ Bundle size exceeded`

**Causes:**
1. Different Node.js versions
2. Different npm/dependency versions
3. Environment-specific code paths
4. Missing production optimizations

**Solutions:**

```bash
# 1. Match CI Node version locally
nvm use 18  # Or whatever CI uses

# 2. Use exact npm version
npm install -g npm@9.5.0

# 3. Clean install (like CI)
rm -rf node_modules package-lock.json
npm install

# 4. Build with production flag
NODE_ENV=production npm run build
npx bundlesize

# 5. Check for platform-specific builds
node -p "process.platform"  # Should match CI
```

### Problem: JSON Output is Empty or Malformed

**Symptom:**
```bash
$ npx bundlesize --json
{}
```

**Causes:**
1. No .bundlesizerc.json file
2. Stdout mixed with stderr
3. Build errors swallowed

**Solutions:**

```bash
# 1. Initialize config first
npx bundlesize --init

# 2. Separate stdout/stderr
npx bundlesize --json 2>/dev/null

# 3. Validate JSON
npx bundlesize --json | jq empty  # Exits 0 if valid

# 4. Debug mode
npx bundlesize --json --verbose 2>&1 | tee debug.log
```

### Problem: Size Limit in Wrong Units

**Symptom:** Expected 100KB limit, but using 100B.

**Solution:** Specify units explicitly:

```json
{
  "files": [
    { "path": "dist/*.js", "maxSize": "100KB" },  // ✅ Explicit
    { "path": "dist/*.css", "maxSize": 20000 }    // ❌ Ambiguous (bytes?)
  ]
}
```

**Supported units:** `B`, `KB`, `MB`, `GB`

### Problem: bundlesize Doesn't See Latest Build

**Symptom:** Changed code, rebuilt, but bundlesize shows old size.

**Causes:**
1. Build output cached
2. Checking wrong file
3. Build didn't actually run

**Solutions:**

```bash
# 1. Force clean build
rm -rf dist/
npm run build
npx bundlesize

# 2. Check file timestamps
ls -lt dist/

# 3. Add build to bundlesize command
npx run-s build bundlesize  # Sequential execution
```

**package.json:**

```json
{
  "scripts": {
    "check:size": "npm run build && bundlesize",
    "check:size:fresh": "rm -rf dist && npm run build && bundlesize"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

## Best Practices

### 1. Set Realistic Limits Based on Metrics

```bash
# Start with baseline measurement
npm run build
npx bundlesize --json > baseline.json

# Set limits 10% above current size (room for small growth)
current_size=$(jq -r '.files[0].gzip' baseline.json)
limit=$(echo "$current_size * 1.1" | bc)

cat > .bundlesizerc.json <<EOF
{
  "files": [
    { "path": "dist/*.js", "maxSize": "${limit}B" }
  ]
}
EOF
```

### 2. Track Bundle Size Over Time

```bash
# Automated daily tracking
# crontab:
0 0 * * * cd /path/to/project && npm run build && npx bundlesize --json >> logs/bundle-history.jsonl
```

**Analyze trends:**

```bash
# Growth over last 30 days
cat logs/bundle-history.jsonl | \
  jq -s 'map(.files[0].gzip) | min, max, add/length'
# Output: [min, max, average] in bytes
```

### 3. Different Limits for Different File Types

```json
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "100KB", "note": "Entry point" },
    { "path": "dist/vendor.*.js", "maxSize": "200KB", "note": "Third-party" },
    { "path": "dist/*.chunk.js", "maxSize": "50KB", "note": "Code-split chunks" },
    { "path": "dist/*.css", "maxSize": "20KB", "note": "Styles" },
    { "path": "dist/polyfills.*.js", "maxSize": "30KB", "note": "Legacy browser support" }
  ]
}
```

### 4. Combine with Performance Budgets

```json
// budget.json (for Lighthouse CI)
[
  {
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "stylesheet", "budget": 50 }
    ],
    "timings": [
      { "metric": "interactive", "budget": 3000 }
    ]
  }
]
```

```yaml
# CI: Run both bundlesize and Lighthouse
- run: npx bundlesize
- run: npx lhci autorun --budget-path=budget.json
```

### 5. Fail Fast in Development

```json
{
  "scripts": {
    "dev": "concurrently \"npm run watch\" \"npm run check:size:watch\"",
    "watch": "webpack --watch",
    "check:size:watch": "bundlesize --watch"
  }
}
```

Get instant feedback when adding large dependencies.

### 6. Document Why Limits Were Set

```json
{
  "files": [
    {
      "path": "dist/main.*.js",
      "maxSize": "100KB",
      "note": "Mobile 3G target: <5s load time @ 50KB/s = 250KB total, 100KB JS budget"
    },
    {
      "path": "dist/vendor.*.js",
      "maxSize": "200KB",
      "note": "Third-party libs: React (40KB) + Router (10KB) + others (150KB max)"
    }
  ]
}
```

### 7. Review Bundle Contents Regularly

```bash
# Weekly bundle analysis
npm run build
npx bundlesize
npx webpack-bundle-analyzer dist/stats.json

# Check for unexpected inclusions
npx source-map-explorer dist/*.js
```

### 8. Progressive Enhancement for Bundle Size

```javascript
// Load heavy features only when needed
if (window.innerWidth > 1024) {
  import('./desktop-features.js');
}

if ('IntersectionObserver' in window) {
  import('./modern-animations.js');
}
```

### 9. Automate Dependency Impact Analysis

```bash
# Before adding dependency
npm run build
npx bundlesize --json > before.json

# After
npm install some-heavy-library
npm run build
npx bundlesize --json > after.json

# Compare
node -e "
  const before = require('./before.json');
  const after = require('./after.json');
  const diff = after.files[0].gzip - before.files[0].gzip;
  console.log(\`Impact: +\${(diff/1024).toFixed(2)}KB\`);
  if (diff > 10000) {
    console.error('❌ Adds more than 10KB! Consider alternatives.');
    process.exit(1);
  }
"
```

### 10. Team Education & Documentation

```markdown
# Bundle Size Guidelines

## Our Limits
- Main bundle: 100KB (mobile-first target)
- Vendor bundle: 200KB (third-party dependencies)
- Route chunks: 50KB each (lazy-loaded features)

## Before Adding Dependencies
1. Check size: https://bundlephobia.com/package/[package-name]
2. Consider alternatives (e.g., date-fns vs moment.js)
3. Use tree-shaking (import only what you need)

## If Bundle Size Check Fails
1. Run `npm run analyze` to see what's large
2. Check for:
   - Accidentally imported dev dependencies
   - Large libraries included in multiple chunks
   - Missing tree-shaking (check your imports)
3. Ask #frontend-team for help

## Resources
- [Bundle Size Dashboard](https://dashboard.example.com/bundles)
- [Optimization Guide](https://docs.example.com/performance)
```

## Framework-Specific Examples

### React (Create React App)

```json
// .bundlesizerc.json
{
  "files": [
    {
      "path": "build/static/js/main.*.js",
      "maxSize": "150KB",
      "note": "CRA main bundle with React"
    },
    {
      "path": "build/static/js/*.chunk.js",
      "maxSize": "100KB",
      "note": "Code-split chunks"
    },
    {
      "path": "build/static/css/main.*.css",
      "maxSize": "20KB"
    }
  ]
}
```

**package.json:**

```json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "bundlesize",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

### React (Vite)

```json
{
  "files": [
    { "path": "dist/assets/index.*.js", "maxSize": "100KB" },
    { "path": "dist/assets/vendor.*.js", "maxSize": "150KB" },
    { "path": "dist/assets/*.css", "maxSize": "20KB" }
  ]
}
```

**vite.config.js:**

```javascript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: process.env.ANALYZE === 'true',
      filename: 'dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

### Next.js

```json
{
  "files": [
    { "path": ".next/static/chunks/pages/_app.*.js", "maxSize": "150KB" },
    { "path": ".next/static/chunks/pages/index.*.js", "maxSize": "50KB" },
    { "path": ".next/static/chunks/framework.*.js", "maxSize": "100KB" },
    { "path": ".next/static/css/*.css", "maxSize": "30KB" }
  ]
}
```

**next.config.js:**

```javascript
module.exports = {
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Run bundlesize after build
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('BundleSizeCheck', () => {
            require('child_process').execSync('bundlesize', {
              stdio: 'inherit'
            });
          });
        }
      });
    }
    return config;
  }
};
```

### Vue 3 (Vite)

```json
{
  "files": [
    { "path": "dist/assets/index.*.js", "maxSize": "80KB" },
    { "path": "dist/assets/vendor.*.js", "maxSize": "120KB" },
    { "path": "dist/assets/*.css", "maxSize": "15KB" }
  ]
}
```

### Angular

```json
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "200KB" },
    { "path": "dist/polyfills.*.js", "maxSize": "50KB" },
    { "path": "dist/runtime.*.js", "maxSize": "10KB" },
    { "path": "dist/vendor.*.js", "maxSize": "300KB" },
    { "path": "dist/styles.*.css", "maxSize": "30KB" }
  ]
}
```

**angular.json:**

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### Svelte (SvelteKit)

```json
{
  "files": [
    { "path": "build/_app/immutable/chunks/*.js", "maxSize": "50KB" },
    { "path": "build/_app/immutable/assets/*.css", "maxSize": "10KB" }
  ]
}
```

### Express + Webpack

```json
{
  "files": [
    { "path": "dist/server.js", "maxSize": "500KB", "note": "Server bundle" },
    { "path": "public/js/client.*.js", "maxSize": "100KB" }
  ]
}
```

## License

MIT
