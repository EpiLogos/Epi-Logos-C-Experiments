/**
 * Coordinate: M' M3' (lens-aperture service, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): world-clock aperture command adapter.
 * Actualises: governed aperture activation through the shared gateway port.
 * Public surface: M3LensApertureService, M3_LENS_APERTURE_METHOD.
 * Does NOT own: lens state, aperture calculation, transport, or local fallback.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import { requireIntegerInRange, type M3GatewayPort } from './m3GatewayPort';

export const M3_LENS_APERTURE_METHOD = 's3.world_clock.aperture.activate' as const;

export class M3LensApertureService {
    constructor(private readonly bridge: M3GatewayPort) {}

    async activate(lensId: number): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_LENS_APERTURE_METHOD, {
            lensId: requireIntegerInRange(lensId, 0, 16, 'lens id')
        });
    }
}
