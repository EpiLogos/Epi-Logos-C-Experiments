/**
 * Coordinate: M' shell acceptance (28.T28.19)
 * Residency: Body/M/pratibimba-app/src
 * Position (#n): #0/1 cross-layout carrier boundary
 * Actualises: the acceptance-harness state-identity assertion for the ide-shell
 *   chrome, retargeted per DR-FACE-7. The stale design-recon 28.19 (c)-(h)
 *   per-widget assertions (canon uri / atelier term / evidence / review /
 *   ACR VAK / autoresearch filter) are OVERRIDDEN by the ratified "view
 *   selections reset on cross-layout" reorientation; the honest carrier contract
 *   is the seven-field shared-identity tuple that MUST survive daily-0-1 <->
 *   ide-deep routing while per-view ephemeral selections are free to reset.
 *   This consolidating validator pins that content-law: the tuple is EXACTLY the
 *   seven shared fields (no per-view selection is an identity field), and the
 *   preservation guard fails closed on EVERY one of them — the sibling
 *   11.T11.6 App-level acceptance (crossLayoutStateIdentity.test.tsx) drives the
 *   real routing receipt but only exercises coordinate + activityBarMode drift.
 * Public surface: Vitest acceptance for the cross-layout identity content-law
 * Does NOT own: profile production, session binding, coordinate selection, or the
 *   App routing receipt (that is 11.T11.6's crossLayoutStateIdentity.test.tsx)
 * Contract: [[M'-SYSTEM-SPEC]] and rerun tranche [[28.T28.19]] (consumes [[11.T11.6]])
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { KernelBridgeCachedProfile } from './bridge/types';
import {
    createCrossLayoutIdentityReceipt,
    readCrossLayoutIdentity,
    type BimbaPratibimbaUiState
} from './state/crossLayoutIdentity';
import { useCoordinateStore, useSessionStore, useTickStore } from './state/stores';
import { useLeftSidebarModeStore } from './ui/leftSidebarModes';

/** The seven shared fields that ARE the cross-layout identity (crossLayoutIdentity.ts). */
const SHARED_IDENTITY_FIELDS = [
    'coordinate',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey',
    'dayNow',
    'activityBarMode'
] as const;

/** The stale design-recon 28.19 (c)-(h) per-view selections that the ratified
 *  "view selections reset on cross-layout" reorientation deliberately EXCLUDES
 *  from the identity tuple — none of these may become an identity field. */
const EXCLUDED_PER_VIEW_KEYS = [
    'canonUri',
    'atelierTerm',
    'evidenceSelection',
    'reviewSelection',
    'acrVak',
    'autoresearchFilter',
    'omniFold',
    'activeTab'
];

function seedProfile(generation: number, lens: number, mode: number): void {
    useTickStore.getState().setProfile({
        generation,
        cachedAtMs: 1,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'safe-public-current-kernel-tick',
        profile: {
            harmonicProfile: {
                modalResonator: { lensMode: { lens, mode } }
            }
        }
    } as unknown as KernelBridgeCachedProfile);
}

describe('28.T28.19 cross-layout state-identity acceptance (retargeted content-law)', () => {
    beforeEach(() => {
        useTickStore.setState({ profile: null, generation: null });
        useCoordinateStore.setState({ selected: null });
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        useLeftSidebarModeStore.setState({ activeModeId: 'coordinate-tree', layout: 'daily-0-1' });
    });

    afterEach(() => {
        useTickStore.setState({ profile: null, generation: null });
    });

    it('the identity tuple is EXACTLY the seven shared fields — per-view selections are not identity', () => {
        // Drive the exact spec-28.19 flow inputs (sample codon M3-1-0-13,
        // acceptance-test-session-001, profile generation 42, coordinate-tree mode).
        useCoordinateStore.setState({ selected: 'M3-1-0-13' });
        useSessionStore.setState({
            sessionKey: 'acceptance-test-session-001',
            dayNow: '07-16-2026',
            privacyClass: null
        });
        seedProfile(42, 2, 3);
        useLeftSidebarModeStore.setState({ activeModeId: 'coordinate-tree', layout: 'ide-deep' });

        const tuple = readCrossLayoutIdentity();

        // Content-law pin: the tuple is EXACTLY the seven shared fields.
        expect(Object.keys(tuple).sort()).toEqual([...SHARED_IDENTITY_FIELDS].sort());
        // No stale per-view selection leaks in as an identity field.
        for (const excluded of EXCLUDED_PER_VIEW_KEYS) {
            expect(tuple).not.toHaveProperty(excluded);
        }
        // The tuple carries the spine values it read (a real read, not a stub).
        expect(tuple.coordinate).toBe('M3-1-0-13');
        expect(tuple.sessionKey).toBe('acceptance-test-session-001');
        expect(tuple.dayNow).toBe('07-16-2026');
        expect(tuple.profileGeneration).toBe(42);
        expect(tuple.lens).toBe(2);
        expect(tuple.mode).toBe(3);
        expect(tuple.activityBarMode).toBe('coordinate-tree');
    });

    it('the preservation guard fails closed on EVERY one of the seven fields', () => {
        const before: BimbaPratibimbaUiState = {
            coordinate: 'M3-1-0-13',
            lens: 2,
            mode: 3,
            profileGeneration: 42,
            sessionKey: 'acceptance-test-session-001',
            dayNow: '07-16-2026',
            activityBarMode: 'coordinate-tree'
        };
        const drift: Record<(typeof SHARED_IDENTITY_FIELDS)[number], unknown> = {
            coordinate: 'M4-4',
            lens: 9,
            mode: 0,
            profileGeneration: 43,
            sessionKey: 'other-session',
            dayNow: '07-17-2026',
            activityBarMode: 'canon-studio'
        };

        for (const field of SHARED_IDENTITY_FIELDS) {
            expect(() =>
                createCrossLayoutIdentityReceipt('daily-0-1', 'ide-deep', before, {
                    ...before,
                    [field]: drift[field]
                } as BimbaPratibimbaUiState)
            ).toThrow(`cross-layout identity changed during routing: ${field}`);
        }
    });

    it('an unchanged tuple round-trips through the guard (state-identity preserved)', () => {
        const tuple: BimbaPratibimbaUiState = {
            coordinate: 'M3-1-0-13',
            lens: 2,
            mode: 3,
            profileGeneration: 42,
            sessionKey: 'acceptance-test-session-001',
            dayNow: '07-16-2026',
            activityBarMode: 'coordinate-tree'
        };

        const receipt = createCrossLayoutIdentityReceipt('daily-0-1', 'ide-deep', tuple, { ...tuple });

        expect(receipt.before).toEqual(receipt.after);
        expect(receipt.fromLayout).toBe('daily-0-1');
        expect(receipt.toLayout).toBe('ide-deep');
    });
});
