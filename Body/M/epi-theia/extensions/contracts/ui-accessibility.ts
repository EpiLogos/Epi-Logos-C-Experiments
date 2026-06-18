export type UiAccessibilityFamilyLetter = 'p' | 's' | 't' | 'm' | 'l' | 'c';
export type UiAccessibilityArchetype = 0 | 1 | 2 | 3 | 4 | 5;
export type UiAccessibilitySignaturePolarity = -1 | 1;
export type UiAccessibilityMotionKind =
    | 'slerp-choreography'
    | 'dr-streamline'
    | 'lemniscate-toggle'
    | 'layout-switch';
export type UiAccessibilityMotionTreatment =
    | 'continuous-paused-at-last-tick'
    | 'continuous-frozen-at-last-tick'
    | 'discrete-100ms-snap'
    | 'discrete-instantaneous'
    | 'normal';
export type UiAccessibilityContrastUse = 'bodyText' | 'largeText' | 'uiComponent' | 'graphicalObject';

export interface UiAccessibilityFocusRing {
    readonly minOutlineWidthPx: number;
    readonly outlineStyle: 'solid';
    readonly outlineOffsetPx: number;
    readonly colourToken?: `epilogos.colour.family.${UiAccessibilityFamilyLetter}.${UiAccessibilityArchetype}`;
    readonly fallbackCssVariable: '--theia-focusBorder';
    readonly cssOutlineColor: string;
    readonly cssOutline: string;
}

export interface UiAccessibilityKeybinding {
    readonly command: string;
    readonly keybinding: 'space' | 'shift+left' | 'shift+right';
    readonly scope: 'global';
    readonly action: 'toggle-pause' | 'scrub-previous-tick' | 'scrub-next-tick';
    readonly bridgeCall?: 'bridge.requestScrubToTick';
}

export interface UiAccessibilityScreenReaderPrimitive {
    readonly primitive:
        | 'CoordinateString'
        | 'CodonString'
        | 'HexagramString'
        | 'SymbolicCoordinateString'
        | 'Cl42SignatureCue'
        | 'ProfileTickLiveRegion';
    readonly requiredAttribute: 'aria-label' | 'aria-live';
    readonly exampleVisual: string;
    readonly exampleTextEquivalent: string;
    readonly sourceFile?: string;
}

export interface UiAccessibilityContrastPair {
    readonly foreground: string;
    readonly background: string;
    readonly use: UiAccessibilityContrastUse;
}

export const UI_ACCESSIBILITY_CONTRACT_ID = '30.T30.5';
export const UI_ACCESSIBILITY_FOCUS_RING_MIN_OUTLINE_PX = 2;
export const UI_ACCESSIBILITY_FOCUS_RING_OUTLINE_OFFSET_PX = 2;
export const UI_ACCESSIBILITY_THEIA_FOCUS_FALLBACK = '--theia-focusBorder';
export const UI_ACCESSIBILITY_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const UI_ACCESSIBILITY_LEMNISCATE_REDUCED_DURATION_MS = 100;
export const UI_ACCESSIBILITY_LAYOUT_SWITCH_REDUCED_DURATION_MS = 0;
export const UI_ACCESSIBILITY_PROFILE_TICK_LIVE_REGION_RATE_LIMIT_MS = 1000;
export const UI_ACCESSIBILITY_WCAG_AA_BODY_TEXT_RATIO = 4.5;
export const UI_ACCESSIBILITY_WCAG_AA_LARGE_TEXT_RATIO = 3;
export const UI_ACCESSIBILITY_WCAG_AA_UI_COMPONENT_RATIO = 3;

export const UI_ACCESSIBILITY_INTERACTIVE_SELECTOR = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="switch"]',
    '[role="tab"]',
    '[tabindex]:not([tabindex="-1"])'
] as const;

export const UI_ACCESSIBILITY_SOURCE_GLOBS = Object.freeze([
    'Body/M/epi-theia/extensions/m-extension-runtime/src/browser/**/*.{ts,tsx,css}',
    'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/**/*.{ts,tsx,css}'
] as const);

export const UI_ACCESSIBILITY_PRIMITIVE_SOURCE_FILES = Object.freeze({
    CoordinateString:
        'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/coordinate-string.tsx',
    CodonString: 'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/codon-string.tsx',
    HexagramString:
        'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/hexagram-string.tsx',
    SymbolicCoordinateString:
        'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/symbolic-coordinate-string.tsx',
    LemniscateTransition:
        'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/lemniscate-transition.tsx',
    SlerpChoreographyClock:
        'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/slerp-choreography-clock.tsx'
} as const);

