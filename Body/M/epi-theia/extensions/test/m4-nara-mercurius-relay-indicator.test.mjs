import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';
import { readFileSync } from 'node:fs';

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
        queryCommandSupported: () => false,
        body: new globalThis.Element()
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        innerWidth: 1200,
        innerHeight: 800,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
const originalLoad = Module._load;
Module._load = function loadMercuriusTestDependency(request, parent, isMain) {
    if (request === '@theia/core/shared/inversify') {
        return {
            injectable: () => target => target,
            inject: () => () => undefined,
            postConstruct: () => () => undefined
        };
    }
    if (request === '@theia/core/lib/browser/widgets/react-widget') {
        return {
            ReactWidget: class ReactWidget {
                title = {};
                addClass() {
                    return undefined;
                }
                update() {
                    return undefined;
                }
                dispose() {
                    return undefined;
                }
            }
        };
    }
    if (request === '@pratibimba/m-extension-runtime') {
        return {
            EMPTY_COORDINATE_CONTEXT: {
                selectedCoordinate: null,
                hashInput: null,
                canonicalMCoordinate: null,
                profileGeneration: null,
                pointerAnchor: null,
                dayNowSessionHandle: null,
                privacyClass: 'public_current',
                provenance: { source: 'test', generation: null, notes: [] }
            },
            SHARED_BRIDGE_ADAPTER: Symbol.for('SHARED_BRIDGE_ADAPTER'),
            CROSS_EXTENSION_ROUTE_CONTRACTS: [],
            REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS: [],
            PENDING_M_READINESS: {
                state: 'pending',
                bridgeReachable: false
            }
        };
    }
    if (request === '@pratibimba/integrated-composition/design-primitives') {
        return {};
    }
    return originalLoad.call(this, request, parent, isMain);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    MERCURIUS_RELAY_VIEW_ID,
    M4_MERCURIUS_RELAY_CHIP_EXPORT,
    MERCURIUS_KAIROS_DELTA_KIND,
    KAIROS_ENABLED_PREFERENCE,
    KAIROS_ENABLED_DEFAULT,
    MOD10_PLANET_COUNT,
    M4MercuriusRelayChip,
    initialRelayState,
    applyMercuriusDelta,
    setKairosEnabled,
    isMercuriusKairosDelta,
    readDeltaPlanetDegrees,
    readKairosEnabled
} = require('../m4-nara/lib/browser/widgets/mercurius-relay-indicator.js');

const MOD10_DEGREES = Object.freeze([14.2, 25.1, 302.4, 112.7, 88.5, 177.3, 201.6, 44.8, 269.9, 11.1]);

function deltaEvent(overrides = {}) {
    return {
        type: MERCURIUS_KAIROS_DELTA_KIND,
        extensionId: 'm4-nara',
        emittedAt: Date.parse('2026-06-12T10:00:00.000Z'),
        payload: {
            kind: MERCURIUS_KAIROS_DELTA_KIND,
            refreshedAtIso: '2026-06-12T10:00:00.000Z',
            planet_degrees: MOD10_DEGREES.slice(),
            ...overrides
        }
    };
}

test('view id and Track 08 export name are canonical', () => {
    assert.equal(MERCURIUS_RELAY_VIEW_ID, 'm4.nara.mercuriusRelay');
    assert.equal(M4_MERCURIUS_RELAY_CHIP_EXPORT, 'M4MercuriusRelayChip');
    assert.equal(KAIROS_ENABLED_DEFAULT, false);
    assert.equal(KAIROS_ENABLED_PREFERENCE, 'epi-logos.privacy.kairos-enabled');
    assert.equal(readKairosEnabled(true), true);
    assert.equal(readKairosEnabled('true'), false);
    assert.equal(readKairosEnabled(undefined), false);

    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4MercuriusRelayChip, {
            kairosEnabled: true,
            lastRefreshIso: '2026-06-12T10:00:00.000Z',
            deltaCount: 1,
            pulseToken: 1,
            connected: true
        })
    );
    assert.match(markup, /data-track="TRACK_08"/);
    assert.match(markup, /data-export="M4MercuriusRelayChip"/);
    assert.match(markup, /data-view-id="m4\.nara\.mercuriusRelay"/);
});

test('subscribe: indicator updates on a synthetic mercurius.kairos.delta event', () => {
    const enabled = setKairosEnabled(initialRelayState(), true);
    assert.equal(enabled.deltaCount, 0);
    assert.equal(enabled.lastRefreshIso, null);

    const next = applyMercuriusDelta(enabled, deltaEvent());
    assert.equal(next.deltaCount, 1);
    assert.equal(next.lastRefreshIso, '2026-06-12T10:00:00.000Z');
    assert.deepEqual(next.lastPlanetDegrees, MOD10_DEGREES.slice());

    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4MercuriusRelayChip, {
            kairosEnabled: next.kairosEnabled,
            lastRefreshIso: next.lastRefreshIso,
            deltaCount: next.deltaCount,
            pulseToken: next.pulseToken,
            connected: true
        })
    );
    assert.match(markup, /data-test="m4-mercurius-refresh"[^>]*>2026-06-12T10:00:00\.000Z/);
    assert.match(markup, /data-test="m4-mercurius-delta-count"[^>]*>Δ 1/);

    // A non-Mercurius event leaves the state untouched (identity return).
    const unrelated = applyMercuriusDelta(next, {
        type: 'oracle.cast.recorded',
        extensionId: 'm4-nara',
        emittedAt: 0,
        payload: {}
    });
    assert.equal(unrelated, next);

    // payload.kind carries the signal even when event.type differs.
    assert.equal(
        isMercuriusKairosDelta({ type: 'm4.kairos', extensionId: 'm4-nara', emittedAt: 0, payload: { kind: MERCURIUS_KAIROS_DELTA_KIND } }),
        true
    );
});

