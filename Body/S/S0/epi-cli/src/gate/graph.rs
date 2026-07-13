use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::graph::client::{Neo4jClient, Neo4jConfig};
use crate::graph::{
    kernel_coordinate_anchor_from_parts, GraphMethodParams, GraphMethodService, GraphNodeRequest,
    GraphQueryRequest, GraphTraverseDirection, GraphTraverseRequest,
    HarmonicRelationMaterializationRequest, HybridFusionConfig, KernelResonanceObservationRequest,
    PointerWebRefreshRequest, RetrievalResult,
};

const ASMA_MIRROR_ABSENT: u8 = 0xFF;
const RELATION_FAMILY_VALUES: &[&str] = &[
    "structural",
    "correspondential",
    "kernel_core",
    "inferred",
    "sync",
    "compatibility",
];

#[repr(C)]
#[derive(Clone, Copy)]
struct KernelAsmaNameDesc {
    name_idx: u8,
    group: u8,
    index_in_group: u8,
    element_id: u8,
    digital_root: u8,
    mirror_idx: u8,
    abjad_value: u16,
    meaning_id: u16,
    _pad: [u8; 2],
}

#[repr(C)]
#[derive(Clone, Copy)]
struct RoutingMask128 {
    low_64: u64,
    high_64: u64,
}

extern "C" {
    static M2_ASMA_LUT: [KernelAsmaNameDesc; 100];
    static ASMA_36_INTERNAL_MASK: RoutingMask128;
    static ASMA_64_PROJECTIVE_MASK: RoutingMask128;
}

