/**
 * selection-context — CTX-framed selection-to-context wire contract.
 *
 * @coordinate   M'-5-4 | Pratibimba surface standard
 * @residency    Body/M/epi-theia/extensions/m-extension-runtime/src/common/selection-context.ts
 * @position     #4 — Context / surface continuity
 * @actualises   Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/44-pratibimba-surface-standard.md#tranche-446--selection--context-context-xray-seam
 *
 * Public surface:
 *   SELECTION_CONTEXT_XRAY_METHOD — planned S2' route literal for coordinate context xray.
 *   SELECTION_CONTEXT_ASSEMBLE_METHOD — spec-ahead S4' fallback assembly route literal.
 *   createSelectionContextRequest — builds the route payload from a block/passage/coordinate selection.
 *   createCtxFramedContextHandle — normalises route output into the CTX-framed context handle agents receive.
 * Does NOT own:
 *   S2 graph lookup law, S4 context assembly law, S5 episodic retrieval, or M4 editor mark storage.
 */

import type {
    Block,
    BlockContextFrame,
    BlockPrivacyClass,
    BlockProvenance
} from './block-contract';

export const SELECTION_CONTEXT_XRAY_METHOD = "s2'.coordinate.context_xray" as const;
export const SELECTION_CONTEXT_ASSEMBLE_METHOD = "s4'.context.assemble" as const;

export type SelectionContextMethod =
    | typeof SELECTION_CONTEXT_XRAY_METHOD
    | typeof SELECTION_CONTEXT_ASSEMBLE_METHOD;

export type SelectionContextKind = 'block' | 'passage' | 'coordinate';

export interface SelectionTextRange {
    readonly from: number;
    readonly to: number;
}

export interface SelectionContextSelection {
    readonly kind: SelectionContextKind;
    readonly ctx: BlockContextFrame;
    readonly privacyClass: BlockPrivacyClass;
    readonly blockId?: string;
    readonly coordinate?: string;
    readonly text?: string;
    readonly range?: SelectionTextRange;
    readonly provenance?: BlockProvenance;
}

export interface SelectionContextRequestParams {
    readonly selection: SelectionContextSelection;
    readonly includeEpisodes: boolean;
    readonly requestedBy: string;
    readonly fallbackMethod: typeof SELECTION_CONTEXT_ASSEMBLE_METHOD;
}

export interface SelectionContextRequest {
    readonly method: typeof SELECTION_CONTEXT_XRAY_METHOD;
    readonly params: SelectionContextRequestParams;
}

export interface SelectionContextEpisode {
    readonly id: string;
    readonly summary: string;
    readonly handle?: string;
    readonly coordinate?: string;
    readonly occurredAt?: string;
}

export interface CtxFramedContextHandle {
    readonly kind: 'ctx-framed-context-handle';
    readonly id: string;
    readonly ctx: BlockContextFrame;
    readonly sourceMethod: SelectionContextMethod;
    readonly selection: SelectionContextSelection;
    readonly privacyClass: BlockPrivacyClass;
    readonly relatedBlocks: readonly Block[];
    readonly relatedCoordinates: readonly string[];
    readonly episodes: readonly SelectionContextEpisode[];
    readonly provenance: {
        readonly route: SelectionContextMethod;
        readonly requestedBy: string;
        readonly fallbackUsed: boolean;
    };
}

export function createSelectionContextRequest(input: {
    readonly selection: SelectionContextSelection;
    readonly includeEpisodes?: boolean;
    readonly requestedBy?: string;
}): SelectionContextRequest {
    assertSelection(input.selection);
    return Object.freeze({
        method: SELECTION_CONTEXT_XRAY_METHOD,
        params: Object.freeze({
            selection: freezeSelection(input.selection),
            includeEpisodes: input.includeEpisodes ?? false,
            requestedBy: input.requestedBy ?? 'block-kit.selection-context',
            fallbackMethod: SELECTION_CONTEXT_ASSEMBLE_METHOD
        })
    });
}

export function selectionFromBlock(block: Block, text?: string, range?: SelectionTextRange): SelectionContextSelection {
    return freezeSelection({
        kind: text ? 'passage' : 'block',
        blockId: block.id,
        coordinate: block.coordinate,
        text,
        range,
        ctx: block.ctx,
        privacyClass: block.privacyClass,
        provenance: block.provenance
    });
}

