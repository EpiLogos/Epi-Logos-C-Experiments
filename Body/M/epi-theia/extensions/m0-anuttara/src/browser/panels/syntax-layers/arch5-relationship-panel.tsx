import * as React from 'react';
import { SyntaxLayerFrame, SyntaxLayerPanelProps } from './shared';

export const Arch5RelationshipPanel: React.FC<SyntaxLayerPanelProps> = props => (
    <SyntaxLayerFrame
        {...props}
        layer="relationship"
        title="Archetype 5 - Mono-Poly syntax of relationship"
        subtitle="MONOPOLY_LUT routed rows"
        tableLabel="MONOPOLY_LUT"
        expectedRowCount={7}
    />
);

export type { SyntaxLayerPanelProps };
