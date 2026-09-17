import type { IChingDraw, OraclePosition } from './oracleCastReceipt';

export function OracleIChingMode({
    draw,
    positions,
    readOnly,
    onTransition
}: {
    readonly draw: IChingDraw;
    readonly positions: readonly OraclePosition[];
    readonly readOnly: boolean;
    readonly onTransition: (position: OraclePosition) => void;
}) {
    return (
        <section className="oracle-mode oracle-iching-mode" data-testid="oracle-iching-mode">
            <header className="oracle-cast-summary">
                <strong>Hexagram {draw.primaryHexagramId}</strong>
                {draw.relatingHexagramId ? <span>changes to {draw.relatingHexagramId}</span> : <span>unchanging</span>}
                <span>nuclear {draw.nuclearHexagramId}</span>
            </header>
            <ol className="oracle-iching-lines" reversed>
                {[...draw.lines].reverse().map(line => {
                    const position = positions[line.lineIndex - 1];
                    return (
                        <li
                            key={line.lineIndex}
                            className={`oracle-line ${line.moving ? 'is-moving' : ''}`}
                            data-testid={`oracle-iching-line-${line.lineIndex}`}
                            data-line-type={line.lineType}
                        >
                            <span className="oracle-line-number">{line.lineIndex}</span>
                            <span className={`oracle-line-mark ${line.value % 2 === 0 ? 'yin' : 'yang'}`} aria-label={line.lineType}>
                                {line.value % 2 === 0 ? '━━  ━━' : '━━━━━━'}
                            </span>
                            <span>{line.value} · {line.nucleotide}</span>
                            <code>{line.codonRef.replace('m3-codon://', '')}</code>
                            <OraclePositionState position={position} readOnly={readOnly} onTransition={onTransition} />
                        </li>
                    );
                })}
            </ol>
            {draw.body ? (
                <p className="oracle-body-chain" data-testid="oracle-iching-body">
                    {String(draw.body.dynamics ?? 'body dynamics')} · chakras {String(draw.body.primaryChakra ?? '?')}/
                    {String(draw.body.secondaryChakra ?? '?')}
                </p>
            ) : null}
        </section>
    );
}
export function OraclePositionState({
    position,
    readOnly,
    onTransition
}: {
    readonly position: OraclePosition;
    readonly readOnly: boolean;
    readonly onTransition: (position: OraclePosition) => void;
}) {
    return (
        <span className="oracle-position-state" data-state={position.liveState}>
            <span data-testid={`oracle-position-state-${position.positionIndex}`}>{position.liveState}</span>
            {position.targetAspect ? <span title={JSON.stringify(position.targetAspect)}>aspect</span> : null}
            {!readOnly ? (
                <button
                    type="button"
                    className="oracle-state-button"
                    aria-label={`advance position ${position.positionIndex + 1} from ${position.liveState}`}
                    onClick={() => onTransition(position)}
                >
                    {position.liveState === 'generating' ? 'settle' : position.liveState === 'muting' ? 'mute' : 'reopen'}
                </button>
            ) : null}
        </span>
    );
}
