/**
 * Coordinate: M' M5' (Review fold body — Tranche 44.T44.3, cross-link 27.6)
 * Actualises: the OmniPanel Review fold rendering the first real data
 *   through the Track-44 block standard — genealogy records projected to
 *   review-item / evidence / dispatch-genealogy blocks and hosted by
 *   BlockHost (catalog + privacyGate law enforced per block). The synthetic
 *   Pi → Anima → Moirai fixture is the acceptance (15.T15.11 precedent);
 *   the live wire→record producer is track-12's seam, named honestly.
 * Does NOT own: the verdict submit path (44.4 / 27.6 — `m5ReviewGate.ts`
 *   gates decisions before `s5'.review.submit` lands), the run-model types.
 */

import { BlockHost } from '../../blocks/BlockHost';
import { syntheticPiAnimaMoiraiDispatch } from './dispatchGenealogy.fixture';
import { genealogyToReviewBlocks } from './reviewBlocks';

export function ReviewBlocksPane() {
    const blocks = genealogyToReviewBlocks(syntheticPiAnimaMoiraiDispatch());
    return (
        <div className="review-blocks-pane" data-testid="review-blocks-pane">
            <p className="pane-message review-blocks-seam" data-testid="review-blocks-seam-note">
                Review rows ride the synthetic acceptance fixture — the live wire→record producer is
                track-12's seam; verdict submission lands with 44.4 under the m5 review gate.
            </p>
            <BlockHost blocks={blocks} />
        </div>
    );
}
