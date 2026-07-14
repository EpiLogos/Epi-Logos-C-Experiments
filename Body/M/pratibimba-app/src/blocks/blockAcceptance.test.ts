/**
 * Coordinate: M' (Track-44 acceptance harness — Tranche 44.T44.10)
 * Actualises: the four closing proofs of the surface standard, in one
 *   harness against the real modules:
 *   (1) no-orphan — every core block type has a spec AND an owning
 *       registration (Track-14 release-gate feed);
 *   (2) gateway-method contract — every BK-GW method row carries an owner,
 *       a contract entry id, an authority path, and a routing target;
 *   (3) the verdict loop round-trips under the live Human Gate;
 *   (4) a persisted block-doc round-trips in BOTH markdown and MDX.
 *   Surface rollout beyond the Review fold (ACR dispatch-trace/tool-stream,
 *   evidence inspector) rides tranches 27.3/27.5 — the projection mappers
 *   are landed and proven here through the standard.
 */

import { describe, expect, it } from 'vitest';
import { enforceHumanGate } from '../panes/m5ReviewGate';
import { genealogyToReviewBlocks, toolStreamEventBlock } from '../panes/omni/reviewBlocks';
import { syntheticPiAnimaMoiraiDispatch } from '../panes/omni/dispatchGenealogy.fixture';
import { CORE_BLOCK_TYPES } from './blockContract';
import { fromDoc, toDoc } from './blockDoc';
import {
    BLOCK_KIT_GATEWAY_METHOD_CONTRACTS,
    createDefaultBlockRegistry
} from './blockRegistry';
import {
    applyBlockSessionOperation,
    createBlockPsycheUpdateRequest,
    createRendererSessionState,
    createVerdictOperation
} from './verdictLoop';

describe('44.10 Track-44 acceptance harness', () => {
    it('(1) no-orphan: all 19 core block types are spec-owned and extension-owned', () => {
        const registry = createDefaultBlockRegistry();
        expect(registry.noOrphanErrors()).toEqual([]);
        expect(registry.catalog().types).toEqual([...CORE_BLOCK_TYPES]);
    });

    it('(2) every block-kit gateway method row carries owner, contract id, authority, and routing', () => {
        expect(BLOCK_KIT_GATEWAY_METHOD_CONTRACTS.length).toBeGreaterThanOrEqual(5);
        for (const row of BLOCK_KIT_GATEWAY_METHOD_CONTRACTS) {
            expect(row.method.length).toBeGreaterThan(0);
            expect(row.ownerExtensionId.length).toBeGreaterThan(0);
            expect(row.contractEntryId).toMatch(/^BK-GW-\d+/);
            expect(row.sourceAnchor.length).toBeGreaterThan(0);
            expect(row.routesTo.length).toBeGreaterThan(0);
        }
        const verdictRow = BLOCK_KIT_GATEWAY_METHOD_CONTRACTS.find(row => row.method === 'blocks.verdict');
        expect(verdictRow?.humanGateRequired).toBe(true);
    });

    it('(3) the verdict loop round-trips the fixture through the live Human Gate into the psyche patch', () => {
        const blocks = genealogyToReviewBlocks(syntheticPiAnimaMoiraiDispatch());
        const reviewItem = blocks.find(block => block.type === 'review-item')!;
        let state = createRendererSessionState([...blocks]);

        // agent may not commit; human commits — the full gate arc.
        const agentGate = enforceHumanGate({ decision: 'approve', humanRequired: true, actorIsHuman: false });
        expect(agentGate.ok).toBe(false);
        const humanGate = enforceHumanGate({ decision: 'approve', humanRequired: true, actorIsHuman: true });
        const verdict = createVerdictOperation({
            block: reviewItem,
            decision: 'approve',
            actor: 'architect',
            actorIsHuman: true,
            reason: 'acceptance harness arc',
            humanGate: humanGate
        });
        state = applyBlockSessionOperation(state, verdict);
        const request = createBlockPsycheUpdateRequest({ sessionKey: 'sess-acceptance', state });
        expect(request.method).toBe("s4'.psyche.update");
        expect(request.params.patch.renderer.pendingVerdict?.decision).toBe('approve');
        expect(request.params.patch.renderer.blocks.length).toBe(blocks.length);
    });

    it('(4) a persisted block-doc round-trips in both markdown and MDX, tool events included', () => {
        const blocks = [
            ...genealogyToReviewBlocks(syntheticPiAnimaMoiraiDispatch()),
            toolStreamEventBlock({ seq: 9, emittedAtMs: 9000, kind: 'tool.observed', channel: 'run' })
        ];
        for (const format of ['markdown', 'mdx'] as const) {
            const doc = toDoc(blocks, { format, coordinate: 'M5-4', dayId: '14-07-2026' });
            expect(fromDoc(doc, format)).toEqual(blocks);
        }
    });
});
