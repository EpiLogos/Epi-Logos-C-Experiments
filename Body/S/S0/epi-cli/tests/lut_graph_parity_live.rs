//! Standing LUT ↔ live-graph parity (uc-cli-5 / `lut-parity-standing` —
//! Architect-ordered corrective sweep).
//!
//! THE LIVE NEO4J BIMBA GRAPH IS THE AUTHORITY over the kernel LUTs. This file
//! pins, as a *standing* test, the parity the parashakti reorientation proved
//! ad hoc: the kernel decan / asma / planet-chakra LUTs must mirror the live
//! `Decan` / `DivineName` / `PlanetaryHarmonic` / `ChakralCenter` nodes.
//!
//! Every test REQUIRES a running local Neo4j (`Neo4jConfig::from_env` →
//! `EPILOGOS_NEO4J_URI/USER/PASSWORD`) and FAILS LOUDLY when the graph is
//! down — never a silent skip. A green run must actually prove the LUTs equal
//! the live nodes:
//!
//!   * The kernel LUTs are exercised through the real `dispatch_graph_method`
//!     seam — the same integrated surface the gold-standard
//!     `parashakti_correspondences_live_graph.rs` drives.
//!   * The graph side is an INDEPENDENT read through a *separate* `Neo4jClient`
//!     connection (distinct from the one the adapter opens internally), keyed
//!     on coordinates the KERNEL derives — a fabricated LUT value could not
//!     match, and a LUT/graph divergence surfaces as a missing node.
//!   * No dataset file is ever consulted: the deprecated
//!     `Idea/Bimba/Map/datasets/**` seed archive is never read (asserted
//!     per-artifact).

use std::collections::HashMap;

use epi_logos::gate::graph::dispatch_graph_method;
use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use serde_json::{json, Value};

/// Independent live client. Panics (fail-loud) when Neo4j is unreachable — this
/// is a live-graph parity suite, never a silent skip.
fn live_client() -> Neo4jClient {
    Neo4jClient::connect(&Neo4jConfig::from_env()).expect(
        "live Neo4j required (EPILOGOS_NEO4J_URI/USER/PASSWORD): the LUT↔graph parity \
         sweep must prove the kernel LUTs mirror the live nodes — a green run with the \
         graph down is the exact cheat this suite eliminates",
    )
}

/// Independent `{coordinate → c_1_name}` map for a label, read through the live
/// client. Panics if the query cannot run against the live graph.
async fn coord_name_map(client: &Neo4jClient, cypher: &str) -> HashMap<String, String> {
    let rows = client
        .run(cypher)
        .await
        .expect("independent map query must run against the live graph");
    let mut map = HashMap::new();
    for row in &rows {
        let coord = row.get::<String>("coord").expect("coordinate column");
        let name = row.get::<String>("name").expect("c_1_name column");
        map.insert(coord, name);
    }
    map
}

/// Independent single-name read at a fixed coordinate (the `v` column). `None`
/// when the node is absent or Neo4j is unreachable.
async fn graph_name(client: &Neo4jClient, coordinate: &str) -> Option<String> {
    let cypher =
        format!("MATCH (n {{coordinate:'{coordinate}'}}) RETURN n.c_1_name AS v");
    let rows = client.run(&cypher).await.ok()?;
    rows.first().and_then(|row| row.get::<String>("v").ok())
}

fn json_contains(value: &Value, needle: &str) -> bool {
    match value {
        Value::String(text) => text.contains(needle),
        Value::Array(items) => items.iter().any(|item| json_contains(item, needle)),
        Value::Object(map) => map.values().any(|item| json_contains(item, needle)),
        _ => false,
    }
}

/// No dataset file is ever served on any artifact — the deprecated
/// `Idea/Bimba/Map/datasets/**` archive is never read at runtime.
fn assert_no_dataset_leak(artifact: &Value) {
    assert!(
        !json_contains(artifact, "Idea/Bimba/Map/datasets"),
        "no deprecated dataset path may appear in a live artifact"
    );
    assert!(
        !json_contains(artifact, "nodes-full-detail.json"),
        "no dataset file may be served, even on the live path"
    );
}

