import * as React from 'react';
import { CommandService } from '@theia/core/lib/common';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, READ_ONLY_COMMAND_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';
import { ORACLE_CAST_VIEW_ID } from './oracle-cast';

export const ORACLE_HISTORY_VIEW_ID = 'm4.nara.oracleHistory';
export const ORACLE_HISTORY_LABEL = 'M4 Oracle History';
export const M4_ORACLE_HISTORY_CARD_EXPORT = 'M4OracleHistoryCard' as const;
export const ORACLE_HISTORY_RPC_METHOD = 'nara.oracle.history';
export const ORACLE_HYGIENE_RPC_METHOD = 'nara.oracle.hygiene';
export const ORACLE_HISTORY_DEFAULT_DAY_RANGE = 30;
export const ORACLE_HISTORY_DECAY_WINDOW_MS = 4 * 60 * 60 * 1000;

export type OracleHistoryModality = 'iching' | 'tarot' | 'unknown';
export type OracleDecayWindowState = 'open' | '4h-decay-active' | 'closed';
export type OracleLiveStateBadge = 'generating' | 'muting' | 'mute' | 'idle';
export type OracleHygieneState = 'clean' | 'attention' | 'stale' | 'unknown' | string;

export interface OracleHistoryRow {
    readonly artifactHandle: string;
    readonly kind: 'oracle';
    readonly timestamp: string;
    readonly timestampShort: string;
    readonly modality: OracleHistoryModality;
    readonly modalityIcon: string;
    readonly title: string;
    readonly decayWindowState: OracleDecayWindowState;
    readonly decayWindowOpen: boolean | null;
    readonly hygieneState: OracleHygieneState;
    readonly liveStateBadge: OracleLiveStateBadge;
}

export interface OracleHistoryCardProps {
    readonly rows: readonly OracleHistoryRow[];
    readonly dayRange: number;
    readonly loading?: boolean;
    readonly errorMessage?: string | null;
    readonly onOpenCast: (artifactHandle: string) => void;
}

export interface NormalizeOracleHistoryOptions {
    readonly hygiene?: unknown;
}

interface GatewayBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export const M4OracleHistoryCard: React.FC<OracleHistoryCardProps> = ({
    rows,
    dayRange,
    loading = false,
    errorMessage = null,
    onOpenCast
}) => (
    <section
        className={`m4-oracle-history ${privacyChromeClass('protected_local_handle_only')}`}
        data-test="M4OracleHistoryCard"
        data-track="TRACK_08"
        data-export={M4_ORACLE_HISTORY_CARD_EXPORT}
        data-view-id={ORACLE_HISTORY_VIEW_ID}
        data-day-range={dayRange}
        aria-label="Oracle history"
    >
        <header className="m4-oracle-history-header">
            <h3>Oracle History</h3>
            <span
                className="m4-oracle-history-privacy mext-privacy-protected-local-handle-only"
                data-test="m4-oracle-history-privacy"
            >
                handle-only
            </span>
        </header>
        {loading ? (
            <p data-test="m4-oracle-history-loading">Loading history</p>
        ) : null}
        {errorMessage ? (
            <p className="m4-oracle-history-error" data-test="m4-oracle-history-error">{errorMessage}</p>
        ) : null}
        {rows.length > 0 ? (
            <ol className="m4-oracle-history-list" data-test="m4-oracle-history-list">
                {rows.map(row => (
                    <li
                        key={row.artifactHandle}
                        className="m4-oracle-history-row"
                        data-test="m4-oracle-history-row"
                        data-artifact-handle={row.artifactHandle}
                        data-decay-window-state={row.decayWindowState}
                        data-hygiene-state={row.hygieneState}
                        data-live-state={row.liveStateBadge}
                    >
                        <button
                            type="button"
                            className="m4-oracle-history-open"
                            data-test="m4-oracle-history-open"
                            onClick={() => onOpenCast(row.artifactHandle)}
                        >
                            <span className="m4-oracle-history-time" data-test="m4-oracle-history-time">
                                {row.timestampShort}
                            </span>
                            <span
                                className="m4-oracle-history-modality"
                                data-test="m4-oracle-history-modality"
                                aria-label={row.modality}
                            >
                                {row.modalityIcon}
                            </span>
                            <span className="m4-oracle-history-title" data-test="m4-oracle-history-title">
                                {row.title}
                            </span>
                            <span className="m4-oracle-history-decay" data-test="m4-oracle-history-decay">
                                {row.decayWindowState}
                            </span>
                            <span className="m4-oracle-history-hygiene" data-test="m4-oracle-history-hygiene">
                                {row.hygieneState}
                            </span>
                            <span className="m4-oracle-history-live" data-test="m4-oracle-history-live">
                                {row.liveStateBadge}
                            </span>
                        </button>
                    </li>
                ))}
            </ol>
        ) : (
            <p data-test="m4-oracle-history-empty">No oracle casts in the selected range.</p>
        )}
    </section>
);

