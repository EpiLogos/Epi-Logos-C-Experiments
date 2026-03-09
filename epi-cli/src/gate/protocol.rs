use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::parity;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestFrame {
    #[serde(rename = "type")]
    pub kind: String,
    pub id: u64,
    pub method: String,
    #[serde(default)]
    pub params: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseFrame {
    #[serde(rename = "type")]
    pub kind: String,
    pub id: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<GatewayError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayError {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct HelloOkFrame {
    #[serde(rename = "type")]
    pub kind: &'static str,
    pub protocol: u8,
    pub version: &'static str,
    pub features: HelloFeatures,
}

#[derive(Debug, Clone, Serialize)]
pub struct HelloFeatures {
    pub methods: Vec<&'static str>,
}

pub fn hello_ok() -> HelloOkFrame {
    HelloOkFrame {
        kind: "hello-ok",
        protocol: 3,
        version: "s3-gateway-dev",
        features: HelloFeatures {
            methods: parity::method_names().to_vec(),
        },
    }
}

pub fn success(id: u64, result: Value) -> ResponseFrame {
    ResponseFrame {
        kind: "res".to_owned(),
        id,
        result: Some(result),
        error: None,
    }
}

pub fn error(id: u64, code: impl Into<String>, message: impl Into<String>) -> ResponseFrame {
    ResponseFrame {
        kind: "res".to_owned(),
        id,
        result: None,
        error: Some(GatewayError {
            code: code.into(),
            message: message.into(),
        }),
    }
}

pub fn connect_result() -> Value {
    json!({
        "ok": true,
        "protocol": 3,
        "version": "s3-gateway-dev",
        "features": {
            "methods": parity::method_names(),
        }
    })
}
