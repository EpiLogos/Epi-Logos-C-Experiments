/**
 * Coordinate: M' shell (left-sidebar mode registry — Track 15.T15.3)
 * Actualises: the 15.3 acceptance — the activity bar registers EXACTLY the
 *   named modes per layout (three for `daily-0-1`, five for `ide-deep`); the
 *   mode-switch state is a singleton that survives the 0/1 face toggle; and
 *   cross-layout switching preserves the active mode where it exists in both,
 *   else falls back to the backbone. Plus the consistency duty: every mode's
 *   surface id AGREES with CHROME-CONTRACT §2 (same parser the chrome-contract
 *   validator uses), and each mode's live/pending status matches §2.
 */

// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commands } from '../commands/registry';
import {
    DEFAULT_LEFT_SIDEBAR_MODE,
    isModeAvailableInLayout,
    LEFT_SIDEBAR_MODES,
    modesForLayout,
    registerLeftSidebarModeCommands,
    resolveModeForLayout,
    useLeftSidebarModeStore
} from './leftSidebarModes';

const CONTRACT_PATH = resolve(__dirname, '../../CHROME-CONTRACT.md');

/** Parse CHROME-CONTRACT §2 the same way the chrome-contract validator does:
 *  backticked-id rows sliced from the `## 2.` section into {status, owner}. */
function chromeContractSection2(): Map<string, { status: string; owner: string }> {
    const body = readFileSync(CONTRACT_PATH, 'utf8').split('\n');
    const start = body.findIndex(line => line.startsWith('## 2.'));
    let end = body.length;
    for (let i = start + 1; i < body.length; i++) {
        if (body[i].startsWith('## ')) {
            end = i;
            break;
        }
    }
    const rows = new Map<string, { status: string; owner: string }>();
    for (const line of body.slice(start, end)) {
        if (!/^\| `[^`]+` \|/.test(line)) {
            continue;
        }
        const cells = line.split('|').map(cell => cell.trim());
        rows.set(cells[1].replace(/`/g, ''), { status: cells[4], owner: cells[5] });
    }
    return rows;
}

function resetStore() {
    useLeftSidebarModeStore.setState({
        activeModeId: DEFAULT_LEFT_SIDEBAR_MODE,
        layout: 'daily-0-1'
    });
}

describe('left-sidebar mode registry — inventory (15.T15.3)', () => {
    it('declares exactly five unique modes with unique surface ids', () => {
        expect(LEFT_SIDEBAR_MODES).toHaveLength(5);
        expect(new Set(LEFT_SIDEBAR_MODES.map(m => m.id)).size).toBe(5);
        expect(new Set(LEFT_SIDEBAR_MODES.map(m => m.surfaceId)).size).toBe(5);
    });

    it('daily-0-1 exposes EXACTLY three modes: Coordinate Tree · Bimba Graph Viewer · Canon Studio', () => {
        expect(modesForLayout('daily-0-1').map(m => m.label)).toEqual([
            'Coordinate Tree',
            'Bimba Graph Viewer',
            'Canon Studio'
        ]);
    });

    it('ide-deep exposes EXACTLY five modes: the three plus Backend Studio + Smart Connections', () => {
        expect(modesForLayout('ide-deep').map(m => m.label)).toEqual([
            'Coordinate Tree',
            'Bimba Graph Viewer',
            'Canon Studio',
            'Backend Studio',
            'Smart Connections'
        ]);
    });

    it('the default/fallback mode is the backbone and exists in both layouts', () => {
        expect(DEFAULT_LEFT_SIDEBAR_MODE).toBe('coordinate-tree');
        expect(isModeAvailableInLayout(DEFAULT_LEFT_SIDEBAR_MODE, 'daily-0-1')).toBe(true);
        expect(isModeAvailableInLayout(DEFAULT_LEFT_SIDEBAR_MODE, 'ide-deep')).toBe(true);
    });

    it('pending modes carry the honest owner marker; live modes carry none', () => {
        const owners = Object.fromEntries(LEFT_SIDEBAR_MODES.map(m => [m.id, m.pendingOwner]));
        expect(owners).toEqual({
            'coordinate-tree': '28.6',
            'bimba-graph': null,
            'canon-studio': null,
            'backend-studio': '28.13',
            'smart-connections': '28.12'
        });
    });
});

