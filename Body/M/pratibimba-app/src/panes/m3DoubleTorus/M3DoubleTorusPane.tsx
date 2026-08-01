/**
 * Coordinate: M3-5' co-foliated double-torus world clock (rerun 51.T51.5)
 * Residency: Body/M/pratibimba-app/src/panes/m3DoubleTorus/M3DoubleTorusPane.tsx
 * Position (#n): #5 — Integration: the depth mode canon calls a depth mode.
 * Actualises: [[M3'-SPEC]] §1's "M3-5 double-torus world-clock view: a depth
 *   mode showing the co-foliation of [[K²]] audio-genesis substrate with
 *   [[T²_Mahāmāyā]] inscription", under the surface law of §8.13.
 *
 *   ONE CHART, TWO TRANSVERSE LEAF FAMILIES. The SVG is the torus fundamental
 *   domain: K² leaves run vertically, T²_Mahāmāyā leaves horizontally, and the
 *   marked points are where they cross. Both families are drawn in the SAME
 *   rectangle — that is what "co-foliated rather than drawn side by side"
 *   means, and it is why the active state is a CROSSING and not two separate
 *   highlights.
 * Public surface: M3DoubleTorusPane.
 * Does NOT own: the reading or the crossing law (`coFoliation.ts`), the M3 bus
 *   reader (`panes/m3Inspectors.ts`), the clock, the substrate invariant.
 * Contract: [[M3'-SPEC]] §1 / §8.13 · rerun tranche [[51.T51.5]].
 */

import { useMemo } from 'react';
import { useTickStore } from '../../state/stores';
import { readCoFoliation } from './coFoliation';
import './m3DoubleTorus.css';

const CHART = { width: 480, height: 300, pad: 18 } as const;

function cell(value: number | string | null): string {
    return value === null ? 'pending' : String(value);
}

