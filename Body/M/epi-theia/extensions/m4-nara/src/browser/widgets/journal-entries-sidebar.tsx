import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, CommandService } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, OPEN_COMMAND_ID, PRIVACY_CLASS } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

// ============================================================================
// Tranche 25.3 — Journal Entries activity-bar widget (closes 15.3 ORPHAN).
//
// A `ReactWidget` registered against Theia's left activity-bar slot
// (`widget.application-shell-left`) per 15.3 + 15-foundation Principle 7
// ("Activity-Bar Discipline"). It renders a vertical timeline of NOW.md
// inscriptions across the last 30 days, backed by the protected-local
// `nara.journal.timeline` gateway RPC. The mode is bound to the `daily-0-1`
// layout only; in `ide-deep` its left-sidebar space is reclaimed by Backend
// Studio + Smart Connections, so the mode is hidden.
// ============================================================================

export const JOURNAL_ENTRIES_VIEW_ID = 'm4.nara.journalEntries';
export const JOURNAL_ENTRIES_LABEL = 'Journal Entries';
export const M4_JOURNAL_TIMELINE_CARD_EXPORT = 'M4JournalTimelineCard' as const;

/** Protected-local gateway RPC that returns the cross-day NOW.md timeline. */
export const JOURNAL_TIMELINE_METHOD = 'nara.journal.timeline';

/** Default day window for the timeline query. */
export const JOURNAL_TIMELINE_DAY_RANGE = 30;

/** The canonical left activity-bar slot this mode contributes to (15.3). */
export const JOURNAL_ENTRIES_ACTIVITY_BAR_SLOT = 'widget.application-shell-left';

export const JOURNAL_ENTRIES_OPEN_COMMAND_ID = 'm4.nara.journalEntries.open';

const ACTIVE_LAYOUT_PREFERENCE = 'epi-logos.layout.active';
const DAILY_LAYOUT = 'daily-0-1';
const IDE_DEEP_LAYOUT = 'ide-deep';

/**
 * Activity-bar mode descriptor. Mirrors the Backend Studio / Smart Connections
 * descriptors in `ide-shell-m0-m5`, but bound to the personal-side `daily-0-1`
 * face. The contract test asserts this mode contributes to the `daily-0-1` slot
 * ONLY and is hidden under `ide-deep`.
 */
export const JOURNAL_ENTRIES_ACTIVITY_BAR_MODE = Object.freeze({
    id: 'journal-entries',
    label: JOURNAL_ENTRIES_LABEL,
    iconClass: 'codicon-notebook',
    slot: JOURNAL_ENTRIES_ACTIVITY_BAR_SLOT,
    widgetId: JOURNAL_ENTRIES_VIEW_ID,
    availableInLayouts: Object.freeze([DAILY_LAYOUT]),
    hiddenInLayouts: Object.freeze([IDE_DEEP_LAYOUT])
});

/** Kinds of artifacts a NOW session can inscribe (kind-icon ribbon source). */
export type JournalArtifactKind =
    | 'journal'
    | 'dream'
    | 'oracle'
    | 'reminder'
    | 'contemplative'
    | 'agent-chat';

export interface JournalArtifactRef {
    readonly artifactHandle: string;
    readonly kind: JournalArtifactKind;
    readonly title: string;
}

/** One NOW.md inscription row on the timeline. */
export interface JournalTimelineEntry {
    readonly dayId: string;
    readonly nowHandle: string;
    readonly sessionKey: string;
    readonly inscribedAt: string;
    readonly artifacts: readonly JournalArtifactRef[];
}

export interface M4JournalTimelineCardProps {
    readonly entries: readonly JournalTimelineEntry[];
    readonly dayRange: number;
    readonly loading?: boolean;
    readonly errorMessage?: string | null;
    readonly onOpenArtifact: (artifactHandle: string) => void;
}

