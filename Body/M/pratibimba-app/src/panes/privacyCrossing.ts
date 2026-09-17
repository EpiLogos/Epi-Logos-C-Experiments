/**
 * Coordinate: M' M4' (the per-artifact public-bridge crossing gate — 32.T32.8)
 * Residency: Body/M/pratibimba-app/src/panes/privacyCrossing.ts
 * Position (#n): #4 — Context/Type; the boundary an artifact crosses, and the
 *   one thing that may authorise the crossing
 * Actualises: tranche 32.8 (`32-onboarding-settings-empty-states.md:244-257`) —
 *   "Per-artifact opt-in is the ONLY public-bridge crossing path; no global
 *   'make everything public' switch", with the consent record written to PASU
 *   `c_4_atlas_sync_consents` per DR-WC-M4-4 (25.14).
 *
 *   THE GATE IS CONSULTED, NOT MERELY STORED. This is the whole tranche. The
 *   shape 32.8 exists to prevent was already live here: `evaluateVoiceCorpusAdmission`
 *   (`pratibimbaConsent.ts:75`) is a faithful port of the frozen admission
 *   predicate — exported, unit-tested, and called by NOTHING. The 25.14 pane
 *   appends consent records to the ledger and no path anywhere reads that
 *   ledger back before doing something with the material. A consent ledger that
 *   nothing consults is a record of permissions that were never enforced.
 *
 *   So `requestPublicCrossing` LOADS the ledger, evaluates it, and returns
 *   before the effect when the answer is no. The effect (`performCrossing`) is
 *   an injected dependency precisely so the suite can prove it did not run —
 *   a gate whose guarded behaviour is a constant proves nothing about the live
 *   path.
 *
 *   ONE CORRECTION TO THE SPEC, with substrate warrant. 32.8 says the consent
 *   record is written "via `nara.pasu.set` RPC". It cannot be: `pasu_set_key`
 *   (`Body/S/S0/epi-cli/src/vault/pasu.rs:21-27`) accepts exactly six scalar
 *   identity keys and `c_4_atlas_sync_consents` is not among them — the write
 *   would be rejected as an unknown key. The real path is
 *   `nara.pasu.consents.append` (`Body/S/S0/epi-cli/src/gate/nara.rs:708`,
 *   `NARA_PASU_CONSENT_APPEND_METHOD`), which is what 25.14 already uses and
 *   what has array-append semantics. Same destination, working method.
 *
 *   AND THE CROSSING ITSELF IS NOT REACHABLE YET. `publish_shared_archetype_event`
 *   exists as a SpacetimeDB reducer client on the S3 presence handle
 *   (`Body/S/S3/gateway/src/spacetime/presence.rs:600`) and enforces its own
 *   `opt_in_consent` refusal — but no S-layer dispatch table routes a gateway
 *   method to it, so nothing the carrier can call reaches it. That is disclosed
 *   as `PUBLIC_CROSSING_SEAM` and surfaced beside the affordance rather than
 *   papered over with a fabricated success; `privacyCrossing.test.ts` reads the
 *   real dispatch sources and reds the day an arm lands.
 * Public surface: PASU_SHOW_RPC, CONSENT_APPEND_RPC,
 *   SHARED_ARCHETYPE_PUBLISH_ACTION, SHARED_ARCHETYPE_PUBLISH_REDUCER,
 *   PUBLIC_CROSSING_SEAM, PublicCrossingRequest, CrossingRefusalCode,
 *   PublicCrossingDecision, consentCoversCrossing, evaluatePublicCrossing,
 *   crossingDescription, loadConsentLedger, unavailableCrossing,
 *   requestPublicCrossing, confirmPublicCrossing, ConsentFormInput,
 *   PublicCrossingOutcome, CrossingEffectResult, PublicCrossingDependencies.
 * Does NOT own: the ConsentRecord shape or its validator (`pratibimbaConsent.ts`,
 *   the carrier port of the frozen nara-surface contract), the PASU write law
 *   (S0 `pasu.rs`), the class vocabulary (`ui/privacyChrome.ts`), the resting
 *   default or the ceiling (`ui/privacyDefault.ts`), or the render
 *   (`ui/PrivacyOptInSurface.tsx`).
 * Contract: rerun tranche [[32.T32.8]] over [[25.T25.14]] (DR-WC-M4-4).
 */

import {
    validateConsentRecord,
    type ConsentRecord,
    type ConsentScope
} from './pratibimbaConsent';
import type { MExtensionId } from '../ui/privacyDefault';

/** Handle-only PASU read; carries the existing atlas-sync consent ledger. */
export const PASU_SHOW_RPC = 'nara.pasu.show';
/** The array-append write path (25.14 / DR-WC-M4-4). See the header correction. */
export const CONSENT_APPEND_RPC = 'nara.pasu.consents.append';

/** The one ConsentAction that can authorise a public-bridge crossing. */
export const SHARED_ARCHETYPE_PUBLISH_ACTION = 'nara.shared-archetype.publish' as const;

/** The SpacetimeDB reducer a crossing would ultimately post to. */
export const SHARED_ARCHETYPE_PUBLISH_REDUCER = 'publish_shared_archetype_event';

