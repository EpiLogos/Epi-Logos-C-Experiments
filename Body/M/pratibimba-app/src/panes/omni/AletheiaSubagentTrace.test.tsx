/**
 * Coordinate: M' M5' / `/` membrane (Aletheia subagent sub-trace render — 26.T26.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: 26.9's "per-subagent sub-trace render test" and "veto banner red +
 *   non-blocking on human gate", plus the two things that make the render real
 *   rather than decorative:
 *     · the six render as SIX DISTINCT contributions — the failure this catches
 *       is the one that shipped, where every subagent rendered its lowercase id
 *       and nothing else, so all six were interchangeable on screen;
 *     · the sub-trace appears in the RunTree for a node the LIVE fold produced
 *       from a real gateway-shaped `agent:anima:subagent:<id>` session key —
 *       a render proven only against a hand-built node proves the component,
 *       not the surfacing.
 * Does NOT own: the register or its substrate agreement
 *   (`aletheiaSubagents.test.ts`), the tree fold (`dispatchGenealogy.ts`).
 * Contract: 12.T12.19 · rerun tranche [[26.T26.9]].
 */

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AletheiaSubagentTrace } from './AletheiaSubagentTrace';
import { DispatchGenealogyTree } from './DispatchGenealogyTree';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import { ALETHEIA_SUBAGENT_TRACES } from './aletheiaSubagents';
import type { SessionRecord } from '../../bridge/sessionClient';

afterEach(cleanup);

describe('AletheiaSubagentTrace (26.9 per-subagent sub-trace)', () => {
    it('renders each of the six with its OWN contribution, CF and techne class', () => {
        for (const trace of ALETHEIA_SUBAGENT_TRACES) {
            cleanup();
            render(<AletheiaSubagentTrace subagent={trace.id} />);
            const node = screen.getByTestId(`aletheia-subagent-trace-${trace.id}`);
            expect(node.getAttribute('data-cf')).toBe(trace.cf);
            expect(node.textContent).toContain(trace.label);
            expect(node.textContent).toContain(trace.techneClass);
            expect(
                screen.getByTestId(`aletheia-trace-kind-${trace.id}`).textContent
            ).toBe(trace.traceKind);
        }
    });

    it('renders six DIFFERENT trace kinds — the six are not interchangeable', () => {
        const rendered = ALETHEIA_SUBAGENT_TRACES.map(trace => {
            cleanup();
            render(<AletheiaSubagentTrace subagent={trace.id} />);
            return screen.getByTestId(`aletheia-trace-kind-${trace.id}`).textContent;
        });
        expect(new Set(rendered).size).toBe(6);
    });

    it('names the absent facet-return feed instead of leaving the sub-trace silent', () => {
        render(<AletheiaSubagentTrace subagent="anansi" />);
        const note = screen.getByTestId('aletheia-no-return-anansi');
        expect(note.textContent).toContain('no facet return on this dispatch');
        expect(note.textContent).toContain('aletheia.rs::FacetReturn');
    });

    it('renders the DISCLOSURE arm — angle plus citations — which had no reader before', () => {
        render(
            <AletheiaSubagentTrace
                subagent="anansi"
                facetReturn={{
                    kind: 'disclosure',
                    facet: 'anansi',
                    angle: 'coordinate-mapping at 4.2',
                    evidenceRefs: ['Idea/Bimba/World/4.2.md', 'Idea/Bimba/World/4.3.md']
                }}
            />
        );
        const disclosure = screen.getByTestId('aletheia-disclosure-anansi');
        expect(disclosure.textContent).toContain('coordinate-mapping at 4.2');
        expect(within(disclosure).getAllByRole('listitem')).toHaveLength(2);
        // A disclosure is not a veto — nothing red.
        expect(screen.queryByTestId('aletheia-veto-banner')).toBeNull();
    });

    it('renders a veto naming the subagent, NON-BLOCKING on the human gate (12.19)', () => {
        render(
            <AletheiaSubagentTrace
                subagent="janus"
                facetReturn={{
                    kind: 'veto',
                    facet: 'janus',
                    reason: 'the temporal horizon is not yet present',
                    whatIsMissed: 'the retrospective face'
                }}
            />
        );
        const banner = screen.getByTestId('aletheia-veto-banner');
        expect(banner.textContent).toContain(
            'Aletheia subagent Janus veto — the temporal horizon is not yet present'
        );
        expect(banner.textContent).toContain('the retrospective face');
        expect(banner.getAttribute('data-blocking')).toBe('false');
    });

    it('reaches the RunTree through the LIVE session fold, nested under its dispatcher', () => {
        const sessions: SessionRecord[] = [
            { sessionKey: 'agent:anima', spawnedBy: null } as unknown as SessionRecord,
            {
                sessionKey: 'agent:anima:subagent:moirai',
                spawnedBy: 'agent:anima'
            } as unknown as SessionRecord
        ];
        render(<DispatchGenealogyTree records={dispatchGenealogyFromSessions(sessions)} />);
        // The subagent fan-out stays grouped under Anima (DR-B-3) …
        const group = screen.getByTestId('aletheia-crystallisation-group');
        // … and the grouped node now carries the expanded sub-trace, not a bare id.
        const trace = within(group).getByTestId('aletheia-subagent-trace-moirai');
        expect(trace.textContent).toContain('tarot cast-anchor');
        expect(trace.getAttribute('data-cf')).toBe('CF2');
    });
});
