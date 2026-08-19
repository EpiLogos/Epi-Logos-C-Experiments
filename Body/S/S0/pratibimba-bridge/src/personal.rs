use crate::nara::{resolve_selection, NaraSelection, NaraSelectionRequest};
use crate::{EpiPrimitiveSnapshot, EPI_SOURCE_REVISION, QL_PROVIDER_REVISION};
use serde::{Deserialize, Serialize};
use std::path::Path;

pub const EPII_REVIEW_SCHEMA: &str = "epi.personal-epii-review/v1";
pub const PERSONAL_GROUND_SCHEMA: &str = "epi.personal-ground-orientation/v1";
pub const PERSONAL_PROPOSAL_SCHEMA: &str = "epi.personal-proposal/v1";

pub const EPII_REVIEW_ACTION_REF: &str = "epi.action.epii.review";
pub const EPII_REVIEW_CAPABILITY_REF: &str = "epi.capability.epii.personal-review";
pub const ANUTTARA_GROUND_ACTION_REF: &str = "epi.action.anuttara.ground";
pub const ANUTTARA_GROUND_CAPABILITY_REF: &str = "epi.capability.bimba.ground-read";
pub const PERSONAL_PROPOSAL_ACTION_REF: &str = "epi.action.personal.proposal";
pub const PERSONAL_PROPOSAL_CAPABILITY_REF: &str = "epi.capability.personal.proposal";

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum EpiiReviewMode {
    Explain,
    Review,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct EpiiReviewRequest {
    pub selection: NaraSelectionRequest,
    pub mode: EpiiReviewMode,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PersonalGroundRequest {
    pub selection: NaraSelectionRequest,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_ref: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PersonalProposalRequest {
    pub selection: NaraSelectionRequest,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ground_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub proposed_content: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalSubject {
    pub episode_ref: String,
    pub selection_ref: String,
    pub episode_revision: u64,
    pub start_byte: usize,
    pub end_byte: usize,
    pub selected_text: String,
    pub day_id: String,
    pub now_path: String,
    pub ql_address: String,
    pub coordinate_ref: String,
    pub profile_ref: String,
    pub privacy_class: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalEpiAgent {
    pub canonical_agent_ref: String,
    pub bimba_ref: String,
    pub name: String,
    pub position: u8,
    pub epi_function: String,
    pub materialisation_owner: String,
    pub bridge_runtime: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EpistemicStanding {
    pub authored: Vec<String>,
    pub observed: Vec<String>,
    pub inferred: Vec<String>,
    pub derived: Vec<String>,
    pub formal: Vec<String>,
    pub research: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalProvenance {
    pub epi_source_revision: String,
    pub ql_provider_revision: String,
    pub semantic_sources: Vec<String>,
    pub result_class: String,
    pub promotion: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiiReview {
    pub schema: String,
    pub action_ref: String,
    pub capability_ref: String,
    pub review_ref: String,
    pub mode: EpiiReviewMode,
    pub subject: PersonalSubject,
    pub agent: CanonicalEpiAgent,
    pub standing: EpistemicStanding,
    pub explanation: Vec<String>,
    pub review_questions: Vec<String>,
    pub summons: Vec<String>,
    pub return_law: Vec<String>,
    pub provenance: PersonalProvenance,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GroundRelation {
    pub from_ref: String,
    pub via_ref: String,
    pub to_ref: String,
    pub reason: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BimbaOrientation {
    pub semantic_ref: String,
    pub current_locus_ref: String,
    pub application_contract: String,
    pub provider_status: String,
    pub provider_identity_is_semantic_identity: bool,
    pub promotion: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalGroundOrientation {
    pub schema: String,
    pub action_ref: String,
    pub capability_ref: String,
    pub ground_ref: String,
    pub subject: PersonalSubject,
    pub agent: CanonicalEpiAgent,
    pub relation: GroundRelation,
    pub bimba: BimbaOrientation,
    pub source_anchors: Vec<String>,
    pub ql_orientation: Vec<String>,
    pub provenance: PersonalProvenance,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CentralReturnHint {
    pub action_ref: String,
    pub kind: String,
    pub status: String,
    pub actor_ref: String,
    pub requires_human_acceptance_for_durable_ground: bool,
    pub durable_promotion_action_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalProposal {
    pub schema: String,
    pub action_ref: String,
    pub capability_ref: String,
    pub proposal_ref: String,
    pub subject: PersonalSubject,
    pub proposed_content: String,
    pub source_class: String,
    pub adoption_state: String,
    pub source_mutation_performed: bool,
    pub review_ref: Option<String>,
    pub ground_ref: Option<String>,
    pub allowed_resolutions: Vec<String>,
    pub central_return: CentralReturnHint,
    pub provenance: PersonalProvenance,
}

pub fn review_selection(
    vault_root: &Path,
    snapshot: &EpiPrimitiveSnapshot,
    request: EpiiReviewRequest,
) -> Result<EpiiReview, String> {
    let selection = resolve_selection(vault_root, snapshot, request.selection)?;
    let subject = subject(&selection);
    let agent = agent(snapshot, 5, "epi:agent:epii", "recursive pedagogy / review / proposal / return")?;
    let mode_label = match request.mode {
        EpiiReviewMode::Explain => "explain",
        EpiiReviewMode::Review => "review",
    };
    let review_ref = format!(
        "epi:epii:{mode_label}:{}",
        stable_part(&selection.selection_ref)
    );

    Ok(EpiiReview {
        schema: EPII_REVIEW_SCHEMA.into(),
        action_ref: EPII_REVIEW_ACTION_REF.into(),
        capability_ref: EPII_REVIEW_CAPABILITY_REF.into(),
        review_ref,
        mode: request.mode,
        subject,
        agent,
        standing: EpistemicStanding {
            authored: vec![
                "the selected words are a bounded excerpt of the current human-authored protected Nara episode".into(),
            ],
            observed: vec![
                "episode revision and source range are observed store identity".into(),
                "DAY/NOW handles locate the lived encounter without authoring its meaning".into(),
            ],
            inferred: vec![
                "any interpretation of the passage remains an inference until independently recognised".into(),
            ],
            derived: vec![
                "harmonic profile, coordinate and current QL/MEF handles are derived/observed context, not human source".into(),
                "this Epii frame is generated Epi-specific review material and has no adoption authority".into(),
            ],
            formal: vec![
                "QL/MEF refs are formal orientation supplied by the pinned QL provider and do not amend canon".into(),
            ],
            research: vec![
                "psychoid or flourishing conclusions require evidence beyond a successful formal computation".into(),
            ],
        },
        explanation: vec![
            format!(
                "The current lived object is {} at revision {}, range {}–{}.",
                selection.episode_ref, selection.episode_revision, selection.start_byte, selection.end_byte
            ),
            format!(
                "Its encounter is situated at {} / {} with profile {}.",
                selection.day_id, selection.now_path, selection.profile_ref
            ),
            format!(
                "The current formal orientation is {} and the Epi coordinate is {}.",
                selection.ql_address, selection.coordinate_ref
            ),
            "Those coordinates explain where the passage is being encountered; they do not convert the human's words into a computed or canonical claim.".into(),
        ],
        review_questions: vec![
            "What in this passage is directly lived or reported, and what is already interpretation?".into(),
            "What returned difference, if any, is useful enough to keep without treating generation as adoption?".into(),
            "Which Epi/Bimba/source relation would make the proposed interpretation inspectable?".into(),
        ],
        summons: vec![
            "source".into(),
            "bimba".into(),
            "provenance".into(),
            "proposal".into(),
            "history".into(),
        ],
        return_law: vec![
            "formal-model return != operative software return".into(),
            "Epi theory/canon return != human personal return".into(),
            "proposal != recognised durable mutation".into(),
        ],
        provenance: provenance(vec![
            "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md",
            "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md",
            "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md",
        ]),
    })
}

pub fn orient_ground(
    vault_root: &Path,
    snapshot: &EpiPrimitiveSnapshot,
    request: PersonalGroundRequest,
) -> Result<PersonalGroundOrientation, String> {
    let selection = resolve_selection(vault_root, snapshot, request.selection)?;
    let subject = subject(&selection);
    let agent = agent(snapshot, 0, "epi:agent:anuttara", "source-ground / coordinate / provenance orientation")?;
    let review_ref = request
        .review_ref
        .unwrap_or_else(|| format!("epi:epii:review:{}", stable_part(&selection.selection_ref)));
    let ground_ref = format!("epi:anuttara:ground:{}", stable_part(&selection.selection_ref));
    let bimba_ref = agent.bimba_ref.clone();

    Ok(PersonalGroundOrientation {
        schema: PERSONAL_GROUND_SCHEMA.into(),
        action_ref: ANUTTARA_GROUND_ACTION_REF.into(),
        capability_ref: ANUTTARA_GROUND_CAPABILITY_REF.into(),
        ground_ref,
        subject,
        agent,
        relation: GroundRelation {
            from_ref: selection.selection_ref.clone(),
            via_ref: review_ref,
            to_ref: bimba_ref.clone(),
            reason: vec![
                "the selected object is a protected M4′/Nara lived episode range".into(),
                "M5′/Epii review asks for source/canon orientation without changing the lived object".into(),
                "M0′/Anuttara supplies the relevant standing ground, source and coordinate relation".into(),
                format!("the selection already carries canonical Epi coordinate {}", selection.coordinate_ref),
                format!("the selection already carries formal orientation {}", selection.ql_address),
            ],
        },
        bimba: BimbaOrientation {
            semantic_ref: bimba_ref,
            current_locus_ref: selection.coordinate_ref.clone(),
            application_contract: "Body/S/S2/external/bimba-mcp/BIMBA-APPLICATION-CONTRACT.md".into(),
            provider_status: "semantic refs resolved; graph provider not invoked by this one-shot Personal bridge".into(),
            provider_identity_is_semantic_identity: false,
            promotion: "none".into(),
        },
        source_anchors: vec![
            "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md".into(),
            "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md".into(),
            "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md".into(),
            "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md".into(),
            "Body/S/S2/external/bimba-mcp/BIMBA-APPLICATION-CONTRACT.md".into(),
        ],
        ql_orientation: vec![
            selection.ql_address.clone(),
            format!("QL provider revision {QL_PROVIDER_REVISION}"),
            "QL/refraction is formal/advisory orientation here; this operation performs no QL or Epi canon mutation".into(),
        ],
        provenance: provenance(vec![
            "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md",
            "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md",
            "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md",
            "Body/S/S2/external/bimba-mcp/BIMBA-APPLICATION-CONTRACT.md",
        ]),
    })
}

pub fn form_proposal(
    vault_root: &Path,
    snapshot: &EpiPrimitiveSnapshot,
    request: PersonalProposalRequest,
) -> Result<PersonalProposal, String> {
    let selection = resolve_selection(vault_root, snapshot, request.selection)?;
    let proposed_content = request
        .proposed_content
        .unwrap_or_else(|| selection.selected_text.clone());
    if proposed_content.trim().is_empty() {
        return Err("personal proposal content must not be empty".into());
    }
    let proposal_ref = format!(
        "epi:personal:proposal:{}",
        stable_part(&selection.selection_ref)
    );

    Ok(PersonalProposal {
        schema: PERSONAL_PROPOSAL_SCHEMA.into(),
        action_ref: PERSONAL_PROPOSAL_ACTION_REF.into(),
        capability_ref: PERSONAL_PROPOSAL_CAPABILITY_REF.into(),
        proposal_ref,
        subject: subject(&selection),
        proposed_content,
        source_class: "proposal".into(),
        adoption_state: "unreviewed".into(),
        source_mutation_performed: false,
        review_ref: request.review_ref,
        ground_ref: request.ground_ref,
        allowed_resolutions: vec![
            "retain-as-derived".into(),
            "reject".into(),
            "human-review".into(),
        ],
        central_return: CentralReturnHint {
            action_ref: "projectcentral.now.return".into(),
            kind: "handoff".into(),
            status: "waiting".into(),
            actor_ref: "epi:agent:epii".into(),
            requires_human_acceptance_for_durable_ground: true,
            durable_promotion_action_ref: "projectcentral.now.promote".into(),
        },
        provenance: provenance(vec![
            "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md",
            "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md",
            "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md",
        ]),
    })
}

fn subject(selection: &NaraSelection) -> PersonalSubject {
    PersonalSubject {
        episode_ref: selection.episode_ref.clone(),
        selection_ref: selection.selection_ref.clone(),
        episode_revision: selection.episode_revision,
        start_byte: selection.start_byte,
        end_byte: selection.end_byte,
        selected_text: selection.selected_text.clone(),
        day_id: selection.day_id.clone(),
        now_path: selection.now_path.clone(),
        ql_address: selection.ql_address.clone(),
        coordinate_ref: selection.coordinate_ref.clone(),
        profile_ref: selection.profile_ref.clone(),
        privacy_class: selection.privacy_class.clone(),
    }
}

fn agent(
    snapshot: &EpiPrimitiveSnapshot,
    position: u8,
    canonical_agent_ref: &str,
    epi_function: &str,
) -> Result<CanonicalEpiAgent, String> {
    let identity = snapshot
        .agents
        .iter()
        .find(|agent| agent.position == position)
        .ok_or_else(|| format!("primitive snapshot is missing canonical Epi Agent at position {position}"))?;
    Ok(CanonicalEpiAgent {
        canonical_agent_ref: canonical_agent_ref.into(),
        bimba_ref: identity.bimba_ref.clone(),
        name: identity.name.clone(),
        position,
        epi_function: epi_function.into(),
        materialisation_owner: "Actuation Agent/Agency + WorldBinding; AIKit Profile/SkillSet/Context/model/harness/SessionSpace; Workcell only when a material body is required".into(),
        bridge_runtime: "none — the Epi bridge emits Epi-specific semantic context and does not own an Agent runtime".into(),
    })
}

fn provenance(sources: Vec<&str>) -> PersonalProvenance {
    PersonalProvenance {
        epi_source_revision: EPI_SOURCE_REVISION.into(),
        ql_provider_revision: QL_PROVIDER_REVISION.into(),
        semantic_sources: sources.into_iter().map(str::to_owned).collect(),
        result_class: "generated-epi-semantic-orientation".into(),
        promotion: "none".into(),
    }
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
