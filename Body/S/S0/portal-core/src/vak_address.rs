use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CfPosition {
    Inner0,
    Inner1,
    Inner2,
    Inner3,
    Inner4,
    Inner5,
    Outer4Parent,
    LemniscateStage5,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CpfState {
    #[serde(rename = "(00/00)")]
    Dialogical,
    #[serde(rename = "(4.0/1-4.4/5)")]
    Mechanistic,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CsDirection {
    Day,
    #[serde(rename = "Night'")]
    Night,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CsField {
    pub code: String,
    pub direction: CsDirection,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct VakAddress {
    pub cpf: CpfState,
    pub ct: Vec<String>,
    pub cp: String,
    pub cf: String,
    pub cfp: String,
    pub cs: CsField,
}

pub fn canonical_cf_position(cf_literal: &str) -> Option<CfPosition> {
    match cf_literal {
        "(00/00)" => Some(CfPosition::Inner0),
        "(0/1)" => Some(CfPosition::Inner1),
        "(0/1/2)" => Some(CfPosition::Inner2),
        "(0/1/2/3)" => Some(CfPosition::Inner3),
        "(4/5/0)" => Some(CfPosition::Inner4),
        "(5/0)" => Some(CfPosition::Inner5),
        "(4.0/1-4.4/5)" => Some(CfPosition::Outer4Parent),
        "(4.5/0)" => Some(CfPosition::LemniscateStage5),
        _ => None,
    }
}
