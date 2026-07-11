use serde::Serialize;

pub const PORTAL_EVENT_NAMES: &[&str] = &[
    "portal.token",
    "portal.tool_call",
    "portal.lens_pressure",
    "portal.vak_eval",
    "portal.review_deposit",
    "portal.kairos_shift",
    "portal.spanda_transport",
];
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortalEventContract {
    pub event_name: &'static str,
    pub coordinate_owner: &'static str,
    pub projection_source: &'static str,
    pub payload_keys: &'static [&'static str],
    pub consumer_surfaces: &'static [&'static str],
}

pub const PORTAL_EVENT_CONTRACTS: &[PortalEventContract] = &[
    PortalEventContract {
        event_name: "portal.token",
        coordinate_owner: "S0'/S3",
        projection_source: "gateway transcript stream",
        payload_keys: &["sessionKey", "runId", "delta", "sequence"],
        consumer_surfaces: &["epi portal /", "OmniPanel /"],
    },
    PortalEventContract {
        event_name: "portal.tool_call",
        coordinate_owner: "S0'/S4",
        projection_source: "gateway runtime events",
        payload_keys: &["sessionKey", "toolName", "status", "input", "resultSnippet"],
        consumer_surfaces: &["epi portal /", "OmniPanel /", "run tree"],
    },
    PortalEventContract {
        event_name: "portal.lens_pressure",
        coordinate_owner: "S4'",
        projection_source: "Anima VAK/Psyche runtime",
        payload_keys: &["sessionKey", "lensId", "pressure", "reason"],
        consumer_surfaces: &["epi portal 0", "epi portal /", "Epii workbench"],
    },
    PortalEventContract {
        event_name: "portal.vak_eval",
        coordinate_owner: "S4'",
        projection_source: "Pleroma VAK gate",
        payload_keys: &["sessionKey", "cpf", "ct", "cp", "cf", "cfp", "cs"],
        consumer_surfaces: &["epi portal /", "Anima execution", "OmniPanel /"],
    },
    PortalEventContract {
        event_name: "portal.review_deposit",
        coordinate_owner: "S5'",
        projection_source: "Epii review inbox",
        payload_keys: &[
            "sessionKey",
            "dayId",
            "itemId",
            "requiresHuman",
            "sourceAgent",
        ],
        consumer_surfaces: &["epi portal 1", "OmniPanel /", "Epii inbox"],
    },
    PortalEventContract {
        event_name: "portal.kairos_shift",
        coordinate_owner: "S3'",
        projection_source: "global_temporal_surface",
        payload_keys: &["sessionKey", "dayId", "kairosSnapshotId", "fresh", "source"],
        consumer_surfaces: &["epi portal 0", "epi portal 1", "Tauri M3 clock"],
    },
    // 02.T2.14 / DR-M1-5 — engine-walk transport act, pushed IMMEDIATELY
    // (never waiting for the heartbeat sample). Payload = the act + the
    // post-act anchor (plain numbers; clients evaluate phase locally).
    PortalEventContract {
        event_name: "portal.spanda_transport",
        coordinate_owner: "S0/M1-3'",
        projection_source: "gateway spanda phase anchor",
        payload_keys: &["act", "epochMs", "phase0", "rateHz", "mode", "direction", "tick12"],
        consumer_surfaces: &["Tauri M1' navigator", "OmniPanel /", "epi portal 0"],
    },
];

pub fn portal_event_contracts() -> &'static [PortalEventContract] {
    PORTAL_EVENT_CONTRACTS
}
