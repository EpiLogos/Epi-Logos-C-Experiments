//! S1 Hen compiler contract.

mod smart_env;

use std::path::PathBuf;

use serde_yaml::{Mapping, Value};

pub use smart_env::{
    suggest_link_candidates, LinkCandidate, LinkCandidateKind, LinkCandidateRequest,
    LinkCandidateResponse,
};

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct HenTimestamp {
    pub year: i32,
    pub month: u8,
    pub day: u8,
    pub hour: u8,
    pub minute: u8,
    pub second: u8,
}

impl HenTimestamp {
    pub const fn new(year: i32, month: u8, day: u8, hour: u8, minute: u8, second: u8) -> Self {
        Self {
            year,
            month,
            day,
            hour,
            minute,
            second,
        }
    }

    pub fn canonical_day_id(self) -> String {
        format!("{:02}-{:02}-{:04}", self.day, self.month, self.year)
    }

    pub fn vendor_day_id(self) -> String {
        format!("{:04}-{:02}-{:02}", self.year, self.month, self.day)
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ExecutorKind {
    PiAgent,
    Service,
    VendorClaudeSdk,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum TargetAgent {
    Anima,
    Epii,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LedgerChannel {
    pub name: &'static str,
    pub ledger_name: &'static str,
    pub compiler_name: &'static str,
    pub return_name: &'static str,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CompilerResidencyPlan {
    pub source_path: PathBuf,
    pub compiled_path: PathBuf,
    pub vendor_source_alias: PathBuf,
    pub vendor_knowledge_alias: PathBuf,
    pub thought_lane: String,
    pub day_id: String,
    pub artifact_slug: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CompilerInvocation {
    pub executor_kind: ExecutorKind,
    pub target_agent: TargetAgent,
    pub required_plugin: &'static str,
    pub required_skill: String,
    pub tool_boundary: String,
    pub review_policy: &'static str,
    pub mutation_mode: &'static str,
    pub compatibility_backend: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CompilePlanRequest {
    pub vault_root: PathBuf,
    pub compiler_root: PathBuf,
    pub now: HenTimestamp,
    pub channel: String,
    pub thought_lane: String,
    pub artifact_slug: String,
    pub executor_kind: ExecutorKind,
    pub target_agent: TargetAgent,
    pub required_skill: Option<String>,
    pub dry_run: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CompilePlanResponse {
    pub compiled: usize,
    pub ledger_entries: Vec<String>,
    pub artifacts: Vec<PathBuf>,
    pub errors: Vec<String>,
    pub source_paths: Vec<PathBuf>,
    pub invocation: Option<CompilerInvocation>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum GraphSyncMode {
    CanonicalWrite,
    MigrateLegacyCoordinate,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GraphSyncIntent {
    pub mode: GraphSyncMode,
    pub coordinate: String,
    pub vault_path: PathBuf,
    pub target_label: &'static str,
    pub coordinate_property: &'static str,
    pub compatibility_source_label: Option<&'static str>,
    pub compatibility_source_property: Option<&'static str>,
    pub touches_live_graph: bool,
}

#[derive(Debug, Default, Eq, PartialEq)]
pub struct ValidationResult {
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

const CF_NAMES: &[&str] = &[
    "CF_VOID",
    "CF_BINARY",
    "CF_TRIKA",
    "CF_QUATERNAL",
    "CF_FRACTAL",
    "CF_SYNTHESIS",
    "CF_MOBIUS",
];
const VAK_NAMES: &[&str] = &["CPF", "CT", "CP", "CF", "CFP", "CS"];
const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];
const CANONICAL_METADATA_KEYS: &[&str] = &[
    "coordinate",
    "family",
    "artifact_role",
    "aletheia_verifies",
    "ctx_type",
    "invocation_profile",
    "source_coordinate",
    "parent_day_id",
    "now_id",
    "day_id",
    "session_id",
    "parent_session_id",
    "created_at",
    "updated_at",
    "merged_at",
    "merge_reason",
    "provenance_refs",
    "invocation_kind",
    "thought_type",
    "l_alignments",
];
const DEPRECATED_PATTERNS: &[&str] = &["bimbaCoordinate", "ql_position"];

pub const ENVELOPE_LEDGER_CHANNELS: &[LedgerChannel] = &[
    LedgerChannel {
        name: "transport",
        ledger_name: "transport.ledger",
        compiler_name: "transport_compiler",
        return_name: "transport_ctx",
    },
    LedgerChannel {
        name: "runtime",
        ledger_name: "runtime.ledger",
        compiler_name: "runtime_compiler",
        return_name: "runtime_ctx",
    },
    LedgerChannel {
        name: "temporal",
        ledger_name: "temporal.ledger",
        compiler_name: "temporal_compiler",
        return_name: "temporal_ctx",
    },
    LedgerChannel {
        name: "coordinate",
        ledger_name: "coordinate.ledger",
        compiler_name: "coordinate_compiler",
        return_name: "coordinate_ctx",
    },
    LedgerChannel {
        name: "residency",
        ledger_name: "residency.ledger",
        compiler_name: "residency_compiler",
        return_name: "residency_ctx",
    },
    LedgerChannel {
        name: "context",
        ledger_name: "context.ledger",
        compiler_name: "context_compiler",
        return_name: "context_pool",
    },
    LedgerChannel {
        name: "environs",
        ledger_name: "environs.ledger",
        compiler_name: "environs_compiler",
        return_name: "environs_ctx",
    },
    LedgerChannel {
        name: "execution",
        ledger_name: "execution.ledger",
        compiler_name: "execution_compiler",
        return_name: "execution_ctx",
    },
    LedgerChannel {
        name: "episodic",
        ledger_name: "episodic.ledger",
        compiler_name: "episodic_compiler",
        return_name: "episode_ctx",
    },
    LedgerChannel {
        name: "crystallisation",
        ledger_name: "crystallisation.ledger",
        compiler_name: "crystallisation_compiler",
        return_name: "crystallisation_ctx",
    },
    LedgerChannel {
        name: "improvement",
        ledger_name: "improvement.ledger",
        compiler_name: "improvement_compiler",
        return_name: "improvement_ctx",
    },
    LedgerChannel {
        name: "ql",
        ledger_name: "ql.ledger",
        compiler_name: "ql_compiler",
        return_name: "ql_ctx",
    },
];

pub fn ql_first_channels() -> Vec<LedgerChannel> {
    let mut channels = Vec::with_capacity(ENVELOPE_LEDGER_CHANNELS.len());
    channels.extend(
        ENVELOPE_LEDGER_CHANNELS
            .iter()
            .filter(|channel| channel.name == "ql")
            .cloned(),
    );
    channels.extend(
        ENVELOPE_LEDGER_CHANNELS
            .iter()
            .filter(|channel| channel.name != "ql")
            .cloned(),
    );
    channels
}

pub fn resolve_compiler_residency(
    vault_root: PathBuf,
    compiler_root: PathBuf,
    now: HenTimestamp,
    thought_lane: String,
    artifact_slug: String,
) -> Result<CompilerResidencyPlan, String> {
    if !matches!(
        thought_lane.as_str(),
        "T0" | "T1" | "T2" | "T3" | "T4" | "T5"
    ) {
        return Err("thought_lane must be T0 through T5".to_owned());
    }
    if artifact_slug.is_empty() {
        return Err("artifact_slug must be non-empty".to_owned());
    }

    let day_id = now.canonical_day_id();
    let source_path = vault_root
        .join("Empty")
        .join("Present")
        .join(&day_id)
        .join("daily-note.md");
    let compiled_path = vault_root
        .join("Pratibimba")
        .join("Self")
        .join("Thought")
        .join("T")
        .join(&thought_lane)
        .join(format!("{artifact_slug}.md"));
    let vendor_source_alias = compiler_root
        .join("daily")
        .join(format!("{}.md", now.vendor_day_id()));
    let vendor_knowledge_alias = compiler_root
        .join("knowledge")
        .join("concepts")
        .join(format!("{artifact_slug}.md"));

    Ok(CompilerResidencyPlan {
        source_path,
        compiled_path,
        vendor_source_alias,
        vendor_knowledge_alias,
        thought_lane,
        day_id,
        artifact_slug,
    })
}

pub fn plan_compile(request: CompilePlanRequest) -> CompilePlanResponse {
    if !request.dry_run && request.executor_kind != ExecutorKind::PiAgent {
        return CompilePlanResponse::error("non-dry-run compile requires pi_agent executor");
    }

    let invocation = compiler_invocation(
        request.executor_kind,
        request.target_agent,
        request.required_skill.as_deref(),
        request.dry_run,
    );

    if !request.dry_run {
        return CompilePlanResponse {
            compiled: 0,
            ledger_entries: vec![],
            artifacts: vec![],
            errors: vec!["non-dry-run compile is not implemented in the Hen facade yet".to_owned()],
            source_paths: vec![],
            invocation: Some(invocation),
        };
    }

    let Some(channel) = ENVELOPE_LEDGER_CHANNELS
        .iter()
        .find(|channel| channel.name == request.channel)
    else {
        return CompilePlanResponse {
            compiled: 0,
            ledger_entries: vec![],
            artifacts: vec![],
            errors: vec![format!("unknown ledger channel: {}", request.channel)],
            source_paths: vec![],
            invocation: Some(invocation),
        };
    };

    let residency = match resolve_compiler_residency(
        request.vault_root,
        request.compiler_root,
        request.now,
        request.thought_lane,
        request.artifact_slug,
    ) {
        Ok(residency) => residency,
        Err(error) => {
            return CompilePlanResponse {
                compiled: 0,
                ledger_entries: vec![],
                artifacts: vec![],
                errors: vec![error],
                source_paths: vec![],
                invocation: Some(invocation),
            };
        }
    };

    if !residency.source_path.exists() {
        return CompilePlanResponse {
            compiled: 0,
            ledger_entries: vec![],
            artifacts: vec![],
            errors: vec![format!(
                "source path does not exist: {}",
                residency.source_path.display()
            )],
            source_paths: vec![residency.source_path],
            invocation: Some(invocation),
        };
    }

    CompilePlanResponse {
        compiled: 0,
        ledger_entries: vec![channel.ledger_name.to_owned()],
        artifacts: vec![residency.compiled_path],
        errors: vec![],
        source_paths: vec![residency.source_path],
        invocation: Some(invocation),
    }
}

pub fn is_valid_coordinate(coord: &str) -> bool {
    if coord == "#" {
        return true;
    }

    if let Some(rest) = coord.strip_prefix('#') {
        return rest.parse::<u8>().is_ok_and(|n| n <= 5);
    }

    if coord.starts_with("Weave_") {
        return true;
    }

    if coord.starts_with("CF_") {
        return CF_NAMES.contains(&coord);
    }

    if VAK_NAMES.contains(&coord) {
        return true;
    }

    let base = coord.strip_suffix('\'').unwrap_or(coord);
    if base.len() == 2 {
        let family = &base[..1];
        let pos = &base[1..];
        return FAMILIES.contains(&family) && pos.parse::<u8>().is_ok_and(|n| n <= 5);
    }

    false
}

pub fn validate_frontmatter(yaml: &Value) -> ValidationResult {
    let mut result = ValidationResult::default();

    let map = match yaml.as_mapping() {
        Some(map) => map,
        None => {
            result
                .errors
                .push("Frontmatter is not a YAML mapping".to_owned());
            return result;
        }
    };

    validate_identity(map, &mut result);
    validate_keys(map, &mut result);
    validate_temporal_requirements(map, &mut result.errors);

    result
}

pub fn validate_compile_artifact_frontmatter(
    yaml: &Value,
    residency: &CompilerResidencyPlan,
    invocation: &CompilerInvocation,
) -> ValidationResult {
    let mut result = validate_frontmatter(yaml);
    let Some(map) = yaml.as_mapping() else {
        return result;
    };

    require_string_value(
        map,
        &mut result.errors,
        "artifact_role",
        "thought",
        "compiled artifact_role",
    );
    require_string_value(
        map,
        &mut result.errors,
        "coordinate",
        &residency.thought_lane,
        "compiled coordinate",
    );
    require_string_value(map, &mut result.errors, "family", "T", "compiled family");
    require_string_value(
        map,
        &mut result.errors,
        "day_id",
        &residency.day_id,
        "compiled day_id",
    );
    require_string_value(
        map,
        &mut result.errors,
        "invocation_kind",
        executor_kind_name(invocation.executor_kind),
        "invocation_kind",
    );

    validate_compiled_provenance(map, residency, &mut result.errors);

    result
}

pub fn graph_sync_intent(
    coordinate: &str,
    vault_path: PathBuf,
    compatibility_source_label: Option<&str>,
) -> Result<GraphSyncIntent, String> {
    if !is_valid_coordinate(coordinate) {
        return Err(format!("invalid graph sync coordinate: {coordinate}"));
    }

    let legacy_label = match compatibility_source_label {
        Some("BimbaCoordinate") => Some("BimbaCoordinate"),
        Some("BimbaNode") => Some("BimbaNode"),
        Some(other) => return Err(format!("unsupported compatibility graph label: {other}")),
        None => None,
    };

    Ok(GraphSyncIntent {
        mode: if legacy_label.is_some() {
            GraphSyncMode::MigrateLegacyCoordinate
        } else {
            GraphSyncMode::CanonicalWrite
        },
        coordinate: coordinate.to_owned(),
        vault_path,
        target_label: "Bimba",
        coordinate_property: "coordinate",
        compatibility_source_label: legacy_label,
        compatibility_source_property: legacy_label.map(|_| "bimbaCoordinate"),
        touches_live_graph: false,
    })
}

fn validate_identity(map: &Mapping, result: &mut ValidationResult) {
    if let Some(value) = map.get(Value::String("coordinate".to_owned())) {
        match value.as_str() {
            Some(coord) if is_valid_coordinate(coord) => {}
            Some(coord) => result.errors.push(format!("Invalid coordinate: '{coord}'")),
            None => result.errors.push("coordinate must be a string".to_owned()),
        }
    }

    if let Some(value) = map.get(Value::String("bimbaCoordinate".to_owned())) {
        match value.as_str() {
            Some(coord) if is_valid_coordinate(coord) => {}
            Some(coord) => result
                .errors
                .push(format!("Invalid bimbaCoordinate: '{coord}'")),
            None => result
                .errors
                .push("bimbaCoordinate must be a string".to_owned()),
        }
    }

    if let Some(value) = map.get(Value::String("family".to_owned())) {
        match value.as_str() {
            Some(family) if FAMILIES.contains(&family) || family == "NONE" => {}
            Some(family) => result.errors.push(format!(
                "Invalid family '{family}', expected one of: C, P, L, S, T, M, NONE"
            )),
            None => result.errors.push("family must be a string".to_owned()),
        }
    }
}

fn validate_keys(map: &Mapping, result: &mut ValidationResult) {
    for (key, value) in map {
        let Some(key_str) = key.as_str() else {
            result
                .errors
                .push("Frontmatter keys must be strings".to_owned());
            continue;
        };

        if is_deprecated_key(key_str) {
            result
                .warnings
                .push(format!("Deprecated frontmatter key '{key_str}'"));
            continue;
        }

        if key_str == "l_alignments" {
            validate_l_alignments(value, result);
            continue;
        }

        if is_coordinate_key(key_str) {
            if let Some(error) = validate_coordinate_key(key_str, value) {
                result.errors.push(error);
            }
            continue;
        }

        if CANONICAL_METADATA_KEYS.contains(&key_str) {
            continue;
        }

        if key_str.starts_with("pos_") || key_str.starts_with("pos") {
            result
                .warnings
                .push(format!("Deprecated frontmatter key '{key_str}'"));
            continue;
        }

        result
            .errors
            .push(format!("Unknown frontmatter key '{key_str}'"));
    }
}

fn validate_temporal_requirements(map: &Mapping, errors: &mut Vec<String>) {
    let artifact_role = map
        .get(Value::String("artifact_role".to_owned()))
        .and_then(Value::as_str);

    if matches!(artifact_role, Some("now") | Some("thought")) {
        for required in ["session_id", "day_id"] {
            if !map.contains_key(Value::String(required.to_owned())) {
                errors.push(format!("Missing required temporal key '{required}'"));
            }
        }
    }

    if artifact_role == Some("thought")
        && !map.contains_key(Value::String("thought_type".to_owned()))
    {
        errors.push("Missing required thought_type for thought artifact".to_owned());
    }
}

fn require_string_value(
    map: &Mapping,
    errors: &mut Vec<String>,
    key: &str,
    expected: &str,
    label: &str,
) {
    match map
        .get(Value::String(key.to_owned()))
        .and_then(Value::as_str)
    {
        Some(actual) if actual == expected => {}
        Some(actual) => errors.push(format!("{label} must be '{expected}', got '{actual}'")),
        None => errors.push(format!("{label} must be '{expected}'")),
    }
}

fn validate_compiled_provenance(
    map: &Mapping,
    residency: &CompilerResidencyPlan,
    errors: &mut Vec<String>,
) {
    let expected = residency.source_path.display().to_string();
    let Some(value) = map.get(Value::String("provenance_refs".to_owned())) else {
        errors.push(format!(
            "provenance_refs must include compiler source path '{}'",
            expected
        ));
        return;
    };

    let Some(entries) = value.as_sequence() else {
        errors.push("provenance_refs must be a sequence of strings".to_owned());
        return;
    };

    let has_source = entries
        .iter()
        .filter_map(Value::as_str)
        .any(|entry| entry == expected);
    if !has_source {
        errors.push(format!(
            "provenance_refs must include compiler source path '{}'",
            expected
        ));
    }
}

fn is_deprecated_key(key: &str) -> bool {
    DEPRECATED_PATTERNS.contains(&key) || key.starts_with("pos_")
}

fn is_coordinate_key(key: &str) -> bool {
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    parts.len() == 3 && matches!(parts[0], "c" | "p" | "l" | "s" | "t" | "m")
}

fn validate_coordinate_key(key: &str, value: &Value) -> Option<String> {
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    if parts.len() != 3 {
        return None;
    }

    let family = parts[0];
    if !matches!(family, "c" | "p" | "l" | "s" | "t" | "m") {
        return None;
    }

    let n = match parts[1].parse::<u8>() {
        Ok(n) => n,
        Err(_) => {
            return Some(format!(
                "Coordinate key '{key}' has invalid position segment"
            ));
        }
    };

    let max_pos = if family == "l" { 11 } else { 5 };
    if n > max_pos {
        return Some(format!(
            "Coordinate key '{key}': position {n} must be 0-{max_pos} for family '{family}'"
        ));
    }

    match value {
        Value::String(_) | Value::Mapping(_) => None,
        _ => Some(format!(
            "Coordinate key '{key}' must have a string or mapping value"
        )),
    }
}

fn validate_l_alignments(value: &Value, result: &mut ValidationResult) {
    let entries = match value.as_sequence() {
        Some(entries) => entries,
        None => {
            result
                .warnings
                .push("l_alignments is present but not a sequence - ignored".to_owned());
            return;
        }
    };

    for (i, entry) in entries.iter().enumerate() {
        let map = match entry.as_mapping() {
            Some(map) => map,
            None => {
                result
                    .errors
                    .push(format!("l_alignments[{i}]: entry must be a mapping"));
                continue;
            }
        };

        let get_str = |field: &str| -> Option<&str> {
            map.get(Value::String(field.to_owned()))
                .and_then(Value::as_str)
        };
        let get_u64 = |field: &str| -> Option<u64> {
            map.get(Value::String(field.to_owned()))
                .and_then(Value::as_u64)
        };

        if get_str("lens").is_none() {
            result.errors.push(format!(
                "l_alignments[{i}]: missing required 'lens' string field"
            ));
        }

        let lens_index = match get_u64("lens_index") {
            Some(n) if n <= 11 => Some(n),
            Some(n) => {
                result.errors.push(format!(
                    "l_alignments[{i}]: lens_index {n} is out of range (must be 0-11)"
                ));
                None
            }
            None => {
                result.errors.push(format!(
                    "l_alignments[{i}]: missing or non-integer 'lens_index'"
                ));
                None
            }
        };

        let mode = get_str("mode");
        match mode {
            Some("day") | Some("night") => {}
            Some(other) => result.errors.push(format!(
                "l_alignments[{i}]: invalid mode '{other}' - must be 'day' or 'night'"
            )),
            None => result
                .errors
                .push(format!("l_alignments[{i}]: missing required 'mode' field")),
        }

        if let (Some(idx), Some(mode)) = (lens_index, mode) {
            let expected = if idx <= 5 { "day" } else { "night" };
            if mode != expected {
                result.errors.push(format!(
                    "l_alignments[{i}]: lens_index {idx} is a {expected}-mode lens but mode is set to '{mode}'"
                ));
            }
        }

        if let Some(weight) = map.get(Value::String("weight".to_owned())) {
            let weight = match weight {
                Value::Number(number) => number.as_f64(),
                _ => None,
            };
            match weight {
                Some(weight) if (0.0..=1.0).contains(&weight) => {}
                Some(weight) => result.errors.push(format!(
                    "l_alignments[{i}]: weight {weight} is out of range (must be 0.0-1.0)"
                )),
                None => result
                    .errors
                    .push(format!("l_alignments[{i}]: weight must be a float")),
            }
        }

        if let Some(klein_square) = map.get(Value::String("klein_square".to_owned())) {
            match klein_square.as_sequence() {
                Some(seq) if seq.len() == 4 => {
                    for (j, elem) in seq.iter().enumerate() {
                        if elem.as_str().is_none() {
                            result.errors.push(format!(
                                "l_alignments[{i}].klein_square[{j}]: must be a string"
                            ));
                        }
                    }
                }
                Some(seq) => result.errors.push(format!(
                    "l_alignments[{i}]: klein_square must be a 4-element array (got {})",
                    seq.len()
                )),
                None => result.errors.push(format!(
                    "l_alignments[{i}]: klein_square must be a sequence"
                )),
            }
        }
    }
}

impl CompilePlanResponse {
    fn error(message: &str) -> Self {
        Self {
            compiled: 0,
            ledger_entries: vec![],
            artifacts: vec![],
            errors: vec![message.to_owned()],
            source_paths: vec![],
            invocation: None,
        }
    }
}

pub fn compiler_invocation(
    executor_kind: ExecutorKind,
    target_agent: TargetAgent,
    required_skill: Option<&str>,
    dry_run: bool,
) -> CompilerInvocation {
    let required_plugin = match target_agent {
        TargetAgent::Anima => "pleroma",
        TargetAgent::Epii => "epi-logos",
    };
    let required_skill = required_skill
        .map(str::to_owned)
        .unwrap_or_else(|| match target_agent {
            TargetAgent::Anima => "anima-orchestration".to_owned(),
            TargetAgent::Epii => "autoresearch".to_owned(),
        });
    let tool_boundary = match executor_kind {
        ExecutorKind::VendorClaudeSdk => "vendor_compat_read_write".to_owned(),
        ExecutorKind::PiAgent => format!("{target_agent:?}").to_lowercase() + "_bounded_pi_tools",
        ExecutorKind::Service => "service_internal_compile_tools".to_owned(),
    };

    CompilerInvocation {
        executor_kind,
        target_agent,
        required_plugin,
        required_skill,
        tool_boundary,
        review_policy: "epii_inbox",
        mutation_mode: if dry_run { "dry_run" } else { "apply" },
        compatibility_backend: executor_kind == ExecutorKind::VendorClaudeSdk,
    }
}

fn executor_kind_name(kind: ExecutorKind) -> &'static str {
    match kind {
        ExecutorKind::PiAgent => "pi_agent",
        ExecutorKind::Service => "service",
        ExecutorKind::VendorClaudeSdk => "vendor_claude_sdk",
    }
}
