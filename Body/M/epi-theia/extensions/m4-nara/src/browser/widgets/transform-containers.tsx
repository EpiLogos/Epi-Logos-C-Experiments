import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIVACY_CLASS,
    createNaraArtifact
} from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const TRACK_08 = 'M4TransformContainersCard' as const;

const TRANSFORM_CONTAINERS_WIDGET_ID = 'm4.nara.transformContainers';
const TRANSFORM_CONTAINERS_LABEL = 'M4 Transform Containers';

export type TransformContainerMode = 'bohm-dialogue' | 'talking-circle' | 'diamond';
export type TransformDirection = 'advance' | 'regress';

export type AlchemicalOperation =
    | 'nigredo'
    | 'solutio'
    | 'sublimatio'
    | 'calcinatio'
    | 'coagulatio'
    | 'fixatio'
    | 'separatio'
    | 'conjunctio';

export interface TransformStage {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly alchemical_op: AlchemicalOperation;
    readonly l2PrimeRegister: string;
}

export interface TransformContainerDefinition {
    readonly mode: TransformContainerMode;
    readonly label: string;
    readonly summary: string;
    readonly stages: readonly TransformStage[];
}

export interface TransformContainerState {
    readonly mode: TransformContainerMode;
    readonly stageIndex: number;
}

export interface TransformTransitionPayload {
    readonly container: TransformContainerMode;
    readonly fromStage: string;
    readonly toStage: string;
    readonly alchemical_op: AlchemicalOperation;
}

export interface TransformTransition {
    readonly payload: TransformTransitionPayload;
    readonly from: TransformStage;
    readonly to: TransformStage;
    readonly direction: TransformDirection;
    readonly nextState: TransformContainerState;
}

export interface TransformArtifactContext {
    readonly vaultRoot: string;
    readonly dayId: string;
    readonly nowPath: string;
    readonly sessionKey: string;
}

export interface M4TransformContainersCardProps {
    readonly definitions?: readonly TransformContainerDefinition[];
    readonly state: TransformContainerState;
    readonly status: 'pending-context' | 'ready' | 'writing' | 'error';
    readonly lastTransition: TransformTransitionPayload | null;
    readonly onSelectMode: (mode: TransformContainerMode) => void;
    readonly onAdvance: () => void;
    readonly onRegress: () => void;
}

export const TRANSFORM_CONTAINER_DEFINITIONS: readonly TransformContainerDefinition[] = Object.freeze([
    Object.freeze({
        mode: 'bohm-dialogue',
        label: 'Bohm Dialogue',
        summary: 'A shared inquiry field where thought learns to see its own movement.',
        stages: Object.freeze([
            stage('bohm-suspension', 'Suspension', 'The first mass of assumption is held without immediate correction.', 'nigredo', "L2-1' Earth"),
            stage('bohm-proprioception', 'Proprioception of thought', 'Thought senses itself as an event in the field.', 'separatio', "L2' relational operation"),
            stage('bohm-observer-collapse', 'Observer-observed collapse', 'The observer is included in what is being observed.', 'conjunctio', "L2' relational operation"),
            stage('bohm-shared-meaning', 'Shared meaning', 'Rigid positions dissolve into a common pool of sense.', 'solutio', "L2-2' Water"),
            stage('bohm-generative-field', 'Generative field', 'Subtle implications rise without being forced into conclusion.', 'sublimatio', "L2-3' Air")
        ])
    }),
    Object.freeze({
        mode: 'talking-circle',
        label: 'Talking Circle',
        summary: 'A turn-taking vessel where speech and silence share authority.',
        stages: Object.freeze([
            stage('circle-passage', 'Passage', 'The threshold is crossed from ordinary talk into witnessed exchange.', 'solutio', "L2-2' Water"),
            stage('circle-speaker-listener', 'Speaker-listener', 'Voice and reception become distinct responsibilities.', 'separatio', "L2' relational operation"),
            stage('circle-silence-speech', 'Silence-as-speech', 'The unsaid becomes an active carrier of meaning.', 'sublimatio', "L2-3' Air"),
            stage('circle-council-memory', 'Council memory', 'What has been spoken settles as a held communal form.', 'coagulatio', "L2-5' Salt")
        ])
    }),
    Object.freeze({
        mode: 'diamond',
        label: 'Diamond',
        summary: 'A four-gate inquiry that turns essence, personality, contraction, and opening together.',
        stages: Object.freeze([
            stage('diamond-essence', 'Essence', 'The fixed center is remembered before the pattern explains itself.', 'fixatio', "L2-5' Salt"),
            stage('diamond-personality', 'Personality', 'The formed self is seen as a workable crystallisation.', 'coagulatio', "L2-5' Salt"),
            stage('diamond-contraction', 'Contraction', 'The defensive knot is heated until the inessential burns away.', 'calcinatio', "L2-4' Fire"),
            stage('diamond-opening', 'Opening', 'The divided movement returns as a relational aperture.', 'conjunctio', "L2' relational operation")
        ])
    })
]);

