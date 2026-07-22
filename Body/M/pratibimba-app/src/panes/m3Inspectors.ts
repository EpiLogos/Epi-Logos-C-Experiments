/**
 * Coordinate: M' M3' (six summonable inspectors + four depth-views — Track 04.T4.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the M3' inspector stack over the profile bus — the carrier
 *   equivalent of the frozen `buildM3ProjectionSurface` contract: six
 *   summonable inspectors (dinucleotide-matrix · charge-quaternion/4X ·
 *   24-spoke+ring-buffer · Major-Arcana/chromosome · DNA/RNA phase ·
 *   per-suit integral) and four depth-view modes (flat-clock-debug ·
 *   lens-annulus · toroidal-world · hopf-identity). LAW: ZERO hardcoded
 *   codon/hexagram/tarot mapping tables — every value is a bussed kernel
 *   write (`mahamaya`, `codonRotationProjection`, `qCosmic`, clock fields)
 *   or pure arithmetic on one (spoke = ⌊degree360/15⌋); anything the bus
 *   does not carry renders an explicit `pending-*` chip (Major-Arcana map,
 *   raw i8 charges, ring history, full 16×16 matrix labels — kernel-owned).
 *   Integral labels (84+96+88+92=360) are register CITATIONS, not sums.
 * Does NOT own: the mappings (epi-lib m3 LUTs), the wheel renderers
 *   (Tranche 4.3 / Track 24), gateway I/O, flexlayout.
 */

export type M3InspectorId =
    | 'dinucleotide-matrix'
    | 'charge-quaternion'
    | 'spoke-ring-buffer'
    | 'major-arcana'
    | 'dna-rna-phase'
    | 'suit-integral';

export const M3_INSPECTOR_ORDER: readonly M3InspectorId[] = [
    'dinucleotide-matrix',
    'charge-quaternion',
    'spoke-ring-buffer',
    'major-arcana',
    'dna-rna-phase',
    'suit-integral'
];

export type M3DepthView =
    | 'flat-clock-debug'
    | 'lens-annulus'
    | 'toroidal-world'
    | 'hopf-identity';

export const M3_DEPTH_VIEW_ORDER: readonly M3DepthView[] = [
    'flat-clock-debug',
    'lens-annulus',
    'toroidal-world',
    'hopf-identity'
];

/** Per-suit integrals — register citation (m3 canon 84+96+88+92=360), never
 *  summed locally; the ACTIVE suit index is bussed arithmetic (codonId >> 4). */
export const SUIT_INTEGRAL_CITATION = Object.freeze({
    label: '84 + 96 + 88 + 92 = 360',
    provenance: 'M3 per-suit integral law (m3.c suit constants) — register citation'
});

interface MahamayaSlice {
    readonly codonId: number;
    readonly codon: string | null;
    /** Fu-Xi binary address (0..63, `upper<<3|lower`) — the raw bus ordering. */
    readonly hexagramId: number;
    /** King Wen ordinal (1..64) of `hexagramId`, translated by the kernel-owned
     *  `KING_WEN_FROM_ADDRESS64` LUT. Nullable so a legacy gateway that predates
     *  the dual-ordering bus does not void the whole (shared) M3 slice. */
    readonly kingWen: number | null;
    readonly upperTrigram: number;
    readonly lowerTrigram: number;
    readonly nucleotideBits: readonly number[];
    readonly dnaRnaPhase: string;
    readonly lineIndex: number;
    readonly lineChangeOperatorAddress: number;
    readonly roundTripLoss: boolean;
    readonly datasetLutState: string | null;
}

