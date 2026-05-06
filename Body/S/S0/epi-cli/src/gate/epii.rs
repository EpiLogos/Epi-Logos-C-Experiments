use std::path::Path;

use epi_s3_gateway_contract::{GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY};
use epi_s5_epii_agent_core::{DepositRequest, EpiiAgentAccess};
use serde_json::{json, Value};

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
            "storage_root": config.root,
            "neo4j_uri": neo4j_uri,
            "embedding_api_configured": embedding_api,
            "notebooks_count": notebooks.len(),
            "documents_count": documents.len(),
        }),
        (notebooks, documents) => json!({
            "available": false,
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

async fn graphiti_status() -> Value {
    let status = super::graphiti::status_value().await;
    json!({
        "available": true,
        "running": status.running,
        "url": status.url,
        "health": status.health,
        "runtime_authority": GRAPHITI_RUNTIME_AUTHORITY,
        "invocation_owner": GRAPHITI_INVOCATION_OWNER,
    })
}
