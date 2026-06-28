use epi_s3_graphiti_runtime::{
    ExtractedEntity, ExtractedRelationship, GraphitiClient, InMemoryGraphitiStore,
    NativeLibraryClient, SophiaExtraction,
};
use serde_json::json;

#[test]
fn native_client_ingests_claude_jsonl_and_recalls_entities() {
    let transcript = [
        json!({
            "message": {
                "role": "user",
                "timestamp": "2026-06-19T12:00:00Z",
                "content": [
                    {
                        "type": "text",
                        "text": "Please wire Sophia extraction to Graphiti memory."
                    }
                ]
            }
        }),
        json!({
            "message": {
                "role": "assistant",
                "timestamp": "2026-06-19T12:01:00Z",
                "content": "Aletheia will entify Sophia output into Graphiti."
            }
        }),
    ]
    .into_iter()
    .map(|value| value.to_string())
    .collect::<Vec<_>>()
    .join("\n");

    let mut client = NativeLibraryClient::default();
    let receipt = client
        .ingest_transcript(
            &transcript,
            Some("claude-session-42"),
            Some("claude-code"),
            Some("transcript://claude/claude-session-42.jsonl"),
        )
        .expect("native transcript ingest should succeed");
    let results = client.query_graphiti("Graphiti", 10);

    assert_eq!(receipt.session_id, "claude-session-42");
    assert!(receipt.entities_extracted >= 3);
    assert!(receipt.episodic_edges_created >= 1);
    assert!(client
        .store()
        .episodes
        .contains_key(&receipt.graphiti_episode_uuid));
    assert!(results
        .entities
        .iter()
        .any(|entity| entity.name == "Graphiti"));
    let episode = &client.store().episodes[&receipt.graphiti_episode_uuid];
    assert_eq!(
        episode.transcript_ref,
        "transcript://claude/claude-session-42.jsonl"
    );
    assert_eq!(
        episode.provenance_handles,
        vec!["transcript://claude/claude-session-42.jsonl".to_owned()]
    );
}

#[test]
fn native_store_deduplicates_case_variants_and_preserves_provenance() {
    let mut store = InMemoryGraphitiStore::default();
    let extraction = SophiaExtraction {
        entities: vec![
            ExtractedEntity {
                name: "Graphiti".to_owned(),
                entity_type: "System".to_owned(),
                description: "Episodic graph".to_owned(),
                aliases: Vec::new(),
                provenance_handles: vec!["transcript://claude/session-1#L1".to_owned()],
            },
            ExtractedEntity {
                name: "graphiti".to_owned(),
                entity_type: "System".to_owned(),
                description: "Duplicate casing".to_owned(),
                aliases: vec!["Graphiti".to_owned()],
                provenance_handles: vec!["transcript://claude/session-1#L2".to_owned()],
            },
            ExtractedEntity {
                name: "Aletheia".to_owned(),
                entity_type: "Agent".to_owned(),
                description: "Entification service".to_owned(),
                aliases: Vec::new(),
                provenance_handles: vec!["transcript://claude/session-1#L3".to_owned()],
            },
        ],
        relationships: vec![ExtractedRelationship {
            source: "Aletheia".to_owned(),
            target: "Graphiti".to_owned(),
            predicate: "COMMITS_TO".to_owned(),
            description: "Aletheia commits deduplicated entities to Graphiti.".to_owned(),
        }],
        event_anchors: Vec::new(),
        summary: "Aletheia deduplicates Graphiti before commit.".to_owned(),
    };
    let episode = store.prepare_episode(
        "session-1",
        "claude",
        "transcript://claude/session-1",
        &extraction.summary,
    );

    let receipt = store.commit_episode(extraction, episode);

    let graphiti_nodes = store
        .entities
        .values()
        .filter(|node| node.name.eq_ignore_ascii_case("graphiti"))
        .collect::<Vec<_>>();
    assert_eq!(graphiti_nodes.len(), 1);
    assert_eq!(
        graphiti_nodes[0].provenance_handles,
        vec![
            "transcript://claude/session-1#L1".to_owned(),
            "transcript://claude/session-1#L2".to_owned()
        ]
    );
    assert_eq!(receipt.entities_extracted, 2);
    assert_eq!(receipt.episodic_edges_created, 1);
}
