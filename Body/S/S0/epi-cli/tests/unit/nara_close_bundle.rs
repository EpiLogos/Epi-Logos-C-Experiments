//! Unit coverage for `gate::nara_close_bundle`.
//!
//! Kept outside `src/` so the S0 residency ratchet measures production law
//! while these tests retain private access through the path-mounted module.

use super::{
    aggregate_audio_octet, aggregate_m1_closure, persist_close_bundle, read_close_bundle,
    read_contemplation_object, AudioOctetTraversalAggregate, AudioOctetTraversalEvidence,
    ContemplateSessionCloseResponse, M1SessionClosureAggregate, M1SessionClosureEvidence,
    NaraSessionCloseReadRequest, NaraSessionCloseReadRequest as ReadRequest,
};
use epi_s3_gateway::dispatch::{
    ContemplationTripletOutput, EbmContemplationReading, LlmContemplationReading,
    ParsedAnuttaraSymbolicQuestion, PsycheAnchorCardReading, SymbolicRoundTrip,
    TritoneSquareCoherence, VerifierContemplationReading,
};
use std::fs;
use std::path::{Path, PathBuf};

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-nara-close-{name}-{}", std::process::id()));
    let _ = fs::remove_dir_all(&root);
    fs::create_dir_all(&root).expect("temp state root");
    root
}

fn contemplation_response(session_id: &str) -> ContemplateSessionCloseResponse {
    ContemplateSessionCloseResponse {
        method: "nara.contemplate_session_close".to_owned(),
        session_id: session_id.to_owned(),
        wisdom_delta: "delta".to_owned(),
        triplet: ContemplationTripletOutput {
            llm: LlmContemplationReading {
                position: "4'".to_owned(),
                pi_instance_id: "pi".to_owned(),
                loaded_agents: vec!["Nous".to_owned()],
                recognition_state: "state".to_owned(),
                psyche_anchor_coherent: true,
                matched_anchor_codons: vec!["I".to_owned()],
                anchor_card_readings: vec![
                    PsycheAnchorCardReading {
                        card: Some("The Magician".to_owned()),
                        codon: Some("I".to_owned()),
                        matched: true,
                    },
                    PsycheAnchorCardReading {
                        card: Some("The Hierophant".to_owned()),
                        codon: Some("V".to_owned()),
                        matched: false,
                    },
                ],
            },
            ebm: EbmContemplationReading {
                position: "5'".to_owned(),
                per_tick_energy: vec![0.0],
                gradient: vec![],
                gradient_magnitude: 0.0,
                gauge_trio_coherent: true,
                coherence_scores: TritoneSquareCoherence {
                    square_0_5: 1.0,
                    square_1_4: 0.97,
                    square_2_3: 0.94,
                },
            },
            verifier: VerifierContemplationReading {
                position: "0'".to_owned(),
                virtue_witness_vector: vec![
                    true, true, false, true, false, true, true, false, true,
                ],
                unsatisfied_constraints: vec!["#R0-0/1/A-T7-pending?".to_owned()],
                coherence_score: 0.82,
                arch9_wholeness: true,
                syntax_layers_witnessed: false,
            },
        },
        symbolic_round_trips: vec![SymbolicRoundTrip {
            raw: "#R0-0/1/A-T7-pending?".to_owned(),
            parsed: ParsedAnuttaraSymbolicQuestion {
                coordinate: "R0-0/1/A".to_owned(),
                tranche: "T7".to_owned(),
                status: "pending".to_owned(),
            },
            parser_skill: "anuttara-symbolic-parse".to_owned(),
            llm_response: "response".to_owned(),
            anima_reverification_route: "anima.reverify".to_owned(),
            routed_back_through_anima: true,
        }],
    }
}

#[test]
fn closure_aggregates_are_derived_from_canonical_traversals() {
    let m1 = aggregate_m1_closure(&M1SessionClosureEvidence {
        position_sequence: vec![0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5],
    })
    .expect("canonical fifth-generator orbit");
    assert_eq!(m1.generator_step, 7);
    assert!(m1.closed);
    assert_eq!(m1.positions_traversed, [true; 12]);

    let audio = aggregate_audio_octet(&AudioOctetTraversalEvidence {
        position_sequence: vec![0, 1, 2, 3, 4, 5, 6, 7, 0],
    })
    .expect("canonical octave-return traversal");
    assert!(audio.octave_returned);
    assert_eq!(audio.traversed, [true; 8]);
}

#[test]
fn closure_aggregates_refuse_claims_not_supported_by_traversal() {
    let wrong_step = aggregate_m1_closure(&M1SessionClosureEvidence {
        position_sequence: vec![0, 7, 3],
    })
    .expect_err("non-generator movement must fail");
    assert!(wrong_step.contains("+7 mod 12"));

    let repeated = aggregate_m1_closure(&M1SessionClosureEvidence {
        position_sequence: vec![0, 7, 0],
    })
    .expect_err("repeated M1 positions must fail before closure");
    assert!(repeated.contains("must not repeat"));

    let premature_audio = aggregate_audio_octet(&AudioOctetTraversalEvidence {
        position_sequence: vec![0, 1, 2, 3, 4, 5, 6, 7],
    })
    .expect("a partial audio traversal remains readable");
    assert_eq!(premature_audio.traversed, [true; 8]);
    assert!(!premature_audio.octave_returned);
}

