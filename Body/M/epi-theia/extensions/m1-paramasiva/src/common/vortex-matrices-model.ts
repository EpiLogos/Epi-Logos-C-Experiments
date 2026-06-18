import { MathemeHarmonicProfileBoundary, MObservabilityEvent } from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from './extension-constants';

export const M1_VORTEX_MATRICES_BROWSER_VIEW_ID = 'm1.paramasiva.vortexMatricesBrowser';
export const VORTEX_FACE_MODE_PREFERENCE = 'epi-logos.m1.vortex.faceMode';
export const DUAL_MATRIX_PAIR_RPC = 's2.relation.dual_matrix_pair.read';

export type VortexFaceMode = 'digit-root' | 'raw';
export type VortexStreamline = 'mahamaya' | 'parashakti';
export type AnandaMatrixOp = 0 | 1 | 2 | 3 | 4 | 5;

export interface VortexMatrixFamily {
    readonly op: AnandaMatrixOp;
    readonly label: string;
    readonly family: string;
    readonly rawFaceLabel: string;
}

export interface VortexMatrixCellModel {
    readonly rowTick12: number;
    readonly position12: number;
    readonly shadowColumn: boolean;
    readonly active: boolean;
    readonly familyOp: AnandaMatrixOp;
    readonly faceMode: VortexFaceMode;
    readonly displayValue: string;
    readonly numericValue: number | null;
    readonly rawValue: number | null;
    readonly digitRootValue: number | null;
    readonly ruleValue: string | null;
    readonly streamline: VortexStreamline | null;
    readonly proofHighlight: boolean;
    readonly source: string;
}

export interface VortexMatricesModel {
    readonly viewId: typeof M1_VORTEX_MATRICES_BROWSER_VIEW_ID;
    readonly faceMode: VortexFaceMode;
    readonly activeProfileOp: AnandaMatrixOp;
    readonly selectedOp: AnandaMatrixOp;
    readonly pinnedOp: AnandaMatrixOp | null;
    readonly dualPinnedOp: AnandaMatrixOp | null;
    readonly kleinFlipCrossFadeOp: AnandaMatrixOp | null;
    readonly activeCell: {
        readonly tick12: number | null;
        readonly position12: number | null;
        readonly cl42Signature: number | null;
    };
    readonly families: readonly VortexMatrixFamily[];
    readonly grid: readonly VortexMatrixCellModel[];
    readonly readiness: {
        readonly source: string;
        readonly blockers: readonly string[];
    };
}

export interface VortexMatrixBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export interface BuildVortexMatricesInput {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly faceMode?: VortexFaceMode | string | null;
    readonly pinnedOp?: AnandaMatrixOp | string | number | null;
    readonly selectedOp?: AnandaMatrixOp | string | number | null;
    readonly dualProjector?: VortexDualMatrixProjector;
    readonly previousActiveMatrixOp?: AnandaMatrixOp | string | number | null;
}

const FAMILY_BY_OP: readonly VortexMatrixFamily[] = Object.freeze([
    Object.freeze({ op: 0, label: 'Bimba', family: '#X+0', rawFaceLabel: 'k*p' }),
    Object.freeze({ op: 1, label: 'Pratibimba', family: '#X+1', rawFaceLabel: 'k*p+1' }),
    Object.freeze({ op: 2, label: 'Sum', family: '(#X+0)+(#X+1)', rawFaceLabel: '2*k*p+1' }),
    Object.freeze({ op: 3, label: 'DiffA', family: '(#X+0)-(#X+1)', rawFaceLabel: 'constant -1' }),
    Object.freeze({ op: 4, label: 'DiffB', family: '(#X+1)-(#X+0)', rawFaceLabel: 'constant +1' }),
    Object.freeze({ op: 5, label: 'Quintessence', family: 'sixth-family rule cells', rawFaceLabel: 'rule tuple' })
]);

export class VortexDualMatrixProjector {
    private readonly observed = new Map<AnandaMatrixOp, AnandaMatrixOp>();

    constructor(initialPairs?: readonly (readonly [AnandaMatrixOp, AnandaMatrixOp])[]) {
        for (const pair of initialPairs ?? []) {
            this.remember(pair[0], pair[1]);
        }
    }

    static async fromBridge(bridge: VortexMatrixBridge): Promise<VortexDualMatrixProjector> {
        const response = await bridge.invokeGatewayRpc(DUAL_MATRIX_PAIR_RPC, {});
        return new VortexDualMatrixProjector(parseDualPairs(response));
    }

    remember(from: AnandaMatrixOp, to: AnandaMatrixOp): void {
        if (from === to) {
            return;
        }
        this.observed.set(from, to);
        this.observed.set(to, from);
    }