pub async fn dispatch_graph_method(method: &str, params: &Value) -> Result<Value, String> {
    if method == "s2'.coordinate.resolve" {
        let coordinate = required_string(params, "coordinate")?;
        let resolution = GraphMethodService::resolve_coordinate_string(&coordinate)?;
        return serde_json::to_value(resolution).map_err(|err| err.to_string());
    }
    if method == "s2.graph.pointer_web.compute" {
        let coordinate = required_string(params, "coordinate")?;
        let resolution = GraphMethodService::resolve_coordinate_string(&coordinate)?;
        let coordinate_anchor = kernel_coordinate_anchor_from_parts(
            &resolution.canonical,
            &resolution.input,
            resolution.compatibility_property.clone(),
        )?;
        let coordinate_reference_projection =
            coordinate_anchor.coordinate_reference_projection.clone();
        return Ok(json!({
            "resolution": resolution,
            "coordinate_anchor": coordinate_anchor,
            "coordinateReferenceProjection": coordinate_reference_projection,
            "deprecatedPointerWeb": {
                "status": "deprecated_compatibility_only",
                "replacement": "s2.graph.harmonic_relations.materialize + s2.graph.traverse"
            },
        }));
    }
    if method == "s2.parashaktiCorrespondences" {
        return parashakti_correspondences(params).await;
    }

    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).map_err(|err| format!("connect failed: {err}"))?;
    let service = GraphMethodService::new(&client);

    match method {
        "s2.graph.query" => {
            let cypher = required_string(params, "cypher")?;
            let query_params = params.get("params").cloned().unwrap_or_else(|| json!({}));
            service
                .query(GraphQueryRequest {
                    cypher,
                    params: GraphMethodParams::from_json(query_params)?,
                })
                .await
        }
        "s2.graph.node" => {
            let coordinate = required_string(params, "coordinate")?;
            service.node(GraphNodeRequest { coordinate }).await
        }
        "s2.graph.traverse" => {
            let from = required_string(params, "from")?;
            let edge_types = params
                .get("edgeTypes")
                .and_then(|value| value.as_array())
                .map(|items| {
                    items
                        .iter()
                        .filter_map(|item| item.as_str().map(str::to_owned))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let direction = match params
                .get("direction")
                .and_then(|value| value.as_str())
                .unwrap_or("both")
            {
                "outbound" => GraphTraverseDirection::Outbound,
                "inbound" => GraphTraverseDirection::Inbound,
                _ => GraphTraverseDirection::Both,
            };
            let depth = params
                .get("depth")
                .and_then(|value| value.as_u64())
                .unwrap_or(1) as u32;
            service
                .traverse(GraphTraverseRequest {
                    from,
                    edge_types,
                    direction,
                    depth,
                })
                .await
        }
        "s2.graph.kernel_resonance.record" => {
            service
                .record_kernel_resonance(KernelResonanceObservationRequest {
                    source_coordinate: required_string(params, "sourceCoordinate")?,
                    session_key: required_string(params, "sessionKey")?,
                    timestamp_ms: required_u64(params, "timestampMs")?,
                    lens: required_u8(params, "lens", 5)?,
                    ascent_helix: params
                        .get("ascentHelix")
                        .and_then(|value| value.as_bool())
                        .unwrap_or(false),
                    position: required_u8(params, "position", 5)?,
                    score: required_f64(params, "score")?,
                    kernel_tick: required_u8(params, "kernelTick", 11)?,
                    graphiti_arc_id: params
                        .get("graphitiArcId")
                        .and_then(|value| value.as_str())
                        .map(str::to_owned),
                })
                .await
        }
        "s2.graph.gds.tangent_overlay" => {
            let coordinate = required_string(params, "coordinate")?;
            let top_k = params
                .get("topK")
                .or_else(|| params.get("top_k"))
                .and_then(|value| value.as_u64())
                .unwrap_or(8) as usize;
            service
                .gds_tangent_overlay(epi_s2_graph_services::GdsOverlayRequest { coordinate, top_k })
                .await
        }
        "s2.graph.ontology.reload" => {
            crate::graph::import_epi_ontology_with_n10s(&client).await?;
            let plan = epi_s2_graph_services::ontology_import_plan();
            Ok(json!({
                "method": "s2.graph.ontology.reload",
                "ontologyUri": plan.ontology_uri,
                "versionIri": plan.version_iri,
                "sourceFormat": plan.source_format,
                "turtleSha256": plan.turtle_sha256,
                "status": "reloaded"
            }))
        }
        "s2.graph.seed.snapshot" => {
            let queries = crate::graph::seed_baseline_snapshot_queries();
            let coordinates = crate::graph::seed_baseline_coordinates();
            let relationship_types = crate::graph::seed_relationship_types();
            Ok(json!({
                "method": "s2.graph.seed.snapshot",
                "coordinateCount": coordinates.len(),
                "coordinates": coordinates,
                "relationshipTypes": relationship_types,
                "queries": queries.iter().map(|query| json!({
                    "name": query.name,
                    "cypher": query.cypher
                })).collect::<Vec<_>>()
            }))
        }
        "s2.graph.core65.audit" => service.core_65_audit().await,
        "s2.graph.promotion.dry_run" => {
            let intent = promotion_intent_from_params(params)?;
            let plan = epi_s2_graph_services::SyncCoordinator::validate_promotion_intent(&intent)?;
            let report = epi_s2_graph_services::GraphPromotionSyncReport::planned(&plan);
            Ok(json!({
                "method": "s2.graph.promotion.dry_run",
                "report": report,
                "plan": {
                    "coordinate": plan.coordinate,
                    "identityProperty": plan.identity_property,
                    "labels": plan.labels,
                    "properties": plan.properties,
                    "sourcePath": plan.source_path,
                    "relationCount": plan.relationships.len(),
                    "compatibilityMigrations": plan.compatibility_migrations,
                    "syncVersion": plan.sync_version,
                    "promotionSource": plan.promotion_source
                },
                "canonicalWritePerformed": false
            }))
        }
        "s2.graph.promotion.commit" => {
            let intent = promotion_intent_from_params(params)?;
            let report = epi_s2_graph_services::SyncCoordinator::new(&client)
                .promote_intent(&intent)
                .await?;
            Ok(json!({
                "method": "s2.graph.promotion.commit",
                "report": report,
                "canonicalWritePerformed": true
            }))
        }
        "s2.graph.relation_family.list" => Ok(json!({
            "method": "s2.graph.relation_family.list",
            "property": "c_1_relation_family",
            "values": RELATION_FAMILY_VALUES,
            "source": "DR-IG-1 / S2 graph-services relation-family discriminator"
        })),
        "s2.graph.harmonic_relations.materialize" => {
            let timestamp_ms = params
                .get("timestampMs")
                .and_then(|value| value.as_u64())
                .unwrap_or_else(current_epoch_millis);
            service
                .materialize_harmonic_relations(HarmonicRelationMaterializationRequest {
                    timestamp_ms,
                })
                .await
        }
        "s2.graph.pointer_web.refresh" => {
            let coordinate = required_string(params, "coordinate")?;
            let timestamp_ms = params
                .get("timestampMs")
                .and_then(|value| value.as_u64())
                .unwrap_or_else(current_epoch_millis);
            service
                .refresh_pointer_web(PointerWebRefreshRequest {
                    coordinate,
                    timestamp_ms,
                })
                .await
        }
        "s2'.retrieve" => {
            let query = required_string(params, "query")?;
            let depth = params
                .get("depth")
                .and_then(|value| value.as_u64())
                .map(|value| value as u32);
            crate::graph::retrieval::graphrag::GraphRAGRetriever::new(&client)
                .retrieve(&query, depth, Some(10))
                .await
        }
        "s2'.rerank" => {
            let vector_results = parse_results(params, "vectorResults")?;
            let graph_results = parse_results(params, "graphResults")?;
            let results = crate::graph::fusion_rrf_results(
                &vector_results,
                &graph_results,
                HybridFusionConfig::default(),
            );
            Ok(json!({ "results": results }))
        }
        "s2'.enrich" => {
            let coordinates = params
                .get("coordinates")
                .and_then(|value| value.as_array())
                .ok_or_else(|| "coordinates must be an array".to_string())?
                .iter()
                .map(|value| {
                    value
                        .as_str()
                        .map(str::to_owned)
                        .ok_or_else(|| "coordinates must contain strings".to_string())
                })
                .collect::<Result<Vec<_>, _>>()?;
            let level = params
                .get("level")
                .and_then(|value| value.as_str())
                .and_then(|value| match value {
                    "uuid" => Some(crate::graph::retrieval::graphrag::DisclosureLevel::UuidOnly),
                    "identity" => {
                        Some(crate::graph::retrieval::graphrag::DisclosureLevel::Identity)
                    }
                    "summary" => Some(crate::graph::retrieval::graphrag::DisclosureLevel::Summary),
                    "content" => Some(crate::graph::retrieval::graphrag::DisclosureLevel::Content),
                    "connected" => {
                        Some(crate::graph::retrieval::graphrag::DisclosureLevel::Connected)
                    }
                    "complete" => {
                        Some(crate::graph::retrieval::graphrag::DisclosureLevel::Complete)
                    }
                    _ => None,
                })
                .unwrap_or(crate::graph::retrieval::graphrag::DisclosureLevel::Summary);
            let refs = coordinates.iter().map(String::as_str).collect::<Vec<_>>();
            let results = crate::graph::retrieval::graphrag::GraphRAGRetriever::new(&client)
                .progressive_disclosure_batch(&refs, level)
                .await?;
            Ok(json!({ "results": results }))
        }
        _ => Err(format!("unsupported graph method: {method}")),
    }
}

fn promotion_intent_from_params(
    params: &Value,
) -> Result<epi_s2_graph_services::S2GraphPromotionIntent, String> {
    let value = params
        .get("intent")
        .cloned()
        .unwrap_or_else(|| params.clone());
    serde_json::from_value(value).map_err(|err| format!("invalid promotion intent: {err}"))
}

fn required_string(params: &Value, key: &str) -> Result<String, String> {
    params
        .get(key)
        .and_then(|value| value.as_str())
        .map(str::to_owned)
        .ok_or_else(|| format!("{key} must be a string"))
}

/// `s2.parashaktiCorrespondences` — the 72-fold parashakti correspondence face,
/// re-sourced off its lawful substrates (uc-reorient-1 / gate-adapter).
///
/// - The **decan chain** (decan · sign · ruling-planet · element · body-part ·
///   tarot pip · degrees) is resolved **bridge-side from the kernel LUTs** —
///   `ZODIAC_DECAN_TABLE` (the M0→M1→M2 ONE-LUT decan chain, LAW(24)) plus the
///   Golden-Dawn `PIP_DECAN_MAP` inversion for the tarot pip. These are kernel
///   law and stay available offline.
/// - The **asma** sacred name + domain mirror, the **maqam**, and the planetary
///   vedic-mantra / **modal signature (octaval mode)** / chakral role come from
///   the **live Neo4j parashakti-deep graph** via the existing `Neo4jClient`
///   seam (DivineName / Maqam / PlanetaryHarmonic / ChakralCenter nodes). The
///   planetary mode rides `PlanetaryHarmonic.c_0_modal_signature`; thin
///   outer-planet seed stubs (Neptune/Pluto) carry none, so it honest-nulls
///   per-planet. No dataset file is ever read.
/// - When Neo4j is unreachable, the kernel-LUT fields still serve and every
///   graph-sourced field is HONEST-ABSENT (`null`) with `graphUnavailable:
///   true` — never a JSON-dataset fallback.
async fn parashakti_correspondences(params: &Value) -> Result<Value, String> {
    let address72 = (required_u64(params, "address72")? % 72) as usize;

    // ── (a) kernel decan chain — always available (kernel law) ──────────────
    // 72 Shem quinances fold onto the 36 decans two-to-one.
    let decan_index = (address72 / 2) as u8;
    let entry = crate::nara::medicine::zodiac_decan(decan_index)
        .ok_or_else(|| format!("kernel decan index {decan_index} out of range 0..35"))?;
    let sign_name = ZODIAC_SIGN_NAMES[entry.sign as usize];
    let ruling_planet = entry.ruling_planet;
    let planet_ruler_name = crate::nara::medicine::planet_name(ruling_planet).to_string();
    let decan_coordinate = decan_graph_coordinate(entry.sign, entry.decan_in_sign);
    let lo = u32::from(entry.decan_in_sign) * 10;
    let decan_face = json!({
        "coordinate": decan_coordinate,
        "name": format!("{sign_name} Decan {}", entry.decan_in_sign + 1),
        "zodiacSign": sign_name,
        "degrees": format!("{lo}°–{}°", lo + 10),
        "degreesRange": format!("{lo}°–{}° {sign_name}", lo + 10),
        "planetaryRuler": planet_ruler_name.clone(),
        "element": crate::nara::medicine::element_name(entry.element),
        "bodyPart": entry.body_part,
        "herbalismHerbs": [entry.herb],
        "tarotCard": pip_card_for_decan(entry.sign, entry.decan_in_sign),
        "provenance": "kernel-lut",
        "kernelLut": "ZODIAC_DECAN_TABLE + PIP_DECAN_MAP"
    });

    // kernel planet→chakra chain (LAW(24) tail); the coordinates are handles the
    // live graph resolves.
    let chakra_id = crate::nara::medicine::PLANET_CHAKRA
        .get(ruling_planet as usize)
        .copied()
        .unwrap_or(0);
    let planet_coordinate = planet_graph_coordinate(ruling_planet);
    let chakra_coordinate = chakra_graph_coordinate(chakra_id);
    let kernel_chakra_name = crate::nara::medicine::chakra_name(chakra_id).to_string();

    // kernel asma mirror algebra (M2_ASMA_LUT); the mirror *name* is filled from
    // the graph below — the algebra itself is kernel law.
    let mut asma_overlay = asma_overlay_record(address72, params)?;
    let mirror_idx = kernel_asma_desc(address72)?.mirror_idx;
    let asma_name_coordinate = asma_graph_coordinate(address72);
    let mirror_coordinate = if mirror_idx == ASMA_MIRROR_ABSENT {
        None
    } else {
        Some(asma_graph_coordinate(mirror_idx as usize))
    };

    // ── (b) live-graph fields — honest-absent when Neo4j unreachable ────────
    let graph = fetch_parashakti_graph(
        address72,
        &asma_name_coordinate,
        mirror_coordinate.as_deref(),
        &planet_coordinate,
        if chakra_id >= 1 {
            Some(chakra_coordinate.as_str())
        } else {
            None
        },
    )
    .await;
    let graph_unavailable = !graph.available;
    let live_provenance = if graph_unavailable {
        "graph-unavailable"
    } else {
        "live-graph"
    };

    if let Value::Object(overlay) = &mut asma_overlay {
        overlay.insert(
            "mirror_name".to_owned(),
            graph.mirror_name.clone().map_or(Value::Null, Value::String),
        );
    }

    let provenance_handle = format!("s2://graph/parashakti-deep/address72/{address72}");
    let earth_observer_handle =
        format!("s2://graph/parashakti-deep/earth-observer/address72/{address72}");

    Ok(json!({
        "address72": address72,
        "graphUnavailable": graph_unavailable,
        "provenanceHandle": {
            "source": "s2",
            "handle": provenance_handle,
            "bodyAllowed": false,
            "note": "kernel decan LUT + live Neo4j parashakti-deep graph (no dataset file)"
        },
        "decanFace": decan_face,
        "sacredSonic": {
            "coordinate": graph.asma_coordinate.clone().map_or(Value::Null, Value::String),
            "name": opt_string(graph.asma_name),
            "arabicText": opt_string(graph.asma_arabic),
            "englishTranslation": opt_string(graph.asma_english),
            "chakraCorrespondence": opt_string(graph.asma_chakra),
            "asma": asma_overlay,
            "maqam": {
                "coordinate": opt_string(graph.maqam_coordinate),
                "name": opt_string(graph.maqam_name),
                "spiritualFunction": opt_string(graph.maqam_function)
            },
            "provenance": live_provenance
        },
        "planetaryChakral": {
            "planetaryRuler": planet_ruler_name,
            "planetCoordinate": planet_coordinate,
            // The planet "mode" is the live PlanetaryHarmonic octaval/musical
            // signature (`c_0_modal_signature`), not the retired JSON
            // diurnal/nocturnal field (which existed nowhere in the ontology).
            // Honest-null for outer-planet seed stubs with no modal signature.
            "planetaryMode": opt_string(graph.planet_modal_signature),
            "vedicMantra": opt_string(graph.vedic_mantra),
            "chakraCoordinate": if chakra_id >= 1 {
                Value::String(chakra_coordinate)
            } else {
                Value::Null
            },
            "chakraName": graph.chakra_name.clone().unwrap_or(kernel_chakra_name),
            "chakraRole": opt_string(graph.chakra_role),
            "earthObserverHandle": earth_observer_handle.clone(),
            "provenance": live_provenance
        },
        "earthObserverHandle": earth_observer_handle
    }))
}

/// Zodiacal sign names, index 0 = Aries … 11 = Pisces (kernel `ZodiacDecanEntry.sign`).
const ZODIAC_SIGN_NAMES: [&str; 12] = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
];

