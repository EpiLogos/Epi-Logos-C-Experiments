//! epi-s3-gateway-contract — S3 gateway protocol and method contract for Epi-Logos.
//!
//! Re-export façade over the split contract modules (Track 17.1): every public
//! symbol reaches consumers through this crate root, so module residency can
//! move without touching downstream imports.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3 |
//! | Residency  | Body/S/S3/gateway-contract/src/lib.rs |
//! | Position   | #3 — Gateway Control Plane contract surface |
//! | Actualises | [[S3-SPEC]], [[S3-ARCHITECTURE]] §2/§5.1, and Track 17.1 module split |
//!
//! # Public surface
//! * `protocol` — wire protocol (handshake / RPC envelope) + method-name registry.
//! * `dispatch_plan` — `METHOD_DISPATCH_PLAN` 7-kind classification of every method.
//! * `session` — session authority types and methods.
//! * `harness` — normalized harness dispatch envelope + turn-event stream (Track 42).
//! * `context` — contextual-slice surface (`ConversationSliceHandle`, redaction policies).
//! * `spacetime` / `being_pattern` — SpacetimeDB presence-layer + BeingPattern carriers.
//! * `kernel_bridge` — S0 kernel bridge packet/projection contract.
//! * `nara_pattern` — typed PatternPacket edge for the nara-session close seam
//!   (05.T5.11 `mahamaya_transcription` preserved refs + identity-safety law).
//! * `s1_vault` / `graphiti` / `temporal` / `privacy` / `portal_events` / `release` — per-domain method contracts.
//! * `aletheia` / `verifier` — S4-5' crystallisation and `s0'.verifier.*` contracts.
//! * Crate-root constants: `S0_PRIME_VERIFIER_METHODS`, `S2_GRAPH_GATEWAY_EXPOSED_METHODS`,
//!   S1 C-first type lifecycle method names, and the `M4_ARENA_*` route family
//!   (41.T41.6 — the `m4.arena.` literals stay in this file; its verification greps here).
//!
//! # Does NOT own
//! * Runtime behaviour — sibling `gateway/` (`epi-s3-gateway`) executes these contracts.
//! * Domain law for other layers: S4 dispatch semantics, S2 graph law, S5 world-return.
//! * Kernel state or projection math — `portal-core` / `epi-kernel-contract`.

mod aletheia;
mod being_pattern;
mod context;
mod dispatch_plan;
mod graphiti;
mod harness;
mod kernel_bridge;
mod nara_pattern;
mod portal_events;
mod privacy;
mod protocol;
mod release;
mod s1_vault;
mod session;
mod settings;
mod spacetime;
mod temporal;
mod verifier;

pub use aletheia::*;
pub use being_pattern::*;
pub use context::*;
pub use dispatch_plan::*;
pub use graphiti::*;
pub use harness::*;
pub use kernel_bridge::*;
pub use nara_pattern::*;
pub use portal_events::*;
pub use privacy::*;
pub use protocol::*;
pub use release::*;
pub use s1_vault::*;
pub use session::*;
pub use settings::*;
pub use spacetime::*;
pub use temporal::*;
pub use verifier::*;

pub use portal_core::{AnandaProjection, M3TranscriptionPacket};

pub const S0_PRIME_VERIFIER_CHECK_STATE_METHOD: &str = "s0'.verifier.check_state";
pub const S0_PRIME_VERIFIER_EMIT_QUERY_METHOD: &str = "s0'.verifier.emit_query";
pub const S0_PRIME_VERIFIER_VALIDATE_MEMBERSHIP_METHOD: &str = "s0'.verifier.validate_membership";
pub const S0_PRIME_VERIFIER_OWL_QUERY_METHOD: &str = "s0'.verifier.owl_query";
pub const S0_PRIME_VERIFIER_METHODS: &[&str] = &[
    S0_PRIME_VERIFIER_CHECK_STATE_METHOD,
    S0_PRIME_VERIFIER_EMIT_QUERY_METHOD,
    S0_PRIME_VERIFIER_VALIDATE_MEMBERSHIP_METHOD,
    S0_PRIME_VERIFIER_OWL_QUERY_METHOD,
];

