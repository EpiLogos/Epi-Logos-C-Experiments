/**
 * Coordinate: M' shell chrome acceptance (31.T31.7 — shell slot policy)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: holds the carrier shell in lockstep with SHELL_SLOT_POLICY — every
 *   slot is well-formed, exclusive slots have a single owner, and the two
 *   machine-checkable slots (status-bar six-thread discipline, top-area
 *   breadcrumb) are confirmed against the real rendered surfaces.
 * Contract: rerun tranche [[31.T31.7]] (CC-07 / CCT-7)
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CoordinateBreadcrumb } from '../components/CoordinateBreadcrumb';
import { StatusStrip } from '../components/StatusStrip';
import { useCoordinateStore } from '../state/stores';
import { SHELL_SLOT_POLICY, shellSlot, STATE_THREAD_COUNT } from './shellSlotPolicy';

const POLICIES = ['exclusive', 'composition', 'activity-bar-switched', 'per-layout', 'discipline'];

afterEach(cleanup);

describe('31.T31.7 shell slot policy — well-formed contract', () => {
    it('declares exactly the six application-shell slots with unique ids', () => {
        expect(SHELL_SLOT_POLICY).toHaveLength(6);
        const ids = SHELL_SLOT_POLICY.map(slot => slot.id);
        expect(new Set(ids)).toEqual(new Set(['top', 'main', 'right', 'left', 'bottom', 'status-bar']));
    });

    it('every slot carries a valid policy, an owner, and a rationale', () => {
        for (const slot of SHELL_SLOT_POLICY) {
            expect(POLICIES, `slot ${slot.id}`).toContain(slot.policy);
            expect(slot.owner.length).toBeGreaterThan(0);
            expect(slot.rationale.length).toBeGreaterThan(0);
        }
    });

    it('exclusive slots name a single owner (no stacking, no alternation)', () => {
        for (const slot of SHELL_SLOT_POLICY) {
            if (slot.policy === 'exclusive') {
                expect(slot.owner, `exclusive slot ${slot.id}`).not.toContain('|');
            }
        }
        expect(shellSlot('right').owner).toBe('omnipanel');
        expect(shellSlot('top').owner).toBe('coordinate-breadcrumb');
    });
});

describe('31.T31.7 shell slot policy — carrier conformance', () => {
    it('the status-bar discipline (exactly six state threads) matches the live StatusStrip', () => {
        const slot = shellSlot('status-bar');
        expect(slot.policy).toBe('discipline');
        expect(slot.exactCount).toBe(STATE_THREAD_COUNT);

        const { container } = render(<StatusStrip />);
        const entries = container.querySelectorAll('.status-strip > span');
        expect(entries).toHaveLength(STATE_THREAD_COUNT);
    });

    it('the top slot is owned by the coordinate breadcrumb — the real surface renders', () => {
        useCoordinateStore.setState({ selected: 'M4-3' });
        render(<CoordinateBreadcrumb />);
        expect(screen.getByTestId('coordinate-breadcrumb')).toBeTruthy();
        useCoordinateStore.setState({ selected: null });
    });
});