/// Canonical M2-3 decan coordinate (the element-family layout the
/// parashakti-deep graph uses): family Fire→1 · Earth→2 · Air→3 · Water→4,
/// sign-in-family = sign / 4 (verified against all 36 live `Decan` nodes).
fn decan_graph_coordinate(sign: u8, decan_in_sign: u8) -> String {
    let family = match crate::nara::medicine::SIGN_ELEMENT[sign as usize] {
        4 => 1, // Fire
        1 => 2, // Earth
        3 => 3, // Air
        2 => 4, // Water
        _ => 0,
    };
    format!("M2-3-{family}-{}-{decan_in_sign}", sign / 4)
}

/// PlanetaryHarmonic graph coordinate for a kernel `Planet_Id`
/// (Sun 0 · Earth 1 · Venus 2 · Mercury 3 · Moon 4 · Saturn 5 · Jupiter 6 · Mars 7).
fn planet_graph_coordinate(planet_id: u8) -> String {
    match planet_id {
        0 => "M2-5-(0/1)".to_owned(),
        1 => "M2-5-(0/1)-0".to_owned(),
        other => format!("M2-5-{other}"),
    }
}

/// ChakralCenter graph coordinate for a chakra id (1..7); id 0 is the Earth
/// ground (the Planet-Earth node), which has no ChakralCenter node.
fn chakra_graph_coordinate(chakra_id: u8) -> String {
    format!("M2-5-(0/1)-{chakra_id}")
}

