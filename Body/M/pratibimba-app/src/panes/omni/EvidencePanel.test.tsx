/**
 * Coordinate: M' `/` membrane (Evidence tab body tests — Track 27.T27.5)
 * Actualises: the Evidence fold renders MediatedRunEvidencePacket packets (list
 *   + full view), NEVER leaks a protected body (opaque projections show keys
 *   only), persists mediator/privacy filters + selection, cross-folds to the
 *   Dispatch Trace tab (15.11), and is honest-empty with no packets.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { MediatedRunEvidencePacket } from './evidenceShapes';
import { EvidencePanel } from './EvidencePanel';
import { privacyClassKind } from './PrivacyClassBadge';
import { hydrateOmniPanelSessionState, readOmniPanelSessionState } from './omnipanelSessionState';

beforeEach(() => hydrateOmniPanelSessionState(null));
afterEach(cleanup);

function fixture(overrides: Partial<MediatedRunEvidencePacket> = {}): MediatedRunEvidencePacket {
    return {
        id: 'packet-1',
        title: 'Run one',
        mediatedBy: { kind: 'anima' },
        candidateId: 'cand-1',
        coordinate: 'M5-5',
        sourceAnchor: 'src://a',
        graphAnchor: 'graph://a',
        reviewId: 'rev-1',
        testAnchor: 'test://a',
        privacyClass: 'protected-local',
        dispatchTrace: {
            id: 'node-1',
            parentId: null,
            actor: { kind: 'anima' },
            methodOrSkill: "s4'.mediation.route",
            invokedAt: 1000,
            tickAtInvoke: 5,
            children: []
        },
        toolStream: [],
        gateLandings: [],
        axiomTranslationSteps: [],
        sessionKey: 'agent:anima:main',
        dayNowContext: '23-07-2026',
        profileGeneration: 32,
        bridgeReadinessHandle: 'ready://a',
        currentProfile: { tick12: 3, SECRET_BODY: 'do-not-leak-this-body' },
        graphContext: { namespace: 'bimba' },
        sessionRuntime: { dayId: '23-07-2026' },
        semanticCandidates: ['cand://x'],
        s5Refs: ['s5://y'],
        ...overrides
    };
}

const evidenceState = () => readOmniPanelSessionState().perTabState.evidence;

describe('PrivacyClassBadge.privacyClassKind', () => {
    it('normalises free-form privacy strings to a known kind', () => {
        expect(privacyClassKind('safe-public-current-kernel-tick')).toBe('public');
        expect(privacyClassKind('protected-local')).toBe('protected');
        expect(privacyClassKind('private')).toBe('private');
        expect(privacyClassKind('weird')).toBe('unknown');
    });
});

describe('EvidencePanel', () => {
    it('is honest-empty with no packets — nothing synthesised', () => {
        render(<EvidencePanel />);
        expect(screen.getByTestId('evidence-list-empty')).toBeTruthy();
    });

    it('lists a packet and opens its full view on select', () => {
        render(<EvidencePanel packets={[fixture()]} />);
        const row = screen.getByTestId('evidence-packet-row');
        fireEvent.click(row);
        expect(evidenceState().selectedPacketId).toBe('packet-1');
        // re-render reflects the persisted selection
        cleanup();
        render(<EvidencePanel packets={[fixture()]} />);
        expect(screen.getByTestId('evidence-packet-view')).toBeTruthy();
        expect(screen.getByTestId('evidence-mediator').textContent).toBe('Anima');
    });

    it('NEVER leaks a protected body — opaque projections render keys only', () => {
        hydrateOmniPanelSessionState({ perTabState: { evidence: { selectedPacketId: 'packet-1' } } } as never);
        const { container } = render(<EvidencePanel packets={[fixture()]} />);
        // the opaque record's KEYS show, its VALUES never do
        expect(screen.getByTestId('evidence-opaque-currentProfile').textContent).toContain('SECRET_BODY');
        expect(container.textContent).not.toContain('do-not-leak-this-body');
    });

    it('persists + applies the privacy-class filter', () => {
        render(
            <EvidencePanel
                packets={[fixture({ id: 'pub-1', privacyClass: 'public' }), fixture({ id: 'prot-1', privacyClass: 'protected-local' })]}
            />
        );
        fireEvent.click(screen.getByTestId('evidence-privacy-filter-public'));
        expect(evidenceState().filters.privacyClass).toBe('public');
        const rows = screen.getAllByTestId('evidence-packet-row');
        expect(rows).toHaveLength(1);
        expect(rows[0].getAttribute('data-packet-id')).toBe('pub-1');
    });

    it('cross-folds to the Dispatch Trace tab at the packet genealogy node (15.11)', () => {
        hydrateOmniPanelSessionState({ perTabState: { evidence: { selectedPacketId: 'packet-1' } } } as never);
        render(<EvidencePanel packets={[fixture()]} />);
        // the packet's genealogy renders as an embedded mini-graph
        expect(screen.getByTestId('dispatch-mini-graph')).toBeTruthy();
        expect(screen.getByTestId('dispatch-mini-node').getAttribute('data-node-id')).toBe('node-1');
        fireEvent.click(screen.getByTestId('dispatch-mini-open'));
        expect(readOmniPanelSessionState().activeTab).toBe('dispatch-trace');
        expect(readOmniPanelSessionState().perTabState['dispatch-trace'].selectedNodeId).toBe('node-1');
    });
});
