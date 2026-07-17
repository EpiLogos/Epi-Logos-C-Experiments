/**
 * Coordinate: M' shell acceptance
 * Residency: Body/M/pratibimba-app/src
 * Position (#n): #0/1 cross-layout carrier boundary
 * Actualises: exact seven-field identity preservation through daily-0-1 <-> ide-deep routing.
 *   The OmniPanel fold is NOT an identity field — routing to a fold is the invocable
 *   overlay panel doing its job, not identity drift (see crossLayoutIdentity.ts).
 * Public surface: Vitest behavioral acceptance for App's rendered transition receipt
 * Does NOT own: kernel profile production, session persistence, or cross-layout target law
 * Contract: [[M'-SYSTEM-SPEC]] and rerun tranche [[11.T11.6]]
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { KernelBridgeCachedProfile } from './bridge/types';
import { App } from './App';
import { CROSS_LAYOUT_INTENT_COMMAND } from './commands/crossLayoutIntent';
import { commands } from './commands/registry';
import {
    createCrossLayoutIdentityReceipt,
    type BimbaPratibimbaUiState
} from './state/crossLayoutIdentity';
import { useCoordinateStore, useSessionStore, useTickStore } from './state/stores';
import { useLeftSidebarModeStore } from './ui/leftSidebarModes';

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

describe('cross-layout state identity', () => {
    beforeEach(() => {
        vi.stubGlobal('WebSocket', InertSocket);
        if (!('ResizeObserver' in globalThis)) {
            vi.stubGlobal('ResizeObserver', InertResizeObserver);
        }
        useCoordinateStore.setState({ selected: 'M4-4' });
        useSessionStore.setState({
            sessionKey: 'superseded-session',
            dayNow: '07-15-2026',
            privacyClass: null
        });
        useTickStore.setState({ profile: null, generation: null });
        useLeftSidebarModeStore.setState({
            activeModeId: 'bimba-graph',
            layout: 'daily-0-1'
        });
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('preserves the shared identity tuple through daily -> deep -> daily routing', async () => {
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
        act(() => useTickStore.getState().setProfile(profile));

        const expectedIdentity = {
            coordinate: 'M3-3',
            lens: 11,
            mode: 4,
            profileGeneration: 73,
            sessionKey: 'session-m3-codon',
            dayNow: '07-16-2026',
            activityBarMode: 'bimba-graph'
        };

        await act(async () => {
            await commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: 'M3-3',
                artifactUri: "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md",
                reviewId: null,
                dayNow: '07-16-2026',
                sessionKey: 'session-m3-codon',
                profileGeneration: 73,
                privacyClass: 'protected',
                requestedExtensionId: 'm3-mahamaya',
                requestedContributionId: 'codon'
            });
        });

        expect(shell.dataset.activeLayout).toBe('ide-deep');
        expect(JSON.parse(shell.dataset.crossLayoutIdentityReceipt ?? 'null')).toEqual({
            fromLayout: 'daily-0-1',
            toLayout: 'ide-deep',
            before: expectedIdentity,
            after: expectedIdentity
        });

        await act(async () => {
            await commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: 'M3-3',
                artifactUri: "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md",
                reviewId: null,
                dayNow: '07-16-2026',
                sessionKey: 'session-m3-codon',
                profileGeneration: 73,
                privacyClass: 'protected',
                requestedExtensionId: 'm0-anuttara',
                requestedContributionId: 'personal'
            });
        });

        expect(shell.dataset.activeLayout).toBe('daily-0-1');
        expect(JSON.parse(shell.dataset.crossLayoutIdentityReceipt ?? 'null')).toEqual({
            fromLayout: 'ide-deep',
            toLayout: 'daily-0-1',
            before: expectedIdentity,
            after: expectedIdentity
        });
    });

    it.each([
        ['coordinate', 'M4-4'],
        ['activityBarMode', 'canon-studio']
    ] as const)('fails closed when %s changes during routing', (field, changedValue) => {
        const before: BimbaPratibimbaUiState = {
            coordinate: 'M3-3',
            lens: 11,
            mode: 4,
            profileGeneration: 73,
            sessionKey: 'session-m3-codon',
            dayNow: '07-16-2026',
            activityBarMode: 'bimba-graph'
        };

        expect(() => createCrossLayoutIdentityReceipt(
            'daily-0-1',
            'ide-deep',
            before,
            { ...before, [field]: changedValue }
        )).toThrow(`cross-layout identity changed during routing: ${field}`);
    });
});
