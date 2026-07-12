/**
 * Coordinate: M' M4' (oracle modality, plan T4.1)
 * Actualises: the cast surface — typed invocation of the real consent-gated
 *   epi oracle, deposited as a day artifact the timeline shows immediately.
 *   Requires an anchored day (casts are lived events, not floating queries).
 *   Each deposited artifact renders its §6.5 resonance indicator (numeric +
 *   Major/Minor/Shadow, pending-resonance fallback) via M4NaraResonance
 *   (05.T5.1).
 */

import { useState } from 'react';
import { invokeCommand } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore, useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { NaraResonanceChip } from './M4NaraResonanceSurface';
import { artifactResonanceIndicator } from './m4NaraResonance';

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
            const outcome = await invokeCommand<CastResult>('oracle_cast', {
                system,
                question: q,
                dayId: dayNow
            });
            setResult(outcome);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setCasting(false);
        }
    };

    return (
        <div className="oracle-pane" data-testid="oracle-pane">
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
