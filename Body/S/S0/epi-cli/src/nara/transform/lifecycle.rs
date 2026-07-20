//! Coordinate: S0/M4' (governed transform-container lifecycle)
//! Residency: Body/S/S0/epi-cli/src/nara/transform
//! Position (#n): gateway-backed state and contemplative-artifact adapter
//! Actualises: guarded canonical stage transitions and active NOW operation.
//! Public surface: `start_container`, `advance_container`.
//! Does NOT own: frontmatter mutation law, carrier rendering, or user consent.
//! Contract: [[S0-SPEC]] / [[S1-SPEC]] / [[S3-SPEC]] / [[M4'-SPEC]].

use epi_s1_hen_compiler_core::set_frontmatter_string;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

static TRANSFORM_MUTATION_LOCK: Mutex<()> = Mutex::new(());
static TRANSFORM_SEQUENCE: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum TransformContainerMode {
    BohmDialogue,
    TalkingCircle,
    Diamond,
}

impl TransformContainerMode {
    fn parse(value: &str) -> Result<Self, String> {
        match value {
            "bohm-dialogue" => Ok(Self::BohmDialogue),
            "talking-circle" => Ok(Self::TalkingCircle),
            "diamond" => Ok(Self::Diamond),
            _ => {
                Err("container must be one of bohm-dialogue, talking-circle, or diamond".to_owned())
            }
        }
    }

