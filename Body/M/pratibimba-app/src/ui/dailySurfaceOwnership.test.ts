/**
 * Coordinate: M' M5-3' (daily ownership audit tests — rerun 11.T11.3)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): 0/1 daily shell ownership gate
 * Actualises: exhaustive no-ORPHAN enforcement over the active carrier ledger.
 * Public surface: Vitest ownership audit.
 * Does NOT own: receiver component behavior, covered by each receiver's tests.
 * Contract: [[M'-PORTAL-SPEC]] + rerun 11.T11.3.
 */

import { describe, expect, it } from 'vitest';
import {
    activeDailyClaimsForReceiver,
    assertDailyReceiverBindings,
    DAILY_SURFACE_OWNERSHIP,
    type DailySurfaceClaimId,
    requireDailyReceiver
} from './dailySurfaceOwnership';

const LEGACY_CLAIMS: readonly DailySurfaceClaimId[] = [
    'pratibimba.daily.journal',
    'pratibimba.daily.agent-checkin',
    'pratibimba.daily.cymatic-placeholder',
    'pratibimba.daily.status-display',
    'pratibimba.daily.library-projection',
    'pratibimba.daily.atelier-cluster-lens'
];

describe('daily surface ownership ledger (11.T11.3)', () => {
    it('disposes every legacy claim exactly once with no active orphan', () => {
        expect(Object.keys(DAILY_SURFACE_OWNERSHIP).sort()).toEqual([...LEGACY_CLAIMS].sort());
        for (const claimId of LEGACY_CLAIMS) {
            const ownership = DAILY_SURFACE_OWNERSHIP[claimId];
            expect(ownership.claimId).toBe(claimId);
            expect(ownership.evidence.length).toBeGreaterThan(40);
            if (ownership.disposition === 'retired') {
                expect(ownership.receiver).toBeNull();
                expect(ownership.canonicalClaimId).toBeNull();
            } else {
                expect(requireDailyReceiver(claimId)).toBe(ownership.receiver);
                expect(ownership.owner).not.toBeNull();
                expect(ownership.canonicalClaimId).not.toBeNull();
            }
        }
    });

    it('retires agent-checkin instead of misnaming observational successors as active-run control', () => {
        const claim = DAILY_SURFACE_OWNERSHIP['pratibimba.daily.agent-checkin'];
        expect(claim).toMatchObject({
            disposition: 'retired',
            receiver: null,
            successorReceivers: ['omniChat', 'omniLogs']
        });
        expect(() => requireDailyReceiver(claim.claimId)).toThrow(/retired.*no active receiver/);
    });

    it('keeps Library and Atelier as lenses on the existing file-tree and graph receivers', () => {
        expect(activeDailyClaimsForReceiver('fileTree')).toEqual(['pratibimba.daily.library-projection']);
        expect(activeDailyClaimsForReceiver('bimbaGraph')).toEqual(['pratibimba.daily.atelier-cluster-lens']);
    });

    it('fails closed when a layout binds a retained claim to the wrong receiver', () => {
        expect(() =>
            assertDailyReceiverBindings({
                'pratibimba.daily.journal': 'cosmic'
            })
        ).toThrow(/bound to 'cosmic'.*expected 'journalTimeline'/);
    });
});