export const UI_ACCESSIBILITY_GLOBAL_KEYBINDINGS = Object.freeze([
    {
        command: 'epilogos.tickChoreography.togglePause',
        keybinding: 'space',
        scope: 'global',
        action: 'toggle-pause'
    },
    {
        command: 'epilogos.tickChoreography.scrubPrevious',
        keybinding: 'shift+left',
        scope: 'global',
        action: 'scrub-previous-tick',
        bridgeCall: 'bridge.requestScrubToTick'
    },
    {
        command: 'epilogos.tickChoreography.scrubNext',
        keybinding: 'shift+right',
        scope: 'global',
        action: 'scrub-next-tick',
        bridgeCall: 'bridge.requestScrubToTick'
    }
] as const satisfies readonly UiAccessibilityKeybinding[]);

export const UI_ACCESSIBILITY_REDUCED_MOTION_BEHAVIOUR = Object.freeze({
    mediaQuery: UI_ACCESSIBILITY_REDUCED_MOTION_QUERY,
    continuous: Object.freeze({
        'slerp-choreography': 'continuous-paused-at-last-tick',
        'dr-streamline': 'continuous-frozen-at-last-tick'
    }),
    discrete: Object.freeze({
        'lemniscate-toggle': {
            treatment: 'discrete-100ms-snap',
            durationMs: UI_ACCESSIBILITY_LEMNISCATE_REDUCED_DURATION_MS
        },
        'layout-switch': {
            treatment: 'discrete-instantaneous',
            durationMs: UI_ACCESSIBILITY_LAYOUT_SWITCH_REDUCED_DURATION_MS
        }
    })
} as const);

export const UI_ACCESSIBILITY_SCREEN_READER_PRIMITIVES = Object.freeze([
    {
        primitive: 'CoordinateString',
        requiredAttribute: 'aria-label',
        exampleVisual: '[[M4-3]]',
        exampleTextEquivalent: 'M4 dash 3, subsystem family, nara',
        sourceFile: UI_ACCESSIBILITY_PRIMITIVE_SOURCE_FILES.CoordinateString
    },
    {
        primitive: 'CodonString',
        requiredAttribute: 'aria-label',
        exampleVisual: 'AUG',
        exampleTextEquivalent: 'A U G, methionine, start codon',
        sourceFile: UI_ACCESSIBILITY_PRIMITIVE_SOURCE_FILES.CodonString
    },
    {
        primitive: 'HexagramString',
        requiredAttribute: 'aria-label',
        exampleVisual: '䷀',
        exampleTextEquivalent: 'Hexagram 1, the Creative, six solid lines',
        sourceFile: UI_ACCESSIBILITY_PRIMITIVE_SOURCE_FILES.HexagramString
    },
    {
        primitive: 'SymbolicCoordinateString',
        requiredAttribute: 'aria-label',
        exampleVisual: '#R0-0/1/A-T7-pending?',
        exampleTextEquivalent: 'R-virtue 0, lens 0 slash 1 axis A, action archetype 7, pending question',
        sourceFile: UI_ACCESSIBILITY_PRIMITIVE_SOURCE_FILES.SymbolicCoordinateString
    },
    {
        primitive: 'Cl42SignatureCue',
        requiredAttribute: 'aria-label',
        exampleVisual: 'signature -1',
        exampleTextEquivalent: 'signature minus one, cool indigo'
    },
    {
        primitive: 'ProfileTickLiveRegion',
        requiredAttribute: 'aria-live',
        exampleVisual: 'tick12 / 11',
        exampleTextEquivalent: 'polite live region, rate-limited to one announcement per second'
    }
] as const satisfies readonly UiAccessibilityScreenReaderPrimitive[]);

export const UI_ACCESSIBILITY_CONTRAST_THRESHOLDS = Object.freeze({
    bodyText: UI_ACCESSIBILITY_WCAG_AA_BODY_TEXT_RATIO,
    largeText: UI_ACCESSIBILITY_WCAG_AA_LARGE_TEXT_RATIO,
    uiComponent: UI_ACCESSIBILITY_WCAG_AA_UI_COMPONENT_RATIO,
    graphicalObject: UI_ACCESSIBILITY_WCAG_AA_UI_COMPONENT_RATIO
} as const satisfies Record<UiAccessibilityContrastUse, number>);

