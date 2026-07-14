#!/usr/bin/env node
/**
 * Coordinate: M'/S3' (live-wire projection harness — Track 00.T2 + hardening T12/T13)
 * Residency: Body/M/pratibimba-app/scripts/live-wire.mjs
 * Position (#n): #5 — Integration; the growing behavioral proof of the gateway bus
 * Actualises: [[00-verification-harness]] T2 — spawn a REAL `epi gate start`,
 *   capture EVERY event channel the gateway broadcasts, strict-parse every
 *   frame against the Zod contracts (epi-cli/schemas), assert the declared
 *   projection manifest, dump the capture to plan.runs/wire-captures/.
 *   [[00-verification-harness-hardening]] T12 — manifest grown to the full
 *   typed profile surface with a field-coverage closure (uncovered field =
 *   FAIL) and the DR-M4-3 handle-only quintessence law; T13 — all bus
 *   channels (tick/health/heartbeat/connect.challenge) captured + parsed,
 *   declared-but-silent channels reported as DECLARED_NOT_EMITTED.
 * Public surface: PROJECTION_MANIFEST, EXEMPT_PROFILE_FIELDS,
 *   DECLARED_OPTIONAL_PROJECTIONS, validateCapture, captureLive, main;
 *   CLI: node scripts/live-wire.mjs [--replay <fixture.json>] [--port N]
 *        [--profiles N] [--out <dir>] [--no-dump]
 * Does NOT own: the contracts (epi-cli/schemas is the Zod law); the gateway
 *   protocol (S3 gateway-contract); suite orchestration (verify-all.mjs).
 * Contract: every rerun tranche that lands a profile field or gateway method
 *   MUST register its assertion in PROJECTION_MANIFEST — absence of declared
 *   coverage is a FAIL, never a silent skip. A profile field present on the
 *   wire but neither manifest-covered nor EXEMPT (with justification) FAILS
 *   the run. Declared-but-not-emitted surfaces are PRINTED, never faked green.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import WebSocket from 'ws';

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(appRoot, '..', '..', '..');
const SCHEMAS_ROOT = join(repoRoot, 'Body', 'S', 'S0', 'epi-cli', 'schemas');
const DEFAULT_EPI_BIN =
    process.env.EPI_BIN ?? join(repoRoot, 'target', 'debug', 'epi'); // shared-target pool (.cargo/config.toml)
const DEFAULT_CAPTURE_DIR = join(
    repoRoot,
    'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans',
    '2026-07-03-m-prime-cycle-3-full-rerun', 'plan.runs', 'wire-captures'
);
const DEFAULT_PORT = 18922;
const DEFAULT_PROFILE_TARGET = 5;

let contractsPromise = null;
/** Zod contracts from the built schemas package (the one contract authority). */
function loadContracts() {
    contractsPromise ??= import(pathToFileURL(join(SCHEMAS_ROOT, 'dist', 'index.js')).href);
    return contractsPromise;
}

const frameName = frame => frame.event ?? frame.method ?? null;

/**
 * The S3 wire decorates EVERY event payload with bus-envelope keys before
 * send (`event_frame`, epi-cli src/gate/server/observability.rs): seq, and
 * runId/sessionKey when routed. These are envelope metadata, not part of the
 * domain frame contracts — strip exactly these before a strict domain parse.
 */
const BUS_DECORATION_KEYS = ['seq', 'runId', 'sessionKey'];
function stripBusDecoration(payload) {
    if (payload === null || typeof payload !== 'object') return payload;
    const clean = { ...payload };
    for (const key of BUS_DECORATION_KEYS) delete clean[key];
    return clean;
}
const framesOf = (capture, name) => capture.frames.filter(f => frameName(f) === name);
const profileFrames = capture => framesOf(capture, 'profile.update');
const profilesOf = capture =>
    profileFrames(capture)
        .map(f => f.payload?.harmonicProfile)
        .filter(Boolean);

function zodIssues(error) {
    return (error.issues ?? []).slice(0, 5)
        .map(issue => `${issue.path.join('.')}: ${issue.message}`);
}

/** Strict-parse `value` with `schema`; push formatted errors into `errors`. */
function parseInto(errors, schema, value, label) {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
        errors.push(`${label}: ${zodIssues(parsed.error).join('; ')}`);
        return null;
    }
    return parsed.data;
}

/**
 * T12.5 EXEMPT list — profile fields whose coverage lives in the strict
 * MathemeHarmonicProfile parse (schema-pinned literal/bounds) rather than a
 * dedicated manifest entry. Every entry MUST carry an honest one-line
 * justification; a stale entry (field later manifest-covered) FAILS.
 */
export const EXEMPT_PROFILE_FIELDS = {
    profileSchemaVersion: 'pinned z.literal(1) in the MathemeHarmonicProfile strict parse',
    privacyClass: 'pinned z.literal("public-current-context") in the strict parse',
    profileProvenance: 'provenance record owned by portal-core; no cross-field law on the current basis (record shape only)',
    tickAddress: 'typed sub-object in the strict parse; tick arithmetic is cross-locked by the modalResonator.tick entry',
    cycle: 'monotone clock cycle; bounds pinned in the strict parse, cadence asserted by event:tick timestamps',
    su2Layer: 'string surface pinned in the strict parse; SU(2) layer law asserted via phaseSpace shadowDegree',
    phase: 'kernel phase label pinned in the strict parse; no cross-field law typed yet in the contract',
    ratioRole: 'string surface pinned in the strict parse; harmonic ratio law lives in the C kernel tests',
    lensMode: 'Rust-order bounds (lens 0..11, mode 0..6) pinned in the schema after the bell-spec §6 drift fix',
    chromatic: 'still z.record in the contract — portal-core MathemeChromaticProfile not yet typed; tracked as a contract gap',
    elements: 'still z.record in the contract — elemental projection not yet typed; tracked as a contract gap',
    planetaryChakral: 'still z.record in the contract — not yet typed; tracked as a contract gap',
    binary: 'still z.record in the contract; binary==mahamaya identity asserted in schemas tests against the baseline fixture',
    codonRotationProjection: 'still z.record in the contract — not yet typed; chime m3 carries it nullable',
    qCosmic: 'quaternion-or-scalar union with length-4 law pinned in the strict parse',
    resonance: 'nullable scalar pinned in the strict parse (Rust Option<f32>)',
    conjugateFormCharacter: 'string surface pinned in the strict parse',
    nodalQuartet: 'length-4 law pinned in the strict parse; nodal role truth asserted through modalResonator.nodalQuartet in the schema',
    m1Topology: 'typed M1TopologyProjection pinned in the strict parse; the 720°/genus-1/Euler-0 double-cover + Hopf-fibration + Klein-flip topology law is asserted in portal-core + schemas tests (Track 02.T2.3)',
    inversionOperator: 'handle-only InversionOperatorHandle pinned in the strict parse (operator/handle/provenance); the single session-held # (0/1) identity — the same operator at every coordinate — is asserted in portal-core + schemas tests (Track 02.T2.5, M1\'-SPEC §14)',
};

