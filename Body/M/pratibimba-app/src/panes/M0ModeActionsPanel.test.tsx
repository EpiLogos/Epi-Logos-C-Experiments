// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { M0ModeActionsPanel } from './M0ModeActionsPanel';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND } from '../commands/crossLayoutIntent';
import { useCoordinateStore } from '../state/stores';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    act(() => useCoordinateStore.getState().setSelected(null));
});

describe('M0ModeActionsPanel — reading/authoring mode toggle (21.T21.12)', () => {
    it('defaults to reading mode: only the readiness-evidence deposit, no routed-write affordances or banner', () => {
        render(<M0ModeActionsPanel />);
        expect(screen.getByTestId('m0-action-deposit-graph-readiness-evidence')).toBeTruthy();
        expect(screen.queryByTestId('m0-action-request-anuttara-review')).toBeNull();
        expect(screen.queryByTestId('m0-action-open-language-development-route')).toBeNull();
        expect(screen.queryByTestId('m0-deeplink-canonStudio')).toBeNull();
        expect(screen.queryByTestId('m0-deeplink-logosAtelier')).toBeNull();
        expect(screen.queryByTestId('m0-dr-m0-1-banner')).toBeNull();
        expect(screen.getByTestId('m0-mode-switch-authoring')).toBeTruthy();
    });

    it('switching to authoring reveals all three actions, both deep-links, and the DR-M0-1 banner', () => {
        render(<M0ModeActionsPanel />);
        fireEvent.click(screen.getByTestId('m0-mode-switch-authoring'));
        expect(screen.getByTestId('m0-action-deposit-graph-readiness-evidence')).toBeTruthy();
        expect(screen.getByTestId('m0-action-open-language-development-route')).toBeTruthy();
        expect(screen.getByTestId('m0-action-request-anuttara-review')).toBeTruthy();
        expect(screen.getByTestId('m0-deeplink-canonStudio')).toBeTruthy();
        expect(screen.getByTestId('m0-deeplink-logosAtelier')).toBeTruthy();
        const banner = screen.getByTestId('m0-dr-m0-1-banner');
        expect(banner.getAttribute('data-provenance-state')).toBe('derived');
        expect(banner.textContent).toContain('Per DR-M0-1');
    });

    it('a routed action dispatches the cross-layout intent to its real carrier target with the selected coordinate', () => {
        act(() => useCoordinateStore.getState().setSelected('M0-2'));
        const spy = vi.spyOn(commands, 'execute').mockResolvedValue(undefined);
        render(<M0ModeActionsPanel />);
        fireEvent.click(screen.getByTestId('m0-mode-switch-authoring'));
        fireEvent.click(screen.getByTestId('m0-action-request-anuttara-review'));
        expect(spy).toHaveBeenCalledWith(
            CROSS_LAYOUT_INTENT_COMMAND,
            expect.objectContaining({
                coordinate: 'M0-2',
                requestedExtensionId: 'm5-epii',
                requestedContributionId: 'review'
            })
        );
    });

    it('both authoring deep-links dispatch through the M5 governance path (DR-M0-1)', () => {
        const spy = vi.spyOn(commands, 'execute').mockResolvedValue(undefined);
        render(<M0ModeActionsPanel />);
        fireEvent.click(screen.getByTestId('m0-mode-switch-authoring'));
        fireEvent.click(screen.getByTestId('m0-deeplink-canonStudio'));
        fireEvent.click(screen.getByTestId('m0-deeplink-logosAtelier'));
        for (const call of spy.mock.calls) {
            expect(call[0]).toBe(CROSS_LAYOUT_INTENT_COMMAND);
            expect(call[1]).toMatchObject({ requestedExtensionId: 'm5-epii', requestedContributionId: 'review' });
        }
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('switches back to reading, re-hiding the routed-write affordances', () => {
        render(<M0ModeActionsPanel />);
        fireEvent.click(screen.getByTestId('m0-mode-switch-authoring'));
        fireEvent.click(screen.getByTestId('m0-mode-switch-reading'));
        expect(screen.queryByTestId('m0-action-request-anuttara-review')).toBeNull();
        expect(screen.queryByTestId('m0-dr-m0-1-banner')).toBeNull();
    });
});
