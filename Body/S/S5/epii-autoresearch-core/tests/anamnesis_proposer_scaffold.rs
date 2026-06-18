use epi_s5_epii_autoresearch_core as epii_autoresearch_core;
use epii_autoresearch_core::anamnesis_proposer::{
    AnamnesisProposer, EvidenceWindow, TuningProposal,
};

#[test]
fn proposer_constructs_with_empty_evidence() {
    let proposer = AnamnesisProposer::new();
    let window = EvidenceWindow::empty();
    let proposals: Vec<TuningProposal> = proposer.propose_from_evidence(&window);
    assert!(proposals.is_empty());
}