#[test]
fn persist_writes_single_atomic_private_bundle_without_forbidden_fields() {
    let state_root = temp_root("persist");
    let bundle = persist_close_bundle(
        &state_root,
        "deadbeef",
        "session:one",
        &M1SessionClosureAggregate {
            positions_traversed: [true; 12],
            generator_step: 7,
            closed: true,
        },
        &AudioOctetTraversalAggregate {
            traversed: [true; 8],
            octave_returned: true,
        },
        &contemplation_response("session:one"),
    )
    .expect("persist close bundle");

    let mut store_root = state_root.clone();
    store_root.push("nara");
    store_root.push("session-close");
    store_root.push("protected-local");
    let files = walk_files(&store_root);
    assert_eq!(
        files.len(),
        1,
        "exactly one bundle file should persist per close"
    );

    let raw: serde_json::Value =
        serde_json::from_slice(&fs::read(&files[0]).expect("read bundle file"))
            .expect("parse bundle json");
    assert_eq!(raw["bundle"]["close_ref"], bundle.close_ref);
    assert_eq!(
        raw["contemplation_object"]["session_id"], "session:one",
        "the persisted record must retain the safe contemplation projection"
    );
    assert_eq!(
        raw["contemplation_object"]["wisdom_delta_text"], "delta",
        "the protected projection must retain the real close-time integration result"
    );
    assert!(raw.get("trajectory").is_none());
    assert!(raw.get("pattern_packet").is_none());
    assert!(raw.get("graphiti_relation").is_none());
    assert!(raw.get("body").is_none());
    assert!(raw["contemplation_object"].get("trajectory").is_none());
    assert!(raw["contemplation_object"].get("q_nara").is_none());
    assert!(raw["contemplation_object"]
        .get("unsatisfied_constraints")
        .is_none());

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        assert_eq!(
            fs::metadata(&files[0])
                .expect("bundle metadata")
                .permissions()
                .mode()
                & 0o777,
            0o600
        );
        assert_eq!(
            fs::metadata(files[0].parent().expect("bundle parent"))
                .expect("store metadata")
                .permissions()
                .mode()
                & 0o777,
            0o700
        );
    }
}

fn persist_fixture(state_root: &Path, session_id: &str) -> super::NaraSessionCloseBundle {
    persist_close_bundle(
        state_root,
        "deadbeef",
        session_id,
        &M1SessionClosureAggregate {
            positions_traversed: [true; 12],
            generator_step: 7,
            closed: true,
        },
        &AudioOctetTraversalAggregate {
            traversed: [true; 8],
            octave_returned: true,
        },
        &contemplation_response(session_id),
    )
    .expect("persist close bundle")
}

// The widening the 25.20 brief names: the verdict alone cannot answer WHICH
// card's codon appeared, so the per-card reading has to survive persistence.
#[test]
fn the_persisted_projection_keeps_the_per_card_anchor_reading() {
    let state_root = temp_root("anchor-cards");
    let bundle = persist_fixture(&state_root, "session:one");

    let projection = read_contemplation_object(
        &state_root,
        "deadbeef",
        &ReadRequest {
            session_id: "session:one".to_owned(),
            close_ref: Some(bundle.close_ref.clone()),
            latest: false,
        },
    )
    .expect("read contemplation projection");

    let cards = &projection.triplet.llm.anchor_cards;
    assert_eq!(cards.len(), 2, "both drawn cards must survive the close");
    assert_eq!(cards[0].card.as_deref(), Some("The Magician"));
    assert_eq!(cards[0].codon.as_deref(), Some("I"));
    assert!(cards[0].matched, "The Magician's codon rode the trajectory");
    assert_eq!(cards[1].card.as_deref(), Some("The Hierophant"));
    assert!(
        !cards[1].matched,
        "the per-card reading must be able to say NO — a list where every \
         card matches would carry no more than the verdict it replaces"
    );
    // The verdict is unchanged by the widening; it is now explainable.
    assert!(projection.triplet.llm.psyche_anchor_coherent);
}

