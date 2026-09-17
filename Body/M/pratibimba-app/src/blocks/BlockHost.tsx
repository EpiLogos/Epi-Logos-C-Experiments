/**
 * Coordinate: M' (block host — Tranche 44.T44.2)
 * Actualises: the native block renderer — each block renders through its
 *   registered spec's `Read`, with catalog acceptance (44.1 law) and the
 *   privacyGate enforced BEFORE render: a refused block renders an honest
 *   refusal panel, never its data. Per-block failure isolation — one bad
 *   block never takes down the host.
 * Provenance: ported 2026-07-14 from the frozen block-kit `block-host.tsx`
 *   and CORRECTED to the 44.2 spec (the frozen host dumped JSON without
 *   dispatching `spec.Read` or enforcing `privacyGate` — both are law here).
 * Does NOT own: block specs (blockRegistry.ts), the verdict loop (44.4),
 *   transport (44.5).
 */

import { useEffect } from 'react';
import { createDefaultBlockRegistry, type BlockRegistry } from './blockRegistry';
import type { Block } from './blockContract';
import { PrivacyDropFeed, privacyDropFeed as sharedPrivacyDropFeed } from '../services/privacyDropFeed';

export interface BlockHostProps {
    readonly blocks: readonly Block[];
    readonly registry?: BlockRegistry;
    /** 44.6 selection seam: fired when a hosted block is clicked (the
     *  `select` affordance path — selection → context-xray + highlight-back). */
    readonly onBlockSelect?: (block: Block) => void;
    /** 28.16 federated privacy-drop sink — every block whose privacy gate
     *  refuses before render records one drop here. Defaults to the shared
     *  carrier singleton; tests inject a fresh feed. */
    readonly privacyDropFeed?: PrivacyDropFeed;
}

export function BlockHost({
    blocks,
    registry = createDefaultBlockRegistry(),
    onBlockSelect,
    privacyDropFeed = sharedPrivacyDropFeed
}: BlockHostProps) {
    return (
        <div className="block-host" data-testid="block-host">
            {blocks.map(block => (
                <HostedBlock
                    key={block.id}
                    block={block}
                    registry={registry}
                    onSelect={onBlockSelect}
                    feed={privacyDropFeed}
                />
            ))}
            {blocks.length === 0 ? (
                <p className="pane-message" data-testid="block-host-empty">
                    No blocks
                </p>
            ) : null}
        </div>
    );
}

function HostedBlock({
    block,
    registry,
    onSelect,
    feed
}: {
    readonly block: Block;
    readonly registry: BlockRegistry;
    readonly onSelect?: (block: Block) => void;
    readonly feed: PrivacyDropFeed;
}) {
    let entry;
    let rejectionMessage: string | null = null;
    try {
        entry = registry.assertAccepted(block);
    } catch (err) {
        rejectionMessage = err instanceof Error ? err.message : String(err);
    }
    const spec = entry ? registry.spec(block.type) : null;
    // Privacy law: the gate refuses BEFORE render — data never reaches the DOM.
    const privacyRefused = Boolean(entry && spec && !spec.privacyGate.accepts(block));

    // 28.16: record the drop as a side effect (once per refused mount), never
    // during render — a render-time record() would double-count on re-render.
    useEffect(() => {
        if (privacyRefused) {
            feed.record(block.type, block.privacyClass);
        }
    }, [privacyRefused, feed, block.type, block.privacyClass]);

    if (rejectionMessage !== null) {
        return (
            <article className="block-rejected" data-testid="block-rejected" data-block-id={block.id}>
                {rejectionMessage}
            </article>
        );
    }
    if (privacyRefused) {
        return (
            <article
                className="block-privacy-refused"
                data-testid="block-privacy-refused"
                data-block-id={block.id}
                data-privacy-class={block.privacyClass}
            >
                privacy gate refused {block.type}
            </article>
        );
    }
    const owner = registry.owner(block.type);
    const readModel = spec ? spec.Read({ block, catalog: registry.catalog() }) : null;
    return (
        <article
            className="block-hosted"
            data-testid={`block-${block.id}`}
            data-block-type={block.type}
            data-owner-extension={owner?.ownerExtensionId ?? ''}
            data-edit-surface={entry!.editSurface}
            data-privacy-class={block.privacyClass}
            onClick={onSelect ? () => onSelect(block) : undefined}
        >
            <header className="block-header">
                <strong>{block.type}</strong>
                {block.coordinate ? <code data-testid="block-coordinate">{block.coordinate}</code> : null}
                {block.affordances?.length ? (
                    <span className="block-affordances" data-testid="block-affordances">
                        {block.affordances.join(' · ')}
                    </span>
                ) : null}
            </header>
            <pre className="block-read-model" data-testid="block-read-model">
                {JSON.stringify(readModel ?? block.data, null, 2)}
            </pre>
        </article>
    );
}
