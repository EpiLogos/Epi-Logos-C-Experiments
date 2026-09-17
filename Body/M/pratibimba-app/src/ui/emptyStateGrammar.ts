/**
 * Coordinate: M' shell (per-Mn empty-state copy — Track 32.T32.6)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — the copy layer of the empty-state context frame
 * Actualises: the six per-Mn copy blocks of the 32.6 design-recon (spec
 *   :180-185), verbatim, split into the header / summary / hint the shared
 *   shape renders. This module is PURE — no React, no store — so the copy and
 *   the contributor chains stay testable without a DOM and readable by
 *   `scripts/lint-empty-state-registry.mjs`, which parses this file's AST.
 *
 *   `mount` is not decoration. A registration whose declared surface never
 *   renders it is a registered-but-unfired seam, which is precisely what this
 *   plan set exists to stop, so the lint holds every entry to a real
 *   `<MExtensionEmptyState>` site in the named file — and holds every site to
 *   an entry here.
 *
 *   Contributor binding keys: real carrier bindings wherever the surface has
 *   one (`s2.graph.node`, `s2.parashaktiCorrespondences`, `m1.paramasiva`,
 *   `m3.inspectors`, `s1.vault.read_file`, `s4.khora.session_start`,
 *   `s5.review.inbox`, `s4.mediation.route`), and the spec's OWN chain names
 *   where the spec names the chain (M2: "M1 → audio_bus → cymatic_field").
 *   An unreported key classifies `bridge_unavailable` — the honest read, per
 *   `classifyReadiness`: the bridge has not spoken about it.
 * Public surface: MExtensionEmptyStateCopy, M_EMPTY_STATE_GRAMMAR,
 *   M_EMPTY_STATE_EXTENSION_IDS, emptyStateCopyFor.
 * Does NOT own: the registry contract (ui/emptyStateRegistry), the components
 *   (ui/mExtensionEmptyStates.tsx), the target ledger
 *   (commands/crossLayoutIntent), or the nine-id taxonomy (ui/bridgeReadiness).
 * Contract: rerun tranche [[32.T32.6]] spec lines 175-207.
 */

import type { EmptyStateContributor } from './emptyStateRegistry';

/** One M-family surface's copy block plus the producers it waits on. */
export interface MExtensionEmptyStateCopy {
    readonly extensionId: string;
    /** A contribution id declared in `CROSS_LAYOUT_INTENT_TARGETS`. */
    readonly viewId: string;
    readonly header: string;
    readonly summary: string;
    readonly hint: string;
    readonly family: string;
    readonly contributors: readonly EmptyStateContributor[];
    /** The carrier surface that renders this empty state, `src`-relative. */
    readonly mount: string;
}

/**
 * The six. One per M-family extension, keyed to a declared contribution.
 *
 * Copy is the spec's, verbatim; the split into header / summary / hint follows
 * the spec's own "<title>. Body: <…>" shape.
 */
