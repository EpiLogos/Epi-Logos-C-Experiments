use serde::{Deserialize, Serialize};

use crate::{GraphitiRuntimeStatus, ProductionFallbackPolicy};

/// 03.T7: Track 03 release-gate criteria, machine-readable. The release
/// gate is *open* when every required field is true.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Track03ReleaseGateReport {
    pub multi_subscriber_clock_within_tolerance: bool,
    pub bind_kairos_p95_under_100ms: bool,
    pub reconnect_recovers_latest_state: bool,
    pub privacy_audit_no_forbidden_fields: bool,
    pub production_fallback_policy: ProductionFallbackPolicy,
    pub graphiti_runtime_status: GraphitiRuntimeStatus,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
    pub clock_protocol_version: String,
}

impl Track03ReleaseGateReport {
    pub fn is_open(&self) -> bool {
        self.multi_subscriber_clock_within_tolerance
            && self.bind_kairos_p95_under_100ms
            && self.reconnect_recovers_latest_state
            && self.privacy_audit_no_forbidden_fields
    }
}
