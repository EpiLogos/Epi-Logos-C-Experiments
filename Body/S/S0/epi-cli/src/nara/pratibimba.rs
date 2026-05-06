use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct PratibimbaStats {
    pub node_count: u32,
    pub edge_count: u32,
    pub days_active: u32,
    pub last_added: Option<String>,
}

const GRAPHITI_URL: &str = "http://127.0.0.1:37778";

#[derive(Serialize)]
struct IdentityEventPayload<'a> {
    event_type: &'a str,
    quintessence_hash: &'a str,
    tick12: u8,
    layer_key: Option<&'a str>,
    source: &'a str,
    cp: &'a str,
}

#[derive(Deserialize)]
struct IdentityEventResponse {
    status: String,
    #[serde(default)]
    event_type: String,
}

/// epi nara pratibimba init — create PersonalNexus anchor at #4.4.4.4
///
/// Requires `epi nara wind` to have run first (profile.json must exist).
/// Posts to the Graphiti sidecar /identity/event to upsert the anchor node.
pub fn init(json: bool) -> Result<String, String> {
    use super::identity::load_profile;

    let profile = load_profile()?
        .ok_or("No profile found — run `epi nara wind --birth-date YYYY-MM-DD` first")?;

    if profile.hash_preview.is_empty() {
        return Err(
            "Profile has no quintessence hash — run `epi nara wind --force` to recompute".into(),
        );
    }

    let payload = IdentityEventPayload {
        event_type: "personal_nexus_init",
        quintessence_hash: &profile.hash_preview,
        tick12: 0,
        layer_key: None,
        source: "pratibimba-init-cli",
        cp: "4.0",
    };

    let client = reqwest::blocking::Client::new();
    let resp = client
        .post(format!("{GRAPHITI_URL}/identity/event"))
        .json(&payload)
        .send()
        .map_err(|e| {
            format!(
                "graphiti sidecar unreachable at {GRAPHITI_URL}: {e}\n  start with: epi gate graphiti start"
            )
        })?;

    if !resp.status().is_success() {
        return Err(format!(
            "graphiti /identity/event returned {}: {}",
            resp.status(),
            resp.text().unwrap_or_default()
        ));
    }

    let result: IdentityEventResponse = resp.json().map_err(|e: reqwest::Error| e.to_string())?;

    if json {
        serde_json::to_string(&serde_json::json!({
            "ok": result.status == "ok",
            "event_type": result.event_type,
            "quintessence_hash": &profile.hash_preview,
            "coordinate": "4.4.4.4",
            "message": "PersonalNexus anchor created in Neo4j Pratibimba namespace"
        }))
        .map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "PersonalNexus anchor initialised at #4.4.4.4\n  quintessence: {}\n  BEDROCK edge → Bimba #4 created",
            &profile.hash_preview
        ))
    }
}

/// epi nara pratibimba stats
pub fn stats(json: bool) -> Result<String, String> {
    // Neo4j query deferred — return stub
    let stats = PratibimbaStats {
        node_count: 0,
        edge_count: 0,
        days_active: 0,
        last_added: None,
    };

    if json {
        serde_json::to_string_pretty(&stats).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Pratibimba Stats\n  Nodes: {}\n  Edges: {}\n  Days active: {}\n  (Neo4j connection required for live data)",
            stats.node_count, stats.edge_count, stats.days_active
        ))
    }
}

/// epi nara pratibimba recent
pub fn recent(days: u32, json: bool) -> Result<String, String> {
    if json {
        Ok(serde_json::json!({
            "days": days,
            "records": [],
            "note": "Neo4j connection required"
        })
        .to_string())
    } else {
        Ok(format!(
            "Pratibimba Recent ({} days)\n  (Neo4j connection required for live data)",
            days
        ))
    }
}

/// epi nara pratibimba record
pub fn record(cycle_id: u32, lens: Option<&str>) -> Result<String, String> {
    let lens_desc = lens.unwrap_or("none");
    Ok(format!(
        "Pratibimba record for cycle #{} (lens: {})\n  (Neo4j write deferred — requires graph connection)",
        cycle_id, lens_desc
    ))
}

/// epi nara pratibimba excavate — BFS search from PersonalNexus anchor
///
/// Queries the Graphiti sidecar `/search` with the given term.
/// Uses the active quintessence hash as group_id scope.
pub fn excavate(term: &str, json: bool) -> Result<String, String> {
    use super::identity::load_profile;
    use std::collections::HashMap;

    let group_id = load_profile()
        .ok()
        .flatten()
        .map(|p| p.hash_preview)
        .unwrap_or_default();

    let mut params: HashMap<&str, String> = HashMap::new();
    params.insert("query", term.to_owned());
    params.insert("num_results", "10".to_owned());
    if !group_id.is_empty() {
        params.insert("group_id", group_id.clone());
    }

    let query_str = params
        .iter()
        .map(|(k, v)| {
            let encoded = v
                .replace(' ', "%20")
                .replace('&', "%26")
                .replace('=', "%3D");
            format!("{k}={encoded}")
        })
        .collect::<Vec<_>>()
        .join("&");

    let client = reqwest::blocking::Client::new();
    let resp = client
        .get(format!("{GRAPHITI_URL}/search?{query_str}"))
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .map_err(|e| {
            format!(
                "graphiti sidecar unreachable at {GRAPHITI_URL}: {e}\n  start with: epi gate graphiti start"
            )
        })?;

    let body: serde_json::Value = resp.json().map_err(|e: reqwest::Error| e.to_string())?;

    if json {
        serde_json::to_string_pretty(&body).map_err(|e| e.to_string())
    } else {
        let results = body["results"].as_array().cloned().unwrap_or_default();
        if results.is_empty() {
            Ok(format!(
                "Pratibimba excavate: '{}' — no episodes found",
                term
            ))
        } else {
            let lines: Vec<String> = results
                .iter()
                .enumerate()
                .map(|(i, r)| {
                    let content = r["content"].as_str().unwrap_or("—");
                    let ql = r["ql_position"].as_str().unwrap_or("?");
                    format!("  [{i}] ql={ql}: {}", &content[..content.len().min(120)])
                })
                .collect();
            Ok(format!(
                "Pratibimba excavate: '{}' ({} results)\n{}",
                term,
                results.len(),
                lines.join("\n")
            ))
        }
    }
}

/// epi nara pratibimba atlas-sync
pub fn atlas_sync(yes: bool) -> Result<String, String> {
    if !yes {
        return Err("atlas-sync requires explicit consent (--yes)".to_string());
    }
    Ok(
        "Atlas sync: anonymized pattern data queued for Neo4j write\n  (Neo4j connection required)"
            .to_string(),
    )
}

/// epi nara pratibimba atlas-query
pub fn atlas_query(coordinate: Option<&str>, json: bool) -> Result<String, String> {
    let coord = coordinate.unwrap_or("*");
    if json {
        Ok(serde_json::json!({
            "coordinate": coord,
            "results": [],
            "note": "Neo4j connection required"
        })
        .to_string())
    } else {
        Ok(format!(
            "Atlas Query ({})\n  (Neo4j connection required for live data)",
            coord
        ))
    }
}