const ARTIFACT_KIND_ICONS: Readonly<Record<JournalArtifactKind, string>> = Object.freeze({
    journal: 'J',
    dream: 'D',
    oracle: 'O',
    reminder: 'R',
    contemplative: 'C',
    'agent-chat': 'A'
});

const KNOWN_ARTIFACT_KINDS: readonly JournalArtifactKind[] = Object.freeze([
    'journal',
    'dream',
    'oracle',
    'reminder',
    'contemplative',
    'agent-chat'
]);

/**
 * `M4JournalTimelineCard` — TRACK_08 presentational export. Renders the
 * vertical timeline (latest day at top). Pure: receives entries + an open
 * handler; never touches the bridge directly.
 */
export function M4JournalTimelineCard(props: M4JournalTimelineCardProps): React.ReactElement {
    const { entries, dayRange, loading = false, errorMessage = null, onOpenArtifact } = props;
    return (
        <section
            className={`m4-journal-entries-card ${privacyChromeClass('protected_local')}`}
            data-test="M4JournalTimelineCard"
            data-track="TRACK_08"
            data-export={M4_JOURNAL_TIMELINE_CARD_EXPORT}
            data-view-id={JOURNAL_ENTRIES_VIEW_ID}
            data-day-range={dayRange}
            data-entry-count={entries.length}
            aria-label="Journal entries timeline"
        >
            <header className="m4-journal-entries-header">
                <h3 data-test="m4-journal-entries-title">{JOURNAL_ENTRIES_LABEL}</h3>
                <span className="m4-journal-entries-range" data-test="m4-journal-entries-range">
                    last {dayRange} days
                </span>
                <span className="m4-journal-entries-privacy mext-privacy-protected-local">protected-local</span>
            </header>
            {errorMessage ? (
                <p className="m4-journal-entries-error" data-test="m4-journal-entries-error">
                    {errorMessage}
                </p>
            ) : null}
            {loading && entries.length === 0 ? (
                <p className="m4-journal-entries-loading" data-test="m4-journal-entries-loading">
                    Loading protected journal timeline…
                </p>
            ) : null}
            {!loading && entries.length === 0 && !errorMessage ? (
                <p className="mext-widget-empty" data-test="m4-journal-entries-empty">
                    No NOW.md inscriptions in the last {dayRange} days.
                </p>
            ) : null}
            <ol className="m4-journal-entries-timeline" aria-label="NOW.md inscriptions, latest first">
                {entries.map(entry => (
                    <li
                        className="m4-journal-entry-row mext-privacy-protected-local-handle-only"
                        data-test="m4-journal-entry-row"
                        data-day-id={entry.dayId}
                        data-session-key={entry.sessionKey}
                        key={entry.nowHandle}
                    >
                        <div className="m4-journal-entry-meta">
                            <span className="m4-journal-entry-day-chip" data-test="m4-journal-entry-day-chip">
                                {entry.dayId}
                            </span>
                            <span className="m4-journal-entry-time" data-test="m4-journal-entry-time">
                                {formatTimestamp(entry.inscribedAt)}
                            </span>
                            <span className="m4-journal-entry-session" data-test="m4-journal-entry-session">
                                {shortSessionKey(entry.sessionKey)}
                            </span>
                        </div>
                        <ul className="m4-journal-entry-ribbon" aria-label="Inscribed artifacts">
                            {entry.artifacts.map(artifact => (
                                <li key={artifact.artifactHandle}>
                                    <button
                                        type="button"
                                        className={`m4-journal-artifact-icon m4-artifact-kind-${artifact.kind}`}
                                        data-test="m4-journal-artifact-icon"
                                        data-artifact-handle={artifact.artifactHandle}
                                        data-kind={artifact.kind}
                                        title={`${artifact.kind}: ${artifact.title}`}
                                        aria-label={`Open ${artifact.kind} artifact ${artifact.title}`}
                                        onClick={() => onOpenArtifact(artifact.artifactHandle)}
                                    >
                                        {ARTIFACT_KIND_ICONS[artifact.kind]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ol>
        </section>
    );
}

@injectable()
export class JournalEntriesSidebarWidget extends ReactWidget {
    static readonly ID = JOURNAL_ENTRIES_VIEW_ID;
    static readonly LABEL = JOURNAL_ENTRIES_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected layoutMode = DAILY_LAYOUT;
    protected entries: readonly JournalTimelineEntry[] = [];
    protected loading = false;
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = JournalEntriesSidebarWidget.ID;
        this.title.label = JournalEntriesSidebarWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.iconClass = JOURNAL_ENTRIES_ACTIVITY_BAR_MODE.iconClass;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-journal-entries');
        this.addClass(privacyChromeClass('protected_local'));

        this.layoutMode = this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, DAILY_LAYOUT);

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                void this.refreshTimeline();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                void this.refreshTimeline();
            })
        );
        this.subscriptions.push(
            this.preferences.onPreferenceChanged(change => {
                if (change.preferenceName === ACTIVE_LAYOUT_PREFERENCE) {
                    this.layoutMode = this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, DAILY_LAYOUT);
                    this.update();
                }
            })
        );

        void this.refreshTimeline();
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
        if (!isJournalEntriesVisibleInLayout(this.layoutMode)) {
            // In ide-deep the left sidebar belongs to Backend Studio + Smart
            // Connections; the personal Journal Entries mode yields its space.
            return (
                <div
                    className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                    data-test="m4-journal-entries-hidden"
                    data-layout-mode={this.layoutMode}
                    hidden
                />
            );
        }
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-journal-entries-root"
                data-layout-mode={this.layoutMode}
            >
                <M4JournalTimelineCard
                    entries={this.entries}
                    dayRange={JOURNAL_TIMELINE_DAY_RANGE}
                    loading={this.loading}
                    errorMessage={this.errorMessage}
                    onOpenArtifact={handle => this.openArtifact(handle)}
                />
            </div>
        );
    }

    protected openArtifact(artifactHandle: string): void {
        void this.commands.executeCommand(OPEN_COMMAND_ID, artifactHandle);
    }

    protected async refreshTimeline(): Promise<void> {
        this.loading = true;
        this.update();
        try {
            const raw = await this.bridge.invokeGatewayRpc(JOURNAL_TIMELINE_METHOD, {
                dayRange: JOURNAL_TIMELINE_DAY_RANGE
            });
            this.entries = normalizeJournalTimeline(raw);
            this.errorMessage = null;
        } catch (error) {
            // The timeline stays empty if the gateway shim is not online yet;
            // protected-local data never leaks through a failed fetch.
            this.errorMessage = error instanceof Error ? error.message : String(error);
        } finally {
            this.loading = false;
            this.update();
        }
    }
}