pub const S0_PRIME_SETTINGS_API_KEY_STATUS_METHOD: &str = "s0'.settings.api_key_status";
pub const S0_PRIME_SETTINGS_OPT_IN_METHOD: &str = "s0'.settings.opt_in";
pub const S0_PRIME_SETTINGS_METHODS: &[&str] = &[
    S0_PRIME_SETTINGS_API_KEY_STATUS_METHOD,
    S0_PRIME_SETTINGS_OPT_IN_METHOD,
];

pub const S5_GNOSTIC_MUSICAL_TRANSCRIPT_METHOD: &str = "s5'.gnostic.musical_transcript";
pub const KERNEL_BRIDGE_M3_LENS_CODON_BINARY_METHOD: &str =
    "kernelBridge.m3.lensCodonBinary(lensId)";
pub const S2_GRAPH_ANANDA_POSITION_METHOD: &str = "s2.graph.ananda_position";
pub const S2_GRAPH_GDS_TANGENT_OVERLAY_METHOD: &str = "s2.graph.gds.tangent_overlay";
pub const S2_GRAPH_ONTOLOGY_RELOAD_METHOD: &str = "s2.graph.ontology.reload";
pub const S2_GRAPH_SEED_SNAPSHOT_METHOD: &str = "s2.graph.seed.snapshot";
pub const S2_GRAPH_CORE65_AUDIT_METHOD: &str = "s2.graph.core65.audit";
pub const S2_GRAPH_PROMOTION_DRY_RUN_METHOD: &str = "s2.graph.promotion.dry_run";
pub const S2_GRAPH_PROMOTION_COMMIT_METHOD: &str = "s2.graph.promotion.commit";
pub const S2_GRAPH_RELATION_FAMILY_LIST_METHOD: &str = "s2.graph.relation_family.list";
// 02.T2.13 / DR-M1-5 — the spanda walk family: engine-walk transport acts on
// the kernel-owned SpandaPhaseAnchor (M1-3-SPANDA-TRANSPORT-ARCHITECTURE §3).
// Involutions are NAMED: step carries `reflect` (11−n traversal-reversal);
// half_turn is the antiphase pole-swap (n+6 mod 12). One organism, one clock —
// these mutate the shared broadcast, never a private timeline.
pub const M1_SPANDA_HOLD_METHOD: &str = "m1.spanda.hold";
pub const M1_SPANDA_RELEASE_METHOD: &str = "m1.spanda.release";
pub const M1_SPANDA_WALK_TO_METHOD: &str = "m1.spanda.walk_to";
pub const M1_SPANDA_STEP_METHOD: &str = "m1.spanda.step";
pub const M1_SPANDA_HALF_TURN_METHOD: &str = "m1.spanda.half_turn";
pub const S1_TYPE_CLASSIFY_C_LAYER_METHOD: &str = "s1'.type.classify_c_layer";
pub const S1_ENTITY_PROMOTE_TO_TYPE_METHOD: &str = "s1'.entity.promote_to_type";
pub const S1_WORLD_GRADUATE_METHOD: &str = "s1'.world.graduate";
// CCT-14 (+14b) entity-candidate lifecycle + review surfaces. Per
// DR-S5-ONE-1 each route pairs with a CLI command (`epi entity ...` /
// `epi world ...`).
pub const S1_ENTITY_CAPTURE_METHOD: &str = "s1'.entity.capture";
pub const S1_ENTITY_CLASSIFY_METHOD: &str = "s1'.entity.classify";
pub const S1_ENTITY_LIST_METHOD: &str = "s1'.entity.list";
pub const S1_WORLD_LIST_ENTITIES_METHOD: &str = "s1'.world.list_entities";
pub const S1_ENTITY_LIFECYCLE_METHODS: &[&str] = &[
    S1_ENTITY_CAPTURE_METHOD,
    S1_ENTITY_CLASSIFY_METHOD,
    S1_ENTITY_PROMOTE_TO_TYPE_METHOD,
    S1_WORLD_GRADUATE_METHOD,
    S1_ENTITY_LIST_METHOD,
    S1_WORLD_LIST_ENTITIES_METHOD,
];

