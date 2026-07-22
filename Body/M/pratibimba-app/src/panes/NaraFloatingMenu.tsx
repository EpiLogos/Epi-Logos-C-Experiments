/**
 * Coordinate: M' M4' (Nara selection menu, rerun 11.T11.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' canvas input
 * Actualises: selection-scoped user highlights and agent-action dispatch intents.
 * Public surface: NaraFloatingMenu, FloatingMenuState.
 * Does NOT own: agent execution, persistence, or agent highlight categories.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.2.
 */

// Ported from frozen Body/M/epi-theia/extensions/m4-nara/src/browser/editor/components/floating-menu.tsx.
import type { Editor } from '@tiptap/core';
import type { UserHighlightCategory } from './m4NaraHighlightMark';
import { USER_HIGHLIGHT_CATEGORIES, applyUserHighlight } from './m4NaraHighlightMark';
import type { HighlightService } from './m4NaraHighlightService';

export type AgentSelectionAction = 'chat' | 'oracle' | 'dream' | 'expand';

export interface FloatingMenuState {
    readonly isOpen: boolean;
    readonly selectedText: string;
}

const LABELS: Readonly<Record<UserHighlightCategory, string>> = Object.freeze({
    'daily-note': 'Daily note',
    oracle: 'Oracle',
    dream: 'Dream',
    expand: 'Expand'
});

export function NaraFloatingMenu({
    editor,
    state,
    service,
    onClose,
    onAgentAction
}: {
    readonly editor: Editor | null;
    readonly state: FloatingMenuState;
    readonly service: HighlightService;
    readonly onClose: () => void;
    readonly onAgentAction: (action: AgentSelectionAction, selectedText: string) => void;
}) {
    if (!state.isOpen || !editor) return null;

    const apply = (category: UserHighlightCategory) => {
        applyUserHighlight(editor, service, category, state.selectedText);
        onClose();
    };

    return (
        <div className="m4-nara-floating-menu" data-testid="m4-nara-floating-menu">
            <div className="m4-nara-floating-menu-row" aria-label="Agent actions">
                {(['chat', 'oracle', 'dream', 'expand'] as const).map(action => (
                    <button key={action} type="button" onClick={() => {
                        onAgentAction(action, state.selectedText);
                        onClose();
                    }}>{action}</button>
                ))}
            </div>
            <div className="m4-nara-floating-menu-row" aria-label="Highlight categories">
                {USER_HIGHLIGHT_CATEGORIES.map(category => (
                    <button key={category} type="button" data-highlight-category={category} onClick={() => apply(category)}>
                        {LABELS[category]}
                    </button>
                ))}
            </div>
        </div>
    );
}
