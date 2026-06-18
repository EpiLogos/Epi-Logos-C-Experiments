use clap::Subcommand;
use portal_core::{
    hash_revision, hex_digest, CpfState, CsDirection, CsField, PrewarmVamaShaktiRequest,
    VakAddress, VamaShaktiClass, VamaShaktiReleaseReason, WarmVamaShakti, WarmVamaShaktiFilter,
    WarmVamaShaktiRegistry,
};
use serde_json::Value;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::str::FromStr;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Subcommand)]
pub enum ArenaCmd {
    /// Vama Shakti warm-persistence admin commands
    Vama {
        #[command(subcommand)]
        cmd: VamaCmd,
    },
}

#[derive(Subcommand)]
pub enum VamaCmd {
    /// List warm Vama Shaktis
    #[command(name = "list-warm")]
    ListWarm {
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long = "class")]
        class_filter: Option<String>,
        #[arg(long)]
        age_gte: Option<u64>,
    },
    /// Pre-warm a Vama Shakti identity for a coordinate and classifier
    Warm {
        coordinate: String,
        #[arg(long = "class")]
        class_name: String,
    },
    /// Release a warm Vama Shakti identity
    Release {
        identity_handle: String,
        #[arg(long, default_value = "gc")]
        reason: String,
    },
    /// Emit an arena-promotion proposal for a threshold-crossed warm identity
    #[command(name = "propose-promotion")]
    ProposePromotion {
        identity_handle: String,
        #[arg(long)]
        scenes: u64,
        #[arg(long)]
        user_response_quality_witnessed: bool,
        #[arg(long)]
        config: Option<PathBuf>,
    },
}

pub fn dispatch(cmd: &ArenaCmd, json: bool) -> Result<String, String> {
    match cmd {
        ArenaCmd::Vama { cmd } => dispatch_vama(cmd, json),
    }
}

