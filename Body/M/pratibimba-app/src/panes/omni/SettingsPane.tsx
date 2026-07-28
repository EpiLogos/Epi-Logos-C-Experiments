/**
 * Coordinate: M' `/` membrane (the Settings fold — Track 32.T32.4)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): #4 — Context/Type (the surface a persisted frame is read and
 *   changed in)
 * Actualises: Tranche 32.4's settings surface as a FOLD, per 15.2 "the tab IS
 *   the landing surface" and the CCT-8 no-modal law — Theia's "Preferences →
 *   Open Settings (UI)" menu path is dead plumbing, and a settings dialog that
 *   seized the shell would be exactly the blocking layer the carrier lints
 *   against. Six sections from `ui/settingsSections.ts`, each rendering its
 *   LIVE preferences as working controls and its SPECIFIED-but-not-live ones as
 *   honest disclosure rows carrying the register's own reason.
 *
 *   Every write goes through the seam that already owned it: the theme select
 *   goes to `useThemeStore.setSelection`, and the kairos toggle goes to
 *   `runKairosEnable` / `runKairosSkip` — NEVER a raw write of
 *   `epi-logos.privacy.kairos-enabled`, because enabling is probe-gated and a
 *   direct write would claim the temporal ingress is live while kerykeion is
 *   absent. Read-only rows name who does write them, so a value that cannot be
 *   changed here does not read as merely broken.
 * Public surface: SettingsPane.
 * Does NOT own: the section law (`ui/settingsSections.ts`), the preference
 *   register (`ui/preferences.ts`), any storage path, the layout switch (52.T3),
 *   the walkthrough (32.T32.3) or the identity wizard (25.T25.4) — it fires
 *   their commands and renders nothing of theirs.
 * Contract: [[CHROME-CONTRACT]] §2 row `omniSettings` · rerun tranche [[32.T32.4]].
 */

import { useMemo, useState } from 'react';

import { gateway } from '../../bridge/gatewayHolder';
import { commands } from '../../commands/registry';
import {
    KAIROS_ENABLED_PREFERENCE,
    browserKairosPreferences,
    readKairosEnabled,
    runKairosEnable,
    runKairosSkip,
    type KairosEnableResult,
    type KairosPreferenceAccess
} from '../kairosEnablement';
import { SPECIFIED_PREFERENCES, preferenceDescriptor } from '../../ui/preferences';
import {
    SETTINGS_SECTIONS,
    disclosedEntries,
    liveEntries,
    type DisclosedSettingsEntry,
    type LiveSettingsEntry,
    type SettingsAction,
    type SettingsSection
} from '../../ui/settingsSections';
import { THEME_SELECTIONS, type ThemeSelection } from '../../ui/themeMapping';
import { useThemeStore } from '../../state/themeStore';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';

export interface SettingsPaneProps {
    /** Injected in tests; the browser binding over localStorage otherwise. */
    readonly preferences?: KairosPreferenceAccess;
    /** Injected in tests; the live gateway otherwise. */
    readonly invokeGatewayRpc?: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<unknown>;
    /** Injected in tests; the one command registry otherwise. */
    readonly execute?: (id: string) => void;
}

/** Renders a stored value as text without pretending an absent one is empty:
 *  a preference nothing has written yet shows its shipped default, marked. */
function storedDisplay(
    value: unknown,
    defaultValue: string | boolean | readonly string[]
): { readonly text: string; readonly isDefault: boolean } {
    const present = value !== null && value !== undefined;
    const shown = present ? value : defaultValue;
    if (Array.isArray(shown)) {
        return {
            text: shown.length === 0 ? 'none recorded' : shown.join(', '),
            isDefault: !present
        };
    }
    return { text: String(shown), isDefault: !present };
}

function DisclosureRow({ entry }: { readonly entry: DisclosedSettingsEntry }) {
    // the reason is READ from the register, never restated here
    const note = SPECIFIED_PREFERENCES.find(p => p.key === entry.key)?.note ?? '';
    return (
        <li
            className="settings-row settings-row-disclosed"
            data-testid={`settings-disclosure-${entry.key}`}
            data-status={entry.status}
        >
            <span className="settings-row-key">{entry.key}</span>
            <span className="settings-row-status">{entry.status}</span>
            <span className="settings-row-note">{note}</span>
        </li>
    );
}