export function createCtxFramedContextHandle(input: {
    readonly selection: SelectionContextSelection;
    readonly response?: unknown;
    readonly sourceMethod?: SelectionContextMethod;
    readonly requestedBy?: string;
    readonly fallbackUsed?: boolean;
}): CtxFramedContextHandle {
    assertSelection(input.selection);
    const response = isRecord(input.response) ? input.response : {};
    const relatedBlocks = Array.isArray(response.relatedBlocks)
        ? Object.freeze(response.relatedBlocks.filter(isBlockLike) as Block[])
        : Object.freeze([] as Block[]);
    const relatedCoordinates = Array.isArray(response.relatedCoordinates)
        ? Object.freeze(response.relatedCoordinates.filter((value): value is string => typeof value === 'string'))
        : Object.freeze([] as string[]);
    const episodes = Array.isArray(response.episodes)
        ? Object.freeze(response.episodes.filter(isEpisodeLike))
        : Object.freeze([] as SelectionContextEpisode[]);
    const id = typeof response.handleId === 'string'
        ? response.handleId
        : `ctx:${input.selection.kind}:${input.selection.blockId ?? input.selection.coordinate ?? 'selection'}`;

    return Object.freeze({
        kind: 'ctx-framed-context-handle',
        id,
        ctx: Object.freeze({ ...input.selection.ctx }),
        sourceMethod: input.sourceMethod ?? SELECTION_CONTEXT_XRAY_METHOD,
        selection: freezeSelection(input.selection),
        privacyClass: input.selection.privacyClass,
        relatedBlocks,
        relatedCoordinates,
        episodes,
        provenance: Object.freeze({
            route: input.sourceMethod ?? SELECTION_CONTEXT_XRAY_METHOD,
            requestedBy: input.requestedBy ?? 'block-kit.selection-context',
            fallbackUsed: input.fallbackUsed ?? false
        })
    });
}

function assertSelection(selection: SelectionContextSelection): void {
    if (!isRecord(selection)) {
        throw new Error('Selection context requires a selection object');
    }
    if (!['block', 'passage', 'coordinate'].includes(selection.kind)) {
        throw new Error('Selection context kind must be block, passage, or coordinate');
    }
    if (!isRecord(selection.ctx) || typeof selection.ctx.cf !== 'string' || typeof selection.ctx.ct !== 'string' || typeof selection.ctx.cp !== 'string') {
        throw new Error('Selection context requires a CTX frame');
    }
    if (!['public', 'protected', 'protected-local'].includes(selection.privacyClass)) {
        throw new Error('Selection context privacyClass must match the block privacy vocabulary');
    }
    if (selection.kind === 'coordinate' && !selection.coordinate) {
        throw new Error('Coordinate selection requires coordinate');
    }
    if ((selection.kind === 'block' || selection.kind === 'passage') && !selection.blockId) {
        throw new Error(`${selection.kind} selection requires blockId`);
    }
    if (selection.kind === 'passage' && (!selection.text || !selection.range)) {
        throw new Error('Passage selection requires text and range');
    }
}

function freezeSelection(selection: SelectionContextSelection): SelectionContextSelection {
    return Object.freeze({
        ...selection,
        ctx: Object.freeze({ ...selection.ctx }),
        range: selection.range ? Object.freeze({ ...selection.range }) : undefined,
        provenance: selection.provenance ? Object.freeze({ ...selection.provenance }) : undefined
    });
}

function isEpisodeLike(value: unknown): value is SelectionContextEpisode {
    return isRecord(value) && typeof value.id === 'string' && typeof value.summary === 'string';
}

function isBlockLike(value: unknown): value is Block {
    return isRecord(value)
        && typeof value.id === 'string'
        && typeof value.type === 'string'
        && isRecord(value.ctx)
        && typeof value.ctx.cf === 'string'
        && typeof value.ctx.ct === 'string'
        && typeof value.ctx.cp === 'string'
        && typeof value.privacyClass === 'string'
        && Object.prototype.hasOwnProperty.call(value, 'data');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
