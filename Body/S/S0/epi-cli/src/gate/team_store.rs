use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TeamRecord {
    pub team_id: String,
    pub parent_session_key: String,
    pub strategy: String,
    #[serde(default)]
    pub label: Option<String>,
    pub task: String,
    pub status: String,
    pub cmux_workspace: String,
    #[serde(default)]
    pub cmux_surface: Option<String>,
    #[serde(default)]
    pub members: Vec<TeamMemberRecord>,
    #[serde(default)]
    pub created_at_ms: u128,
    #[serde(default)]
    pub updated_at_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TeamMemberRecord {
    pub session_key: String,
    pub agent_id: String,
    pub role: String,
    pub status: String,
    #[serde(default)]
    pub worker_index: Option<u32>,
    #[serde(default)]
    pub cmux_pane_id: Option<String>,
}

pub struct TeamStore {
    gate_root: PathBuf,
}

impl TeamStore {
    pub fn new(gate_root: impl AsRef<Path>) -> Result<Self, String> {
        let gate_root = gate_root.as_ref().to_path_buf();
        fs::create_dir_all(gate_root.join("teams")).map_err(|err| err.to_string())?;
        Ok(Self { gate_root })
    }

    pub fn create(&self, record: TeamRecord) -> Result<TeamRecord, String> {
        self.save_record(&record)
    }

    pub fn save_record(&self, record: &TeamRecord) -> Result<TeamRecord, String> {
        let mut record = record.clone();
        let now = now_ms()?;
        if record.created_at_ms == 0 {
            record.created_at_ms = now;
        }
        record.updated_at_ms = now;

        let path = self.team_path(&record.team_id);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        let payload = serde_json::to_string_pretty(&record).map_err(|err| err.to_string())?;
        fs::write(path, payload).map_err(|err| err.to_string())?;
        Ok(record)
    }

    pub fn resolve(&self, team_id: &str) -> Result<TeamRecord, String> {
        let path = self.team_path(team_id);
        let payload = fs::read_to_string(path).map_err(|err| err.to_string())?;
        serde_json::from_str(&payload).map_err(|err| err.to_string())
    }

    pub fn list(&self) -> Result<Vec<TeamRecord>, String> {
        let mut records = Vec::new();
        for entry in fs::read_dir(self.gate_root.join("teams")).map_err(|err| err.to_string())? {
            let entry = entry.map_err(|err| err.to_string())?;
            let payload = fs::read_to_string(entry.path()).map_err(|err| err.to_string())?;
            let record: TeamRecord =
                serde_json::from_str(&payload).map_err(|err| err.to_string())?;
            records.push(record);
        }
        records.sort_by(|left, right| left.team_id.cmp(&right.team_id));
        Ok(records)
    }

    pub fn stop(&self, team_id: &str) -> Result<TeamRecord, String> {
        let mut record = self.resolve(team_id)?;
        record.status = "stopped".to_owned();
        self.save_record(&record)
    }

    pub fn team_path(&self, team_id: &str) -> PathBuf {
        self.gate_root.join("teams").join(format!("{team_id}.json"))
    }
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
