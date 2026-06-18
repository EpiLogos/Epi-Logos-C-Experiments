import { IntegratedEvidenceEnvelope } from './evidence-envelope';

/**
 * Graphiti source guard — 08.T6 verification 3.
 *
 * "Tests prove Graphiti memory is never treated as canonical S2 topology
 *  by the integrated plugin."
 *
 * Recognition claims sourced from Graphiti memory carry sourceClass=
 * 'graphiti-memory' in their payload. The plugin must NEVER:
 *   - mark a graphiti-memory envelope as canonical S2;
 *   - deposit a graphiti-memory envelope into a Track 02 S2 graph write path
 *     (any s5.review.target.* with targetKind === 's5.review.target.canon');
 *   - promote a graphiti-memory candidate to canonical promotion routes.
 */
export class GraphitiNotCanonicalError extends Error {
    constructor(public readonly envelopeId: string, public readonly violation: string) {
        super(
            `Envelope ${envelopeId} violates graphiti-source guard: ${violation}`
        );
        this.name = 'GraphitiNotCanonicalError';
    }
}

export function assertNotCanonicalS2Source(envelope: IntegratedEvidenceEnvelope): void {
    const payload = envelope.payload as Readonly<Record<string, unknown>>;
    const sourceClass = payload['recognitionSourceClass'];

    if (sourceClass !== 'graphiti-memory') {
        return;
    }

    // Graphiti-sourced envelope: cannot target canon promotion paths.
    if (envelope.s5ReviewTarget.targetKind === 's5.review.target.canon') {
        throw new GraphitiNotCanonicalError(
            envelope.envelopeId,
            'graphiti-memory envelopes cannot target s5.review.target.canon'
        );
    }

    // Payload must not claim canonical status either.
    const claimsCanonical =
        payload['isCanonical'] === true ||
        payload['s2Canonical'] === true ||
        payload['canonicalS2'] === true;
    if (claimsCanonical) {
        throw new GraphitiNotCanonicalError(
            envelope.envelopeId,
            'graphiti-memory envelope payload asserts canonical S2 status'
        );
    }

    // Payload must not claim a registered_relationship_type identifier that
    // belongs to the S2 schema — that would imply canonical-topology insertion.
    if (typeof payload['registeredRelationshipType'] === 'string') {
        throw new GraphitiNotCanonicalError(
            envelope.envelopeId,
            'graphiti-memory envelope tags a registered S2 relationship type — must remain Graphiti-side'
        );
    }
}

const LIVE_STATE_FORBIDDEN_KEYS = Object.freeze([
    /^episodeBody$/i,
    /^body$/i,
    /^rawBody$/i,
    /^graphitiBody$/i,
    /^graphiti_body$/i,
    /^protectedPayload$/i,
    /^protected_payload$/i,
    /^protectedNaraBody$/i,
    /^rawQuaternion$/i,
    /^raw_quaternion$/i,
    /^identityQuaternion$/i,
    /^q_b$/i,
    /^q_p$/i,
    /^qB$/i,
    /^qP$/i,
    /^q_personal$/i,
    /^q_nara$/i,
    /^bioquaternion(raw|Body|Payload)?$/i
]);

export function assertGraphitiLiveStateProvenanceProtected(
    projection: Readonly<Record<string, unknown>>
): void {
    const violation = findLiveStateForbiddenKey(projection);
    if (violation) {
        throw new GraphitiNotCanonicalError(
            readEnvelopeId(projection),
            `live-state provenance exposes protected field ${violation}`
        );
    }
}

function findLiveStateForbiddenKey(value: unknown): string | null {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const violation = findLiveStateForbiddenKey(item);
            if (violation) {
                return violation;
            }
        }
        return null;
    }
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if (LIVE_STATE_FORBIDDEN_KEYS.some(pattern => pattern.test(key))) {
            return key;
        }
        const violation = findLiveStateForbiddenKey(item);
        if (violation) {
            return violation;
        }
    }
    return null;
}

function readEnvelopeId(projection: Readonly<Record<string, unknown>>): string {
    const entityId = projection['entityId'];
    return typeof entityId === 'string' ? entityId : 'being-pattern-live-state';
}