/// DivineName (Asma) graph coordinate for a global name index (0..98): the 99
/// names split three-by-three into Jalal/Kamal/Jamal groups of 33, so the
/// global index = group·33 + index-in-group (verified against the live graph).
fn asma_graph_coordinate(name_idx: usize) -> String {
    format!("M2-4.0-(0/1)-{}-{}", name_idx / 33, name_idx % 33)
}

/// Golden-Dawn tarot pip for a `(sign, decan)` by inverting the kernel
/// `PIP_DECAN_MAP` (the `decan → pip` accessor the LAW(24) chain names).
fn pip_card_for_decan(sign: u8, decan_in_sign: u8) -> Value {
    const SUIT_NAMES: [&str; 4] = ["Cups", "Wands", "Pentacles", "Swords"];
    for (suit, cards) in crate::nara::oracle::PIP_DECAN_MAP.iter().enumerate() {
        for (value_idx, pip) in cards.iter().enumerate() {
            if pip.zodiac_sign == sign && pip.decan == decan_in_sign {
                return Value::String(format!("{} of {}", value_idx + 2, SUIT_NAMES[suit]));
            }
        }
    }
    Value::Null
}

fn opt_string(value: Option<String>) -> Value {
    value.map_or(Value::Null, Value::String)
}

/// Live-graph correspondence fields for a 72-address. `available` is false when
/// Neo4j is unreachable (connection or query error) — every field is then None,
/// which the adapter renders as honest canonical-absence.
#[derive(Default)]
struct ParashaktiGraph {
    available: bool,
    asma_coordinate: Option<String>,
    asma_name: Option<String>,
    asma_arabic: Option<String>,
    asma_english: Option<String>,
    asma_chakra: Option<String>,
    mirror_name: Option<String>,
    maqam_coordinate: Option<String>,
    maqam_name: Option<String>,
    maqam_function: Option<String>,
    vedic_mantra: Option<String>,
    /// `PlanetaryHarmonic.c_0_modal_signature` — the octaval/musical mode of the
    /// ruling planet (what the Bimba map means by a "planet mode"). `None` for
    /// thin outer-planet seed stubs (Neptune/Pluto) that carry no modal
    /// signature — an honest per-planet null, never invented.
    planet_modal_signature: Option<String>,
    chakra_name: Option<String>,
    chakra_role: Option<String>,
}

