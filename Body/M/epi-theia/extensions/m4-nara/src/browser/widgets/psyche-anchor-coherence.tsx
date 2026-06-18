import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const PSYCHE_ANCHOR_COHERENCE_VIEW_ID = 'm4.nara.psycheAnchorCoherence';
export const PSYCHE_ANCHOR_COHERENCE_LABEL = 'M4 Psyche-Anchor Coherence';
export const PSYCHE_ANCHOR_COHERENCE_RPC = 'nara.session.psyche_anchor';
export const M4_PSYCHE_ANCHOR_COHERENCE_EXPORT = 'M4PsycheAnchorCoherenceCard' as const;

const NO_CARD_SENTINEL = 0xff;
const PERCENT_DECIMALS = 0;

export type PsycheAnchorCoherenceStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PsycheAnchorCardModel {
    readonly key: string;
    readonly name: string;
    readonly suit: string;
    readonly goldenDawnDecan: string;
}

export interface SessionCodonTraceModel {
    readonly key: string;
    readonly codon: string;
    readonly codonValue: number | null;
    readonly arcanaCardId: number | null;
    readonly arcanaName: string | null;
    readonly noCard: boolean;
    readonly matchAnchorNames: readonly string[];
}

export interface PsycheAnchorHitModel {
    readonly anchorName: string;
    readonly codons: readonly string[];
}

export interface PsycheAnchorCoherenceScoreModel {
    readonly matches: number;
    readonly total: number;
    readonly percentage: number;
}

export interface PsycheAnchorCoherenceModel {
    readonly sessionKey: string;
    readonly privacyClass: 'protected_local_handle_only';
    readonly anchorCards: readonly PsycheAnchorCardModel[];
    readonly codonTrace: readonly SessionCodonTraceModel[];
    readonly coherenceScore: PsycheAnchorCoherenceScoreModel;
    readonly matchList: readonly PsycheAnchorHitModel[];
}

export interface M4PsycheAnchorCoherenceCardProps {
    readonly model: PsycheAnchorCoherenceModel;
}

