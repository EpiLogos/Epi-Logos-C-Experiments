import {
    assertBlockAcceptedByCatalog,
    BLOCKS_CATALOG_GATEWAY_METHOD,
    CORE_BLOCK_TYPES,
    createBlocksCatalog,
    createCoreBlockCatalogEntry,
    type Block,
    type BlockCatalogEntry,
    type BlockSpec,
    type BlocksCatalog,
    type BlockEditSurface,
    type CoreBlockType
} from '@pratibimba/m-extension-runtime/lib/common/block-contract';

/**
 * Coordinate: [[M']] / [[M5']] / Track 44 block-kit
 * Residency: Body/M/epi-theia/extensions/block-kit/src/common
 * Position (#n): #5 Pratibimba release-gate integration
 * Actualises: [[44-pratibimba-surface-standard]] no-orphan block ownership and gateway contract catalogs
 * Public surface: BlockRegistry, CORE_BLOCK_OWNER_REGISTRATIONS, BLOCK_KIT_GATEWAY_METHOD_CONTRACTS
 * Does NOT own: block wire types, gateway runtime, review law, or per-domain widget law
 * Contract: ../contracts/block-kit-release-gate.json
 */

export type BlockOwnerKind = 'm-extension' | 'ide-shell' | 'agentic-control-room' | 'runtime' | 'layout';

export interface BlockOwnerRegistration {
    readonly type: CoreBlockType;
    readonly ownerExtensionId: string;
    readonly ownerContributionId: string;
    readonly ownerCoordinate: string;
    readonly ownerKind: BlockOwnerKind;
    readonly sourceAnchor: string;
}

export interface GatewayMethodContractEntry {
    readonly method: string;
    readonly ownerExtensionId: string;
    readonly ownerCoordinate: string;
    readonly contractEntryId: string;
    readonly sourceAnchor: string;
    readonly humanGateRequired: boolean;
    readonly routesTo: string;
}

export interface BlockKitSurfaceRegistration {
    readonly surfaceId: string;
    readonly ownerExtensionId: string;
    readonly renderedBlockTypes: readonly CoreBlockType[];
    readonly sourceAnchor: string;
}

