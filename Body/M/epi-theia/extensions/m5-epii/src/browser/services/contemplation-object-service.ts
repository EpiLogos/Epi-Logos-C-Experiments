// 26.T26.12 - M5 contemplation object service + widget sub-components.
//
// The service is a passive PASU-scoped projector. It accepts the already
// assembled M5_ContemplationObject from S5' runtime context or from the bounded
// contemplate.fetch_object dispatch, validates privacy before committing it to
// state, then derives a render model for the M5' Epii widget.

import { injectable } from '@theia/core/shared/inversify';
import { isPrivacySafe } from '@pratibimba/ide-shell-m0-m5';

export const CONTEMPLATION_OBJECT_PRIVACY_CLASS = 'pasu-scoped';
export const CONTEMPLATE_FETCH_OBJECT_METHOD = 'contemplate.fetch_object';
export const S5_EPII_RUNTIME_CONTEXT_METHOD = "s5'.epii.runtimeContext";
export const GEODESIC_FIT_DENSE_THRESHOLD = 4;

const PLANET_NAMES: readonly string[] = Object.freeze([
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
]);

const CHAKRA_BODY_ZONES: readonly (readonly string[])[] = Object.freeze([
    Object.freeze(['crown', 'fontanelle', 'upper skull']),
    Object.freeze(['brow', 'eyes', 'forehead']),
    Object.freeze(['throat', 'neck', 'jaw']),
    Object.freeze(['heart', 'lungs', 'upper back']),
    Object.freeze(['solar plexus', 'stomach', 'diaphragm']),
    Object.freeze(['sacral bowl', 'hips', 'lower abdomen']),
    Object.freeze(['root', 'legs', 'pelvis']),
    Object.freeze(['whole-body axis', 'spine', 'field boundary'])
]);

const SKELETON_EVENT_TONES: Readonly<Record<string, string>> = Object.freeze({
    Additive137: 'gold',
    KaprekarPedagogyHit: 'emerald'
});

const SYNTAX_SEED_LABELS: readonly string[] = Object.freeze([
    'speech-3',
    'relationship-5',
    'action-7',
    'completion-9'
]);

export interface KairosSnapshot {
    readonly chronos_epoch?: number;
    readonly degree?: number;
    readonly planet_degrees: readonly number[];
    readonly planet_valid?: number;
}

export interface TarotDrawPayload {
    readonly drawn?: readonly number[];
    readonly draw_count?: number;
    readonly spread_type?: number;
    readonly cast_degree?: number;
}

