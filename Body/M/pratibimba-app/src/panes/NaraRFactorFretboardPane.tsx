/**
 * Coordinate: M' M4' (R-factor fretboard engine — Track 25.T25.23)
 * Actualises: the playable surface of the Archetype-7 R-factor theory — 7
 *   strings (O#/X#/N#/M#/Nara/Siva/Shakti) × 6 frets off the COMPILED route
 *   table on the profile wire, the recorded `anuttaraWitness.rfactorPath`
 *   replayed as lit frets (pravritti warm / nivritti cool, the `(@#)` turn
 *   flaring at the bridge), virtue lamps off the emit-only witness vector,
 *   the band-balance readout, and `?`-object chips routed to the verifier.
 *   An engine, not an overlay — and a pure consumer: no route recomputation,
 *   no local path advance, no gating on the witness.
 */

import { useState } from 'react';
import './naraRFactorFretboard.css';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import { M0_VIRTUE_LABELS } from './m0VirtueWitness';
import {
    RFACTOR_EMIT_QUERY_METHOD,
    fretMarkers,
    litFrets,
    readRFactorFretboard,
    unreturnedComplements,
    virtueLampsLit
} from './naraRFactorFretboard';

const STRING_GAP = 34;
const FRET_GAP = 74;
const LEFT = 86;
const TOP = 40;

