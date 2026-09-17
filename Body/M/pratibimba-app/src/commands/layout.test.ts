/**
 * Behavioural contract for the 52.T3 layout switch spine and the preference it
 * persists. The UF proof (real control, real browser, reload, receipt) lives in
 * `tests/e2e/layout-switch.spec.ts`; this suite pins the pure law underneath —
 * the toggle, the addressed pair, and the storage round-trip — so a regression
 * in either shows up in milliseconds rather than in a browser run.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    LAYOUT_SWITCH_COMMAND_IDS,
    LAYOUT_SWITCH_DAILY_COMMAND,
    LAYOUT_SWITCH_DEEP_COMMAND,
    LAYOUT_TOGGLE_COMMAND,
    layoutSwitchCommandId,
    otherLayout,
    registerLayoutCommands
} from './layout';
import { commands } from './registry';
import { COMMAND_CATALOG } from './catalog';
import { LAYOUT_IDS, type LayoutId } from '../ui/layoutId';
import { LAYOUT_PREFERENCE_KEY, readStoredLayout, writeStoredLayout } from '../ui/layoutPreference';
import { PREFERENCE_KEYS } from '../ui/preferences';

describe('52.T3 layout commands', () => {
    it('is a total toggle over the two-layout domain', () => {
        expect(otherLayout('daily-0-1')).toBe('ide-deep');
        expect(otherLayout('ide-deep')).toBe('daily-0-1');
        for (const layout of LAYOUT_IDS) {
            expect(otherLayout(otherLayout(layout))).toBe(layout);
        }
    });

    it('addresses one switch command per layout — the palette picker', () => {
        expect(Object.keys(LAYOUT_SWITCH_COMMAND_IDS).sort()).toEqual([...LAYOUT_IDS].sort());
        expect(layoutSwitchCommandId('daily-0-1')).toBe(LAYOUT_SWITCH_DAILY_COMMAND);
        expect(layoutSwitchCommandId('ide-deep')).toBe(LAYOUT_SWITCH_DEEP_COMMAND);
    });

    it('registers all three on the one registry and disposes them together', async () => {
        const switched: LayoutId[] = [];
        const dispose = registerLayoutCommands({
            activeLayout: () => 'daily-0-1',
            switchTo: layout => switched.push(layout)
        });
        for (const id of [LAYOUT_SWITCH_DAILY_COMMAND, LAYOUT_SWITCH_DEEP_COMMAND, LAYOUT_TOGGLE_COMMAND]) {
            expect(commands.has(id), id).toBe(true);
        }
        await commands.execute(LAYOUT_SWITCH_DEEP_COMMAND);
        await commands.execute(LAYOUT_SWITCH_DAILY_COMMAND);
        await commands.execute(LAYOUT_TOGGLE_COMMAND);
        expect(switched).toEqual(['ide-deep', 'daily-0-1', 'ide-deep']);
        dispose();
        for (const id of [LAYOUT_SWITCH_DAILY_COMMAND, LAYOUT_SWITCH_DEEP_COMMAND, LAYOUT_TOGGLE_COMMAND]) {
            expect(commands.has(id), id).toBe(false);
        }
    });

    it('reads the LIVE layout on every toggle — never a value captured at register time', async () => {
        let live: LayoutId = 'daily-0-1';
        const switchTo = vi.fn((layout: LayoutId) => {
            live = layout;
        });
        const dispose = registerLayoutCommands({ activeLayout: () => live, switchTo });
        await commands.execute(LAYOUT_TOGGLE_COMMAND);
        await commands.execute(LAYOUT_TOGGLE_COMMAND);
        expect(switchTo.mock.calls.map(call => call[0])).toEqual(['ide-deep', 'daily-0-1']);
        dispose();
    });

    it('every registered id and title is catalogued verbatim (CHROME-CONTRACT §11)', () => {
        const dispose = registerLayoutCommands({
            activeLayout: () => 'daily-0-1',
            switchTo: () => undefined
        });
        for (const id of [LAYOUT_SWITCH_DAILY_COMMAND, LAYOUT_SWITCH_DEEP_COMMAND, LAYOUT_TOGGLE_COMMAND]) {
            const row = COMMAND_CATALOG.find(entry => entry.id === id);
            expect(row, `catalog row for ${id}`).toBeDefined();
            expect(commands.list().find(command => command.id === id)?.title).toBe(row!.title);
        }
        dispose();
    });
});

describe('52.T3 layout preference storage', () => {
    beforeEach(() => localStorage.clear());

    it('aliases the one preference-key authority — it never spells the key', () => {
        expect(LAYOUT_PREFERENCE_KEY).toBe(PREFERENCE_KEYS.layoutActive);
    });

    it('round-trips through the storage the Settings register reads', () => {
        expect(readStoredLayout()).toBeNull();
        writeStoredLayout('ide-deep');
        expect(readStoredLayout()).toBe('ide-deep');
        writeStoredLayout('daily-0-1');
        expect(readStoredLayout()).toBe('daily-0-1');
    });

    it('distinguishes "nothing chosen" from "the daily default"', () => {
        // null is what lets boot consult the legacy ui_state value exactly once
        expect(readStoredLayout()).toBeNull();
        writeStoredLayout('daily-0-1');
        expect(readStoredLayout()).toBe('daily-0-1');
    });

    it('tolerates a bare string and refuses a value that is not a layout', () => {
        localStorage.setItem(LAYOUT_PREFERENCE_KEY, 'ide-deep');
        expect(readStoredLayout()).toBe('ide-deep');
        localStorage.setItem(LAYOUT_PREFERENCE_KEY, '"not-a-layout"');
        expect(readStoredLayout()).toBeNull();
        localStorage.setItem(LAYOUT_PREFERENCE_KEY, '{');
        expect(readStoredLayout()).toBeNull();
    });

    it('a blocked storage never breaks boot or the switch', () => {
        const blocked = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            }
        };
        expect(readStoredLayout(blocked)).toBeNull();
        expect(() => writeStoredLayout('ide-deep', blocked)).not.toThrow();
    });
});
