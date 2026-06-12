import { FrontendApplicationContribution, StatusBar, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { inject } from '@theia/core/shared/inversify';
import { Disposable } from '../../common/bridge-api';
import { CoordinateContext } from '../../common/coordinate-context';
import { ConnectionStatus, MathemeHarmonicProfileBoundary } from '../../common/profile';

export interface StateThreadStatusEntryDescriptor {
    readonly id: string;
    readonly name: string;
    readonly priority: number;
    readonly alignment: StatusBarAlignment;
    readonly marker: string;
}

export abstract class StateThreadStatusEntryContribution implements FrontendApplicationContribution {
    @inject(StatusBar) protected readonly statusBar!: StatusBar;

    private readonly subscriptions: Disposable[] = [];

    protected abstract readonly descriptor: StateThreadStatusEntryDescriptor;

    async onStart(): Promise<void> {
        for (const subscription of this.createSubscriptions()) {
            this.subscriptions.push(subscription);
        }
        this.render();
    }

    onStop(): void {
        while (this.subscriptions.length > 0) {
            this.subscriptions.pop()?.dispose();
        }
        void this.statusBar.removeElement(this.descriptor.id);
    }

    protected createSubscriptions(): readonly Disposable[] {
        return [];
    }

    protected abstract toStatusBarEntry(): StatusBarEntry;

    protected render(): void {
        void this.statusBar.setElement(this.descriptor.id, {
            ...this.toStatusBarEntry(),
            name: this.descriptor.name,
            alignment: this.descriptor.alignment,
            priority: this.descriptor.priority,
            className: [
                'pratibimba-state-thread',
                `pratibimba-state-thread-${this.descriptor.marker}`,
                'data-pratibimba-state-thread'
            ].join(' ')
        });
    }
}

export function compact(value: string | null | undefined, max = 32): string {
    if (!value) {
        return 'pending';
    }
    return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

export function firstCoordinate(context: CoordinateContext): string | null {
    return context.selectedCoordinate ?? context.canonicalMCoordinate ?? context.hashInput;
}

export function coordinateParts(coordinate: string | null): {
    readonly family: string;
    readonly archetype: string;
    readonly position: string;
} {
    if (!coordinate) {
        return {
            family: 'pending',
            archetype: 'pending',
            position: 'pending'
        };
    }

    const clean = coordinate.replace(/^#/, '');
    const [family = clean, archetype = clean, position = clean] = clean.split(/[./:]/).filter(Boolean);
    return { family, archetype, position };
}

export function dayNowSummary(handle: string | null): {
    readonly shortDate: string;
    readonly dayId: string | null;
    readonly vaultPath: string | null;
    readonly sessionId: string | null;
} {
    const dayId = extractDayId(handle);
    const sessionId = extractSessionId(handle);
    if (!dayId) {
        return {
            shortDate: 'pending',
            dayId: null,
            vaultPath: null,
            sessionId
        };
    }

    const [day, month, year] = dayId.split('-');
    const week = isoWeekNumber(Number(year), Number(month), Number(day));
    return {
        shortDate: `${day}-${month}`,
        dayId,
        vaultPath: `Idea/Empty/Present/${year}/${month}/W${week}/${day}/`,
        sessionId
    };
}

export function profileField(profile: MathemeHarmonicProfileBoundary | null, names: readonly string[]): string | null {
    if (!profile) {
        return null;
    }

    for (const name of names) {
        const value = readPayloadField(profile.payload, name);
        if (value !== null) {
            return value;
        }
    }
    return null;
}

export function connectionLabel(status: ConnectionStatus): string {
    return status.connected ? 'connected' : 'disconnected';
}

export function connectionIcon(status: ConnectionStatus): string {
    return status.connected ? '$(check)' : '$(circle-slash)';
}

function extractDayId(handle: string | null): string | null {
    if (!handle) {
        return null;
    }

    const ddmmyyyy = handle.match(/\b(\d{2}-\d{2}-\d{4})\b/);
    if (ddmmyyyy) {
        return ddmmyyyy[1];
    }

    const iso = handle.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (iso) {
        return `${iso[3]}-${iso[2]}-${iso[1]}`;
    }

    const presentPath = handle.match(/Idea\/Empty\/Present\/(\d{4})\/(\d{2})\/W\d{2}\/(\d{2})\//);
    if (presentPath) {
        return `${presentPath[3]}-${presentPath[2]}-${presentPath[1]}`;
    }

    return null;
}

function extractSessionId(handle: string | null): string | null {
    if (!handle) {
        return null;
    }

    const canonical = handle.match(/\b(\d{8}-\d{6}-[a-z0-9]+)\b/i);
    if (canonical) {
        return canonical[1];
    }

    const nowPath = handle.match(/\/([^/\s]+)\/now\.md\b/);
    return nowPath ? nowPath[1] : null;
}

function isoWeekNumber(year: number, month: number, day: number): string {
    const date = new Date(Date.UTC(year, month - 1, day));
    const weekday = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - weekday);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return String(week).padStart(2, '0');
}

function readPayloadField(payload: Readonly<Record<string, unknown>>, dottedName: string): string | null {
    let current: unknown = payload;
    for (const segment of dottedName.split('.')) {
        if (!current || typeof current !== 'object' || !(segment in current)) {
            current = undefined;
            break;
        }
        current = (current as Record<string, unknown>)[segment];
    }

    if (current === null || current === undefined) {
        return null;
    }
    if (typeof current === 'string' || typeof current === 'number' || typeof current === 'boolean') {
        return String(current);
    }
    return null;
}
