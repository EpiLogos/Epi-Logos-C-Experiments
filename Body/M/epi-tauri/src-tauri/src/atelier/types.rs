use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AtelierWord {
    pub id: String,
    pub word: String,
    pub pie_root: Option<String>,
    pub definition: Option<String>,
    pub register: Option<WordRegister>,
    pub confidence: Option<Confidence>,
    pub cited_source: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AtelierConstellation {
    pub id: String,
    pub constellation_id: String,
    pub name: String,
    pub fold: u8,
    pub description: Option<String>,
    pub words: Vec<ConstellationMember>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConstellationMember {
    pub word_id: String,
    pub word: String,
    pub ordinal: u8,
    pub ql_position: u8,
    pub essence: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AtelierAphorism {
    pub id: String,
    pub aphorism_id: String,
    pub text: String,
    pub constellation_id: Option<String>,
    pub bimba_resonances: Vec<String>,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WordRegister {
    Constitutional,
    Situational,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Confidence {
    Certain,
    Probable,
    Speculative,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AtelierSession {
    pub session_id: String,
    pub user_id_hash: String,
    pub started_at: u64,
    pub words_explored: Vec<String>,
    pub constellations_formed: Vec<String>,
    pub aphorisms_crystallised: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WordPatternEdge {
    pub from_word: String,
    pub to_word: String,
    pub constellation_id: Option<String>,
    pub register: WordRegister,
    pub confidence: Confidence,
    pub cited_source: Option<String>,
}