export const UI_ACCESSIBILITY_TEST_HARNESS = Object.freeze({
    focusRingPresence: {
        sourceGlobs: UI_ACCESSIBILITY_SOURCE_GLOBS,
        interactiveSelectors: UI_ACCESSIBILITY_INTERACTIVE_SELECTOR,
        requiredOutlineMinPx: UI_ACCESSIBILITY_FOCUS_RING_MIN_OUTLINE_PX,
        requiredFallbackCssVariable: UI_ACCESSIBILITY_THEIA_FOCUS_FALLBACK
    },
    reducedMotion: {
        mediaQuery: UI_ACCESSIBILITY_REDUCED_MOTION_QUERY,
        continuousMustPause: ['slerp-choreography', 'dr-streamline'],
        discreteMustRemain: ['lemniscate-toggle', 'layout-switch'],
        lemniscateReducedDurationMs: UI_ACCESSIBILITY_LEMNISCATE_REDUCED_DURATION_MS,
        layoutSwitchReducedDurationMs: UI_ACCESSIBILITY_LAYOUT_SWITCH_REDUCED_DURATION_MS
    },
    screenReaderSmoke: {
        primitives: UI_ACCESSIBILITY_SCREEN_READER_PRIMITIVES
    },
    keybindingRegistration: {
        keybindings: UI_ACCESSIBILITY_GLOBAL_KEYBINDINGS
    },
    contrastMinimum: {
        thresholds: UI_ACCESSIBILITY_CONTRAST_THRESHOLDS,
        tokenPairSource: 'Body/M/epi-theia/extensions/contracts/ui-colour-tokens.json'
    }
} as const);

const FAMILY_LABELS = Object.freeze({
    p: 'position family',
    s: 'stack family',
    t: 'thought family',
    m: 'subsystem family',
    l: 'lens family',
    c: 'category family'
} as const satisfies Record<UiAccessibilityFamilyLetter, string>);

const FAMILY_INDEX_NAMES = Object.freeze({
    p: ['ground', 'definition', 'operation', 'pattern', 'context', 'integration'],
    s: ['terminal', 'obsidian', 'graph', 'gateway', 'agent runtime', 'world boundary'],
    t: ['seed', 'spec', 'form', 'process', 'pattern', 'insight'],
    m: ['anuttara', 'paramasiva', 'parashakti', 'mahamaya', 'nara', 'epii'],
    l: ['literal', 'functional', 'structural', 'archetypal', 'paradigmatic', 'integral'],
    c: ['bimba', 'form', 'entity', 'process', 'type', 'pratibimba']
} as const satisfies Record<UiAccessibilityFamilyLetter, readonly string[]>);

const AMINO_ACID_NAMES = Object.freeze({
    alanine: 'alanine',
    arginine: 'arginine',
    asparagine: 'asparagine',
    asparticAcid: 'aspartic acid',
    cysteine: 'cysteine',
    glutamicAcid: 'glutamic acid',
    glutamine: 'glutamine',
    glycine: 'glycine',
    histidine: 'histidine',
    isoleucine: 'isoleucine',
    leucine: 'leucine',
    lysine: 'lysine',
    methionine: 'methionine',
    phenylalanine: 'phenylalanine',
    proline: 'proline',
    serine: 'serine',
    threonine: 'threonine',
    tryptophan: 'tryptophan',
    tyrosine: 'tyrosine',
    valine: 'valine',
    stop: 'stop codon'
} as const);

