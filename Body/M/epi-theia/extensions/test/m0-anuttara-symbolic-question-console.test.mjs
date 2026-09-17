// 21.11 verification suite — Symbolic-Coordinate Question Console (WC-M0-12).
// Spec-ahead-integration; cross-links Tranches 01.10, 01.11, 05.21.
//
// Asserts that a synthetic `#R0-0/1/A-T7-pending?` row renders its parse summary
// (archetypeIndex 7, stateMarker 'pending') and that submitting dispatches the
// `s0'.verifier.respond_question` gateway RPC with the correct method/params.

import test from 'node:test';
import assert from 'node:assert/strict';
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
        querySelectorAll: () => []
    };
}
if (!globalThis.window) {
    globalThis.window = {
        navigator: { userAgent: 'node-test' },
        document: globalThis.document
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const {
    SymbolicCoordinateQuestionConsole,
    buildSymbolicQuestionRows,
    dispatchSymbolicResponse,
    applySymbolicBridgeResponse,
    M0_SYMBOLIC_RESPOND_METHOD,
    M0_SYMBOLIC_SESSION_KEY
} = require('../m0-anuttara/lib/browser/panels/symbolic-coordinate-question-console.js');

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const SYNTHETIC_RAW = '#R0-0/1/A-T7-pending?';

function syntheticRow() {
    return Object.freeze({
        raw: SYNTHETIC_RAW,
        parsed: Object.freeze({
            namespace: 'R',
            coordinate: Object.freeze(['0', '1', 'A']),
            archetypeIndex: 7,
            stateMarker: 'pending'
        }),
        responseStatus: 'parsed',
        responseText: null,
        state: 'review_pending'
    });
}

test('synthetic #R0-0/1/A-T7-pending? row renders parse summary with archetype 7 / pending', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(SymbolicCoordinateQuestionConsole, {
            profile: null,
            bridge: null,
            rows: [syntheticRow()]
        })
    );

    assert.match(
        markup,
        /data-widget-id="pratibimba\.m0-anuttara:symbolic-coordinate-question-console"/
    );
    // Raw EBNF coordinate-string is shown verbatim.
    assert.match(markup, /#R0-0\/1\/A-T7-pending\?/);
    // Parse summary (from bridge round-trip) exposes archetype index and state marker.
    assert.match(markup, /data-archetype-index="7"/);
    assert.match(markup, /data-state-marker="pending"/);
    assert.match(markup, /data-namespace="R"/);
    // Status pill reflects the parsed transition.
    assert.match(markup, /data-test="m0-symbolic-status-pill" data-response-status="parsed"/);
});

test('rows derive from profile.payload.m0_verifier_questions', () => {
    const profile = Object.freeze({
        generation: 11,
        pointerAnchor: null,
        capabilities: [],
        payload: Object.freeze({ m0_verifier_questions: [SYNTHETIC_RAW, '#L2-3-T9-drift?'] })
    });
    const rows = buildSymbolicQuestionRows(profile);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].raw, SYNTHETIC_RAW);
    // Never parsed locally — parse is null until the bridge responds.
    assert.equal(rows[0].parsed, null);
    assert.equal(rows[0].responseStatus, 'awaiting');
});

test('submit dispatches s0\'.verifier.respond_question with the correct envelope', async () => {
    const calls = [];
    const bridge = {
        invokeCapability(request) {
            calls.push(request);
            return Promise.resolve({ reverified: true });
        }
    };

    const result = await dispatchSymbolicResponse(bridge, {
        row: syntheticRow(),
        draft: 'witnessed and answered',
        profileGeneration: 42
    });

    assert.equal(calls.length, 1);
    const request = calls[0];
    assert.equal(request.method, 'invokeGatewayRpc');
    assert.equal(request.sessionKey, M0_SYMBOLIC_SESSION_KEY);
    assert.equal(request.sessionKey, 'm0-anuttara-symbolic');
    assert.equal(request.params.gatewayMethod, M0_SYMBOLIC_RESPOND_METHOD);
    assert.equal(request.params.gatewayMethod, "s0'.verifier.respond_question");
    assert.equal(request.params.coordinateString, SYNTHETIC_RAW);
    assert.equal(request.params.responseText, 'witnessed and answered');
    assert.equal(request.params.sourceExtensionId, 'm0-anuttara');
    assert.equal(request.profileGeneration, 42);
    assert.deepEqual(request.provenanceHandles, []);
    assert.equal(request.vak, null);
    assert.deepEqual(result, { reverified: true });
});

test('bridge response flips status through responded → reverified and applies parse', () => {
    const base = buildSymbolicQuestionRows(
        Object.freeze({
            generation: 1,
            pointerAnchor: null,
            capabilities: [],
            payload: Object.freeze({ m0_verifier_questions: [SYNTHETIC_RAW] })
        })
    )[0];

    const reverified = applySymbolicBridgeResponse(base, {
        reverified: true,
        parse: { namespace: 'R', coordinate: ['0', '1', 'A'], archetypeIndex: 7, stateMarker: 'pending' }
    });
    assert.equal(reverified.responseStatus, 'reverified');
    assert.equal(reverified.parsed.archetypeIndex, 7);
    assert.equal(reverified.parsed.stateMarker, 'pending');

    const responded = applySymbolicBridgeResponse(base, { reverified: false });
    assert.equal(responded.responseStatus, 'responded');
});
