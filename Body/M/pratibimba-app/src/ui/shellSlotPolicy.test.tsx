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
import { deepLayoutJson, deepPaneMounts } from './deepPaneSet';

const POLICIES = ['exclusive', 'composition', 'activity-bar-switched', 'per-layout', 'discipline'];

afterEach(cleanup);

describe('31.T31.7 shell slot policy — well-formed contract', () => {
    it('declares exactly the six application-shell slots with unique ids', () => {
        expect(SHELL_SLOT_POLICY).toHaveLength(6);
        const ids = SHELL_SLOT_POLICY.map(slot => slot.id);
        expect(new Set(ids)).toEqual(new Set(['top', 'main', 'right', 'left', 'bottom', 'status-bar']));
    });

    it('every slot carries a valid policy, an owner, a rationale, and a layout verdict', () => {
        for (const slot of SHELL_SLOT_POLICY) {
            expect(POLICIES, `slot ${slot.id}`).toContain(slot.policy);
            expect(slot.owner.length).toBeGreaterThan(0);
            expect(slot.rationale.length).toBeGreaterThan(0);
            expect(typeof slot.layoutVaried, `slot ${slot.id} layoutVaried`).toBe('boolean');
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

describe('52.T4 shell slot policy — the per-layout declaration matches the shell', () => {
    it('names exactly the slots the deep pane set really varies', () => {
        const varied = SHELL_SLOT_POLICY.filter(slot => slot.layoutVaried).map(slot => slot.id);
        expect(varied.sort()).toEqual(['left', 'main']);
    });

    it('the `bottom` row no longer claims a per-layout composition nobody builds', () => {
        const bottom = shellSlot('bottom');
        // The policy (the LAW for the slot) survives; the false claim that the
        // shell inhabits it does not. Neither deep model composes a bottom.
        expect(bottom.layoutVaried).toBe(false);
        for (const model of ['cosmic', 'personal'] as const) {
            const borders = deepLayoutJson(model, { type: 'border', location: 'right', children: [] })
                .borders as ReadonlyArray<{ location?: string }>;
            expect(borders.some(border => border.location === 'bottom')).toBe(false);
        }
    });

    it('the `left` slot really differs per layout — the deep rail is its own', () => {
        // The daily face-1 rail is the lived-reading surfaces and face 0 has no
        // left border at all; the deep rail is the IDE explorer on BOTH faces.
        for (const model of ['cosmic', 'personal'] as const) {
            const deepLeft = deepPaneMounts(model, 'left').map(mount => mount.surfaceId);
            expect(deepLeft).toEqual(['fileTree', 'semanticConnections', 'coordinateTree']);
        }
    });

    it('the `main` slot stays ONE editor area per face — composition, not juxtaposition', () => {
        expect(shellSlot('main').policy).toBe('composition');
        for (const model of ['cosmic', 'personal'] as const) {
            const row = deepLayoutJson(model, { type: 'border', location: 'right', children: [] }).layout;
            expect(row.type).toBe('row');
            expect(row.children).toHaveLength(1);
            expect(row.children[0].type).toBe('tabset');
        }
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
