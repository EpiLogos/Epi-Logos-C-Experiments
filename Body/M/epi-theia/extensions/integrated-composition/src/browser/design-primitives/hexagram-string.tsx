import * as React from 'react';

export interface HexagramStringProps {
    readonly hexagram: number | string;
    readonly label?: string;
    readonly className?: string;
}

export const HexagramString: React.FC<HexagramStringProps> = ({ hexagram, label, className }) => {
    const normalized = typeof hexagram === 'number' ? hexagram.toString().padStart(2, '0') : hexagram;

    return (
        <span
            className={className ? `epilogos-hexagram-string ${className}` : 'epilogos-hexagram-string'}
            data-typography-token="epilogos.typography.mono.hexagram"
            data-hexagram={normalized}
            title={`Hexagram ${normalized}`}
            style={{
                fontSize: 'var(--theia-ui-font-size0)',
                fontFamily: 'var(--theia-monospace-font-family)',
                color: 'var(--theia-charts-purple)'
            }}
        >
            {label ?? `hex:${normalized}`}
        </span>
    );
};
