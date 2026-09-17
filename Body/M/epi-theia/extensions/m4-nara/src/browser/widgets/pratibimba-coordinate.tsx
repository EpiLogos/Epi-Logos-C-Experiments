import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIVACY_CLASS,
    evaluateVoiceCorpusAdmission,
    renderProtectedPersonalField
} from '../../common';
import type {
    ConsentRecord,
    ProtectedPersonalFieldInput
} from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const PRATIBIMBA_COORDINATE_VIEW_ID = 'm4.nara.pratibimbaCoordinate';
export const PRATIBIMBA_COORDINATE_LABEL = 'M4 Pratibimba Coordinate';
export const M4_PRATIBIMBA_COORDINATE_BADGE_EXPORT = 'M4PratibimbaCoordinateBadge' as const;

const PASU_SET_METHOD = 'nara.pasu.set';
const PROPOSALS_LIST_METHOD = 'nara.identity.proposals.list';
const PROPOSAL_ACCEPT_METHOD = 'nara.identity.proposals.accept';
const PROPOSAL_REJECT_METHOD = 'nara.identity.proposals.reject';
const CONSENTS_KEY = 'c_4_atlas_sync_consents';
const M5_REVIEW_GATE = 'M5-prime';

export type AtlasSyncConsentAction = ConsentRecord['action'];
export type AtlasSyncConsentScope = ConsentRecord['scope'];
export type IdentityProposalState = 'proposed' | 'reviewed' | 'accepted' | 'rejected' | 'applied';
export type ProposalReviewAction = 'accept' | 'reject';
export type PratibimbaCoordinateStatus = 'loading' | 'ready' | 'writing-consent' | 'reviewing' | 'error';

export interface ConsentDraft {
    readonly subjectHandle: string;
    readonly action: AtlasSyncConsentAction;
    readonly scope: AtlasSyncConsentScope;
    readonly pressureFree: boolean;
    readonly inspectable: boolean;
}

export interface IdentityProposal {
    readonly proposalHandle: string;
    readonly state: IdentityProposalState;
    readonly summary: string;
    readonly sourceAdapterHandle: string;
    readonly createdAt: string;
    readonly reviewedAt?: string;
}

export interface ProposalReviewRequest {
    readonly method: typeof PROPOSAL_ACCEPT_METHOD | typeof PROPOSAL_REJECT_METHOD;
    readonly payload: {
        readonly proposalHandle: string;
        readonly reviewGate: typeof M5_REVIEW_GATE;
    };
}

export interface M4PratibimbaCoordinateBadgeProps {
    readonly fieldInput: ProtectedPersonalFieldInput;
    readonly consentDraft: ConsentDraft;
    readonly proposals: readonly IdentityProposal[];
    readonly status: PratibimbaCoordinateStatus;
    readonly errorMessage?: string | null;
    readonly onConsentDraftChange: (draft: ConsentDraft) => void;
    readonly onAppendConsent: () => void;
    readonly onAcceptProposal: (proposal: IdentityProposal) => void;
    readonly onRejectProposal: (proposal: IdentityProposal) => void;
}

interface GatewayBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

const CONSENT_ACTIONS: readonly AtlasSyncConsentAction[] = Object.freeze([
    'nara.voice-corpus.include',
    'nara.graphiti.body.inspect',
    'nara.shared-archetype.publish'
]);

const CONSENT_SCOPES: readonly AtlasSyncConsentScope[] = Object.freeze([
    'single-artifact',
    'single-day',
    'adapter-corpus'
]);

