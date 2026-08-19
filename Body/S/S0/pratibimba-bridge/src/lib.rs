mod ffi;
pub mod cosmic;

use portal_core::{
    canonical_cf_position, kernel_tick_from_epogdoon, KernelTick, MathemeHarmonicProfile, VakAddress,
};
use ql_core::{QlAddress, QlFace, KERNEL_VERSION as QL_KERNEL_VERSION};
use ql_mef::{
    LensId, LensRef, SublensRef, MEF_REGISTRY_REVISION, MEF_REGISTRY_VERSION,
};
use serde::{Deserialize, Serialize};

pub use cosmic::*;
pub use ffi::{kernel_tick as call_epi_lib_kernel_tick, EpiLibKernelWitness};

pub const SNAPSHOT_SCHEMA: &str = "epi.pratibimba-primitive-snapshot/v1";
pub const PROVIDER_CONTRACT: &str = "epi.pratibimba-primitive-provider/v1";
pub const NATIVE_OWNER: &str = "epi";
pub const QL_PROVIDER_REVISION: &str = "d418abfff6f9e001c8c5ff083206329b298eddcf";
pub const EPI_SOURCE_REVISION: &str = env!("EPI_SOURCE_REVISION");

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PrimitiveStatus {
    Implemented,
    Partial,
    Stub,
    Research,
    ProviderUnavailable,
    Degraded,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CapabilityState {
    pub status: PrimitiveStatus,
    pub detail: String,
}

impl CapabilityState {
    fn implemented(detail: impl Into<String>) -> Self {
        Self {
            status: PrimitiveStatus::Implemented,
            detail: detail.into(),
        }
    }

    fn provider_unavailable(detail: impl Into<String>) -> Self {
        Self {
            status: PrimitiveStatus::ProviderUnavailable,
            detail: detail.into(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiAgentIdentity {
    pub position: u8,
    pub bimba_ref: String,
    pub name: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiDomainRoot {
    pub index: u8,
    pub bimba_ref: String,
    pub pratibimba_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiWorldAddress {
    pub canonical_ref: String,
    pub bimba_ref: String,
    pub domain_ref: String,
    pub face: String,
    pub agent_ref: String,
}

pub fn resolve_bimba_address(bimba_ref: &str) -> Option<EpiWorldAddress> {
    match bimba_ref {
        "#-4" => Some(EpiWorldAddress {
            canonical_ref: "epi:bimba:#-4/M4'".to_owned(),
            bimba_ref: "#-4".to_owned(),
            domain_ref: "M4'".to_owned(),
            face: "pratibimba".to_owned(),
            agent_ref: "epi:agent:nara".to_owned(),
        }),
        _ => None,
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelPrimitiveState {
    pub status: PrimitiveStatus,
    pub epi_lib: EpiLibKernelWitness,
    pub portal_core_tick: KernelTick,
    pub parity: bool,
    pub harmonic_profile: MathemeHarmonicProfile,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QlPrimitiveState {
    pub status: PrimitiveStatus,
    pub ql_address: String,
    pub position: u8,
    pub face: String,
    pub lens_ref: String,
    pub sublens_ref: String,
    pub context_frame: Option<String>,
    pub ql_kernel_version: String,
    pub mef_registry_version: String,
    pub mef_registry_revision: u16,
    pub provider_revision: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VakPrimitiveState {
    pub grammar: CapabilityState,
    pub current_state: CapabilityState,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<VakAddress>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NaraProtectedContext {
    pub identity_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub personal_field_ref: Option<String>,
    pub day_id: String,
    pub now_path: String,
    pub session_key: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub episode_ref: Option<String>,
    pub privacy_class: String,
    pub source_class: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_ref: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraFloorState {
    pub status: PrimitiveStatus,
    pub protected_addressing: CapabilityState,
    pub journal_parse_boundary: CapabilityState,
    pub persistent_crud: CapabilityState,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub context: Option<NaraProtectedContext>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiTemporalState {
    pub current_tick: CapabilityState,
    pub day_now: CapabilityState,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub day_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub now_path: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MahamayaPrimitiveState {
    pub status: PrimitiveStatus,
    pub address64: Option<u8>,
    pub codon: Option<String>,
    pub hexagram: Option<String>,
    pub transcription_state: String,
    pub dataset_lut_state: String,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrimitiveProvenance {
    pub semantic_sources: Vec<String>,
    pub implementations: Vec<String>,
    pub source_revision: String,
    pub ql_provider_revision: String,
    pub operation: String,
    pub input_refs: Vec<String>,
    pub result_class: String,
    pub readiness: PrimitiveStatus,
    pub observed_at_unix_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiPrimitiveSnapshot {
    pub schema: String,
    pub provider_contract: String,
    pub native_owner: String,
    pub source_revision: String,
    pub status: PrimitiveStatus,
    pub current_address: EpiWorldAddress,
    pub roots: Vec<EpiDomainRoot>,
    pub agents: Vec<EpiAgentIdentity>,
    pub kernel: KernelPrimitiveState,
    pub ql: QlPrimitiveState,
    pub vak: VakPrimitiveState,
    pub time: EpiTemporalState,
    pub nara: NaraFloorState,
    pub mahamaya: MahamayaPrimitiveState,
    pub provenance: PrimitiveProvenance,
}

pub fn snapshot(
    timestamp_ms: u64,
    generation: u64,
    vak: Option<VakAddress>,
    nara_context: Option<NaraProtectedContext>,
) -> Result<EpiPrimitiveSnapshot, String> {
    if let Some(vak) = vak.as_ref() {
        if canonical_cf_position(&vak.cf).is_none() {
            return Err(format!("VAK CF `{}` is not a canonical portal-core context frame", vak.cf));
        }
    }
    validate_nara_context(nara_context.as_ref())?;

    let total_seconds = timestamp_ms / 1_000;
    let cycle = total_seconds / 12;
    let sub_tick = (total_seconds % 12) as u8;

    let epi_lib = ffi::kernel_tick(cycle, sub_tick)?;
    let portal_core_tick = kernel_tick_from_epogdoon(cycle, sub_tick);
    let parity = tick_parity(&epi_lib, portal_core_tick);
    if !parity {
        return Err("epi-lib and portal-core kernel tick parity failed".to_owned());
    }

    let harmonic_profile = match vak.clone() {
        Some(vak) => MathemeHarmonicProfile::with_vak(portal_core_tick, vak),
        None => MathemeHarmonicProfile::from_tick(portal_core_tick),
    };

    let ql = ql_state(&harmonic_profile)?;
    let current_address = resolve_bimba_address("#-4")
        .ok_or_else(|| "canonical Nara Bimba address # -4 failed to resolve".replace("# -4", "#-4"))?;

    let vak_state = VakPrimitiveState {
        grammar: CapabilityState::implemented(
            "portal-core::VakAddress preserves CPF/CT/CP/CF/CFP/CS and canonical CF validation",
        ),
        current_state: if harmonic_profile.vak_address.is_some() {
            CapabilityState::implemented("current VAK state supplied by an explicit Epi-owned input")
        } else {
            CapabilityState::provider_unavailable(
                "VAK grammar is implemented; no current VAK producer was supplied to this observation",
            )
        },
        value: harmonic_profile.vak_address.clone(),
    };

    let (day_now, day_id, now_path) = match nara_context.as_ref() {
        Some(context) => (
            CapabilityState::implemented(
                "protected DAY/NOW handles supplied without journal or identity body disclosure",
            ),
            Some(context.day_id.clone()),
            Some(context.now_path.clone()),
        ),
        None => (
            CapabilityState::provider_unavailable(
                "current kernel tick is available, but Nara DAY/NOW requires a protected Nara context provider",
            ),
            None,
            None,
        ),
    };

    let nara = NaraFloorState {
        status: if nara_context.is_some() {
            PrimitiveStatus::Partial
        } else {
            PrimitiveStatus::ProviderUnavailable
        },
        protected_addressing: if nara_context.is_some() {
            CapabilityState::implemented(
                "stable protected identity/day/session/episode handles are addressable",
            )
        } else {
            CapabilityState::provider_unavailable(
                "no protected Nara context handoff was supplied",
            )
        },
        journal_parse_boundary: CapabilityState::implemented(
            "portal-core::NaraJournalParser derives protected-local observations while retaining raw-body privacy",
        ),
        persistent_crud: CapabilityState::provider_unavailable(
            "this minimum bridge does not claim a Nara persistence provider; Prompt B must bind the existing protected store owner",
        ),
        context: nara_context.clone(),
    };

    let binary = &harmonic_profile.mahamaya;
    let mahamaya = MahamayaPrimitiveState {
        status: PrimitiveStatus::Partial,
        address64: binary.mahamaya_address64,
        codon: binary.codon.clone(),
        hexagram: binary.hexagram.clone(),
        transcription_state: binary.transcription_state.clone(),
        dataset_lut_state: binary.dataset_lut_state.clone(),
        provenance: binary.m3_codec_provenance.clone(),
    };

    let input_refs = vec![
        format!("timestamp-ms:{timestamp_ms}"),
        format!("generation:{generation}"),
        current_address.canonical_ref.clone(),
        ql.ql_address.clone(),
    ];

    Ok(EpiPrimitiveSnapshot {
        schema: SNAPSHOT_SCHEMA.to_owned(),
        provider_contract: PROVIDER_CONTRACT.to_owned(),
        native_owner: NATIVE_OWNER.to_owned(),
        source_revision: EPI_SOURCE_REVISION.to_owned(),
        status: PrimitiveStatus::Implemented,
        current_address,
        roots: epi_roots(),
        agents: epi_agents(),
        kernel: KernelPrimitiveState {
            status: PrimitiveStatus::Implemented,
            epi_lib,
            portal_core_tick,
            parity,
            harmonic_profile,
        },
        ql,
        vak: vak_state,
        time: EpiTemporalState {
            current_tick: CapabilityState::implemented(
                "epi-lib C tick and portal-core Rust tick agree for this observation",
            ),
            day_now,
            day_id,
            now_path,
        },
        nara,
        mahamaya,
        provenance: PrimitiveProvenance {
            semantic_sources: vec![
                "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md".to_owned(),
                "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md".to_owned(),
                "Body/S/S0/portal-core/src/vak_address.rs".to_owned(),
                "EpiLogos/QL-MEF executable ql-core + ql-mef contracts".to_owned(),
            ],
            implementations: vec![
                "Body/S/S0/epi-lib/src/kernel.c".to_owned(),
                "Body/S/S0/portal-core/src/kernel.rs".to_owned(),
                "Body/S/S0/portal-core/src/nara_journal.rs".to_owned(),
            ],
            source_revision: EPI_SOURCE_REVISION.to_owned(),
            ql_provider_revision: QL_PROVIDER_REVISION.to_owned(),
            operation: "observe-pratibimba-primitives".to_owned(),
            input_refs,
            result_class: "deterministic+derived-semantic".to_owned(),
            readiness: PrimitiveStatus::Implemented,
            observed_at_unix_ms: timestamp_ms,
        },
    })
}

fn ql_state(profile: &MathemeHarmonicProfile) -> Result<QlPrimitiveState, String> {
    let face = match profile.helix.as_str() {
        "bimba" => QlFace::Direct,
        "pratibimba" => QlFace::Conjugate,
        other => return Err(format!("unsupported portal-core helix `{other}`")),
    };
    let address = QlAddress::sixfold(profile.position6, face, 0).map_err(|error| error.to_string())?;
    let lens_id = lens_id(profile.lens_mode.lens)?;
    let lens = LensRef::canonical(lens_id);
    let sublens = SublensRef::canonical(lens_id, profile.position6).map_err(|error| error.to_string())?;

    Ok(QlPrimitiveState {
        status: PrimitiveStatus::Implemented,
        ql_address: address.to_string(),
        position: profile.position6,
        face: face.to_string(),
        lens_ref: lens.to_string(),
        sublens_ref: sublens.to_string(),
        context_frame: profile.context_frames.active_frame.clone(),
        ql_kernel_version: QL_KERNEL_VERSION.to_owned(),
        mef_registry_version: MEF_REGISTRY_VERSION.to_owned(),
        mef_registry_revision: MEF_REGISTRY_REVISION,
        provider_revision: QL_PROVIDER_REVISION.to_owned(),
    })
}

fn lens_id(value: u8) -> Result<LensId, String> {
    match value {
        0 => Ok(LensId::L0),
        1 => Ok(LensId::L1),
        2 => Ok(LensId::L2),
        3 => Ok(LensId::L3),
        4 => Ok(LensId::L4),
        5 => Ok(LensId::L5),
        6 => Ok(LensId::L0Prime),
        7 => Ok(LensId::L1Prime),
        8 => Ok(LensId::L2Prime),
        9 => Ok(LensId::L3Prime),
        10 => Ok(LensId::L4Prime),
        11 => Ok(LensId::L5Prime),
        other => Err(format!("portal-core emitted invalid lens index {other}")),
    }
}

fn tick_parity(c_tick: &EpiLibKernelWitness, rust_tick: KernelTick) -> bool {
    c_tick.cycle == rust_tick.cycle
        && c_tick.sub_tick == rust_tick.sub_tick
        && c_tick.phase == rust_tick.phase as u8
        && c_tick.element == rust_tick.element as u8
        && c_tick.position6 == rust_tick.position6
        && (c_tick.harmonic_ratio - rust_tick.harmonic_ratio).abs() <= 1.0e-6
}

fn validate_nara_context(context: Option<&NaraProtectedContext>) -> Result<(), String> {
    let Some(context) = context else {
        return Ok(());
    };
    for (name, value) in [
        ("identity_ref", context.identity_ref.as_str()),
        ("day_id", context.day_id.as_str()),
        ("now_path", context.now_path.as_str()),
        ("session_key", context.session_key.as_str()),
        ("privacy_class", context.privacy_class.as_str()),
        ("source_class", context.source_class.as_str()),
    ] {
        if value.trim().is_empty() {
            return Err(format!("Nara protected context requires non-empty {name}"));
        }
    }
    if !context.privacy_class.starts_with("protected") {
        return Err("Nara protected context must declare a protected privacy class".to_owned());
    }
    Ok(())
}

fn epi_agents() -> Vec<EpiAgentIdentity> {
    [
        (0, "#-0", "Anuttara"),
        (1, "#-1", "Paramasiva"),
        (2, "#-2", "Parashakti"),
        (3, "#-3", "Mahamaya"),
        (4, "#-4", "Nara"),
        (5, "#-5", "Epii"),
    ]
    .into_iter()
    .map(|(position, bimba_ref, name)| EpiAgentIdentity {
        position,
        bimba_ref: bimba_ref.to_owned(),
        name: name.to_owned(),
    })
    .collect()
}

fn epi_roots() -> Vec<EpiDomainRoot> {
    (0u8..6)
        .map(|index| EpiDomainRoot {
            index,
            bimba_ref: format!("M{index}"),
            pratibimba_ref: format!("M{index}'"),
        })
        .collect()
}