/// (1a) DECAN chain: `ZODIAC_DECAN_TABLE` + `PIP_DECAN_MAP` (kernel LUTs) vs the
/// 36 live `Decan` nodes. The `decanFace` is pure kernel-LUT (provenance
/// `kernel-lut`, computed offline); it is cross-checked against an independent
/// read of the live nodes — a true kernel-value-vs-graph-value parity.
#[tokio::test]
async fn decan_luts_match_all_36_live_decan_nodes() {
    let client = live_client();

    // Independent authority: every live Decan node, keyed by coordinate.
    let rows = client
        .run(
            "MATCH (d:Decan) \
             RETURN d.coordinate AS coord, d.c_1_name AS name, d.m_2_3_tarot_card AS tarot",
        )
        .await
        .expect("independent Decan read must run against the live graph");
    let mut live: HashMap<String, (String, String)> = HashMap::new();
    for row in &rows {
        let coord = row.get::<String>("coord").expect("decan coordinate");
        let name = row.get::<String>("name").expect("decan c_1_name");
        let tarot = row.get::<String>("tarot").expect("decan m_2_3_tarot_card");
        live.insert(coord, (name, tarot));
    }
    assert_eq!(
        live.len(),
        36,
        "the live graph must carry exactly 36 Decan nodes — the map is the authority"
    );

    // Drive the kernel LUT through the real dispatch surface for every decan
    // (72 addresses fold two-to-one onto 36 decans: decan_index = address72/2).
    let mut matched = 0usize;
    for decan_index in 0u64..36 {
        let address72 = decan_index * 2;
        let artifact = dispatch_graph_method(
            "s2.parashaktiCorrespondences",
            &json!({ "address72": address72 }),
        )
        .await
        .expect("s2.parashaktiCorrespondences must dispatch");
        assert_no_dataset_leak(&artifact);

        let decan = &artifact["decanFace"];
        assert_eq!(
            decan["provenance"], "kernel-lut",
            "the decan chain is kernel-LUT sourced"
        );
        let coord = decan["coordinate"]
            .as_str()
            .expect("decan coordinate string");
        let (live_name, live_tarot) = live.get(coord).unwrap_or_else(|| {
            panic!(
                "kernel decan coordinate {coord} (ZODIAC_DECAN_TABLE) has no live Decan node \
                 — LUT/graph divergence"
            )
        });

        // sign / decan-index parity: the coordinate encodes (element-family,
        // sign-in-family, decan-in-sign); the name carries sign + decan index.
        assert_eq!(
            decan["name"].as_str().unwrap(),
            live_name,
            "kernel decan name must equal the live Decan c_1_name at {coord}"
        );
        let sign = decan["zodiacSign"].as_str().expect("zodiac sign string");
        assert!(
            live_name.starts_with(sign),
            "zodiac sign {sign} must prefix the live decan name {live_name}"
        );
        // tarot parity: kernel PIP_DECAN_MAP pip vs live m_2_3_tarot_card.
        assert_eq!(
            decan["tarotCard"].as_str().unwrap(),
            live_tarot,
            "kernel PIP_DECAN_MAP tarot must equal the live Decan m_2_3_tarot_card at {coord}"
        );
        matched += 1;
    }
    assert_eq!(
        matched, 36,
        "all 36 kernel decans must resolve to a live Decan node (bijection)"
    );
}

/// (1b) ASMA corpus vs the live `DivineName` nodes. The 72-fold parashakti face
/// keys `address72` (0..71) into the 99 Asma-ul-Husna leaf names; the 72 Shem
/// HaMephorash names live as a separate `DivineName` corpus. Both counts are
/// asserted (independent inventory), and a keyed name match cross-checks the
/// adapter's live asma name against an independent read at the KERNEL-derived
/// coordinate for a few fixed indices.
#[tokio::test]
async fn asma_corpus_matches_live_divinename_nodes() {
    let client = live_client();

    // Inventory the corpora — the live graph is the authority.
    // 99 Asma-ul-Husna leaf names at M2-4.0-(0/1)-{group}-{index}.
    let asma_leaf = client
        .run(
            "MATCH (n:DivineName) \
             WHERE n.coordinate =~ 'M2-4\\.0-\\(0/1\\)-[0-9]+-[0-9]+' \
             RETURN n.coordinate AS coord",
        )
        .await
        .expect("independent asma-leaf read must run against the live graph")
        .len();
    assert_eq!(
        asma_leaf, 99,
        "the live graph must carry 99 Asma-ul-Husna leaf DivineName nodes"
    );
    // 72 Shem HaMephorash DivineName nodes at M2-4.5-*.
    let shem = client
        .run(
            "MATCH (n:DivineName) WHERE n.coordinate STARTS WITH 'M2-4.5' \
             RETURN n.coordinate AS coord",
        )
        .await
        .expect("independent Shem read must run against the live graph")
        .len();
    assert_eq!(
        shem, 72,
        "the live graph must carry 72 Shem HaMephorash DivineName nodes"
    );

    // Keyed name match: the adapter's live asma name equals an INDEPENDENT read
    // at the kernel-derived coordinate for fixed 72-fold indices.
    for address72 in [0u64, 17, 35, 71] {
        let artifact = dispatch_graph_method(
            "s2.parashaktiCorrespondences",
            &json!({ "address72": address72 }),
        )
        .await
        .expect("s2.parashaktiCorrespondences must dispatch");
        assert_eq!(
            artifact["graphUnavailable"], false,
            "live Neo4j required for the asma keyed match at address {address72}"
        );
        assert_no_dataset_leak(&artifact);

        let sonic = &artifact["sacredSonic"];
        // Kernel routing: 99 names split three-by-three into groups of 33.
        let expected_coord =
            format!("M2-4.0-(0/1)-{}-{}", address72 / 33, address72 % 33);
        assert_eq!(
            sonic["coordinate"].as_str().unwrap(),
            expected_coord,
            "kernel asma routing must key address {address72} to {expected_coord}"
        );
        assert_eq!(sonic["provenance"], "live-graph");

        let independent = graph_name(&client, &expected_coord)
            .await
            .unwrap_or_else(|| panic!("independent DivineName read at {expected_coord} must succeed"));
        assert!(
            !independent.is_empty(),
            "the live graph must carry a non-empty asma name at {expected_coord}"
        );
        assert_eq!(
            sonic["name"].as_str().unwrap(),
            independent,
            "adapter asma name must equal the live DivineName c_1_name at {expected_coord}"
        );
    }
}