export function M3DoubleTorusPane() {
    const cached = useTickStore(s => s.profile);
    const reading = useMemo(() => readCoFoliation(cached), [cached]);

    const innerW = CHART.width - CHART.pad * 2;
    const innerH = CHART.height - CHART.pad * 2;
    const x = (u: number) => CHART.pad + u * innerW;
    const y = (v: number) => CHART.pad + v * innerH;

    return (
        <div
            className="m3-double-torus"
            data-testid="m3-double-torus"
            data-depth-mode="toroidal-world"
            data-generation={reading.generation ?? ''}
            data-k2-leaf={reading.k2.activeLeaf ?? ''}
            data-k2-sheet={reading.k2.sheet ?? ''}
            data-t2-leaf={reading.t2.activeLeaf ?? ''}
            data-crossing-count={reading.crossings.length}
            data-active-crossing={
                reading.activeCrossing
                    ? `${reading.activeCrossing.k2Leaf}x${reading.activeCrossing.t2Leaf}`
                    : ''
            }
            data-pending={reading.pending.join(' | ')}
        >
            <header className="m3-dt-header">
                <span className="m3-dt-coordinate">M3-5&#8242;</span>
                <h2>Double-torus world clock</h2>
                <p className="m3-dt-essence">
                    K&#178; — the chromatic-fifths double cover, the audio-genesis substrate —
                    co-foliated with T&#178;<sub>Mahāmāyā</sub>, the inscription-circle × lens-circle
                    transcription substrate. One chart, two transverse leaf families; the state of
                    the wheel is the crossing where they meet, not two pictures side by side.
                </p>
            </header>

            <section className="m3-dt-chart-wrap" data-testid="m3-double-torus-chart">
                <svg
                    className="m3-dt-chart"
                    viewBox={`0 0 ${CHART.width} ${CHART.height}`}
                    role="img"
                    aria-label="Co-foliated double torus: K squared leaves crossed with T squared Mahamaya leaves"
                >
                    <rect
                        x={CHART.pad}
                        y={CHART.pad}
                        width={innerW}
                        height={innerH}
                        className="m3-dt-domain"
                    />
                    {/* K² foliation — leaves along u (the double cover) */}
                    {reading.k2.leaves.map(leaf => (
                        <line
                            key={`k2-${leaf.index}`}
                            data-testid={`m3-dt-k2-leaf-${leaf.index}`}
                            data-active={String(leaf.active)}
                            className={`m3-dt-leaf m3-dt-leaf-k2${leaf.active ? ' is-active' : ''}`}
                            x1={x(leaf.u)}
                            y1={CHART.pad}
                            x2={x(leaf.u)}
                            y2={CHART.pad + innerH}
                        >
                            <title>{leaf.label}</title>
                        </line>
                    ))}
                    {/* T²_Mahāmāyā foliation — leaves along v, transverse */}
                    {reading.t2.leaves.map(leaf => (
                        <line
                            key={`t2-${leaf.index}`}
                            data-testid={`m3-dt-t2-leaf-${leaf.index}`}
                            data-active={String(leaf.active)}
                            className={`m3-dt-leaf m3-dt-leaf-t2${leaf.active ? ' is-active' : ''}`}
                            x1={CHART.pad}
                            y1={y(leaf.u)}
                            x2={CHART.pad + innerW}
                            y2={y(leaf.u)}
                        >
                            <title>{leaf.label}</title>
                        </line>
                    ))}
                    {/* the co-foliation itself: where the two families meet */}
                    {reading.activeCrossing ? (
                        <circle
                            data-testid="m3-dt-active-crossing"
                            className="m3-dt-crossing"
                            cx={x(reading.activeCrossing.u)}
                            cy={y(reading.activeCrossing.v)}
                            r={6}
                        />
                    ) : null}
                </svg>
            </section>

            <section className="m3-dt-readout">
                <dl>
                    <dt>K&#178; degree720</dt>
                    <dd data-testid="m3-dt-degree720">{cell(reading.k2.degree720)}</dd>
                    <dt>K&#178; sheet · pitch class · fifths</dt>
                    <dd data-testid="m3-dt-k2-parts">
                        {cell(reading.k2.sheet)} · {cell(reading.k2.pitchClass)} ·{' '}
                        {cell(reading.k2.fifthsIndex)}
                    </dd>
                    <dt>T&#178; lens · mode</dt>
                    <dd data-testid="m3-dt-t2-parts">
                        {cell(reading.t2.lens)} · {cell(reading.t2.mode)}
                    </dd>
                    <dt>T&#178; inscription (codon)</dt>
                    <dd data-testid="m3-dt-inscription">{cell(reading.t2.inscription)}</dd>
                    <dt>active crossing</dt>
                    <dd data-testid="m3-dt-crossing-readout">
                        {reading.activeCrossing
                            ? `K² leaf ${reading.activeCrossing.k2Leaf} × T² leaf ${reading.activeCrossing.t2Leaf}`
                            : 'pending — a crossing needs both foliations live'}
                    </dd>
                </dl>
            </section>

            <section className="m3-dt-dual" data-testid="m3-double-torus-zero-side-dual">
                <h3>0-side dual rendering (§8.13)</h3>
                <p className="m3-dt-note">
                    Both renderings are operational on the 0 side and both consume the same
                    canonical substrate — the B-8 non-fork invariant, read from the composition
                    contract rather than restated here.
                </p>
                <ul>
                    {reading.zeroSideDual.map(rendering => (
                        <li
                            key={rendering.id}
                            data-testid={`m3-dt-zero-side-${rendering.id}`}
                            data-substrate-label={rendering.substrateLabel}
                            data-substrate-identity={rendering.substrateIdentityProperty}
                        >
                            <b>{rendering.coordinate}</b> — {rendering.role}{' '}
                            <span className="m3-dt-note">
                                over <code>{rendering.substrateLabel}</code> keyed by{' '}
                                <code>{rendering.substrateIdentityProperty}</code>
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            {reading.pending.length > 0 ? (
                <p className="m3-dt-note" data-testid="m3-double-torus-pending">
                    Pending from the live profile: {reading.pending.join(' · ')}. A leaf with no
                    live index is not placed at a default.
                </p>
            ) : null}
        </div>
    );
}
