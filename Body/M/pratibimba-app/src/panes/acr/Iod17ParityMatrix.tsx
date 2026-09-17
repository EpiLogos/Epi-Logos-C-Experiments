/**
 * Coordinate: M' M5' chrome (IOD-17 three-cell parity readout — 28.T28.5 (d))
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): the governance-primary half of DR-WC-IS-1 made visible.
 * Actualises: 28.9 (b)'s Review-pane pattern, rendered in the ACR because
 *   DR-WC-IS-1 makes this surface the IOD-17 capability-matrix source-of-truth.
 *   Three cells, one per independent declaration, each carrying the SOURCE it
 *   was read from — a green mark when it agrees with the other two, a red one
 *   when it does not — plus the aggregate `inParity` line and, on a violation,
 *   the spec's verbatim banner.
 * Public surface: Iod17ParityMatrix.
 * Does NOT own: the computation (`acrGovernance.ts::computeIod17Parity`).
 */

import { IOD17_PARITY_FACES, type Iod17ParityReadout } from './acrGovernance';

const FACE_LABEL: Readonly<Record<(typeof IOD17_PARITY_FACES)[number], string>> = Object.freeze({
    'capability-matrix': 'capability matrix',
    'agent-contract': 'agent contract',
    widget: 'widget'
});

export function Iod17ParityMatrix({ readout }: { readonly readout: Iod17ParityReadout }) {
    const disagreeing = new Set(readout.disagreements);
    return (
        <section
            className="acr-iod17"
            data-testid="iod17-parity-matrix"
            data-in-parity={readout.inParity ? 'true' : 'false'}
        >
            <h4>IOD-17 parity</h4>
            <ul className="acr-iod17-cells" role="list">
                {readout.cells.map(cell => {
                    const agrees = readout.inParity || !disagreeing.has(cell.face);
                    return (
                        <li
                            key={cell.face}
                            className={`acr-iod17-cell ${agrees ? 'acr-iod17-agrees' : 'acr-iod17-disagrees'}`}
                            data-testid={`iod17-cell-${cell.face}`}
                            data-state={cell.state}
                            data-agrees={agrees ? 'true' : 'false'}
                        >
                            <span className="acr-iod17-mark" aria-hidden="true">
                                {agrees ? '✓' : '✗'}
                            </span>
                            <span className="acr-iod17-face">{FACE_LABEL[cell.face]}</span>
                            <span className="acr-iod17-state">{cell.state}</span>
                            <span className="acr-iod17-source">{cell.source}</span>
                        </li>
                    );
                })}
            </ul>
            <p
                className={`acr-iod17-aggregate ${readout.inParity ? 'acr-iod17-agrees' : 'acr-iod17-disagrees'}`}
                data-testid="iod17-aggregate"
            >
                {readout.inParity ? 'in parity' : 'out of parity'}
            </p>
            {readout.violation ? (
                <p className="acr-iod17-violation" role="alert" data-testid="iod17-violation">
                    {readout.violation}
                </p>
            ) : null}
        </section>
    );
}
