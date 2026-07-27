/**
 * Coordinate: M' shell-0 (accessibility contract — 30.T30.5)
 * Residency: Body/M/pratibimba-app/src/ui/accessibility.ts
 * Position (#n): the binding a11y law the carrier's chrome is held to
 * Actualises: the Track-30 accessibility contract as EXECUTABLE law rather
 *   than prose — the focus-ring minimum, the reduced-motion
 *   continuous-vs-discrete distinction (DR-WC-DL-4), the screen-reader text
 *   equivalents for the design-primitive shelf, the profile-tick announcement
 *   budget, the pause/scrub keybindings, and the WCAG 2.1 AA contrast
 *   thresholds with the ratio function the token test asserts with.
 * Public surface: FOCUS_RING_MIN_PX, WCAG_AA, contrastRatio, meetsContrast,
 *   MOTION_KIND, reducedMotionDurationMs, coordinateAriaLabel,
 *   cl42SignatureAriaLabel, tickAnnouncement, TICK_ANNOUNCE_MIN_INTERVAL_MS,
 *   createTickAnnouncer, A11Y_KEYBINDINGS.
 * Does NOT own: the colour tokens themselves (ui/tokens.ts + styles.css), the
 *   motion durations (ui/motionTokens.ts), coordinate family/archetype naming
 *   (ui/coordinateNames.ts), codon→amino-acid identity (the gateway lookup the
 *   CodonString primitive reads), I-Ching hexagram NAMES (M3 kernel law, no
 *   carrier-reachable surface — see ACCESSIBILITY-CONTRACT.md §3), or the
 *   verifier-authored symbolic-coordinate grammar (M0/Anuttara law, likewise).
 * Contract: [[ACCESSIBILITY-CONTRACT]]; rerun tranche [[30.T30.5]]; motion
 *   default per DR-WC-DL-4; contrast per WCAG 2.1 AA.
 */

import { decomposeCoordinate } from './coordinateNames';

/** Every interactive element renders a visible focus ring of at least this
 *  many CSS pixels. A border-colour change alone does not satisfy it. */
export const FOCUS_RING_MIN_PX = 2;

/** WCAG 2.1 AA minimum contrast ratios. Large text = >= 18px, or >= 14px bold. */
export const WCAG_AA = Object.freeze({
    /** Body text against its background. */
    bodyText: 4.5,
    /** Large text against its background. */
    largeText: 3,
    /** UI components and graphical objects (borders, icons, chart marks). */
    uiComponent: 3
});

export type ContrastRole = keyof typeof WCAG_AA;

/** Parse `#rgb`, `#rrggbb`, or `#rrggbbaa` into 0..1 sRGB channels. An alpha
 *  channel is ignored: contrast is asserted against the composited colour, and
 *  the caller composites before asking. */
