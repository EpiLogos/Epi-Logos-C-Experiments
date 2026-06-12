use serde_json::{json, Value};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::graph::client::{Neo4jClient, Neo4jConfig};
use crate::graph::{
    kernel_coordinate_anchor_from_parts, GraphMethodParams, GraphMethodService, GraphNodeRequest,
    GraphQueryRequest, GraphTraverseDirection, GraphTraverseRequest,
    HarmonicRelationMaterializationRequest, HybridFusionConfig, KernelResonanceObservationRequest,
    PointerWebRefreshRequest, RetrievalResult,
};

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
        return parashakti_correspondences(params);
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

fn required_string(params: &Value, key: &str) -> Result<String, String> {
    params
        .get(key)
        .and_then(|value| value.as_str())
        .map(str::to_owned)
        .ok_or_else(|| format!("{key} must be a string"))
}

fn parashakti_correspondences(params: &Value) -> Result<Value, String> {
    let address72 = (required_u64(params, "address72")? % 72) as usize;
    let nodes = read_parashakti_deep_nodes()?;
    let decans = nodes
        .iter()
        .filter(|node| {
            node_string(node, "coordinate")
                .map(|coord| coord.starts_with("#2-3-"))
                .unwrap_or(false)
                && filtered_string(node, "planetaryRuler").is_some()
                && filtered_string(node, "zodiacSign").is_some()
                && filtered_string(node, "bodyPart").is_some()
        })
        .collect::<Vec<_>>();
    if decans.len() < 36 {
        return Err(format!(
            "parashakti-deep decan fixture incomplete: expected at least 36 decans, found {}",
            decans.len()
        ));
    }

    let asma = nodes
        .iter()
        .filter(|node| {
            node_string(node, "coordinate")
                .map(|coord| coord.starts_with("#2-4.0-"))
                .unwrap_or(false)
                && filtered_string(node, "arabicText").is_some()
                && filtered_string(node, "englishTranslation").is_some()
        })
        .collect::<Vec<_>>();
    if asma.len() < 72 {
        return Err(format!(
            "parashakti-deep sacred-name fixture incomplete: expected at least 72 names, found {}",
            asma.len()
        ));
    }

    let maqams = nodes
        .iter()
        .filter(|node| {
            node_string(node, "coordinate")
                .map(|coord| coord.starts_with("#2-4.3-"))
                .unwrap_or(false)
                && filtered_string(node, "spiritualFunction").is_some()
        })
        .collect::<Vec<_>>();
    if maqams.len() < 72 {
        return Err(format!(
            "parashakti-deep maqam fixture incomplete: expected at least 72 maqams, found {}",
            maqams.len()
        ));
    }

    let decan = decans[address72 % 36];
    let sacred_name = asma[address72];
    let maqam = maqams[address72];
    let planetary_ruler = filtered_string(decan, "planetaryRuler")
        .ok_or_else(|| "selected decan missing planetaryRuler".to_owned())?;
    let planet = nodes.iter().find(|node| {
        node_string(node, "coordinate")
            .map(|coord| coord.starts_with("#2-5"))
            .unwrap_or(false)
            && filtered_string(node, "planetaryMode").is_some()
            && filtered_string(node, "name")
                .map(|name| name.eq_ignore_ascii_case(&planetary_ruler))
                .unwrap_or(false)
    });
    let chakra = planet.and_then(|planet| {
        let prefix = format!("{}-", node_string(planet, "coordinate")?);
        nodes.iter().find(|node| {
            node_string(node, "coordinate")
                .map(|coord| coord.starts_with(&prefix))
                .unwrap_or(false)
                && filtered_string(node, "mantraSignature").is_some()
        })
    });

    let dataset = "Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json";
    let earth_observer_handle =
        format!("s2://parashakti-deep/earth-observer/address72/{address72}");
    let provenance_handle = format!("s2://parashakti-deep/address72/{address72}");

    Ok(json!({
        "address72": address72,
        "provenanceHandle": {
            "source": "s2",
            "handle": provenance_handle,
            "bodyAllowed": false,
            "note": "parashakti-deep graph correspondence adapter"
        },
        "decanFace": {
            "coordinate": node_string(decan, "coordinate"),
            "name": filtered_string(decan, "name"),
            "zodiacSign": filtered_string(decan, "zodiacSign"),
            "degrees": filtered_string(decan, "degrees"),
            "degreesRange": filtered_string(decan, "degreesRange"),
            "planetaryRuler": planetary_ruler,
            "bodyPart": filtered_string(decan, "bodyPart"),
            "herbalismHerbs": filtered_array(decan, "herbalism_herbs"),
            "tarotCard": filtered_string(decan, "tarotCard"),
            "dataset": dataset
        },
        "sacredSonic": {
            "coordinate": node_string(sacred_name, "coordinate"),
            "name": filtered_string(sacred_name, "name"),
            "arabicText": filtered_string(sacred_name, "arabicText"),
            "englishTranslation": filtered_string(sacred_name, "englishTranslation"),
            "chakraCorrespondence": filtered_string(sacred_name, "chakraCorrespondence"),
            "maqam": {
                "coordinate": node_string(maqam, "coordinate"),
                "name": filtered_string(maqam, "name"),
                "spiritualFunction": filtered_string(maqam, "spiritualFunction")
            },
            "dataset": dataset
        },
        "planetaryChakral": {
            "planetaryRuler": filtered_string(decan, "planetaryRuler"),
            "planetCoordinate": planet.and_then(|node| node_string(node, "coordinate")),
            "planetaryMode": planet.and_then(|node| filtered_string(node, "planetaryMode")),
            "vedicMantra": planet.and_then(|node| filtered_string(node, "vedicMantra")),
            "chakraCoordinate": chakra.and_then(|node| node_string(node, "coordinate")),
            "chakraName": chakra.and_then(|node| filtered_string(node, "name")),
            "chakraRole": chakra
                .and_then(|node| filtered_string(node, "spiritualFunction"))
                .or_else(|| filtered_string(sacred_name, "chakraCorrespondence")),
            "earthObserverHandle": earth_observer_handle,
            "dataset": dataset
        },
        "earthObserverHandle": earth_observer_handle
    }))
}

