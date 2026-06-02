// S0 adapter: deterministic 72-vector resonance analyser is graph-law
// owned by S2. Kept as a named compatibility re-export so the CLI
// dispatch arm `GraphCmd::AnalyseResonance` keeps using
// `analyse::DeterministicAnalyser` / `analyse::ResonanceAnalyser`.
pub use epi_s2_graph_services::analyse::{DeterministicAnalyser, ResonanceAnalyser};
