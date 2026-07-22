import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const invokeCommand = vi.fn();
vi.mock('./bridge/tauri', () => ({
    invokeCommand: (command: string, args?: Record<string, unknown>) => invokeCommand(command, args)
}));

import { App } from './App';
import { commands } from './commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, CROSS_LAYOUT_INTENT_TARGETS } from './commands/crossLayoutIntent';
import type { KernelBridgeCachedProfile } from './bridge/types';
import { useCoordinateStore, useSessionStore, useTickStore } from './state/stores';
import { useOmniPanelSessionStore } from './panes/omni/omnipanelSessionState';
import { OMNIPANEL_TABS } from './panes/omni/omnipanelRuntime';

class InertSocket {
    readyState = 0;
    send(): void {}
    close(): void {}
    addEventListener(): void {}
}

class InertResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

describe('App shell', () => {
    beforeEach(() => {
        invokeCommand.mockImplementation(async (command: string) => {
            if (command === 'ui_state_load') {
                return null;
            }
            if (command === 'vault_list') {
                return [];
            }
            return undefined;
        });
        vi.stubGlobal('WebSocket', InertSocket);
        if (!('ResizeObserver' in globalThis)) {
            vi.stubGlobal('ResizeObserver', InertResizeObserver);
        }
        useCoordinateStore.setState({ selected: null });
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        useTickStore.setState({ profile: null, generation: null });
        useOmniPanelSessionStore.getState().hydrate(null);
    });

    afterEach(() => {
        cleanup();
        invokeCommand.mockReset();
        vi.unstubAllGlobals();
    });

    it('boots to the personal face and cmd-period inverts with state intact', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');
        act(() => {
            useCoordinateStore.getState().setSelected('M4-4');
        });
        expect(shell.dataset.face).toBe('1');

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '.', metaKey: true }));
        });
        expect((await screen.findByTestId('shell')).dataset.face).toBe('0');
        expect(useCoordinateStore.getState().selected).toBe('M4-4');

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '.', metaKey: true }));
        });
        expect((await screen.findByTestId('shell')).dataset.face).toBe('1');
    });

    it('coin inversion preserves the unified six-field state in both directions', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');
        const profile = {
            generation: 41,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: {
                harmonicProfile: {
                    modalResonator: { lensMode: { lens: 7, mode: 3 } }
                }
            }
        } as unknown as KernelBridgeCachedProfile;

        act(() => {
            useCoordinateStore.getState().setSelected('M3-2');
            useTickStore.getState().setProfile(profile);
            useSessionStore.getState().setSession({ sessionKey: 'session-six', dayNow: '07-16-2026' });
        });

        const six = () => {
            const cached = useTickStore.getState().profile as unknown as {
                profile: { harmonicProfile: { modalResonator: { lensMode: { lens: number; mode: number } } } };
            };
            return {
                coordinate: useCoordinateStore.getState().selected,
                lens: cached.profile.harmonicProfile.modalResonator.lensMode.lens,
                mode: cached.profile.harmonicProfile.modalResonator.lensMode.mode,
                profileGeneration: useTickStore.getState().generation,
                sessionKey: useSessionStore.getState().sessionKey,
                dayNow: useSessionStore.getState().dayNow
            };
        };
        const before = six();

        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.face).toBe('0');
        expect(six()).toEqual(before);

        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.face).toBe('1');
        expect(six()).toEqual(before);
    });

    it('preserves the active OmniPanel fold and its typed state across both faces', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');

        act(() => {
            useOmniPanelSessionStore.getState().selectTab('evidence');
            useOmniPanelSessionStore.getState().patchTab('evidence', {
                selectedPacketId: 'pkt-across-the-fold',
                depositFormOpen: true
            });
        });

        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.face).toBe('0');
        expect(useOmniPanelSessionStore.getState().session).toMatchObject({
            activeTab: 'evidence',
            perTabState: { evidence: { selectedPacketId: 'pkt-across-the-fold', depositFormOpen: true } }
        });

        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.face).toBe('1');
        expect(shell.dataset.omnipanelActiveTab).toBe('evidence');
    });

    it('mounts both face layouts with their tab structure (Cosmic Engine / Now / Vault)', async () => {
        // jsdom gives flexlayout zero size, so tab BODIES stay unmounted here;
        // pane components are covered by their own tests, bodies by the manual gate.
        render(<App />);
        await screen.findByTestId('shell');
        expect((await screen.findAllByText('Cosmic Engine')).length).toBeGreaterThan(0);
        expect((await screen.findAllByText('Now')).length).toBeGreaterThan(0);
        expect((await screen.findAllByText('Vault')).length).toBeGreaterThan(0);
    });

    it('opens the M0 compact card from the daily cosmic face into the ide-deep Bimba graph', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');
        act(() => {
            useCoordinateStore.getState().setSelected('M0-2');
        });

        expect(screen.queryByTestId('m0-coordinate-summary-card')).toBeNull();
        fireEvent.click(screen.getByTestId('face-toggle'));

        const card = await screen.findByTestId('m0-coordinate-summary-card');
        expect(card.dataset.coordinate).toBe('M0-2');
        expect(card.dataset.activeLayer).toBe('language');
        fireEvent.click(screen.getByTestId('m0-summary-open-full-view'));

        const receiver = await screen.findByTestId('cross-layout-intent-receiver');
        expect(shell.dataset.activeLayout).toBe('ide-deep');
        expect(receiver.dataset.requestedExtensionId).toBe('m0-anuttara');
        expect(receiver.dataset.requestedContributionId).toBe('graph');
    });

    it('mounts the M3 mini-view on the daily cosmic face and the badge in the context strip', async () => {
        render(<App />);
        await screen.findByTestId('shell');
        act(() => {
            useTickStore.getState().setProfile({
                generation: 73,
                cachedAtMs: 1,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'safe-public-current-kernel-tick',
                profile: {
                    harmonicProfile: {
                        codonRotationProjection: {
                            codon: 'CTC',
                            codonClass: 'non-dual',
                            codonId: 38,
                            rotation: 2,
                            rotationDegrees: 90,
                            rotationalStateCount: 7
                        },
                        mahamaya: {
                            hexagramId: 10,
                            tarotMinorId: 22,
                            tarotShadowCodon: 7
                        },
                        tick12: 4,
                        degree720: 415
                    }
                }
            } as unknown as KernelBridgeCachedProfile);
        });

        expect(screen.getByTestId('m3-codon-chip')).toBeTruthy();
        expect(screen.queryByTestId('m3-daily-wheel-mini-view')).toBeNull();
        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(screen.getByTestId('m3-daily-wheel-mini-view')).toBeTruthy();
        expect(screen.getAllByTestId('m3-cosmic-wheel').map(node => node.dataset.codonId))
            .toEqual(['38', '38']);
    });

    it('restores the M0 layer, phase, and mode record and carries it through both face toggles', async () => {
        invokeCommand.mockImplementation(async (command: string) => {
            if (command === 'ui_state_load') {
                return JSON.stringify({
                    layoutVersion: 21,
                    m0Surface: {
                        activeLayer: 'rel',
                        implicateExplicate: 'explicate',
                        mode: 'authoring'
                    }
                });
            }
            if (command === 'vault_list') {
                return [];
            }
            return undefined;
        });
        render(<App />);
        const shell = await screen.findByTestId('shell');
        const expected = JSON.stringify({
            activeLayer: 'rel',
            implicateExplicate: 'explicate',
            mode: 'authoring'
        });

        await waitFor(() => expect(shell.dataset.m0SurfaceState).toBe(expected));
        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.m0SurfaceState).toBe(expected);
        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.m0SurfaceState).toBe(expected);
    });

    it('restores the M2 interaction record and keeps it through both face toggles', async () => {
        const m2Surface = {
            activeFace: 'axes',
            layerAActiveCell: { lens: 7, position: 4 },
            layerBCardScroll: 240,
            layerCSurfaceVariant: 'torus',
            layerCZoom: 1.6,
            lastRoutingTrace: 'f-routing://profile/72/17',
            correspondenceTreeAxisFilter: ['decan'],
            correspondenceTreeSonicOverlay: 'asma',
            planetaryViewMode: 'psychoid',
            epogdoonProofMode: true
        };
        invokeCommand.mockImplementation(async (command: string) => {
            if (command === 'ui_state_load') {
                return JSON.stringify({ layoutVersion: 21, m2Surface });
            }
            if (command === 'vault_list') {
                return [];
            }
            return undefined;
        });
        render(<App />);
        const shell = await screen.findByTestId('shell');
        const expected = JSON.stringify(m2Surface);

        await waitFor(() => expect(shell.dataset.m2SurfaceState).toBe(expected));
        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.m2SurfaceState).toBe(expected);
        fireEvent.click(screen.getByTestId('face-toggle'));
        expect(shell.dataset.m2SurfaceState).toBe(expected);
    });

    it('layout claim (08.T8.5 / DR-TS-1): ONE 0/1 shell — two faces, no third layout, the / OmniPanel membrane on BOTH', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');

        // the shell's face domain IS {0, 1} — the daily-0-1 intra-layout
        // toggle; a third layout would surface as another face value
        expect(shell.dataset.face).toBe('1'); // personal = the 1-side
        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '.', metaKey: true }));
        });
        expect(shell.dataset.face).toBe('0'); // cosmic = the 0-side
        // the / OmniPanel operator membrane overlays BOTH faces (cross-layout
        // availability): the canonical 9-fold manifest (27.T27.0 / 38.T06.8, DR-WC-OP-1
        // collapse — `/ chat` → Pi) renders in each face layout (flexlayout
        // may render a tab's text twice per layout — button + panel)
        for (const label of [
            'Pi',
            'Sessions',
            'Dispatch',
            'Tools',
            'Evidence',
            'Review',
            'Gateway',
            'Diagnostics',
            'Tuning'
        ]) {
            expect((await screen.findAllByText(label)).length).toBeGreaterThanOrEqual(2);
        }
        // exactly TWO face containers — the 0-side and the 1-side, no third
        expect(document.querySelectorAll('.face-slot').length).toBe(2);
        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '.', metaKey: true }));
        });
        expect(shell.dataset.face).toBe('1');
        // the two ratified face layouts mount — flow-writing (Now) on the
        // 1-side, the cosmic stack on the 0-side (the .face-slot count above
        // is the no-third-layout proof; text may render per tab+panel)
        expect((await screen.findAllByText('Now')).length).toBeGreaterThanOrEqual(1);
        expect((await screen.findAllByText('Cosmic Engine')).length).toBeGreaterThanOrEqual(1);
    });

    it('cmd-shift-P opens the command palette listing the foundation commands', async () => {
        render(<App />);
        await screen.findByTestId('shell');
        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'P', shiftKey: true, metaKey: true }));
        });
        await screen.findByTestId('command-palette');
        expect(screen.getByTestId('palette-item-face.toggle')).toBeTruthy();
        expect(screen.getByTestId('palette-item-gateway.restart')).toBeTruthy();
    });

    it('resolves every cross-layout ledger target through the mounted shell model', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');

        for (const target of CROSS_LAYOUT_INTENT_TARGETS) {
            await act(async () => {
                await commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                    coordinate: `test:${target.extensionId}/${target.contributionId}`,
                    artifactUri: null,
                    reviewId: target.component === 'omniReview' ? 'review-ledger-proof' : null,
                    dayNow: null,
                    sessionKey: null,
                    profileGeneration: null,
                    privacyClass: null,
                    requestedExtensionId: target.extensionId,
                    requestedContributionId: target.contributionId
                });
            });
            expect(shell.dataset.face).toBe(String(target.face));
            const receiver = screen.getByTestId('cross-layout-intent-receiver');
            expect(receiver.dataset.requestedExtensionId).toBe(target.extensionId);
            expect(receiver.dataset.requestedContributionId).toBe(target.contributionId);
        }

        expect(CROSS_LAYOUT_INTENT_TARGETS).toHaveLength(55);
        expect(useCoordinateStore.getState().selected).toBe(
            `test:${CROSS_LAYOUT_INTENT_TARGETS.at(-1)?.extensionId}/${CROSS_LAYOUT_INTENT_TARGETS.at(-1)?.contributionId}`
        );
    });

    it('promotes an M3 codon intent to ide-deep without dropping the shared identity tuple', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');
        const profile = {
            generation: 73,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: {
                harmonicProfile: {
                    modalResonator: { lensMode: { lens: 11, mode: 4 } }
                }
            }
        } as unknown as KernelBridgeCachedProfile;

        act(() => {
            useCoordinateStore.getState().setSelected('M3-3');
            useTickStore.getState().setProfile(profile);
            useSessionStore.getState().setSession({
                sessionKey: 'session-m3-codon',
                dayNow: '07-16-2026',
                privacyClass: 'protected'
            });
        });

        await act(async () => {
            await commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: 'M3-3',
                artifactUri: 'Idea/Bimba/Seeds/M/M3\'/M3\'-SPEC.md',
                reviewId: null,
                dayNow: '07-16-2026',
                sessionKey: 'session-m3-codon',
                profileGeneration: 73,
                privacyClass: 'protected',
                requestedExtensionId: 'm3-mahamaya',
                requestedContributionId: 'codon'
            });
        });

        const receiver = await screen.findByTestId('cross-layout-intent-receiver');
        expect(receiver.dataset.requestedExtensionId).toBe('m3-mahamaya');
        expect(receiver.dataset.requestedContributionId).toBe('codon');
        expect(shell.dataset.face).toBe('0');
        expect(shell.dataset.activeLayout).toBe('ide-deep');
        expect(useCoordinateStore.getState().selected).toBe('M3-3');
        expect(useTickStore.getState().profile?.generation).toBe(73);
        expect((useTickStore.getState().profile as unknown as {
            profile: { harmonicProfile: { modalResonator: { lensMode: { lens: number; mode: number } } } };
        }).profile.harmonicProfile.modalResonator.lensMode).toEqual({ lens: 11, mode: 4 });
        expect(useSessionStore.getState()).toMatchObject({
            sessionKey: 'session-m3-codon',
            dayNow: '07-16-2026',
            privacyClass: 'protected'
        });
    });

    it('cmd-1 and cmd-8 activate the declared OmniPanel folds (CCT-4) on the visible face', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');
        const executeSpy = vi.spyOn(commands, 'execute');

        // start on a non-default fold so cmd-1 (index 0 → pi-chat) is a real switch
        act(() => {
            useOmniPanelSessionStore.getState().selectTab('review');
        });

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', metaKey: true }));
        });
        expect(executeSpy).toHaveBeenCalledWith('omnipanel.tab.activate.0');
        expect(useOmniPanelSessionStore.getState().session.activeTab).toBe('pi-chat');
        await waitFor(() => expect(shell.dataset.omnipanelActiveTab).toBe('pi-chat'));

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '8', metaKey: true }));
        });
        expect(executeSpy).toHaveBeenCalledWith('omnipanel.tab.activate.7');
        expect(useOmniPanelSessionStore.getState().session.activeTab).toBe('diagnostics');
        await waitFor(() => expect(shell.dataset.omnipanelActiveTab).toBe('diagnostics'));

        // the tab chords are DISTINCT from cmd-period — the face never toggled
        expect(shell.dataset.face).toBe('1');
        executeSpy.mockRestore();
    });

    it('cmd-shift-L dispatches the active cross-layout intent envelope (CCT-4)', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');
        const executeSpy = vi.spyOn(commands, 'execute');

        act(() => {
            useCoordinateStore.getState().setSelected('M2-3');
        });

        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'L', shiftKey: true, metaKey: true }));
        });

        expect(executeSpy).toHaveBeenCalledWith(
            CROSS_LAYOUT_INTENT_COMMAND,
            expect.objectContaining({
                coordinate: 'M2-3',
                requestedExtensionId: 'ide-shell-m0-m5',
                requestedContributionId: 'bimba-graph'
            })
        );
        // it really routed — the neutral shell Bimba-graph target lives on face 0 / ide-deep
        await waitFor(() => expect(shell.dataset.face).toBe('0'));
        expect(shell.dataset.activeLayout).toBe('ide-deep');
        executeSpy.mockRestore();
    });

    it('the eight tab chords map to eight distinct folds; the 9th tab stays unbound (CCT-4)', async () => {
        render(<App />);
        await screen.findByTestId('shell');

        const activated: string[] = [];
        for (let digit = 1; digit <= 8; digit += 1) {
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: String(digit), metaKey: true }));
            });
            activated.push(useOmniPanelSessionStore.getState().session.activeTab);
        }

        // cmd-N → declared index N-1 across the manifest's first eight folds
        expect(activated).toEqual(OMNIPANEL_TABS.slice(0, 8).map(tab => tab.id));
        // injective — no two chords collide onto the same fold
        expect(new Set(activated).size).toBe(8);

        // the 9th tab ('tuning', index 8) is intentionally UNBOUND — cmd-9 no-ops
        expect(OMNIPANEL_TABS[8].id).toBe('tuning');
        const before = useOmniPanelSessionStore.getState().session.activeTab;
        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '9', metaKey: true }));
        });
        expect(useOmniPanelSessionStore.getState().session.activeTab).toBe(before);
    });

    it('cmd-shift-3 selects the M3 family root and surfaces it in the active-coordinate readout (CCT-3)', async () => {
        render(<App />);
        const shell = await screen.findByTestId('shell');

        act(() => {
            // Shift+3 yields evt.key '#' but evt.code stays 'Digit3' — the chord
            // reads the physical code, so the family root really lands on M3.
            window.dispatchEvent(
                new KeyboardEvent('keydown', { code: 'Digit3', key: '#', shiftKey: true, metaKey: true })
            );
        });

        expect(useCoordinateStore.getState().selected).toBe('M3');
        // the always-mounted status-strip readout is the observable surface
        expect(screen.getByTestId('active-coordinate').textContent).toBe('M3');
        // family-root select is a pure coordinate move — the face never toggled
        expect(shell.dataset.face).toBe('1');
    });

    it('cmd-shift-{0..5} maps to six distinct M-family roots (CCT-3, chord uniqueness)', async () => {
        render(<App />);
        await screen.findByTestId('shell');

        const selected: (string | null)[] = [];
        for (let n = 0; n <= 5; n += 1) {
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        code: `Digit${n}`,
                        key: [')', '!', '@', '#', '$', '%'][n],
                        shiftKey: true,
                        metaKey: true
                    })
                );
            });
            selected.push(useCoordinateStore.getState().selected);
        }

        expect(selected).toEqual(['M0', 'M1', 'M2', 'M3', 'M4', 'M5']);
        // injective — no two chords collide onto the same coordinate
        expect(new Set(selected).size).toBe(6);
    });

    it('cmd-H then a user-side letter fires that highlight category over the live canvas (CCT-5)', async () => {
        render(<App />);
        await screen.findByTestId('shell');

        const fired: string[] = [];
        const handler = (event: Event) => fired.push((event as CustomEvent<{ category: string }>).detail.category);
        window.addEventListener('m4.nara.user-highlight', handler as EventListener);

        // cmd-H arms; the next letter selects the user-side category.
        for (const [letter, category] of [
            ['o', 'oracle'],
            ['d', 'daily-note'],
            ['e', 'expand'],
            ['m', 'dream']
        ] as const) {
            act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', metaKey: true })));
            act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: letter })));
            expect(fired.at(-1)).toBe(category);
        }

        // the four user-side chords are distinct
        expect(new Set(fired).size).toBe(4);
        window.removeEventListener('m4.nara.user-highlight', handler as EventListener);
    });

    it('cmd-H does NOT bind agent-side highlight categories (CCT-5 user-side only)', async () => {
        render(<App />);
        await screen.findByTestId('shell');

        const fired: string[] = [];
        const handler = (event: Event) => fired.push((event as CustomEvent<{ category: string }>).detail.category);
        window.addEventListener('m4.nara.user-highlight', handler as EventListener);

        // r/p/s/k/b/l are agent-inscribed only — pressing them after cmd-H
        // must NOT fire (and must disarm the prefix).
        for (const letter of ['r', 'p', 's', 'k', 'b', 'l'] as const) {
            act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', metaKey: true })));
            act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: letter })));
        }

        expect(fired).toEqual([]);
        window.removeEventListener('m4.nara.user-highlight', handler as EventListener);
    });

    it('the cmd-H prefix disarms on Escape and on a non-matching key (CCT-5)', async () => {
        render(<App />);
        await screen.findByTestId('shell');

        const fired: string[] = [];
        const handler = (event: Event) => fired.push((event as CustomEvent<{ category: string }>).detail.category);
        window.addEventListener('m4.nara.user-highlight', handler as EventListener);

        // Escape disarms: a subsequent 'o' is a bare key, not a category fire.
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', metaKey: true })));
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o' })));
        expect(fired).toEqual([]);

        // a non-matching key ('x') also disarms without firing.
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', metaKey: true })));
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })));
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o' })));
        expect(fired).toEqual([]);

        // sanity: after disarm, a fresh cmd-H + 'o' still fires.
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', metaKey: true })));
        act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o' })));
        expect(fired).toEqual(['oracle']);
        window.removeEventListener('m4.nara.user-highlight', handler as EventListener);
    });
});
