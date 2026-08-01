/**
 * Coordinate: M' M4' (Pratibimba personal-coordinate consent surface — 25.T25.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 — Nara context/type; the protected-local personal surface
 *   reachable via the `m4-nara/personalCoordinate` cross-layout intent.
 * Actualises: the carrier-native pane (NOT a ported Theia widget) with three
 *   panels — (a) handle-only protected-personal-field render (the six
 *   `PERSONAL_HANDLE_KEYS`, NEVER a raw q_* body; DR-M4-3 is LAW); (b) the
 *   atlas-sync ConsentRecord editor writing via `nara.pasu.consents.append`
 *   (DR-WC-M4-4); (c) the read-only identity-augment proposals list with M5'
 *   review-gate accept/reject via `nara.identity.proposals.list/decide` — only
 *   an 'applied' verdict mutates Q_identity, so this surface never mutates it.
 * Public surface: PratibimbaCoordinatePane, PratibimbaCoordinateClient,
 *   IdentityProposalView.
 * Does NOT own: the PASU write law (S0 pasu.rs), the proposal state machine
 *   (portal-core), the profile bus (bridge), the review-gate rule (m5ReviewGate).
 * Contract: [[CHROME-CONTRACT]] §2 (`pratibimbaCoordinate`); [[M'-SYSTEM-SPEC]].
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import type { GatewayClient } from '../bridge/gatewayClient';
import { useProvenanceStore, useTickStore } from '../state/stores';
import { PrivacyClassBadge } from '../ui/PrivacyClassBadge';
import { enforceHumanGate } from './m5ReviewGate';
import { M4BeingPatternPerspectiveCard } from './beingPattern/M4BeingPatternPerspectiveCard';
import {
    CONSENT_ACTIONS,
    CONSENT_SCOPES,
    ConsentAction,
    ConsentRecord,
    ConsentScope,
    PERSONAL_HANDLE_KEYS,
    PersonalHandleKey,
    extractPersonalHandles,
    validateConsentRecord
} from './pratibimbaConsent';

export interface IdentityProposalView {
    readonly proposalHandle: string;
    readonly state: 'proposed' | 'reviewed' | 'accepted' | 'rejected' | 'applied';
    readonly summary: string;
    readonly sourceAdapterHandle: string;
    readonly createdAt: string;
    readonly reviewedAt?: string | null;
}

const PASU_SHOW_RPC = 'nara.pasu.show';
const CONSENT_APPEND_RPC = 'nara.pasu.consents.append';
const PROPOSALS_SUBMIT_RPC = 'nara.identity.proposals.submit';
const PROPOSALS_LIST_RPC = 'nara.identity.proposals.list';
const PROPOSALS_DECIDE_RPC = 'nara.identity.proposals.decide';

/** The producer-seam input to open an identity-augment proposal. */
export interface IdentityProposalSubmission {
    readonly proposalHandle: string;
    readonly summary: string;
    readonly sourceAdapterHandle: string;
}

// ---------------------------------------------------------------------------
// Typed gateway client (the SessionClient idiom — one `invoke` seam, testable)
// ---------------------------------------------------------------------------

