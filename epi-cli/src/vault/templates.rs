use chrono::{DateTime, Utc};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TemplateRenderContext {
    pub template_type: String,
    pub coordinate: Option<String>,
    pub session_id: Option<String>,
    pub now: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct CTDefinition {
    level: &'static str,
    cf_gate: &'static str,
    included: &'static [&'static str],
    title: &'static str,
}

const WORLD_ROOT: &str = "Idea/Bimba/World";

pub fn render_template(
    context: &TemplateRenderContext,
    repo_root: &Path,
    home_root: &Path,
) -> Result<String, String> {
    if let Some(body) = load_template_override(context, repo_root, home_root)? {
        return Ok(body);
    }
    Ok(render_builtin_template(context))
}

fn load_template_override(
    context: &TemplateRenderContext,
    repo_root: &Path,
    home_root: &Path,
) -> Result<Option<String>, String> {
    for path in candidate_paths(context, repo_root, home_root) {
        if path.exists() {
            let body = fs::read_to_string(&path)
                .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
            return Ok(Some(body));
        }
    }

    Ok(None)
}

fn candidate_paths(
    context: &TemplateRenderContext,
    repo_root: &Path,
    home_root: &Path,
) -> Vec<PathBuf> {
    let normalized = normalize_template_type(&context.template_type);
    let mut candidates = Vec::new();

    candidates.push(
        repo_root
            .join(WORLD_ROOT)
            .join(canonical_form_filename(&normalized)),
    );
    candidates.push(
        home_root
            .join(".epi-logos")
            .join("templates")
            .join(canonical_form_filename(&normalized)),
    );
    candidates
}

fn render_builtin_template(context: &TemplateRenderContext) -> String {
    let normalized = normalize_template_type(&context.template_type);
    if let Some(definition) = ct_definition(&normalized) {
        return render_builtin_ct(definition, context);
    }

    if normalized == "flow" {
        let day_id = context.now.format("%d-%m-%Y").to_string();
        let created_at = context.now.to_rfc3339();
        return format!(
            "---\ncoordinate: \"\"\nc_4_artifact_role: \"flow\"\nc_1_ctx_type: \"CT0\"\nc_3_ctx_frame: \"00/00\"\nc_4_invocation_profile: \"daily_flow\"\nc_4_invocation_kind: \"cron\"\nm_4_nara_domain: \"journal\"\nc_3_day_id: \"{day_id}\"\nc_0_source_coordinates: []\nc_3_created_at: \"{created_at}\"\n---\n\n# Flow — {day_id}\n\n*Free-flow writing space. No structure required.*\n"
        );
    }

    let artifact_role = normalized.as_str();
    let day_id = context.now.format("%d-%m-%Y").to_string();
    let timestamp = context.now.to_rfc3339();
    let family = context
        .coordinate
        .as_deref()
        .and_then(|coordinate| coordinate.chars().next())
        .map(|c| c.to_string())
        .unwrap_or_else(|| "NONE".to_string());

    let mut lines = Vec::new();
    lines.push("---".to_string());
    if let Some(coordinate) = &context.coordinate {
        lines.push(format!("coordinate: \"{coordinate}\""));
    }
    lines.push(format!("family: \"{family}\""));
    lines.push(format!("artifact_role: \"{artifact_role}\""));
    lines.push(format!(
        "ctx_type: \"{}\"",
        profile_ct_mapping(&normalized).unwrap_or("CT0")
    ));
    lines.push(format!("created_at: \"{timestamp}\""));
    lines.push(format!("updated_at: \"{timestamp}\""));
    lines.push(format!("day_id: \"{day_id}\""));
    if let Some(session_id) = &context.session_id {
        lines.push(format!("session_id: \"{session_id}\""));
    }
    if artifact_role == "thought" {
        let thought_type = context
            .coordinate
            .clone()
            .unwrap_or_else(|| "T0".to_string());
        lines.push(format!("thought_type: \"{thought_type}\""));
    }
    for key in [
        "q_essence",
        "q_correspondence",
        "q_vimarsa_field",
        "q_relational_field",
        "q_notebook_pulse",
        "q_latest_snapshot",
    ] {
        lines.push(format!("{key}: \"\""));
    }
    lines.push("---".to_string());
    lines.push(String::new());
    lines.push(format!("# {}", title_for(&normalized)));
    lines.push(String::new());

    for heading in headings_for(&normalized) {
        lines.push(format!("## {heading}"));
        lines.push(String::new());
    }

    lines.join("\n")
}

fn render_builtin_ct(definition: CTDefinition, context: &TemplateRenderContext) -> String {
    let timestamp = context.now.to_rfc3339();
    let mut lines = Vec::new();
    lines.push("---".to_string());
    lines.push("artifact_role: \"template\"".to_string());
    lines.push(format!("ctx_type: \"{}\"", definition.level));
    lines.push("invocation_profile: \"frozen_process\"".to_string());
    lines.push(format!("created_at: \"{timestamp}\""));
    lines.push("---".to_string());
    lines.push(String::new());
    lines.push(format!("# {}", definition.title));
    lines.push(String::new());
    lines.push("## Identity".to_string());
    lines.push(String::new());
    lines.push(format!("- Context Frame: {}", definition.cf_gate));
    lines.push(format!(
        "- Included Positions: {}",
        definition.included.join(", ")
    ));
    lines.push(String::new());
    lines.push("## Frozen Process".to_string());
    lines.push(String::new());
    for position in definition.included {
        lines.push(format!("## {}", human_heading(position)));
        lines.push(String::new());
    }
    lines.join("\n")
}