function ThemeControl() {
    const selection = useThemeStore(state => state.selection);
    const setSelection = useThemeStore(state => state.setSelection);
    return (
        <select
            data-testid="settings-theme-select"
            aria-label="Theme"
            value={selection}
            onChange={event => setSelection(event.target.value as ThemeSelection)}
        >
            {THEME_SELECTIONS.map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}

function KairosControl(props: {
    readonly preferences: KairosPreferenceAccess;
    readonly invokeGatewayRpc: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<unknown>;
}) {
    const [enabled, setEnabled] = useState(() =>
        readKairosEnabled(props.preferences.get(KAIROS_ENABLED_PREFERENCE))
    );
    const [busy, setBusy] = useState(false);
    const [outcome, setOutcome] = useState<KairosEnableResult | 'skipped' | null>(null);

    const toggle = () => {
        if (enabled) {
            runKairosSkip(props.preferences);
            setEnabled(false);
            setOutcome('skipped');
            return;
        }
        setBusy(true);
        void runKairosEnable({
            preferences: props.preferences,
            invokeGatewayRpc: props.invokeGatewayRpc
        })
            .then(result => {
                setOutcome(result);
                // `unavailable` leaves it OFF — the probe, not the click,
                // decides whether the ingress is live
                setEnabled(result.outcome === 'enabled' || result.outcome === 'refresh-failed');
            })
            .finally(() => setBusy(false));
    };

    const message =
        outcome === 'skipped'
            ? 'Kairos disabled.'
            : outcome && outcome.outcome !== 'enabled'
              ? outcome.message
              : outcome?.outcome === 'enabled'
                ? `Kairos active — refreshed ${outcome.refreshedAt}`
                : enabled
                  ? 'Kairos enabled.'
                  : 'Kairos is off. Enabling probes for kerykeion first.';

    return (
        <>
            <button
                type="button"
                data-testid="settings-kairos-toggle"
                aria-pressed={enabled}
                disabled={busy}
                onClick={toggle}
            >
                {enabled ? 'Disable kairos' : 'Enable kairos'}
            </button>
            <span
                className="settings-row-status"
                data-testid="settings-kairos-status"
                data-enabled={enabled}
                role="status"
                aria-live="polite"
            >
                {message}
            </span>
        </>
    );
}

function LiveRow(props: {
    readonly entry: LiveSettingsEntry;
    readonly preferences: KairosPreferenceAccess;
    readonly invokeGatewayRpc: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<unknown>;
}) {
    const descriptor = preferenceDescriptor(props.entry.key);
    if (!descriptor) {
        // unreachable: settingsSections throws at load if a live key is unknown
        return null;
    }
    const stored = storedDisplay(props.preferences.get(props.entry.key), descriptor.defaultValue);

    return (
        <li
            className="settings-row settings-row-live"
            data-testid={`settings-row-${props.entry.key}`}
            data-control={props.entry.control}
        >
            <span className="settings-row-key">{props.entry.key}</span>
            <span className="settings-row-control">
                {props.entry.control === 'select' ? <ThemeControl /> : null}
                {props.entry.control === 'toggle' ? (
                    <KairosControl
                        preferences={props.preferences}
                        invokeGatewayRpc={props.invokeGatewayRpc}
                    />
                ) : null}
                {props.entry.control === 'read-only' ? (
                    <span data-testid={`settings-value-${props.entry.key}`}>
                        {stored.text}
                        {stored.isDefault ? <em className="settings-row-default"> (default)</em> : null}
                    </span>
                ) : null}
            </span>
            <span className="settings-row-note">{descriptor.description}</span>
            {props.entry.control === 'read-only' ? (
                <span className="settings-row-writer">Written by {props.entry.writePath}.</span>
            ) : null}
        </li>
    );
}

function ActionButton(props: {
    readonly action: SettingsAction;
    readonly execute: (id: string) => void;
}) {
    return (
        <button
            type="button"
            className="settings-action"
            data-testid={`settings-action-${props.action.commandId}`}
            title={props.action.description}
            onClick={() => props.execute(props.action.commandId)}
        >
            {props.action.label}
        </button>
    );
}

/** The Motion section's honest centre: reduced motion is DECLINED as a carrier
 *  preference (a local override could contradict the platform accessibility
 *  setting), so the section reports what the OS is actually asking for. */
function ReducedMotionReport() {
    const reduced =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;
    return (
        <p
            className="settings-os-report"
            data-testid="settings-reduced-motion"
            data-reduced={reduced}
        >
            Your system currently asks for {reduced ? 'reduced motion' : 'full motion'}. The carrier
            follows it and offers no override.
        </p>
    );
}

function Section(props: {
    readonly section: SettingsSection;
    readonly preferences: KairosPreferenceAccess;
    readonly invokeGatewayRpc: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<unknown>;
    readonly execute: (id: string) => void;
}) {
    const { section } = props;
    return (
        <section
            className="settings-section"
            data-testid={`settings-section-${section.id}`}
            data-scope={section.scope}
            aria-labelledby={`settings-heading-${section.id}`}
        >
            <header className="settings-section-header">
                <h3 id={`settings-heading-${section.id}`}>{section.label}</h3>
                <span className="settings-scope-chip" data-testid={`settings-scope-${section.id}`}>
                    {section.scope}
                </span>
            </header>
            <p className="settings-purpose">{section.purpose}</p>

            {section.id === 'motion' ? <ReducedMotionReport /> : null}

            <ul className="settings-rows">
                {liveEntries(section).map(entry => (
                    <LiveRow
                        key={entry.key}
                        entry={entry}
                        preferences={props.preferences}
                        invokeGatewayRpc={props.invokeGatewayRpc}
                    />
                ))}
                {disclosedEntries(section).map(entry => (
                    <DisclosureRow key={entry.key} entry={entry} />
                ))}
            </ul>

            {section.actions.length > 0 ? (
                <footer className="settings-section-actions">
                    {section.actions.map(action => (
                        <ActionButton
                            key={action.commandId}
                            action={action}
                            execute={props.execute}
                        />
                    ))}
                </footer>
            ) : null}
        </section>
    );
}

export function SettingsPane(props: SettingsPaneProps = {}) {
    // `null` is the default view — all six at once. Reading one section alone
    // is a real need in a 380px border fold, and it persists with the rest of
    // the fold state rather than being local view state that dies on a
    // face toggle.
    const tab = useOmniPanelTabState('settings');
    const patchTab = useOmniPanelSessionStore(state => state.patchTab);
    const shown = tab.activeSection
        ? SETTINGS_SECTIONS.filter(section => section.id === tab.activeSection)
        : SETTINGS_SECTIONS;

    const preferences = useMemo(
        () => props.preferences ?? browserKairosPreferences(localStorage),
        [props.preferences]
    );
    const invokeGatewayRpc = useMemo(
        () =>
            props.invokeGatewayRpc
            ?? (async (method: string, params: Record<string, unknown>) =>
                (await gateway().invoke(method, params)).artifact),
        [props.invokeGatewayRpc]
    );
    const execute = props.execute ?? ((id: string) => void commands.execute(id));

    return (
        <section className="settings-pane" data-testid="settings-pane">
            <header className="settings-pane-header">
                <strong>Settings</strong>
                <span>
                    Six sections over the one preference register. A row marked pending, superseded
                    or declined is not a control — it is what the carrier has decided about that
                    setting, and why.
                </span>
            </header>

            <nav className="settings-section-nav" role="group" aria-label="settings section">
                <button
                    type="button"
                    data-testid="settings-nav-all"
                    aria-pressed={tab.activeSection === null}
                    onClick={() => patchTab('settings', { activeSection: null })}
                >
                    All
                </button>
                {SETTINGS_SECTIONS.map(section => (
                    <button
                        key={section.id}
                        type="button"
                        data-testid={`settings-nav-${section.id}`}
                        aria-pressed={tab.activeSection === section.id}
                        onClick={() => patchTab('settings', { activeSection: section.id })}
                    >
                        {section.label}
                    </button>
                ))}
            </nav>

            {shown.map(section => (
                <Section
                    key={section.id}
                    section={section}
                    preferences={preferences}
                    invokeGatewayRpc={invokeGatewayRpc}
                    execute={execute}
                />
            ))}
        </section>
    );
}
