/**
 * Coordinate: M' M4' (Pratibimba personal-coordinate consent proof — 25.T25.14)
 * Actualises: behavioral proof for the three panels — (a) handle-only render
 *   with the DR-M4-3 privacy law (NO raw q_* body reaches the surface); (b) the
 *   ConsentRecord editor routing through `nara.pasu.consents.append` as an
 *   array-append; (c) read-only proposals (proposed|reviewed only) that write
 *   only on an accept/reject click through the M5' review gate.
 */

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../bridge/gatewayHolder', () => ({
    gateway: () => ({ invoke }),
    gatewayReady: () => true
}));

import { useProvenanceStore } from '../state/stores';
import {
    extractPersonalHandles,
    evaluateVoiceCorpusAdmission,
    validateConsentRecord,
    type ConsentRecord
} from './pratibimbaConsent';
import { PratibimbaCoordinateClient, PratibimbaCoordinatePane } from './PratibimbaCoordinatePane';
import { publishProfileTick } from '../composition/profileTickSubscription';

// A profile payload carrying the six handle strings AND raw q-body decoys that
// MUST NOT leak. The opaque handle tokens and the raw body numbers are chosen so
// the privacy assertions can discriminate them unambiguously.
const HANDLE_PROFILE = {
    harmonicProfile: {
        personalPole: {
            qIdentityHandle: { handle: 'handle://identity/IDENT-OPAQUE' },
            qTransitHandle: { handle: 'handle://transit/TRANSIT-OPAQUE' },
            qActivityHandle: { handle: 'handle://activity/ACTIVITY-OPAQUE' },
            qComposedHandle: { handle: 'handle://composed/COMPOSED-OPAQUE' },
            audioBusHandle: 'handle://audio/AUDIO-OPAQUE',
            planetaryChakralStateHandle: 'handle://chakra/CHAKRA-OPAQUE',
            // ── raw bodies — decoys that must never surface ──
            qComposed: { w: 0.11111, x: 0.22222, y: 0.33333, z: 0.44444 },
            qPersonal: { w: 0.55555, x: 0.66666, y: 0.77777, z: 0.88888 }
        }
    },
    q_b: [0.9111, 0.9222, 0.9333, 0.9444],
    q_p: [0.8111, 0.8222, 0.8333, 0.8444],
    q_personal: { w: 0.7111 },
    q_composed: { w: 0.6111 }
};

const RAW_BODY_MARKERS = ['0.11111', '0.22222', '0.55555', '0.66666', '0.9111', '0.8111', '0.7111', '0.6111'];

const EXISTING_CONSENT: ConsentRecord = {
    subjectHandle: 'nara://voice/existing',
    action: 'nara.graphiti.body.inspect',
    consented: true,
    consentedAt: '2026-07-20T00:00:00.000Z',
    scope: 'single-day',
    pressureFree: true,
    inspectable: true
};

function connect(): void {
    useProvenanceStore.setState(s => ({ connection: { ...s.connection, connected: true } }));
}

function setProfile(payload: unknown): void {
    publishProfileTick({ generation: 1, cachedAtMs: 0, stale: false, stalenessMs: 0, privacyClass: 'public', profile: payload } as any);
}

/** Default: show returns one existing consent; append returns the grown ledger;
 *  proposals list returns proposed+reviewed+accepted (accepted must be hidden). */
