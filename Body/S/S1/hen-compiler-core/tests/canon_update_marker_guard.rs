// Track 40.4 — Hen promotion-time refusal of orphan canon-update markers.
//
// The Track-40 canon-update ledger is the ONLY legal source of
// `<!-- canon-update: CU-* -->` markers (ledger §Cross-reference discipline (d)):
// a World/Types write or canonical-spec edit that adds a marker with no
// corresponding validated-or-higher ledger row must be refused at promotion time.
//
// DR 40.4 (Decision C, 2026-07-13): Hen stays PURE — it has no dependency on the
// gateway/CanonUpdateRuntime and never parses the Track-40 markdown itself. The
// promotion caller, which already holds the runtime, supplies the validated-or-
// higher CU-id allowlist; Hen only enforces the invariant against it.

use std::collections::BTreeSet;

use epi_s1_hen_compiler_core::graph_promotion::{
    refuse_orphan_canon_update_markers, GraphPromotionIntent,
};

fn validated(ids: &[&str]) -> BTreeSet<String> {
    ids.iter().map(|s| (*s).to_owned()).collect()
}

#[test]
fn orphan_marker_is_refused_against_an_empty_ledger() {
    let markdown =
        "Body. <!-- canon-update: CU-IDENTITY-9 (landed 2026-07-13) -->";
    let err = refuse_orphan_canon_update_markers(markdown, &validated(&[])).unwrap_err();
    assert!(err.contains("CU-IDENTITY-9"), "error names the orphan id: {err}");
    assert!(
        err.contains("ledger is the only legal source"),
        "error cites the ledger-only law: {err}"
    );
}

#[test]
fn marker_backed_by_a_validated_row_passes() {
    let markdown =
        "Body. <!-- canon-update: CU-IDENTITY-1 (landed 2026-06-15) -->";
    refuse_orphan_canon_update_markers(markdown, &validated(&["CU-IDENTITY-1"]))
        .expect("a marker with a validated ledger row is legal");
}

#[test]
fn content_with_no_markers_always_passes() {
    let markdown = "A canon spec paragraph with no canon-update markers at all.";
    refuse_orphan_canon_update_markers(markdown, &validated(&[]))
        .expect("no markers means nothing to validate");
}

#[test]
fn mixed_markers_flag_only_the_unvalidated_ids() {
    let markdown = "\
        <!-- canon-update: CU-IDENTITY-1 (landed 2026-06-15) -->\n\
        <!-- canon-update: CU-FORM-9 (landed 2026-07-13) -->";
    let err =
        refuse_orphan_canon_update_markers(markdown, &validated(&["CU-IDENTITY-1"])).unwrap_err();
    assert!(err.contains("CU-FORM-9"), "names the orphan: {err}");
    assert!(
        !err.contains("CU-IDENTITY-1"),
        "does not flag the validated marker: {err}"
    );
}

// Promotion-time composition: a World/Types write carrying an orphan marker is
// refused before the intent is built; a validated one promotes normally.
#[test]
fn guarded_world_types_promotion_refuses_orphan_and_allows_validated() {
    let path = "Idea/Bimba/World/Types/Coordinates/C/C0/C0.md";

    let orphan_md =
        "---\ncoordinate: C0/T5\n---\nForm body. <!-- canon-update: CU-IDENTITY-9 (landed 2026-07-13) -->";
    assert!(
        GraphPromotionIntent::from_markdown_guarded(path, orphan_md, &validated(&[])).is_err(),
        "a promotion adding an unvalidated canon-update marker must be refused"
    );

    let validated_md =
        "---\ncoordinate: C0/T5\n---\nForm body. <!-- canon-update: CU-IDENTITY-1 (landed 2026-06-15) -->";
    let intent = GraphPromotionIntent::from_markdown_guarded(
        path,
        validated_md,
        &validated(&["CU-IDENTITY-1"]),
    )
    .expect("a promotion whose marker is validated proceeds");
    assert_eq!(intent.node.coordinate, "C0/T5");
}
