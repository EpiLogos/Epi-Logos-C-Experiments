use std::path::PathBuf;

use crate::ledger::ENVELOPE_LEDGER_CHANNELS;
use crate::residency::{resolve_compiler_residency, HenTimestamp};

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

pub(crate) fn executor_kind_name(kind: ExecutorKind) -> &'static str {
    match kind {
        ExecutorKind::PiAgent => "pi_agent",
        ExecutorKind::Service => "service",
        ExecutorKind::VendorClaudeSdk => "vendor_claude_sdk",
    }
}
