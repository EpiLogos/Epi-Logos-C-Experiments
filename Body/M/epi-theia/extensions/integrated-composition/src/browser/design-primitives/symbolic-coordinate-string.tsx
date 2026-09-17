import * as React from 'react';
import { CoordinateString, resolveCoordinateFamilyTintParts } from './coordinate-string';

export interface SymbolicCoordinateStringProps {
    readonly wikilinkTarget: string;
    readonly symbol: string;
    readonly label?: string;
    readonly className?: string;
}

export const SymbolicCoordinateString: React.FC<SymbolicCoordinateStringProps> = ({
    wikilinkTarget,
    symbol,
    label,
    className
}) => {
    const coordinate = resolveCoordinateFamilyTintParts(wikilinkTarget);

    return (
        <span
            className={className ? `epilogos-symbolic-coordinate-string ${className}` : 'epilogos-symbolic-coordinate-string'}
            data-family-letter={coordinate.familyLetter}
            data-family-letter-token={coordinate.familyLetterToken}
            data-symbol={symbol}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    color: coordinate.cssVar,
                    fontFamily: 'var(--theia-ui-font-family)',
                    fontWeight: 600
                }}
            >
                {symbol}
            </span>
            <CoordinateString wikilinkTarget={wikilinkTarget} label={label} />
        </span>
    );
};