export const M4PratibimbaCoordinateBadge: React.FC<M4PratibimbaCoordinateBadgeProps> = props => {
    const {
        fieldInput,
        consentDraft,
        proposals,
        status,
        errorMessage,
        onConsentDraftChange,
        onAppendConsent,
        onAcceptProposal,
        onRejectProposal
    } = props;
    const field = safeHandleFieldInput(fieldInput);
    const handles = field.handles as Readonly<Record<string, unknown>>;
    const pendingProposals = proposals.filter(isPendingIdentityProposal);
    const busy = status === 'writing-consent' || status === 'reviewing';

    return (
        <section
            className={`m4-pratibimba-coordinate ${privacyChromeClass('protected_local_handle_only')}`}
            data-test="m4-pratibimba-coordinate"
            data-track="TRACK_08"
            data-export={M4_PRATIBIMBA_COORDINATE_BADGE_EXPORT}
            data-status={status}
        >
            <header className="m4-pratibimba-coordinate-header">
                <div>
                    <h3>Pratibimba Coordinate</h3>
                    <p data-test="m4-pratibimba-coordinate-address">#4.4.4.4 PersonalNexus</p>
                </div>
                <span className="m4-pratibimba-coordinate-privacy mext-privacy-protected-local-handle-only">
                    protected-local handle only
                </span>
            </header>

            <div className="m4-pratibimba-coordinate-grid">
                <section className="m4-pratibimba-coordinate-panel" aria-label="Current state">
                    <h4>Current State</h4>
                    <dl data-test="m4-pratibimba-handle-panel">
                        <HandleRow label="surfaceId" value={String(field.surfaceId)} />
                        <HandleRow label="privacyClass" value={String(field.privacyClass)} />
                        <HandleRow label="readiness" value={String(field.readiness)} />
                        <HandleRow label="readinessLabel" value={String(field.readinessLabel)} />
                        <HandleRow label="fieldHash" value={String(field.fieldHash)} />
                        {Object.entries(handles).map(([key, value]) => (
                            <HandleRow key={key} label={key} value={String(value)} />
                        ))}
                    </dl>
                </section>

                <section className="m4-pratibimba-coordinate-panel" aria-label="Atlas-sync consent">
                    <h4>Atlas-sync Consent</h4>
                    <label>
                        <span>Subject handle</span>
                        <input
                            type="text"
                            value={consentDraft.subjectHandle}
                            disabled={busy}
                            data-test="m4-pratibimba-consent-subject"
                            onChange={event => onConsentDraftChange({
                                ...consentDraft,
                                subjectHandle: event.target.value
                            })}
                        />
                    </label>
                    <label>
                        <span>Action</span>
                        <select
                            value={consentDraft.action}
                            disabled={busy}
                            data-test="m4-pratibimba-consent-action"
                            onChange={event => onConsentDraftChange({
                                ...consentDraft,
                                action: event.target.value as AtlasSyncConsentAction
                            })}
                        >
                            {CONSENT_ACTIONS.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>Scope</span>
                        <select
                            value={consentDraft.scope}
                            disabled={busy}
                            data-test="m4-pratibimba-consent-scope"
                            onChange={event => onConsentDraftChange({
                                ...consentDraft,
                                scope: event.target.value as AtlasSyncConsentScope
                            })}
                        >
                            {CONSENT_SCOPES.map(scope => (
                                <option key={scope} value={scope}>{scope}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={consentDraft.pressureFree}
                            disabled={busy}
                            data-test="m4-pratibimba-consent-pressure-free"
                            onChange={event => onConsentDraftChange({
                                ...consentDraft,
                                pressureFree: event.target.checked
                            })}
                        />
                        <span>pressureFree</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={consentDraft.inspectable}
                            disabled={busy}
                            data-test="m4-pratibimba-consent-inspectable"
                            onChange={event => onConsentDraftChange({
                                ...consentDraft,
                                inspectable: event.target.checked
                            })}
                        />
                        <span>inspectable</span>
                    </label>
                    <button
                        type="button"
                        disabled={busy || consentDraft.subjectHandle.trim() === ''}
                        data-test="m4-pratibimba-consent-append"
                        onClick={onAppendConsent}
                    >
                        Append consent
                    </button>
                </section>

                <section className="m4-pratibimba-coordinate-panel" aria-label="Pending identity proposals">
                    <h4>Pending Identity Proposals</h4>
                    <ol data-test="m4-pratibimba-proposals">
                        {pendingProposals.map(proposal => (
                            <li
                                key={proposal.proposalHandle}
                                data-test="m4-pratibimba-proposal"
                                data-state={proposal.state}
                                aria-readonly="true"
                            >
                                <article>
                                    <header>
                                        <strong>{proposal.proposalHandle}</strong>
                                        <span>{proposal.state}</span>
                                    </header>
                                    <p>{proposal.summary}</p>
                                    <small>{proposal.sourceAdapterHandle}</small>
                                    <footer>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            data-test="m4-pratibimba-proposal-accept"
                                            onClick={() => onAcceptProposal(proposal)}
                                        >
                                            Accept via M5'
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            data-test="m4-pratibimba-proposal-reject"
                                            onClick={() => onRejectProposal(proposal)}
                                        >
                                            Reject via M5'
                                        </button>
                                    </footer>
                                </article>
                            </li>
                        ))}
                    </ol>
                    {pendingProposals.length === 0 ? (
                        <p data-test="m4-pratibimba-no-proposals">No proposed or reviewed identity proposals.</p>
                    ) : null}
                </section>
            </div>

            {errorMessage ? (
                <aside className="m4-pratibimba-coordinate-error" data-test="m4-pratibimba-error">
                    {errorMessage}
                </aside>
            ) : null}
        </section>
    );
};

const HandleRow: React.FC<{ readonly label: string; readonly value: string }> = ({ label, value }) => (
    <>
        <dt>{label}</dt>
        <dd data-test="m4-pratibimba-handle-row" data-handle-key={label}>{value}</dd>
    </>
);

@injectable()
export class PratibimbaCoordinateWidget extends ReactWidget {
    static readonly ID = PRATIBIMBA_COORDINATE_VIEW_ID;
    static readonly LABEL = PRATIBIMBA_COORDINATE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected proposals: readonly IdentityProposal[] = Object.freeze([]);
    protected consentDraft: ConsentDraft = defaultConsentDraft();
    protected status: PratibimbaCoordinateStatus = 'loading';
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = PratibimbaCoordinateWidget.ID;
        this.title.label = PratibimbaCoordinateWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-pratibimba-coordinate');
        this.addClass(privacyChromeClass('protected_local_handle_only'));

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.consentDraft = {
                    ...this.consentDraft,
                    subjectHandle: this.consentDraft.subjectHandle || subjectHandleFromProfile(profile)
                };
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.update();
            })
        );
        void this.refreshProposals();
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-pratibimba-coordinate-root"
            >
                <M4PratibimbaCoordinateBadge
                    fieldInput={fieldInputFromProfile(this.profile, this.context)}
                    consentDraft={this.consentDraft}
                    proposals={this.proposals}
                    status={this.status}
                    errorMessage={this.errorMessage}
                    onConsentDraftChange={draft => this.handleConsentDraftChange(draft)}
                    onAppendConsent={() => void this.handleAppendConsent()}
                    onAcceptProposal={proposal => void this.handleProposalReview(proposal, 'accept')}
                    onRejectProposal={proposal => void this.handleProposalReview(proposal, 'reject')}
                />
            </div>
        );
    }

    protected handleConsentDraftChange(draft: ConsentDraft): void {
        this.consentDraft = draft;
        this.errorMessage = null;
        this.status = this.status === 'loading' ? 'ready' : this.status;
        this.update();
    }

    protected async handleAppendConsent(): Promise<void> {
        this.status = 'writing-consent';
        this.errorMessage = null;
        this.update();
        try {
            const record = buildConsentRecord(this.consentDraft);
            await appendAtlasSyncConsent(this.bridge, record);
            this.status = 'ready';
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected async handleProposalReview(proposal: IdentityProposal, action: ProposalReviewAction): Promise<void> {
        this.status = 'reviewing';
        this.errorMessage = null;
        this.update();
        try {
            const request = proposalReviewRequest(proposal, action);
            await this.bridge.invokeGatewayRpc(request.method, request.payload);
            await this.refreshProposals();
            this.status = 'ready';
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected async refreshProposals(): Promise<void> {
        try {
            const raw = await this.bridge.invokeGatewayRpc(PROPOSALS_LIST_METHOD, {
                coordinate: '#4.4.4.4',
                includeStates: ['proposed', 'reviewed']
            });
            this.proposals = normalizeIdentityProposals(raw);
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }
}

export function safeHandleFieldInput(input: ProtectedPersonalFieldInput | Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
    return renderProtectedPersonalField({
        surfaceId: 'm4-nara',
        qIdentityHandle: stringValue(input.qIdentityHandle, fallbackHandle('identity')),
        qTransitHandle: stringValue(input.qTransitHandle, fallbackHandle('transit')),
        qActivityHandle: stringValue(input.qActivityHandle, fallbackHandle('activity')),
        qComposedHandle: stringValue(input.qComposedHandle, fallbackHandle('composed')),
        audioBusHandle: stringValue(input.audioBusHandle, fallbackHandle('audio-bus')),
        planetaryChakralStateHandle: stringValue(
            input.planetaryChakralStateHandle,
            fallbackHandle('planetary-chakral-state')
        )
    });
}

export function buildConsentRecord(draft: ConsentDraft, consentedAt = new Date().toISOString()): ConsentRecord {
    return Object.freeze({
        subjectHandle: draft.subjectHandle.trim(),
        action: draft.action,
        consented: true,
        consentedAt,
        scope: draft.scope,
        pressureFree: draft.pressureFree,
        inspectable: draft.inspectable
    });
}

export async function appendAtlasSyncConsent(
    bridge: GatewayBridge,
    record: ConsentRecord
): Promise<readonly ConsentRecord[]> {
    validateConsentRecord(record);
    const result = await bridge.invokeGatewayRpc(PASU_SET_METHOD, {
        key: CONSENTS_KEY,
        value: record,
        mode: 'append'
    });
    return normalizeConsentAppendResult(result, record);
}

export function proposalReviewRequest(proposal: IdentityProposal, action: ProposalReviewAction): ProposalReviewRequest {
    if (!isPendingIdentityProposal(proposal)) {
        throw new Error('M5 review gate accepts only proposed or reviewed identity proposals');
    }
    return Object.freeze({
        method: action === 'accept' ? PROPOSAL_ACCEPT_METHOD : PROPOSAL_REJECT_METHOD,
        payload: Object.freeze({
            proposalHandle: proposal.proposalHandle,
            reviewGate: M5_REVIEW_GATE
        })
    });
}

export function proposalsAffectingIdentity(proposals: readonly IdentityProposal[]): readonly IdentityProposal[] {
    return Object.freeze(proposals.filter(proposal => proposal.state === 'applied'));
}

function validateConsentRecord(record: ConsentRecord): void {
    if (record.subjectHandle.trim() === '') {
        throw new Error('ConsentRecord requires a subjectHandle');
    }
    if (!record.consented || !record.pressureFree || !record.inspectable) {
        throw new Error('ConsentRecord must be consented, pressureFree, and inspectable');
    }
    if (record.action === 'nara.voice-corpus.include') {
        const admission = evaluateVoiceCorpusAdmission({
            consentRecords: [record],
            piiStripped: true,
            animaAdmission: 'approved',
            adapterProvenanceHandle: 'adapter://nara/pratibimba-coordinate/voice-corpus',
            rollbackDeploymentHandle: 'rollback://nara/pratibimba-coordinate/local-only'
        });
        if (admission.admitted !== true) {
            throw new Error('Voice corpus admission denied by consent gate');
        }
    }
}

function normalizeConsentAppendResult(result: unknown, fallback: ConsentRecord): readonly ConsentRecord[] {
    const record = objectRecord(result);
    const value = record ? record.value : result;
    if (!Array.isArray(value)) {
        return Object.freeze([fallback]);
    }
    return Object.freeze(value.map(item => normalizeConsentRecord(item)).filter((item): item is ConsentRecord => item !== null));
}

function normalizeConsentRecord(value: unknown): ConsentRecord | null {
    const record = objectRecord(value);
    if (!record) {
        return null;
    }
    const subjectHandle = stringValue(record.subjectHandle, '');
    const action = CONSENT_ACTIONS.includes(record.action as AtlasSyncConsentAction)
        ? record.action as AtlasSyncConsentAction
        : null;
    const scope = CONSENT_SCOPES.includes(record.scope as AtlasSyncConsentScope)
        ? record.scope as AtlasSyncConsentScope
        : null;
    if (!action || !scope || subjectHandle === '') {
        return null;
    }
    return Object.freeze({
        subjectHandle,
        action,
        consented: record.consented === true,
        consentedAt: stringValue(record.consentedAt, ''),
        scope,
        pressureFree: record.pressureFree === true,
        inspectable: record.inspectable === true,
        revokedAt: typeof record.revokedAt === 'string' ? record.revokedAt : undefined
    });
}

function normalizeIdentityProposals(raw: unknown): readonly IdentityProposal[] {
    const source = Array.isArray(raw)
        ? raw
        : Array.isArray(objectRecord(raw)?.proposals)
            ? objectRecord(raw)?.proposals as unknown[]
            : [];
    return Object.freeze(
        source.map(normalizeIdentityProposal).filter((proposal): proposal is IdentityProposal => proposal !== null)
    );
}

function normalizeIdentityProposal(raw: unknown): IdentityProposal | null {
    const record = objectRecord(raw);
    if (!record) {
        return null;
    }
    const state = stringValue(record.state, '');
    if (!isIdentityProposalState(state)) {
        return null;
    }
    const proposalHandle = stringValue(record.proposalHandle ?? record.handle, '');
    if (proposalHandle === '') {
        return null;
    }
    return Object.freeze({
        proposalHandle,
        state,
        summary: stringValue(record.summary, 'Identity proposal awaiting review.'),
        sourceAdapterHandle: stringValue(record.sourceAdapterHandle, 'adapter://tranche-5.9'),
        createdAt: stringValue(record.createdAt, ''),
        reviewedAt: typeof record.reviewedAt === 'string' ? record.reviewedAt : undefined
    });
}

function isPendingIdentityProposal(proposal: IdentityProposal): boolean {
    return proposal.state === 'proposed' || proposal.state === 'reviewed';
}

function isIdentityProposalState(value: string): value is IdentityProposalState {
    return value === 'proposed' ||
        value === 'reviewed' ||
        value === 'accepted' ||
        value === 'rejected' ||
        value === 'applied';
}

function fieldInputFromProfile(
    profile: MathemeHarmonicProfileBoundary | null,
    context: CoordinateContext
): ProtectedPersonalFieldInput {
    return {
        surfaceId: 'm4-nara',
        qIdentityHandle: profileString(profile, ['qIdentityHandle', 'Q_identity.handle']) ?? fallbackHandle('identity', context),
        qTransitHandle: profileString(profile, ['qTransitHandle', 'Q_transit.handle']) ?? fallbackHandle('transit', context),
        qActivityHandle: profileString(profile, ['qActivityHandle', 'Q_activity.handle']) ?? fallbackHandle('activity', context),
        qComposedHandle: profileString(profile, ['qComposedHandle', 'Q_composed.handle']) ?? fallbackHandle('composed', context),
        audioBusHandle: profileString(profile, ['audioBusHandle', 'audio.bus.handle']) ?? fallbackHandle('audio-bus', context),
        planetaryChakralStateHandle:
            profileString(profile, ['planetaryChakralStateHandle', 'planetaryChakralState.handle']) ??
            fallbackHandle('planetary-chakral-state', context)
    };
}

function subjectHandleFromProfile(profile: MathemeHarmonicProfileBoundary | null): string {
    return profileString(profile, ['currentArtifactHandle', 'artifact.handle']) ?? 'nara://protected-local/current-artifact';
}

function defaultConsentDraft(): ConsentDraft {
    return Object.freeze({
        subjectHandle: 'nara://protected-local/current-artifact',
        action: 'nara.voice-corpus.include',
        scope: 'adapter-corpus',
        pressureFree: true,
        inspectable: true
    });
}

function profileString(profile: MathemeHarmonicProfileBoundary | null, dottedNames: readonly string[]): string | null {
    if (!profile) {
        return null;
    }
    for (const dotted of dottedNames) {
        let current: unknown = profile.payload;
        for (const segment of dotted.split('.')) {
            if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
                current = undefined;
                break;
            }
            current = (current as Record<string, unknown>)[segment];
        }
        if (typeof current === 'string' && current.trim() !== '') {
            return current;
        }
    }
    return null;
}

function fallbackHandle(kind: string, context: CoordinateContext = EMPTY_COORDINATE_CONTEXT): string {
    const generation = context.profileGeneration ?? 0;
    return `nara://m4/pratibimba/${kind}/profile-${generation}`;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

void PRIVACY_CLASS;