/// Fetch the graph-sourced correspondence fields via the live `Neo4jClient`
/// seam. Any connection/query failure degrades to `ParashaktiGraph::default()`
/// (`available: false`) — never a dataset-file fallback.
async fn fetch_parashakti_graph(
    address72: usize,
    asma_name_coord: &str,
    mirror_coord: Option<&str>,
    planet_coord: &str,
    chakra_coord: Option<&str>,
) -> ParashaktiGraph {
    match fetch_parashakti_graph_inner(
        address72,
        asma_name_coord,
        mirror_coord,
        planet_coord,
        chakra_coord,
    )
    .await
    {
        Ok(graph) => graph,
        Err(_) => ParashaktiGraph::default(),
    }
}

async fn fetch_parashakti_graph_inner(
    address72: usize,
    asma_name_coord: &str,
    mirror_coord: Option<&str>,
    planet_coord: &str,
    chakra_coord: Option<&str>,
) -> Result<ParashaktiGraph, String> {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).map_err(|err| err.to_string())?;

    let scalar_query = neo4rs::query(
        "OPTIONAL MATCH (nm:DivineName {coordinate: $nameCoord})
         OPTIONAL MATCH (mr:DivineName {coordinate: $mirrorCoord})
         OPTIONAL MATCH (pl:PlanetaryHarmonic {coordinate: $planetCoord})
         OPTIONAL MATCH (ch:ChakralCenter {coordinate: $chakraCoord})
         RETURN nm.coordinate AS asmaCoord, nm.c_1_name AS asmaName,
                nm.m_2_4_arabic_text AS asmaArabic,
                nm.s_4_english_translation AS asmaEnglish,
                nm.l_2_chakra_correspondence AS asmaChakra,
                mr.c_1_name AS mirrorName,
                pl.l_2_vedic_mantra AS vedicMantra,
                pl.c_0_modal_signature AS planetModalSignature,
                ch.c_1_name AS chakraName, ch.l_3_spiritual_function AS chakraRole",
    )
    .param("nameCoord", asma_name_coord.to_owned())
    .param("mirrorCoord", mirror_coord.unwrap_or("").to_owned())
    .param("planetCoord", planet_coord.to_owned())
    .param("chakraCoord", chakra_coord.unwrap_or("").to_owned());

    let rows = client
        .run_query(scalar_query)
        .await
        .map_err(|err| err.to_string())?;
    let row = rows
        .first()
        .ok_or_else(|| "parashakti scalar query returned no row".to_owned())?;

    // maqam: the 72 nodes ordered by (group, index) parsed from the coordinate.
    let maqam_rows = client
        .run(
            "MATCH (m:Maqam) RETURN m.coordinate AS c, m.c_1_name AS n, \
             m.l_3_spiritual_function AS sf",
        )
        .await
        .map_err(|err| err.to_string())?;
    let mut maqams: Vec<(String, Option<String>, Option<String>)> = maqam_rows
        .iter()
        .filter_map(|maqam_row| {
            let coord = maqam_row.get::<String>("c").ok()?;
            Some((
                coord,
                maqam_row.get::<Option<String>>("n").ok().flatten(),
                maqam_row.get::<Option<String>>("sf").ok().flatten(),
            ))
        })
        .collect();
    maqams.sort_by(|a, b| maqam_sort_key(&a.0).cmp(&maqam_sort_key(&b.0)));
    let maqam = if maqams.is_empty() {
        None
    } else {
        maqams.into_iter().nth(address72 % 72)
    };

    Ok(ParashaktiGraph {
        available: true,
        asma_coordinate: row.get::<Option<String>>("asmaCoord").ok().flatten(),
        asma_name: row.get::<Option<String>>("asmaName").ok().flatten(),
        asma_arabic: row.get::<Option<String>>("asmaArabic").ok().flatten(),
        asma_english: row.get::<Option<String>>("asmaEnglish").ok().flatten(),
        asma_chakra: row.get::<Option<String>>("asmaChakra").ok().flatten(),
        mirror_name: row.get::<Option<String>>("mirrorName").ok().flatten(),
        maqam_coordinate: maqam.as_ref().map(|entry| entry.0.clone()),
        maqam_name: maqam.as_ref().and_then(|entry| entry.1.clone()),
        maqam_function: maqam.as_ref().and_then(|entry| entry.2.clone()),
        vedic_mantra: row.get::<Option<String>>("vedicMantra").ok().flatten(),
        planet_modal_signature: row
            .get::<Option<String>>("planetModalSignature")
            .ok()
            .flatten(),
        chakra_name: row.get::<Option<String>>("chakraName").ok().flatten(),
        chakra_role: row.get::<Option<String>>("chakraRole").ok().flatten(),
    })
}