@injectable()
export class M4JournalEntriesContribution
    extends AbstractViewContribution<JournalEntriesSidebarWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    constructor() {
        super({
            widgetId: JournalEntriesSidebarWidget.ID,
            widgetName: JournalEntriesSidebarWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: JOURNAL_ENTRIES_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; the activity-bar mode (daily-0-1) or
        // a deep-link intent opens it via JOURNAL_ENTRIES_OPEN_COMMAND_ID.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: JOURNAL_ENTRIES_OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open journal entries` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }

    override async openView(
        args?: Parameters<AbstractViewContribution<JournalEntriesSidebarWidget>['openView']>[0]
    ): Promise<JournalEntriesSidebarWidget> {
        if (!this.isJournalEntriesVisible()) {
            throw new Error('Journal Entries is visible only when epi-logos.layout.active = daily-0-1');
        }
        return super.openView(args);
    }

    isJournalEntriesVisible(): boolean {
        return isJournalEntriesVisibleInLayout(
            this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, DAILY_LAYOUT)
        );
    }
}

/**
 * Layout gate: the Journal Entries activity-bar mode is bound to the
 * `daily-0-1` personal-side shell only. Hidden under `ide-deep` (15.3).
 */
export function isJournalEntriesVisibleInLayout(layout: string): boolean {
    return layout === DAILY_LAYOUT;
}

/**
 * Coerce the raw `nara.journal.timeline` payload into a sorted (latest-first)
 * list of timeline entries. Tolerant of `{ entries: [...] }` or a bare array;
 * drops malformed rows; keeps only handle-bearing artifacts of known kinds.
 */
export function normalizeJournalTimeline(raw: unknown): readonly JournalTimelineEntry[] {
    const rows = extractEntryArray(raw);
    const entries: JournalTimelineEntry[] = [];
    for (const row of rows) {
        const record = objectRecord(row);
        if (!record) {
            continue;
        }
        const dayId = stringValue(record.dayId ?? record.day_id);
        const nowHandle = stringValue(
            record.nowHandle ?? record.now_handle ?? record.handle ?? record.nowPath
        );
        if (!dayId || !nowHandle) {
            continue;
        }
        entries.push(
            Object.freeze({
                dayId,
                nowHandle,
                sessionKey: stringValue(record.sessionKey ?? record.session_key) ?? deriveSessionKey(nowHandle),
                inscribedAt: stringValue(record.inscribedAt ?? record.inscribed_at ?? record.timestamp) ?? '',
                artifacts: normalizeArtifacts(record.artifacts)
            })
        );
    }
    entries.sort((a, b) => compareTimelineDesc(a, b));
    return Object.freeze(entries);
}

export function shortSessionKey(sessionKey: string): string {
    const trimmed = sessionKey.trim();
    if (trimmed === '') {
        return '—';
    }
    const tail = trimmed.split(/[/:]/).filter(Boolean).pop() ?? trimmed;
    return tail.slice(0, 8);
}

export function journalArtifactKindIcon(kind: JournalArtifactKind): string {
    return ARTIFACT_KIND_ICONS[kind];
}

function normalizeArtifacts(value: unknown): readonly JournalArtifactRef[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    const refs: JournalArtifactRef[] = [];
    for (const item of value) {
        const record = objectRecord(item);
        if (!record) {
            continue;
        }
        const artifactHandle = stringValue(record.artifactHandle ?? record.artifact_handle ?? record.handle);
        const kind = normalizeArtifactKind(record.kind);
        if (!artifactHandle || !kind) {
            continue;
        }
        refs.push(
            Object.freeze({
                artifactHandle,
                kind,
                title: stringValue(record.title) ?? kind
            })
        );
    }
    return Object.freeze(refs);
}

function normalizeArtifactKind(value: unknown): JournalArtifactKind | null {
    return KNOWN_ARTIFACT_KINDS.includes(value as JournalArtifactKind)
        ? (value as JournalArtifactKind)
        : null;
}

function extractEntryArray(raw: unknown): readonly unknown[] {
    if (Array.isArray(raw)) {
        return raw;
    }
    const record = objectRecord(raw);
    if (record && Array.isArray(record.entries)) {
        return record.entries;
    }
    if (record && Array.isArray(record.timeline)) {
        return record.timeline;
    }
    return [];
}

function compareTimelineDesc(a: JournalTimelineEntry, b: JournalTimelineEntry): number {
    if (a.inscribedAt !== b.inscribedAt) {
        return a.inscribedAt < b.inscribedAt ? 1 : -1;
    }
    if (a.dayId !== b.dayId) {
        return a.dayId < b.dayId ? 1 : -1;
    }
    return 0;
}

function deriveSessionKey(nowHandle: string): string {
    const tail = nowHandle.split(/[/:]/).filter(Boolean).pop() ?? nowHandle;
    return tail;
}

function formatTimestamp(value: string): string {
    if (!value) {
        return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    }).format(parsed);
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value as Readonly<Record<string, unknown>>;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

// Keep the imported privacy constant load-bearing for package-level privacy audits.
void PRIVACY_CLASS;
