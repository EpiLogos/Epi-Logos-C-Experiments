use epi_s3_gateway::protocol::{
    verify_phase_contract, VerifyPhaseEvidenceFrame, VerifyPhaseQuestionFrame, VerifyPhaseStatus,
    VERIFY_PHASE_MAX_CYCLES,
};

#[test]
fn verify_phase_contract_registers_adversarial_gate() {
    let contract = verify_phase_contract();
    assert_eq!(contract.phase, "Verify");
    assert_eq!(contract.gate, "adversarial");
    assert_eq!(contract.max_verify_cycles, 3);
    assert_eq!(contract.max_verify_cycles, VERIFY_PHASE_MAX_CYCLES);
    assert_eq!(contract.evidence_record, "GoalRun.verify_phase_evidence");
}

#[test]
fn verify_phase_evidence_carries_judge_vak_and_structured_questions() {
    let evidence = VerifyPhaseEvidenceFrame {
        judge_agent: "Eros".to_owned(),
        judge_vak_coordinate: "CPF=(4.0/1-4.4/5);CT=CT2;CF=(0/1/2);judge=Eros".to_owned(),
        status: VerifyPhaseStatus::Questions,
        cycle: 1,
        questions: vec![VerifyPhaseQuestionFrame {
            symbolic_coordinate: "CPF=(4.0/1-4.4/5);CT=CT2;CF=(0/1/2);judge=Eros".to_owned(),
            prompt: "What evidence demonstrates the actual goal condition?".to_owned(),
            evidence_ref: Some("cargo:test".to_owned()),
        }],
    };

    let encoded = serde_json::to_value(&evidence).expect("verify evidence should serialize");
    assert_eq!(encoded["judgeAgent"], "Eros");
    assert_eq!(encoded["judgeVakCoordinate"], evidence.judge_vak_coordinate);
    assert_eq!(encoded["status"], "questions");
    assert_eq!(
        encoded["questions"][0]["symbolicCoordinate"],
        evidence.judge_vak_coordinate
    );
    assert!(encoded.get("passed").is_none());
    assert!(encoded.get("failed").is_none());
}
