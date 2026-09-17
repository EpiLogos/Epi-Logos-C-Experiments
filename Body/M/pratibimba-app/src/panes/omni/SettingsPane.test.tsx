/**
 * Coordinate: M' `/` membrane (Settings fold proof — Track 32.T32.4)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the 32.4 verification line's rendering half — all six sections
 *   present, the WC-OB-21 scope shown per section, every live preference's
 *   value (or its shipped default, marked) rendered, and the two real write
 *   paths exercised. The load-bearing case is the kairos probe: enabling while
 *   kerykeion is ABSENT must leave the toggle off and say why, because a raw
 *   key write would claim the temporal ingress is live when it is not.
 * Does NOT own: the section law (settingsSections.test.ts), the preference
 *   register (preferences.test.ts), or the live-shell proof
 *   (tests/e2e/settings.spec.ts).
 * Contract: rerun tranche [[32.T32.4]].
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';

import { SettingsPane } from './SettingsPane';
import { useOmniPanelSessionStore } from './omnipanelSessionState';
import {
    EPI_LOGOS_PREFERENCES,
    SPECIFIED_PREFERENCES,
    PREFERENCE_KEYS
} from '../../ui/preferences';
import { SETTINGS_SECTIONS } from '../../ui/settingsSections';
import { useThemeStore } from '../../state/themeStore';
import type { KairosPreferenceAccess } from '../kairosEnablement';

function memoryPreferences(seed: Record<string, unknown> = {}): KairosPreferenceAccess {
    const store = new Map<string, unknown>(Object.entries(seed));
    return {
        get: key => (store.has(key) ? store.get(key) : null),
        set: (key, value) => void store.set(key, value),
        completedSteps: () => {
            const raw = store.get(PREFERENCE_KEYS.onboardingCompletedSteps);
            return Array.isArray(raw) ? (raw as string[]) : [];
        }
    };
}

afterEach(() => {
    cleanup();
    useOmniPanelSessionStore.getState().hydrate(null);
});

describe('32.T32.4 — the Settings fold', () => {
    it('renders all six sections, each declaring its scope', () => {
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);

        for (const section of SETTINGS_SECTIONS) {
            const node = screen.getByTestId(`settings-section-${section.id}`);
            expect(node.getAttribute('data-scope')).toBe(section.scope);
            expect(screen.getByTestId(`settings-scope-${section.id}`).textContent).toBe(
                section.scope
            );
            expect(within(node).getByText(section.label)).toBeTruthy();
        }
    });

    it('shows every live preference, falling back to its shipped default and saying so', () => {
        // nothing has been written yet — every row must show the DEFAULT and
        // mark it, rather than rendering blank as though the value were empty
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);

        for (const descriptor of EPI_LOGOS_PREFERENCES) {
            const row = screen.getByTestId(`settings-row-${descriptor.key}`);
            expect(row, `${descriptor.key} is not rendered`).toBeTruthy();
            if (row.getAttribute('data-control') !== 'read-only') continue;
            const value = within(row).getByTestId(`settings-value-${descriptor.key}`);
            expect(value.textContent).toContain('(default)');
        }
    });

    it('renders a stored value rather than the default once one exists', () => {
        render(
            <SettingsPane
                preferences={memoryPreferences({
                    [PREFERENCE_KEYS.onboardingCompletedSteps]: ['kairos.enable', 'walkthrough.done']
                })}
                execute={() => {}}
            />
        );
        const value = screen.getByTestId(
            `settings-value-${PREFERENCE_KEYS.onboardingCompletedSteps}`
        );
        expect(value.textContent).toContain('kairos.enable, walkthrough.done');
        expect(value.textContent).not.toContain('(default)');
    });

    it('names the real writer of every read-only value, so it does not read as broken', () => {
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);
        const layoutRow = screen.getByTestId(`settings-row-${PREFERENCE_KEYS.layoutActive}`);
        expect(layoutRow.textContent).toContain('Written by');
        expect(layoutRow.textContent).toContain('52.T3');
    });

    it('discloses every specified-but-not-live preference with the register’s own reason', () => {
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);

        for (const specified of SPECIFIED_PREFERENCES) {
            const row = screen.getByTestId(`settings-disclosure-${specified.key}`);
            expect(row.getAttribute('data-status')).toBe(specified.status);
            expect(row.textContent).toContain(specified.note);
            // a disclosure is NOT a control — it must offer nothing to click
            expect(row.querySelectorAll('button, input, select')).toHaveLength(0);
        }
    });

    it('writes the theme through the theme store, not a second storage path', () => {
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);
        const select = screen.getByTestId('settings-theme-select') as HTMLSelectElement;

        act(() => {
            select.value = 'light';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        expect(useThemeStore.getState().selection).toBe('light');
        act(() => useThemeStore.getState().setSelection('dark'));
    });

    it('enabling kairos while kerykeion is ABSENT leaves it off and says why', async () => {
        // the load-bearing case: a raw key write would report the temporal
        // ingress as live with no dependency behind it
        const preferences = memoryPreferences();
        const invoke = vi.fn(async () => ({
            dependency: 'kerykeion',
            available: false,
            pythonAvailable: true,
            version: null,
            reason: 'module not found'
        }));

        render(
            <SettingsPane preferences={preferences} invokeGatewayRpc={invoke} execute={() => {}} />
        );
        const toggle = screen.getByTestId('settings-kairos-toggle');
        expect(toggle.getAttribute('aria-pressed')).toBe('false');

        await act(async () => {
            toggle.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('settings-kairos-status').getAttribute('data-enabled')).toBe(
                'false'
            );
        });
        expect(invoke).toHaveBeenCalledWith('nara.kairos.probe_kerykeion', {});
        // and the preference really reads false, not merely the button
        expect(preferences.get(PREFERENCE_KEYS.privacyKairosEnabled)).toBe(false);
        expect(screen.getByTestId('settings-kairos-status').textContent).toContain('kerykeion');
    });

    it('enabling kairos with the dependency present turns it on through the probe path', async () => {
        const preferences = memoryPreferences();
        const invoke = vi.fn(async (method: string) =>
            method === 'nara.kairos.probe_kerykeion'
                ? {
                      dependency: 'kerykeion',
                      available: true,
                      pythonAvailable: true,
                      version: '4.11.0',
                      reason: null
                  }
                : {}
        );

        render(
            <SettingsPane preferences={preferences} invokeGatewayRpc={invoke} execute={() => {}} />
        );
        await act(async () => {
            screen.getByTestId('settings-kairos-toggle').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('settings-kairos-status').getAttribute('data-enabled')).toBe(
                'true'
            );
        });
        expect(preferences.get(PREFERENCE_KEYS.privacyKairosEnabled)).toBe(true);
        // the refresh really ran through the same seam
        expect(invoke).toHaveBeenCalledWith('nara.kairos.sync', {
            reason: 'kairos-enable-onboarding'
        });
    });

    it('fires the real command ids for its action affordances', () => {
        const fired: string[] = [];
        render(<SettingsPane preferences={memoryPreferences()} execute={id => fired.push(id)} />);

        screen.getByTestId('settings-action-identity.openWizard').click();
        screen.getByTestId('settings-action-epi-logos.help.openWalkthrough').click();

        expect(fired).toEqual(['identity.openWizard', 'epi-logos.help.openWalkthrough']);
    });

    it('the section nav narrows to one section and persists into the fold state', () => {
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);
        expect(screen.getAllByTestId(/^settings-section-/)).toHaveLength(6);

        act(() => screen.getByTestId('settings-nav-privacy').click());

        expect(useOmniPanelSessionStore.getState().session.perTabState.settings.activeSection).toBe(
            'privacy'
        );
        expect(screen.getAllByTestId(/^settings-section-/)).toHaveLength(1);
        expect(screen.getByTestId('settings-section-privacy')).toBeTruthy();

        act(() => screen.getByTestId('settings-nav-all').click());
        expect(screen.getAllByTestId(/^settings-section-/)).toHaveLength(6);
    });

    it('reports what the platform asks for instead of offering a reduced-motion override', () => {
        render(<SettingsPane preferences={memoryPreferences()} execute={() => {}} />);
        const report = screen.getByTestId('settings-reduced-motion');
        expect(report.textContent).toContain('offers no override');
        // and the declined key is disclosed beside it, not rendered as a switch
        const disclosure = screen.getByTestId('settings-disclosure-epi-logos.motion.reduced');
        expect(disclosure.getAttribute('data-status')).toBe('declined');
    });
});
