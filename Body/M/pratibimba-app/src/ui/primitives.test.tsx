/**
 * Coordinate: M' shell (shared primitives law — Track 16.T16.10 / CCT-10)
 * Actualises: the CCT-10 acceptance — one shared home: the 7-member DR-UI-3
 *   taxonomy re-exports, the DR-UI-4 timings exactly as ratified, the CCT-6
 *   tooltip carries the kernel chain verbatim, and the Cl(4,2) palette is
 *   single-source (the played-torus consumes it, no local fork).
 */

// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CL42_INDIGO, CL42_WARM } from '../panes/playedTorusScene';
import {
    BedrockLinkTooltip,
    BlockedOverlay,
    CL42_PALETTE,
    CoordinateString,
    LEMNISCATE_MASK_LAW,
    PendingBadge,
    ProvenanceBorder,
    ReadinessIndicator,
    TRANSITIONS
} from './primitives';

describe('shared ui primitives (CCT-10)', () => {
    it('DR-UI-4: exactly the three ratified transition configs — 400 cubic-out / 240 linear / 320 smoothstep', () => {
        expect(TRANSITIONS.lemniscate01).toEqual({ ms: 400, easing: 'cubic-out' });
        expect(TRANSITIONS.kleinFlip).toEqual({ ms: 240, easing: 'linear' });
        expect(TRANSITIONS.mobiusReturn).toEqual({ ms: 320, easing: 'smoothstep' });
        expect(Object.keys(TRANSITIONS)).toHaveLength(3);
        expect(LEMNISCATE_MASK_LAW).toContain('cos(2θ)');
    });

    it('Cl(4,2) palette is SINGLE-SOURCE: the played-torus consumes the shared values', () => {
        expect(CL42_INDIGO).toBe(CL42_PALETTE.implicateIndigo);
        expect(CL42_WARM).toBe(CL42_PALETTE.explicateWarm);
    });

    it('CCT-6: the bedrock tooltip carries the kernel chain verbatim', () => {
        const chain =
            'Body/S/S0/portal-core/src/kernel.rs:878 -> .rodata -> MathemeHarmonicProfile.bedrock -> readinessLedger.bedrock_link';
        render(<BedrockLinkTooltip chain={chain}>bedrock</BedrockLinkTooltip>);
        expect(screen.getByTestId('bedrock-link-tooltip').getAttribute('title')).toBe(chain);
    });

    it('Track 30 shelf renders shared coordinate, provenance, pending, and readiness states', () => {
        render(
            <ProvenanceBorder state="derived">
                <CoordinateString value="M4-3" />
                <PendingBadge id="pending-dataset" />
                <ReadinessIndicator state="pending" detail="awaiting producer" />
            </ProvenanceBorder>
        );

        expect(screen.getByTestId('provenance-border').getAttribute('data-provenance')).toBe(
            'derived'
        );
        expect(screen.getByTestId('coordinate-string').getAttribute('data-family')).toBe('M');
        expect(screen.getByTestId('pending-badge').textContent).toContain('pending-dataset');
        expect(screen.getByTestId('readiness-indicator').getAttribute('data-readiness')).toBe(
            'pending'
        );
    });

    it('Track 30 blocked overlay exposes and executes its recovery action', () => {
        let recovered = 0;
        render(
            <BlockedOverlay
                reason="protected-local consent required"
                actionLabel="Open consent"
                onAction={() => {
                    recovered += 1;
                }}
            />
        );

        expect(screen.getByTestId('blocked-overlay').textContent).toContain(
            'protected-local consent required'
        );
        fireEvent.click(screen.getByRole('button', { name: 'Open consent' }));
        expect(recovered).toBe(1);
    });
});