export interface PublicCrossingSeam {
    readonly name: string;
    readonly available: false;
    readonly expected: string;
    readonly reason: string;
}

/**
 * The disclosed gap. Named on the surface, beside the disabled affordance, in
 * the 28.T28.5/28.T28.7 idiom — never a badge implying a call is running.
 */
export const PUBLIC_CROSSING_SEAM: PublicCrossingSeam = Object.freeze({
    name: SHARED_ARCHETYPE_PUBLISH_REDUCER,
    available: false,
    expected:
        'a gateway method that posts the consented artifact to the shared-archetype table on the public bridge',
    reason:
        'the reducer client EXISTS on the S3 spacetime presence handle (Body/S/S3/gateway/src/spacetime/'
        + 'presence.rs:600) and enforces its own `opt_in_consent = true` refusal, but NO gateway method '
        + 'routes to it: no S-layer dispatch table carries an arm, and its only callers are the '
        + '#[ignore]d SpacetimeDB integration tests that need a natively-run host. There is therefore '
        + 'no method for this surface to call. Inventing one, or reporting the consent as a completed '
        + 'crossing, would tell the user their material had been published when nothing left the '
        + 'machine — so the consent is recorded (it is a real decision, and it persists) and the '
        + 'crossing reports itself unavailable by name.'
});

export interface PublicCrossingRequest {
    /** The artifact HANDLE — never a body. Doubles as the consent subject. */
    readonly artifactHandle: string;
    /** One line a person can recognise the artifact by. Not its contents. */
    readonly artifactSummary: string;
    readonly extensionId: MExtensionId;
    readonly scope: ConsentScope;
}

export type CrossingRefusalCode =
    | 'no-consent-record'
    | 'consent-withdrawn'
    | 'consent-revoked'
    | 'consent-not-pressure-free'
    | 'consent-not-inspectable';

export type PublicCrossingDecision =
    | { readonly permitted: false; readonly code: CrossingRefusalCode; readonly reason: string }
    | { readonly permitted: true; readonly consent: ConsentRecord; readonly reason: string };

/**
 * Does this record speak about THIS crossing? Action and subject handle must
 * both match. A consent is per-artifact by construction: the subject handle is
 * the artifact handle, so a record about one artifact can never carry another
 * across, whatever its scope says.
 */
export function consentCoversCrossing(
    record: ConsentRecord,
    request: PublicCrossingRequest
): boolean {
    return (
        record.action === SHARED_ARCHETYPE_PUBLISH_ACTION
        && record.subjectHandle === request.artifactHandle
    );
}

/**
 * THE GATE. Mirrors the substrate's own admission predicate shape
 * (`consent_admits_voice_corpus`, `Body/S/S0/epi-cli/src/vault/pasu.rs`) for the
 * publish action: affirmative, pressure-free, inspectable, un-revoked.
 *
 * The refusal codes are ordered from most specific to least so a user is told
 * the real reason — "you withdrew this" is a different fact from "there is no
 * record" and reading one as the other would be misleading.
 */
export function evaluatePublicCrossing(
    request: PublicCrossingRequest,
    ledger: readonly ConsentRecord[]
): PublicCrossingDecision {
    const candidates = ledger.filter(record => consentCoversCrossing(record, request));
    if (candidates.length === 0) {
        return {
            permitted: false,
            code: 'no-consent-record',
            reason:
                `No ${SHARED_ARCHETYPE_PUBLISH_ACTION} consent exists for ${request.artifactHandle}. `
                + 'Crossing the public bridge is per-artifact opt-in; nothing crosses without one.'
        };
    }
    const qualifying = candidates.find(
        record =>
            record.consented
            && record.pressureFree
            && record.inspectable
            && record.revokedAt === undefined
    );
    if (qualifying) {
        return {
            permitted: true,
            consent: qualifying,
            reason: `consented ${qualifying.consentedAt} at scope ${qualifying.scope}`
        };
    }
    // Report the most recent record's own reason rather than a generic one.
    const latest = candidates[candidates.length - 1] as ConsentRecord;
    if (!latest.consented) {
        return {
            permitted: false,
            code: 'consent-withdrawn',
            reason: `Consent for ${request.artifactHandle} is recorded as withdrawn; it stays protected-local.`
        };
    }
    if (latest.revokedAt !== undefined) {
        return {
            permitted: false,
            code: 'consent-revoked',
            reason: `Consent for ${request.artifactHandle} was revoked at ${latest.revokedAt}; it stays protected-local.`
        };
    }
    if (!latest.pressureFree) {
        return {
            permitted: false,
            code: 'consent-not-pressure-free',
            reason:
                `Consent for ${request.artifactHandle} is not marked pressure-free. A consent given under `
                + 'pressure does not authorise a crossing.'
        };
    }
    return {
        permitted: false,
        code: 'consent-not-inspectable',
        reason:
            `Consent for ${request.artifactHandle} is not marked inspectable. Material that cannot be `
            + 'inspected afterwards does not cross.'
    };
}

