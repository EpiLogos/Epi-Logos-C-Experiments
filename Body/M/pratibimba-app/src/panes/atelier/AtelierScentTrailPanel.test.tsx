/**
 * Coordinate: M' M5-5' (Atelier scent-trail render tests — 28.T28.7)
 * Residency: Body/M/pratibimba-app/src/panes/atelier
 * Actualises: the render half of deliverables (c)/(d)/(e) — the blocked stage
 *   PRINTS its method and its reason, a foreign provenance scheme renders as a
 *   refusal rather than vanishing, a veto renders red and non-blocking, and the
 *   crystallise button carries the Canon Studio target it routes to.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AtelierScentTrailPanel } from './AtelierScentTrailPanel';
import { commands } from '../../commands/registry';

afterEach(cleanup);

const attr = (testId: string, name: string) =>
    screen.getByTestId(testId).getAttribute(name);

describe('AtelierScentTrailPanel (28.T28.7)', () => {
    it('renders the six stages with their real binding keys', () => {
        render(<AtelierScentTrailPanel artifactUri="note.md" />);
        expect(attr('atelier-stage-root', 'data-method')).toBe("s5'.gnostic.etymology");
        expect(attr('atelier-stage-drift', 'data-method')).toBe("s5'.gnostic.query_with_layers");
        expect(attr('atelier-stage-cognate', 'data-method')).toBe("s1'.semantic.suggest_links");
        expect(attr('atelier-stage-mobius-write-back', 'data-method')).toBe("s1'.entity.capture");
        expect(attr('atelier-stage-pros-hen', 'data-method')).toBe('local');
    });

    it('the psychoid stage is marked undispatched AND prints the method + reason', () => {
        render(<AtelierScentTrailPanel />);
        expect(attr('atelier-stage-psychoid', 'data-dispatched')).toBe('false');
        const seam = screen.getByTestId('atelier-stage-blocked-psychoid');
        expect(seam.textContent).toContain("s0'.anuttara.trace");
        expect(seam.textContent).toContain('S-layer dispatch table');
        // …and every OTHER stage is dispatched, so the disclosure is specific.
        for (const id of ['root', 'cognate', 'drift', 'pros-hen', 'mobius-write-back']) {
            expect(attr(`atelier-stage-${id}`, 'data-dispatched')).toBe('true');
        }
    });

    it('discloses mutatesGraphCanon: false on the surface itself', () => {
        render(<AtelierScentTrailPanel />);
        expect(attr('atelier-scent-trail', 'data-mutates-graph-canon')).toBe('false');
        expect(screen.getByTestId('atelier-governance-note').textContent).toContain(
            'mutatesGraphCanon: false'
        );
    });

    it('renders a foreign provenance scheme as a REFUSAL, never as a handle', () => {
        render(
            <AtelierScentTrailPanel
                provenanceHandles={['etymology://root/M5-5', 'https://example.org/root']}
            />
        );
        expect(attr('atelier-provenance-0', 'data-admitted')).toBe('true');
        expect(attr('atelier-provenance-1', 'data-admitted')).toBe('false');
        expect(attr('atelier-provenance-1', 'data-scheme')).toBe('https://');
        expect(screen.getByTestId('atelier-provenance-1').textContent).toContain('outside');
    });

    it('says so plainly when the trail carries no handles yet', () => {
        render(<AtelierScentTrailPanel />);
        expect(screen.getByTestId('atelier-provenance-empty').textContent).toContain('no handles');
    });

    /**
     * 26.T26.9 — a badge naming only the subagent says who MIGHT appear, not
     * what any of them contributes. Each badge now carries the CF binding and
     * the per-subagent contribution, projected from the one register the
     * substrate contract holds (`panes/omni/aletheiaSubagents.ts`), so the
     * Atelier and the ACR cannot describe the same six differently.
     */
    it('surfaces the six Aletheia subagents as lineage badges, with CF + contribution', () => {
        render(<AtelierScentTrailPanel />);
        for (const subagent of ['Anansi', 'Janus', 'Moirai', 'Mercurius', 'Agora', 'Zeithoven']) {
            expect(screen.getByTestId(`atelier-lineage-${subagent}`)).toBeTruthy();
        }
        const anansi = screen.getByTestId('atelier-lineage-Anansi');
        expect(anansi.getAttribute('data-subagent')).toBe('anansi');
        expect(anansi.getAttribute('data-cf')).toBe('CF0');
        expect(anansi.textContent).toContain('citation trail');
        expect(screen.getByTestId('atelier-lineage-Janus').getAttribute('data-cf')).toBe('CF1');
        expect(screen.getByTestId('atelier-lineage-Janus').textContent).toContain(
            'prospective / retrospective'
        );
    });

    it('renders a veto as a red, NON-BLOCKING banner naming the subagent', () => {
        render(
            <AtelierScentTrailPanel
                vetoes={[
                    {
                        subagent: 'moirai',
                        reason: 'cast anchor is stale',
                        whatIsMissed: 'the decision point'
                    }
                ]}
            />
        );
        const banner = screen.getByTestId('atelier-veto-moirai');
        expect(banner.className).toContain('atelier-veto');
        expect(banner.getAttribute('data-blocking')).toBe('false');
        expect(banner.getAttribute('data-facet')).toBe('moirai');
        expect(banner.textContent).toContain('Aletheia subagent Moirai veto — cast anchor is stale');
        expect(banner.textContent).toContain('the decision point');
        expect(banner.textContent).toContain('human gate stays open');
        expect(screen.queryByTestId('atelier-veto-empty')).toBeNull();
    });

    /**
     * 26.T26.9 — THE AMBIGUITY THIS TRANCHE CLOSED. The `vetoes` prop is passed
     * by no live caller and cannot be: no S-layer source constructs a
     * `FacetReturn` at all. So an empty veto list rendered as SILENCE, which a
     * reader would take to mean "the facets agreed". It now says which absence
     * it is, and names the substrate declaration that has no producer.
     */
    it('says WHY there is no veto rather than rendering silence', () => {
        render(<AtelierScentTrailPanel />);
        const note = screen.getByTestId('atelier-veto-empty');
        expect(note.textContent).toContain('no Aletheia facet return on this trail');
        expect(note.textContent).toContain('aletheia.rs::FacetReturn');
        expect(note.textContent).toContain('NOTHING CONSTRUCTS ONE');
    });

    it('the crystallise button names Canon Studio and refuses without a note', () => {
        render(<AtelierScentTrailPanel />);
        const button = screen.getByTestId('atelier-crystallise') as HTMLButtonElement;
        expect(button.getAttribute('data-target')).toBe('ide-shell-m0-m5/canon-studio');
        // No artifact and no registered command — the affordance refuses.
        expect(button.disabled).toBe(true);
    });

    it('runs the registered Möbius command when a note and a live binding exist', () => {
        const run = vi.fn();
        const dispose = commands.register({
            id: 'atelier.scentFollow',
            title: 'Atelier: Scent-follow',
            run,
            enabled: () => true
        });
        try {
            render(<AtelierScentTrailPanel artifactUri="Idea/Empty/Present/x/notes/a.md" />);
            const button = screen.getByTestId('atelier-crystallise') as HTMLButtonElement;
            expect(button.disabled).toBe(false);
            fireEvent.click(button);
            expect(run).toHaveBeenCalledTimes(1);
        } finally {
            dispose();
        }
    });

    it('the axiom cross-link is disabled and names the missing intent target', () => {
        render(<AtelierScentTrailPanel />);
        const link = screen.getByTestId('atelier-axiom-crosslink') as HTMLButtonElement;
        expect(link.disabled).toBe(true);
        expect(screen.getByTestId('atelier-axiom-crosslink-seam').textContent).toContain(
            'piAxiomTranslation'
        );
    });
});
