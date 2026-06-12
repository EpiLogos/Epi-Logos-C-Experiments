import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    M4_JOURNAL_DEPOSIT_EVENT_TYPE,
    M4_PRIVACY_BLOCKED_EVENT_TYPE,
    NARA_JOURNAL_DEPOSIT_ROUTE,
    NaraJournalDepositReception,
    receiveM2RoutingDepositHandle
} = require('../../lib/browser/deposit-handle-reception.js');

test("M4' journal receives a deposit_handle from a synthetic M2 F_routing trace", () => {
    const inbox = new NaraJournalDepositReception();
    const result = inbox.receive({
        type: 'm2.routing_trace',
        extensionId: 'm2-parashakti',
        emittedAt: 101,
        payload: Object.freeze({
            f_routing_trace_id: 'synthetic-03.2-to-03.8',
            profileGeneration: 42,
            routeEdges: Object.freeze([
                'm2.address72',
                'm2.F_routing',
                'm4.nara_journal.deposit'
            ]),
            deposit_handle: 'nara://journal/deposit/f-routing-42',
            deposit_handle_privacy_class: 'protected_local_handle_only'
        })
    }, 202);

    assert.equal(result.status, 'accepted');
    assert.equal(inbox.entries().length, 1);
    assert.equal(inbox.entries()[0].deposit_handle, 'nara://journal/deposit/f-routing-42');
    assert.equal(inbox.entries()[0].journalDepositRoute, NARA_JOURNAL_DEPOSIT_ROUTE);
    assert.equal(result.event.type, M4_JOURNAL_DEPOSIT_EVENT_TYPE);
    assert.equal(result.event.payload.deposit_handle, 'nara://journal/deposit/f-routing-42');
    assert.equal(result.event.payload.privacyClass, 'protected_local_handle_only');
    assert.equal(result.event.payload.verifiedPrivacyClass, true);
    assert.equal(result.event.payload.protectedBodiesRendered, false);
    assert.equal(result.event.payload.rawBodyIncluded, false);
});

test('deposit_handle handoff rejects missing or downgraded privacy class', () => {
    const result = receiveM2RoutingDepositHandle({
        type: 'm2.routing_trace',
        extensionId: 'm2-parashakti',
        emittedAt: 303,
        payload: Object.freeze({
            deposit_handle: 'nara://journal/deposit/not-protected',
            deposit_handle_privacy_class: 'public_current'
        })
    }, 404);

    assert.equal(result.status, 'rejected');
    assert.equal(result.event.type, M4_PRIVACY_BLOCKED_EVENT_TYPE);
    assert.equal(result.event.payload.verifiedPrivacyClass, false);
    assert.match(result.event.payload.reason, /public_current/);
});

test('deposit_handle handoff rejects protected raw body leakage even when handle privacy is correct', () => {
    const result = receiveM2RoutingDepositHandle({
        type: 'm2.routing_trace',
        extensionId: 'm2-parashakti',
        emittedAt: 505,
        payload: Object.freeze({
            deposit_handle: 'nara://journal/deposit/raw-leak',
            deposit_handle_privacy_class: 'protected_local_handle_only',
            rawBody: 'journal prose must not cross the bridge'
        })
    }, 606);

    assert.equal(result.status, 'rejected');
    assert.equal(result.event.type, M4_PRIVACY_BLOCKED_EVENT_TYPE);
    assert.match(result.event.payload.reason, /rawBody/);
});