/**
 * Optional projections DECLARED by the contract (MathemeHarmonicProfile /
 * kernel/profile.rs skip-serialized Options). When the live gateway emits
 * one, it must strict-parse; when it is silent on the current basis it is
 * REPORTED as declared-not-emitted — honest absence, never a fake green.
 * `schema: null` marks contract fields still typed as z.unknown(): if one of
 * those ever shows up on the wire the run FAILS until it gets a real schema.
 */
export const DECLARED_OPTIONAL_PROJECTIONS = [
    { field: 'pasuBeingPattern', schema: 'PasuBeingPatternProjection' },
    { field: 'anuttaraWitness', schema: 'AnuttaraWitnessProjection' },
    { field: 'vakLanguificationTrace', schema: 'VakLanguificationTrace' },
    { field: 'cosmicCompositionState', schema: null },
    { field: 'personalPole', schema: null },
    { field: 'psychoidField', schema: null },
    { field: 'canonRecognitionStream', schema: null },
    { field: 'vakAddress', schema: null },
];

/**
 * Event channels with a registered Zod contract (T13). Channels the gateway
 * can broadcast but that carry no schema yet (chat, agent, cron.fired,
 * cron.error, s3'.subscription.lifecycle) FAIL the taxonomy entry if they
 * ever appear in a capture — forced contract growth, not silent tolerance.
 */
const EVENT_CHANNEL_CONTRACTS = {
    tick: 'GatewayTickEvent',
    health: 'GatewayHealthEvent',
    heartbeat: 'GatewayHeartbeatEvent',
    'connect.challenge': 'GatewayConnectChallengeEvent',
};

/** DR-M4-3: the exact handle-only key set permitted to cross the bus. */
const QUINTESSENCE_ALLOWED_KEYS = [
    'natalDegree',
    'natalTick12',
    'quintessenceWeight', // the ONE permitted resonance scalar (q_personal_resonance surface)
    'layerCount',
    'partial',
    'hashPreview',
    'quintessenceQuaternion',
    'authority',
];

/**
 * The declared projection manifest — the growing proof of the bus.
 * Each entry: { name, required, covers, describe, assert(capture, contracts) -> string[] }.
 * `covers` names the profile fields whose behavioral law this entry owns —
 * the field-coverage closure diffs live payload keys against
 * union(covers) ∪ EXEMPT_PROFILE_FIELDS and FAILS on any gap.
 */
