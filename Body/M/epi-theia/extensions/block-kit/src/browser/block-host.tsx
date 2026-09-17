import * as React from 'react';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import type { Block } from '@pratibimba/m-extension-runtime';
import {
    createDefaultBlockRegistry,
    type BlockRegistry
} from '../common';

export interface BlockHostProps {
    readonly blocks: readonly Block[];
    readonly registry?: BlockRegistry;
}

export function BlockHost({ blocks, registry = createDefaultBlockRegistry() }: BlockHostProps): React.ReactElement {
    return (
        <div className="pratibimba-block-host" data-test="block-host">
            {blocks.map(block => {
                const entry = registry.assertAccepted(block);
                const owner = registry.owner(block.type);
                return (
                    <article
                        key={block.id}
                        className="pratibimba-block"
                        data-test={`block-host-block-${block.id}`}
                        data-block-type={block.type}
                        data-owner-extension={owner?.ownerExtensionId ?? ''}
                        data-edit-surface={entry.editSurface}
                        data-privacy-class={block.privacyClass}
                    >
                        <header className="pratibimba-block__header">
                            <strong>{block.type}</strong>
                            {block.coordinate && <code>{block.coordinate}</code>}
                        </header>
                        <pre className="pratibimba-block__data">
                            {JSON.stringify(block.data, null, 2)}
                        </pre>
                    </article>
                );
            })}
        </div>
    );
}

@injectable()
export class BlockHostWidget extends ReactWidget {
    static readonly ID = 'pratibimba.block-kit.host';
    static readonly LABEL = 'Block Host';

    protected blocks: readonly Block[] = [];
    protected registry: BlockRegistry = createDefaultBlockRegistry();

    @postConstruct()
    protected init(): void {
        this.id = BlockHostWidget.ID;
        this.title.label = BlockHostWidget.LABEL;
        this.title.caption = 'Pratibimba block-kit host';
        this.title.closable = true;
        this.addClass('pratibimba-block-kit-host');
    }

    setBlocks(blocks: readonly Block[]): void {
        this.blocks = Object.freeze([...blocks]);
        this.update();
    }

    protected override render(): React.ReactNode {
        return <BlockHost blocks={this.blocks} registry={this.registry} />;
    }
}
