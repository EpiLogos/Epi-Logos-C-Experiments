/**
 * Coordinate: M' M4' (Nara canvas highlight mark, rerun 11.T11.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' canvas input
 * Actualises: the protected-local Tiptap highlight contract and Markdown round-trip.
 * Public surface: HighlightMark, the register-derived category lists, extraction/build helpers,
 *   applyUserHighlight (the shared FloatingMenu + cmd-H chord apply path).
 * Does NOT own: the category vocabulary itself (ui/highlightCategoryRegistry —
 *   30.T30.7 promoted it out of this file), vault persistence, or public/S2
 *   projection.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.2.
 */

// Ported from frozen Body/M/epi-theia/extensions/m4-nara/src/browser/editor/extensions/highlight-mark.ts.
import { Editor, Mark, mergeAttributes } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import {
    HIGHLIGHT_CATEGORY_IDS,
    HIGHLIGHT_CATEGORY_REGISTRY,
    agentHighlightCategories,
    userHighlightCategories,
    type AgentHighlightCategoryId,
    type HighlightCategoryId,
    type UserHighlightCategoryId
} from '../ui/highlightCategoryRegistry';

export const NARA_PRIVACY_CLASS = 'protected_local' as const;

// 30.T30.7: the category vocabulary is no longer declared here. This file had
// held one of three private copies of the same ten ids; the canonical register
// is `ui/highlightCategoryRegistry`, and everything below is DERIVED from it,
// so a category cannot exist for the mark without existing in the register.
export const USER_HIGHLIGHT_CATEGORIES = userHighlightCategories;
export const AGENT_HIGHLIGHT_CATEGORIES = agentHighlightCategories;

export type UserHighlightCategory = UserHighlightCategoryId;
export type AgentHighlightCategory = AgentHighlightCategoryId;
export type HighlightCategory = HighlightCategoryId | string;

/** The 11.11 visual registers, projected from the canonical register. */
export const HIGHLIGHT_VISUAL_REGISTERS: Readonly<
    Record<HighlightCategoryId, { readonly cssVariable: string; readonly register: string }>
> = Object.freeze(
    Object.fromEntries(
        HIGHLIGHT_CATEGORY_IDS.map(id => [
            id,
            Object.freeze({
                cssVariable: HIGHLIGHT_CATEGORY_REGISTRY[id].cssVariable,
                register: HIGHLIGHT_CATEGORY_REGISTRY[id].visualRegister
            })
        ])
    ) as Record<HighlightCategoryId, { readonly cssVariable: string; readonly register: string }>
);

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

/**
 * The one shared user-side highlight apply path (CCT-5): mark the current
 * selection with a user category, collapse the selection past it, and record
 * the resulting document highlights into the service. Both the NaraFloatingMenu
 * category buttons and the cmd-H two-stroke keyboard chord call THIS function,
 * so the pointer path and the keyboard path can never diverge. The service is
 * typed structurally (only `recordHighlights`) to avoid a mark↔service cycle.
 */
export function applyUserHighlight(
    editor: Editor,
    service: { recordHighlights(highlights: readonly ExtractedHighlight[]): void },
    category: UserHighlightCategory,
    selectedText: string
): void {
    const end = editor.state.selection.to;
    editor
        .chain()
        .focus()
        .setHighlight(buildHighlightAttributes({ category, originalText: selectedText }))
        .setTextSelection(end)
        .unsetHighlight()
        .run();
    service.recordHighlights(extractHighlights(editor.state.doc));
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
