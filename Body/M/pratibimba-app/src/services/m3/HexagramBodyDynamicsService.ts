/**
 * Coordinate: M' M3' (hexagram body-dynamics service, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): protected scalar-reference read adapter.
 * Actualises: per-hexagram authority resolution through the shared S2 method.
 * Public surface: HexagramBodyDynamicsService, M3_HEXAGRAM_BODY_METHOD.
 * Does NOT own: the 64-row body map, chakra LUTs, transport, or persistence.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import { requireIntegerInRange, type M3GatewayPort } from './m3GatewayPort';

export const M3_HEXAGRAM_BODY_METHOD = 's2.codon.scalar_ref.read' as const;

export class HexagramBodyDynamicsService {
    constructor(private readonly bridge: M3GatewayPort) {}

    async resolve(hexagramId: number): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_HEXAGRAM_BODY_METHOD, {
            refKind: 'i-ching',
            scalarRef: requireIntegerInRange(hexagramId, 1, 64, 'hexagram id')
        });
    }
}
