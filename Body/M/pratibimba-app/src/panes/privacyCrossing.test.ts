// @vitest-environment node
/**
 * 32.T32.8 — the per-artifact opt-in gate, and the proof that the thing it
 * guards actually consults it.
 *
 * The trap this suite is built around: an opt-in whose consent is RECORDED but
 * never CONSULTED before the protected behaviour runs. That shape was already
 * live in this carrier before 32.8 — `evaluateVoiceCorpusAdmission`
 * (`panes/pratibimbaConsent.ts:75`) is a faithful port of the frozen admission
 * predicate, exported, tested in isolation, and called by NOTHING: the 25.14
 * pane imports `validateConsentRecord` and appends to the ledger, and no path
 * anywhere reads that ledger back to decide whether something may cross.
 *
 * So the assertions here are behavioural in both directions. `performCrossing`
 * is a REAL injected effect, not a constant: the suite proves it is never
 * invoked when the ledger carries no qualifying consent, and IS invoked when
 * the ledger carries one. Delete the ledger consult from `requestPublicCrossing`
 * and the first of those flips red — which is the only thing that makes the
 * second one mean anything.
 *
 * The absent-arm disclosure is held against the real S-stack sources, in the
 * `atelierSeams.test.ts` idiom: the publish reducer client really exists (with
 * its own `opt_in_consent` refusal), and no S-layer dispatch table routes to it.
 * The day an arm lands, this suite reds rather than leaving a stale disclosure.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
    CONSENT_APPEND_RPC,
    PASU_SHOW_RPC,
    PUBLIC_CROSSING_SEAM,
    SHARED_ARCHETYPE_PUBLISH_ACTION,
    SHARED_ARCHETYPE_PUBLISH_REDUCER,
    consentCoversCrossing,
    crossingDescription,
    evaluatePublicCrossing,
    unavailableCrossing,
    confirmPublicCrossing,
    requestPublicCrossing,
    type PublicCrossingRequest
} from './privacyCrossing';
import type { ConsentRecord } from './pratibimbaConsent';

const REPO_ROOT = resolve(__dirname, '../../../../..');

const REQUEST: PublicCrossingRequest = Object.freeze({
    artifactHandle: 'nara://artifact/2026-07-29/atlas-sync-resonance',
    artifactSummary: 'atlas-sync resonance reading',
    extensionId: 'm4-nara',
    scope: 'single-artifact'
});

function consent(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
    return {
        subjectHandle: REQUEST.artifactHandle,
        action: SHARED_ARCHETYPE_PUBLISH_ACTION,
        consented: true,
        consentedAt: '2026-07-29T10:00:00.000Z',
        scope: 'single-artifact',
        pressureFree: true,
        inspectable: true,
        ...overrides
    };
}

function deps(options: {
    readonly ledger?: readonly ConsentRecord[];
    readonly appendResult?: readonly ConsentRecord[];
}) {
    const performCrossing = vi.fn(async (_request: PublicCrossingRequest, _consent: ConsentRecord) => ({
        outcome: 'unavailable' as const,
        seam: PUBLIC_CROSSING_SEAM
    }));
    const invokeGatewayRpc = vi.fn(async (method: string, _params: Record<string, unknown>) => {
        if (method === PASU_SHOW_RPC) {
            return { c_4_atlas_sync_consents: [...(options.ledger ?? [])] };
        }
        if (method === CONSENT_APPEND_RPC) {
            return { consents: [...(options.appendResult ?? options.ledger ?? [])] };
        }
        throw new Error(`unexpected RPC ${method}`);
    });
    return {
        performCrossing,
        invokeGatewayRpc,
        dependencies: {
            invokeGatewayRpc,
            performCrossing,
            nowIso: () => '2026-07-29T10:00:00.000Z'
        }
    };
}

describe('32.T32.8 — the gate refuses a crossing that has no consent record', () => {
    it('an EMPTY ledger blocks the write, and the guarded effect never runs', async () => {
        const { dependencies, performCrossing, invokeGatewayRpc } = deps({ ledger: [] });
        const outcome = await requestPublicCrossing(REQUEST, dependencies);

        expect(outcome.outcome).toBe('consent-required');
        if (outcome.outcome === 'consent-required') {
            expect(outcome.decision.permitted).toBe(false);
        }
        expect(performCrossing, 'the guarded effect must not run without consent').not.toHaveBeenCalled();
        // and the gate really went and read the ledger rather than assuming
        expect(invokeGatewayRpc).toHaveBeenCalledWith(PASU_SHOW_RPC, {});
    });

    it('names WHY it refused, per refusal shape, without leaking the body', async () => {
        const cases: readonly (readonly [Partial<ConsentRecord>, string])[] = [
            [{ consented: false }, 'consent-withdrawn'],
            [{ revokedAt: '2026-07-29T11:00:00.000Z' }, 'consent-revoked'],
            [{ pressureFree: false }, 'consent-not-pressure-free'],
            [{ inspectable: false }, 'consent-not-inspectable'],
            [{ subjectHandle: 'nara://artifact/other' }, 'no-consent-record'],
            [{ action: 'nara.voice-corpus.include' }, 'no-consent-record']
        ];
        for (const [overrides, code] of cases) {
            const decision = evaluatePublicCrossing(REQUEST, [consent(overrides)]);
            expect(decision.permitted, `${code} must refuse`).toBe(false);
            if (decision.permitted) continue;
            expect(decision.code).toBe(code);
            expect(decision.reason.length).toBeGreaterThan(20);
            expect(
                decision.reason,
                'a refusal names the class and the handle, never the artifact body'
            ).not.toContain(REQUEST.artifactSummary);
        }
    });

    it('a voice-corpus consent does NOT authorise a shared-archetype crossing', async () => {
        const { dependencies, performCrossing } = deps({
            ledger: [consent({ action: 'nara.voice-corpus.include' })]
        });
        const outcome = await requestPublicCrossing(REQUEST, dependencies);
        expect(outcome.outcome).toBe('consent-required');
        expect(performCrossing).not.toHaveBeenCalled();
    });

    it('a single-artifact consent for a DIFFERENT artifact does not carry over', () => {
        const other = consent({ subjectHandle: 'nara://artifact/2026-07-29/something-else' });
        expect(consentCoversCrossing(other, REQUEST)).toBe(false);
        expect(consentCoversCrossing(consent(), REQUEST)).toBe(true);
    });

    it('a broader scope covers the artifact; a narrower one for another handle does not', () => {
        const corpus = consent({ scope: 'adapter-corpus', subjectHandle: 'nara://voice/adapter-corpus' });
        expect(
            consentCoversCrossing(corpus, { ...REQUEST, scope: 'adapter-corpus' }),
            'an adapter-corpus consent covers an adapter-corpus request on its own subject'
        ).toBe(false);
        expect(consentCoversCrossing({ ...corpus, subjectHandle: REQUEST.artifactHandle }, REQUEST)).toBe(
            true
        );
    });
});

describe('32.T32.8 — the gate PERMITS once a qualifying consent is in the ledger', () => {
    it('runs the guarded effect, and only then', async () => {
        const { dependencies, performCrossing } = deps({ ledger: [consent()] });
        const outcome = await requestPublicCrossing(REQUEST, dependencies);

        expect(outcome.outcome).not.toBe('consent-required');
        expect(performCrossing, 'a qualifying consent must let the effect run').toHaveBeenCalledTimes(1);
        expect(performCrossing.mock.calls[0]?.[0]).toMatchObject({
            artifactHandle: REQUEST.artifactHandle
        });
    });

    it('the ONLY difference between the two outcomes is the ledger content', async () => {
        const blocked = deps({ ledger: [] });
        const allowed = deps({ ledger: [consent()] });
        const a = await requestPublicCrossing(REQUEST, blocked.dependencies);
        const b = await requestPublicCrossing(REQUEST, allowed.dependencies);
        expect(a.outcome).toBe('consent-required');
        expect(b.outcome).not.toBe('consent-required');
        expect(blocked.performCrossing).not.toHaveBeenCalled();
        expect(allowed.performCrossing).toHaveBeenCalledTimes(1);
    });
});

describe('32.T32.8 — confirming the opt-in persists to PASU and re-consults the gate', () => {
    it('appends the record through the 25.14 RPC and crosses on the RETURNED ledger', async () => {
        const appended = consent();
        const { dependencies, invokeGatewayRpc, performCrossing } = deps({
            ledger: [],
            appendResult: [appended]
        });

        const outcome = await confirmPublicCrossing(
            REQUEST,
            { consented: true, pressureFree: true, inspectable: true },
            dependencies
        );

        const appendCall = invokeGatewayRpc.mock.calls.find(call => call[0] === CONSENT_APPEND_RPC);
        expect(appendCall, 'consent must persist through nara.pasu.consents.append').toBeDefined();
        expect((appendCall?.[1] as unknown as { consent: ConsentRecord }).consent).toMatchObject({
            subjectHandle: REQUEST.artifactHandle,
            action: SHARED_ARCHETYPE_PUBLISH_ACTION,
            consented: true,
            scope: 'single-artifact',
            pressureFree: true,
            inspectable: true,
            consentedAt: '2026-07-29T10:00:00.000Z'
        });
        // the gate is re-run against the AUTHORITATIVE ledger the substrate
        // returned, never an optimistic local guess
        expect(outcome.outcome).not.toBe('consent-required');
        expect(performCrossing).toHaveBeenCalledTimes(1);
    });

    it('"stay protected-local" writes NOTHING — declining is not a consent record', async () => {
        const { dependencies, invokeGatewayRpc, performCrossing } = deps({ ledger: [] });
        const outcome = await confirmPublicCrossing(
            REQUEST,
            { consented: false, pressureFree: true, inspectable: true },
            dependencies
        );
        expect(outcome.outcome).toBe('declined');
        expect(
            invokeGatewayRpc.mock.calls.some(call => call[0] === CONSENT_APPEND_RPC),
            'declining must not append a record to the user’s consent ledger'
        ).toBe(false);
        expect(performCrossing).not.toHaveBeenCalled();
    });

    it('a substrate ledger that does NOT come back qualifying still blocks the crossing', async () => {
        // the append succeeded but the returned ledger carries a withdrawn
        // record — the surface trusts the substrate, not its own optimism
        const { dependencies, performCrossing } = deps({
            ledger: [],
            appendResult: [consent({ consented: false })]
        });
        const outcome = await confirmPublicCrossing(
            REQUEST,
            { consented: true, pressureFree: true, inspectable: true },
            dependencies
        );
        expect(outcome.outcome).toBe('consent-required');
        expect(performCrossing).not.toHaveBeenCalled();
    });

    it('a malformed record is refused before it reaches the user’s PASU note', async () => {
        const { dependencies, invokeGatewayRpc } = deps({ ledger: [] });
        const outcome = await confirmPublicCrossing(
            { ...REQUEST, artifactHandle: '   ' },
            { consented: true, pressureFree: true, inspectable: true },
            dependencies
        );
        expect(outcome.outcome).toBe('invalid');
        expect(invokeGatewayRpc.mock.calls.some(call => call[0] === CONSENT_APPEND_RPC)).toBe(false);
    });
});

describe('32.T32.8 — the crossing description names the crossing, never the body', () => {
    it('names the artifact handle and the public bridge', () => {
        const description = crossingDescription(REQUEST);
        expect(description).toContain(REQUEST.artifactHandle);
        expect(description.toLowerCase()).toContain('public bridge');
    });
});

describe('32.T32.8 — the crossing arm is ABSENT, and the disclosure is held against the stack', () => {
    /** Track 53 moved the handlers to their coordinates: "is it dispatched?" is
     *  the union of the S-root port tables plus the S0 gate host's own arms. */
    const DISPATCH_SOURCES = Object.freeze({
        's0 (epi-cli gate host)': 'Body/S/S0/epi-cli/src/gate/server/dispatch.rs',
        's0 (epi-cli nara arms)': 'Body/S/S0/epi-cli/src/gate/nara.rs',
        's1 (hen-compiler-core)': 'Body/S/S1/hen-compiler-core/src/s1_handlers.rs',
        's2 (graph-services)': 'Body/S/S2/graph-services/src/s2_handlers.rs',
        's3 (gateway)': 'Body/S/S3/gateway/src/s3_handlers.rs',
        's5 (epii-review-core)': 'Body/S/S5/epii-review-core/src/s5_handlers.rs'
    });
    const bodies = Object.fromEntries(
        Object.entries(DISPATCH_SOURCES).map(([label, rel]) => [
            label,
            readFileSync(join(REPO_ROOT, rel), 'utf8')
        ])
    );
    const dispatchedBy = (method: string) =>
        Object.entries(bodies)
            .filter(([, body]) => body.includes(`"${method}"`))
            .map(([label]) => label);

    it('reads the real dispatch sources', () => {
        for (const [label, body] of Object.entries(bodies)) {
            expect(body.length, `${label} dispatch source is non-trivial`).toBeGreaterThan(2000);
        }
        // sanity on the probe: the two PASU methods this flow really rides
        expect(dispatchedBy(PASU_SHOW_RPC).length).toBeGreaterThan(0);
        expect(dispatchedBy(CONSENT_APPEND_RPC).length).toBeGreaterThan(0);
    });

    it('the publish REDUCER exists in the S3 spacetime client, with its own consent refusal', () => {
        const presence = readFileSync(
            join(REPO_ROOT, 'Body/S/S3/gateway/src/spacetime/presence.rs'),
            'utf8'
        );
        expect(presence).toContain(SHARED_ARCHETYPE_PUBLISH_REDUCER);
        expect(
            presence,
            'the substrate refuses a publish without opt_in_consent — the carrier gate mirrors it, never replaces it'
        ).toContain('requires opt_in_consent = true');
    });

    it('and NO gateway method routes to it — so the affordance stays disabled and says why', () => {
        expect(
            dispatchedBy(SHARED_ARCHETYPE_PUBLISH_REDUCER),
            'a dispatch arm landed: the 32.8 disclosure is now stale and the affordance must be enabled'
        ).toEqual([]);
        expect(PUBLIC_CROSSING_SEAM.available).toBe(false);
        expect(PUBLIC_CROSSING_SEAM.name).toBe(SHARED_ARCHETYPE_PUBLISH_REDUCER);
        expect(PUBLIC_CROSSING_SEAM.reason.length).toBeGreaterThan(80);
    });

    it('the production crossing effect refuses rather than inventing an RPC', async () => {
        const invoke = vi.fn(async () => ({}));
        const result = await unavailableCrossing(REQUEST, consent(), { invokeGatewayRpc: invoke });
        expect(result.outcome).toBe('unavailable');
        expect(result.seam).toBe(PUBLIC_CROSSING_SEAM);
        expect(invoke, 'the disabled path must not call a method that does not exist').not.toHaveBeenCalled();
    });
});
