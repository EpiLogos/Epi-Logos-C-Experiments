/**
 * Coordinate: M' `/` membrane (Evidence tail tests — Track 27.T27.5)
 * Actualises: the 27.5 tail sub-folds — the deposit WRITE path (real
 *   s5'.epii.deposit dispatch, honest refusal, missing-field gating,
 *   disconnected disable) and the three honest-pending readouts
 *   (decision-register, verifier-R virtue witness, deposition anchor) that
 *   render a ReadinessBanner when their feed/field is not on the wire, and real
 *   content when it is. Nothing is synthesised.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../../state/stores';
import { DecisionRegisterEntries } from './DecisionRegisterEntries';
import { VerifierRVirtueWitnessVector } from './VerifierRVirtueWitnessVector';
import { DepositionAnchorDisplay } from './DepositionAnchorDisplay';
import { EvidenceDepositForm, missingDepositFields } from './EvidenceDepositForm';

function connect(connected: boolean) {
    const prev = useProvenanceStore.getState().connection;
    useProvenanceStore.setState({ connection: { ...prev, connected } });
}

afterEach(() => {
    cleanup();
    setGateway(null);
});

describe('DecisionRegisterEntries — honest pending until the read method lands', () => {
    it('renders the ReadinessBanner naming the absent method', () => {
        render(<DecisionRegisterEntries packetId="pkt-1" />);
        const banner = screen.getByTestId('readiness-banner');
        expect(banner.getAttribute('data-state')).toBe('degraded_but_readable');
        expect(banner.textContent).toContain("s5'.decision_register.list_for_packet");
    });
});

describe('VerifierRVirtueWitnessVector — 9-bit grid or honest pending', () => {
    it('renders the honest pending banner when no vector is available', () => {
        render(<VerifierRVirtueWitnessVector />);
        expect(screen.getByTestId('readiness-banner')).toBeTruthy();
        expect(screen.queryByTestId('virtue-witness-grid')).toBeNull();
    });

    it('renders the LSB-first 9-bit grid when a real vector is supplied', () => {
        // 0b000000101 -> bits 0 and 2 set.
        render(<VerifierRVirtueWitnessVector witnessVector={0b000000101} />);
        const grid = screen.getByTestId('virtue-witness-grid');
        expect(grid).toBeTruthy();
        const set = grid.querySelectorAll('[data-set="true"]');
        expect(set.length).toBe(2);
    });
});

describe('DepositionAnchorDisplay — anchor or honest pending', () => {
    it('is honest pending when no anchor is carried', () => {
        render(<DepositionAnchorDisplay />);
        expect(screen.getByTestId('readiness-banner')).toBeTruthy();
    });

    it('renders the anchor + canon path when present', () => {
        render(<DepositionAnchorDisplay anchor="hen:write:abc" canonPath="Idea/Bimba/World/X.md" />);
        expect(screen.getByTestId('evidence-deposition-anchor').getAttribute('data-anchor')).toBe('hen:write:abc');
        expect(screen.getByTestId('evidence-deposition-anchor-path').textContent).toContain('Idea/Bimba/World/X.md');
    });
});

describe('EvidenceDepositForm — real deposit write, honest refusal', () => {
    const fullDraft = {
        title: 't',
        candidateId: 'c',
        coordinate: 'M5-4',
        sourceAnchor: 's',
        graphAnchor: 'g',
        reviewId: 'r',
        testAnchor: 'te'
    };

    it('missingDepositFields flags empty authored fields (privacyClass has a default)', () => {
        expect(missingDepositFields({ ...fullDraft, privacyClass: 'safe-public-current-kernel-tick' })).toEqual([]);
        expect(
            missingDepositFields({ ...fullDraft, candidateId: '', privacyClass: 'safe-public-current-kernel-tick' })
        ).toEqual(['candidateId']);
    });

    it('disables submit when disconnected', () => {
        connect(false);
        render(<EvidenceDepositForm initialDraft={fullDraft} />);
        expect((screen.getByTestId('deposit-submit') as HTMLButtonElement).disabled).toBe(true);
        expect(screen.getByTestId('deposit-disconnected')).toBeTruthy();
    });

    it('disables submit until every authored field is populated', () => {
        connect(true);
        render(<EvidenceDepositForm />);
        expect((screen.getByTestId('deposit-submit') as HTMLButtonElement).disabled).toBe(true);
        expect(screen.getByTestId('deposit-missing')).toBeTruthy();
    });

    it('dispatches the real s5-prime.epii.deposit method and surfaces the returned ref', async () => {
        const invoke = vi.fn().mockResolvedValue({ artifact: { id: 'evd-42' } });
        setGateway({ invoke } as never);
        connect(true);
        render(<EvidenceDepositForm initialDraft={fullDraft} />);
        fireEvent.click(screen.getByTestId('deposit-submit'));
        await waitFor(() => expect(screen.getByTestId('deposit-ok').textContent).toContain('evd-42'));
        expect(invoke).toHaveBeenCalledWith("s5'.epii.deposit", expect.objectContaining({ candidateId: 'c' }));
    });

    it('surfaces the gateway refusal honestly — success is never fabricated', async () => {
        const invoke = vi.fn().mockRejectedValue(new Error('deposit rejected: unauthorized'));
        setGateway({ invoke } as never);
        connect(true);
        render(<EvidenceDepositForm initialDraft={fullDraft} />);
        fireEvent.click(screen.getByTestId('deposit-submit'));
        await waitFor(() => expect(screen.getByTestId('deposit-refused').textContent).toContain('deposit rejected'));
    });
});
