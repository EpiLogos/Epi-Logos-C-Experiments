/* 28.18 status-bar consumption contract: sessionKey/profileGeneration
   rendered in dispatch records MUST consume from bridge.cachedProfile?.generation,
   NOT from own widget state. 15.10 owns status-bar build; 28.18 adds consumption-only contract. */

import * as React from 'react';
import {
    injectable,
    inject,
    optional,
    postConstruct
} from '@theia/core/shared/inversify';
import { CommandService } from '@theia/core';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import {
    EXTENSION_ID,
    IDE_SHELL_WIDGET_IDS,
    isPrivacySafe
} from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';

/**
 * Autoresearch pane — Track 05 T4 / Task 28.T28.10.
 *
 * Surface for S5 autoresearch DTOs (epii-autoresearch-core). Consumes the
 * `s5'.improve.history` / `s5'.improve.status` gateway methods via
 * `KERNEL_BRIDGE_API.invokeCapability`.
 *
 * Autoresearch-as-concept contract (DR-M0-1): every candidate this pane
 * surfaces is **dry-run only**, carries the **requires_human** non-bypassable
 * gate, and is constrained by the agent's **forbidden_authority** list — it can
 * never directly mutate canon. Candidates are proposals that route through M5
 * atelier governance for human ratification; this pane is a read/disclosure
 * surface, not a write path.
 */

/** The permanent autoresearch-as-concept contract banner copy (deliverable a). */
export const AUTORESEARCH_CONTRACT_TEXT =
    'Autoresearch is dry-run only; requires_human non-bypassable; ' +
    'forbidden_authority enforces no direct canon mutation. Candidates ' +
    'surface as proposals that route through M5 atelier governance for ' +
    'human ratification per DR-M0-1.';

/**
 * The `forbidden_authority` clauses mirrored from the Epii agent contract
 * (`Body/S/S5/epii-agent/agent-contract.json`). Surfaced so the pane can never
 * be mistaken for a canon-mutation surface.
 */
export const FORBIDDEN_AUTHORITY = [
    'bypass_anima_dispatch_boundaries',
    'mutate_raw_runtime_state_without_review_record',
    'treat_anima_constitutional_agents_as_epii_subagents'
] as const;

/**
 * Per-capacity workflow filter vocabulary — mirrors `CapacityId` /
 * `capacity_workflow_registry()` in `epii-autoresearch-core`
 * (`capacity_workflows.rs`, serde `snake_case`).
 */
export const CAPACITY_WORKFLOWS = [
    { id: 'anuttara', label: 'M0 · Anuttara' },
    { id: 'paramasiva', label: 'M1 · Paramasiva' },
    { id: 'parashakti', label: 'M2 · Parashakti' },
    { id: 'mahamaya', label: 'M3 · Mahamaya' },
    { id: 'nara', label: 'M4 · Nara' },
    { id: 'epii_on_epii', label: "M5' · Epii-on-Epii" }
] as const;

export type CapacityId = (typeof CAPACITY_WORKFLOWS)[number]['id'];

/**
 * The Möbius seam stages a recompose pass walks (mirrors the `recompose_pass`
 * substrate in `recompose.rs`: surface → route → review → recompose-pass →
 * möbius seam closure). The active stage is highlighted in the ribbon.
 */
export const MOBIUS_STAGES = [
    'surface',
    'route',
    'review',
    'recompose-pass',
    'mobius-seam'
] as const;

export type MobiusStage = (typeof MOBIUS_STAGES)[number];

/**
 * Mock projection of the `s5'.improve.status` gateway method, used to drive the
 * Möbius-pass ribbon until the live status feed is wired. Shape kept compatible
 * with the real `ImprovementAccessSnapshot` (active count + run counters).
 */
export interface S5ImproveStatus {
    readonly status: string;
    readonly recomposePass: number;
    readonly activeStage: MobiusStage;
    readonly activeVectorCount: number;
    readonly mock: boolean;
}

const DEFAULT_IMPROVE_STATUS: S5ImproveStatus = {
    status: 's5′.improve.status (mock): awaiting human gate',
    recomposePass: 1,
    activeStage: 'recompose-pass',
    activeVectorCount: 0,
    mock: true
};

