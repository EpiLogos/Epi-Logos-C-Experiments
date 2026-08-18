use epi_pratibimba_bridge::{
    call_epi_lib_kernel_tick, resolve_bimba_address, snapshot, NaraProtectedContext, PrimitiveStatus,
    EPI_SOURCE_REVISION, QL_PROVIDER_REVISION,
};
use portal_core::{kernel_tick_from_epogdoon, CpfState, CsDirection, CsField, VakAddress};
use serde_json::json;

#[test]
fn epi_lib_c_kernel_matches_portal_core_for_full_tick_cycle() {
    for sub_tick in 0u8..12 {
        let c = call_epi_lib_kernel_tick(7, sub_tick).expect("real C kernel call");
        let rust = kernel_tick_from_epogdoon(7, sub_tick);
        assert_eq!(c.cycle, rust.cycle);
        assert_eq!(c.sub_tick, rust.sub_tick);
        assert_eq!(c.phase, rust.phase as u8);
        assert_eq!(c.element, rust.element as u8);
        assert_eq!(c.position6, rust.position6);
        assert!((c.harmonic_ratio - rust.harmonic_ratio).abs() <= 1.0e-6);
        assert!(c.operation.contains("kernel_tick_from_epogdoon"));
    }
}

#[test]
fn snapshot_exposes_real_c_witness_harmonic_profile_and_canonical_ql_refs() {
    let observation = snapshot(0, 11, None, None).expect("primitive snapshot");
    assert_eq!(observation.status, PrimitiveStatus::Implemented);
    assert!(observation.kernel.parity);
    assert_eq!(observation.kernel.epi_lib.position6, 0);
    assert_eq!(observation.kernel.harmonic_profile.tick12, 0);
    assert!(observation.ql.ql_address.starts_with("qladdr:sixfold@"));
    assert_eq!(observation.ql.lens_ref, "mef:lens:L0@1");
    assert_eq!(observation.ql.sublens_ref, "mef:sublens:L0.0@1");
    assert_eq!(observation.ql.provider_revision, QL_PROVIDER_REVISION);
    assert!(!EPI_SOURCE_REVISION.is_empty());
}

#[test]
fn one_stable_bimba_address_resolves_to_nara_pratibimba() {
    let address = resolve_bimba_address("#-4").expect("Nara address");
    assert_eq!(address.canonical_ref, "epi:bimba:#-4/M4'");
    assert_eq!(address.domain_ref, "M4'");
    assert_eq!(address.agent_ref, "epi:agent:nara");
    assert!(resolve_bimba_address("#-99").is_none());
}

#[test]
fn canonical_world_identity_survives_reinitialisation() {
    let first = snapshot(0, 1, None, None).expect("first");
    let second = snapshot(5_000_000, 99, None, None).expect("second");
    assert_eq!(first.current_address, second.current_address);
    assert_eq!(first.roots, second.roots);
    assert_eq!(first.agents, second.agents);
}

#[test]
fn unavailable_faculties_are_not_promoted_to_fake_state() {
    let observation = snapshot(0, 0, None, None).expect("snapshot");
    assert_eq!(
        observation.vak.current_state.status,
        PrimitiveStatus::ProviderUnavailable
    );
    assert!(observation.vak.value.is_none());
    assert_eq!(observation.time.day_now.status, PrimitiveStatus::ProviderUnavailable);
    assert_eq!(observation.nara.status, PrimitiveStatus::ProviderUnavailable);
    assert_eq!(
        observation.nara.persistent_crud.status,
        PrimitiveStatus::ProviderUnavailable
    );
    assert_eq!(observation.mahamaya.status, PrimitiveStatus::Partial);
}

#[test]
fn real_vak_grammar_round_trips_all_six_fields() {
    let vak = VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["protected-personal".to_owned()],
        cp: "CP4.0-CP4.5".to_owned(),
        cf: "(4/5/0)".to_owned(),
        cfp: "CFP5:nested".to_owned(),
        cs: CsField {
            code: "CS:day".to_owned(),
            direction: CsDirection::Day,
        },
    };
    let observation = snapshot(12_000, 0, Some(vak.clone()), None).expect("VAK snapshot");
    assert_eq!(observation.vak.current_state.status, PrimitiveStatus::Implemented);
    assert_eq!(observation.vak.value, Some(vak.clone()));
    assert_eq!(observation.kernel.harmonic_profile.vak_address, Some(vak));
}

#[test]
fn protected_nara_handles_supply_day_now_without_private_body_surface() {
    let context = NaraProtectedContext {
        identity_ref: "nara:identity:blake3-redacted".to_owned(),
        personal_field_ref: Some("nara:personal-field:current".to_owned()),
        day_id: "DAY:2026-08-18".to_owned(),
        now_path: "NOW:23:20+01:00".to_owned(),
        session_key: "nara:session:test".to_owned(),
        episode_ref: Some("nara:episode:test".to_owned()),
        privacy_class: "protected-local-derived".to_owned(),
        source_class: "protected-nara-context".to_owned(),
        source_ref: Some("test:protected-provider".to_owned()),
    };
    let observation = snapshot(12_000, 0, None, Some(context)).expect("Nara snapshot");
    assert_eq!(observation.time.day_now.status, PrimitiveStatus::Implemented);
    assert_eq!(observation.time.day_id.as_deref(), Some("DAY:2026-08-18"));
    assert_eq!(observation.nara.status, PrimitiveStatus::Partial);

    let json = serde_json::to_value(&observation.nara).expect("serialize Nara floor");
    let text = json.to_string();
    assert!(!text.contains("journalBody"));
    assert!(!text.contains("rawBody"));
    assert!(!text.contains("private body"));
}

#[test]
fn nara_context_rejects_accidental_private_body_fields() {
    let attempted = json!({
        "identityRef": "nara:identity:test",
        "dayId": "DAY:test",
        "nowPath": "NOW:test",
        "sessionKey": "nara:session:test",
        "privacyClass": "protected-local-body",
        "sourceClass": "test",
        "body": "this must not cross the primitive bridge"
    });
    let parsed = serde_json::from_value::<NaraProtectedContext>(attempted);
    assert!(parsed.is_err(), "unknown private body field must fail closed");
}

#[test]
fn invalid_vak_context_frame_is_rejected() {
    let vak = VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["test".to_owned()],
        cp: "CP4".to_owned(),
        cf: "invented-frame".to_owned(),
        cfp: "CFP0".to_owned(),
        cs: CsField {
            code: "CS:test".to_owned(),
            direction: CsDirection::Day,
        },
    };
    let error = snapshot(0, 0, Some(vak), None).expect_err("invalid CF must fail");
    assert!(error.contains("not a canonical portal-core context frame"));
}
