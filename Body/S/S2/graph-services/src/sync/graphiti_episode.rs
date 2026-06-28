use epi_s3_gateway_contract::{
    GraphitiAdapterContract, GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY,
};
use serde::{Deserialize, Serialize};

use super::policy::{classify_promotion_path, PromotionClass};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct GraphitiEpisodePlan {
    pub class: PromotionClass,
    pub target_surface: String,
    pub runtime_authority: String,
    pub invocation_owner: String,
    pub gateway_method: String,
    pub adapter_required_capabilities: Vec<String>,
    pub source_path: String,
    pub source_coordinate: Option<String>,
    pub episode_kind: String,
    pub creates_neo4j_coordinate_node: bool,
    pub reason: String,
}

pub fn plan_graphiti_episode(
    source_path: &str,
    source_coordinate: Option<&str>,
) -> Result<GraphitiEpisodePlan, String> {
    let decision = classify_promotion_path(source_path);
    let episode_kind = match decision.class {
        PromotionClass::EpisodicTemporalTrace => "day_now_temporal_episode",
        PromotionClass::ThoughtEpisode => "thought_episode",
        _ => return Err(format!("{source_path} does not route to Graphiti")),
    };
    let adapter = GraphitiAdapterContract::native_library();

    Ok(GraphitiEpisodePlan {
        class: decision.class,
        target_surface: "graphiti_episode".to_owned(),
        runtime_authority: GRAPHITI_RUNTIME_AUTHORITY.to_owned(),
        invocation_owner: GRAPHITI_INVOCATION_OWNER.to_owned(),
        gateway_method: "s5.episodic.deposit".to_owned(),
        adapter_required_capabilities: adapter
            .required_capabilities
            .iter()
            .map(|capability| (*capability).to_owned())
            .collect(),
        source_path: source_path.to_owned(),
        source_coordinate: source_coordinate.map(str::to_owned),
        episode_kind: episode_kind.to_owned(),
        creates_neo4j_coordinate_node: false,
        reason: decision.reason,
    })
}
