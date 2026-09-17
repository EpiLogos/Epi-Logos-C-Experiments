/**
 * Coordinate: M' M4' (Nara local highlight service, rerun 11.T11.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' canvas input
 * Actualises: per-mounted-canvas highlight subscriptions without a fifth runtime store.
 * Public surface: HighlightService.
 * Does NOT own: carrier-global state, vault writes, or highlight category semantics.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.2.
 */

// Ported from frozen Body/M/epi-theia/extensions/m4-nara/src/browser/services/highlight-service.ts.
import {
    AGENT_HIGHLIGHT_CATEGORIES,
    NARA_PRIVACY_CLASS,
    buildHighlightAttributes,
    type AgentHighlightCategory,
    type ExtractedHighlight
} from './m4NaraHighlightMark';

export interface AgentInscription extends ExtractedHighlight {
    readonly sourceFacet: string;
    readonly artifactKind: 'agent-chat';
}

export class HighlightService {
    private highlights: readonly ExtractedHighlight[] = Object.freeze([]);
    private readonly listeners = new Set<() => void>();
    private readonly inscriptionListeners = new Set<(inscription: AgentInscription) => void>();

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    subscribeInscriptions(listener: (inscription: AgentInscription) => void): () => void {
        this.inscriptionListeners.add(listener);
        return () => this.inscriptionListeners.delete(listener);
    }

    getHighlights(): readonly ExtractedHighlight[] {
        return this.highlights;
    }

    recordHighlights(highlights: readonly ExtractedHighlight[]): void {
        this.highlights = Object.freeze([...highlights]);
        for (const listener of this.listeners) listener();
    }

    clear(): void {
        this.recordHighlights([]);
    }

    inscribeAgentMark(
        position: { readonly from: number; readonly to: number },
        category: AgentHighlightCategory,
        content: string,
        sourceFacet: string
    ): AgentInscription {
        if (!AGENT_HIGHLIGHT_CATEGORIES.includes(category)) {
            throw new Error(`Unsupported agent highlight category: ${category}`);
        }
        const inscription = Object.freeze({
            ...buildHighlightAttributes({ category, originalText: content, label: sourceFacet }),
            from: position.from,
            to: position.to,
            text: content,
            privacyClass: NARA_PRIVACY_CLASS,
            sourceFacet,
            artifactKind: 'agent-chat' as const
        });
        this.recordHighlights([
            ...this.highlights.filter(existing => existing.id !== inscription.id),
            inscription
        ]);
        for (const listener of this.inscriptionListeners) listener(inscription);
        return inscription;
    }
}
