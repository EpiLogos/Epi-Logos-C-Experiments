use epi_s3_graphiti_runtime::{EpisodeAttrs, EpisodeInsert};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};

#[test]
fn episode_attrs_with_vak_carries_canonical_fields() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1/2)".into(),
        cfp: "CFP2".into(),
        cs: CsField {
            code: "CS3".into(),
            direction: CsDirection::Day,
        },
    };
    let attrs = EpisodeAttrs::with_vak(vak.clone());
    let serialised = serde_json::to_value(&attrs).expect("attrs serialise");

    assert_eq!(serialised["cpf"], "(4.0/1-4.4/5)");
    assert_eq!(serialised["ct"], serde_json::json!(["CT2"]));
    assert_eq!(serialised["cp"], "CP4.2");
    assert_eq!(serialised["cf"], "(0/1/2)");
    assert_eq!(serialised["cfp"], "CFP2");
    assert_eq!(serialised["cs_code"], "CS3");
    assert_eq!(serialised["cs_direction"], "Day");
}

#[test]
fn episode_attrs_with_vak_uses_primed_night_for_pratibimba_direction() {
    let vak = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT5".into()],
        cp: "CP4.5".into(),
        cf: "(5/0)".into(),
        cfp: "CFP3".into(),
        cs: CsField {
            code: "CS5".into(),
            direction: CsDirection::Night,
        },
    };
    let attrs = EpisodeAttrs::with_vak(vak);
    let serialised = serde_json::to_value(&attrs).unwrap();
    assert_eq!(serialised["cs_direction"], "Night'", "must use primed form");
}

#[test]
fn episode_attrs_default_is_empty() {
    let attrs = EpisodeAttrs::default();
    let serialised = serde_json::to_value(&attrs).unwrap();
    // Default attrs serialise to an empty object (no VAK fields).
    let obj = serialised.as_object().expect("attrs is a json object");
    assert!(obj.is_empty(), "default EpisodeAttrs has no fields, got: {:?}", obj);
}

#[test]
fn episode_insert_carries_vak_attrs_through_serialisation() {
    let vak = VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["CT0".into()],
        cp: "CP4.0".into(),
        cf: "(00/00)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: CsDirection::Day,
        },
    };
    let insert = EpisodeInsert {
        group_id: "session:test:main".into(),
        body: "test episode".into(),
        attrs: EpisodeAttrs::with_vak(vak),
    };
    let serialised = serde_json::to_value(&insert).unwrap();
    assert_eq!(serialised["group_id"], "session:test:main");
    assert_eq!(serialised["body"], "test episode");
    // VAK fields flattened into the attrs object at top level of attrs (not nested):
    assert_eq!(serialised["attrs"]["cf"], "(00/00)");
    assert_eq!(serialised["attrs"]["cpf"], "(00/00)");
    assert_eq!(serialised["attrs"]["cs_direction"], "Day");
}

#[test]
fn episode_insert_without_vak_still_serialises_with_empty_attrs() {
    let insert = EpisodeInsert {
        group_id: "session:no-vak:main".into(),
        body: "vakless episode".into(),
        attrs: EpisodeAttrs::default(),
    };
    let serialised = serde_json::to_value(&insert).unwrap();
    assert_eq!(serialised["group_id"], "session:no-vak:main");
    // attrs is an object with no fields.
    assert!(serialised["attrs"].as_object().unwrap().is_empty());
}