/// Numeric (group, index) sort key for a Maqam coordinate `M2-4.3-{group}-{idx}`.
/// `first_integer` tolerates the `(0/1)` QL-variant idx segment.
fn maqam_sort_key(coordinate: &str) -> (u32, u32) {
    let rest = coordinate.strip_prefix("M2-4.3-").unwrap_or(coordinate);
    let mut segments = rest.split('-');
    let group = segments
        .next()
        .and_then(|segment| segment.parse::<u32>().ok())
        .unwrap_or(u32::MAX);
    let index = segments.next().map(first_integer).unwrap_or(u32::MAX);
    (group, index)
}

/// First integer run in a coordinate segment (`"(0/1)"` → 0, `"10"` → 10).
fn first_integer(segment: &str) -> u32 {
    let digits: String = segment
        .chars()
        .skip_while(|ch| !ch.is_ascii_digit())
        .take_while(char::is_ascii_digit)
        .collect();
    digits.parse::<u32>().unwrap_or(u32::MAX)
}

/// Kernel-only Asma overlay: `M2_ASMA_LUT` mirror algebra + 36/64 routing masks.
/// The `mirror_name` (a graph value) is injected by `parashakti_correspondences`
/// after the live fetch; this record carries the kernel-law fields alone.
fn asma_overlay_record(name_idx: usize, params: &Value) -> Result<Value, String> {
    let desc = kernel_asma_desc(name_idx)?;
    let has_mirror = desc.mirror_idx != ASMA_MIRROR_ABSENT;

    Ok(json!({
        "name_idx": desc.name_idx,
        "group": desc.group,
        "group_name": asma_group_name(desc.group),
        "index_in_group": desc.index_in_group,
        "mirror_idx": desc.mirror_idx,
        "has_mirror": has_mirror,
        "mirror_relation": "domain_mirror",
        "phase": asma_phase(params),
        "phase_law": "#/inversion_spanda",
        "mask_routing": {
            "internal": asma_mask_contains(unsafe { ASMA_36_INTERNAL_MASK }, desc.name_idx),
            "projective": asma_mask_contains(unsafe { ASMA_64_PROJECTIVE_MASK }, desc.name_idx),
            "basis": "ASMA_36_INTERNAL_MASK/ASMA_64_PROJECTIVE_MASK"
        }
    }))
}

