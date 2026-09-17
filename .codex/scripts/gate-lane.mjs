#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (the gate lane — Track 00 verification harness)
 * Residency: .codex/scripts/gate-lane.mjs
 * Position (#n): #5 — Integration; the one machine-wide mutex for real-port work
 * Actualises: [[00-verification-harness]] — "the verify gate spawns real
 *   gateways on fixed ports, so exactly one run may execute machine-wide". That
 *   law lived inside `verify-tranche.mjs` and therefore protected only ONE of
 *   the three ways this repo starts those daemons. `verify-all.mjs` run
 *   directly took no lock, and `pnpm test:e2e` took no lock at all — so two
 *   agents doing UF-class work destroyed each other's evidence: one run's
 *   global-teardown killed the other's gateway and deleted its
 *   `test-results/e2e-run.json` mid-suite. Measured 2026-07-28: the same
 *   carrier suite reported 94/9, then 62 failed, then 43 passed, then 108
 *   passed / 0 failed once serialised — the first three were reading a
 *   demolished environment, not the code.
 *
 *   RE-ENTRANCY IS THE WHOLE DESIGN. `verify-tranche` holds the lane and then
 *   spawns `pnpm test:e2e` beneath itself. A lock that simply blocked would
 *   deadlock the gate against its own child. So the holder exports
 *   `EPI_GATE_LANE_HELD` into the environment, and any nested acquire sees it
 *   and passes straight through. One lane, held once, by the outermost runner.
 *
 *   Stale locks are stolen, not waited on: a holder whose pid is dead cannot
 *   release, and a `kill -9`'d agent must not wedge the lane for everyone.
 * Public surface: GATE_LOCK_DIR, LANE_ENV, E2E_PORTS, laneHeld, acquireGateLane,
 *   releaseGateLane, withGateLane, reapStaleListeners, main;
 *   CLI: node .codex/scripts/gate-lane.mjs [--owner <id>] [--no-reap] -- <cmd> [args…]
 * Does NOT own: what runs inside the lane (verify-all suites, Playwright), the
 *   port numbers themselves (tests/e2e/e2e-env.ts), or ledger records.
 * Contract: acquiring twice in one process tree is a no-op, never a deadlock.
 *   The lane is released on normal exit AND on SIGINT/SIGTERM — an interrupted
 *   run must not leave the next agent waiting on a dead pid. `lockDir` is
 *   injectable so the harness self-tests exercise a temp lane: this suite runs
 *   INSIDE verify-all, which holds the real one, and a test that cleared the
 *   real directory would unlock the gate underneath its own run.
 */

import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..');
/** The lane directory. `EPI_GATE_LANE_DIR` redirects it — used ONLY by the
 *  harness self-tests, which run inside a real gate run and must not clear the
 *  lock that run is holding. */
export const GATE_LOCK_DIR =
    process.env.EPI_GATE_LANE_DIR ?? join(REPO_ROOT, '.codex', 'verify.lock');

/** Set by whoever holds the lane, so nested runners pass through. */
export const LANE_ENV = 'EPI_GATE_LANE_HELD';

/** The fixed ports the carrier's e2e harness binds. A stale listener on any of
 *  them fails the NEXT run with `--strictPort`, which reads as a code failure
 *  and is not one. Reaped only while we hold the lane, so nothing live is ours
 *  to lose. Deliberately EXCLUDES the prod gateway (18794) and `epi up`'s
 *  daemons — those are not the harness's to kill. */
export const E2E_PORTS = Object.freeze([14621, 18933, 18934]);

function pidAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

/** True when this process tree already holds the lane. */
export function laneHeld(env = process.env) {
    return env[LANE_ENV] === '1';
}

function readHolder(lockDir) {
    try {
        return JSON.parse(readFileSync(join(lockDir, 'holder.json'), 'utf8'));
    } catch {
        return null;
    }
}

/**
 * Acquire the machine-wide gate lane, queueing until it is free.
 * Returns `'reentrant'` when the tree already holds it (no lock taken, and the
 * caller must NOT release), `'acquired'` otherwise.
 */
export async function acquireGateLane(
    owner,
    { waitMs = 10_000, log = console.log, lockDir = GATE_LOCK_DIR } = {}
) {
    if (laneHeld()) return 'reentrant';
    for (;;) {
        try {
            mkdirSync(lockDir);
            writeFileSync(
                join(lockDir, 'holder.json'),
                JSON.stringify({ pid: process.pid, owner, at: new Date().toISOString() })
            );
            process.env[LANE_ENV] = '1';
            return 'acquired';
        } catch {
            const holder = readHolder(lockDir);
            if (holder && !pidAlive(holder.pid)) {
                try {
                    rmSync(lockDir, { recursive: true, force: true });
                    log(`[gate-lane] stole stale lane (dead pid ${holder.pid})`);
                    continue;
                } catch {
                    /* another process stole it first */
                }
            }
            log(
                `[gate-lane] held by ${holder?.owner ?? 'unknown'} (pid ${holder?.pid ?? '?'}) — waiting`
            );
            await new Promise(r => setTimeout(r, waitMs));
        }
    }
}

export function releaseGateLane({ lockDir = GATE_LOCK_DIR } = {}) {
    try {
        rmSync(lockDir, { recursive: true, force: true });
    } catch {
        /* already gone */
    }
    delete process.env[LANE_ENV];
}

/**
 * Kill anything still listening on the harness's fixed ports.
 *
 * Only safe because we hold the lane: no other sanctioned run can own these
 * ports right now, so a listener here is an orphan from a crashed or
 * interrupted run. Never touches the prod gateway.
 */
export function reapStaleListeners(ports = E2E_PORTS, { log = console.log } = {}) {
    const reaped = [];
    for (const port of ports) {
        let pids = '';
        try {
            pids = execFileSync('lsof', ['-nP', `-tiTCP:${port}`, '-sTCP:LISTEN'], {
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            });
        } catch {
            continue; // nothing listening
        }
        for (const raw of pids.split('\n')) {
            const pid = Number(raw.trim());
            if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) continue;
            try {
                process.kill(pid, 'SIGTERM');
                reaped.push({ port, pid });
            } catch {
                /* already gone */
            }
        }
    }
    if (reaped.length > 0) {
        log(
            `[gate-lane] reaped ${reaped.length} orphaned listener(s): ` +
            reaped.map(r => `${r.pid}@${r.port}`).join(', ')
        );
    }
    return reaped;
}

