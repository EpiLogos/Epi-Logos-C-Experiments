use chrono::Utc;
use clap::{Parser, Subcommand, ValueEnum};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Subcommand)]
pub enum SkillCmd {
    /// List registered skill surfaces from repo residency
    List {
        #[arg(long, value_enum)]
        source: Option<SkillSource>,
        #[arg(long, value_enum)]
        subsystem: Option<Subsystem>,
    },
    /// Show canonical SKILL.md for a skill name
    Show { name: String },
    /// Vendor a priority Hermes skill into the repo-local Hermes namespace
    Vendor { name: String },
    /// Draft a reviewable skill proposal from a gap description
    Propose { description: String },
    /// Scaffold a custom skill directory with canonical frontmatter
    Scaffold {
        name: String,
        #[arg(long, value_enum)]
        subsystem: Option<Subsystem>,
    },
    /// Register an existing skill in the local Agora skill index mirror
    Register { name: String },
    /// Check a vendored Hermes skill for refresh drift
    Refresh { name: String },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ValueEnum)]
#[serde(rename_all = "kebab-case")]
pub enum SkillSource {
    Vendored,
    Custom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, ValueEnum)]
pub enum Subsystem {
    M0,
    M1,
    M2,
    M3,
    M4,
    M5,
    Aletheia,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillEntry {
    pub name: String,
    pub source: SkillSource,
    pub subsystem: Subsystem,
    pub residency: String,
    pub description: String,
    pub dependencies: Vec<String>,
    pub current_rating: Option<f64>,
    pub path: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RetrainRecord {
    retrain_id: String,
    status: String,
    staged_artifact: String,
    metrics: Value,
    sample_outputs: Vec<String>,
    diff_summary: String,
    updated_at: String,
    rejection_reason: Option<String>,
}

pub fn dispatch(cmd: &SkillCmd, json_output: bool) -> Result<String, String> {
    match cmd {
        SkillCmd::List { source, subsystem } => list_skills(*source, *subsystem, json_output),
        SkillCmd::Show { name } => show_skill(name),
        SkillCmd::Vendor { name } => vendor_skill(name, json_output),
        SkillCmd::Propose { description } => propose_skill(description, json_output),
        SkillCmd::Scaffold { name, subsystem } => scaffold_skill(name, *subsystem, json_output),
        SkillCmd::Register { name } => register_skill(name, json_output),
        SkillCmd::Refresh { name } => refresh_skill(name, json_output),
    }
}

pub fn review_retrain(retrain_id: &str, json_output: bool) -> Result<String, String> {
    let mut record = load_retrain_record(retrain_id)?;
    if record.status.trim().is_empty() {
        record.status = "provisional".to_owned();
    }
    render_retrain(&record, json_output)
}

pub fn promote_retrain(retrain_id: &str, json_output: bool) -> Result<String, String> {
    let mut record = load_retrain_record(retrain_id)?;
    record.status = "promoted".to_owned();
    record.updated_at = Utc::now().to_rfc3339();
    save_retrain_record(&record)?;
    render_retrain(&record, json_output)
}

pub fn reject_retrain(
    retrain_id: &str,
    reason: Option<&str>,
    json_output: bool,
) -> Result<String, String> {
    let mut record = load_retrain_record(retrain_id)?;
    record.status = "rejected".to_owned();
    record.rejection_reason = Some(reason.unwrap_or("developer rejected retrain artifact").to_owned());
    record.updated_at = Utc::now().to_rfc3339();
    save_retrain_record(&record)?;
    render_retrain(&record, json_output)
}

fn list_skills(
    source: Option<SkillSource>,
    subsystem: Option<Subsystem>,
    json_output: bool,
) -> Result<String, String> {
    let mut entries = discover_skills()?;
    entries.retain(|entry| source.map_or(true, |needle| entry.source == needle));
    entries.retain(|entry| subsystem.map_or(true, |needle| entry.subsystem == needle));
    entries.sort_by(|left, right| left.name.cmp(&right.name));
    if json_output {
        return serde_json::to_string_pretty(&entries).map_err(|err| err.to_string());
    }
    Ok(entries
        .iter()
        .map(|entry| format!("{}\t{:?}\t{:?}\t{}", entry.name, entry.source, entry.subsystem, entry.path))
        .collect::<Vec<_>>()
        .join("\n"))
}

fn show_skill(name: &str) -> Result<String, String> {
    let entry = find_skill(name)?;
    fs::read_to_string(&entry.path)
        .map_err(|err| format!("failed to read {}: {err}", entry.path))
}

fn vendor_skill(name: &str, json_output: bool) -> Result<String, String> {
    let catalog = hermes_catalog();
    let Some(description) = catalog.get(name) else {
        return Err(format!("unknown priority-13 Hermes skill `{name}`"));
    };
    let root = repo_root()?.join("Body/S/S4/pi-agent/skills/hermes").join(name);
    fs::create_dir_all(&root).map_err(|err| format!("failed to create {}: {err}", root.display()))?;
    let skill_path = root.join("SKILL.md");
    let provenance_path = root.join("provenance.yaml");
    if !skill_path.exists() {
        fs::write(&skill_path, hermes_skill_doc(name, description))
            .map_err(|err| format!("failed to write {}: {err}", skill_path.display()))?;
    }
    fs::write(&provenance_path, hermes_provenance(name))
        .map_err(|err| format!("failed to write {}: {err}", provenance_path.display()))?;
    let entry = find_skill(name)?;
    write_registry_entry(&entry)?;
    render_value(
        json!({"vendored": name, "skillPath": skill_path, "provenancePath": provenance_path}),
        json_output,
    )
}

fn propose_skill(description: &str, json_output: bool) -> Result<String, String> {
    let slug = slugify(description)?;
    render_value(
        json!({
            "proposal": {
                "name": slug,
                "description": description,
                "workflow": "zeithoven-creative-advance",
                "nextCommand": format!("epi skill scaffold {}", slug)
            }
        }),
        json_output,
    )
}

fn scaffold_skill(
    name: &str,
    subsystem: Option<Subsystem>,
    json_output: bool,
) -> Result<String, String> {
    let subsystem = subsystem.unwrap_or(Subsystem::Aletheia);
    let root = residency_root(subsystem)?.join(name);
    fs::create_dir_all(&root).map_err(|err| format!("failed to create {}: {err}", root.display()))?;
    let skill_path = root.join("SKILL.md");
    if skill_path.exists() {
        return Err(format!("{} already exists", skill_path.display()));
    }
    fs::write(&skill_path, custom_skill_doc(name, subsystem))
        .map_err(|err| format!("failed to write {}: {err}", skill_path.display()))?;
    render_value(json!({"scaffolded": name, "subsystem": subsystem, "path": skill_path}), json_output)
}

fn register_skill(name: &str, json_output: bool) -> Result<String, String> {
    let entry = find_skill(name)?;
    write_registry_entry(&entry)?;
    render_value(json!({"registered": name, "path": entry.path}), json_output)
}

fn refresh_skill(name: &str, json_output: bool) -> Result<String, String> {
    let entry = find_skill(name)?;
    if entry.source != SkillSource::Vendored {
        return Err(format!("`{name}` is not a vendored Hermes skill"));
    }
    let root = Path::new(&entry.path).parent().ok_or("skill path has no parent")?;
    let provenance = root.join("provenance.yaml");
    let status = if provenance.exists() {
        "registered-local-catalog-current"
    } else {
        "missing-provenance"
    };
    render_value(json!({"skill": name, "refreshStatus": status, "provenance": provenance}), json_output)
}

fn discover_skills() -> Result<Vec<SkillEntry>, String> {
    let root = repo_root()?;
    let mut entries = Vec::new();
    let search_roots = [
        root.join("Body/S/S4/pi-agent/skills/hermes"),
        root.join("Body/S/S4/pi-agent/skills/custom"),
        root.join("Body/S/S4/pi-agent/skills"),
        root.join("Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom"),
        root.join("Body/S/S5/epii-autoresearch-core/skills"),
        root.join("Body/S/S5/plugins/epi-logos/skills/custom"),
        root.join("Body/S/S0/epi-lib/skills"),
    ];
    let mut seen = BTreeSet::new();
    for search_root in search_roots {
        collect_skill_entries(&search_root, &mut seen, &mut entries)?;
    }
    Ok(entries)
}

fn collect_skill_entries(
    root: &Path,
    seen: &mut BTreeSet<PathBuf>,
    entries: &mut Vec<SkillEntry>,
) -> Result<(), String> {
    if !root.exists() {
        return Ok(());
    }
    for entry in fs::read_dir(root).map_err(|err| format!("failed to read {}: {err}", root.display()))? {
        let path = entry.map_err(|err| err.to_string())?.path();
        if path.is_dir() {
            let skill = path.join("SKILL.md");
            if skill.exists() && seen.insert(skill.clone()) {
                entries.push(parse_skill_entry(&skill)?);
            }
            collect_skill_entries(&path, seen, entries)?;
        }
    }
    Ok(())
}

fn parse_skill_entry(path: &Path) -> Result<SkillEntry, String> {
    let text = fs::read_to_string(path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    let frontmatter = parse_frontmatter(&text);
    let fallback_name = path
        .parent()
        .and_then(Path::file_name)
        .and_then(|name| name.to_str())
        .unwrap_or("unknown-skill");
    let name = frontmatter
        .get("name")
        .cloned()
        .unwrap_or_else(|| fallback_name.to_owned());
    let description = frontmatter
        .get("description")
        .cloned()
        .unwrap_or_else(|| first_body_line(&text).unwrap_or_else(|| "skill surface".to_owned()));
    let path_string = path.display().to_string();
    Ok(SkillEntry {
        source: infer_source(&path_string),
        subsystem: infer_subsystem(&path_string, &name),
        residency: infer_residency(&path_string),
        dependencies: frontmatter
            .get("dependencies")
            .map(|value| value.split(',').map(|item| item.trim().to_owned()).filter(|item| !item.is_empty()).collect())
            .unwrap_or_default(),
        current_rating: None,
        name,
        description,
        path: path_string,
    })
}

fn parse_frontmatter(text: &str) -> BTreeMap<String, String> {
    let mut out = BTreeMap::new();
    let Some(rest) = text.strip_prefix("---\n") else {
        return out;
    };
    let Some(end) = rest.find("\n---") else {
        return out;
    };
    for line in rest[..end].lines() {
        let Some((key, value)) = line.split_once(':') else {
            continue;
        };
        out.insert(key.trim().to_owned(), value.trim().trim_matches('"').to_owned());
    }
    out
}

fn first_body_line(text: &str) -> Option<String> {
    text.lines()
        .find(|line| line.starts_with("# "))
        .map(|line| line.trim_start_matches("# ").to_owned())
}

fn find_skill(name: &str) -> Result<SkillEntry, String> {
    discover_skills()?
        .into_iter()
        .find(|entry| entry.name == name || entry.path.contains(&format!("/{name}/")))
        .ok_or_else(|| format!("skill `{name}` not found in repo skill residencies"))
}

fn write_registry_entry(entry: &SkillEntry) -> Result<(), String> {
    let path = registry_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let line = serde_json::to_string(entry).map_err(|err| err.to_string())?;
    fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .and_then(|mut file| {
            use std::io::Write;
            writeln!(file, "{line}")
        })
        .map_err(|err| format!("failed to append {}: {err}", path.display()))
}

fn load_retrain_record(retrain_id: &str) -> Result<RetrainRecord, String> {
    let path = retrain_path(retrain_id)?;
    if path.exists() {
        let text = fs::read_to_string(&path).map_err(|err| format!("failed to read {}: {err}", path.display()))?;
        return serde_json::from_str(&text).map_err(|err| format!("invalid {}: {err}", path.display()));
    }
    Ok(RetrainRecord {
        retrain_id: retrain_id.to_owned(),
        status: "provisional".to_owned(),
        staged_artifact: format!("~/.epi-logos/retrain/{retrain_id}/artifact"),
        metrics: json!({"status": "awaiting-metrics"}),
        sample_outputs: Vec::new(),
        diff_summary: "No staged metrics file found; review queue entry is provisional.".to_owned(),
        updated_at: Utc::now().to_rfc3339(),
        rejection_reason: None,
    })
}

fn save_retrain_record(record: &RetrainRecord) -> Result<(), String> {
    let path = retrain_path(&record.retrain_id)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let text = serde_json::to_string_pretty(record).map_err(|err| err.to_string())?;
    fs::write(&path, text).map_err(|err| format!("failed to write {}: {err}", path.display()))
}

fn render_retrain(record: &RetrainRecord, json_output: bool) -> Result<String, String> {
    if json_output {
        return serde_json::to_string_pretty(record).map_err(|err| err.to_string());
    }
    Ok(format!(
        "retrain {}\nstatus: {}\nstaged artifact: {}\ndiff: {}\nmetrics: {}",
        record.retrain_id, record.status, record.staged_artifact, record.diff_summary, record.metrics
    ))
}

fn render_value(value: Value, json_output: bool) -> Result<String, String> {
    if json_output {
        serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
    } else {
        Ok(value.to_string())
    }
}

fn infer_source(path: &str) -> SkillSource {
    if path.contains("/skills/hermes/") {
        SkillSource::Vendored
    } else {
        SkillSource::Custom
    }
}

fn infer_subsystem(path: &str, name: &str) -> Subsystem {
    if path.contains("S4-5p-aletheia") || name.starts_with("aletheia-") {
        return Subsystem::Aletheia;
    }
    if path.contains("anuttara") || name.starts_with("anuttara-") {
        return Subsystem::M0;
    }
    if path.contains("paramasiva") || name.starts_with("paramasiva-") {
        return Subsystem::M1;
    }
    if path.contains("parashakti") || name.starts_with("parashakti-") {
        return Subsystem::M2;
    }
    if path.contains("mahamaya") || name.starts_with("mahamaya-") {
        return Subsystem::M3;
    }
    if path.contains("nara") || name.starts_with("nara-") || name == "mlx-lora" {
        return Subsystem::M4;
    }
    Subsystem::M5
}

fn infer_residency(path: &str) -> String {
    if path.contains("/skills/hermes/") {
        "Body/S/S4/pi-agent/skills/hermes".to_owned()
    } else if path.contains("S4-5p-aletheia") {
        "Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom".to_owned()
    } else if path.contains("epii-autoresearch-core") {
        "Body/S/S5/epii-autoresearch-core/skills".to_owned()
    } else if path.contains("plugins/epi-logos") {
        "Body/S/S5/plugins/epi-logos/skills/custom".to_owned()
    } else if path.contains("epi-lib") {
        "Body/S/S0/epi-lib/skills".to_owned()
    } else {
        "Body/S/S4/pi-agent/skills/custom".to_owned()
    }
}

fn residency_root(subsystem: Subsystem) -> Result<PathBuf, String> {
    let root = repo_root()?;
    Ok(match subsystem {
        Subsystem::M0 => root.join("Body/S/S0/epi-lib/skills/anuttara"),
        Subsystem::M1 => root.join("Body/S/S0/epi-lib/skills/paramasiva"),
        Subsystem::M2 => root.join("Body/S/S5/epii-autoresearch-core/skills/parashakti"),
        Subsystem::M3 => root.join("Body/S/S0/epi-lib/skills/mahamaya"),
        Subsystem::M4 => root.join("Body/S/S4/pi-agent/skills/nara"),
        Subsystem::M5 => root.join("Body/S/S5/plugins/epi-logos/skills/epii"),
        Subsystem::Aletheia => root.join("Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom"),
    })
}

fn registry_path() -> Result<PathBuf, String> {
    Ok(home_dir()?.join(".epi-logos/agora-skill-index.jsonl"))
}

fn retrain_path(retrain_id: &str) -> Result<PathBuf, String> {
    Ok(home_dir()?.join(".epi-logos/retrain").join(format!("{retrain_id}.json")))
}

fn home_dir() -> Result<PathBuf, String> {
    std::env::var("HOME")
        .map(PathBuf::from)
        .map_err(|_| "HOME is required for ~/.epi-logos skill state".to_owned())
}

fn repo_root() -> Result<PathBuf, String> {
    let mut root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    for _ in 0..4 {
        root = root
            .parent()
            .ok_or("failed to resolve repository root from CARGO_MANIFEST_DIR")?
            .to_path_buf();
    }
    Ok(root)
}

fn hermes_catalog() -> BTreeMap<&'static str, &'static str> {
    BTreeMap::from([
        ("huggingface-hub", "Model, dataset, and artifact distribution through the Hugging Face Hub."),
        ("huggingface-accelerate", "Distributed and mixed-device training launch surface via Accelerate."),
        ("peft-fine-tuning", "LoRA, QLoRA, and other parameter-efficient fine-tuning methods."),
        ("unsloth", "Memory-efficient local fine-tuning accelerator for supported transformer models."),
        ("fine-tuning-with-trl", "SFT, DPO, PPO, GRPO, and reward-model training through TRL."),
        ("simpo-training", "Reference-free preference optimization for Elo-derived preference pairs."),
        ("weights-and-biases", "Experiment tracking, metric lineage, and artifact provenance."),
        ("pytorch-lightning", "Structured training-loop orchestration for Python-hosted models."),
        ("nemo-curator", "Corpus curation, deduplication, PII redaction, and quality filtering."),
        ("serving-llms-vllm", "High-throughput LLM serving with adapter-aware inference."),
        ("llama-cpp", "GGUF quantization and local inference, including Apple-Silicon paths."),
        ("evaluating-llms-harness", "lm-eval-harness style benchmark and held-out evaluation workflows."),
        ("dspy", "Declarative LM program and judge-loop optimization workflows."),
    ])
}

fn hermes_skill_doc(name: &str, description: &str) -> String {
    format!(
        "---\nname: {name}\ndescription: {description}\nversion: 0.1.0\ntags: [hermes, ml, vendored]\nplatforms: [darwin, linux]\nsource: hermes\n---\n\n# {name}\n\nUse this vendored Hermes skill when the Epi-Logos ML skill surface needs: {description}\n\n## Contract\n\n- Keep runtime credentials in the owning model-slot or deployment config.\n- Record artifacts in the Agora skill index before Anima dispatch.\n- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.\n\n## Verification\n\nRun `epi skill show {name}` and `epi skill register {name}` after vendoring.\n"
    )
}

fn hermes_provenance(name: &str) -> String {
    format!(
        "source: hermes-priority-13\nname: {name}\nupstream_commit: local-catalog-12.24\nvendored_at: {}\nvendor_agent: codex-m-dev-12-t12-24\nnetwork_fetch: unavailable-in-sandbox\n",
        Utc::now().to_rfc3339()
    )
}

fn custom_skill_doc(name: &str, subsystem: Subsystem) -> String {
    format!(
        "---\nname: {name}\ndescription: Custom {subsystem:?} ML skill scaffold generated by the Agora/Zeithoven skill surface.\nversion: 0.1.0\ntags: [custom, ml, {subsystem:?}]\n---\n\n# {name}\n\nThis skill is scaffolded for the {subsystem:?} ML surface. Implementations must load thresholds and training hyperparameters from `~/.epi-logos/config.toml`; code must refuse missing required keys rather than pinning defaults.\n"
    )
}

fn slugify(value: &str) -> Result<String, String> {
    let slug = value
        .to_ascii_lowercase()
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if slug.is_empty() {
        Err("description did not contain a usable skill name".to_owned())
    } else {
        Ok(slug)
    }
}
