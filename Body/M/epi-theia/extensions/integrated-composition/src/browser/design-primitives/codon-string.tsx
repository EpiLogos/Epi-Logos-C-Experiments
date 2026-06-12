import * as React from 'react';

export interface CodonStringProps {
    readonly codon: number | string;
    readonly label?: string;
    readonly className?: string;
}

export const CodonString: React.FC<CodonStringProps> = ({ codon, label, className }) => {
    const normalized = typeof codon === 'number' ? codon.toString().padStart(2, '0') : codon;

    return (
        <span
            className={className ? `epilogos-codon-string ${className}` : 'epilogos-codon-string'}
            data-typography-token="epilogos.typography.mono.codon"
            data-codon={normalized}
            title={`Codon ${normalized}`}
            style={{
                fontSize: 'var(--theia-ui-font-size0)',
                fontFamily: 'var(--theia-monospace-font-family)',
                color: 'var(--theia-charts-blue)'
            }}
        >
            {label ?? `codon:${normalized}`}
        </span>
    );
};
