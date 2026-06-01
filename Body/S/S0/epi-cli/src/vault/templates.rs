use chrono::{DateTime, Utc};
use portal_core::VakAddress;
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
    render_template_with_vak(context, repo_root, home_root, None)
}

/// Render a template, optionally inlining canonical VAK keys (`cpf`, `ct`,
/// `cp`, `cf`, `cfp`, `cs_code`, `cs_direction`) into the SAME `---...---`
/// frontmatter block emitted by the built-in template renderer.
///
/// VAK keys are appended at the bottom of the existing frontmatter block,
/// directly above the closing `---`. This preserves the invariant that the
/// persisted artifact has exactly ONE frontmatter block at the top of the
/// file — readable by Obsidian, gnosis_ingest, hen_frontmatter_validate,
/// Aletheia retrieval, and every other standard YAML-frontmatter parser.
///
/// Canonical literals (`(00/00)`, `(4.0/1-4.4/5)`, `Night'`) survive
/// because [`portal_core::CpfState`] and [`portal_core::CsDirection`] carry
/// serde `rename` markers — the same pattern as B1
/// `PromotionPlan::attach_vak_address`.
///
/// Behaviour with `vak_address = None` is identical to plain
/// [`render_template`]: emits the existing block unchanged.
///
/// When a World/template override matches (under `Idea/Bimba/World/*.md` or
/// `$HOME/.epi-logos/templates/*.md`), VAK merging is skipped — the override
/// is the authority for that artifact's frontmatter shape and we don't
/// silently rewrite user-authored templates. This is consistent with
/// `world_template_authority_precedes_built_in_template`.
pub fn render_template_with_vak(
    context: &TemplateRenderContext,
    repo_root: &Path,
    home_root: &Path,
    vak_address: Option<&VakAddress>,
) -> Result<String, String> {
    render_template_with_vak_and_summary(context, repo_root, home_root, vak_address, None)
}

/// Render a template, optionally inlining a `summary:` line AND canonical
/// VAK keys into the same `---...---` frontmatter block.
///
/// `summary` lands between the template-rendered fields and the VAK block
/// (close to the template-emitted keys; not nested under VAK). YAML-quoting
/// uses `serde_yaml::to_string` so embedded quotes, colons, newlines, and
/// other YAML-significant characters round-trip safely.
///
/// `summary = None` → no `summary:` key emitted (matches the dialogical
/// pass-through pattern used for `vak_address`).
///
/// When a World/template override matches, BOTH summary and VAK merging are
/// skipped — the override is the authority for the artifact's frontmatter
/// shape. This is consistent with
/// `world_template_authority_precedes_built_in_template`.
pub fn render_template_with_vak_and_summary(
    context: &TemplateRenderContext,
    repo_root: &Path,
    home_root: &Path,
    vak_address: Option<&VakAddress>,
    summary: Option<&str>,
) -> Result<String, String> {
    if let Some(body) = load_template_override(context, repo_root, home_root)? {
        return Ok(body);
    }
    Ok(render_builtin_template(context, vak_address, summary))
}

fn load_template_override(
    context: &TemplateRenderContext,
    repo_root: &Path,
    home_root: &Path,
) -> Result<Option<String>, String> {
    for path in candidate_paths(context, repo_root, home_root) {
        if path.exists() {
            let raw = fs::read_to_string(&path)
                .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
            return Ok(Some(substitute_template_vars(raw, context)));
        }
    }

    Ok(None)
}