/** What the crossing WOULD do, in the user's terms. Handle, never body. */
export function crossingDescription(request: PublicCrossingRequest): string {
    return (
        `This will publish ${request.artifactHandle} from ${request.extensionId} to the public bridge, `
        + `at scope ${request.scope}. Only the handle and the shared archetype cross; the body stays on `
        + 'this machine.'
    );
}

export interface CrossingEffectResult {
    readonly outcome: 'crossed' | 'unavailable';
    readonly seam?: PublicCrossingSeam;
    readonly detail?: string;
}

export interface PublicCrossingDependencies {
    readonly invokeGatewayRpc: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<unknown>;
    /** The effect the gate guards. Production wiring is `unavailableCrossing`. */
    readonly performCrossing: (
        request: PublicCrossingRequest,
        consent: ConsentRecord
    ) => Promise<CrossingEffectResult>;
    readonly nowIso?: () => string;
}

/**
 * The production crossing effect: there is no method to call, so it calls
 * nothing and says so by name. Deliberately takes the same shape as a real
 * effect, so the day the arm lands this is the one function that changes.
 */
export async function unavailableCrossing(
    _request: PublicCrossingRequest,
    _consent: ConsentRecord,
    _dependencies: { readonly invokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown> }
): Promise<CrossingEffectResult> {
    return { outcome: 'unavailable', seam: PUBLIC_CROSSING_SEAM };
}

function artifactOf(receipt: unknown): Record<string, unknown> {
    if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) return {};
    const outer = receipt as Record<string, unknown>;
    const inner = outer.artifact;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        return inner as Record<string, unknown>;
    }
    return outer;
}

function coerceLedger(raw: unknown): ConsentRecord[] {
    return Array.isArray(raw) ? (raw as ConsentRecord[]) : [];
}

/** The authoritative ledger, read from PASU. Never a cached local copy. */
export async function loadConsentLedger(
    dependencies: Pick<PublicCrossingDependencies, 'invokeGatewayRpc'>
): Promise<ConsentRecord[]> {
    const receipt = await dependencies.invokeGatewayRpc(PASU_SHOW_RPC, {});
    return coerceLedger(artifactOf(receipt).c_4_atlas_sync_consents);
}

export type PublicCrossingOutcome =
    | { readonly outcome: 'consent-required'; readonly decision: PublicCrossingDecision }
    | { readonly outcome: 'declined' }
    | { readonly outcome: 'invalid'; readonly reason: string }
    | {
          readonly outcome: 'crossed' | 'unavailable';
          readonly decision: PublicCrossingDecision;
          readonly effect: CrossingEffectResult;
      };

/**
 * Ask for a crossing. Reads the ledger, consults the gate, and returns WITHOUT
 * touching `performCrossing` when the gate refuses. This ordering is the
 * tranche: the guarded effect is downstream of the consult, never beside it.
 */
export async function requestPublicCrossing(
    request: PublicCrossingRequest,
    dependencies: PublicCrossingDependencies
): Promise<PublicCrossingOutcome> {
    const ledger = await loadConsentLedger(dependencies);
    return crossOnLedger(request, ledger, dependencies);
}

async function crossOnLedger(
    request: PublicCrossingRequest,
    ledger: readonly ConsentRecord[],
    dependencies: PublicCrossingDependencies
): Promise<PublicCrossingOutcome> {
    const decision = evaluatePublicCrossing(request, ledger);
    if (!decision.permitted) {
        return { outcome: 'consent-required', decision };
    }
    const effect = await dependencies.performCrossing(request, decision.consent);
    return { outcome: effect.outcome, decision, effect };
}

export interface ConsentFormInput {
    /** False ⇒ "Stay protected-local". Writes nothing: declining is not a record. */
    readonly consented: boolean;
    readonly pressureFree: boolean;
    readonly inspectable: boolean;
}

/**
 * Confirm the opt-in: append the record, then re-run the gate against the
 * ledger the SUBSTRATE returned. Trusting the substrate's copy rather than an
 * optimistic local one is what makes the append and the authorisation the same
 * fact — if the write did not land the way the surface believed, the crossing
 * does not happen.
 */
export async function confirmPublicCrossing(
    request: PublicCrossingRequest,
    form: ConsentFormInput,
    dependencies: PublicCrossingDependencies
): Promise<PublicCrossingOutcome> {
    if (!form.consented) {
        return { outcome: 'declined' };
    }
    const record: ConsentRecord = {
        subjectHandle: request.artifactHandle.trim(),
        action: SHARED_ARCHETYPE_PUBLISH_ACTION,
        consented: true,
        consentedAt: (dependencies.nowIso ?? (() => new Date().toISOString()))(),
        scope: request.scope,
        pressureFree: form.pressureFree,
        inspectable: form.inspectable
    };
    const invalid = validateConsentRecord(record);
    if (invalid) {
        return { outcome: 'invalid', reason: invalid };
    }
    const receipt = await dependencies.invokeGatewayRpc(CONSENT_APPEND_RPC, { consent: record });
    const ledger = coerceLedger(artifactOf(receipt).consents);
    return crossOnLedger(request, ledger, dependencies);
}
