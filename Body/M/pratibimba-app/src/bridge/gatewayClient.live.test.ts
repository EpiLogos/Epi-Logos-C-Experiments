// @vitest-environment node
/**
 * Coordinate: M' (live gateway client smoke, T1.9)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Position (#n): shell-to-S3 verification boundary
 * Live integration: the REAL GatewayClient class against a REAL spawned
 * `epi gate start` (T1.9 second half — the fake-socket unit tests prove the
 * class, this proves the class against the living gateway).
 * Gated on EPI_LIVE_SMOKE=1 (needs the built epi binary); `pnpm smoke` runs it.
 * Public surface: EPI_LIVE_SMOKE=1 Vitest suite; EPI_BIN override.
 * Does NOT own: gateway behavior, Cargo output placement, or profile clocks.
 * Contract: [[CHROME-CONTRACT]] / root [[AGENTS]] verification law.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, ChildProcess } from 'node:child_process';
import { connect } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket as WsWebSocket } from 'ws';
import { GatewayClient, WebSocketLike } from './gatewayClient';
import { KernelBridgeCachedProfile, KernelBridgeConnectionStatus } from './types';
import { deriveDivision, deriveFrame, harmonicSnapshot } from '../engine/modulation/modulators';
import {
    buildContemplationFlowDirective,
    contemplationSlotsLanded,
    readContemplateSessionCloseResponse,
    CONTEMPLATION_FLOW_RPCS
} from '../engine/contemplationFlowDirector';

const LIVE = process.env.EPI_LIVE_SMOKE === '1';
const PORT = 18798;
const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..', '..');
const EPI_BIN = process.env.EPI_BIN ?? join(repoRoot, 'target', 'debug', 'epi');

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
                    setTimeout(attempt, 400);
                }
            });
        };
        attempt();
    });
}

(LIVE ? describe : describe.skip)('GatewayClient against a live gateway', () => {
    let gateway: ChildProcess;
    let stateRoot: string;

    beforeAll(async () => {
        stateRoot = mkdtempSync(join(tmpdir(), 'pratibimba-live-gate-'));
        gateway = spawn(EPI_BIN, ['gate', 'start', '--port', String(PORT)], {
            env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
            stdio: 'ignore'
        });
        await waitForPort(PORT, 20000);
    }, 30000);

    afterAll(() => {
        gateway?.kill();
        rmSync(stateRoot, { recursive: true, force: true });
    });

    it('connect-handshakes, receives advancing profile ticks, and invokes health', async () => {
        const profiles: KernelBridgeCachedProfile[] = [];
        const statuses: KernelBridgeConnectionStatus[] = [];
        const client = new GatewayClient(
            `ws://127.0.0.1:${PORT}`,
            {
                onProfile: p => profiles.push(p),
                onStatus: s => statuses.push(s)
            },
            url => new WsWebSocket(url) as unknown as WebSocketLike
        );
        client.start('lite');

        try {
            await new Promise<void>((resolveDone, rejectDone) => {
                const timeout = setTimeout(
                    () => rejectDone(new Error(`no 3 advancing ticks within 20s (got ${profiles.length})`)),
                    20000
                );
                const poll = setInterval(() => {
                    if (profiles.length >= 3) {
                        clearInterval(poll);
                        clearTimeout(timeout);
                        resolveDone();
                    }
                }, 200);
            });

            // connected only after the real connect handshake succeeded
            expect(statuses.some(s => s.state === 'connected' && s.reason.includes('connect-ok'))).toBe(true);
            // generations advance monotonically
            const gens = profiles.map(p => p.generation);
            expect(gens.every((g, i) => i === 0 || g > gens[i - 1])).toBe(true);
            // the profile payload is the kernel projection (harmonicProfile present)
            expect((profiles[0].profile as { harmonicProfile?: unknown }).harmonicProfile).toBeDefined();
            // Sprint-8 E3: the modulation graph carries the tick from the
            // KERNEL phase-space projection on the live wire — source
            // 'kernel', never local arithmetic, for every division aperture
            const snapshot = harmonicSnapshot(profiles[0].profile);
            expect(snapshot.phaseSpace).not.toBeNull();
            for (let index = 0; index < 16; index++) {
                const division = deriveDivision(snapshot, index);
                expect(division.source).toBe('kernel');
                expect(division.segment).toBe(
                    Math.floor((snapshot.degree360 ?? 0) / division.slice)
                );
            }
            expect(deriveDivision(snapshot, 13).subdivision).toBe(4); // Quadrant gears
            expect(snapshot.phaseSpace!.fibonacciGround.position).toBe(
                Math.floor((snapshot.degree360 ?? 0) / 6)
            );
            // Sprint-8 E4: the live modal resonator's silent complement rides
            // the cymatic frame as the five structured constraint anchors
            const liveFrame = deriveFrame(
                { generation: profiles[0].generation, hp: snapshot, kleinValence: 1, axisFlipped: false },
                null,
                { divisionIndex: 6, live: true, tickAtMs: 0, flipAtMs: -1 },
                0,
                0
            );
            expect(liveFrame.cymatic).not.toBeNull();
            expect(liveFrame.cymatic!.silentAnchors).toHaveLength(5);
            // Sprint-8 E6: the identity handle rides the wire when (and only
            // when) a local PASU identity exists — machine-dependent, so the
            // SHAPE is asserted when present and its absence is honest.
            if (snapshot.quintessence) {
                const q = snapshot.quintessence;
                expect(q.natalDegree).toBeGreaterThanOrEqual(0);
                expect(q.natalDegree).toBeLessThan(360);
                expect(/^[0-9a-f]{8}$/.test(q.hashPreview)).toBe(true);
                expect(q.layerCount).toBeLessThanOrEqual(5);
                expect(q.partial).toBe(q.layerCount < 5);
                const mag = Math.sqrt(
                    q.quintessenceQuaternion.reduce((sum, v) => sum + v * v, 0)
                );
                expect(mag).toBeCloseTo(1, 3); // unit ground reference
                console.log(
                    `[quintessence-wire] natal=${q.natalDegree}° tick12=${q.natalTick12} weight=${q.quintessenceWeight.toFixed(3)} layers=${q.layerCount}/5 partial=${q.partial} preview=${q.hashPreview}`
                );
            } else {
                console.log('[quintessence-wire] absent — no local PASU identity anchored');
            }
            // a real invoke round-trips post-connect
            const receipt = await client.invoke('health', {});
            expect(receipt.artifact).toBeDefined();
        } finally {
            client.dispose();
        }
    }, 30000);

    // 29.T29.9 — the contemplation flow's whole claim is that the 4'-5'-0'
    // triplet crosses a real wire into the carrier's parser. A jsdom fixture
    // can only prove the parser against a literal I wrote; this proves it
    // against what the gateway actually composes and serialises.
    it("composes the 4'-5'-0' contemplation triplet over the real wire", async () => {
        const client = new GatewayClient(
            `ws://127.0.0.1:${PORT}`,
            { onProfile: () => {}, onStatus: () => {} },
            url => new WsWebSocket(url) as unknown as WebSocketLike
        );
        client.start('lite');

        try {
            await new Promise<void>((resolveDone, rejectDone) => {
                const timeout = setTimeout(() => rejectDone(new Error('no connect within 20s')), 20000);
                const poll = setInterval(async () => {
                    try {
                        await client.invoke('health', {});
                        clearInterval(poll);
                        clearTimeout(timeout);
                        resolveDone();
                    } catch {
                        /* not connected yet */
                    }
                }, 300);
            });

            // The canonical synthetic object from the gateway's own dispatch
            // test (Body/S/S3/gateway/tests/contemplation_rpc_dispatches.rs).
            const receipt = await client.invoke(CONTEMPLATION_FLOW_RPCS.live, {
                session_id: 'live-smoke-29-t29-9',
                q_nara: 'q_Nara',
                pi_instance: {
                    id: 'deterministic-pi-4p',
                    deterministic_mock: true,
                    loaded_agents: ['Nous', 'Moirai', 'Sophia', 'Psyche'],
                    recognition_state: 'recognition-state integrates close-of-session contour'
                },
                engaged_coordinates: [
                    { coordinate: 'M3.COMP', target_resonance_vector: [0.4, 0.2, 0.1] },
                    { coordinate: 'M3.MOVE', target_resonance_vector: [0.3, 0.5, 0.2] },
                    { coordinate: 'M3.RES', target_resonance_vector: [0.1, 0.3, 0.6] }
                ],
                trajectory: [
                    { tick_id: 't0', gauge: 'COMP', actual_resonance: [0.38, 0.22, 0.12], codon: 'I' },
                    { tick_id: 't1', gauge: 'MOVE', actual_resonance: [0.31, 0.47, 0.19], codon: 'V' },
                    { tick_id: 't2', gauge: 'RES', actual_resonance: [0.09, 0.33, 0.58], codon: 'X' }
                ],
                psyche_anchor: { cards: ['The Fool', 'The Hierophant'], codons: ['I', 'V'] },
                verifier_report: {
                    virtue_witness_vector: [true, true, true, true, true, false, true, false, true],
                    unsatisfied_constraints: ['#R0-0/1/A-T7-pending?'],
                    coherence_score: 0.82
                }
            });

            // The carrier's own parser, against the gateway's own bytes.
            const read = readContemplateSessionCloseResponse(receipt.artifact);
            expect(read.state, `parser refused the live response: ${JSON.stringify(receipt.artifact)}`).toBe(
                'ready'
            );
            if (read.state !== 'ready') throw new Error('expected a live contemplation');

            expect(read.sessionId).toBe('live-smoke-29-t29-9');
            expect(read.wisdomDelta.length).toBeGreaterThan(0);
            expect(read.llm.position).toBe("4'");
            expect(read.ebm.position).toBe("5'");
            expect(read.verifier.position).toBe("0'");
            // The gateway saw all three gauges, so its trio verdict is coherent.
            expect(read.ebm.gaugeTrioCoherent).toBe(true);
            expect(read.verifier.witnessBits).toHaveLength(9);
            // Bit 8 (Reality — Completion) is set, so arch-9 wholeness holds.
            expect(read.verifier.arch9Wholeness).toBe(true);
            // The symbolic round trip was made server-side; the chips read it.
            expect(read.symbolicRoundTrips).toHaveLength(1);
            expect(read.symbolicRoundTrips[0].parserSkill).toBe('anuttara-symbolic-parse');

            const directive = buildContemplationFlowDirective(read);
            expect(directive.state).toBe('ready');
            expect(directive.source).toBe('live');
            expect(contemplationSlotsLanded(directive)).toBe(true);
            expect(directive.left.ribbon.length).toBeGreaterThan(0);
            console.log(
                `[contemplation-wire] ${directive.sessionId} squares=${directive.right.squareCoherence.join('/')} ` +
                    `lamps=${directive.under.lamps.filter(l => l.lit).length}/9 questions=${directive.under.questions.length}`
            );
        } finally {
            client.dispose();
        }
    }, 40000);
});