fn dispatch_vama(cmd: &VamaCmd, json: bool) -> Result<String, String> {
    let mut registry = load_registry()?;
    let now_ms = now_ms();
    match cmd {
        VamaCmd::ListWarm {
            coordinate,
            class_filter,
            age_gte,
        } => {
            let class = class_filter
                .as_deref()
                .map(VamaShaktiClass::from_str)
                .transpose()
                .map_err(|err| err.to_string())?;
            let rows = registry.list_warm(&WarmVamaShaktiFilter {
                coordinate: coordinate.clone(),
                vama_shakti_class: class,
                age_gte_ms: *age_gte,
                now_ms,
            });
            if json {
                serde_json::to_string_pretty(&rows).map_err(|err| err.to_string())
            } else if rows.is_empty() {
                Ok("No warm Vama Shaktis.".to_owned())
            } else {
                Ok(rows
                    .iter()
                    .map(|row| {
                        format!(
                            "{}\t{}\t{}\tturns={}",
                            row.identity_handle,
                            row.coordinate_label,
                            row.essential_identity.vama_shakti_class,
                            row.q_activity_accumulator.turn_count
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        VamaCmd::Warm {
            coordinate,
            class_name,
        } => {
            let vama_shakti_class =
                VamaShaktiClass::from_str(class_name).map_err(|err| err.to_string())?;
            let coordinate_digest = hash_revision(coordinate);
            let psyche_template_md = psyche_template_md()?;
            let entity_form_md = format!("coordinate: {coordinate}\nclass: {vama_shakti_class}\n");
            let row = registry.prewarm(PrewarmVamaShaktiRequest {
                coordinate_label: coordinate.clone(),
                coordinate: vak_address_from_coordinate(coordinate),
                canonical_form_digest: coordinate_digest,
                archetypal_sattva: format!("{coordinate}:{vama_shakti_class}"),
                vama_shakti_class,
                psyche_template_revision: hash_revision(&psyche_template_md),
                psyche_template_md,
                entity_form_md,
                now_ms,
            });
            save_registry(&registry)?;
            if json {
                serde_json::to_string_pretty(&row).map_err(|err| err.to_string())
            } else {
                Ok(format!(
                    "Warmed {} {} ({})",
                    row.coordinate_label,
                    row.essential_identity.vama_shakti_class,
                    row.identity_handle
                ))
            }
        }
        VamaCmd::Release {
            identity_handle,
            reason,
        } => {
            let reason =
                VamaShaktiReleaseReason::from_str(reason).map_err(|err| err.to_string())?;
            let row = registry
                .release(identity_handle, reason, now_ms)
                .map_err(|err| err.to_string())?;
            save_registry(&registry)?;
            if json {
                serde_json::to_string_pretty(&row).map_err(|err| err.to_string())
            } else {
                Ok(format!("Released {}", row.identity_handle))
            }
        }
        VamaCmd::ProposePromotion {
            identity_handle,
            scenes,
            user_response_quality_witnessed,
            config,
        } => {
            let row = registry
                .warm
                .get(identity_handle)
                .ok_or_else(|| format!("unknown warm Vama Shakti identity {identity_handle}"))?;
            if !row.is_active() {
                return Err(format!(
                    "warm Vama Shakti identity {identity_handle} is released"
                ));
            }
            let input = promotion_generator_input(row, *scenes, *user_response_quality_witnessed)?;
            let proposal = invoke_arena_promotion(&input, config.as_ref())?;
            if json {
                serde_json::to_string_pretty(&proposal).map_err(|err| err.to_string())
            } else {
                Ok(render_promotion_summary(&proposal))
            }
        }
    }
}

fn promotion_generator_input(
    row: &WarmVamaShakti,
    scene_count: u64,
    user_response_quality_witnessed: bool,
) -> Result<Value, String> {
    let mut value = serde_json::to_value(row).map_err(|err| err.to_string())?;
    let object = value
        .as_object_mut()
        .ok_or_else(|| "warm Vama Shakti row did not serialize as an object".to_owned())?;
    object.insert("sceneCount".to_owned(), Value::from(scene_count));
    object.insert(
        "userResponseQualityWitnessed".to_owned(),
        Value::from(user_response_quality_witnessed),
    );
    Ok(value)
}

fn invoke_arena_promotion(input: &Value, config: Option<&PathBuf>) -> Result<Value, String> {
    let python = std::env::var("EPI_ARENA_PROMOTION_PYTHON")
        .or_else(|_| std::env::var("EPI_GNOSTIC_PYTHON"))
        .unwrap_or_else(|_| "python3".to_owned());
    let mut command = Command::new(&python);
    command.args(["-m", "epi_gnostic.arena_promotion", "-"]);
    if let Some(config) = config {
        command.arg("--config").arg(config);
    }
    if let Some(pythonpath) = arena_promotion_pythonpath() {
        command.env("PYTHONPATH", pythonpath);
    }
    command
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    let mut child = command
        .spawn()
        .map_err(|err| format!("failed to run arena-promotion generator {python}: {err}"))?;
    {
        let stdin = child
            .stdin
            .as_mut()
            .ok_or_else(|| "arena-promotion generator stdin unavailable".to_owned())?;
        let bytes = serde_json::to_vec(input).map_err(|err| err.to_string())?;
        stdin
            .write_all(&bytes)
            .map_err(|err| format!("write arena-promotion input: {err}"))?;
    }
    let output = child
        .wait_with_output()
        .map_err(|err| format!("wait for arena-promotion generator: {err}"))?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() {
        let diagnostic = if stderr.trim().is_empty() {
            stdout.trim()
        } else {
            stderr.trim()
        };
        return Err(format!("arena-promotion generator failed: {diagnostic}"));
    }
    serde_json::from_str(stdout.trim()).map_err(|err| {
        format!(
            "arena-promotion generator returned non-JSON output: {err}; stdout={}",
            stdout.trim()
        )
    })
}

fn arena_promotion_pythonpath() -> Option<String> {
    let source_path = std::env::var("EPI_GNOSTIC_SOURCE_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../S5/epi-gnostic"));
    if !source_path.exists() {
        return std::env::var("PYTHONPATH").ok();
    }
    match std::env::var("PYTHONPATH") {
        Ok(existing) if !existing.trim().is_empty() => {
            Some(format!("{}:{}", source_path.display(), existing))
        }
        _ => Some(source_path.display().to_string()),
    }
}

fn render_promotion_summary(proposal: &Value) -> String {
    if proposal.get("event").and_then(Value::as_str) == Some("promotion_not_ready") {
        return "Promotion proposal not emitted; warm Vama Shakti has not crossed its class profile.".to_owned();
    }
    let proposal_id = proposal
        .get("proposal_id")
        .and_then(Value::as_str)
        .unwrap_or("arena-promotion");
    let coordinate = proposal
        .get("vama_shakti_coordinate_label")
        .and_then(Value::as_str)
        .unwrap_or("unknown-coordinate");
    let class = proposal
        .get("vama_shakti_class")
        .and_then(Value::as_str)
        .unwrap_or("unknown-class");
    let target = proposal
        .get("augmentation_patch")
        .and_then(|patch| patch.get("target"))
        .and_then(Value::as_str)
        .unwrap_or("unknown-target");
    format!(
        "promotion_proposal_emitted {proposal_id}\t{coordinate}\tclass={class}\ttarget={target}"
    )
}

fn load_registry() -> Result<WarmVamaShaktiRegistry, String> {
    let path = state_path()?;
    if !path.exists() {
        return Ok(WarmVamaShaktiRegistry::default());
    }
    let bytes = fs::read(&path).map_err(|err| format!("read {}: {err}", path.display()))?;
    serde_json::from_slice(&bytes).map_err(|err| format!("parse {}: {err}", path.display()))
}

fn save_registry(registry: &WarmVamaShaktiRegistry) -> Result<(), String> {
    let path = state_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("create {}: {err}", parent.display()))?;
    }
    let bytes = serde_json::to_vec_pretty(registry).map_err(|err| err.to_string())?;
    fs::write(&path, bytes).map_err(|err| format!("write {}: {err}", path.display()))
}

fn state_path() -> Result<PathBuf, String> {
    if let Ok(path) = std::env::var("EPI_NARA_ARENA_STATE_PATH") {
        return Ok(PathBuf::from(path));
    }
    let home =
        dirs::home_dir().ok_or_else(|| "HOME is required for Nara arena state".to_owned())?;
    Ok(home
        .join(".epi-logos")
        .join("nara")
        .join("warm-vama-shakti.json"))
}

fn psyche_template_md() -> Result<String, String> {
    if let Ok(path) = std::env::var("EPI_PSYCHE_TEMPLATE_PATH") {
        return fs::read_to_string(&path).map_err(|err| format!("read {path}: {err}"));
    }
    Ok("psyche_template_authority: default-local-admin\nsix_section_profile: true\n".to_owned())
}

fn vak_address_from_coordinate(coordinate: &str) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: coordinate.to_owned(),
        cf: "(4.5/0)".to_owned(),
        cfp: "m4.arena.vama".to_owned(),
        cs: CsField {
            code: format!("vama:{}", hex_digest(&hash_revision(coordinate))),
            direction: CsDirection::Day,
        },
    }
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn class_filter_returns_only_sprite_entries() {
        let mut registry = WarmVamaShaktiRegistry::default();
        let psyche = "psyche revision";
        for (coordinate, class) in [
            ("M4.sprite-field", VamaShaktiClass::Sprite),
            ("M4.daemon-field", VamaShaktiClass::Daemon),
        ] {
            registry.prewarm(PrewarmVamaShaktiRequest {
                coordinate_label: coordinate.to_owned(),
                coordinate: vak_address_from_coordinate(coordinate),
                canonical_form_digest: hash_revision(coordinate),
                archetypal_sattva: coordinate.to_owned(),
                vama_shakti_class: class,
                psyche_template_md: psyche.to_owned(),
                entity_form_md: coordinate.to_owned(),
                psyche_template_revision: hash_revision(psyche),
                now_ms: 1_000,
            });
        }

        let rows = registry.list_warm(&WarmVamaShaktiFilter {
            coordinate: None,
            vama_shakti_class: Some(VamaShaktiClass::Sprite),
            age_gte_ms: None,
            now_ms: 2_000,
        });

        assert_eq!(rows.len(), 1);
        assert_eq!(
            rows[0].essential_identity.vama_shakti_class,
            VamaShaktiClass::Sprite
        );
    }

    #[test]
    fn promotion_generator_input_carries_scene_and_user_witness_fields() {
        let mut registry = WarmVamaShaktiRegistry::default();
        let psyche = "psyche revision";
        let row = registry.prewarm(PrewarmVamaShaktiRequest {
            coordinate_label: "M4.daemon-field".to_owned(),
            coordinate: vak_address_from_coordinate("M4.daemon-field"),
            canonical_form_digest: hash_revision("M4.daemon-field"),
            archetypal_sattva: "M4.daemon-field".to_owned(),
            vama_shakti_class: VamaShaktiClass::Daemon,
            psyche_template_md: psyche.to_owned(),
            entity_form_md: "form:M4.daemon-field".to_owned(),
            psyche_template_revision: hash_revision(psyche),
            now_ms: 1_000,
        });

        let input = promotion_generator_input(&row, 4, true).expect("serializes row");

        assert_eq!(input["sceneCount"], 4);
        assert_eq!(input["userResponseQualityWitnessed"], true);
        assert_eq!(
            input["essentialIdentity"]["vamaShaktiClass"],
            serde_json::Value::String("daemon".to_owned())
        );
    }
}
