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
    // 50.T50.13 / DR-VAK-6 — the audible/evaluable score event. Until this
    // tranche the name was declared here and BROADCAST BY NOTHING: the
    // capability matrix listed it under `pre_tool_call.must_emit` and no call
    // site existed. It is now emitted from the `s4'.vak.evaluate` dispatch arm.
    //
    // The six coordinates say WHERE a run spoke from; the tonal reading says
    // what it sounded like against the derived music (v3 §II-4.6: `mefLens` is
    // the scale-beneath, the CF-at-tonic is the mode, 12 x 7 = 84). DR-VAK-6's
    // action line names `diatonic_degree` / `resonance72_index` in snake_case;
    // every payload on this bus serialises camelCase (see `VakTonalReading`'s
    // `rename_all`), so the wire keys are `diatonicDegree` / `resonance72Index`
    // and the snake_case spellings appear nowhere on the wire.
    PortalEventContract {
        event_name: "portal.vak_eval",
        coordinate_owner: "S4'",
        projection_source: "s4'.vak.evaluate — Anima run trace read by the S0 kernel diatonic projection",
        payload_keys: &[
            "sessionKey",
            "cpf",
            "ct",
            "cp",
            "cf",
            "cfp",
            "cs",
            // DR-VAK-6 (1): required — the degree the evaluation was read at.
            "diatonicDegree",
            // DR-VAK-6 (3): which CF sits at tonic. Absent = Ionian.
            "modeTonicCf",
            // DR-VAK-6 (2): optional, only when an M2 resonance72 binding is
            // active. Never derived from the mode — see `ModalM2Address72`.
            "resonance72Index",
            "halfDecanIndex",
            // The run rendered against the 84-fold mode-tonic landscape.
            "tonalReading",
        ],
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
        payload_keys: &[
            "act",
            "epochMs",
            "phase0",
            "rateHz",
            "mode",
            "direction",
            "tick12",
        ],
        consumer_surfaces: &["Tauri M1' navigator", "OmniPanel /", "epi portal 0"],
    },
];

pub fn portal_event_contracts() -> &'static [PortalEventContract] {
    PORTAL_EVENT_CONTRACTS
}
