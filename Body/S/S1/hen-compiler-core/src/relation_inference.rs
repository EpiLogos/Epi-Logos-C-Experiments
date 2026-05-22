use std::future::Future;
use std::path::PathBuf;
use std::pin::Pin;
use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};

use crate::artifact_evidence::ArtifactEvidence;
use crate::wikilinks::WikilinkTarget;

pub const ALLOWED_RELATION_TYPES: &[&str] = &[
    "REFERENCES",
    "SOURCES",
    "CONTAINS",
    "PART_OF",
    "ELABORATES",
    "CONTRASTS",
    "IMPLEMENTS",
    "OPERATES_IN",
    "REFLECTS_AS",
    "INVERTS_TO",
    "SUPPORTS",
    "CRITIQUES",
    "DERIVES_FROM",
    "PROMOTES_TO",
    "SYNCED_FROM",
];

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct RelationLinkEvidence {
    pub raw: String,
    pub target_text: String,
    pub alias: Option<String>,
    pub source_path: String,
    pub source_line: usize,
    pub source_column: usize,
    pub context: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct RelationInferenceRequest {
    pub source_coordinate: String,
    pub source_path: String,
    pub source_title: Option<String>,
    pub content_hash: String,
    pub link_evidence: Vec<RelationLinkEvidence>,
    pub frontmatter_source_coordinates: Vec<String>,
    pub allowed_relation_types: Vec<String>,
    pub system_instructions: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RelationInferenceCandidate {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub relation_type: String,
    pub confidence: f64,
    pub evidence_kind: String,
    pub evidence_text: String,
    pub source_path: Option<String>,
    pub source_line: Option<usize>,
    pub target_text: Option<String>,
    pub inferred_by: Option<String>,
    pub prompt_hash: Option<String>,
}

pub trait RelationInferenceProvider {
    fn infer<'a>(
        &'a self,
        request: &'a RelationInferenceRequest,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<RelationInferenceCandidate>, String>> + Send + 'a>>;
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PiAgentRelationInferenceProvider {
    pub pi_program: String,
    pub repo_root: PathBuf,
    pub agent: String,
    pub role: Option<String>,
    pub agent_dir: PathBuf,
    pub system_prompt_path: PathBuf,
}

impl PiAgentRelationInferenceProvider {
    pub fn from_env() -> Result<Self, String> {
        let repo_root = std::env::var("EPI_REPO_ROOT")
            .map(PathBuf::from)
            .or_else(|_| std::env::current_dir().map_err(|error| error.to_string()))?;
        let agent = std::env::var("EPI_HEN_PI_AGENT").unwrap_or_else(|_| "anima".to_owned());
        let role = Some(std::env::var("EPI_HEN_PI_ROLE").unwrap_or_else(|_| "logos".to_owned()))
            .filter(|value| !value.trim().is_empty());
        let agent_dir = std::env::var("EPI_HEN_PI_AGENT_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                repo_root
                    .join(".epi")
                    .join("agents")
                    .join(&agent)
                    .join("agent")
            });
        let system_prompt_path = std::env::var("EPI_HEN_PI_SYSTEM_PROMPT")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                repo_root
                    .join("Body")
                    .join("S")
                    .join("S4")
                    .join("pi-agent")
                    .join("prompts")
                    .join("epi-system.md")
            });

        if !agent_dir.exists() {
            return Err(format!(
                "managed PI agent directory is missing: {}; run `epi agent install --agent {agent}` and configure models/auth through `epi agent models/auth`",
                agent_dir.display()
            ));
        }
        if !system_prompt_path.exists() {
            return Err(format!(
                "PI system prompt is missing: {}",
                system_prompt_path.display()
            ));
        }

        Ok(Self {
            pi_program: std::env::var("EPI_HEN_PI_PROGRAM").unwrap_or_else(|_| "pi".to_owned()),
            repo_root,
            agent,
            role,
            agent_dir,
            system_prompt_path,
        })
    }

    fn command(&self, prompt: &str) -> Command {
        let mut command = Command::new(&self.pi_program);
        command
            .arg("--no-tools")
            .arg("--no-extensions")
            .arg("--no-session")
            .arg("--no-context-files")
            .arg("--no-prompt-templates")
            .arg("--no-themes")
            .arg("--system-prompt")
            .arg(&self.system_prompt_path)
            .arg("--mode")
            .arg("text")
            .arg("-p")
            .arg(prompt)
            .current_dir(&self.repo_root)
            .env("EPI_REPO_ROOT", &self.repo_root)
            .env("EPI_AGENT_NAME", &self.agent)
            .env("EPI_AGENT_ID", &self.agent)
            .env("PI_CODING_AGENT_DIR", &self.agent_dir)
            .env("EPI_AGENT_DIR", &self.agent_dir)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        if let Some(role) = &self.role {
            command
                .env("EPI_AGENT_ROLE", role)
                .env("EPI_AGENT_SCOPED_SURFACE", format!("{}:{role}", self.agent));
        }
        command
    }
}