test('FR-3 stub-mode: grey "Kairos disabled" state when KAIROS_ENABLED=false', () => {
    const state = initialRelayState();
    assert.equal(state.kairosEnabled, false);

    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4MercuriusRelayChip, {
            kairosEnabled: state.kairosEnabled,
            lastRefreshIso: state.lastRefreshIso,
            deltaCount: state.deltaCount,
            pulseToken: state.pulseToken,
            connected: false
        })
    );
    assert.match(markup, /data-kairos-enabled="false"/);
    assert.match(markup, /data-test="m4-mercurius-relay-stub"/);
    assert.match(markup, /Kairos disabled/);
    assert.doesNotMatch(markup, /data-test="m4-mercurius-pulse"/);

    // An explicit disabled signal flips an enabled chip back to the stub without counting.
    const disabledBySignal = applyMercuriusDelta(
        setKairosEnabled(initialRelayState(), true),
        deltaEvent({ kairosEnabled: false, planet_degrees: undefined })
    );
    assert.equal(disabledBySignal.kairosEnabled, false);
    assert.equal(disabledBySignal.deltaCount, 0);

    // CSS provides the grey stub styling.
    const css = readFileSync(new URL('../m4-nara/style/index.css', import.meta.url), 'utf8');
    assert.match(css, /\.m4-mercurius-stub\s*\{/);
});

test('mod-10 ordering: every counted delta payload carries planet_degrees[10]', () => {
    assert.equal(MOD10_PLANET_COUNT, 10);
    assert.equal(readDeltaPlanetDegrees(deltaEvent().payload).length, 10);

    // Wrong-length vectors are rejected by the mod-10 contract.
    assert.equal(readDeltaPlanetDegrees({ planet_degrees: [1, 2, 3] }), null);
    assert.equal(readDeltaPlanetDegrees({ planet_degrees: MOD10_DEGREES.slice(0, 9) }), null);
    assert.equal(readDeltaPlanetDegrees({ planet_degrees: [...MOD10_DEGREES, 5] }), null);
    assert.equal(readDeltaPlanetDegrees({ planet_degrees: [...MOD10_DEGREES.slice(0, 9), Number.NaN] }), null);
    assert.equal(readDeltaPlanetDegrees(undefined), null);

    // Reads via the M4_Temporal_Now wrapper too.
    assert.equal(readDeltaPlanetDegrees({ M4_Temporal_Now: { planet_degrees: MOD10_DEGREES.slice() } }).length, 10);

    // A delta missing a valid mod-10 vector is not counted (no refresh, no pulse).
    const enabled = setKairosEnabled(initialRelayState(), true);
    const notCounted = applyMercuriusDelta(enabled, deltaEvent({ planet_degrees: [1, 2, 3] }));
    assert.equal(notCounted.deltaCount, 0);
    assert.equal(notCounted.pulseToken, 0);

    // A valid mod-10 delta is counted.
    const counted = applyMercuriusDelta(enabled, deltaEvent());
    assert.equal(counted.deltaCount, 1);
    assert.equal(counted.lastPlanetDegrees.length, 10);
});

test('pulse-animation: exactly one pulse per delta', () => {
    let state = setKairosEnabled(initialRelayState(), true);
    assert.equal(state.pulseToken, 0);

    state = applyMercuriusDelta(state, deltaEvent({ refreshedAtIso: '2026-06-12T10:00:00.000Z' }));
    assert.equal(state.pulseToken, 1);
    assert.equal(state.deltaCount, 1);

    state = applyMercuriusDelta(state, deltaEvent({ refreshedAtIso: '2026-06-12T10:04:00.000Z' }));
    assert.equal(state.pulseToken, 2);
    assert.equal(state.deltaCount, 2);

    state = applyMercuriusDelta(state, deltaEvent({ refreshedAtIso: '2026-06-12T10:08:00.000Z' }));
    assert.equal(state.pulseToken, 3);
    assert.equal(state.deltaCount, 3);

    // The pulse token is surfaced so React can re-key (remount) the pulse node,
    // replaying the single-shot animation once per delta.
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4MercuriusRelayChip, {
            kairosEnabled: true,
            lastRefreshIso: state.lastRefreshIso,
            deltaCount: state.deltaCount,
            pulseToken: state.pulseToken,
            connected: true
        })
    );
    assert.match(markup, /data-test="m4-mercurius-pulse"[^>]*data-pulse-token="3"/);

    // The CSS animation is single-shot (iteration count 1).
    const css = readFileSync(new URL('../m4-nara/style/index.css', import.meta.url), 'utf8');
    assert.match(css, /@keyframes m4-mercurius-pulse-once/);
    assert.match(css, /animation:\s*m4-mercurius-pulse-once[^;]*\s1\s*;/);
});
