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

/// Result of probing a single scalar property of a `PlanetaryHarmonic` node
/// through the live seam — distinguishes a present value, a genuine NULL
/// property on a reachable node, and an unreachable graph / missing node.
#[derive(Debug)]
enum ScalarRead {
    Present(String),
    Null,
    Absent,
}

/// Read one property of a `PlanetaryHarmonic` node by coordinate through the
/// live `Neo4jClient` seam. `coordinate`/`property` are test-owned literals.
async fn planetary_scalar(coordinate: &str, property: &str) -> ScalarRead {
    let Ok(client) = Neo4jClient::connect(&Neo4jConfig::from_env()) else {
        return ScalarRead::Absent;
    };
    let cypher = format!(
        "MATCH (p:PlanetaryHarmonic {{coordinate:'{coordinate}'}}) RETURN p.{property} AS v"
    );
    let Ok(rows) = client.run(&cypher).await else {
        return ScalarRead::Absent;
    };
    match rows.first() {
        None => ScalarRead::Absent,
        Some(row) => match row.get::<Option<String>>("v") {
            Ok(Some(value)) => ScalarRead::Present(value),
            _ => ScalarRead::Null,
        },
    }
}

/// `planetaryChakral.planetaryMode` is re-sourced from the LIVE
/// `PlanetaryHarmonic.c_0_modal_signature` (the octaval/musical mode the Bimba
/// map actually carries) — NOT the retired JSON diurnal/nocturnal field, which
/// existed nowhere in the ontology. For a classical decan ruler the adapter
/// value equals an INDEPENDENT read of `c_0_modal_signature`; for a thin
/// outer-planet seed stub (no modal signature) the value is honest-null.
#[tokio::test]
async fn s2_parashakti_planetary_mode_is_live_modal_signature() {
    // address 17 → Gemini Decan 3 → Sun ruler (kernel LAW(24)); the Sun rides
    // PlanetaryHarmonic M2-5-(0/1), which carries a modal signature.
    let artifact = dispatch_graph_method(
        "s2.parashaktiCorrespondences",
        &json!({ "address72": 17u64 }),
    )
    .await
    .expect("s2.parashaktiCorrespondences must dispatch");

    // Fail LOUDLY when Neo4j is down — the whole point is a live-sourced mode.
    assert_eq!(
        artifact["graphUnavailable"], false,
        "live Neo4j required: planetaryMode is re-sourced from the live PlanetaryHarmonic \
         node — graphUnavailable=true means the graph is down."
    );
    assert_eq!(artifact["planetaryChakral"]["provenance"], "live-graph");
    assert_eq!(artifact["planetaryChakral"]["planetaryRuler"], "Sun");
    assert_eq!(
        artifact["planetaryChakral"]["planetCoordinate"],
        "M2-5-(0/1)"
    );

    // ── classical planet: adapter planetaryMode == INDEPENDENT modal-sig read ─
    let expected_mode = match planetary_scalar("M2-5-(0/1)", "c_0_modal_signature").await {
        ScalarRead::Present(value) => value,
        other => panic!(
            "independent c_0_modal_signature read for the Sun node must succeed against the \
             live graph, got {other:?}"
        ),
    };
    assert!(
        !expected_mode.is_empty(),
        "the live Sun PlanetaryHarmonic node must carry a non-empty modal signature"
    );
    assert_eq!(
        artifact["planetaryChakral"]["planetaryMode"],
        Value::String(expected_mode),
        "adapter planetaryMode must equal the live c_0_modal_signature (octaval mode)"
    );

    // ── the retired JSON diurnal/nocturnal mode must appear NOWHERE ─────────
    assert!(
        !json_contains(&artifact, "diurnal") && !json_contains(&artifact, "nocturnal"),
        "the retired diurnal/nocturnal planetary mode must never resurface"
    );
    // ── and no dataset file path is ever served on the live path ────────────
    assert!(!json_contains(&artifact, "nodes-full-detail.json"));
    assert!(!json_contains(&artifact, "Idea/Bimba/Map/datasets"));

    // ── thin outer-planet seed stubs (Neptune M2-5-8 / Pluto M2-5-9) exist as
    //    reachable, named nodes but carry NULL c_0_modal_signature — proving the
    //    per-planet honest-null is grounded in real graph absence, not invented.
    for stub in ["M2-5-8", "M2-5-9"] {
        assert!(
            matches!(
                planetary_scalar(stub, "c_1_name").await,
                ScalarRead::Present(_)
            ),
            "outer-planet stub {stub} must exist and be reachable on the live graph"
        );
        let modal = planetary_scalar(stub, "c_0_modal_signature").await;
        assert!(
            matches!(modal, ScalarRead::Null),
            "outer-planet stub {stub} must carry a NULL modal signature (honest-null), got {modal:?}"
        );
    }
}
