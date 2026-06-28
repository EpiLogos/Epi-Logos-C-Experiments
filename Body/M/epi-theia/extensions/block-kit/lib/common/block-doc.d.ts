import { type Block, type BlockContextFrame, type BlockPrivacyClass } from '@pratibimba/m-extension-runtime/lib/common/block-contract';
export type BlockDocFormat = 'markdown' | 'mdx';
export interface PersistedBlockDoc {
    readonly coordinate: string;
    readonly ct: string;
    readonly ctxFrame: string;
    readonly privacyClass: BlockPrivacyClass;
    readonly dayId?: string;
    readonly createdAt?: string;
    readonly artifactRole?: string;
    readonly blocks: readonly Block[];
}
export interface ToBlockDocOptions {
    readonly format: BlockDocFormat;
    readonly coordinate?: string;
    readonly ctx?: BlockContextFrame;
    readonly privacyClass?: BlockPrivacyClass;
    readonly dayId?: string;
    readonly createdAt?: string;
    readonly artifactRole?: string;
}
export declare function toDoc(blocks: readonly Block[], options: ToBlockDocOptions): string;
export declare function fromDoc(source: string, format?: BlockDocFormat): readonly Block[];
export declare function serializeBlockDoc(doc: PersistedBlockDoc, format: BlockDocFormat): string;
export declare function parseBlockDoc(source: string, format?: BlockDocFormat): PersistedBlockDoc;
export interface BlockDocMetadata {
    readonly dayId?: string;
    readonly createdAt?: string;
    readonly artifactRole?: string;
}
export declare function createBlockDoc(blocks: readonly Block[], ctx: BlockContextFrame, privacyClass: BlockPrivacyClass, coordinate?: string, metadata?: BlockDocMetadata): PersistedBlockDoc;
export declare function blockDocVaultPath(dayId: string, filename: string): string;
export declare function assertBlockDocWritablePath(vaultPath: string): string;
//# sourceMappingURL=block-doc.d.ts.map
