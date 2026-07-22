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

function waitForPortToClose(port: number, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolveClose, rejectClose) => {
        const attempt = () => {
            const socket = connect({ port, host: '127.0.0.1' }, () => {
                socket.destroy();
                if (Date.now() > deadline) {
                    rejectClose(new Error(`port ${port} did not close within ${timeoutMs}ms`));
                } else {
                    setTimeout(attempt, 100);
                }
            });
            socket.on('error', () => {
                socket.destroy();
                resolveClose();
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
        pids = execFileSync('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN'], {
            encoding: 'utf8'
        })
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
    // Rebuild the gateway binary from current substrate source before spawning.
    // A kernel/portal-core/gateway change (e.g. a new bussed profile field or a
    // new gateway RPC) is INVISIBLE to the spawned e2e gateway until epi-cli is
    // rebuilt, and the UF class scope deliberately EXCLUDES epi-cli — so without
    // this the e2e would silently verify a STALE binary (the 24.T24.5 stale-binary
    // gap). cargo's own incremental staleness check makes this a fast no-op when
    // the binary is already current.
    console.log('[e2e-setup] rebuilding epi to reflect current substrate (cargo build epi-cli)…');
    execFileSync(
        'cargo',
        ['build', '--offline', '--manifest-path', join(REPO_ROOT, 'Body', 'S', 'S0', 'epi-cli', 'Cargo.toml')],
        { cwd: REPO_ROOT, stdio: 'inherit' }
    );
    if (!existsSync(EPI_BIN)) {
        throw new Error(
            `[e2e-setup] epi debug binary missing at ${EPI_BIN} after cargo build — check the epi-cli build`
        );
    }
    if (!existsSync(epiGnosticBin)) {
        throw new Error(`[e2e-setup] real epi-gnostic executable missing at ${epiGnosticBin}`);
    }
    ensureChromium();
    sweepPort(E2E_GATEWAY_PORT);
    sweepPort(E2E_SIDECAR_PORT);
    await waitForPortToClose(E2E_GATEWAY_PORT, 5_000);
    await waitForPortToClose(E2E_SIDECAR_PORT, 5_000);

    // One real temp vault is shared by both read paths: the browser-sidecar
    // commands and the gateway's governed s1'.vault.* methods. Keeping these
    // roots identical is what makes cross-carrier filesystem assertions real.
    const vaultRoot = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-vault-'));
    mkdirSync(join(vaultRoot, 'Empty', 'Present'), { recursive: true });
    const vaultArtifacts = [
        'Bimba/World/Types/Coordinates/S/S1/S1.md',
        'Bimba/World/Types/Coordinates/S/S1/S1.canvas',
        'Bimba/World/Types/Crystallisation-Pipeline.base',
        'Bimba/World/Types/Psychoids/Psychoids.md',
        'Bimba/Map/snapshots/M2.base.json',
        // 25.T25.14 — the personal-coordinate consent surface writes real bytes
        // to Pratibimba/Self/PASU.md `c_4_atlas_sync_consents` via the loopback
        // `nara.pasu.consents.append` RPC. Seed the canonical (empty-consent)
        // PASU.md so the pratibimba-consent spec drives a real array-append.
        'Pratibimba/Self/PASU.md'
    ];
    for (const artifact of vaultArtifacts) {
        const destination = join(vaultRoot, artifact);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(join(REPO_ROOT, 'Idea', artifact), destination);
    }

    // (b) the REAL gateway on the dedicated e2e port, isolated state root.
    //     s2.parashaktiCorrespondences (the M2 correspondence face) reads the
    //     live Neo4j parashakti-deep graph via Neo4jConfig::from_env. Pass the
    //     graph env keys EXPLICITLY (with the CLI's own defaults) so live-graph
    //     reachability is a DELIBERATE part of the harness — not an ambient
    //     accident of the launching shell — and the M2 spec is a real live-graph
    //     gate that fails honestly when Neo4j is down.
    const gatewayStateRoot = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-gate-'));
    const gatewayHome = mkdtempSync(join(tmpdir(), 'pratibimba-e2e-home-'));

    // 26.T26.14 — seed one real axiom-translation session into the epii store
    // (the exact shape `gate::epii_axiom` persists) so the inspector's read path
    // (s5'.epii.axiom_translation_history) has genuine data to render. The
    // producer's model logic is proven separately by the Rust unit tests; this
    // seed proves the read + four-column render honestly, without a live model.
    const axiomStore = join(gatewayStateRoot, 'epii', 'axiom-translations');
    mkdirSync(axiomStore, { recursive: true });
    writeFileSync(
        join(axiomStore, 'axiom-e2e-seed.json'),
        JSON.stringify(
            {
                id: 'axiom-e2e-seed',
                initiatingDispatchNodeId: 'e2e-dispatch',
                steps: [
                    { id: 'axiom-e2e-seed-step-0', fromForm: 'philosophical-english', toForm: 'formal-notation', inputText: 'All beings return to the ground.', outputText: '∀x (Being(x) → Returns(x, ground))', reasoningTrace: 'universally quantify the subject and name the return relation', verifiedBy: 'pi' },
                    { id: 'axiom-e2e-seed-step-1', fromForm: 'formal-notation', toForm: 'owl', inputText: '∀x (Being(x) → Returns(x, ground))', outputText: '<owl:Class rdf:about="#Being"><rdfs:subClassOf><owl:Restriction owl:onProperty="#returnsTo" owl:someValuesFrom="#Ground"/></rdfs:subClassOf></owl:Class>', reasoningTrace: 'map the predicate to an OWL class restriction on returnsTo', verifiedBy: 'pi' },
                    { id: 'axiom-e2e-seed-step-2', fromForm: 'owl', toForm: 'shacl', inputText: '<owl:Class rdf:about="#Being"/>', outputText: '<sh:NodeShape sh:targetClass="#Being"><sh:property><sh:path>#returnsTo</sh:path><sh:minCount>1</sh:minCount></sh:property></sh:NodeShape>', reasoningTrace: 'derive a SHACL shape enforcing the return constraint', verifiedBy: 'pi' }
                ],
                verifiedBy: 'pending'
            },
            null,
            2
        )
    );

    const gatewayNow = join(vaultRoot, 'Empty', 'Present', 'e2e', 'now.md');
    const autoresearchConfig = join(gatewayHome, '.epi-logos', 'config.toml');
    const gatewayIdentity = join(gatewayHome, '.epi-logos', 'nara', 'profile.json');
    const gatewayKairos = join(
        gatewayHome,
        '.epi-logos',
        'nara',
        'kairos',
        'current.json'
    );
    mkdirSync(dirname(autoresearchConfig), { recursive: true });
    mkdirSync(dirname(gatewayNow), { recursive: true });
    writeFileSync(
        gatewayNow,
        '---\ncoordinate: M4\nc_4_artifact_role: now\n---\n\n# E2E NOW\n'
    );
    writeFileSync(
        autoresearchConfig,
        `[autoresearch]\narticulation_gap_peer_ratio = 0.75\ncontradiction_vector_disagreement_threshold = 0.35\nresonance_promotion_confidence_threshold = 0.85\nstale_revision_threshold = 12\npriority_order = ["articulation_gap", "promotion_candidate", "contradiction_candidate", "stale_by_non_revisit"]\n`
    );
    mkdirSync(dirname(gatewayIdentity), { recursive: true });
    writeFileSync(
        gatewayIdentity,
        JSON.stringify({
            version: 1,
            layers: {
                numerological: {
                    present: true,
                    source: 'pratibimba-e2e-active-pasu',
                    completeness: 100,
                    set_at: 1_700_000_000_000,
                    elemental_profile: [0.25, 0.25, 0.25, 0.25]
                }
            },
            layer_presence_mask: 1,
            hash_preview: 'derived-at-runtime',
            last_wound: null,
            kerykeion_version: null
        })
    );
    // Seed the real persisted Kerykeion ingress consumed by
    // nara::kairos::heartbeat_live_sky_tiered. The gateway still performs the
    // freshness/completeness checks, live-planet derivation, F_routing, typed
    // profile serialization, and WebSocket broadcast; the browser receives no
    // fixture injection.
    mkdirSync(dirname(gatewayKairos), { recursive: true });
    writeFileSync(
        gatewayKairos,
        JSON.stringify({
            planets: Array.from({ length: 10 }, (_, planetId) => ({
                planet_id: planetId,
                degree: (15 + planetId * 31.75) % 360,
                degree_anchor: Math.round((15 + planetId * 31.75) % 360),
                retrograde: planetId === 2 || planetId === 7
            })),
            dominant_sign: 0,
            dominant_element: 2,
            active_decan: 1,
            active_tattva: 0
        })
    );
    const gateway = spawn(EPI_BIN, ['gate', 'start', '--port', String(E2E_GATEWAY_PORT)], {
        env: {
            ...process.env,
            HOME: gatewayHome,
            EPI_NARA_HOME: join(gatewayHome, '.epi-logos', 'nara'),
            EPI_NOW_PATH: gatewayNow,
            EPI_GATE_STATE_ROOT: gatewayStateRoot,
            EPI_GNOSTIC_PYTHON: epiGnosticBin,
            EPILOGOS_VAULT: vaultRoot,
            EPILOGOS_NEO4J_URI: process.env.EPILOGOS_NEO4J_URI ?? 'bolt://localhost:7687',
            EPILOGOS_NEO4J_USER: process.env.EPILOGOS_NEO4J_USER ?? 'neo4j',
            EPILOGOS_NEO4J_PASSWORD: process.env.EPILOGOS_NEO4J_PASSWORD ?? ''
        },
        stdio: ['ignore', 'ignore', 'inherit'],
        detached: false
    });
    gateway.unref();

    // (c) the temp-vault sidecar over the same real mkdtemp filesystem.

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
