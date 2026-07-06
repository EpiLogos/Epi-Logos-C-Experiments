/**
 * Coordinate: M' M4' (oracle modality, plan T4.1)
 * Actualises: the cast surface — typed invocation of the real consent-gated
 *   epi oracle, deposited as a day artifact the timeline shows immediately.
 *   Requires an anchored day (casts are lived events, not floating queries).
 */

import { useState } from 'react';
import { invokeCommand } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';

interface CastResult {
    artifactPath: string;
    output: string;
    system: string;
}

export function OraclePane() {
    const dayNow = useSessionStore(s => s.dayNow);
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
