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
