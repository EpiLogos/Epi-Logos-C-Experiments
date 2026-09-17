import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

installBrowserImportShim();

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    COMPOSITION_CONTEMPLATION_COMPLETE_EVENT,
    CONTEMPLATION_COMPLETE_EVENT,
    ContemplationFlowDirector,
    buildContemplationFlowState,
    subscribeContemplationFlowDirector
} = require('../../lib/browser/contemplation-flow-director.js');

function installBrowserImportShim() {
    const requireForShim = createRequire(import.meta.url);
    requireForShim.extensions['.css'] = () => undefined;
    if (globalThis.document) {
        return;
    }
    class ElementStub {}
    ElementStub.prototype.matches = () => false;
    ElementStub.prototype.msMatchesSelector = () => false;
    ElementStub.prototype.webkitMatchesSelector = () => false;
    ElementStub.prototype.contains = () => false;
    const element = () => Object.assign(new ElementStub(), {
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        dataset: {},
        style: {},
        setAttribute() {},
        getAttribute() { return null; },
        removeAttribute() {},
        appendChild() {},
        removeChild() {},
        addEventListener() {},
        removeEventListener() {}
    });
    const navigator = { userAgent: 'node', platform: 'Linux x86_64' };
    globalThis.Element = ElementStub;
    globalThis.HTMLElement = ElementStub;
    globalThis.document = {
        createElement: element,
        documentElement: { style: {} },
        body: element(),
        addEventListener() {},
        removeEventListener() {},
        queryCommandSupported() { return false; }
    };
    globalThis.window = {
        document: globalThis.document,
        navigator,
        localStorage: {
            getItem() { return null; },
            setItem() {},
            removeItem() {}
        },
        getComputedStyle: () => ({})
    };
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: navigator
    });
}

