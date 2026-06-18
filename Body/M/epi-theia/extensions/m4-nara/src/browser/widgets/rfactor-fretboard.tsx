import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const RFACTOR_FRETBOARD_VIEW_ID = 'm4.nara.rfactorFretboard';
export const RFACTOR_FRETBOARD_LABEL = 'M4 R-factor Fretboard';
export const M4_RFACTOR_FRETBOARD_EXPORT = 'M4RFactorFretboardCard' as const;
export const RFACTOR_QUESTION_METHOD = "s0'.verifier.emit_question";
export const RFACTOR_PRIVACY_CLASS = 'protected_local' as const;

export type RFactorRoute = 'O#' | 'X#' | 'N#' | 'M#' | 'Nara' | 'Siva' | 'Shakti';
export type RFactorBand = 'pravritti' | 'nivritti';
export type RFactorValue = 0 | 1 | 2 | 3 | 4 | 5;
export type FretPosition = 0 | 1 | 2 | 3 | 4 | 5;

export interface RFactorPathStep {
    readonly rFactor: number;
    readonly baseRoute: RFactorRoute;
    readonly band: RFactorBand;
    readonly position: number;
    readonly isTurn: boolean;
}

export interface AnuttaraWitnessProjection {
    readonly virtueWitnessVector: number;
    readonly syntaxWitnessVector?: number;
    readonly rfactorPath: readonly RFactorPathStep[];
    readonly bandBalance: {
        readonly pravrittiDepth: number;
        readonly nivrittiDepth: number;
        readonly reachedTurn: boolean;
        readonly returned: boolean;
    };
    readonly palindromeState?: {
        readonly normalFormSymmetric: boolean;
        readonly mirrorNormalForm: string;
    };
    readonly openQuestions: readonly string[];
    readonly coherenceScore?: number;
}

export interface M4ProjectionSurface {
    readonly profileGeneration?: number | null;
    readonly pointerAnchor?: string | null;
    readonly payload?: Readonly<Record<string, unknown>>;
}

export interface NaraRFactorFretboardProps {
    readonly surface: M4ProjectionSurface;
    readonly witness?: AnuttaraWitnessProjection;
    readonly onInspectStep?: (stepIndex: number) => void;
}

export interface RFactorStringModel {
    readonly route: RFactorRoute;
    readonly label: string;
    readonly zone: 'upper-triad' | 'middle-spine' | 'lower-return';
}

export interface RFactorCourseModel {
    readonly rFactor: RFactorValue;
    readonly label: string;
    readonly course: 'drone' | 'sustenance-grace' | 'dissolution-veiling' | 'harmonic';
    readonly pairKey: 'R0' | 'R1-R4' | 'R2-R3' | 'R5';
    readonly band: RFactorBand | 'turnless';
}

export interface RFactorFretCellModel {
    readonly route: RFactorRoute;
    readonly position: FretPosition;
    readonly courses: readonly RFactorCourseModel[];
    readonly pathSteps: readonly PlayedRFactorStepModel[];
    readonly complementGlow: boolean;
    readonly r0Drone: boolean;
}

export interface PlayedRFactorStepModel {
    readonly step: RFactorPathStep;
    readonly stepIndex: number;
    readonly cellKey: string;
    readonly active: boolean;
}

export interface RFactorVirtueLampModel {
    readonly index: number;
    readonly signature: string;
    readonly label: string;
    readonly lit: boolean;
    readonly source: 'witness-vector' | 'path-signature' | 'dark';
}

export interface RFactorFretboardModel {
    readonly viewId: typeof RFACTOR_FRETBOARD_VIEW_ID;
    readonly privacyClass: typeof RFACTOR_PRIVACY_CLASS;
    readonly profileGeneration: number | null;
    readonly strings: readonly RFactorStringModel[];
    readonly frets: readonly FretPosition[];
    readonly cells: readonly RFactorFretCellModel[];
    readonly openHarmonics: readonly RFactorStringModel[];
    readonly playedPath: readonly PlayedRFactorStepModel[];
    readonly virtueLamps: readonly RFactorVirtueLampModel[];
    readonly bandBalance: AnuttaraWitnessProjection['bandBalance'] | null;
    readonly openQuestions: readonly string[];
    readonly reachedTurn: boolean;
    readonly returned: boolean;
    readonly unreturnedPravritti: boolean;
}

