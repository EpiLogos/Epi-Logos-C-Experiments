import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
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
require('@theia/core/lib/browser/frontend-application-config-provider')
    .FrontendApplicationConfigProvider
    .set({ applicationName: 'm4-nara-pratibimba-coordinate-node-test' });

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    M4_PRATIBIMBA_COORDINATE_BADGE_EXPORT,
    M4PratibimbaCoordinateBadge,
    PRATIBIMBA_COORDINATE_VIEW_ID,
    appendAtlasSyncConsent,
    buildConsentRecord,
    proposalReviewRequest,
    proposalsAffectingIdentity,
    safeHandleFieldInput
} = require('../m4-nara/lib/browser/widgets/pratibimba-coordinate.js');

const fieldInput = Object.freeze({
    surfaceId: 'm4-nara',
    qIdentityHandle: 'q://identity/local',
    qTransitHandle: 'q://transit/local',
    qActivityHandle: 'q://activity/local',
    qComposedHandle: 'q://composed/local',
    audioBusHandle: 'audio://bus/protected',
    planetaryChakralStateHandle: 'planetary-chakral://state/protected'
});

const proposals = Object.freeze([
    Object.freeze({
        proposalHandle: 'identity-proposal://one',
        state: 'proposed',
        summary: 'Birthdate encoding layer ready for review.',
        sourceAdapterHandle: 'adapter://tranche-5.9',
        createdAt: '2026-06-11T10:00:00.000Z'
    }),
    Object.freeze({
        proposalHandle: 'identity-proposal://two',
        state: 'reviewed',
        summary: 'Gene Keys layer has reviewer notes.',
        sourceAdapterHandle: 'adapter://tranche-5.9',
        createdAt: '2026-06-11T11:00:00.000Z'
    }),
    Object.freeze({
        proposalHandle: 'identity-proposal://three',
        state: 'applied',
        summary: 'Applied natal baseline update.',
        sourceAdapterHandle: 'adapter://tranche-5.9',
        createdAt: '2026-06-11T12:00:00.000Z'
    })
]);

test('badge renders handle panel, consent editor, and read-only pending proposal list', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4PratibimbaCoordinateBadge, {
            fieldInput,
            consentDraft: {
                subjectHandle: 'nara://day/2026-06-11/artifact/a',
                action: 'nara.voice-corpus.include',
                scope: 'adapter-corpus',
                pressureFree: true,
                inspectable: true
            },
            proposals,
            status: 'ready',
            onConsentDraftChange() {},
            onAppendConsent() {},
            onAcceptProposal() {},
            onRejectProposal() {}
        })
    );

    assert.equal(PRATIBIMBA_COORDINATE_VIEW_ID, 'm4.nara.pratibimbaCoordinate');
    assert.equal(M4_PRATIBIMBA_COORDINATE_BADGE_EXPORT, 'M4PratibimbaCoordinateBadge');
    assert.match(markup, /data-test="m4-pratibimba-coordinate"/);
    assert.match(markup, /data-export="M4PratibimbaCoordinateBadge"/);
    assert.match(markup, /mext-privacy-protected-local-handle-only/);
    assert.match(markup, /qIdentityHandle/);
    assert.match(markup, /q:\/\/identity\/local/);
    assert.match(markup, /Atlas-sync Consent/);
    assert.match(markup, /nara\.voice-corpus\.include/);
    assert.match(markup, /identity-proposal:\/\/one/);
    assert.match(markup, /aria-readonly="true"/);
});

test('consent record write routes through nara.pasu.set with PASU array append semantics', async () => {
    const calls = [];
    const bridge = {
        async invokeGatewayRpc(method, payload) {
            calls.push({ method, payload });
            return {
                key: payload.key,
                value: [
                    {
                        subjectHandle: 'existing://consent',
                        action: 'nara.graphiti.body.inspect',
                        consented: true,
                        consentedAt: '2026-06-10T00:00:00.000Z',
                        scope: 'single-artifact',
                        pressureFree: true,
                        inspectable: true
                    },
                    payload.value
                ]
            };
        }
    };
    const record = buildConsentRecord({
        subjectHandle: 'nara://day/2026-06-11/artifact/a',
        action: 'nara.voice-corpus.include',
        scope: 'adapter-corpus',
        pressureFree: true,
        inspectable: true
    }, '2026-06-11T12:00:00.000Z');

    const result = await appendAtlasSyncConsent(bridge, record);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'nara.pasu.set');
    assert.deepEqual(calls[0].payload, {
        key: 'c_4_atlas_sync_consents',
        value: record,
        mode: 'append'
    });
    assert.equal(result.length, 2);
    assert.equal(result[1].subjectHandle, 'nara://day/2026-06-11/artifact/a');
});

test('proposal state remains read-only until explicit accept or reject review path', () => {
    assert.deepEqual(
        proposalsAffectingIdentity(proposals).map(proposal => proposal.proposalHandle),
        ['identity-proposal://three']
    );

    assert.deepEqual(proposalReviewRequest(proposals[0], 'accept'), {
        method: 'nara.identity.proposals.accept',
        payload: {
            proposalHandle: 'identity-proposal://one',
            reviewGate: 'M5-prime'
        }
    });
    assert.deepEqual(proposalReviewRequest(proposals[1], 'reject'), {
        method: 'nara.identity.proposals.reject',
        payload: {
            proposalHandle: 'identity-proposal://two',
            reviewGate: 'M5-prime'
        }
    });
    assert.throws(() => proposalReviewRequest(proposals[2], 'accept'), /only proposed or reviewed/);
});

test('privacy projection keeps raw personal quaternion bodies out of the surface', () => {
    const unsafe = safeHandleFieldInput({
        ...fieldInput,
        q_b: [1, 0, 0, 0],
        q_p: [0, 1, 0, 0],
        q_personal: { private: true },
        q_composed: { private: true }
    });
    const serialized = JSON.stringify(unsafe);

    assert.equal(unsafe.bodyRendered, false);
    assert.equal('q_b' in unsafe, false);
    assert.equal('q_p' in unsafe, false);
    assert.doesNotMatch(serialized, /"q_b"\s*:/);
    assert.doesNotMatch(serialized, /"q_p"\s*:/);
    assert.doesNotMatch(serialized, /q_personal/);
    assert.doesNotMatch(serialized, /q_composed/);
});

test('protected-local decomposition hook is derived from qComposedHandle', () => {
    const rendered = safeHandleFieldInput(fieldInput);
    const handles = rendered.handles;

    assert.equal(rendered.bodyRendered, false);
    assert.equal(handles.qComposedHandle, fieldInput.qComposedHandle);
    assert.equal(handles.qBHandle, `${fieldInput.qComposedHandle}#q_b`);
    assert.equal(handles.qPHandle, `${fieldInput.qComposedHandle}#q_p`);
});

test('PASU declares atlas-sync consent residency as c_4_atlas_sync_consents array', () => {
    const pasu = readFileSync(
        new URL('../../../../../Idea/Pratibimba/Self/PASU.md', import.meta.url),
        'utf8'
    );

    assert.match(pasu, /^c_4_atlas_sync_consents: \[\]$/m);
});
