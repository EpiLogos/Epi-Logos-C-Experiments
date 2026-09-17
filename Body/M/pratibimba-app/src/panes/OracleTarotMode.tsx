import { OraclePositionState } from './OracleIChingMode';
import type { OraclePosition, TarotDraw } from './oracleCastReceipt';

export function OracleTarotMode({
    draw,
    positions,
    readOnly,
    onTransition
}: {
    readonly draw: TarotDraw;
    readonly positions: readonly OraclePosition[];
    readonly readOnly: boolean;
    readonly onTransition: (position: OraclePosition) => void;
}) {
    return (
        <section className="oracle-mode oracle-tarot-mode" data-testid="oracle-tarot-mode">
            <div className="oracle-tarot-cards">
                {draw.cards.map(card => {
                    const position = positions[card.positionIndex];
                    const planet = card.planet?.name ? String(card.planet.name) : null;
                    const chakra = card.chakra?.name ? String(card.chakra.name) : null;
                    return (
                        <article key={card.positionIndex} className="oracle-tarot-card" data-testid={`oracle-tarot-card-${card.positionIndex}`}>
                            <span className="oracle-card-position">{card.positionIndex + 1}</span>
                            <strong>{card.label}</strong>
                            {card.reversed ? <span className="oracle-reversed">reversed</span> : null}
                            <code>{card.codonRef?.replace('m3-codon://', '') ?? 'no primary codon'}</code>
                            <p className="oracle-card-chain" data-testid={`oracle-card-chain-${card.positionIndex}`}>
                                {[card.suit, card.element, planet, chakra, ...card.bodyZones].filter(Boolean).join(' → ') || 'major arcana'}
                            </p>
                            <OraclePositionState position={position} readOnly={readOnly} onTransition={onTransition} />
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
