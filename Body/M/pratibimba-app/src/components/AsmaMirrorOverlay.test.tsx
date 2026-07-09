import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AsmaMirrorOverlay, AsmaOverlayRecord } from './AsmaMirrorOverlay';
import { useTickStore } from '../state/stores';

const MIRRORED: AsmaOverlayRecord = {
    nameIdx: 2,
    group: 0,
    indexInGroup: 2,
    mirrorIdx: 35,
    mirrorName: 'Al-Latif',
    mirrorRelation: 'domain_mirror',
    phaseLaw: '#/inversion_spanda'
};

const UNMIRRORED: AsmaOverlayRecord = {
    ...MIRRORED,
    nameIdx: 97,
    mirrorIdx: 0xff,
    mirrorName: null
};

function seedProfile(kleinFlip: { kind: string } | null) {
    useTickStore.setState({
        generation: 7,
        profile: {
            generation: 7,
            cachedAtMs: 0,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: {
                harmonicProfile: {
                    resonance72: { lensAnchorIndex: 42 },
                    kleinFlip
                }
            }
        } as never
    });
}

describe('AsmaMirrorOverlay (Tranche 03.T3.10 — double-cover discipline)', () => {
    beforeEach(() => {
        useTickStore.setState({ generation: null, profile: null } as never);
    });
    afterEach(cleanup);

    it('shows the conjugate reading on an active M2 flip while conserving address72', () => {
        seedProfile({ kind: 'm2CymaticValenceInvert' });
        render(<AsmaMirrorOverlay record={MIRRORED} />);

        const overlay = screen.getByTestId('asma-mirror-overlay');
        // Phase changes...
        expect(overlay.dataset.phase).toBe('inverted');
        expect(screen.getByTestId('asma-mirror').textContent).toContain('conjugate active');
        // ...the address does not: same 72-address, flipped phase only.
        expect(overlay.dataset.address72).toBe('42');
        expect(screen.getByTestId('asma-address').textContent).toBe('72:42');
        expect(screen.getByTestId('asma-phase-law').textContent).toBe('#/inversion_spanda');
    });

    it('reads primary phase with the same conserved address when no flip is active', () => {
        seedProfile(null);
        render(<AsmaMirrorOverlay record={MIRRORED} />);

        const overlay = screen.getByTestId('asma-mirror-overlay');
        expect(overlay.dataset.phase).toBe('primary');
        expect(overlay.dataset.address72).toBe('42');
        expect(screen.getByTestId('asma-mirror').textContent).not.toContain('conjugate');
        expect(screen.getByTestId('asma-name').textContent).toContain('Jalal');
    });

    it('renders explicit mirror absence (0xFF) without inventing a pair', () => {
        seedProfile(null);
        render(<AsmaMirrorOverlay record={UNMIRRORED} />);

        expect(screen.getByTestId('asma-mirror').textContent).toBe('no domain mirror');
    });

    it('stays an overlay strip, never a seventh axis: no axis role or grid claim', () => {
        seedProfile({ kind: 'm2CymaticValenceInvert' });
        render(<AsmaMirrorOverlay record={MIRRORED} />);

        const overlay = screen.getByTestId('asma-mirror-overlay');
        expect(overlay.className).toContain('asma-mirror-overlay');
        expect(overlay.getAttribute('role')).toBeNull();
        expect(overlay.querySelector('[data-axis]')).toBeNull();
    });
});
