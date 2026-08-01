/**
 * Coordinate: M' M4' (oracle modality, plan T4.1; gateway-dispatched 25.T25.24)
 * Actualises: the cast surface — typed invocation of the real consent-gated
 *   epi oracle, deposited as a day artifact the timeline shows immediately.
 *   Requires an anchored day (casts are lived events, not floating queries).
 *
 *   THE CAST DISPATCHES TO THE GATEWAY. `nara.oracle.cast` is the wire act
 *   (Track-24 law: casts dispatch to the gateway, never local randomness;
 *   every gateway route has a CLI twin and surfaces route through the
 *   gateway). Until 25.T25.24 this pane invoked the Tauri `oracle_cast`
 *   command, which spawned the CLI directly and reached past the gateway
 *   entirely — the Track-00 hardening-T17 integrated-smoke finding. The
 *   spawn survives in `src-tauri/src/oracle.rs` as an offline fallback that
 *   nothing here calls.
 *
 *   THERE IS NO SILENT FALLBACK. With the gateway down the cast REFUSES and
 *   says so. A quiet drop back to the Tauri spawn would restore the bypass
 *   while every test still passed, which is the failure this tranche closes.
 *   Deposition is unchanged S1 law: `oracle_deposit` composes the day
 *   artifact through the one composition authority and writes it.
 *   Each deposited artifact renders its §6.5 resonance indicator (numeric +
 *   Major/Minor/Shadow, pending-resonance fallback) via M4NaraResonance
 *   (05.T5.1) and its §5.11 envelope strip (oracle-frame/protein refs, deck
 *   context, DR-VAK-1 cardinality, review state, tarot↔i-ching
 *   projectability; pending-envelope fallback) via m4NaraOracleEnvelope
 *   (05.T5.11).
 */

import { useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { invokeCommand } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore, useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { privacyChrome } from '../ui/privacyChrome';
import { NaraResonanceChip } from './M4NaraResonanceSurface';
import { artifactResonanceIndicator } from './m4NaraResonance';
import {
    normalizeOracleEnvelopeStamp,
    projectableSystems,
    readingCardinality,
    type NaraOracleEnvelopeIndicator
} from './m4NaraOracleEnvelope';

/** The gateway method that OWNS the cast (25.T25.24). */
export const ORACLE_CAST_METHOD = 'nara.oracle.cast';
/** The S1 deposition seam — composition authority in src-tauri/src/oracle.rs. */
export const ORACLE_DEPOSIT_COMMAND = 'oracle_deposit';

/**
 * `nara.oracle.cast` answers the CLI's text through `cli_to_rpc`, which wraps
 * non-JSON output as `{result: "<text>"}`. Narrowed here rather than trusted:
 * a cast with no text is a refusal, never an empty artifact.
 */
export function castTextOf(artifact: unknown): string | null {
    if (typeof artifact === 'string') {
        return artifact.trim() || null;
    }
    if (artifact && typeof artifact === 'object') {
        const result = (artifact as { result?: unknown }).result;
        if (typeof result === 'string') {
            return result.trim() || null;
        }
    }
    return null;
}

interface CastResult {
    artifactPath: string;
    output: string;
    system: string;
    /**
     * Optional §6.6 envelope resonance stamp (05.T5.1 spec-ahead: the
     * deposition seam does not stamp it yet — absent renders the
     * pending-resonance fallback, never a fabricated reading).
     */
    resonance?: unknown;
    /**
     * Optional §5.11 envelope stamp (05.T5.11 spec-ahead: the src-tauri
     * deposition seam does not stamp it yet — absent renders the
     * pending-envelope fallback, never fabricated refs).
     */
    envelope?: unknown;
}

/**
 * §5.11 envelope strip: preserved refs rendered stamp-first. Cardinality
 * comes from the positions authority (DR-VAK-1) — the spread label never
 * determines it.
 */
function OracleEnvelopeStrip({ indicator }: { indicator: NaraOracleEnvelopeIndicator }) {
    if (indicator.state !== 'resolved') {
        return (
            <span className="oracle-envelope" data-testid="oracle-envelope" data-state="pending-envelope">
                {indicator.label}
            </span>
        );
    }
    const projectable = projectableSystems(indicator);
    return (
        <div className="oracle-envelope" data-testid="oracle-envelope" data-state="resolved">
            <span data-testid="oracle-envelope-cardinality">
                {readingCardinality(indicator)} positions · {indicator.cpPositionRefs.join(' ')}
            </span>
            {indicator.csDirection ? (
                <span data-testid="oracle-envelope-direction">{indicator.csDirection}</span>
            ) : null}
            {indicator.deckContext ? (
                <span data-testid="oracle-envelope-deck">
                    deck {indicator.deckContext.deckOrderHash} · {indicator.deckContext.entropyMode}
                </span>
            ) : null}
            {indicator.oracleFrameRef ? (
                <span data-testid="oracle-envelope-frame">{indicator.oracleFrameRef}</span>
            ) : null}
            {indicator.reviewState ? (
                <span data-testid="oracle-envelope-review">{indicator.reviewState}</span>
            ) : null}
            {projectable.length > 0 ? (
                <span data-testid="oracle-envelope-projectable">
                    projects: {projectable.join(' ↔ ')}
                </span>
            ) : null}
        </div>
    );
}

export function OraclePane() {
    const dayNow = useSessionStore(s => s.dayNow);
    const profilePayload = useTickStore(s => s.profile?.profile ?? null);
    // valid systems per the real CLI (verifier live probe 2026-07-02):
    // tarot decks are rws/thoth/marseille/ql; plus iching. "tarot" bare is rejected.
    const [system, setSystem] = useState('rws');
    const [question, setQuestion] = useState('');
    const [casting, setCasting] = useState(false);
    const [result, setResult] = useState<CastResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!dayNow) {
        return (
            <div className="pane-message" data-testid="oracle-no-day">
                Casts are lived events — anchor the day first (<em>begin today</em>).
                <ProvenanceBadge state="pending" reason="no day anchored" />
            </div>
        );
    }

    const cast = async () => {
        const q = question.trim();
        if (!q || casting) {
            return;
        }
        setCasting(true);
        setError(null);
        setResult(null);
        try {
            if (!gatewayReady()) {
                throw new Error(
                    `Gateway disconnected — a cast is a gateway act (${ORACLE_CAST_METHOD}). ` +
                        'Nothing was cast and nothing was deposited.'
                );
            }
            // S3: the cast itself. The CLI twin runs UNDER the gateway, which
            // owns consent, hygiene and the S0 ledger append.
            const receipt = await gateway().invoke(ORACLE_CAST_METHOD, {
                system,
                question: q,
                yes: true
            });
            const output = castTextOf(receipt.artifact);
            if (!output) {
                throw new Error(`${ORACLE_CAST_METHOD} answered with no cast text — nothing to deposit.`);
            }
            // S1: the day deposition, unchanged.
            const outcome = await invokeCommand<CastResult>(ORACLE_DEPOSIT_COMMAND, {
                system,
                question: q,
                dayId: dayNow,
                output
            });
            setResult(outcome);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setCasting(false);
        }
    };

    return (
        <div
            className={`oracle-pane ${privacyChrome('protected_local').className}`}
            title={privacyChrome('protected_local').title}
            data-testid="oracle-pane"
        >
            <div className="pane-toolbar">
                <select data-testid="oracle-system" value={system} onChange={evt => setSystem(evt.target.value)}>
                    <option value="rws">tarot · rws</option>
                    <option value="thoth">tarot · thoth</option>
                    <option value="marseille">tarot · marseille</option>
                    <option value="ql">tarot · ql</option>
                    <option value="iching">i ching</option>
                </select>
                <span className="oracle-day">day {dayNow}</span>
            </div>
            <textarea
                data-testid="oracle-question"
                className="oracle-question"
                placeholder="What is the living question?"
                value={question}
                onChange={evt => setQuestion(evt.target.value)}
            />
            <button
                type="button"
                className="instrument-toggle"
                data-testid="oracle-cast"
                disabled={casting || question.trim().length === 0}
                onClick={() => void cast()}
            >
                {casting ? 'casting…' : '✦ cast'}
            </button>
            {error ? (
                <div className="chat-error" data-testid="oracle-error">
                    {error}
                </div>
            ) : null}
            {result ? (
                <div className="oracle-result" data-testid="oracle-result">
                    <NaraResonanceChip
                        indicator={artifactResonanceIndicator(result.resonance, profilePayload)}
                        testId="oracle-artifact-resonance"
                    />
                    <OracleEnvelopeStrip indicator={normalizeOracleEnvelopeStamp(result.envelope)} />
                    <pre>{result.output}</pre>
                    <button
                        type="button"
                        className="vault-node vault-file"
                        data-testid="oracle-artifact-link"
                        onClick={() => void commands.execute('vault.open', result.artifactPath)}
                    >
                        <ProvenanceBadge state="derived" reason="cast deposited by the app" /> {result.artifactPath}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
