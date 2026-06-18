use portal_core::tunable::audit::{Actor, AuditEntry, AuditWriter};
use portal_core::tunable::metadata::TunableValue;

#[test]
fn audit_writer_appends_jsonl_entry() {
    let tmp = tempfile::tempdir().unwrap();
    let writer = AuditWriter::new(tmp.path().to_path_buf());
    let entry = AuditEntry {
        timestamp: "2026-06-13T14:23:11Z".to_string(),
        knob_key: "test.foo".to_string(),
        from_value: TunableValue::U32(5),
        to_value: TunableValue::U32(11),
        actor: Actor::User,
        tier: 1,
        risk_class: "A".to_string(),
        proposing_evidence: vec![],
        triplet_verdict: None,
        user_disposition: Some("approved".to_string()),
        user_disposition_evidence_handle: None,
        rollback_handle: "rollback-abc".to_string(),
        kairos_snapshot: None,
    };
    writer.append(&entry).unwrap();
    let read = writer.read("test.foo").unwrap();
    assert_eq!(read.len(), 1);
    assert_eq!(read[0].from_value, TunableValue::U32(5));
    assert_eq!(read[0].to_value, TunableValue::U32(11));
}

#[test]
fn audit_writer_two_appends_two_lines() {
    let tmp = tempfile::tempdir().unwrap();
    let writer = AuditWriter::new(tmp.path().to_path_buf());
    for i in 0..2 {
        let entry = AuditEntry {
            timestamp: format!("2026-06-13T14:{i:02}:00Z"),
            knob_key: "test.bar".to_string(),
            from_value: TunableValue::U32(i),
            to_value: TunableValue::U32(i + 1),
            actor: Actor::User,
            tier: 1,
            risk_class: "B".to_string(),
            proposing_evidence: vec![],
            triplet_verdict: None,
            user_disposition: None,
            user_disposition_evidence_handle: None,
            rollback_handle: format!("rb-{i}"),
            kairos_snapshot: None,
        };
        writer.append(&entry).unwrap();
    }
    let read = writer.read("test.bar").unwrap();
    assert_eq!(read.len(), 2);
}
