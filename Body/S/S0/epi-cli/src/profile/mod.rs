//! Track 01 T3 — `epi profile` CLI cluster.
//!
//! Exposes the current `MathemeHarmonicProfile`, pointer-anchor summary,
//! codon-rotation projection, and bridge-readiness state through stable S0'
//! CLI entry points. Every command emits its payload via real
//! `portal_core::MathemeHarmonicProfile::from_tick` /
//! `portal_core::codon_rotation_from_lens_mode` — no handwritten JSON paths
//! exist on this surface.
//!
//! The readiness command implements the 9-state taxonomy declared in
//! `Idea/Pratibimba/System/extensions/contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`
//! so the gateway/Theia/Tauri renderer all share one definition.

use clap::Subcommand;
use serde::{Deserialize, Serialize};

use portal_core::{
    codon_rotation_from_lens_mode, kernel_tick_from_epogdoon, MathemeHarmonicProfile,
};

use crate::ffi::role_names::{
    bedrock_role_name, context_frame_notation, helix_name, interval_role_name, pointer_ring_name,
    ratio_role_name, relation_role_name,
};

#[derive(Subcommand)]
pub enum ProfileCmd {
    /// Show the current MathemeHarmonicProfile JSON (public-current).
    Show {
        /// Cycle (default 0).
        #[arg(long, default_value_t = 0)]
        cycle: u64,
        /// Sub-tick within cycle (default 0).
        #[arg(long, default_value_t = 0)]
        sub_tick: u8,
    },
    /// Pointer-anchor summary + CF7 + canonical role-name dictionaries.
    Pointer {
        #[arg(long, default_value_t = 0)]
        cycle: u64,
        #[arg(long, default_value_t = 0)]
        sub_tick: u8,
    },
    /// Codon-rotation projection for a (lens, mode) pair.
    Codon {
        /// Lens 0..11.
        #[arg(long, default_value_t = 0)]
        lens: u8,
        /// Mode 0..6.
        #[arg(long, default_value_t = 0)]
        mode: u8,
    },
    /// Bridge readiness state (9-state taxonomy).
    Readiness {
        /// Probe the configured gateway URL (default off — emits a typed
        /// `bridge_unavailable` snapshot when omitted).
        #[arg(long)]
        probe: bool,
        /// Override the gateway base URL (default http://127.0.0.1:1421).
        #[arg(long, default_value = "http://127.0.0.1:1421")]
        gateway_url: String,
    },
}

/// Canonical 9-state readiness taxonomy.
///
/// Mirrors the strings declared in 07.T0's
/// `readinessTaxonomy.states_inherited_from_07`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BridgeReadinessState {
    BridgeUnavailable,
    ProfileMissingField,
    S2GraphBlocked,
    S3SubscriptionBlocked,
    S5ReviewBlocked,
    AuthorityPayloadMissing,
    PrivacyBlocked,
    DegradedButReadable,
    ReadyPublicCurrent,
}

impl BridgeReadinessState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::BridgeUnavailable => "bridge_unavailable",
            Self::ProfileMissingField => "profile_missing_field",
            Self::S2GraphBlocked => "s2_graph_blocked",
            Self::S3SubscriptionBlocked => "s3_subscription_blocked",
            Self::S5ReviewBlocked => "s5_review_blocked",
            Self::AuthorityPayloadMissing => "authority_payload_missing",
            Self::PrivacyBlocked => "privacy_blocked",
            Self::DegradedButReadable => "degraded_but_readable",
            Self::ReadyPublicCurrent => "ready_public_current",
        }
    }

    /// Severity classification — `ok` / `degraded` / `blocked`.
    pub fn severity(self) -> &'static str {
        match self {
            Self::ReadyPublicCurrent => "ok",
            Self::DegradedButReadable => "degraded",
            _ => "blocked",
        }
    }

    /// Whether this state distinguishes a specific dimension of readiness
    /// (kernel profile / S2 / S3 / S5 / authority / privacy). Used by
    /// readiness tests to verify the taxonomy is rich enough.
    pub fn is_dimensional(self) -> bool {
        matches!(
            self,
            Self::ProfileMissingField
                | Self::S2GraphBlocked
                | Self::S3SubscriptionBlocked
                | Self::S5ReviewBlocked
                | Self::AuthorityPayloadMissing
                | Self::PrivacyBlocked
        )
    }

    pub fn all() -> &'static [BridgeReadinessState] {
        &[
            Self::BridgeUnavailable,
            Self::ProfileMissingField,
            Self::S2GraphBlocked,
            Self::S3SubscriptionBlocked,
            Self::S5ReviewBlocked,
            Self::AuthorityPayloadMissing,
            Self::PrivacyBlocked,
            Self::DegradedButReadable,
            Self::ReadyPublicCurrent,
        ]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BridgeReadinessSnapshot {
    pub state: BridgeReadinessState,
    pub severity: &'static str,
    pub reason: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub gateway_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub probed: Option<bool>,
}

