import { MObservabilityEvent } from '@pratibimba/m-extension-runtime';

export const M2_ROUTING_TRACE_EVENT_TYPE = 'm2.routing_trace';
export const M4_JOURNAL_DEPOSIT_EVENT_TYPE = 'm4.artifact.created';
export const M4_PRIVACY_BLOCKED_EVENT_TYPE = 'm4.privacy.blocked';
export const NARA_JOURNAL_DEPOSIT_ROUTE = 'nara_journal::deposit';
export const REQUIRED_DEPOSIT_PRIVACY_CLASS = 'protected_local_handle_only';

export interface NaraJournalDepositReceipt {
    readonly deposit_handle: string;
    readonly privacyClass: typeof REQUIRED_DEPOSIT_PRIVACY_CLASS;
    readonly journalDepositRoute: typeof NARA_JOURNAL_DEPOSIT_ROUTE;
    readonly sourceEventType: typeof M2_ROUTING_TRACE_EVENT_TYPE;
    readonly sourceExtensionId: string;
    readonly sourceEmittedAt: number;
    readonly profileGeneration: number | null;
    readonly receivedAt: number;
}

export type DepositHandleReceptionResult =
    | {
        readonly status: 'accepted';
        readonly receipt: NaraJournalDepositReceipt;
        readonly event: MObservabilityEvent;
    }
    | {
        readonly status: 'rejected';
        readonly reason: string;
        readonly event: MObservabilityEvent;
    }
    | {
        readonly status: 'ignored';
        readonly reason: string;
    };

interface DepositCandidate {
    readonly handle: string | null;
    readonly privacyClass: string | null;
}

const DEPOSIT_HANDLE_FIELDS = [
    'deposit_handle',
    'depositHandle',
    'm4_deposit_handle',
    'm4DepositHandle',
    'naraDepositHandle',
    'nara_journal_deposit_handle'
] as const;

const DEPOSIT_PRIVACY_FIELDS = [
    'deposit_handle_privacy_class',
    'depositHandlePrivacyClass',
    'm4_deposit_privacy_class',
    'm4DepositPrivacyClass',
    'naraDepositPrivacyClass',
    'privacyClass',
    'privacy_class'
] as const;

const DEPOSIT_CONTAINER_FIELDS = [
    'm4Deposit',
    'm4_deposit',
    'naraJournal',
    'nara_journal',
    'journalDeposit',
    'journal_deposit'
] as const;

const FORBIDDEN_PROTECTED_BODY_FIELDS = new Set([
    'body',
    'rawBody',
    'raw_body',
    'plaintext',
    'plainText',
    'q_personal',
    'qPersonal',
    'q_nara',
    'qNara',
    'bioquaternion_raw',
    'bioquaternionRaw',
    'graphitiBody',
    'graphiti_body',
    'naraJournalBody',
    'nara_journal_body'
]);

export class NaraJournalDepositReception {
    private readonly receipts: NaraJournalDepositReceipt[] = [];

    receive(
        event: MObservabilityEvent,
        receivedAt: number = Date.now()
    ): DepositHandleReceptionResult {
        const result = receiveM2RoutingDepositHandle(event, receivedAt);
        if (result.status === 'accepted') {
            this.receipts.push(result.receipt);
        }
        return result;
    }

    entries(): readonly NaraJournalDepositReceipt[] {
        return this.receipts;
    }
}