pub const S2_GRAPH_GATEWAY_EXPOSED_METHODS: &[&str] = &[
    S2_GRAPH_GDS_TANGENT_OVERLAY_METHOD,
    S2_GRAPH_ONTOLOGY_RELOAD_METHOD,
    S2_GRAPH_SEED_SNAPSHOT_METHOD,
    S2_GRAPH_CORE65_AUDIT_METHOD,
    S2_GRAPH_PROMOTION_DRY_RUN_METHOD,
    S2_GRAPH_PROMOTION_COMMIT_METHOD,
    S2_GRAPH_RELATION_FAMILY_LIST_METHOD,
];

// ===================== 41.T41.6 m4 arena gateway route family =====================
//
// The dia-logical arena route family (Tranche 41.6). Eight routes register the
// scene/summon/turn/subscribe/close/list/warm-inventory/warm-release surface for
// the Vama Shakti factory landed in 41.4/41.5. The family obeys DR-S5-ONE-1: no
// route exists without a CLI command (`epi nara arena ...`), no CLI command
// writes outside Khora's session authority, and arena rows cache under the
// hierarchical Redis key `{day}/{session}/arena/{scene_key}/*`. The user-facing
// path is the Theia M4' widget; the CLI is the admin / scripted / test /
// ONE-substrate-compliance carve-out per DR-VAMA-4.
//
// These eight method-name constants are the canonical registration surface. The
// 41.6 verification greps this file for the literal method prefix; keep that
// literal confined to exactly these eight constant definitions.

use portal_core::{VamaShaktiClass, VamaShaktiReleaseReason};
use serde::{Deserialize, Serialize};

pub const M4_ARENA_SCENE_OPEN_METHOD: &str = "m4.arena.scene_open";
pub const M4_ARENA_SUMMON_METHOD: &str = "m4.arena.summon";
pub const M4_ARENA_TURN_ADVANCE_METHOD: &str = "m4.arena.turn_advance";
pub const M4_ARENA_SUBSCRIBE_METHOD: &str = "m4.arena.subscribe";
pub const M4_ARENA_SCENE_CLOSE_METHOD: &str = "m4.arena.scene_close";
pub const M4_ARENA_LIST_METHOD: &str = "m4.arena.list";
pub const M4_ARENA_VAMA_LIST_WARM_METHOD: &str = "m4.arena.vama_list_warm";
pub const M4_ARENA_VAMA_RELEASE_WARM_METHOD: &str = "m4.arena.vama_release_warm";

/// All eight arena method names, registration order matching the 41.6 table.
pub const M4_ARENA_METHODS: &[&str] = &[
    M4_ARENA_SCENE_OPEN_METHOD,
    M4_ARENA_SUMMON_METHOD,
    M4_ARENA_TURN_ADVANCE_METHOD,
    M4_ARENA_SUBSCRIBE_METHOD,
    M4_ARENA_SCENE_CLOSE_METHOD,
    M4_ARENA_LIST_METHOD,
    M4_ARENA_VAMA_LIST_WARM_METHOD,
    M4_ARENA_VAMA_RELEASE_WARM_METHOD,
];

pub fn m4_arena_methods() -> &'static [&'static str] {
    M4_ARENA_METHODS
}

/// One row of the arena route contract. Every route in the family MUST set
/// `khora_session_authority = true` (DR-S5-ONE-1: no CLI command may write
/// outside Khora's session authority) and name its CLI parity command plus the
/// hierarchical Redis key it caches under.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct M4ArenaRouteContract {
    pub method: &'static str,
    /// `epi nara arena ...` parity command (DR-VAMA-4 admin carve-out).
    pub cli_command: &'static str,
    /// Contract return-shape type name documented in the 41.6 table.
    pub returns: &'static str,
    /// Backing authority that ultimately executes the route.
    pub backing: &'static str,
    /// DR-S5-ONE-1 enforcement flag: route writes through Khora session authority.
    pub khora_session_authority: bool,
    /// Hierarchical Redis cache key template (`{day}/{session}/arena/...`).
    pub redis_key_template: &'static str,
}