describe('left-sidebar mode registry — CHROME-CONTRACT §2 consistency duty', () => {
    const section2 = chromeContractSection2();

    it('every mode surface id is a real CHROME-CONTRACT §2 row', () => {
        for (const mode of LEFT_SIDEBAR_MODES) {
            expect(section2.has(mode.surfaceId), `§2 has \`${mode.surfaceId}\``).toBe(true);
        }
    });

    it('live modes map to §2 `live` rows; pending modes map to §2 `pending` rows owned by the marker', () => {
        for (const mode of LEFT_SIDEBAR_MODES) {
            const row = section2.get(mode.surfaceId)!;
            if (mode.pendingOwner === null) {
                expect(row.status, `\`${mode.surfaceId}\` status`).toBe('live');
            } else {
                expect(row.status, `\`${mode.surfaceId}\` status`).toBe('pending');
                expect(row.owner, `\`${mode.surfaceId}\` owner cites ${mode.pendingOwner}`).toContain(
                    mode.pendingOwner
                );
            }
        }
    });
});

describe('left-sidebar mode-switch state (15.7 BimbaPratibimbaUiState sub-record)', () => {
    beforeEach(resetStore);

    it('boots on the backbone in daily-0-1', () => {
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('coordinate-tree');
        expect(useLeftSidebarModeStore.getState().layout).toBe('daily-0-1');
    });

    it('activates a mode available in the current layout', () => {
        useLeftSidebarModeStore.getState().setActiveMode('bimba-graph');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('bimba-graph');
    });

    it('refuses to activate a mode absent from the current layout (Backend Studio in daily-0-1)', () => {
        useLeftSidebarModeStore.getState().setActiveMode('backend-studio');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('coordinate-tree');
    });

    it('survives the 0/1 face toggle — a face flip re-renders the shell but never resets the mode', () => {
        useLeftSidebarModeStore.getState().setActiveMode('bimba-graph');
        // a consumer that reads the store, parameterised by the shell face (0/1)
        const Probe = ({ face }: { face: 0 | 1 }) =>
            createElement(
                'div',
                { 'data-testid': 'probe', 'data-face': String(face) },
                useLeftSidebarModeStore(s => s.activeModeId)
            );
        const { rerender } = render(createElement(Probe, { face: 0 }));
        expect(screen.getByTestId('probe').textContent).toBe('bimba-graph');
        // ⌘. toggles App's face (cosmic ↔ personal) — a re-render only; the
        // sidebar-mode singleton is untouched, so the mode is invariant.
        rerender(createElement(Probe, { face: 1 }));
        expect(screen.getByTestId('probe').getAttribute('data-face')).toBe('1');
        expect(screen.getByTestId('probe').textContent).toBe('bimba-graph');
    });
});

describe('left-sidebar cross-layout persistence', () => {
    beforeEach(resetStore);

    it('preserves the active mode where it exists in BOTH layouts', () => {
        useLeftSidebarModeStore.getState().setActiveMode('bimba-graph');
        expect(useLeftSidebarModeStore.getState().switchLayout('ide-deep')).toBe('bimba-graph');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('bimba-graph');
        expect(useLeftSidebarModeStore.getState().switchLayout('daily-0-1')).toBe('bimba-graph');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('bimba-graph');
    });

    it('falls back to the backbone when the active mode does not exist in the target layout', () => {
        useLeftSidebarModeStore.getState().switchLayout('ide-deep');
        useLeftSidebarModeStore.getState().setActiveMode('backend-studio');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('backend-studio');
        // switching to daily-0-1 cannot carry an ide-deep-only mode
        expect(useLeftSidebarModeStore.getState().switchLayout('daily-0-1')).toBe('coordinate-tree');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('coordinate-tree');
    });

    it('resolveModeForLayout is pure and agrees with the store', () => {
        expect(resolveModeForLayout('smart-connections', 'ide-deep')).toBe('smart-connections');
        expect(resolveModeForLayout('smart-connections', 'daily-0-1')).toBe('coordinate-tree');
    });
});

describe('left-sidebar mode command spine', () => {
    beforeEach(resetStore);
    let disposers: (() => void)[] = [];
    afterEach(() => {
        disposers.forEach(dispose => dispose());
        disposers = [];
    });

    it('registers one command per mode and drives the store', async () => {
        disposers = registerLeftSidebarModeCommands(commands);
        expect(commands.has('leftSidebar.mode.bimba-graph')).toBe(true);
        expect(commands.has('leftSidebar.mode.smart-connections')).toBe(true);
        await commands.execute('leftSidebar.mode.bimba-graph');
        expect(useLeftSidebarModeStore.getState().activeModeId).toBe('bimba-graph');
    });

    it('greys out ide-deep-only mode commands while in daily-0-1', () => {
        disposers = registerLeftSidebarModeCommands(commands);
        expect(commands.isEnabled('leftSidebar.mode.bimba-graph')).toBe(true);
        expect(commands.isEnabled('leftSidebar.mode.backend-studio')).toBe(false);
        useLeftSidebarModeStore.getState().switchLayout('ide-deep');
        expect(commands.isEnabled('leftSidebar.mode.backend-studio')).toBe(true);
    });
});
