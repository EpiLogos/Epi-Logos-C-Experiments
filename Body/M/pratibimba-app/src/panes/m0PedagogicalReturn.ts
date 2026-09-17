/**
 * Coordinate: M' M0-5' (pedagogical return receiver — Track 08.T8.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the M5 → M0 Möbius write-back RECEIVING path — a recognized
 *   pattern crystallised through the Logos Atelier (Tranche 06.2, pending
 *   feed) surfaces on the M0-5' pedagogy layer as a READ-ONLY contemplative
 *   offering deep-linked to its anchoring M0 node. NO CANON MUTATION, by
 *   construction: the receiver produces a view + deep-link only; an offering
 *   that carries any write/mutation intent is refused outright, and the
 *   offering must anchor to an M0 coordinate (the pedagogy layer never hosts
 *   free-floating content). The deep-link rides the existing M0-5' bridged
 *   route (`m0Layers.ts` pedagogy route — Tranche 01.1 substrate).
 * Does NOT own: crystallisation (Logos Atelier, 06.2), canon (Hen/S1'),
 *   the M0 layer rail rendering (M0LayerRail).
 */

import { M0_BRIDGE_ROUTE_SCHEME } from './m0Layers';

const PEDAGOGY_ROUTE = '/m0-anuttara/coordinate/pedagogy';

export interface AtelierReturnOffering {
    /** The Atelier crystallisation id (e.g. `atelier://offering/…`). */
    readonly offeringRef: unknown;
    /** The M0 coordinate the contemplation anchors to (e.g. `M0-2`). */
    readonly anchorCoordinate: unknown;
    /** Present when a producer smuggles a write intent — always refused. */
    readonly mutation?: unknown;
}

export type PedagogicalReturn =
    | {
          readonly accepted: true;
          readonly readOnly: true;
          readonly deepLink: string;
          readonly anchorCoordinate: string;
          readonly offeringRef: string;
      }
    | { readonly accepted: false; readonly refusal: string };

/** Receive one Atelier return and surface it on the M0-5' pedagogy layer. */
export function receivePedagogicalReturn(offering: AtelierReturnOffering): PedagogicalReturn {
    if (offering.mutation !== undefined && offering.mutation !== null) {
        return {
            accepted: false,
            refusal:
                'pedagogical return is a read-only contemplative offering — canon mutation refused (Hen owns canon writes)'
        };
    }
    const ref = offering.offeringRef;
    if (typeof ref !== 'string' || !ref.startsWith('atelier://')) {
        return {
            accepted: false,
            refusal: 'offering must be an atelier:// crystallisation reference (Logos Atelier, 06.2)'
        };
    }
    const anchor = offering.anchorCoordinate;
    if (typeof anchor !== 'string' || !/^M0(-\d+)*'?$/.test(anchor)) {
        return {
            accepted: false,
            refusal: 'pedagogical offerings anchor to an M0 coordinate — free-floating content refused'
        };
    }
    return {
        accepted: true,
        readOnly: true,
        deepLink: `${M0_BRIDGE_ROUTE_SCHEME}${PEDAGOGY_ROUTE}?anchor=${encodeURIComponent(anchor)}&offering=${encodeURIComponent(ref)}`,
        anchorCoordinate: anchor,
        offeringRef: ref
    };
}