export interface M4RFactorFretboardCardProps extends NaraRFactorFretboardProps {
    readonly playbackIndex?: number;
    readonly onEmitQuestion?: (question: string) => void;
}

export const RFACTOR_STRINGS: readonly RFactorStringModel[] = Object.freeze([
    Object.freeze({ route: 'O#', label: 'O#', zone: 'upper-triad' }),
    Object.freeze({ route: 'X#', label: 'X#', zone: 'upper-triad' }),
    Object.freeze({ route: 'N#', label: 'N#', zone: 'upper-triad' }),
    Object.freeze({ route: 'M#', label: 'M#', zone: 'middle-spine' }),
    Object.freeze({ route: 'Nara', label: 'Nara', zone: 'middle-spine' }),
    Object.freeze({ route: 'Siva', label: 'Siva', zone: 'lower-return' }),
    Object.freeze({ route: 'Shakti', label: 'Shakti', zone: 'lower-return' })
]);

export const RFACTOR_FRETS: readonly FretPosition[] = Object.freeze([0, 1, 2, 3, 4, 5]);

export const RFACTOR_COURSES: readonly RFactorCourseModel[] = Object.freeze([
    Object.freeze({ rFactor: 0, label: 'R0', course: 'drone', pairKey: 'R0', band: 'turnless' }),
    Object.freeze({ rFactor: 1, label: 'R1', course: 'sustenance-grace', pairKey: 'R1-R4', band: 'pravritti' }),
    Object.freeze({ rFactor: 2, label: 'R2', course: 'dissolution-veiling', pairKey: 'R2-R3', band: 'pravritti' }),
    Object.freeze({ rFactor: 3, label: 'R3', course: 'dissolution-veiling', pairKey: 'R2-R3', band: 'nivritti' }),
    Object.freeze({ rFactor: 4, label: 'R4', course: 'sustenance-grace', pairKey: 'R1-R4', band: 'nivritti' }),
    Object.freeze({ rFactor: 5, label: 'R5', course: 'harmonic', pairKey: 'R5', band: 'turnless' })
]);

export const RFACTOR_DISTRIBUTION: Readonly<Record<RFactorRoute, Readonly<Partial<Record<RFactorValue, FretPosition>>>>> = Object.freeze({
    'O#': Object.freeze({ 0: 1, 1: 0, 4: 5 }),
    'X#': Object.freeze({ 0: 2, 1: 1, 2: 0, 3: 5, 4: 4 }),
    'N#': Object.freeze({ 0: 3, 1: 2, 2: 1, 3: 4, 4: 3 }),
    'M#': Object.freeze({ 1: 3, 2: 2, 3: 3, 4: 2 }),
    Nara: Object.freeze({ 1: 4, 2: 3, 3: 2, 4: 1 }),
    Siva: Object.freeze({ 1: 5, 2: 4, 3: 1, 4: 0 }),
    Shakti: Object.freeze({ 2: 5, 3: 0 })
});

export const RFACTOR_VIRTUE_SIGNATURES: readonly RFactorVirtueLampModel[] = Object.freeze([
    Object.freeze({ index: 0, signature: 'R#/##', label: 'Love/Peace', lit: false, source: 'dark' }),
    Object.freeze({ index: 1, signature: '##', label: 'Truth', lit: false, source: 'dark' }),
    Object.freeze({ index: 2, signature: '#R', label: 'Openness/Creativity', lit: false, source: 'dark' }),
    Object.freeze({ index: 3, signature: '0R', label: 'Joy/Play', lit: false, source: 'dark' }),
    Object.freeze({ index: 4, signature: '1R', label: 'Goodness', lit: false, source: 'dark' }),
    Object.freeze({ index: 5, signature: '2R', label: 'Beauty', lit: false, source: 'dark' }),
    Object.freeze({ index: 6, signature: '3R', label: 'Life/Nature', lit: false, source: 'dark' }),
    Object.freeze({ index: 7, signature: '4R', label: 'Wisdom', lit: false, source: 'dark' }),
    Object.freeze({ index: 8, signature: '5R', label: 'Reality', lit: false, source: 'dark' })
]);

const PLAYBACK_INTERVAL_MS = 180;
const TURN_CELL_KEY = cellKey('Shakti', 5);