    observeProfileTransition(input: {
        readonly previousOp: AnandaMatrixOp | null;
        readonly currentOp: AnandaMatrixOp;
        readonly kleinFlipAtThisTick: boolean;
    }): void {
        if (input.kleinFlipAtThisTick && input.previousOp !== null) {
            this.remember(input.previousOp, input.currentOp);
        }
    }

    dualOf(op: AnandaMatrixOp): AnandaMatrixOp | null {
        return this.observed.get(op) ?? null;
    }

    pairs(): readonly (readonly [AnandaMatrixOp, AnandaMatrixOp])[] {
        const pairs: [AnandaMatrixOp, AnandaMatrixOp][] = [];
        const seen = new Set<string>();
        for (const [from, to] of this.observed.entries()) {
            const key = [Math.min(from, to), Math.max(from, to)].join(':');
            if (!seen.has(key)) {
                seen.add(key);
                pairs.push([from, to]);
            }
        }
        return Object.freeze(pairs.map(pair => Object.freeze(pair) as readonly [AnandaMatrixOp, AnandaMatrixOp]));
    }
}

export function buildVortexMatricesModel(input: BuildVortexMatricesInput): VortexMatricesModel {
    const faceMode = normalizeFaceMode(input.faceMode);
    const payload = input.profile?.payload;
    const vortex = recordValue(payload?.ananda_vortex ?? payload?.anandaVortex);
    const activeProfileOp = normalizeMatrixOp(vortex?.active_matrix_op ?? vortex?.activeMatrixOp) ?? 0;
    const previousOp = normalizeMatrixOp(input.previousActiveMatrixOp);
    const kleinFlipAtThisTick = booleanValue(vortex?.klein_flip_at_this_tick ?? vortex?.kleinFlipAtThisTick) === true;
    input.dualProjector?.observeProfileTransition({
        previousOp,
        currentOp: activeProfileOp,
        kleinFlipAtThisTick
    });

    const pinnedOp = normalizeMatrixOp(input.pinnedOp);
    const selectedOp = normalizeMatrixOp(input.selectedOp) ?? pinnedOp ?? activeProfileOp;
    const activeCell = activeCellFromProfile(payload, vortex);
    const activeCellValue = recordValue(vortex?.active_cell_value ?? vortex?.activeCellValue);
    const blockers: string[] = [];
    if (!payload) blockers.push('MathemeHarmonicProfile missing');
    if (!vortex) blockers.push('profile ananda_vortex projection missing');
    if (!activeCellValue) blockers.push('profile ananda_vortex active_cell_value missing');

    const grid = buildGrid({
        selectedOp,
        faceMode,
        activeCell,
        activeCellValue
    });
    const dualPinnedOp = pinnedOp === null ? null : input.dualProjector?.dualOf(pinnedOp) ?? null;
    const selectedDual = input.dualProjector?.dualOf(selectedOp) ?? null;

    return Object.freeze({
        viewId: M1_VORTEX_MATRICES_BROWSER_VIEW_ID,
        faceMode,
        activeProfileOp,
        selectedOp,
        pinnedOp,
        dualPinnedOp,
        kleinFlipCrossFadeOp: kleinFlipAtThisTick ? selectedDual : null,
        activeCell,
        families: FAMILY_BY_OP,
        grid: Object.freeze(grid),
        readiness: Object.freeze({
            source: vortex ? 'profile.ananda_vortex' : 'pending profile projection',
            blockers: Object.freeze(blockers)
        })
    });
}

export function dualOf(
    matrixOp: AnandaMatrixOp | string | number,
    projector: Pick<VortexDualMatrixProjector, 'dualOf'>
): AnandaMatrixOp | null {
    const op = normalizeMatrixOp(matrixOp);
    return op === null ? null : projector.dualOf(op);
}

export function familyPinnedEvent(input: {
    readonly pinnedOp: AnandaMatrixOp;
    readonly emittedAt: number;
}): MObservabilityEvent {
    return Object.freeze({
        type: 'm1.vortex.family_pinned',
        extensionId: EXTENSION_ID,
        emittedAt: input.emittedAt,
        payload: Object.freeze({
            pinned_op: input.pinnedOp,
            ts: input.emittedAt,
            source: 'user-selection'
        })
    });
}

export function normalizeMatrixOp(value: unknown): AnandaMatrixOp | null {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < FAMILY_BY_OP.length) {
        return value as AnandaMatrixOp;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const numeric = Number(normalized);
    if (Number.isInteger(numeric) && numeric >= 0 && numeric < FAMILY_BY_OP.length) {
        return numeric as AnandaMatrixOp;
    }
    if (normalized === 'bimba' || normalized === 'x0' || normalized === '#x+0') return 0;
    if (normalized === 'pratibimba' || normalized === 'x1' || normalized === '#x+1') return 1;
    if (normalized === 'sum') return 2;
    if (normalized === 'diffa' || normalized === 'diff_a') return 3;
    if (normalized === 'diffb' || normalized === 'diff_b') return 4;
    if (normalized === 'quintessence' || normalized === 'rule') return 5;
    return null;
}

