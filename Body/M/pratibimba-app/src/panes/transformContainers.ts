/**
 * Coordinate: M' M4' (transform-container gateway projection - 25.T25.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): strict protected-local gateway boundary
 * Actualises: canonical stage receipts and contemplative transition payloads.
 * Public surface: method constants, parseTransformReceipt, carrier types.
 * Does NOT own: lifecycle persistence, stage progression, or rendering.
 * Contract: [[M4'-SPEC]] / [[S3-SPEC]].
 */

export const TRANSFORM_START_METHOD = 'nara.transform.start';
export const TRANSFORM_ADVANCE_METHOD = 'nara.transform.advance';

export const TRANSFORM_CONTAINER_OPTIONS = Object.freeze([
    Object.freeze({ id: 'bohm-dialogue', label: 'Bohm Dialogue' }),
    Object.freeze({ id: 'talking-circle', label: 'Talking Circle' }),
    Object.freeze({ id: 'diamond', label: 'Diamond' })
] as const);

export const ALCHEMICAL_OPERATIONS = Object.freeze([
    'nigredo',
    'solutio',
    'sublimatio',
    'calcinatio',
    'coagulatio',
    'fixatio',
    'separatio',
    'conjunctio'
] as const);

export type TransformContainerMode = (typeof TRANSFORM_CONTAINER_OPTIONS)[number]['id'];
export type AlchemicalOperation = (typeof ALCHEMICAL_OPERATIONS)[number];
export type TransformDirection = 'advance' | 'regress';

export interface TransformStage {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly alchemicalOp: AlchemicalOperation;
    readonly l2PrimeRegister: string;
}

export interface TransformTransitionPayload {
    readonly container: TransformContainerMode;
    readonly fromStage: string;
    readonly toStage: string;
    readonly alchemical_op: AlchemicalOperation;
}

export interface TransformLifecycleReceipt {
    readonly container: TransformContainerMode;
    readonly stageIndex: number;
    readonly stageCount: number;
    readonly stages: readonly TransformStage[];
    readonly stage: TransformStage;
    readonly transition: {
        readonly kind: 'contemplative';
        readonly payload: TransformTransitionPayload;
    };
    readonly direction: TransformDirection;
    readonly artifactPath: string;
}

export interface TransformAdvanceRequest {
    readonly container: TransformContainerMode;
    readonly expectedStage: string;
    readonly direction?: TransformDirection;
    readonly confirmedBackstep?: boolean;
}

const CONTAINER_IDS = new Set<TransformContainerMode>(
    TRANSFORM_CONTAINER_OPTIONS.map(option => option.id)
);
const OPERATIONS = new Set<AlchemicalOperation>(ALCHEMICAL_OPERATIONS);

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

function container(value: unknown, label: string): TransformContainerMode {
    const parsed = text(value, label) as TransformContainerMode;
    if (!CONTAINER_IDS.has(parsed)) throw new Error(`${label} is not a canonical container`);
    return parsed;
}

function operation(value: unknown, label: string): AlchemicalOperation {
    const parsed = text(value, label) as AlchemicalOperation;
    if (!OPERATIONS.has(parsed)) throw new Error(`${label} is not a canonical alchemical operation`);
    return parsed;
}

function direction(value: unknown): TransformDirection {
    if (value !== 'advance' && value !== 'regress') {
        throw new Error('Transform direction must be advance or regress');
    }
    return value;
}

function stage(value: unknown, index: number): TransformStage {
    const raw = record(value, `stage ${index}`);
    return Object.freeze({
        id: text(raw.id, `stage ${index} id`),
        label: text(raw.label, `stage ${index} label`),
        description: text(raw.description, `stage ${index} description`),
        alchemicalOp: operation(raw.alchemicalOp, `stage ${index} alchemical operation`),
        l2PrimeRegister: text(raw.l2PrimeRegister, `stage ${index} L2' register`)
    });
}

export function parseTransformReceipt(value: unknown): TransformLifecycleReceipt {
    const raw = record(value, 'Transform receipt');
    const parsedContainer = container(raw.container, 'Transform container');
    if (!Array.isArray(raw.stages) || (raw.stages.length !== 4 && raw.stages.length !== 5)) {
        throw new Error('Transform receipt must carry four or five canonical stages');
    }
    const stages = Object.freeze(raw.stages.map(stage));
    const ids = new Set(stages.map(item => item.id));
    if (ids.size !== stages.length) throw new Error('Transform stage ids must be unique');
    if (
        typeof raw.stageIndex !== 'number' ||
        !Number.isInteger(raw.stageIndex) ||
        raw.stageIndex < 0 ||
        raw.stageIndex >= stages.length
    ) {
        throw new Error('Transform stageIndex is outside the canonical stage table');
    }
    if (raw.stageCount !== stages.length) {
        throw new Error('Transform stageCount must match the canonical stage table');
    }
    const current = stage(raw.stage, raw.stageIndex);
    const canonicalCurrent = stages[raw.stageIndex];
    if (
        current.id !== canonicalCurrent.id ||
        current.alchemicalOp !== canonicalCurrent.alchemicalOp
    ) {
        throw new Error('Transform current stage must match stages[stageIndex]');
    }
    const transition = record(raw.transition, 'Transform transition');
    if (transition.kind !== 'contemplative') {
        throw new Error('Transform transition must be a contemplative artifact');
    }
    const payload = record(transition.payload, 'Transform transition payload');
    const parsedPayload: TransformTransitionPayload = Object.freeze({
        container: container(payload.container, 'Transition container'),
        fromStage: text(payload.fromStage, 'Transition fromStage'),
        toStage: text(payload.toStage, 'Transition toStage'),
        alchemical_op: operation(payload.alchemical_op, 'Transition alchemical operation')
    });
    if (
        parsedPayload.container !== parsedContainer ||
        parsedPayload.toStage !== current.id ||
        parsedPayload.alchemical_op !== current.alchemicalOp
    ) {
        throw new Error('Transform transition payload does not match the current stage');
    }

    return Object.freeze({
        container: parsedContainer,
        stageIndex: raw.stageIndex,
        stageCount: stages.length,
        stages,
        stage: current,
        transition: Object.freeze({
            kind: 'contemplative' as const,
            payload: parsedPayload
        }),
        direction: direction(raw.direction),
        artifactPath: text(raw.artifactPath, 'Transform artifactPath')
    });
}
