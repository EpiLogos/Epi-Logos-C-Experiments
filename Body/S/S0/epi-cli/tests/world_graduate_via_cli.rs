//! CCT-14 CLI parity — `epi world graduate` graduates a type-local entity
//! flat into `World/{Name}.md`, retains the type-local file as a MOC
//! pointer, and carries the ratified birth-codon forward unchanged
//! (DR-S5-ONE-1 + DR-WORLD-1).

use std::fs;
use std::path::PathBuf;

use epi_logos::gate::s1_hen;
use epi_logos::world::{dispatch as world_dispatch, WorldCmd};
use serde_json::{json, Value};

fn fixture_vault() -> PathBuf {
    let unique = format!(
        "epi-world-graduate-{}-{}",
        std::process::id(),
        uuid::Uuid::new_v4().simple()
    );
    let root = std::env::temp_dir().join(unique);
    fs::create_dir_all(&root).expect("create fixture vault root");
    root
}

#[test]
fn world_graduate_via_cli() {
    let vault = fixture_vault();
    // This test file is its own process: the env-based vault root stays
    // hermetic to this test binary.
    std::env::set_var("EPILOGOS_VAULT", &vault);

    // Run the earlier lifecycle through the shared handlers: capture →
    // classify → promote, landing a type-local entity with a ratified
    // codon.
    let vault_param = vault.to_string_lossy().to_string();
    let capture = s1_hen::entity_capture(&json!({
        "source": "Kairos Bell",
        "dayId": "10-07-2026",
        "vaultRoot": vault_param,
    }))
    .expect("capture succeeds");
    let candidate_path = capture["candidatePath"].as_str().unwrap().to_owned();
    let provisional_codon = capture["birthCodon"].as_u64().unwrap();

    s1_hen::entity_classify(&json!({
        "candidatePath": candidate_path,
        "cLayer": "C2",
        "vaultRoot": vault_param,
    }))
    .expect("classify succeeds");

    let promotion = s1_hen::entity_promote_to_type(&json!({
        "candidatePath": candidate_path,
        "vaultRoot": vault_param,
    }))
    .expect("promotion succeeds");
    assert_eq!(promotion["birthCodonState"], "ratified");
    assert_eq!(
        promotion["birthCodonTransition"],
        "birth_codon_provisional_ratified"
    );
    let type_path = format!("{}.md", promotion["targetTypePath"].as_str().unwrap());
    // Promotion moved the candidate out of the pool.
    assert!(!vault.join(&candidate_path).exists());
    assert!(vault.join(&type_path).exists());

    // Graduate via the CLI command surface.
    let out = world_dispatch(
        &WorldCmd::Graduate {
            type_path: type_path.clone(),
        },
        true,
    )
    .expect("epi world graduate succeeds");
    let receipt: Value = serde_json::from_str(&out).unwrap();
    assert_eq!(
        receipt["flatWorldTarget"],
        "Idea/Bimba/World/Kairos Bell.md"
    );
    assert_eq!(receipt["crystallisationState"], "crystallised_world_form");
    assert_eq!(receipt["birthCodonState"], "ratified");
    // The territory archetype is invariant across the whole lifecycle.
    assert_eq!(receipt["birthCodon"].as_u64().unwrap(), provisional_codon);

    // Flat World entity landed; type-local file retained as MOC pointer.
    let flat = fs::read_to_string(vault.join("Idea/Bimba/World/Kairos Bell.md")).unwrap();
    assert!(flat.contains("crystallisation_state: crystallised_world_form"));
    assert!(flat.contains(&format!("c_5_birth_codon: {provisional_codon}")));
    let pointer = fs::read_to_string(vault.join(&type_path)).unwrap();
    assert!(pointer.contains("Graduated to [[Kairos Bell]]"));

    // The graduated entity shows on the World review surface, filtered by
    // coordinate.
    let out = world_dispatch(
        &WorldCmd::ListEntities {
            coordinate: Some("C2".to_owned()),
        },
        true,
    )
    .expect("epi world list_entities succeeds");
    let list: Value = serde_json::from_str(&out).unwrap();
    let entries = list["entries"].as_array().unwrap();
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0]["state"], "graduated");
    assert_eq!(entries[0]["title"], "Kairos Bell");
    assert_eq!(entries[0]["birthCodonState"], "ratified");

    fs::remove_dir_all(&vault).ok();
}