pub const M4_ARENA_ROUTE_CONTRACTS: &[M4ArenaRouteContract] = &[
    M4ArenaRouteContract {
        method: M4_ARENA_SCENE_OPEN_METHOD,
        cli_command: "epi nara arena scene-open",
        returns: "ArenaSceneHandle",
        backing: "new ArenaScene row; refuses without CPF brainstorm token",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/{scene_key}/scene",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_SUMMON_METHOD,
        cli_command: "epi nara arena summon",
        returns: "VamaShaktiHandle",
        backing: "dispatches techne_vama_summon; appends ArenaPresence",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/{scene_key}/presence",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_TURN_ADVANCE_METHOD,
        cli_command: "epi nara arena turn-advance",
        returns: "TurnReceipt",
        backing: "Anima orchestration; appends ArenaTurn + ArenaDialogueLine",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/{scene_key}/turn",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_SUBSCRIBE_METHOD,
        cli_command: "epi nara arena subscribe",
        returns: "ArenaEventStream",
        backing: "SpacetimeDB subscription; protected-local stream",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/{scene_key}/stream",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_SCENE_CLOSE_METHOD,
        cli_command: "epi nara arena scene-close",
        returns: "ClosureReceipt",
        backing: "closes scene; releases ephemeral; emits closure for 41.9; preserves warm",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/{scene_key}/scene",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_LIST_METHOD,
        cli_command: "epi nara arena list",
        returns: "[ArenaSceneHandle]",
        backing: "lists scenes by status / pinned-coordinate / age",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/index",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_VAMA_LIST_WARM_METHOD,
        cli_command: "epi nara arena vama-list-warm",
        returns: "[WarmVamaShaktiHandle]",
        backing: "warm-vama-shakti inventory; admin-CLI-callable",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/warm/index",
    },
    M4ArenaRouteContract {
        method: M4_ARENA_VAMA_RELEASE_WARM_METHOD,
        cli_command: "epi nara arena vama-release-warm",
        returns: "ReleaseReceipt",
        backing: "GC or route to promotion (Tranche 41.11)",
        khora_session_authority: true,
        redis_key_template: "{day}/{session}/arena/warm/{vama_shakti_identity_handle}",
    },
];

pub fn m4_arena_route_contracts() -> &'static [M4ArenaRouteContract] {
    M4_ARENA_ROUTE_CONTRACTS
}

/// Khora session authority carried into every arena route. DR-S5-ONE-1 forbids
/// any arena write that bypasses the Khora-resolved NOW session: a populated
/// `vault_now_path` is the proof of authority.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaSessionAuthority {
    pub session_key: String,
    pub vault_now_path: String,
    pub day_id: String,
}

impl ArenaSessionAuthority {
    /// True when Khora has bound this session to a NOW vault artifact.
    pub fn is_authorized(&self) -> bool {
        !self.session_key.trim().is_empty() && !self.vault_now_path.trim().is_empty()
    }

    /// Hierarchical Redis prefix per DR-S5-ONE-1: `{day}/{session}/arena`.
    pub fn arena_redis_prefix(&self) -> String {
        format!("{}/{}/arena", self.day_id, self.session_key)
    }
}

/// Result of the scene-open route.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaSceneHandle {
    pub scene_key: String,
    pub pinned_coordinate: String,
    pub lifecycle_mode_default: String,
    pub admitted_constitutional: Vec<String>,
    pub status: String,
    pub opened_at_ms: u64,
    pub closed_at_ms: Option<u64>,
    pub admitted_vama_shakti_count: u32,
    pub turn_count: u32,
    pub cpf_brainstorm_confirmation_token: String,
    pub privacy_class: String,
}

/// Result of the summon route.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VamaShaktiHandle {
    pub scene_key: String,
    pub identity_handle: String,
    pub entity_coordinate: String,
    pub vama_shakti_class: VamaShaktiClass,
    pub lifecycle_mode: String,
    pub vama_shakti_clock_position: f32,
    pub psyche_template_revision_drift: bool,
    pub admitted_at_ms: u64,
}

/// Result of the turn-advance route.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TurnReceipt {
    pub scene_key: String,
    pub turn_id: u64,
    pub turn_index: u32,
    pub speaker_handle: String,
    pub speaker_class: Option<VamaShaktiClass>,
    pub line_id: u64,
    pub vak_address: portal_core::VakAddress,
    pub arrived_at_ms: u64,
}

