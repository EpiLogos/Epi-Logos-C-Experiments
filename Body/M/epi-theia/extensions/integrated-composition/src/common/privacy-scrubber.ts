import { IntegratedEvidenceEnvelope } from './evidence-envelope';

/**
 * Privacy scrubber — 08.T4 verification 2.
 *
 * "Privacy tests prove 1-2-3 evidence contains no protected M4 personal
 * field, raw bioquaternion, private journal, or Graphiti body content."
 *
 * This validator inspects an envelope BEFORE it reaches the S5 gateway and
 * throws PrivacyViolationError on any forbidden field. The plugin layer
 * MUST call validateEvidenceEnvelopeForRange() in the action pipeline so
 * tainted envelopes never go over the wire.
 */
export class PrivacyViolationError extends Error {
    constructor(
        public readonly envelopeId: string,
        public readonly violations: readonly string[]
    ) {
        super(
            `Evidence envelope ${envelopeId} has ${violations.length} privacy violation(s): ${violations.join('; ')}`
        );
        this.name = 'PrivacyViolationError';
    }
}

const FORBIDDEN_FIELD_PATTERNS_BY_RANGE: Record<
    IntegratedEvidenceEnvelope['rangeId'],
    readonly RegExp[]
> = {
    '1-2-3': [
        // M4 protected-local fields and Nara private bodies — never in 1-2-3.
        /^q_(personal|identity|activity|composed)(_|$)/i,
        /^q_nara/i,
        /^bioquaternion(_raw|_body|_personal)?$/i,
        /^nara_(journal|body|raw|private)/i,
        /^graphiti_(body|content|raw|episode_body)/i,
        /^m4_(protected|private|body|raw)/i,
        /^personal_field_(body|raw)/i
    ],
    '4-5-0': [
        // The 4/5/0 envelope is allowed to carry protected-local handles, but
        // DR-M4-3 forbids the body/quaternion side of ProtectedPersonalFieldInput
        // from crossing into M5 review. M4 Tranche 05.5's renderer-handle
        // invariant is therefore enforced here at the plugin boundary.
        /^q_(personal|identity|activity|composed)(_|$)/i,
        /^q(identity|transit|activity|composed)$/i,
        /^audio(_octet|Octet)$/i,
        /^bioquaternion_raw$/i,
        /^graphiti_body$/i,
        /^nara_raw$/i,
        /^raw_(quaternion|audio|body)$/i,
        /^m4_(protected|private|body|raw)$/i,
        /^personal_field_(body|raw)$/i
    ]
};

const FORBIDDEN_VALUE_PATTERNS: readonly RegExp[] = [
    // Privacy-marker strings that indicate the payload contains raw protected
    // text (Graphiti episode body / journal entries / quaternion components).
    /<protected:body>/,
    /<protected:journal>/,
    /<bioquaternion:raw:/
];

export const PRIVATE_Q_PARTITION_KEY_PATTERN = /^q_(personal|identity|activity|composed)(_|$)/i;
export const PUBLIC_Q_PARTITION_KEY_PATTERN = /^q[m]?_[0-5]'?_[a-z_]+$/i;

export function qPartitionViolationForKey(key: string): string | null {
    if (PRIVATE_Q_PARTITION_KEY_PATTERN.test(key)) {
        return `matches private DR-M4-4 q partition ${PRIVATE_Q_PARTITION_KEY_PATTERN.source}`;
    }
    if (/^q[m]?_/i.test(key) && !PUBLIC_Q_PARTITION_KEY_PATTERN.test(key)) {
        return `matches unknown q partition key outside ${PUBLIC_Q_PARTITION_KEY_PATTERN.source}`;
    }
    return null;
}

function walkPayload(
    value: unknown,
    path: string,
    forbiddenFieldPatterns: readonly RegExp[],
    violations: string[]
): void {
    if (value === null || value === undefined) {
        return;
    }
    if (typeof value === 'string') {
        for (const re of FORBIDDEN_VALUE_PATTERNS) {
            if (re.test(value)) {
                violations.push(`${path} contains forbidden marker matching ${re.source}`);
            }
        }
        return;
    }
    if (typeof value !== 'object') {
        return;
    }
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            walkPayload(value[i], `${path}[${i}]`, forbiddenFieldPatterns, violations);
        }
        return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const childPath = path === '' ? key : `${path}.${key}`;
        const qPartitionViolation = qPartitionViolationForKey(key);
        if (qPartitionViolation) {
            violations.push(`${childPath} ${qPartitionViolation}`);
        }
        for (const re of forbiddenFieldPatterns) {
            if (re.test(key)) {
                violations.push(`${childPath} matches forbidden field pattern ${re.source}`);
            }
        }
        walkPayload(child, childPath, forbiddenFieldPatterns, violations);
    }
}

/**
 * Validate an envelope before it leaves the plugin. Returns the envelope
 * unchanged on success; throws PrivacyViolationError on any violation.
 *
 * The check is scoped by rangeId so the 1-2-3 plugin can be stricter than
 * the 4/5/0 plugin (which legitimately handles opaque protected handles).
 */
export function validateEvidenceEnvelopeForRange(
    envelope: IntegratedEvidenceEnvelope
): IntegratedEvidenceEnvelope {
    const violations: string[] = [];
    const forbidden = FORBIDDEN_FIELD_PATTERNS_BY_RANGE[envelope.rangeId];

    // M4 protected privacy class is illegal in 1-2-3 envelopes regardless of
    // payload — the envelope itself declares a privacy scope the plugin does
    // not have license to surface.
    if (
        envelope.rangeId === '1-2-3' &&
        envelope.privacyClass === 'protected_local_handle_only'
    ) {
        violations.push(
            'envelope.privacyClass=protected_local_handle_only is illegal for the 1-2-3 cosmic engine'
        );
    }

    walkPayload(envelope.payload, '', forbidden, violations);

    if (violations.length > 0) {
        throw new PrivacyViolationError(envelope.envelopeId, violations);
    }
    return envelope;
}