export interface M3InspectorsViewModel {
    readonly state: 'ready' | 'pending-mahamaya';
    readonly mahamaya: MahamayaSlice | null;
    /** charge-quaternion inspector: the bussed q_cosmic verbatim; raw i8
     *  charges (for the pp+nn+np+pn = 4X audit) are not bussed → pending. */
    readonly qCosmic: readonly number[] | null;
    readonly fourXAudit: 'pending-raw-charges';
    /** 24-spoke lattice: spoke = ⌊degree360/15⌋ (pure arithmetic on the bus
     *  clock); the 12-deep ring HISTORY is not bussed → pending. */
    readonly activeSpoke: number | null;
    readonly ringDepth: number | null;
    readonly ringHistory: 'pending-ring-history';
    /** Major-Arcana map is kernel-owned and not yet bussed. */
    readonly majorArcana: 'pending-major-arcana-map';
    /** 37.7 honest deferral: the RNA U-codon *family* — the T→U transcriptional
     *  variant expansion (Track-24 RNA space) — is not yet built/bussed → a
     *  pending chip. The per-codon RNA-capable flag itself renders off the bus
     *  (mahamaya.codon carries the T that `m3_codon_is_rna_capable` keys on,
     *  mahamaya.dnaRnaPhase the phase); only the family expansion defers. */
    readonly rnaCodonFamily: 'pending-rna-codon-family';
    /** 37.7 honest deferral: the chromosome graph (descent-engine chromosome
     *  nodes, Track-23.18) is not yet built/bussed → a pending chip, split from
     *  the Major-Arcana chip so the two defer independently. */
    readonly chromosomeGraph: 'pending-chromosome-graph';
    /** lens-annulus depth view reads the 472-state projection. */
    readonly lensMode: { lens: number; mode: number; surfaceIndex: number } | null;
    readonly toroidal: { degree720: number; helixSheet: number } | null;
    readonly suitIndex: number | null;
    readonly generation: number;
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function profileRoot(payload: Readonly<Record<string, unknown>>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? (payload as Record<string, unknown>);
}

function mahamayaFromPayload(root: Record<string, unknown>): MahamayaSlice | null {
    const m = objectValue(root.mahamaya) ?? objectValue(root.binary);
    if (!m) {
        return null;
    }
    const codonId = num(m.codonId);
    const hexagramId = num(m.hexagramId);
    const upperTrigram = num(m.upperTrigram);
    const lowerTrigram = num(m.lowerTrigram);
    const lineIndex = num(m.lineIndex);
    const lineChange = num(m.lineChangeOperatorAddress);
    const bits = Array.isArray(m.nucleotideBits) ? m.nucleotideBits.filter(
        (b): b is number => typeof b === 'number'
    ) : null;
    if (
        codonId === null ||
        hexagramId === null ||
        upperTrigram === null ||
        lowerTrigram === null ||
        lineIndex === null ||
        lineChange === null ||
        !bits ||
        bits.length !== 3 ||
        typeof m.dnaRnaPhase !== 'string'
    ) {
        return null;
    }
    return {
        codonId,
        codon: typeof m.codon === 'string' ? m.codon : null,
        hexagramId,
        kingWen: num(m.kingWen),
        upperTrigram,
        lowerTrigram,
        nucleotideBits: bits,
        dnaRnaPhase: m.dnaRnaPhase,
        lineIndex,
        lineChangeOperatorAddress: lineChange,
        roundTripLoss: m.roundTripLoss === true,
        datasetLutState: typeof m.datasetLutState === 'string' ? m.datasetLutState : null
    };
}

/** Build the M3 inspectors view model — one bus payload in, six windows out. */
export function buildM3InspectorsView(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
}): M3InspectorsViewModel {
    const root = profileRoot(input.payload);
    const mahamaya = mahamayaFromPayload(root);
    const qCosmicRaw = Array.isArray(root.qCosmic) ? root.qCosmic : null;
    const qCosmic =
        qCosmicRaw && qCosmicRaw.length === 4 && qCosmicRaw.every(v => typeof v === 'number')
            ? (qCosmicRaw as number[])
            : null;
    const degree360 = num(root.degree360);
    const degree720 = num(root.degree720);
    const tick12 = num(root.tick12);
    const crp = objectValue(root.codonRotationProjection);
    const lens = crp ? num(crp.lens) : null;
    const mode = crp ? num(crp.mode) : null;
    const surfaceIndex = crp ? num(crp.surfaceIndex) : null;

    return Object.freeze({
        state: mahamaya ? ('ready' as const) : ('pending-mahamaya' as const),
        mahamaya,
        qCosmic,
        fourXAudit: 'pending-raw-charges' as const,
        activeSpoke: degree360 === null ? null : Math.floor(degree360 / 15),
        ringDepth: tick12,
        ringHistory: 'pending-ring-history' as const,
        majorArcana: 'pending-major-arcana-map' as const,
        rnaCodonFamily: 'pending-rna-codon-family' as const,
        chromosomeGraph: 'pending-chromosome-graph' as const,
        lensMode:
            lens !== null && mode !== null && surfaceIndex !== null
                ? { lens, mode, surfaceIndex }
                : null,
        toroidal:
            degree720 === null
                ? null
                : { degree720, helixSheet: degree720 >= 360 ? 1 : 0 },
        suitIndex: mahamaya ? mahamaya.codonId >> 4 : null,
        generation: input.generation
    });
}
