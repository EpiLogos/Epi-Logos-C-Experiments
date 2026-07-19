/**
 * Coordinate: M' M3' (tarot-decan service, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): protected scalar-reference read adapter.
 * Actualises: Tarot card-key resolution through `s2.codon.scalar_ref.read`.
 * Public surface: TarotDecanService, M3_TAROT_DECAN_METHOD.
 * Does NOT own: correspondence LUTs, body data, gateway transport, or persistence.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import { requireNonEmpty, type M3GatewayPort } from './m3GatewayPort';

export const M3_TAROT_DECAN_METHOD = 's2.codon.scalar_ref.read' as const;

export class TarotDecanService {
    constructor(private readonly bridge: M3GatewayPort) {}

    async resolve(cardKey: string): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_TAROT_DECAN_METHOD, {
            refKind: 'tarot',
            scalarRef: requireNonEmpty(cardKey, 'tarot card key')
        });
    }
}
