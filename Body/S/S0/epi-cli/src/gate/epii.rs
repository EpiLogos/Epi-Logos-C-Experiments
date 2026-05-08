use std::path::Path;

use epi_s3_gateway_contract::{GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY};
use epi_s5_epii_agent_core::{DepositRequest, EpiiAgentAccess};
use serde_json::{json, Value};

use crate::nara::kairos;
use crate::techne::gnosis::{config::GnosisConfig, ingest, notebook};

pub async fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut snapshot =
        serde_json::to_value(access(state_root).snapshot()?).map_err(|err| err.to_string())?;
    snapshot["world_return"] = world_return_status().await;
    Ok(snapshot)
}

pub fn deposit(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: DepositRequest =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    serde_json::to_value(access(state_root).deposit(request)?).map_err(|err| err.to_string())
}

pub fn user_orientation() -> Value {
    json!({
        "coordinate": "S5/S5'",
        "method": "s5'.epii.user.orientation",
        "access": {
            "stewardshipOwner": "S5'",
            "personalCoordinate": "M4.4.4.4",
            "s4Access": "read temporal orientation and deposit review requests; no identity mutation",
            "s5Access": "read protected references, steward review, and govern identity-affecting changes through Epii/user validation",
        },
        "pratibimba": super::temporal::pratibimba_surface_value(),
        "kairos": epii_kairos_status(),
        "graphiti": {
            "runtimeOwner": "S3'",
            "invocationOwner": "S5/S5'",
            "namespaceSource": "M4.4.4.4 PersonalNexus protected anchor",
            "privacy": "episodic memory is local/protected; SpaceTimeDB carries only safe projection refs",
        },
    })
}

fn access(state_root: impl AsRef<Path>) -> EpiiAgentAccess {
    EpiiAgentAccess::new(state_root)
}

async fn world_return_status() -> Value {
    json!({
        "gnosis": gnosis_status(),
        "nara": nara_status(),
        "graphiti": graphiti_status().await,
    })
}

fn gnosis_status() -> Value {
    let config = GnosisConfig::from_env();
    let notebooks = notebook::list(&config);
    let documents = ingest::list_documents(&config);
    let embedding_api = std::env::var("GEMINI_API_KEY").is_ok();
    let neo4j_uri =
        std::env::var("EPILOGOS_NEO4J_URI").unwrap_or_else(|_| "bolt://localhost:7687".to_owned());

    match (notebooks, documents) {
        (Ok(notebooks), Ok(documents)) => json!({
            "available": true,
            "coordinate": "S5",
            "service": "gnosis",
            "storage_substrate": "S2",
            "governance_owner": "S5'",
            "storage_root": config.root,
            "neo4j_uri": neo4j_uri,
            "embedding_api_configured": embedding_api,
            "notebooks_count": notebooks.len(),
            "documents_count": documents.len(),
        }),
        (notebooks, documents) => json!({
            "available": false,
            "coordinate": "S5",
            "service": "gnosis",
            "storage_substrate": "S2",
            "governance_owner": "S5'",
            "storage_root": config.root,
            "neo4j_uri": neo4j_uri,
            "embedding_api_configured": embedding_api,
            "notebooks_error": notebooks.err(),
            "documents_error": documents.err(),
        }),
    }
}

fn nara_status() -> Value {
    match super::nara::dispatch_nara("nara.status", &json!({})) {
        Ok(snapshot) => json!({
            "available": true,
            "method": "nara.status",
            "snapshot": snapshot,
        }),
        Err((code, message)) => json!({
            "available": false,
            "method": "nara.status",
            "error": {
                "code": code,
                "message": message,
            },
        }),
    }
}

fn epii_kairos_status() -> Value {
    match kairos::load_current() {
        Ok(Some(snapshot)) => json!({
            "available": true,
            "fresh": kairos::is_current_fresh(),
            "source": "nara.kairos.current",
            "dominantSign": snapshot.dominant_sign,
            "dominantElement": snapshot.dominant_element,
            "activeDecan": snapshot.active_decan,
            "activeTattva": snapshot.active_tattva,
            "privacy": "public-current-transit-only",
        }),
        Ok(None) => json!({
            "available": false,
            "fresh": false,
            "source": "nara.kairos.current",
            "reason": "no cached Kairos snapshot; run `epi nara kairos sync`",
            "privacy": "public-current-transit-only",
        }),
        Err(error) => json!({
            "available": false,
            "fresh": false,
            "source": "nara.kairos.current",
            "error": error,
            "privacy": "public-current-transit-only",
        }),
    }
}

async fn graphiti_status() -> Value {
    let status = super::graphiti::status_value().await;
    json!({
        "available": true,
        "running": status.running,
        "url": status.url,
        "health": status.health,
        "runtime_coordinate": "S3'",
        "usage_governance_coordinate": "S5/S5'",
        "runtime_authority": GRAPHITI_RUNTIME_AUTHORITY,
        "invocation_owner": GRAPHITI_INVOCATION_OWNER,
    })
}