/// Result of the subscribe route. Protected-local: dialogue bodies never cross
/// to the global projection (DR-VAMA-4/DR-VAMA-5).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaEventStream {
    pub scene_key: String,
    pub subscription_id: String,
    pub privacy_class: String,
    pub event_kinds: Vec<String>,
}

/// Result of the scene-close route.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClosureReceipt {
    pub scene_key: String,
    pub closure_intent: Option<String>,
    pub released_ephemeral_count: u32,
    pub preserved_warm_count: u32,
    pub closed_at_ms: u64,
    /// 41.9 hook: closure emitted for Moirai distillation.
    pub closure_emitted_for_distillation: bool,
}

/// Result row of the warm-inventory route. The protected-local q-activity
/// accumulator and psyche-template revision are deliberately absent.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WarmVamaShaktiHandle {
    pub identity_handle: String,
    pub coordinate_label: String,
    pub vama_shakti_class: VamaShaktiClass,
    pub turns_participated_count: u64,
    pub warmed_at_ms: u64,
    pub last_seen_at_ms: u64,
}

/// Result of the warm-release route.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseReceipt {
    pub identity_handle: String,
    pub reason: VamaShaktiReleaseReason,
    /// True when `reason == promote` so 41.11 promotion intake picks it up.
    pub routed_to_promotion: bool,
    pub released_at_ms: u64,
}

/// Filter for the scene-list route — by status / pinned-coordinate / age.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaSceneFilter {
    pub status: Option<String>,
    pub pinned_coordinate: Option<String>,
    pub max_age_ms: Option<u64>,
}

// ===================== 40.T40.1 s5' canon-update ledger route family =====================
//
// The Track 40 bimba-canon-update ledger is the trackable aggregator of
// *additive* canon proposals (identities, forms, entities, typed relations,
// vocabulary, cross-references). Tranche 40.1 lands its second-tier intake:
// five gateway routes under `s5'.canon_update.*` and the `epi bimba` CLI
// parity commands that drive the same runtime (DR-S5-ONE-1: no route without
// a CLI command, both over one substrate).
//
// SUBSTRATE, NOT NARA PERSONAL ACCESS (05.T5.10 decision): the canon-update
// ledger is a governed substrate surface, never one of the personal nara
// domains (jiva/jagrat/flow). `nara_bounded_access` therefore denies every
// `s5'.canon_update.*` method — proven by
// `canon_update_is_substrate_not_nara_bounded_access` in the gateway crate.
//
// These five method-name constants are the canonical registration surface;
// the 40.1 verification greps THIS file for the `s5'.canon_update.` literal,
// so keep that literal confined to these constants.

pub const S5_CANON_UPDATE_PROPOSE_METHOD: &str = "s5'.canon_update.propose";
pub const S5_CANON_UPDATE_STATUS_METHOD: &str = "s5'.canon_update.status";
pub const S5_CANON_UPDATE_LIST_METHOD: &str = "s5'.canon_update.list";
pub const S5_CANON_UPDATE_LAND_METHOD: &str = "s5'.canon_update.land";
pub const S5_CANON_UPDATE_REFUSE_METHOD: &str = "s5'.canon_update.refuse";

/// All five canon-update method names, registration order matching the 40.1
/// route table.
pub const S5_CANON_UPDATE_METHODS: &[&str] = &[
    S5_CANON_UPDATE_PROPOSE_METHOD,
    S5_CANON_UPDATE_STATUS_METHOD,
    S5_CANON_UPDATE_LIST_METHOD,
    S5_CANON_UPDATE_LAND_METHOD,
    S5_CANON_UPDATE_REFUSE_METHOD,
];

pub fn s5_canon_update_methods() -> &'static [&'static str] {
    S5_CANON_UPDATE_METHODS
}

/// The Track 40 §Categories enum. A ledger row is one of these seven kinds.
/// Only `Form` and `Rel` may escalate to a DR row (§Boundary discipline).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CanonUpdateCategory {
    Identity,
    Form,
    Entity,
    Rel,
    Vocab,
    Xref,
    FormExecTrace,
}

