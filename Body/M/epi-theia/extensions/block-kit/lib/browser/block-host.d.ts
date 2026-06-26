import * as React from 'react';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import type { Block } from '@pratibimba/m-extension-runtime';
import { type BlockRegistry } from '../common';
export interface BlockHostProps {
    readonly blocks: readonly Block[];
    readonly registry?: BlockRegistry;
}
export declare function BlockHost({ blocks, registry }: BlockHostProps): React.ReactElement;
export declare class BlockHostWidget extends ReactWidget {
    static readonly ID = "pratibimba.block-kit.host";
    static readonly LABEL = "Block Host";
    protected blocks: readonly Block[];
    protected registry: BlockRegistry;
    protected init(): void;
    setBlocks(blocks: readonly Block[]): void;
    protected render(): React.ReactNode;
}
//# sourceMappingURL=block-host.d.ts.map