export function NaraRFactorFretboardPane() {
    const cached = useTickStore(state => state.profile);
    const [emitted, setEmitted] = useState<Record<string, 'sent' | 'failed'>>({});

    const read = readRFactorFretboard(cached?.profile ?? null);
    const chrome = privacyChrome('protected_local');

    const emitQuestion = (question: string) => {
        if (!gatewayReady()) {
            setEmitted(prev => ({ ...prev, [question]: 'failed' }));
            return;
        }
        gateway()
            .invoke(RFACTOR_EMIT_QUERY_METHOD, { question })
            .then(() => setEmitted(prev => ({ ...prev, [question]: 'sent' })))
            .catch(() => setEmitted(prev => ({ ...prev, [question]: 'failed' })));
    };

    if (read.kind === 'pending') {
        return (
            <div
                className={`rfactor-fretboard ${chrome.className}`}
                title={chrome.title}
                data-testid="rfactor-fretboard"
                data-state="pending"
            >
                <div className="pane-message" data-testid="rfactor-fretboard-pending">
                    fretboard pending: {read.reason}
                </div>
            </div>
        );
    }

    const { table, witness } = read;
    const markers = fretMarkers(table);
    const path = witness?.rfactorPath ?? [];
    const lit = litFrets(table, path);
    const glowComplements = witness ? unreturnedComplements(witness) : [];
    const lamps = virtueLampsLit(witness?.virtueWitnessVector ?? 0);
    const width = LEFT + FRET_GAP * 6 + 60;
    const height = TOP + STRING_GAP * 7 + 30;

    return (
        <div
            className={`rfactor-fretboard ${chrome.className}`}
            title={chrome.title}
            data-testid="rfactor-fretboard"
            data-state="read"
            data-generation={cached?.generation ?? ''}
            data-walked-steps={path.length}
        >
            <header className="rfactor-fretboard-head">
                <span className="rfactor-fretboard-coordinate">M4′ · Archetype-7</span>
                <span className="rfactor-fretboard-title">R-factor fretboard</span>
            </header>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="R-factor fretboard: 7 route strings by 6 fret positions"
                data-testid="rfactor-fretboard-svg"
            >
                {/* strings — one per base route, labelled with its M column */}
                {table.routes.map((route, row) => (
                    <g key={route.baseRoute}>
                        <text
                            x={8}
                            y={TOP + row * STRING_GAP + 4}
                            className="rfactor-string-label"
                            data-testid={`rfactor-string-${row}`}
                            data-base-route={route.baseRoute}
                            data-m-column={route.mColumn}
                        >
                            {route.baseRoute}
                        </text>
                        <line
                            x1={LEFT - 18}
                            y1={TOP + row * STRING_GAP}
                            x2={LEFT + FRET_GAP * 5 + 24}
                            y2={TOP + row * STRING_GAP}
                            className="rfactor-string"
                        />
                    </g>
                ))}
                {/* frets 0..5 */}
                {Array.from({ length: 6 }, (_, fret) => (
                    <line
                        key={fret}
                        x1={LEFT + fret * FRET_GAP}
                        y1={TOP - 16}
                        x2={LEFT + fret * FRET_GAP}
                        y2={TOP + STRING_GAP * 6 + 16}
                        className="rfactor-fret"
                        data-testid={`rfactor-fret-${fret}`}
                    />
                ))}
                {/* distributed act markers */}
                {markers.map(marker => {
                    const key = `${marker.routeIndex}:${marker.position}`;
                    const step = lit.get(key);
                    const litByStep = step !== undefined && step.rFactor === marker.rFactor;
                    return (
                        <g key={`${marker.routeIndex}-${marker.rFactor}`}>
                            <circle
                                cx={LEFT + marker.position * FRET_GAP}
                                cy={TOP + marker.routeIndex * STRING_GAP}
                                r={litByStep ? 11 : 8}
                                className={[
                                    'rfactor-marker',
                                    `rfactor-${marker.course}`,
                                    litByStep ? `rfactor-lit rfactor-band-${step.band}` : '',
                                    glowComplements.includes(marker.rFactor)
                                        ? 'rfactor-unreturned-glow'
                                        : ''
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                data-testid={`rfactor-marker-${marker.baseRoute}-${marker.rFactor}`}
                                data-course={marker.course}
                                data-r-factor={marker.rFactor}
                                data-position={marker.position}
                                data-lit={litByStep ? step.band : 'unlit'}
                                data-unreturned-glow={glowComplements.includes(marker.rFactor)}
                            />
                            <text
                                x={LEFT + marker.position * FRET_GAP}
                                y={TOP + marker.routeIndex * STRING_GAP + 4}
                                className="rfactor-marker-label"
                                textAnchor="middle"
                            >
                                {marker.rFactor}R
                            </text>
                        </g>
                    );
                })}
                {/* R5 — fretless open string/harmonic, positionless by law */}
                <text
                    x={LEFT + FRET_GAP * 5 + 34}
                    y={TOP + STRING_GAP * 3}
                    className="rfactor-fretless"
                    data-testid="rfactor-r5-fretless"
                >
                    5R (##)
                </text>
                {/* the (@#) band-turn on the bridge: Shakti R2@5 → R3@0 */}
                <text
                    x={LEFT + FRET_GAP * 5 + 34}
                    y={TOP + STRING_GAP * 6}
                    className={
                        path.some(step => step.isTurn)
                            ? 'rfactor-band-turn rfactor-turn-flare'
                            : 'rfactor-band-turn'
                    }
                    data-testid="rfactor-band-turn"
                    data-turn-walked={path.some(step => step.isTurn)}
                >
                    {table.bandTurnSymbol}
                </text>
            </svg>
            {/* virtue lamps — the emit-only witness vector, LSB-first */}
            <ul className="rfactor-virtue-lamps" data-testid="rfactor-virtue-lamps">
                {table.virtues.map(virtue => (
                    <li
                        key={virtue.virtueIndex}
                        data-testid={`rfactor-virtue-lamp-${virtue.virtueIndex}`}
                        data-lit={lamps[virtue.virtueIndex] === true}
                        data-r-factor={virtue.rFactor ?? ''}
                        title={virtue.symbol}
                    >
                        {M0_VIRTUE_LABELS[virtue.virtueIndex] ?? virtue.name}
                    </li>
                ))}
            </ul>
            {/* band balance — 25.19's session-close question made legible */}
            {witness ? (
                <div className="rfactor-band-balance" data-testid="rfactor-band-balance">
                    <span data-testid="rfactor-reached-turn">
                        turn {witness.bandBalance.reachedTurn ? 'reached' : 'not reached'}
                    </span>
                    <span data-testid="rfactor-returned">
                        {witness.bandBalance.returned ? 'returned' : 'unreturned'}
                    </span>
                </div>
            ) : (
                <div className="pane-message" data-testid="rfactor-no-witness">
                    no witness on this generation — the path panel stays dark
                </div>
            )}
            {/* ?-object chips → contemplation via the verifier, never local */}
            {witness && witness.openQuestions.length > 0 ? (
                <ul className="rfactor-open-questions" data-testid="rfactor-open-questions">
                    {witness.openQuestions.map(question => (
                        <li key={question}>
                            <button
                                type="button"
                                data-testid="rfactor-question-chip"
                                data-emit-state={emitted[question] ?? 'idle'}
                                onClick={() => emitQuestion(question)}
                            >
                                ? {question}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
