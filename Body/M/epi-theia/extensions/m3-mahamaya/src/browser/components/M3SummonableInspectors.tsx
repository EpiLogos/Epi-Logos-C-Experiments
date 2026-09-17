import * as React from 'react';
import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3-ARCHITECTURE §5.3/§5.5 — the six summonable inspectors for the M3'
// Mahamaya surface. Every numeric value is read from the profile bus
// (profile.payload.*). This component never embeds a codon, hexagram, or tarot
// mapping table: when a backend field has not yet landed (doc-ahead-landing) the
// inspector renders a readiness-ledger pending chip instead of inventing data.

export type M3InspectorId =
    | 'dinucleotide-matrix'
    | 'charge-quaternion'
    | 'twenty-four-spoke-ring-buffer'
    | 'major-arcana-chromosome'
    | 'dna-rna-phase'
    | 'per-suit-integral';

export interface M3DinucleotidePair {
    readonly pair: string;
    readonly sumValue: number;
    readonly differenceValue: number;
}

export interface M3DinucleotideMatrixModel {
    readonly pairs: readonly M3DinucleotidePair[];
    readonly activePair: string | null;
}

export interface M3ChargeQuaternionModel {
    // Raw Cl(4,2) charge components per codon_charge_quaternion: [pp, mm, mp, pm].
    readonly pp: number | null;
    readonly mm: number | null;
    readonly mp: number | null;
    readonly pm: number | null;
    readonly outerValue: number | null; // X — the outer-nucleotide I-Ching value
    readonly fourX: number | null; // backend-asserted 4*X invariant target
    readonly auditSum: number | null; // pp + mm + mp + pm
    readonly auditHolds: boolean | null; // auditSum === fourX
    readonly normalized: readonly number[] | null; // qCosmic [w, x, y, z]
}

export interface M3TwentyFourSpokeModel {
    readonly spokes: readonly M3SpokeEntry[];
    readonly activeSpokeIndex: number | null;
    readonly degree360: number | null;
    // 12-deep ring-buffer of the last degree720 positions (M3 Spanda memory).
    readonly ringBuffer: readonly number[];
}

export interface M3SpokeEntry {
    readonly spokeIndex: number;
    readonly degree: number;
    readonly backbone: boolean;
}

export interface M3MajorArcanaEntry {
    readonly cardId: number;
    readonly name: string;
    readonly chromosomePair: number; // 1..22 autosome
    readonly aminoAcidIndex: number | null;
}

export interface M3MajorArcanaModel {
    readonly entries: readonly M3MajorArcanaEntry[];
    readonly activeCardId: number | null;
}

export interface M3DnaRnaPhaseModel {
    readonly dnaRnaPhase: string | null;
    readonly transcriptionState: string | null;
    readonly aminoAcidCode: string | null;
}

export interface M3PerSuitIntegralModel {
    readonly cups: number | null;
    readonly wands: number | null;
    readonly pentacles: number | null;
    readonly swords: number | null;
    readonly total: number | null;
    readonly auditSum: number | null; // cups + wands + pentacles + swords
    readonly auditHolds: boolean | null; // auditSum === total
}

export interface M3SummonableInspectorModel {
    readonly id: M3InspectorId;
    readonly label: string;
    readonly register: string;
    readonly identityForm: string;
    readonly ready: boolean;
    readonly pendingFields: readonly string[];
    readonly dinucleotide: M3DinucleotideMatrixModel | null;
    readonly chargeQuaternion: M3ChargeQuaternionModel | null;
    readonly twentyFourSpoke: M3TwentyFourSpokeModel | null;
    readonly majorArcana: M3MajorArcanaModel | null;
    readonly dnaRnaPhase: M3DnaRnaPhaseModel | null;
    readonly perSuitIntegral: M3PerSuitIntegralModel | null;
}

export interface M3SummonableInspectorsModel {
    readonly inspectors: readonly M3SummonableInspectorModel[];
    readonly ready: boolean;
    readonly pendingFields: readonly string[];
    readonly readiness: MExtensionReadinessSnapshot;
}