export const M_EMPTY_STATE_GRAMMAR: readonly MExtensionEmptyStateCopy[] = Object.freeze([
    Object.freeze({
        extensionId: 'm0-anuttara',
        viewId: 'language',
        header: 'Anuttara waits — the implicate ground.',
        summary: 'The language map is not yet populated. The bimba graph is still binding.',
        hint: "Onboarding hint: begin a session to thread the first inscription into Anuttara's quiet.",
        family: 'M',
        contributors: Object.freeze([
            Object.freeze({ bindingKey: 's2.graph.node', label: 'Bimba graph node' }),
            Object.freeze({ bindingKey: 's2.graph.query', label: 'Anuttara language map' })
        ]) as readonly EmptyStateContributor[],
        mount: 'panes/M0LanguageReaderPanel.tsx'
    }),
    Object.freeze({
        extensionId: 'm1-paramasiva',
        viewId: 'playedTorus',
        header: 'K² torus rests — profile-tick has not fired.',
        summary: 'The played torus comes alive when the first profile-tick advances.',
        hint: 'The K² surface renders; the vortex heatmap stays blocked until the bus carries a profile.',
        family: 'M',
        contributors: Object.freeze([
            Object.freeze({ bindingKey: 's3.subscription', label: 'Profile-tick subscription' }),
            Object.freeze({ bindingKey: 'm1.paramasiva.playedTorus', label: 'Ananda-vortex projection' })
        ]) as readonly EmptyStateContributor[],
        mount: 'panes/PlayedTorusPane.tsx'
    }),
    Object.freeze({
        extensionId: 'm2-parashakti',
        viewId: 'cymatic',
        header: 'Cymatic surface unmodulated — awaiting M1 profile.',
        summary: 'The readiness chain is M1 → audio_bus → cymatic_field.',
        hint: 'The plate modulates when the M1 profile reaches the audio bus.',
        family: 'M',
        contributors: Object.freeze([
            Object.freeze({ bindingKey: 'm1.paramasiva', label: 'M1' }),
            Object.freeze({ bindingKey: 'm1.audio_bus', label: 'audio_bus' }),
            Object.freeze({ bindingKey: 'm2.cymatic_field', label: 'cymatic_field' }),
            Object.freeze({
                bindingKey: 's2.parashaktiCorrespondences',
                label: '3 outer planets dataset'
            })
        ]) as readonly EmptyStateContributor[],
        mount: 'panes/M2CorrespondencePane.tsx'
    }),
    Object.freeze({
        extensionId: 'm3-mahamaya',
        viewId: 'wheel',
        header: 'Cosmic clock at noon — awaiting first tick.',
        summary: 'The wheel begins to rotate when M1 first advances.',
        hint: '64 codons stand waiting.',
        family: 'M',
        contributors: Object.freeze([
            Object.freeze({ bindingKey: 'm1.paramasiva', label: 'M1 profile tick' }),
            Object.freeze({ bindingKey: 'm3.inspectors', label: 'M3 binary projection' })
        ]) as readonly EmptyStateContributor[],
        mount: 'panes/M3InspectorsPane.tsx'
    }),
    Object.freeze({
        extensionId: 'm4-nara',
        viewId: 'journal',
        header: 'Day not yet begun.',
        summary: "Today's day folder is fresh. No NOW.md, no inscriptions, no oracle.",
        hint: 'Begin where you are.',
        family: 'M',
        contributors: Object.freeze([
            Object.freeze({ bindingKey: 's1.vault.read_file', label: 'Vault day folder' }),
            Object.freeze({ bindingKey: 's4.khora.session_start', label: 'Khora session' })
        ]) as readonly EmptyStateContributor[],
        mount: 'panes/JournalTimelinePane.tsx'
    }),
    Object.freeze({
        extensionId: 'm5-epii',
        viewId: 'review',
        header: 'Atelier quiet.',
        summary: 'No pending review. No dispatch in flight.',
        hint: 'The atelier listens.',
        family: 'M',
        contributors: Object.freeze([
            Object.freeze({ bindingKey: 's5.review.inbox', label: 'Review queue' }),
            Object.freeze({ bindingKey: 's4.mediation.route', label: 'Dispatch history' })
        ]) as readonly EmptyStateContributor[],
        mount: 'panes/omni/ReviewBlocksPane.tsx'
    })
]);

/** The six M-family extension ids the grammar covers, in M0..M5 order. */
export const M_EMPTY_STATE_EXTENSION_IDS: readonly string[] = Object.freeze(
    M_EMPTY_STATE_GRAMMAR.map(entry => entry.extensionId)
);

export function emptyStateCopyFor(
    extensionId: string,
    viewId: string
): MExtensionEmptyStateCopy | undefined {
    return M_EMPTY_STATE_GRAMMAR.find(
        entry => entry.extensionId === extensionId && entry.viewId === viewId
    );
}
