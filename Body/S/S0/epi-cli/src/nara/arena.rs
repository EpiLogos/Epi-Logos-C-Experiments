use clap::Subcommand;
use portal_core::{
    hash_revision, hex_digest, CpfState, CsDirection, CsField, PrewarmVamaShaktiRequest,
    VakAddress, VamaShaktiClass, VamaShaktiReleaseReason, WarmVamaShaktiFilter,
    WarmVamaShaktiRegistry,
};
use std::fs;
use std::path::PathBuf;
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
    }
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
}
