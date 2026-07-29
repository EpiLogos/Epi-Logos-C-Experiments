/**
 * Coordinate: M' M4' (day-calendar navigation face — Tranche 25.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the 4-5-0 personal-pole day-navigation face per DR-FACE-7 §3
 *   (25.1 = fate B). The design-recon asked for a Theia `ReactWidget` that OWNS
 *   the day-now write; the carrier's day-now is a spine thread the session store
 *   owns and App.tsx writes (boot adoption + `journal.beginToday`). So this face
 *   READS the day-now thread and never owns it: navigating (prev/next month) is
 *   a local view selection, not a day-now mutation. It lays the real Present
 *   day-tree (`Idea/Empty/Present/{day_id}/`, DR-M4-1) into a 7-column weekday
 *   grid — the calendar pivot the linear `JournalTimelinePane` list does not
 *   give — highlighting the day-now anchor and marking the days that have a
 *   folder. Sibling of JournalTimelinePane / NowPane; opens a day's canonical
 *   daily-note via the existing `vault.open` command.
 *
 *   25.T25.2 adds the DAYCONTAINER DETAIL beneath the grid: selecting a lived
 *   day reads that day's real Present tree and lays out its sessions — each
 *   with the chips its own NOW frontmatter declares (Klein weighting, briefing
 *   emitted, tranche mode, response orbit) and its artifact rows, each row
 *   opening through the same `vault.open` the grid uses. The brief extends a
 *   frozen `M4NaraWidget` over a `daySummary.nowLineage` object; the carrier's
 *   lineage IS the tree, so it is read from there (m4DayContainer.ts).
 * Does NOT own: the day-now thread (session store, written by App.tsx), the
 *   vault read (Tauri `vault_list`), the markdown editor the open routes into,
 *   or the DayContainer projection law (m4DayContainer.ts).
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';
import { VaultEntry } from './FileTreePane';
import {
    buildDayContainer,
    type DayTreeEntry,
    type M4DayArtifact,
    type M4DayContainer,
    type M4DaySession
} from './m4DayContainer';

const PRESENT = 'Empty/Present';
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** A parsed Present day-id. `month` is 1-12. */
export interface ParsedDayId {
    readonly id: string;
    readonly year: number;
    readonly month: number;
    readonly day: number;
}

/**
 * Parse a Present day-folder name into a date. Canonical is month-first
 * `MM-DD-YYYY` (App.tsx todayId); legacy June-era folders are day-first
 * `DD-MM-YYYY` and are still adopted. Disambiguate honestly: month-first unless
 * the first field cannot be a month (>12) and the second can — then day-first.
 * Returns null for anything that is not a valid calendar date.
 */
export function parseDayId(id: string): ParsedDayId | null {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(id);
    if (!match) {
        return null;
    }
    const first = Number(match[1]);
    const second = Number(match[2]);
    const year = Number(match[3]);
    let month = first;
    let day = second;
    if (first > 12 && second <= 12) {
        // legacy DD-MM-YYYY (first field is not a valid month)
        month = second;
        day = first;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    return { id, year, month, day };
}

/**
 * Build the weekday grid for a month (month 1-12): rows of 7 cells, Sunday-first,
 * `null` for the leading/trailing days outside the month.
 */
export function monthGrid(year: number, month: number): (number | null)[][] {
    const startWeekday = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i += 1) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
        cells.push(d);
    }
    while (cells.length % 7 !== 0) {
        cells.push(null);
    }
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