export interface QTrajectoryTick {
    readonly tick: number;
    readonly w: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

export interface CodonTraceEntry {
    readonly codon: number;
    readonly label?: string;
    readonly m3_route?: string;
}

export interface VakProfilePair {
    readonly dispatch: string;
    readonly profile_generation: number;
    readonly profile_anchor: string;
    readonly acr_route?: string;
}

export interface ArchNineChargeInput {
    readonly pp: number;
    readonly nn?: number;
    readonly np?: number;
    readonly pn?: number;
    readonly mm?: number;
    readonly mp?: number;
    readonly pm?: number;
    readonly outer: number;
}

export interface ArchNineChargeState {
    readonly pp: number;
    readonly nn: number;
    readonly np: number;
    readonly pn: number;
    readonly outer: number;
    readonly total: number;
    readonly expected: number;
    readonly invariantPass: boolean;
}

export interface M5ContemplationObject {
    readonly privacyClass?: string | null;
    readonly session_id: string;
    readonly kairos_at_open: KairosSnapshot;
    readonly kairos_at_close: KairosSnapshot;
    readonly tarot_psyche_anchor: TarotDrawPayload;
    readonly q_composed_trajectory: readonly QTrajectoryTick[];
    readonly codon_trace: readonly CodonTraceEntry[];
    readonly vak_profile_pairs: readonly VakProfilePair[];
    readonly m1_charge_state: ArchNineChargeInput;
    readonly m1_2_skeleton_events_fired: readonly string[];
    readonly four_syntax_compliance_seeds: readonly string[];
}

export interface ContemplationRuntimeContext {
    readonly method?: string;
    readonly privacyClass?: string | null;
    readonly contemplationObject?: M5ContemplationObject | null;
    readonly payload?: {
        readonly contemplationObject?: M5ContemplationObject | null;
    } | null;
}

export interface ContemplationFetchRequest {
    readonly sessionId: string;
    readonly profileGeneration?: number | null;
}

export interface ContemplationFetchReceipt {
    readonly method?: string;
    readonly privacyClass?: string | null;
    readonly contemplationObject?: M5ContemplationObject | null;
    readonly payload?: {
        readonly contemplationObject?: M5ContemplationObject | null;
    } | null;
}

export interface ContemplationObjectDispatcher {
    (method: typeof CONTEMPLATE_FETCH_OBJECT_METHOD, request: ContemplationFetchRequest): Promise<ContemplationFetchReceipt>;
}

export interface KairosPlanetRow {
    readonly planet: string;
    readonly degree: number;
    readonly mod10: number;
    readonly valid: boolean;
}

export interface KairosWindowModel {
    readonly epoch: number | null;
    readonly degree: number | null;
    readonly planets: readonly KairosPlanetRow[];
}

export interface TarotPsycheCard {
    readonly card: number;
    readonly label: string;
    readonly decan: number;
    readonly chakra: number;
    readonly bodyZones: readonly string[];
}

export interface TarotPsycheAnchorModel {
    readonly spreadType: number | null;
    readonly castDegree: number | null;
    readonly cards: readonly TarotPsycheCard[];
}

export interface QComposedTrajectoryModel {
    readonly ticks: readonly QTrajectoryTick[];
    readonly dense: boolean;
    readonly geodesicFit: boolean;
    readonly shadowPoints: readonly string[];
}

export interface SkeletonEventModel {
    readonly name: string;
    readonly tone: string;
}

export interface SyntaxSeedModel {
    readonly label: string;
    readonly prompt: string;
}

export interface ContemplationObjectViewModel {
    readonly sessionId: string;
    readonly identityNarrative: string;
    readonly kairos: {
        readonly open: KairosWindowModel;
        readonly close: KairosWindowModel;
    };
    readonly tarotPsycheAnchor: TarotPsycheAnchorModel;
    readonly qComposedTrajectory: QComposedTrajectoryModel;
    readonly codonTrace: readonly CodonTraceEntry[];
    readonly vakProfilePairs: readonly VakProfilePair[];
    readonly archNineChargeState: ArchNineChargeState;
    readonly skeletonEventsFired: readonly SkeletonEventModel[];
    readonly fourSyntaxComplianceSeeds: readonly SyntaxSeedModel[];
}

@injectable()
export class ContemplationObjectService {
    private current: M5ContemplationObject | null = null;

    get object(): M5ContemplationObject | null {
        return this.current;
    }

    currentModel(): ContemplationObjectViewModel | null {
        return this.current ? createContemplationObjectViewModel(this.current) : null;
    }

    async acceptRuntimeContext(context: ContemplationRuntimeContext): Promise<ContemplationObjectViewModel> {
        const object = context.contemplationObject ?? context.payload?.contemplationObject ?? null;
        if (!object) {
            throw new Error('ContemplationObjectService rejected runtime context: missing contemplationObject');
        }
        return this.acceptObject(object, context.privacyClass ?? object.privacyClass ?? null);
    }

    async fetchObject(
        dispatch: ContemplationObjectDispatcher,
        request: ContemplationFetchRequest
    ): Promise<ContemplationObjectViewModel> {
        const receipt = await dispatch(CONTEMPLATE_FETCH_OBJECT_METHOD, request);
        const object = receipt.contemplationObject ?? receipt.payload?.contemplationObject ?? null;
        if (!object) {
            throw new Error('ContemplationObjectService rejected fetch receipt: missing contemplationObject');
        }
        return this.acceptObject(object, receipt.privacyClass ?? object.privacyClass ?? null);
    }

