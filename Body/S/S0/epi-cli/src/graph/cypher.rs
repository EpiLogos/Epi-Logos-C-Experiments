// S0 adapter: Cypher guard/run pipeline is graph-law owned by S2.
// Kept as a named compatibility re-export so existing CLI/test callers
// (e.g. `crate::graph::cypher::CypherMode`, `apply_params`, etc.) keep
// working unchanged. New call sites should `use epi_s2_graph_services::cypher::*`.
pub use epi_s2_graph_services::cypher::{
    apply_params, check_statement, run, CypherGuardOutcome, CypherMode, CypherResult,
    DEFAULT_ROW_LIMIT, MAX_ROW_LIMIT,
};