function initialView(dayNow: string | null): { year: number; month: number } {
    const anchor = dayNow ? parseDayId(dayNow) : null;
    if (anchor) {
        return { year: anchor.year, month: anchor.month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** 25.T25.2: bound the per-day frontmatter reads. A day with more artifacts
 *  than this still lists every row — only the frontmatter chips stop being read,
 *  and the surface says so rather than quietly showing fewer chips. */
export const DAY_CONTAINER_FRONTMATTER_READ_CAP = 40;

/**
 * Read one lived day's real Present tree into a DayContainer: the session dirs,
 * each session's now.md (the chip source), and the artifact frontmatter up to
 * the read cap. Exported so the projection can be proven against a fake vault
 * without mounting the calendar.
 */
export async function loadDayContainer(
    dayId: string,
    list: (path: string) => Promise<VaultEntry[]>,
    read: (path: string) => Promise<{ content: string }>,
    cap: number = DAY_CONTAINER_FRONTMATTER_READ_CAP
): Promise<{ container: M4DayContainer; capped: boolean }> {
    const dayPath = `${PRESENT}/${dayId}`;
    const dayEntries = await list(dayPath);
    let budget = cap;
    const readIfBudget = async (path: string): Promise<unknown> => {
        if (budget <= 0) {
            return null;
        }
        budget -= 1;
        try {
            return (await read(path)).content;
        } catch {
            // An unreadable artifact is a row without chips, never a missing row.
            return null;
        }
    };

    const sessions = [];
    for (const entry of dayEntries.filter(e => e.isDir)) {
        const sessionEntries = (await list(entry.path)) as DayTreeEntry[];
        const now = sessionEntries.find(child => child.name === 'now.md');
        const contentByPath: Record<string, unknown> = {};
        for (const child of sessionEntries.filter(c => !c.isDir && c.name !== 'now.md')) {
            contentByPath[child.path] = await readIfBudget(child.path);
        }
        sessions.push({
            sessionKey: entry.name,
            nowPath: now?.path ?? `${entry.path}/now.md`,
            nowContent: now ? await readIfBudget(now.path) : null,
            entries: sessionEntries,
            contentByPath
        });
    }

    const dayContentByPath: Record<string, unknown> = {};
    for (const entry of dayEntries.filter(e => !e.isDir)) {
        dayContentByPath[entry.path] = await readIfBudget(entry.path);
    }

    return {
        container: buildDayContainer(dayId, sessions, dayEntries as DayTreeEntry[], dayContentByPath),
        capped: budget <= 0
    };
}

function ArtifactRow({ artifact }: { readonly artifact: M4DayArtifact }) {
    return (
        <li className="day-container-artifact">
            <button
                type="button"
                data-testid={`day-artifact-${artifact.name}`}
                data-kind={artifact.kind}
                data-provenance={artifact.provenanceHandle}
                title={artifact.path}
                onClick={() => void commands.execute('vault.open', artifact.path)}
            >
                <span className="day-container-artifact-kind">{artifact.kind}</span>
                <span className="day-container-artifact-name">{artifact.name}</span>
                {artifact.role ? (
                    <span className="day-container-chip" data-testid={`day-artifact-role-${artifact.name}`}>
                        {artifact.role}
                    </span>
                ) : null}
                {artifact.kairosContext ? (
                    <span className="day-container-chip" data-testid={`day-artifact-kairos-${artifact.name}`}>
                        {artifact.kairosContext}
                    </span>
                ) : null}
            </button>
        </li>
    );
}

function SessionBlock({ session }: { readonly session: M4DaySession }) {
    const { chips } = session;
    return (
        <li className="day-container-session" data-testid={`day-session-${session.sessionKey}`}>
            <div className="day-container-session-header">
                <span className="day-container-session-key">{session.sessionKey}</span>
                {/* Every chip renders ONLY when its own key was declared. */}
                {chips.kleinWeighting.state === 'resolved' ? (
                    <span
                        className="day-container-klein"
                        data-testid={`day-klein-${session.sessionKey}`}
                        title={chips.kleinWeighting.label}
                    >
                        <span
                            className="day-container-klein-prospective"
                            style={{ flexGrow: chips.kleinWeighting.prospective ?? 0 }}
                        />
                        <span
                            className="day-container-klein-retrospective"
                            style={{ flexGrow: chips.kleinWeighting.retrospective ?? 0 }}
                        />
                    </span>
                ) : null}
                {chips.briefingEmitted ? (
                    <span className="day-container-chip" data-testid={`day-briefing-${session.sessionKey}`}>
                        {chips.briefingEmitted}
                    </span>
                ) : null}
                {chips.trancheMode ? (
                    <span className="day-container-chip" data-testid={`day-tranche-${session.sessionKey}`}>
                        {chips.trancheMode}
                    </span>
                ) : null}
                {chips.responseOrbit ? (
                    <span className="day-container-chip" data-testid={`day-orbit-${session.sessionKey}`}>
                        {chips.responseOrbit}
                    </span>
                ) : null}
            </div>
            {session.artifacts.length > 0 ? (
                <ul className="day-container-artifacts">
                    {session.artifacts.map(artifact => (
                        <ArtifactRow key={artifact.path} artifact={artifact} />
                    ))}
                </ul>
            ) : (
                <p className="pane-message">no artifacts in this session</p>
            )}
        </li>
    );
}

export function DayCalendarPane() {
    const dayNow = useSessionStore(s => s.dayNow);
    const [folders, setFolders] = useState<ParsedDayId[] | null>(null);
    const [view, setView] = useState(() => initialView(dayNow));
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [container, setContainer] = useState<M4DayContainer | null>(null);
    const [containerCapped, setContainerCapped] = useState(false);
    const [containerError, setContainerError] = useState<string | null>(null);

    const load = useCallback(() => {
        invokeCommand<VaultEntry[]>('vault_list', { path: PRESENT })
            .then(entries =>
                setFolders(
                    entries
                        .filter(e => e.isDir)
                        .map(e => parseDayId(e.name))
                        .filter((d): d is ParsedDayId => d !== null)
                )
            )
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, []);

    useEffect(() => {
        load();
        let unlisten: (() => void) | undefined;
        void listenEvent<string[]>('vault://changed', paths => {
            if (paths.some(p => p.startsWith(PRESENT))) {
                load();
            }
        }).then(u => {
            unlisten = u;
        });
        return () => unlisten?.();
    }, [load]);

    // day → folder day-id for the viewed month (the days that were actually lived)
    const foldersByDay = useMemo(() => {
        const map = new Map<number, string>();
        for (const f of folders ?? []) {
            if (f.year === view.year && f.month === view.month) {
                map.set(f.day, f.id);
            }
        }
        return map;
    }, [folders, view.year, view.month]);

    const weeks = useMemo(() => monthGrid(view.year, view.month), [view.year, view.month]);

    // 25.T25.2 — the selected day's own container. Selecting is a LOCAL read;
    // it never writes the day-now thread (25.1's standing law).
    useEffect(() => {
        if (!selectedDay) {
            return;
        }
        let disposed = false;
        setContainerError(null);
        loadDayContainer(
            selectedDay,
            path => invokeCommand<VaultEntry[]>('vault_list', { path }),
            path => invokeCommand<{ content: string }>('vault_read', { path })
        )
            .then(({ container: loaded, capped }) => {
                if (disposed) {
                    return;
                }
                setContainer(loaded);
                setContainerCapped(capped);
            })
            .catch(err => {
                if (!disposed) {
                    setContainer(null);
                    setContainerError(err instanceof Error ? err.message : String(err));
                }
            });
        return () => {
            disposed = true;
        };
    }, [selectedDay]);

    const step = (delta: number) => {
        setView(prev => {
            const zero = prev.month - 1 + delta;
            return { year: prev.year + Math.floor(zero / 12), month: ((zero % 12) + 12) % 12 + 1 };
        });
    };

    if (error) {
        return <div className="pane-message">calendar unavailable: {error}</div>;
    }
    return (
        <div className={`day-calendar ${privacyChrome('protected_local').className}`}
            title={privacyChrome('protected_local').title} data-testid="day-calendar">
            <div className="pane-toolbar day-calendar-nav">
                <button type="button" data-testid="cal-prev" onClick={() => step(-1)} title="previous month">
                    ‹
                </button>
                <span className="day-calendar-month" data-testid="cal-month">
                    {MONTH_NAMES[view.month - 1]} {view.year}
                </span>
                <button type="button" data-testid="cal-next" onClick={() => step(1)} title="next month">
                    ›
                </button>
            </div>
            <div className="day-calendar-grid" data-testid="cal-grid" role="grid">
                <div className="day-calendar-weekdays" role="row">
                    {WEEKDAY_LABELS.map(label => (
                        <span key={label} className="day-calendar-weekday" role="columnheader">
                            {label}
                        </span>
                    ))}
                </div>
                {weeks.map((week, wi) => (
                    <div key={wi} className="day-calendar-week" role="row">
                        {week.map((d, di) => {
                            if (d === null) {
                                return <span key={di} className="day-calendar-cell day-calendar-blank" />;
                            }
                            const folderId = foldersByDay.get(d);
                            if (!folderId) {
                                return (
                                    <span
                                        key={di}
                                        className="day-calendar-cell day-calendar-empty"
                                        role="gridcell"
                                    >
                                        {d}
                                    </span>
                                );
                            }
                            const isNow = folderId === dayNow;
                            return (
                                <button
                                    key={di}
                                    type="button"
                                    role="gridcell"
                                    className={`day-calendar-cell day-calendar-lived${isNow ? ' day-calendar-now' : ''}`}
                                    data-testid={`cal-day-${folderId}`}
                                    data-has-folder="true"
                                    data-day-now={isNow ? 'true' : 'false'}
                                    title={isNow ? `${folderId} · day-now` : folderId}
                                    aria-pressed={selectedDay === folderId}
                                    onClick={() => {
                                        // 25.T25.2: opening a day both shows its
                                        // container and opens its daily note —
                                        // one gesture, the day as a whole.
                                        setSelectedDay(folderId);
                                        void commands.execute('vault.open', `${PRESENT}/${folderId}/daily-note.md`);
                                    }}
                                >
                                    {d}
                                    <span className="day-calendar-mark" aria-hidden="true">
                                        •
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            {folders && folders.length === 0 ? (
                <div className="pane-message" data-testid="cal-empty-note">
                    no lived days yet — begin today from the Now surface
                </div>
            ) : null}
            {/* 25.T25.2 — the DayContainer detail: the sessions the day actually
                held, each with the chips its own NOW declared. Handles and roles
                only; no body, and per UX §6.5 no quaternion. */}
            {selectedDay ? (
                <section
                    // The container is STRICTER than the pane around it: the
                    // calendar is protected-local (25.1, SPEC:69) but this
                    // section carries per-artifact handles and roles, which
                    // SPEC:75 assigns handle-only. Inheriting the pane's weaker
                    // tint would tell the user something untrue about what is
                    // on screen, so the section wears its own.
                    className={`day-container ${privacyChrome('protected_local_handle_only').className}`}
                    title={privacyChrome('protected_local_handle_only').title}
                    data-testid="day-container"
                    data-day={selectedDay}
                    data-session-count={container?.sessions.length ?? 0}
                    data-protected-bodies-rendered="false"
                >
                    <header className="day-container-header">{`${selectedDay} — sessions`}</header>
                    {containerError ? (
                        <p className="pane-message" data-testid="day-container-error">
                            {containerError}
                        </p>
                    ) : container && container.sessions.length > 0 ? (
                        <ul className="day-container-sessions">
                            {container.sessions.map(session => (
                                <SessionBlock key={session.sessionKey} session={session} />
                            ))}
                        </ul>
                    ) : (
                        <p className="pane-message" data-testid="day-container-empty">
                            no sessions were opened on this day
                        </p>
                    )}
                    {container && container.dayArtifacts.length > 0 ? (
                        <ul className="day-container-artifacts" data-testid="day-container-day-artifacts">
                            {container.dayArtifacts.map(artifact => (
                                <ArtifactRow key={artifact.path} artifact={artifact} />
                            ))}
                        </ul>
                    ) : null}
                    {containerCapped ? (
                        <p className="pane-message" data-testid="day-container-capped">
                            {`frontmatter chips read for the first ${DAY_CONTAINER_FRONTMATTER_READ_CAP} artifacts — the rest are listed without chips`}
                        </p>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}
