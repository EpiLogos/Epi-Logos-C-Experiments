export type UiTypographyLevelName =
    | 'heading.1'
    | 'heading.2'
    | 'heading.3'
    | 'heading.4'
    | 'body.base'
    | 'body.small'
    | 'caption'
    | 'mono.default'
    | 'mono.coordinate'
    | 'mono.codon'
    | 'mono.hexagram'
    | 'matheme.block'
    | 'matheme.inline';

export interface UiTypographyLevel {
    readonly name: UiTypographyLevelName;
    readonly tokenName: `epilogos.typography.${UiTypographyLevelName}`;
    readonly size: string;
    readonly weight: 400 | 600;
    readonly family: string;
    readonly useCase: string;
}

export const UI_TYPOGRAPHY_LEVEL_NAMES: readonly UiTypographyLevelName[] = Object.freeze([
    'heading.1',
    'heading.2',
    'heading.3',
    'heading.4',
    'body.base',
    'body.small',
    'caption',
    'mono.default',
    'mono.coordinate',
    'mono.codon',
    'mono.hexagram',
    'matheme.block',
    'matheme.inline'
]);

export const UI_TYPOGRAPHY_SCALE: Readonly<Record<UiTypographyLevelName, UiTypographyLevel>> =
    Object.freeze({
        'heading.1': level(
            'heading.1',
            'calc(var(--theia-ui-font-size3) * 1.5)',
            600,
            'var(--theia-ui-font-family)',
            "Page title, for example M5' Epii Atelier."
        ),
        'heading.2': level(
            'heading.2',
            'var(--theia-ui-font-size2)',
            600,
            'var(--theia-ui-font-family)',
            'Section title and block matheme prominence.'
        ),
        'heading.3': level(
            'heading.3',
            'var(--theia-ui-font-size1)',
            600,
            'var(--theia-ui-font-family)',
            'Sub-section or card title.'
        ),
        'heading.4': level(
            'heading.4',
            'var(--theia-ui-font-size0)',
            600,
            'var(--theia-ui-font-family)',
            'Micro-section or chip label group.'
        ),
        'body.base': level(
            'body.base',
            'var(--theia-ui-font-size1)',
            400,
            'var(--theia-ui-font-family)',
            'Default body text.'
        ),
        'body.small': level(
            'body.small',
            'var(--theia-ui-font-size0)',
            400,
            'var(--theia-ui-font-family)',
            'Secondary body copy.'
        ),
        caption: level(
            'caption',
            'var(--theia-ui-font-size)',
            400,
            'var(--theia-ui-font-family)',
            'Captions, hover tooltips, and aria-label-style asides.'
        ),
        'mono.default': level(
            'mono.default',
            'var(--theia-ui-font-size0)',
            400,
            'var(--theia-monospace-font-family)',
            'Generic code, handles, and hexadecimal values.'
        ),
        'mono.coordinate': level(
            'mono.coordinate',
            'var(--theia-ui-font-size0)',
            400,
            'var(--theia-monospace-font-family)',
            'Wikilink coordinate strings tinted by epilogos.colour.family.{p,s,t,m,l,c}.{0..5}.'
        ),
        'mono.codon': level(
            'mono.codon',
            'var(--theia-ui-font-size0)',
            400,
            'var(--theia-monospace-font-family)',
            'Codon strings with amino-acid badge appended by CodonString.'
        ),
        'mono.hexagram': level(
            'mono.hexagram',
            'var(--theia-ui-font-size2)',
            400,
            'var(--theia-monospace-font-family)',
            'Hexagram glyphs rendered by HexagramString with line-change overlay.'
        ),
        'matheme.block': level(
            'matheme.block',
            'var(--theia-ui-font-size2)',
            600,
            'var(--theia-ui-font-family)',
            'KaTeX block rendering for centred or left-flushed mathemes.'
        ),
        'matheme.inline': level(
            'matheme.inline',
            'var(--theia-ui-font-size1)',
            400,
            'var(--theia-ui-font-family)',
            'KaTeX inline rendering inside body-base text.'
        )
    });

export function getUiTypographyLevel(name: UiTypographyLevelName): UiTypographyLevel {
    return UI_TYPOGRAPHY_SCALE[name];
}

function level(
    name: UiTypographyLevelName,
    size: string,
    weight: 400 | 600,
    family: string,
    useCase: string
): UiTypographyLevel {
    return Object.freeze({
        name,
        tokenName: `epilogos.typography.${name}`,
        size,
        weight,
        family,
        useCase
    });
}