fn kernel_asma_desc(name_idx: usize) -> Result<KernelAsmaNameDesc, String> {
    if name_idx >= 100 {
        return Err(format!("Asma name index must be < 100, got {name_idx}"));
    }
    Ok(unsafe { M2_ASMA_LUT[name_idx] })
}

fn asma_mask_contains(mask: RoutingMask128, name_idx: u8) -> bool {
    if name_idx < 64 {
        ((mask.low_64 >> name_idx) & 1) == 1
    } else {
        ((mask.high_64 >> (name_idx - 64)) & 1) == 1
    }
}

fn asma_group_name(group: u8) -> &'static str {
    match group {
        0 => "Jalal",
        1 => "Kamal",
        2 => "Jamal",
        _ => "Hidden",
    }
}

fn asma_phase(params: &Value) -> &'static str {
    let active_kind = params
        .get("activeKleinFlip")
        .or_else(|| params.get("kleinFlip"))
        .and_then(|value| value.get("kind"))
        .and_then(Value::as_str);
    match active_kind {
        Some("M2CymaticValenceInvert") | Some("m2.cymatic.valence.invert") => "inverted",
        _ if params.get("phase").and_then(Value::as_str) == Some("inverted") => "inverted",
        _ => "primary",
    }
}

fn required_u64(params: &Value, key: &str) -> Result<u64, String> {
    params
        .get(key)
        .and_then(|value| value.as_u64())
        .ok_or_else(|| format!("{key} must be a positive integer"))
}

