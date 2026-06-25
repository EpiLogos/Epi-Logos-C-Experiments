import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};
        setAttribute() {
            return undefined;
        }
        removeAttribute() {
            return undefined;
        }
        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        documentElement: new globalThis.Element(),
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => [],
        queryCommandSupported: () => false
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
try {
    const { FrontendApplicationConfigProvider } = require('@theia/core/lib/browser/frontend-application-config-provider');
    FrontendApplicationConfigProvider.set({ applicationName: 'M3 Mahamaya profile tick node test' });
} catch (err) {
    if (!String(err?.message ?? err).includes('already set')) {
        throw err;
    }
}

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    subscribeM3ProfileTick,
    profileTickFromProfile
} = require('../m3-mahamaya/lib/browser/context/M3ProfileTickContext.js');
const {
    M3ReadinessProvider,
    readinessStateForBinding
} = require('../m3-mahamaya/lib/browser/context/M3ReadinessContext.js');
const {
    ReadinessChip
} = require('../m3-mahamaya/lib/browser/components/ReadinessChip.js');

const M3_BROWSER_SOURCE_DIR =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser';
const COMPONENT_SOURCE_DIR = join(M3_BROWSER_SOURCE_DIR, 'components');
const PROFILE_TICK_CONTEXT_SOURCE = join(M3_BROWSER_SOURCE_DIR, 'context/M3ProfileTickContext.tsx');
const TRANSCRIPTION_ENGINE_SOURCE = join(COMPONENT_SOURCE_DIR, 'M3TranscriptionEngine.tsx');

test('profile tick subscription broadcasts tick and degree720 on profile advance', () => {
    const bridge = inMemoryBridge();
    const snapshots = [];
    const sub = subscribeM3ProfileTick(bridge, snapshot => snapshots.push(snapshot));

    bridge.emit(profile(8, 5, 300));
    bridge.emit(profile(9, 6, 360));
    sub.dispose();
    bridge.emit(profile(10, 7, 420));

    assert.deepEqual(snapshots.at(-1), {
        generation: 9,
        tick: 6,
        degree720: 360,
        fibonacciGround: null
    });
    assert.equal(snapshots.length, 3);
    assert.deepEqual(profileTickFromProfile(profile(3, 2, 120)), {
        generation: 3,
        tick: 2,
        degree720: 120,
        fibonacciGround: null
    });
});

test('readiness chip renders inline pending badge and blocked overlay for datum binding', () => {
    const surface = Object.freeze({
        pendingFields: Object.freeze(['profile.mahamayaLensStack.activeLensId']),
        readiness: Object.freeze({
            state: 'authority_payload_missing',
            surfaceReady: false,
            blockers: Object.freeze(['profile.mahamayaLensStack.activeLensId blocked by profile_missing_field'])
        })
    });
    const snapshot = Object.freeze({
        fetchedAt: 1,
        state: 'authority_payload_missing',
        reason: 'profile_missing_field',
        profileGeneration: 23,
        bridgeReachable: true,
        blockerIds: Object.freeze(['profile.mahamayaLensStack.activeLensId'])
    });
    const context = Object.freeze({
        snapshot,
        surfaceReadiness: surface.readiness,
        pendingFields: surface.pendingFields,
        blockers: surface.readiness.blockers
    });

    assert.equal(readinessStateForBinding(context, 'profile.mahamayaLensStack.activeLensId'), 'blocked');

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            M3ReadinessProvider,
            { surface, readiness: snapshot },
            React.createElement(
                ReadinessChip,
                { bindingKey: 'profile.mahamayaLensStack.activeLensId' },
                'active lens'
            )
        )
    );

    assert.match(html, /data-readiness-binding="profile\.mahamayaLensStack\.activeLensId"/);
    assert.match(html, /data-readiness-state="blocked"/);
    assert.match(html, /data-pending-badge="true"|data-pending-badge=""/);
    assert.match(html, /data-blocked-overlay="true"|data-blocked-overlay=""/);
    assert.match(html, /active lens/);
});

test('every M3 Wave-C browser widget consumes tick and readiness contexts', () => {
    const missing = componentFiles()
        .filter(file => !file.endsWith('ReadinessChip.tsx'))
        .filter(file => {
            const source = readFileSync(file, 'utf8');
            return !source.includes('useM3ProfileTick') || !source.includes('useM3Readiness');
        })
        .map(file => file.replace(`${COMPONENT_SOURCE_DIR}/`, ''));

    assert.deepEqual(missing, []);
});

