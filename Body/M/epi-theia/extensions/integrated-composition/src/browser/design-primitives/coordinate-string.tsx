import * as React from 'react';

export interface CoordinateStringProps {
    readonly wikilinkTarget: string;
    readonly label?: string;
    readonly className?: string;
}

export const CoordinateString: React.FC<CoordinateStringProps> = ({ wikilinkTarget, label, className }) => {
    const coordinate = resolveCoordinateFamilyTintParts(wikilinkTarget);
    const text = label ?? wikilinkTarget;

    return (
        <span
            className={className ? `epilogos-coordinate-string ${className}` : 'epilogos-coordinate-string'}
            data-typography-token="epilogos.typography.mono.coordinate"
            data-family-letter={coordinate.familyLetter}
            data-family-letter-token={coordinate.familyLetterToken}
            data-archetype={coordinate.archetype}
            data-colour-token={coordinate.tokenName}
            title={wikilinkTarget}
            style={{
                color: coordinate.cssVar,
                fontSize: 'var(--theia-ui-font-size0)',
                fontWeight: 400,
                fontFamily: 'var(--theia-monospace-font-family)'
            }}
        >
            <CoordinateFamilyGlyph
                familyLetter={coordinate.familyLetter}
                iconName={`family-${coordinate.familyLetter}`}
            />
            {text}
        </span>
    );
};

export function resolveCoordinateFamilyTint(wikilinkTarget: string): string {
    return resolveCoordinateFamilyTintParts(wikilinkTarget).tokenName;
}

export type CoordinateFamilyLetter = 'p' | 's' | 't' | 'm' | 'l' | 'c';
export type CoordinateArchetype = 0 | 1 | 2 | 3 | 4 | 5;

export interface CoordinateFamilyTintParts {
    readonly familyLetter: CoordinateFamilyLetter;
    readonly familyLetterToken: `epilogos.family-letter.${CoordinateFamilyLetter}`;
    readonly archetype: CoordinateArchetype;
    readonly tokenName: `epilogos.colour.family.${CoordinateFamilyLetter}.${CoordinateArchetype}`;
    readonly cssVar: string;
}

export interface CoordinateFamilyGlyphProps {
    readonly familyLetter: CoordinateFamilyLetter;
    readonly iconName: `family-${CoordinateFamilyLetter}`;
}

export const CoordinateFamilyGlyph: React.FC<CoordinateFamilyGlyphProps> = ({ familyLetter, iconName }) => (
    <svg
        aria-hidden="true"
        className="epilogos-coordinate-family-glyph"
        data-family-letter-glyph={familyLetter}
        data-icon-name={iconName}
        viewBox="0 0 8 8"
        focusable="false"
        style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            marginRight: '4px',
            verticalAlign: '-1px',
            overflow: 'visible'
        }}
    >
        <path
            d={COORDINATE_FAMILY_GLYPH_PATHS[familyLetter]}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const COORDINATE_FAMILY_GLYPH_PATHS: Readonly<Record<CoordinateFamilyLetter, string>> = Object.freeze({
    p: 'M2 7V1h2.4a1.8 1.8 0 0 1 0 3.6H2',
    s: 'M6 1.6C4.4.6 2 .9 2 2.4c0 2.2 4 1.1 4 3.2C6 7.2 3.2 7.5 1.6 6.4',
    t: 'M1 1h6M4 1v6M2.6 7h2.8',
    m: 'M1.2 7V1l2.8 3.7L6.8 1v6',
    l: 'M2 1v6h4.8M2 5.2c1.2-.3 2.5-1.1 3.8-2.2',
    c: 'M6.4 1.7C4.2.2 1.4 1.6 1.4 4s2.8 3.8 5 2.3'
});

export function resolveCoordinateFamilyTintParts(wikilinkTarget: string): CoordinateFamilyTintParts {
    const normalized = wikilinkTarget.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
    const match = /(?:^|[/#|])([PSTMLC])\s*'?(\d)(?=$|[/#|:\s-])/i.exec(normalized);
    const familyLetter = ((match?.[1] ?? 'm').toLowerCase() as CoordinateFamilyLetter);
    const parsedArchetype = Number.parseInt(match?.[2] ?? '0', 10);
    const archetype = clampArchetype(parsedArchetype);
    const tokenName = `epilogos.colour.family.${familyLetter}.${archetype}` as const;

    return Object.freeze({
        familyLetter,
        familyLetterToken: `epilogos.family-letter.${familyLetter}`,
        archetype,
        tokenName,
        cssVar: `var(--epilogos-colour-family-${familyLetter}-${archetype})`
    });
}

function clampArchetype(value: number): CoordinateArchetype {
    if (value <= 0) {
        return 0;
    }
    if (value >= 5) {
        return 5;
    }
    return value as CoordinateArchetype;
}