    fn definition(self) -> &'static TransformContainerDefinition {
        match self {
            Self::BohmDialogue => &BOHM_DIALOGUE_DEFINITION,
            Self::TalkingCircle => &TALKING_CIRCLE_DEFINITION,
            Self::Diamond => &DIAMOND_DEFINITION,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformStage {
    id: &'static str,
    label: &'static str,
    description: &'static str,
    alchemical_op: &'static str,
    l2_prime_register: &'static str,
}

struct TransformContainerDefinition {
    stages: &'static [TransformStage],
}

const BOHM_DIALOGUE_STAGES: [TransformStage; 5] = [
    stage(
        "bohm-suspension",
        "Suspension",
        "The first mass of assumption is held without immediate correction.",
        "nigredo",
        "L2-1' Earth",
    ),
    stage(
        "bohm-proprioception",
        "Proprioception of thought",
        "Thought senses itself as an event in the field.",
        "separatio",
        "L2' relational operation",
    ),
    stage(
        "bohm-observer-collapse",
        "Observer-observed collapse",
        "The observer is included in what is being observed.",
        "conjunctio",
        "L2' relational operation",
    ),
    stage(
        "bohm-shared-meaning",
        "Shared meaning",
        "Rigid positions dissolve into a common pool of sense.",
        "solutio",
        "L2-2' Water",
    ),
    stage(
        "bohm-generative-field",
        "Generative field",
        "Subtle implications rise without being forced into conclusion.",
        "sublimatio",
        "L2-3' Air",
    ),
];

const TALKING_CIRCLE_STAGES: [TransformStage; 4] = [
    stage(
        "circle-passage",
        "Passage",
        "The threshold is crossed from ordinary talk into witnessed exchange.",
        "solutio",
        "L2-2' Water",
    ),
    stage(
        "circle-speaker-listener",
        "Speaker-listener",
        "Voice and reception become distinct responsibilities.",
        "separatio",
        "L2' relational operation",
    ),
    stage(
        "circle-silence-speech",
        "Silence-as-speech",
        "The unsaid becomes an active carrier of meaning.",
        "sublimatio",
        "L2-3' Air",
    ),
    stage(
        "circle-council-memory",
        "Council memory",
        "What has been spoken settles as a held communal form.",
        "coagulatio",
        "L2-5' Salt",
    ),
];

const DIAMOND_STAGES: [TransformStage; 4] = [
    stage(
        "diamond-essence",
        "Essence",
        "The fixed center is remembered before the pattern explains itself.",
        "fixatio",
        "L2-5' Salt",
    ),
    stage(
        "diamond-personality",
        "Personality",
        "The formed self is seen as a workable crystallisation.",
        "coagulatio",
        "L2-5' Salt",
    ),
    stage(
        "diamond-contraction",
        "Contraction",
        "The defensive knot is heated until the inessential burns away.",
        "calcinatio",
        "L2-4' Fire",
    ),
    stage(
        "diamond-opening",
        "Opening",
        "The divided movement returns as a relational aperture.",
        "conjunctio",
        "L2' relational operation",
    ),
];

static BOHM_DIALOGUE_DEFINITION: TransformContainerDefinition = TransformContainerDefinition {
    stages: &BOHM_DIALOGUE_STAGES,
};
static TALKING_CIRCLE_DEFINITION: TransformContainerDefinition = TransformContainerDefinition {
    stages: &TALKING_CIRCLE_STAGES,
};
static DIAMOND_DEFINITION: TransformContainerDefinition = TransformContainerDefinition {
    stages: &DIAMOND_STAGES,
};

const fn stage(
    id: &'static str,
    label: &'static str,
    description: &'static str,
    alchemical_op: &'static str,
    l2_prime_register: &'static str,
) -> TransformStage {
    TransformStage {
        id,
        label,
        description,
        alchemical_op,
        l2_prime_register,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ActiveTransformState {
    container: TransformContainerMode,
    stage_index: usize,
    updated_at: u64,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TransformDirection {
    Advance,
    Regress,
}

impl TransformDirection {
    pub fn parse(value: Option<&str>) -> Result<Self, String> {
        match value.unwrap_or("advance") {
            "advance" => Ok(Self::Advance),
            "regress" => Ok(Self::Regress),
            _ => Err("direction must be advance or regress".to_owned()),
        }
    }
}

#[derive(Debug, Serialize)]
struct TransformTransitionPayload {
    container: TransformContainerMode,
    #[serde(rename = "fromStage")]
    from_stage: String,
    #[serde(rename = "toStage")]
    to_stage: String,
    alchemical_op: &'static str,
}

#[derive(Debug, Serialize)]
struct TransformTransitionArtifact {
    kind: &'static str,
    payload: TransformTransitionPayload,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformLifecycleReceipt {
    container: TransformContainerMode,
    stage_index: usize,
    stage_count: usize,
    stages: &'static [TransformStage],
    stage: TransformStage,
    transition: TransformTransitionArtifact,
    direction: TransformDirection,
    artifact_path: String,
}

/// Begin a canonical transform container at its first governed stage.
pub fn start_container(container: &str) -> Result<TransformLifecycleReceipt, String> {
    let container = TransformContainerMode::parse(container)?;
    persist_transition(container, None, 0, TransformDirection::Advance)
}

/// Move the active container one stage, refusing stale clients and implicit regressions.
pub fn advance_container(
    container: &str,
    expected_stage: &str,
    direction: TransformDirection,
    confirmed_backstep: bool,
) -> Result<TransformLifecycleReceipt, String> {
    let container = TransformContainerMode::parse(container)?;
    let _guard = TRANSFORM_MUTATION_LOCK
        .lock()
        .map_err(|_| "transform mutation lock is poisoned".to_owned())?;
    let state = load_active_state()?;
    if state.container != container {
        return Err("container does not match the active transform lifecycle".to_owned());
    }
    let definition = container.definition();
    let current = definition
        .stages
        .get(state.stage_index)
        .ok_or_else(|| "active transform stage is outside its canonical container".to_owned())?;
    if current.id != expected_stage {
        return Err(format!(
            "expectedStage is stale: active stage is {}",
            current.id
        ));
    }
    if direction == TransformDirection::Regress && !confirmed_backstep {
        return Err("regress requires confirmedBackstep: true".to_owned());
    }
    let next_index = match direction {
        TransformDirection::Advance => state.stage_index.checked_add(1),
        TransformDirection::Regress => state.stage_index.checked_sub(1),
    }
    .filter(|index| *index < definition.stages.len())
    .ok_or_else(|| "transform lifecycle is already at that boundary".to_owned())?;
    persist_transition_locked(container, Some(state.stage_index), next_index, direction)
}

fn persist_transition(
    container: TransformContainerMode,
    from_index: Option<usize>,
    to_index: usize,
    direction: TransformDirection,
) -> Result<TransformLifecycleReceipt, String> {
    let _guard = TRANSFORM_MUTATION_LOCK
        .lock()
        .map_err(|_| "transform mutation lock is poisoned".to_owned())?;
    persist_transition_locked(container, from_index, to_index, direction)
}

fn persist_transition_locked(
    container: TransformContainerMode,
    from_index: Option<usize>,
    to_index: usize,
    direction: TransformDirection,
) -> Result<TransformLifecycleReceipt, String> {
    let definition = container.definition();
    let to = *definition
        .stages
        .get(to_index)
        .ok_or_else(|| "target stage is outside its canonical container".to_owned())?;
    let from_stage = from_index
        .and_then(|index| definition.stages.get(index))
        .map(|stage| stage.id)
        .unwrap_or("unstarted");
    let now_path = std::env::var_os("EPI_NOW_PATH")
        .map(PathBuf::from)
        .ok_or_else(|| "EPI_NOW_PATH is required for a governed transform".to_owned())?;
    let now_source =
        fs::read_to_string(&now_path).map_err(|error| format!("could not read NOW: {error}"))?;
    let updated_now =
        set_frontmatter_string(&now_source, "c_4_active_alchemical_op", to.alchemical_op)?;
    let payload = TransformTransitionPayload {
        container,
        from_stage: from_stage.to_owned(),
        to_stage: to.id.to_owned(),
        alchemical_op: to.alchemical_op,
    };
    let artifact_path = write_transition_artifact(&now_path, &payload, direction)?;
    if let Err(error) = atomic_replace(&now_path, updated_now.as_bytes(), "transform-now") {
        let _ = fs::remove_file(&artifact_path);
        return Err(error);
    }
    let state = ActiveTransformState {
        container,
        stage_index: to_index,
        updated_at: current_epoch(),
    };
    if let Err(error) = persist_active_state(&state) {
        let _ = atomic_replace(&now_path, now_source.as_bytes(), "transform-rollback");
        let _ = fs::remove_file(&artifact_path);
        return Err(error);
    }

    Ok(TransformLifecycleReceipt {
        container,
        stage_index: to_index,
        stage_count: definition.stages.len(),
        stages: definition.stages,
        stage: to,
        transition: TransformTransitionArtifact {
            kind: "contemplative",
            payload,
        },
        direction,
        artifact_path: artifact_path.to_string_lossy().into_owned(),
    })
}

fn active_state_path() -> PathBuf {
    super::super::identity::nara_home()
        .join("transform")
        .join("active.json")
}

fn load_active_state() -> Result<ActiveTransformState, String> {
    let path = active_state_path();
    let source = fs::read_to_string(&path)
        .map_err(|error| format!("no active transform lifecycle: {error}"))?;
    serde_json::from_str(&source)
        .map_err(|error| format!("invalid active transform state: {error}"))
}

fn persist_active_state(state: &ActiveTransformState) -> Result<(), String> {
    let path = active_state_path();
    let bytes = serde_json::to_vec_pretty(state)
        .map_err(|error| format!("could not serialize transform state: {error}"))?;
    atomic_replace(&path, &bytes, "transform-state")
}

fn write_transition_artifact(
    now_path: &Path,
    payload: &TransformTransitionPayload,
    direction: TransformDirection,
) -> Result<PathBuf, String> {
    let directory = now_path
        .parent()
        .ok_or_else(|| "NOW path has no session directory".to_owned())?
        .join("transform-transitions");
    fs::create_dir_all(&directory)
        .map_err(|error| format!("could not create transition artifact directory: {error}"))?;
    let sequence = TRANSFORM_SEQUENCE.fetch_add(1, Ordering::Relaxed);
    let path = directory.join(format!("{:020}-{sequence:06}.md", current_epoch_millis()));
    let container = serde_json::to_value(payload.container)
        .ok()
        .and_then(|value| value.as_str().map(str::to_owned))
        .ok_or_else(|| "could not serialize transform container".to_owned())?;
    let body = format!(
        "---\ncoordinate: M4\nkind: contemplative\nc_4_artifact_role: transform-transition\ncontainer: {container}\nfromStage: {}\ntoStage: {}\nalchemical_op: {}\ndirection: {}\n---\n\n# Transform transition\n\n{} -> {}\n",
        payload.from_stage,
        payload.to_stage,
        payload.alchemical_op,
        match direction {
            TransformDirection::Advance => "advance",
            TransformDirection::Regress => "regress",
        },
        payload.from_stage,
        payload.to_stage,
    );
    atomic_replace(&path, body.as_bytes(), "transform-artifact")?;
    Ok(path)
}

fn atomic_replace(path: &Path, content: &[u8], tag: &str) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| format!("{tag} path has no parent directory"))?;
    fs::create_dir_all(parent)
        .map_err(|error| format!("could not create {tag} parent: {error}"))?;
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| format!("{tag} path has no valid file name"))?;
    let sequence = TRANSFORM_SEQUENCE.fetch_add(1, Ordering::Relaxed);
    let temporary = parent.join(format!(
        ".{file_name}.{tag}-{}-{sequence}",
        std::process::id()
    ));
    let result = (|| -> Result<(), String> {
        let mut file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(&temporary)
            .map_err(|error| format!("could not create temporary {tag}: {error}"))?;
        file.write_all(content)
            .and_then(|_| file.sync_all())
            .map_err(|error| format!("could not flush temporary {tag}: {error}"))?;
        if let Ok(metadata) = fs::metadata(path) {
            fs::set_permissions(&temporary, metadata.permissions())
                .map_err(|error| format!("could not preserve {tag} permissions: {error}"))?;
        }
        fs::rename(&temporary, path)
            .map_err(|error| format!("could not atomically replace {tag}: {error}"))
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

fn current_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn current_epoch_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
