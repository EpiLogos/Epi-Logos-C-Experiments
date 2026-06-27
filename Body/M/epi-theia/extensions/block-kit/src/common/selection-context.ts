/**
 * selection-context — block-kit orchestration for selection-to-context.
 *
 * @coordinate   M'-5-4 | Pratibimba surface standard
 * @residency    Body/M/epi-theia/extensions/block-kit/src/common/selection-context.ts
 * @position     #4 — Context / surface continuity
 * @actualises   Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/44-pratibimba-surface-standard.md#tranche-446--selection--context-context-xray-seam
 *
 * Public surface:
 *   requestSelectionContextHandle — fires the S2' context-xray route and optional S4' assemble fallback.
 *   createSelectionContextAgentInjectionRequest — wraps a CTX-framed context handle for agent injection via Psyche.
 *   inscribeSelectionContextHighlightBack — bridges a returned handle to an M4-Nara HighlightService-compatible port.
 * Does NOT own:
 *   S2 graph query implementation, S4 context assembly, S5 episodic storage, or M4 editor state.
 */

import {
    SELECTION_CONTEXT_ASSEMBLE_METHOD,
    SELECTION_CONTEXT_XRAY_METHOD,
    createCtxFramedContextHandle,
    createSelectionContextRequest,
    type CtxFramedContextHandle,
    type SelectionContextSelection
} from '@pratibimba/m-extension-runtime/lib/common/selection-context';

export type ContextHighlightCategory =
    | 'recognition'
    | 'prospective-surfacing'
    | 'retrospective-surfacing'
    | 'kairos-touch'
    | 'somatic-mark'
    | 'live-spread';

export interface ContextHighlightBackPort {
    inscribeAgentMark(
        position: { readonly from: number; readonly to: number },
        category: ContextHighlightCategory,
        content: string,
        sourceFacet: string
    ): unknown;
}

export interface SelectionContextAgentInjectionRequest {
    readonly method: "s4'.psyche.update";
    readonly params: {
        readonly sessionKey: string;
        readonly patch: {
            readonly renderer: {
                readonly currentSelection: string | null;
                readonly contextHandle: CtxFramedContextHandle;
            };
        };
    };
}

export interface SelectionContextGatewayBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export async function requestSelectionContextHandle(input: {
    readonly bridge: SelectionContextGatewayBridge;
    readonly selection: SelectionContextSelection;
    readonly includeEpisodes?: boolean;
    readonly requestedBy?: string;
    readonly allowAssembleFallback?: boolean;
}): Promise<CtxFramedContextHandle> {
    const request = createSelectionContextRequest({
        selection: input.selection,
        includeEpisodes: input.includeEpisodes,
        requestedBy: input.requestedBy
    });

    try {
        const response = await input.bridge.invokeGatewayRpc(request.method, request.params as unknown as Record<string, unknown>);
        return createCtxFramedContextHandle({
            selection: input.selection,
            response,
            sourceMethod: SELECTION_CONTEXT_XRAY_METHOD,
            requestedBy: request.params.requestedBy
        });
    } catch (error) {
        if (!input.allowAssembleFallback) {
            throw error;
        }
        const fallbackParams = Object.freeze({
            selection: request.params.selection,
            includeEpisodes: request.params.includeEpisodes,
            requestedBy: request.params.requestedBy,
            sourceMethod: SELECTION_CONTEXT_XRAY_METHOD,
            reason: error instanceof Error ? error.message : 'context_xray unavailable'
        });
        const response = await input.bridge.invokeGatewayRpc(SELECTION_CONTEXT_ASSEMBLE_METHOD, fallbackParams);
        return createCtxFramedContextHandle({
            selection: input.selection,
            response,
            sourceMethod: SELECTION_CONTEXT_ASSEMBLE_METHOD,
            requestedBy: request.params.requestedBy,
            fallbackUsed: true
        });
    }
}

export function createSelectionContextAgentInjectionRequest(input: {
    readonly sessionKey: string;
    readonly handle: CtxFramedContextHandle;
}): SelectionContextAgentInjectionRequest {
    return Object.freeze({
        method: "s4'.psyche.update",
        params: Object.freeze({
            sessionKey: input.sessionKey,
            patch: Object.freeze({
                renderer: Object.freeze({
                    currentSelection: input.handle.selection.blockId ?? input.handle.selection.coordinate ?? null,
                    contextHandle: input.handle
                })
            })
        })
    });
}

export function inscribeSelectionContextHighlightBack(input: {
    readonly handle: CtxFramedContextHandle;
    readonly highlightService: ContextHighlightBackPort;
    readonly category?: ContextHighlightCategory;
    readonly content?: string;
    readonly position?: { readonly from: number; readonly to: number };
    readonly sourceFacet?: string;
}): unknown {
    const content = input.content ?? input.handle.selection.text ?? input.handle.selection.coordinate ?? input.handle.selection.blockId ?? input.handle.id;
    const position = input.position ?? input.handle.selection.range ?? Object.freeze({ from: 0, to: content.length });
    return input.highlightService.inscribeAgentMark(
        position,
        input.category ?? 'recognition',
        content,
        input.sourceFacet ?? input.handle.id
    );
}
