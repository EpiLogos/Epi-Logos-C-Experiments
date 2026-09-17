import { Mark, mergeAttributes } from '@tiptap/core';

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
export type HighlightCategory = UserHighlightCategory | AgentHighlightCategory | `custom:${string}` | string;

export interface HighlightAttributes {
    readonly id: string;
    readonly category: HighlightCategory;
    readonly timestamp: number;
    readonly originalText: string;
    readonly label?: string;
    readonly color?: string;
}

export interface HighlightAttributeInput {
    readonly category: HighlightCategory;
    readonly originalText: string;
    readonly id?: string;
    readonly timestamp?: number;
    readonly label?: string;
    readonly color?: string;
}

export interface ExtractedHighlight extends HighlightAttributes {
    readonly from: number;
    readonly to: number;
    readonly text: string;
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
        highlight: {
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
    name: 'highlight',

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-highlight-id'),
                renderHTML: attributes => ({
                    'data-highlight-id': attributes.id
                })
            },
            category: {
                default: 'daily-note',
                parseHTML: element => element.getAttribute('data-category'),
                renderHTML: attributes => ({
                    'data-category': attributes.category
                })
            },
            timestamp: {
                default: null,
                parseHTML: element => Number.parseInt(element.getAttribute('data-timestamp') || '0', 10),
                renderHTML: attributes => ({
                    'data-timestamp': attributes.timestamp
                })
            },
            originalText: {
                default: '',
                parseHTML: element => element.getAttribute('data-original-text'),
                renderHTML: attributes => ({
                    'data-original-text': attributes.originalText
                })
            },
            label: {
                default: null,
                parseHTML: element => element.getAttribute('data-highlight-label'),
                renderHTML: attributes => attributes.label ? { 'data-highlight-label': attributes.label } : {}
            },
            color: {
                default: null,
                parseHTML: element => element.getAttribute('data-highlight-color'),
                renderHTML: attributes => attributes.color ? { 'data-highlight-color': attributes.color } : {}
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'mark[data-highlight-id]',
                getAttrs: element => {
                    if (typeof element === 'string') {
                        return false;
                    }
                    return {
                        id: element.getAttribute('data-highlight-id'),
                        category: element.getAttribute('data-category'),
                        timestamp: Number.parseInt(element.getAttribute('data-timestamp') || '0', 10),
                        originalText: element.getAttribute('data-original-text'),
                        label: element.getAttribute('data-highlight-label'),
                        color: element.getAttribute('data-highlight-color')
                    };
                }
            }
        ];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const accentColor = typeof mark.attrs.color === 'string' ? mark.attrs.color : undefined;
        return [
            'mark',
            mergeAttributes(
                HTMLAttributes,
                {
                    class: `m4-nara-highlight m4-nara-highlight-${String(mark.attrs.category)}`,
                    'data-highlight-id': mark.attrs.id,
                    ...(accentColor ? { style: `--highlight-accent:${accentColor};` } : {})
                }
            ),
            0
        ];
    },

    addCommands() {
        return {
            setHighlight: attributes => ({ commands }) => commands.setMark('highlight', attributes),
            unsetHighlight: () => ({ commands }) => commands.unsetMark('highlight'),
            toggleHighlight: attributes => ({ commands }) => commands.toggleMark('highlight', attributes)
        };
    }
});

export function extractHighlights(doc: HighlightDocumentLike): ExtractedHighlight[] {
    const highlights: ExtractedHighlight[] = [];

    doc.descendants((node, pos) => {
        if (!node.isText || !node.marks) {
            return;
        }
        for (const mark of node.marks) {
            if (mark.type.name !== 'highlight') {
                continue;
            }
            const text = node.text ?? mark.attrs.originalText ?? '';
            const attrs = mark.attrs;
            highlights.push(Object.freeze({
                id: String(attrs.id ?? ''),
                category: attrs.category ?? 'daily-note',
                timestamp: typeof attrs.timestamp === 'number' ? attrs.timestamp : 0,
                originalText: attrs.originalText ?? text,
                label: attrs.label,
                color: attrs.color,
                from: pos,
                to: pos + text.length,
                text
            }));
        }
    });

    return highlights;
}
