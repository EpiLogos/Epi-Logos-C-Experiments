/**
 * Coordinate: M' M4' (DayContainer detail behavioral gate — 25.T25.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pane half of 25.2 against a FAKE VAULT that has the real
 *   Present shape (`Empty/Present/{day}/{session}/now.md` + artifacts): opening
 *   a lived day reads that day's own tree, renders one block per session with
 *   only the chips those sessions declared, and routes an artifact row through
 *   the same `vault.open` command the grid uses. Also pins the read cap, so a
 *   heavy day degrades by dropping CHIPS with a visible note — never by
 *   dropping rows.
 * Does NOT own: the projection law (m4DayContainer.test.ts) or the calendar
 *   pivot itself (DayCalendarPane.test.tsx).
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';
import { DayCalendarPane, DAY_CONTAINER_FRONTMATTER_READ_CAP, loadDayContainer } from './DayCalendarPane';

const DAY = '07-11-2026';
const RICH = `20260711-090000-aaa`;
const BARE = `20260711-140000-bbb`;

const NOW_RICH = `---
session_id: "${RICH}"
day_id: "${DAY}"
c_3_tranche_mode: quiet:90m
c_3_response_orbit: next-morning
c_3_briefing_emitted: 2026-07-11T09:01:00Z
c_3_klein_weighting:
  prospective: 0.4
  retrospective: 0.6
---

# NOW

Body stays in the vault.
`;

const NOW_BARE = `---
session_id: "${BARE}"
day_id: "${DAY}"
---

# NOW
`;

/** A fake vault with the real Present shape. */
const TREE: Record<string, { name: string; path: string; isDir: boolean }[]> = {
    'Empty/Present': [{ name: DAY, path: `Empty/Present/${DAY}`, isDir: true }],
    [`Empty/Present/${DAY}`]: [
        { name: RICH, path: `Empty/Present/${DAY}/${RICH}`, isDir: true },
        { name: BARE, path: `Empty/Present/${DAY}/${BARE}`, isDir: true },
        { name: 'HANDOFF.md', path: `Empty/Present/${DAY}/HANDOFF.md`, isDir: false }
    ],
    [`Empty/Present/${DAY}/${RICH}`]: [
        { name: 'now.md', path: `Empty/Present/${DAY}/${RICH}/now.md`, isDir: false },
        { name: 'journal.md', path: `Empty/Present/${DAY}/${RICH}/journal.md`, isDir: false }
    ],
    [`Empty/Present/${DAY}/${BARE}`]: [
        { name: 'now.md', path: `Empty/Present/${DAY}/${BARE}/now.md`, isDir: false }
    ]
};

const FILES: Record<string, string> = {
    [`Empty/Present/${DAY}/${RICH}/now.md`]: NOW_RICH,
    [`Empty/Present/${DAY}/${BARE}/now.md`]: NOW_BARE,
    [`Empty/Present/${DAY}/${RICH}/journal.md`]:
        // A SENTINEL, not prose. The marker used to be the words "protected
        // body", which the handle-only privacy gloss legitimately contains
        // ("…never the protected body") — so the assertion below could fail on
        // correct chrome while a real body leak of different wording passed.
        // A marker that chrome copy can satisfy by accident is not a marker.
        '---\nc_4_artifact_role: journal\nt_4_kairos_context: "[[Kairos]]"\n---\n\nPROTECTED-BODY-SENTINEL-8f21\n',
    [`Empty/Present/${DAY}/HANDOFF.md`]: '---\nc_4_artifact_role: handoff\n---\n'
};

vi.mock('../bridge/tauri', () => ({
    invokeCommand: vi.fn(async (command: string, args?: Record<string, unknown>) => {
        const path = String(args?.path ?? '');
        if (command === 'vault_list') {
            return TREE[path] ?? [];
        }
        if (command === 'vault_read') {
            if (!(path in FILES)) {
                throw new Error(`no such file ${path}`);
            }
            return { content: FILES[path] };
        }
        throw new Error(`unexpected ${command}`);
    }),
    listenEvent: vi.fn(async () => () => undefined)
}));