fn substitute_template_vars(mut body: String, context: &TemplateRenderContext) -> String {
    let day_id = context.now.format("%d-%m-%Y").to_string();
    let created_at = context.now.to_rfc3339();
    let session_id = context.session_id.as_deref().unwrap_or("");

    // Day path used in wikilinks: e.g. "Empty/Present/05-04-2026"
    let day_path = format!("Empty/Present/{day_id}");

    body = body.replace("{{session_id}}", session_id);
    body = body.replace("{{c_2_session_id}}", session_id);
    body = body.replace("{{day_id}}", &day_id);
    body = body.replace("{{c_3_day_id}}", &day_id);
    body = body.replace("{{created_at}}", &created_at);
    body = body.replace("{{c_3_created_at}}", &created_at);
    body = body.replace("{{day_path}}", &day_path);
    body = body.replace(
        "{{coordinate}}",
        context.coordinate.as_deref().unwrap_or(""),
    );
    // day_coordinate: canonical coordinate for day-level artifacts (empty = agent fills in)
    body = body.replace("{{day_coordinate}}", "");
    body
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

fn render_builtin_template(
    context: &TemplateRenderContext,
    vak_address: Option<&VakAddress>,
    summary: Option<&str>,
) -> String {
    let normalized = normalize_template_type(&context.template_type);
    if let Some(definition) = ct_definition(&normalized) {
        // CT frozen-process templates don't carry per-artifact VAK addresses
        // (they're the process scaffolding itself). Ignore vak_address /
        // summary here.
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
    if let Some(s) = summary {
        // Emit `summary: <yaml-quoted>` BETWEEN the template-rendered fields
        // and the VAK keys. YAML-quoted via serde_yaml so quotes, colons,
        // newlines etc. survive verbatim.
        lines.push(format!("summary: {}", yaml_quote_summary(s)));
    }
    if let Some(vak) = vak_address {
        append_vak_lines(&mut lines, vak);
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

/// Append canonical VAK keys to the in-progress frontmatter line buffer.
///
/// Emitted order (canonical, mirrors A3 Hen template-vak.ts, A4 Graphiti,
/// and B1 `PromotionPlan::attach_vak_address`):
///   cpf, ct, cp, cf, cfp, cs_code, cs_direction
///
/// Why JSON serde for `cpf` and `cs_direction`:
///   - [`portal_core::CpfState`] and [`portal_core::CsDirection`] carry
///     `#[serde(rename = "...")]` markers that emit canonical literals
///     `(00/00)`, `(4.0/1-4.4/5)`, `Night'`. Round-tripping through
///     `serde_json::to_value` recovers the canonical literal as a
///     `Value::String`. Hand-rolling a Display impl would risk drift.
///   - `.expect()` is sound here: both are fieldless enums and serialization
///     is infallible. This mirrors the B1 attach_vak_address pattern.
///
/// YAML formatting choices:
///   - `cpf` and `cf` are emitted double-quoted because their canonical
///     literals contain parens and slashes (YAML reader ambiguity).
///   - `cp`, `cfp`, `cs_code` are alphanumeric coordinate codes — safe
///     unquoted. (Validated upstream by the caller.)
///   - `cs_direction` `Night'` carries a trailing apostrophe — YAML-legal
///     in an unquoted scalar position. Consistent with A3 Hen and the
///     pure TS renderer in modules/thought-vak.ts.
///   - `ct` is a YAML block sequence (one item per line, two-space
///     indentation). Each item is double-quoted via JSON.stringify-style
///     serde to preserve any embedded characters.
/// YAML-quote a summary string for safe inlining as `summary: <value>`.
///
/// Delegates to `serde_yaml::to_string` so that embedded quotes, colons,
/// newlines, leading whitespace, etc. survive a YAML round-trip. The trailing
/// `\n` that `serde_yaml::to_string` always emits is stripped before return,
/// because the caller appends its own newline when joining the frontmatter
/// lines.
///
/// For typical short summaries serde_yaml emits a plain scalar (no quotes);
/// for summaries containing YAML-significant characters it emits a properly
/// quoted scalar.
fn yaml_quote_summary(value: &str) -> String {
    match serde_yaml::to_string(value) {
        Ok(serialized) => serialized.trim_end_matches('\n').to_string(),
        // serde_yaml::to_string on a borrowed &str is infallible in practice;
        // if it ever fails fall back to a JSON-encoded double-quoted scalar,
        // which is YAML 1.2-compatible.
        Err(_) => serde_json::to_string(value)
            .unwrap_or_else(|_| format!("\"{}\"", value.replace('"', "\\\""))),
    }
}

fn append_vak_lines(lines: &mut Vec<String>, vak: &VakAddress) {
    let cpf_literal = serde_json::to_value(&vak.cpf)
        .expect("CpfState serialization is infallible (fieldless enum)")
        .as_str()
        .expect("CpfState serializes to a string via serde rename")
        .to_owned();
    let cs_direction_literal = serde_json::to_value(&vak.cs.direction)
        .expect("CsDirection serialization is infallible (fieldless enum)")
        .as_str()
        .expect("CsDirection serializes to a string via serde rename")
        .to_owned();

    lines.push(format!("cpf: \"{cpf_literal}\""));
    lines.push("ct:".to_string());
    for item in &vak.ct {
        let quoted =
            serde_json::to_string(item).expect("String serialization to JSON is infallible");
        lines.push(format!("  - {quoted}"));
    }
    lines.push(format!("cp: {}", vak.cp));
    lines.push(format!("cf: \"{}\"", vak.cf));
    lines.push(format!("cfp: {}", vak.cfp));
    lines.push(format!("cs_code: {}", vak.cs.code));
    lines.push(format!("cs_direction: {cs_direction_literal}"));
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
            cf_gate: "CF(4.5/0)",
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