impl RelationInferenceProvider for PiAgentRelationInferenceProvider {
    fn infer<'a>(
        &'a self,
        request: &'a RelationInferenceRequest,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<RelationInferenceCandidate>, String>> + Send + 'a>>
    {
        Box::pin(async move {
            let request_json = serde_json::to_string_pretty(request)
                .map_err(|error| format!("failed to serialize relation request: {error}"))?;
            let prompt = format!(
                "{}\n\nClassify the following Hen graph relation request. Respond with only JSON in the shape {{\"candidates\":[...]}}; do not include Markdown fences or commentary.\n\n{}",
                request.system_instructions, request_json
            );
            let output = self
                .command(&prompt)
                .output()
                .map_err(|error| format!("failed to launch PI relation inference: {error}"))?;

            if !output.status.success() {
                return Err(format!(
                    "PI relation inference exited with {}: {}",
                    output.status,
                    String::from_utf8_lossy(&output.stderr)
                ));
            }

            let body = String::from_utf8(output.stdout).map_err(|error| {
                format!("PI relation inference returned non-UTF8 body: {error}")
            })?;
            let candidates_json = extract_candidates_json(&body)?;
            validate_relation_candidates(&candidates_json)
        })
    }
}

pub fn build_relation_inference_request(
    source: &ArtifactEvidence,
    allowed_relation_types: &[String],
) -> Result<RelationInferenceRequest, String> {
    let source_coordinate = source
        .coordinate
        .clone()
        .ok_or_else(|| "relation inference requires source coordinate evidence".to_owned())?;

    let allowed_relation_types = if allowed_relation_types.is_empty() {
        ALLOWED_RELATION_TYPES
            .iter()
            .map(|relation_type| (*relation_type).to_owned())
            .collect()
    } else {
        for relation_type in allowed_relation_types {
            if !is_registered_relation_type(relation_type) {
                return Err(format!(
                    "relation type is not registered for inference: {relation_type}"
                ));
            }
        }
        allowed_relation_types.to_vec()
    };

    Ok(RelationInferenceRequest {
        source_coordinate,
        source_path: source.source_path.clone(),
        source_title: source.title.clone(),
        content_hash: source.content_hash.clone(),
        link_evidence: source
            .body_wikilinks
            .iter()
            .map(|link| RelationLinkEvidence {
                raw: link.raw.clone(),
                target_text: target_text(&link.target),
                alias: link.alias.clone(),
                source_path: source.source_path.clone(),
                source_line: link.line,
                source_column: link.column,
                context: link.context.clone(),
            })
            .collect(),
        frontmatter_source_coordinates: source.frontmatter_source_coordinates.clone(),
        allowed_relation_types,
        system_instructions: relation_inference_system_instructions(),
    })
}

pub fn validate_relation_candidates(
    candidates_json: &str,
) -> Result<Vec<RelationInferenceCandidate>, String> {
    let value: serde_json::Value = serde_json::from_str(candidates_json)
        .map_err(|error| format!("invalid relation candidate JSON: {error}"))?;
    let candidates_value = value
        .get("candidates")
        .cloned()
        .unwrap_or_else(|| value.clone());
    let candidates: Vec<RelationInferenceCandidate> = serde_json::from_value(candidates_value)
        .map_err(|error| format!("invalid relation candidate schema: {error}"))?;

    for (index, candidate) in candidates.iter().enumerate() {
        validate_candidate(index, candidate)?;
    }

    Ok(candidates)
}

