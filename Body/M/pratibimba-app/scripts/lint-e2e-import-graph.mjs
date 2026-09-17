#!/usr/bin/env node
/**
 * Coordinate: M' shell (e2e import-graph discipline — Track 00 gate hygiene)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 — Context/Type; keeps the UF gate able to run at all
 * Actualises: the rule that a Playwright spec's import graph must not reach a
 *   VITE BUILD-ONLY API. Playwright transpiles specs in Node with no Vite
 *   pipeline, so `import.meta.glob(...)` throws at module load — and because
 *   Playwright imports every spec just to enumerate tests, ONE such edge takes
 *   the whole suite to "Total: 0 tests in 0 files". Every UF-class tranche in
 *   every lane is then unclosable, which gates development behind its own
 *   reporting.
 *
 *   This is not hypothetical: `motionTokens.ts` (a pure token module) re-
 *   exported `TRANSITIONS` from `primitives.tsx`, so every consumer of a motion
 *   token — including pure-law modules that specs legitimately import — pulled
 *   in a React component and, through it, the eager icon-asset glob. The edge
 *   was one line and the blast radius was the entire e2e gate.
 *
 *   The rule is deliberately NARROW. It does not forbid `.ts` importing `.tsx`
 *   (three legitimate `src/composition` modules do that today), and it does not
 *   police layering. It forbids exactly the thing that cannot survive
 *   Playwright's loader, and it prints the FULL chain, because the failing
 *   frame names only the leaf — finding the edge by hand took a bisect.
 * Public surface: VITE_BUILD_ONLY_APIS, resolveImport, chainsToBuildOnlyApi,
 *   main; CLI: node scripts/lint-e2e-import-graph.mjs [--json]
 * Does NOT own: the icon register (src/ui/iconography.ts), the motion tokens,
 *   Playwright config, or suite orchestration.
 * Contract: findings exit 1 with the full spec→…→module chain.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const APP_ROOT = resolve(SCRIPT_DIR, '..');

/** APIs Vite replaces at build time and Node/Playwright cannot evaluate. */
export const VITE_BUILD_ONLY_APIS = Object.freeze(['import.meta.glob']);

const CANDIDATE_SUFFIXES = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

/** Resolve a relative specifier to a real file, or null. */
export function resolveImport(fromFile, specifier) {
    if (!specifier.startsWith('.')) return null;
    const base = resolve(dirname(fromFile), specifier);
    for (const suffix of CANDIDATE_SUFFIXES) {
        const candidate = base + suffix;
        if (existsSync(candidate) && /\.(ts|tsx)$/.test(candidate)) return candidate;
    }
    return null;
}

function importSpecifiers(text) {
    return [...text.matchAll(/from\s+'([^']+)'/g)].map(match => match[1]);
}

function usesBuildOnlyApi(text) {
    return VITE_BUILD_ONLY_APIS.find(api => text.includes(`${api}(`)) ?? null;
}

/**
 * Every chain from an e2e spec to a module using a build-only API.
 * Returns `[{ api, chain: [relPaths…] }]`, one per offending spec.
 */
export function chainsToBuildOnlyApi(appRoot = APP_ROOT) {
    const e2eDir = join(appRoot, 'tests', 'e2e');
    if (!existsSync(e2eDir)) return [];
    const findings = [];
    const specs = readdirSync(e2eDir)
        .filter(entry => entry.endsWith('.ts'))
        .sort()
        .map(entry => join(e2eDir, entry));

    for (const spec of specs) {
        const seen = new Set();
        const walk = (file, chain) => {
            if (seen.has(file)) return null;
            seen.add(file);
            let text;
            try {
                text = readFileSync(file, 'utf8');
            } catch {
                return null;
            }
            const api = usesBuildOnlyApi(text);
            if (api) return { api, chain };
            for (const specifier of importSpecifiers(text)) {
                const next = resolveImport(file, specifier);
                if (!next) continue;
                const found = walk(next, [...chain, relative(appRoot, next).split(sep).join('/')]);
                if (found) return found;
            }
            return null;
        };
        const found = walk(spec, [relative(appRoot, spec).split(sep).join('/')]);
        if (found) findings.push(found);
    }
    return findings;
}

export function main(argv = process.argv.slice(2)) {
    const json = argv.includes('--json');
    const findings = chainsToBuildOnlyApi();
    if (json) {
        console.log(JSON.stringify({ findings }, null, 2));
    } else {
        for (const finding of findings) {
            console.error(
                `[lint-e2e-import-graph] ${finding.chain[0]} reaches ${finding.api}(…) — ` +
                `Playwright cannot transform it, so the WHOLE suite fails to enumerate:\n    ` +
                finding.chain.join('\n      -> ')
            );
        }
    }
    if (findings.length > 0) {
        console.error(
            `[lint-e2e-import-graph] RED — ${findings.length} spec(s) reach a Vite build-only API`
        );
        return 1;
    }
    console.log(
        '[lint-e2e-import-graph] GREEN — no e2e spec reaches a Vite build-only API'
    );
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main();
}