function artifact(receipt: { artifact?: unknown }): Record<string, unknown> {
    const value = receipt.artifact;
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

function coerceConsents(raw: unknown): ConsentRecord[] {
    return Array.isArray(raw) ? (raw as ConsentRecord[]) : [];
}

function coerceProposals(raw: unknown): IdentityProposalView[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw
        .map(item => (item && typeof item === 'object' ? (item as IdentityProposalView) : null))
        .filter((view): view is IdentityProposalView => view !== null && typeof view.proposalHandle === 'string');
}

export class PratibimbaCoordinateClient {
    constructor(private readonly gateway: Pick<GatewayClient, 'invoke'>) {}

    /** Handle-only PASU read; returns the existing atlas-sync consent ledger. */
    async loadConsents(): Promise<ConsentRecord[]> {
        const receipt = await this.gateway.invoke(PASU_SHOW_RPC, {});
        return coerceConsents(artifact(receipt).c_4_atlas_sync_consents);
    }

    /** Append one ConsentRecord; returns the FULL updated ledger (authoritative
     *  array-append from the substrate, never a local optimistic guess). */
    async appendConsent(record: ConsentRecord): Promise<ConsentRecord[]> {
        const receipt = await this.gateway.invoke(CONSENT_APPEND_RPC, { consent: record });
        return coerceConsents(artifact(receipt).consents);
    }

    /** Open the identity-augment lifecycle: submit a NEW proposal, created at
     *  'proposed'. This is the PRODUCER seam (an agent/producer or the e2e loop
     *  drives it) — the pane itself is a consumer and never calls this from
     *  render. Submit creates a Proposed proposal ONLY; it never mutates
     *  Q_identity (apply stays a separate governed path). Returns the created
     *  view (or null if the substrate returned no view). */
    async submitProposal(input: IdentityProposalSubmission): Promise<IdentityProposalView | null> {
        const receipt = await this.gateway.invoke(PROPOSALS_SUBMIT_RPC, {
            proposal_handle: input.proposalHandle,
            summary: input.summary,
            source_adapter_handle: input.sourceAdapterHandle
        });
        const view = artifact(receipt);
        return typeof view.proposalHandle === 'string' ? (view as unknown as IdentityProposalView) : null;
    }

    /** The pending (proposed|reviewed) identity-augment proposal views. */
    async listProposals(): Promise<IdentityProposalView[]> {
        const receipt = await this.gateway.invoke(PROPOSALS_LIST_RPC, {});
        return coerceProposals(artifact(receipt).proposals);
    }

    /** Accept or reject a proposal (the M5' write). Never applies — Q_identity
     *  is untouched; accept only advances the proposal to 'accepted'. */
    async decideProposal(
        proposalHandle: string,
        verdict: 'accept' | 'reject'
    ): Promise<IdentityProposalView | null> {
        const receipt = await this.gateway.invoke(PROPOSALS_DECIDE_RPC, {
            proposal_handle: proposalHandle,
            verdict
        });
        const view = artifact(receipt);
        return typeof view.proposalHandle === 'string' ? (view as unknown as IdentityProposalView) : null;
    }
}

const HANDLE_LABELS: Readonly<Record<PersonalHandleKey, string>> = Object.freeze({
    qIdentityHandle: 'Identity (q_identity)',
    qTransitHandle: 'Transit (q_transit)',
    qActivityHandle: 'Activity (q_activity)',
    qComposedHandle: 'Composed (q_composed)',
    audioBusHandle: 'Audio bus',
    planetaryChakralStateHandle: 'Planetary / chakral state'
});

// ---------------------------------------------------------------------------
// Panel (a) — handle-only protected-personal-field render
// ---------------------------------------------------------------------------

function PersonalHandlePanel() {
    const cached = useTickStore(state => state.profile);
    const handles = useMemo(() => extractPersonalHandles(cached?.profile ?? null), [cached]);
    return (
        <section className="personal-handle-panel" data-testid="personal-handle-panel">
            <h3>Protected personal handles</h3>
            <p className="pane-message">
                Handle strings only — the raw q-bodies stay protected-local and never cross here.
            </p>
            <dl className="personal-handle-list">
                {PERSONAL_HANDLE_KEYS.map(key => (
                    <div key={key} className="personal-handle-row" data-testid={`personal-handle-${key}`}>
                        <dt>{HANDLE_LABELS[key]}</dt>
                        <dd>
                            {handles[key] ? (
                                <code className="handle-string">{handles[key]}</code>
                            ) : (
                                <span className="pane-message">pending handle</span>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Panel (b) — atlas-sync ConsentRecord editor
// ---------------------------------------------------------------------------

function ConsentEditorPanel({ client }: { readonly client: PratibimbaCoordinateClient }) {
    const [ledger, setLedger] = useState<ConsentRecord[]>([]);
    const [subjectHandle, setSubjectHandle] = useState('');
    const [action, setAction] = useState<ConsentAction>(CONSENT_ACTIONS[0]);
    const [scope, setScope] = useState<ConsentScope>(CONSENT_SCOPES[2]);
    const [consented, setConsented] = useState(true);
    const [pressureFree, setPressureFree] = useState(true);
    const [inspectable, setInspectable] = useState(true);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        let live = true;
        client
            .loadConsents()
            .then(records => {
                if (live) setLedger(records);
            })
            .catch(() => {
                /* the surface renders an empty ledger; the append is authoritative */
            });
        return () => {
            live = false;
        };
    }, [client]);

    const append = () => {
        setNotice(null);
        const record: ConsentRecord = {
            subjectHandle: subjectHandle.trim(),
            action,
            consented,
            consentedAt: new Date().toISOString(),
            scope,
            pressureFree,
            inspectable
        };
        const invalid = validateConsentRecord(record);
        if (invalid) {
            setNotice(`invalid consent: ${invalid}`);
            return;
        }
        client
            .appendConsent(record)
            .then(records => {
                setLedger(records);
                setSubjectHandle('');
                setNotice('consent appended to c_4_atlas_sync_consents');
            })
            .catch(err => setNotice(`append failed: ${err instanceof Error ? err.message : String(err)}`));
    };

    return (
        <section className="consent-editor" data-testid="consent-editor">
            <h3>Atlas-sync consent</h3>
            <div className="consent-form">
                <label>
                    Subject handle
                    <input
                        data-testid="consent-subject"
                        value={subjectHandle}
                        onChange={event => setSubjectHandle(event.target.value)}
                        placeholder="nara://voice/adapter-corpus"
                    />
                </label>
                <label>
                    Action
                    <select
                        data-testid="consent-action"
                        value={action}
                        onChange={event => setAction(event.target.value as ConsentAction)}
                    >
                        {CONSENT_ACTIONS.map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Scope
                    <select
                        data-testid="consent-scope"
                        value={scope}
                        onChange={event => setScope(event.target.value as ConsentScope)}
                    >
                        {CONSENT_SCOPES.map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="consent-flag">
                    <input
                        type="checkbox"
                        data-testid="consent-consented"
                        checked={consented}
                        onChange={event => setConsented(event.target.checked)}
                    />
                    consented
                </label>
                <label className="consent-flag">
                    <input
                        type="checkbox"
                        data-testid="consent-pressure-free"
                        checked={pressureFree}
                        onChange={event => setPressureFree(event.target.checked)}
                    />
                    pressure-free
                </label>
                <label className="consent-flag">
                    <input
                        type="checkbox"
                        data-testid="consent-inspectable"
                        checked={inspectable}
                        onChange={event => setInspectable(event.target.checked)}
                    />
                    inspectable
                </label>
                <button type="button" data-testid="consent-append" onClick={append}>
                    append consent
                </button>
            </div>
            {notice ? (
                <p className="pane-message" data-testid="consent-notice">
                    {notice}
                </p>
            ) : null}
            <ul className="consent-ledger" data-testid="consent-ledger">
                {ledger.map((record, index) => (
                    <li key={`${record.subjectHandle}:${index}`} data-testid={`consent-row-${index}`}>
                        <span className="consent-action">{record.action}</span>
                        <span className="consent-scope">{record.scope}</span>
                        <code>{record.subjectHandle}</code>
                        <span>{record.consented ? '✓ consented' : '✗ withdrawn'}</span>
                    </li>
                ))}
                {ledger.length === 0 ? (
                    <li className="pane-message" data-testid="consent-ledger-empty">
                        no consent records yet
                    </li>
                ) : null}
            </ul>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Panel (c) — read-only identity-augment proposals with M5' review-gate
// ---------------------------------------------------------------------------

const PENDING_STATES = new Set(['proposed', 'reviewed']);

function ProposalsPanel({ client }: { readonly client: PratibimbaCoordinateClient }) {
    const [proposals, setProposals] = useState<IdentityProposalView[]>([]);
    const [notice, setNotice] = useState<string | null>(null);

    const refresh = () => {
        client
            .listProposals()
            .then(views => setProposals(views.filter(view => PENDING_STATES.has(view.state))))
            .catch(err => setNotice(`proposals unavailable: ${err instanceof Error ? err.message : String(err)}`));
    };

    useEffect(refresh, [client]);

    const decide = (view: IdentityProposalView, verdict: 'accept' | 'reject') => {
        setNotice(null);
        // The M5' review gate is the ONLY mutation path (UX 10.1): a human
        // clicked, so the gate authorises; an agent actor would be blocked.
        const gate = enforceHumanGate({
            decision: verdict === 'accept' ? 'approve' : 'reject',
            humanRequired: true,
            actorIsHuman: true
        });
        if (!gate.ok) {
            setNotice(gate.reason);
            return;
        }
        client
            .decideProposal(view.proposalHandle, verdict)
            .then(() => {
                setNotice(`${verdict}ed ${view.proposalHandle}`);
                refresh();
            })
            .catch(err => setNotice(`decision failed: ${err instanceof Error ? err.message : String(err)}`));
    };

    return (
        <section className="identity-proposals-panel" data-testid="identity-proposals-panel">
            <h3>Pending identity-augment proposals</h3>
            <p className="pane-message">
                Read-only review. Accepting advances the proposal through the M5' gate — it never
                mutates your identity here (only a governed 'applied' verdict does).
            </p>
            <ul className="identity-proposals-list">
                {proposals.map(view => (
                    <li
                        key={view.proposalHandle}
                        className="identity-proposal-row"
                        data-testid={`proposal-row-${view.proposalHandle}`}
                        data-state={view.state}
                    >
                        <div className="proposal-summary">
                            <code>{view.proposalHandle}</code>
                            <span>{view.summary}</span>
                            <span className="proposal-state">{view.state}</span>
                        </div>
                        <div className="proposal-actions">
                            <button
                                type="button"
                                data-testid={`proposal-accept-${view.proposalHandle}`}
                                onClick={() => decide(view, 'accept')}
                            >
                                accept
                            </button>
                            <button
                                type="button"
                                data-testid={`proposal-reject-${view.proposalHandle}`}
                                onClick={() => decide(view, 'reject')}
                            >
                                reject
                            </button>
                        </div>
                    </li>
                ))}
                {proposals.length === 0 ? (
                    <li className="pane-message" data-testid="proposals-empty">
                        no pending proposals
                    </li>
                ) : null}
            </ul>
            {notice ? (
                <p className="pane-message" data-testid="proposals-notice">
                    {notice}
                </p>
            ) : null}
        </section>
    );
}

// ---------------------------------------------------------------------------
// Pane
// ---------------------------------------------------------------------------

export function PratibimbaCoordinatePane() {
    const connected = useProvenanceStore(state => state.connection.connected);
    const client = useMemo(() => new PratibimbaCoordinateClient(gateway()), [connected]);

    if (!connected) {
        return <div className="pane-message">Gateway disconnected — personal coordinate unavailable.</div>;
    }

    return (
        <div
            className={`pratibimba-coordinate-pane ${privacyChrome('protected_local_handle_only').className}`}
            title={privacyChrome('protected_local_handle_only').title}
            data-testid="pratibimba-coordinate-pane"
            data-privacy="protected-local"
        >
            <header className="pratibimba-coordinate-header">
                <h2>Personal coordinate</h2>
                <PrivacyClassBadge value="protected-local" />
            </header>
            <PersonalHandlePanel />
            <ConsentEditorPanel client={client} />
            <ProposalsPanel client={client} />
            {/* 25.T25.22 — the being-pattern READ (DR-WC-M4-6): PASU
                continuity is this pane's law, so the perspective card nests
                here rather than costing the strip an eleventh tab; the M4'
                subsystem page reaches it through this pane's stratum mirror. */}
            <M4BeingPatternPerspectiveCard />
        </div>
    );
}
