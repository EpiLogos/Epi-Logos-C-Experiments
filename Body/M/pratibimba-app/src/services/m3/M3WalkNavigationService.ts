/**
 * Coordinate: M' M3' (walk-navigation service, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): world-clock sequential-walk command adapter.
 * Actualises: governed 9-walk advancement through the shared gateway port.
 * Public surface: M3WalkNavigationService, M3_WALK_NAVIGATION_METHOD.
 * Does NOT own: walk position, progression law, transport, or local fallback.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import { requireIntegerInRange, type M3GatewayPort } from './m3GatewayPort';

export const M3_WALK_NAVIGATION_METHOD = 's3.world_clock.walk.advance' as const;
export type M3WalkDirection = 'forward' | 'backward';

export class M3WalkNavigationService {
    constructor(private readonly bridge: M3GatewayPort) {}

    async advance(
        walkId: number,
        direction: M3WalkDirection
    ): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_WALK_NAVIGATION_METHOD, {
            walkId: requireIntegerInRange(walkId, 0, 8, 'walk id'),
            direction
        });
    }
}
