use serde_json::Value;

use super::protocol::GatewayError;

pub fn validate_connect(params: &Value) -> Result<(), GatewayError> {
    if params.is_null() || params.as_object().is_some() {
        Ok(())
    } else {
        Err(GatewayError {
            code: "invalid-auth".to_owned(),
            message: "connect params must be an object".to_owned(),
        })
    }
}