impl CanonUpdateCategory {
    /// Uppercase code used in the `CU-{CODE}-{N}` id (matches the ledger index).
    pub fn code(self) -> &'static str {
        match self {
            Self::Identity => "IDENTITY",
            Self::Form => "FORM",
            Self::Entity => "ENTITY",
            Self::Rel => "REL",
            Self::Vocab => "VOCAB",
            Self::Xref => "XREF",
            Self::FormExecTrace => "FORM-EXEC-TRACE",
        }
    }

    /// Only `Form` (new canonical form in an enumerated set) and `Rel` (new
    /// typed relation / schema family) escalate to a DR row (§Boundary
    /// discipline). All others ratify via batch user validation or the CCT-14
    /// entity-candidate lifecycle.
    pub fn escalates_to_dr(self) -> bool {
        matches!(self, Self::Form | Self::Rel)
    }

    /// The §Categories "Routes to" ratification path.
    pub fn ratification_path(self) -> &'static str {
        match self {
            Self::Identity | Self::Xref => "XREF paragraph (doc-ahead-landing)",
            Self::Form => "DR escalation",
            Self::Entity => "Entity-candidate lifecycle (CCT-14)",
            Self::Rel => "DR escalation (DR-IG-1 schema) + S2 graph-schema PR",
            Self::Vocab => "Vocabulary law extension (DR-S1-6)",
            Self::FormExecTrace => "FORM-EXEC-TRACE addition (extends DR-M3-6 trace)",
        }
    }
}

impl std::str::FromStr for CanonUpdateCategory {
    type Err = String;

    fn from_str(raw: &str) -> Result<Self, Self::Err> {
        match raw.trim().to_ascii_uppercase().replace('_', "-").as_str() {
            "IDENTITY" => Ok(Self::Identity),
            "FORM" => Ok(Self::Form),
            "ENTITY" => Ok(Self::Entity),
            "REL" => Ok(Self::Rel),
            "VOCAB" => Ok(Self::Vocab),
            "XREF" => Ok(Self::Xref),
            "FORM-EXEC-TRACE" => Ok(Self::FormExecTrace),
            other => Err(format!(
                "unknown canon-update category `{other}` (one of IDENTITY/FORM/ENTITY/REL/VOCAB/XREF/FORM-EXEC-TRACE)"
            )),
        }
    }
}

/// The Track 40 §Lifecycle state of a ledger row.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CanonUpdateState {
    Surfaced,
    Designed,
    Reviewed,
    Validated,
    Landed,
    Refused,
    Deferred,
    Superseded,
}

impl CanonUpdateState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Surfaced => "surfaced",
            Self::Designed => "designed",
            Self::Reviewed => "reviewed",
            Self::Validated => "validated",
            Self::Landed => "landed",
            Self::Refused => "refused",
            Self::Deferred => "deferred",
            Self::Superseded => "superseded",
        }
    }

    /// Forward rank along the `surfaced → designed → reviewed → validated →
    /// landed` spine. Terminal off-spine states (refused/deferred/superseded)
    /// carry no forward rank (`None`).
    pub fn spine_rank(self) -> Option<u8> {
        match self {
            Self::Surfaced => Some(0),
            Self::Designed => Some(1),
            Self::Reviewed => Some(2),
            Self::Validated => Some(3),
            Self::Landed => Some(4),
            Self::Refused | Self::Deferred | Self::Superseded => None,
        }
    }

    /// True when a row in this state may still transition (not a closed row).
    pub fn is_active(self) -> bool {
        !matches!(self, Self::Landed | Self::Refused | Self::Superseded)
    }
}

impl std::str::FromStr for CanonUpdateState {
    type Err = String;

    fn from_str(raw: &str) -> Result<Self, Self::Err> {
        match raw.trim().to_ascii_lowercase().as_str() {
            "surfaced" => Ok(Self::Surfaced),
            "designed" => Ok(Self::Designed),
            "reviewed" => Ok(Self::Reviewed),
            "validated" => Ok(Self::Validated),
            "landed" => Ok(Self::Landed),
            "refused" => Ok(Self::Refused),
            "deferred" => Ok(Self::Deferred),
            "superseded" => Ok(Self::Superseded),
            other => Err(format!("unknown canon-update status `{other}`")),
        }
    }
}

/// The inline `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->` marker location
/// a landed row records (§Cross-reference discipline). The ledger is the only
/// legal source of canon-update markers; Hen writes the actual marker into the
/// target canon file at promotion time.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateLandedMarker {
    pub file: String,
    pub anchor: String,
    pub date: String,
}

