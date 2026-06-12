// Track 27 T27.2 - Session Manager continuity-fold contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
    MAIN_EPII_SESSION_KEY,
    buildSessionManagerModel,
    extractSessionKey
} = require('../lib/browser/components/omni/sessions/sessionManagerModel.js');

test('session manager orders active first, main second, siblings by kairos_at_open descending', () => {
    const model = buildSessionManagerModel({
        activeSessionKey: 'agent:tool:active',
        now: new Date('2026-06-11T12:00:00.000Z'),
        result: {
            ts: Date.parse('2026-06-11T12:00:00.000Z'),
            path: 'Idea/Empty/Present/2026/06/W24/11',
            count: 4,
            defaults: { model: null, contextTokens: null },
            sessions: [
                {
                    key: 'agent:tool:old',
                    kind: 'direct',
                    updatedAt: Date.parse('2026-06-11T08:00:00.000Z'),
                    kairos_at_open: '2026-06-11T08:00:00.000Z'
                },
                {
                    key: MAIN_EPII_SESSION_KEY,
                    kind: 'direct',
                    updatedAt: Date.parse('2026-06-11T07:00:00.000Z'),
                    kairos_at_open: '2026-06-11T07:00:00.000Z'
                },
                {
                    key: 'agent:tool:active',
                    kind: 'direct',
                    updatedAt: Date.parse('2026-06-11T06:00:00.000Z'),
                    kairos_at_open: '2026-06-11T06:00:00.000Z'
                },
                {
                    key: 'agent:tool:new',
                    kind: 'direct',
                    updatedAt: Date.parse('2026-06-11T10:00:00.000Z'),
                    kairos_at_open: '2026-06-11T10:00:00.000Z',
                    dispatch_count: 3,
                    privacy_class: 'm4_protected_local'
                }
            ]
        }
    });

    assert.equal(model.sourceMethod, 's4.khora.session_list');
    assert.equal(model.mainSessionKey, MAIN_EPII_SESSION_KEY);
    assert.deepEqual(model.sessions.map((session) => session.key), [
        'agent:tool:active',
        MAIN_EPII_SESSION_KEY,
        'agent:tool:new',
        'agent:tool:old'
    ]);
    assert.equal(model.sessions[0].activeNow, true);
    assert.equal(model.sessions[2].dispatchCount, 3);
    assert.equal(model.sessions[2].privacyClass, 'm4_protected_local');
});

test('session manager preserves NOW wikilinks and Khora start session-key extraction', () => {
    const model = buildSessionManagerModel({
        result: {
            ts: Date.now(),
            path: '',
            count: 1,
            defaults: { model: null, contextTokens: null },
            sessions: [
                {
                    key: MAIN_EPII_SESSION_KEY,
                    sessionId: 'epii-main',
                    kind: 'direct',
                    updatedAt: null,
                    kairos_at_open: { lunarDay: 'D9', ts: '2026-06-11T09:00:00.000Z' },
                    tarot_psyche_anchor: { card: 'Temperance' },
                    active_coordinate: 'S5.prime'
                }
            ]
        }
    });

    assert.equal(model.sessions[0].nowWikilink, '[[NOW-epii-main]]');
    assert.equal(model.sessions[0].activeCoordinate, 'S5.prime');
    assert.deepEqual(model.sessions[0].kairosAtOpen, {
        lunarDay: 'D9',
        ts: '2026-06-11T09:00:00.000Z'
    });
    assert.equal(extractSessionKey({ session_key: 'khora-123' }), 'khora-123');
    assert.equal(extractSessionKey({}), null);
});
