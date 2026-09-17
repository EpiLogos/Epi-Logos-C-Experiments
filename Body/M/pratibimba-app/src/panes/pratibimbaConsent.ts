/**
 * Coordinate: M' M4' (personal-coordinate consent + handle-only field logic — 25.T25.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 — Nara context/type; the protected-local personal surface.
 * Actualises: the carrier port of the frozen `ConsentRecord` /
 *   `VoiceCorpusAdmissionInput` shapes + `evaluateVoiceCorpusAdmission`
 *   (nara-surface.ts:106-123, :412 — LAW), plus the DR-M4-3 handle-only
 *   personal-field extractor. Pure, node-testable; the pane consumes these.
 * Public surface: ConsentRecord, ConsentAction, ConsentScope, CONSENT_ACTIONS,
 *   CONSENT_SCOPES, VoiceCorpusAdmissionInput, evaluateVoiceCorpusAdmission,
 *   validateConsentRecord, PERSONAL_HANDLE_KEYS, PersonalHandleKey,
 *   RAW_PERSONAL_FIELD_KEYS, extractPersonalHandles.
 * Does NOT own: the PASU write (S0 `nara.pasu.consents.append`), the proposal
 *   state machine (portal-core), the profile bus (bridge/gatewayClient).
 * Contract: [[M'-SYSTEM-SPEC]]; frozen shapes at
 *   Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts:96-123,:389.
 */

// ─── Ported ConsentRecord contract (frozen — nara-surface.ts:106-123) ────────

export type ConsentAction =
    | 'nara.voice-corpus.include'
    | 'nara.graphiti.body.inspect'
    | 'nara.shared-archetype.publish';

export type ConsentScope = 'single-artifact' | 'single-day' | 'adapter-corpus';

export const CONSENT_ACTIONS: readonly ConsentAction[] = Object.freeze([
    'nara.voice-corpus.include',
    'nara.graphiti.body.inspect',
    'nara.shared-archetype.publish'
]);

export const CONSENT_SCOPES: readonly ConsentScope[] = Object.freeze([
    'single-artifact',
    'single-day',
    'adapter-corpus'
]);

export interface ConsentRecord {
    readonly subjectHandle: string;
    readonly action: ConsentAction;
    readonly consented: boolean;
    readonly consentedAt: string;
    readonly scope: ConsentScope;
    readonly pressureFree: boolean;
    readonly inspectable: boolean;
    readonly revokedAt?: string;
}

export interface VoiceCorpusAdmissionInput {
    readonly consentRecords: readonly ConsentRecord[];
    readonly piiStripped: boolean;
    readonly animaAdmission: 'approved' | 'pending' | 'rejected';
    readonly adapterProvenanceHandle: string | null;
    readonly rollbackDeploymentHandle: string | null;
}

export interface VoiceCorpusAdmissionResult {
    readonly admitted: boolean;
    readonly pressureFreeConsent: boolean;
    readonly piiStripped: boolean;
    readonly animaAdmission: 'approved' | 'pending' | 'rejected';
    readonly adapterProvenanceHandle: string | null;
    readonly rollbackDeploymentHandle: string | null;
    readonly ordinaryDialogueSeparated: true;
}

/**
 * Faithful carrier port of `evaluateVoiceCorpusAdmission` (nara-surface.ts:412).
 * A voice-corpus admission requires a pressure-free, inspectable, un-revoked,
 * affirmative `nara.voice-corpus.include` consent, PII stripped, Anima approved,
 * and both provenance + rollback handles present.
 */
export function evaluateVoiceCorpusAdmission(
    input: VoiceCorpusAdmissionInput
): VoiceCorpusAdmissionResult {
    const consent = input.consentRecords.find(
        record =>
            record.action === 'nara.voice-corpus.include' &&
            record.consented &&
            record.pressureFree &&
            record.inspectable &&
            record.revokedAt === undefined
    );
    const admitted =
        consent !== undefined &&
        input.piiStripped &&
        input.animaAdmission === 'approved' &&
        input.adapterProvenanceHandle !== null &&
        input.rollbackDeploymentHandle !== null;
    return Object.freeze({
        admitted,
        pressureFreeConsent: consent !== undefined,
        piiStripped: input.piiStripped,
        animaAdmission: input.animaAdmission,
        adapterProvenanceHandle: input.adapterProvenanceHandle,
        rollbackDeploymentHandle: input.rollbackDeploymentHandle,
        ordinaryDialogueSeparated: true
    });
}

