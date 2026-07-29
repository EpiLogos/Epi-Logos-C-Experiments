/**
 * Coordinate: M' shell (the persisted layout choice — Track 52.T3)
 * Residency: Body/M/pratibimba-app/src/ui/layoutPreference.ts
 * Position (#n): #4 — Context/Type (the frame the shell resumes into)
 * Actualises: storage for `epi-logos.layout.active`, the one preference the
 *   layout switch writes. Canon makes the omni panel the switch and the switch
 *   the thing that persists ([[M5'-SPEC]] :159); this module is where that
 *   persistence actually lives.
 *
 *   WHY localStorage AND NOT THE `ui_state` BLOB. Before 52.T3 the layout id
 *   rode inside the Tauri `ui_state` JSON alongside the FlexLayout models,
 *   which are workspace STATE, not preferences. Two consequences were live
 *   defects: (a) the Settings fold's Layout row (32.T32.4) reads the
 *   preference register through `browserKairosPreferences(localStorage)`, so
 *   it always reported the shipped default no matter which layout the shell
 *   was in — the one row about the layout lied about the layout; and (b) every
 *   other live key in `EPI_LOGOS_PREFERENCES` already persists in
 *   localStorage (theme, kairos, the two onboarding ledgers), so the layout
 *   was the lone preference stored somewhere else. One writer, one reader, one
 *   place: the switch writes here, boot and Settings read here.
 *
 *   The legacy `ui_state` value is still READ once at boot (see App.tsx) so an
 *   existing install does not forget the layout it was left in; nothing writes
 *   it any more.
 * Public surface: LAYOUT_PREFERENCE_KEY, readStoredLayout, writeStoredLayout.
 * Does NOT own: the layout vocabulary (`ui/layoutId.ts`, 52.T1), the key
 *   spelling (`ui/preferences.ts`, 31.T31.9 — aliased here, never re-spelled),
 *   layout SELECTION (App.tsx holds `activeLayout`), or the switch commands
 *   (`commands/layout.ts`).
 * Contract: [[M5'-SPEC]] :159 · rerun tranches [[52.T3]] / [[31.T31.9]].
 */

import { isLayoutId, type LayoutId } from './layoutId';
import { PREFERENCE_KEYS } from './preferences';

/** Aliases the one preference-key authority (`ui/preferences.ts`, 31.T31.9). */
export const LAYOUT_PREFERENCE_KEY = PREFERENCE_KEYS.layoutActive;

function browserStorage(): Storage | undefined {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
}

/**
 * The persisted layout, or `null` when nothing has been persisted (or the
 * stored value is not a layout id). `null` is deliberately distinct from the
 * daily default: the caller needs to know whether a choice exists before it
 * decides whether to consult the legacy `ui_state` value.
 *
 * Tolerant of both encodings: the switch writes JSON (so the preference-access
 * helper the Settings fold uses round-trips it), and a bare string written by
 * hand or by an older build still reads.
 */
export function readStoredLayout(storage?: Pick<Storage, 'getItem'>): LayoutId | null {
    const store = storage ?? browserStorage();
    if (!store) {
        return null;
    }
    let raw: string | null;
    try {
        raw = store.getItem(LAYOUT_PREFERENCE_KEY);
    } catch {
        return null; // a blocked storage must never break boot
    }
    if (raw === null) {
        return null;
    }
    let value: unknown = raw;
    try {
        value = JSON.parse(raw);
    } catch {
        // not JSON — the bare string IS the value
    }
    return isLayoutId(value) ? value : null;
}

/** Persist the layout choice. A blocked or absent storage must never break the
 *  switch — the transition still happens, it just does not survive reload. */
export function writeStoredLayout(layout: LayoutId, storage?: Pick<Storage, 'setItem'>): void {
    const store = storage ?? browserStorage();
    if (!store) {
        return;
    }
    try {
        store.setItem(LAYOUT_PREFERENCE_KEY, JSON.stringify(layout));
    } catch {
        // ignore
    }
}