@injectable()
export class OracleHistoryWidget extends ReactWidget {
    static readonly ID = ORACLE_HISTORY_VIEW_ID;
    static readonly LABEL = ORACLE_HISTORY_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    public readonly bridge!: SharedBridgeAdapter;

    @inject(CommandService)
    public readonly commandService!: CommandService;

    public rows: readonly OracleHistoryRow[] = Object.freeze([]);
    protected rawHistory: unknown = null;
    protected hygiene: unknown = null;
    protected dayRange = ORACLE_HISTORY_DEFAULT_DAY_RANGE;
    protected loading = false;
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    public init(): void {
        this.id = OracleHistoryWidget.ID;
        this.title.label = OracleHistoryWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-oracle-history');
        this.addClass(privacyChromeClass('protected_local_handle_only'));

        this.subscriptions.push(
            this.bridge.onProfile(profile => this.onProfileTick(profile))
        );
        void this.refresh();
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        this.subscriptions = [];
        super.dispose();
    }

    async refresh(now = Date.now()): Promise<void> {
        this.loading = true;
        this.errorMessage = null;
        this.update();
        try {
            this.rawHistory = await fetchOracleHistory(this.bridge, this.dayRange);
            const provisionalRows = normalizeOracleHistory(this.rawHistory, now);
            this.hygiene = await fetchOracleHygiene(
                this.bridge,
                provisionalRows.map(row => row.artifactHandle)
            );
            this.rows = normalizeOracleHistory(this.rawHistory, now, {
                hygiene: this.hygiene
            });
        } catch (error) {
            this.errorMessage = errorMessage(error);
            this.rows = Object.freeze([]);
        } finally {
            this.loading = false;
            this.update();
        }
    }

    async openCast(artifactHandle: string): Promise<void> {
        await this.commandService.executeCommand(READ_ONLY_COMMAND_ID, {
            viewId: ORACLE_CAST_VIEW_ID,
            artifactHandle,
            mode: 'read-only',
            readOnly: true
        });
    }

    protected onProfileTick(_profile: MathemeHarmonicProfileBoundary | null): void {
        if (!this.rawHistory) {
            return;
        }
        this.rows = normalizeOracleHistory(this.rawHistory, Date.now(), {
            hygiene: this.hygiene
        });
        this.update();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-oracle-history-root"
            >
                <M4OracleHistoryCard
                    rows={this.rows}
                    dayRange={this.dayRange}
                    loading={this.loading}
                    errorMessage={this.errorMessage}
                    onOpenCast={handle => void this.openCast(handle)}
                />
            </div>
        );
    }
}

export async function fetchOracleHistory(
    bridge: GatewayBridge,
    dayRange = ORACLE_HISTORY_DEFAULT_DAY_RANGE
): Promise<unknown> {
    return bridge.invokeGatewayRpc(ORACLE_HISTORY_RPC_METHOD, { dayRange });
}

export async function fetchOracleHygiene(
    bridge: GatewayBridge,
    artifactHandles: readonly string[]
): Promise<unknown> {
    return bridge.invokeGatewayRpc(ORACLE_HYGIENE_RPC_METHOD, {
        artifactHandles: [...artifactHandles]
    });
}

export function normalizeOracleHistory(
    value: unknown,
    now = Date.now(),
    options: NormalizeOracleHistoryOptions = {}
): readonly OracleHistoryRow[] {
    const hygiene = normalizeHygieneStates(options.hygiene);
    const artifacts = oracleArtifacts(value);
    const rows = artifacts
        .map(artifact => oracleHistoryRow(artifact, now, hygiene))
        .filter((row): row is OracleHistoryRow => row !== null)
        .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));
    return Object.freeze(rows);
}

