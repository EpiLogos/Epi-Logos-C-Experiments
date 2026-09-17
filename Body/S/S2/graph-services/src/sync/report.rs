use serde::{Deserialize, Serialize};

use super::plan::PromotionPlan;

pub struct SyncResult {
    pub coordinate: String,
    pub vault_path: String,
    pub relationships_created: usize,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct GraphPromotionSyncReport {
    pub source_path: String,
    pub coordinate: String,
    pub node_action: String,
    pub relation_actions: Vec<String>,
    pub compatibility_migrations: Vec<String>,
    pub validation_errors: Vec<String>,
    pub sync_version: String,
}

impl GraphPromotionSyncReport {
    pub fn planned(plan: &PromotionPlan) -> Self {
        Self {
            source_path: plan.source_path.clone(),
            coordinate: plan.coordinate.clone(),
            node_action: "planned_upsert".to_owned(),
            relation_actions: plan
                .relationships
                .iter()
                .map(|relationship| relationship.rel_type.clone())
                .collect(),
            compatibility_migrations: plan.compatibility_migrations.clone(),
            validation_errors: Vec::new(),
            sync_version: plan.sync_version.clone(),
        }
    }
}
