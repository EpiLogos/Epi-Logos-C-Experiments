import * as React from 'react';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
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
import {
    EXTENSION_ID,
    PRIVACY_CLASS,
    createNaraArtifact
} from '../../common';
import type { NaraArtifactEnvelope } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const LOGOS_CYCLE_VIEW_ID = 'm4.nara.logosCycle';
export const LOGOS_CYCLE_LABEL = 'M4 Logos Cycle';
export const M4_LOGOS_STAGE_RING_EXPORT = 'M4LogosStageRing' as const;

const LOGOS_STATUS_METHOD = 'nara.logos.status';
const LOGOS_ADVANCE_METHOD = 'nara.logos.advance';
const LOGOS_REGRESS_METHOD = 'nara.logos.regress';

export type LogosDirection = 'advance' | 'regress';
export type LogosCycleStatus = 'loading' | 'ready' | 'writing' | 'error';

export interface LogosStageDefinition {
    readonly id: string;
    readonly index: number;
    readonly label: string;
    readonly archetypeRatio: string;
    readonly inputSources: string;
    readonly task: string;
    readonly outputContract: string;
}

export interface LogosTransition {
    readonly direction: LogosDirection;
    readonly from: LogosStageDefinition;
    readonly to: LogosStageDefinition;
    readonly c_4_regression?: true;
}

export interface LogosArtifactContext {
    readonly vaultRoot: string;
    readonly dayId: string;
    readonly nowPath: string;
    readonly sessionKey: string;
}

export interface M4LogosStageRingProps {
    readonly stages: readonly LogosStageDefinition[];
    readonly currentStageId: string;
    readonly stageContents: Readonly<Record<string, string>>;
    readonly status: LogosCycleStatus;
    readonly lastTransition: LogosTransition | null;
    readonly errorMessage?: string | null;
    readonly onAdvance: () => void;
    readonly onRegress: () => void;
}

export const LOGOS_STAGES: readonly LogosStageDefinition[] = Object.freeze([
    Object.freeze({
        id: 'a-logos',
        index: 0,
        label: 'A-Logos',
        archetypeRatio: '0:5',
        inputSources: 'raw daily note, unedited oracle draws',
        task: 'Identify what is not yet spoken before interpretation.',
        outputContract: '1-3 pre-linguistic images or sensations'
    }),
    Object.freeze({
        id: 'pro-logos',
        index: 1,
        label: 'Pro-Logos',
        archetypeRatio: '1:4',
        inputSources: 'A-Logos output, outer-stroke journal excerpts',
        task: 'Find the theme wanting to emerge as one orienting question.',
        outputContract: 'one orienting question'
    }),
    Object.freeze({
        id: 'dia-logos',
        index: 2,
        label: 'Dia-Logos',
        archetypeRatio: '2:3',
        inputSources: 'orienting question, active lens interpretations',
        task: 'Let multiple lenses speak without premature conclusion.',
        outputContract: 'convergences and tensions across 2+ lenses'
    }),
    Object.freeze({
        id: 'logos',
        index: 3,
        label: 'Logos',
        archetypeRatio: '3:2',
        inputSources: 'Dia-Logos convergences',
        task: 'State what has been metabolized and owned in first person.',
        outputContract: '1-3 integration statements'
    }),
    Object.freeze({
        id: 'epi-logos',
        index: 4,
        label: 'Epi-Logos',
        archetypeRatio: '4:1',
        inputSources: "Logos output, yesterday's Epi-Logos output if present",
        task: 'Place the integration in the larger recurring arc.',
        outputContract: 'pattern statement and trajectory'
    }),
    Object.freeze({
        id: 'an-a-logos',
        index: 5,
        label: 'An-a-Logos',
        archetypeRatio: '5:0',
        inputSources: 'Epi-Logos output',
        task: 'Release the integration back to groundlessness.',
        outputContract: 'closing statement and kairos coordinate'
    })
]);

