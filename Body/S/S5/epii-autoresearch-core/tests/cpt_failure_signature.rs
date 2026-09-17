use epi_s5_epii_autoresearch_core::{
    ActionabilityClass, FailureSignature, TerminalAgentMechanism,
};

#[test]
fn cpt_failure_signature_preserves_verifier_evidence_across_json_round_trip() {
    let signature = FailureSignature {
        cluster_size: 3,
        shared_trace_symptom: "register-drift on alpha-rasa passages".to_owned(),
        verifier_evidence: vec![
            "perplexity rose 12.4% against the held-out corpus".to_owned(),
            "epi:RegisterPreservationShape failed".to_owned(),
        ],
        terminal_agent_mechanism: TerminalAgentMechanism::EksftMaskOverfit,
        estimated_actionability: ActionabilityClass::MaskRetune,
    };

    let encoded = serde_json::to_string(&signature).expect("signature serializes");
    let decoded: FailureSignature =
        serde_json::from_str(&encoded).expect("signature deserializes");

    assert_eq!(decoded, signature);
    assert!(encoded.contains("eksft_mask_overfit"));
    assert!(encoded.contains("mask_retune"));
}
