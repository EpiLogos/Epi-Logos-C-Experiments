/**
 * Coordinate: M' M3' (oracle-cast service, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): governed M3 oracle command adapter.
 * Actualises: I-Ching and Tarot casts through the shared gateway port.
 * Public surface: M3OracleCastService and the two oracle method constants.
 * Does NOT own: entropy, derivation, persistence, transport, or profile state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import type { M3GatewayPort } from './m3GatewayPort';

export const M3_ICHING_CAST_METHOD = 's5.oracle.iching.cast' as const;
export const M3_TAROT_CAST_METHOD = 's5.oracle.tarot.cast' as const;

export class M3OracleCastService {
    constructor(private readonly bridge: M3GatewayPort) {}

    castIChing(): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_ICHING_CAST_METHOD, {
            castMethod: 'three-coin'
        });
    }

    castTarot(
        request: Readonly<Record<string, unknown>> = {}
    ): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_TAROT_CAST_METHOD, { ...request });
    }
}
