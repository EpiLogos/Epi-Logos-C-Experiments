use crate::nara::read_daily_surface;
use crate::personal::{
    ANUTTARA_GROUND_ACTION_REF, EPII_REVIEW_ACTION_REF, PERSONAL_PROPOSAL_ACTION_REF,
};
use crate::{EpiPrimitiveSnapshot, EPI_SOURCE_REVISION, QL_PROVIDER_REVISION};
use serde::Serialize;
use std::path::Path;

pub const PERSONAL_450_APPLICATION_SCHEMA: &str = "epi.personal-450-application/v1";
pub const PERSONAL_450_PRODUCT_ID: &str = "epi.personal.450";

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalCurrentSubject {
    pub subject_ref: String,
    pub episode_ref: String,
    pub episode_revision: u64,
    pub day_ref: String,
    pub day_id: String,
    pub now_path: String,
    pub coordinate_ref: String,
    pub ql_address: String,
    pub profile_ref: String,
    pub privacy_class: String,
    pub source_class: String,
    pub protected_body_disclosed: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalActivity {
    pub activity_ref: String,
    pub label: String,
    pub kind: String,
    pub disposition: Vec<String>,
    pub readiness: String,
    pub subject_ref: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub surface_ref: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub canonical_agent_ref: Option<String>,
    pub native_action_refs: Vec<String>,
    pub body_requirement: String,
    pub disclosure_law: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoundaryExpression {
    pub domain: String,
    pub ground_coordinate: String,
    pub ground_meaning: String,
    pub ground_ref: String,
    pub return_coordinate: String,
    pub return_meaning: String,
    pub return_ref: String,
    pub source_anchor: String,
    pub parent_inner_law: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeepOpenDescriptor {
    pub product_id: String,
    pub coordinate_root: String,
    pub subject_ref: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub selection_ref: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub surface_ref: Option<String>,
    pub readiness: String,
    pub preserves_subject_identity: bool,
    pub presentation_owned_by_host: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EventBindingSocket {
    pub subject_ref: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_ref: Option<String>,
    pub bindable_to_event_ref: bool,
    pub parallel_personal_event_state: bool,
    pub law: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalAuthorityLaw {
    pub selection_is_agent_context_disclosure: bool,
    pub proposal_is_adopted_human_source: bool,
    pub canonical_epii_agent_ref: String,
    pub agent_session_owner: String,
    pub knowledge_owner: String,
    pub durable_return_owner: String,
    pub protected_body_projection: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalApplicationProvenance {
    pub epi_source_revision: String,
    pub ql_provider_revision: String,
    pub semantic_sources: Vec<String>,
    pub product_scale: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Personal450Application {
    pub schema: String,
    pub product_id: String,
    pub native_owner: String,
    pub subject: PersonalCurrentSubject,
    pub activities: Vec<PersonalActivity>,
    pub boundaries: Vec<BoundaryExpression>,
    pub deep_open: Vec<DeepOpenDescriptor>,
    pub event_binding: EventBindingSocket,
    pub authority: PersonalAuthorityLaw,
    pub provenance: PersonalApplicationProvenance,
}

pub fn personal_application(
    vault_root: &Path,
    snapshot: &EpiPrimitiveSnapshot,
) -> Result<Personal450Application, String> {
    let daily = read_daily_surface(vault_root, snapshot)?;
    let subject_ref = daily.episode_ref.clone();
    let stable = stable_part(&subject_ref);
    let anuttara_bimba_ref = agent_bimba_ref(snapshot, 0)?;

    let subject = PersonalCurrentSubject {
        subject_ref: subject_ref.clone(),
        episode_ref: daily.episode_ref.clone(),
        episode_revision: daily.episode_revision,
        day_ref: daily.day_ref.clone(),
        day_id: daily.lived_context.day_id.clone(),
        now_path: daily.lived_context.now_path.clone(),
        coordinate_ref: daily.lived_context.coordinate_ref.clone(),
        ql_address: daily.lived_context.ql_address.clone(),
        profile_ref: daily.lived_context.profile_ref.clone(),
        privacy_class: daily.privacy_class.clone(),
        source_class: daily.source_class.clone(),
        protected_body_disclosed: false,
    };

    let activities = vec![
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.journal".into(),
            label: "Journal / writing / notes".into(),
            kind: "journal-writing-notes".into(),
            disposition: vec!["CANVAS".into()],
            readiness: "ready".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: Some(format!("epi:surface:personal:450:journal:{stable}")),
            canonical_agent_ref: None,
            native_action_refs: vec!["epi.action.nara.selection.sendoff".into()],
            body_requirement: "Epi-owned protected Nara daily provider".into(),
            disclosure_law: vec![
                "protected episode body remains local to the Nara Surface".into(),
                "only an exact saved UTF-8 range can become a governed selection child".into(),
            ],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.day-now".into(),
            label: "DAY / NOW".into(),
            kind: "day-now-current".into(),
            disposition: vec!["CANVAS".into(), "INSPECTOR".into()],
            readiness: "ready".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: Some(format!("epi:surface:personal:450:day-now:{stable}")),
            canonical_agent_ref: None,
            native_action_refs: Vec::new(),
            body_requirement: "safe current DAY/NOW and harmonic/profile handles from the Nara provider".into(),
            disclosure_law: vec![
                "DAY/NOW locates the lived episode without publishing its body".into(),
            ],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.flow".into(),
            label: "Flow / activity organisation".into(),
            kind: "flow-activity".into(),
            disposition: vec!["CANVAS".into()],
            readiness: "deferred-native-surface".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: None,
            canonical_agent_ref: None,
            native_action_refs: Vec::new(),
            body_requirement: "no standalone current Flow/Kanban provider is claimed by this bridge".into(),
            disclosure_law: vec!["do not manufacture task state from journal text".into()],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.dialogue".into(),
            label: "Epii dialogue".into(),
            kind: "canonical-agent-dialogue".into(),
            disposition: vec!["SIDECAR".into()],
            readiness: "host-binding-required".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: None,
            canonical_agent_ref: Some("epi:agent:epii".into()),
            native_action_refs: Vec::new(),
            body_requirement: "Actuation Agent/Agency + AIKit canonical AgentSession; never an Epi-local chat runtime".into(),
            disclosure_law: vec![
                "workbench selection is not Agent Context disclosure".into(),
                "AIKit/native policy decides what bounded material enters the AgentSession".into(),
            ],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.oracle".into(),
            label: "Oracle / reading".into(),
            kind: "oracle-reading".into(),
            disposition: vec!["CANVAS".into()],
            readiness: "deferred-native-oracle-provider".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: None,
            canonical_agent_ref: None,
            native_action_refs: Vec::new(),
            body_requirement: "M4 OracleFrame/artifact provider when current; deep M4 is not required for the parent".into(),
            disclosure_law: vec!["private oracle interpretation remains protected-local".into()],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.review".into(),
            label: "Review / Explain / provenance".into(),
            kind: "review-explain-provenance".into(),
            disposition: vec!["INSPECTOR".into(), "SIDECAR".into()],
            readiness: "ready".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: None,
            canonical_agent_ref: Some("epi:agent:epii".into()),
            native_action_refs: vec![EPII_REVIEW_ACTION_REF.into()],
            body_requirement: "canonical Epii AgentSession for dialogue; Epi one-shot review Reading/Action for bounded semantic review".into(),
            disclosure_law: vec!["generated review remains inferred/derived until recognised".into()],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.bimba".into(),
            label: "Bimba / source / canon reveal".into(),
            kind: "bimba-source-canon".into(),
            disposition: vec!["NAVIGATOR".into(), "KNOWLEDGE".into(), "CANVAS".into()],
            readiness: "ready-native-ref".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: None,
            canonical_agent_ref: Some("epi:agent:anuttara".into()),
            native_action_refs: vec![ANUTTARA_GROUND_ACTION_REF.into()],
            body_requirement: "shared O:I/AIKit Knowledge/navigation over Epi-native Bimba/source refs".into(),
            disclosure_law: vec![
                "Bimba semantic identity is not Neo4j/MCP/provider identity".into(),
                "the Epi bridge does not implement a generic graph application".into(),
            ],
        },
        PersonalActivity {
            activity_ref: "epi.personal.450.activity.return".into(),
            label: "Proposal / recognised return".into(),
            kind: "proposal-return".into(),
            disposition: vec!["COMMAND".into(), "INSPECTOR".into()],
            readiness: "ready-proposal-central-required-for-durable-return".into(),
            subject_ref: subject_ref.clone(),
            surface_ref: None,
            canonical_agent_ref: Some("epi:agent:epii".into()),
            native_action_refs: vec![PERSONAL_PROPOSAL_ACTION_REF.into(), "projectcentral.now.return".into()],
            body_requirement: "Epi proposal + Central native NOW/DAY owner path for durable human return".into(),
            disclosure_law: vec![
                "proposal is not adopted human source".into(),
                "durable promotion requires explicit human acceptance in Central".into(),
            ],
        },
    ];

    let boundaries = vec![
        BoundaryExpression {
            domain: "M4 / Nara".into(),
            ground_coordinate: "M4-0'".into(),
            ground_meaning: "protected identity/quintessence ground; the parent uses the current protected episode as its bounded lived subject without exposing deep identity internals".into(),
            ground_ref: subject_ref.clone(),
            return_coordinate: "M4-5'".into(),
            return_meaning: "Epii/Sophia review gate; activity may return a proposal but cannot silently become identity or human source".into(),
            return_ref: EPII_REVIEW_ACTION_REF.into(),
            source_anchor: "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md".into(),
            parent_inner_law: ".1-.4 are summonable only when a lived activity crosses them; the complete psychoid/quaternion/chakra field belongs to epi.deep.m4".into(),
        },
        BoundaryExpression {
            domain: "M5 / Epii".into(),
            ground_coordinate: "M5-0'".into(),
            ground_meaning: "Bimba/Gnostic/library ground from which Epii can teach, review and traverse source".into(),
            ground_ref: anuttara_bimba_ref.clone(),
            return_coordinate: "M5-5'".into(),
            return_meaning: "Logos/return seam expressed at parent scale as governed proposal and recognition, not the complete deep Logos Atelier".into(),
            return_ref: PERSONAL_PROPOSAL_ACTION_REF.into(),
            source_anchor: "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md".into(),
            parent_inner_law: ".1-.4 remain summoned capacities/contexts; the complete M5 IDE sixfold belongs to epi.deep.m5".into(),
        },
        BoundaryExpression {
            domain: "M0 / Anuttara-Bimba".into(),
            ground_coordinate: "M0-0'".into(),
            ground_meaning: "source-provenanced Anuttara/Bimba language and canonical world-ground".into(),
            ground_ref: anuttara_bimba_ref,
            return_coordinate: "M0-5'".into(),
            return_meaning: "pedagogy route back through Epii; no graph/provider becomes canon owner".into(),
            return_ref: "epi:agent:epii".into(),
            source_anchor: "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md".into(),
            parent_inner_law: ".1-.4 remain shared Knowledge/source relations when crossed; the full playable graph belongs to epi.deep.m0".into(),
        },
    ];

    let deep_open = [
        ("epi.deep.m4", "M4'"),
        ("epi.deep.m5", "M5'"),
        ("epi.deep.m0", "M0'"),
    ]
    .into_iter()
    .map(|(product_id, coordinate_root)| DeepOpenDescriptor {
        product_id: product_id.into(),
        coordinate_root: coordinate_root.into(),
        subject_ref: subject_ref.clone(),
        selection_ref: None,
        surface_ref: None,
        readiness: "declared-product-no-current-deep-body".into(),
        preserves_subject_identity: true,
        presentation_owned_by_host: true,
    })
    .collect();

    Ok(Personal450Application {
        schema: PERSONAL_450_APPLICATION_SCHEMA.into(),
        product_id: PERSONAL_450_PRODUCT_ID.into(),
        native_owner: "epi".into(),
        subject,
        activities,
        boundaries,
        deep_open,
        event_binding: EventBindingSocket {
            subject_ref,
            event_ref: None,
            bindable_to_event_ref: true,
            parallel_personal_event_state: false,
            law: "D may bind this exact Personal subject to its current/future eventRef; binding must not mint a parallel PersonalEvent identity".into(),
        },
        authority: PersonalAuthorityLaw {
            selection_is_agent_context_disclosure: false,
            proposal_is_adopted_human_source: false,
            canonical_epii_agent_ref: "epi:agent:epii".into(),
            agent_session_owner: "Actuation + AIKit".into(),
            knowledge_owner: "shared O:I/AIKit Knowledge over native Epi refs".into(),
            durable_return_owner: "Central NOW/DAY".into(),
            protected_body_projection: "local-only; no Explore/public Projection by default".into(),
        },
        provenance: PersonalApplicationProvenance {
            epi_source_revision: EPI_SOURCE_REVISION.into(),
            ql_provider_revision: QL_PROVIDER_REVISION.into(),
            semantic_sources: vec![
                "Idea/Bimba/Seeds/M/EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md".into(),
                "Idea/Bimba/Seeds/M/EPI-EIGHTFOLD-APPLICATION-ARCHITECTURE.md".into(),
                "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md".into(),
                "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md".into(),
                "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md".into(),
            ],
            product_scale: "parent-3:3; not a complete deep M4'/M5'/M0' renderer".into(),
        },
    })
}

fn agent_bimba_ref(snapshot: &EpiPrimitiveSnapshot, position: u8) -> Result<String, String> {
    snapshot
        .agents
        .iter()
        .find(|agent| agent.position == position)
        .map(|agent| agent.bimba_ref.clone())
        .ok_or_else(|| format!("primitive snapshot is missing canonical Epi Agent at position {position}"))
}

fn stable_part(value: &str) -> String {
    value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || matches!(character, '-' | '_' | '.') {
                character
            } else {
                '-'
            }
        })
        .collect()
}
