//! Coordinate: S0 -> S0'
//! Residency: Body/S/S0/epi-cli/src/gate/nara_close_bundle.rs
//! Position (#n): #0' -- protected-local Nara session-close persistence adapter.
//! Actualises: the live `nara.session_close` aggregate bundle store/readback
//!   beneath the gateway state root for the M1 7-8-9 Review reader.
//! Public surface: NaraSessionCloseBundle, NaraSessionCloseReadRequest,
//!   persist_close_bundle, read_close_bundle, read_request_from_params.
//! Does NOT own: S3 close-route law, contemplation composition, or frontend
//!   rendering.
//! Contract: [[S0-SPEC]] -> [[S3-SPEC]] -> [[M1'-SPEC]].

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

use chrono::Utc;
use epi_s3_gateway::dispatch::ContemplateSessionCloseResponse;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

const STORE_SUBPATH: [&str; 3] = ["nara", "session-close", "protected-local"];
const PROTECTED_LOCAL_PRIVACY: &str = "protected_local";
const SOURCE_METHOD: &str = "nara.session_close";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NaraSessionCloseReadRequest {
    pub session_id: String,
    pub close_ref: Option<String>,
    pub latest: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct M1SessionClosureEvidence {
    pub position_sequence: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct M1SessionClosureAggregate {
    pub positions_traversed: [bool; 12],
    pub generator_step: u8,
    pub closed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct AudioOctetTraversalEvidence {
    pub position_sequence: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct AudioOctetTraversalAggregate {
    pub traversed: [bool; 8],
    pub octave_returned: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NaraSessionCloseBundleProvenance {
    pub privacy_class: String,
    pub source_method: String,
    pub persisted_at: String,
    pub persisted_at_ms: u64,
    pub pasu_scoped: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NaraSessionCloseBundle {
    pub session_id: String,
    pub close_ref: String,
    pub m1_closure: M1SessionClosureAggregate,
    pub audio_octet: AudioOctetTraversalAggregate,
    pub virtue_witness_vector: u16,
    pub coherence_score: f64,
    pub provenance: NaraSessionCloseBundleProvenance,
}

pub fn aggregate_m1_closure(
    evidence: &M1SessionClosureEvidence,
) -> Result<M1SessionClosureAggregate, String> {
    if evidence.position_sequence.len() > 12 {
        return Err("m1_closure.position_sequence cannot exceed 12 positions".to_owned());
    }
    let mut positions_traversed = [false; 12];
    for &position in &evidence.position_sequence {
        let slot = positions_traversed
            .get_mut(position as usize)
            .ok_or_else(|| "m1_closure positions must be in 0..11".to_owned())?;
        if *slot {
            return Err("m1_closure position_sequence must not repeat positions".to_owned());
        }
        *slot = true;
    }
    let follows_generator = evidence
        .position_sequence
        .windows(2)
        .all(|pair| pair[1] == (pair[0] + 7) % 12);
    if !follows_generator {
        return Err("m1_closure must follow the +7 mod 12 fifth-generator".to_owned());
    }
    let closed = evidence.position_sequence.len() == 12
        && evidence
            .position_sequence
            .last()
            .zip(evidence.position_sequence.first())
            .is_some_and(|(last, first)| (last + 7) % 12 == *first);
    Ok(M1SessionClosureAggregate {
        positions_traversed,
        generator_step: 7,
        closed,
    })
}

pub fn aggregate_audio_octet(
    evidence: &AudioOctetTraversalEvidence,
) -> Result<AudioOctetTraversalAggregate, String> {
    if evidence.position_sequence.len() > 9 {
        return Err("audio_octet.position_sequence cannot exceed return length 9".to_owned());
    }
    let mut traversed = [false; 8];
    for &position in &evidence.position_sequence {
        let slot = traversed
            .get_mut(position as usize)
            .ok_or_else(|| "audio_octet positions must be in 0..7".to_owned())?;
        *slot = true;
    }
    let octave_returned = evidence.position_sequence.as_slice() == [0, 1, 2, 3, 4, 5, 6, 7, 0];
    Ok(AudioOctetTraversalAggregate {
        traversed,
        octave_returned,
    })
}

pub fn persist_close_bundle(
    state_root: &Path,
    pasu_scope: &str,
    session_id: &str,
    m1_closure: &M1SessionClosureAggregate,
    audio_octet: &AudioOctetTraversalAggregate,
    contemplation: &ContemplateSessionCloseResponse,
) -> Result<NaraSessionCloseBundle, String> {
    validate_pasu_scope(pasu_scope)?;
    validate_session_id(session_id)?;
    if contemplation.triplet.verifier.virtue_witness_vector.len() != 9 {
        return Err(
            "session-close verifier evidence must contain exactly nine virtue witnesses".to_owned(),
        );
    }
    if !contemplation.triplet.verifier.coherence_score.is_finite()
        || !(0.0..=1.0).contains(&contemplation.triplet.verifier.coherence_score)
    {
        return Err("session-close coherence_score must be finite and within 0..=1".to_owned());
    }
    let close_ref = format!("close-{}", Uuid::new_v4());
    validate_close_ref(&close_ref)?;
    let verifier = &contemplation.triplet.verifier;
    let now = Utc::now();
    let bundle = NaraSessionCloseBundle {
        session_id: session_id.to_owned(),
        close_ref: close_ref.clone(),
        m1_closure: m1_closure.clone(),
        audio_octet: audio_octet.clone(),
        virtue_witness_vector: encode_witness_vector(&verifier.virtue_witness_vector),
        coherence_score: verifier.coherence_score,
        provenance: NaraSessionCloseBundleProvenance {
            privacy_class: PROTECTED_LOCAL_PRIVACY.to_owned(),
            source_method: SOURCE_METHOD.to_owned(),
            persisted_at: now.to_rfc3339(),
            persisted_at_ms: now.timestamp_millis().max(0) as u64,
            pasu_scoped: true,
        },
    };
    let destination = close_ref_path(state_root, pasu_scope, session_id, &close_ref);
    persist_bundle_file(state_root, &destination, &bundle)?;
    Ok(bundle)
}

pub fn read_close_bundle(
    state_root: &Path,
    pasu_scope: &str,
    request: &NaraSessionCloseReadRequest,
) -> Result<NaraSessionCloseBundle, String> {
    validate_pasu_scope(pasu_scope)?;
    validate_session_id(&request.session_id)?;
    if request.latest {
        return latest_close_bundle(state_root, pasu_scope, &request.session_id);
    }
    let close_ref = request
        .close_ref
        .as_deref()
        .ok_or_else(|| "nara.session_close.read requires close_ref or latest=true".to_owned())?;
    validate_close_ref(close_ref)?;
    let path = close_ref_path(state_root, pasu_scope, &request.session_id, close_ref);
    let bundle = read_bundle_file(state_root, &path)
        .map_err(|_| "close_ref not found for the requested session".to_owned())?;
    if bundle.session_id != request.session_id || bundle.close_ref != close_ref {
        return Err("session-close bundle identity does not match its governed path".to_owned());
    }
    Ok(bundle)
}

pub fn read_request_from_params(params: &Value) -> Result<NaraSessionCloseReadRequest, String> {
    let session_id = read_string(params, &["session_id", "sessionId", "sessionKey"])?
        .ok_or_else(|| "nara.session_close.read requires session_id".to_owned())?;
    let close_ref = read_string(params, &["close_ref", "closeRef"])?;
    let latest = params
        .get("latest")
        .and_then(Value::as_bool)
        .unwrap_or(close_ref.is_none());
    Ok(NaraSessionCloseReadRequest {
        session_id,
        close_ref,
        latest,
    })
}

fn latest_close_bundle(
    state_root: &Path,
    pasu_scope: &str,
    session_id: &str,
) -> Result<NaraSessionCloseBundle, String> {
    let session_root = session_root(state_root, pasu_scope, session_id);
    let entries = fs::read_dir(&session_root)
        .map_err(|_| "no persisted session-close bundle for the requested session".to_owned())?;
    let mut latest: Option<NaraSessionCloseBundle> = None;
    for entry in entries {
        let entry = entry.map_err(|err| format!("read session-close directory: {err}"))?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let bundle = read_bundle_file(state_root, &path)?;
        if bundle.session_id != session_id
            || path.file_stem().and_then(|value| value.to_str()) != Some(bundle.close_ref.as_str())
        {
            continue;
        }
        let should_replace = latest
            .as_ref()
            .map(|current| {
                bundle.provenance.persisted_at_ms > current.provenance.persisted_at_ms
                    || (bundle.provenance.persisted_at_ms == current.provenance.persisted_at_ms
                        && bundle.close_ref > current.close_ref)
            })
            .unwrap_or(true);
        if should_replace {
            latest = Some(bundle);
        }
    }
    latest.ok_or_else(|| "no persisted session-close bundle for the requested session".to_owned())
}

fn read_bundle_file(state_root: &Path, path: &Path) -> Result<NaraSessionCloseBundle, String> {
    reject_symlinks_below(state_root, path)?;
    let metadata =
        fs::symlink_metadata(path).map_err(|err| format!("inspect session-close bundle: {err}"))?;
    if metadata.file_type().is_symlink() || !metadata.is_file() {
        return Err("session-close bundle must be a regular non-symlink file".to_owned());
    }
    let bytes = fs::read(path).map_err(|err| format!("read session-close bundle: {err}"))?;
    serde_json::from_slice(&bytes).map_err(|err| format!("parse session-close bundle: {err}"))
}

fn persist_bundle_file(
    state_root: &Path,
    path: &Path,
    bundle: &NaraSessionCloseBundle,
) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "session-close bundle path is missing a parent".to_owned())?;
    reject_symlinks_below(state_root, parent)?;
    ensure_private_directory(parent)?;
    reject_symlinks_below(state_root, parent)?;
    let temporary = parent.join(format!(".{}.tmp", bundle.close_ref));
    let bytes = serde_json::to_vec_pretty(bundle)
        .map_err(|err| format!("serialize session-close bundle: {err}"))?;
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options
        .open(&temporary)
        .map_err(|err| format!("create session-close bundle: {err}"))?;
    file.write_all(&bytes)
        .map_err(|err| format!("write session-close bundle: {err}"))?;
    file.sync_all()
        .map_err(|err| format!("sync session-close bundle: {err}"))?;
    drop(file);
    fs::rename(&temporary, path).map_err(|err| format!("commit session-close bundle: {err}"))?;
    fs::File::open(parent)
        .and_then(|directory| directory.sync_all())
        .map_err(|err| format!("sync session-close directory: {err}"))?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::{MetadataExt, PermissionsExt};

        fs::set_permissions(path, fs::Permissions::from_mode(0o600))
            .map_err(|err| format!("protect session-close bundle: {err}"))?;
        if fs::metadata(path)
            .map_err(|err| format!("inspect session-close bundle: {err}"))?
            .mode()
            & 0o777
            != 0o600
        {
            return Err("session-close bundle permissions are not 0600".to_owned());
        }
    }
    Ok(())
}

fn reject_symlinks_below(root: &Path, path: &Path) -> Result<(), String> {
    let relative = path
        .strip_prefix(root)
        .map_err(|_| "session-close path escaped its state root".to_owned())?;
    let mut cursor = root.to_path_buf();
    for component in relative.components() {
        cursor.push(component);
        match fs::symlink_metadata(&cursor) {
            Ok(metadata) if metadata.file_type().is_symlink() => {
                return Err("session-close path must not contain symlinks".to_owned());
            }
            Ok(_) => {}
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => {}
            Err(err) => return Err(format!("inspect session-close path: {err}")),
        }
    }
    Ok(())
}

fn ensure_private_directory(path: &Path) -> Result<(), String> {
    if let Ok(metadata) = fs::symlink_metadata(path) {
        if metadata.file_type().is_symlink() {
            return Err("session-close store must not be a symlink".to_owned());
        }
        if !metadata.is_dir() {
            return Err("session-close store is not a directory".to_owned());
        }
    } else {
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;

            let mut builder = fs::DirBuilder::new();
            builder.recursive(true).mode(0o700);
            builder
                .create(path)
                .map_err(|err| format!("create session-close store: {err}"))?;
        }
        #[cfg(not(unix))]
        fs::create_dir_all(path).map_err(|err| format!("create session-close store: {err}"))?;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::{MetadataExt, PermissionsExt};

        fs::set_permissions(path, fs::Permissions::from_mode(0o700))
            .map_err(|err| format!("protect session-close store: {err}"))?;
        if fs::metadata(path)
            .map_err(|err| format!("inspect session-close store: {err}"))?
            .mode()
            & 0o777
            != 0o700
        {
            return Err("session-close store permissions are not 0700".to_owned());
        }
    }
    Ok(())
}

fn session_root(state_root: &Path, pasu_scope: &str, session_id: &str) -> PathBuf {
    let mut path = state_root.to_path_buf();
    for segment in STORE_SUBPATH {
        path.push(segment);
    }
    path.push(pasu_scope);
    path.push(encode_segment(session_id));
    path
}

fn close_ref_path(
    state_root: &Path,
    pasu_scope: &str,
    session_id: &str,
    close_ref: &str,
) -> PathBuf {
    session_root(state_root, pasu_scope, session_id).join(format!("{close_ref}.json"))
}

fn encode_segment(value: &str) -> String {
    value
        .as_bytes()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>()
}

fn encode_witness_vector(bits: &[bool]) -> u16 {
    bits.iter().take(9).enumerate().fold(
        0u16,
        |mask, (index, bit)| if *bit { mask | (1u16 << index) } else { mask },
    )
}

fn validate_pasu_scope(pasu_scope: &str) -> Result<(), String> {
    if pasu_scope.len() < 8 || !pasu_scope.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err(
            "nara session-close persistence requires an active PASU hash_preview".to_owned(),
        );
    }
    Ok(())
}

fn validate_session_id(session_id: &str) -> Result<(), String> {
    let trimmed = session_id.trim();
    if trimmed.is_empty() {
        return Err("session_id must be non-empty".to_owned());
    }
    if trimmed.contains('/') || trimmed.contains('\\') || trimmed.contains("..") {
        return Err("session_id must not be path-shaped".to_owned());
    }
    if trimmed.chars().any(|ch| ch.is_control()) {
        return Err("session_id must not contain control characters".to_owned());
    }
    Ok(())
}

fn validate_close_ref(close_ref: &str) -> Result<(), String> {
    let trimmed = close_ref.trim();
    if trimmed.is_empty() {
        return Err("close_ref must be non-empty".to_owned());
    }
    if trimmed.contains('/') || trimmed.contains('\\') || trimmed.contains("..") {
        return Err("close_ref must not be path-shaped".to_owned());
    }
    if !trimmed
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_')
    {
        return Err("close_ref must be opaque ASCII".to_owned());
    }
    Ok(())
}

fn read_string(params: &Value, keys: &[&str]) -> Result<Option<String>, String> {
    for key in keys {
        if let Some(value) = params.get(*key) {
            if let Some(string) = value.as_str() {
                return Ok(Some(string.to_owned()));
            }
            return Err(format!("{key} must be a string"));
        }
    }
    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::{
        aggregate_audio_octet, aggregate_m1_closure, persist_close_bundle, read_close_bundle,
        AudioOctetTraversalAggregate, AudioOctetTraversalEvidence, ContemplateSessionCloseResponse,
        M1SessionClosureAggregate, M1SessionClosureEvidence, NaraSessionCloseReadRequest,
        NaraSessionCloseReadRequest as ReadRequest,
    };
    use epi_s3_gateway::dispatch::{
        ContemplationTripletOutput, EbmContemplationReading, LlmContemplationReading,
        ParsedAnuttaraSymbolicQuestion, SymbolicRoundTrip, TritoneSquareCoherence,
        VerifierContemplationReading,
    };
    use std::fs;
    use std::path::{Path, PathBuf};

    fn temp_root(name: &str) -> PathBuf {
        let root =
            std::env::temp_dir().join(format!("epi-nara-close-{name}-{}", std::process::id()));
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
        assert_eq!(raw["close_ref"], bundle.close_ref);
        assert!(raw.get("trajectory").is_none());
        assert!(raw.get("pattern_packet").is_none());
        assert!(raw.get("graphiti_relation").is_none());
        assert!(raw.get("body").is_none());

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
}
