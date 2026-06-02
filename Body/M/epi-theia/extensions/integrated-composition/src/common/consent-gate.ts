/**
 * Consent gate — 08.T5 deliverable 3 + verification 2.
 *
 * Each protected action against the 4/5/0 Jiva-Siva composition requires an
 * explicit consent record before the gate will allow the action through. The
 * default plugin view never opens M4 raw bodies, Graphiti episode bodies,
 * identity quaternion internals, or Nara dialogue artifacts — those are
 * always behind governed local-open actions whose entry point is
 * ConsentGate.require().
 *
 * Records are owned by Track 04 (S5 consent service); this gate is the
 * plugin-side enforcement surface. When the service is not yet plumbed the
 * gate is empty and every protected action blocks — that is the correct
 * behavior, not a regression.
 */
export type ConsentAction =
    | 'publish-shared-archetype'
    | 'open-graphiti-body'
    | 'open-identity-quaternion'
    | 'open-nara-dialogue'
    | 'open-m4-field-deep';

export const ALL_CONSENT_ACTIONS: readonly ConsentAction[] = Object.freeze([
    'publish-shared-archetype',
    'open-graphiti-body',
    'open-identity-quaternion',
    'open-nara-dialogue',
    'open-m4-field-deep'
]);

export interface ConsentRecord {
    readonly action: ConsentAction;
    readonly consentedAt: number;
    readonly scope: 'this-session' | 'this-day' | 'this-coordinate';
    /** Wall-clock ms; null means never expires within scope. */
    readonly expiresAt: number | null;
    /** Free-text justification from S5 consent service. */
    readonly justification: string;
}

export class ConsentMissingError extends Error {
    constructor(public readonly action: ConsentAction) {
        super(
            `4/5/0 protected action "${action}" requires an explicit consent record; the gate has no valid record on file.`
        );
        this.name = 'ConsentMissingError';
    }
}

export class ConsentExpiredError extends Error {
    constructor(public readonly action: ConsentAction, public readonly expiredAt: number) {
        super(
            `4/5/0 consent record for "${action}" expired at ${new Date(expiredAt).toISOString()}.`
        );
        this.name = 'ConsentExpiredError';
    }
}

export interface ConsentGateInput {
    /** Test/runtime hook — defaults to Date.now() in production wiring. */
    readonly nowProvider?: () => number;
}

export class ConsentGate {
    private records = new Map<ConsentAction, ConsentRecord>();
    private readonly nowProvider: () => number;

    constructor(opts: ConsentGateInput = {}) {
        this.nowProvider = opts.nowProvider ?? (() => Date.now());
    }

    /** Install a consent record obtained from the S5 consent service. */
    recordConsent(record: ConsentRecord): void {
        this.records.set(record.action, Object.freeze({ ...record }));
    }

    revoke(action: ConsentAction): void {
        this.records.delete(action);
    }

    /** Snapshot view for tests / debugging — never mutate. */
    listRecords(): readonly ConsentRecord[] {
        return Object.freeze([...this.records.values()]);
    }

    /**
     * Throw if the action has no live consent record. Throws
     * ConsentMissingError when nothing is on file, ConsentExpiredError when a
     * record exists but its expiresAt has passed.
     */
    require(action: ConsentAction): void {
        const record = this.records.get(action);
        if (!record) {
            throw new ConsentMissingError(action);
        }
        if (record.expiresAt !== null && record.expiresAt <= this.nowProvider()) {
            throw new ConsentExpiredError(action, record.expiresAt);
        }
    }

    /** Non-throwing variant for UI gating (button enable/disable). */
    isPermitted(action: ConsentAction): boolean {
        try {
            this.require(action);
            return true;
        } catch {
            return false;
        }
    }
}
