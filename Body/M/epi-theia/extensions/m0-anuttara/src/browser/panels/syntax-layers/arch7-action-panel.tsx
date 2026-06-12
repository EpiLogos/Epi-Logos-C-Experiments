import * as React from 'react';
import { SyntaxLayerFrame, SyntaxLayerPanelProps } from './shared';

export const Arch7ActionPanel: React.FC<SyntaxLayerPanelProps> = props => (
    <SyntaxLayerFrame
        {...props}
        layer="action"
        title="Archetype 7 - Acts of Siva syntax of action"
        subtitle="DIVINE_ACT_LUT routed rows"
        tableLabel="DIVINE_ACT_LUT"
        expectedRowCount={7}
    />
);

export type { SyntaxLayerPanelProps };
