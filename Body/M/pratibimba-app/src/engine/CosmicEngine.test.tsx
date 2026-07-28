// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildPlanetChip, CosmicEngine } from './CosmicEngine';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';
import { CompositionProfileProvider } from '../composition/compositionProfileContext';

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

describe('CosmicEngine component (jsdom mount)', () => {
    it('renders the honest WebGL fallback when no GPU surface exists (jsdom)', () => {
        // jsdom has no WebGL context — THREE.WebGLRenderer throws and the
        // component must degrade to the fallback message, never a blank pane
        // or a crash.
        render(
            <CompositionProfileProvider>
                <CosmicEngine />
            </CompositionProfileProvider>
        );
        expect(screen.getByTestId('cosmic-engine-fallback').textContent).toMatch(
            /WebGL unavailable/
        );
        expect(screen.queryByTestId('cosmic-engine')).toBeNull();
    });

    it('renders the Wave-A status from a real cached gateway profile even while WebGL is unavailable', () => {
        publishProfileTick({
                generation: 23,
                cachedAtMs: 23_000,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'public-current-context',
                profile: {
                    harmonicProfile: {
                        kleinFlip: false,
                        resonance72Index: 17,
                        audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
                        nodalQuartet: [{ qlPosition: 1, helix: 'b', m: 2, n: 3 }]
                    }
                }
            } as never);

        render(
            <CompositionProfileProvider>
                <CosmicEngine />
            </CompositionProfileProvider>
        );

        expect(screen.getByTestId('engine-integrated-readiness').dataset.state).toBe('ready');
        expect(screen.getByTestId('engine-integrated-readiness').textContent).toBe('Wave A ready');
    });
    // 29.T29.2 — the slot-ownership law had NO production caller: the only file
    // referencing `geometricSlotEnforcement` was its own test. This is the
    // behavioural proof that the render now reaches it. Ownership is a property
    // of the declaration, not of a GPU surface, so it reports even here where
    // WebGL is unavailable.
    it('reports one named owner per cosmic geometric slot', () => {
        render(
            <CompositionProfileProvider>
                <CosmicEngine />
            </CompositionProfileProvider>
        );
        // Ownership rides data attributes on the surface root, matching the
        // file's existing idiom (data-m3-lens-ring-contract) so the readout
        // adds no rendered text to a screenshot-baselined face.
        const root = screen.getByTestId('cosmic-engine-fallback');
        expect(root.getAttribute('data-composition-mounted')).toBe('true');
        expect(root.getAttribute('data-surface-owner')).toBe('m1-paramasiva-played-torus');
        expect(root.getAttribute('data-texture-owner')).toBe('m2-parashakti');
        expect(root.getAttribute('data-cell-state-owner')).toBe('m3-mahamaya');
        expect(root.getAttribute('data-composition-rejection')).toBe('');
    });
});

describe('planet chip (E5 interaction surface)', () => {
    it('carries the engraved identity structure and fires selection on click', () => {
        const onSelect = vi.fn();
        const chip = buildPlanetChip(3, onSelect); // Venus
        expect(chip.root.querySelector('.planet-chip-glyph')?.textContent).toBe('♀');
        expect(chip.root.querySelector('.planet-chip-name')?.textContent).toBe('Venus');
        expect(
            (chip.root.querySelector('.planet-chip-rx') as HTMLElement).style.display
        ).toBe('none'); // no ℞ until the kernel says retrograde
        expect(
            (chip.root.querySelector('.planet-chip-resonance') as HTMLElement).style.display
        ).toBe('none'); // no resonance dot until the kernel flags it
        chip.root.click();
        chip.root.click();
        expect(onSelect).toHaveBeenCalledTimes(2);
    });
});
