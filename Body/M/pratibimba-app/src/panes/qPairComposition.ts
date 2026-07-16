/**
 * Coordinate: M' M5' (Q pair-composition adapter)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5-4' governed Q-articulation workspace
 * Actualises: queue reason -> canonical Sophia VAK -> aphoristic composition.
 * Public surface: composeQPairCandidate, validateQPairCandidate, sourceVakForQReview.
 * Does NOT own: Q-review detection, review decisions, or canonical mutation.
 * Contract: [[M5'-SPEC]] / [[S4-SPEC]] / [[S5-SPEC]].
 */

import {
    composeAphoristic,
    validateAphoristicCandidate,
    type AphoristicDepthTarget,
    type AphoristicValidation
} from '../../../../S/S4/ta-onta/S4-4p-anima/modules/aphoristic-skill';
import {
    vakAddressFromObject,
    type VakAddress
} from '../../../../S/S4/ta-onta/shared/vak_address';
import type { QReviewEntry } from './autoresearchModel';

const VAK_BY_REASON: Readonly<Record<string, Omit<VakAddress, 'cf' | 'cs'>>> = Object.freeze({
    articulation_gap: {
        cpf: '(4.0/1-4.4/5)',
        ct: ['CT4'],
        cp: 'CP4.4',
        cfp: 'CFP4'
    },
    promotion_candidate: {
        cpf: '(4.0/1-4.4/5)',
        ct: ['CT0'],
        cp: 'CP4.0',
        cfp: 'CFP0'
    },
    contradiction_candidate: {
        cpf: '(4.0/1-4.4/5)',
        ct: ['CT3'],
        cp: 'CP4.3',
        cfp: 'CFP3'
    },
    stale_by_non_revisit: {
        cpf: '(4.0/1-4.4/5)',
        ct: ['CT5'],
        cp: 'CP4.5',
        cfp: 'CFP5'
    }
});

export function sourceVakForQReview(entry: QReviewEntry): VakAddress {
    const seed = VAK_BY_REASON[entry.reasonClass];
    if (!seed) {
        throw new Error(`Q review reason ${entry.reasonClass} has no canonical Sophia VAK route`);
    }
    const vak = vakAddressFromObject({
        ...seed,
        cf: entry.vakCf,
        cs: { code: 'CS5', direction: "Night'", sense: 'retrospective' }
    });
    if (!vak) {
        throw new Error(`Q review VAK surface ${entry.vakCf} is not a canonical composition address`);
    }
    return vak;
}

export function composeQPairCandidate(
    entry: QReviewEntry,
    rationale: string,
    depthTarget: AphoristicDepthTarget = 'pithy'
): Promise<string> {
    return composeAphoristic(rationale, sourceVakForQReview(entry), entry.qKey, depthTarget);
}

export function validateQPairCandidate(
    entry: QReviewEntry,
    candidate: string,
    depthTarget: AphoristicDepthTarget = 'pithy'
): AphoristicValidation {
    return validateAphoristicCandidate(candidate, entry.qKey, depthTarget);
}