export const UI_ACCESSIBILITY_RNA_CODON_TEXT_EQUIVALENTS = Object.freeze({
    UUU: AMINO_ACID_NAMES.phenylalanine,
    UUC: AMINO_ACID_NAMES.phenylalanine,
    UUA: AMINO_ACID_NAMES.leucine,
    UUG: AMINO_ACID_NAMES.leucine,
    UCU: AMINO_ACID_NAMES.serine,
    UCC: AMINO_ACID_NAMES.serine,
    UCA: AMINO_ACID_NAMES.serine,
    UCG: AMINO_ACID_NAMES.serine,
    UAU: AMINO_ACID_NAMES.tyrosine,
    UAC: AMINO_ACID_NAMES.tyrosine,
    UAA: AMINO_ACID_NAMES.stop,
    UAG: AMINO_ACID_NAMES.stop,
    UGU: AMINO_ACID_NAMES.cysteine,
    UGC: AMINO_ACID_NAMES.cysteine,
    UGA: AMINO_ACID_NAMES.stop,
    UGG: AMINO_ACID_NAMES.tryptophan,
    CUU: AMINO_ACID_NAMES.leucine,
    CUC: AMINO_ACID_NAMES.leucine,
    CUA: AMINO_ACID_NAMES.leucine,
    CUG: AMINO_ACID_NAMES.leucine,
    CCU: AMINO_ACID_NAMES.proline,
    CCC: AMINO_ACID_NAMES.proline,
    CCA: AMINO_ACID_NAMES.proline,
    CCG: AMINO_ACID_NAMES.proline,
    CAU: AMINO_ACID_NAMES.histidine,
    CAC: AMINO_ACID_NAMES.histidine,
    CAA: AMINO_ACID_NAMES.glutamine,
    CAG: AMINO_ACID_NAMES.glutamine,
    CGU: AMINO_ACID_NAMES.arginine,
    CGC: AMINO_ACID_NAMES.arginine,
    CGA: AMINO_ACID_NAMES.arginine,
    CGG: AMINO_ACID_NAMES.arginine,
    AUU: AMINO_ACID_NAMES.isoleucine,
    AUC: AMINO_ACID_NAMES.isoleucine,
    AUA: AMINO_ACID_NAMES.isoleucine,
    AUG: AMINO_ACID_NAMES.methionine,
    ACU: AMINO_ACID_NAMES.threonine,
    ACC: AMINO_ACID_NAMES.threonine,
    ACA: AMINO_ACID_NAMES.threonine,
    ACG: AMINO_ACID_NAMES.threonine,
    AAU: AMINO_ACID_NAMES.asparagine,
    AAC: AMINO_ACID_NAMES.asparagine,
    AAA: AMINO_ACID_NAMES.lysine,
    AAG: AMINO_ACID_NAMES.lysine,
    AGU: AMINO_ACID_NAMES.serine,
    AGC: AMINO_ACID_NAMES.serine,
    AGA: AMINO_ACID_NAMES.arginine,
    AGG: AMINO_ACID_NAMES.arginine,
    GUU: AMINO_ACID_NAMES.valine,
    GUC: AMINO_ACID_NAMES.valine,
    GUA: AMINO_ACID_NAMES.valine,
    GUG: AMINO_ACID_NAMES.valine,
    GCU: AMINO_ACID_NAMES.alanine,
    GCC: AMINO_ACID_NAMES.alanine,
    GCA: AMINO_ACID_NAMES.alanine,
    GCG: AMINO_ACID_NAMES.alanine,
    GAU: AMINO_ACID_NAMES.asparticAcid,
    GAC: AMINO_ACID_NAMES.asparticAcid,
    GAA: AMINO_ACID_NAMES.glutamicAcid,
    GAG: AMINO_ACID_NAMES.glutamicAcid,
    GGU: AMINO_ACID_NAMES.glycine,
    GGC: AMINO_ACID_NAMES.glycine,
    GGA: AMINO_ACID_NAMES.glycine,
    GGG: AMINO_ACID_NAMES.glycine
} as const);

export const UI_ACCESSIBILITY_HEXAGRAM_TEXT_EQUIVALENTS = Object.freeze({
    '䷀': {
        number: 1,
        name: 'the Creative',
        lines: 'six solid lines'
    }
} as const);

export function focusRingContract(
    consumerFamily?: UiAccessibilityFamilyLetter | null,
    archetype?: UiAccessibilityArchetype | number | null
): UiAccessibilityFocusRing {
    const family = normalizeFamilyLetter(consumerFamily);
    const position = normalizeArchetype(archetype);
    const colourToken = family && typeof position === 'number'
        ? `epilogos.colour.family.${family}.${position}` as const
        : undefined;
    const cssOutlineColor = colourToken
        ? `var(--epilogos-colour-family-${family}-${position}, var(${UI_ACCESSIBILITY_THEIA_FOCUS_FALLBACK}))`
        : `var(${UI_ACCESSIBILITY_THEIA_FOCUS_FALLBACK})`;

    return Object.freeze({
        minOutlineWidthPx: UI_ACCESSIBILITY_FOCUS_RING_MIN_OUTLINE_PX,
        outlineStyle: 'solid',
        outlineOffsetPx: UI_ACCESSIBILITY_FOCUS_RING_OUTLINE_OFFSET_PX,
        colourToken,
        fallbackCssVariable: UI_ACCESSIBILITY_THEIA_FOCUS_FALLBACK,
        cssOutlineColor,
        cssOutline: `${UI_ACCESSIBILITY_FOCUS_RING_MIN_OUTLINE_PX}px solid ${cssOutlineColor}`
    });
}