function defaultInvoke(): void {
    invoke.mockImplementation((method: string, params: Record<string, unknown>) => {
        switch (method) {
            case 'nara.pasu.show':
                return Promise.resolve({ artifact: { c_4_atlas_sync_consents: [EXISTING_CONSENT] } });
            case 'nara.pasu.consents.append': {
                const consent = (params as { consent: ConsentRecord }).consent;
                return Promise.resolve({ artifact: { consents: [EXISTING_CONSENT, consent], count: 2 } });
            }
            case 'nara.identity.proposals.list':
                return Promise.resolve({
                    artifact: {
                        proposals: [
                            { proposalHandle: 'id://proposed', state: 'proposed', summary: 'Birthdate layer', sourceAdapterHandle: 'adapter://m4', createdAt: '2026-07-22T09:00:00.000Z', reviewedAt: null },
                            { proposalHandle: 'id://reviewed', state: 'reviewed', summary: 'Transit layer', sourceAdapterHandle: 'adapter://m4', createdAt: '2026-07-22T09:01:00.000Z', reviewedAt: '2026-07-22T09:02:00.000Z' },
                            { proposalHandle: 'id://accepted', state: 'accepted', summary: 'Already decided', sourceAdapterHandle: 'adapter://m4', createdAt: '2026-07-22T09:03:00.000Z', reviewedAt: '2026-07-22T09:04:00.000Z' }
                        ]
                    }
                });
            case 'nara.identity.proposals.decide':
                return Promise.resolve({
                    artifact: { proposalHandle: params.proposal_handle, state: params.verdict === 'accept' ? 'accepted' : 'rejected', summary: '', sourceAdapterHandle: 'adapter://m4', createdAt: '' }
                });
            default:
                return Promise.resolve({ artifact: {} });
        }
    });
}

beforeEach(() => {
    invoke.mockReset();
    defaultInvoke();
    setProfile(HANDLE_PROFILE);
    useProvenanceStore.setState(s => ({ connection: { ...s.connection, connected: false } }));
});

afterEach(() => {
    cleanup();
});

describe('pure ports (frozen contract fidelity)', () => {
    it('extractPersonalHandles returns ONLY the six handle strings, never a raw body', () => {
        const handles = extractPersonalHandles(HANDLE_PROFILE);
        expect(handles.qIdentityHandle).toBe('handle://identity/IDENT-OPAQUE');
        expect(handles.audioBusHandle).toBe('handle://audio/AUDIO-OPAQUE');
        expect(Object.keys(handles).sort()).toEqual(
            ['audioBusHandle', 'planetaryChakralStateHandle', 'qActivityHandle', 'qComposedHandle', 'qIdentityHandle', 'qTransitHandle'].sort()
        );
        const serialised = JSON.stringify(handles);
        for (const marker of RAW_BODY_MARKERS) {
            expect(serialised).not.toContain(marker);
        }
    });

    it('evaluateVoiceCorpusAdmission admits only a complete pressure-free chain', () => {
        const consent: ConsentRecord = { ...EXISTING_CONSENT, action: 'nara.voice-corpus.include' };
        expect(
            evaluateVoiceCorpusAdmission({
                consentRecords: [consent],
                piiStripped: true,
                animaAdmission: 'approved',
                adapterProvenanceHandle: 'prov://x',
                rollbackDeploymentHandle: 'rollback://y'
            }).admitted
        ).toBe(true);
        // Missing rollback handle → not admitted (but consent still pressure-free).
        const result = evaluateVoiceCorpusAdmission({
            consentRecords: [consent],
            piiStripped: true,
            animaAdmission: 'approved',
            adapterProvenanceHandle: 'prov://x',
            rollbackDeploymentHandle: null
        });
        expect(result.admitted).toBe(false);
        expect(result.pressureFreeConsent).toBe(true);
    });

    it('validateConsentRecord rejects an empty subject handle', () => {
        expect(validateConsentRecord({ ...EXISTING_CONSENT, subjectHandle: '  ' })).toContain('subjectHandle');
        expect(validateConsentRecord(EXISTING_CONSENT)).toBeNull();
    });
});

describe('panel (a) — handle-only render (DR-M4-3 privacy law)', () => {
    it('shows the handle strings and NO raw q_* body', async () => {
        connect();
        render(<PratibimbaCoordinatePane />);
        const panel = await screen.findByTestId('personal-handle-panel');
        expect(within(panel).getByText('handle://identity/IDENT-OPAQUE')).toBeTruthy();
        expect(within(panel).getByText('handle://composed/COMPOSED-OPAQUE')).toBeTruthy();
        expect(within(panel).getByText('handle://audio/AUDIO-OPAQUE')).toBeTruthy();
        // The raw q_b / q_p / q_personal / q_composed body values never reach the DOM.
        for (const marker of RAW_BODY_MARKERS) {
            expect(panel.textContent).not.toContain(marker);
        }
        expect(document.body.textContent).not.toContain('0.11111');
    });
});

