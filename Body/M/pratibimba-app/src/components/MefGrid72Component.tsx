/**
 * Coordinate: M' M2' (MEF 72-address matrix renderer — Track 23.T23.2)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M2' Layer A profile-tick reader.
 * Actualises: the 12-lens x 7-mode scaffold with its 12x6 active MEF overlay,
 *   tritone-pair connectors, bussed octet halo source, and Klein polarity.
 * Public surface: MefGrid72Component.
 * Does NOT own: MEF address law (portal-core / axisViews), profile production,
 *   glyph meanings, animation clocks, or correspondence LUTs.
 * Contract: [[M2'-SPEC]] and rerun tranche [[23.T23.2]].
 */

import type { ThirdSpandaRoutingAxisViews } from '../bridge/types';
import { decodeAxisAt } from '../engine/axisViews';

const LENS_COUNT = 12;
const MODE_COUNT = 7;
const ACTIVE_MODE_COUNT = 6;
const TRITONE_PAIRS: readonly (readonly [number, number])[] = [
    [0, 3],
    [1, 4],
    [2, 5],
    [6, 9],
    [7, 10],
    [8, 11]
];

type MefAxisView = ThirdSpandaRoutingAxisViews['mef'];

function activeAddress(mef: MefAxisView | null): number | null {
    if (
        !mef ||
        !Number.isInteger(mef.lens) ||
        !Number.isInteger(mef.position) ||
        mef.lens < 0 ||
        mef.lens >= LENS_COUNT ||
        mef.position < 0 ||
        mef.position >= ACTIVE_MODE_COUNT
    ) {
        return null;
    }
    return mef.lens * ACTIVE_MODE_COUNT + mef.position;
}

function haloForLens(lens: number, kleinFlip: boolean): 'warm' | 'cool' {
    const warm = lens < ACTIVE_MODE_COUNT;
    return warm !== kleinFlip ? 'warm' : 'cool';
}

function isOctet(value: readonly number[] | null): value is readonly number[] {
    return Array.isArray(value) && value.length === 8 && value.every(hz => Number.isFinite(hz));
}

export function MefGrid72Component({
    activeMef,
    audioOctet,
    kleinFlip
}: {
    readonly activeMef: MefAxisView | null;
    readonly audioOctet: readonly number[] | null;
    readonly kleinFlip: boolean;
}) {
    const active = activeAddress(activeMef);
    const activeHz = isOctet(audioOctet) ? audioOctet[0] : null;

    return (
        <section
            className="m2-mef-grid"
            data-testid="m2-mef-grid"
            data-active-address={active ?? ''}
            data-klein-flip={String(kleinFlip)}
            aria-label="MEF 72-address matrix"
        >
            <header className="m2-mef-grid-header">
                <h4>MEF matrix</h4>
                <span data-testid="m2-mef-grid-source">
                    thirdSpanda.m2.axisViews.mef · audio_octet[0]
                </span>
            </header>
            <svg className="m2-mef-grid-arcs" viewBox="0 0 12 7" aria-hidden="true">
                {TRITONE_PAIRS.map(([fromLens, toLens], index) => {
                    const bright =
                        activeMef !== null && (activeMef.lens === fromLens || activeMef.lens === toLens);
                    return (
                        <path
                            key={`${fromLens}-${toLens}`}
                            data-testid="m2-mef-tritone-arc"
                            data-arc-id={index}
                            data-bright={String(bright)}
                            id={`m2-mef-tritone-arc-${index}`}
                            d={`M${fromLens + 0.5} 1 Q${(fromLens + toLens) / 2 + 0.5} 6 ${toLens + 0.5} 1`}
                        />
                    );
                })}
            </svg>
            <div className="m2-mef-grid-cells" role="grid" aria-label="12 lens rows by 7 mode columns">
                {Array.from({ length: LENS_COUNT }, (_, lens) =>
                    Array.from({ length: MODE_COUNT }, (_, mode) => {
                        const isActiveMefCell = mode < ACTIVE_MODE_COUNT;
                        const address72 = isActiveMefCell ? lens * ACTIVE_MODE_COUNT + mode : null;
                        const decode = address72 === null ? null : decodeAxisAt(address72, 'mef');
                        const current = address72 === active;
                        const halo = haloForLens(lens, kleinFlip);
                        return (
                            <div
                                key={`${lens}-${mode}`}
                                className="m2-mef-grid-cell"
                                role="gridcell"
                                data-testid={`m2-mef-cell-${lens}-${mode}`}
                                data-active-mef={String(isActiveMefCell)}
                                data-lens={lens}
                                data-mode={mode}
                                data-address72={address72 ?? ''}
                                data-current={String(current)}
                                data-halo={halo}
                                data-halo-hz={current && activeHz !== null ? activeHz : ''}
                            >
                                <span className="m2-mef-grid-cell-address">
                                    {decode ? `L${decode.parts.lens} P${decode.parts.position}` : '—'}
                                </span>
                                <span className="m2-mef-grid-cell-mode">M{mode}</span>
                            </div>
                        );
                    })
                )}
            </div>
            {active === null ? (
                <p className="pane-message" data-testid="m2-mef-grid-pending">
                    awaiting third-Spanda MEF axis view — no active 72-address on the bus
                </p>
            ) : null}
        </section>
    );
}
