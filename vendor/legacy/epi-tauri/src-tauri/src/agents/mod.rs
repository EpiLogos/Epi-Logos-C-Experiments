use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize)]
pub struct AgentDescriptor {
    pub name: String,
    pub coordinate: String,
    pub description: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvocationEnvelope {
    pub kind: String,
    pub modality: String,
    pub session_key: String,
    pub payload: serde_json::Value,
    pub day_now: Option<serde_json::Value>,
    pub coordinate: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AgentRunHandle {
    pub run_id: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AgentRunEvent {
    pub run_id: String,
    pub event_type: String,
    pub data: serde_json::Value,
    pub timestamp: u64,
}

pub struct AgentRegistry {
    descriptors: Vec<AgentDescriptor>,
    runs: Mutex<HashMap<String, AgentRunHandle>>,
}

impl AgentRegistry {
    pub fn new() -> Self {
        let descriptors = vec![
            AgentDescriptor {
                name: "epii-synthesizer".to_string(),
                coordinate: "M5-4".to_string(),
                description: "Epii synthesis agent — processes Notion pipeline payloads through MEF lenses".to_string(),
                capabilities: vec!["notion_pipeline".to_string(), "mef_analysis".to_string(), "graph_write".to_string()],
            },
            AgentDescriptor {
                name: "atelier-excavator".to_string(),
                coordinate: "M5-5".to_string(),
                description: "Atelier word excavation agent — etymological analysis and constellation formation".to_string(),
                capabilities: vec!["word_analysis".to_string(), "constellation_formation".to_string()],
            },
            AgentDescriptor {
                name: "siva-pedagogy".to_string(),
                coordinate: "M5-1".to_string(),
                description: "Pedagogical agent — guides user through coordinate system understanding".to_string(),
                capabilities: vec!["pedagogy".to_string(), "coordinate_navigation".to_string()],
            },
            AgentDescriptor {
                name: "shakti-oracle".to_string(),
                coordinate: "M5-2".to_string(),
                description: "Oracle agent — interprets tarot and I-Ching casts through the clock state".to_string(),
                capabilities: vec!["oracle_interpretation".to_string(), "clock_correlation".to_string()],
            },
        ];

        Self {
            descriptors,
            runs: Mutex::new(HashMap::new()),
        }
    }

    pub fn list(&self) -> Vec<AgentDescriptor> {
        self.descriptors.clone()
    }

    pub fn invoke(&self, _envelope: InvocationEnvelope) -> AgentRunHandle {
        let run_id = format!("run-{}", uuid_v4_stub());
        let handle = AgentRunHandle {
            run_id: run_id.clone(),
            status: "running".to_string(),
        };
        self.runs.lock().unwrap().insert(run_id, handle.clone());
        handle
    }

    pub fn run_state(&self, run_id: &str) -> Option<AgentRunHandle> {
        self.runs.lock().unwrap().get(run_id).cloned()
    }

    pub fn abort(&self, run_id: &str) -> bool {
        let mut runs = self.runs.lock().unwrap();
        if let Some(handle) = runs.get_mut(run_id) {
            handle.status = "aborted".to_string();
            true
        } else {
            false
        }
    }
}

fn uuid_v4_stub() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("{:x}-{:x}", nanos, nanos >> 32)
}