describe('panel (b) — ConsentRecord editor', () => {
    it('routes the write through nara.pasu.consents.append and lands as an array-append', async () => {
        connect();
        render(<PratibimbaCoordinatePane />);
        // Initial ledger loaded via the handle-only nara.pasu.show read.
        await screen.findByTestId('consent-row-0');
        await waitFor(() => expect(invoke).toHaveBeenCalledWith('nara.pasu.show', {}));

        fireEvent.change(screen.getByTestId('consent-subject'), { target: { value: 'nara://voice/new-corpus' } });
        fireEvent.change(screen.getByTestId('consent-action'), { target: { value: 'nara.voice-corpus.include' } });
        fireEvent.click(screen.getByTestId('consent-append'));

        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith(
                'nara.pasu.consents.append',
                expect.objectContaining({
                    consent: expect.objectContaining({
                        subjectHandle: 'nara://voice/new-corpus',
                        action: 'nara.voice-corpus.include',
                        scope: 'adapter-corpus',
                        consented: true,
                        pressureFree: true,
                        inspectable: true
                    })
                })
            )
        );
        // The returned FULL ledger grew by one (array-append: 1 → 2).
        await screen.findByTestId('consent-row-1');
        expect(screen.getAllByTestId(/^consent-row-\d+$/)).toHaveLength(2);
    });

    it('refuses an empty-subject consent without dispatching the RPC', async () => {
        connect();
        render(<PratibimbaCoordinatePane />);
        await screen.findByTestId('consent-append');
        fireEvent.click(screen.getByTestId('consent-append'));
        const notice = await screen.findByTestId('consent-notice');
        expect(notice.textContent).toContain('invalid consent');
        expect(invoke).not.toHaveBeenCalledWith('nara.pasu.consents.append', expect.anything());
    });
});

