/**
 * Coordinate: M' M0-0' (Arch 7 syntax panel, 21.T21.13)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): Divine Action specialisation of the routing reader.
 * Actualises: the bussed 7-row DIVINE_ACT syntax read.
 * Public surface: Arch7ActionPanel.
 * Does NOT own: the DIVINE_ACT_LUT or prompt law.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.13.
 */

import { M0SyntaxLayerReader, type SyntaxLayerPanelProps } from './M0SyntaxLayerReader';

export function Arch7ActionPanel(props: SyntaxLayerPanelProps) {
    return <M0SyntaxLayerReader {...props} heading="Acts of Siva syntax of action" syntaxLayer="action" expectedRowCount={7} />;
}
