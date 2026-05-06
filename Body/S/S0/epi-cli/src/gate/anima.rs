use serde_json::{json, Value};
use std::path::{Path, PathBuf};

use crate::agent::{vak, AgentLayout};

const PLEROMA_ROOT: &str = "Body/S/S4/plugins/pleroma";
const VAK_EVALUATE_SKILL: &str = "vak-evaluate";
const ANIMA_ORCHESTRATION_SKILL: &str = "anima-orchestration";

pub fn vak_evaluate(params: &Value) -> Result<Value, String> {
    let task = required_str(params, "task")?;
    let coordinates = vak::evaluate_vak(task);
    let agent = vak::cf_to_agent(coordinates.cf.as_deref().unwrap_or(""));
    let skill_path = pleroma_skill_path(VAK_EVALUATE_SKILL)?;

    Ok(json!({
        "owner": "S4'",
        "agent": agent,
        "coordinates": coordinates,
        "capability": capability(VAK_EVALUATE_SKILL, &skill_path),
        "authority": authority(),
    }))
}

pub fn orchestrate(params: &Value) -> Result<Value, String> {
    let cf = params
        .get("cf")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .or_else(|| {
            params
                .get("task")
                .and_then(Value::as_str)
                .and_then(|task| vak::evaluate_vak(task).cf)
        })
        .ok_or_else(|| "cf or task is required".to_owned())?;

    let skill_path = pleroma_skill_path(ANIMA_ORCHESTRATION_SKILL)?;
    Ok(json!({
        "owner": "S4'",
        "agent": vak::cf_to_agent(&cf),
        "cf": cf,
        "capability": capability(ANIMA_ORCHESTRATION_SKILL, &skill_path),
        "authority": authority(),
    }))
}

fn capability(skill: &str, skill_path: &Path) -> Value {
    json!({
        "plugin": "pleroma",
        "skill": skill,
        "skillPath": display_path(skill_path),
        "invocation": "bounded_pi_skill",
    })
}

fn authority() -> Value {
    json!({
        "mayDispatch": true,
        "mayInvokeBoundedSkill": true,
        "mayDepositToEpii": true,
        "mayResolveEpiiReview": false,
        "forbidden": [
            "resolve_epii_review_gate",
            "mutate_epii_identity_state",
            "bypass_epii_inbox"
        ],
    })
}

fn pleroma_skill_path(skill: &str) -> Result<PathBuf, String> {
    let layout = AgentLayout::resolve(Some("anima"))?;
    let root = layout.repo_root.join(PLEROMA_ROOT);
    let skill_path = root.join("skills").join(skill).join("SKILL.md");
    if !skill_path.exists() {
        return Err(format!(
            "Pleroma skill is not installed at expected path: {}",
            skill_path.display()
        ));
    }
    Ok(skill_path)
}

fn required_str<'a>(params: &'a Value, key: &str) -> Result<&'a str, String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("{key} must be a non-empty string"))
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}
