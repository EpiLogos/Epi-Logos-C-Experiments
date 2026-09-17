// S0 ADAPTER: Body/S/S3 (gateway session + transcript authority) — protected-local persistence of a Nara session-close bundle. The close semantics and session record are S3's; this file only assembles and writes the local artefact.
//! Coordinate: S0 -> S0'
//! Residency: Body/S/S0/epi-cli/src/gate/nara_close_bundle.rs
//! Position (#n): #0' -- protected-local Nara session-close persistence adapter.
//! Actualises: the live `nara.session_close` aggregate bundle store/readback
//!   plus a strictly projected contemplation read model beneath the gateway
//!   state root for the M1 7-8-9 and M5 Review readers.
//! Public surface: NaraSessionCloseBundle, NaraSessionCloseReadRequest,
//!   NaraContemplationObjectProjection, persist_close_bundle,
//!   read_close_bundle, read_contemplation_object, read_request_from_params.
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
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraSessionCloseBundleProvenance {
    pub privacy_class: String,
    pub source_method: String,
    pub persisted_at: String,
    pub persisted_at_ms: u64,
    pub pasu_scoped: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraSessionCloseBundle {
    pub session_id: String,
    pub close_ref: String,
    pub m1_closure: M1SessionClosureAggregate,
    pub audio_octet: AudioOctetTraversalAggregate,
    pub virtue_witness_vector: u16,
    pub coherence_score: f64,
    pub provenance: NaraSessionCloseBundleProvenance,
}

/// One anchor card as persisted beside the verdict. Protected-local like the
/// rest of the projection: the card name and its codon are the reading, never
/// the session body they were drawn over.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraPsycheAnchorCardProjection {
    pub card: Option<String>,
    pub codon: Option<String>,
    pub matched: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraContemplationLlmProjection {
    pub position: String,
    pub loaded_agent_count: u16,
    pub psyche_anchor_coherent: bool,
    pub matched_anchor_codon_count: u16,
    /// The per-card reading the count above collapses. `serde(default)` is
    /// load-bearing, not decoration: records persisted before this widening
    /// carry no `anchor_cards` key, and `deny_unknown_fields` rejects UNKNOWN
    /// fields, not MISSING ones — so an older `Current` record still reads back
    /// as `Current` with an empty list. Without the default it would fail the
    /// `Current` arm of the untagged `NaraSessionCloseStoredRecord`, fall
    /// through to `Legacy`, and silently lose the whole projection it had.
    #[serde(default)]
    pub anchor_cards: Vec<NaraPsycheAnchorCardProjection>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraContemplationEbmProjection {
    pub position: String,
    pub gradient_magnitude: f64,
    pub gauge_trio_coherent: bool,
    pub coherence_scores: NaraContemplationCoherenceProjection,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraContemplationCoherenceProjection {
    pub square_0_5: f64,
    pub square_1_4: f64,
    pub square_2_3: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraContemplationVerifierProjection {
    pub position: String,
    pub virtue_witness_vector: [bool; 9],
    pub coherence_score: f64,
    pub arch9_wholeness: bool,
    pub syntax_layers_witnessed: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraContemplationTripletProjection {
    pub llm: NaraContemplationLlmProjection,
    pub ebm: NaraContemplationEbmProjection,
    pub verifier: NaraContemplationVerifierProjection,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct NaraContemplationObjectProjection {
    pub session_id: String,
    pub close_ref: String,
    pub contemplation_ref: String,
    /// The real S3 close-time integration result. This is text, not the
    /// kernel's separate `M4_Epii_Integration.wisdom_delta` u64. Optional for
    /// records persisted before 25.T25.5 widened the protected projection.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub wisdom_delta_text: Option<String>,
    pub triplet: NaraContemplationTripletProjection,
    pub provenance: NaraSessionCloseBundleProvenance,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
struct NaraSessionCloseStoredBundle {
    bundle: NaraSessionCloseBundle,
    contemplation_object: NaraContemplationObjectProjection,
}

#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
enum NaraSessionCloseStoredRecord {
    Current(NaraSessionCloseStoredBundle),
    Legacy(NaraSessionCloseBundle),
}

impl NaraSessionCloseStoredRecord {
    fn bundle(&self) -> &NaraSessionCloseBundle {
        match self {
            Self::Current(record) => &record.bundle,
            Self::Legacy(bundle) => bundle,
        }
    }

    fn contemplation_object(&self) -> Option<&NaraContemplationObjectProjection> {
        match self {
            Self::Current(record) => Some(&record.contemplation_object),
            Self::Legacy(_) => None,
        }
    }
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
    if contemplation.session_id != session_id {
        return Err("session-close contemplation response must match session_id".to_owned());
    }
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
    let stored = NaraSessionCloseStoredBundle {
        contemplation_object: contemplation_projection(&bundle, contemplation)?,
        bundle: bundle.clone(),
    };
    let destination = close_ref_path(state_root, pasu_scope, session_id, &close_ref);
    persist_bundle_file(state_root, &destination, &stored)?;
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
    let record = read_bundle_file(state_root, &path)
        .map_err(|_| "close_ref not found for the requested session".to_owned())?;
    let bundle = record.bundle();
    if bundle.session_id != request.session_id || bundle.close_ref != close_ref {
        return Err("session-close bundle identity does not match its governed path".to_owned());
    }
    Ok(bundle.clone())
}

pub fn read_contemplation_object(
    state_root: &Path,
    pasu_scope: &str,
    request: &NaraSessionCloseReadRequest,
) -> Result<NaraContemplationObjectProjection, String> {
    let record = read_stored_close_bundle(state_root, pasu_scope, request)?;
    record.contemplation_object().cloned().ok_or_else(|| {
        "no persisted contemplation projection for the requested session-close bundle".to_owned()
    })
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
    let record = latest_stored_close_bundle(state_root, pasu_scope, session_id)?;
    Ok(record.bundle().clone())
}

fn read_stored_close_bundle(
    state_root: &Path,
    pasu_scope: &str,
    request: &NaraSessionCloseReadRequest,
) -> Result<NaraSessionCloseStoredRecord, String> {
    validate_pasu_scope(pasu_scope)?;
    validate_session_id(&request.session_id)?;
    if request.latest {
        return latest_stored_close_bundle(state_root, pasu_scope, &request.session_id);
    }
    let close_ref = request
        .close_ref
        .as_deref()
        .ok_or_else(|| "nara.session_close.read requires close_ref or latest=true".to_owned())?;
    validate_close_ref(close_ref)?;
    let path = close_ref_path(state_root, pasu_scope, &request.session_id, close_ref);
    let record = read_bundle_file(state_root, &path)
        .map_err(|_| "close_ref not found for the requested session".to_owned())?;
    let bundle = record.bundle();
    if bundle.session_id != request.session_id || bundle.close_ref != close_ref {
        return Err("session-close bundle identity does not match its governed path".to_owned());
    }
    Ok(record)
}

fn latest_stored_close_bundle(
    state_root: &Path,
    pasu_scope: &str,
    session_id: &str,
) -> Result<NaraSessionCloseStoredRecord, String> {
    let session_root = session_root(state_root, pasu_scope, session_id);
    let entries = fs::read_dir(&session_root)
        .map_err(|_| "no persisted session-close bundle for the requested session".to_owned())?;
    let mut latest: Option<NaraSessionCloseStoredRecord> = None;
    for entry in entries {
        let entry = entry.map_err(|err| format!("read session-close directory: {err}"))?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let record = read_bundle_file(state_root, &path)?;
        let bundle = record.bundle();
        if bundle.session_id != session_id
            || path.file_stem().and_then(|value| value.to_str()) != Some(bundle.close_ref.as_str())
        {
            continue;
        }
        let should_replace = latest
            .as_ref()
            .map(|current| {
                let current = current.bundle();
                bundle.provenance.persisted_at_ms > current.provenance.persisted_at_ms
                    || (bundle.provenance.persisted_at_ms == current.provenance.persisted_at_ms
                        && bundle.close_ref > current.close_ref)
            })
            .unwrap_or(true);
        if should_replace {
            latest = Some(record);
        }
    }
    latest.ok_or_else(|| "no persisted session-close bundle for the requested session".to_owned())
}

fn read_bundle_file(
    state_root: &Path,
    path: &Path,
) -> Result<NaraSessionCloseStoredRecord, String> {
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
    bundle: &NaraSessionCloseStoredBundle,
) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "session-close bundle path is missing a parent".to_owned())?;
    reject_symlinks_below(state_root, parent)?;
    ensure_private_directory(parent)?;
    reject_symlinks_below(state_root, parent)?;
    let temporary = parent.join(format!(".{}.tmp", bundle.bundle.close_ref));
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

fn contemplation_projection(
    bundle: &NaraSessionCloseBundle,
    contemplation: &ContemplateSessionCloseResponse,
) -> Result<NaraContemplationObjectProjection, String> {
    let llm = &contemplation.triplet.llm;
    let ebm = &contemplation.triplet.ebm;
    let verifier = &contemplation.triplet.verifier;
    if verifier.virtue_witness_vector.len() != 9 {
        return Err("contemplation verifier projection requires nine virtue witnesses".to_owned());
    }
    if !ebm.gradient_magnitude.is_finite() || ebm.gradient_magnitude < 0.0 {
        return Err("contemplation gradient magnitude must be finite and non-negative".to_owned());
    }
    let wisdom_delta_text = contemplation.wisdom_delta.trim();
    if wisdom_delta_text.is_empty() || wisdom_delta_text.len() > 4096 {
        return Err(
            "contemplation wisdom_delta text must be non-empty and at most 4096 bytes".to_owned(),
        );
    }
    for (label, score) in [
        ("square_0_5", ebm.coherence_scores.square_0_5),
        ("square_1_4", ebm.coherence_scores.square_1_4),
        ("square_2_3", ebm.coherence_scores.square_2_3),
    ] {
        if !score.is_finite() || !(0.0..=1.0).contains(&score) {
            return Err(format!(
                "contemplation {label} coherence must be within 0..=1"
            ));
        }
    }
    let virtue_witness_vector: [bool; 9] = verifier
        .virtue_witness_vector
        .clone()
        .try_into()
        .map_err(|_| {
            "contemplation verifier projection requires nine virtue witnesses".to_owned()
        })?;
    Ok(NaraContemplationObjectProjection {
        session_id: bundle.session_id.clone(),
        close_ref: bundle.close_ref.clone(),
        contemplation_ref: format!("contemplation-{}", Uuid::new_v4()),
        wisdom_delta_text: Some(wisdom_delta_text.to_owned()),
        triplet: NaraContemplationTripletProjection {
            llm: NaraContemplationLlmProjection {
                position: llm.position.clone(),
                loaded_agent_count: u16::try_from(llm.loaded_agents.len())
                    .map_err(|_| "contemplation loaded agent count exceeds u16".to_owned())?,
                psyche_anchor_coherent: llm.psyche_anchor_coherent,
                matched_anchor_codon_count: u16::try_from(llm.matched_anchor_codons.len())
                    .map_err(|_| "contemplation anchor codon count exceeds u16".to_owned())?,
                anchor_cards: llm
                    .anchor_card_readings
                    .iter()
                    .map(|reading| NaraPsycheAnchorCardProjection {
                        card: reading.card.clone(),
                        codon: reading.codon.clone(),
                        matched: reading.matched,
                    })
                    .collect(),
            },
            ebm: NaraContemplationEbmProjection {
                position: ebm.position.clone(),
                gradient_magnitude: ebm.gradient_magnitude,
                gauge_trio_coherent: ebm.gauge_trio_coherent,
                coherence_scores: NaraContemplationCoherenceProjection {
                    square_0_5: ebm.coherence_scores.square_0_5,
                    square_1_4: ebm.coherence_scores.square_1_4,
                    square_2_3: ebm.coherence_scores.square_2_3,
                },
            },
            verifier: NaraContemplationVerifierProjection {
                position: verifier.position.clone(),
                virtue_witness_vector,
                coherence_score: verifier.coherence_score,
                arch9_wholeness: verifier.arch9_wholeness,
                syntax_layers_witnessed: verifier.syntax_layers_witnessed,
            },
        },
        provenance: bundle.provenance.clone(),
    })
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
#[path = "../../tests/unit/nara_close_bundle.rs"]
mod tests;