export const M4TransformContainersCard: React.FC<M4TransformContainersCardProps> = props => {
    const {
        definitions = TRANSFORM_CONTAINER_DEFINITIONS,
        state,
        status,
        lastTransition,
        onSelectMode,
        onAdvance,
        onRegress
    } = props;
    const definition = findContainerDefinition(state.mode, definitions);
    const stageIndex = clampStageIndex(definition, state.stageIndex);
    const activeStage = definition.stages[stageIndex];
    const canRegress = stageIndex > 0;
    const canAdvance = stageIndex < definition.stages.length - 1;

    return (
        <section
            className={`m4-transform-containers-card ${privacyChromeClass('protected_local')}`}
            data-test="m4-transform-containers-card"
            data-track="TRACK_08"
            data-mode={definition.mode}
            data-stage={activeStage.id}
            data-alchemical-op={activeStage.alchemical_op}
            data-status={status}
        >
            <header className="m4-transform-containers-header">
                <div>
                    <h3>Transform Containers</h3>
                    <p>{definition.summary}</p>
                </div>
                <span className="m4-transform-op-chip" data-test="m4-transform-active-op">
                    {activeStage.alchemical_op}
                </span>
            </header>

            <div
                className="m4-transform-mode-strip mode-strip"
                role="tablist"
                aria-label="Transform container modes"
                data-test="m4-transform-mode-strip"
            >
                {definitions.map(item => (
                    <button
                        key={item.mode}
                        type="button"
                        role="tab"
                        aria-selected={item.mode === definition.mode}
                        aria-pressed={item.mode === definition.mode}
                        className={item.mode === definition.mode ? 'is-selected' : undefined}
                        data-test="m4-transform-container-mode"
                        data-mode={item.mode}
                        onClick={() => onSelectMode(item.mode)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <ol className="m4-transform-stage-list" data-test="m4-transform-stage-list">
                {definition.stages.map((item, index) => {
                    const isActive = index === stageIndex;
                    return (
                        <li
                            key={item.id}
                            className={isActive ? 'is-active' : undefined}
                            data-test="m4-transform-stage"
                            data-stage={item.id}
                            data-alchemical-op={item.alchemical_op}
                            aria-current={isActive ? 'step' : undefined}
                        >
                            <span>{index + 1}</span>
                            <div>
                                <strong>{item.label}</strong>
                                <p>{item.description}</p>
                                <small>{item.l2PrimeRegister} / {item.alchemical_op}</small>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <footer className="m4-transform-controls">
                <button
                    type="button"
                    onClick={onRegress}
                    disabled={!canRegress || status === 'writing'}
                    data-test="m4-transform-regress"
                >
                    Regress
                </button>
                <span data-test="m4-transform-position">
                    {stageIndex + 1} / {definition.stages.length}
                </span>
                <button
                    type="button"
                    onClick={onAdvance}
                    disabled={!canAdvance || status === 'writing'}
                    data-test="m4-transform-advance"
                >
                    Advance
                </button>
            </footer>

            {lastTransition ? (
                <aside className="m4-transform-last-transition" data-test="m4-transform-last-transition">
                    {lastTransition.fromStage} to {lastTransition.toStage} / {lastTransition.alchemical_op}
                </aside>
            ) : null}
        </section>
    );
};

@injectable()
export class TransformContainersWidget extends ReactWidget {
    static readonly ID = TRANSFORM_CONTAINERS_WIDGET_ID;
    static readonly LABEL = TRANSFORM_CONTAINERS_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected state: TransformContainerState = Object.freeze({
        mode: 'bohm-dialogue',
        stageIndex: 0
    });
    protected status: 'pending-context' | 'ready' | 'writing' | 'error' = 'pending-context';
    protected lastTransition: TransformTransitionPayload | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = TransformContainersWidget.ID;
        this.title.label = TransformContainersWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-transform-containers');
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.status = parseArtifactContext(context) ? 'ready' : 'pending-context';
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
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-transform-containers-root"
            >
                <M4TransformContainersCard
                    state={this.state}
                    status={this.status}
                    lastTransition={this.lastTransition}
                    onSelectMode={mode => this.selectMode(mode)}
                    onAdvance={() => this.move('advance')}
                    onRegress={() => this.move('regress')}
                />
            </div>
        );
    }

    protected selectMode(mode: TransformContainerMode): void {
        if (mode === this.state.mode) {
            return;
        }
        this.state = Object.freeze({ mode, stageIndex: 0 });
        this.lastTransition = null;
        this.update();
    }

    protected move(direction: TransformDirection): void {
        const transition = nextTransformTransition(this.state, direction);
        if (!transition) {
            return;
        }
        this.state = transition.nextState;
        this.lastTransition = transition.payload;
        const artifactContext = parseArtifactContext(this.context);
        if (!artifactContext) {
            this.status = 'pending-context';
            this.update();
            return;
        }
        this.status = 'writing';
        this.update();
        void writeTransformTransitionArtifact(artifactContext, transition.payload)
            .then(() => {
                this.status = 'ready';
                this.update();
            })
            .catch(() => {
                this.status = 'error';
                this.update();
            });
    }
}

export function nextTransformTransition(
    state: TransformContainerState,
    direction: TransformDirection,
    definitions: readonly TransformContainerDefinition[] = TRANSFORM_CONTAINER_DEFINITIONS
): TransformTransition | null {
    const definition = findContainerDefinition(state.mode, definitions);
    const fromIndex = clampStageIndex(definition, state.stageIndex);
    const offset = direction === 'advance' ? 1 : -1;
    const toIndex = fromIndex + offset;
    if (toIndex < 0 || toIndex >= definition.stages.length) {
        return null;
    }
    const from = definition.stages[fromIndex];
    const to = definition.stages[toIndex];
    return Object.freeze({
        payload: Object.freeze({
            container: definition.mode,
            fromStage: from.id,
            toStage: to.id,
            alchemical_op: to.alchemical_op
        }),
        from,
        to,
        direction,
        nextState: Object.freeze({
            mode: definition.mode,
            stageIndex: toIndex
        })
    });
}

export async function writeTransformTransitionArtifact(
    context: TransformArtifactContext,
    payload: TransformTransitionPayload
) {
    return createNaraArtifact({
        vaultRoot: context.vaultRoot,
        dayId: context.dayId,
        kind: 'contemplative',
        title: transformArtifactTitle(payload),
        body: transformArtifactBody(payload),
        nowPath: context.nowPath,
        sessionKey: context.sessionKey,
        privacyClass: PRIVACY_CLASS,
        payload: Object.freeze({ ...payload })
    });
}

export function parseArtifactContext(context: CoordinateContext): TransformArtifactContext | null {
    const handle = context.dayNowSessionHandle;
    const dayId = readDayId(handle);
    if (!dayId) {
        return null;
    }
    const vaultRoot = handle && handle.includes('/Pratibimba/Nara/')
        ? handle.slice(0, handle.indexOf('/Pratibimba/Nara/'))
        : process.cwd();
    return Object.freeze({
        vaultRoot,
        dayId,
        nowPath: readNowPath(handle, dayId),
        sessionKey: context.pointerAnchor ?? `session://m4-nara/transform-containers/${dayId}`
    });
}

function findContainerDefinition(
    mode: TransformContainerMode,
    definitions: readonly TransformContainerDefinition[]
): TransformContainerDefinition {
    return definitions.find(item => item.mode === mode) ?? definitions[0];
}

function clampStageIndex(definition: TransformContainerDefinition, stageIndex: number): number {
    if (!Number.isFinite(stageIndex)) {
        return 0;
    }
    return Math.max(0, Math.min(definition.stages.length - 1, Math.trunc(stageIndex)));
}

function stage(
    id: string,
    label: string,
    description: string,
    alchemical_op: AlchemicalOperation,
    l2PrimeRegister: string
): TransformStage {
    return Object.freeze({
        id,
        label,
        description,
        alchemical_op,
        l2PrimeRegister
    });
}

function transformArtifactTitle(payload: TransformTransitionPayload): string {
    const definition = findContainerDefinition(payload.container, TRANSFORM_CONTAINER_DEFINITIONS);
    const toStage = definition.stages.find(item => item.id === payload.toStage);
    return `${definition.label}: ${toStage?.label ?? payload.toStage}`;
}

function transformArtifactBody(payload: TransformTransitionPayload): string {
    const definition = findContainerDefinition(payload.container, TRANSFORM_CONTAINER_DEFINITIONS);
    const from = definition.stages.find(item => item.id === payload.fromStage);
    const to = definition.stages.find(item => item.id === payload.toStage);
    return [
        `Container: ${definition.label}`,
        `From: ${from?.label ?? payload.fromStage}`,
        `To: ${to?.label ?? payload.toStage}`,
        `L2' alchemical operator: ${payload.alchemical_op}`
    ].join('\n');
}

function readDayId(handle: string | null): string | null {
    if (!handle) {
        return null;
    }
    const dayMatch = /(\d{4}-\d{2}-\d{2})/.exec(handle);
    return dayMatch ? dayMatch[1] : null;
}

function readNowPath(handle: string | null, dayId: string): string {
    if (handle && handle.includes('now.md')) {
        return handle;
    }
    const [year, month, day] = dayId.split('-');
    return `Idea/Empty/Present/${day}-${month}-${year}/now.md`;
}