export function focusRingCssRule(
    consumerFamily?: UiAccessibilityFamilyLetter | null,
    archetype?: UiAccessibilityArchetype | number | null
): string {
    const ring = focusRingContract(consumerFamily, archetype);
    return `${UI_ACCESSIBILITY_INTERACTIVE_SELECTOR.join(', ')}:focus-visible { outline: ${ring.cssOutline}; outline-offset: ${ring.outlineOffsetPx}px; }`;
}

export function resolveReducedMotionTreatment(
    kind: UiAccessibilityMotionKind,
    prefersReducedMotion: boolean
): UiAccessibilityMotionTreatment {
    if (!prefersReducedMotion) {
        return 'normal';
    }
    if (kind === 'slerp-choreography') {
        return 'continuous-paused-at-last-tick';
    }
    if (kind === 'dr-streamline') {
        return 'continuous-frozen-at-last-tick';
    }
    if (kind === 'lemniscate-toggle') {
        return 'discrete-100ms-snap';
    }
    return 'discrete-instantaneous';
}

export function reducedMotionDurationMs(kind: UiAccessibilityMotionKind, normalDurationMs: number): number {
    if (kind === 'lemniscate-toggle') {
        return UI_ACCESSIBILITY_LEMNISCATE_REDUCED_DURATION_MS;
    }
    if (kind === 'layout-switch') {
        return UI_ACCESSIBILITY_LAYOUT_SWITCH_REDUCED_DURATION_MS;
    }
    return normalDurationMs;
}

