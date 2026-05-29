use epi_s2_graph_services::HybridRetriever;
use portal_core::{CpfState, CsDirection, CsField, VakAddress};

#[test]
fn hybrid_retriever_computes_vak_bias_weights_mechanistic() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1/2)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS2".into(),
            direction: CsDirection::Day,
        },
    };
    let weights = HybridRetriever::vak_bias_weights(&vak);

    // Canonical-prefix bias keys
    assert!(
        weights.get("cf").copied().unwrap_or(0.0) > 0.0,
        "cf weight present"
    );
    assert!(
        weights.get("cp").copied().unwrap_or(0.0) > 0.0,
        "cp weight present"
    );
    assert!(
        weights.get("ct").copied().unwrap_or(0.0) > 0.0,
        "ct weight present"
    );
    assert!(
        weights.get("cs_direction").copied().unwrap_or(0.0) > 0.0,
        "cs_direction weight present"
    );

    // CF is the strongest signal (frame-binding) — must outweigh CT
    assert!(
        weights.get("cf").copied().unwrap_or(0.0)
            >= weights.get("ct").copied().unwrap_or(0.0),
        "CF should be at least as strong as CT"
    );
}

#[test]
fn hybrid_retriever_carries_address_values_for_matching() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT3".into()],
        cp: "CP4.3".into(),
        cf: "(0/1/2/3)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS3".into(),
            direction: CsDirection::Night,
        },
    };
    let weights = HybridRetriever::vak_bias_weights(&vak);

    // The map also carries sentinel match-value entries so the caller
    // (Cypher generator / scorer) can read the target values without
    // re-passing VakAddress through every layer.
    assert!(weights.contains_key("__cf_value:(0/1/2/3)"));
    assert!(weights.contains_key("__cp_value:CP4.3"));
}

#[test]
fn hybrid_retriever_dialogical_returns_empty_weights() {
    // Dialogical mode → no VAK constraints to bias toward.
    let vak = VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec![],
        cp: "".into(),
        cf: "".into(),
        cfp: "".into(),
        cs: CsField {
            code: "".into(),
            direction: CsDirection::Day,
        },
    };
    let weights = HybridRetriever::vak_bias_weights(&vak);
    assert!(weights.is_empty(), "dialogical mode emits no bias weights");
}
