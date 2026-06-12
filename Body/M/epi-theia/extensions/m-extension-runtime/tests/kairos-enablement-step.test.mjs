import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const kairos = require('../lib/browser/onboarding/kairos-enablement-step.js');

test('kairos cards match the post-PASU enablement sequence', () => {
    assert.equal(kairos.KAIROS_ENABLED_PREFERENCE, 'epi-logos.privacy.kairos-enabled');
    assert.equal(kairos.KAIROS_REFRESH_INTERVAL_PREFERENCE, 'epi-logos.privacy.kairos-refresh-interval-minutes');
    assert.equal(kairos.KAIROS_ENABLED_DEFAULT, false);

    assert.deepEqual(
        kairos.KAIROS_CARDS.map(card => card.title),
        ['What kairos is', 'What it enables', 'Enable + control']
    );

    const text = kairos.KAIROS_CARDS.map(card => `${card.title} ${card.body} ${(card.items ?? []).join(' ')}`).join(' ');
    assert.match(text, /live astrological time-signal/);
    assert.match(text, /current planet positions from kerykeion/);
    assert.match(text, /Mercurius is the agent/);
    assert.match(text, /ambient-state-strip somatic signature/);
    assert.match(text, /Janus weighting/);
    assert.match(text, /chronos response-orbit saturnine mode/);
    assert.match(text, /cross-system bridge/);
});

test('cold-start stage 6 mounts enablement when kairos is default-off', () => {
    assert.equal(kairos.readKairosEnabled(undefined), false);
    assert.equal(kairos.shouldRefreshKairos(false), false);
    assert.equal(kairos.shouldRefreshKairos(true), true);
    assert.equal(kairos.coldStartKairosBranch(undefined), 'mount-enablement');
    assert.equal(kairos.coldStartKairosBranch(false), 'mount-enablement');
    assert.equal(kairos.coldStartKairosBranch(true), 'refresh');
});

test('enable persists kairos preference, refresh interval, and fires Mercurius initial fetch', async () => {
    const preferences = new Map();
    const rpcCalls = [];

    const result = await kairos.runKairosEnable({
        refreshIntervalMinutes: 90,
        invokeGatewayRpc: async (method, params) => {
            rpcCalls.push({ method, params });
            return { refreshedAt: '2026-06-10T22:00:00.000Z' };
        },
        setPreference: (key, value) => preferences.set(key, value)
    });

    assert.equal(result.outcome, 'enabled');
    assert.equal(preferences.get(kairos.KAIROS_ENABLED_PREFERENCE), true);
    assert.equal(preferences.get(kairos.KAIROS_REFRESH_INTERVAL_PREFERENCE), 90);
    assert.deepEqual(rpcCalls, [
        {
            method: kairos.MERCURIUS_REFRESH_RPC,
            params: {
                reason: 'cold-start-kairos-enable',
                refreshIntervalMinutes: 90
            }
        }
    ]);
    assert.equal(kairos.relayIndicatorLabel(result.relay), 'Kairos active - refreshed 2026-06-10T22:00:00.000Z');
});

test('component renders card 3 with switch and interval control', () => {
    const html = renderToStaticMarkup(
        React.createElement(kairos.KairosEnablementStep, {
            invokeGatewayRpc: async () => ({ refreshedAt: '2026-06-10T22:00:00.000Z' }),
            setPreference: () => undefined,
            initialCardIndex: 2
        })
    );

    assert.match(html, /Enable \+ control/);
    assert.match(html, /role="switch"/);
    assert.match(html, /Refresh interval/);
    assert.match(html, /Mercurius initial kairos fetch/);
});
