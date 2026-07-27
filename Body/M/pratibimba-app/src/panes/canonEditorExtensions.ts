/**
 * Coordinate: M' M0' (Canon Studio editor extensions — 28.T28.4)
 * Residency: Body/M/pratibimba-app/src/panes/canonEditorExtensions.ts
 * Position (#n): CodeMirror 6 binding of the Canon Studio reading model
 * Actualises: the two editor behaviours the Canon Studio deepening adds —
 *   inline QL/bimba decoration over the whole document, and `[[` completion
 *   answered by the live S1 semantic surface (`s1'.semantic.suggest_links`).
 *   The carrier's editor is CodeMirror 6, so the frozen shell's Monaco
 *   `IModelDeltaDecoration` / `CompletionItemProvider` pair lands as
 *   `Decoration.mark` / `CompletionSource` — the same two functions.
 * Public surface: canonDecorationExtension, canonCompletionExtension,
 *   createSemanticCompletionSource, SemanticCompletionDeps.
 * Does NOT own: the mark/query model (panes/canonStudio.ts), semantic scoring
 *   (S1 Hen), the gateway socket (bridge/gatewayHolder.ts), or vault writes.
 * Contract: [[S1-SPEC]]; rerun tranche [[28.T28.4]]; CHROME-CONTRACT §3
 *   (GatewayClient as only network).
 */

import {
    autocompletion,
    type CompletionContext,
    type CompletionResult,
    type CompletionSource
} from '@codemirror/autocomplete';
import { RangeSetBuilder, type Extension } from '@codemirror/state';
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import {
    scanCanonMarks,
    semanticCompletionOptions,
    wikilinkContextAt,
    type CanonMarkKind
} from './canonStudio';
import { parseSemanticConnectionsResponse, SEMANTIC_CONNECTIONS_METHOD } from './semanticConnections';

const MARK: Record<CanonMarkKind, Decoration> = {
    'ql-coordinate': Decoration.mark({ class: 'ql-coordinate' }),
    'bimba-wikilink': Decoration.mark({ class: 'bimba-wikilink' })
};

/** Build the decoration set for a document. Exported for unit proof: the
 *  builder is what rejects unsorted or overlapping ranges. */
export function buildCanonDecorations(doc: string): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    for (const mark of scanCanonMarks(doc)) {
        builder.add(mark.from, mark.to, MARK[mark.kind]);
    }
    return builder.finish();
}

/**
 * Decorate QL coordinates and bimba wikilinks inline. The scan runs over the
 * whole document rather than the viewport: a canonical note is a page, not a
 * log, and a coordinate scrolled out of view must keep its identity when it
 * scrolls back in.
 */
export const canonDecorationExtension: Extension = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildCanonDecorations(view.state.doc.toString());
        }

        update(update: ViewUpdate) {
            if (update.docChanged) {
                this.decorations = buildCanonDecorations(update.state.doc.toString());
            }
        }
    },
    { decorations: instance => instance.decorations }
);

export interface SemanticCompletionDeps {
    /** Vault-relative path of the note being authored — the S1 query is
     *  note-scoped, so there is no completion without it. */
    readonly notePath: string;
    /** Gateway liveness; a disconnected socket yields no suggestions rather
     *  than a thrown completion. */
    readonly ready: () => boolean;
    readonly invoke: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<{ artifact: unknown; privacyClass?: string }>;
    /** Observability seam for the pane's disclosure line (index staleness,
     *  refusal reason). Optional — completion works without it. */
    readonly onState?: (state: SemanticCompletionState) => void;
}

export type SemanticCompletionState =
    | { readonly kind: 'ok'; readonly staleness: string; readonly count: number }
    | { readonly kind: 'unavailable'; readonly reason: string };

/**
 * The Smart Connections completion source. It fires only inside an unclosed
 * `[[`, asks the live S1 semantic surface for this note's neighbours, and
 * offers the privacy-safe ones. Nothing is indexed, scored, or cached here.
 */
export function createSemanticCompletionSource(deps: SemanticCompletionDeps): CompletionSource {
    return async (context: CompletionContext): Promise<CompletionResult | null> => {
        const doc = context.state.doc.toString();
        const link = wikilinkContextAt(doc, context.pos);
        if (!link) {
            return null;
        }
        if (!deps.ready()) {
            deps.onState?.({ kind: 'unavailable', reason: 'gateway disconnected' });
            return null;
        }
        try {
            const receipt = await deps.invoke(SEMANTIC_CONNECTIONS_METHOD, {
                notePath: deps.notePath,
                includeStale: true,
                limit: 20
            });
            const response = parseSemanticConnectionsResponse(receipt.artifact);
            const options = semanticCompletionOptions(response, link.query);
            deps.onState?.({
                kind: 'ok',
                staleness: response.staleness,
                count: options.length
            });
            if (options.length === 0) {
                return null;
            }
            return {
                from: link.from,
                to: link.to,
                options: options.map(option => ({
                    label: option.label,
                    detail: option.detail,
                    info: option.info,
                    boost: option.boost,
                    type: 'reference'
                })),
                validFor: /^[^\[\]\n]*$/
            };
        } catch (cause) {
            deps.onState?.({
                kind: 'unavailable',
                reason: cause instanceof Error ? cause.message : String(cause)
            });
            return null;
        }
    };
}

/** The completion extension for a note: Smart Connections only — the source
 *  overrides CodeMirror's word completion so `[[` never competes with prose. */
export function canonCompletionExtension(deps: SemanticCompletionDeps): Extension {
    return autocompletion({
        override: [createSemanticCompletionSource(deps)],
        activateOnTyping: true
    });
}
