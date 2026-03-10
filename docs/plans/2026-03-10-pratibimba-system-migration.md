# Pratibimba System Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Copy the runnable `bimba-mcp` project, the Electron application, and the `EpiLogos-Dev.app` launcher bundle from the legacy Pratibimba repo into this repo's `Idea/Pratibimba/System/` tree, while making the new copy repo-local and independently runnable without bringing over legacy tests or installed dependencies.

**Architecture:** Treat this as a selective source migration, not a raw directory mirror. Copy only runnable source files into `Idea/Pratibimba/System/bimba-mcp/` and `Idea/Pratibimba/System/epi-app/`, exclude legacy tests and generated artifacts (`node_modules`, `dist`, `test-results`, caches), then replace hard-coded legacy paths with repo-relative or environment-driven resolution. The launcher app should be copied into `Idea/Pratibimba/System/epi-app/EpiLogos-Dev.app` and updated to launch the new `epi-app` package path.

**Tech Stack:** TypeScript, Electron, React, Vite, Vitest, Playwright, Node.js, macOS app bundle shell launcher

---

## Scoped Findings

- Legacy source root: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System`
- New target root: `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Pratibimba/System`
- Current target contains placeholders only:
  - `Idea/Pratibimba/System/bimba-mcp/.gitkeep`
  - `Idea/Pratibimba/System/epi-app/.gitkeep`
- Legacy Electron app currently lives in `Idea/Pratibimba/System/src/`, but should land in `Idea/Pratibimba/System/epi-app/`
- Legacy launcher bundle currently assumes `Idea/Pratibimba/System/src`
- Legacy tree contains generated content that should not be copied:
  - `bimba-mcp/node_modules`
  - `bimba-mcp/dist`
  - `bimba-mcp/tests`
  - `src/node_modules`
  - `src/dist`
  - `src/test-results`
  - `src/tests`
- Size check confirms why we should avoid raw copy:
  - `bimba-mcp`: `140M`
  - `src`: `818M`
  - `EpiLogos-Dev.app`: `508K`
- Hard-coded legacy-path risk already confirmed in:
  - `Idea/Pratibimba/System/src/main/main.ts`
  - `Idea/Pratibimba/System/src/renderer/components/BacklinksPanel.tsx`
  - `Idea/Pratibimba/System/bimba-mcp/src/api/sync.ts`
  - `Idea/Pratibimba/System/bimba-mcp/src/api/graph.ts`
  - `/Users/admin/Documents/Epi-Logos/EpiLogos-Dev.app/Contents/MacOS/launcher`
- Secondary migration surface exists in legacy root helper files:
  - `Idea/Pratibimba/System/playwright.config.ts`
  - `Idea/Pratibimba/System/check_app_errors.py`
  - `Idea/Pratibimba/System/test_electron_slide_panels.py`
  - `Idea/Pratibimba/System/test_navigation.py`
  - `Idea/Pratibimba/System/test_simple_stratum.py`
  - `Idea/Pratibimba/System/test_stratum_by_index.py`
  - `Idea/Pratibimba/System/test_stratum_clicks.py`

## Recommended Migration Shape

- Copy `legacy/System/bimba-mcp/` to `new/System/bimba-mcp/`, excluding tests and generated artifacts.
- Copy `legacy/System/src/` to `new/System/epi-app/`, excluding tests and generated artifacts.
- Copy `EpiLogos-Dev.app/` to `new/System/epi-app/EpiLogos-Dev.app/`.
- Do not blindly copy legacy root docs/scripts on the first pass.
- Leave all legacy tests behind for this migration.
- Instead, port only the scripts that are still required after the app runs from `epi-app/`.

## Open Decision

- Recommended: assign the copied launcher bundle a distinct macOS identity if we want the old and new launchers to coexist cleanly.
- Current legacy values:
  - `CFBundleIdentifier`: `com.epi-logos.dev-launcher`
  - `CFBundleName`: `EpiLogos Dev`

### Task 1: Prepare Safe Copy Boundaries

**Files:**
- Modify: `Idea/Pratibimba/System/bimba-mcp/.gitkeep`
- Modify: `Idea/Pratibimba/System/epi-app/.gitkeep`
- Create: `Idea/Pratibimba/System/README.md`

**Step 1: Document the copy contract**

Write a short migration note in `Idea/Pratibimba/System/README.md` describing:
- `bimba-mcp/` is the repo-local MCP package
- `epi-app/` is the repo-local Electron package
- generated artifacts must never be copied from the legacy repo

**Step 2: Remove placeholder files only after real content is staged**

Delete:
- `Idea/Pratibimba/System/bimba-mcp/.gitkeep`
- `Idea/Pratibimba/System/epi-app/.gitkeep`

**Step 3: Add ignore coverage if needed**

Update `.gitignore` if the repo does not already ignore:
- `node_modules/`
- `dist/`
- `coverage/`
- `test-results/`
- `*.tsbuildinfo`
- `playwright-report/`

### Task 2: Copy `bimba-mcp` as Source, Not Build Output

**Files:**
- Create: `Idea/Pratibimba/System/bimba-mcp/**`
- Modify: `Idea/Pratibimba/System/bimba-mcp/package.json`
- Modify: `Idea/Pratibimba/System/bimba-mcp/src/api/sync.ts`
- Modify: `Idea/Pratibimba/System/bimba-mcp/src/api/graph.ts`

**Step 1: Stage the copy with exclusions**

Run a selective copy from:
- `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/bimba-mcp/`

Into:
- `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Pratibimba/System/bimba-mcp/`

Exclude:
- `node_modules`
- `dist`
- `tests`
- `coverage`
- `test-results`
- `.DS_Store`

**Step 2: Replace legacy absolute path usage**

Refactor:
- `src/api/sync.ts`
- `src/api/graph.ts`

Use:
- environment variables first
- repo-relative path discovery second

Do not leave `/Users/admin/Documents/Epi-Logos/...` literals in runtime code.

**Step 3: Add a lightweight smoke check instead of copying legacy tests**

Create a small repo-local verification note or script that proves:
- the default vault root is computed without the legacy repo path
- file-path expansion works when this repo is the checkout root
- the code still honors explicit environment overrides

Do not copy `legacy/System/bimba-mcp/tests`.

**Step 4: Verify package health**

Run from `Idea/Pratibimba/System/bimba-mcp`:

```bash
npm install
npm run typecheck
npm run build
```

### Task 3: Move the Electron App into `epi-app`

**Files:**
- Create: `Idea/Pratibimba/System/epi-app/**`
- Modify: `Idea/Pratibimba/System/epi-app/package.json`
- Modify: `Idea/Pratibimba/System/epi-app/main/main.ts`
- Modify: `Idea/Pratibimba/System/epi-app/renderer/components/BacklinksPanel.tsx`
- Modify: `Idea/Pratibimba/System/epi-app/playwright.local.config.ts`

**Step 1: Stage the copy with exclusions**

Run a selective copy from:
- `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/`

Into:
- `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Pratibimba/System/epi-app/`

Exclude:
- `node_modules`
- `dist`
- `tests`
- `test-results`
- `.DS_Store`
- `*.tsbuildinfo`

**Step 2: Refactor runtime path discovery**

Replace hard-coded repo assumptions in:
- `main/main.ts`
- any config/test files that still reference `System/src`

Use a shared helper that can derive:
- repo root
- `Idea` vault root
- `Idea/Empty/Present`
- `Idea/Pratibimba/System/Subsystems`

**Step 3: Update renderer path translation**

Adjust `renderer/components/BacklinksPanel.tsx` so displayed paths map from the new repo-local vault root instead of the legacy absolute path.

**Step 4: Verify package health**

Run from `Idea/Pratibimba/System/epi-app`:

```bash
npm install
npm run typecheck
npm run build
```

### Task 4: Copy and Localize the Launcher Bundle

**Files:**
- Create: `Idea/Pratibimba/System/epi-app/EpiLogos-Dev.app/**`
- Modify: `Idea/Pratibimba/System/epi-app/EpiLogos-Dev.app/Contents/MacOS/launcher`
- Modify: `Idea/Pratibimba/System/epi-app/EpiLogos-Dev.app/Contents/Info.plist`

**Step 1: Copy the bundle intact**

Copy:
- `/Users/admin/Documents/Epi-Logos/EpiLogos-Dev.app/`

Into:
- `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Pratibimba/System/epi-app/EpiLogos-Dev.app/`

**Step 2: Update launcher target**

Change the launcher script from:
- `Idea/Pratibimba/System/src`

To:
- `Idea/Pratibimba/System/epi-app`

Keep it repo-relative so the copied bundle works from this repo root.

**Step 3: Decide app identity**

If coexistence matters, update:
- `CFBundleIdentifier`
- `CFBundleName`

Example direction:
- `com.epi-logos.dev-launcher.ce`
- `EpiLogos Dev CE`

**Step 4: Smoke test the launcher**

Double-check that:
- it changes into the new `epi-app` directory
- it runs `npm run dev`
- it no longer touches the legacy repo

### Task 5: Port or Retire Legacy Root Helpers

**Files:**
- Review: `legacy/System/playwright.config.ts`
- Review: `legacy/System/check_app_errors.py`
- Review: `legacy/System/test_electron_slide_panels.py`
- Review: `legacy/System/test_navigation.py`
- Review: `legacy/System/test_simple_stratum.py`
- Review: `legacy/System/test_stratum_by_index.py`
- Review: `legacy/System/test_stratum_clicks.py`
- Create or Modify: `Idea/Pratibimba/System/epi-app/scripts/**` as needed

**Step 1: Classify each helper**

For each file, choose one:
- port into `epi-app/scripts/`
- rewrite as package-local test/config
- drop because it is obsolete or duplicated elsewhere

Default for this migration:
- drop the legacy test files from the copy set
- only port helpers that are required to run or smoke-check the app

**Step 2: Fix any surviving path assumptions**

Any retained helper must reference:
- `Idea/Pratibimba/System/epi-app`

Never:
- `Idea/Pratibimba/System/src`

### Task 6: Final Verification

**Files:**
- Verify: `Idea/Pratibimba/System/bimba-mcp/**`
- Verify: `Idea/Pratibimba/System/epi-app/**`

**Step 1: Prove no legacy absolute paths remain**

Run:

```bash
rg -n "/Users/admin/Documents/Epi-Logos" Idea/Pratibimba/System/bimba-mcp Idea/Pratibimba/System/epi-app
```

Expected:
- no runtime code matches
- only intentional documentation references remain, if any

**Step 2: Prove clean source copy boundaries**

Run:

```bash
find Idea/Pratibimba/System/bimba-mcp Idea/Pratibimba/System/epi-app \( -name node_modules -o -name dist -o -name test-results -o -name tests \)
```

Expected:
- no copied legacy tests or build artifacts before install/build

**Step 3: Run end-to-end package verification**

From `Idea/Pratibimba/System/bimba-mcp`:

```bash
npm run typecheck
npm run build
```

From `Idea/Pratibimba/System/epi-app`:

```bash
npm run typecheck
npm run build
```

**Step 4: Manual smoke verification**

Confirm:
- the launcher opens the new repo-local app
- the Electron app resolves the local vault/subsystems paths
- the MCP server builds and can start from the new repo path

## Recommended Execution Notes

- Use `rsync -a` with explicit excludes for the copy steps.
- Exclude `tests/`, `node_modules/`, `dist/`, `coverage/`, `test-results/`, `.DS_Store`, and `*.tsbuildinfo` during copy.
- Prefer new repo-local path helpers over hard-coded absolute replacements.
- Keep docs and helper scripts out of the first copy unless they are necessary for runtime or verification.
- Reinstall dependencies fresh inside the new repo after the copy lands.
- Do not claim success until both packages install and build inside this repo, and the launcher smoke test confirms it is using the new tree.
