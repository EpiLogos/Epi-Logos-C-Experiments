import { renderToString } from 'katex';
import * as React from 'react';
export {
    CoordinateString,
    resolveCoordinateFamilyTint,
    resolveCoordinateFamilyTintParts
} from './coordinate-string';
export type {
    CoordinateArchetype,
    CoordinateFamilyLetter,
    CoordinateFamilyTintParts,
    CoordinateStringProps
} from './coordinate-string';

export type MathemeTypographyLevel =
    | 'heading.2'
    | 'matheme.block'
    | 'matheme.inline';

export interface TypographyTokenStyle {
    readonly tokenName: `epilogos.typography.${MathemeTypographyLevel | 'mono.coordinate'}`;
    readonly size: string;
    readonly weight: 400 | 600;
    readonly family: string;
}

const TYPOGRAPHY_STYLES: Readonly<Record<MathemeTypographyLevel | 'mono.coordinate', TypographyTokenStyle>> =
    Object.freeze({
        'heading.2': token('heading.2', 'var(--theia-ui-font-size2)', 600, 'var(--theia-ui-font-family)'),
        'matheme.block': token('matheme.block', 'var(--theia-ui-font-size2)', 600, 'var(--theia-ui-font-family)'),
        'matheme.inline': token('matheme.inline', 'var(--theia-ui-font-size1)', 400, 'var(--theia-ui-font-family)'),
        'mono.coordinate': token(
            'mono.coordinate',
            'var(--theia-ui-font-size0)',
            400,
            'var(--theia-monospace-font-family)'
        )
    });

export interface MathemeTokenProps {
    readonly tex: string;
    readonly ariaLabel: string;
    readonly level?: MathemeTypographyLevel;
    readonly displayMode?: boolean;
    readonly align?: 'left' | 'center';
}

export const MathemeToken: React.FC<MathemeTokenProps> = ({
    tex,
    ariaLabel,
    level = 'matheme.block',
    displayMode = level !== 'matheme.inline',
    align = displayMode ? 'center' : 'left'
}) => {
    const typography = TYPOGRAPHY_STYLES[level];
    const html = renderToString(tex, {
        displayMode,
        throwOnError: false,
        strict: 'warn',
        output: 'htmlAndMathml'
    });

    return (
        <span
            className={`epilogos-matheme-token epilogos-matheme-${level.replace('.', '-')}`}
            data-typography-token={typography.tokenName}
            aria-label={ariaLabel}
            role="img"
            style={{
                display: displayMode ? 'block' : 'inline-block',
                textAlign: align,
                fontSize: typography.size,
                fontWeight: typography.weight,
                fontFamily: typography.family
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

function token(
    name: MathemeTypographyLevel | 'mono.coordinate',
    size: string,
    weight: 400 | 600,
    family: string
): TypographyTokenStyle {
    return Object.freeze({
        tokenName: `epilogos.typography.${name}`,
        size,
        weight,
        family
    });
}