export const M4LogosStageRing: React.FC<M4LogosStageRingProps> = props => {
    const {
        stages,
        currentStageId,
        stageContents,
        status,
        lastTransition,
        errorMessage,
        onAdvance,
        onRegress
    } = props;
    const current = stageForId(currentStageId);
    const isWriting = status === 'writing';

    return (
        <section
            className={`m4-logos-stage-ring ${privacyChromeClass('protected_local')}`}
            data-test="m4-logos-stage-ring"
            data-track="TRACK_08"
            data-export={M4_LOGOS_STAGE_RING_EXPORT}
            data-status={status}
        >
            <header className="m4-logos-header">
                <div>
                    <h3>Logos Cycle</h3>
                    <p data-test="m4-logos-current-stage">
                        Current stage: <strong>{current.label}</strong>
                    </p>
                </div>
                <span className="m4-logos-privacy mext-privacy-protected-local">
                    protected-local
                </span>
            </header>

            <ol className="m4-logos-ring" aria-label="Six-stage Logos progression">
                {stages.map(stage => {
                    const active = stage.id === current.id;
                    const content = stageContents[stage.id] ?? '';
                    return (
                        <li
                            key={stage.id}
                            className={active ? 'is-active' : undefined}
                            data-test="m4-logos-stage-card"
                            data-stage={stage.id}
                            data-active={active ? 'true' : 'false'}
                        >
                            <article>
                                <header>
                                    <span>{stage.index + 1}</span>
                                    <div>
                                        <h4>{stage.label}</h4>
                                        <small>{stage.archetypeRatio}</small>
                                    </div>
                                </header>
                                <dl>
                                    <dt>Input</dt>
                                    <dd>{stage.inputSources}</dd>
                                    <dt>Task</dt>
                                    <dd>{stage.task}</dd>
                                    <dt>Output</dt>
                                    <dd>{stage.outputContract}</dd>
                                </dl>
                                <pre aria-readonly="true" data-test="m4-logos-stage-content">
                                    {content.trim() || 'No local inscription yet.'}
                                </pre>
                            </article>
                        </li>
                    );
                })}
            </ol>

            <footer className="m4-logos-controls">
                <button
                    type="button"
                    disabled={isWriting}
                    data-test="m4-logos-regress"
                    onClick={onRegress}
                >
                    Regress
                </button>
                <button
                    type="button"
                    disabled={isWriting}
                    data-test="m4-logos-advance"
                    onClick={onAdvance}
                >
                    Advance
                </button>
            </footer>

            {lastTransition ? (
                <p className="m4-logos-last-transition" data-test="m4-logos-last-transition">
                    {lastTransition.from.label}{' -> '}{lastTransition.to.label}
                    {lastTransition.c_4_regression ? ' | c_4_regression: true' : ''}
                </p>
            ) : null}
            {errorMessage ? (
                <aside className="m4-logos-error" data-test="m4-logos-error">
                    {errorMessage}
                </aside>
            ) : null}
        </section>
    );
};

