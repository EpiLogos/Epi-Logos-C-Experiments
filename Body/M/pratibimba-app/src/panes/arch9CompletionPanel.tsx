/**
 * Coordinate: M' M0-0' (Arch 9 syntax panel, 21.T21.13)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): Paramesvara completion specialisation of the routing reader.
 * Actualises: the bussed 9-row VIRTUE syntax read with inline witness state.
 * Public surface: Arch9CompletionPanel.
 * Does NOT own: the VIRTUE_LUT, witness computation, or prompt law.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.13.
 */

import { M0SyntaxLayerReader, type SyntaxLayerPanelProps } from './M0SyntaxLayerReader';

export function Arch9CompletionPanel(props: SyntaxLayerPanelProps) {
    return (
        <M0SyntaxLayerReader
            {...props}
            heading="Paramesvara syntax of completion"
            syntaxLayer="completion"
            expectedRowCount={9}
            showVirtueWitness
        />
    );
}
