import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

const DAY_CALENDAR_WIDGET_ID = 'm4.nara.dayCalendar';
const DAY_CALENDAR_LABEL = 'M4 Day Calendar';
const OPEN_DAY_METHOD = 'nara.day.open';
const STRIP_RADIUS = 3;

@injectable()
export class DayCalendar extends ReactWidget {
    static readonly ID = DAY_CALENDAR_WIDGET_ID;
    static readonly LABEL = DAY_CALENDAR_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected selectedDay: Date = startOfLocalDay(new Date());
    protected currentDay: Date = startOfLocalDay(new Date());
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = DayCalendar.ID;
        this.title.label = DayCalendar.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-m4-nara');
        this.addClass('m4-nara-day-calendar');
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.syncCurrentDay();
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.syncCurrentDay();
                this.update();
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const strip = buildDayStrip(this.selectedDay);
        const selectedDayId = formatDayId(this.selectedDay);
        const todayId = formatDayId(this.currentDay);
        const profileTick = readTick(this.profile);

        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-day-calendar"
            >
                <header className="m4-day-calendar-header">
                    <div>
                        <h3 data-test="m4-day-calendar-title">{formatLongDate(this.selectedDay)}</h3>
                        <p data-test="m4-day-calendar-weekday">{formatWeekday(this.selectedDay)}</p>
                    </div>
                    <div className="m4-day-calendar-controls" aria-label="Day navigation controls">
                        <button
                            type="button"
                            aria-label="Previous day"
                            data-test="m4-day-calendar-prev"
                            onClick={() => this.openDay(addDays(this.selectedDay, -1))}
                        >
                            &lt;
                        </button>
                        <button
                            type="button"
                            data-test="m4-day-calendar-today"
                            onClick={() => this.openDay(this.currentDay)}
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            aria-label="Next day"
                            data-test="m4-day-calendar-next"
                            onClick={() => this.openDay(addDays(this.selectedDay, 1))}
                        >
                            &gt;
                        </button>
                    </div>
                </header>
                <ol className="m4-day-calendar-strip" aria-label="Surrounding days">
                    {strip.map(day => {
                        const dayId = formatDayId(day);
                        const isSelected = dayId === selectedDayId;
                        const isToday = dayId === todayId;
                        return (
                            <li key={dayId}>
                                <button
                                    type="button"
                                    aria-current={isSelected ? 'date' : undefined}
                                    className={dayClassName(isSelected, isToday)}
                                    data-day-id={dayId}
                                    data-test="m4-day-calendar-day"
                                    onClick={() => this.openDay(day)}
                                >
                                    <span className="m4-day-calendar-dow">{formatShortWeekday(day)}</span>
                                    <strong>{day.getDate()}</strong>
                                    <span className="m4-day-calendar-month">{formatShortMonth(day)}</span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
                <footer className="m4-day-calendar-meta">
                    <span data-test="m4-day-calendar-day-id">{selectedDayId}</span>
                    <span data-test="m4-day-calendar-tick">tick {profileTick ?? 'pending'}</span>
                </footer>
            </div>
        );
    }

    protected syncCurrentDay(): void {
        const current = readProfileCurrentDay(this.profile) ?? startOfLocalDay(new Date());
        const selected = parseDay(this.context.dayNowSessionHandle);
        this.currentDay = current;
        if (selected) {
            this.selectedDay = selected;
        } else if (isSameDay(this.selectedDay, startOfLocalDay(new Date()))) {
            this.selectedDay = current;
        }
    }

    protected openDay(day: Date): void {
        const selected = startOfLocalDay(day);
        const dayId = formatDayId(selected);
        this.selectedDay = selected;
        this.bridge.updateCoordinateContext({
            ...this.context,
            dayNowSessionHandle: dayId,
            privacyClass: 'protected_local_handle_only',
            provenance: {
                source: 'm4-nara.day-calendar',
                generation: this.context.profileGeneration,
                notes: [...this.context.provenance.notes, `selected ${dayId}`]
            }
        });
        void this.bridge.invokeGatewayRpc(OPEN_DAY_METHOD, { dayId }).catch(() => {
            // Navigation stays local if the gateway shim is not online yet.
        });
        this.update();
    }
}

function buildDayStrip(center: Date): readonly Date[] {
    const days: Date[] = [];
    for (let offset = -STRIP_RADIUS; offset <= STRIP_RADIUS; offset += 1) {
        days.push(addDays(center, offset));
    }
    return Object.freeze(days);
}

function readProfileCurrentDay(profile: MathemeHarmonicProfileBoundary | null): Date | null {
    return (
        parseProfileDay(profile, 'dayId') ??
        parseProfileDay(profile, 'dayNow') ??
        parseProfileDay(profile, 'currentDay') ??
        parseNestedProfileDay(profile, 'm4NaraDayContainer', 'dayId') ??
        parseNestedProfileDay(profile, 'dayContainer', 'dayId')
    );
}

function parseProfileDay(profile: MathemeHarmonicProfileBoundary | null, key: string): Date | null {
    if (!profile) {
        return null;
    }
    return parseDay(profile.payload[key]);
}

function parseNestedProfileDay(
    profile: MathemeHarmonicProfileBoundary | null,
    objectKey: string,
    dayKey: string
): Date | null {
    if (!profile) {
        return null;
    }
    const record = objectRecord(profile.payload[objectKey]);
    return record ? parseDay(record[dayKey]) : null;
}

function parseDay(value: unknown): Date | null {
    if (typeof value !== 'string' || value.trim() === '') {
        return null;
    }
    const isoMatch = /(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (isoMatch) {
        return dateFromParts(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
    }
    const presentMatch = /(\d{2})-(\d{2})-(\d{4})/.exec(value);
    if (presentMatch) {
        return dateFromParts(Number(presentMatch[3]), Number(presentMatch[2]), Number(presentMatch[1]));
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
}

function readTick(profile: MathemeHarmonicProfileBoundary | null): number | null {
    if (!profile) {
        return null;
    }
    const direct = numberValue(profile.payload.tick);
    if (direct !== null) {
        return direct;
    }
    const worldClock = objectRecord(profile.payload.worldClock) ?? objectRecord(profile.payload.world_clock);
    return worldClock ? numberValue(worldClock.tick) : null;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null;
    }
    return value as Readonly<Record<string, unknown>>;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dateFromParts(year: number, month: number, day: number): Date | null {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? startOfLocalDay(date)
        : null;
}

function addDays(day: Date, offset: number): Date {
    const next = startOfLocalDay(day);
    next.setDate(next.getDate() + offset);
    return startOfLocalDay(next);
}

function startOfLocalDay(day: Date): Date {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
    return formatDayId(a) === formatDayId(b);
}

function formatDayId(day: Date): string {
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
}

function formatLongDate(day: Date): string {
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(day);
}

function formatWeekday(day: Date): string {
    return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(day);
}

function formatShortWeekday(day: Date): string {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(day);
}

function formatShortMonth(day: Date): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(day);
}

function dayClassName(selected: boolean, today: boolean): string {
    const classes = ['m4-day-calendar-day'];
    if (selected) {
        classes.push('m4-day-calendar-day-selected');
    }
    if (today) {
        classes.push('m4-day-calendar-day-today');
    }
    return classes.join(' ');
}
