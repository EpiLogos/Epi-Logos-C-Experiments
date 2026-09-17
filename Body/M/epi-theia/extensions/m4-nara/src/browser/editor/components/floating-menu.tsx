import * as React from 'react';
import type { Editor } from '@tiptap/core';
import { PRIVACY_CLASS } from '../../../common';
import { type HighlightService } from '../../services/highlight-service';
import {
    USER_HIGHLIGHT_CATEGORIES,
    type ExtractedHighlight,
    type HighlightCategory,
    type UserHighlightCategory,
    buildHighlightAttributes,
    extractHighlights
} from '../extensions/highlight-mark';

export type AgentAction = 'chat' | 'oracle' | 'dream' | 'expand';

export interface FloatingMenuState {
    readonly isOpen: boolean;
    readonly rect: DOMRect | null;
    readonly selectedText: string;
}

export interface FloatingMenuProps {
    readonly editor: Editor | null;
    readonly state: FloatingMenuState;
    readonly highlightService: HighlightService;
    readonly onClose: () => void;
    readonly onSendToAgent: (action: AgentAction, selectedText: string) => void;
}

interface MinimalHighlightEditor {
    toggleHighlight?(attributes: ReturnType<typeof buildHighlightAttributes>): readonly ExtractedHighlight[];
}

export const FLOATING_MENU_USER_CATEGORIES = USER_HIGHLIGHT_CATEGORIES;

const CATEGORY_LABELS: Readonly<Record<UserHighlightCategory, string>> = Object.freeze({
    'daily-note': 'Daily Note',
    oracle: 'Oracle',
    dream: 'Dream',
    expand: 'Expand'
});

const AGENT_ACTIONS: readonly AgentAction[] = Object.freeze(['chat', 'oracle', 'dream', 'expand'] as const);

export function applyFloatingMenuHighlight(input: {
    readonly category: HighlightCategory;
    readonly selectedText: string;
    readonly service: HighlightService;
    readonly editor: Editor | MinimalHighlightEditor | null;
}): ReturnType<typeof buildHighlightAttributes> {
    const attrs = buildHighlightAttributes({
        category: input.category,
        originalText: input.selectedText
    });
    const editor = input.editor;
    if (editor && 'toggleHighlight' in editor && typeof editor.toggleHighlight === 'function') {
        for (const highlight of editor.toggleHighlight(attrs)) {
            input.service.addHighlight(highlight);
        }
        return attrs;
    }
    if (editor && 'chain' in editor && typeof editor.chain === 'function') {
        const tiptap = editor as Editor;
        const selectionEnd = tiptap.state.selection.to;
        tiptap.chain().focus().setHighlight(attrs).setTextSelection(selectionEnd).unsetHighlight().run();
        input.service.recordHighlights(extractHighlights(tiptap.state.doc));
        return attrs;
    }
    input.service.addHighlight({
        ...attrs,
        from: 0,
        to: input.selectedText.length,
        text: input.selectedText
    });
    return attrs;
}

export function FloatingMenu({
    editor,
    state,
    highlightService,
    onClose,
    onSendToAgent
}: FloatingMenuProps): React.ReactElement | null {
    if (!state.isOpen) {
        return null;
    }

    const style = state.rect
        ? {
            top: Math.max(12, state.rect.bottom + 8),
            left: Math.max(12, state.rect.left)
        }
        : undefined;

    const selectHighlight = (category: UserHighlightCategory) => {
        applyFloatingMenuHighlight({
            category,
            selectedText: state.selectedText,
            service: highlightService,
            editor
        });
        onClose();
    };

    return (
        <div
            className="m4-nara-floating-menu"
            style={style}
            data-test="m4-nara-floating-menu"
            data-privacy-class={PRIVACY_CLASS}
        >
            <div className="m4-nara-floating-menu-row" aria-label="Agent actions">
                {AGENT_ACTIONS.map(action => (
                    <button
                        key={action}
                        type="button"
                        onClick={() => {
                            onSendToAgent(action, state.selectedText);
                            onClose();
                        }}
                        data-agent-action={action}
                    >
                        {action}
                    </button>
                ))}
            </div>
            <div className="m4-nara-floating-menu-row" aria-label="Highlight categories">
                {USER_HIGHLIGHT_CATEGORIES.map(category => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => selectHighlight(category)}
                        data-highlight-category={category}
                    >
                        {CATEGORY_LABELS[category]}
                    </button>
                ))}
            </div>
        </div>
    );
}
