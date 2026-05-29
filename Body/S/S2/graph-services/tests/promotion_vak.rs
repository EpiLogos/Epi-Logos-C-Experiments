use epi_s2_graph_services::PromotionPlan;
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::Value;

fn make_vak(cpf: CpfState, cs_direction: CsDirection) -> VakAddress {
    VakAddress {
        cpf,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1/2)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: cs_direction,
        },
    }
}

#[test]
fn promotion_plan_carries_vak_properties() {
    let vak = make_vak(CpfState::Mechanistic, CsDirection::Day);
    let mut plan = PromotionPlan::new("S4.4'", "shard-spec").unwrap();
    plan.attach_vak_address(&vak);

    assert_eq!(
        plan.properties.get("cpf"),
        Some(&Value::String("(4.0/1-4.4/5)".into()))
    );
    assert_eq!(
        plan.properties.get("cf"),
        Some(&Value::String("(0/1/2)".into()))
    );
    assert_eq!(
        plan.properties.get("cp"),
        Some(&Value::String("CP4.2".into()))
    );
    assert_eq!(
        plan.properties.get("cfp"),
        Some(&Value::String("CFP0".into()))
    );
    assert_eq!(
        plan.properties.get("cs_code"),
        Some(&Value::String("CS1".into()))
    );
    assert_eq!(
        plan.properties.get("cs_direction"),
        Some(&Value::String("Day".into()))
    );
    // ct serializes as a JSON array, not a string
    assert_eq!(
        plan.properties.get("ct"),
        Some(&serde_json::json!(["CT2"]))
    );
}

#[test]
fn promotion_plan_emits_dialogical_cpf_literal() {
    let vak = make_vak(CpfState::Dialogical, CsDirection::Day);
    let mut plan = PromotionPlan::new("S4.4'", "shard-spec").unwrap();
    plan.attach_vak_address(&vak);

    assert_eq!(
        plan.properties.get("cpf"),
        Some(&Value::String("(00/00)".into()))
    );
}

#[test]
fn promotion_plan_preserves_primed_night_direction() {
    let vak = make_vak(CpfState::Mechanistic, CsDirection::Night);
    let mut plan = PromotionPlan::new("S4.4'", "shard-spec").unwrap();
    plan.attach_vak_address(&vak);

    assert_eq!(
        plan.properties.get("cs_direction"),
        Some(&Value::String("Night'".into()))
    );
}
