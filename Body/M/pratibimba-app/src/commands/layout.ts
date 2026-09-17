/**
 * Coordinate: M' shell (the layout switch command spine — Track 52.T3)
 * Residency: Body/M/pratibimba-app/src/commands/layout.ts
 * Position (#n): #2 — Operation (the act that moves the shell between its two
 *   layouts)
 * Actualises: the switch canon names and the carrier did not have.
 *   [[M5'-SPEC]] :91 fixes the two layouts; :159 says "the omni panel switches
 *   layouts inside one process; there is no second app" and calls the omni
 *   panel "the canonical switch mechanism". Before this tranche `setActiveLayout`
 *   had exactly two callers — persistence restore and a cross-layout intent's
 *   `preferredLayout` — so a user could reach `ide-deep` only as a SIDE EFFECT
 *   of asking for something else. This module is the deliberate act.
 *
 *   ONE COMMAND PER LAYOUT, PLUS A TOGGLE — the `commands/theme.ts` (30.T30.4)
 *   precedent. The palette executes commands with NO argument
 *   (`panes/CommandPalette.tsx`), so a single parameterised `layout.switch`
 *   could never be picked from it; the addressed pair IS the picker, and each
 *   is a static `{ id, title, run }` literal so the AST catalog gate
 *   (`catalog.test.ts`) can see it. `layout.toggle` is the no-argument flip the
 *   OmniPanel's control and the palette both reach for.
 *
 *   The commands do not TOUCH layout state. They call the shell's `switchTo`
 *   seam, which is where the seven-field cross-layout identity receipt
 *   (`state/crossLayoutIdentity.ts`) is minted — the switch is the exact place
 *   that invariant earns its keep, and it earns it once, not once per caller.
 * Public surface: LAYOUT_TOGGLE_COMMAND, LAYOUT_SWITCH_DAILY_COMMAND,
 *   LAYOUT_SWITCH_DEEP_COMMAND, LAYOUT_SWITCH_COMMAND_IDS, LAYOUT_LABELS,
 *   LAYOUT_SHORT_LABELS, layoutSwitchCommandId, otherLayout,
 *   LayoutCommandDependencies, registerLayoutCommands.
 * Does NOT own: layout state or the receipt (App.tsx `switchLayout`), the
 *   layout vocabulary (`ui/layoutId.ts`, 52.T1), persistence
 *   (`ui/layoutPreference.ts`), the deep pane set (52.T4), or the OmniPanel
 *   control's rendering (`components/OmniPanelLayoutSwitch.tsx`).
 * Contract: [[CHROME-CONTRACT]] §11 (every registered command is catalogued) ·
 *   [[M5'-SPEC]] :91 / :159 · rerun tranche [[52.T3]].
 */

import { LAYOUT_IDS, type LayoutId } from '../ui/layoutId';
import { commands } from './registry';

export const LAYOUT_TOGGLE_COMMAND = 'layout.toggle';
export const LAYOUT_SWITCH_DAILY_COMMAND = 'layout.switch.daily-0-1';
export const LAYOUT_SWITCH_DEEP_COMMAND = 'layout.switch.ide-deep';

/** The addressed switch command per layout — the palette-visible picker. */
export const LAYOUT_SWITCH_COMMAND_IDS: Readonly<Record<LayoutId, string>> = Object.freeze({
    'daily-0-1': LAYOUT_SWITCH_DAILY_COMMAND,
    'ide-deep': LAYOUT_SWITCH_DEEP_COMMAND
});

/** How a layout is named to a person. Canon's own words, shortened. */
export const LAYOUT_LABELS: Readonly<Record<LayoutId, string>> = Object.freeze({
    'daily-0-1': 'Daily 0/1 preview',
    'ide-deep': 'IDE deep (4+2 workspace)'
});

/** The two-character form the OmniPanel control wears. `0/1` and `4+2` are the
 *  matheme's own names for these layouts, not invented abbreviations. */
export const LAYOUT_SHORT_LABELS: Readonly<Record<LayoutId, string>> = Object.freeze({
    'daily-0-1': '0/1',
    'ide-deep': '4+2'
});

export function layoutSwitchCommandId(layout: LayoutId): string {
    return LAYOUT_SWITCH_COMMAND_IDS[layout];
}

/** The toggle law. Two layouts, so "the other one" is total. */
export function otherLayout(layout: LayoutId): LayoutId {
    return LAYOUT_IDS[(LAYOUT_IDS.indexOf(layout) + 1) % LAYOUT_IDS.length];
}

export interface LayoutCommandDependencies {
    /** The shell's live layout — read, never cached, so the toggle cannot flip
     *  from a stale value. */
    readonly activeLayout: () => LayoutId;
    /** The shell's one transition seam: it applies the layout, persists it, and
     *  mints the cross-layout identity receipt. A no-op switch (same layout) is
     *  the seam's decision, not this module's. */
    readonly switchTo: (layout: LayoutId) => void;
}

export function registerLayoutCommands(dependencies: LayoutCommandDependencies): () => void {
    const disposers = [
        commands.register({
            id: LAYOUT_SWITCH_DAILY_COMMAND,
            title: 'Layout: Daily 0/1 preview',
            run: () => dependencies.switchTo('daily-0-1')
        }),
        commands.register({
            id: LAYOUT_SWITCH_DEEP_COMMAND,
            title: 'Layout: IDE deep (4+2 workspace)',
            run: () => dependencies.switchTo('ide-deep')
        }),
        commands.register({
            id: LAYOUT_TOGGLE_COMMAND,
            title: 'Layout: Toggle daily 0/1 and IDE deep',
            run: () => dependencies.switchTo(otherLayout(dependencies.activeLayout()))
        })
    ];
    return () => disposers.forEach(dispose => dispose());
}
