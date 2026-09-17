// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    SharedBridgeAdapter,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    MathemeHarmonicProfileBoundary,
    CoordinateContext,
    EMPTY_COORDINATE_CONTEXT,
    Disposable,
    ReadinessBanner,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIMARY_VIEW_ID,
    DECLARED_BLOCKERS,
    PRIVACY_CLASS,
    OPEN_COMMAND_ID,
    buildM4NaraSurface,
    type M4NaraSurface,
    type NaraDayContainer
} from '../common';
import { CanvasEditorSurface, createCanvasEditorModel } from './canvas-editor';
import { HighlightService } from './services/highlight-service';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from './privacy-chrome';

@injectable()
export class M4NaraWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M4 — Nara';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(HighlightService)
    protected readonly highlightService!: HighlightService;

    @inject(CommandRegistry)
    protected readonly commands!: CommandRegistry;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M4NaraWidget.ID;
        this.title.label = M4NaraWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => {
                this.readiness = snapshot;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
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
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? '—'} | pointer=${this.context.pointerAnchor ?? '—'}`;
        const dayContainer = readProfileDayContainer(this.profile);
        const naraSurface = this.profile
            ? buildM4NaraSurface({
                profile: this.profile,
                readiness: this.readiness,
                context: this.context,
                emittedAt: Date.now()
            })
            : null;
        const canvasModel = createCanvasEditorModel({
            dayContainer,
            context: this.context
        });
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-nara-root"
            >
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M4NaraWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>Profile snapshot</h3>
                    {this.profile ? (
                        <dl>
                            <dt>Generation</dt>
                            <dd>{this.profile.generation}</dd>
                            <dt>Capabilities</dt>
                            <dd>{this.profile.capabilities.join(', ') || '—'}</dd>
                            <dt>Pointer anchor</dt>
                            <dd>{this.profile.pointerAnchor ?? '—'}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            No MathemeHarmonicProfile available yet. The kernel-bridge is the
                            sole owner of this payload; this view will populate when the
                            shared adapter receives a generation update.
                        </p>
                    )}
                </section>
                <section className="mext-widget-detail">
                    <h3>Nara DayContainer</h3>
                    {naraSurface?.readiness.surfaceReady ? (
                        <>
                            <M4SessionBreakdownCard
                                naraSurface={naraSurface}
                                dayContainer={dayContainer}
                                commands={this.commands}
                            />
                        </>
                    ) : (
                        <p className="mext-widget-empty">
                            Waiting for a bridge-provided Nara DayContainer handle payload.
                            Protected journal, dream, oracle, and Graphiti bodies stay local;
                            this surface renders handles, scalar refs, readiness, and lineage.
                        </p>
                    )}
                </section>
                <CanvasEditorSurface
                    model={canvasModel}
                    highlightService={this.highlightService}
                    bridge={this.bridge}
                />
            </div>
        );
    }
}

export interface M4SessionBreakdownCardProps {
    readonly naraSurface: M4NaraSurface;
    readonly dayContainer: NaraDayContainer | null;
    readonly commands: Pick<CommandRegistry, 'executeCommand'>;
}

interface SessionBreakdown {
    readonly key: string;
    readonly label: string;
    readonly artifacts: readonly ArtifactDisplayRow[];
    readonly metadata: Readonly<Record<string, unknown>>;
}

interface ArtifactDisplayRow {
    readonly artifactHandle: string;
    readonly kind: string;
    readonly title: string;
    readonly sessionKey: string;
    readonly nowPath: string;
    readonly bodySha256: string | null;
    readonly resonance: unknown;
    readonly metadata: Readonly<Record<string, unknown>>;
}

export function M4SessionBreakdownCard(props: M4SessionBreakdownCardProps): React.ReactElement {
    const sessions = buildSessionBreakdowns(props.naraSurface, props.dayContainer);
    return (
        <aside
            className="m4-nara-identity-sidebar m4-session-breakdown-card mext-privacy-protected-local-handle-only"
            data-test="M4SessionBreakdownCard"
            aria-label="Nara session artifact handles"
        >
            <header className="m4-session-breakdown-summary">
                <span>{String(props.naraSurface.daySummary.dayId ?? 'No day')}</span>
                <span>{props.naraSurface.artifactTree.length} artifacts</span>
                <span>{props.naraSurface.graphitiBrowser.length} Graphiti episodes</span>
                <span>{formatResonance(props.naraSurface.daySummary.resonance)}</span>
                <span>{props.naraSurface.privacyClass}</span>
            </header>
            {sessions.map(session => (
                <section className="m4-session-block" data-test="m4-session-block" key={session.key}>
                    <header className="m4-session-header">
                        <strong>{session.label}</strong>
                        <SessionHeaderChips metadata={session.metadata} />
                    </header>
                    <ul>
                        {session.artifacts.map(artifact => (
                            <li key={artifact.artifactHandle}>
                                <button
                                    type="button"
                                    className="m4-artifact-handle-row mext-privacy-protected-local-handle-only"
                                    data-test="m4-artifact-row"
                                    data-artifact-handle={artifact.artifactHandle}
                                    onClick={() => {
                                        void props.commands.executeCommand(OPEN_COMMAND_ID, artifact.artifactHandle);
                                    }}
                                >
                                    <span
                                        className={`m4-artifact-kind-icon m4-artifact-kind-${artifact.kind}`}
                                        aria-label={`${artifact.kind} artifact`}
                                    >
                                        {artifactKindIcon(artifact.kind)}
                                    </span>
                                    <span className="m4-artifact-title">{artifact.title}</span>
                                    <ArtifactMetadataChips artifact={artifact} />
                                    <strong>{formatResonance(artifact.resonance)}</strong>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </aside>
    );
}

function SessionHeaderChips(props: { readonly metadata: Readonly<Record<string, unknown>> }): React.ReactElement {
    const briefingEmitted = stringValue(props.metadata.c_3_briefing_emitted);
    const trancheMode = stringValue(props.metadata.c_3_tranche_mode);
    const responseOrbit = stringValue(props.metadata.c_3_response_orbit);
    return (
        <span className="m4-session-header-chips">
            {props.metadata.c_3_klein_weighting !== undefined && (
                <span className="m4-session-chip m4-klein-weighting-chip" data-test="c_3_klein_weighting">
                    <span>c_3_klein_weighting</span>
                    <KleinWeightingSplitBar value={props.metadata.c_3_klein_weighting} />
                </span>
            )}
            {briefingEmitted && (
                <time className="m4-session-chip" dateTime={briefingEmitted} data-test="c_3_briefing_emitted">
                    c_3_briefing_emitted {briefingEmitted}
                </time>
            )}
            {trancheMode && (
                <span className="m4-session-chip" data-test="c_3_tranche_mode">
                    c_3_tranche_mode {trancheMode}
                </span>
            )}
            {responseOrbit && (
                <span className="m4-session-chip" data-test="c_3_response_orbit">
                    c_3_response_orbit {responseOrbit}
                </span>
            )}
        </span>
    );
}

function ArtifactMetadataChips(props: { readonly artifact: ArtifactDisplayRow }): React.ReactElement {
    const artifactRole = stringValue(props.artifact.metadata.c_4_artifact_role);
    const kairosContext = props.artifact.metadata.t_4_kairos_context;
    const bodySha = shortSha(props.artifact.bodySha256);
    return (
        <span className="m4-artifact-metadata-chips">
            {artifactRole && (
                <span className="m4-artifact-chip" data-test="c_4_artifact_role">
                    c_4_artifact_role {artifactRole}
                </span>
            )}
            {kairosContext !== undefined && (
                <span className="m4-artifact-chip" data-test="t_4_kairos_context">
                    t_4_kairos_context [[Kairos]]
                </span>
            )}
            {bodySha && (
                <span className="m4-artifact-chip" data-test="bodySha256">
                    sha {bodySha}
                </span>
            )}
        </span>
    );
}

function KleinWeightingSplitBar(props: { readonly value: unknown }): React.ReactElement {
    const weighting = normalizeKleinWeighting(props.value);
    return (
        <span
            className="m4-klein-weighting-bar"
            aria-label={`Klein weighting ${Math.round(weighting.left * 100)} / ${Math.round(weighting.right * 100)}`}
        >
            <span style={{ flexGrow: weighting.left }} />
            <span style={{ flexGrow: weighting.right }} />
        </span>
    );
}

function buildSessionBreakdowns(
    naraSurface: M4NaraSurface,
    dayContainer: NaraDayContainer | null
): readonly SessionBreakdown[] {
    const displayRows = buildArtifactDisplayRows(naraSurface, dayContainer);
    const lineage = arrayValue(naraSurface.daySummary.nowLineage);
    const claimedHandles = new Set<string>();
    const sessions: SessionBreakdown[] = [];
    for (const lineageEntry of lineage) {
        const lineageRecord = objectValue(lineageEntry);
        const key = sessionKeyFromLineage(lineageEntry);
        if (!key) {
            continue;
        }
        const artifacts = displayRows.filter(row => row.sessionKey === key || row.nowPath === key);
        artifacts.forEach(row => claimedHandles.add(row.artifactHandle));
        sessions.push({
            key,
            label: sessionLabel(lineageEntry, key),
            artifacts,
            metadata: mergeRecords(lineageRecord, firstMetadata(artifacts))
        });
    }
    const remainder = displayRows.filter(row => !claimedHandles.has(row.artifactHandle));
    const remainderBySession = new Map<string, ArtifactDisplayRow[]>();
    for (const row of remainder) {
        const key = row.sessionKey || row.nowPath || 'unassigned-session';
        remainderBySession.set(key, [...(remainderBySession.get(key) ?? []), row]);
    }
    for (const [key, artifacts] of remainderBySession) {
        sessions.push({
            key,
            label: compactSessionLabel(key),
            artifacts,
            metadata: firstMetadata(artifacts)
        });
    }
    if (sessions.length === 0) {
        return [{
            key: 'empty-day',
            label: 'No session lineage',
            artifacts: [],
            metadata: Object.freeze({})
        }];
    }
    return Object.freeze(sessions);
}

function buildArtifactDisplayRows(
    naraSurface: M4NaraSurface,
    dayContainer: NaraDayContainer | null
): readonly ArtifactDisplayRow[] {
    const rawByHandle = new Map(
        (dayContainer?.artifactTree ?? []).map(artifact => [artifact.artifactHandle, artifact] as const)
    );
    return Object.freeze(naraSurface.artifactTree.map(row => {
        const raw = rawByHandle.get(String(row.artifactHandle));
        const rowMetadata = objectValue(row.metadata) ?? row;
        const payload = objectValue(raw?.payload);
        const metadata = mergeRecords(objectValue(rowMetadata), payload);
        return Object.freeze({
            artifactHandle: String(row.artifactHandle ?? raw?.artifactHandle ?? ''),
            kind: String(row.kind ?? raw?.kind ?? 'journal'),
            title: String(row.title ?? raw?.title ?? row.kind ?? 'Artifact'),
            sessionKey: String(row.sessionKey ?? raw?.sessionKey ?? ''),
            nowPath: String(row.nowPath ?? raw?.nowPath ?? ''),
            bodySha256: stringValue(row.bodySha256) ?? raw?.bodySha256 ?? null,
            resonance: row.resonance ?? raw?.resonance,
            metadata
        });
    }));
}

function firstMetadata(artifacts: readonly ArtifactDisplayRow[]): Readonly<Record<string, unknown>> {
    return artifacts[0]?.metadata ?? Object.freeze({});
}

function sessionKeyFromLineage(value: unknown): string | null {
    const record = objectValue(value);
    return stringValue(record?.sessionKey) ??
        stringValue(record?.nowPath) ??
        stringValue(record?.path) ??
        stringValue(value);
}

function sessionLabel(value: unknown, fallback: string): string {
    const record = objectValue(value);
    return stringValue(record?.label) ??
        stringValue(record?.sessionKey) ??
        compactSessionLabel(fallback);
}

function compactSessionLabel(value: string): string {
    const parts = value.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? value;
}

function artifactKindIcon(kind: string): string {
    switch (kind) {
        case 'journal':
            return 'J';
        case 'dream':
            return 'D';
        case 'oracle':
            return 'O';
        case 'reminder':
            return 'R';
        case 'contemplative':
            return 'C';
        case 'agent-chat':
            return 'A';
        default:
            return '?';
    }
}

function shortSha(value: string | null): string | null {
    return value ? value.slice(0, 12) : null;
}

function normalizeKleinWeighting(value: unknown): { readonly left: number; readonly right: number } {
    const record = objectValue(value);
    const array = Array.isArray(value) ? value : null;
    const left =
        finiteRatio(record?.left) ??
        finiteRatio(record?.day) ??
        finiteRatio(record?.positive) ??
        finiteRatio(array?.[0]) ??
        finiteRatio(value) ??
        0.5;
    const right =
        finiteRatio(record?.right) ??
        finiteRatio(record?.night) ??
        finiteRatio(record?.negative) ??
        finiteRatio(array?.[1]) ??
        Math.max(0, 1 - left);
    const total = left + right;
    if (total <= 0) {
        return { left: 0.5, right: 0.5 };
    }
    return { left: left / total, right: right / total };
}

function finiteRatio(value: unknown): number | null {
    const number = typeof value === 'number'
        ? value
        : typeof value === 'string'
            ? Number(value)
            : NaN;
    if (!Number.isFinite(number)) {
        return null;
    }
    return Math.max(0, Math.min(1, number));
}

function mergeRecords(
    ...records: readonly (Readonly<Record<string, unknown>> | undefined)[]
): Readonly<Record<string, unknown>> {
    return Object.freeze(Object.assign({}, ...records.filter(Boolean)));
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function readProfileDayContainer(profile: MathemeHarmonicProfileBoundary | null): NaraDayContainer | null {
    const payload = objectValue(profile?.payload.m4NaraDayContainer);
    if (!payload || typeof payload.dayId !== 'string' || !Array.isArray(payload.artifactTree)) {
        return null;
    }
    return payload as unknown as NaraDayContainer;
}

function formatResonance(value: unknown): string {
    const record = objectValue(value);
    if (!record || record.state === 'pending-resonance') {
        return 'pending-resonance';
    }
    const numeric = typeof record.numeric === 'number' && Number.isFinite(record.numeric)
        ? record.numeric.toFixed(3)
        : null;
    const form = typeof record.conjugateFormCharacter === 'string'
        ? record.conjugateFormCharacter
        : null;
    return numeric && form ? `${numeric} ${form}` : 'pending-resonance';
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }
    return value as Readonly<Record<string, unknown>>;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
