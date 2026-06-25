import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};
        setAttribute() {}
        removeAttribute() {}
        matches() { return false; }
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
        devicePixelRatio: 1,
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
Module._load = function loadPersonalCymaticFieldTestDependency(request, parent, isMain) {
    if (request === '@theia/core/shared/inversify') {
        return {
            injectable: () => target => target,
            inject: () => () => undefined,
            postConstruct: () => () => undefined
        };
    }
    if (request === '@theia/core/lib/common') {
        return {};
    }
    if (request === '@theia/core/lib/browser') {
        return {};
    }
    if (request === '@theia/core/lib/browser/shell/view-contribution') {
        return {
            AbstractViewContribution: class AbstractViewContribution {
                constructor(options) {
                    this.options = options;
                }
                registerCommands() {}
                openView() {
                    return undefined;
                }
            }
        };
    }
    if (request === '@theia/core/lib/browser/widgets/react-widget') {
        return {
            ReactWidget: class ReactWidget {
                title = {};
                classes = [];
                updates = 0;
                addClass(className) {
                    this.classes.push(className);
                }
                update() {
                    this.updates += 1;
                }
                dispose() {}
            }
        };
    }
    if (request === '@pratibimba/m-extension-runtime') {
        return {
            SHARED_BRIDGE_ADAPTER: Symbol.for('SHARED_BRIDGE_ADAPTER'),
            EMPTY_COORDINATE_CONTEXT: {
                profileGeneration: 77,
                dayNowSessionHandle: 'session:test',
                pointerAnchor: null,
                selectedCoordinate: null,
                hashInput: null,
                canonicalMCoordinate: null,
                privacyClass: 'protected_local',
                provenance: { source: 'test', generation: 77, notes: [] }
            },
            CROSS_EXTENSION_ROUTE_CONTRACTS: [],
            REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS: []
        };
    }
    if (request === '@pratibimba/integrated-composition/design-primitives') {
        return {};
    }
    return originalLoad.call(this, request, parent, isMain);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const common = require('../m4-nara/lib/common/index.js');
const cymatic = require('../m4-nara/lib/browser/widgets/personal-cymatic-field.js');

const {
    PERSONAL_CYMATIC_FIELD_VIEW_ID,
    M4_PERSONAL_CYMATIC_FIELD_EXPORT,
    PERSONAL_CYMATIC_FIELD_RPC_METHOD,
    M4PersonalCymaticField,
    PersonalCymaticFieldWidget,
    buildPersonalCymaticScene,
    buildPersonalFieldRpcParams,
    attachOpaqueRendererHandle
} = cymatic;

function profile(payload = {}) {
    return Object.freeze({
        generation: 77,
        pointerAnchor: null,
        capabilities: Object.freeze([]),
        payload: Object.freeze({
            protectedPersonalFieldHandles: Object.freeze({
                qIdentityHandle: 'm4://protected/q/identity',
                qTransitHandle: 'm4://protected/q/transit',
                qActivityHandle: 'm4://protected/q/activity',
                qComposedHandle: 'm4://protected/q/composed'
            }),
            timeAxisMode: 'real-time',
            ...payload
        })
    });
}

function bridge() {
    const state = {
        profileListeners: [],
        contextListeners: [],
        observabilityListeners: [],
        rpcCalls: [],
        handleCalls: []
    };
    return {
        state,
        onProfile(listener) {
            state.profileListeners.push(listener);
            listener(profile());
            return { dispose() {} };
        },
        onCoordinateContext(listener) {
            state.contextListeners.push(listener);
            listener({
                profileGeneration: 77,
                dayNowSessionHandle: 'session:test',
                privacyClass: 'protected_local',
                provenance: { source: 'test', generation: 77, notes: [] }
            });
            return { dispose() {} };
        },
        onObservabilityEvent(listener) {
            state.observabilityListeners.push(listener);
            return { dispose() {} };
        },
        async invokeGatewayRpc(method, params) {
            state.rpcCalls.push({ method, params });
            return {
                attach(canvas, handleParams) {
                    state.handleCalls.push({ kind: 'attach', canvas, params: handleParams });
                    return { dispose() { state.handleCalls.push({ kind: 'dispose' }); } };
                },
                setForegroundedHandle(handle) {
                    state.handleCalls.push({ kind: 'setForegroundedHandle', handle });
                }
            };
        },
        emitTimeAxis(payload) {
            for (const listener of state.observabilityListeners) {
                listener({
                    type: 'nara.time_axis.foreground.changed',
                    extensionId: 'm4-nara',
                    emittedAt: Date.now(),
                    payload
                });
            }
        }
    };
}

test('view id, TRACK_08 export, and gateway RPC method match the declared contract', () => {
    assert.equal(PERSONAL_CYMATIC_FIELD_VIEW_ID, 'm4.nara.personalField');
    assert.equal(M4_PERSONAL_CYMATIC_FIELD_EXPORT, 'M4PersonalCymaticField');
    assert.equal(PERSONAL_CYMATIC_FIELD_RPC_METHOD, 'nara.field.handle');
    assert.ok(common.ALL_VIEW_IDS.includes(PERSONAL_CYMATIC_FIELD_VIEW_ID));
    assert.ok(common.TRACK_08_EXPORTS.includes(M4_PERSONAL_CYMATIC_FIELD_EXPORT));
});

test('DR-IG-6 dipyramid scene contains apex poles, interleaved base vertices, and axis points', () => {
    const scene = buildPersonalCymaticScene();
    assert.equal(scene.nodes.length, 12);
    assert.deepEqual(
        scene.nodes.map(node => node.id),
        ['P5', "P5'", 'P1', "P1'", 'P2', "P2'", 'P3', "P3'", 'P4', "P4'", 'P0', "P0'"]
    );
    assert.deepEqual(scene.nodes.slice(2, 10).map(node => node.role), [
        'top-base',
        'inverted-base',
        'top-base',
        'inverted-base',
        'top-base',
        'inverted-base',
        'top-base',
        'inverted-base'
    ]);
    const apexPoles = scene.nodes.filter(node => node.role === 'apex');
    assert.deepEqual(apexPoles.map(node => node.id), ['P5', "P5'"]);
    assert.notDeepEqual(
        [apexPoles[0].x, apexPoles[0].y, apexPoles[0].z],
        [apexPoles[1].x, apexPoles[1].y, apexPoles[1].z]
    );

    const baseVertices = scene.nodes.filter(node => node.role === 'top-base' || node.role === 'inverted-base');
    assert.equal(baseVertices.length, 8);
    assert.equal(
        new Set(baseVertices.map(node => `${node.x}:${node.y}:${node.z}`)).size,
        8,
        'P1-P4 and P1′-P4′ remain eight distinct base vertices'
    );
    assert.deepEqual(
        baseVertices.map(node => node.id),
        ['P1', "P1'", 'P2', "P2'", 'P3', "P3'", 'P4', "P4'"]
    );

    const axisPoints = scene.nodes.filter(node => node.role === 'axis');
    assert.deepEqual(axisPoints.map(node => node.id), ['P0', "P0'"]);
    assert.deepEqual(
        axisPoints.map(node => [node.x, node.y, node.z]),
        [[0, 0, 0], [0, 0, 0]],
        'P0/P0′ are one central axis-point projected through the poles'
    );
});

test('Hopf-linked toric links wind the apex axis with at least two interlocking tori', () => {
    const scene = buildPersonalCymaticScene();
    assert.ok(scene.toricLinks.length >= 2);
    assert.ok(scene.toricLinks.every(link => link.windsApexAxis));
    assert.ok(new Set(scene.toricLinks.map(link => link.linkGroup)).size >= 2);
});

test('rendered field body is a protected-local handle-only canvas', () => {
    const model = {
        sessionKey: 'session:test',
        foregroundedHandle: 'm4://protected/q/transit',
        rendererStatus: 'attached',
        scene: buildPersonalCymaticScene(),
        audio_octet: [110, 123.47, 130.81, 146.83, 164.81, 174.61, 196, 220],
        cymatic_polarity: 1,
        psychoid_polarity: 1
    };
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4PersonalCymaticField, { model, mode: 'compact-card' })
    );

    assert.match(markup, /data-view-id="m4\.nara\.personalField"/);
    assert.match(markup, /data-export="M4PersonalCymaticField"/);
    assert.match(markup, /mext-privacy-protected-local-handle-only/);
    assert.match(markup, /<canvas/);
    assert.match(markup, /data-node-count="12"/);
    assert.match(markup, /data-node-labels="P5 P5&#x27; P1 P1&#x27; P2 P2&#x27; P3 P3&#x27; P4 P4&#x27; P0 P0&#x27;"/);
    assert.match(markup, /data-apex-pole-labels="P5\/P5&#x27;"/);
    assert.match(markup, /data-axis-point-labels="P0\/P0&#x27;"/);
    assert.match(markup, /data-base-vertex-labels="P1 P1&#x27; P2 P2&#x27; P3 P3&#x27; P4 P4&#x27;"/);
    assert.match(markup, /data-toric-link-count="2"/);
    assert.match(markup, /data-test="dr-ig-6-dipyramid-labels"/);
    assert.match(markup, /P5/);
    assert.match(markup, /P0&#x27;/);
    assert.match(markup, /data-cymatic-polarity="1"/);
    assert.match(markup, /data-psychoid-polarity="1"/);
    assert.match(markup, /data-cymatic-polarity-canon="0=cosmic;1=personal"/);
    assert.match(markup, /data-audio-octet-source="MathemeHarmonicProfile\.audio_octet"/);
    assert.match(markup, /data-audio-octet-count="8"/);
    assert.doesNotMatch(markup, /123\.47|130\.81|146\.83|164\.81|174\.61/);
});

