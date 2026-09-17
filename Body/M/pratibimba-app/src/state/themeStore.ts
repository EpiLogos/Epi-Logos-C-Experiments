/**
 * Coordinate: M' shell-0 (live theme signal — 30.T30.4)
 * Residency: Body/M/pratibimba-app/src/state/themeStore.ts
 * Position (#n): #4 — Context/Type (the ambient frame every surface resolves in)
 * Actualises: the theme SELECTION as live state, and its application to the
 *   document as `data-theme` on the root element — the signal
 *   `ui/themeMapping.ts` resolves and `styles.css`'s `[data-theme=…]` blocks
 *   consume. The applied value is the CANONICAL theme, resolved for the domain
 *   of the currently-selected coordinate, so a `nara-*` selection degrades to
 *   its base outside M4 exactly as the contract requires. Three inputs drive
 *   it: the selection, the active coordinate (domain), and — for `system` —
 *   `prefers-color-scheme`; all three are subscribed, so the attribute is
 *   never stale.
 * Public surface: THEME_PREFERENCE_KEY, ThemeState, useThemeStore,
 *   readStoredThemeSelection, applyTheme, installThemeApplier.
 * Does NOT own: the resolution law (ui/themeMapping.ts), the palette
 *   (ui/tokens.ts), the surface CSS (styles.css), or coordinate selection
 *   (state/stores.ts — this module only READS it).
 * Contract: rerun tranche [[30.T30.4]].
 */

import { create } from 'zustand';
import {
    domainIdForCoordinate,
    resolveSelection,
    THEME_SELECTIONS,
    type CanonicalTheme,
    type ThemeSelection
} from '../ui/themeMapping';
import { PREFERENCE_KEYS } from '../ui/preferences';
import { useCoordinateStore } from './stores';

/** localStorage key for the persisted selection. Aliases the one preference-key
 *  authority (`ui/preferences.ts`, 31.T31.9) — the `epi-logos.<area>.<setting>`
 *  convention this module used to spell inline is declared there now. */
export const THEME_PREFERENCE_KEY = PREFERENCE_KEYS.appearanceTheme;

/** The carrier's shipped default. `dark` — the ground every existing surface
 *  and every visual-regression baseline was authored against. */
const DEFAULT_SELECTION: ThemeSelection = 'dark';

function isThemeSelection(value: unknown): value is ThemeSelection {
    return typeof value === 'string' && (THEME_SELECTIONS as readonly string[]).includes(value);
}

/** Read the persisted selection, falling back to the default. Tolerates a
 *  missing/blocked storage and a stale value from an older vocabulary. */
export function readStoredThemeSelection(storage?: Pick<Storage, 'getItem'>): ThemeSelection {
    const store = storage ?? (typeof localStorage === 'undefined' ? undefined : localStorage);
    if (!store) {
        return DEFAULT_SELECTION;
    }
    try {
        const raw = store.getItem(THEME_PREFERENCE_KEY);
        return isThemeSelection(raw) ? raw : DEFAULT_SELECTION;
    } catch {
        return DEFAULT_SELECTION;
    }
}

export interface ThemeState {
    /** What the user chose — may be a legacy alias or `system`. */
    selection: ThemeSelection;
    /** The canonical theme currently APPLIED to the document root. Components
     *  that tint by token must read THIS, not `document.dataset.theme`: the DOM
     *  attribute is an output, and reading it during render makes a component
     *  blind to theme changes (nothing it subscribes to moved, so it never
     *  re-renders and its tint goes stale). Store state is the reactive path. */
    applied: CanonicalTheme;
    setSelection(selection: ThemeSelection): void;
}

export const useThemeStore = create<ThemeState>(set => ({
    selection: readStoredThemeSelection(),
    applied: DEFAULT_SELECTION as CanonicalTheme,
    setSelection: selection => {
        try {
            localStorage?.setItem(THEME_PREFERENCE_KEY, selection);
        } catch {
            // a blocked/absent storage must never break the theme switch
        }
        set({ selection });
    }
}));

function prefersDark(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return true; // no media signal: the carrier's ground is dark
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Resolve the current (selection, coordinate-domain, media) triple, write it
 *  to the document root, and publish it as `applied` so subscribing components
 *  re-render. Returns the canonical theme applied.
 *
 *  The `applied !== resolved` guard is load-bearing: `installThemeApplier`
 *  subscribes to this same store, so an unconditional `setState` would re-enter
 *  forever. Writing only on a real change makes the second pass a no-op. */
export function applyTheme(): CanonicalTheme {
    const domainId = domainIdForCoordinate(useCoordinateStore.getState().selected);
    const resolved = resolveSelection(useThemeStore.getState().selection, domainId, prefersDark());
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', resolved);
    }
    if (useThemeStore.getState().applied !== resolved) {
        useThemeStore.setState({ applied: resolved });
    }
    return resolved;
}

/**
 * Apply the theme now and keep it applied. Subscribes the three inputs that
 * can change the resolved value; returns a disposer that detaches all of them.
 */
export function installThemeApplier(): () => void {
    applyTheme();

    const unsubscribeTheme = useThemeStore.subscribe(() => applyTheme());
    const unsubscribeCoordinate = useCoordinateStore.subscribe(() => applyTheme());

    let detachMedia = (): void => {};
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (): void => {
            applyTheme();
        };
        media.addEventListener('change', onChange);
        detachMedia = () => media.removeEventListener('change', onChange);
    }

    return () => {
        unsubscribeTheme();
        unsubscribeCoordinate();
        detachMedia();
    };
}
