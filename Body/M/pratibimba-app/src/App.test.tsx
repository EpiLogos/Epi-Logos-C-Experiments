import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { useCoordinateStore } from './state/stores';

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

    it('mounts both face layouts with their tab structure (Cosmic Engine / Now / Vault)', async () => {
        // jsdom gives flexlayout zero size, so tab BODIES stay unmounted here;
        // pane components are covered by their own tests, bodies by the manual gate.
        render(<App />);
        await screen.findByTestId('shell');
        expect((await screen.findAllByText('Cosmic Engine')).length).toBeGreaterThan(0);
        expect((await screen.findAllByText('Now')).length).toBeGreaterThan(0);
        expect((await screen.findAllByText('Vault')).length).toBeGreaterThan(0);
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
});