export function normalizeFaceMode(value: unknown): VortexFaceMode {
    return value === 'raw' || value === 'raw/no-dr' || value === 'raw-no-dr'
        ? 'raw'
        : 'digit-root';
}

function buildGrid(input: {
    readonly selectedOp: AnandaMatrixOp;
    readonly faceMode: VortexFaceMode;
    readonly activeCell: VortexMatricesModel['activeCell'];
    readonly activeCellValue: Readonly<Record<string, unknown>> | undefined;
}): VortexMatrixCellModel[] {
    const grid: VortexMatrixCellModel[] = [];
    for (let row = 0; row < 12; row += 1) {
        for (let position = 0; position < 12; position += 1) {
            const active = input.activeCell.tick12 === row && input.activeCell.position12 === position;
            grid.push(
                cellModel({
                    row,
                    position,
                    active,
                    selectedOp: input.selectedOp,
                    faceMode: input.faceMode,
                    activeCellValue: active ? input.activeCellValue : undefined
                })
            );
        }
    }
    return grid;
}

function cellModel(input: {
    readonly row: number;
    readonly position: number;
    readonly active: boolean;
    readonly selectedOp: AnandaMatrixOp;
    readonly faceMode: VortexFaceMode;
    readonly activeCellValue: Readonly<Record<string, unknown>> | undefined;
}): VortexMatrixCellModel {
    const rawValue = readRawValue(input.selectedOp, input.row, input.position, input.activeCellValue);
    const digitRootValue = readDigitRootValue(input.selectedOp, rawValue, input.activeCellValue);
    const ruleValue = input.selectedOp === 5 ? stringValue(input.activeCellValue?.rule_value ?? input.activeCellValue?.ruleValue) : null;
    const numericValue = input.faceMode === 'digit-root' ? digitRootValue : rawValue;
    const displayValue =
        input.selectedOp === 5 && input.faceMode === 'raw'
            ? ruleValue ?? 'pending'
            : numericValue === null
              ? 'pending'
              : String(numericValue);
    const streamline = input.faceMode === 'digit-root' && digitRootValue !== null
        ? streamlineFromDigitRoot(digitRootValue)
        : null;

    return Object.freeze({
        rowTick12: input.row,
        position12: input.position,
        shadowColumn: input.position > 9,
        active: input.active,
        familyOp: input.selectedOp,
        faceMode: input.faceMode,
        displayValue,
        numericValue,
        rawValue,
        digitRootValue,
        ruleValue,
        streamline,
        proofHighlight: proofHighlight(input.selectedOp, input.row, input.position, rawValue),
        source: input.activeCellValue
            ? 'profile.ananda_vortex.active_cell_value'
            : 'matrix family rule'
    });
}

function readRawValue(
    op: AnandaMatrixOp,
    row: number,
    position: number,
    activeCellValue: Readonly<Record<string, unknown>> | undefined
): number | null {
    const fromProfile =
        rawFieldForOp(op, activeCellValue) ??
        numberValue(activeCellValue?.raw_value ?? activeCellValue?.rawValue);
    if (fromProfile !== null && activeCellMatchesOp(op, activeCellValue)) {
        return fromProfile;
    }
    if (op === 0) return row * position;
    if (op === 1) return row * position + 1;
    if (op === 2) return 2 * row * position + 1;
    if (op === 3) return -1;
    if (op === 4) return 1;
    return null;
}

function readDigitRootValue(
    op: AnandaMatrixOp,
    rawValue: number | null,
    activeCellValue: Readonly<Record<string, unknown>> | undefined
): number | null {
    const fromProfile =
        digitRootFieldForOp(op, activeCellValue) ??
        numberValue(activeCellValue?.dr_value ?? activeCellValue?.drValue);
    if (fromProfile !== null && activeCellMatchesOp(op, activeCellValue)) {
        return fromProfile;
    }
    if (op === 3) return 9;
    if (op === 4) return 1;
    return rawValue === null ? null : digitRoot(rawValue);
}

function rawFieldForOp(
    op: AnandaMatrixOp,
    value: Readonly<Record<string, unknown>> | undefined
): number | null {
    if (!value) return null;
    if (op === 0) return numberValue(value.raw_bimba ?? value.rawBimba);
    if (op === 1) return numberValue(value.raw_pratibimba ?? value.rawPratibimba);
    if (op === 2) return numberValue(value.raw_sum ?? value.rawSum);
    if (op === 3) return numberValue(value.raw_diff_a ?? value.rawDiffA);
    if (op === 4) return numberValue(value.raw_diff_b ?? value.rawDiffB);
    return null;
}