export function parseHex(hex: string): readonly [number, number, number] | null {
    const raw = hex.trim().replace(/^#/, '');
    const expanded =
        raw.length === 3 || raw.length === 4
            ? raw
                  .slice(0, 3)
                  .split('')
                  .map(channel => channel + channel)
                  .join('')
            : raw.length === 6 || raw.length === 8
                ? raw.slice(0, 6)
                : null;
    if (expanded === null || !/^[0-9a-fA-F]{6}$/.test(expanded)) {
        return null;
    }
    return [
        parseInt(expanded.slice(0, 2), 16) / 255,
        parseInt(expanded.slice(2, 4), 16) / 255,
        parseInt(expanded.slice(4, 6), 16) / 255
    ];
}

/** WCAG relative luminance (sRGB, the 0.03928 linearisation). */
export function relativeLuminance(hex: string): number | null {
    const channels = parseHex(hex);
    if (!channels) {
        return null;
    }
    const [r, g, b] = channels.map(channel =>
        channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio in [1, 21]. Null when either colour is unparseable —
 *  the caller must treat that as a failure to assert, never as a pass. */
export function contrastRatio(foreground: string, background: string): number | null {
    const first = relativeLuminance(foreground);
    const second = relativeLuminance(background);
    if (first === null || second === null) {
        return null;
    }
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
}

/** True only when the pair provably meets the AA threshold for its role. */
export function meetsContrast(
    foreground: string,
    background: string,
    role: ContrastRole = 'bodyText'
): boolean {
    const ratio = contrastRatio(foreground, background);
    return ratio !== null && ratio >= WCAG_AA[role];
}

/**
 * DR-WC-DL-4. The distinction that matters under `prefers-reduced-motion:
 * reduce`: CONTINUOUS motion communicates temporal flow and may simply stop
 * (slerp pauses, streamlines freeze at their last tick); DISCRETE motion
 * communicates a state CHANGE and must survive, collapsed to a snap, because
 * removing it removes the semantics of the transition itself.
 */
export type MotionKind = 'continuous' | 'discrete';

export const MOTION_KIND = Object.freeze({
    /** Tick choreography — the profile heartbeat's slerp. */
    profileTickSlerp: 'continuous',
    /** DR flow streamlines. */
    flowStreamline: 'continuous',
    /** Ambient cosmic drift. */
    ambientDrift: 'continuous',
    /** The lemniscate face inversion — a state change. */
    lemniscateToggle: 'discrete',
    /** Layout switch (daily-0-1 <-> ide-deep) — a state change. */
    layoutSwitch: 'discrete',
    /** Klein flip — a state change. */
    kleinFlip: 'discrete'
} as const satisfies Record<string, MotionKind>);

export type MotionChannel = keyof typeof MOTION_KIND;

/** The collapsed duration a discrete transition keeps under reduced motion. */
export const REDUCED_MOTION_SNAP_MS = 100;

/**
 * The duration a channel runs at, given the user's reduced-motion preference.
 * Continuous channels stop entirely (0); discrete channels snap but never
 * vanish — except a layout switch, which canon makes instantaneous.
 */
export function reducedMotionDurationMs(
    channel: MotionChannel,
    fullDurationMs: number,
    prefersReducedMotion: boolean
): number {
    if (!prefersReducedMotion) {
        return fullDurationMs;
    }
    if (MOTION_KIND[channel] === 'continuous') {
        return 0;
    }
    return channel === 'layoutSwitch' ? 0 : Math.min(REDUCED_MOTION_SNAP_MS, fullDurationMs);
}

/** Speak a coordinate's separators rather than letting a reader run them
 *  together: `M4-3` reads "M4 dash 3". */
function spokenCoordinate(coordinate: string): string {
    return coordinate
        .replace(/-/g, ' dash ')
        .replace(/\./g, ' dot ')
        .replace(/\//g, ' slash ')
        .replace(/'/g, ' prime')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Text equivalent for the `CoordinateString` primitive: the spoken coordinate,
 * then the family-tier name and the archetype it manifests — the naming
 * authority is `ui/coordinateNames.ts`, never re-derived here. A coordinate
 * outside the six families (a raw `#4`, a reflective `cpf`) keeps the spoken
 * form alone rather than being given a family it does not have.
 */
export function coordinateAriaLabel(coordinate: string): string {
    const spoken = spokenCoordinate(coordinate);
    const decomposed = decomposeCoordinate(coordinate);
    if (!decomposed) {
        return `Coordinate ${spoken}`;
    }
    return `${spoken}, ${decomposed.familyName.toLowerCase()} family, ${decomposed.archetypeName.toLowerCase()}`;
}

/** Text equivalent for the Cl(4,2) signature visual cue. */
export function cl42SignatureAriaLabel(signature: -1 | 1): string {
    return signature === -1
        ? 'signature minus one, cool indigo'
        : 'signature plus one, warm amber';
}

/** Profile-tick announcements are rate-limited to one per second: the
 *  heartbeat pulses at 1Hz and an unbudgeted `aria-live` region would read the
 *  clock aloud forever. */
export const TICK_ANNOUNCE_MIN_INTERVAL_MS = 1000;

export function tickAnnouncement(tick12: number): string {
    return `tick ${tick12} of 11`;
}

/**
 * A rate-limited announcer for the `aria-live="polite"` tick region. Returns
 * the text to announce, or null when the budget says stay silent. The clock is
 * passed in — this module reads no ambient time.
 */
export function createTickAnnouncer(
    minIntervalMs: number = TICK_ANNOUNCE_MIN_INTERVAL_MS
): (tick12: number, nowMs: number) => string | null {
    let lastAnnouncedAt: number | null = null;
    let lastTick: number | null = null;
    return (tick12, nowMs) => {
        if (tick12 === lastTick) {
            return null;
        }
        if (lastAnnouncedAt !== null && nowMs - lastAnnouncedAt < minIntervalMs) {
            return null;
        }
        lastAnnouncedAt = nowMs;
        lastTick = tick12;
        return tickAnnouncement(tick12);
    };
}

/** The keyboard contract over tick choreography (15.9 a11y note). Command ids
 *  are the carrier's registry ids; the chord is what the user presses. */
export const A11Y_KEYBINDINGS = Object.freeze([
    Object.freeze({ chord: 'space', command: 'a11y.tick.togglePause', label: 'Pause or resume tick choreography' }),
    Object.freeze({ chord: 'shift+left', command: 'a11y.tick.scrubBack', label: 'Scrub back one tick' }),
    Object.freeze({ chord: 'shift+right', command: 'a11y.tick.scrubForward', label: 'Scrub forward one tick' })
]);