    acceptObject(
        object: M5ContemplationObject,
        privacyClass: string | null | undefined = object.privacyClass
    ): ContemplationObjectViewModel {
        enforcePasuPrivacy(privacyClass);
        this.current = Object.freeze({ ...object, privacyClass: privacyClass ?? CONTEMPLATION_OBJECT_PRIVACY_CLASS });
        return createContemplationObjectViewModel(this.current);
    }
}

export function enforcePasuPrivacy(privacyClass: string | null | undefined): void {
    if (!isPrivacySafe(privacyClass)) {
        throw new Error(`ContemplationObject rejected: privacy class "${privacyClass}" is not safe`);
    }
    if (privacyClass !== CONTEMPLATION_OBJECT_PRIVACY_CLASS) {
        throw new Error(`ContemplationObject rejected: privacy class "${privacyClass ?? 'unset'}" is not PASU-scoped`);
    }
}

export function createContemplationObjectViewModel(object: M5ContemplationObject): ContemplationObjectViewModel {
    enforcePasuPrivacy(object.privacyClass ?? CONTEMPLATION_OBJECT_PRIVACY_CLASS);
    return Object.freeze({
        sessionId: object.session_id,
        identityNarrative: identityNarrative(object.session_id),
        kairos: Object.freeze({
            open: buildKairosWindow(object.kairos_at_open),
            close: buildKairosWindow(object.kairos_at_close)
        }),
        tarotPsycheAnchor: buildTarotPsycheAnchor(object.tarot_psyche_anchor),
        qComposedTrajectory: buildQComposedTrajectory(object.q_composed_trajectory),
        codonTrace: Object.freeze([...object.codon_trace]),
        vakProfilePairs: Object.freeze([...object.vak_profile_pairs]),
        archNineChargeState: buildArchNineChargeState(object.m1_charge_state),
        skeletonEventsFired: Object.freeze(
            object.m1_2_skeleton_events_fired.map(name => Object.freeze({
                name,
                tone: SKELETON_EVENT_TONES[name] ?? 'default'
            }))
        ),
        fourSyntaxComplianceSeeds: Object.freeze(
            object.four_syntax_compliance_seeds.slice(0, 4).map((prompt, index) => Object.freeze({
                label: SYNTAX_SEED_LABELS[index] ?? `syntax-${index + 1}`,
                prompt
            }))
        )
    });
}

export function buildArchNineChargeState(input: ArchNineChargeInput): ArchNineChargeState {
    const nn = input.nn ?? input.mm ?? 0;
    const np = input.np ?? input.mp ?? 0;
    const pn = input.pn ?? input.pm ?? 0;
    const total = input.pp + nn + np + pn;
    const expected = 4 * input.outer;
    return Object.freeze({
        pp: input.pp,
        nn,
        np,
        pn,
        outer: input.outer,
        total,
        expected,
        invariantPass: total === expected
    });
}

function buildKairosWindow(snapshot: KairosSnapshot): KairosWindowModel {
    const mask = snapshot.planet_valid ?? ((1 << Math.min(snapshot.planet_degrees.length, PLANET_NAMES.length)) - 1);
    return Object.freeze({
        epoch: snapshot.chronos_epoch ?? null,
        degree: snapshot.degree ?? null,
        planets: Object.freeze(
            PLANET_NAMES.map((planet, index) => {
                const degree = finiteNumber(snapshot.planet_degrees[index], 0);
                return Object.freeze({
                    planet,
                    degree,
                    mod10: modulo(degree, 10),
                    valid: (mask & (1 << index)) !== 0
                });
            })
        )
    });
}

function buildTarotPsycheAnchor(draw: TarotDrawPayload): TarotPsycheAnchorModel {
    const drawCount = Math.min(draw.draw_count ?? draw.drawn?.length ?? 0, 3);
    const drawn = draw.drawn ?? [];
    return Object.freeze({
        spreadType: draw.spread_type ?? null,
        castDegree: draw.cast_degree ?? null,
        cards: Object.freeze(
            drawn.slice(0, drawCount).map(card => {
                const decan = modulo(card, 36);
                const chakra = modulo(decan, CHAKRA_BODY_ZONES.length);
                return Object.freeze({
                    card,
                    label: `Card ${card}`,
                    decan,
                    chakra,
                    bodyZones: CHAKRA_BODY_ZONES[chakra]
                });
            })
        )
    });
}

function buildQComposedTrajectory(ticks: readonly QTrajectoryTick[]): QComposedTrajectoryModel {
    const safeTicks = ticks.map(tick => Object.freeze({
        tick: tick.tick,
        w: finiteNumber(tick.w, 0),
        x: finiteNumber(tick.x, 0),
        y: finiteNumber(tick.y, 0),
        z: finiteNumber(tick.z, 0)
    }));
    const dense = safeTicks.length >= GEODESIC_FIT_DENSE_THRESHOLD;
    return Object.freeze({
        ticks: Object.freeze(safeTicks),
        dense,
        geodesicFit: dense,
        shadowPoints: Object.freeze(safeTicks.map(tick => `${tick.x.toFixed(2)},${tick.y.toFixed(2)}`))
    });
}

function identityNarrative(sessionId: string): string {
    return `ContemplationObject from session ${sessionId}. M5' assembles at session close via m5_compose_contemplation_object; gateway dispatches to Pi+Anima+Aletheia subagents for joint contemplation; LLM composes wisdom_delta XOR-folded into quintessence_hash to reseed next cycle's identity.`;
}

function finiteNumber(value: number | undefined, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function modulo(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
}

export {
    ArchNineChargeBar,
    CodonTraceList,
    ContemplationObjectViewer,
    FourSyntaxComplianceSeeds,
    KairosWindow,
    QComposedTrajectoryView,
    SkeletonEventsFiredList,
    TarotPsycheAnchor,
    VakProfilePairsTable
} from './contemplation-object-components';