/// Augmented profile response — the raw `MathemeHarmonicProfile` plus
/// `provenance` metadata that names which CLI binary produced it.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileShowResponse {
    pub source: &'static str,
    pub cli_version: &'static str,
    pub profile: MathemeHarmonicProfile,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RoleDictionaries {
    pub pointer_rings: Vec<&'static str>,
    pub helices: Vec<&'static str>,
    pub relation_roles: Vec<&'static str>,
    pub interval_roles: Vec<&'static str>,
    pub ratio_roles: Vec<&'static str>,
    pub bedrock_roles: Vec<&'static str>,
    pub context_frame_notations: Vec<&'static str>,
}

impl RoleDictionaries {
    pub fn canonical() -> Self {
        // Domains from Body/S/S0/epi-lib/include/pointer_web.h:
        let pointer_rings = (0u8..=2).filter_map(pointer_ring_name).collect();
        let helices = (0u8..=2).filter_map(helix_name).collect();
        let relation_roles = (0u8..=8).filter_map(relation_role_name).collect();
        let interval_roles = [0u8, 1, 2, 6, 10, 12]
            .into_iter()
            .filter_map(interval_role_name)
            .collect();
        let ratio_roles = (0u8..=6).filter_map(ratio_role_name).collect();
        let bedrock_roles = (0u8..=2).filter_map(bedrock_role_name).collect();
        let context_frame_notations = (0u8..=6).filter_map(context_frame_notation).collect();
        Self {
            pointer_rings,
            helices,
            relation_roles,
            interval_roles,
            ratio_roles,
            bedrock_roles,
            context_frame_notations,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PointerResponse {
    pub source: &'static str,
    pub cli_version: &'static str,
    pub tick: u64,
    pub pointer_anchor: portal_core::MathemePointerAnchorProjection,
    pub context_frames: portal_core::MathemeContextFrameWebProjection,
    pub role_dictionaries: RoleDictionaries,
    pub web_cardinality: u8,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodonResponse {
    pub source: &'static str,
    pub cli_version: &'static str,
    pub lens: u8,
    pub mode: u8,
    pub codon_id: u8,
    pub rotation: u8,
    pub codon_class: String,
}

/// Run the `epi profile <cmd>` dispatcher.
pub fn run(cmd: &ProfileCmd) -> Result<serde_json::Value, String> {
    match cmd {
        &ProfileCmd::Show { cycle, sub_tick } => {
            let tick = kernel_tick_from_epogdoon(cycle, sub_tick);
            let profile = MathemeHarmonicProfile::from_tick(tick);
            let resp = ProfileShowResponse {
                source: "portal_core::MathemeHarmonicProfile::from_tick",
                cli_version: env!("CARGO_PKG_VERSION"),
                profile,
            };
            serde_json::to_value(&resp).map_err(|e| format!("serialise profile: {e}"))
        }
        &ProfileCmd::Pointer { cycle, sub_tick } => {
            let tick = kernel_tick_from_epogdoon(cycle, sub_tick);
            let profile = MathemeHarmonicProfile::from_tick(tick);
            let resp = PointerResponse {
                source: "portal_core::MathemeHarmonicProfile.pointer_anchor + context_frames",
                cli_version: env!("CARGO_PKG_VERSION"),
                tick: profile.tick,
                web_cardinality: profile.pointer_anchor.web_cardinality,
                pointer_anchor: profile.pointer_anchor,
                context_frames: profile.context_frames,
                role_dictionaries: RoleDictionaries::canonical(),
            };
            serde_json::to_value(&resp).map_err(|e| format!("serialise pointer: {e}"))
        }
        &ProfileCmd::Codon { lens, mode } => {
            let projection = codon_rotation_from_lens_mode(lens, mode).ok_or_else(|| {
                format!("codon_rotation_from_lens_mode({lens},{mode}): no projection")
            })?;
            let resp = CodonResponse {
                source: "portal_core::codon_rotation_from_lens_mode",
                cli_version: env!("CARGO_PKG_VERSION"),
                lens,
                mode,
                codon_id: projection.codon_id,
                rotation: projection.rotation,
                codon_class: projection.codon_class.to_string(),
            };
            serde_json::to_value(&resp).map_err(|e| format!("serialise codon: {e}"))
        }
        ProfileCmd::Readiness { probe, gateway_url } => {
            let snapshot = if *probe {
                probe_gateway_readiness(gateway_url)
            } else {
                BridgeReadinessSnapshot {
                    state: BridgeReadinessState::BridgeUnavailable,
                    severity: BridgeReadinessState::BridgeUnavailable.severity(),
                    reason: "no probe requested — pass --probe to call the gateway".to_string(),
                    gateway_url: Some(gateway_url.clone()),
                    probed: Some(false),
                }
            };
            serde_json::to_value(&snapshot).map_err(|e| format!("serialise readiness: {e}"))
        }
    }
}

fn probe_gateway_readiness(gateway_url: &str) -> BridgeReadinessSnapshot {
    use std::net::{SocketAddr, TcpStream, ToSocketAddrs};
    use std::time::Duration;

    // Parse host:port out of the gateway URL. We deliberately use raw TCP
    // here (not HTTP) — Track 04 owns the gateway HTTP contract; T1's job is
    // honest reachability reporting. A reqwest::blocking client would spin
    // up its own tokio runtime and conflict with cargo-test harnesses.
    let trimmed = gateway_url.trim_end_matches('/');
    let host_port = trimmed
        .strip_prefix("http://")
        .or_else(|| trimmed.strip_prefix("https://"))
        .unwrap_or(trimmed);
    // Drop any trailing path component.
    let authority = host_port.split('/').next().unwrap_or(host_port);

    let socket_addrs: Vec<SocketAddr> = match authority.to_socket_addrs() {
        Ok(iter) => iter.collect(),
        Err(err) => {
            return BridgeReadinessSnapshot {
                state: BridgeReadinessState::BridgeUnavailable,
                severity: BridgeReadinessState::BridgeUnavailable.severity(),
                reason: format!("gateway unreachable: cannot resolve {authority}: {err}"),
                gateway_url: Some(gateway_url.to_string()),
                probed: Some(true),
            };
        }
    };

    let timeout = Duration::from_millis(1500);
    for addr in &socket_addrs {
        match TcpStream::connect_timeout(addr, timeout) {
            Ok(_) => {
                return BridgeReadinessSnapshot {
                    state: BridgeReadinessState::DegradedButReadable,
                    severity: BridgeReadinessState::DegradedButReadable.severity(),
                    reason: format!(
                        "gateway TCP reachable at {addr}; HTTP/contract verification \
                         deferred to Track 04 T6"
                    ),
                    gateway_url: Some(gateway_url.to_string()),
                    probed: Some(true),
                };
            }
            Err(_) => continue,
        }
    }

    BridgeReadinessSnapshot {
        state: BridgeReadinessState::BridgeUnavailable,
        severity: BridgeReadinessState::BridgeUnavailable.severity(),
        reason: format!("gateway unreachable: no TCP route to {authority}"),
        gateway_url: Some(gateway_url.to_string()),
        probed: Some(true),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn readiness_taxonomy_covers_nine_states() {
        let all = BridgeReadinessState::all();
        assert_eq!(all.len(), 9);
        for s in all {
            assert!(!s.as_str().is_empty());
        }
    }

    #[test]
    fn readiness_severity_partitions_states() {
        assert_eq!(BridgeReadinessState::ReadyPublicCurrent.severity(), "ok");
        assert_eq!(
            BridgeReadinessState::DegradedButReadable.severity(),
            "degraded"
        );
        for s in BridgeReadinessState::all() {
            if !matches!(
                s,
                BridgeReadinessState::ReadyPublicCurrent
                    | BridgeReadinessState::DegradedButReadable
            ) {
                assert_eq!(s.severity(), "blocked", "{s:?} should be blocked-severity");
            }
        }
    }

    #[test]
    fn readiness_dimensional_states_match_07_t0_taxonomy() {
        let dimensional: Vec<_> = BridgeReadinessState::all()
            .iter()
            .filter(|s| s.is_dimensional())
            .map(|s| s.as_str())
            .collect();
        assert_eq!(
            dimensional,
            vec![
                "profile_missing_field",
                "s2_graph_blocked",
                "s3_subscription_blocked",
                "s5_review_blocked",
                "authority_payload_missing",
                "privacy_blocked"
            ]
        );
    }

    #[test]
    fn role_dictionaries_match_canonical_label_sets() {
        let d = RoleDictionaries::canonical();
        assert_eq!(d.pointer_rings, vec!["family", "position", "lens"]);
        assert_eq!(d.helices, vec!["bimba", "pratibimba", "cross"]);
        assert_eq!(d.relation_roles.len(), 9);
        assert!(d.relation_roles.contains(&"family_link"));
        assert!(d.relation_roles.contains(&"mobius_return"));
        assert_eq!(d.interval_roles.len(), 6);
        assert!(d.interval_roles.contains(&"tritone"));
        assert_eq!(d.ratio_roles.len(), 7);
        assert!(d.ratio_roles.contains(&"epogdoon"));
        assert_eq!(d.bedrock_roles.len(), 3);
        assert_eq!(d.context_frame_notations.len(), 7);
        assert_eq!(d.context_frame_notations[0], "(00/00)");
        assert_eq!(d.context_frame_notations[6], "(5/0)");
    }

    #[test]
    fn run_profile_show_emits_real_portal_core_profile() {
        let value = run(&ProfileCmd::Show {
            cycle: 0,
            sub_tick: 0,
        })
        .expect("show ok");
        assert_eq!(
            value["source"],
            "portal_core::MathemeHarmonicProfile::from_tick"
        );
        assert!(value["profile"]["tick"].is_number());
        assert_eq!(value["profile"]["privacyClass"], "public-current-context");
        assert!(value["profile"]["vakAddress"].is_null());
    }

    #[test]
    fn run_profile_pointer_emits_36_cardinality_and_seven_cf() {
        let value = run(&ProfileCmd::Pointer {
            cycle: 0,
            sub_tick: 0,
        })
        .expect("pointer ok");
        assert_eq!(value["webCardinality"], 36);
        // contextFrames carries frameCount=7 per portal-core's
        // MathemeContextFrameWebProjection contract.
        assert_eq!(value["contextFrames"]["frameCount"], 7);
        // Role dictionaries cover the full TS-zod canonical sets.
        assert_eq!(
            value["roleDictionaries"]["pointerRings"]
                .as_array()
                .unwrap()
                .len(),
            3
        );
        assert_eq!(
            value["roleDictionaries"]["relationRoles"]
                .as_array()
                .unwrap()
                .len(),
            9
        );
        assert_eq!(
            value["roleDictionaries"]["intervalRoles"]
                .as_array()
                .unwrap()
                .len(),
            6
        );
        assert_eq!(
            value["roleDictionaries"]["contextFrameNotations"]
                .as_array()
                .unwrap()
                .len(),
            7
        );
    }

    #[test]
    fn run_profile_codon_calls_portal_core() {
        let value = run(&ProfileCmd::Codon { lens: 0, mode: 0 }).expect("codon ok");
        assert_eq!(
            value["source"],
            "portal_core::codon_rotation_from_lens_mode"
        );
        assert!(value["codonId"].is_number());
        assert!(value["rotation"].is_number());
        assert!(value["codonClass"].is_string());
    }

    #[test]
    fn run_profile_codon_rejects_invalid_lens_mode() {
        let err = run(&ProfileCmd::Codon { lens: 99, mode: 99 }).unwrap_err();
        assert!(err.contains("codon_rotation_from_lens_mode"));
    }

    #[test]
    fn run_profile_readiness_no_probe_returns_bridge_unavailable() {
        let value = run(&ProfileCmd::Readiness {
            probe: false,
            gateway_url: "http://127.0.0.1:9".into(),
        })
        .expect("readiness ok");
        assert_eq!(value["state"], "bridge_unavailable");
        assert_eq!(value["severity"], "blocked");
        assert_eq!(value["probed"], false);
        assert!(value["reason"].as_str().unwrap().contains("no probe"));
    }

    #[test]
    fn run_profile_readiness_probe_unreachable_returns_bridge_unavailable() {
        // Port 9 is unassigned/refused on macOS/Linux. The probe MUST report
        // bridge_unavailable, NOT a fake "ready" — proves no mock branch.
        let value = run(&ProfileCmd::Readiness {
            probe: true,
            gateway_url: "http://127.0.0.1:9".into(),
        })
        .expect("readiness ok");
        assert_eq!(value["state"], "bridge_unavailable");
        assert_eq!(value["probed"], true);
    }
}
