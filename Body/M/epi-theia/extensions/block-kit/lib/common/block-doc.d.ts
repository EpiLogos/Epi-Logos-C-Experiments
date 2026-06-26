import { type Block, type BlockContextFrame, type BlockPrivacyClass } from '@pratibimba/m-extension-runtime';
export type BlockDocFormat = 'markdown' | 'mdx';
export interface PersistedBlockDoc {
    readonly coordinate: string;
    readonly ct: string;
    readonly ctxFrame: string;
    readonly privacyClass: BlockPrivacyClass;
    readonly blocks: readonly Block[];
}
export declare function serializeBlockDoc(doc: PersistedBlockDoc, format: BlockDocFormat): string;
export declare function parseBlockDoc(source: string, format: BlockDocFormat): PersistedBlockDoc;
export declare function createBlockDoc(blocks: readonly Block[], ctx: BlockContextFrame, privacyClass: BlockPrivacyClass): PersistedBlockDoc;
//# sourceMappingURL=block-doc.d.ts.map