test('M3 browser source has no internal timer or RAF clock outside the controlled tick context', () => {
    const violations = sourceFiles(M3_BROWSER_SOURCE_DIR)
        .filter(file => file !== PROFILE_TICK_CONTEXT_SOURCE)
        .flatMap(file => {
            const source = readFileSync(file, 'utf8');
            const matches = source.match(/setInterval|requestAnimationFrame/g) ?? [];
            return matches.map(match => `${file.replace(`${M3_BROWSER_SOURCE_DIR}/`, '')}:${match}`);
        });

    assert.deepEqual(violations, []);
});

test('M3TranscriptionEngine renders lens codon binary degree cells from the bridge projection', () => {
    const {
        M3TranscriptionEngine,
        M3ReadinessProvider
    } = transcriptionEngineModule();
    const surface = surfaceFixture();
    const lensCodonBinary = lensCodonBinaryFixture({ lensId: 4, tick12: 8 });

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            M3ReadinessProvider,
            { surface, readiness: readinessFixture() },
            React.createElement(M3TranscriptionEngine, {
                surface,
                lensCodonBinary,
                activeLensId: 4
            })
        )
    );

    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:m3-transcription-engine"/);
    assert.match(html, /data-active-lens-id="4"/);
    assert.match(html, /data-render-mode="degree-ring"/);
    assert.match(html, /data-degree360="120"/);
    assert.match(html, /data-exact-degree720="240"/);
    assert.match(html, /data-hexagram-address="42"/);
    assert.match(html, /10\s*01\s*11/);
    assert.match(html, /data-charge-key="pp"/);
    assert.match(html, /data-charge-key="nn"/);
    assert.match(html, /data-charge-key="np"/);
    assert.match(html, /data-charge-key="pn"/);
    assert.match(html, /\[1, 2, 3, 4\]/);
    assert.match(html, /canonical-B:Fire/);
    assert.match(html, /imperfect-palindromic/);
    assert.match(html, /line-change-hop/);
    assert.match(html, /m3_codon_is_rna_capable=true/);
});

test('M3TranscriptionEngine dev lamps expose X logic identity and operator aperture graph mode', () => {
    const {
        M3TranscriptionEngine,
        M3ProfileTickContext,
        M3ReadinessProvider
    } = transcriptionEngineModule();
    const surface = surfaceFixture();
    const lensCodonBinary = lensCodonBinaryFixture({ lensId: 17, tick12: 11 });

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            M3ReadinessProvider,
            { surface, readiness: readinessFixture() },
            React.createElement(
                M3ProfileTickContext.Provider,
                {
                    value: {
                        generation: 43,
                        tick: 11,
                        degree720: 366,
                        fibonacciGround: null
                    }
                },
                React.createElement(M3TranscriptionEngine, {
                    surface,
                    lensCodonBinary,
                    activeLensId: 17,
                    devModeXLogicLamps: true
                })
            )
        )
    );

    assert.match(html, /data-render-mode="operator-no-frame-graph"/);
    assert.match(html, /data-profile-tick="11"/);
    assert.match(html, /pp=X2/);
    assert.match(html, /nn=X1/);
    assert.match(html, /np=X4/);
    assert.match(html, /pn=X3/);
    assert.match(html, /pp\+nn\+np\+pn == 4.X/);
});

