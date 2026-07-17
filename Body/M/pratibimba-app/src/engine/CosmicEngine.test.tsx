// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTickStore } from '../state/stores';
import { buildPlanetChip, CosmicEngine } from './CosmicEngine';

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('CosmicEngine component (jsdom mount)', () => {
    it('renders the honest WebGL fallback when no GPU surface exists (jsdom)', () => {
        // jsdom has no WebGL context — THREE.WebGLRenderer throws and the
        // component must degrade to the fallback message, never a blank pane
        // or a crash.
        render(<CosmicEngine />);
        expect(screen.getByTestId('cosmic-engine-fallback').textContent).toMatch(
            /WebGL unavailable/
        );
        expect(screen.queryByTestId('cosmic-engine')).toBeNull();
    });

    it('renders the Wave-A status from a real cached gateway profile even while WebGL is unavailable', () => {
        useTickStore.setState({
            generation: 23,
            profile: {
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
            } as never
        });

        render(<CosmicEngine />);

        expect(screen.getByTestId('engine-integrated-readiness').dataset.state).toBe('ready');
        expect(screen.getByTestId('engine-integrated-readiness').textContent).toBe('Wave A ready');
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