export interface AutoresearchCandidate {
    readonly id: string;
    readonly title: string;
    readonly score?: number;
    readonly privacyClass?: string;
    readonly source?: string;
    readonly coordinate?: string;
    readonly anchors?: readonly string[];
    /** Capacity workflow this candidate was surfaced under (deliverable c). */
    readonly capacity?: CapacityId;
    /** Recompose pass that produced this candidate (deliverable b/c). */
    readonly recomposePass?: number;
    /** Non-bypassable human-review gate flag (deliverable e). */
    readonly requiresHuman?: boolean;
}

/**
 * Möbius-pass ribbon (deliverable b). A horizontal ribbon showing the current
 * recompose pass number, the mocked `s5'.improve.status` integration, and an
 * active-stage indicator across the {@link MOBIUS_STAGES}.
 */
export interface MobiusPassRibbonProps {
    readonly passNumber: number;
    readonly status: string;
    readonly activeStage: string;
    readonly activeVectorCount?: number;
    readonly stages?: readonly string[];
}

export const MobiusPassRibbon: React.FC<MobiusPassRibbonProps> = ({
    passNumber,
    status,
    activeStage,
    activeVectorCount,
    stages = MOBIUS_STAGES
}) => (
    <div
        className="ide-shell-mobius-pass-ribbon"
        data-test="autoresearch-mobius-pass-ribbon"
    >
        <div className="ide-shell-mobius-pass-ribbon-head">
            <span
                className="ide-shell-mobius-pass-number"
                data-test="autoresearch-recompose-pass-number"
            >
                ∞ recompose-pass #{passNumber}
            </span>
            <span
                className="ide-shell-mobius-pass-status"
                data-test="autoresearch-improve-status"
            >
                {status}
                {activeVectorCount !== undefined && (
                    <> &middot; {activeVectorCount} active vector(s)</>
                )}
            </span>
        </div>
        <ol className="ide-shell-mobius-pass-stages">
            {stages.map(stage => (
                <li
                    key={stage}
                    className={
                        stage === activeStage
                            ? 'ide-shell-mobius-stage ide-shell-mobius-stage-active'
                            : 'ide-shell-mobius-stage'
                    }
                    data-test={`autoresearch-mobius-stage-${stage}`}
                    aria-current={stage === activeStage ? 'step' : undefined}
                >
                    {stage}
                </li>
            ))}
        </ol>
    </div>
);

