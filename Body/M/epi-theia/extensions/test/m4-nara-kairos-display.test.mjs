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
Module._load = function loadKairosTestDependency(request, parent, isMain) {
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
    KAIROS_WHEEL_VIEW_ID,
    M4KairosWheel,
    MOD10_PLANETS,
    activeOracleMoment,
    buildKairosWheelModel,
    formatDegreeDms,
    readTransitPositions
} = require('../m4-nara/lib/browser/widgets/kairos-display.js');

function natalPositions() {
    return {
        source: 'PASU.md c_0_natal_chart_path',
        positions: [
            { planet: 'Sun', degree: 10.5, house: 1 },
            { planet: 'Moon', degree: 41.25, house: 2 },
            { planet: 'Mercury', degree: 72.75, house: 3 },
            { planet: 'Venus', degree: 103.125, house: 4 },
            { planet: 'Mars', degree: 134.25, house: 5 },
            { planet: 'Jupiter', degree: 165.5, house: 6 },
            { planet: 'Saturn', degree: 196.75, house: 7 },
            { planet: 'Uranus', degree: 227.875, house: 8 },
            { planet: 'Neptune', degree: 258.125, house: 9 },
            { planet: 'Pluto', degree: 289.5, house: 10 }
        ]
    };
}

function transitProfile() {
    return {
        generation: 19,
        pointerAnchor: null,
        capabilities: [],
        payload: {
            M4_Temporal_Now: {
                natal: {
                    kind: 'NATAL',
                    planet_degrees: [10.5, 41.25, 72.75, 103.125, 134.25, 165.5, 196.75, 227.875, 258.125, 289.5]
                },
                realtime: {
                    kind: 'REALTIME',
                    captured_at_ns: 1_780_000_000_000_000_000,
                    planet_degrees: [14.2, 25.1, 302.4, 112.7, 88.5, 177.3, 201.6, 44.8, 269.9, 11.1]
                },
                kairotic_active: false
            }
        }
    };
}

function oracleHistory(castAt) {
    return {
        history: [
            {
                castHandle: 'oracle://cast/recent',
                castAt,
                kairosSnapshot: {
                    kairotic: {
                        kind: 'KAIROTIC',
                        planet_degrees: [15, 35, 75, 115, 155, 195, 235, 275, 315, 355]
                    }
                }
            }
        ]
    };
}

test('widget renders the canonical 10-planet mod-10 wheel without Earth in the wheel', () => {
    assert.deepEqual(
        MOD10_PLANETS.map(planet => `${planet.name}=${planet.index}`),
        ['Sun=0', 'Moon=1', 'Mercury=2', 'Venus=3', 'Mars=4', 'Jupiter=5', 'Saturn=6', 'Uranus=7', 'Neptune=8', 'Pluto=9']
    );

    const model = buildKairosWheelModel({
        natalPositions: natalPositions(),
        transitPositions: readTransitPositions(transitProfile()),
        nowMs: Date.parse('2026-06-12T10:00:00.000Z')
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4KairosWheel, { model })
    );

    assert.equal(KAIROS_WHEEL_VIEW_ID, 'm4.nara.kairosWheel');
    assert.equal(model.planets.length, 10);
    assert.equal(model.planets.some(planet => planet.name === 'Earth'), false);
    assert.equal((markup.match(/data-test="m4-kairos-planet"/g) ?? []).length, 20);
    assert.match(markup, /Earth observer centre/);
    assert.doesNotMatch(markup, /data-planet="Earth"/);
});

test('natal ring uses PASU natal chart positions resolved by the natal RPC payload', () => {
    const model = buildKairosWheelModel({
        natalPositions: natalPositions(),
        transitPositions: [],
        nowMs: Date.parse('2026-06-12T10:00:00.000Z')
    });

    assert.equal(model.natal.entries.length, 10);
    assert.equal(model.natal.entries[0].degree, 10.5);
    assert.equal(model.natal.entries[0].degreeText, "10°30'00''");
    assert.equal(model.natal.entries[0].sign?.name, 'Aries');
    assert.equal(model.natal.entries[0].house, 1);
    assert.equal(model.natal.entries[9].planet.name, 'Pluto');
    assert.equal(model.natal.entries[9].house, 10);
});

test('transit ring is driven by M4_Temporal_Now.realtime.planet_degrees[10] and shows natal-relative motion arrows', () => {
    const transitPositions = readTransitPositions(transitProfile());
    const model = buildKairosWheelModel({
        natalPositions: natalPositions(),
        transitPositions,
        nowMs: Date.parse('2026-06-12T10:00:00.000Z')
    });

    assert.equal(transitPositions.length, 10);
    assert.equal(model.transit.entries[0].degree, 14.2);
    assert.equal(model.transit.entries[0].motionArrow, '↗');
    assert.equal(model.transit.entries[1].motionArrow, '↘');
    assert.equal(model.transit.entries[2].degreeText, "302°24'00''");
});

test('oracle ring respects the 4h decay window and exposes a countdown', () => {
    const nowMs = Date.parse('2026-06-12T10:00:00.000Z');
    const active = activeOracleMoment(oracleHistory('2026-06-12T08:30:00.000Z'), nowMs);
    const expired = activeOracleMoment(oracleHistory('2026-06-12T05:59:59.000Z'), nowMs);

    assert.equal(active?.castHandle, 'oracle://cast/recent');
    assert.equal(active?.remainingMs, 9_000_000);
    assert.equal(expired, null);

    const model = buildKairosWheelModel({
        natalPositions: natalPositions(),
        transitPositions: readTransitPositions(transitProfile()),
        oracleHistory: oracleHistory('2026-06-12T08:30:00.000Z'),
        nowMs
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4KairosWheel, { model })
    );

    assert.equal(model.oracle?.entries.length, 10);
    assert.match(markup, /data-test="m4-kairos-ring-oracle"/);
    assert.match(markup, /oracle decay 2h 30m 00s/);
});

test('protected_local_handle_only chrome renders and raw PASU chart body stays outside the wheel', () => {
    const model = buildKairosWheelModel({
        natalPositions: {
            rawChartBody: 'RAW BIRTH DATA MUST STAY LOCAL',
            positions: natalPositions().positions
        },
        transitPositions: readTransitPositions(transitProfile()),
        nowMs: Date.parse('2026-06-12T10:00:00.000Z')
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4KairosWheel, { model })
    );
    const source = readFileSync(
        new URL('../m4-nara/src/browser/widgets/kairos-display.tsx', import.meta.url),
        'utf8'
    );

    assert.equal(model.privacyClass, 'protected_local_handle_only');
    assert.match(markup, /data-privacy-class="protected_local_handle_only"/);
    assert.match(markup, /protected_local_handle_only/);
    assert.doesNotMatch(markup, /RAW BIRTH DATA MUST STAY LOCAL/);
    assert.match(source, /NATAL_POSITIONS_METHOD = 'nara\.kairos\.natal_positions'/);
    assert.match(source, /privacyClass: 'protected_local_handle_only'/);
});

test("degree formatting uses D°M'S'' display", () => {
    assert.equal(formatDegreeDms(0), "0°00'00''");
    assert.equal(formatDegreeDms(29.999722), "29°59'59''");
    assert.equal(formatDegreeDms(360.5), "0°30'00''");
});
