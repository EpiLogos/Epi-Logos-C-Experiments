// @vitest-environment jsdom
/**
 * Coordinate: M' M0' (Canon Studio read half — 28.T28.4)
 * Residency: Body/M/pratibimba-app/src/panes/MarkdownEditorPane.test.tsx
 * Actualises: proof that the Canon Studio deepening rides real seams — the
 *   governed-write handoff emits a real CrossLayoutIntent carrying the note as
 *   `artifactUri`, the identity note routes to the live PASU wizard instead of
 *   growing a second identity editor, and the frontmatter fold discloses the S1
 *   typology receipt (or refuses honestly) without ever deriving it locally.
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownEditorPane, splitFrontmatter } from './MarkdownEditorPane';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND } from '../commands/crossLayoutIntent';
import { CLAYER_TYPOLOGY_METHOD, PASU_NOTE_PATH } from './canonStudio';
import { useTickStore } from '../state/stores';
import { publishProfileTick } from '../composition/profileTickSubscription';

const NOTE = 'Bimba/World/Types/Coordinates/S/S1/S1.md';
const CONTENT = '---\ncoordinate: "S1"\n---\nS1 is served by [[Hen]].\n';

const TYPOLOGY = {
    sourcePath: NOTE,
    typeFamily: 'Coordinates',
    typePath: 'Bimba/World/Types/Coordinates/S/S1',
    typeCoordinate: 'S1',
    semanticAuthority: 'C1',
    crystallisationState: 'crystallised',
    evidenceKind: 'frontmatter',
    classificationSource: 'hen'
};

vi.mock('../bridge/tauri', () => ({
    invokeCommand: vi.fn(async (command: string, args?: Record<string, unknown>) => {
        if (command === 'vault_read') {
            return { path: args?.path, content: CONTENT, readOnly: true };
        }
        return undefined;
    }),
    listenEvent: vi.fn(async () => () => undefined)
}));

const invoke = vi.fn();
let ready = true;

vi.mock('../bridge/gatewayHolder', () => ({
    gateway: () => ({ invoke: (method: string, params: Record<string, unknown>) => invoke(method, params) }),
    gatewayReady: () => ready
}));

beforeEach(() => {
    ready = true;
    invoke.mockReset();
    invoke.mockResolvedValue({ artifact: TYPOLOGY, privacyClass: 'public' });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('splitFrontmatter', () => {
    it('keeps frontmatter out of the writing surface, byte-preserving', () => {
        const parts = splitFrontmatter(CONTENT);
        expect(parts.frontmatter).toBe('---\ncoordinate: "S1"\n---\n');
        expect((parts.frontmatter ?? '') + parts.body).toBe(CONTENT);
    });
});

describe('MarkdownEditorPane — Canon Studio read half (28.T28.4)', () => {
    it('declares the canon-studio view id and wears its read-only provenance', async () => {
        render(<MarkdownEditorPane path={NOTE} />);
        const pane = await screen.findByTestId(`editor-${NOTE}`);
        expect(pane.getAttribute('data-view-id')).toBe('pratibimba.canon-studio');
        expect(screen.getByTestId('editor-readonly-banner').textContent).toContain('S1 scope');
    });

    it('hands the governed write to the Logos Atelier with the note as artifactUri', async () => {
        const executed: Array<[string, unknown]> = [];
        vi.spyOn(commands, 'execute').mockImplementation(async (id: string, arg?: unknown) => {
            executed.push([id, arg]);
        });
        render(<MarkdownEditorPane path={NOTE} />);
        await screen.findByTestId('editor-open-atelier');
        await waitFor(() => expect(invoke).toHaveBeenCalled());

        fireEvent.click(screen.getByTestId('editor-open-atelier'));
        expect(executed).toHaveLength(1);
        const [id, intent] = executed[0];
        expect(id).toBe(CROSS_LAYOUT_INTENT_COMMAND);
        expect(intent).toMatchObject({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'logos-atelier',
            artifactUri: NOTE,
            coordinate: 'S1'
        });
    });

    it('routes the identity note to the live PASU wizard rather than a second identity editor', async () => {
        const executed: string[] = [];
        vi.spyOn(commands, 'execute').mockImplementation(async (id: string) => {
            executed.push(id);
        });
        render(<MarkdownEditorPane path={PASU_NOTE_PATH} />);
        fireEvent.click(await screen.findByTestId('editor-open-pasu-wizard'));
        expect(executed).toEqual(['identity.openWizard']);
    });

    it('offers no PASU route on an ordinary note', async () => {
        render(<MarkdownEditorPane path={NOTE} />);
        await screen.findByTestId('editor-open-atelier');
        expect(screen.queryByTestId('editor-open-pasu-wizard')).toBeNull();
    });

    it('discloses the S1 C-layer typology receipt in the frontmatter fold', async () => {
        render(<MarkdownEditorPane path={NOTE} />);
        fireEvent.click(await screen.findByText(/frontmatter/));
        await waitFor(() =>
            expect(screen.getByTestId('editor-typology-authority').textContent).toBe('C1')
        );
        expect(invoke).toHaveBeenCalledWith(CLAYER_TYPOLOGY_METHOD, { path: NOTE });
        expect(screen.getByTestId('editor-typology').textContent).toContain('crystallised');
        // The key-shape law stays S1's, and the fold says so rather than
        // re-implementing validate_frontmatter in the carrier.
        expect(screen.getByTestId('editor-typology').textContent).toContain('key-shape validation is S1 law');
    });

    it('reads the typology once per note — the 1s profile heartbeat re-renders, it does not re-query', async () => {
        render(<MarkdownEditorPane path={NOTE} />);
        await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
        // Three heartbeats, as the live gateway pulses them (once a second).
        act(() => {
            for (const generation of [2, 3, 4]) {
                publishProfileTick({ generation } as Parameters<
                        ReturnType<typeof useTickStore.getState>['setProfile']
                    >[0]);
            }
        });
        await waitFor(() => expect(useTickStore.getState().generation).toBe(4));
        expect(invoke).toHaveBeenCalledTimes(1);
    });

    it('refuses honestly instead of inventing a classification when the gateway is down', async () => {
        ready = false;
        render(<MarkdownEditorPane path={NOTE} />);
        fireEvent.click(await screen.findByText(/frontmatter/));
        await waitFor(() =>
            expect(screen.getByTestId('editor-typology-refusal').textContent).toContain(
                'gateway disconnected'
            )
        );
        expect(invoke).not.toHaveBeenCalled();
    });
});