export const PROJECTION_MANIFEST = [
    {
        name: 'profile.strict-parse',
        required: true,
        covers: [],
        describe: 'every profile.update payload parses MathemeHarmonicProfile strict; envelope sane',
        assert(capture, contracts) {
            const errors = [];
            const frames = profileFrames(capture);
            if (frames.length === 0) {
                errors.push('no profile.update frames captured');
            }
            frames.forEach((frame, index) => {
                const payload = frame.payload ?? {};
                if (typeof payload.generation !== 'number') {
                    errors.push(`frame[${index}]: payload.generation missing`);
                }
                if (payload.privacy !== 'safe-public-current-kernel-tick') {
                    errors.push(`frame[${index}]: envelope privacy '${payload.privacy}' != safe-public-current-kernel-tick`);
                }
                if (payload.projectionOwner !== "S3'") {
                    errors.push(`frame[${index}]: envelope projectionOwner '${payload.projectionOwner}' != S3'`);
                }
                const parsed = contracts.MathemeHarmonicProfile.safeParse(payload.harmonicProfile);
                if (!parsed.success) {
                    errors.push(`frame[${index}] generation=${payload.generation}: ${zodIssues(parsed.error).join('; ')}`);
                }
            });
            return errors;
        }
    },
    {
        name: 'phaseSpace',
        required: true,
        covers: ['phaseSpace', 'degree360', 'degree720'],
        describe: 'Sprint-8 E1/E3 phase-space address carried and self-consistent',
        assert(capture) {
            const carriers = profilesOf(capture).filter(p => p.phaseSpace);
            if (carriers.length === 0) return ['no profile frame carried phaseSpace'];
            const errors = [];
            for (const profile of carriers) {
                const ps = profile.phaseSpace;
                if (ps.degree360 !== profile.degree360) {
                    errors.push(`phaseSpace.degree360 ${ps.degree360} != profile.degree360 ${profile.degree360}`);
                }
                if (ps.node.degree360 !== ps.degree360) {
                    errors.push(`node.degree360 ${ps.node.degree360} != phaseSpace.degree360 ${ps.degree360}`);
                }
                if (ps.node.exactDegree720 !== ps.node.degree360 * 2) {
                    errors.push(`node.exactDegree720 ${ps.node.exactDegree720} != degree360*2`);
                }
                if (ps.node.shadowDegree !== ps.node.degree360 + 360) {
                    errors.push(`node.shadowDegree ${ps.node.shadowDegree} != degree360+360`);
                }
            }
            return errors;
        }
    },
    {
        name: 'modalResonator',
        required: true,
        covers: ['modalResonator', 'audioOctet', 'tick'],
        describe: 'bell-kernel projection: liveOctet[i].hz === audioOctet[i], tick-locked',
        assert(capture) {
            const carriers = profilesOf(capture).filter(p => p.modalResonator);
            if (carriers.length === 0) return ['no profile frame carried modalResonator'];
            const errors = [];
            for (const profile of carriers) {
                const mr = profile.modalResonator;
                mr.liveOctet.forEach((carrier, i) => {
                    if (carrier.hz !== profile.audioOctet[i]) {
                        errors.push(`liveOctet[${i}].hz ${carrier.hz} != audioOctet[${i}] ${profile.audioOctet[i]}`);
                    }
                });
                if (mr.tick !== profile.tick) errors.push(`modalResonator.tick ${mr.tick} != profile.tick ${profile.tick}`);
                if (mr.degree720 !== profile.degree720) {
                    errors.push(`modalResonator.degree720 ${mr.degree720} != profile.degree720 ${profile.degree720}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'mahamayaBridgeLaws',
        required: true,
        covers: ['mahamaya'],
        describe: 'the 72→64 bridge on the wire (2026-07-06 truth session): m2ToM3Symbol == floor(idx·8/9), address64 == floor(deg·64/360), lineChangeOperatorAddress == hexagramId·6 + lineIndex, evolutionaryGap ⇔ idx ≢ 0 (mod 9)',
        assert(capture) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const m = profile.mahamaya;
                if (!m) { errors.push('profile frame missing mahamaya projection'); continue; }
                const idx = m.m2VibrationIndex;
                const expectedSymbol = Math.min(Math.floor((idx * 8) / 9), 63);
                if (m.m2ToM3Symbol !== expectedSymbol) {
                    errors.push(`m2ToM3Symbol ${m.m2ToM3Symbol} != floor(${idx}·8/9) = ${expectedSymbol}`);
                }
                const expectedGap = idx % 9 !== 0;
                if (m.evolutionaryGap !== expectedGap) {
                    errors.push(`evolutionaryGap ${m.evolutionaryGap} != (idx ${idx} ≢ 0 mod 9)`);
                }
                if (m.mahamayaAddress64 != null) {
                    const expectedAddr = Math.floor(((profile.degree360 % 360) * 64) / 360);
                    if (m.mahamayaAddress64 !== expectedAddr) {
                        errors.push(`mahamayaAddress64 ${m.mahamayaAddress64} != floor(${profile.degree360}·64/360) = ${expectedAddr}`);
                    }
                }
                const expectedOperator = m.hexagramId * 6 + (m.lineIndex % 6);
                if (m.lineChangeOperatorAddress !== expectedOperator) {
                    errors.push(`lineChangeOperatorAddress ${m.lineChangeOperatorAddress} != hexagramId·6+line = ${expectedOperator}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'kleinFlip',
        required: true,
        covers: ['kleinFlip'],
        describe: 'the typed three-variant flip union (T12 discharge 2026-07-06): null between flips; when present, parses the typed KleinFlipEvent and the M1 tritone crossing rides its own tick',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                if (profile.kleinFlip === undefined) {
                    errors.push('kleinFlip missing entirely — the profile serializes it null-or-event on every tick');
                    continue;
                }
                if (profile.kleinFlip === null) continue;
                const parsed = contracts.KleinFlipEvent.safeParse(profile.kleinFlip);
                if (!parsed.success) {
                    errors.push(`kleinFlip failed the typed parse: ${zodIssues(parsed.error).join('; ')}`);
                    continue;
                }
                if (parsed.data.kind === 'm1TritoneCrossing' && parsed.data.tick12 !== profile.tick12) {
                    errors.push(`m1TritoneCrossing.tick12 ${parsed.data.tick12} != profile.tick12 ${profile.tick12}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'planetDegrees',
        required: true,
        covers: ['planetDegrees'],
        describe: 'kairos planet atlas (cosmic-clock §5.3 kairos_valid law): attached only when the kairos cache is fresh+complete — absent TOGETHER with livePlanets while kairos is pending; when present, 10 bodies in [0,360)',
        assert(capture) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const hasDegrees = profile.planetDegrees != null;
                const hasLive = profile.livePlanets != null;
                // §5.3: the heartbeat attaches BOTH or NEITHER — a split pair
                // is never an honest pending state.
                if (hasDegrees !== hasLive) {
                    errors.push(
                        `kairos pair split: planetDegrees ${hasDegrees ? 'present' : 'absent'} but livePlanets ${hasLive ? 'present' : 'absent'}`,
                    );
                }
                if (!hasDegrees) continue;
                if (profile.planetDegrees.length !== 10) {
                    errors.push(`planetDegrees carries ${profile.planetDegrees.length} bodies, law is 10`);
                }
                profile.planetDegrees.forEach((degree, i) => {
                    if (!(degree >= 0 && degree < 360)) {
                        errors.push(`planetDegrees[${i}] ${degree} out of [0,360)`);
                    }
                });
            }
            return errors;
        }
    },
    {
        name: 'livePlanets',
        required: true,
        covers: ['livePlanets'],
        describe: 'live Kerykeion sky when kairos is fresh (§5.3): degrees mirror planetDegrees, decans derived; absence = honest kairos-pending (pair law asserted under planetDegrees)',
        assert(capture) {
            const carriers = profilesOf(capture).filter(p => p.livePlanets);
            if (carriers.length === 0) return [];
            const errors = [];
            for (const profile of carriers) {
                const ids = profile.livePlanets.map(p => p.planetId).sort((a, b) => a - b);
                if (ids.join(',') !== '0,1,2,3,4,5,6,7,8,9') {
                    errors.push(`livePlanets planetIds not a 0..9 permutation: ${ids.join(',')}`);
                }
                for (const planet of profile.livePlanets) {
                    const busDegree = profile.planetDegrees?.[planet.planetId];
                    if (busDegree !== undefined && planet.degree !== busDegree) {
                        errors.push(`livePlanets[planet ${planet.planetId}].degree ${planet.degree} != planetDegrees ${busDegree}`);
                    }
                    if (planet.decan36 !== Math.floor(planet.degree / 10) % 36) {
                        errors.push(`livePlanets[planet ${planet.planetId}].decan36 ${planet.decan36} not derived from degree ${planet.degree}`);
                    }
                }
            }
            return errors;
        }
    },
    {
        name: 'quintessence',
        required: true,
        covers: ['quintessence'],
        describe: 'DR-M4-3 handle-only law: exact allowed key set, 8-hex preview (never a longer digest), unit elemental quaternion, quintessenceWeight the single resonance scalar — any raw identity body FAILS',
        assert(capture, contracts) {
            const carriers = profilesOf(capture).filter(p => p.quintessence);
            if (carriers.length === 0) return ['no profile frame carried quintessence'];
            const errors = [];
            for (const profile of carriers) {
                const q = profile.quintessence;
                const parsed = parseInto(errors, contracts.QuintessenceProjection, q, 'quintessence');
                // exact key law — the strict parse enforces this too, but the
                // diff names the leaked key explicitly for the audit trail
                for (const key of Object.keys(q)) {
                    if (!QUINTESSENCE_ALLOWED_KEYS.includes(key)) {
                        errors.push(`quintessence carries forbidden key '${key}' (DR-M4-3 handle-only)`);
                    }
                }
                // digest-width law: the 8-hex preview is the ONLY digest that
                // may cross; any ≥16-hex run inside a STRING value is a raw
                // hash / identity-body leak. (Scan string values only — float
                // precision digits are not digests.)
                for (const value of Object.values(q)) {
                    if (typeof value !== 'string') continue;
                    const digest = value.match(/[0-9a-f]{16,}/);
                    if (digest) {
                        errors.push(`quintessence leaks a ${digest[0].length}-hex digest in a string value — only the 8-hex hashPreview may cross`);
                    }
                }
                if (!parsed) continue;
                // elemental-balance class: unit rotation quaternion
                const norm = Math.hypot(...parsed.quintessenceQuaternion);
                if (Math.abs(norm - 1) > 0.01) {
                    errors.push(`quintessenceQuaternion norm ${norm.toFixed(4)} not a unit rotation (clock_state quaternion law)`);
                }
                if (parsed.quintessenceQuaternion.some(c => c < -1 || c > 1)) {
                    errors.push('quintessenceQuaternion component out of [-1,1]');
                }
            }
            return errors;
        }
    },
    {
        name: 'bedrock',
        required: true,
        covers: ['bedrock', 'position6'],
        describe: 'psychoid-number bedrock derives from position6: #n / #n\' / successor #(n+1)%6, möbius-return only at #5',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.MathemeBedrockProjection, profile.bedrock, 'bedrock');
                if (!parsed) continue;
                const p = profile.position6;
                if (parsed.psychoidNumber !== `#${p}`) {
                    errors.push(`bedrock.psychoidNumber ${parsed.psychoidNumber} != #${p} (position6)`);
                }
                if (parsed.invertedPsychoidNumber !== `#${p}'`) {
                    errors.push(`bedrock.invertedPsychoidNumber ${parsed.invertedPsychoidNumber} != #${p}'`);
                }
                if (parsed.successorPsychoidNumber !== `#${(p + 1) % 6}`) {
                    errors.push(`bedrock.successorPsychoidNumber ${parsed.successorPsychoidNumber} != #${(p + 1) % 6}`);
                }
                const expectedRelation = p === 5 ? 'mobius-return' : 'epogdoon-tick';
                if (parsed.successorRelation !== expectedRelation) {
                    errors.push(`bedrock.successorRelation ${parsed.successorRelation} != ${expectedRelation} at position ${p}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'graphHandle',
        required: true,
        covers: ['graphHandle', 'helix'],
        describe: 'pre-resolved S2 anchor (S2-ARCHITECTURE §4.3): strict parse, axis mirrors the profile helix',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.GraphAnchorProjection, profile.graphHandle, 'graphHandle');
                if (!parsed) continue;
                if (parsed.axis !== profile.helix) {
                    errors.push(`graphHandle.axis ${parsed.axis} != profile.helix ${profile.helix}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'depositionAnchor',
        required: true,
        covers: ['depositionAnchor', 'resonance72'],
        describe: 'episodic deposition anchor: strict parse, resonance72Index locked to resonance72.lensAnchorIndex, s3Method exists on the LIVE gateway method surface',
        assert(capture, contracts) {
            const errors = [];
            const hello = capture.frames.find(f => f.type === 'hello-ok');
            const liveMethods = hello?.features?.methods ?? null;
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.DepositionAnchorProjection, profile.depositionAnchor, 'depositionAnchor');
                if (!parsed) continue;
                if (parsed.resonance72Index !== profile.resonance72?.lensAnchorIndex) {
                    errors.push(`depositionAnchor.resonance72Index ${parsed.resonance72Index} != resonance72.lensAnchorIndex ${profile.resonance72?.lensAnchorIndex}`);
                }
                if (liveMethods && !liveMethods.includes(parsed.s3Method)) {
                    errors.push(`depositionAnchor.s3Method '${parsed.s3Method}' not on the live gateway method surface`);
                }
            }
            return errors;
        }
    },
    {
        name: 'futureAnchors',
        required: true,
        covers: ['s2Anchor', 's3Anchor'],
        describe: 'cycle-2 s2/s3 anchors: non-null on the current basis, strict parse, coordinate agrees with graphHandle.canonicalForm',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                for (const key of ['s2Anchor', 's3Anchor']) {
                    const anchor = profile[key];
                    if (anchor == null) {
                        errors.push(`${key} null — the kernel constructor anchors both on every tick (kernel/profile.rs from_tick)`);
                        continue;
                    }
                    const parsed = parseInto(errors, contracts.MathemeFutureAnchor, anchor, key);
                    if (parsed && parsed.coordinate !== profile.graphHandle?.canonicalForm) {
                        errors.push(`${key}.coordinate ${parsed.coordinate} != graphHandle.canonicalForm ${profile.graphHandle?.canonicalForm}`);
                    }
                }
            }
            return errors;
        }
    },
    {
        name: 'anandaVortex',
        required: true,
        covers: ['anandaVortex', 'tick12'],
        describe: 'M1 vortex walk: activeCell=(tick12,position6), flip flag at tick12==5, helixSheet from degree720, Vedic dr-ring phases',
        assert(capture, contracts) {
            const errors = [];
            const MAHAMAYA_RING = [1, 2, 4, 8, 7, 5];
            const PARASHAKTI_RING = [3, 6, 9];
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.AnandaVortexProjection, profile.anandaVortex, 'anandaVortex');
                if (!parsed) continue;
                if (parsed.activeCell[0] !== profile.tick12 || parsed.activeCell[1] !== profile.position6) {
                    errors.push(`anandaVortex.activeCell [${parsed.activeCell}] != (tick12 ${profile.tick12}, position6 ${profile.position6})`);
                }
                if (parsed.kleinFlipAtThisTick !== (profile.tick12 === 5)) {
                    errors.push(`anandaVortex.kleinFlipAtThisTick ${parsed.kleinFlipAtThisTick} != (tick12==5) at tick12 ${profile.tick12}`);
                }
                if (parsed.helixSheet !== (profile.degree720 >= 360 ? 1 : 0)) {
                    errors.push(`anandaVortex.helixSheet ${parsed.helixSheet} != degree720-derived sheet (degree720 ${profile.degree720})`);
                }
                const ringIdx = profile.tick12 % 6;
                if (parsed.drRingPhase.mahamayaIdx !== MAHAMAYA_RING[ringIdx]) {
                    errors.push(`drRingPhase.mahamayaIdx ${parsed.drRingPhase.mahamayaIdx} != Vedic ring ${MAHAMAYA_RING[ringIdx]} at tick12 ${profile.tick12}`);
                }
                if (parsed.drRingPhase.parashaktiIdx !== PARASHAKTI_RING[ringIdx % 3]) {
                    errors.push(`drRingPhase.parashaktiIdx ${parsed.drRingPhase.parashaktiIdx} != trinity ring ${PARASHAKTI_RING[ringIdx % 3]}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'anuttaraPentadicTrace',
        required: true,
        covers: ['anuttaraPentadicTrace'],
        describe: 'Track 36/10.P5 pentadic runtime hinge: trace rides every frame; complement closes on 5; epogdoon 8/9 + mahamaya 64/360 laws; identity strings kernel-sourced',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.AnuttaraPentadicRuntimeTrace, profile.anuttaraPentadicTrace, 'anuttaraPentadicTrace');
                if (!parsed) continue;
                if (parsed.tick12 !== profile.tick12) {
                    errors.push(`anuttaraPentadicTrace.tick12 ${parsed.tick12} != profile tick12 ${profile.tick12}`);
                }
                const [left, right] = parsed.familyBComplement;
                if (left + right !== 5) {
                    errors.push(`familyBComplement [${left},${right}] must close on the whole-number hinge 5`);
                }
                if (parsed.m2ToM3Symbol !== Math.floor((parsed.resonance72Index * 8) / 9)) {
                    errors.push(`m2ToM3Symbol ${parsed.m2ToM3Symbol} breaks the epogdoon 8/9 law for resonance72Index ${parsed.resonance72Index}`);
                }
                if (parsed.mahamayaAddress64 !== Math.floor((parsed.degree360 % 360) * 64 / 360)) {
                    errors.push(`mahamayaAddress64 ${parsed.mahamayaAddress64} breaks the 64/360 address law for degree360 ${parsed.degree360}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'harmonicGrammar',
        required: true,
        covers: ['harmonicGrammar'],
        describe: 'lens-pair grammar (harmonic_grammar.rs from_tick): bimba L{p}/L{p+1} Day/depth-2/NONE, pratibimba COMPLEMENTARY L{p}/L{5-p} Night/depth-3/D_LEFT, A/B/C family table per pair (empty pairs honest)',
        assert(capture, contracts) {
            const errors = [];
            // harmonic_families_for_pair table: pair -> family letters
            const FAMILY_TABLE = {
                '0,1': ['A'], '4,5': ['A'], '2,3': ['A', 'B'],
                '0,5': ['B'], '1,4': ['B'],
                '1,2': ['C'], '3,4': ['C'], '5,0': ['C'],
            };
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.MathemeHarmonicGrammarProjection, profile.harmonicGrammar, 'harmonicGrammar');
                if (!parsed) continue;
                const p = profile.position6;
                const prime = profile.helix === 'pratibimba';
                const second = prime ? 5 - p : (p + 1) % 6;
                if (parsed.basePair !== `L${p}/L${second}`) {
                    errors.push(`harmonicGrammar.basePair ${parsed.basePair} != L${p}/L${second} (helix ${profile.helix})`);
                }
                if (parsed.primaryAnchor !== (prime ? 'Night' : 'Day')) {
                    errors.push(`harmonicGrammar.primaryAnchor ${parsed.primaryAnchor} != ${prime ? 'Night' : 'Day'}`);
                }
                if (parsed.dFace !== (prime ? 'D_LEFT' : 'NONE')) {
                    errors.push(`harmonicGrammar.dFace ${parsed.dFace} != ${prime ? 'D_LEFT' : 'NONE'}`);
                }
                if (parsed.depth !== (prime ? 3 : 2)) {
                    errors.push(`harmonicGrammar.depth ${parsed.depth} != ${prime ? 3 : 2}`);
                }
                const expectedLenses = [prime ? `L${p}'` : `L${p}`, `L${second}`];
                if (parsed.activeLenses.join('|') !== expectedLenses.join('|')) {
                    errors.push(`harmonicGrammar.activeLenses [${parsed.activeLenses}] != [${expectedLenses}]`);
                }
                const expectedFamilies = FAMILY_TABLE[`${p},${second}`] ?? [];
                if (parsed.families.map(f => f.family).join('') !== expectedFamilies.join('')) {
                    errors.push(`harmonicGrammar.families [${parsed.families.map(f => f.family)}] != table [${expectedFamilies}] for pair (${p},${second})`);
                }
            }
            return errors;
        }
    },
    {
        name: 'pointerAnchor',
        required: true,
        covers: ['pointerAnchor'],
        describe: 'Bedrock7/PointerWeb36 anchor: strict parse, qlPosition/helix locked to the profile tick',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.MathemePointerAnchorProjection, profile.pointerAnchor, 'pointerAnchor');
                if (!parsed) continue;
                if (parsed.qlPosition !== profile.position6) {
                    errors.push(`pointerAnchor.qlPosition ${parsed.qlPosition} != position6 ${profile.position6}`);
                }
                if (parsed.helix !== profile.helix) {
                    errors.push(`pointerAnchor.helix ${parsed.helix} != profile.helix ${profile.helix}`);
                }
            }
            return errors;
        }
    },
    {
        name: 'contextFrames',
        required: true,
        covers: ['contextFrames', 'diatonic'],
        describe: 'CF7 web: strict parse, frameCount 7, active trio null exactly on non-diatonic ticks, activeFrameIndex = diatonic.degree-1',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                const parsed = parseInto(errors, contracts.MathemeContextFrameWebProjection, profile.contextFrames, 'contextFrames');
                if (!parsed) continue;
                if (parsed.frameCount !== 7) {
                    errors.push(`contextFrames.frameCount ${parsed.frameCount} != 7 (CF7)`);
                }
                if (profile.diatonic === null) {
                    if (parsed.activeFrame !== null || parsed.activeFrameIndex !== null || parsed.activeAgent !== null) {
                        errors.push('contextFrames active trio non-null on a non-diatonic tick');
                    }
                } else {
                    if (parsed.activeFrameIndex !== profile.diatonic.degree - 1) {
                        errors.push(`contextFrames.activeFrameIndex ${parsed.activeFrameIndex} != diatonic.degree-1 ${profile.diatonic.degree - 1}`);
                    }
                    if (parsed.activeAgent !== profile.diatonic.contextAgent) {
                        errors.push(`contextFrames.activeAgent ${parsed.activeAgent} != diatonic.contextAgent ${profile.diatonic.contextAgent}`);
                    }
                }
            }
            return errors;
        }
    },
    {
        name: 'readinessLedger',
        required: true,
        covers: ['readinessLedger'],
        describe: 'readiness facts strict-parse (snake_case wire law) and the bedrock fact is authoritative',
        assert(capture, contracts) {
            const errors = [];
            for (const profile of profilesOf(capture)) {
                if (!Array.isArray(profile.readinessLedger) || profile.readinessLedger.length === 0) {
                    errors.push('readinessLedger empty — the kernel always ships the bedrock fact');
                    continue;
                }
                for (const fact of profile.readinessLedger) {
                    parseInto(errors, contracts.MathemeHarmonicProfileReadinessFact, fact, 'readinessLedger fact');
                }
                if (!profile.readinessLedger.some(f => f.field === 'bedrock' && f.state === 'authoritative')) {
                    errors.push('readinessLedger missing the authoritative bedrock fact');
                }
            }
            return errors;
        }
    },
    {
        name: 'profile.declared-optional',
        required: true,
        covers: DECLARED_OPTIONAL_PROJECTIONS.map(entry => entry.field),
        describe: 'declared optional projections: strict parse when emitted; emitted-but-unschematized (z.unknown) FAILS; silent ones land in the DECLARED_NOT_EMITTED report',
        assert(capture, contracts) {
            const errors = [];
            for (const { field, schema } of DECLARED_OPTIONAL_PROJECTIONS) {
                const carriers = profilesOf(capture).filter(p => p[field] !== undefined && p[field] !== null);
                if (carriers.length === 0) continue; // honest absence — reported, not asserted
                if (!schema) {
                    errors.push(`profile field '${field}' emitted but still z.unknown() in the contract — type it in epi-cli/schemas before accepting`);
                    continue;
                }
                for (const profile of carriers) {
                    parseInto(errors, contracts[schema], profile[field], field);
                }
            }
            return errors;
        }
    },
    {
        name: 'event:m123.chime',
        required: true,
        covers: [],
        describe: 'the m123.chime strike channel is live and every frame parses strict',
        assert(capture, contracts) {
            const chimes = framesOf(capture, 'm123.chime');
            if (chimes.length === 0) return ['no m123.chime events captured'];
            const errors = [];
            chimes.forEach((frame, index) => {
                parseInto(errors, contracts.M123ChimeFrame, stripBusDecoration(frame.payload), `chime[${index}]`);
            });
            return errors;
        }
    },
    {
        name: 'chime.worldClockBinding',
        required: true,
        covers: [],
        describe: 'T13.3 world-clock honesty: every chime binding coherent (ready, tick+degree matched) and DECLARED as gateway-heartbeat SYNTHESIS — the independence check stays BLOCKED until a real S3 world-clock subscription replaces the synthesized reading (server/mod.rs honesty note)',
        assert(capture) {
            const errors = [];
            for (const [index, frame] of framesOf(capture, 'm123.chime').entries()) {
                const binding = frame.payload?.m3?.worldClockBinding;
                if (!binding) {
                    errors.push(`chime[${index}] missing m3.worldClockBinding`);
                    continue;
                }
                if (binding.state !== 'ready') {
                    errors.push(`chime[${index}] worldClockBinding.state ${binding.state} != ready on the heartbeat basis`);
                }
                if (!binding.tickMatchesProfile || !binding.degree720MatchesProfile) {
                    errors.push(`chime[${index}] world-clock derivation drift: tickMatches=${binding.tickMatchesProfile} degreeMatches=${binding.degree720MatchesProfile}`);
                }
                // HONESTY PIN: the reading is synthesized by the gateway
                // heartbeat, NOT an independent clock source. If this mode
                // ever changes, this assertion forces the manifest (and the
                // real independence check) to be rewritten deliberately.
                if (binding.subscriptionMode !== 'gateway-heartbeat') {
                    errors.push(`chime[${index}] worldClockBinding.subscriptionMode '${binding.subscriptionMode}' != gateway-heartbeat — a real subscription landed; implement the independence check and update this entry`);
                }
            }
            return errors;
        }
    },
    {
        name: 'event:tick',
        required: true,
        covers: [],
        describe: 'the 150ms maintenance tick is live: strict parse, non-decreasing ts, strictly increasing bus seq',
        assert(capture, contracts) {
            const ticks = framesOf(capture, 'tick');
            if (ticks.length < 2) return [`only ${ticks.length} tick frames captured — the 150ms loop should land several per window`];
            const errors = [];
            let lastTs = -Infinity;
            let lastSeq = -Infinity;
            ticks.forEach((frame, index) => {
                const parsed = parseInto(errors, contracts.GatewayTickEvent, stripBusDecoration(frame.payload), `tick[${index}]`);
                if (!parsed) return;
                if (parsed.ts < lastTs) errors.push(`tick[${index}].ts ${parsed.ts} went backwards`);
                lastTs = parsed.ts;
                const seq = frame.payload?.seq;
                if (typeof seq !== 'number' || seq <= lastSeq) {
                    errors.push(`tick[${index}] bus seq ${seq} not strictly increasing after ${lastSeq}`);
                }
                lastSeq = typeof seq === 'number' ? seq : lastSeq;
            });
            return errors;
        }
    },
    {
        name: 'event:health',
        required: true,
        covers: [],
        describe: 'the 350ms health broadcast is live and every snapshot parses (each named check carries its own ok verdict)',
        assert(capture, contracts) {
            const frames = framesOf(capture, 'health');
            if (frames.length === 0) return ['no health frames captured'];
            const errors = [];
            frames.forEach((frame, index) => {
                parseInto(errors, contracts.GatewayHealthEvent, stripBusDecoration(frame.payload), `health[${index}]`);
            });
            return errors;
        }
    },
    {
        name: 'event:heartbeat',
        required: true,
        covers: [],
        describe: 'the 550ms heartbeat is live, parses strict, and reports idle on a session-free basis',
        assert(capture, contracts) {
            const frames = framesOf(capture, 'heartbeat');
            if (frames.length === 0) return ['no heartbeat frames captured'];
            const errors = [];
            frames.forEach((frame, index) => {
                const parsed = parseInto(errors, contracts.GatewayHeartbeatEvent, stripBusDecoration(frame.payload), `heartbeat[${index}]`);
                if (parsed && parsed.status !== 'idle') {
                    errors.push(`heartbeat[${index}].status '${parsed.status}' != idle on a session-free capture`);
                }
            });
            return errors;
        }
    },
    {
        name: 'event:connect.challenge',
        required: true,
        covers: [],
        describe: 'the device-auth challenge fires on socket open with a UUID nonce',
        assert(capture, contracts) {
            const frames = framesOf(capture, 'connect.challenge');
            if (frames.length === 0) return ['no connect.challenge captured — the gateway pushes it on every socket open'];
            const errors = [];
            frames.forEach((frame, index) => {
                parseInto(errors, contracts.GatewayConnectChallengeEvent, stripBusDecoration(frame.payload), `challenge[${index}]`);
            });
            return errors;
        }
    },
    {
        name: 'wire.channel-taxonomy',
        required: true,
        covers: [],
        describe: 'every captured frame is hello-ok/res/event; every event channel is a declared gateway broadcast channel with a registered contract',
        assert(capture, contracts) {
            const errors = [];
            const known = new Set(contracts.GATEWAY_BROADCAST_CHANNELS);
            const schematized = new Set([
                'profile.update', 'm123.chime', ...Object.keys(EVENT_CHANNEL_CONTRACTS),
            ]);
            capture.frames.forEach((frame, index) => {
                if (frame.type === 'hello-ok' || frame.type === 'res') return;
                if (frame.type !== 'event') {
                    errors.push(`frame[${index}] unknown frame type '${frame.type}'`);
                    return;
                }
                const channel = frame.event;
                if (!known.has(channel)) {
                    errors.push(`frame[${index}] channel '${channel}' not in the declared gateway broadcast set — audit GatewayEvent::new call sites and grow the contract`);
                } else if (!schematized.has(channel)) {
                    errors.push(`frame[${index}] channel '${channel}' captured but has no registered contract schema — register one in epi-cli/schemas gateway-bus.ts`);
                }
            });
            return errors;
        }
    },
    {
        name: 'profile.field-coverage',
        required: true,
        covers: [],
        describe: 'T12.5 closure: every field present on captured profiles is manifest-covered or EXEMPT (justified); stale exemptions also FAIL',
        assert(capture) {
            const present = new Set();
            for (const profile of profilesOf(capture)) {
                for (const key of Object.keys(profile)) present.add(key);
            }
            if (present.size === 0) return ['no profile payloads captured — coverage undecidable'];
            const covered = new Set(PROJECTION_MANIFEST.flatMap(entry => entry.covers ?? []));
            const errors = [];
            for (const field of [...present].sort()) {
                if (!covered.has(field) && !(field in EXEMPT_PROFILE_FIELDS)) {
                    errors.push(`uncovered profile field '${field}' — add a manifest assertion or an EXEMPT justification`);
                }
            }
            for (const field of Object.keys(EXEMPT_PROFILE_FIELDS)) {
                if (covered.has(field)) {
                    errors.push(`stale EXEMPT entry '${field}' — the field is manifest-covered now; delete the exemption`);
                }
            }
            return errors;
        }
    }
];

