import { Emitter, Event } from '@theia/core/lib/common/event';
import { injectable } from '@theia/core/shared/inversify';
import { PRIVACY_CLASS, type NaraArtifactKind } from '../../common';
import {
    AGENT_HIGHLIGHT_CATEGORIES,
    type AgentHighlightCategory,
    type ExtractedHighlight,
    buildHighlightAttributes
} from '../editor/extensions/highlight-mark';

export interface HighlightPosition {
    readonly from: number;
    readonly to: number;
}

export interface AgentInscription extends ExtractedHighlight {
    readonly sourceFacet: string;
    readonly privacyClass: typeof PRIVACY_CLASS;
    readonly artifactKind: Extract<NaraArtifactKind, 'agent-chat'>;
}

export interface HighlightServiceSnapshot {
    readonly highlights: readonly ExtractedHighlight[];
    readonly agentInscriptions: readonly AgentInscription[];
}

@injectable()
export class HighlightService {
    protected readonly onDidChangeEmitter = new Emitter<HighlightServiceSnapshot>();
    readonly onDidChange: Event<HighlightServiceSnapshot> = this.onDidChangeEmitter.event;

    protected highlights: ExtractedHighlight[] = [];
    protected agentInscriptions: AgentInscription[] = [];

    dispose(): void {
        this.onDidChangeEmitter.dispose();
    }

    getHighlights(): readonly ExtractedHighlight[] {
        return Object.freeze([...this.highlights]);
    }

    getAgentInscriptions(): readonly AgentInscription[] {
        return Object.freeze([...this.agentInscriptions]);
    }

    snapshot(): HighlightServiceSnapshot {
        return Object.freeze({
            highlights: this.getHighlights(),
            agentInscriptions: this.getAgentInscriptions()
        });
    }

    recordHighlights(highlights: readonly ExtractedHighlight[]): void {
        this.highlights = [...highlights];
        this.fireChange();
    }

    addHighlight(highlight: ExtractedHighlight): void {
        this.highlights = [...this.highlights.filter(existing => existing.id !== highlight.id), highlight];
        this.fireChange();
    }

    clear(): void {
        this.highlights = [];
        this.agentInscriptions = [];
        this.fireChange();
    }

    inscribeAgentMark(
        position: HighlightPosition,
        category: AgentHighlightCategory,
        content: string,
        sourceFacet: string
    ): AgentInscription {
        if (!AGENT_HIGHLIGHT_CATEGORIES.includes(category)) {
            throw new Error(`Unsupported agent highlight category: ${category}`);
        }
        const attrs = buildHighlightAttributes({
            category,
            originalText: content,
            label: sourceFacet
        });
        const inscription: AgentInscription = Object.freeze({
            ...attrs,
            from: position.from,
            to: position.to,
            text: content,
            sourceFacet,
            privacyClass: PRIVACY_CLASS,
            artifactKind: 'agent-chat'
        });
        this.agentInscriptions = [...this.agentInscriptions, inscription];
        this.addHighlight(inscription);
        return inscription;
    }

    protected fireChange(): void {
        this.onDidChangeEmitter.fire(this.snapshot());
    }
}