@injectable()
export class AutoresearchPaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.AUTORESEARCH_PANE;
    static readonly LABEL = 'Autoresearch Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    /** Optional: used for the requires_human click-through to the Review pane. */
    @inject(CommandService) @optional()
    protected readonly commandService?: CommandService;

    protected candidates: AutoresearchCandidate[] = [];
    protected lastError: string | null = null;

    // --- Möbius-pass + per-capacity filter state (Task 28.T28.10) ---
    protected improveStatus: S5ImproveStatus = DEFAULT_IMPROVE_STATUS;
    protected selectedCapacity: CapacityId | 'all' = 'all';
    protected recomposePassFilter: number | 'all' = 'all';

    @postConstruct()
    protected init(): void {
        this.id = AutoresearchPaneWidget.ID;
        this.title.label = AutoresearchPaneWidget.LABEL;
        this.title.caption = AutoresearchPaneWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-autoresearch-pane');
    }

    async refreshHistory(): Promise<void> {
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'ide-shell-autoresearch-pane',
                params: { gatewayMethod: "s5'.improve.history" },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.recordPrivacyDrop(receipt.privacyClass);
                this.candidates = [];
                this.lastError = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                const list = Array.isArray(receipt.artifact)
                    ? (receipt.artifact as AutoresearchCandidate[])
                    : (receipt.artifact as { candidates?: AutoresearchCandidate[] } | undefined)?.candidates
                        ?? [];
                const accepted: AutoresearchCandidate[] = [];
                for (const c of list) {
                    if (isPrivacySafe(c.privacyClass)) {
                        accepted.push(c);
                    } else {
                        this.recordPrivacyDrop(c.privacyClass);
                    }
                }
                this.candidates = accepted;
                this.lastError = null;
            }
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    /**
     * Pull the `s5'.improve.status` projection that drives the Möbius-pass
     * ribbon. Falls back to {@link DEFAULT_IMPROVE_STATUS} (mock) when the
     * gateway method is unavailable or the payload is privacy-rejected.
     */
    async refreshImproveStatus(): Promise<void> {
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'ide-shell-autoresearch-pane',
                params: { gatewayMethod: "s5'.improve.status" },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.recordPrivacyDrop(receipt.privacyClass);
                this.improveStatus = DEFAULT_IMPROVE_STATUS;
            } else {
                this.improveStatus = this.coerceImproveStatus(receipt.artifact);
            }
        } catch {
            this.improveStatus = DEFAULT_IMPROVE_STATUS;
        }
        this.update();
    }

    protected coerceImproveStatus(artifact: unknown): S5ImproveStatus {
        const raw = (artifact ?? {}) as Partial<{
            status: string;
            recompose_pass: number;
            recomposePass: number;
            active_stage: string;
            activeStage: string;
            active_count: number;
            activeVectorCount: number;
        }>;
        const stageValue = (raw.active_stage ?? raw.activeStage) as MobiusStage | undefined;
        const activeStage = stageValue && (MOBIUS_STAGES as readonly string[]).includes(stageValue)
            ? stageValue
            : DEFAULT_IMPROVE_STATUS.activeStage;
        return {
            status: raw.status ?? DEFAULT_IMPROVE_STATUS.status,
            recomposePass: raw.recompose_pass ?? raw.recomposePass ?? DEFAULT_IMPROVE_STATUS.recomposePass,
            activeStage,
            activeVectorCount: raw.active_count ?? raw.activeVectorCount ?? 0,
            mock: false
        };
    }

    setCandidates(candidates: readonly AutoresearchCandidate[]): void {
        const accepted: AutoresearchCandidate[] = [];
        for (const c of candidates) {
            if (isPrivacySafe(c.privacyClass)) {
                accepted.push(c);
            } else {
                this.recordPrivacyDrop(c.privacyClass);
            }
        }
        this.candidates = accepted;
        this.update();
    }

    get visibleCandidateCount(): number {
        return this.candidates.length;
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    /** Distinct recompose passes present across surfaced candidates. */
    get recomposePasses(): number[] {
        const passes = new Set<number>();
        for (const c of this.candidates) {
            if (typeof c.recomposePass === 'number') {
                passes.add(c.recomposePass);
            }
        }
        passes.add(this.improveStatus.recomposePass);
        return [...passes].sort((a, b) => a - b);
    }

    /** Candidate list narrowed by the selected capacity + recompose pass. */
    get filteredCandidates(): AutoresearchCandidate[] {
        return this.candidates.filter(c => {
            if (this.selectedCapacity !== 'all' && c.capacity !== this.selectedCapacity) {
                return false;
            }
            if (this.recomposePassFilter !== 'all') {
                const pass = c.recomposePass ?? this.improveStatus.recomposePass;
                if (pass !== this.recomposePassFilter) {
                    return false;
                }
            }
            return true;
        });
    }

    setCapacityFilter(capacityId: string): void {
        const knownCapacity = CAPACITY_WORKFLOWS.some(capacity => capacity.id === capacityId);
        this.selectedCapacity = knownCapacity ? (capacityId as CapacityId) : 'all';
        this.update();
    }

    protected onCapacityChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = event.target.value;
        this.selectedCapacity = value === 'all' ? 'all' : (value as CapacityId);
        this.update();
    };

    protected onRecomposePassChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = event.target.value;
        this.recomposePassFilter = value === 'all' ? 'all' : Number(value);
        this.update();
    };

    /** requires_human click-through: route the human to the Review pane. */
    protected openReviewPane = (): void => {
        void this.commandService?.executeCommand(
            `pratibimba.${EXTENSION_ID}.review-pane.toggle`
        );
    };

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate
                bridge={this.bridge}
                widgetLabel={AutoresearchPaneWidget.LABEL}
            >
                {this.renderPane()}
            </IdeShellBridgeGate>
        );
    }

    protected renderPane(): React.ReactNode {
        const visible = this.filteredCandidates;
        return (
            <div className="ide-shell-widget-root" data-test="autoresearch-pane-root">
                <header className="ide-shell-widget-header">
                    <h3>{AutoresearchPaneWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s5'.improve.history"
                    />
                    <span
                        className="ide-shell-dry-run-badge"
                        data-test="autoresearch-dry-run-badge"
                        title="Autoresearch never mutates canon directly."
                    >
                        DRY-RUN ONLY
                    </span>
                    <span data-test="autoresearch-pane-count">
                        {this.candidates.length} candidate(s)
                    </span>
                </header>

                {/* (a) Autoresearch-as-concept contract banner — permanent. */}
                <section
                    className="ide-shell-autoresearch-as-concept"
                    data-test="autoresearch-as-concept"
                >
                    <p data-test="autoresearch-as-concept-text">
                        {AUTORESEARCH_CONTRACT_TEXT}
                    </p>
                    <p className="ide-shell-forbidden-authority">
                        <strong>forbidden_authority:</strong>{' '}
                        {FORBIDDEN_AUTHORITY.join(' · ')}
                    </p>
                </section>

                {/* (b) Möbius-pass ribbon. */}
                <MobiusPassRibbon
                    passNumber={this.improveStatus.recomposePass}
                    status={this.improveStatus.status}
                    activeStage={this.improveStatus.activeStage}
                    activeVectorCount={this.improveStatus.activeVectorCount}
                />

                {/* (c) Per-capacity + recompose-pass filters. */}
                <div
                    className="ide-shell-capacity-filter"
                    data-test="autoresearch-capacity-filter"
                >
                    <label>
                        Capacity
                        <select
                            data-test="autoresearch-capacity-select"
                            value={this.selectedCapacity}
                            onChange={this.onCapacityChange}
                        >
                            <option value="all">All capacities</option>
                            {CAPACITY_WORKFLOWS.map(cap => (
                                <option key={cap.id} value={cap.id}>
                                    {cap.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Recompose pass
                        <select
                            data-test="autoresearch-recompose-pass-filter"
                            value={String(this.recomposePassFilter)}
                            onChange={this.onRecomposePassChange}
                        >
                            <option value="all">All passes</option>
                            {this.recomposePasses.map(pass => (
                                <option key={pass} value={String(pass)}>
                                    pass #{pass}
                                </option>
                            ))}
                        </select>
                    </label>
                    <span data-test="autoresearch-filtered-count">
                        {visible.length} shown
                    </span>
                </div>

                {this.lastError !== null && (
                    <p className="ide-shell-error" data-test="autoresearch-pane-error">
                        {this.lastError}
                    </p>
                )}
                {visible.length === 0 ? (
                    <p
                        className="ide-shell-widget-empty"
                        data-test="autoresearch-pane-empty"
                    >
                        No autoresearch candidates surfaced.
                    </p>
                ) : (
                    <ul data-test="autoresearch-pane-list">
                        {visible.map(c => (
                            <li
                                key={c.id}
                                data-test={`autoresearch-candidate-${c.id}`}
                            >
                                <strong>{c.title}</strong>
                                {/* (e) requires_human gold badge → Review pane. */}
                                {c.requiresHuman && (
                                    <button
                                        type="button"
                                        className="ide-shell-gold-badge"
                                        data-test={`autoresearch-requires-human-${c.id}`}
                                        title="Non-bypassable human gate — open the Review pane to ratify."
                                        onClick={this.openReviewPane}
                                    >
                                        requires_human — review
                                    </button>
                                )}
                                {c.capacity && (
                                    <span className="ide-shell-capacity-chip">
                                        {' '}
                                        [{c.capacity}]
                                    </span>
                                )}
                                {c.score !== undefined && (
                                    <span> — score: {c.score.toFixed(3)}</span>
                                )}
                                {c.recomposePass !== undefined && (
                                    <span> — pass #{c.recomposePass}</span>
                                )}
                                {c.coordinate && (
                                    <span>
                                        {' '}
                                        — coordinate: <code>{c.coordinate}</code>
                                    </span>
                                )}
                                {c.anchors && c.anchors.length > 0 && (
                                    <p>anchors: {c.anchors.join(' | ')}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
