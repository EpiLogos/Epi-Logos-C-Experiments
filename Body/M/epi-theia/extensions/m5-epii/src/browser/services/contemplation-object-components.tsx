import * as React from 'react';
import type {
    ArchNineChargeState,
    CodonTraceEntry,
    ContemplationObjectViewModel,
    KairosWindowModel,
    QComposedTrajectoryModel,
    SkeletonEventModel,
    SyntaxSeedModel,
    TarotPsycheAnchorModel,
    VakProfilePair
} from './contemplation-object-service';

export function ContemplationObjectViewer({
    model
}: {
    readonly model: ContemplationObjectViewModel;
}): React.ReactElement {
    return (
        <section className="mext-widget-detail m5-contemplation-object" data-test="m5-contemplation-object-viewer">
            <h3>ContemplationObjectViewer</h3>
            <p className="m5-contemplation-narrative">{model.identityNarrative}</p>
            <div className="m5-contemplation-grid">
                <KairosWindow open={model.kairos.open} close={model.kairos.close} />
                <TarotPsycheAnchor draw={model.tarotPsycheAnchor} />
                <QComposedTrajectoryView trajectory={model.qComposedTrajectory} />
                <CodonTraceList codons={model.codonTrace} />
                <VakProfilePairsTable pairs={model.vakProfilePairs} />
                <ArchNineChargeBar state={model.archNineChargeState} />
                <SkeletonEventsFiredList events={model.skeletonEventsFired} />
                <FourSyntaxComplianceSeeds seeds={model.fourSyntaxComplianceSeeds} />
            </div>
        </section>
    );
}

export function KairosWindow({
    open,
    close
}: {
    readonly open: KairosWindowModel;
    readonly close: KairosWindowModel;
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-kairos-window">
            <h4>KairosWindow</h4>
            <div className="m5-kairos-columns">
                {renderKairosColumn('open', open)}
                {renderKairosColumn('close', close)}
            </div>
        </section>
    );
}

function renderKairosColumn(label: string, model: KairosWindowModel): React.ReactElement {
    return (
        <div className="m5-kairos-column">
            <strong>{label}</strong>
            <span>degree {model.degree ?? '-'}</span>
            <span>epoch {model.epoch ?? '-'}</span>
            <ol>
                {model.planets.map(row => (
                    <li key={`${label}-${row.planet}`}>
                        {row.planet}: {row.valid ? `${row.degree} (${row.mod10})` : 'inactive'}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function TarotPsycheAnchor({
    draw
}: {
    readonly draw: TarotPsycheAnchorModel;
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-tarot-psyche-anchor">
            <h4>TarotPsycheAnchor</h4>
            <div className="m5-tarot-cards">
                {draw.cards.map(card => (
                    <article key={card.card} className="m5-tarot-card">
                        <strong>{card.label}</strong>
                        <span>decan {card.decan}</span>
                        <span>chakra {card.chakra}</span>
                        <small>{card.bodyZones.join(', ')}</small>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function QComposedTrajectoryView({
    trajectory
}: {
    readonly trajectory: QComposedTrajectoryModel;
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-q-composed-trajectory">
            <h4>QComposedTrajectoryView</h4>
            <p>{trajectory.geodesicFit ? 'geodesic-fit' : 'per-tick'} over S3 shadow</p>
            <div className="m5-q-trajectory">
                {trajectory.ticks.map(tick => (
                    <span
                        key={tick.tick}
                        title={`q${tick.tick}: ${tick.w},${tick.x},${tick.y},${tick.z}`}
                        style={{
                            left: `${Math.min(95, Math.max(0, 50 + tick.x * 40))}%`,
                            top: `${Math.min(95, Math.max(0, 50 - tick.y * 40))}%`
                        }}
                    >
                        {tick.tick}
                    </span>
                ))}
            </div>
        </section>
    );
}

export function CodonTraceList({
    codons
}: {
    readonly codons: readonly CodonTraceEntry[];
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-codon-trace">
            <h4>CodonTraceList</h4>
            <ol>
                {codons.map(entry => (
                    <li key={`${entry.codon}-${entry.label ?? 'codon'}`}>
                        <a href={entry.m3_route ?? `m3-mahamaya/codon/${entry.codon}`}>
                            codon {entry.codon}
                        </a>
                        <span>{entry.label ?? 'rotated'}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

export function VakProfilePairsTable({
    pairs
}: {
    readonly pairs: readonly VakProfilePair[];
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-vak-profile-pairs">
            <h4>VakProfilePairsTable</h4>
            <table>
                <thead>
                    <tr>
                        <th>dispatch</th>
                        <th>generation</th>
                        <th>profile</th>
                    </tr>
                </thead>
                <tbody>
                    {pairs.map(pair => (
                        <tr key={`${pair.dispatch}-${pair.profile_generation}`}>
                            <td>
                                <a href={pair.acr_route ?? 'acr://dispatch'}>{pair.dispatch}</a>
                            </td>
                            <td>{pair.profile_generation}</td>
                            <td>{pair.profile_anchor}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

export function ArchNineChargeBar({
    state
}: {
    readonly state: ArchNineChargeState;
}): React.ReactElement {
    const cells: readonly (readonly [string, number])[] = Object.freeze([
        Object.freeze(['pp', state.pp] as const),
        Object.freeze(['nn', state.nn] as const),
        Object.freeze(['np', state.np] as const),
        Object.freeze(['pn', state.pn] as const)
    ]);
    const max = Math.max(1, ...cells.map(([, value]) => value));
    return (
        <section className="m5-contemplation-pane" data-test="m5-arch-nine-charge">
            <h4>ArchNineChargeBar</h4>
            <strong className={state.invariantPass ? 'm5-charge-pass' : 'm5-charge-fail'}>
                ArchNineChargeState {state.invariantPass ? 'PASS' : 'FAIL'} {state.total}/{state.expected}
            </strong>
            <div className="m5-charge-bars">
                {cells.map(([label, value]) => (
                    <span key={label} style={{ height: `${Math.max(8, value / max * 100)}%` }}>
                        {label}:{value}
                    </span>
                ))}
            </div>
        </section>
    );
}

export function SkeletonEventsFiredList({
    events
}: {
    readonly events: readonly SkeletonEventModel[];
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-skeleton-events">
            <h4>SkeletonEventsFiredList</h4>
            <ol>
                {events.map(event => (
                    <li key={event.name} className={`m5-skeleton-${event.tone}`}>
                        {event.name}
                    </li>
                ))}
            </ol>
        </section>
    );
}

export function FourSyntaxComplianceSeeds({
    seeds
}: {
    readonly seeds: readonly SyntaxSeedModel[];
}): React.ReactElement {
    return (
        <section className="m5-contemplation-pane" data-test="m5-four-syntax-seeds">
            <h4>FourSyntaxComplianceSeeds</h4>
            <div className="m5-syntax-seeds">
                {seeds.map(seed => (
                    <article key={seed.label}>
                        <strong>{seed.label}</strong>
                        <p>{seed.prompt}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