test('widget mount requests the opaque renderer handle and forwards time-axis foreground changes', async () => {
    const fakeBridge = bridge();
    const widget = new PersonalCymaticFieldWidget();
    widget.bridge = fakeBridge;
    widget.init();
    await Promise.resolve();
    await Promise.resolve();

    assert.equal(fakeBridge.state.rpcCalls[0].method, PERSONAL_CYMATIC_FIELD_RPC_METHOD);
    assert.deepEqual(fakeBridge.state.rpcCalls[0].params, {
        sessionKey: 'session:test',
        foregroundedHandle: 'm4://protected/q/transit'
    });

    fakeBridge.emitTimeAxis({
        sessionKey: 'session:test',
        mode: 'kairotic',
        foregroundedHandle: 'm4://protected/q/activity'
    });
    await Promise.resolve();

    const foregroundCall = fakeBridge.state.handleCalls.find(call => call.kind === 'setForegroundedHandle');
    assert.equal(foregroundCall.handle, 'm4://protected/q/activity');
    assert.equal(fakeBridge.state.rpcCalls.at(-1).params.foregroundedHandle, 'm4://protected/q/activity');
});

test('synthetic opaque renderer handle attaches without exposing renderer state', () => {
    const calls = [];
    const canvas = { width: 640, height: 360 };
    const opaqueHandle = {
        attach(surface, params) {
            calls.push({ surface, params });
            return { dispose() { calls.push({ disposed: true }); } };
        }
    };

    const mounted = attachOpaqueRendererHandle(opaqueHandle, canvas, {
        sessionKey: 'session:test',
        foregroundedHandle: 'm4://protected/q/transit'
    });

    assert.equal(mounted.attached, true);
    assert.equal(calls[0].surface, canvas);
    assert.equal(calls[0].params.foregroundedHandle, 'm4://protected/q/transit');
    mounted.dispose();
    assert.deepEqual(calls[1], { disposed: true });
});

test('privacy invariant: source reads handle names only and never q body fields', () => {
    const source = readFileSync(
        join(process.cwd(), 'src/browser/widgets/personal-cymatic-field.tsx'),
        'utf8'
    );
    assert.doesNotMatch(source, /q_[A-Za-z0-9_]*body/i);
    assert.doesNotMatch(source, /rawQuaternion|quaternionBody|identityBody|transitBody|activityBody/);

    const params = buildPersonalFieldRpcParams({
        sessionKey: 'session:test',
        foregroundedHandle: 'm4://protected/q/transit'
    });
    assert.deepEqual(Object.keys(params), ['sessionKey', 'foregroundedHandle']);
});