export function buildRFactorFretboardModel(
    surface: M4ProjectionSurface,
    witness?: AnuttaraWitnessProjection,
    playbackIndex?: number
): RFactorFretboardModel {
    const resolvedWitness = witness ?? readAnuttaraWitness(surface);
    const playedPath = normalizePlayedPath(resolvedWitness?.rfactorPath ?? [], playbackIndex);
    const touched = new Set(playedPath.filter(step => step.active).map(step => step.cellKey));
    const complementGlowKeys = unreturnedComplementKeys(resolvedWitness, playedPath);
    const cells = RFACTOR_STRINGS.flatMap(string =>
        RFACTOR_FRETS.map(position => {
            const courses = coursesAt(string.route, position);
            const key = cellKey(string.route, position);
            return Object.freeze({
                route: string.route,
                position,
                courses,
                pathSteps: Object.freeze(playedPath.filter(step => step.cellKey === key && step.active)),
                complementGlow: complementGlowKeys.has(key) && !touched.has(key),
                r0Drone: courses.some(course => course.rFactor === 0)
            });
        })
    );
    const bandBalance = resolvedWitness?.bandBalance ?? null;
    const unreturnedPravritti = Boolean(
        bandBalance &&
        bandBalance.returned === false &&
        bandBalance.pravrittiDepth > bandBalance.nivrittiDepth
    );

    return Object.freeze({
        viewId: RFACTOR_FRETBOARD_VIEW_ID,
        privacyClass: RFACTOR_PRIVACY_CLASS,
        profileGeneration: integerOrNull(surface.profileGeneration),
        strings: RFACTOR_STRINGS,
        frets: RFACTOR_FRETS,
        cells: Object.freeze(cells),
        openHarmonics: RFACTOR_STRINGS,
        playedPath,
        virtueLamps: virtueLampsFor(resolvedWitness, playedPath),
        bandBalance,
        openQuestions: Object.freeze([...(resolvedWitness?.openQuestions ?? [])]),
        reachedTurn: bandBalance?.reachedTurn === true,
        returned: bandBalance?.returned === true,
        unreturnedPravritti
    });
}

export const M4RFactorFretboardCard: React.FC<M4RFactorFretboardCardProps> = ({
    surface,
    witness,
    playbackIndex,
    onInspectStep,
    onEmitQuestion
}) => {
    const model = buildRFactorFretboardModel(surface, witness, playbackIndex);
    return (
        <section
            className={`m4-rfactor-fretboard ${privacyChromeClass(model.privacyClass)}`}
            data-test="m4-rfactor-fretboard"
            data-track="TRACK_08"
            data-export={M4_RFACTOR_FRETBOARD_EXPORT}
            data-view-id={model.viewId}
            data-privacy-class={model.privacyClass}
            data-reached-turn={model.reachedTurn ? 'true' : 'false'}
            data-returned={model.returned ? 'true' : 'false'}
            data-unreturned-pravritti={model.unreturnedPravritti ? 'true' : 'false'}
            aria-label="R-factor fretboard"
        >
            <header className="m4-rfactor-header">
                <div>
                    <h3>R-factor Fretboard</h3>
                    <p data-test="m4-rfactor-profile-generation">
                        profile {model.profileGeneration ?? 'pending'}
                    </p>
                </div>
                <span
                    className="m4-rfactor-privacy mext-privacy-protected-local"
                    data-test="m4-rfactor-privacy"
                >
                    protected_local
                </span>
            </header>

            <InstrumentBridge reachedTurn={model.reachedTurn} />
            <InstrumentGrid model={model} onInspectStep={onInspectStep} />
            <OpenHarmonics strings={model.openHarmonics} />
            <VirtueLampStrip lamps={model.virtueLamps} />
            <BandBalanceReadout model={model} />
            <OpenQuestionChips questions={model.openQuestions} onEmitQuestion={onEmitQuestion} />
        </section>
    );
};