export interface M3SummonableInspectorsProps {
    readonly profilePayload: Readonly<Record<string, unknown>> | undefined;
    readonly readiness: MExtensionReadinessSnapshot;
}

export function m3SummonableInspectorsFromProfilePayload(
    profilePayload: Readonly<Record<string, unknown>> | undefined,
    readiness: MExtensionReadinessSnapshot
): M3SummonableInspectorsModel {
    const payload = profilePayload ?? {};
    const inspectors: M3SummonableInspectorModel[] = [
        dinucleotideInspector(payload),
        chargeQuaternionInspector(payload),
        twentyFourSpokeInspector(payload),
        majorArcanaInspector(payload),
        dnaRnaPhaseInspector(payload),
        perSuitIntegralInspector(payload)
    ];
    const pendingFields = inspectors.flatMap(inspector => inspector.pendingFields);
    return Object.freeze({
        inspectors: Object.freeze(inspectors),
        ready: pendingFields.length === 0,
        pendingFields: Object.freeze(pendingFields),
        readiness
    });
}

export const M3SummonableInspectors: React.FC<M3SummonableInspectorsProps> = ({
    profilePayload,
    readiness
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(
        () => m3SummonableInspectorsFromProfilePayload(profilePayload, readiness),
        [profilePayload, readiness]
    );

    return (
        <article
            className="m3-summonable-inspectors"
            data-widget-id="pratibimba.m3-mahamaya:summonable-inspectors"
            data-ready={model.ready ? 'true' : 'false'}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>M3 summonable inspectors</h3>
                    <p style={subtitleStyle}>
                        Six profile-bus inspectors — no local codon, hexagram, or tarot tables
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="profile.m3SummonableInspectors"
                    state={model.ready ? 'ready' : 'pending'}
                    style={statePillStyle}
                >
                    {model.ready ? 'ready' : readiness.state}
                </ReadinessChip>
            </header>
            <div style={inspectorGridStyle}>
                {model.inspectors.map(inspector => (
                    <InspectorCard
                        key={inspector.id}
                        inspector={inspector}
                        readiness={model.readiness}
                    />
                ))}
            </div>
        </article>
    );
};

export default M3SummonableInspectors;

const InspectorCard: React.FC<{
    readonly inspector: M3SummonableInspectorModel;
    readonly readiness: MExtensionReadinessSnapshot;
}> = ({ inspector, readiness }) => (
    <section
        data-inspector={inspector.id}
        data-ready={inspector.ready ? 'true' : 'false'}
        aria-label={inspector.label}
        style={inspectorCardStyle}
    >
        <header style={inspectorHeaderStyle}>
            <h4 style={inspectorTitleStyle}>{inspector.label}</h4>
            <code style={registerStyle}>{inspector.register}</code>
        </header>
        <strong style={identityFormStyle}>{inspector.identityForm}</strong>
        <InspectorBody inspector={inspector} readiness={readiness} />
        {inspector.pendingFields.map(field => (
            <PendingFieldChip key={field} field={field} readiness={readiness} />
        ))}
    </section>
);

const InspectorBody: React.FC<{
    readonly inspector: M3SummonableInspectorModel;
    readonly readiness: MExtensionReadinessSnapshot;
}> = ({ inspector }) => {
    if (inspector.dinucleotide) {
        const m = inspector.dinucleotide;
        return (
            <dl style={factListStyle}>
                <dt>pairs</dt>
                <dd>{m.pairs.length} dinucleotide pairs (sum, difference)</dd>
                <dt>active pair</dt>
                <dd>{m.activePair ?? '—'}</dd>
            </dl>
        );
    }
    if (inspector.chargeQuaternion) {
        const m = inspector.chargeQuaternion;
        return (
            <dl style={factListStyle}>
                <dt>[pp, mm, mp, pm]</dt>
                <dd data-charge-components="true">
                    [{displayValue(m.pp)}, {displayValue(m.mm)}, {displayValue(m.mp)}, {displayValue(m.pm)}]
                </dd>
                <dt>pp+mm+mp+pm = 4X</dt>
                <dd data-charge-audit={auditState(m.auditHolds)}>
                    {displayValue(m.auditSum)} = 4·{displayValue(m.outerValue)} (
                    {displayValue(m.fourX)}) — {auditLabel(m.auditHolds)}
                </dd>
                <dt>normalized q_cosmic</dt>
                <dd>{m.normalized ? `[${m.normalized.map(displayValue).join(', ')}]` : '—'}</dd>
            </dl>
        );
    }
    if (inspector.twentyFourSpoke) {
        const m = inspector.twentyFourSpoke;
        return (
            <dl style={factListStyle}>
                <dt>24-spoke 15° lattice</dt>
                <dd>{m.spokes.length} spokes · active {displayValue(m.activeSpokeIndex)}</dd>
                <dt>12-deep ring-buffer</dt>
                <dd data-ring-buffer-depth={m.ringBuffer.length}>
                    {m.ringBuffer.length ? m.ringBuffer.map(displayValue).join(' → ') : '—'}
                </dd>
                <dt>degree360</dt>
                <dd>{displayValue(m.degree360)}</dd>
            </dl>
        );
    }
    if (inspector.majorArcana) {
        const m = inspector.majorArcana;
        return (
            <dl style={factListStyle}>
                <dt>Major Arcana → autosomes</dt>
                <dd>{m.entries.length} cards (1–22 chromosome pairs)</dd>
                <dt>active card</dt>
                <dd>{displayValue(m.activeCardId)}</dd>
            </dl>
        );
    }
    if (inspector.dnaRnaPhase) {
        const m = inspector.dnaRnaPhase;
        return (
            <dl style={factListStyle}>
                <dt>DNA / RNA phase</dt>
                <dd data-dna-rna-phase={m.dnaRnaPhase ?? 'pending'}>{m.dnaRnaPhase ?? '—'}</dd>
                <dt>transcription state</dt>
                <dd>{m.transcriptionState ?? '—'}</dd>
                <dt>amino-acid code</dt>
                <dd>{m.aminoAcidCode ?? '—'}</dd>
            </dl>
        );
    }
    if (inspector.perSuitIntegral) {
        const m = inspector.perSuitIntegral;
        return (
            <dl style={factListStyle}>
                <dt>Cups · Wands · Pentacles · Swords</dt>
                <dd>
                    {displayValue(m.cups)} · {displayValue(m.wands)} · {displayValue(m.pentacles)} ·{' '}
                    {displayValue(m.swords)}
                </dd>
                <dt>sum = 360</dt>
                <dd data-per-suit-audit={auditState(m.auditHolds)}>
                    {displayValue(m.auditSum)} = {displayValue(m.total)} — {auditLabel(m.auditHolds)}
                </dd>
            </dl>
        );
    }
    return null;
};

const PendingFieldChip: React.FC<{
    readonly field: string;
    readonly readiness: MExtensionReadinessSnapshot;
}> = ({ field, readiness }) => {
    const blocker = blockerIds(readiness).find(id => id === field || id.includes(field));
    return (
        <span
            data-pending-field={field}
            data-ledger-state={readiness.state}
            data-ledger-blocker={blocker ?? ''}
            style={pendingChipStyle}
        >
            <ReadinessChip bindingKey={field} state="pending">
                Track-10 readiness ledger: {readiness.state} awaits {field}
                {blocker ? ` (${blocker})` : ''}
            </ReadinessChip>
        </span>
    );
};

// ---- profile-bus model extractors (no mapping tables; pending when absent) ----

function dinucleotideInspector(payload: Readonly<Record<string, unknown>>): M3SummonableInspectorModel {
    const pending: string[] = [];
    const raw = arrayValue(payload.dinucleotideMatrix ?? payload.dinucleotide_matrix);
    let model: M3DinucleotideMatrixModel | null = null;
    if (!raw) {
        pending.push('profile.dinucleotideMatrix');
    } else {
        const pairs = raw
            .map(entry => objectValue(entry))
            .filter((entry): entry is Readonly<Record<string, unknown>> => entry !== null)
            .map(entry => Object.freeze({
                pair: stringValue(entry.pair) ?? '',
                sumValue: numberValue(entry.sumValue ?? entry.sum_value) ?? 0,
                differenceValue: numberValue(entry.differenceValue ?? entry.difference_value) ?? 0
            }))
            .filter(entry => entry.pair.length > 0);
        const mahamaya = objectValue(payload.mahamaya ?? payload.binary);
        model = Object.freeze({
            pairs: Object.freeze(pairs),
            activePair: stringValue(mahamaya?.activeDinucleotide ?? mahamaya?.active_dinucleotide)
        });
        if (pairs.length === 0) {
            pending.push('profile.dinucleotideMatrix.pairs');
        }
    }
    return inspector({
        id: 'dinucleotide-matrix',
        label: 'Dinucleotide matrix',
        register: 'profile.dinucleotideMatrix (M3_PAIR_MATRIX[16])',
        identityForm: '16 dinucleotide pairs · (sum, difference) evaluation engine',
        pending,
        dinucleotide: model
    });
}

function chargeQuaternionInspector(payload: Readonly<Record<string, unknown>>): M3SummonableInspectorModel {
    const pending: string[] = [];
    const raw = objectValue(payload.chargeQuaternion ?? payload.charge_quaternion);
    const normalized = numberArray(payload.qCosmic ?? payload.q_cosmic);
    let model: M3ChargeQuaternionModel | null = null;
    if (!raw) {
        pending.push('profile.chargeQuaternion');
        if (normalized) {
            // qCosmic alone gives the normalized face but not the raw 4X audit.
            model = Object.freeze({
                pp: null,
                mm: null,
                mp: null,
                pm: null,
                outerValue: null,
                fourX: null,
                auditSum: null,
                auditHolds: null,
                normalized
            });
        } else {
            pending.push('profile.qCosmic');
        }
    } else {
        const pp = numberValue(raw.pp);
        const mm = numberValue(raw.mm);
        const mp = numberValue(raw.mp);
        const pm = numberValue(raw.pm);
        const outerValue = numberValue(raw.outerValue ?? raw.outer_value);
        const fourX = numberValue(raw.fourX ?? raw.four_x);
        const components = [pp, mm, mp, pm];
        const auditSum = components.every((value): value is number => value !== null)
            ? components.reduce((acc, value) => acc + (value as number), 0)
            : null;
        model = Object.freeze({
            pp,
            mm,
            mp,
            pm,
            outerValue,
            fourX,
            auditSum,
            auditHolds: auditSum !== null && fourX !== null ? auditSum === fourX : null,
            normalized: normalized ?? numberArray(raw.normalized)
        });
        for (const [key, value] of [['pp', pp], ['mm', mm], ['mp', mp], ['pm', pm], ['fourX', fourX]] as const) {
            if (value === null) {
                pending.push(`profile.chargeQuaternion.${key}`);
            }
        }
    }
    return inspector({
        id: 'charge-quaternion',
        label: 'Charge quaternion (4X audit)',
        register: 'profile.chargeQuaternion + profile.qCosmic',
        identityForm: 'pp + mm + mp + pm = 4X',
        pending,
        chargeQuaternion: model
    });
}

function twentyFourSpokeInspector(payload: Readonly<Record<string, unknown>>): M3SummonableInspectorModel {
    const pending: string[] = [];
    const rawSpokes = arrayValue(payload.twentyFourSpokeLattice ?? payload.twenty_four_spoke_lattice);
    const rawBuffer = numberArray(payload.degree720RingBuffer ?? payload.degree720_ring_buffer);
    let model: M3TwentyFourSpokeModel | null = null;
    if (!rawSpokes) {
        pending.push('profile.twentyFourSpokeLattice');
    }
    if (!rawBuffer) {
        pending.push('profile.degree720RingBuffer');
    }
    if (rawSpokes || rawBuffer) {
        const spokes = (rawSpokes ?? [])
            .map(entry => objectValue(entry))
            .filter((entry): entry is Readonly<Record<string, unknown>> => entry !== null)
            .map(entry => Object.freeze({
                spokeIndex: numberValue(entry.spokeIndex ?? entry.spoke_index) ?? 0,
                degree: numberValue(entry.degree) ?? 0,
                backbone: entry.backbone === true || entry.is_backbone_node === true
            }));
        model = Object.freeze({
            spokes: Object.freeze(spokes),
            activeSpokeIndex: numberValue(payload.activeSpokeIndex ?? payload.active_spoke_index),
            degree360: numberValue(payload.degree360),
            ringBuffer: Object.freeze(rawBuffer ?? [])
        });
    }
    return inspector({
        id: 'twenty-four-spoke-ring-buffer',
        label: '24-spoke lattice + 12-deep ring-buffer',
        register: 'profile.twentyFourSpokeLattice + profile.degree720RingBuffer',
        identityForm: '24 backbone spokes @ 15° · last 12 degree720 positions',
        pending,
        twentyFourSpoke: model
    });
}

function majorArcanaInspector(payload: Readonly<Record<string, unknown>>): M3SummonableInspectorModel {
    const pending: string[] = [];
    const raw = arrayValue(payload.majorArcanaChromosome ?? payload.major_arcana_chromosome);
    let model: M3MajorArcanaModel | null = null;
    if (!raw) {
        pending.push('profile.majorArcanaChromosome');
    } else {
        const entries = raw
            .map(entry => objectValue(entry))
            .filter((entry): entry is Readonly<Record<string, unknown>> => entry !== null)
            .map(entry => Object.freeze({
                cardId: numberValue(entry.cardId ?? entry.card_id) ?? 0,
                name: stringValue(entry.name) ?? '',
                chromosomePair: numberValue(entry.chromosomePair ?? entry.chromosome_pair) ?? 0,
                aminoAcidIndex: numberValue(entry.aminoAcidIndex ?? entry.amino_acid_index)
            }))
            .filter(entry => entry.name.length > 0);
        const mahamaya = objectValue(payload.mahamaya ?? payload.binary);
        model = Object.freeze({
            entries: Object.freeze(entries),
            activeCardId: numberValue(mahamaya?.activeMajorArcanaId ?? mahamaya?.active_major_arcana_id)
        });
        if (entries.length === 0) {
            pending.push('profile.majorArcanaChromosome.entries');
        }
    }
    return inspector({
        id: 'major-arcana-chromosome',
        label: 'Major Arcana / chromosome',
        register: 'profile.majorArcanaChromosome (M3_Major_Arcana_Entry[22])',
        identityForm: '22 Major Arcana → 22 autosome chromosome pairs',
        pending,
        majorArcana: model
    });
}

function dnaRnaPhaseInspector(payload: Readonly<Record<string, unknown>>): M3SummonableInspectorModel {
    const pending: string[] = [];
    const mahamaya = objectValue(payload.mahamaya ?? payload.binary);
    const dnaRnaPhase = stringValue(mahamaya?.dnaRnaPhase ?? mahamaya?.dna_rna_phase);
    if (!dnaRnaPhase) {
        pending.push('profile.mahamaya.dnaRnaPhase');
    }
    const model: M3DnaRnaPhaseModel = Object.freeze({
        dnaRnaPhase,
        transcriptionState: stringValue(mahamaya?.transcriptionState ?? mahamaya?.transcription_state),
        aminoAcidCode: stringValue(mahamaya?.aminoAcidCode ?? mahamaya?.amino_acid_code)
    });
    return inspector({
        id: 'dna-rna-phase',
        label: 'DNA / RNA toggle',
        register: 'profile.mahamaya.dnaRnaPhase',
        identityForm: 'transcription phase toggle (DNA ⇄ RNA)',
        pending,
        dnaRnaPhase: model
    });
}

function perSuitIntegralInspector(payload: Readonly<Record<string, unknown>>): M3SummonableInspectorModel {
    const pending: string[] = [];
    const raw = objectValue(payload.perSuitIntegral ?? payload.per_suit_integral);
    let model: M3PerSuitIntegralModel | null = null;
    if (!raw) {
        pending.push('profile.perSuitIntegral');
    } else {
        const cups = numberValue(raw.cups);
        const wands = numberValue(raw.wands);
        const pentacles = numberValue(raw.pentacles);
        const swords = numberValue(raw.swords);
        const total = numberValue(raw.total);
        const components = [cups, wands, pentacles, swords];
        const auditSum = components.every((value): value is number => value !== null)
            ? components.reduce((acc, value) => acc + (value as number), 0)
            : null;
        model = Object.freeze({
            cups,
            wands,
            pentacles,
            swords,
            total,
            auditSum,
            auditHolds: auditSum !== null && total !== null ? auditSum === total : null
        });
        for (const [key, value] of [['cups', cups], ['wands', wands], ['pentacles', pentacles], ['swords', swords], ['total', total]] as const) {
            if (value === null) {
                pending.push(`profile.perSuitIntegral.${key}`);
            }
        }
    }
    return inspector({
        id: 'per-suit-integral',
        label: 'Per-suit integral',
        register: 'profile.perSuitIntegral',
        identityForm: 'cups + wands + pentacles + swords = 360',
        pending,
        perSuitIntegral: model
    });
}

function inspector(input: {
    readonly id: M3InspectorId;
    readonly label: string;
    readonly register: string;
    readonly identityForm: string;
    readonly pending: readonly string[];
    readonly dinucleotide?: M3DinucleotideMatrixModel | null;
    readonly chargeQuaternion?: M3ChargeQuaternionModel | null;
    readonly twentyFourSpoke?: M3TwentyFourSpokeModel | null;
    readonly majorArcana?: M3MajorArcanaModel | null;
    readonly dnaRnaPhase?: M3DnaRnaPhaseModel | null;
    readonly perSuitIntegral?: M3PerSuitIntegralModel | null;
}): M3SummonableInspectorModel {
    return Object.freeze({
        id: input.id,
        label: input.label,
        register: input.register,
        identityForm: input.identityForm,
        ready: input.pending.length === 0,
        pendingFields: Object.freeze([...input.pending]),
        dinucleotide: input.dinucleotide ?? null,
        chargeQuaternion: input.chargeQuaternion ?? null,
        twentyFourSpoke: input.twentyFourSpoke ?? null,
        majorArcana: input.majorArcana ?? null,
        dnaRnaPhase: input.dnaRnaPhase ?? null,
        perSuitIntegral: input.perSuitIntegral ?? null
    });
}

// ---- value coercion helpers (no symbolic lookup; pure type guards) ----

function blockerIds(readiness: MExtensionReadinessSnapshot): readonly string[] {
    const candidate = (readiness as { readonly blockerIds?: unknown }).blockerIds;
    return Array.isArray(candidate)
        ? candidate.filter((id): id is string => typeof id === 'string')
        : [];
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function arrayValue(value: unknown): readonly unknown[] | null {
    return Array.isArray(value) ? value : null;
}

function numberArray(value: unknown): readonly number[] | null {
    if (!Array.isArray(value)) {
        return null;
    }
    const numbers = value.filter((item): item is number => typeof item === 'number' && isFinite(item));
    return numbers.length === value.length && numbers.length > 0 ? Object.freeze(numbers) : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function displayValue(value: unknown): string {
    if (typeof value === 'number' || typeof value === 'string') {
        return String(value);
    }
    return '—';
}

function auditState(holds: boolean | null): string {
    if (holds === null) {
        return 'pending';
    }
    return holds ? 'holds' : 'violated';
}

function auditLabel(holds: boolean | null): string {
    if (holds === null) {
        return 'audit pending';
    }
    return holds ? 'audit holds' : 'audit violated';
}

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 16,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const statePillStyle: React.CSSProperties = {
    border: '1px solid var(--theia-charts-blue)',
    borderRadius: 999,
    color: 'var(--theia-charts-blue)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase'
};

const inspectorGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12
};

const inspectorCardStyle: React.CSSProperties = {
    display: 'grid',
    gap: 8,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editor-background)'
};

const inspectorHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
};

const inspectorTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const registerStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)',
    color: 'var(--theia-descriptionForeground)'
};

const identityFormStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const factListStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    margin: 0
};

const pendingChipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--theia-charts-yellow)',
    borderRadius: 999,
    color: 'var(--theia-charts-yellow)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};
