import * as React from 'react';
import { SyntaxLayerFrame, SyntaxLayerPanelProps } from './shared';

export const Arch3SpeechPanel: React.FC<SyntaxLayerPanelProps> = props => (
    <SyntaxLayerFrame
        {...props}
        layer="speech"
        title="Archetype 3 - Vak syntax of speech"
        subtitle="ZODIACAL_LUT routed rows"
        tableLabel="ZODIACAL_LUT"
        expectedRowCount={12}
    />
);

export type { SyntaxLayerPanelProps };
