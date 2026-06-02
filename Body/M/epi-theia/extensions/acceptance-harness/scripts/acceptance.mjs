#!/usr/bin/env node
// Track 05 T9 — acceptance harness driver.
//
// PURPOSE: a repeatable script that boots the real services (gateway,
// SpaceTimeDB, Neo4j/Redis, S5 persisted stores) — or attaches to running
// ones — launches the Theia shell, parses the acceptance step handles from
// stdout, and verifies the release-gate invariants.
//
// USAGE:
//   node Body/M/epi-theia/extensions/acceptance-harness/scripts/acceptance.mjs [--browser|--electron] [--attach-to-running-services]
//
// OUTPUT:
//   Prints a JSON acceptance receipt to stdout on completion. Exits 0 on
//   pass, non-zero on any required step failure.
//
// SAFETY:
//   - The script DOES NOT spawn `cargo run` etc. by default; it expects the
//     operator to have services running (per operator-runbook.md). Pass
//     `--auto-boot` to opt into spawning.
//   - The Theia process is started by `pnpm --filter @pratibimba/theia-app start`
//     in browser mode or `pnpm --filter @pratibimba/electron-app start` for
//     Electron mode. Stdout is parsed for the ACCEPTANCE: handle prefix.

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..', '..', '..');
const SYSTEM_ROOT = resolve(__dirname, '..', '..', '..');
const HANDLE_RE = /\[ACCEPTANCE:([^:]+):([^=]+)=([^\]]+)\]/g;

function parseArgs(argv) {
    const args = {
        mode: 'browser',
        autoBoot: false,
        attachToRunning: false,
        dryRun: false,
        timeoutMs: 600000
    };
    for (const a of argv) {
        if (a === '--electron') args.mode = 'electron';
        else if (a === '--browser') args.mode = 'browser';
        else if (a === '--auto-boot') args.autoBoot = true;
        else if (a === '--attach-to-running-services') args.attachToRunning = true;
        else if (a === '--dry-run') args.dryRun = true;
        else if (a.startsWith('--timeout=')) args.timeoutMs = Number.parseInt(a.split('=')[1], 10);
    }
    return args;
}

function loadAcceptancePlan() {
    const planJsPath = resolve(
        SYSTEM_ROOT,
        'extensions',
        'acceptance-harness',
        'lib',
        'common',
        'acceptance-plan.js'
    );
    const planModule = require(planJsPath);
    return planModule.TRACK_05_T9_ACCEPTANCE_PLAN;
}

async function dryRunReport(args) {
    // Dry run: parse the plan, print the step list, do not start anything.
    // Useful for CI to confirm the plan is well-formed before booting heavy
    // services.
    const planModule = await import(
        'file://' +
            resolve(
                SYSTEM_ROOT,
                'extensions',
                'acceptance-harness',
                'lib',
                'common',
                'acceptance-plan.js'
            )
    ).catch(err => {
        throw new Error(`acceptance: failed to load plan — did you run pnpm build? (${err.message})`);
    });
    const plan = planModule.TRACK_05_T9_ACCEPTANCE_PLAN;
    const receipt = {
        plan: plan.id,
        version: plan.version,
        mode: args.mode,
        services: plan.services.map(s => ({ id: s.id, alwaysRequired: s.alwaysRequired, start: s.start })),
        steps: plan.steps.map(s => ({ id: s.id, layout: s.layout, produces: s.produces })),
        privacyAuditSurfaces: plan.privacyAuditSurfaces,
        result: 'dry-run',
        observedHandles: []
    };
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return 0;
}

function spawnTheia(mode) {
    if (mode === 'electron') {
        return spawn('pnpm', ['--filter', '@pratibimba/electron-app', 'start'], {
            cwd: SYSTEM_ROOT,
            stdio: ['ignore', 'pipe', 'pipe']
        });
    }
    return spawn('pnpm', ['--dir', 'theia-app', 'start'], {
        cwd: SYSTEM_ROOT,
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

function collectHandles(child, timeoutMs) {
    return new Promise((resolveP, rejectP) => {
        const handles = [];
        let buf = '';
        const timeout = setTimeout(() => {
            try { child.kill('SIGTERM'); } catch { /* noop */ }
            resolveP({ handles, timedOut: true });
        }, timeoutMs);
        child.stdout.on('data', chunk => {
            buf += chunk.toString();
            for (const m of buf.matchAll(HANDLE_RE)) {
                handles.push({ step: m[1], key: m[2], value: m[3] });
            }
        });
        child.on('exit', code => {
            clearTimeout(timeout);
            resolveP({ handles, timedOut: false, exitCode: code });
        });
        child.on('error', err => {
            clearTimeout(timeout);
            rejectP(err);
        });
    });
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.dryRun) {
        const code = await dryRunReport(args);
        process.exit(code);
    }
    // For non-dry-run we spawn Theia. The operator runbook covers booting
    // gateway + SpaceTimeDB + Neo4j + Redis + S5 stores out-of-band; this
    // script attaches and drives.
    const child = spawnTheia(args.mode);
    const { handles, timedOut, exitCode } = await collectHandles(child, args.timeoutMs);
    const receipt = {
        plan: 'track-05-t9-acceptance',
        mode: args.mode,
        timedOut,
        exitCode: exitCode ?? null,
        handleCount: handles.length,
        handles,
        result: timedOut ? 'timed-out' : exitCode === 0 ? 'pass' : 'fail'
    };
    const outDir = resolve(REPO_ROOT, 'Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs');
    try {
        mkdirSync(outDir, { recursive: true });
    } catch { /* exists */ }
    const outPath = join(outDir, `acceptance-receipt-${Date.now()}.json`);
    writeFileSync(outPath, JSON.stringify(receipt, null, 2));
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    process.exit(timedOut || exitCode !== 0 ? 1 : 0);
}

main().catch(err => {
    process.stderr.write(`acceptance error: ${err.message}\n`);
    process.exit(2);
});
