/**
 * Coordinate: M' shell-0 (theme applier test — 30.T30.4)
 * Residency: Body/M/pratibimba-app/src/state/themeStore.test.ts
 * Actualises: proof that the theme SIGNAL fires — the resolver being correct
 *   (themeMapping.test.ts) says nothing about whether anything applies it.
 *   These assert the applier writes the resolved canonical theme to the real
 *   document root and re-writes it when any of its three inputs move
 *   (selection, coordinate-domain, prefers-color-scheme).
 * Does NOT own: the resolution law (ui/themeMapping.ts) or the surface CSS.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    applyTheme,
    installThemeApplier,
    readStoredThemeSelection,
    THEME_PREFERENCE_KEY,
    useThemeStore
} from './themeStore';
import { useCoordinateStore } from './stores';

let dispose: (() => void) | null = null;

function appliedTheme(): string | null {
    return document.documentElement.getAttribute('data-theme');
}

beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    useThemeStore.setState({ selection: 'dark' });
    useCoordinateStore.getState().setSelected(null);
});

afterEach(() => {
    dispose?.();
    dispose = null;
});

describe('30.T30.4 — the theme signal reaches the document', () => {
    it('writes the resolved canonical theme to the root element on install', () => {
        expect(appliedTheme()).toBeNull();
        dispose = installThemeApplier();
        expect(appliedTheme()).toBe('dark');
    });

    it('re-applies when the selection changes', () => {
        dispose = installThemeApplier();
        useThemeStore.getState().setSelection('light');
        expect(appliedTheme()).toBe('light');
        useThemeStore.getState().setSelection('glass');
        expect(appliedTheme()).toBe('glass');
    });

    it('applies the CANONICAL theme, not the raw selection — legacy aliases collapse', () => {
        dispose = installThemeApplier();
        useThemeStore.getState().setSelection('nara-forest');
        // nara-forest → nara-dark, then degraded off m4 → dark
        expect(appliedTheme()).toBe('dark');
    });

    it('re-applies when the active coordinate moves the domain — the nara degradation is live', () => {
        dispose = installThemeApplier();
        useThemeStore.getState().setSelection('nara-light');

        useCoordinateStore.getState().setSelected('M2-1');
        expect(appliedTheme()).toBe('light'); // off m4: degraded to base

        useCoordinateStore.getState().setSelected('M4-3');
        expect(appliedTheme()).toBe('nara-light'); // on m4: kept

        useCoordinateStore.getState().setSelected('S3');
        expect(appliedTheme()).toBe('light'); // shell chrome: degraded again
    });

    it('stops applying once disposed', () => {
        dispose = installThemeApplier();
        dispose();
        dispose = null;
        useThemeStore.getState().setSelection('light');
        expect(appliedTheme()).toBe('dark');
    });

    it('applyTheme returns what it wrote', () => {
        useThemeStore.setState({ selection: 'discause' });
        expect(applyTheme()).toBe('discause');
        expect(appliedTheme()).toBe('discause');
    });

    it('publishes the applied theme as STORE state, not just a DOM attribute', () => {
        // Regression, caught by tests/e2e/theme-mapping.spec.ts: a component
        // that read `document.documentElement.dataset.theme` during render
        // never re-rendered on a theme change (nothing it subscribed to moved),
        // so its tint went stale. The applied theme must be reactive state.
        dispose = installThemeApplier();
        expect(useThemeStore.getState().applied).toBe('dark');

        useThemeStore.getState().setSelection('nara-light');
        expect(useThemeStore.getState().applied).toBe('light'); // off m4

        useCoordinateStore.getState().setSelected('M4-3');
        expect(useThemeStore.getState().applied).toBe('nara-light'); // domain moved it
    });

    it('does not re-enter forever: the applier subscribes to the store it writes', () => {
        dispose = installThemeApplier();
        let applications = 0;
        const unsubscribe = useThemeStore.subscribe(() => {
            applications += 1;
            if (applications > 50) throw new Error('applyTheme re-entered without converging');
        });
        useThemeStore.getState().setSelection('light');
        unsubscribe();
        // one write for the selection, one for the resolved `applied` — then quiet
        expect(applications).toBeLessThanOrEqual(2);
        expect(useThemeStore.getState().applied).toBe('light');
    });
});

describe('30.T30.4 — the selection persists', () => {
    it('writes the selection to localStorage and reads it back', () => {
        useThemeStore.getState().setSelection('nara-glass');
        expect(localStorage.getItem(THEME_PREFERENCE_KEY)).toBe('nara-glass');
        expect(readStoredThemeSelection()).toBe('nara-glass');
    });

    it('falls back to dark for an absent or stale stored value', () => {
        expect(readStoredThemeSelection()).toBe('dark');
        localStorage.setItem(THEME_PREFERENCE_KEY, 'nara-taupe');
        expect(readStoredThemeSelection()).toBe('dark');
    });

    it('survives a storage that throws', () => {
        const hostile = {
            getItem() {
                throw new Error('storage blocked');
            }
        };
        expect(readStoredThemeSelection(hostile)).toBe('dark');
    });
});
