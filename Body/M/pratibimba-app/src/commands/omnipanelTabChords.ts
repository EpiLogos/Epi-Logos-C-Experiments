/**
 * Coordinate: M' `/` membrane (OmniPanel tab chord grammar — CCT-4, rerun 31.T31.3)
 * Residency: Body/M/pratibimba-app/src/commands
 * Position (#n): #4 -- Context/Type (keybinding chord grammar over the `/` membrane)
 * Actualises: the CCT-4 `cmd-1`…`cmd-8` OmniPanel tab-activation command family
 *   (`omnipanel.tab.activate.{0..7}`) — one command per DECLARED index into
 *   `OMNIPANEL_TABS`. Each command switches the visible fold on the active
 *   face's FlexLayout model AND records the choice in the shared session store
 *   so the rendered tab and the persisted `data-omnipanel-active-tab` agree.
 *   The 9th tab ('tuning', index 8) is intentionally UNBOUND — CCT-4 names
 *   exactly eight chords. The eight commands are declared as STATIC object
 *   literals (never a computed id) so the 31.T31.2 no-orphan catalog AST gate
 *   can resolve every id/title from the source.
 * Public surface: OmnipanelTabChordDependencies, omniBorderNodeId,
 *   activateOmnipanelTabByIndex, registerOmnipanelTabActivationCommands.
 * Does NOT own: the FlexLayout model / persistence (App.tsx owns both faces),
 *   the tab manifest (omnipanelRuntime.ts), the session store shape
 *   (omnipanelSessionState.ts), or command palette rendering.
 * Contract: [[CHROME-CONTRACT]] section 3 / [[31-chrome-contributions-catalog]] CCT-4.
 */

import { Actions, Model } from 'flexlayout-react';
import { commands } from './registry';
import { OMNIPANEL_TABS } from '../panes/omni/omnipanelRuntime';
import type { OmniPanelLayoutId } from '../panes/omni/omnipanelRuntime';
import { useOmniPanelSessionStore } from '../panes/omni/omnipanelSessionState';

export interface OmnipanelTabChordDependencies {
    /** The FlexLayout model of the face the user is currently looking at. */
    readonly activeModel: () => Model | null;
    /** The active shell layout — gates a fold out when it is not available. */
    readonly activeLayout: () => OmniPanelLayoutId;
    /** Debounced UI-state persistence (App.tsx). */
    readonly persist: () => void;
}

/**
 * The omni border node-id scheme MIRRORS App.tsx::omniBorder verbatim:
 * `pi-chat` keeps the legacy id `omni-tab`; every other fold is `omni-${id}`.
 * (Kept in lockstep with the border builder — a divergence would leave the
 * chord unable to find its node.)
 */
export function omniBorderNodeId(tabId: string): string {
    return tabId === 'pi-chat' ? 'omni-tab' : `omni-${tabId}`;
}

/**
 * CCT-4: activate the OmniPanel fold at the DECLARED index into OMNIPANEL_TABS
 * on the active face. No-op when the index is out of range, when the tab is not
 * in the active layout's `availableInLayouts`, or when its fold node is not
 * mounted in the active face's model. Activation is BOTH sides of the truth:
 * the FlexLayout `selectTab` (visible tab) and the session store (persisted
 * `data-omnipanel-active-tab`), so the two never disagree.
 */
export function activateOmnipanelTabByIndex(index: number, deps: OmnipanelTabChordDependencies): void {
    const tab = OMNIPANEL_TABS[index];
    if (!tab || !tab.availableInLayouts.includes(deps.activeLayout())) {
        return;
    }
    const model = deps.activeModel();
    if (!model) {
        return;
    }
    const nodeId = omniBorderNodeId(tab.id);
    if (!model.getNodeById(nodeId)) {
        return;
    }
    model.doAction(Actions.selectTab(nodeId));
    useOmniPanelSessionStore.getState().selectTab(tab.id);
    deps.persist();
}

/**
 * Register the eight CCT-4 tab-activation commands. Eight STATIC command
 * literals: the 31.T31.2 catalog gate resolves ids/titles only from literals,
 * so a `.map` over a computed id would (a) read as a dynamic register site the
 * gate does not know and (b) leave the catalog rows unbacked. The titles here
 * MUST stay byte-identical to their `COMMAND_CATALOG` rows.
 */
export function registerOmnipanelTabActivationCommands(
    deps: OmnipanelTabChordDependencies
): (() => void)[] {
    const activate = (index: number) => activateOmnipanelTabByIndex(index, deps);
    return [
        commands.register({ id: 'omnipanel.tab.activate.0', title: 'OmniPanel: Activate the Pi tab (⌘1)', run: () => activate(0) }),
        commands.register({ id: 'omnipanel.tab.activate.1', title: 'OmniPanel: Activate the Sessions tab (⌘2)', run: () => activate(1) }),
        commands.register({ id: 'omnipanel.tab.activate.2', title: 'OmniPanel: Activate the Dispatch tab (⌘3)', run: () => activate(2) }),
        commands.register({ id: 'omnipanel.tab.activate.3', title: 'OmniPanel: Activate the Tools tab (⌘4)', run: () => activate(3) }),
        commands.register({ id: 'omnipanel.tab.activate.4', title: 'OmniPanel: Activate the Evidence tab (⌘5)', run: () => activate(4) }),
        commands.register({ id: 'omnipanel.tab.activate.5', title: 'OmniPanel: Activate the Review tab (⌘6)', run: () => activate(5) }),
        commands.register({ id: 'omnipanel.tab.activate.6', title: 'OmniPanel: Activate the Gateway tab (⌘7)', run: () => activate(6) }),
        commands.register({ id: 'omnipanel.tab.activate.7', title: 'OmniPanel: Activate the Diagnostics tab (⌘8)', run: () => activate(7) })
    ];
}
