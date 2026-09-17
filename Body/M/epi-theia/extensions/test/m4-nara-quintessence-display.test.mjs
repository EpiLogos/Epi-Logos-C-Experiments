import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const originalLoad = Module._load;
Module._load = function loadQuintessenceTestDependency(request, parent, isMain) {
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
                classes = [];
                updates = 0;
                addClass(className) {
                    this.classes.push(className);
                }
                update() {
                    this.updates += 1;
                }
                dispose() {
                    return undefined;
                }
            }
        };
    }
    if (request === '@pratibimba/m-extension-runtime') {
        return {
            SHARED_BRIDGE_ADAPTER: Symbol.for('SHARED_BRIDGE_ADAPTER'),
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
const quintessence = require('../m4-nara/lib/browser/widgets/quintessence-display.js');

const {
    QUINTESSENCE_VIEW_ID,
    M4_QUINTESSENCE_CHIP_EXPORT,
    QUINTESSENCE_PASU_SHOW_METHOD,
    QUINTESSENCE_FULL_HASH_METHOD,
    WISDOM_DELTA_EVENT_KIND,
    COSMIC_CLOCK_ATTRIBUTION,
    M4QuintessenceChip,
    QuintessenceDisplayWidget,
    buildQuintessenceDisplayModel,
    normalizeHashHandle,
    readQuintessenceFromPasuShow,
    readFullHashShortForm,
    readWisdomDeltaHex,
    subscribeToQuintessenceObservability
} = quintessence;

const FULL_HASH = '0123456789abcdeffedcba987654321000112233445566778899aabbccddeeff';
const RAW_32_BYTE_SENTINEL = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function profile(generation, payload = {}) {
    return {
        generation,
        pointerAnchor: `profile:${generation}`,
        capabilities: [],
        payload
    };
}

function fakeBridge() {
    const state = {
        profileListeners: [],
        observabilityListeners: [],
        subscribeCalls: [],
        rpcCalls: [],
        rpcResults: new Map([
            [QUINTESSENCE_PASU_SHOW_METHOD, {
                found: true,
                c_5_quintessence_hash: {
                    handle: 'blake3-short:profile-77',
                    first8Hex: '0123456789abcdef'
                },
                c_5_quintessence_clock: 137.5
            }],
            [QUINTESSENCE_FULL_HASH_METHOD, {
                fullHashShortForm: FULL_HASH
            }]
        ])
    };
    return {
        state,
        onProfile(listener) {
            state.profileListeners.push(listener);
            listener(null);
            return { dispose() {} };
        },
        onObservabilityEvent(listener) {
            state.observabilityListeners.push(listener);
            return { dispose() {} };
        },
        subscribeObservability(filter, listener) {
            state.subscribeCalls.push(filter);
            state.observabilityListeners.push(listener);
            return { dispose() {} };
        },
        async invokeGatewayRpc(method, params) {
            state.rpcCalls.push({ method, params });
            return state.rpcResults.get(method) ?? null;
        },
        emitProfile(next) {
            for (const listener of state.profileListeners) {
                listener(next);
            }
        },
        emitObservability(event) {
            for (const listener of state.observabilityListeners) {
                listener(event);
            }
        }
    };
}

test('view id, TRACK_08 export, and RPC constants match the tranche contract', () => {
    assert.equal(QUINTESSENCE_VIEW_ID, 'm4.nara.quintessence');
    assert.equal(M4_QUINTESSENCE_CHIP_EXPORT, 'M4QuintessenceChip');
    assert.equal(QUINTESSENCE_PASU_SHOW_METHOD, 'nara.pasu.show');
    assert.equal(QUINTESSENCE_FULL_HASH_METHOD, 'nara.quintessence.hash.short_form');
    assert.equal(WISDOM_DELTA_EVENT_KIND, 'm5.session.contemplation.complete');
    assert.ok(common.ALL_VIEW_IDS.includes(QUINTESSENCE_VIEW_ID));
    assert.ok(common.TRACK_08_EXPORTS.includes(M4_QUINTESSENCE_CHIP_EXPORT));
});

test('render test against PASU fixture shows hash preview, clock attribution, and privacy chrome', () => {
    const projection = readQuintessenceFromPasuShow({
        pasu: {
            c_5_quintessence_hash: {
                handle: 'blake3-short:fixture-1',
                first8Hex: '0123456789abcdef'
            },
            c_5_quintessence_clock: '725deg'
        }
    });
    const model = buildQuintessenceDisplayModel({
        projection,
        fullHashShortForm: null,
        fullHashStatus: 'idle',
        wisdomDeltaHex: ['0a', '0b', '0c'],
        pulseKey: 0,
        pulseActive: false,
        profileGeneration: 11
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4QuintessenceChip, { model, mode: 'compact-card' })
    );

    assert.match(markup, /data-view-id="m4\.nara\.quintessence"/);
    assert.match(markup, /data-export="M4QuintessenceChip"/);
    assert.match(markup, /mext-privacy-protected-local/);
    assert.match(markup, /0123456789abcdef/);
    assert.match(markup, /5 deg/);
    assert.ok(markup.includes(COSMIC_CLOCK_ATTRIBUTION.replaceAll('"', '&quot;')));
});

test('privacy: raw 32-byte hash never enters rendered DOM before hover fetch', () => {
    const model = buildQuintessenceDisplayModel({
        projection: readQuintessenceFromPasuShow({
            c_5_quintessence_hash: {
                handle: 'opaque-handle-only',
                first8Hex: RAW_32_BYTE_SENTINEL.slice(0, 16)
            },
            c_5_quintessence_clock: 22
        }),
        fullHashShortForm: null,
        fullHashStatus: 'idle',
        wisdomDeltaHex: [],
        pulseKey: 0,
        pulseActive: false,
        profileGeneration: 5
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4QuintessenceChip, { model })
    );

    assert.match(markup, new RegExp(RAW_32_BYTE_SENTINEL.slice(0, 16)));
    assert.doesNotMatch(markup, new RegExp(RAW_32_BYTE_SENTINEL));
    assert.doesNotMatch(markup, /data-full-hash/);
});

test('tooltip full hash is fetched by gateway call on hover, not passed as static prop', async () => {
    const bridge = fakeBridge();
    const widget = new QuintessenceDisplayWidget();
    widget.bridge = bridge;
    widget.init();
    await Promise.resolve();
    await Promise.resolve();

    let markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.doesNotMatch(markup, new RegExp(FULL_HASH));
    assert.equal(bridge.state.rpcCalls.filter(call => call.method === QUINTESSENCE_FULL_HASH_METHOD).length, 0);

    await widget.fetchFullHashShortForm();
    markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.match(markup, new RegExp(FULL_HASH));
    const fullHashCall = bridge.state.rpcCalls.find(call => call.method === QUINTESSENCE_FULL_HASH_METHOD);
    assert.equal(fullHashCall.params.handle, 'blake3-short:profile-77');
    assert.equal(fullHashCall.params.privacyClass, 'protected_local');
});

test('profile tick subscriber re-renders on synthetic tick advance and surfaces clock drift', async () => {
    const bridge = fakeBridge();
    const widget = new QuintessenceDisplayWidget();
    widget.bridge = bridge;
    widget.init();
    await Promise.resolve();

    bridge.emitProfile(profile(1, {
        c_5_quintessence_hash: {
            handle: 'blake3-short:tick-1',
            first8Hex: '0102030405060708'
        },
        c_5_quintessence_clock: 12
    }));
    let markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.match(markup, /12 deg/);

    bridge.emitProfile(profile(2, {
        c_5_quintessence_hash: {
            handle: 'blake3-short:tick-2',
            first8Hex: '0102030405060708'
        },
        c_5_quintessence_clock: 13.25
    }));
    markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.match(markup, /13\.25 deg/);
    assert.match(markup, /data-profile-generation="2"/);
    assert.ok(widget.updates >= 3);
});

test('wisdom_delta arrival pulses once and persists last delta until next event', async () => {
    const bridge = fakeBridge();
    const widget = new QuintessenceDisplayWidget();
    widget.bridge = bridge;
    widget.init();
    await Promise.resolve();

    bridge.emitObservability({
        type: WISDOM_DELTA_EVENT_KIND,
        extensionId: 'm5-epii',
        emittedAt: 1,
        payload: {
            kind: WISDOM_DELTA_EVENT_KIND,
            wisdom_delta: [1, 2, 255]
        }
    });
    let markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.match(markup, /data-pulse-key="1"/);
    assert.match(markup, /data-pulse-active="true"/);
    assert.match(markup, />01</);
    assert.match(markup, />ff</);

    bridge.emitProfile(profile(9));
    markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.match(markup, /data-pulse-key="1"/);
    assert.match(markup, /data-pulse-active="false"/);
    assert.match(markup, />01</);
    assert.match(markup, />ff</);

    bridge.emitObservability({
        type: WISDOM_DELTA_EVENT_KIND,
        extensionId: 'm5-epii',
        emittedAt: 2,
        payload: {
            kind: WISDOM_DELTA_EVENT_KIND,
            wisdom_delta: '0a0b0c'
        }
    });
    markup = ReactDOMServer.renderToStaticMarkup(widget.render());
    assert.match(markup, /data-pulse-key="2"/);
    assert.match(markup, />0a</);
    assert.doesNotMatch(markup, />ff</);
});

test('observability helper requests the contemplation-complete kind filter when available', () => {
    const filters = [];
    subscribeToQuintessenceObservability({
        subscribeObservability(filter) {
            filters.push(filter);
            return { dispose() {} };
        },
        onObservabilityEvent() {
            throw new Error('fallback should not be used');
        }
    }, () => undefined);
    assert.deepEqual(filters, [{ kind: WISDOM_DELTA_EVENT_KIND }]);
});

test('normalizers accept handle-only hash, full short-form, and wisdom_delta bytes', () => {
    assert.deepEqual(normalizeHashHandle({
        handle: 'blake3-short:x',
        first8Hex: 'ABCDEF0123456789'
    }), {
        handle: 'blake3-short:x',
        first8Hex: 'abcdef0123456789'
    });
    assert.equal(readFullHashShortForm({ full_hash_short_form: `blake3:${FULL_HASH}` }), FULL_HASH);
    assert.deepEqual(readWisdomDeltaHex({ wisdom_delta_bytes: new Uint8Array([10, 11, 12]) }), ['0a', '0b', '0c']);
});
