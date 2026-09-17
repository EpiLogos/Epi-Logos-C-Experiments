/**
 * Coordinate: M' M0-0' (Arch 5 syntax panel, 21.T21.13)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): Mono-Poly relationship specialisation of the routing reader.
 * Actualises: the bussed 7-row MONOPOLY syntax read.
 * Public surface: Arch5RelationshipPanel.
 * Does NOT own: the MONOPOLY_LUT or prompt law.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.13.
 */

import { M0SyntaxLayerReader, type SyntaxLayerPanelProps } from './M0SyntaxLayerReader';

export function Arch5RelationshipPanel(props: SyntaxLayerPanelProps) {
    return <M0SyntaxLayerReader {...props} heading="Mono-Poly syntax of relationship" syntaxLayer="relationship" expectedRowCount={7} />;
}
