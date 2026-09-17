/**
 * Coordinate: M' `/` membrane (the layout switch control — Track 52.T3)
 * Residency: Body/M/pratibimba-app/src/components/OmniPanelLayoutSwitch.tsx
 * Position (#n): #2 — Operation, rendered inside the #4 membrane
 * Actualises: canon's named mechanism as a real control. [[M5'-SPEC]] :159 —
 *   "the omni panel is the canonical switch mechanism"; :107 (DCC-07) holds the
 *   two layouts as distinct authority classes, so the control STATES which one
 *   is active rather than being a stateless button that flips something
 *   invisible. Two options, both always visible, the active one pressed: a
 *   person can see which layout they are in and address the other one directly.
 *
 *   It is injected into the OmniPanel's own border tab strip through
 *   FlexLayout's `onRenderTabSet` (App.tsx), so it is chrome OF the membrane
 *   rather than shell chrome floating over it — the `right` slot stays owned by
 *   the OmniPanel exactly as `ui/shellSlotPolicy.ts` declares.
 *
 *   TEXT, NOT A GLYPH. `ui/iconography.ts` (30.T30.9) is a closed nineteen-icon
 *   register and the carrier ships no icon font; per its own fallback law the
 *   honest affordance here is the label. `0/1` and `4+2` are the matheme's own
 *   names for these two layouts, so the control reads as the coordinate system
 *   rather than as an abbreviation.
 * Public surface: OmniPanelLayoutSwitch.
 * Does NOT own: layout state or the transition (App.tsx `switchLayout` mints
 *   the identity receipt), the command ids (`commands/layout.ts`), or
 *   persistence (`ui/layoutPreference.ts`). It fires registered commands — the
 *   registry is the one action membrane ([[CHROME-CONTRACT]] §10).
 * Contract: [[CHROME-CONTRACT]] §2 row `layout-switch` · [[M5'-SPEC]] :159 ·
 *   rerun tranche [[52.T3]].
 */

import { LAYOUT_IDS, type LayoutId } from '../ui/layoutId';
import { LAYOUT_LABELS, LAYOUT_SHORT_LABELS, layoutSwitchCommandId } from '../commands/layout';
import { commands } from '../commands/registry';

export interface OmniPanelLayoutSwitchProps {
    readonly activeLayout: LayoutId;
    /** Test seam only; production fires the one command registry. */
    readonly execute?: (commandId: string) => void;
}

export function OmniPanelLayoutSwitch({ activeLayout, execute }: OmniPanelLayoutSwitchProps) {
    const run = execute ?? ((id: string) => void commands.execute(id));
    return (
        <div
            className="omnipanel-layout-switch"
            data-testid="omnipanel-layout-switch"
            data-active-layout={activeLayout}
            role="group"
            aria-label="Workspace layout"
        >
            {LAYOUT_IDS.map(layout => (
                <button
                    key={layout}
                    type="button"
                    className="omnipanel-layout-switch-option"
                    data-testid={`omnipanel-layout-option-${layout}`}
                    data-layout-id={layout}
                    aria-pressed={layout === activeLayout}
                    aria-label={LAYOUT_LABELS[layout]}
                    title={LAYOUT_LABELS[layout]}
                    onClick={() => run(layoutSwitchCommandId(layout))}
                >
                    {LAYOUT_SHORT_LABELS[layout]}
                </button>
            ))}
        </div>
    );
}
