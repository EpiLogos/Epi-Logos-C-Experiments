/**
 * Coordinate: M' M3' (renderer-service composition registry, 24.T24.16)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): active-carrier service composition root.
 * Actualises: explicit symbol-addressed construction over one injected gateway port.
 * Public surface: M3_SERVICE_TOKENS, M3ServiceRegistry, createM3ServiceRegistry.
 * Does NOT own: global instances, a DI container, gateway lifecycle, or transports.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16.
 */

export { CosmicClockRenderService } from './CosmicClockRenderService';
export { HexagramBodyDynamicsService } from './HexagramBodyDynamicsService';
export { M3LensApertureService } from './M3LensApertureService';
export { M3OracleCastService } from './M3OracleCastService';
export { M3PentadicTraceService } from './M3PentadicTraceService';
export { M3WalkNavigationService } from './M3WalkNavigationService';
export { TarotDecanService } from './TarotDecanService';
export type { M3GatewayPort } from './m3GatewayPort';

import { CosmicClockRenderService } from './CosmicClockRenderService';
import { HexagramBodyDynamicsService } from './HexagramBodyDynamicsService';
import { M3LensApertureService } from './M3LensApertureService';
import { M3OracleCastService } from './M3OracleCastService';
import { M3PentadicTraceService } from './M3PentadicTraceService';
import { M3WalkNavigationService } from './M3WalkNavigationService';
import { TarotDecanService } from './TarotDecanService';
import type { M3GatewayPort } from './m3GatewayPort';

export const M3_SERVICE_TOKENS = Object.freeze({
    cosmicClock: Symbol('M3CosmicClockRenderService'),
    tarotDecan: Symbol('M3TarotDecanService'),
    hexagramBodyDynamics: Symbol('M3HexagramBodyDynamicsService'),
    lensAperture: Symbol('M3LensApertureService'),
    walkNavigation: Symbol('M3WalkNavigationService'),
    oracleCast: Symbol('M3OracleCastService'),
    pentadicTrace: Symbol('M3PentadicTraceService')
});

export type M3Service =
    | CosmicClockRenderService
    | TarotDecanService
    | HexagramBodyDynamicsService
    | M3LensApertureService
    | M3WalkNavigationService
    | M3OracleCastService
    | M3PentadicTraceService;

export class M3ServiceRegistry {
    readonly cosmicClock: CosmicClockRenderService;
    readonly tarotDecan: TarotDecanService;
    readonly hexagramBodyDynamics: HexagramBodyDynamicsService;
    readonly lensAperture: M3LensApertureService;
    readonly walkNavigation: M3WalkNavigationService;
    readonly oracleCast: M3OracleCastService;
    readonly pentadicTrace: M3PentadicTraceService;

    constructor(bridge: M3GatewayPort) {
        this.cosmicClock = new CosmicClockRenderService(bridge);
        this.tarotDecan = new TarotDecanService(bridge);
        this.hexagramBodyDynamics = new HexagramBodyDynamicsService(bridge);
        this.lensAperture = new M3LensApertureService(bridge);
        this.walkNavigation = new M3WalkNavigationService(bridge);
        this.oracleCast = new M3OracleCastService(bridge);
        this.pentadicTrace = new M3PentadicTraceService(bridge);
        Object.freeze(this);
    }

    resolve(token: symbol): M3Service {
        if (token === M3_SERVICE_TOKENS.cosmicClock) return this.cosmicClock;
        if (token === M3_SERVICE_TOKENS.tarotDecan) return this.tarotDecan;
        if (token === M3_SERVICE_TOKENS.hexagramBodyDynamics) {
            return this.hexagramBodyDynamics;
        }
        if (token === M3_SERVICE_TOKENS.lensAperture) return this.lensAperture;
        if (token === M3_SERVICE_TOKENS.walkNavigation) return this.walkNavigation;
        if (token === M3_SERVICE_TOKENS.oracleCast) return this.oracleCast;
        if (token === M3_SERVICE_TOKENS.pentadicTrace) return this.pentadicTrace;
        throw new Error('unknown M3 service token');
    }
}

export function createM3ServiceRegistry(bridge: M3GatewayPort): M3ServiceRegistry {
    return new M3ServiceRegistry(bridge);
}
