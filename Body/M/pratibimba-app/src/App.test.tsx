import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { commands } from './commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, CROSS_LAYOUT_INTENT_TARGETS } from './commands/crossLayoutIntent';
import type { KernelBridgeCachedProfile } from './bridge/types';
import { useCoordinateStore, useSessionStore, useTickStore } from './state/stores';
import { useOmniPanelSessionStore } from './panes/omni/omnipanelSessionState';

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
        // availability): the canonical 8-fold manifest (27.T27.0, DR-WC-OP-1
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
            'Diagnostics'
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

        expect(CROSS_LAYOUT_INTENT_TARGETS).toHaveLength(45);
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
});
