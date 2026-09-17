/**
 * Coordinate: M' shell (profile-tick visibility proof — Track 32.T32.9)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the 32.9 verification line as BEHAVIOUR — the preference toggle
 *   flips the status-bar entry, the first-tick transition fires against a real
 *   published profile stream, the 15.10 six-thread contract survives the hide,
 *   and the reading moves because the CLOCK advanced rather than because a
 *   component re-rendered.
 *
 *   THE RE-RENDER CONTROL IS THE POINT. A status entry that recomputes from
 *   local state on every render looks live while being stale, and every
 *   assertion about "the tick advanced" passes anyway. So the entry is driven
 *   three ways it must NOT respond to — an unrelated parent re-render, a stale
 *   generation the store refuses, and a repeated generation — and once it must.
 * Does NOT own: the clock (state/stores, state/useProfileTick), the grammar
 *   copy (ui/readinessGrammar), the thread declaration (ui/shellSlotPolicy).
 * Contract: rerun tranche [[32.T32.9]].
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

import { act, cleanup, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { SettingsPane } from '../panes/omni/SettingsPane';
import { StatusStrip } from '../components/StatusStrip';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';
import { useTickStore } from '../state/stores';
import { COMMAND_CATALOG } from '../commands/catalog';
import {
    FIRST_TICK_ANNOUNCEMENT,
    PROFILE_TICK_HISTORY_ROUTE,
    PROFILE_TICK_SEAMS,
    PROFILE_TICK_THREAD,
    PROFILE_TICK_VISIBLE_PREFERENCE,
    lastTickFiredIso,
    profileTickReadout,
    readProfileTickVisible,
    useProfileTickVisibilityStore
} from './profileTickVisibility';
import { EPI_LOGOS_PREFERENCES, SPECIFIED_PREFERENCES, preferenceDescriptor } from './preferences';
import { flavourEntry } from './readinessGrammar';
import { STATE_THREAD_COUNT, STATUS_STRIP_THREADS } from './shellSlotPolicy';
import { SETTINGS_SECTIONS, liveEntries } from './settingsSections';

const SRC_ROOT = resolve(__dirname, '..');

function frame(generation: number, cachedAtMs = generation * 1000) {
    return {
        generation,
        cachedAtMs,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'safe-public-current-kernel-tick',
        profile: { harmonicProfile: { tick12: generation % 12, degree720: generation * 30 } }
    };
}

function tickText(): string {
    return screen.getByTestId('status-tick').textContent ?? '';
}

/** A parent whose own state can be moved without touching the clock. */
function Harness() {
    const [nudge, setNudge] = useState(0);
    return (
        <>
            <button type="button" data-testid="nudge" onClick={() => setNudge(nudge + 1)}>
                {nudge}
            </button>
            <StatusStrip execute={() => undefined} focusDiagnosticsSubSection={() => undefined} />
        </>
    );
}

afterEach(() => {
    cleanup();
    resetProfileTicks();
    useProfileTickVisibilityStore.setState({ visible: true });
});

describe('32.T32.9 — the profile-tick reading', () => {
    it('borrows the 32.5 pre-tick copy rather than re-typing it, then reads tick:n gen:g', () => {
        expect(profileTickReadout({ observedTicks: 0, generation: null })).toMatchObject({
            kind: 'pre-tick',
            text: flavourEntry('pending_first_tick').copy,
            announcement: null
        });
        // the grammar's string really is the user-facing one (32.5 authored it
        // and nothing rendered it until now)
        expect(flavourEntry('pending_first_tick').copy).toBe('Awaiting first profile-tick…');

        expect(profileTickReadout({ observedTicks: 1, generation: 415 })).toMatchObject({
            kind: 'first-tick',
            text: 'tick:1 gen:415',
            announcement: FIRST_TICK_ANNOUNCEMENT,
            glyph: '✓'
        });
        expect(profileTickReadout({ observedTicks: 9, generation: 423 })).toMatchObject({
            kind: 'steady',
            text: 'tick:9 gen:423',
            announcement: null
        });
    });

    it('refuses to print a generation the bridge never sent', () => {
        // observedTicks without a generation cannot happen through the gate, but
        // a reading that printed `gen:null` would be claiming a frame anyway
        expect(profileTickReadout({ observedTicks: 3, generation: null }).kind).toBe('pre-tick');
        expect(profileTickReadout({ observedTicks: 0, generation: 12 }).kind).toBe('pre-tick');
    });

    it('shows the last-tick-fired ISO timestamp, and says nothing when none fired', () => {
        // a real cachedAtMs off the committed live-wire capture
        expect(lastTickFiredIso(1_785_466_575_536)).toBe('2026-07-31T02:56:15.536Z');
        expect(lastTickFiredIso(null)).toBeNull();
        expect(lastTickFiredIso(0)).toBeNull();
        expect(lastTickFiredIso(Number.NaN)).toBeNull();
    });
});