test('synthetic contemplation complete event drives full 4-5-0 slot-update sequence', async () => {
    const bridge = fakeBridge();
    const states = [];
    const subscription = subscribeContemplationFlowDirector(bridge, state => states.push(state));

    await bridge.emit(syntheticContemplationEvent());
    subscription.dispose();

    assert.equal(bridge.rpcCalls[0].method, 'khora_write_highlighted_inscription');
    assert.equal(bridge.rpcCalls[0].params.category, 'recognition');
    assert.equal(bridge.rpcCalls[0].params.authorChip, 'Pi \u2192 Nara');
    assert.match(bridge.rpcCalls[0].params.text, /bioquaternion trajectory resolves as recognition/);

    const state = states.at(-1);
    assert.equal(state?.sessionKey, 'session:29.9');
    assert.equal(state?.left.inscription.category, 'recognition');
    assert.equal(state?.left.tarotAnchors.length, 2);
    assert.equal(state?.right.wisdomDeltaHex.length, 16);
    assert.deepEqual(
        state?.right.gaugeTrioCoverage.map(item => item.fraction),
        [0.25, 0.5, 0.75]
    );
    assert.equal(state?.under.virtueWitnessLamps.length, 9);
    assert.equal(state?.under.virtueWitnessLamps.filter(lamp => lamp.lit).length, 5);
    assert.deepEqual(state?.under.unsatisfiedConstraints, ['#R0-0/1/A-T7-pending?']);

    const html = renderToStaticMarkup(
        React.createElement(ContemplationFlowDirector, { state, bridge })
    );

    assert.match(html, /data-test="contemplation-flow-director"/);
    assert.match(html, /data-author-chip="Pi → Nara"/);
    assert.equal((html.match(/data-test="contemplation-wisdom-byte"/g) ?? []).length, 16);
    assert.match(html, /data-test="m5-wisdom-delta-inspector"/);
    assert.equal((html.match(/data-test="contemplation-virtue-lamp"/g) ?? []).length, 9);
    assert.match(html, /data-animation="dim-to-lit"/);
    assert.match(html, /data-test="contemplation-symbolic-coordinate-chip"/);
    assert.match(html, /data-expression="#R0-0\/1\/A-T7-pending\?"/);
    assert.match(html, /data-test="contemplation-gauge-bar"/);
    assert.match(html, /data-coverage="0.75"/);

    const parseResult = await state.under.parseSymbolicCoordinate('#R0-0/1/A-T7-pending?');
    assert.equal(bridge.rpcCalls.at(-1).method, 'anuttara-symbolic-parse');
    assert.match(parseResult, /parsed #R0-0\/1\/A-T7-pending\?/);

    assert.equal(bridge.published.length, 1);
    assert.equal(bridge.published[0].type, COMPOSITION_CONTEMPLATION_COMPLETE_EVENT);
    assert.equal(bridge.published[0].payload.sessionKey, 'session:29.9');
    assert.deepEqual(bridge.published[0].payload.slots, ['left', 'right', 'under']);
});

test('buildContemplationFlowState accepts a synthetic ContemplationObject envelope', () => {
    const state = buildContemplationFlowState(syntheticContemplationEvent());

    assert.equal(state.eventType, CONTEMPLATION_COMPLETE_EVENT);
    assert.equal(state.left.inscription.highlightColor, '#d4a574');
    assert.equal(state.right.energyReadout, 'E = 0.2500');
    assert.equal(state.right.tritoneCoherences.length, 3);
    assert.equal(state.under.chargeInvariant.balanced, true);
});

function fakeBridge() {
    const listeners = new Set();
    return {
        rpcCalls: [],
        published: [],
        onObservabilityEvent(listener) {
            listeners.add(listener);
            return { dispose: () => listeners.delete(listener) };
        },
        async invokeGatewayRpc(method, params) {
            this.rpcCalls.push({ method, params });
            if (method === 'anuttara-symbolic-parse') {
                return { text: `parsed ${params.expression}` };
            }
            return { ok: true };
        },
        publish(event) {
            this.published.push(event);
        },
        async emit(event) {
            await Promise.all([...listeners].map(listener => listener(event)));
        }
    };
}

function syntheticContemplationEvent() {
    return Object.freeze({
        type: CONTEMPLATION_COMPLETE_EVENT,
        emittedAt: 1781800000000,
        payload: Object.freeze({
            kind: CONTEMPLATION_COMPLETE_EVENT,
            sessionKey: 'session:29.9',
            contemplationObjectRef: 'contemplation://session/29.9',
            llmNaraReading: Object.freeze({
                text: "The bioquaternion trajectory resolves as recognition without exposing protected body content.",
                tarotPsycheAnchors: Object.freeze([
                    Object.freeze({ card: 'The Star', codon: 'codon-17', correspondence: 'hope-to-guidance' }),
                    Object.freeze({ card: 'Temperance', codon: 'codon-55', correspondence: 'mixing-to-coherence' })
                ])
            }),
            wisdom_delta: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
            wisdomDeltaTrace: Object.freeze({
                privacyClass: 'pasu-scoped',
                sessionId: 'session:29.9',
                contemplationObjectRef: 'contemplation://session/29.9',
                llmComposition: Object.freeze({
                    actor: 'pi-llm-position-4',
                    reasoningText: 'LLM read the trajectory against the session-open tarot anchors.',
                    synthesizedRecognition: 'recognition without raw body disclosure'
                }),
                ebmEvaluation: Object.freeze({
                    actor: 'epii-ebm-position-5',
                    energyScore: 0.25,
                    gradient: Object.freeze([0.01, -0.02, 0.03, -0.04]),
                    lensWeightings: Object.freeze({ comp: 1, move: 2, res: 3 }),
                    tritoneSquareCoherences: Object.freeze([0.61, 0.72, 0.83]),
                    predicted72: Object.freeze([0.1, 0.2, 0.3]),
                    target72: Object.freeze([0.2, 0.3, 0.4])
                }),
                verifierReport: Object.freeze({
                    actor: 'anuttara-verifier-position-0',
                    axiomChecks: Object.freeze([{ id: 'A-T7', label: 'T7', status: 'pending' }]),
                    symbolicCoordinateQuestions: Object.freeze(['#R0-0/1/A-T7-pending?']),
                    virtue_witness_vector: 0b101010101,
                    coherence_score: 0.875,
                    unsatisfied_constraints: Object.freeze(['#R0-0/1/A-T7-pending?'])
                }),
                wisdomDeltaBytes: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]),
                preXorQuintessenceHash: Object.freeze([16, 17, 18, 19, 20, 21, 22, 23, 24]),
                postXorQuintessenceHash: Object.freeze([17, 19, 17, 23, 17, 19, 17, 31, 24]),
                spineReading789: Object.freeze({
                    action7: Object.freeze({ register: 'action', virtueBits: 3 }),
                    octave8: Object.freeze({ register: 'octave', virtueBits: 5 }),
                    wholeness9: Object.freeze({ register: 'wholeness', virtueBits: 7 }),
                    virtueLut9Witness: Object.freeze([1, 0, 1, 0, 1, 0, 1, 0, 1])
                })
            }),
            gaugeTrioCoverage: Object.freeze({
                comp: 0.25,
                move: 0.5,
                res: 0.75
            }),
            verifierReport: Object.freeze({
                virtue_witness_vector: 0b101010101,
                coherence_score: 0.875,
                unsatisfied_constraints: Object.freeze(['#R0-0/1/A-T7-pending?']),
                chargeInvariant: Object.freeze({
                    pp: 1,
                    mm: 1,
                    mp: 1,
                    pm: 1,
                    outer: 1
                })
            })
        })
    });
}
