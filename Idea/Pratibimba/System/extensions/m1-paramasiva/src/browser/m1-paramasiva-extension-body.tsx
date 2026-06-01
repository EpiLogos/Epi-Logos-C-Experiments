import * as React from 'react';
import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { buildM1ProfileClockModel } from '../common/clock-instrument';

export function M1ParamasivaExtensionBody(props: {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
}): React.ReactNode {
    if (!props.profile) {
        return (
            <section className="mext-widget-detail">
                <h3>Profile clock</h3>
                <p className="mext-widget-empty">
                    No MathemeHarmonicProfile available yet. The kernel-bridge is the sole
                    owner of this payload; this view will populate when the shared adapter
                    receives a generation update.
                </p>
            </section>
        );
    }

    const model = buildM1ProfileClockModel({
        profile: props.profile,
        readiness: props.readiness,
        context: props.context
    });
    const activeCells = model.landscape.cells.filter(cell => cell.active);

    return (
        <>
            <section className="mext-widget-detail">
                <h3>Profile clock</h3>
                <dl>
                    <dt>Generation</dt>
                    <dd>{model.generation}</dd>
                    <dt>Tick / degree</dt>
                    <dd>
                        tick12={display(model.tick12)} · degree720={display(model.degree720)}
                    </dd>
                    <dt>SU(2) / phase</dt>
                    <dd>
                        {display(model.su2Layer)} · {display(model.phase)}
                    </dd>
                    <dt>Helix / position</dt>
                    <dd>
                        {display(model.helix)} · position6={display(model.position6)}
                    </dd>
                    <dt>Ratio role</dt>
                    <dd>{display(model.ratioRole)}</dd>
                    <dt>Active lens-mode</dt>
                    <dd data-test="m1-active-lens-mode">
                        {model.lensMode
                            ? `${model.lensMode.label} · cell ${model.lensMode.cellIndex}`
                            : 'blocked: profile lensMode missing'}
                    </dd>
                    <dt>CF / VAK</dt>
                    <dd>
                        CF={display(model.cfVakProjection.contextFrame)} · agent=
                        {display(model.cfVakProjection.contextAgent)} · register=
                        {display(model.cfVakProjection.vakRegister)}
                    </dd>
                </dl>
            </section>

            <section className="mext-widget-detail">
                <h3>84-state landscape</h3>
                <p>
                    {model.landscape.totalCells === 84
                        ? '12 × 7 surface available from the profile pointer/context-frame payload.'
                        : `blocked: profile exposes ${display(model.landscape.totalCells)} cells`}
                </p>
                <p data-test="m1-landscape-active">
                    Active cell: {activeCells.map(cell => cell.label).join(', ') || 'none'}
                </p>
            </section>

            <section className="mext-widget-detail">
                <h3>Audio bus</h3>
                <dl>
                    <dt>Authority</dt>
                    <dd>{model.audioBus.authority}; M1 renders only, never owns pitch genesis.</dd>
                    <dt>audioOctet</dt>
                    <dd data-test="m1-audio-octet">
                        {model.audioBus.audioOctetHz?.join(', ') ?? 'blocked: profile field missing'}
                    </dd>
                    <dt>nodalQuartet</dt>
                    <dd data-test="m1-nodal-quartet">
                        {model.audioBus.nodalQuartet
                            ? JSON.stringify(model.audioBus.nodalQuartet)
                            : 'blocked: profile field missing'}
                    </dd>
                </dl>
            </section>

            <section className="mext-widget-detail">
                <h3>M1-5 topology</h3>
                <dl>
                    <dt>Single torus</dt>
                    <dd>
                        DOUBLE_COVER_DEG={display(model.topology.doubleCoverDeg)} · TORUS_GENUS=
                        {display(model.topology.torusGenus)}
                    </dd>
                    <dt>Hopf / K²</dt>
                    <dd>
                        {display(model.topology.hopfIdentity)} ·{' '}
                        {display(model.topology.k2TritoneCrossing)}
                    </dd>
                    <dt>Klein flip</dt>
                    <dd>{display(model.topology.m1OriginKleinFlip)}</dd>
                    <dt>Attribution</dt>
                    <dd>{model.topology.parentAttribution}</dd>
                    <dt>Prior ground</dt>
                    <dd>{model.topology.priorGround}</dd>
                    <dt>Downstream boundary</dt>
                    <dd>{model.topology.downstreamDoubleTorus}</dd>
                    <dt>Source</dt>
                    <dd>{model.topology.source}</dd>
                </dl>
            </section>

            <section className="mext-widget-detail">
                <h3>Relation walk readiness</h3>
                <p data-test="m1-relation-readiness">
                    {model.readiness.relationWalkReady
                        ? 'ready: typed S2 relation descriptors present'
                        : `blocked: ${model.readiness.blockers.join('; ')}`}
                </p>
            </section>
        </>
    );
}

function display(value: string | number | null): string {
    return value === null ? 'blocked' : String(value);
}
