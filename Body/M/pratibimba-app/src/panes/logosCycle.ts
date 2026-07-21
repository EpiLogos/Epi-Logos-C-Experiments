/**
 * Coordinate: M' M4' (logos-cycle gateway projection — 25.T25.13)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): strict protected-local gateway boundary
 * Actualises: the 6-stage A-Logos → An-a-Logos cursor and the forward/backward
 *   contemplative-transition payloads (nara.logos.status/advance/regress).
 * Public surface: method constants, LOGOS_STAGE_NAMES, parseLogosCycleReceipt,
 *   carrier types.
 * Does NOT own: stage synthesis, artifact persistence, or the cycle law
 *   (that is epi-cli nara::logos, the S0 authority).
 * Contract: [[M4'-SPEC]] / [[S3-SPEC]].
 */

export const LOGOS_STATUS_METHOD = 'nara.logos.status';
export const LOGOS_ADVANCE_METHOD = 'nara.logos.advance';
export const LOGOS_REGRESS_METHOD = 'nara.logos.regress';

/** The canonical six-stage progression (mirrors epi-cli nara::logos LOGOS_STAGES). */
export const LOGOS_STAGE_NAMES = Object.freeze([
    'A-Logos',
    'Pro-Logos',
    'Dia-Logos',
    'Logos',
    'Epi-Logos',
    'An-a-Logos'
] as const);

export const LOGOS_STAGE_COUNT = LOGOS_STAGE_NAMES.length;

export type LogosDirection = 'advance' | 'regress';

export interface LogosTransition {
    readonly stage: number;
    readonly direction: LogosDirection;
    readonly regression: boolean;
    readonly artifactPath: string;
}

export interface LogosCycleReceipt {
    readonly date: string;
    readonly completedStages: readonly number[];
    readonly nextStage: number;
    readonly total: number;
    /** Present on advance/regress responses; null for a plain status read. */
    readonly transition: LogosTransition | null;
}

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function stageIndex(value: unknown, label: string, max: number): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > max) {
        throw new Error(`${label} must be an integer in 0..${max}`);
    }
    return value;
}

function boolean(value: unknown, label: string): boolean {
    if (typeof value !== 'boolean') {
        throw new Error(`${label} must be a boolean`);
    }
    return value;
}

export function parseLogosCycleReceipt(value: unknown): LogosCycleReceipt {
    const raw = record(value, 'Logos receipt');
    const total = raw.total;
    if (total !== LOGOS_STAGE_COUNT) {
        throw new Error(`Logos total must be the canonical ${LOGOS_STAGE_COUNT} stages`);
    }
    if (!Array.isArray(raw.completed_stages)) {
        throw new Error('Logos completed_stages must be an array');
    }
    const completedStages = Object.freeze(
        raw.completed_stages.map((entry, index) =>
            stageIndex(entry, `Logos completed_stages[${index}]`, LOGOS_STAGE_COUNT - 1)
        )
    );
    const nextStage = stageIndex(raw.next_stage, 'Logos next_stage', LOGOS_STAGE_COUNT);

    let transition: LogosTransition | null = null;
    if (raw.direction !== undefined) {
        const direction = raw.direction;
        if (direction !== 'advance' && direction !== 'regress') {
            throw new Error('Logos direction must be advance or regress');
        }
        const regression = boolean(raw.regression, 'Logos regression');
        if (direction === 'regress' && !regression) {
            throw new Error('A regress transition must carry regression: true');
        }
        if (direction === 'advance' && regression) {
            throw new Error('An advance transition must not carry the regression flag');
        }
        transition = Object.freeze({
            stage: stageIndex(raw.transitioned_stage, 'Logos transitioned_stage', LOGOS_STAGE_COUNT - 1),
            direction,
            regression,
            artifactPath: text(raw.artifact_path, 'Logos artifact_path')
        });
    }

    return Object.freeze({
        date: text(raw.date, 'Logos date'),
        completedStages,
        nextStage,
        total: LOGOS_STAGE_COUNT,
        transition
    });
}