@injectable()
export class LogosCycleWidget extends ReactWidget {
    static readonly ID = LOGOS_CYCLE_VIEW_ID;
    static readonly LABEL = LOGOS_CYCLE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected currentStageId = LOGOS_STAGES[0].id;
    protected stageContents: Readonly<Record<string, string>> = Object.freeze({});
    protected status: LogosCycleStatus = 'loading';
    protected lastTransition: LogosTransition | null = null;
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = LogosCycleWidget.ID;
        this.title.label = LogosCycleWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-logos-cycle');
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                void this.loadStageFiles();
            })
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.currentStageId = profile ? readCurrentStageId(profile) ?? this.currentStageId : this.currentStageId;
                this.update();
            })
        );
        void this.loadStatus();
        void this.loadStageFiles();
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
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-logos-cycle-root"
            >
                <M4LogosStageRing
                    stages={LOGOS_STAGES}
                    currentStageId={this.currentStageId}
                    stageContents={this.stageContents}
                    status={this.status}
                    lastTransition={this.lastTransition}
                    errorMessage={this.errorMessage}
                    onAdvance={() => this.commitTransition('advance')}
                    onRegress={() => this.commitTransition('regress')}
                />
            </div>
        );
    }

    protected async loadStatus(): Promise<void> {
        this.status = 'loading';
        this.update();
        try {
            const response = await this.bridge.invokeGatewayRpc(LOGOS_STATUS_METHOD, {
                privacyClass: PRIVACY_CLASS
            });
            this.currentStageId = resolveCurrentStageId(response, this.currentStageId);
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'ready';
            this.errorMessage = null;
        }
        this.update();
    }

    protected async loadStageFiles(): Promise<void> {
        const artifactContext = parseLogosArtifactContext(this.context);
        if (!artifactContext) {
            return;
        }
        this.stageContents = await readLogosStageFiles(artifactContext.vaultRoot, artifactContext.dayId);
        this.update();
    }

    protected async commitTransition(direction: LogosDirection): Promise<void> {
        const transition = nextLogosTransition(this.currentStageId, direction);
        const artifactContext = parseLogosArtifactContext(this.context);
        const payload = logosRpcPayload(artifactContext, transition);
        this.status = 'writing';
        this.update();
        try {
            if (direction === 'advance') {
                await this.bridge.invokeGatewayRpc(LOGOS_ADVANCE_METHOD, payload);
            } else {
                await this.bridge.invokeGatewayRpc(LOGOS_REGRESS_METHOD, payload);
            }
            if (artifactContext) {
                await writeLogosTransitionArtifact(artifactContext, transition);
                this.stageContents = await readLogosStageFiles(artifactContext.vaultRoot, artifactContext.dayId);
            }
            this.currentStageId = transition.to.id;
            this.lastTransition = transition;
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }
}

export function nextLogosTransition(currentStageId: string, direction: LogosDirection): LogosTransition {
    const from = stageForId(currentStageId);
    const offset = direction === 'advance' ? 1 : -1;
    const to = LOGOS_STAGES[(from.index + offset + LOGOS_STAGES.length) % LOGOS_STAGES.length];
    return Object.freeze({
        direction,
        from,
        to,
        ...(direction === 'regress' ? { c_4_regression: true as const } : {})
    });
}

export async function readLogosStageFiles(
    vaultRoot: string,
    dayId: string
): Promise<Readonly<Record<string, string>>> {
    const entries: [string, string][] = [];
    for (const stage of LOGOS_STAGES) {
        try {
            entries.push([stage.id, await readFile(logosStagePath(vaultRoot, dayId, stage), 'utf8')]);
        } catch {
            entries.push([stage.id, '']);
        }
    }
    return Object.freeze(Object.fromEntries(entries));
}

export function logosStagePath(vaultRoot: string, dayId: string, stage: LogosStageDefinition): string {
    return join(vaultRoot, 'Idea', 'Empty', 'Present', presentDaySegment(dayId), 'logos', `${stage.id}.md`);
}

export async function writeLogosTransitionArtifact(
    context: LogosArtifactContext,
    transition: LogosTransition
): Promise<NaraArtifactEnvelope> {
    await mkdir(dirname(logosStagePath(context.vaultRoot, context.dayId, transition.to)), { recursive: true });
    return createNaraArtifact({
        vaultRoot: context.vaultRoot,
        dayId: context.dayId,
        kind: 'contemplative',
        title: `Logos ${transition.direction}: ${transition.from.label} to ${transition.to.label}`,
        body: [
            'Logos transition',
            `Stage from: ${transition.from.label}`,
            `Stage to: ${transition.to.label}`,
            `Direction: ${transition.direction}`,
            briefingQlWalkLogosLine(transition)
        ].join('\n'),
        nowPath: context.nowPath,
        sessionKey: context.sessionKey,
        privacyClass: PRIVACY_CLASS,
        payload: logosTransitionPayload(transition)
    });
}

export function briefingQlWalkLogosLine(transition: LogosTransition): string {
    return `QL Walk: Logos stage ${transition.from.label} -> ${transition.to.label}`;
}