fn current_epoch_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

fn required_u8(params: &Value, key: &str, max: u8) -> Result<u8, String> {
    let value = required_u64(params, key)?;
    if value > max as u64 {
        return Err(format!("{key} must be <= {max}"));
    }
    Ok(value as u8)
}

fn required_f64(params: &Value, key: &str) -> Result<f64, String> {
    let value = params
        .get(key)
        .and_then(|value| value.as_f64())
        .ok_or_else(|| format!("{key} must be a number"))?;
    if !value.is_finite() {
        return Err(format!("{key} must be finite"));
    }
    Ok(value)
}

fn parse_results(params: &Value, key: &str) -> Result<Vec<RetrievalResult>, String> {
    match params.get(key) {
        Some(value) => serde_json::from_value(value.clone())
            .map_err(|err| format!("{key} must be RetrievalResult[]: {err}")),
        None => Ok(Vec::new()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The decan chain + asma mirror algebra are kernel law: they resolve for
    /// address 17 whether or not Neo4j is reachable and match `ZODIAC_DECAN_TABLE`
    /// / `PIP_DECAN_MAP` exactly. (The runtime no-dataset-leak guard lives in the
    /// contract test so its string literals never re-pollute this source file.)
    #[tokio::test]
    async fn parashakti_correspondences_decan_chain_is_kernel_lut_sourced() {
        let artifact = parashakti_correspondences(&json!({ "address72": 17 }))
            .await
            .expect("parashakti adapter should resolve address 17 from kernel LUTs");

        // address 17 → decan 17/2 = 8 = Gemini Decan 3 (Sun, Air) in ZODIAC_DECAN_TABLE.
        let decan = &artifact["decanFace"];
        assert_eq!(artifact["address72"], 17);
        assert_eq!(decan["zodiacSign"], "Gemini");
        assert_eq!(decan["name"], "Gemini Decan 3");
        assert_eq!(decan["planetaryRuler"], "Sun");
        assert_eq!(decan["element"], "Air");
        assert_eq!(decan["degreesRange"], "20°–30° Gemini");
        assert_eq!(decan["tarotCard"], "10 of Swords");
        assert_eq!(decan["coordinate"], "M2-3-3-0-2");
        assert_eq!(decan["provenance"], "kernel-lut");

        let asma = &artifact["sacredSonic"]["asma"];
        assert_eq!(asma["name_idx"], 17);
        assert_eq!(asma["mirror_idx"], 0xFF);
        assert_eq!(asma["has_mirror"], false);
        assert!(asma["mirror_name"].is_null());
        assert_eq!(asma["mirror_relation"], "domain_mirror");
        assert_eq!(asma["phase_law"], "#/inversion_spanda");
        assert_eq!(asma["phase"], "primary");

        let flipped = parashakti_correspondences(&json!({
            "address72": 17,
            "activeKleinFlip": { "kind": "M2CymaticValenceInvert" }
        }))
        .await
        .expect("active Klein flip should only change phase");
        assert_eq!(flipped["address72"], 17);
        assert_eq!(flipped["sacredSonic"]["asma"]["phase"], "inverted");
    }
}