/// Result of `s5'.canon_update.propose` — a freshly drafted `surfaced` row.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateDraftReceipt {
    pub id: String,
    pub category: CanonUpdateCategory,
    pub status: CanonUpdateState,
    pub claim: String,
    pub target_landing_hint: Option<String>,
    pub ratification_path: String,
    pub escalates_to_dr: bool,
    pub surfaced_at_ms: u64,
}

/// Result of `s5'.canon_update.status` — the lifecycle view of one row.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateStatus {
    pub id: String,
    pub category: CanonUpdateCategory,
    pub status: CanonUpdateState,
    pub claim: String,
    pub target_landing_hint: Option<String>,
    pub landed_marker: Option<CanonUpdateLandedMarker>,
    pub refusal_reason: Option<String>,
}

/// A full ledger row as returned by `s5'.canon_update.list`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateRow {
    pub id: String,
    pub category: CanonUpdateCategory,
    pub status: CanonUpdateState,
    pub claim: String,
    pub target_landing_hint: Option<String>,
    pub landed_marker: Option<CanonUpdateLandedMarker>,
    pub refusal_reason: Option<String>,
    pub surfaced_at_ms: u64,
    pub updated_at_ms: u64,
}

/// Filter for `s5'.canon_update.list` — by lifecycle status and/or category.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateFilter {
    pub status: Option<CanonUpdateState>,
    pub category: Option<CanonUpdateCategory>,
}

/// Result of `s5'.canon_update.land` — confirmation the row reached `landed`
/// and the marker the ledger authored for Hen to write into the target file.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateLandConfirmation {
    pub id: String,
    pub status: CanonUpdateState,
    pub marker: CanonUpdateLandedMarker,
    /// The `CU-*@YYYY-MM-DD` entry for the target file's `canon_updates_landed`
    /// frontmatter array (§Cross-reference discipline (b)).
    pub frontmatter_index_entry: String,
}

/// Result of `s5'.canon_update.refuse` — the row closed as `refused`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateRefusal {
    pub id: String,
    pub status: CanonUpdateState,
    pub reason: String,
}

/// One row of the canon-update route contract. Every route pairs with an
/// `epi bimba ...` CLI command (DR-S5-ONE-1) and names its return shape.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateRouteContract {
    pub method: &'static str,
    /// `epi bimba ...` parity command.
    pub cli_command: &'static str,
    /// Contract return-shape type name.
    pub returns: &'static str,
    /// Backing authority that executes the route.
    pub backing: &'static str,
}

pub const S5_CANON_UPDATE_ROUTE_CONTRACTS: &[CanonUpdateRouteContract] = &[
    CanonUpdateRouteContract {
        method: S5_CANON_UPDATE_PROPOSE_METHOD,
        cli_command: "epi bimba propose",
        returns: "CanonUpdateDraftReceipt",
        backing: "drafts a new CU row at status: surfaced",
    },
    CanonUpdateRouteContract {
        method: S5_CANON_UPDATE_STATUS_METHOD,
        cli_command: "epi bimba show",
        returns: "CanonUpdateStatus",
        backing: "reads the lifecycle state of one CU row",
    },
    CanonUpdateRouteContract {
        method: S5_CANON_UPDATE_LIST_METHOD,
        cli_command: "epi bimba list",
        returns: "[CanonUpdateRow]",
        backing: "lists CU rows by status / category",
    },
    CanonUpdateRouteContract {
        method: S5_CANON_UPDATE_LAND_METHOD,
        cli_command: "epi bimba land",
        returns: "CanonUpdateLandConfirmation",
        backing: "transitions a CU row to status: landed; authors the marker for Hen",
    },
    CanonUpdateRouteContract {
        method: S5_CANON_UPDATE_REFUSE_METHOD,
        cli_command: "epi bimba refuse",
        returns: "CanonUpdateRefusal",
        backing: "closes a CU row as status: refused",
    },
];

pub fn s5_canon_update_route_contracts() -> &'static [CanonUpdateRouteContract] {
    S5_CANON_UPDATE_ROUTE_CONTRACTS
}

#[cfg(test)]
mod tests;
