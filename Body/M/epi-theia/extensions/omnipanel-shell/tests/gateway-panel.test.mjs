// Track 27 T27.7 - Gateway tab capability list, parity, readiness, and try-it tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

if (!globalThis.Element) {
    globalThis.Element = class Element {
        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => []
    };
}

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    CapabilityCheckCell
} = require('../lib/browser/components/omni/gateway/CapabilityCheckCell.js');
const {
    CapabilityListView
} = require('../lib/browser/components/omni/gateway/CapabilityListView.js');
const {
    GatewaySubViewSwitcher
} = require('../lib/browser/components/omni/gateway/GatewaySubViewSwitcher.js');
const {
    TryItAffordance
} = require('../lib/browser/components/omni/gateway/TryItAffordance.js');
const {
    GATEWAY_SUBVIEWS,
    capabilityNames,
    canTryCapability,
    gatewayStatusFromReadiness,
    normalizeCapabilitiesPayload,
    normalizeGatewayPanelSessionState,
    submitTryItCapability
} = require('../lib/browser/components/omni/gateway/gatewayModel.js');

const READY_SNAPSHOT = {
    fetchedAt: 1729,
    state: 'ready_public_current',
    reason: 'synthetic gateway fixture',
    profileGeneration: 7,
    bridgeReachable: true,
    blockerIds: []
};

const PENDING_READINESS = {
    fetchedAt: 0,
    state: 'bridge_unavailable',
    reason: 's4 mediation capability list unavailable',
    profileGeneration: null,
    bridgeReachable: false,
    blockerIds: ["s4'.mediation.capabilities.list"]
};

function syntheticCapabilities() {
    return normalizeCapabilitiesPayload({
        capabilities: [
            {
                name: 'invokeGatewayRpc',
                version: '1.0.0',
                status: 'ready',
                privacyClass: 'safe-public',
                safePublic: true,
                samplePayload: {
                    method: 's1.semantic.suggest_links',
                    params: { q: 'VAK' }
                }
            },
            {
                name: 's1.semantic.suggest_links',
                version: '2.1.0',
                status: 'pending-profile-field',
                privacyClass: 'safe-public',
                tryIt: true,
                sample_payload: { q: 'Anima' }
            }
        ]
    }, READY_SNAPSHOT);
}

test('CapabilityListView renders gateway capabilities from the synthetic capability matrix fixture', () => {
    const capabilities = syntheticCapabilities();
    const names = capabilityNames(capabilities);
    const html = renderToStaticMarkup(React.createElement(CapabilityListView, {
        capabilities,
        loading: false,
        error: null,
        readinessSnapshot: READY_SNAPSHOT,
        selectedCapabilityName: 'invokeGatewayRpc',
        widgetCapabilityNames: names,
        onSelectCapability: () => {},
        onRefresh: () => {},
        onInvokeGatewayRpc: async () => ({ ok: true })
    }));

    assert.match(html, /data-test="gateway-capability-list-view"/);
    assert.match(html, /data-test="capability-row-invokeGatewayRpc"/);
    assert.match(html, /data-test="capability-row-s1.semantic.suggest_links"/);
    assert.match(html, /1.0.0/);
    assert.match(html, /pending-profile-field/);
    assert.match(html, /data-parity="pass"/);
    assert.match(html, /data-test="try-it-invokeGatewayRpc"/);
});

test('CapabilityCheckCell renders pass, fail, and unknown parity states', () => {
    const pass = renderToStaticMarkup(React.createElement(CapabilityCheckCell, {
        capabilityName: 'invokeGatewayRpc',
        gatewayCapabilityNames: ['invokeGatewayRpc'],
        widgetCapabilityNames: ['invokeGatewayRpc']
    }));
    const fail = renderToStaticMarkup(React.createElement(CapabilityCheckCell, {
        capabilityName: 'blocked.only',
        gatewayCapabilityNames: ['blocked.only'],
        widgetCapabilityNames: ['invokeGatewayRpc']
    }));
    const pending = renderToStaticMarkup(React.createElement(CapabilityCheckCell, {
        capabilityName: 'invokeGatewayRpc',
        gatewayCapabilityNames: [],
        widgetCapabilityNames: ['invokeGatewayRpc'],
        pending: true
    }));

    assert.match(pass, /data-parity="pass"/);
    assert.match(pass, />✓</);
    assert.match(fail, /data-parity="fail"/);
    assert.match(fail, />✗</);
    assert.match(pending, /data-parity="unknown"/);
    assert.match(pending, />\?</);
});