function digitRootFieldForOp(
    op: AnandaMatrixOp,
    value: Readonly<Record<string, unknown>> | undefined
): number | null {
    if (!value) return null;
    if (op === 0) return numberValue(value.dr_bimba ?? value.drBimba);
    if (op === 1) return numberValue(value.dr_pratibimba ?? value.drPratibimba);
    if (op === 2) return numberValue(value.dr_sum ?? value.drSum);
    if (op === 3) return numberValue(value.dr_diff_a ?? value.drDiffA);
    if (op === 4) return numberValue(value.dr_diff_b ?? value.drDiffB);
    return null;
}

function activeCellMatchesOp(
    op: AnandaMatrixOp,
    value: Readonly<Record<string, unknown>> | undefined
): boolean {
    const family = normalizeMatrixOp(value?.family ?? value?.matrix_op ?? value?.matrixOp);
    return family === null || family === op;
}

function digitRoot(value: number): number {
    const abs = Math.abs(Math.trunc(value));
    if (abs === 0) return 0;
    const remainder = abs % 9;
    return remainder === 0 ? 9 : remainder;
}

function streamlineFromDigitRoot(value: number): VortexStreamline | null {
    if (isPowerOfTwoDigitRootOrbit(value)) {
        return 'mahamaya';
    }
    return value > 0 && value % 3 === 0 ? 'parashakti' : null;
}

function isPowerOfTwoDigitRootOrbit(value: number): boolean {
    let cursor = 1;
    for (let step = 0; step < 6; step += 1) {
        if (cursor === value) {
            return true;
        }
        cursor = digitRoot(cursor * 2);
    }
    return false;
}

function proofHighlight(
    op: AnandaMatrixOp,
    row: number,
    position: number,
    rawValue: number | null
): boolean {
    if (op === 1 && row === 7 && (position === 5 || position === 9)) {
        return rawValue === row * position + 1;
    }
    if (op === 0 && row === 8 && (position === 8 || position === 9)) {
        return rawValue === row * position;
    }
    return false;
}

function activeCellFromProfile(
    payload: Readonly<Record<string, unknown>> | undefined,
    vortex: Readonly<Record<string, unknown>> | undefined
): VortexMatricesModel['activeCell'] {
    const pair = pairValue(vortex?.active_cell ?? vortex?.activeCell);
    const value = recordValue(vortex?.active_cell_value ?? vortex?.activeCellValue);
    const tick12 =
        numberValue(payload?.tick12) ??
        numberValue(recordValue(payload?.tickAddress)?.tick12) ??
        pair?.[0] ??
        numberValue(value?.row_k ?? value?.rowK);
    const position12 =
        numberValue(payload?.position6) ??
        pair?.[1] ??
        numberValue(value?.position_p ?? value?.positionP);
    return Object.freeze({
        tick12: boundedIndex(tick12, 12),
        position12: boundedIndex(position12, 12),
        cl42Signature: numberValue(vortex?.cl42_signature_at_position ?? vortex?.cl42SignatureAtPosition)
    });
}

function parseDualPairs(value: unknown): readonly (readonly [AnandaMatrixOp, AnandaMatrixOp])[] {
    const pairs: [AnandaMatrixOp, AnandaMatrixOp][] = [];
    const record = recordValue(value);
    const rawPairs = arrayValue(record?.pairs ?? record?.dual_pairs ?? value);
    for (const raw of rawPairs) {
        const pairRecord = recordValue(raw);
        const pairArray = Array.isArray(raw) ? raw : null;
        const from = normalizeMatrixOp(pairRecord?.from ?? pairRecord?.a ?? pairRecord?.source ?? pairArray?.[0]);
        const to = normalizeMatrixOp(pairRecord?.to ?? pairRecord?.b ?? pairRecord?.target ?? pairArray?.[1]);
        if (from !== null && to !== null && from !== to) {
            pairs.push([from, to]);
        }
    }
    if (record) {
        for (const [key, raw] of Object.entries(record)) {
            const from = normalizeMatrixOp(key);
            const to = normalizeMatrixOp(raw);
            if (from !== null && to !== null && from !== to) {
                pairs.push([from, to]);
            }
        }
    }
    return Object.freeze(pairs.map(pair => Object.freeze(pair) as readonly [AnandaMatrixOp, AnandaMatrixOp]));
}

function boundedIndex(value: number | null, modulus: number): number | null {
    if (value === null || !Number.isInteger(value)) {
        return null;
    }
    return ((value % modulus) + modulus) % modulus;
}

function pairValue(value: unknown): readonly [number, number] | null {
    const raw = arrayValue(value);
    const a = numberValue(raw[0]);
    const b = numberValue(raw[1]);
    return a === null || b === null ? null : [a, b];
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function booleanValue(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}
