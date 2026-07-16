/**
 * Coordinate: M' M4' (Nara canvas highlight mark, rerun 11.T11.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' canvas input
 * Actualises: the protected-local Tiptap highlight contract and Markdown round-trip.
 * Public surface: HighlightMark, four user categories, extraction/build helpers.
 * Does NOT own: agent-category semantics, vault persistence, or public/S2 projection.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.2.
 */

// Ported from frozen Body/M/epi-theia/extensions/m4-nara/src/browser/editor/extensions/highlight-mark.ts.
import { Editor, Mark, mergeAttributes } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';

export const NARA_PRIVACY_CLASS = 'protected_local' as const;
export const USER_HIGHLIGHT_CATEGORIES = Object.freeze([
    'daily-note',
    'oracle',
    'dream',
    'expand'
] as const);
export const AGENT_HIGHLIGHT_CATEGORIES = Object.freeze([
    'recognition',
    'prospective-surfacing',
    'retrospective-surfacing',
    'kairos-touch',
    'somatic-mark',
    'live-spread'
] as const);

export type UserHighlightCategory = (typeof USER_HIGHLIGHT_CATEGORIES)[number];
export type AgentHighlightCategory = (typeof AGENT_HIGHLIGHT_CATEGORIES)[number];
export type HighlightCategory = UserHighlightCategory | string;

export const HIGHLIGHT_VISUAL_REGISTERS = Object.freeze({
    'daily-note': { cssVariable: '--nara-highlight-daily-note', register: 'user-reflection' },
    oracle: { cssVariable: '--nara-highlight-oracle', register: 'user-symbolic' },
    dream: { cssVariable: '--nara-highlight-dream', register: 'user-dream' },
    expand: { cssVariable: '--nara-highlight-expand', register: 'user-expansion' },
    recognition: { cssVariable: '--nara-highlight-recognition', register: 'warm-recognition' },
    'prospective-surfacing': { cssVariable: '--nara-highlight-prospective', register: 'warm-forward' },
    'retrospective-surfacing': { cssVariable: '--nara-highlight-retrospective', register: 'cool-back' },
    'kairos-touch': { cssVariable: '--nara-highlight-kairos', register: 'mercurial' },
    'somatic-mark': { cssVariable: '--nara-highlight-somatic', register: 'grounded' },
    'live-spread': { cssVariable: '--nara-highlight-live-spread', register: 'oracle-anchored' }
} as const satisfies Record<UserHighlightCategory | AgentHighlightCategory, {
    readonly cssVariable: string;
    readonly register: string;
}>);

export interface HighlightAttributes {
    readonly id: string;
    readonly category: HighlightCategory;
    readonly timestamp: number;
    readonly originalText: string;
    readonly label?: string;
    readonly color?: string;
}

export interface HighlightAttributeInput extends Partial<Omit<HighlightAttributes, 'category' | 'originalText'>> {
    readonly category: HighlightCategory;
    readonly originalText: string;
}

export interface ExtractedHighlight extends HighlightAttributes {
    readonly from: number;
    readonly to: number;
    readonly text: string;
    readonly privacyClass: typeof NARA_PRIVACY_CLASS;
}

interface MarkLike {
    readonly type: { readonly name: string };
    readonly attrs: Partial<HighlightAttributes>;
}

interface TextNodeLike {
    readonly isText?: boolean;
    readonly text?: string;
    readonly marks?: readonly MarkLike[];
}

export interface HighlightDocumentLike {
    descendants(visitor: (node: TextNodeLike, pos: number) => void): void;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        naraHighlight: {
            setHighlight: (attributes: HighlightAttributes) => ReturnType;
            unsetHighlight: () => ReturnType;
            toggleHighlight: (attributes: HighlightAttributes) => ReturnType;
        };
    }
}

export function buildHighlightAttributes(input: HighlightAttributeInput): HighlightAttributes {
    return Object.freeze({
        id: input.id ?? `hl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        category: input.category,
        timestamp: input.timestamp ?? Date.now(),
        originalText: input.originalText,
        label: input.label,
        color: input.color
    });
}

export const HighlightMark = Mark.create<Record<string, never>, HighlightAttributes>({
    name: 'naraHighlight',

    addAttributes() {
        return {
            id: { default: null, parseHTML: element => element.getAttribute('data-highlight-id') },
            category: { default: 'daily-note', parseHTML: element => element.getAttribute('data-category') },
            timestamp: {
                default: 0,
                parseHTML: element => Number.parseInt(element.getAttribute('data-timestamp') || '0', 10)
            },
            originalText: { default: '', parseHTML: element => element.getAttribute('data-original-text') },
            label: { default: null, parseHTML: element => element.getAttribute('data-highlight-label') },
            color: { default: null, parseHTML: element => element.getAttribute('data-highlight-color') }
        };
    },

    parseHTML() {
        return [{ tag: 'mark[data-highlight-id]' }];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const visual = HIGHLIGHT_VISUAL_REGISTERS[mark.attrs.category as keyof typeof HIGHLIGHT_VISUAL_REGISTERS];
        return ['mark', mergeAttributes(HTMLAttributes, {
            class: `m4-nara-highlight m4-nara-highlight-${String(mark.attrs.category)}`,
            'data-highlight-id': mark.attrs.id,
            'data-category': mark.attrs.category,
            'data-timestamp': mark.attrs.timestamp,
            'data-original-text': mark.attrs.originalText,
            ...(visual ? { 'data-visual-register': visual.register } : {}),
            ...(mark.attrs.label ? { 'data-highlight-label': mark.attrs.label } : {}),
            ...(mark.attrs.color ? { 'data-highlight-color': mark.attrs.color } : {})
        }), 0];
    },

    renderMarkdown(node, helpers) {
        const attrs = node.attrs ?? {};
        const encoded = Object.entries(attrs)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => ` data-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}="${escapeAttribute(String(value))}"`)
            .join('');
        return `<mark${encoded}>${helpers.renderChildren(node.content ?? [])}</mark>`;
    },

    addCommands() {
        return {
            setHighlight: attributes => ({ commands }) => commands.setMark(this.name, attributes),
            unsetHighlight: () => ({ commands }) => commands.unsetMark(this.name),
            toggleHighlight: attributes => ({ commands }) => commands.toggleMark(this.name, attributes)
        };
    }
});

export function createHighlightEditor(markdown: string): Editor {
    return new Editor({
        extensions: [StarterKit, Markdown, HighlightMark],
        content: markdown,
        contentType: 'markdown'
    });
}

export function extractHighlights(doc: HighlightDocumentLike): ExtractedHighlight[] {
    const highlights: ExtractedHighlight[] = [];
    doc.descendants((node, pos) => {
        if (!node.isText || !node.marks) return;
        for (const mark of node.marks) {
            if (mark.type.name !== 'naraHighlight') continue;
            const text = node.text ?? mark.attrs.originalText ?? '';
            highlights.push(Object.freeze({
                id: String(mark.attrs.id ?? ''),
                category: mark.attrs.category ?? 'daily-note',
                timestamp: typeof mark.attrs.timestamp === 'number' ? mark.attrs.timestamp : 0,
                originalText: mark.attrs.originalText ?? text,
                label: mark.attrs.label,
                color: mark.attrs.color,
                from: pos,
                to: pos + text.length,
                text,
                privacyClass: NARA_PRIVACY_CLASS
            }));
        }
    });
    return highlights;
}

function escapeAttribute(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}
