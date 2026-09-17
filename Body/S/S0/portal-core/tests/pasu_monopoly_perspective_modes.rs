use portal_core::{MonoPolyOperator, NaraFamilyRole, PerspectiveRole};

#[test]
fn mono_poly_operator_exports_all_contract_variants() {
    let variants = [
        MonoPolyOperator::Mono,
        MonoPolyOperator::Poly,
        MonoPolyOperator::ActuallyMany,
        MonoPolyOperator::PotentiallyOne,
        MonoPolyOperator::ActualisingOne,
        MonoPolyOperator::PotentiatingMany,
        MonoPolyOperator::MonoPoly,
    ];
    let rendered: Vec<String> = variants
        .iter()
        .map(|variant| {
            serde_json::to_value(variant)
                .expect("variant serializes")
                .as_str()
                .unwrap()
                .to_owned()
        })
        .collect();

    assert_eq!(
        rendered,
        [
            "Mono",
            "Poly",
            "ActuallyMany",
            "PotentiallyOne",
            "ActualisingOne",
            "PotentiatingMany",
            "MonoPoly"
        ]
    );
}

#[test]
fn perspective_and_nara_roles_are_not_collapsed_to_generic_relations() {
    let perspective_roles = [
        PerspectiveRole::FirstPerson,
        PerspectiveRole::SecondPerson,
        PerspectiveRole::FirstPersonPlural,
        PerspectiveRole::ThirdPerson,
        PerspectiveRole::CollectiveWe,
        PerspectiveRole::IntegralWeI,
    ];
    let nara_roles = [
        NaraFamilyRole::Father,
        NaraFamilyRole::Mother,
        NaraFamilyRole::Son,
        NaraFamilyRole::Daughter,
        NaraFamilyRole::Tao,
        NaraFamilyRole::IntegralConsciousness,
    ];

    let perspective_json: Vec<String> = perspective_roles
        .iter()
        .map(|role| {
            serde_json::to_value(role)
                .expect("role serializes")
                .as_str()
                .unwrap()
                .to_owned()
        })
        .collect();
    let nara_json: Vec<String> = nara_roles
        .iter()
        .map(|role| {
            serde_json::to_value(role)
                .expect("role serializes")
                .as_str()
                .unwrap()
                .to_owned()
        })
        .collect();

    assert_eq!(
        perspective_json,
        [
            "FirstPerson",
            "SecondPerson",
            "FirstPersonPlural",
            "ThirdPerson",
            "CollectiveWe",
            "IntegralWeI"
        ]
    );
    assert_eq!(
        nara_json,
        [
            "Father",
            "Mother",
            "Son",
            "Daughter",
            "Tao",
            "IntegralConsciousness"
        ]
    );
    assert!(!perspective_json.iter().any(|role| role == "EntityRelation"));
}