export const M4PsycheAnchorCoherenceCard: React.FC<M4PsycheAnchorCoherenceCardProps> = ({ model }) => (
    <section
        className={`m4-psyche-anchor-coherence ${privacyChromeClass('protected_local_handle_only')}`}
        data-test="m4-psyche-anchor-coherence"
        data-track="TRACK_08"
        data-export={M4_PSYCHE_ANCHOR_COHERENCE_EXPORT}
        data-view-id={PSYCHE_ANCHOR_COHERENCE_VIEW_ID}
        data-privacy-class={model.privacyClass}
        aria-label="Tarot psyche-anchor coherence"
    >
        <header className="m4-psyche-anchor-header">
            <div>
                <h3>Tarot Psyche-Anchor Coherence</h3>
                <p data-test="m4-psyche-anchor-session-key">{model.sessionKey}</p>
            </div>
            <div className="m4-psyche-anchor-score" data-test="m4-psyche-anchor-score">
                <strong>{formatPercentage(model.coherenceScore.percentage)}</strong>
                <span>
                    {model.coherenceScore.matches} / {model.coherenceScore.total} codons
                </span>
            </div>
            <span
                className="m4-psyche-anchor-privacy mext-privacy-protected-local-handle-only"
                data-test="m4-psyche-anchor-privacy"
            >
                protected_local_handle_only
            </span>
        </header>

        <section className="m4-psyche-anchor-hit-list" data-test="m4-psyche-anchor-hit-list">
            <h4>Per-card hit list</h4>
            <ol>
                {model.matchList.map(hit => (
                    <li
                        key={hit.anchorName}
                        data-test="m4-psyche-anchor-hit"
                        data-anchor-name={hit.anchorName}
                        data-hit-count={hit.codons.length}
                    >
                        <strong>{hit.anchorName}</strong>
                        <span>{hit.codons.length > 0 ? hit.codons.join(', ') : 'no codon hits'}</span>
                    </li>
                ))}
            </ol>
        </section>

        <div className="m4-psyche-anchor-grid">
            <section className="m4-psyche-anchor-section" data-test="m4-psyche-anchor-cards-section">
                <h4>Psyche-anchor cards</h4>
                <ol className="m4-psyche-anchor-cards">
                    {model.anchorCards.map(card => (
                        <li
                            key={card.key}
                            className="m4-psyche-anchor-card"
                            data-test="m4-psyche-anchor-card"
                            data-card-name={card.name}
                            data-card-suit={card.suit}
                        >
                            <strong>{card.name}</strong>
                            <span>{card.suit}</span>
                            <small>{card.goldenDawnDecan}</small>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="m4-psyche-anchor-section" data-test="m4-psyche-anchor-codon-section">
                <h4>Session codon trace</h4>
                <ol className="m4-psyche-anchor-codons">
                    {model.codonTrace.map(codon => (
                        <li
                            key={codon.key}
                            className="m4-psyche-anchor-codon"
                            data-test="m4-psyche-anchor-codon"
                            data-codon={codon.codon}
                            data-codon-value={codon.codonValue ?? ''}
                            data-arcana-card-id={codon.arcanaCardId ?? ''}
                            data-match-count={codon.matchAnchorNames.length}
                        >
                            <code>{codon.codon}</code>
                            {codon.noCard ? (
                                <span
                                    className="m4-psyche-anchor-no-card"
                                    data-test="m4-psyche-anchor-no-card"
                                >
                                    no card
                                </span>
                            ) : (
                                <span
                                    className="m4-psyche-anchor-arcana"
                                    data-test="m4-psyche-anchor-arcana"
                                >
                                    {codon.arcanaName ?? 'Major Arcana unresolved'}
                                </span>
                            )}
                            {codon.matchAnchorNames.length > 0 ? (
                                <small data-test="m4-psyche-anchor-codon-match">
                                    anchor match: {codon.matchAnchorNames.join(', ')}
                                </small>
                            ) : null}
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    </section>
);

@injectable()
export class PsycheAnchorCoherenceWidget extends ReactWidget {
    static readonly ID = PSYCHE_ANCHOR_COHERENCE_VIEW_ID;
    static readonly LABEL = PSYCHE_ANCHOR_COHERENCE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected status: PsycheAnchorCoherenceStatus = 'idle';
    protected model: PsycheAnchorCoherenceModel | null = null;
    protected errorMessage = '';
    protected subscriptions: Disposable[] = [];
    protected activeSessionKey: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = PsycheAnchorCoherenceWidget.ID;
        this.title.label = PsycheAnchorCoherenceWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-psyche-anchor-coherence-widget');
        this.addClass('mext-privacy-protected-local-handle-only');

        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                const sessionKey = sessionKeyFromContext(context);
                if (sessionKey && sessionKey !== this.activeSessionKey) {
                    void this.refresh(sessionKey);
                } else {
                    this.update();
                }
            })
        );
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
        if (this.status === 'ready' && this.model) {
            return (
                <div
                    className={`mext-widget-root m4-psyche-anchor-root ${privacyChromeClass('protected_local_handle_only')}`}
                    data-test="m4-psyche-anchor-root"
                >
                    <M4PsycheAnchorCoherenceCard model={this.model} />
                </div>
            );
        }
        const message = this.status === 'error'
            ? this.errorMessage
            : this.status === 'loading'
                ? 'Reading psyche-anchor coherence handles.'
                : 'Select a session to read psyche-anchor coherence.';
        return (
            <div
                className={`mext-widget-root m4-psyche-anchor-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-psyche-anchor-root"
                data-status={this.status}
            >
                <section className="m4-psyche-anchor-placeholder" data-test="m4-psyche-anchor-placeholder">
                    <h3>Tarot Psyche-Anchor Coherence</h3>
                    <p>{message}</p>
                </section>
            </div>
        );
    }

    protected async refresh(sessionKey: string): Promise<void> {
        this.activeSessionKey = sessionKey;
        this.status = 'loading';
        this.model = null;
        this.errorMessage = '';
        this.update();

        try {
            const raw = await this.bridge.invokeGatewayRpc(PSYCHE_ANCHOR_COHERENCE_RPC, { sessionKey });
            this.model = normalizePsycheAnchorCoherence(raw, sessionKey);
            this.status = 'ready';
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error
                ? error.message
                : 'Psyche-anchor coherence unavailable.';
        }
        this.update();
    }
}

export function normalizePsycheAnchorCoherence(
    raw: unknown,
    sessionKey: string
): PsycheAnchorCoherenceModel {
    const emptyRecord = Object.freeze({}) as Readonly<Record<string, unknown>>;
    const record = objectRecord(raw) ?? emptyRecord;
    const payload = objectRecord(record.payload) ?? record;
    const anchorCards = normalizeAnchorCards(
        payload.anchor_cards ??
        payload.anchorCards ??
        payload.tarot_psyche_anchor ??
        payload.tarotPsycheAnchor
    );
    const codonTraceWithoutMatches = normalizeCodonTrace(
        payload.codon_trace ??
        payload.codonTrace ??
        payload.session_trace ??
        payload.sessionTrace
    );
    const matchList = buildHitList(anchorCards, codonTraceWithoutMatches, payload.match_list ?? payload.matchList);
    const codonTrace = attachCodonMatches(codonTraceWithoutMatches, anchorCards);
    const score = normalizeScore(payload.coherence_score ?? payload.coherenceScore, codonTrace);

    return Object.freeze({
        sessionKey,
        privacyClass: 'protected_local_handle_only' as const,
        anchorCards,
        codonTrace,
        coherenceScore: score,
        matchList
    });
}

export function sessionKeyFromContext(context: CoordinateContext): string | null {
    const record = context as unknown as Readonly<Record<string, unknown>>;
    return stringValue(
        record.dayNowSessionHandle ??
        record.sessionKey ??
        record.session_key ??
        record.activeSessionKey ??
        record.active_session_key,
        null
    );
}

function normalizeAnchorCards(raw: unknown): readonly PsycheAnchorCardModel[] {
    const rows = arrayValue(raw);
    return Object.freeze(
        rows.slice(0, 4).map((item, index) => {
            const record = objectRecord(item);
            const name = stringValue(
                record?.name ??
                record?.card_name ??
                record?.cardName ??
                record?.arcana_name ??
                record?.arcanaName ??
                record?.major_arcana_name ??
                record?.majorArcanaName,
                `Anchor card ${index + 1}`
            );
            const suit = stringValue(
                record?.suit ??
                record?.minor_suit ??
                record?.minorSuit ??
                record?.arcana_suit ??
                record?.arcanaSuit,
                'Major Arcana'
            );
            const goldenDawnDecan = stringValue(
                record?.golden_dawn_decan ??
                record?.goldenDawnDecan ??
                record?.decan_correspondence ??
                record?.decanCorrespondence ??
                record?.decan,
                'Golden Dawn decan correspondence unavailable'
            );
            return Object.freeze({
                key: stringValue(record?.id ?? record?.card_id ?? record?.cardId, `${index}:${name}`),
                name,
                suit,
                goldenDawnDecan
            });
        })
    );
}

function normalizeCodonTrace(raw: unknown): readonly SessionCodonTraceModel[] {
    return Object.freeze(
        arrayValue(raw).map((item, index) => {
            const record = objectRecord(item);
            const codonValue = numericValue(record?.codon_value ?? record?.codonValue ?? record?.value ?? item);
            const codon = codonLabel(item, record, codonValue, index);
            const arcanaRecord =
                objectRecord(record?.major_arcana) ??
                objectRecord(record?.majorArcana) ??
                objectRecord(record?.arcana) ??
                objectRecord(record?.card);
            const rawCardId =
                record?.major_arcana_card_id ??
                record?.majorArcanaCardId ??
                record?.arcana_card_id ??
                record?.arcanaCardId ??
                record?.card_id ??
                record?.cardId ??
                record?.major_arcana ??
                record?.majorArcana ??
                arcanaRecord?.card_id ??
                arcanaRecord?.cardId ??
                arcanaRecord?.id;
            const arcanaCardId = numericValue(rawCardId);
            const arcanaName = stringValue(
                record?.major_arcana_name ??
                record?.majorArcanaName ??
                record?.arcana_name ??
                record?.arcanaName ??
                record?.card_name ??
                record?.cardName ??
                arcanaRecord?.name,
                null
            );
            const noCard =
                arcanaCardId === NO_CARD_SENTINEL ||
                booleanValue(record?.no_card ?? record?.noCard) === true ||
                stringValue(record?.governance_role ?? record?.governanceRole, '').toLowerCase() === 'stop';
            return Object.freeze({
                key: stringValue(record?.id ?? record?.trace_id ?? record?.traceId, `${index}:${codon}`),
                codon,
                codonValue,
                arcanaCardId: arcanaCardId === NO_CARD_SENTINEL ? null : arcanaCardId,
                arcanaName: noCard ? null : arcanaName,
                noCard,
                matchAnchorNames: Object.freeze([])
            });
        })
    );
}

function buildHitList(
    anchorCards: readonly PsycheAnchorCardModel[],
    codonTrace: readonly SessionCodonTraceModel[],
    rawMatchList: unknown
): readonly PsycheAnchorHitModel[] {
    const rawHits = normalizeRawHits(rawMatchList);
    return Object.freeze(
        anchorCards.map(card => {
            const cardKey = canonicalName(card.name);
            const rawHit = rawHits.get(cardKey);
            const codons = rawHit ?? codonTrace
                .filter(codon => canonicalName(codon.arcanaName) === cardKey)
                .map(codon => codon.codon);
            return Object.freeze({
                anchorName: card.name,
                codons: Object.freeze(codons)
            });
        })
    );
}

function attachCodonMatches(
    codonTrace: readonly SessionCodonTraceModel[],
    anchorCards: readonly PsycheAnchorCardModel[]
): readonly SessionCodonTraceModel[] {
    const anchorNames = new Map(anchorCards.map(card => [canonicalName(card.name), card.name]));
    return Object.freeze(
        codonTrace.map(codon => {
            const matched = anchorNames.get(canonicalName(codon.arcanaName));
            return Object.freeze({
                ...codon,
                matchAnchorNames: Object.freeze(matched ? [matched] : [])
            });
        })
    );
}

function normalizeScore(
    raw: unknown,
    codonTrace: readonly SessionCodonTraceModel[]
): PsycheAnchorCoherenceScoreModel {
    const record = objectRecord(raw);
    const total = numericValue(record?.total ?? record?.total_codons ?? record?.totalCodons) ?? codonTrace.length;
    const matches = numericValue(record?.matches ?? record?.match_count ?? record?.matchCount) ??
        codonTrace.filter(codon => codon.matchAnchorNames.length > 0).length;
    const rawPercentage = numericValue(record?.percentage ?? record?.percent ?? record?.ratio ?? raw);
    const percentage = rawPercentage !== null && rawPercentage <= 1
        ? rawPercentage * 100
        : rawPercentage ?? (total > 0 ? (matches / total) * 100 : 0);

    return Object.freeze({
        matches,
        total,
        percentage: Math.max(0, Math.min(100, percentage))
    });
}

function normalizeRawHits(raw: unknown): ReadonlyMap<string, readonly string[]> {
    const hits = new Map<string, string[]>();
    for (const item of arrayValue(raw)) {
        const record = objectRecord(item);
        const anchorName = stringValue(
            record?.anchor_name ??
            record?.anchorName ??
            record?.card_name ??
            record?.cardName ??
            record?.arcana_name ??
            record?.arcanaName,
            null
        );
        if (!anchorName) {
            continue;
        }
        const codons = arrayValue(record?.codons ?? record?.codon_hits ?? record?.codonHits)
            .map(value => stringValue(value, null))
            .filter(isNonNullString);
        const singleCodon = stringValue(record?.codon ?? record?.codon_label ?? record?.codonLabel, null);
        const values = codons.length > 0 ? codons : singleCodon ? [singleCodon] : [];
        hits.set(canonicalName(anchorName), values);
    }
    return hits;
}

function codonLabel(
    item: unknown,
    record: Readonly<Record<string, unknown>> | undefined,
    codonValue: number | null,
    index: number
): string {
    const textual = stringValue(
        record?.codon ??
        record?.codon_label ??
        record?.codonLabel ??
        record?.symbol ??
        record?.rna ??
        (typeof item === 'string' ? item : undefined),
        null
    );
    if (textual) {
        return textual;
    }
    if (codonValue !== null) {
        return `codon ${codonValue}`;
    }
    return `codon ${index + 1}`;
}

function formatPercentage(value: number): string {
    return `${value.toFixed(PERCENT_DECIMALS)}%`;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : Object.freeze([]);
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }
    return value as Readonly<Record<string, unknown>>;
}

function stringValue(value: unknown, fallback: string): string;
function stringValue(value: unknown, fallback: null): string | null;
function stringValue(value: unknown, fallback: string | null): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numericValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.trunc(value);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^0x[0-9a-f]+$/i.test(trimmed)) {
            return parseInt(trimmed, 16);
        }
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return Number(trimmed);
        }
    }
    return null;
}

function booleanValue(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}

function canonicalName(value: string | null): string {
    return (value ?? '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '');
}

function isNonNullString(value: string | null): value is string {
    return value !== null;
}