describe('32.T32.9 — the entry moves on a real tick, not on a re-render', () => {
    it('starts pre-tick, announces the birth of the clock once, then reads steadily', () => {
        render(<Harness />);
        expect(tickText()).toContain(flavourEntry('pending_first_tick').copy);
        expect(screen.getByTestId('status-tick').getAttribute('data-tick-state')).toBe('pre-tick');
        expect(screen.queryByTestId('status-tick-announcement')).toBeNull();

        act(() => {
            publishProfileTick(frame(415));
        });
        expect(screen.getByTestId('status-tick').getAttribute('data-tick-state')).toBe('first-tick');
        expect(screen.getByTestId('status-tick-announcement').textContent).toBe(
            FIRST_TICK_ANNOUNCEMENT
        );
        expect(tickText()).toContain('tick:1 gen:415');

        act(() => {
            publishProfileTick(frame(416));
        });
        expect(screen.getByTestId('status-tick').getAttribute('data-tick-state')).toBe('steady');
        expect(screen.queryByTestId('status-tick-announcement')).toBeNull();
        expect(tickText()).toContain('tick:2 gen:416');
    });

    it('does NOT advance on a re-render, a refused stale frame, or a repeated generation', () => {
        render(<Harness />);
        act(() => {
            publishProfileTick(frame(415));
        });
        expect(tickText()).toContain('tick:1 gen:415');

        // (a) a parent re-render — the entry re-renders and must read the same
        act(() => {
            screen.getByTestId('nudge').click();
        });
        expect(screen.getByTestId('nudge').textContent).toBe('1');
        expect(tickText()).toContain('tick:1 gen:415');

        // (b) a stale generation the store refuses — no rewind, no advance
        act(() => {
            publishProfileTick(frame(9));
        });
        expect(tickText()).toContain('tick:1 gen:415');

        // (c) the SAME generation arriving twice — one tick is one advance
        act(() => {
            publishProfileTick(frame(415, 999_000));
        });
        expect(tickText()).toContain('tick:1 gen:415');
        // and the cached frame was not replaced either, so the hover stays true
        expect(screen.getByTestId('status-tick').getAttribute('data-last-tick-fired')).toBe(
            lastTickFiredIso(415_000)
        );

        // (d) a real advance — and only now does the count move
        act(() => {
            publishProfileTick(frame(416));
        });
        expect(tickText()).toContain('tick:2 gen:416');
        expect(useTickStore.getState().observedTicks).toBe(2);
    });

    it('opens the Diagnostics fold ON the profile-tick history, not merely the tab', () => {
        const executed: string[] = [];
        const focused: (string | null)[] = [];
        render(
            <StatusStrip
                execute={id => executed.push(id)}
                focusDiagnosticsSubSection={section => focused.push(section)}
            />
        );
        act(() => {
            screen.getByTestId('status-tick-open-history').click();
        });

        expect(executed).toEqual([PROFILE_TICK_HISTORY_ROUTE.commandId]);
        // the sub-section is what makes it "focused on profile-tick history":
        // the command alone reopens whatever the session last persisted
        expect(focused).toEqual([PROFILE_TICK_HISTORY_ROUTE.subSection]);
    });

    it('routes through a command the catalog really declares', () => {
        // the frozen spec fires `omnipanel.openTab`, which this carrier has never
        // registered — a deep-link to an unregistered id would throw on click
        const ids = new Set(COMMAND_CATALOG.map(command => command.id));
        expect(ids.has(PROFILE_TICK_HISTORY_ROUTE.commandId)).toBe(true);
        expect(ids.has('omnipanel.openTab')).toBe(false);
    });
});