fn normalize_template_type(template_type: &str) -> String {
    template_type.trim().to_ascii_lowercase()
}

fn canonical_ct_filename(template_type: &str) -> Option<&'static str> {
    match template_type {
        "ct0" => Some("CT0"),
        "ct1" => Some("CT1"),
        "ct2" => Some("CT2"),
        "ct3" => Some("CT3"),
        "ct4a" => Some("CT4a"),
        "ct4b" => Some("CT4b"),
        "ct5" => Some("CT5"),
        _ => None,
    }
}

fn canonical_form_filename(template_type: &str) -> String {
    if let Some(ct_file) = canonical_ct_filename(template_type) {
        return format!("{ct_file}.md");
    }

    match template_type {
        "seed" => "Seed.md",
        "prompt" => "Prompt.md",
        "task-spec" => "Task-Spec.md",
        "pattern-note" => "Pattern-Note.md",
        "daily-note" => "Daily-Note.md",
        "now" => "NOW.md",
        "flow" => "FLOW.md",
        "thought" => "Thought.md",
        "integration-preview" => "Integration-Preview.md",
        _ => "Template.md",
    }
    .to_string()
}

fn ct_definition(template_type: &str) -> Option<CTDefinition> {
    match template_type {
        "ct0" => Some(CTDefinition {
            level: "CT0",
            cf_gate: "CF(0000)",
            included: &["0 Ground"],
            title: "CT0 Frozen Process",
        }),
        "ct1" => Some(CTDefinition {
            level: "CT1",
            cf_gate: "CF(0/1)",
            included: &["0 Question", "1 Material"],
            title: "CT1 Frozen Process",
        }),
        "ct2" => Some(CTDefinition {
            level: "CT2",
            cf_gate: "CF(0/1/2)",
            included: &["0 Question", "1 Material", "2 Analysis"],
            title: "CT2 Frozen Process",
        }),
        "ct3" => Some(CTDefinition {
            level: "CT3",
            cf_gate: "CF(0/1/2/3)",
            included: &["0 Question", "1 Material", "2 Analysis", "3 Pattern"],
            title: "CT3 Frozen Process",
        }),
        "ct4a" => Some(CTDefinition {
            level: "CT4a",
            cf_gate: "CF(4/5/0)",
            included: &["4 Context", "5 Integration", "0 Ground"],
            title: "CT4a Frozen Process",
        }),
        "ct4b" => Some(CTDefinition {
            level: "CT4b",
            cf_gate: "CF(4.0-4.4/5)",
            included: &[
                "4.0 Ground",
                "4.1 Definition",
                "4.2 Operation",
                "4.3 Pattern",
                "4.4 Context",
                "4.5 Integration",
            ],
            title: "CT4b Frozen Process",
        }),
        "ct5" => Some(CTDefinition {
            level: "CT5",
            cf_gate: "CF(5/0)",
            included: &["5 Integration", "0 Ground"],
            title: "CT5 Frozen Process",
        }),
        _ => None,
    }
}

fn profile_ct_mapping(template_type: &str) -> Option<&'static str> {
    match template_type {
        "seed" => Some("CT0"),
        "prompt" => Some("CT1"),
        "task-spec" => Some("CT2"),
        "pattern-note" => Some("CT3"),
        "daily-note" | "now" => Some("CT4b"),
        "thought" => Some("CT5"),
        _ => None,
    }
}

fn title_for(template_type: &str) -> &'static str {
    match template_type {
        "seed" => "Seed",
        "prompt" => "Prompt",
        "task-spec" => "Task Spec",
        "pattern-note" => "Pattern Note",
        "daily-note" => "Daily Note",
        "now" => "Now",
        "thought" => "Thought",
        _ => "Template",
    }
}

fn headings_for(template_type: &str) -> &'static [&'static str] {
    match template_type {
        "seed" => &["#0 Ground"],
        "prompt" => &["#0 Question", "#1 Material"],
        "task-spec" => &["#0 Question", "#1 Material", "#2 Analysis"],
        "pattern-note" => &["#0 Question", "#1 Material", "#2 Analysis", "#3 Pattern"],
        "daily-note" | "now" | "thought" => &[
            "#0 Question",
            "#1 Material",
            "#2 Analysis",
            "#3 Pattern",
            "#4 Context",
            "#5 Integration",
        ],
        _ => &["#0 Question"],
    }
}

fn human_heading(position: &str) -> &str {
    position
}

#[allow(dead_code)]
pub fn default_template_path(repo_root: &Path, template_type: &str) -> PathBuf {
    let normalized = normalize_template_type(template_type);
    repo_root
        .join(WORLD_ROOT)
        .join(canonical_form_filename(&normalized))
}
