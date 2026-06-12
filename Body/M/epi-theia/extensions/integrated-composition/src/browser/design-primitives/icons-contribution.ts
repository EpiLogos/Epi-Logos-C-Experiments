export type PrimitiveIconName =
    | 'coordinate'
    | 'codon'
    | 'hexagram'
    | 'provenance'
    | 'pending'
    | 'blocked'
    | 'ready'
    | 'transition';

export interface PrimitiveIconContribution {
    readonly name: PrimitiveIconName;
    readonly codicon: string;
    readonly label: string;
}

export const DESIGN_PRIMITIVE_ICON_CONTRIBUTIONS: readonly PrimitiveIconContribution[] = Object.freeze([
    icon('coordinate', 'symbol-namespace', 'Coordinate'),
    icon('codon', 'symbol-enum', 'Codon'),
    icon('hexagram', 'symbol-constant', 'Hexagram'),
    icon('provenance', 'git-branch', 'Provenance'),
    icon('pending', 'watch', 'Pending'),
    icon('blocked', 'circle-slash', 'Blocked'),
    icon('ready', 'pass', 'Ready'),
    icon('transition', 'sync', 'Transition')
]);

function icon(name: PrimitiveIconName, codicon: string, label: string): PrimitiveIconContribution {
    return Object.freeze({ name, codicon, label });
}
