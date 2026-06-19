export type UiIconCategory =
    | 'activity-bar-mode'
    | 'chrome-toggle'
    | 'transition-primitive'
    | 'mn-family'
    | 'family-letter';

export type UiIconSize = 16 | 24 | 32;

export type UiIconName =
    | 'coordinate-tree'
    | 'bimba-graph-viewer'
    | 'canon-studio'
    | 'backend-studio'
    | 'smart-connections'
    | 'coin-flip'
    | 'lemniscate'
    | 'family-m0-anuttara'
    | 'family-m1-paramasiva'
    | 'family-m2-parashakti'
    | 'family-m3-mahamaya'
    | 'family-m4-nara'
    | 'family-m5-epii'
    | 'family-p'
    | 'family-s'
    | 'family-t'
    | 'family-m'
    | 'family-l'
    | 'family-c';

export type FamilyLetterIconName = Extract<
    UiIconName,
    'family-p' | 'family-s' | 'family-t' | 'family-m' | 'family-l' | 'family-c'
>;

export interface UiIconDefinition {
    readonly name: UiIconName;
    readonly id: `pratibimba.icon.${UiIconName}`;
    readonly assetPath: `icons/${UiIconName}.svg`;
    readonly category: UiIconCategory;
    readonly label: string;
    readonly description: string;
    readonly custom: true;
    readonly codiconFallback: string;
}

export interface ActivityBarIconBinding {
    readonly modeId: string;
    readonly widgetId: string;
    readonly iconName: Extract<
        UiIconName,
        'coordinate-tree' | 'bimba-graph-viewer' | 'canon-studio' | 'backend-studio' | 'smart-connections'
    >;
    readonly iconId: UiIconDefinition['id'];
    readonly iconRef: string;
    readonly codiconFallback: string;
    readonly slot: 'widget.application-shell-left';
}

export interface UiIconFallbackMapping {
    readonly surface: string;
    readonly customIcon?: UiIconName;
    readonly codicon: string;
    readonly rationale: string;
}

export const UI_ICON_ASSET_BASE_PATH = 'Body/M/epi-theia/extensions/contracts/icons';
export const UI_ICON_SUPPORTED_SIZES: readonly UiIconSize[] = Object.freeze([16, 24, 32]);

export const UI_ICON_SET: readonly UiIconDefinition[] = Object.freeze([
    icon('coordinate-tree', 'activity-bar-mode', 'Coordinate Tree', 'Branching coordinate tree with M4-3 marker nodes.', 'list-tree'),
    icon('bimba-graph-viewer', 'activity-bar-mode', 'Bimba Graph Viewer', 'Graph, solar, and tree renderings converging into one mode glyph.', 'graph'),
    icon('canon-studio', 'activity-bar-mode', 'Canon Studio', 'Markdown text with a structured-marker glyph for canon editing.', 'book'),
    icon('backend-studio', 'activity-bar-mode', 'Backend Studio', 'LSP code brackets converging with a cog for Theia backend work.', 'server-process'),
    icon('smart-connections', 'activity-bar-mode', 'Smart Connections', 'Semantic links with a haloed relationship node.', 'circuit-board'),
    icon('coin-flip', 'chrome-toggle', '0/1 Coin Flip', 'Mid-flip 0/1 toggle coin showing both faces in one fold.', 'sync'),
    icon('lemniscate', 'transition-primitive', 'Lemniscate Transition', 'Figure-eight transition glyph with a visible #4 cross-binding anchor.', 'symbol-operator'),
    icon('family-m0-anuttara', 'mn-family', 'M0 Anuttara', 'Minimal void-recognition monoline family glyph.', 'circle-large-outline'),
    icon('family-m1-paramasiva', 'mn-family', 'M1 Paramasiva', 'Minimal Spanda pulse monoline family glyph.', 'pulse'),
    icon('family-m2-parashakti', 'mn-family', 'M2 Parashakti', 'Minimal cymatic vibration monoline family glyph.', 'radio-tower'),
    icon('family-m3-mahamaya', 'mn-family', 'M3 Mahamaya', 'Minimal wheel/codon monoline family glyph.', 'symbol-enum'),
    icon('family-m4-nara', 'mn-family', 'M4 Nara', 'Minimal vessel/personal monoline family glyph.', 'person'),
    icon('family-m5-epii', 'mn-family', 'M5 Epii', 'Minimal recursive atelier monoline family glyph.', 'references'),
    icon('family-p', 'family-letter', 'P Family', 'Inline position-family marker for CoordinateString.', 'primitive-square'),
    icon('family-s', 'family-letter', 'S Family', 'Inline stack-family marker for CoordinateString.', 'layers'),
    icon('family-t', 'family-letter', 'T Family', 'Inline thought-family marker for CoordinateString.', 'edit'),
    icon('family-m', 'family-letter', 'M Family', 'Inline subsystem-family marker for CoordinateString.', 'symbol-namespace'),
    icon('family-l', 'family-letter', 'L Family', 'Inline lens-family marker for CoordinateString.', 'eye'),
    icon('family-c', 'family-letter', 'C Family', 'Inline category-family marker for CoordinateString.', 'symbol-class')
]);