pub fn is_registered_relation_type(relation_type: &str) -> bool {
    ALLOWED_RELATION_TYPES.contains(&relation_type)
}

fn validate_candidate(index: usize, candidate: &RelationInferenceCandidate) -> Result<(), String> {
    if candidate.source_coordinate.trim().is_empty() {
        return Err(format!("candidate {index} missing source_coordinate"));
    }
    if candidate.target_coordinate.trim().is_empty() {
        return Err(format!("candidate {index} missing target_coordinate"));
    }
    if !is_registered_relation_type(&candidate.relation_type) {
        return Err(format!(
            "candidate {index} uses unregistered relationship type: {}",
            candidate.relation_type
        ));
    }
    if !(0.0..=1.0).contains(&candidate.confidence) {
        return Err(format!(
            "candidate {index} confidence must be between 0 and 1"
        ));
    }
    if candidate.evidence_kind.trim().is_empty() {
        return Err(format!("candidate {index} missing evidence_kind"));
    }
    if candidate.evidence_text.trim().is_empty() {
        return Err(format!("candidate {index} missing evidence_text"));
    }

    Ok(())
}

fn relation_inference_system_instructions() -> String {
    format!(
        "Classify Hen relation evidence using only schema-owned relationship types: {}. Do not invent relationship labels. Return JSON as {{\"candidates\":[...]}} with source_coordinate, target_coordinate, relation_type, confidence, evidence_kind, evidence_text, source_path, source_line, target_text, inferred_by, and prompt_hash.",
        ALLOWED_RELATION_TYPES.join(", ")
    )
}

fn target_text(target: &WikilinkTarget) -> String {
    match target {
        WikilinkTarget::Path(path) => path.clone(),
        WikilinkTarget::Heading(heading) => format!("#{heading}"),
        WikilinkTarget::PathHeading { path, heading } => format!("{path}#{heading}"),
    }
}

fn extract_candidates_json(response_body: &str) -> Result<String, String> {
    let trimmed = response_body.trim();
    let json_body = if trimmed.starts_with('{') || trimmed.starts_with('[') {
        trimmed
    } else {
        extract_first_json_value(trimmed)?
    };
    let value: serde_json::Value = serde_json::from_str(json_body)
        .map_err(|error| format!("PI relation inference returned invalid JSON: {error}"))?;
    if value.is_array() || value.get("candidates").is_some() {
        return Ok(value.to_string());
    }

    let content = value
        .pointer("/choices/0/message/content")
        .and_then(serde_json::Value::as_str)
        .ok_or_else(|| {
            "PI relation inference response did not include candidates JSON".to_owned()
        })?;
    Ok(content.to_owned())
}

fn extract_first_json_value(response_body: &str) -> Result<&str, String> {
    let start = response_body
        .find(['{', '['])
        .ok_or_else(|| "PI relation inference response did not contain JSON".to_owned())?;
    let bytes = response_body.as_bytes();
    let opener = bytes[start] as char;
    let closer = if opener == '{' { '}' } else { ']' };
    let mut depth = 0usize;
    let mut in_string = false;
    let mut escaped = false;

    for (offset, ch) in response_body[start..].char_indices() {
        if escaped {
            escaped = false;
            continue;
        }
        if ch == '\\' && in_string {
            escaped = true;
            continue;
        }
        if ch == '"' {
            in_string = !in_string;
            continue;
        }
        if in_string {
            continue;
        }
        if ch == opener {
            depth += 1;
        } else if ch == closer {
            depth = depth.saturating_sub(1);
            if depth == 0 {
                let end = start + offset + ch.len_utf8();
                return Ok(&response_body[start..end]);
            }
        }
    }

    Err("PI relation inference response contained incomplete JSON".to_owned())
}