/// (1c) PLANET_CHAKRA + planet-name kernel LUTs vs the live `PlanetaryHarmonic`
/// / `ChakralCenter` nodes. Every Chaldean decan ruler routes through the
/// kernel LUTs to a live node whose name is cross-checked; the thin outer-planet
/// stubs (Neptune / Pluto) are asserted for EXISTENCE ONLY.
#[tokio::test]
async fn planet_and_chakra_luts_match_live_harmonic_and_chakral_nodes() {
    let client = live_client();

    // Independent inventory + name maps.
    let planets = coord_name_map(
        &client,
        "MATCH (p:PlanetaryHarmonic) RETURN p.coordinate AS coord, p.c_1_name AS name",
    )
    .await;
    let chakras = coord_name_map(
        &client,
        "MATCH (c:ChakralCenter) RETURN c.coordinate AS coord, c.c_1_name AS name",
    )
    .await;
    assert_eq!(
        planets.len(),
        10,
        "the live graph must carry 10 PlanetaryHarmonic nodes"
    );
    assert_eq!(
        chakras.len(),
        7,
        "the live graph must carry 7 ChakralCenter nodes"
    );

    // Drive the kernel planet + PLANET_CHAKRA LUTs through the real surface over
    // every decan; the Chaldean rulers cover the 7 classical planets / 7 chakras.
    let mut planet_coords_hit: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut chakra_coords_hit: std::collections::HashSet<String> = std::collections::HashSet::new();
    for decan_index in 0u64..36 {
        let address72 = decan_index * 2;
        let artifact = dispatch_graph_method(
            "s2.parashaktiCorrespondences",
            &json!({ "address72": address72 }),
        )
        .await
        .expect("s2.parashaktiCorrespondences must dispatch");
        assert_eq!(
            artifact["graphUnavailable"], false,
            "live Neo4j required for the planet/chakra keyed match at address {address72}"
        );
        assert_no_dataset_leak(&artifact);

        let pc = &artifact["planetaryChakral"];
        let planet_coord = pc["planetCoordinate"]
            .as_str()
            .expect("planet coordinate string");
        let planet_ruler = pc["planetaryRuler"]
            .as_str()
            .expect("planetary ruler string");
        // kernel planet_name / planet_graph_coordinate vs live PlanetaryHarmonic.
        let live_planet = planets.get(planet_coord).unwrap_or_else(|| {
            panic!(
                "kernel planet coordinate {planet_coord} has no live PlanetaryHarmonic node \
                 — LUT/graph divergence"
            )
        });
        assert_eq!(
            live_planet, planet_ruler,
            "kernel planet name must equal the live PlanetaryHarmonic c_1_name at {planet_coord}"
        );
        planet_coords_hit.insert(planet_coord.to_owned());

        // kernel PLANET_CHAKRA / chakra_graph_coordinate vs live ChakralCenter.
        if let Some(chakra_coord) = pc["chakraCoordinate"].as_str() {
            let live_chakra = chakras.get(chakra_coord).unwrap_or_else(|| {
                panic!(
                    "kernel PLANET_CHAKRA coordinate {chakra_coord} has no live ChakralCenter \
                     node — LUT/graph divergence"
                )
            });
            assert_eq!(
                pc["chakraName"].as_str().unwrap(),
                live_chakra,
                "kernel chakra routing must resolve to the live ChakralCenter c_1_name at \
                 {chakra_coord}"
            );
            chakra_coords_hit.insert(chakra_coord.to_owned());
        }
    }
    // The Chaldean decan rulers cover the 7 classical planets and 7 chakras.
    assert_eq!(
        planet_coords_hit.len(),
        7,
        "the 36 decans must route through all 7 Chaldean PlanetaryHarmonic nodes"
    );
    assert_eq!(
        chakra_coords_hit.len(),
        7,
        "the 36 decans must route through all 7 ChakralCenter nodes"
    );

    // Thin outer-planet stubs: existence only — never assert their content.
    assert!(
        planets.contains_key("M2-5-8"),
        "outer-planet stub Neptune (M2-5-8) must exist"
    );
    assert!(
        planets.contains_key("M2-5-9"),
        "outer-planet stub Pluto (M2-5-9) must exist"
    );
}
