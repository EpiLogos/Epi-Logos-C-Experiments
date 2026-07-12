//! Live-graph contract for `s2.parashaktiCorrespondences` (uc-reorient-1 /
//! gate-adapter — Architect-ordered corrective work).
//!
//! REQUIRES a running local Neo4j (`Neo4jConfig::from_env` →
//! `EPILOGOS_NEO4J_URI/USER/PASSWORD`). This test FAILS LOUDLY — it never
//! silently skips — when the graph is down: the whole point of the re-sourcing
//! is that the asma sacred name, its mirror, the maqam, and the planetary
//! vedic-mantra come from the LIVE graph, so a green run must actually prove it.
//! The harness G-stage owns environment gating; here we assert the live seam.
//!
//! It is a real behavioural test: the adapter's asma name/arabic-text are
//! cross-checked against an INDEPENDENT read of the same DivineName node through
//! the same `Neo4jClient` seam — a fabricated or file-served value could not
//! match the graph, and the JSON seam has been deleted, so the only way the
//! adapter can produce "Al-Ali"/"العلي" is by querying the live graph.

use epi_logos::gate::graph::dispatch_graph_method;
use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use serde_json::{json, Value};

/// Independent single-scalar read through the live `Neo4jClient` seam (returns
/// the `v` column of the first row). `None` when Neo4j is unreachable.
async fn graph_scalar(cypher: &str) -> Option<String> {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).ok()?;
    let rows = client.run(cypher).await.ok()?;
    rows.first().and_then(|row| row.get::<String>("v").ok())
}

#[tokio::test]
async fn s2_parashakti_correspondences_asma_and_maqam_come_from_live_neo4j() {
    let address72 = 17u64;
    let artifact = dispatch_graph_method(
        "s2.parashaktiCorrespondences",
        &json!({ "address72": address72 }),
    )
    .await
    .expect("s2.parashaktiCorrespondences must dispatch");

    // Fail LOUDLY when Neo4j is down — do NOT pass on the offline kernel fields.
    assert_eq!(
        artifact["graphUnavailable"], false,
        "live Neo4j required: Neo4jConfig::from_env (EPILOGOS_NEO4J_URI/USER/PASSWORD) \
         must reach the running local parashakti-deep graph. graphUnavailable=true means \
         the graph is down — the G-stage owns environment gating."
    );
    assert_eq!(artifact["sacredSonic"]["provenance"], "live-graph");
    assert_eq!(artifact["planetaryChakral"]["provenance"], "live-graph");

    // ── asma sacred name: cross-check against an INDEPENDENT graph read ─────
    // address 17 → DivineName M2-4.0-(0/1)-0-17 (global name index 17).
    let expected_name = graph_scalar(
        "MATCH (n:DivineName {coordinate:'M2-4.0-(0/1)-0-17'}) RETURN n.c_1_name AS v",
    )
    .await
    .expect("independent DivineName name read must succeed against the live graph");
    let expected_arabic = graph_scalar(
        "MATCH (n:DivineName {coordinate:'M2-4.0-(0/1)-0-17'}) RETURN n.m_2_4_arabic_text AS v",
    )
    .await
    .expect("independent DivineName arabic-text read must succeed against the live graph");

    assert!(
        !expected_name.is_empty(),
        "the live graph must carry a non-empty asma name for address 17"
    );
    assert_eq!(
        artifact["sacredSonic"]["name"],
        Value::String(expected_name),
        "adapter asma name must equal the live graph DivineName value"
    );
    assert_eq!(
        artifact["sacredSonic"]["arabicText"],
        Value::String(expected_arabic),
        "adapter arabic text must equal the live graph value"
    );
    assert_eq!(artifact["sacredSonic"]["coordinate"], "M2-4.0-(0/1)-0-17");
    assert!(
        artifact["sacredSonic"]["englishTranslation"].is_string(),
        "english translation rides s_4_english_translation on the live node"
    );

    // ── maqam: graph-sourced name + spiritual function, present and non-empty ─
    let maqam_name = artifact["sacredSonic"]["maqam"]["name"]
        .as_str()
        .expect("maqam name must be a live-graph string, not null");
    assert!(!maqam_name.is_empty(), "maqam name must be non-empty");
    assert!(
        artifact["sacredSonic"]["maqam"]["spiritualFunction"].is_string(),
        "maqam spiritual function rides l_3_spiritual_function on the live Maqam node"
    );
    assert!(artifact["sacredSonic"]["maqam"]["coordinate"]
        .as_str()
        .expect("maqam coordinate string")
        .starts_with("M2-4.3-"));

    // ── planetary vedic mantra rides the live PlanetaryHarmonic node ────────
    assert!(
        artifact["planetaryChakral"]["vedicMantra"].is_string(),
        "planetary vedic mantra must come from the live graph PlanetaryHarmonic node"
    );

    // ── and NO dataset file path is ever served, even on the live path ──────
    assert!(!json_contains(&artifact, "nodes-full-detail.json"));
    assert!(!json_contains(&artifact, "Idea/Bimba/Map/datasets"));
}

fn json_contains(value: &Value, needle: &str) -> bool {
    match value {
        Value::String(text) => text.contains(needle),
        Value::Array(items) => items.iter().any(|item| json_contains(item, needle)),
        Value::Object(map) => map.values().any(|item| json_contains(item, needle)),
        _ => false,
    }
}
