/**
 * Coordinate: M' M3' (renderer-service registry tests, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): active-carrier service composition boundary.
 * Actualises: constructor-injected service resolution and exact gateway dispatch.
 * Public surface: behavioral tests for createM3ServiceRegistry.
 * Does NOT own: gateway implementation, substrate methods, or renderer state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

import { describe, expect, it } from 'vitest';
import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import {
    createM3ServiceRegistry,
    M3_SERVICE_TOKENS,
    type M3GatewayPort
} from './index';

const WIRE_PAYLOAD = {
    harmonicProfile: {
        codonRotationProjection: {
            codon: 'CTC',
            codonClass: 'non-dual',
            codonId: 38,
            datasetLutState: 'materialized-kernel-lut',
            rotation: 2,
            rotationDegrees: 90,
            rotationalStateCount: 7
        },
        mahamaya: {
            hexagramId: 10,
            tarotMinorId: null,
            tarotShadowCodon: null
        },
        tick12: 4,
        degree720: 415
    }
};

function receipt(method: string, params: Record<string, unknown>): KernelBridgeCapabilityReceipt {
    return {
        method,
        gatewayMethod: method,
        sessionKey: '',
        profileGeneration: null,
        privacyClass: 'public',
        provenanceHandles: [],
        vak: {
            vakAddress: { cpf: '', ct: '', cp: '', cf: '', cfp: '', cs: '' },
            routeLineage: []
        },
        artifact: params
    };
}

describe('M3 renderer-service registry', () => {
    it('resolves all six symbols through one injected gateway port without global instances', () => {
        const port: M3GatewayPort = {
            invoke: async (method, params = {}) => receipt(method, params)
        };
        const first = createM3ServiceRegistry(port);
        const second = createM3ServiceRegistry(port);

        for (const token of Object.values(M3_SERVICE_TOKENS)) {
            expect(first.resolve(token)).toBeTruthy();
            expect(first.resolve(token)).not.toBe(second.resolve(token));
        }
    });

    it('dispatches every service operation through the exact governed method and parameters', async () => {
        const calls: Array<{ method: string; params: Record<string, unknown> }> = [];
        const port: M3GatewayPort = {
            invoke: async (method, params = {}) => {
                calls.push({ method, params });
                return receipt(method, params);
            }
        };
        const services = createM3ServiceRegistry(port);

        await services.tarotDecan.resolve('wands:ace');
        await services.hexagramBodyDynamics.resolve(42);
        await services.lensAperture.activate(16);
        await services.walkNavigation.advance(8, 'backward');
        await services.oracleCast.castIChing();
        await services.oracleCast.castTarot({ deck: 'thoth', drawCount: 3 });

        expect(calls).toEqual([
            {
                method: 's2.codon.scalar_ref.read',
                params: { refKind: 'tarot', scalarRef: 'wands:ace' }
            },
            {
                method: 's2.codon.scalar_ref.read',
                params: { refKind: 'i-ching', scalarRef: 42 }
            },
            {
                method: 's3.world_clock.aperture.activate',
                params: { lensId: 16 }
            },
            {
                method: 's3.world_clock.walk.advance',
                params: { walkId: 8, direction: 'backward' }
            },
            {
                method: 's5.oracle.iching.cast',
                params: { castMethod: 'three-coin' }
            },
            {
                method: 's5.oracle.tarot.cast',
                params: { deck: 'thoth', drawCount: 3 }
            }
        ]);
    });

    it('rejects malformed service inputs before transport and renders from the supplied profile only', async () => {
        let invocationCount = 0;
        const port: M3GatewayPort = {
            invoke: async (method, params = {}) => {
                invocationCount += 1;
                return receipt(method, params);
            }
        };
        const services = createM3ServiceRegistry(port);

        await expect(services.tarotDecan.resolve('  ')).rejects.toThrow('card key');
        await expect(services.hexagramBodyDynamics.resolve(65)).rejects.toThrow('1..64');
        await expect(services.lensAperture.activate(17)).rejects.toThrow('0..16');
        await expect(services.walkNavigation.advance(-1, 'forward')).rejects.toThrow('0..8');

        const surface = services.cosmicClock.render({
            payload: WIRE_PAYLOAD,
            generation: 9
        });
        expect(surface.activeProjection?.codonId).toBe(38);
        expect(surface.generation).toBe(9);
        expect(invocationCount).toBe(0);
    });
});
