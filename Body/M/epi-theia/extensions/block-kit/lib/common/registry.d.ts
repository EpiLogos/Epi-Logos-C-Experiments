import { type Block, type BlockCatalogEntry, type BlockSpec, type BlocksCatalog, type CoreBlockType } from '@pratibimba/m-extension-runtime/lib/common/block-contract';
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
export declare const CORE_BLOCK_OWNER_REGISTRATIONS: readonly BlockOwnerRegistration[];
export declare const BLOCK_KIT_GATEWAY_METHOD_CONTRACTS: readonly GatewayMethodContractEntry[];
export declare const BLOCK_KIT_SURFACE_REGISTRATIONS: readonly BlockKitSurfaceRegistration[];
export declare class BlockRegistry {
    protected readonly specs: Map<string, BlockSpec<Block<unknown, string>>>;
    protected readonly owners: Map<string, BlockOwnerRegistration>;
    constructor(specs?: readonly BlockSpec[], owners?: readonly BlockOwnerRegistration[]);
    register(spec: BlockSpec): void;
    registerOwner(registration: BlockOwnerRegistration): void;
    spec(type: string): BlockSpec | undefined;
    owner(type: string): BlockOwnerRegistration | undefined;
    catalog(generatedAt?: string): BlocksCatalog;
    assertAccepted(block: Block): BlockCatalogEntry;
    noOrphanErrors(): string[];
}
export declare function createCoreBlockSpecs(): readonly BlockSpec[];
export declare function createCoreBlockSpec(type: CoreBlockType): BlockSpec;
export declare function renderBlockReadModel(block: Block): Readonly<Record<string, unknown>>;
export declare function createDefaultBlockRegistry(): BlockRegistry;
//# sourceMappingURL=registry.d.ts.map