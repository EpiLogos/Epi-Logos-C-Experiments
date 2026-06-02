// S0 adapter: Anuttara symbolic parser + reflection-prompt shaping is
// graph-law owned by S2. Kept as a named compatibility re-export so the
// CLI dispatch arm `GraphCmd::AskAnuttara` keeps calling
// `anuttara::parse_strict` and `anuttara::build_reflection_prompt`.
pub use epi_s2_graph_services::anuttara::{
    build_reflection_prompt, parse_strict, AnuttaraReflectionRequest,
};
