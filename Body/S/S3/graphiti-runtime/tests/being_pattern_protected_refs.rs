use epi_s3_graphiti_runtime::being_pattern_provenance_refs_payload;

#[test]
fn being_pattern_provenance_refs_are_public_safe_only() {
    let payload = being_pattern_provenance_refs_payload(
        "entity:user",
        &[("ep-1", "graphiti:episode:ep-1", "public-safe summary")],
    )
    .unwrap();

    assert_eq!(payload["entityId"], "entity:user");
    assert_eq!(payload["episodeRefs"][0]["episodeId"], "ep-1");
    assert!(payload.get("body").is_none());
    assert!(payload.get("episodeBody").is_none());

    let err = being_pattern_provenance_refs_payload(
        "entity:user",
        &[(
            "ep-2",
            "graphiti:episode:ep-2",
            "contains protected_payload marker",
        )],
    )
    .unwrap_err();
    assert!(err.contains("protected_payload"));
}
