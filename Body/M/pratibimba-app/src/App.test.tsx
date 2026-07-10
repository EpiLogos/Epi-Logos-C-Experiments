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
});
