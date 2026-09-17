/**
 * Block contract — Track 44.1 / DR-PSS-1 / DR-PSS-3.
 *
 * Blocks are the CTX-framed wire units that M' surfaces render. The live
 * vocabulary is served through `blocks.catalog`; consumers must reject blocks
 * whose type is absent from the catalog or whose IOD-17 faces are out of
 * parity.
 */

export const CORE_BLOCK_TYPES = Object.freeze([
    'rich-text',
    'callout',
    'diff',
    'data-model',
    'file-tree',
    'annotated-code',
    'code',
    'table',
    'checklist',
    'question-form',
    'review-item',
    'evidence',
    'dispatch-genealogy',
    'tool-stream-event',
    'pattern-packet',
    'kairos-strip',
    'resonance-indicator',
    'wireframe',
    'diagram'
] as const);

export type CoreBlockType = typeof CORE_BLOCK_TYPES[number];

export const BLOCK_PRIVACY_CLASSES = Object.freeze([
    'public',
    'protected',
    'protected-local'
] as const);

export type BlockPrivacyClass = typeof BLOCK_PRIVACY_CLASSES[number];

export const BLOCK_AFFORDANCES = Object.freeze([
    'verdict',
    'annotate',
    'select',
    'navigate'
] as const);

export type BlockAffordance = typeof BLOCK_AFFORDANCES[number];

export const BLOCK_EDIT_SURFACES = Object.freeze([
    'inline',
    'panel',
    'container'
] as const);

export type BlockEditSurface = typeof BLOCK_EDIT_SURFACES[number];

export const BLOCKS_CATALOG_GATEWAY_METHOD = 'blocks.catalog' as const;

export interface BlockContextFrame {
    readonly cf: string;
    readonly ct: string;
    readonly cp: string;
    readonly cpf?: string;
    readonly cs?: string;
}

export interface BlockProvenance {
    readonly kind: 'evidence-envelope' | 's2-handle';
    readonly handle: string;
    readonly source?: string;
    readonly envelope?: Readonly<Record<string, unknown>>;
    readonly [key: string]: unknown;
}

export interface Block<TData = unknown, TType extends string = string> {
    readonly id: string;
    readonly type: TType;
    readonly ctx: BlockContextFrame;
    readonly coordinate?: string;
    readonly privacyClass: BlockPrivacyClass;
    readonly provenance?: BlockProvenance;
    readonly data: TData;
    readonly affordances?: readonly BlockAffordance[];
}

export interface BlockRendererProps<TBlock extends Block = Block> {
    readonly block: TBlock;
    readonly catalog: BlocksCatalog;
}

export type BlockRenderer<TBlock extends Block = Block> = (props: BlockRendererProps<TBlock>) => unknown;

export interface BlockPrivacyGate<TBlock extends Block = Block> {
    readonly requiredPrivacyClass?: BlockPrivacyClass;
    readonly accepts: (block: TBlock) => boolean;
}

export interface BlockSpec<TBlock extends Block = Block> {
    readonly type: TBlock['type'];
    readonly schema: Readonly<Record<string, unknown>>;
    readonly Read: BlockRenderer<TBlock>;
    readonly Edit?: BlockRenderer<TBlock>;
    readonly editSurface: BlockEditSurface;
    readonly privacyGate: BlockPrivacyGate<TBlock>;
}

export interface IOD17Parity {
    readonly inParity: boolean;
    readonly faces?: {
        readonly capabilityMatrix?: boolean;
        readonly agentContract?: boolean;
        readonly widgetRegistry?: boolean;
    };
    readonly disagreements?: readonly string[];
}

export interface BlockCatalogEntry {
    readonly type: string;
    readonly schema: Readonly<Record<string, unknown>>;
    readonly editSurface: BlockEditSurface;
    readonly privacyGate: Readonly<Record<string, unknown>>;
    readonly iod17Parity: IOD17Parity;
}

export interface BlocksCatalog {
    readonly method: typeof BLOCKS_CATALOG_GATEWAY_METHOD;
    readonly generatedAt: string;
    readonly types: readonly string[];
    readonly entries: readonly BlockCatalogEntry[];
}

export interface BlocksCatalogRequest {
    readonly method: typeof BLOCKS_CATALOG_GATEWAY_METHOD;
    readonly includeSchemas?: boolean;
    readonly surfaceId?: string;
}

const CORE_TYPE_SET: ReadonlySet<string> = new Set(CORE_BLOCK_TYPES);
const PRIVACY_CLASS_SET: ReadonlySet<string> = new Set(BLOCK_PRIVACY_CLASSES);
const AFFORDANCE_SET: ReadonlySet<string> = new Set(BLOCK_AFFORDANCES);
const EDIT_SURFACE_SET: ReadonlySet<string> = new Set(BLOCK_EDIT_SURFACES);

export function isCoreBlockType(value: string): value is CoreBlockType {
    return CORE_TYPE_SET.has(value);
}

