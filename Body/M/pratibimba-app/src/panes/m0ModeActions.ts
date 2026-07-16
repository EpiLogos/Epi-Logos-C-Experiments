/**
 * Coordinate: M' M0' (reading/authoring mode-keyed action model — rerun 21.T21.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the mode-keyed M0 actions (WC-M0-13/14) — reading mode offers
 *   only the read-side readiness-evidence deposit; authoring mode adds the two
 *   further M5-routed actions plus the routed-write deep-links. Retarget of the
 *   frozen m0-anuttara `m0-inspector.ts.actions` + `mode-toggle.tsx` CONTRACT:
 *   the epi-theia `ide-shell-m0-m5/canonStudio|logosAtelier` plumbing is dead;
 *   the carrier's ONE routed-write path is M5 governed review (`m5-epii/review`
 *   → omniReview), so both authoring deep-links land there per DR-M0-1.
 * Public surface: M0SurfaceMode, M0RoutedAction, M0_ROUTED_ACTIONS,
 *   M0AuthoringDeepLink, M0_AUTHORING_DEEPLINKS, M0_DR_M0_1_BANNER,
 *   m0ActionsForMode.
 * Does NOT own: canon mutation (SC-2: every action pins mutatesGraphCanon
 *   false; Track 21 introduces NO direct canon-mutation path — routed-write via
 *   M5 governance only, DR-M0-1), the intent transport (commands/crossLayoutIntent),
 *   the M0 layer rail (M0LayerRail) or reader panels.
 */

export type M0SurfaceMode = 'reading' | 'authoring';

/** One M5-routed M0 action. SC-2: mutatesGraphCanon is pinned `false as const`. */
export interface M0RoutedAction {
    readonly id:
        | 'deposit-graph-readiness-evidence'
        | 'open-language-development-route'
        | 'request-anuttara-review';
    readonly label: string;
    /** Real carrier cross-layout intent target (extension family). */
    readonly requestedExtensionId: string;
    /** Real carrier cross-layout intent target (contribution). */
    readonly requestedContributionId: string;
    /** SC-2 / DR-M0-1: M0' never mutates canon; actions route, never write. */
    readonly mutatesGraphCanon: false;
    /** Reading mode exposes ONLY the actions flagged available-in-reading. */
    readonly availableInReading: boolean;
}

export const M0_ROUTED_ACTIONS: readonly M0RoutedAction[] = Object.freeze([
    Object.freeze({
        id: 'deposit-graph-readiness-evidence' as const,
        label: 'Deposit graph-readiness evidence',
        requestedExtensionId: 'm5-epii',
        requestedContributionId: 'evidence-deposit',
        mutatesGraphCanon: false as const,
        availableInReading: true
    }),
    Object.freeze({
        id: 'open-language-development-route' as const,
        label: 'Open language-development route',
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'language',
        mutatesGraphCanon: false as const,
        availableInReading: false
    }),
    Object.freeze({
        id: 'request-anuttara-review' as const,
        label: 'Request Anuttara review',
        requestedExtensionId: 'm5-epii',
        requestedContributionId: 'review',
        mutatesGraphCanon: false as const,
        availableInReading: false
    })
]);

/** An authoring-mode routed-write deep-link into M5 governance. */
export interface M0AuthoringDeepLink {
    readonly id: 'canonStudio' | 'logosAtelier';
    readonly label: string;
    readonly requestedExtensionId: string;
    readonly requestedContributionId: string;
}

/**
 * DR-M0-1: M0' has a SINGLE routed-write path — M5 governed review
 * (`m5-epii/review` → omniReview). Canon Studio (governed canon write) and
 * Logos Atelier (crystallisation) are both surfaced through it; the carrier has
 * no direct M0 canon-write target, by construction.
 */
export const M0_AUTHORING_DEEPLINKS: readonly M0AuthoringDeepLink[] = Object.freeze([
    Object.freeze({
        id: 'canonStudio' as const,
        label: 'Open in Canon Studio',
        requestedExtensionId: 'm5-epii',
        requestedContributionId: 'review'
    }),
    Object.freeze({
        id: 'logosAtelier' as const,
        label: 'Open in Logos Atelier',
        requestedExtensionId: 'm5-epii',
        requestedContributionId: 'review'
    })
]);

/** LAW: the authoring-mode provenance banner, rendered `provenance-state=derived`. */
export const M0_DR_M0_1_BANNER =
    "Per DR-M0-1: M0' never mutates canon. Routed-write via M5 atelier governance." as const;

/** The actions a given surface mode exposes. */
export function m0ActionsForMode(mode: M0SurfaceMode): readonly M0RoutedAction[] {
    return mode === 'reading'
        ? M0_ROUTED_ACTIONS.filter(action => action.availableInReading)
        : M0_ROUTED_ACTIONS;
}
