use crate::{EpiPrimitiveSnapshot, NaraProtectedContext, EPI_SOURCE_REVISION, QL_PROVIDER_REVISION};
use portal_core::{NaraActivityKind, NaraJournalParseInput, NaraJournalParser, NaraParsedActivity};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

pub const NARA_DAILY_SCHEMA: &str = "epi.nara-daily-surface/v1";
pub const NARA_DAILY_PROVIDER_CONTRACT: &str = "epi.nara-daily-provider/v1";
pub const NARA_SELECTION_SCHEMA: &str = "epi.nara-selection/v1";
pub const NARA_SENDOFF_ACTION_REF: &str = "epi.action.nara.selection.sendoff";
pub const NARA_SENDOFF_CAPABILITY_REF: &str = "epi.capability.nara.selected-context";

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraEpisodeRecord {
    pub schema: String,
    pub episode_ref: String,
    pub day_ref: String,
    pub day_id: String,
    pub now_path: String,
    pub session_key: String,
    pub episode_type: String,
    pub revision: u64,
    pub privacy_class: String,
    pub source_class: String,
    pub body_handle: String,
    pub updated_at_unix_ms: u64,
    pub activity: NaraParsedActivity,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraLivedContext {
    pub day_id: String,
    pub now_path: String,
    pub tick: u64,
    pub tick12: u8,
    pub harmonic_role: String,
    pub conjugate_form_character: String,
    pub position: u8,
    pub helix: String,
    pub resonance72_index: usize,
    pub ql_address: String,
    pub lens_ref: String,
    pub sublens_ref: String,
    pub context_frame: Option<String>,
    pub coordinate_ref: String,
    pub profile_ref: String,
    pub vak_status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraExplain {
    pub source_revision: String,
    pub ql_provider_revision: String,
    pub provider_contract: String,
    pub computation: Vec<String>,
    pub semantic_sources: Vec<String>,
    pub readiness: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraDailySurface {
    pub schema: String,
    pub provider_contract: String,
    pub native_owner: String,
    pub day_ref: String,
    pub episode_ref: String,
    pub episode_revision: u64,
    pub episode_type: String,
    pub privacy_class: String,
    pub source_class: String,
    pub body: String,
    pub lived_context: NaraLivedContext,
    pub identity_orientation: String,
    pub explain: NaraExplain,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NaraWriteRequest {
    pub body: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NaraSelectionRequest {
    pub episode_ref: String,
    pub revision: u64,
    pub start_byte: usize,
    pub end_byte: usize,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraSelection {
    pub schema: String,
    pub action_ref: String,
    pub capability_ref: String,
    pub episode_ref: String,
    pub selection_ref: String,
    pub episode_revision: u64,
    pub start_byte: usize,
    pub end_byte: usize,
    pub selected_text: String,
    pub day_id: String,
    pub now_path: String,
    pub ql_address: String,
    pub coordinate_ref: String,
    pub profile_ref: String,
    pub privacy_class: String,
    pub disclosure_scope: Vec<String>,
    pub provenance: NaraExplain,
}

pub fn read_daily_surface(vault_root: &Path, snapshot: &EpiPrimitiveSnapshot) -> Result<NaraDailySurface, String> {
    let context = required_context(snapshot)?;
    let paths = NaraPaths::new(vault_root, context)?;
    ensure_day_dir(&paths.day_dir)?;
    let (body, revision, source_class) = if paths.body_path.exists() {
        let body = fs::read_to_string(&paths.body_path)
            .map_err(|error| format!("read protected Nara daily note: {error}"))?;
        let record = read_record(&paths.record_path)?;
        validate_record(&record, &paths, context)?;
        (body, record.revision, record.source_class)
    } else {
        (String::new(), 0, "human-authored".to_owned())
    };
    Ok(surface(snapshot, context, &paths, body, revision, source_class))
}

pub fn write_daily_surface(
    vault_root: &Path,
    snapshot: &EpiPrimitiveSnapshot,
    timestamp_ms: u64,
    request: NaraWriteRequest,
) -> Result<NaraDailySurface, String> {
    let context = required_context(snapshot)?;
    let paths = NaraPaths::new(vault_root, context)?;
    ensure_day_dir(&paths.day_dir)?;
    let body = normalize_body(request.body);
    if body.trim().is_empty() {
        return Err("Nara daily note body must not be empty".to_owned());
    }
    let revision = if paths.record_path.exists() {
        let record = read_record(&paths.record_path)?;
        validate_record(&record, &paths, context)?;
        record.revision.checked_add(1)
    } else {
        Some(1)
    }
    .ok_or_else(|| "Nara episode revision overflow".to_owned())?;

    let raw_body_handle = paths.body_path.to_string_lossy().into_owned();
    let activity = NaraJournalParser::parse(NaraJournalParseInput {
        event_id: format!("{}:r{revision}", paths.episode_ref),
        kind: NaraActivityKind::DailyNote,
        coordinate: snapshot.current_address.canonical_ref.clone(),
        day_id: context.day_id.clone(),
        now_path: context.now_path.clone(),
        session_key: context.session_key.clone(),
        identity_ref: context.identity_ref.clone(),
        matheme_handle: profile_ref(snapshot),
        raw_body_handle: raw_body_handle.clone(),
        body: body.clone(),
        source_ref: context.source_ref.clone(),
        kairos_snapshot: Some(format!(
            "tick:{};ql:{};cf:{}",
            snapshot.kernel.harmonic_profile.tick,
            snapshot.ql.ql_address,
            snapshot.ql.context_frame.as_deref().unwrap_or("unavailable")
        )),
    })
    .map_err(|error| format!("parse protected Nara daily note: {error}"))?;

    let record = NaraEpisodeRecord {
        schema: "epi.nara-episode-record/v1".to_owned(),
        episode_ref: paths.episode_ref.clone(),
        day_ref: paths.day_ref.clone(),
        day_id: context.day_id.clone(),
        now_path: context.now_path.clone(),
        session_key: context.session_key.clone(),
        episode_type: "daily-note".to_owned(),
        revision,
        privacy_class: "protected-local-body".to_owned(),
        source_class: "human-authored".to_owned(),
        body_handle: raw_body_handle,
        updated_at_unix_ms: timestamp_ms,
        activity,
    };

    atomic_write(&paths.body_path, body.as_bytes())?;
    atomic_write(
        &paths.record_path,
        &serde_json::to_vec_pretty(&record)
            .map_err(|error| format!("serialize Nara episode record: {error}"))?,
    )?;
    protect_file(&paths.body_path)?;
    protect_file(&paths.record_path)?;
    Ok(surface(snapshot, context, &paths, body, revision, record.source_class))
}

pub fn resolve_selection(
    vault_root: &Path,
    snapshot: &EpiPrimitiveSnapshot,
    request: NaraSelectionRequest,
) -> Result<NaraSelection, String> {
    let surface = read_daily_surface(vault_root, snapshot)?;
    if request.episode_ref != surface.episode_ref {
        return Err("selection episode_ref does not match the current Nara episode".to_owned());
    }
    if request.revision != surface.episode_revision {
        return Err("selection revision is stale; save and select from the current episode".to_owned());
    }
    if request.start_byte >= request.end_byte || request.end_byte > surface.body.len() {
        return Err("selection byte range is empty or outside the current episode".to_owned());
    }
    if !surface.body.is_char_boundary(request.start_byte) || !surface.body.is_char_boundary(request.end_byte) {
        return Err("selection byte range must align to UTF-8 character boundaries".to_owned());
    }
    let selected_text = surface.body[request.start_byte..request.end_byte].to_owned();
    if selected_text.trim().is_empty() {
        return Err("selection must contain non-whitespace text".to_owned());
    }
    Ok(NaraSelection {
        schema: NARA_SELECTION_SCHEMA.to_owned(),
        action_ref: NARA_SENDOFF_ACTION_REF.to_owned(),
        capability_ref: NARA_SENDOFF_CAPABILITY_REF.to_owned(),
        episode_ref: surface.episode_ref.clone(),
        selection_ref: format!(
            "epi:nara:selection:{}:r{}:{}-{}",
            stable_part(&surface.episode_ref), surface.episode_revision, request.start_byte, request.end_byte
        ),
        episode_revision: surface.episode_revision,
        start_byte: request.start_byte,
        end_byte: request.end_byte,
        selected_text,
        day_id: surface.lived_context.day_id,
        now_path: surface.lived_context.now_path,
        ql_address: surface.lived_context.ql_address,
        coordinate_ref: surface.lived_context.coordinate_ref,
        profile_ref: surface.lived_context.profile_ref,
        privacy_class: "protected-local-selected-disclosure".to_owned(),
        disclosure_scope: vec![
            "selected-text".to_owned(),
            "episode-ref".to_owned(),
            "source-range".to_owned(),
            "day-now".to_owned(),
            "ql-address".to_owned(),
            "coordinate-ref".to_owned(),
            "harmonic-profile-ref".to_owned(),
        ],
        provenance: surface.explain,
    })
}

fn surface(
    snapshot: &EpiPrimitiveSnapshot,
    context: &NaraProtectedContext,
    paths: &NaraPaths,
    body: String,
    revision: u64,
    source_class: String,
) -> NaraDailySurface {
    let profile = &snapshot.kernel.harmonic_profile;
    NaraDailySurface {
        schema: NARA_DAILY_SCHEMA.to_owned(),
        provider_contract: NARA_DAILY_PROVIDER_CONTRACT.to_owned(),
        native_owner: "epi".to_owned(),
        day_ref: paths.day_ref.clone(),
        episode_ref: paths.episode_ref.clone(),
        episode_revision: revision,
        episode_type: "daily-note".to_owned(),
        privacy_class: "protected-local-body".to_owned(),
        source_class,
        body,
        lived_context: NaraLivedContext {
            day_id: context.day_id.clone(),
            now_path: context.now_path.clone(),
            tick: profile.tick,
            tick12: profile.tick12,
            harmonic_role: profile.ratio_role.clone(),
            conjugate_form_character: format!("{:?}", profile.conjugate_form_character),
            position: profile.position6,
            helix: profile.helix.clone(),
            resonance72_index: profile.resonance72.lens_anchor_index,
            ql_address: snapshot.ql.ql_address.clone(),
            lens_ref: snapshot.ql.lens_ref.clone(),
            sublens_ref: snapshot.ql.sublens_ref.clone(),
            context_frame: snapshot.ql.context_frame.clone(),
            coordinate_ref: snapshot.current_address.canonical_ref.clone(),
            profile_ref: profile_ref(snapshot),
            vak_status: format!("{:?}", snapshot.vak.current_state.status),
        },
        identity_orientation: "protected personal context · local only".to_owned(),
        explain: NaraExplain {
            source_revision: EPI_SOURCE_REVISION.to_owned(),
            ql_provider_revision: QL_PROVIDER_REVISION.to_owned(),
            provider_contract: NARA_DAILY_PROVIDER_CONTRACT.to_owned(),
            computation: vec![
                "epi-lib::kernel_tick_from_epogdoon through primitive_bridge ABI".to_owned(),
                "portal-core::kernel_tick_from_epogdoon parity witness".to_owned(),
                "portal-core::MathemeHarmonicProfile".to_owned(),
                "portal-core::NaraJournalParser".to_owned(),
            ],
            semantic_sources: vec![
                "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md".to_owned(),
                "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md".to_owned(),
            ],
            readiness: vec![
                format!("kernel:{:?}", snapshot.kernel.status),
                format!("ql:{:?}", snapshot.ql.status),
                format!("vak:{:?}", snapshot.vak.current_state.status),
                format!("day-now:{:?}", snapshot.time.day_now.status),
                format!("mahamaya:{:?}", snapshot.mahamaya.status),
            ],
        },
    }
}

fn profile_ref(snapshot: &EpiPrimitiveSnapshot) -> String {
    format!("epi:matheme-harmonic-profile:{}:{}", snapshot.source_revision, snapshot.kernel.harmonic_profile.tick)
}

fn required_context(snapshot: &EpiPrimitiveSnapshot) -> Result<&NaraProtectedContext, String> {
    snapshot.nara.context.as_ref().ok_or_else(|| {
        "Nara daily store requires the protected Prompt-A Nara context handoff".to_owned()
    })
}

struct NaraPaths {
    day_dir: PathBuf,
    body_path: PathBuf,
    record_path: PathBuf,
    day_ref: String,
    episode_ref: String,
}

impl NaraPaths {
    fn new(vault_root: &Path, context: &NaraProtectedContext) -> Result<Self, String> {
        validate_segment(&context.day_id, "day_id")?;
        let day_ref = format!("epi:nara:day:{}", context.day_id);
        let episode_ref = context.episode_ref.clone().unwrap_or_else(|| {
            format!("epi:nara:episode:{}:daily-note", context.day_id)
        });
        let day_dir = vault_root.join("Pratibimba").join("Nara").join(&context.day_id);
        Ok(Self {
            body_path: day_dir.join("daily-note.md"),
            record_path: day_dir.join("daily-note.episode.json"),
            day_dir,
            day_ref,
            episode_ref,
        })
    }
}

fn read_record(path: &Path) -> Result<NaraEpisodeRecord, String> {
    serde_json::from_slice(&fs::read(path).map_err(|error| format!("read Nara episode record: {error}"))?)
        .map_err(|error| format!("parse Nara episode record: {error}"))
}

fn validate_record(record: &NaraEpisodeRecord, paths: &NaraPaths, context: &NaraProtectedContext) -> Result<(), String> {
    if record.schema != "epi.nara-episode-record/v1"
        || record.episode_ref != paths.episode_ref
        || record.day_ref != paths.day_ref
        || record.day_id != context.day_id
        || record.session_key != context.session_key
        || record.privacy_class != "protected-local-body"
    {
        return Err("Nara episode record identity/privacy invariant failed".to_owned());
    }
    Ok(())
}

fn normalize_body(body: String) -> String {
    body.replace("\r\n", "\n").replace('\r', "\n")
}

fn ensure_day_dir(path: &Path) -> Result<(), String> {
    fs::create_dir_all(path).map_err(|error| format!("create protected Nara day directory: {error}"))?;
    protect_dir(path)
}

fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let tmp = path.with_extension("tmp");
    {
        let mut file = fs::File::create(&tmp).map_err(|error| format!("create protected Nara temp file: {error}"))?;
        file.write_all(bytes).map_err(|error| format!("write protected Nara temp file: {error}"))?;
        file.sync_all().map_err(|error| format!("sync protected Nara temp file: {error}"))?;
    }
    protect_file(&tmp)?;
    fs::rename(&tmp, path).map_err(|error| format!("commit protected Nara file: {error}"))
}

#[cfg(unix)]
fn protect_dir(path: &Path) -> Result<(), String> {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(path, fs::Permissions::from_mode(0o700))
        .map_err(|error| format!("protect Nara directory permissions: {error}"))
}
#[cfg(not(unix))]
fn protect_dir(_path: &Path) -> Result<(), String> { Ok(()) }

#[cfg(unix)]
fn protect_file(path: &Path) -> Result<(), String> {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(path, fs::Permissions::from_mode(0o600))
        .map_err(|error| format!("protect Nara file permissions: {error}"))
}
#[cfg(not(unix))]
fn protect_file(_path: &Path) -> Result<(), String> { Ok(()) }

fn validate_segment(value: &str, field: &str) -> Result<(), String> {
    if value.trim().is_empty() || value.contains('/') || value.contains('\\') || value == "." || value == ".." {
        return Err(format!("Nara {field} is not a safe path segment"));
    }
    Ok(())
}

fn stable_part(value: &str) -> String {
    value.chars().map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '-' }).collect()
}
