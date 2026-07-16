/**
 * Coordinate: M' (e2e global setup)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real-substrate suite bootstrap
 * Actualises: the real substrate under the drivable-loop specs —
 *   (a) chromium present, (b) a REAL `epi gate start` on the e2e port,
 *   (c) the temp-vault sidecar on a real mkdtemp filesystem. Orphans on the
 *   e2e ports are swept first (verify-all.mjs orphan-sweep law: strays from
 *   dead runs poison fixed-port suites).
 * Public surface: Playwright globalSetup.
 * Does NOT own: gateway behavior, Gnostic graph law, browser specs, or teardown.
 * Contract: root [[AGENTS]] verification law + [[CHROME-CONTRACT]].
 */

import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';
import {
    APP_ROOT,
    E2E_GATEWAY_PORT,
    E2E_SIDECAR_PORT,
    EPI_BIN,
    REPO_ROOT,
    RUN_STATE_FILE,
    type E2eRunState
} from './e2e-env';

function waitForPort(port: number, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolvePort, rejectPort) => {
        const attempt = () => {
            const socket = connect({ port, host: '127.0.0.1' }, () => {
                socket.destroy();
                resolvePort();
            });
            socket.on('error', () => {
                socket.destroy();
                if (Date.now() > deadline) {
                    rejectPort(new Error(`port ${port} did not open within ${timeoutMs}ms`));
                } else {
                    setTimeout(attempt, 300);
                }
            });
        };
        attempt();
    });
}

/** Kill leftover listeners on the dedicated e2e ports — but only processes
 *  that are recognisably ours (epi gateway / node sidecar / vite). */
function sweepPort(port: number): void {
    let pids: string[] = [];
    try {
        pids = execFileSync('lsof', ['-ti', `tcp:${port}`], { encoding: 'utf8' })
            .split('\n')
            .filter(Boolean);
    } catch {
        return; // nothing listening
    }
    for (const pid of pids) {
        let command = '';
        try {
            command = execFileSync('ps', ['-o', 'command=', '-p', pid], { encoding: 'utf8' }).trim();
        } catch {
            continue;
        }
        if (/epi .*gate .*start|e2e-vault-sidecar|vite/.test(command)) {
            console.log(`[e2e-setup] clearing orphan on port ${port}: pid ${pid} (${command})`);
            try {
                process.kill(Number(pid), 'SIGTERM');
            } catch {
                /* already gone */
            }
        } else {
            throw new Error(
                `[e2e-setup] port ${port} is held by an unrecognised process (pid ${pid}: ${command}) — refusing to kill it`
            );
        }
    }
}

function ensureChromium(): void {
    try {
        const path = chromium.executablePath();
        if (path && existsSync(path)) {
            return;
        }
    } catch {
        /* fall through to install */
    }
    console.log('[e2e-setup] chromium missing — running `playwright install chromium`');
    execFileSync('pnpm', ['exec', 'playwright', 'install', 'chromium'], {
        cwd: APP_ROOT,
        stdio: 'inherit'
    });
}

