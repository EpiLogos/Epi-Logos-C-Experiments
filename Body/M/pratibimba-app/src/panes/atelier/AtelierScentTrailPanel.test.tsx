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

    it('surfaces the six Aletheia subagents as lineage badges', () => {
        render(<AtelierScentTrailPanel />);
        for (const subagent of ['Anansi', 'Janus', 'Moirai', 'Mercurius', 'Agora', 'Zeithoven']) {
            expect(screen.getByTestId(`atelier-lineage-${subagent}`)).toBeTruthy();
        }
    });

    it('renders a veto as a red, NON-BLOCKING banner', () => {
        render(
            <AtelierScentTrailPanel
                vetoes={[{ subagent: 'Moirai', reason: 'cast anchor is stale' }]}
            />
        );
        const banner = screen.getByTestId('atelier-veto-Moirai');
        expect(banner.className).toContain('atelier-veto');
        expect(banner.getAttribute('data-blocking')).toBe('false');
        expect(banner.textContent).toContain('Aletheia subagent Moirai veto — cast anchor is stale');
        expect(banner.textContent).toContain('human gate stays open');
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
