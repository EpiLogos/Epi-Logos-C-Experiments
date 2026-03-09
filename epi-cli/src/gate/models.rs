use std::path::Path;

use serde_json::{json, Value};

use super::config;

pub fn list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let doc = config::load_document(state_root)?;
    Ok(json!({
        "models": [
            {
                "id": "pi.default",
                "provider": doc.gateway.auth_mode,
                "transport": "gateway"
            }
        ]
    }))
}