export default async function globalSetup(): Promise<void> {
    const epiGnosticBin = join(
        REPO_ROOT,
        'Body',
        'S',
        'S5',
        'epi-gnostic',
        '.venv',
        'bin',
        'epi-gnostic'
    );
    if (!existsSync(EPI_BIN)) {
        throw new Error(
            `[e2e-setup] epi debug binary missing at ${EPI_BIN} — build the shared target: cargo build --manifest-path Body/S/S0/epi-cli/Cargo.toml`
        );
    }
    if (!existsSync(epiGnosticBin)) {
        throw new Error(`[e2e-setup] real epi-gnostic executable missing at ${epiGnosticBin}`);
    }
    ensureChromium();
    sweepPort(E2E_GATEWAY_PORT);
    sweepPort(E2E_SIDECAR_PORT);

    // (b) the REAL gateway on the dedicated e2e port, isolated state root.
    //     s2.parashaktiCorrespondences (the M2 correspondence face) reads the
    //     live Neo4j parashakti-deep graph via Neo4jConfig::from_env. Pass the
    //     graph env keys EXPLICITLY (with the CLI's own defaults) so live-graph
    //     reachability is a DELIBERATE part of the harness — not an ambient
    //     accident of the launching shell — and the M2 spec is a real live-graph
    //     gate that fails honestly when Neo4j is down.
    const gatewayStateRoot = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-gate-'));
    const gatewayHome = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-home-'));
    const autoresearchConfig = join(gatewayHome, '.epi-logos', 'config.toml');
    mkdirSync(dirname(autoresearchConfig), { recursive: true });
    writeFileSync(
        autoresearchConfig,
        `[autoresearch]\narticulation_gap_peer_ratio = 0.75\ncontradiction_vector_disagreement_threshold = 0.35\nresonance_promotion_confidence_threshold = 0.85\nstale_revision_threshold = 12\npriority_order = ["articulation_gap", "promotion_candidate", "contradiction_candidate", "stale_by_non_revisit"]\n`
    );
    const gateway = spawn(EPI_BIN, ['gate', 'start', '--port', String(E2E_GATEWAY_PORT)], {
        env: {
            ...process.env,
            HOME: gatewayHome,
            EPI_GATE_STATE_ROOT: gatewayStateRoot,
            EPI_GNOSTIC_PYTHON: epiGnosticBin,
            EPILOGOS_NEO4J_URI: process.env.EPILOGOS_NEO4J_URI ?? 'bolt://localhost:7687',
            EPILOGOS_NEO4J_USER: process.env.EPILOGOS_NEO4J_USER ?? 'neo4j',
            EPILOGOS_NEO4J_PASSWORD: process.env.EPILOGOS_NEO4J_PASSWORD ?? ''
        },
        stdio: ['ignore', 'ignore', 'inherit'],
        detached: false
    });
    gateway.unref();

    // (c) the temp-vault sidecar over a REAL mkdtemp filesystem
    const vaultRoot = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-vault-'));
    mkdirSync(join(vaultRoot, 'Empty', 'Present'), { recursive: true });

    // Seed the S1 MOC, its canvas-hosted Base, and one real matching record
    // from the repository vault. The browser still reads/evaluates them through
    // the production vault sidecar; these are real artifacts, not test doubles.
    const vaultArtifacts = [
        'Bimba/World/Types/Coordinates/S/S1/S1.md',
        'Bimba/World/Types/Coordinates/S/S1/S1.canvas',
        'Bimba/World/Types/Crystallisation-Pipeline.base',
        'Bimba/World/Types/Psychoids/Psychoids.md'
    ];
    for (const artifact of vaultArtifacts) {
        const destination = join(vaultRoot, artifact);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(join(REPO_ROOT, 'Idea', artifact), destination);
    }

    // (d) isolated nara home for the REAL `epi nara oracle cast` — the cast's
    // temporal-authority gate needs a fresh kairos cache (normally written by
    // `epi nara kairos sync` via kerykeion/python, which e2e cannot assume);
    // seeding the cache file is environment setup, NOT a mock: every asserted
    // artifact (draw output, ledger line, vault bytes) comes from the real CLI
    const naraHome = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-nara-'));
    const kairosDir = join(naraHome, '.epi-logos', 'nara', 'kairos');
    mkdirSync(kairosDir, { recursive: true });
    writeFileSync(
        join(kairosDir, 'current.json'),
        JSON.stringify({
            planets: [
                { planet_id: 0, degree: 105.0, degree_anchor: 210, retrograde: false },
                { planet_id: 1, degree: 42.0, degree_anchor: 84, retrograde: false }
            ],
            dominant_sign: 3,
            dominant_element: 2,
            active_decan: 10,
            active_tattva: 1
        })
    );

    const sidecar = spawn(
        process.execPath,
        [
            join(APP_ROOT, 'scripts', 'e2e-vault-sidecar.mjs'),
            '--port',
            String(E2E_SIDECAR_PORT),
            '--vault',
            vaultRoot,
            '--gateway-port',
            String(E2E_GATEWAY_PORT),
            '--epi-bin',
            EPI_BIN,
            '--nara-home',
            naraHome
        ],
        { stdio: ['ignore', 'ignore', 'inherit'], detached: false }
    );
    sidecar.unref();

    await waitForPort(E2E_GATEWAY_PORT, 20_000);
    await waitForPort(E2E_SIDECAR_PORT, 10_000);

    const state: E2eRunState = {
        gatewayPid: gateway.pid ?? -1,
        sidecarPid: sidecar.pid ?? -1,
        vaultRoot,
        gatewayStateRoot,
        gatewayHome,
        naraHome
    };
    mkdirSync(dirname(RUN_STATE_FILE), { recursive: true });
    writeFileSync(RUN_STATE_FILE, JSON.stringify(state, null, 2));
    console.log(
        `[e2e-setup] gateway pid ${state.gatewayPid} on :${E2E_GATEWAY_PORT}, sidecar pid ${state.sidecarPid} on :${E2E_SIDECAR_PORT}, vault ${vaultRoot}`
    );
}