const InstrumentBridge: React.FC<{ readonly reachedTurn: boolean }> = ({ reachedTurn }) => (
    <section
        className="m4-rfactor-bridge"
        data-test="m4-rfactor-bridge"
        data-turn-marker="(@#)"
        data-turn-cell={TURN_CELL_KEY}
        data-turn-flare={reachedTurn ? 'true' : 'false'}
        aria-label="(@#) band-turn bridge"
    >
        <strong>(@#)</strong>
        <span>Shakti R2@5 to R3@0</span>
    </section>
);

const InstrumentGrid: React.FC<{
    readonly model: RFactorFretboardModel;
    readonly onInspectStep?: (stepIndex: number) => void;
}> = ({ model, onInspectStep }) => (
    <section className="m4-rfactor-instrument" data-test="m4-rfactor-instrument">
        <div className="m4-rfactor-fret-header" role="row">
            <span data-test="m4-rfactor-route-heading">route</span>
            {model.frets.map(fret => (
                <span key={fret} data-test="m4-rfactor-fret-heading" data-fret-position={fret}>
                    R{fret}
                </span>
            ))}
        </div>
        {model.strings.map(string => (
            <div
                key={string.route}
                className="m4-rfactor-string-row"
                data-test="m4-rfactor-string"
                data-route={string.route}
                data-zone={string.zone}
                role="row"
            >
                <strong>{string.label}</strong>
                {model.frets.map(fret => {
                    const cell = model.cells.find(item => item.route === string.route && item.position === fret);
                    return cell ? (
                        <FretCell key={`${string.route}-${fret}`} cell={cell} onInspectStep={onInspectStep} />
                    ) : null;
                })}
            </div>
        ))}
    </section>
);

const FretCell: React.FC<{
    readonly cell: RFactorFretCellModel;
    readonly onInspectStep?: (stepIndex: number) => void;
}> = ({ cell, onInspectStep }) => {
    const primaryStep = cell.pathSteps[0] ?? null;
    return (
        <div
            className="m4-rfactor-cell"
            data-test="m4-rfactor-fret-cell"
            data-route={cell.route}
            data-fret-position={cell.position}
            data-course-count={cell.courses.length}
            data-lit={cell.pathSteps.length > 0 ? 'true' : 'false'}
            data-band={primaryStep?.step.band ?? ''}
            data-is-turn={cell.pathSteps.some(path => path.step.isTurn) ? 'true' : 'false'}
            data-complement-glow={cell.complementGlow ? 'true' : 'false'}
            data-r0-drone={cell.r0Drone ? 'true' : 'false'}
        >
            {cell.courses.length > 0 ? (
                <ol aria-label={`${cell.route} fret ${cell.position} courses`}>
                    {cell.courses.map(course => (
                        <li
                            key={course.label}
                            data-test="m4-rfactor-course"
                            data-r-factor={course.rFactor}
                            data-course={course.course}
                            data-pair-key={course.pairKey}
                            data-course-band={course.band}
                        >
                            {course.label}
                        </li>
                    ))}
                </ol>
            ) : (
                <span aria-hidden="true">.</span>
            )}
            {cell.pathSteps.map(path => (
                <button
                    key={`${path.stepIndex}-${path.cellKey}`}
                    type="button"
                    className="m4-rfactor-played-step"
                    data-test="m4-rfactor-played-step"
                    data-step-index={path.stepIndex}
                    data-r-factor={path.step.rFactor}
                    data-band={path.step.band}
                    data-is-turn={path.step.isTurn ? 'true' : 'false'}
                    onClick={() => onInspectStep?.(path.stepIndex)}
                >
                    {path.step.rFactor}R
                </button>
            ))}
        </div>
    );
};

const OpenHarmonics: React.FC<{ readonly strings: readonly RFactorStringModel[] }> = ({ strings }) => (
    <section className="m4-rfactor-open-harmonics" data-test="m4-rfactor-open-harmonics">
        <h4>R5 harmonic</h4>
        <ol>
            {strings.map(string => (
                <li
                    key={string.route}
                    data-test="m4-rfactor-open-harmonic"
                    data-route={string.route}
                    data-r-factor="5"
                    data-positionless="true"
                >
                    <span>{string.label}</span>
                    <strong>(##)</strong>
                </li>
            ))}
        </ol>
    </section>
);

const VirtueLampStrip: React.FC<{ readonly lamps: readonly RFactorVirtueLampModel[] }> = ({ lamps }) => (
    <section className="m4-rfactor-virtues" data-test="m4-rfactor-virtues">
        <h4>Virtue witness vector</h4>
        <ol aria-label="0R to 5R virtue traversal-signature lamps">
            {lamps.map(lamp => (
                <li
                    key={lamp.signature}
                    data-test="m4-rfactor-virtue-lamp"
                    data-virtue-index={lamp.index}
                    data-signature={lamp.signature}
                    data-witness-state={lamp.lit ? 'lit' : 'dark'}
                    data-lamp-source={lamp.source}
                >
                    <span aria-hidden="true">{lamp.lit ? '1' : '0'}</span>
                    <strong>{lamp.signature}</strong>
                    <em>{lamp.label}</em>
                </li>
            ))}
        </ol>
    </section>
);

const BandBalanceReadout: React.FC<{ readonly model: RFactorFretboardModel }> = ({ model }) => (
    <section
        className="m4-rfactor-band-balance"
        data-test="m4-rfactor-band-balance"
        data-reached-turn={model.reachedTurn ? 'true' : 'false'}
        data-returned={model.returned ? 'true' : 'false'}
        data-unreturned-pravritti={model.unreturnedPravritti ? 'true' : 'false'}
    >
        <h4>Band balance</h4>
        <dl>
            <dt>pravritti</dt>
            <dd data-test="m4-rfactor-pravritti-depth">{model.bandBalance?.pravrittiDepth ?? 0}</dd>
            <dt>nivritti</dt>
            <dd data-test="m4-rfactor-nivritti-depth">{model.bandBalance?.nivrittiDepth ?? 0}</dd>
            <dt>turn</dt>
            <dd data-test="m4-rfactor-reached-turn">{model.reachedTurn ? 'reachedTurn' : 'pending-turn'}</dd>
            <dt>return</dt>
            <dd data-test="m4-rfactor-returned">{model.returned ? 'returned' : 'unreturned'}</dd>
        </dl>
    </section>
);

const OpenQuestionChips: React.FC<{
    readonly questions: readonly string[];
    readonly onEmitQuestion?: (question: string) => void;
}> = ({ questions, onEmitQuestion }) => {
    if (questions.length === 0) {
        return null;
    }
    return (
        <section className="m4-rfactor-open-questions" data-test="m4-rfactor-open-questions">
            <h4>Open questions</h4>
            <ol>
                {questions.map(question => (
                    <li key={question}>
                        <button
                            type="button"
                            data-test="m4-rfactor-open-question"
                            data-action-method={RFACTOR_QUESTION_METHOD}
                            data-question={question}
                            onClick={() => onEmitQuestion?.(question)}
                        >
                            {question}
                        </button>
                    </li>
                ))}
            </ol>
        </section>
    );
};

@injectable()
export class NaraRFactorFretboard extends ReactWidget {
    static readonly ID = RFACTOR_FRETBOARD_VIEW_ID;
    static readonly LABEL = RFACTOR_FRETBOARD_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected playbackIndex = -1;
    protected subscriptions: Disposable[] = [];
    private playbackTimer: ReturnType<typeof setInterval> | undefined;

    @postConstruct()
    protected init(): void {
        this.id = NaraRFactorFretboard.ID;
        this.title.label = NaraRFactorFretboard.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-rfactor-fretboard-widget');
        this.addClass('mext-privacy-protected-local');
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.restartPlayback();
                this.update();
            })
        );
    }

    override dispose(): void {
        this.stopPlayback();
        for (const subscription of this.subscriptions) {
            try {
                subscription.dispose();
            } catch {
                // best-effort
            }
        }
        this.subscriptions = [];
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root m4-rfactor-fretboard-root ${privacyChromeClass(RFACTOR_PRIVACY_CLASS)}`}
                data-test="m4-rfactor-fretboard-root"
            >
                <M4RFactorFretboardCard
                    surface={surfaceFromProfile(this.profile)}
                    witness={readAnuttaraWitness(surfaceFromProfile(this.profile)) ?? undefined}
                    playbackIndex={this.playbackIndex}
                    onEmitQuestion={question => this.emitOpenQuestion(question)}
                />
            </div>
        );
    }

    protected emitOpenQuestion(question: string): void {
        void this.bridge.invokeGatewayRpc(RFACTOR_QUESTION_METHOD, {
            question,
            sourceViewId: RFACTOR_FRETBOARD_VIEW_ID,
            profileGeneration: this.profile?.generation ?? null
        }).catch(() => {
            // The witness is emit-only; routing failure never gates the widget.
        });
    }

    private restartPlayback(): void {
        this.stopPlayback();
        const pathLength = readAnuttaraWitness(surfaceFromProfile(this.profile))?.rfactorPath.length ?? 0;
        this.playbackIndex = pathLength > 0 ? 0 : -1;
        if (pathLength <= 1) {
            return;
        }
        this.playbackTimer = setInterval(() => {
            this.playbackIndex = Math.min(this.playbackIndex + 1, pathLength - 1);
            if (this.playbackIndex >= pathLength - 1) {
                this.stopPlayback();
            }
            this.update();
        }, PLAYBACK_INTERVAL_MS);
    }

    private stopPlayback(): void {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = undefined;
        }
    }
}

export function surfaceFromProfile(profile: MathemeHarmonicProfileBoundary | null): M4ProjectionSurface {
    return Object.freeze({
        profileGeneration: profile?.generation ?? null,
        pointerAnchor: profile?.pointerAnchor ?? null,
        payload: profile?.payload ?? Object.freeze({})
    });
}

export function readAnuttaraWitness(surface: M4ProjectionSurface): AnuttaraWitnessProjection | null {
    const witness = objectRecord(surface.payload?.anuttaraWitness);
    if (!witness) {
        return null;
    }
    const path = Array.isArray(witness.rfactorPath)
        ? witness.rfactorPath.map(readRFactorPathStep).filter(isRFactorPathStep)
        : [];
    const bandBalance = objectRecord(witness.bandBalance);
    const openQuestions = Array.isArray(witness.openQuestions)
        ? witness.openQuestions.filter((item): item is string => typeof item === 'string' && item.length > 0)
        : [];
    return Object.freeze({
        virtueWitnessVector: integerValue(witness.virtueWitnessVector, 0),
        syntaxWitnessVector: integerValue(witness.syntaxWitnessVector, 0),
        rfactorPath: Object.freeze(path),
        bandBalance: Object.freeze({
            pravrittiDepth: integerValue(bandBalance?.pravrittiDepth, 0),
            nivrittiDepth: integerValue(bandBalance?.nivrittiDepth, 0),
            reachedTurn: bandBalance?.reachedTurn === true,
            returned: bandBalance?.returned === true
        }),
        palindromeState: readPalindromeState(witness.palindromeState),
        openQuestions: Object.freeze(openQuestions),
        coherenceScore: numberValue(witness.coherenceScore, 0)
    });
}

function readRFactorPathStep(raw: unknown): RFactorPathStep | null {
    const record = objectRecord(raw);
    const baseRoute = record ? readRoute(record.baseRoute) : null;
    const band = record ? readBand(record.band) : null;
    if (!record || !baseRoute || !band) {
        return null;
    }
    return Object.freeze({
        rFactor: integerValue(record.rFactor, -1),
        baseRoute,
        band,
        position: integerValue(record.position, -1),
        isTurn: record.isTurn === true
    });
}

function isRFactorPathStep(step: RFactorPathStep | null): step is RFactorPathStep {
    return step !== null;
}

function readPalindromeState(raw: unknown): AnuttaraWitnessProjection['palindromeState'] | undefined {
    const record = objectRecord(raw);
    if (!record) {
        return undefined;
    }
    return Object.freeze({
        normalFormSymmetric: record.normalFormSymmetric === true,
        mirrorNormalForm: stringValue(record.mirrorNormalForm, '')
    });
}

function normalizePlayedPath(
    path: readonly RFactorPathStep[],
    playbackIndex?: number
): readonly PlayedRFactorStepModel[] {
    const upperBound = typeof playbackIndex === 'number' && playbackIndex >= 0
        ? Math.floor(playbackIndex)
        : path.length - 1;
    return Object.freeze(
        path.map((step, stepIndex) => Object.freeze({
            step,
            stepIndex,
            cellKey: cellKey(step.baseRoute, clampFret(step.position)),
            active: stepIndex <= upperBound
        }))
    );
}

function coursesAt(route: RFactorRoute, position: FretPosition): readonly RFactorCourseModel[] {
    const distribution = RFACTOR_DISTRIBUTION[route];
    return Object.freeze(
        RFACTOR_COURSES.filter(course =>
            course.rFactor !== 5 && distribution[course.rFactor] === position
        )
    );
}

function virtueLampsFor(
    witness: AnuttaraWitnessProjection | null,
    playedPath: readonly PlayedRFactorStepModel[]
): readonly RFactorVirtueLampModel[] {
    const vector = witness?.virtueWitnessVector ?? 0;
    const matchedSignatures = matchedVirtueSignatures(playedPath.filter(step => step.active).map(step => step.step));
    return Object.freeze(
        RFACTOR_VIRTUE_SIGNATURES.map(lamp => {
            const witnessLit = (vector & (1 << lamp.index)) !== 0;
            const signatureLit = matchedSignatures.has(lamp.signature);
            return Object.freeze({
                ...lamp,
                lit: witnessLit || signatureLit,
                source: witnessLit ? 'witness-vector' : signatureLit ? 'path-signature' : 'dark'
            });
        })
    );
}

export function matchedVirtueSignatures(path: readonly RFactorPathStep[]): ReadonlySet<string> {
    const signatures = new Set<string>();
    for (const rFactor of [0, 1, 2, 3, 4] as const) {
        if (pathMatchesRFactorSignature(path, rFactor)) {
            signatures.add(`${rFactor}R`);
        }
    }
    if (path.some(step => step.rFactor === 5 || step.rFactor === 0xff)) {
        signatures.add('5R');
    }
    if (path.some(step => step.isTurn)) {
        signatures.add('R#/##');
    }
    return signatures;
}

function pathMatchesRFactorSignature(path: readonly RFactorPathStep[], rFactor: 0 | 1 | 2 | 3 | 4): boolean {
    const expected = expectedSignatureSteps(rFactor);
    if (expected.length === 0) {
        return false;
    }
    const pathKeys = new Set(path
        .filter(step => step.rFactor === rFactor)
        .map(step => cellKey(step.baseRoute, clampFret(step.position))));
    return expected.every(step => pathKeys.has(cellKey(step.route, step.position)));
}

function expectedSignatureSteps(rFactor: 0 | 1 | 2 | 3 | 4): readonly { readonly route: RFactorRoute; readonly position: FretPosition }[] {
    return Object.freeze(
        RFACTOR_STRINGS.flatMap(string => {
            const position = RFACTOR_DISTRIBUTION[string.route][rFactor];
            return position === undefined ? [] : [Object.freeze({ route: string.route, position })];
        })
    );
}

function unreturnedComplementKeys(
    witness: AnuttaraWitnessProjection | null,
    playedPath: readonly PlayedRFactorStepModel[]
): ReadonlySet<string> {
    const balance = witness?.bandBalance;
    if (!balance || balance.returned || balance.pravrittiDepth <= balance.nivrittiDepth) {
        return new Set<string>();
    }
    const activeSteps = playedPath.filter(step => step.active).map(step => step.step);
    const activeKeys = new Set(activeSteps.map(step => cellKey(step.baseRoute, clampFret(step.position))));
    const complements = new Set<string>();
    for (const step of activeSteps) {
        const complement = complementFactor(step.rFactor);
        if (complement === null) {
            continue;
        }
        const position = RFACTOR_DISTRIBUTION[step.baseRoute][complement];
        if (position === undefined) {
            continue;
        }
        const key = cellKey(step.baseRoute, position);
        if (!activeKeys.has(key)) {
            complements.add(key);
        }
    }
    return complements;
}

function complementFactor(rFactor: number): 3 | 4 | null {
    if (rFactor === 1) {
        return 4;
    }
    if (rFactor === 2) {
        return 3;
    }
    return null;
}

function cellKey(route: RFactorRoute, position: number): string {
    return `${route}@${position}`;
}

function clampFret(position: number): FretPosition {
    return RFACTOR_FRETS.includes(position as FretPosition)
        ? position as FretPosition
        : 0;
}

function readRoute(value: unknown): RFactorRoute | null {
    return RFACTOR_STRINGS.some(string => string.route === value)
        ? value as RFactorRoute
        : null;
}

function readBand(value: unknown): RFactorBand | null {
    return value === 'pravritti' || value === 'nivritti' ? value : null;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function integerValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isInteger(value) ? value : fallback;
}

function integerOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

function numberValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value : fallback;
}