export function formatCoordinateAriaLabel(wikilinkTarget: string): string {
    const normalized = wikilinkTarget.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
    const target = normalized.split('|')[0]?.trim() ?? normalized;
    const match = /^([PSTMLC])(\d)(?:[-']?(\d))?/i.exec(target);
    if (!match) {
        return target.replace(/-/g, ' dash ').replace(/\//g, ' slash ').replace(/\s+/g, ' ').trim();
    }

    const family = match[1].toLowerCase() as UiAccessibilityFamilyLetter;
    const familyIndex = normalizeArchetype(Number.parseInt(match[2], 10)) ?? 0;
    const childIndex = match[3] === undefined ? undefined : Number.parseInt(match[3], 10);
    const coordinateText = `${match[1].toUpperCase()}${familyIndex}${childIndex === undefined ? '' : ` dash ${childIndex}`}`;
    const familyLabel = FAMILY_LABELS[family];
    const familyTierName = FAMILY_INDEX_NAMES[family][familyIndex];
    return `${coordinateText}, ${familyLabel}, ${familyTierName}`;
}

export function formatCodonAriaLabel(codon: string): string {
    const normalized = normalizeRnaCodon(codon);
    const aminoAcid = UI_ACCESSIBILITY_RNA_CODON_TEXT_EQUIVALENTS[
        normalized as keyof typeof UI_ACCESSIBILITY_RNA_CODON_TEXT_EQUIVALENTS
    ];
    if (!aminoAcid) {
        throw new Error(`Unknown RNA codon: ${codon}`);
    }
    const suffix = normalized === 'AUG'
        ? ', start codon'
        : aminoAcid === AMINO_ACID_NAMES.stop
          ? ''
          : '';
    return `${normalized.split('').join(' ')}, ${aminoAcid}${suffix}`;
}

export function formatHexagramAriaLabel(
    hexagram: keyof typeof UI_ACCESSIBILITY_HEXAGRAM_TEXT_EQUIVALENTS | {
        readonly number: number;
        readonly name: string;
        readonly lines: string;
    }
): string {
    const equivalent = typeof hexagram === 'string'
        ? UI_ACCESSIBILITY_HEXAGRAM_TEXT_EQUIVALENTS[hexagram]
        : hexagram;
    if (!equivalent) {
        throw new Error(`Unknown hexagram text equivalent: ${String(hexagram)}`);
    }
    return `Hexagram ${equivalent.number}, ${equivalent.name}, ${equivalent.lines}`;
}

export function formatSymbolicCoordinateAriaLabel(symbolic: string): string {
    const normalized = symbolic.trim();
    if (normalized === '#R0-0/1/A-T7-pending?') {
        return 'R-virtue 0, lens 0 slash 1 axis A, action archetype 7, pending question';
    }

    const withoutHash = normalized.replace(/^#/, '');
    const parts = withoutHash.split('-');
    return parts
        .map(part => part
            .replace(/^R(\d+)$/i, 'R-virtue $1')
            .replace(/^([0-9]+)\/([0-9]+)$/i, 'lens $1 slash $2')
            .replace(/^([A-Z])$/i, 'axis $1')
            .replace(/^T(\d+)$/i, 'action archetype $1')
            .replace(/^pending\?$/i, 'pending question'))
        .join(', ');
}

export function formatCl42SignatureAriaLabel(signature: UiAccessibilitySignaturePolarity): string {
    return signature === -1
        ? 'signature minus one, cool indigo'
        : 'signature plus one, warm amber';
}

export function profileTickLiveAnnouncement(
    tick12: number,
    nowMs: number,
    lastAnnouncementMs: number | null | undefined
): string | null {
    if (lastAnnouncementMs !== null && lastAnnouncementMs !== undefined) {
        const elapsed = nowMs - lastAnnouncementMs;
        if (elapsed < UI_ACCESSIBILITY_PROFILE_TICK_LIVE_REGION_RATE_LIMIT_MS) {
            return null;
        }
    }
    return `${normalizeTick12(tick12)} / 11`;
}

export function scrubTickTarget(currentTick12: number, direction: 'previous' | 'next'): number {
    const tick = normalizeTick12(currentTick12);
    if (direction === 'previous') {
        return tick === 0 ? 11 : tick - 1;
    }
    return tick === 11 ? 0 : tick + 1;
}

export function contrastRatio(foreground: string, background: string): number {
    const foregroundLuminosity = relativeLuminance(foreground);
    const backgroundLuminosity = relativeLuminance(background);
    const lighter = Math.max(foregroundLuminosity, backgroundLuminosity);
    const darker = Math.min(foregroundLuminosity, backgroundLuminosity);
    return (lighter + 0.05) / (darker + 0.05);
}

export function minimumContrastRatio(use: UiAccessibilityContrastUse): number {
    return UI_ACCESSIBILITY_CONTRAST_THRESHOLDS[use];
}

export function passesWcagAaContrast(pair: UiAccessibilityContrastPair): boolean {
    return contrastRatio(pair.foreground, pair.background) >= minimumContrastRatio(pair.use);
}

function normalizeFamilyLetter(
    family: UiAccessibilityFamilyLetter | null | undefined
): UiAccessibilityFamilyLetter | undefined {
    return family ? family.toLowerCase() as UiAccessibilityFamilyLetter : undefined;
}

function normalizeArchetype(value: UiAccessibilityArchetype | number | null | undefined): UiAccessibilityArchetype | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }
    if (value <= 0) {
        return 0;
    }
    if (value >= 5) {
        return 5;
    }
    return Math.trunc(value) as UiAccessibilityArchetype;
}

function normalizeTick12(tick12: number): number {
    if (!Number.isFinite(tick12)) {
        return 0;
    }
    return ((Math.trunc(tick12) % 12) + 12) % 12;
}

function normalizeRnaCodon(codon: string): string {
    return codon.trim().toUpperCase().replace(/T/g, 'U');
}

function relativeLuminance(hex: string): number {
    const [red, green, blue] = parseHexColor(hex).map(channel => {
        const scaled = channel / 255;
        return scaled <= 0.03928
            ? scaled / 12.92
            : ((scaled + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function parseHexColor(hex: string): readonly [number, number, number] {
    const normalized = hex.trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        throw new Error(`Expected #rrggbb colour, received ${hex}`);
    }
    return [
        Number.parseInt(normalized.slice(0, 2), 16),
        Number.parseInt(normalized.slice(2, 4), 16),
        Number.parseInt(normalized.slice(4, 6), 16)
    ] as const;
}