export const CORE_BLOCK_OWNER_REGISTRATIONS = Object.freeze([
    owner('rich-text', 'm5-epii', 'pratibimba.m5-epii:review-narrative', "M5'", 'm-extension', 'm5-epii/src/browser/m5-epii-widget.tsx'),
    owner('callout', 'm-extension-runtime', 'pratibimba.runtime:readiness-banner', "M'", 'runtime', 'm-extension-runtime/src/browser/readiness-banner.tsx'),
    owner('diff', 'canon-studio', 'pratibimba.canon-studio:semantic-diff', "M0'/M5'", 'ide-shell', 'canon-studio/src/browser/canon-studio-widget.tsx'),
    owner('data-model', 'm0-anuttara', 'pratibimba.m0-anuttara:provenance-inspector', "M0'", 'm-extension', 'm0-anuttara/src/browser/m0-anuttara-widget.tsx'),
    owner('file-tree', 'ide-shell-m0-m5', 'pratibimba.ide-shell:backend-studio-file-tree', "M0'/M5'", 'ide-shell', 'ide-shell-m0-m5/src/browser/backend-studio/backend-studio-widget.tsx'),
    owner('annotated-code', 'backend-studio', 'pratibimba.backend-studio:source-annotation', "M0'/M5'", 'ide-shell', 'backend-studio/src/browser/backend-studio-widget.tsx'),
    owner('code', 'canon-studio', 'pratibimba.canon-studio:code-block', "M0'/M5'", 'ide-shell', 'canon-studio/src/browser/canon-studio-widget.tsx'),
    owner('table', 'm0-anuttara', 'pratibimba.m0-anuttara:language-map-table', "M0'", 'm-extension', 'm0-anuttara/src/browser/panels'),
    owner('checklist', 'm4-nara', 'pratibimba.m4-nara:day-container-checklist', "M4'", 'm-extension', 'm4-nara/src/browser/m4-nara-widget.tsx'),
    owner('question-form', 'm5-epii', 'pratibimba.m5-epii:pedagogy-question-form', "M5'", 'm-extension', 'm5-epii/src/browser/m5-epii-widget.tsx'),
    owner('review-item', 'm5-epii', 'pratibimba.m5-epii:review-item', "M5'", 'm-extension', 'm5-epii/src/browser/m5-epii-widget.tsx'),
    owner('evidence', 'ide-shell-m0-m5', 'pratibimba.ide-shell:evidence-pane', "M5'", 'ide-shell', 'ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx'),
    owner('dispatch-genealogy', 'agentic-control-room', 'pratibimba.acr:dispatch-trace', "M5'", 'agentic-control-room', 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    owner('tool-stream-event', 'agentic-control-room', 'pratibimba.acr:tool-stream', "M5'", 'agentic-control-room', 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    owner('pattern-packet', 'm4-nara', 'pratibimba.m4-nara:pattern-packet', "M4'", 'm-extension', 'm4-nara/src/browser'),
    owner('kairos-strip', 'm3-mahamaya', 'pratibimba.m3-mahamaya:kairos-strip', "M3'", 'm-extension', 'm3-mahamaya/src/browser/m3-mahamaya-widget.tsx'),
    owner('resonance-indicator', 'm2-parashakti', 'pratibimba.m2-parashakti:resonance-indicator', "M2'", 'm-extension', 'm2-parashakti/src/browser/m2-cymatic-engine-widget.tsx'),
    owner('wireframe', 'pratibimba-layouts', 'pratibimba.layouts:surface-wireframe', "M'", 'layout', 'pratibimba-layouts/src/common/layout-types.ts'),
    owner('diagram', 'm1-paramasiva', 'pratibimba.m1-paramasiva:relation-diagram', "M1'", 'm-extension', 'm1-paramasiva/src/browser/m1-paramasiva-widget.tsx')
] satisfies readonly BlockOwnerRegistration[]);

export const BLOCK_KIT_GATEWAY_METHOD_CONTRACTS = Object.freeze([
    gateway(BLOCKS_CATALOG_GATEWAY_METHOD, 'm-extension-runtime', "M'", 'BK-GW-001', 'm-extension-runtime/src/common/block-contract.ts', false, 'blocks.catalog'),
    gateway('blocks.annotate', 'block-kit', "M5'", 'BK-GW-002', 'block-kit/src/common/verdict-loop.ts', true, "s4'.psyche.update"),
    gateway('blocks.verdict', 'block-kit', "M5'", 'BK-GW-003', 'block-kit/src/common/verdict-loop.ts', true, "s4'.psyche.update"),
    gateway('blocks.doc.persist', 'block-kit', "M5'", 'BK-GW-004', 'block-kit/src/common/block-doc.ts', true, "s1'.vault.append_block"),
    gateway('blocks.doc.read', 'block-kit', "M5'", 'BK-GW-005', 'block-kit/src/common/block-doc.ts', false, "s1'.vault.read_file")
] satisfies readonly GatewayMethodContractEntry[]);

export const BLOCK_KIT_SURFACE_REGISTRATIONS = Object.freeze([
    surface('acr.dispatch-trace', 'agentic-control-room', ['dispatch-genealogy'], 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    surface('acr.tool-stream', 'agentic-control-room', ['tool-stream-event'], 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    surface('ide-shell.evidence-inspector', 'ide-shell-m0-m5', ['evidence', 'dispatch-genealogy', 'tool-stream-event'], 'ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx'),
    surface('m0.data-model', 'm0-anuttara', ['data-model', 'table'], 'm0-anuttara/src/browser/m0-anuttara-widget.tsx'),
    surface('m1.diagram', 'm1-paramasiva', ['diagram'], 'm1-paramasiva/src/browser/m1-paramasiva-widget.tsx'),
    surface('m2.resonance', 'm2-parashakti', ['resonance-indicator'], 'm2-parashakti/src/browser/m2-cymatic-engine-widget.tsx'),
    surface('m3.kairos', 'm3-mahamaya', ['kairos-strip'], 'm3-mahamaya/src/browser/m3-mahamaya-widget.tsx'),
    surface('m4.patterns', 'm4-nara', ['pattern-packet', 'checklist'], 'm4-nara/src/browser'),
    surface('m5.review', 'm5-epii', ['review-item', 'question-form', 'rich-text'], 'm5-epii/src/browser/m5-epii-widget.tsx')
] satisfies readonly BlockKitSurfaceRegistration[]);

export class BlockRegistry {
    protected readonly specs = new Map<string, BlockSpec>();
    protected readonly owners = new Map<string, BlockOwnerRegistration>();

    constructor(
        specs: readonly BlockSpec[] = createCoreBlockSpecs(),
        owners: readonly BlockOwnerRegistration[] = CORE_BLOCK_OWNER_REGISTRATIONS
    ) {
        for (const spec of specs) {
            this.register(spec);
        }
        for (const registration of owners) {
            this.registerOwner(registration);
        }
    }

    register(spec: BlockSpec): void {
        this.specs.set(spec.type, spec);
    }

    registerOwner(registration: BlockOwnerRegistration): void {
        this.owners.set(registration.type, registration);
    }

    spec(type: string): BlockSpec | undefined {
        return this.specs.get(type);
    }

    owner(type: string): BlockOwnerRegistration | undefined {
        return this.owners.get(type);
    }

    catalog(generatedAt = 'static:track-44.10'): BlocksCatalog {
        const entries = [...this.specs.values()].map(specToCatalogEntry);
        return createBlocksCatalog(entries, generatedAt);
    }

    assertAccepted(block: Block): BlockCatalogEntry {
        return assertBlockAcceptedByCatalog(block, this.catalog());
    }

    noOrphanErrors(): string[] {
        const errors: string[] = [];
        for (const type of CORE_BLOCK_TYPES) {
            if (!this.specs.has(type)) {
                errors.push(`Core block type "${type}" has no BlockSpec`);
            }
            if (!this.owners.has(type)) {
                errors.push(`Core block type "${type}" has no owning extension registration`);
            }
        }
        for (const registration of this.owners.values()) {
            if (!CORE_BLOCK_TYPES.includes(registration.type)) {
                errors.push(`Owner registration ${registration.ownerContributionId} names non-core type "${registration.type}"`);
            }
        }
        return errors;
    }
}

export function createCoreBlockSpecs(): readonly BlockSpec[] {
    return CORE_BLOCK_TYPES.map(type => createCoreBlockSpec(type));
}

export function createCoreBlockSpec(type: CoreBlockType): BlockSpec {
    return Object.freeze({
        type,
        schema: Object.freeze({
            type: 'object',
            required: ['id', 'type', 'ctx', 'privacyClass', 'data'],
            properties: Object.freeze({
                type: Object.freeze({ const: type }),
                data: Object.freeze({ type: 'object' })
            })
        }),
        Read: ({ block }: { readonly block: Block }) => renderBlockReadModel(block),
        editSurface: editSurfaceFor(type),
        privacyGate: Object.freeze({
            requiredPrivacyClass: 'protected-local',
            accepts: (block: Block) => block.privacyClass === 'public'
                || block.privacyClass === 'protected'
                || block.privacyClass === 'protected-local'
        })
    });
}

export function renderBlockReadModel(block: Block): Readonly<Record<string, unknown>> {
    return Object.freeze({
        id: block.id,
        type: block.type,
        coordinate: block.coordinate ?? null,
        privacyClass: block.privacyClass,
        ctx: block.ctx,
        data: block.data
    });
}

export function createDefaultBlockRegistry(): BlockRegistry {
    return new BlockRegistry();
}

function owner(
    type: CoreBlockType,
    ownerExtensionId: string,
    ownerContributionId: string,
    ownerCoordinate: string,
    ownerKind: BlockOwnerKind,
    sourceAnchor: string
): BlockOwnerRegistration {
    return Object.freeze({ type, ownerExtensionId, ownerContributionId, ownerCoordinate, ownerKind, sourceAnchor });
}

function gateway(
    method: string,
    ownerExtensionId: string,
    ownerCoordinate: string,
    contractEntryId: string,
    sourceAnchor: string,
    humanGateRequired: boolean,
    routesTo: string
): GatewayMethodContractEntry {
    return Object.freeze({ method, ownerExtensionId, ownerCoordinate, contractEntryId, sourceAnchor, humanGateRequired, routesTo });
}

function surface(
    surfaceId: string,
    ownerExtensionId: string,
    renderedBlockTypes: readonly CoreBlockType[],
    sourceAnchor: string
): BlockKitSurfaceRegistration {
    return Object.freeze({ surfaceId, ownerExtensionId, renderedBlockTypes, sourceAnchor });
}

function editSurfaceFor(type: CoreBlockType): BlockEditSurface {
    if (type === 'rich-text' || type === 'checklist' || type === 'question-form' || type === 'review-item') {
        return 'inline';
    }
    if (type === 'wireframe' || type === 'diagram' || type === 'file-tree') {
        return 'container';
    }
    return 'panel';
}

function specToCatalogEntry(spec: BlockSpec): BlockCatalogEntry {
    return createCoreBlockCatalogEntry(spec.type as CoreBlockType, {
        schema: spec.schema,
        editSurface: spec.editSurface,
        privacyGate: Object.freeze({
            requiredPrivacyClass: spec.privacyGate.requiredPrivacyClass ?? 'protected-local'
        }),
        iod17Parity: Object.freeze({ inParity: true })
    });
}
