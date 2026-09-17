use chrono::NaiveDate;
use portal_core::{
    run_m4_0_0_birthdate_encoding, IdentityLayerStatus, IdentityPacket, M4IdentityBranch,
};

#[test]
fn m4_0_0_birthdate_encoding_preserves_mef_evidence_for_frank_taylor() {
    let packet = IdentityPacket::birth(
        "Frank Taylor",
        NaiveDate::from_ymd_opt(1997, 9, 12).expect("valid fixture date"),
    );

    let output =
        run_m4_0_0_birthdate_encoding(packet).expect("worked example encodes deterministically");

    assert_eq!(output.layer_id, "M4-0-0");
    assert_eq!(output.layer_name, "Birthdate Encoding");

    let full_name = output
        .datum("full_name")
        .expect("full-name datum is part of the encoding");
    assert_eq!(full_name.raw_value, 51);
    assert_eq!(full_name.mod6, 3);
    assert_eq!(full_name.inverse, 2);
    assert_eq!(full_name.mod12, 3);
    assert_eq!(full_name.anchor_lens, "L1p");
    assert_eq!(full_name.direct_cell, "L1p.P3");
    assert!(full_name.direct_cell_meaning.contains("Thinking"));

    let birthdate = output
        .datum("date_digit_total")
        .expect("birthdate digit total is part of the encoding");
    assert_eq!(birthdate.raw_value, 38);
    assert_eq!(birthdate.vector, "P2->P3");
    assert_eq!(birthdate.direct_cell, "L1.P2");
    assert!(birthdate.direct_cell_meaning.contains("Efficient cause"));

    let synthesis = output
        .datum("name_date_synthesis")
        .expect("name/date synthesis remains traceable");
    assert_eq!(synthesis.raw_value, 89);
    assert_eq!(synthesis.mod6, 5);
    assert_eq!(synthesis.inverse, 0);
    assert_eq!(synthesis.mod12, 5);
    assert_eq!(synthesis.anchor_lens, "L2p");
    assert_eq!(synthesis.direct_cell, "L2p.P5");
    assert_eq!(
        synthesis.element_projection.position_element, "Salt",
        "direct L2' P5 hit must become a Salt cap, not a fabricated element"
    );
    assert!(synthesis.element_projection.direct_alchemical);
    assert_eq!(synthesis.related_lenses.tritone_mirror, "L5p");
    assert_eq!(synthesis.full_pass_cells.len(), 24);

    assert!(
        synthesis.contribution.elemental_score_delta.mineral_cap > 0.0,
        "direct L2' P5 evidence must contribute to the Salt cap"
    );
    assert!(
        output.elemental.caps.mineral_cap > 0.0,
        "Frank Taylor fixture should preserve the Salt cap named by the spec"
    );
    assert_unit(output.elemental.normalized_quaternion);
    assert!(
        output
            .music_handoff
            .motif_vectors
            .iter()
            .any(|vector| vector == "name_date_synthesis:P5->P0"),
        "music handoff keeps motif vectors instead of flattening the reading"
    );
}

#[test]
fn m4_0_0_birthdate_encoding_branch_marks_unsupplied_layers_pending() {
    let packet = IdentityPacket::birth(
        "Frank Taylor",
        NaiveDate::from_ymd_opt(1997, 9, 12).expect("valid fixture date"),
    );
    let birthdate = run_m4_0_0_birthdate_encoding(packet).expect("birthdate layer encodes first");

    let branch = M4IdentityBranch::from_birthdate_encoding(birthdate);

    assert_eq!(
        branch.layer("M4-0-0").expect("birthdate layer").status,
        IdentityLayerStatus::Resolved
    );
    assert_eq!(
        branch.layer("M4-0-1").expect("astrology layer").status,
        IdentityLayerStatus::Pending
    );
    assert_eq!(
        branch.layer("M4-0-2").expect("Jungian layer").status,
        IdentityLayerStatus::Pending
    );
    assert_eq!(
        branch.layer("M4-0-3").expect("Gene Keys layer").status,
        IdentityLayerStatus::Pending
    );
    assert_eq!(
        branch.layer("M4-0-4").expect("Human Design layer").status,
        IdentityLayerStatus::Pending
    );
    assert_eq!(
        branch.layer("M4-0-5").expect("quintessence layer").status,
        IdentityLayerStatus::Pending
    );

    for layer_id in ["M4-0-2", "M4-0-3", "M4-0-4"] {
        let layer = branch.layer(layer_id).expect("six-layer branch entry");
        assert!(
            layer.output_ref.is_none(),
            "{layer_id} must not fabricate output"
        );
        assert!(
            layer
                .pending_reason
                .as_deref()
                .unwrap_or("")
                .contains("not supplied"),
            "{layer_id} pending reason should name absent source evidence"
        );
    }

    let json = serde_json::to_string(&branch).expect("branch serializes");
    assert!(json.contains("\"pending\""));
    assert!(!json.contains("INTJ"));
    assert!(!json.contains("Manifestor"));
    assert!(!json.contains("activationSequence"));
}

fn assert_unit(q: [f32; 4]) {
    let norm = q
        .iter()
        .map(|component| component * component)
        .sum::<f32>()
        .sqrt();
    assert!((norm - 1.0).abs() < 1e-5, "quaternion norm was {norm}");
}