/**
 * Well-formedness gate for an editor-composed ConsentRecord, mirroring the
 * substrate `validate_consent_record` (pasu.rs). Enum membership is enforced by
 * the typed union; this checks the remaining non-empty invariants. Returns an
 * error string, or null when the record may be appended.
 */
export function validateConsentRecord(record: ConsentRecord): string | null {
    if (!record.subjectHandle || record.subjectHandle.trim() === '') {
        return 'subjectHandle is required';
    }
    if (!record.consentedAt || record.consentedAt.trim() === '') {
        return 'consentedAt is required (ISO-8601 timestamp)';
    }
    if (!CONSENT_ACTIONS.includes(record.action)) {
        return `action must be one of ${CONSENT_ACTIONS.join(', ')}`;
    }
    if (!CONSENT_SCOPES.includes(record.scope)) {
        return `scope must be one of ${CONSENT_SCOPES.join(', ')}`;
    }
    if (record.revokedAt !== undefined && record.revokedAt.trim() === '') {
        return 'revokedAt, when present, must be a non-empty timestamp';
    }
    return null;
}

// ─── DR-M4-3 handle-only personal-field extraction ───────────────────────────

/**
 * The six protected-personal HANDLE keys (epii-review-core `src/lib.rs:498`).
 * These are the ONLY personal-field values that may cross the composition
 * boundary — as opaque strings, never as a body. This is the allow-list panel
 * (a) renders; nothing else is ever surfaced.
 */
export const PERSONAL_HANDLE_KEYS = Object.freeze([
    'qIdentityHandle',
    'qTransitHandle',
    'qActivityHandle',
    'qComposedHandle',
    'audioBusHandle',
    'planetaryChakralStateHandle'
] as const);

export type PersonalHandleKey = (typeof PERSONAL_HANDLE_KEYS)[number];

/**
 * The raw personal-field keys that MUST NOT cross the boundary (epii-review-core
 * `RAW_PERSONAL_FIELD_KEYS`). Kept here so the pane's privacy test can assert no
 * raw body reaches the surface; the extractor never reads these.
 */
export const RAW_PERSONAL_FIELD_KEYS = Object.freeze([
    'qIdentity',
    'q_identity',
    'qTransit',
    'q_transit',
    'qActivity',
    'q_activity',
    'qComposed',
    'q_composed',
    'qPersonal',
    'q_personal',
    'q_b',
    'q_p'
] as const);

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/** Resolve a handle value: a direct non-empty string, or a `{ handle }` wrapper
 *  (the profile-bus projection shape), else null. Never a body. */
function resolveHandle(value: unknown): string | null {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }
    const wrapper = objectValue(value);
    const handle = wrapper?.handle;
    return typeof handle === 'string' && handle.length > 0 ? handle : null;
}

/**
 * Extract ONLY the six personal handle strings from a profile payload. Reads
 * exclusively the `PERSONAL_HANDLE_KEYS` under `harmonicProfile.personalPole`
 * (falling back to the payload root), resolving each to a handle string. Raw
 * `q_*` bodies are never keyed and never returned — the handle-only law is
 * enforced by construction, not by post-hoc filtering.
 */
export function extractPersonalHandles(
    payload: unknown
): Record<PersonalHandleKey, string | null> {
    const outer = objectValue(payload);
    const root = objectValue(outer?.harmonicProfile) ?? outer;
    const source = objectValue(root?.personalPole) ?? root ?? {};
    const result = {} as Record<PersonalHandleKey, string | null>;
    for (const key of PERSONAL_HANDLE_KEYS) {
        result[key] = resolveHandle((source as Record<string, unknown>)[key]);
    }
    return result;
}
