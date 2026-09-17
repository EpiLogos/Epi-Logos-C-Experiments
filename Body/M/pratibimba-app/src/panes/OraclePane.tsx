/**
 * Coordinate: M' M4' (composite oracle cast surface - rerun 25.T25.8)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 - the governed I-Ching/Tarot casting face.
 * Actualises: the Oracle surface first mounted by 05.T5.1/05.T5.11, now as
 *   separate typed modes over the real gateway, day deposition,
 *   kernel-projected correspondence chains, and OracleSpreadPosition state.
 * Public surface: OraclePane, typed method constants, castTextOf.
 * Does NOT own: randomness, oracle LUTs, state law, history persistence, or
 *   day-artifact composition.
 * Contract: [[M4'-SPEC]] / design-recon 25.T25.8.
 */

import { useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { OracleHistoryPane } from './OracleHistoryPane';
import type { OracleHistoryEntry } from './oracleHistoryLedger';
import { invokeCommand } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore, useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { privacyChrome } from '../ui/privacyChrome';
import { NaraResonanceChip } from './M4NaraResonanceSurface';
import { artifactResonanceIndicator } from './m4NaraResonance';
import { OracleIChingMode } from './OracleIChingMode';
import { OracleTarotMode } from './OracleTarotMode';
import {
    parseOracleCastReceipt,
    type OracleCastReceipt,
    type OracleLiveState,
    type OraclePosition
} from './oracleCastReceipt';
import {
    normalizeOracleEnvelopeStamp,
    projectableSystems,
    readingCardinality,
    type NaraOracleEnvelopeIndicator
} from './m4NaraOracleEnvelope';

export const ORACLE_CAST_METHOD = 'nara.oracle.cast';
export const ORACLE_ICHING_CAST_METHOD = 'nara.oracle.cast_iching';
export const ORACLE_TAROT_CAST_METHOD = 'nara.oracle.cast_tarot';
export const ORACLE_POSITION_STATE_METHOD = 'nara.oracle.update_position_state';
export const ORACLE_DEPOSIT_COMMAND = 'oracle_deposit';

export function castTextOf(artifact: unknown): string | null {
    if (typeof artifact === 'string') return artifact.trim() || null;
    if (artifact && typeof artifact === 'object') {
        const result = (artifact as { result?: unknown }).result;
        if (typeof result === 'string') return result.trim() || null;
    }
    return null;
}

interface CastResult {
    artifactPath: string;
    output: string;
    system: string;
    resonance?: unknown;
    envelope?: unknown;
}

function OracleEnvelopeStrip({ indicator }: { indicator: NaraOracleEnvelopeIndicator }) {
    if (indicator.state !== 'resolved') {
        return <span className="oracle-envelope" data-testid="oracle-envelope" data-state="pending-envelope">{indicator.label}</span>;
    }
    const projectable = projectableSystems(indicator);
    return (
        <div className="oracle-envelope" data-testid="oracle-envelope" data-state="resolved">
            <span data-testid="oracle-envelope-cardinality">
                {readingCardinality(indicator)} positions · {indicator.cpPositionRefs.join(' ')}
            </span>
            {indicator.csDirection ? <span data-testid="oracle-envelope-direction">{indicator.csDirection}</span> : null}
            {indicator.deckContext ? (
                <span data-testid="oracle-envelope-deck">deck {indicator.deckContext.deckOrderHash} · {indicator.deckContext.entropyMode}</span>
            ) : null}
            {indicator.oracleFrameRef ? <span data-testid="oracle-envelope-frame">{indicator.oracleFrameRef}</span> : null}
            {indicator.reviewState ? <span data-testid="oracle-envelope-review">{indicator.reviewState}</span> : null}
            {projectable.length > 0 ? <span data-testid="oracle-envelope-projectable">projects: {projectable.join(' ↔ ')}</span> : null}
        </div>
    );
}

function nextState(state: OracleLiveState): OracleLiveState {
    if (state === 'generating') return 'muting';
    if (state === 'muting') return 'mute';
    return 'generating';
}

function withPositionState(
    receipt: OracleCastReceipt,
    positionIndex: number,
    liveState: OracleLiveState
): OracleCastReceipt {
    return {
        ...receipt,
        positions: receipt.positions.map(position =>
            position.positionIndex === positionIndex ? { ...position, liveState } : position
        )
    };
}

export function OraclePane() {
    const dayNow = useSessionStore(state => state.dayNow);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const profilePayload = useTickStore(state => state.profile?.profile ?? null);
    const [mode, setMode] = useState<'iching' | 'tarot'>('iching');
    const [deck, setDeck] = useState('thoth');
    const [spreadSize, setSpreadSize] = useState<3 | 4 | 5>(3);
    const [question, setQuestion] = useState('');
    const [casting, setCasting] = useState(false);
    const [result, setResult] = useState<CastResult | null>(null);
    const [receipt, setReceipt] = useState<OracleCastReceipt | null>(null);
    const [readOnlyReceipt, setReadOnlyReceipt] = useState<OracleHistoryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!dayNow) {
        return (
            <div className="pane-message" data-testid="oracle-no-day">
                Casts are lived events - anchor the day first (<em>begin today</em>).
                <ProvenanceBadge state="pending" reason="no day anchored" />
            </div>
        );
    }

    const cast = async () => {
        const q = question.trim();
        if (!q || casting) return;
        setCasting(true);
        setError(null);
        setResult(null);
        setReceipt(null);
        setReadOnlyReceipt(null);
        const method = mode === 'iching' ? ORACLE_ICHING_CAST_METHOD : ORACLE_TAROT_CAST_METHOD;
        try {
            if (!gatewayReady()) {
                throw new Error(`Gateway disconnected - a cast is a gateway act (${method}). Nothing was cast or deposited.`);
            }
            const params = mode === 'iching'
                ? { question: q, yes: true, sessionKey }
                : { system: deck, question: q, spreadSize, yes: true, sessionKey };
            const wire = await gateway().invoke(method, params);
            const typed = parseOracleCastReceipt(wire.artifact);
            const outcome = await invokeCommand<CastResult>(ORACLE_DEPOSIT_COMMAND, {
                system: typed.system,
                question: q,
                dayId: dayNow,
                output: typed.output,
                metadata: {
                    castId: typed.castId,
                    spreadId: typed.spreadId,
                    envelope: typed.envelope,
                    draw: typed.draw
                }
            });
            setReceipt(typed);
            setResult({ ...outcome, envelope: outcome.envelope ?? typed.envelope });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
        } finally {
            setCasting(false);
        }
    };

    const transition = async (position: OraclePosition) => {
        if (!receipt || !gatewayReady()) return;
        const requested = nextState(position.liveState);
        try {
            const response = await gateway().invoke(ORACLE_POSITION_STATE_METHOD, {
                spreadId: receipt.spreadId,
                positionIndex: position.positionIndex,
                liveState: requested
            });
            const artifact = response.artifact;
            if (!artifact || typeof artifact !== 'object' || (artifact as { liveState?: unknown }).liveState !== requested) {
                throw new Error(`${ORACLE_POSITION_STATE_METHOD} returned an invalid transition receipt`);
            }
            setReceipt(current => current ? withPositionState(current, position.positionIndex, requested) : current);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
        }
    };

    const visibleReceipt = readOnlyReceipt ?? receipt;
    return (
        <div className={`oracle-pane ${privacyChrome('protected_local').className}`} title={privacyChrome('protected_local').title} data-testid="oracle-pane">
            <div className="oracle-mode-tabs" role="tablist" aria-label="oracle modality">
                <button type="button" role="tab" aria-selected={mode === 'iching'} data-testid="oracle-mode-iching" onClick={() => setMode('iching')}>I-Ching</button>
                <button type="button" role="tab" aria-selected={mode === 'tarot'} data-testid="oracle-mode-tarot" onClick={() => setMode('tarot')}>Tarot</button>
            </div>
            <div className="pane-toolbar">
                {mode === 'tarot' ? (
                    <>
                        <select data-testid="oracle-deck" value={deck} onChange={event => setDeck(event.target.value)} aria-label="Tarot deck">
                            <option value="thoth">Thoth</option>
                            <option value="rws">Rider-Waite-Smith</option>
                            <option value="marseille">Marseille</option>
                            <option value="ql">Quaternal Logic</option>
                        </select>
                        <select data-testid="oracle-spread" value={spreadSize} onChange={event => setSpreadSize(Number(event.target.value) as 3 | 4 | 5)} aria-label="Spread size">
                            <option value={3}>three card</option>
                            <option value={5}>five card</option>
                            <option value={4}>quaternal four</option>
                        </select>
                    </>
                ) : <span className="oracle-method">three-coin · A6 T9 C7 G8</span>}
                <span className="oracle-day">day {dayNow}</span>
            </div>
            <textarea data-testid="oracle-question" className="oracle-question" placeholder="What is the living question?" value={question} onChange={event => setQuestion(event.target.value)} />
            <button type="button" className="instrument-toggle" data-testid="oracle-cast" disabled={casting || question.trim().length === 0} onClick={() => void cast()}>
                {casting ? 'casting...' : 'cast'}
            </button>
            {error ? <div className="chat-error" data-testid="oracle-error">{error}</div> : null}
            {visibleReceipt ? (
                <div className="oracle-result" data-testid="oracle-result" data-read-only={readOnlyReceipt ? 'true' : 'false'}>
                    {result && !readOnlyReceipt ? (
                        <>
                            <NaraResonanceChip indicator={artifactResonanceIndicator(result.resonance, profilePayload)} testId="oracle-artifact-resonance" />
                            <OracleEnvelopeStrip indicator={normalizeOracleEnvelopeStamp(result.envelope)} />
                        </>
                    ) : null}
                    {visibleReceipt.draw.kind === 'iching' ? (
                        <OracleIChingMode draw={visibleReceipt.draw} positions={visibleReceipt.positions} readOnly={Boolean(readOnlyReceipt)} onTransition={position => void transition(position)} />
                    ) : (
                        <OracleTarotMode draw={visibleReceipt.draw} positions={visibleReceipt.positions} readOnly={Boolean(readOnlyReceipt)} onTransition={position => void transition(position)} />
                    )}
                    {!readOnlyReceipt && receipt ? <pre>{receipt.output}</pre> : null}
                    {result && !readOnlyReceipt ? (
                        <button type="button" className="vault-node vault-file" data-testid="oracle-artifact-link" onClick={() => void commands.execute('vault.open', result.artifactPath)}>
                            <ProvenanceBadge state="derived" reason="cast deposited by the app" /> {result.artifactPath}
                        </button>
                    ) : null}
                    {readOnlyReceipt ? <button type="button" onClick={() => setReadOnlyReceipt(null)}>close history reading</button> : null}
                </div>
            ) : null}
            <OracleHistoryPane onOpenCast={setReadOnlyReceipt} />
        </div>
    );
}
