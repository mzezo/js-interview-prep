# Deployment Plan — JS Interview Prep Guide

This document covers everything needed to take the guide from local files to a live, CI-checked GitHub Pages site.

---

## 1. Repository Setup

### 1.1 Create the repository

```bash
# Locally
git init js-interview-prep
cd js-interview-prep

# On GitHub: create a public (or private) repo named `js-interview-prep`
git remote add origin git@github.com:<your-handle>/js-interview-prep.git
```

### 1.2 Branching model (lightweight, suitable for a content/docs repo)

| Branch | Purpose | Protection |
|---|---|---|
| `main` | Deployed to GitHub Pages. Always green. | Required PR review, status checks must pass |
| `feature/*` | New chapters, edits, scaffolding work | None |
| `fix/*` | Typos, broken links, code-snippet fixes | None |

For a solo project, you can skip protection rules and merge into `main` directly — but having the workflow set up means the team-of-many version Just Works later. Configure protections in **Settings → Branches → Branch protection rules**.

### 1.3 Essential files

```
js-interview-prep/
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint + test on PR
│       └── deploy.yml          # build + deploy on main push
├── docs/                       # the guide content
│   ├── README.md               # main entry point
│   └── chapters/               # split chapters (optional)
├── app/                        # Next.js scaffold (optional, see section 3)
├── .editorconfig
├── .gitignore
├── .nvmrc                      # pin Node version for CI parity
├── .prettierrc
├── .eslintrc.json
├── LICENSE                     # MIT recommended for educational content
├── README.md                   # repo-level intro, links to docs/README.md
└── package.json
```

### 1.4 `.gitignore` essentials

```
node_modules/
.next/
out/
dist/
.DS_Store
*.log
.env*
!.env.example
.vercel/
```

### 1.5 `.nvmrc`

```
20
```

Pinning Node 20 (LTS) ensures CI and local environments match.

---

## 2. GitHub Pages Deployment

You have two reasonable paths. Pick one based on whether you want plain Markdown rendering or the interactive Next.js scaffold.

### Path A — Pure Markdown (simplest)

GitHub Pages can render Markdown directly with Jekyll (default) or with no build step at all.

**Steps:**

1. **Settings → Pages → Build and deployment → Source:** "Deploy from a branch."
2. **Branch:** `main`, **folder:** `/docs`.
3. Save. Site is live at `https://<your-handle>.github.io/js-interview-prep/` within ~1 minute.

**Add a `docs/_config.yml`** for a clean theme:

```yaml
theme: jekyll-theme-cayman
title: JavaScript Interview Prep
description: A practical study guide for mid-level engineers.
```

**Pros:** Zero build, instant. Markdown renders as Markdown — collapsible `<details>` sections work natively.
**Cons:** Limited interactivity (no React-driven quizzes, no client-side search).

### Path B — Next.js → Static export → GitHub Actions

For the interactive site (chapter navigation, search, code highlighting, dark mode), use the Next.js scaffold and deploy via Actions.

#### 2.1 Workflow file: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: # allow manual runs

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build (static export)
        run: npm run build
        env:
          # Required when serving from a subpath like /js-interview-prep
          NEXT_PUBLIC_BASE_PATH: /js-interview-prep

      - uses: actions/upload-pages-artifact@v3
        with:
          path: app/out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

#### 2.2 Configure GitHub Pages for Actions

**Settings → Pages → Source:** "GitHub Actions." That's it — the workflow above takes over.

#### 2.3 `next.config.mjs` for static export

```js
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default {
  output: 'export',          // generates static HTML in /out
  basePath: isProd ? basePath : '',
  assetPrefix: isProd ? basePath : '',
  images: { unoptimized: true }, // GH Pages can't run the image optimizer
  trailingSlash: true,           // works better with Pages routing
};
```

> **Watch out:** Without `basePath`, asset URLs assume the site lives at `/`, but GitHub Pages serves from `/<repo-name>/`. Links break silently.

---

## 3. CI Checks (Lint + Test)

A separate workflow runs on every PR — keeps `main` deployable.

### 3.1 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm test -- --run

      - name: Build (smoke test)
        run: npm run build

  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Markdown link check
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          folder-path: 'docs'
          config-file: '.github/markdown-link-check-config.json'
```

### 3.2 Verify locally (parity with CI)

Add to `app/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest --run",
    "format": "prettier --write .",
    "ci": "npm run lint && npm run typecheck && npm run test:ci && npm run build"
  }
}
```

Run the equivalent of CI in one command:

```bash
cd app
npm run ci
```

If `npm run ci` is green locally, your PR will be green.

### 3.3 Pre-commit hook (optional but recommended)

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit`:

```bash
cd app && npx lint-staged
```

`app/package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json,yml}": ["prettier --write"]
  }
}
```

This catches lint/format issues at commit time — much faster feedback than CI.

---

## 4. Branch Protection Setup (recommended for teams)

**Settings → Branches → Add rule** for `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass: `quality`, `links`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings (even for admins, in regulated contexts)

---

## 5. Verifying the Deployment

After your first push to `main`:

1. **Actions tab** → watch the `Deploy to GitHub Pages` workflow.
2. Once green, visit `https://<your-handle>.github.io/js-interview-prep/`.
3. **Test the deploy manually:** open in incognito, check on mobile, verify all chapter links work, verify code blocks render with syntax highlighting.

**Common first-deploy issues:**

- 404 on assets → `basePath` not configured correctly.
- Blank page in production but works locally → check browser console; usually a hardcoded `/` path.
- "GitHub Pages is currently disabled" → flip Source to GitHub Actions in Settings.

---

## 6. Maintenance Checklist

| Cadence | Task |
|---|---|
| Per PR | CI green, link check green, preview locally |
| Weekly | Review open issues, triage user-submitted typos |
| Monthly | `npm outdated` + dependency bumps via Dependabot |
| Quarterly | Re-read for stale content (React API changes, new ES features) |

Enable Dependabot in **Settings → Code security and analysis** for automated dependency updates.
