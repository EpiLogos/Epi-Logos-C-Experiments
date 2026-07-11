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
 * Does NOT own: the day-now thread (session store, written by App.tsx), the
 *   vault read (Tauri `vault_list`), the markdown editor the open routes into.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';
import { VaultEntry } from './FileTreePane';

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

export function DayCalendarPane() {
    const dayNow = useSessionStore(s => s.dayNow);
    const [folders, setFolders] = useState<ParsedDayId[] | null>(null);
    const [view, setView] = useState(() => initialView(dayNow));
    const [error, setError] = useState<string | null>(null);

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
        <div className="day-calendar" data-testid="day-calendar">
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
                                    onClick={() =>
                                        void commands.execute('vault.open', `${PRESENT}/${folderId}/daily-note.md`)
                                    }
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
        </div>
    );
}
