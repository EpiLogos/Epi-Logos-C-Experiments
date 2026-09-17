/**
 * Coordinate: M' `/` membrane (ACR capability migration proof - 27.T27.10)
 * Actualises: behavioral proof of strict S4 snapshot parsing, entitlement
 * parity, modern dispatch-roster separation, and carrier capacity bindings.
 */

import { describe, expect, it } from 'vitest';
import {
    ALETHEIA_TECHNE_GUARDIANS,
    ANIMA_DISPATCH_TARGETS,
    isSnapshotCapabilityAllowed,
    mediationCapacityBindings,
    parseMediationCapabilitySnapshot,
    PSYCHE_ASPECT_REGISTERS,
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    S4_MEDIATION_ROUTE_METHOD
} from './omnipanelCapabilities';

const SNAPSHOT = {
    owner: "S4'",
    method: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    routesThrough: S4_MEDIATION_ROUTE_METHOD,
    dispatchTools: ['dispatch_agent', 'dispatch_moirai_night_pass'],
    aletheiaModeInternalTools: ['dispatch_moirai_night_pass', 'aletheia_crystallise'],
    capabilities: [
        { name: 'dispatch_agent', entitlementClass: 'standard' },
        { name: 'dispatch_moirai_night_pass', entitlementClass: 'aletheia-mode-internal' },
        { name: 'aletheia_crystallise', entitlementClass: 'aletheia-mode-internal' }
    ]
};

describe('OmniPanel ACR capability migration (27.T27.10)', () => {
    it('strict-parses gateway families and preserves entitlement classes in bindings', () => {
        const parsed = parseMediationCapabilitySnapshot(SNAPSHOT);
        const bindings = mediationCapacityBindings(parsed);

        expect(bindings).toHaveLength(3);
        expect(bindings.map(binding => binding.capability)).toEqual([
            'dispatch_agent',
            'dispatch_moirai_night_pass',
            'aletheia_crystallise'
        ]);
        expect(bindings[1]).toEqual({
            capability: 'dispatch_moirai_night_pass',
            entitlementClass: 'aletheia-mode-internal',
            route: S4_MEDIATION_ROUTE_METHOD,
            dispatchTab: 'dispatch-trace',
            streamTab: 'tool-stream'
        });
        expect(isSnapshotCapabilityAllowed('dispatch_agent', parsed)).toBe(true);
        expect(isSnapshotCapabilityAllowed('unknown_local_fallback', parsed)).toBe(false);
    });

    it('fails closed on membership, duplicate-name, and entitlement-class drift', () => {
        expect(() =>
            parseMediationCapabilitySnapshot({
                ...SNAPSHOT,
                capabilities: SNAPSHOT.capabilities.slice(0, 2)
            })
        ).toThrow('capability membership mismatch');
        expect(() =>
            parseMediationCapabilitySnapshot({
                ...SNAPSHOT,
                dispatchTools: ['dispatch_agent', 'dispatch_agent']
            })
        ).toThrow('dispatchTools must not contain duplicates');
        expect(() =>
            parseMediationCapabilitySnapshot({
                ...SNAPSHOT,
                capabilities: SNAPSHOT.capabilities.map(item =>
                    item.name === 'aletheia_crystallise'
                        ? { ...item, entitlementClass: 'standard' }
                        : item
                )
            })
        ).toThrow('capability entitlement mismatch for aletheia_crystallise');
    });

    it('keeps executable targets distinct from the six Psyche aspect registers', () => {
        expect(ANIMA_DISPATCH_TARGETS).toHaveLength(8);
        expect(ANIMA_DISPATCH_TARGETS.slice(0, 2)).toEqual([
            { actor: 'pi', role: 'pi', techneClass: null },
            { actor: 'anima', role: 'anima', techneClass: null }
        ]);
        expect(ANIMA_DISPATCH_TARGETS.slice(2).map(target => target.techneClass)).toEqual([
            ...ALETHEIA_TECHNE_GUARDIANS
        ]);
        expect(ANIMA_DISPATCH_TARGETS.slice(2).every(target => target.actor === 'aletheia')).toBe(true);
        expect(PSYCHE_ASPECT_REGISTERS).toEqual([
            'nous',
            'logos',
            'eros',
            'mythos',
            'psyche',
            'sophia'
        ]);
        for (const aspect of PSYCHE_ASPECT_REGISTERS) {
            expect(ANIMA_DISPATCH_TARGETS.some(target => target.actor === aspect)).toBe(false);
        }
    });
});
