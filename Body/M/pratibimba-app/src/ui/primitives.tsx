/**
 * Coordinate: M' shell (shared UI primitives barrel — Track 16.T16.10 / CCT-10)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the `epi-ui-primitives` shared package retargeted to the
 *   carrier — ONE home for the cross-widget primitives so no surface forks
 *   its own: the DR-UI-3 <ProvenanceBadge> (7-member taxonomy, re-exported),
 *   the DR-UI-4 ratified transition configs (lemniscate-of-Bernoulli mask,
 *   r² = a²·cos 2θ; the three configs are LAW — 0/1 toggle 400ms cubic-out,
 *   Klein flip 240ms linear, Möbius return 320ms smoothstep; the 600/420ms
 *   texts are superseded per CHARTER), the CCT-6 <BedrockLinkTooltip>, and
 *   the canonical Cl(4,2) colour-binary palette (single source; the
 *   played-torus consumes it, never a local copy).
 * Does NOT own: the taxonomy law (DR-UI-3), the shader implementation
 *   (Track 15 baselines), bedrock chain genesis (portal-core CCT-6).
 */

import type { ReactNode } from 'react';

export { ProvenanceBadge } from './ProvenanceBadge';
export type { ProvenanceState } from './ProvenanceBadge';

/** DR-UI-4 ratified transition configs — the three, exactly. */
export const TRANSITIONS = Object.freeze({
    lemniscate01: Object.freeze({ ms: 400, easing: 'cubic-out' as const }),
    kleinFlip: Object.freeze({ ms: 240, easing: 'linear' as const }),
    mobiusReturn: Object.freeze({ ms: 320, easing: 'smoothstep' as const })
});

/** The lemniscate mask law the shader implements (DR-UI-4). */
export const LEMNISCATE_MASK_LAW = 'r² = a² · cos(2θ)' as const;

/** Canonical Cl(4,2) colour-binary — implicate (−1, P0/P5) indigo; explicate
 *  (+1, P1–P4) warm. THE single palette source for every Cl(4,2)-keyed
 *  surface (played-torus halo, inspector legends). */
export const CL42_PALETTE = Object.freeze({
    implicateIndigo: 0x4b0082,
    explicateWarm: 0xff7f2a
});

/** CCT-6: renders the bedrock provenance chain (file:line → .rodata →
 *  profile field → readiness ledger) as a hover tooltip — the chain string
 *  is the KERNEL's write (BedrockProvenanceHandle), never composed locally. */
export function BedrockLinkTooltip(props: {
    readonly chain: string;
    readonly children: ReactNode;
}) {
    return (
        <span data-testid="bedrock-link-tooltip" title={props.chain}>
            {props.children}
        </span>
    );
}
