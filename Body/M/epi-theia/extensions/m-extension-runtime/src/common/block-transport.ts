import type { Block } from './block-contract';
import type { Disposable } from './bridge-api';

export interface LiveBlockHost {
    readonly ownerExtensionId: string;
    setBlocks(blocks: readonly Block[]): void;
}

export interface LiveBlockTransportOptions {
    readonly ownerForBlock: (block: Block) => string | null | undefined;
}

export function blocksFromTemporalContext(context: unknown): readonly Block[] {
    if (!isRecord(context) || !isRecord(context.blocks)) {
        return Object.freeze([]);
    }
    if (context.blocks.transport !== 'day-now-runtime' || !Array.isArray(context.blocks.items)) {
        return Object.freeze([]);
    }
    return Object.freeze(context.blocks.items.filter(isBlockLike) as Block[]);
}

export class LiveBlockTransport {
    protected readonly hosts = new Map<string, LiveBlockHost>();
    protected readonly ownerForBlock: (block: Block) => string | null | undefined;

    constructor(options: LiveBlockTransportOptions) {
        this.ownerForBlock = options.ownerForBlock;
    }

    registerHost(host: LiveBlockHost): Disposable {
        this.hosts.set(host.ownerExtensionId, host);
        return {
            dispose: () => {
                if (this.hosts.get(host.ownerExtensionId) === host) {
                    this.hosts.delete(host.ownerExtensionId);
                }
            }
        };
    }

    dispatchTemporalContext(context: unknown): number {
        return this.dispatchBlocks(blocksFromTemporalContext(context));
    }

    dispatchBlocks(blocks: readonly Block[]): number {
        const byOwner = new Map<string, Block[]>();
        for (const block of blocks) {
            const owner = this.ownerForBlock(block);
            if (!owner) {
                continue;
            }
            const bucket = byOwner.get(owner) ?? [];
            bucket.push(block);
            byOwner.set(owner, bucket);
        }

        let dispatched = 0;
        for (const [owner, ownerBlocks] of byOwner) {
            const host = this.hosts.get(owner);
            if (!host) {
                continue;
            }
            const frozen = Object.freeze([...ownerBlocks]);
            host.setBlocks(frozen);
            dispatched += frozen.length;
        }
        return dispatched;
    }
}

function isBlockLike(value: unknown): value is Block {
    if (!isRecord(value)) {
        return false;
    }
    return typeof value.id === 'string'
        && typeof value.type === 'string'
        && isRecord(value.ctx)
        && typeof value.ctx.cf === 'string'
        && typeof value.ctx.ct === 'string'
        && typeof value.ctx.cp === 'string'
        && typeof value.privacyClass === 'string'
        && Object.prototype.hasOwnProperty.call(value, 'data');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