export function receiveM2RoutingDepositHandle(
    event: MObservabilityEvent,
    receivedAt: number = Date.now()
): DepositHandleReceptionResult {
    if (event.type !== M2_ROUTING_TRACE_EVENT_TYPE) {
        return Object.freeze({
            status: 'ignored',
            reason: `ignored event type ${event.type}`
        });
    }

    const forbiddenField = firstForbiddenProtectedBodyField(event.payload);
    if (forbiddenField) {
        return rejected(event, receivedAt, `forbidden protected body field "${forbiddenField}"`);
    }

    const candidate = extractDepositCandidate(event.payload);
    if (!candidate.handle) {
        return Object.freeze({
            status: 'ignored',
            reason: 'm2.routing_trace did not include a deposit_handle'
        });
    }
    if (candidate.privacyClass !== REQUIRED_DEPOSIT_PRIVACY_CLASS) {
        return rejected(
            event,
            receivedAt,
            `deposit_handle privacy class "${candidate.privacyClass ?? 'missing'}" is not ${REQUIRED_DEPOSIT_PRIVACY_CLASS}`
        );
    }

    const receipt: NaraJournalDepositReceipt = Object.freeze({
        deposit_handle: candidate.handle,
        privacyClass: REQUIRED_DEPOSIT_PRIVACY_CLASS,
        journalDepositRoute: NARA_JOURNAL_DEPOSIT_ROUTE,
        sourceEventType: M2_ROUTING_TRACE_EVENT_TYPE,
        sourceExtensionId: event.extensionId,
        sourceEmittedAt: event.emittedAt,
        profileGeneration: optionalNumber(event.payload.profileGeneration),
        receivedAt
    });

    return Object.freeze({
        status: 'accepted',
        receipt,
        event: Object.freeze({
            type: M4_JOURNAL_DEPOSIT_EVENT_TYPE,
            extensionId: 'm4-nara',
            emittedAt: receivedAt,
            payload: Object.freeze({
                ...receipt,
                verifiedPrivacyClass: true,
                protectedBodiesRendered: false,
                rawBodyIncluded: false
            })
        })
    });
}

function rejected(
    event: MObservabilityEvent,
    receivedAt: number,
    reason: string
): DepositHandleReceptionResult {
    return Object.freeze({
        status: 'rejected',
        reason,
        event: Object.freeze({
            type: M4_PRIVACY_BLOCKED_EVENT_TYPE,
            extensionId: 'm4-nara',
            emittedAt: receivedAt,
            payload: Object.freeze({
                sourceEventType: event.type,
                sourceExtensionId: event.extensionId,
                sourceEmittedAt: event.emittedAt,
                journalDepositRoute: NARA_JOURNAL_DEPOSIT_ROUTE,
                verifiedPrivacyClass: false,
                reason,
                protectedBodiesRendered: false,
                rawBodyIncluded: false
            })
        })
    });
}

function extractDepositCandidate(payload: Readonly<Record<string, unknown>>): DepositCandidate {
    const direct = candidateFromRecord(payload);
    if (direct.handle || direct.privacyClass) {
        return direct;
    }

    for (const field of DEPOSIT_CONTAINER_FIELDS) {
        const nested = recordValue(payload[field]);
        if (!nested) {
            continue;
        }
        const nestedCandidate = candidateFromRecord(nested);
        if (nestedCandidate.handle || nestedCandidate.privacyClass) {
            return nestedCandidate;
        }
    }

    return Object.freeze({ handle: null, privacyClass: null });
}

function candidateFromRecord(record: Readonly<Record<string, unknown>>): DepositCandidate {
    return Object.freeze({
        handle: firstString(record, DEPOSIT_HANDLE_FIELDS),
        privacyClass: firstString(record, DEPOSIT_PRIVACY_FIELDS)
    });
}

function firstString(
    record: Readonly<Record<string, unknown>>,
    fields: readonly string[]
): string | null {
    for (const field of fields) {
        const value = record[field];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return null;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null;
    }
    return value as Readonly<Record<string, unknown>>;
}

function optionalNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function firstForbiddenProtectedBodyField(value: unknown): string | null {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const nested = firstForbiddenProtectedBodyField(item);
            if (nested) {
                return nested;
            }
        }
        return null;
    }
    for (const [key, nestedValue] of Object.entries(value)) {
        if (FORBIDDEN_PROTECTED_BODY_FIELDS.has(key)) {
            return key;
        }
        const nested = firstForbiddenProtectedBodyField(nestedValue);
        if (nested) {
            return nested;
        }
    }
    return null;
}