fn read_parashakti_deep_nodes() -> Result<Vec<Value>, String> {
    let path = repo_root()
        .join("Idea")
        .join("Bimba")
        .join("Map")
        .join("datasets")
        .join("parashakti-deep")
        .join("nodes-full-detail.json");
    let raw =
        std::fs::read_to_string(&path).map_err(|err| format!("read {}: {err}", path.display()))?;
    let sanitized = sanitize_json_control_chars(strip_json_bom(&raw));
    serde_json::from_str(&sanitized).map_err(|err| format!("parse {}: {err}", path.display()))
}

fn repo_root() -> PathBuf {
    if let Some(root) = std::env::var_os("EPI_REPO_ROOT") {
        return PathBuf::from(root);
    }
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .unwrap_or_else(|| Path::new(env!("CARGO_MANIFEST_DIR")))
        .to_path_buf()
}

fn strip_json_bom(raw: &str) -> &str {
    raw.trim_start_matches('\u{feff}')
}

fn sanitize_json_control_chars(raw: &str) -> String {
    let mut result = String::with_capacity(raw.len());
    let mut in_string = false;
    let mut escaped = false;

    for ch in raw.chars() {
        if escaped {
            result.push(ch);
            escaped = false;
            continue;
        }
        if ch == '\\' {
            result.push(ch);
            escaped = true;
            continue;
        }
        if ch == '"' {
            in_string = !in_string;
            result.push(ch);
            continue;
        }
        match ch {
            '\n' if in_string => result.push_str("\\n"),
            '\r' if in_string => result.push_str("\\r"),
            '\t' if in_string => result.push_str("\\t"),
            _ => result.push(ch),
        }
    }

    result
}

fn node_string(node: &Value, key: &str) -> Option<String> {
    node.get(key).and_then(Value::as_str).map(str::to_owned)
}

fn filtered_string(node: &Value, key: &str) -> Option<String> {
    node.get("filteredProps")
        .and_then(|props| props.get(key))
        .and_then(Value::as_str)
        .map(str::to_owned)
}

fn filtered_array(node: &Value, key: &str) -> Value {
    node.get("filteredProps")
        .and_then(|props| props.get(key))
        .and_then(Value::as_array)
        .map(|items| Value::Array(items.clone()))
        .unwrap_or(Value::Null)
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