describe('32.T32.9 — visibility hides the entry and never the contract', () => {
    it('defaults ON, and only an explicit false hides', () => {
        expect(preferenceDescriptor(PROFILE_TICK_VISIBLE_PREFERENCE)?.defaultValue).toBe(true);
        expect(readProfileTickVisible(undefined)).toBe(true);
        expect(readProfileTickVisible(null)).toBe(true);
        expect(readProfileTickVisible('garbage')).toBe(true);
        expect(readProfileTickVisible(false)).toBe(false);
        expect(readProfileTickVisible('false')).toBe(false);
    });

    it('flips the rendered entry while the six-thread declaration stands', () => {
        render(<Harness />);
        act(() => {
            publishProfileTick(frame(415));
        });
        expect(screen.getByTestId('status-strip').children).toHaveLength(STATE_THREAD_COUNT);

        act(() => {
            useProfileTickVisibilityStore.getState().setVisible(false);
        });
        expect(screen.queryByTestId('status-tick')).toBeNull();
        expect(screen.getByTestId('status-strip').children).toHaveLength(STATE_THREAD_COUNT - 1);
        // 15.10 (spec :271): hidden is not removed — the contract still declares
        // six, and the hidden one is still one of them
        expect(STATUS_STRIP_THREADS).toHaveLength(6);
        expect(STATUS_STRIP_THREADS).toContain(PROFILE_TICK_THREAD);

        // the clock kept running while the entry was hidden
        act(() => {
            publishProfileTick(frame(416));
        });
        expect(useTickStore.getState().observedTicks).toBe(2);

        act(() => {
            useProfileTickVisibilityStore.getState().setVisible(true);
        });
        expect(tickText()).toContain('tick:2 gen:416');
        expect(screen.getByTestId('status-strip').children).toHaveLength(STATE_THREAD_COUNT);
    });

    it('carries its OWN control in the Motion row, not the other toggle', () => {
        // The regression class this repeats: `SettingsPane` once dispatched by
        // control KIND, which was safe only while each kind had exactly one
        // preference. This tranche gave `toggle` a SECOND one, so kind-dispatch
        // would now render the probe-gated KAIROS button in the Motion row — a
        // control that silently edits the wrong preference, and a click that
        // would fire a kerykeion probe.
        render(
            <SettingsPane
                preferences={{ get: () => null, set: () => undefined, completedSteps: () => [] }}
                invokeGatewayRpc={async () => {
                    throw new Error('no gateway call may originate from the Motion row');
                }}
                execute={() => undefined}
            />
        );
        const row = screen.getByTestId(`settings-row-${PROFILE_TICK_VISIBLE_PREFERENCE}`);
        expect(row.getAttribute('data-control')).toBe('toggle');
        expect(within(row).queryByTestId('settings-kairos-toggle')).toBeNull();
        expect(within(row).getByTestId('settings-profile-tick-visible')).toBeTruthy();

        act(() => {
            within(row).getByTestId('settings-profile-tick-visible').click();
        });
        expect(useProfileTickVisibilityStore.getState().visible).toBe(false);
        expect(
            screen.getByTestId('settings-profile-tick-status').getAttribute('data-visible')
        ).toBe('false');
    });

    it('is a LIVE preference with a home in the Motion section, no longer a pending disclosure', () => {
        expect(EPI_LOGOS_PREFERENCES.map(d => d.key)).toContain(PROFILE_TICK_VISIBLE_PREFERENCE);
        expect(SPECIFIED_PREFERENCES.map(p => p.key)).not.toContain(PROFILE_TICK_VISIBLE_PREFERENCE);

        const motion = SETTINGS_SECTIONS.find(section => section.id === 'motion');
        const entry = liveEntries(motion!).find(row => row.key === PROFILE_TICK_VISIBLE_PREFERENCE);
        expect(entry?.control).toBe('toggle');
    });
});

describe('32.T32.9 — the seam register is held against the real tree', () => {
    it('names the absent cold-start splash, and reds the day one lands', () => {
        expect(PROFILE_TICK_SEAMS.length).toBeGreaterThan(0);
        const files: string[] = [];
        const walk = (directory: string) => {
            for (const entry of readdirSync(directory, { withFileTypes: true })) {
                if (entry.name === 'node_modules' || entry.name === 'dist') continue;
                const path = join(directory, entry.name);
                if (entry.isDirectory()) walk(path);
                else if (extname(entry.name) === '.tsx') files.push(path);
            }
        };
        walk(SRC_ROOT);
        expect(files.length).toBeGreaterThan(50);

        // a cold-start SPLASH is a component that renders the six orchestrator
        // stages; the search is for a component whose name says so
        const splashComponents = files.filter(path =>
            /export\s+(default\s+)?function\s+ColdStart\w*Splash|export\s+const\s+ColdStart\w*Splash/.test(
                readFileSync(path, 'utf8')
            )
        );

        for (const seam of PROFILE_TICK_SEAMS) {
            expect(seam.reason.length).toBeGreaterThan(40);
            expect(seam.carriedBy.length).toBeGreaterThan(20);
            if (seam.name === 'cold-start-splash') {
                expect(
                    splashComponents,
                    'a cold-start splash landed — the first-tick transition belongs there now, ' +
                        'and this seam disclosure must be retired rather than left claiming it is absent'
                ).toEqual([]);
                expect(seam.available).toBe(false);
            }
        }
    });
});