export function oracleDecayWindowState(
    timestamp: string,
    now = Date.now(),
    decayWindowOpen: boolean | null = null
): OracleDecayWindowState {
    const castAt = Date.parse(timestamp);
    if (!Number.isFinite(castAt)) {
        return decayWindowOpen === true ? 'open' : 'closed';
    }
    const age = Math.max(0, now - castAt);
    if (age >= ORACLE_HISTORY_DECAY_WINDOW_MS) {
        return 'closed';
    }
    return decayWindowOpen === true ? 'open' : '4h-decay-active';
}

export function oracleLiveStateBadge(value: unknown): OracleLiveStateBadge {
    const raw = String(value ?? '').toLowerCase();
    if (raw === 'generating') {
        return 'generating';
    }
    if (raw === 'muting') {
        return 'muting';
    }
    if (raw === 'mute' || raw === 'muted') {
        return 'mute';
    }
    return 'idle';
}

function oracleHistoryRow(
    artifact: Readonly<Record<string, unknown>>,
    now: number,
    hygiene: Readonly<Record<string, OracleHygieneState>>
): OracleHistoryRow | null {
    const artifactHandle = stringValue(
        artifact.artifactHandle ?? artifact.handle ?? artifact.id ?? artifact.episode_id
    );
    const timestamp = stringValue(
        artifact.timestamp ?? artifact.castAt ?? artifact.createdAt ?? artifact.inscribedAt
    );
    if (!artifactHandle || !timestamp) {
        return null;
    }
    const modality = oracleModality(artifact);
    const decayWindowOpen = booleanOrNull(
        nestedValue(artifact, ['qActivity', 'decayWindowOpen']) ??
        nestedValue(artifact, ['q_activity', 'decayWindowOpen']) ??
        nestedValue(artifact, ['q_activity', 'decay_window_open']) ??
        artifact.decayWindowOpen
    );
    const title = stringValue(artifact.title ?? artifact.shortTitle ?? artifact.label) ||
        fallbackTitle(modality, artifact);
    const row: OracleHistoryRow = Object.freeze({
        artifactHandle,
        kind: 'oracle',
        timestamp,
        timestampShort: shortTimestamp(timestamp),
        modality,
        modalityIcon: modalityIcon(modality, artifact, title),
        title,
        decayWindowState: oracleDecayWindowState(timestamp, now, decayWindowOpen),
        decayWindowOpen,
        hygieneState: hygiene[artifactHandle] ?? 'unknown',
        liveStateBadge: oracleLiveStateBadge(
            nestedValue(artifact, ['spreadPosition', 'liveState']) ??
            nestedValue(artifact, ['spreadPosition', 'state']) ??
            nestedValue(artifact, ['spread_position', 'live_state']) ??
            nestedValue(artifact, ['spread_position', 'state']) ??
            artifact.liveState
        )
    });
    return row;
}

function oracleArtifacts(value: unknown): ReadonlyArray<Readonly<Record<string, unknown>>> {
    const record = objectValue(value);
    const container = objectValue(record?.dayContainer ?? record?.day_container);
    const candidate =
        arrayValue(record?.casts) ??
        arrayValue(record?.history) ??
        arrayValue(record?.entries) ??
        arrayValue(record?.artifactTree) ??
        arrayValue(record?.artifact_tree) ??
        arrayValue(container?.artifactTree) ??
        arrayValue(container?.artifact_tree) ??
        arrayValue(value) ??
        [];
    return candidate
        .map(objectValue)
        .filter((artifact): artifact is Readonly<Record<string, unknown>> =>
            artifact?.kind === 'oracle'
        );
}

