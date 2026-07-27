/**
 * Coordinate: M' shell (shared primitives law — Track 16.T16.10 / CCT-10)
 * Actualises: the CCT-10 acceptance — one shared home: the 7-member DR-UI-3
 *   taxonomy re-exports, the DR-UI-4 timings exactly as ratified, the CCT-6
 *   tooltip carries the kernel chain verbatim, and the Cl(4,2) palette is
 *   single-source (the played-torus consumes it, no local fork).
 */

// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CL42_INDIGO, CL42_WARM } from '../panes/playedTorusScene';
import {
    BedrockLinkTooltip,
    BlockedOverlay,
    CL42_PALETTE,
    CodonString,
    CoordinateString,
    HexagramString,
    LEMNISCATE_MASK_LAW,
    PendingBadge,
    ProvenanceBorder,
    ReadinessIndicator,
    SymbolicCoordinateString,
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
        expect(screen.getByTestId('coordinate-string').textContent).toBe('M4-3');
        expect(screen.getByTestId('pending-badge').textContent).toContain('pending-dataset');
        expect(screen.getByTestId('readiness-indicator').getAttribute('data-readiness')).toBe(
            'pending'
        );
    });

    it('Track 30 coordinate primitives preserve authority strings and expose accessible structure', () => {
        const view = render(
            <>
                <CoordinateString value="[[S2-3]]" />
                <HexagramString value={1} changingLines={[0, 5]} />
                <SymbolicCoordinateString value="[[#R0-0/1:A-T7?]]" />
            </>
        );
        expect(within(view.container).getByTestId('coordinate-string').textContent).toBe('S2-3');
        // 30.T30.5 screen-reader contract: the text equivalent names the family
        // TIER and the archetype it manifests, not the bare letter — and speaks
        // the separators a reader would otherwise run together.
        expect(within(view.container).getByTestId('coordinate-string').getAttribute('aria-label')).toBe(
            'S2 dash 3, stack family, graphdb'
        );
        expect(within(view.container).getByTestId('hexagram-string').getAttribute('aria-label')).toContain(
            'changing lines 1, 6'
        );
        expect(within(view.container).getByTestId('symbolic-coordinate-string').textContent).toBe('#R0-0/1:A-T7?');
    });

    it('Track 30 codon primitive renders the real adapter shape without a browser codon table', async () => {
        render(
            <CodonString
                value="AUG"
                resolve={async () => ({
                    codon: 'AUG',
                    encoded: 14,
                    aminoAcidIndex: 12,
                    aminoAcid: 'Cys',
                    isStart: true,
                    isStop: false,
                    authority: 'portal-core::transcription'
                })}
            />
        );
        expect(await screen.findByText('Cys')).toBeTruthy();
        expect(screen.getByTestId('codon-string').getAttribute('aria-label')).toContain(
            'amino acid Cys, start'
        );
        expect(screen.getByText('START')).toBeTruthy();
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
