/**
 * Coordinate: M' shell chrome acceptance (31.T31.6 — coordinate breadcrumb)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: proves the top coordinate-path breadcrumb renders the
 *   family → archetype → position triad of the active coordinate and that each
 *   segment click retargets to its reduced coordinate over the cross-layout
 *   intent spine (highlight-coordinate alias), carrying session identity.
 * Contract: rerun tranche [[31.T31.6]] (consumes [[30.T30.2]] + [[31.T31.10]])
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CROSS_LAYOUT_INTENT_COMMAND } from '../commands/crossLayoutIntent';
import { commands } from '../commands/registry';
import { useCoordinateStore, useSessionStore } from '../state/stores';
import { CoordinateBreadcrumb } from './CoordinateBreadcrumb';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

describe('31.T31.6 CoordinateBreadcrumb', () => {
    let dispatched: Array<Record<string, unknown>>;
    let unregister: () => void;

    beforeEach(() => {
        dispatched = [];
        unregister = commands.register({
            id: CROSS_LAYOUT_INTENT_COMMAND,
            title: 'test intent capture',
            run: arg => {
                dispatched.push(arg as Record<string, unknown>);
            }
        });
        useCoordinateStore.setState({ selected: null });
        useSessionStore.setState({ sessionKey: 'sess-1', dayNow: '07-16-2026', privacyClass: 'protected' });
        // Generation rides a real frame: the wire stamps the store's
        // generation from the profile it delivered, so a bare generation is a
        // state no tick could produce.
        resetProfileTicks();
        publishProfileTick({ generation: 88, cachedAtMs: 88, stale: false, stalenessMs: 0, privacyClass: 'public-current-context', profile: { generation: 88 } } as never);
    });

    afterEach(() => {
        cleanup();
        unregister();
    });

    it('renders nothing when no coordinate is selected', () => {
        useCoordinateStore.setState({ selected: null });
        const { container } = render(<CoordinateBreadcrumb />);
        expect(container.querySelector('[data-testid="coordinate-breadcrumb"]')).toBeNull();
    });

    it('renders the family/archetype/position triad for M4-3', () => {
        useCoordinateStore.setState({ selected: 'M4-3' });
        render(<CoordinateBreadcrumb />);
        expect(screen.getByTestId('coordinate-breadcrumb')).toBeTruthy();
        expect(screen.getByTestId('coordinate-breadcrumb-family').textContent).toBe('M');
        expect(screen.getByTestId('coordinate-breadcrumb-archetype').textContent).toBe('Nara');
        expect(screen.getByTestId('coordinate-breadcrumb-position').textContent).toBe('3');
    });

    it('each segment retargets to its reduced coordinate over the intent spine', () => {
        useCoordinateStore.setState({ selected: 'M4-3' });
        render(<CoordinateBreadcrumb />);

        fireEvent.click(screen.getByTestId('coordinate-breadcrumb-family'));
        fireEvent.click(screen.getByTestId('coordinate-breadcrumb-archetype'));
        fireEvent.click(screen.getByTestId('coordinate-breadcrumb-position'));

        expect(dispatched.map(d => d.coordinate)).toEqual(['M', 'M4', 'M4-3']);
        for (const intent of dispatched) {
            expect(intent.requestedExtensionId).toBe('ide-shell-m0-m5');
            expect(intent.requestedContributionId).toBe('highlight-coordinate');
            expect(intent.sessionKey).toBe('sess-1');
            expect(intent.dayNow).toBe('07-16-2026');
            expect(intent.profileGeneration).toBe(88);
            expect(intent.privacyClass).toBe('protected');
        }
    });

    it('omits the position segment for a bare subsystem coordinate (M0)', () => {
        useCoordinateStore.setState({ selected: 'M0' });
        render(<CoordinateBreadcrumb />);
        expect(screen.getByTestId('coordinate-breadcrumb-family').textContent).toBe('M');
        expect(screen.getByTestId('coordinate-breadcrumb-archetype').textContent).toBe('Anuttara');
        expect(screen.queryByTestId('coordinate-breadcrumb-position')).toBeNull();
    });

    it('renders nothing for a non-family coordinate (#4 raw archetype)', () => {
        useCoordinateStore.setState({ selected: '#4' });
        const { container } = render(<CoordinateBreadcrumb />);
        expect(container.querySelector('[data-testid="coordinate-breadcrumb"]')).toBeNull();
    });
});