describe('25.T25.2 — the DayContainer detail', () => {
    // Opening a day also opens its daily note (the grid's standing gesture), so
    // the command must exist in every case here — in the app it always does.
    let disposeOpen: (() => void) | null = null;
    beforeEach(() => {
        useSessionStore.setState({ dayNow: DAY });
        disposeOpen = commands.register({ id: 'vault.open', title: 'open', run: () => undefined });
    });
    afterEach(() => {
        cleanup();
        disposeOpen?.();
        disposeOpen = null;
        useSessionStore.setState({ dayNow: null });
    });

    it('opens a day into one block per session it actually held', async () => {
        render(<DayCalendarPane />);
        fireEvent.click(await screen.findByTestId(`cal-day-${DAY}`));

        const container = await screen.findByTestId('day-container');
        expect(container.getAttribute('data-day')).toBe(DAY);
        await waitFor(() => expect(container.getAttribute('data-session-count')).toBe('2'));
        expect(screen.getByTestId(`day-session-${RICH}`)).toBeTruthy();
        expect(screen.getByTestId(`day-session-${BARE}`)).toBeTruthy();
    });

    it('renders each chip ONLY for the session that declared it', async () => {
        render(<DayCalendarPane />);
        fireEvent.click(await screen.findByTestId(`cal-day-${DAY}`));

        expect(await screen.findByTestId(`day-tranche-${RICH}`)).toBeTruthy();
        expect(screen.getByTestId(`day-orbit-${RICH}`).textContent).toBe('next-morning');
        expect(screen.getByTestId(`day-briefing-${RICH}`).textContent).toBe('2026-07-11T09:01:00Z');
        expect(screen.getByTestId(`day-klein-${RICH}`)).toBeTruthy();
        // the bare session declared none of them — and wears none
        expect(screen.queryByTestId(`day-tranche-${BARE}`)).toBeNull();
        expect(screen.queryByTestId(`day-orbit-${BARE}`)).toBeNull();
        expect(screen.queryByTestId(`day-briefing-${BARE}`)).toBeNull();
        expect(screen.queryByTestId(`day-klein-${BARE}`)).toBeNull();
    });

    it('routes an artifact row through vault.open with that artifact’s own path', async () => {
        disposeOpen?.();
        const run = vi.fn();
        const dispose = commands.register({ id: 'vault.open', title: 'open', run });
        render(<DayCalendarPane />);
        fireEvent.click(await screen.findByTestId(`cal-day-${DAY}`));

        const row = await screen.findByTestId('day-artifact-journal.md');
        expect(row.getAttribute('data-kind')).toBe('journal');
        expect(screen.getByTestId('day-artifact-kairos-journal.md').textContent).toBe('[[Kairos]]');
        fireEvent.click(row);
        await waitFor(() =>
            expect(run).toHaveBeenCalledWith(`Empty/Present/${DAY}/${RICH}/journal.md`)
        );
        dispose();
        disposeOpen = commands.register({ id: 'vault.open', title: 'open', run: () => undefined });
    });

    it('never renders an artifact BODY — handles and roles only', async () => {
        const { container } = render(<DayCalendarPane />);
        fireEvent.click(await screen.findByTestId(`cal-day-${DAY}`));
        await screen.findByTestId('day-artifact-journal.md');
        expect(container.innerHTML).not.toContain('PROTECTED-BODY-SENTINEL-8f21');
        expect(container.innerHTML).not.toContain('Body stays in the vault');
        // The container wears its own, stricter tint (25.21): handle-only
        // inside a protected-local pane. Pinned here so the two cannot be
        // silently collapsed back to one class.
        expect(screen.getByTestId('day-container').getAttribute('class')).toContain(
            'mext-privacy-protected-local-handle-only'
        );
        expect(screen.getByTestId('day-container').getAttribute('data-protected-bodies-rendered')).toBe(
            'false'
        );
    });

    it('keeps day-root files as day artifacts', async () => {
        render(<DayCalendarPane />);
        fireEvent.click(await screen.findByTestId(`cal-day-${DAY}`));
        const dayArtifacts = await screen.findByTestId('day-container-day-artifacts');
        expect(dayArtifacts.textContent).toContain('HANDOFF.md');
    });

    it('degrades by dropping CHIPS, not rows, past the read cap — and says so', async () => {
        const many = Array.from({ length: DAY_CONTAINER_FRONTMATTER_READ_CAP + 5 }, (_, i) => ({
            name: `a${i}.md`,
            path: `Empty/Present/${DAY}/${RICH}/a${i}.md`,
            isDir: false
        }));
        const { container, capped } = await loadDayContainer(
            DAY,
            async path =>
                path === `Empty/Present/${DAY}`
                    ? [{ name: RICH, path: `Empty/Present/${DAY}/${RICH}`, isDir: true }]
                    : many,
            async () => ({ content: '---\nc_4_artifact_role: journal\n---\n' })
        );
        expect(capped).toBe(true);
        // every row is present…
        expect(container.sessions[0].artifacts).toHaveLength(many.length);
        // …and the ones past the cap are simply unclassified rather than missing
        expect(container.sessions[0].artifacts.at(-1)?.kind).toBe('unclassified');
        expect(container.sessions[0].artifacts[0].kind).toBe('journal');
    });
});