/** Run `fn` inside the lane, releasing only if this call acquired it. */
export async function withGateLane(owner, fn, options = {}) {
    const state = await acquireGateLane(owner, options);
    if (state === 'reentrant') return fn();
    try {
        return await fn();
    } finally {
        releaseGateLane(options);
    }
}

function parseArgs(argv) {
    const options = { owner: 'gate-lane', reap: true, command: [] };
    const separator = argv.indexOf('--');
    const head = separator === -1 ? argv : argv.slice(0, separator);
    options.command = separator === -1 ? [] : argv.slice(separator + 1);
    for (let i = 0; i < head.length; i += 1) {
        if (head[i] === '--owner') options.owner = head[(i += 1)];
        else if (head[i] === '--no-reap') options.reap = false;
        else throw new Error(`unknown argument: ${head[i]}`);
    }
    if (options.command.length === 0) {
        throw new Error('usage: gate-lane.mjs [--owner <id>] [--no-reap] -- <command> [args…]');
    }
    return options;
}

export async function main(argv = process.argv.slice(2)) {
    let options;
    try {
        options = parseArgs(argv);
    } catch (cause) {
        console.error(`[gate-lane] ${cause instanceof Error ? cause.message : cause}`);
        return 2;
    }

    const state = await acquireGateLane(options.owner);
    const owned = state === 'acquired';
    if (owned) {
        console.log(`[gate-lane] acquired by ${options.owner} (pid ${process.pid})`);
        if (options.reap) reapStaleListeners();
    } else {
        console.log('[gate-lane] already held by this run — passing through');
    }

    let released = false;
    const release = () => {
        if (!owned || released) return;
        released = true;
        releaseGateLane();
    };
    // An interrupted run must not wedge the lane behind a dead pid.
    process.on('exit', release);
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
        process.on(signal, () => {
            release();
            process.exit(130);
        });
    }

    const [command, ...args] = options.command;
    const status = await new Promise(resolveRun => {
        const child = spawn(command, args, {
            cwd: process.cwd(),
            env: { ...process.env, [LANE_ENV]: '1' },
            stdio: 'inherit'
        });
        child.on('error', err => {
            console.error(`[gate-lane] failed to spawn '${command}': ${err.message}`);
            resolveRun(1);
        });
        child.on('close', code => resolveRun(code ?? 1));
    });

    release();
    if (owned) console.log(`[gate-lane] released (exit ${status})`);
    return status;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().then(code => {
        process.exitCode = code;
    });
}