/**
 * The honest-absence report: declared surfaces the current basis did not
 * emit. Printed with every run — absence is stated, never faked green.
 */
function computeDeclaredNotEmitted(capture, contracts) {
    const observedChannels = new Set(
        capture.frames.filter(f => f.type === 'event').map(f => f.event),
    );
    const silentChannels = contracts.GATEWAY_BROADCAST_CHANNELS
        .filter(channel => !observedChannels.has(channel));
    const profiles = profilesOf(capture);
    const silentFields = [];
    for (const { field } of DECLARED_OPTIONAL_PROJECTIONS) {
        if (!profiles.some(p => p[field] !== undefined && p[field] !== null)) {
            silentFields.push(field);
        }
    }
    for (const field of ['planetDegrees', 'livePlanets', 'quintessence', 'modalResonator', 'phaseSpace']) {
        if (profiles.length > 0 && !profiles.some(p => p[field] != null)) {
            silentFields.push(field);
        }
    }
    if (profiles.length > 0 && profiles.every(p => p.kleinFlip === null)) {
        silentFields.push('kleinFlip (null on all captured ticks — no flip tick in window)');
    }
    return {
        channels: silentChannels,
        bridgeInternalEventTypes: [...contracts.KERNEL_BRIDGE_INTERNAL_EVENT_TYPES],
        profileFields: silentFields,
    };
}

