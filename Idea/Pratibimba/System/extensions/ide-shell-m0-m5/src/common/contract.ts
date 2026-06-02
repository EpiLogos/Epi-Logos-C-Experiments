/**
 * IDE Shell M0/M5 contract surface — Track 05 T4.
 *
 * Per the dispatcher's well-known intent kinds (cross-layout-intent.ts),
 * the ide-shell-m0-m5 extension owns these contribution ids:
 *   - `canon-studio`          (open-canon-studio-file intent)
 *   - `bimba-graph`           (M0/M5 chrome graph viewer; intent-target only)
 *   - `agentic-control-room`  (Track 05 T8 host shell)
 *   - `evidence-panel`        (Track 05 T8 surface)
 *
 * Plus chrome surfaces that have no canonical intent yet but are part of the
 * deep IDE layout per IDE_DEEP_DESCRIPTOR.expectedWidgets:
 *   - `coordinate-tree`       (pratibimba.ide-shell.coordinate-tree)
 *   - `logos-atelier`         (pratibimba.ide-shell.logos-atelier)
 *   - `review-pane`           (pratibimba.ide-shell.review-pane)
 *
 * Widget ids align with the IDE_DEEP_DESCRIPTOR.expectedWidgets entries:
 *   pratibimba.ide-shell.bimba-graph-viewer
 *   pratibimba.ide-shell.canon-studio
 *   pratibimba.ide-shell.agentic-control-room
 *   pratibimba.ide-shell.coordinate-tree
 *   pratibimba.ide-shell.logos-atelier
 *   pratibimba.ide-shell.evidence-pane
 *   pratibimba.ide-shell.review-pane
 */

export const EXTENSION_ID = 'ide-shell-m0-m5' as const;

export const IDE_SHELL_WIDGET_IDS = {
    BIMBA_GRAPH_VIEWER: 'pratibimba.ide-shell.bimba-graph-viewer',
    CANON_STUDIO: 'pratibimba.ide-shell.canon-studio',
    AGENTIC_CONTROL_ROOM: 'pratibimba.ide-shell.agentic-control-room',
    COORDINATE_TREE: 'pratibimba.ide-shell.coordinate-tree',
    LOGOS_ATELIER: 'pratibimba.ide-shell.logos-atelier',
    EVIDENCE_PANE: 'pratibimba.ide-shell.evidence-pane',
    REVIEW_PANE: 'pratibimba.ide-shell.review-pane',
    AUTORESEARCH_PANE: 'pratibimba.ide-shell.autoresearch-pane'
} as const;

export const IDE_SHELL_INTENT_TARGETS = {
    /** Resolved as `pratibimba.ide-shell-m0-m5.canon-studio.open`. */
    CANON_STUDIO: 'canon-studio',
    /** Resolved as `pratibimba.ide-shell-m0-m5.bimba-graph.open`. */
    BIMBA_GRAPH: 'bimba-graph',
    /** Resolved as `pratibimba.ide-shell-m0-m5.agentic-control-room.open`. */
    AGENTIC_CONTROL_ROOM: 'agentic-control-room',
    /** Resolved as `pratibimba.ide-shell-m0-m5.evidence-panel.open`. */
    EVIDENCE_PANEL: 'evidence-panel'
} as const;

/**
 * Privacy classes the IDE shell forbids from any UI / state / event /
 * persistence pathway. The shell surfaces a hard refusal banner if a payload
 * carrying any of these classes ever reaches a widget.
 */
export const FORBIDDEN_PRIVACY_CLASSES = [
    'private',
    'protected',
    'restricted-graphiti-body',
    'protected-nara-body',
    'private-journal',
    'private-birth-data',
    'private-quaternion',
    'private-profile'
] as const;

export type ForbiddenPrivacyClass = (typeof FORBIDDEN_PRIVACY_CLASSES)[number];

/** Public-grade privacy classes the shell will surface. */
export const ALLOWED_PRIVACY_CLASSES = [
    'public',
    'safe-public-current-kernel-tick',
    'public_current_with_graph_provenance',
    'safe-public'
] as const;

export type AllowedPrivacyClass = (typeof ALLOWED_PRIVACY_CLASSES)[number];

/**
 * Privacy gate. Refuses any payload whose privacy class is in
 * FORBIDDEN_PRIVACY_CLASSES — used by every IDE Shell widget before it
 * commits a graph node, evidence record, review row, or Atelier exploration
 * to its render tree.
 *
 * Returns true if the payload is safe to surface.
 */
export function isPrivacySafe(privacyClass: string | null | undefined): boolean {
    if (privacyClass === null || privacyClass === undefined) {
        return true; // Unset is treated as public; gateway is the authority.
    }
    return !(FORBIDDEN_PRIVACY_CLASSES as readonly string[]).includes(privacyClass);
}
