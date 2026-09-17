// 21.9 verification suite - Contemplation Prompt footer.
// Asserts the footer projection reads contemplation_prompt_lut and submitting a
// synthetic prompt/draft emits the m0.review.requested observability envelope.

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

const {
    buildM0InspectorModel
} = require('../m0-anuttara/lib/common/m0-inspector.js');
const {
    M0ContemplationPromptFooter,
    publishM0ContemplationReviewRequest
} = require('../m0-anuttara/lib/browser/components/contemplation-prompt-footer.js');

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const context = Object.freeze({
    selectedCoordinate: '#0-4-7',
    hashInput: '#0-4-7',
    canonicalMCoordinate: 'M0',
    profileGeneration: 77,
    pointerAnchor: 'pointer://m0/anuttara/7',
    dayNowSessionHandle: '2026-06-19/session',
    privacyClass: 'public_current',
    provenance: Object.freeze({
        source: 'synthetic-contemplation-test',
        generation: 77,
        notes: Object.freeze([])
    })
});

const readiness = Object.freeze({
    fetchedAt: 1,
    state: 'ready_public_current',
    reason: 'synthetic contemplation prompt available',
    profileGeneration: 77,
    bridgeReachable: true,
    blockerIds: Object.freeze([])
});

test('model projects prompt from profile.payload.contemplation_prompt_lut', () => {
    const prompts = Array.from({ length: 12 }, (_, index) => `Prompt ${index}`);
    prompts[7] = 'What action wants completion now?';
    const model = buildM0InspectorModel({
        selectedInput: '#0-4-7',
        graphNode: Object.freeze({
            coordinate: '#0-4-7',
            properties: Object.freeze({
                coordinate: '#0-4-7',
                c_1_archetype_index: 7
            })
        }),
        profile: Object.freeze({
            generation: 77,
            pointerAnchor: 'pointer://m0/anuttara/7',
            capabilities: Object.freeze([]),
            payload: Object.freeze({
                contemplation_prompt_lut: Object.freeze(prompts)
            })
        }),
        readiness,
        context
    });

    assert.equal(model.contemplation.archetypeIndex, 7);
    assert.equal(model.contemplation.prompt, 'What action wants completion now?');
    assert.equal(model.contemplation.responseDraft, '');
    assert.equal(model.contemplation.state, 'canonical');
});

test('model projects the live Rust camelCase contemplationPromptLut field', () => {
    const prompts = Array.from({ length: 12 }, () => '');
    prompts[7] = 'Did the four causes integrate or did one dominate? Which act was missing?';
    const model = buildM0InspectorModel({
        selectedInput: '#0-4-7',
        graphNode: Object.freeze({
            coordinate: '#0-4-7',
            properties: Object.freeze({ c_1_archetype_index: 7 })
        }),
        profile: Object.freeze({
            generation: 78,
            pointerAnchor: 'pointer://m0/anuttara/7',
            capabilities: Object.freeze([]),
            payload: Object.freeze({
                contemplationPromptLut: Object.freeze(prompts)
            })
        }),
        readiness,
        context
    });

    assert.equal(
        model.contemplation.prompt,
        'Did the four causes integrate or did one dominate? Which act was missing?'
    );
    assert.equal(model.contemplation.state, 'canonical');
});

test('blocked footer renders Track 19.3 pending label until LUT arrives', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M0ContemplationPromptFooter, {
            contemplation: Object.freeze({
                archetypeIndex: 7,
                prompt: null,
                responseDraft: '',
                state: 'blocked'
            }),
            context,
            profileGeneration: 77,
            publisher: { publish() {} }
        })
    );

    assert.match(markup, /data-provenance-state="blocked"/);
    assert.match(markup, /pending: Track 19\.3 — CONTEMPLATION_PROMPT_LUT\[12\]/);
});

test('submission emits m0.review.requested with required payload fields', () => {
    const events = [];
    const submitted = publishM0ContemplationReviewRequest({
        archetypeIndex: 7,
        prompt: 'What action wants completion now?',
        draft: 'A clear witness response.',
        context,
        profileGeneration: 77,
        publisher: {
            publish(event) {
                events.push(event);
            }
        }
    });

    assert.equal(submitted, true);
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.type, 'm0.review.requested');
    assert.equal(event.extensionId, 'm0-anuttara');
    assert.equal(typeof event.emittedAt, 'number');
    assert.equal(event.payload.archetypeIndex, 7);
    assert.equal(event.payload.prompt, 'What action wants completion now?');
    assert.equal(event.payload.responseText, 'A clear witness response.');
    assert.equal(event.payload.coordinate, '#0-4-7');
    assert.equal(event.payload.profileGeneration, 77);
    assert.equal(event.payload.privacyClass, 'public_current_with_graph_provenance');
});