export function isBlockPrivacyClass(value: string): value is BlockPrivacyClass {
    return PRIVACY_CLASS_SET.has(value);
}

export function isBlockAffordance(value: string): value is BlockAffordance {
    return AFFORDANCE_SET.has(value);
}

export function isBlockEditSurface(value: string): value is BlockEditSurface {
    return EDIT_SURFACE_SET.has(value);
}

export function validateBlockContract(value: unknown): string[] {
    const errors: string[] = [];
    if (!isRecord(value)) {
        return ['Block must be an object'];
    }
    requireString(value.id, 'Block.id', errors);
    requireString(value.type, 'Block.type', errors);
    validateCtx(value.ctx, errors);
    if (value.coordinate !== undefined) {
        requireString(value.coordinate, 'Block.coordinate', errors);
    }
    if (typeof value.privacyClass !== 'string' || !isBlockPrivacyClass(value.privacyClass)) {
        errors.push('Block.privacyClass must be public, protected, or protected-local');
    }
    validateProvenance(value.provenance, errors);
    if (!Object.prototype.hasOwnProperty.call(value, 'data')) {
        errors.push('Block.data is required');
    }
    validateAffordances(value.affordances, errors);
    return errors;
}

export function createCoreBlockCatalogEntry(
    type: CoreBlockType,
    overrides: Partial<Omit<BlockCatalogEntry, 'type'>> = {}
): BlockCatalogEntry {
    return Object.freeze({
        type,
        schema: overrides.schema ?? Object.freeze({ $ref: '#/$defs/block' }),
        editSurface: overrides.editSurface ?? 'panel',
        privacyGate: overrides.privacyGate ?? Object.freeze({ maxPrivacyClass: 'protected-local' }),
        iod17Parity: overrides.iod17Parity ?? Object.freeze({ inParity: true })
    });
}

export function createBlocksCatalog(entries: readonly BlockCatalogEntry[], generatedAt = 'static:track-44.1'): BlocksCatalog {
    const normalizedEntries = Object.freeze([...entries]);
    return Object.freeze({
        method: BLOCKS_CATALOG_GATEWAY_METHOD,
        generatedAt,
        types: Object.freeze(normalizedEntries.map(entry => entry.type)),
        entries: normalizedEntries
    });
}

export function assertBlockAcceptedByCatalog<TBlock extends Block>(
    block: TBlock,
    catalog: BlocksCatalog
): BlockCatalogEntry {
    const errors = validateBlockContract(block);
    if (errors.length > 0) {
        throw new Error(`Block contract violation: ${errors.join('; ')}`);
    }
    const entry = catalog.entries.find(candidate => candidate.type === block.type);
    if (!entry) {
        throw new Error(`Block type "${block.type}" is not present in blocks.catalog`);
    }
    if (!entry.iod17Parity.inParity) {
        const detail = entry.iod17Parity.disagreements?.join('; ') ?? 'catalog faces disagree';
        throw new Error(`Block type "${block.type}" rejected by IOD-17 parity gate: ${detail}`);
    }
    return entry;
}

export const CORE_BLOCKS_CATALOG = createBlocksCatalog(
    CORE_BLOCK_TYPES.map(type => createCoreBlockCatalogEntry(type))
);

function validateCtx(value: unknown, errors: string[]): void {
    if (value === undefined) {
        errors.push('Block.ctx is required');
        return;
    }
    if (!isRecord(value)) {
        errors.push('Block.ctx must be an object');
        return;
    }
    requireString(value.cf, 'Block.ctx.cf', errors);
    requireString(value.ct, 'Block.ctx.ct', errors);
    requireString(value.cp, 'Block.ctx.cp', errors);
    if (value.cpf !== undefined) {
        requireString(value.cpf, 'Block.ctx.cpf', errors);
    }
    if (value.cs !== undefined) {
        requireString(value.cs, 'Block.ctx.cs', errors);
    }
}

function validateProvenance(value: unknown, errors: string[]): void {
    if (value === undefined) {
        return;
    }
    if (!isRecord(value)) {
        errors.push('Block.provenance must be an object');
        return;
    }
    if (value.kind !== 'evidence-envelope' && value.kind !== 's2-handle') {
        errors.push('Block.provenance.kind must be evidence-envelope or s2-handle');
    }
    requireString(value.handle, 'Block.provenance.handle', errors);
}

function validateAffordances(value: unknown, errors: string[]): void {
    if (value === undefined) {
        return;
    }
    if (!Array.isArray(value)) {
        errors.push('Block.affordances must be an array');
        return;
    }
    value.forEach((affordance, index) => {
        if (typeof affordance !== 'string' || !isBlockAffordance(affordance)) {
            errors.push(`Block.affordances[${index}] must be verdict, annotate, select, or navigate`);
        }
    });
}

function requireString(value: unknown, field: string, errors: string[]): void {
    if (typeof value !== 'string' || value.length === 0) {
        errors.push(`${field} is required`);
    }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