/** Validate a capture (live or replayed) against the declared manifest. */
export async function validateCapture(capture) {
    const contracts = await loadContracts();
    const failures = [];
    const coverage = [];
    for (const entry of PROJECTION_MANIFEST) {
        const errors = entry.assert(capture, contracts);
        const satisfied = errors.length === 0;
        coverage.push({ name: entry.name, satisfied, describe: entry.describe });
        if (!satisfied && entry.required) {
            failures.push({ name: entry.name, errors });
        }
    }
    return {
        ok: failures.length === 0,
        failures,
        coverage,
        declaredNotEmitted: computeDeclaredNotEmitted(capture, contracts),
    };
}

function waitForPort(port, timeoutMs) {
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

/**
 * Spawn a REAL gateway, connect the wire, capture until `profiles` profile
 * frames AND at least one m123.chime AND the maintenance channels (tick,
 * health, heartbeat) all arrived (or timeout). Returns the capture.
 */
export async function captureLive({
    port = DEFAULT_PORT,
    epiBin = DEFAULT_EPI_BIN,
    profiles = DEFAULT_PROFILE_TARGET,
    timeoutMs = 45000
} = {}) {
    const stateRoot = mkdtempSync(join(tmpdir(), 'live-wire-gate-'));
    const gateway = spawn(epiBin, ['gate', 'start', '--port', String(port)], {
        env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    const frames = [];
    const count = name => frames.filter(f => frameName(f) === name).length;
    try {
        await waitForPort(port, 20000);
        const ws = new WebSocket(`ws://127.0.0.1:${port}`);
        await new Promise((resolveDone, rejectDone) => {
            const timeout = setTimeout(() => {
                rejectDone(new Error(
                    `capture incomplete after ${timeoutMs}ms: ` +
                    `${count('profile.update')}/${profiles} profiles, ` +
                    `${count('m123.chime')} chimes, ${count('tick')} ticks, ` +
                    `${count('health')} health, ${count('heartbeat')} heartbeats`
                ));
            }, timeoutMs);
            ws.on('open', () => {
                ws.send(JSON.stringify({ type: 'req', id: 1, method: 'connect', params: {} }));
            });
            ws.on('message', data => {
                let frame;
                try {
                    frame = JSON.parse(String(data));
                } catch {
                    return;
                }
                frames.push(frame);
                if (
                    count('profile.update') >= profiles &&
                    count('m123.chime') >= 1 &&
                    count('tick') >= 3 &&
                    count('health') >= 1 &&
                    count('heartbeat') >= 1
                ) {
                    clearTimeout(timeout);
                    ws.close();
                    resolveDone();
                }
            });
            ws.on('error', err => {
                clearTimeout(timeout);
                rejectDone(err);
            });
        });
    } finally {
        if (gateway.exitCode === null) gateway.kill();
        rmSync(stateRoot, { recursive: true, force: true });
    }
    return {
        capturedAt: new Date().toISOString(),
        port,
        epiBin,
        frameCount: frames.length,
        frames
    };
}

function parseArgs(argv) {
    const opts = {
        replay: null,
        port: DEFAULT_PORT,
        profiles: DEFAULT_PROFILE_TARGET,
        out: DEFAULT_CAPTURE_DIR,
        dump: true
    };
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--replay') opts.replay = argv[(i += 1)];
        else if (arg === '--port') opts.port = Number(argv[(i += 1)]);
        else if (arg === '--profiles') opts.profiles = Number(argv[(i += 1)]);
        else if (arg === '--out') opts.out = argv[(i += 1)];
        else if (arg === '--no-dump') opts.dump = false;
        else throw new Error(`unknown argument '${arg}'`);
    }
    return opts;
}

function reportAndExit(report, capture, label) {
    for (const entry of report.coverage) {
        console.log(`[live-wire] ${entry.satisfied ? 'ok  ' : 'FAIL'} ${entry.name} — ${entry.describe}`);
    }
    for (const failure of report.failures) {
        for (const error of failure.errors.slice(0, 8)) {
            console.error(`[live-wire] ${failure.name}: ${error}`);
        }
    }
    const dne = report.declaredNotEmitted;
    if (dne) {
        console.log('[live-wire] DECLARED_NOT_EMITTED (honest absence on this basis):');
        console.log(`[live-wire]   ws channels: ${dne.channels.join(', ') || '(none)'}`);
        console.log(`[live-wire]   profile fields: ${dne.profileFields.join(', ') || '(none)'}`);
        console.log(
            '[live-wire]   bridge-internal event kinds (never raw WS channels): ' +
            dne.bridgeInternalEventTypes.join(', ')
        );
    }
    const profiles = profileFrames(capture).length;
    const chimes = framesOf(capture, 'm123.chime').length;
    console.log(
        `[live-wire] ${report.ok ? 'PASS' : 'FAIL'} (${label}) — ` +
        `${capture.frames.length} frames, ${profiles} profile.update, ${chimes} m123.chime, ` +
        `${framesOf(capture, 'tick').length} tick, ${framesOf(capture, 'health').length} health, ` +
        `${framesOf(capture, 'heartbeat').length} heartbeat`
    );
    process.exit(report.ok ? 0 : 1);
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.replay) {
        const capture = JSON.parse(readFileSync(opts.replay, 'utf8'));
        const report = await validateCapture(capture);
        reportAndExit(report, capture, `replay ${opts.replay}`);
        return;
    }
    console.log(`[live-wire] gateway binary: ${DEFAULT_EPI_BIN}`);
    console.log(`[live-wire] capturing ${opts.profiles} profile frames on port ${opts.port}…`);
    const capture = await captureLive({ port: opts.port, profiles: opts.profiles });
    const report = await validateCapture(capture);
    if (opts.dump) {
        mkdirSync(opts.out, { recursive: true });
        const stamp = capture.capturedAt.replace(/[:.]/g, '-');
        const file = join(opts.out, `${stamp}-live-wire.json`);
        writeFileSync(file, JSON.stringify({ ...capture, report }, null, 1));
        console.log(`[live-wire] capture dumped: ${file}`);
    }
    reportAndExit(report, capture, 'live');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(err => {
        console.error(`[live-wire] FAIL — ${err.message}`);
        process.exit(1);
    });
}