// The stored record is an untagged enum, so a missing key does not fail
// loudly — it falls to `Legacy` and takes the whole projection with it.
// This pins the `serde(default)` that stops that.
#[test]
fn a_record_written_before_the_widening_still_reads_as_a_projection() {
    let state_root = temp_root("anchor-legacy");
    let bundle = persist_fixture(&state_root, "session:one");

    let mut store_root = state_root.clone();
    store_root.push("nara");
    store_root.push("session-close");
    store_root.push("protected-local");
    let file = walk_files(&store_root).remove(0);
    let mut raw: serde_json::Value =
        serde_json::from_slice(&fs::read(&file).expect("read bundle file"))
            .expect("parse bundle json");
    // Exactly what a record persisted before this change looks like.
    raw["contemplation_object"]["triplet"]["llm"]
        .as_object_mut()
        .expect("llm projection object")
        .remove("anchor_cards")
        .expect("fixture must carry the new key before it is removed");
    raw["contemplation_object"]
        .as_object_mut()
        .expect("contemplation projection object")
        .remove("wisdom_delta_text")
        .expect("fixture must carry the new delta key before it is removed");
    fs::write(&file, serde_json::to_vec(&raw).expect("serialize")).expect("rewrite bundle");

    let request = ReadRequest {
        session_id: "session:one".to_owned(),
        close_ref: Some(bundle.close_ref.clone()),
        latest: false,
    };
    let projection = read_contemplation_object(&state_root, "deadbeef", &request)
        .expect("a pre-widening record must still read back as Current, not Legacy");
    assert_eq!(
        projection.wisdom_delta_text, None,
        "an older record has no persisted integration text and must not invent one"
    );
    assert!(
        projection.triplet.llm.anchor_cards.is_empty(),
        "an older record has no per-card reading and must not invent one"
    );
    assert!(
        projection.triplet.llm.psyche_anchor_coherent,
        "the verdict it DID persist must survive"
    );
    assert_eq!(
        read_close_bundle(&state_root, "deadbeef", &request)
            .expect("bundle still readable")
            .close_ref,
        bundle.close_ref
    );
}

#[cfg(unix)]
#[test]
fn persistence_refuses_a_symlinked_protected_store() {
    use std::os::unix::fs::symlink;

    let state_root = temp_root("symlink");
    let outside = temp_root("symlink-outside");
    let protected_parent = state_root.join("nara").join("session-close");
    fs::create_dir_all(&protected_parent).expect("protected parent");
    symlink(&outside, protected_parent.join("protected-local"))
        .expect("create hostile store symlink");

    let error = persist_close_bundle(
        &state_root,
        "deadbeef",
        "session:one",
        &M1SessionClosureAggregate {
            positions_traversed: [true; 12],
            generator_step: 7,
            closed: true,
        },
        &AudioOctetTraversalAggregate {
            traversed: [true; 8],
            octave_returned: true,
        },
        &contemplation_response("session:one"),
    )
    .expect_err("protected store symlinks must fail closed");
    assert!(error.contains("symlink"));
    assert!(
        fs::read_dir(&outside)
            .expect("outside directory")
            .next()
            .is_none(),
        "persistence must not write through the symlink"
    );
}

#[test]
fn read_confines_to_exact_session_and_refuses_path_traversal() {
    let state_root = temp_root("read");
    let bundle = persist_close_bundle(
        &state_root,
        "deadbeef",
        "session:one",
        &M1SessionClosureAggregate {
            positions_traversed: [true; 12],
            generator_step: 7,
            closed: true,
        },
        &AudioOctetTraversalAggregate {
            traversed: [true; 8],
            octave_returned: true,
        },
        &contemplation_response("session:one"),
    )
    .expect("persist close bundle");

    let cross_session = read_close_bundle(
        &state_root,
        "deadbeef",
        &NaraSessionCloseReadRequest {
            session_id: "session:two".to_owned(),
            close_ref: Some(bundle.close_ref.clone()),
            latest: false,
        },
    )
    .expect_err("cross-session reads must fail");
    assert!(cross_session.contains("session"));

    let path = read_close_bundle(
        &state_root,
        "deadbeef",
        &ReadRequest {
            session_id: "session:one".to_owned(),
            close_ref: Some("../escape".to_owned()),
            latest: false,
        },
    )
    .expect_err("path traversal must fail");
    assert!(path.contains("path"));
}

#[test]
fn latest_lookup_stays_within_the_active_pasu_scope() {
    let state_root = temp_root("pasu");
    let _ = persist_close_bundle(
        &state_root,
        "deadbeef",
        "session:one",
        &M1SessionClosureAggregate {
            positions_traversed: [true; 12],
            generator_step: 7,
            closed: true,
        },
        &AudioOctetTraversalAggregate {
            traversed: [true; 8],
            octave_returned: true,
        },
        &contemplation_response("session:one"),
    )
    .expect("persist close bundle");

    let error = read_close_bundle(
        &state_root,
        "feedface",
        &ReadRequest {
            session_id: "session:one".to_owned(),
            close_ref: None,
            latest: true,
        },
    )
    .expect_err("cross-pasu latest lookups must fail");
    assert!(error.contains("requested session") || error.contains("PASU"));
}

fn walk_files(root: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    if !root.exists() {
        return files;
    }
    for entry in fs::read_dir(root).expect("walk store root") {
        let entry = entry.expect("dir entry");
        let path = entry.path();
        if path.is_dir() {
            files.extend(walk_files(&path));
        } else if path.is_file() {
            files.push(path);
        }
    }
    files
}