function normalizeHygieneStates(value: unknown): Readonly<Record<string, OracleHygieneState>> {
    const record = objectValue(value);
    const states = objectValue(record?.states ?? record?.hygiene ?? value);
    if (states) {
        return Object.freeze(Object.fromEntries(
            Object.entries(states)
                .map(([handle, state]) => [handle, stringValue(state) || 'unknown'])
        ));
    }
    const rows = arrayValue(record?.entries ?? value) ?? [];
    return Object.freeze(Object.fromEntries(
        rows
            .map(objectValue)
            .filter((entry): entry is Readonly<Record<string, unknown>> => Boolean(entry))
            .map(entry => [
                stringValue(entry.artifactHandle ?? entry.handle),
                stringValue(entry.state ?? entry.hygieneState) || 'unknown'
            ])
            .filter(([handle]) => Boolean(handle))
    ));
}

function oracleModality(artifact: Readonly<Record<string, unknown>>): OracleHistoryModality {
    const raw = String(artifact.modality ?? artifact.oracleModality ?? artifact.type ?? '').toLowerCase();
    if (raw.includes('i-ching') || raw.includes('iching') || raw.includes('i_ching')) {
        return 'iching';
    }
    if (raw.includes('tarot')) {
        return 'tarot';
    }
    if (artifact.hexagramNumber || artifact.primaryHexagramNumber || artifact.iChing) {
        return 'iching';
    }
    if (artifact.tarotSuit || artifact.cardName || artifact.tarot) {
        return 'tarot';
    }
    return 'unknown';
}

function modalityIcon(
    modality: OracleHistoryModality,
    artifact: Readonly<Record<string, unknown>>,
    title: string
): string {
    if (modality === 'iching') {
        return hexagramGlyph(hexagramNumber(artifact, title) ?? 1);
    }
    if (modality === 'tarot') {
        return tarotSuitPip(artifact);
    }
    return 'O';
}

function hexagramNumber(
    artifact: Readonly<Record<string, unknown>>,
    title: string
): number | null {
    const raw =
        numberValue(artifact.hexagramNumber) ??
        numberValue(artifact.primaryHexagramNumber) ??
        numberValue(nestedValue(artifact, ['iChing', 'hexagramNumber'])) ??
        numberValue(nestedValue(artifact, ['iching', 'hexagramNumber'])) ??
        numberValue(nestedValue(artifact, ['payload', 'hexagramNumber']));
    if (raw && raw >= 1 && raw <= 64) {
        return raw;
    }
    const match = title.match(/\b(?:hexagram|gua)\s+(\d{1,2})\b/i);
    if (match) {
        const parsed = Number.parseInt(match[1], 10);
        return parsed >= 1 && parsed <= 64 ? parsed : null;
    }
    return null;
}

function hexagramGlyph(hexagram: number): string {
    const bounded = Math.min(64, Math.max(1, Math.trunc(hexagram)));
    return String.fromCodePoint(0x4dc0 + bounded - 1);
}

function tarotSuitPip(artifact: Readonly<Record<string, unknown>>): string {
    const raw = String(
        artifact.tarotSuit ??
        artifact.suit ??
        nestedValue(artifact, ['tarot', 'suit']) ??
        nestedValue(artifact, ['card', 'suit']) ??
        artifact.cardName ??
        ''
    ).toLowerCase();
    if (raw.includes('cup') || raw.includes('heart')) {
        return '♥';
    }
    if (raw.includes('sword') || raw.includes('spade')) {
        return '♠';
    }
    if (raw.includes('wand') || raw.includes('club')) {
        return '♣';
    }
    return '♦';
}

function fallbackTitle(
    modality: OracleHistoryModality,
    artifact: Readonly<Record<string, unknown>>
): string {
    if (modality === 'iching') {
        const number = hexagramNumber(artifact, '');
        return number ? `Hexagram ${number}` : 'I-Ching cast';
    }
    if (modality === 'tarot') {
        return stringValue(artifact.cardName ?? nestedValue(artifact, ['card', 'name'])) || 'Tarot draw';
    }
    return 'Oracle cast';
}

function shortTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month} ${day} ${hour}:${minute}`;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] | undefined {
    return Array.isArray(value) ? value : undefined;
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function booleanOrNull(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}

function nestedValue(
    record: Readonly<Record<string, unknown>>,
    path: readonly string[]
): unknown {
    let current: unknown = record;
    for (const key of path) {
        const currentRecord = objectValue(current);
        if (!currentRecord) {
            return undefined;
        }
        current = currentRecord[key];
    }
    return current;
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
