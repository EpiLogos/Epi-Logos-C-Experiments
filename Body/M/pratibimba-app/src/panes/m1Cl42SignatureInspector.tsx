/**
 * Coordinate: M' M1' (Cl(4,2) signature inspector — Track 22.T22.3 per DR-FACE-7)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.cl42SignatureInspector` view body — the 2D
 *   analytical surface beneath the played-K² halo colour-binary (15.8 renders
 *   the halo on the 3D torus; THIS reads the per-position breakdown). Six-column
 *   position matrix P0..P5 with trig function + Cl(4,2) metric signature (the two
 *   implicate generators sin@P0 / cos@P5 carry −1; the four explicate derivatives
 *   carry +1), the halo colour-binary swatch from the single CL42_PALETTE token,
 *   the active-position highlight driven by the profile `position6`, the live
 *   `cl42SignatureAtPosition` bus readout, and the static 9/8 self-derivation
 *   chain with the current `tick12` epogdoon-step highlighted. Structural text is
 *   static matheme pedagogy (sanctioned per 22.3); every live value is a bus read.
 * Does NOT own: the halo genesis (portal-core cl42), the vortex parser
 *   (m1PlayedTorus.ts), the palette (ui/primitives.tsx). No CL42_BASIS /
 *   QL_TRIG_TABLE runtime-value fork lives here — the live signature rides the bus.
 */

import { useM1FaceState, cl42SignatureColour } from './m1DeepFaceData';

/** The matheme structure of the six QL positions (static pedagogy, not a
 *  runtime-value LUT): trig generator/derivative names and the definitional
 *  Cl(4,2) metric signature (−,+,+,+,+,−). The generators sin@P0 / cos@P5 are the
 *  two implicate poles; the live per-tick signature rides the bus. */
const QL_POSITION_STRUCTURE = [
    { p: 0, trig: 'sin', signature: -1, generator: true },
    { p: 1, trig: 'tan', signature: 1, generator: false },
    { p: 2, trig: 'sec', signature: 1, generator: false },
    { p: 3, trig: 'cot', signature: 1, generator: false },
    { p: 4, trig: 'csc', signature: 1, generator: false },
    { p: 5, trig: 'cos', signature: -1, generator: true }
] as const;

const TWELVEFOLD = 12;

function signatureGlyph(signature: number): string {
    return signature < 0 ? '−1' : '+1';
}

export function M1Cl42SignatureInspector() {
    const face = useM1FaceState();
    const position6 = face.position6;
    const tick12 = face.tick12;
    const busSignature = face.vortex?.cl42SignatureAtPosition ?? null;

    if (!face.vortex && position6 === null) {
        return (
            <section className="mext-widget-detail" data-testid="m1-cl42-inspector">
                <h3>Cl(4,2) signature</h3>
                <p className="mext-widget-empty" data-testid="m1-cl42-pending">
                    pending-ananda-vortex — the Cl(4,2) signature populates when the kernel
                    bridge delivers a MathemeHarmonicProfile carrying the vortex projection.
                </p>
            </section>
        );
    }

    return (
        <section className="mext-widget-detail" data-testid="m1-cl42-inspector">
            <h3>Cl(4,2) signature</h3>
            <div
                className="pane-toolbar"
                data-testid="m1-cl42-active"
                data-position6={position6 ?? ''}
                data-bus-signature={busSignature ?? ''}
            >
                active position P{position6 ?? '—'} · signature-at-position{' '}
                {busSignature === null ? 'pending' : signatureGlyph(busSignature)} (bus)
            </div>
            <table className="m1-cl42-matrix" data-testid="m1-cl42-matrix">
                <thead>
                    <tr>
                        <th scope="col">P</th>
                        <th scope="col">trig</th>
                        <th scope="col">sig</th>
                        <th scope="col">halo</th>
                        <th scope="col">role</th>
                    </tr>
                </thead>
                <tbody>
                    {QL_POSITION_STRUCTURE.map(cell => (
                        <tr
                            key={cell.p}
                            data-testid={`m1-cl42-position-${cell.p}`}
                            data-signature={cell.signature}
                            data-active={cell.p === position6 ? 'true' : 'false'}
                        >
                            <td>P{cell.p}</td>
                            <td>{cell.trig}</td>
                            <td>{signatureGlyph(cell.signature)}</td>
                            <td>
                                <span
                                    className="m1-cl42-swatch"
                                    data-testid={`m1-cl42-swatch-${cell.p}`}
                                    data-tone={cell.signature < 0 ? 'implicate' : 'explicate'}
                                    style={{
                                        display: 'inline-block',
                                        width: '0.9em',
                                        height: '0.9em',
                                        borderRadius: '2px',
                                        background: cl42SignatureColour(cell.signature)
                                    }}
                                    title={cell.signature < 0 ? 'implicate indigo' : 'explicate warm'}
                                />
                            </td>
                            <td>{cell.generator ? 'generator' : 'derivative'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="m1-cl42-derivation" data-testid="m1-cl42-98-derivation">
                <p data-testid="m1-cl42-98-octave">(4/3) × (3/2) = 2/1</p>
                <p data-testid="m1-cl42-98-epogdoon">(3/2) ÷ (4/3) = 9/8</p>
                <div className="spanda-stops" data-testid="m1-cl42-98-steps">
                    {Array.from({ length: TWELVEFOLD }, (_, step) => (
                        <span
                            key={step}
                            data-testid={`m1-cl42-98-step-${step}`}
                            data-active={step === tick12 ? 'true' : 'false'}
                            title={`epogdoon 9/8 step ${step}`}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