describe('panel (c) — identity-augment proposals (read-only + M5 gate write)', () => {
    it('lists only proposed|reviewed proposals — read-only until a verdict click', async () => {
        connect();
        render(<PratibimbaCoordinatePane />);
        await screen.findByTestId('proposal-row-id://proposed');
        expect(screen.getByTestId('proposal-row-id://reviewed')).toBeTruthy();
        // Accepted proposals are terminal and never shown as pending.
        expect(screen.queryByTestId('proposal-row-id://accepted')).toBeNull();
        // Reading the list NEVER dispatches a decide (no mutation on render).
        expect(invoke).not.toHaveBeenCalledWith('nara.identity.proposals.decide', expect.anything());
    });

    it('accept dispatches nara.identity.proposals.decide with the verdict', async () => {
        connect();
        render(<PratibimbaCoordinatePane />);
        const row = await screen.findByTestId('proposal-row-id://proposed');
        fireEvent.click(within(row).getByTestId('proposal-accept-id://proposed'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('nara.identity.proposals.decide', {
                proposal_handle: 'id://proposed',
                verdict: 'accept'
            })
        );
    });

    it('reject dispatches the decide RPC with the reject verdict', async () => {
        connect();
        render(<PratibimbaCoordinatePane />);
        const row = await screen.findByTestId('proposal-row-id://reviewed');
        fireEvent.click(within(row).getByTestId('proposal-reject-id://reviewed'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('nara.identity.proposals.decide', {
                proposal_handle: 'id://reviewed',
                verdict: 'reject'
            })
        );
    });
});

describe('identity-augment lifecycle — submit → list → decide round-trip', () => {
    // A stateful store standing in for the substrate's persisted review ledger:
    // submit records a Proposed proposal, list projects the pending (non-terminal)
    // views, decide moves a proposal to a terminal state. This proves the whole
    // loop through the ONE gateway `invoke` seam, and that accept never 'applies'
    // (Q_identity untouched — the terminal state is 'accepted', never 'applied').
    interface StoreRecord {
        proposalHandle: string;
        state: 'proposed' | 'reviewed' | 'accepted' | 'rejected' | 'applied';
        summary: string;
        sourceAdapterHandle: string;
        createdAt: string;
        reviewedAt: string | null;
    }

    function statefulInvoke(store: StoreRecord[]): void {
        invoke.mockImplementation((method: string, params: Record<string, unknown>) => {
            switch (method) {
                case 'nara.identity.proposals.submit': {
                    // The SEAM: create a Proposed proposal only (never applies).
                    const record: StoreRecord = {
                        proposalHandle: String(params.proposal_handle),
                        state: 'proposed',
                        summary: String(params.summary),
                        sourceAdapterHandle: String(params.source_adapter_handle),
                        createdAt: '2026-07-22T10:00:00.000Z',
                        reviewedAt: null
                    };
                    store.push(record);
                    return Promise.resolve({ artifact: record });
                }
                case 'nara.identity.proposals.list':
                    return Promise.resolve({
                        artifact: {
                            proposals: store.filter(r => r.state === 'proposed' || r.state === 'reviewed')
                        }
                    });
                case 'nara.identity.proposals.decide': {
                    const target = store.find(r => r.proposalHandle === params.proposal_handle);
                    if (target) {
                        // The governed review write: accept|reject only — NEVER 'applied'.
                        target.state = params.verdict === 'accept' ? 'accepted' : 'rejected';
                        target.reviewedAt = '2026-07-22T10:05:00.000Z';
                    }
                    return Promise.resolve({ artifact: target ?? {} });
                }
                case 'nara.pasu.show':
                    return Promise.resolve({ artifact: { c_4_atlas_sync_consents: [] } });
                default:
                    return Promise.resolve({ artifact: {} });
            }
        });
    }

    it('a producer submits → pane lists the pending proposal → accept transitions it (no apply)', async () => {
        const store: StoreRecord[] = [];
        statefulInvoke(store);

        // 1) The PRODUCER seam: submit a NEW proposal via the client. The pane
        //    itself never submits from render — this is the upstream producer.
        const created = await new PratibimbaCoordinateClient({ invoke }).submitProposal({
            proposalHandle: 'id://augment-1',
            summary: 'Birthdate encoding layer ready for M5 review.',
            sourceAdapterHandle: 'adapter://m4/identity-augment'
        });
        expect(invoke).toHaveBeenCalledWith('nara.identity.proposals.submit', {
            proposal_handle: 'id://augment-1',
            summary: 'Birthdate encoding layer ready for M5 review.',
            source_adapter_handle: 'adapter://m4/identity-augment'
        });
        // Submit creates a Proposed proposal ONLY (never applies).
        expect(created?.state).toBe('proposed');
        expect(store).toHaveLength(1);

        // 2) The pane (consumer) lists the freshly-submitted pending proposal.
        connect();
        render(<PratibimbaCoordinatePane />);
        const row = await screen.findByTestId('proposal-row-id://augment-1');
        expect(within(row).getByText('proposed')).toBeTruthy();

        // 3) The user accepts through the M5' gate → the proposal transitions to
        //    a terminal 'accepted' state and drops out of the pending list.
        fireEvent.click(within(row).getByTestId('proposal-accept-id://augment-1'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('nara.identity.proposals.decide', {
                proposal_handle: 'id://augment-1',
                verdict: 'accept'
            })
        );
        await screen.findByTestId('proposals-empty');
        // Q_identity untouched: the terminal state is 'accepted', NEVER 'applied'.
        expect(store[0].state).toBe('accepted');
        expect(store.some(r => r.state === 'applied')).toBe(false);
    });
});
