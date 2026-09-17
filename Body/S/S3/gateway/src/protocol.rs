use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

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

pub const VERIFY_PHASE_MAX_CYCLES: u8 = 3;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyPhaseContractFrame {
    pub phase: &'static str,
    pub gate: &'static str,
    pub max_verify_cycles: u8,
    pub evidence_record: &'static str,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum VerifyPhaseStatus {
    Questions,
    Cleared,
    HumanEscalation,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyPhaseQuestionFrame {
    pub symbolic_coordinate: String,
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub evidence_ref: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyPhaseEvidenceFrame {
    pub judge_agent: String,
    pub judge_vak_coordinate: String,
    pub status: VerifyPhaseStatus,
    pub cycle: u8,
    pub questions: Vec<VerifyPhaseQuestionFrame>,
}

pub fn verify_phase_contract() -> VerifyPhaseContractFrame {
    VerifyPhaseContractFrame {
        phase: "Verify",
        gate: "adversarial",
        max_verify_cycles: VERIFY_PHASE_MAX_CYCLES,
        evidence_record: "GoalRun.verify_phase_evidence",
    }
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
    pub events: Vec<&'static str>,
}

pub fn hello_ok() -> HelloOkFrame {
    HelloOkFrame {
        kind: "hello-ok",
        protocol: epi_s3_gateway_contract::PROTOCOL_VERSION,
        version: epi_s3_gateway_contract::PROTOCOL_DEV_VERSION,
        features: HelloFeatures {
            methods: epi_s3_gateway_contract::method_names().to_vec(),
            events: epi_s3_gateway_contract::event_names().to_vec(),
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
        "protocol": epi_s3_gateway_contract::PROTOCOL_VERSION,
        "version": epi_s3_gateway_contract::PROTOCOL_DEV_VERSION,
        "features": {
            "methods": epi_s3_gateway_contract::method_names(),
            "events": epi_s3_gateway_contract::event_names(),
        }
    })
}
