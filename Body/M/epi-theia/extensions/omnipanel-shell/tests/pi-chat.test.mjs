// Track 27 T27.1 — Pi Chat membrane contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
    SlashCommandParser,
    dispatchGuard,
    parseTranslateForms
} = require('../lib/browser/services/slash-command-parser.js');
const {
    SlashCommandRegistry,
    createDefaultSlashCommandRegistry
} = require('../lib/browser/services/slash-command-registry.js');
const {
    PiChatConversationStore
} = require('../lib/browser/stores/pi-chat-conversation-store.js');
const {
    PI_CHAT_IDENTITY_NARRATIVE,
    buildPiChatHeaderModel,
    buildPiChatHistoryModel,
    buildPiChatInputModel,
    executePiChatSubmit
} = require('../lib/browser/components/omni/chat/PiChatPanel.js');

test('slash-command parser covers the seven canonical verbs', () => {
    const parser = new SlashCommandParser();
    const cases = [
        ['/dispatch nous', { verb: 'dispatch', target: 'nous', args: [] }],
        ['/cast iching', { verb: 'cast', target: 'iching', args: [] }],
        ['/translate philosophical-english → owl being is disclosed', {
            verb: 'translate',
            target: 'philosophical-english',
            args: ['→', 'owl', 'being', 'is', 'disclosed']
        }],
        ['/aletheia crystallise intent', { verb: 'aletheia', target: 'crystallise', args: ['intent'] }],
        ['/session resume sess-7', { verb: 'session', target: 'resume', args: ['sess-7'] }],
        ['/session start', { verb: 'session', target: 'start', args: [] }],
        ['/skills list', { verb: 'skills', target: 'list', args: [] }]
    ];

    for (const [input, expected] of cases) {
        const parsed = parser.parse(input);
        assert.deepEqual(
            { verb: parsed?.verb, target: parsed?.target, args: parsed?.args },
            expected,
            input
        );
    }
});

test('translate parser extracts from/to/text from arrow grammar', () => {
    const parser = new SlashCommandParser();
    const command = parser.parse('/translate philosophical-english → owl the axiom body');
    assert.ok(command);
    assert.deepEqual(parseTranslateForms(command), {
        from: 'philosophical-english',
        to: 'owl',
        text: 'the axiom body'
    });
});

test('dispatch anansi is rejected through the DR-B-3 Aletheia guard', () => {
    const parser = new SlashCommandParser();
    const command = parser.parse('/dispatch anansi');
    assert.ok(command);
    assert.deepEqual(dispatchGuard(command), {
        rejected: true,
        message: 'Aletheia subagents dispatch only via Anima crystallisation-mode. Try `/aletheia crystallise <intent>`.'
    });
});

test('slash-command registry resolves default handlers and returns rejection text', async () => {
    const registry = createDefaultSlashCommandRegistry({
        invokeGatewayRpc: async (method, params) => ({ method, params }),
        activateTab: (tabId, payload) => ({ tabId, payload }),
        sendPiMessage: async (text) => ({ text })
    });
    const parser = new SlashCommandParser();
    const rejected = parser.parse('/dispatch anansi');
    assert.ok(rejected);

    const handler = registry.resolve(rejected);
    assert.ok(handler);
    const result = await handler(rejected, { sessionKey: 'sess-1' });
    assert.equal(result.kind, 'rejected');
    assert.match(result.message, /Aletheia subagents dispatch only via Anima crystallisation-mode/);

    const verbs = registry.listVerbs().map((entry) => entry.verb);
    assert.deepEqual(verbs, ['aletheia', 'cast', 'cron', 'dispatch', 'session', 'skills', 'translate']);
});

test('conversation store persists pi-chat history through per-tab layout state', () => {
    const store = new PiChatConversationStore();
    let changeCount = 0;
    const subscription = store.onDidChange(() => {
        changeCount += 1;
    });

    store.appendMessage({
        id: 'm1',
        actor: 'User',
        text: 'hello',
        timestamp: 100
    });
    const snapshot = store.serializeForTabState();

    const restored = new PiChatConversationStore();
    restored.restoreFromTabState({ 'pi-chat': snapshot });

    assert.equal(changeCount, 1);
    assert.deepEqual(restored.getMessages().map((message) => message.text), ['hello']);
    subscription.dispose();
});

test('PiChatHistory model exposes profile tick generation for re-render identity', () => {
    const store = new PiChatConversationStore();
    store.appendMessage({ id: 'm1', actor: 'Pi', text: 'first', timestamp: 1 });

    const first = buildPiChatHistoryModel(store.getMessages(), { generation: 1, advanced: true });
    const second = buildPiChatHistoryModel(store.getMessages(), { generation: 2, advanced: true });

    assert.equal(first.profileTickGeneration, 1);
    assert.equal(second.profileTickGeneration, 2);
    assert.notEqual(first.renderKey, second.renderKey);
});

test('PiChat header and input models expose identity, session anchor, readiness and slash palette', () => {
    assert.equal(
        PI_CHAT_IDENTITY_NARRATIVE,
        "Pi — conversational membrane. Speak; I dispatch through Anima. Anima orchestrates from S4'; subagents surface in crystallisation-mode."
    );
    const header = buildPiChatHeaderModel({
        sessionKey: 'sess-42',
        readiness: 'connected',
        kairosAtOpen: { lunarDay: 'D9' }
    });
    assert.equal(header.sessionAnchor, '[[NOW-sess-42]]');
    assert.equal(header.connectionStatus, 'connected');
    assert.deepEqual(header.kairosAtOpen, { lunarDay: 'D9' });

    const input = buildPiChatInputModel('/ale', ['dispatch', 'aletheia', 'skills']);
    assert.equal(input.mode, 'slash-command');
    assert.deepEqual(input.completions.map((entry) => entry.verb), ['aletheia']);
});

test('first message in a new session starts Khora before sending to Pi', async () => {
    const calls = [];
    const result = await executePiChatSubmit({
        text: 'begin the work',
        sessionKey: '',
        dayId: '2026-06-10',
        invokeGatewayRpc: async (method, params) => {
            calls.push(['rpc', method, params]);
            return { sessionKey: 'sess-new' };
        },
        setSessionKey: async (sessionKey) => {
            calls.push(['setSessionKey', sessionKey]);
        },
        sendPiMessage: async (message, options) => {
            calls.push(['send', message, options?.sessionKey]);
        }
    });

    assert.equal(result.sessionKey, 'sess-new');
    assert.deepEqual(calls.map((call) => call[0]), ['rpc', 'setSessionKey', 'send']);
    assert.equal(calls[0][1], 's4.khora.session_start');
    assert.equal(calls[2][2], 'sess-new');
});

