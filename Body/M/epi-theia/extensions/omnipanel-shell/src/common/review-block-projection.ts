import type {
    Block,
    BlockAffordance,
    BlockContextFrame,
    BlockPrivacyClass
} from '@pratibimba/m-extension-runtime';
import type {
    ReviewEvidenceEmbed,
    ReviewGenealogyEmbed,
    ReviewItemDeep,
    ToolStreamEvent
} from './omnipanel-runtime';

/**
 * Coordinate: [[M']] / [[M5']] / [[44-pratibimba-surface-standard]]
 * Residency: Body/M/epi-theia/extensions/omnipanel-shell/src/common
 * Position (#n): #5 OmniPanel review projection
 * Actualises: [[44-pratibimba-surface-standard]] Tranche 44.3 block projection for ReviewItemDeep, PatternPacket, and tool events
 * Public surface: reviewItemDeepToBlocks, patternPacketToBlock, toolStreamEventToBlock
 * Does NOT own: block wire types, review law, PatternPacket substrate law, or gateway/runtime transport
 */

export interface PatternPacketProjection {
    readonly id: string;
    readonly coordinate?: string | null;
    readonly privacyClass?: string | null;
    readonly summary?: string | null;
    readonly evidenceRefs?: readonly string[];
    readonly packet: unknown;
}

export function reviewItemDeepToBlocks(item: ReviewItemDeep): readonly Block[] {
    const privacyClass = toBlockPrivacyClass(item.privacyClass);
    const evidencePacketRef = item.evidence?.packetRef ?? item.evidencePacketRef ?? item.id;
    const originatingNodeId = item.genealogy?.originatingNodeId ?? item.originatingDispatchNodeId ?? item.id;

    return Object.freeze([
        Object.freeze({
            id: `block:review-item:${item.id}`,
            type: 'review-item',
            ctx: blockCtx('review-item', 'CT2', '4.2'),
            coordinate: item.coordinate ?? "M5'",
            privacyClass,
            provenance: {
                kind: 'evidence-envelope',
                handle: item.id,
                source: 'omnipanel.review.item'
            },
            data: Object.freeze({
                id: item.id,
                title: item.title,
                status: item.status,
                humanRequired: item.humanRequired,
                reviewerRequired: item.reviewerRequired ?? false,
                recursiveSelfReview: item.recursiveSelfReview ?? false,
                actor: item.actor ?? null,
                mediator: item.mediator ?? null,
                privacyClass: item.privacyClass,
                originatingDispatchNodeId: item.originatingDispatchNodeId ?? null,
                evidencePacketRef: item.evidencePacketRef ?? null,
                iod17Parity: item.iod17Parity,
                depositedAtMs: item.depositedAtMs,
                sessionKey: item.sessionKey,
                dayNowContext: item.dayNowContext,
                coordinate: item.coordinate ?? null,
                summary: item.summary ?? null,
                reason: item.reason ?? null
            }),
            affordances: blockAffordances(['verdict', 'annotate', 'select'])
        } satisfies Block),
        Object.freeze({
            id: `block:evidence:${evidencePacketRef}`,
            type: 'evidence',
            ctx: blockCtx('review-evidence', 'CT1', '4.1'),
            coordinate: item.coordinate ?? "M5'",
            privacyClass: toBlockPrivacyClass(item.evidence?.privacyClass ?? privacyClass),
            provenance: {
                kind: 'evidence-envelope',
                handle: evidencePacketRef,
                source: 'omnipanel.review.evidence'
            },
            data: evidenceData(item.evidence, evidencePacketRef, item.privacyClass),
            affordances: blockAffordances(['navigate'])
        } satisfies Block),
        Object.freeze({
            id: `block:dispatch-genealogy:${originatingNodeId}`,
            type: 'dispatch-genealogy',
            ctx: blockCtx('dispatch-genealogy', 'CT0', '4.0'),
            coordinate: item.coordinate ?? "M5'",
            privacyClass,
            provenance: {
                kind: 'evidence-envelope',
                handle: originatingNodeId,
                source: 'omnipanel.review.dispatch-genealogy'
            },
            data: genealogyData(item.genealogy, originatingNodeId),
            affordances: blockAffordances(['navigate'])
        } satisfies Block)
    ]);
}

export function patternPacketToBlock(packet: PatternPacketProjection): Block {
    const evidenceRefs = Object.freeze([...(packet.evidenceRefs ?? [])]);
    return Object.freeze({
        id: `block:pattern-packet:${packet.id}`,
        type: 'pattern-packet',
        ctx: blockCtx('pattern-packet', 'CT3', '4.3'),
        coordinate: packet.coordinate ?? "M4'",
        privacyClass: toBlockPrivacyClass(packet.privacyClass),
        provenance: {
            kind: 'evidence-envelope' as const,
            handle: evidenceRefs[0] ?? packet.id,
            source: 'omnipanel.review.pattern-packet'
        },
        data: Object.freeze({
            id: packet.id,
            coordinate: packet.coordinate ?? null,
            privacyClass: packet.privacyClass ?? null,
            summary: packet.summary ?? null,
            evidenceRefs,
            packet: packet.packet
        }),
        affordances: blockAffordances(['select', 'navigate'])
    });
}

export function toolStreamEventToBlock(event: ToolStreamEvent): Block {
    return Object.freeze({
        id: `block:tool-stream-event:${event.id}`,
        type: 'tool-stream-event',
        ctx: blockCtx('tool-stream-event', 'CT2', '4.2'),
        coordinate: "M5'",
        privacyClass: toBlockPrivacyClass(event.privacyClass),
        provenance: {
            kind: 'evidence-envelope' as const,
            handle: event.id,
            source: 'omnipanel.tool-stream'
        },
        data: event,
        affordances: blockAffordances(['navigate'])
    });
}

function evidenceData(
    evidence: ReviewEvidenceEmbed | null | undefined,
    fallbackRef: string,
    fallbackPrivacyClass: string | null | undefined
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        packetRef: evidence?.packetRef ?? fallbackRef,
        verdict: evidence?.verdict ?? null,
        verificationState: evidence?.verificationState ?? null,
        summary: evidence?.summary ?? null,
        privacyClass: evidence?.privacyClass ?? fallbackPrivacyClass ?? 'public',
        sourcePaths: Object.freeze([...(evidence?.sourcePaths ?? [])])
    });
}

function genealogyData(
    genealogy: ReviewGenealogyEmbed | null | undefined,
    fallbackNodeId: string
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        originatingNodeId: genealogy?.originatingNodeId ?? fallbackNodeId,
        chain: Object.freeze([...(genealogy?.chain ?? [])])
    });
}

function blockCtx(cpf: string, ct: string, cp: string): BlockContextFrame {
    return Object.freeze({
        cf: '(0/1/2)',
        ct,
        cp,
        cpf,
        cs: 'day'
    });
}

function toBlockPrivacyClass(value: string | null | undefined): BlockPrivacyClass {
    if (value === 'public' || value === 'protected' || value === 'protected-local') {
        return value;
    }
    return 'protected-local';
}

function blockAffordances(affordances: readonly BlockAffordance[]): readonly BlockAffordance[] {
    return Object.freeze([...affordances]);
}
