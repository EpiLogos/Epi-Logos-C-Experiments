/**
 * Coordinate: M' M3' (renderer-service gateway port, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): active-carrier service transport boundary.
 * Actualises: the one constructor-injected capability port shared by M3 services.
 * Public surface: M3GatewayPort, requireIntegerInRange, requireNonEmpty.
 * Does NOT own: GatewayClient lifecycle, sockets, method implementation, or state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';

export interface M3GatewayPort {
    invoke(
        method: string,
        params?: Record<string, unknown>
    ): Promise<KernelBridgeCapabilityReceipt>;
}

export function requireNonEmpty(value: string, label: string): string {
    const normalized = value.trim();
    if (!normalized) {
        throw new Error(`${label} must not be empty`);
    }
    return normalized;
}

export function requireIntegerInRange(
    value: number,
    minimum: number,
    maximum: number,
    label: string
): number {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`${label} must be an integer in ${minimum}..${maximum}`);
    }
    return value;
}