test('TryItAffordance gates private capabilities and submitTryItCapability dispatches sample JSON payloads', async () => {
    const [safeCapability] = syntheticCapabilities();
    const privateCapability = {
        ...safeCapability,
        name: 's5.private.redacted',
        privacyClass: 'protected-local',
        safePublic: false
    };

    assert.equal(canTryCapability(safeCapability), true);
    assert.equal(canTryCapability(privateCapability), false);

    const blocked = renderToStaticMarkup(React.createElement(TryItAffordance, {
        capability: privateCapability,
        onInvokeGatewayRpc: async () => ({ ok: true })
    }));
    assert.match(blocked, /data-test="try-it-blocked-s5.private.redacted"/);
    assert.match(blocked, /gated/);

    const calls = [];
    const response = await submitTryItCapability(
        safeCapability,
        '{"method":"s1.semantic.suggest_links","params":{"q":"VAK"}}',
        async (method, params) => {
            calls.push({ method, params });
            return { ok: true, echo: params };
        }
    );

    assert.deepEqual(calls, [{
        method: 'invokeGatewayRpc',
        params: {
            method: 's1.semantic.suggest_links',
            params: { q: 'VAK' }
        }
    }]);
    assert.match(response, /"ok": true/);
    assert.match(response, /"q": "VAK"/);
    await assert.rejects(
        () => submitTryItCapability(privateCapability, '{}', async () => ({ ok: true })),
        /privacy-gated/
    );
});

test('GatewaySubViewSwitcher exposes the capabilities view and all six facet sub-views', () => {
    const html = renderToStaticMarkup(React.createElement(GatewaySubViewSwitcher, {
        activeSubView: 'capabilities',
        onChange: () => {}
    }));

    assert.equal(GATEWAY_SUBVIEWS.length, 7);
    for (const view of GATEWAY_SUBVIEWS) {
        assert.match(html, new RegExp(`data-test="gateway-subview-${view.id}"`));
        assert.match(html, new RegExp(`>${view.label}<`));
    }
});

test('CapabilityListView shows ReadinessBanner fallback when the S4 capability list is unregistered', () => {
    const html = renderToStaticMarkup(React.createElement(CapabilityListView, {
        capabilities: [],
        loading: false,
        error: null,
        readinessSnapshot: PENDING_READINESS,
        selectedCapabilityName: null,
        onSelectCapability: () => {},
        onRefresh: () => {},
        onInvokeGatewayRpc: async () => ({ ok: true })
    }));

    assert.match(html, /Gateway capabilities/);
    assert.match(html, /CapabilityListView fallback/);
    assert.match(html, /Capability list unavailable/);
});

test('gateway model normalizes status taxonomy and durable tab-state payloads', () => {
    assert.equal(gatewayStatusFromReadiness({ state: 'ready_public_current' }), 'ready');
    assert.equal(gatewayStatusFromReadiness({ state: 'privacy_blocked' }), 'blocked-privacy');
    assert.equal(gatewayStatusFromReadiness({ state: 's2_graph_blocked' }), 'blocked-s2-graph');
    assert.equal(gatewayStatusFromReadiness(null), 'pending-bridge');

    assert.deepEqual(normalizeGatewayPanelSessionState({
        activeSubView: 'cron',
        selectedCapabilityName: 'invokeGatewayRpc',
        tryItDraft: {
            invokeGatewayRpc: { ping: true }
        }
    }), {
        activeSubView: 'cron',
        selectedCapabilityName: 'invokeGatewayRpc',
        tryItDraft: {
            invokeGatewayRpc: { ping: true }
        }
    });
    assert.deepEqual(normalizeGatewayPanelSessionState({
        activeSubView: 'missing',
        selectedCapabilityName: 17
    }), {
        activeSubView: 'capabilities',
        selectedCapabilityName: null,
        tryItDraft: undefined
    });
});