test('M3TranscriptionEngine renders honest pending badges and contains no local codon math', () => {
    const {
        M3TranscriptionEngine,
        M3ReadinessProvider
    } = transcriptionEngineModule();
    const surface = surfaceFixture({
        pendingFields: Object.freeze(['profile.lensCodonBinary']),
        readiness: Object.freeze({
            state: 'authority_payload_missing',
            surfaceReady: false,
            blockers: Object.freeze(['profile.lensCodonBinary'])
        })
    });

    const pendingHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            M3ReadinessProvider,
            { surface, readiness: readinessFixture('authority_payload_missing') },
            React.createElement(M3TranscriptionEngine, {
                surface,
                activeLensId: 4
            })
        )
    );

    assert.match(pendingHtml, /pending-profile-field:lensCodonBinary/);

    const noRnaFamilyHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            M3ReadinessProvider,
            { surface: surfaceFixture(), readiness: readinessFixture() },
            React.createElement(M3TranscriptionEngine, {
                surface: surfaceFixture(),
                lensCodonBinary: lensCodonBinaryFixture({ lensId: 4, tick12: 8, includeRnaFamily: false }),
                activeLensId: 4
            })
        )
    );
    assert.match(noRnaFamilyHtml, /pending-rna-codon-family/);
    assert.match(noRnaFamilyHtml, /pending-chromosome-graph/);

    const source = readFileSync(TRANSCRIPTION_ENGINE_SOURCE, 'utf8');
    assert.doesNotMatch(source, /NUCLEOTIDE_ICHING_VALUE|m3_compute_charges|epogdoon|X \+ Y \+ Z|>> 4 & 0x03/);
    assert.doesNotMatch(source, /from ['"][^'"]*m2-parashakti|Body\/S\/S0/);
});

function profile(generation, tick, degree720) {
    return Object.freeze({
        generation,
        pointerAnchor: `profile:${generation}`,
        capabilities: Object.freeze(['profile.public-current']),
        payload: Object.freeze({ tick, degree720 })
    });
}

function transcriptionEngineModule() {
    const engine = require('../m3-mahamaya/lib/browser/components/M3TranscriptionEngine.js');
    const readinessContext = require('../m3-mahamaya/lib/browser/context/M3ReadinessContext.js');
    const profileTickContext = require('../m3-mahamaya/lib/browser/context/M3ProfileTickContext.js');
    return {
        ...engine,
        M3ReadinessProvider: readinessContext.M3ReadinessProvider,
        M3ProfileTickContext: profileTickContext.M3ProfileTickContext
    };
}

function lensCodonBinaryFixture({
    lensId,
    tick12,
    includeRnaFamily = true
}) {
    return Object.freeze({
        lensId,
        segment: Object.freeze([120, 121]),
        tick12,
        perDegree: Object.freeze([
            Object.freeze({
                degree360: 120,
                exactDegree720: 240,
                codonUpper: 2,
                codonLower: 1,
                codonThird: 3,
                codon6Bit: 0b100111,
                codonBits: '10 01 11',
                hexagramId: 42,
                codonClass: 'imperfect-palindromic',
                charges: Object.freeze({ pp: 1, nn: 2, np: 3, pn: 4 }),
                quaternion: Object.freeze([1, 2, 3, 4]),
                elementCanonical: 'canonical-B:Fire',
                lineChangeOperator: 'line-change-hop:yang-3',
                lineChangeHops: Object.freeze([
                    Object.freeze({ line: 3, degree360: 121, hexagramId: 43 })
                ]),
                rnaCapable: true,
                rnaFamily: includeRnaFamily ? 'bridge-provided-U-family' : undefined,
                chromosomeGraph: null,
                xLogicInvariant: 'pp+nn+np+pn == 4·X'
            })
        ])
    });
}

function surfaceFixture(overrides = {}) {
    return Object.freeze({
        profileGeneration: 42,
        activeProjection: Object.freeze({
            tick: 8,
            degree720: 240
        }),
        pendingFields: Object.freeze([]),
        readiness: Object.freeze({
            state: 'ready_public_current',
            surfaceReady: true,
            blockers: Object.freeze([])
        }),
        ...overrides
    });
}

function readinessFixture(state = 'ready_public_current') {
    return Object.freeze({
        fetchedAt: 1,
        state,
        reason: state === 'ready_public_current' ? undefined : 'profile_missing_field',
        profileGeneration: 42,
        bridgeReachable: true,
        blockerIds: Object.freeze([])
    });
}

function inMemoryBridge() {
    const listeners = new Set();
    return {
        onProfile(listener) {
            listeners.add(listener);
            listener(null);
            return { dispose: () => listeners.delete(listener) };
        },
        emit(next) {
            for (const listener of listeners) {
                listener(next);
            }
        }
    };
}

function componentFiles() {
    return sourceFiles(COMPONENT_SOURCE_DIR).filter(file => file.endsWith('.tsx'));
}

function sourceFiles(root) {
    return readdirSync(root)
        .flatMap(entry => {
            const absolute = join(root, entry);
            const stat = statSync(absolute);
            return stat.isDirectory() ? sourceFiles(absolute) : [absolute];
        })
        .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
}