export const UI_ICON_BY_NAME: Readonly<Record<UiIconName, UiIconDefinition>> = Object.freeze(
    Object.fromEntries(UI_ICON_SET.map(entry => [entry.name, entry])) as Record<UiIconName, UiIconDefinition>
);

export const FAMILY_LETTER_ICON_BY_LETTER: Readonly<Record<'p' | 's' | 't' | 'm' | 'l' | 'c', FamilyLetterIconName>> =
    Object.freeze({
        p: 'family-p',
        s: 'family-s',
        t: 'family-t',
        m: 'family-m',
        l: 'family-l',
        c: 'family-c'
    });

export const ACTIVITY_BAR_ICON_BINDINGS: readonly ActivityBarIconBinding[] = Object.freeze([
    activityMode('pratibimba.activity-bar.coordinate-tree', 'pratibimba.coordinate-tree', 'coordinate-tree'),
    activityMode('pratibimba.activity-bar.bimba-graph-viewer', 'pratibimba.bimba-graph-viewer', 'bimba-graph-viewer'),
    activityMode('pratibimba.activity-bar.canon-studio', 'pratibimba.canon-studio', 'canon-studio'),
    activityMode('pratibimba.activity-bar.backend-studio', 'pratibimba.backend-studio', 'backend-studio'),
    activityMode('pratibimba.activity-bar.smart-connections', 'pratibimba.smart-connections-sidebar', 'smart-connections')
]);

export const CODICON_FALLBACK_MAPPINGS: readonly UiIconFallbackMapping[] = Object.freeze([
    fallback('coordinate tree activity-bar mode', 'coordinate-tree', 'list-tree', 'Theia tree/list fallback.'),
    fallback('Bimba graph viewer activity-bar mode', 'bimba-graph-viewer', 'graph', 'Theia graph fallback.'),
    fallback('Canon Studio activity-bar mode', 'canon-studio', 'book', 'Theia book/editor fallback.'),
    fallback('Backend Studio activity-bar mode', 'backend-studio', 'server-process', 'Theia backend/process fallback.'),
    fallback('Smart Connections activity-bar mode', 'smart-connections', 'circuit-board', 'Semantic network fallback.'),
    fallback('0/1 toggle title-bar action', 'coin-flip', 'sync', 'Toggle action fallback.'),
    fallback('LemniscateTransition default glyph', 'lemniscate', 'symbol-operator', 'Transition/operator fallback.'),
    fallback('non-custom command action', undefined, 'gear', 'Default command fallback for UI not in the custom set.'),
    fallback('non-custom navigation action', undefined, 'arrow-right', 'Default navigation fallback for UI not in the custom set.'),
    fallback('non-custom status/readiness action', undefined, 'pass', 'Default status fallback for UI not in the custom set.')
]);

export function resolveUiIconAssetPath(name: UiIconName): string {
    return `${UI_ICON_ASSET_BASE_PATH}/${UI_ICON_BY_NAME[name].assetPath.replace(/^icons\//, '')}`;
}

export function resolveUiIconHref(name: UiIconName, size: UiIconSize): string {
    if (!UI_ICON_SUPPORTED_SIZES.includes(size)) {
        throw new Error(`Unsupported icon size: ${size}`);
    }
    return `${UI_ICON_BY_NAME[name].assetPath}?size=${size}`;
}

function icon(
    name: UiIconName,
    category: UiIconCategory,
    label: string,
    description: string,
    codiconFallback: string
): UiIconDefinition {
    return Object.freeze({
        name,
        id: `pratibimba.icon.${name}`,
        assetPath: `icons/${name}.svg`,
        category,
        label,
        description,
        custom: true,
        codiconFallback
    });
}

function activityMode(
    modeId: ActivityBarIconBinding['modeId'],
    widgetId: ActivityBarIconBinding['widgetId'],
    iconName: ActivityBarIconBinding['iconName']
): ActivityBarIconBinding {
    const iconDefinition = UI_ICON_BY_NAME[iconName];
    return Object.freeze({
        modeId,
        widgetId,
        iconName,
        iconId: iconDefinition.id,
        iconRef: `$(${iconDefinition.id})`,
        codiconFallback: `$(${iconDefinition.codiconFallback})`,
        slot: 'widget.application-shell-left'
    });
}

function fallback(
    surface: string,
    customIcon: UiIconFallbackMapping['customIcon'],
    codicon: string,
    rationale: string
): UiIconFallbackMapping {
    return Object.freeze({ surface, customIcon, codicon, rationale });
}
