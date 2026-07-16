/**
 * Coordinate: M' M4' (Nara canvas contract tests, rerun 11.T11.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' canvas input
 * Actualises: Markdown-preserving Tiptap editing, protected-local highlight
 *   extraction, and real vault-write intent from the active day surface.
 * Public surface: behavioral tests for NaraCanvasEditor and HighlightService.
 * Does NOT own: vault persistence law, agent highlight categories, or S2 projection.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.2.
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NaraCanvasEditor } from './NaraCanvasEditor';
import { NaraFloatingMenu } from './NaraFloatingMenu';
import { HighlightService } from './m4NaraHighlightService';
import {
    buildHighlightAttributes,
    createHighlightEditor,
    extractHighlights,
    HIGHLIGHT_VISUAL_REGISTERS
} from './m4NaraHighlightMark';

const invokeCommand = vi.fn(async (command: string, _args?: Record<string, unknown>) => {
    if (command === 'vault_read') {
        return {
            path: 'Empty/Present/16-07-2026/daily-note.md',
            content: '---\ncoordinate: P0\n---\n# Today\n\nA live sentence.',
            readOnly: false
        };
    }
    if (command === 'vault_write') return undefined;
    throw new Error(`unexpected ${command}`);
});

vi.mock('../bridge/tauri', () => ({
    invokeCommand: (command: string, args?: Record<string, unknown>) => invokeCommand(command, args)
}));

afterEach(() => {
    cleanup();
    invokeCommand.mockClear();
});

describe('M4 Nara canvas', () => {
    it('round-trips Markdown and applies a protected-local daily-note mark through the floating menu', () => {
        const editor = createHighlightEditor('# Today\n\nA **live** sentence.');
        const service = new HighlightService();
        editor.commands.setTextSelection({ from: 10, to: 14 });
        render(
            <NaraFloatingMenu
                editor={editor}
                state={{ isOpen: true, selectedText: 'live' }}
                service={service}
                onClose={() => undefined}
                onAgentAction={() => undefined}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: 'Daily note' }));

        const highlights = extractHighlights(editor.state.doc);
        expect(highlights).toHaveLength(1);
        expect(highlights[0]).toMatchObject({
            category: 'daily-note',
            originalText: 'live',
            privacyClass: 'protected_local'
        });
        expect(service.getHighlights()).toHaveLength(1);
        expect(editor.getMarkdown()).toContain('# Today');
        expect(editor.getMarkdown()).toContain('**');
        editor.destroy();
    });

    it('keeps frontmatter byte-preserved and writes edited Markdown through vault IPC', async () => {
        render(<NaraCanvasEditor path="Empty/Present/16-07-2026/daily-note.md" />);

        const canvas = await screen.findByTestId('m4-nara-canvas');
        expect(canvas.dataset.privacyClass).toBe('protected_local');
        const editor = await screen.findByTestId('m4-nara-editor');
        fireEvent.input(editor, { target: { innerHTML: '<h1>Today</h1><p>A changed sentence.</p>' } });

        await waitFor(() => {
            const write = invokeCommand.mock.calls.find(call => call[0] === 'vault_write');
            expect(write?.[1]).toEqual(expect.objectContaining({
                path: 'Empty/Present/16-07-2026/daily-note.md',
                content: expect.stringMatching(/^---\ncoordinate: P0\n---\n# Today/)
            }));
        }, { timeout: 2500 });
    });

    it('records highlights in a local service without creating a fifth carrier store', () => {
        const service = new HighlightService();
        const changes = vi.fn();
        const unsubscribe = service.subscribe(changes);
        service.recordHighlights([{
            ...buildHighlightAttributes({
                id: 'hl-local',
                category: 'oracle',
                timestamp: 7,
                originalText: 'card'
            }),
            from: 1,
            to: 5,
            text: 'card',
            privacyClass: 'protected_local'
        }]);
        expect(service.getHighlights()).toHaveLength(1);
        expect(changes).toHaveBeenCalledTimes(1);
        const inscription = service.inscribeAgentMark(
            { from: 6, to: 10 },
            'recognition',
            'seen',
            'm4.nara'
        );
        expect(inscription).toMatchObject({
            category: 'recognition',
            privacyClass: 'protected_local',
            artifactKind: 'agent-chat',
            sourceFacet: 'm4.nara'
        });
        unsubscribe();
    });

    it('renders an agent inscription in-place without replacing user content', async () => {
        const service = new HighlightService();
        render(
            <NaraCanvasEditor
                path="Empty/Present/16-07-2026/daily-note.md"
                highlightService={service}
            />
        );
        const editor = await screen.findByTestId('m4-nara-editor');
        await waitFor(() => expect(editor.textContent).toContain('A live sentence.'));
        const before = editor.textContent;

        act(() => {
            service.inscribeAgentMark(
                { from: 10, to: 14 },
                'prospective-surfacing',
                'live',
                'anima.prospective'
            );
        });

        await waitFor(() => expect(editor.querySelector('mark[data-category="prospective-surfacing"]')).not.toBeNull());
        const mark = editor.querySelector('mark[data-category="prospective-surfacing"]');
        expect(mark?.textContent).toBe('live');
        expect(mark?.classList.contains('m4-nara-highlight-prospective-surfacing')).toBe(true);
        expect(mark?.getAttribute('data-visual-register')).toBe('warm-forward');
        expect(HIGHLIGHT_VISUAL_REGISTERS['prospective-surfacing']).toEqual({
            cssVariable: '--nara-highlight-prospective',
            register: 'warm-forward'
        });
        expect(Object.keys(HIGHLIGHT_VISUAL_REGISTERS)).toHaveLength(10);
        expect(editor.textContent).toBe(before);
    });
});