export function logosTransitionPayload(
    transition: LogosTransition
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        kind: 'contemplative',
        cycle: 'logos',
        direction: transition.direction,
        'stage-from': transition.from.label,
        'stage-to': transition.to.label,
        stageFrom: transition.from.id,
        stageTo: transition.to.id,
        fromArchetypeRatio: transition.from.archetypeRatio,
        toArchetypeRatio: transition.to.archetypeRatio,
        briefingQlWalk: briefingQlWalkLogosLine(transition),
        ...(transition.c_4_regression ? { c_4_regression: true } : {})
    });
}

export function parseLogosArtifactContext(context: CoordinateContext): LogosArtifactContext | null {
    const handle = context.dayNowSessionHandle;
    const dayId = readDayId(handle);
    if (!dayId) {
        return null;
    }
    const marker = '/Idea/Empty/Present/';
    const vaultRoot = handle && handle.includes(marker)
        ? handle.slice(0, handle.indexOf(marker))
        : process.cwd();
    return Object.freeze({
        vaultRoot,
        dayId,
        nowPath: readNowPath(handle, dayId),
        sessionKey: context.pointerAnchor ?? `session://m4-nara/logos-cycle/${dayId}`
    });
}

function logosRpcPayload(
    context: LogosArtifactContext | null,
    transition: LogosTransition
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        day_id: context?.dayId ?? null,
        stage_from: transition.from.id,
        stage_to: transition.to.id,
        stage_from_label: transition.from.label,
        stage_to_label: transition.to.label,
        privacyClass: PRIVACY_CLASS,
        ...(transition.c_4_regression ? { c_4_regression: true } : {})
    });
}

function resolveCurrentStageId(response: unknown, fallback: string): string {
    const record = objectRecord(response);
    const explicit = stringValue(record?.current_stage_id)
        ?? stringValue(record?.currentStageId)
        ?? stringValue(record?.stage_id)
        ?? stringValue(record?.stage);
    if (explicit && LOGOS_STAGES.some(stage => stage.id === explicit)) {
        return explicit;
    }
    const stageNumber = numberValue(record?.current_stage)
        ?? numberValue(record?.currentStage)
        ?? numberValue(record?.stage)
        ?? numberValue(record?.next_stage);
    if (stageNumber !== null) {
        return LOGOS_STAGES[Math.min(Math.max(Math.trunc(stageNumber), 0), LOGOS_STAGES.length - 1)].id;
    }
    return fallback;
}

function readCurrentStageId(profile: MathemeHarmonicProfileBoundary): string | null {
    const payload = profile.payload;
    const direct = stringValue(payload.logosStageId)
        ?? stringValue(payload.logos_stage_id)
        ?? stringValue(payload.currentLogosStage);
    if (direct && LOGOS_STAGES.some(stage => stage.id === direct)) {
        return direct;
    }
    const index = numberValue(payload.logosStageIndex) ?? numberValue(payload.logos_stage_index);
    return index === null ? null : LOGOS_STAGES[Math.min(Math.max(Math.trunc(index), 0), 5)].id;
}

function stageForId(stageId: string): LogosStageDefinition {
    return LOGOS_STAGES.find(stage => stage.id === stageId) ?? LOGOS_STAGES[0];
}

function presentDaySegment(dayId: string): string {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayId);
    return iso ? `${iso[3]}-${iso[2]}-${iso[1]}` : dayId;
}

function readDayId(handle: string | null): string | null {
    if (!handle) {
        return null;
    }
    const isoMatch = /(\d{4}-\d{2}-\d{2})/.exec(handle);
    if (isoMatch) {
        return isoMatch[1];
    }
    const presentMatch = /(\d{2})-(\d{2})-(\d{4})/.exec(handle);
    return presentMatch ? `${presentMatch[3]}-${presentMatch[2]}-${presentMatch[1]}` : null;
}

function readNowPath(handle: string | null, dayId: string): string {
    if (handle && handle.includes('now.md')) {
        return handle;
    }
    const [year, month, day] = dayId.split('-');
    return `Idea/Empty/Present/${day}-${month}-${year}/now.md`;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
