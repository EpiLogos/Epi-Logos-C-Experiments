// S0 adapter: constraint registry + Cypher-evaluation pipeline is
// graph-law owned by S2. Kept as a named compatibility re-export so
// CLI dispatch in `super::dispatch_with_format` can call
// `constraint::run_all`, `constraint::register`, etc. unchanged.
pub use epi_s2_graph_services::constraint::{
    constraint_home, register, run_all, run_constraint, Registry, ENV_CONSTRAINT_HOME,
};
