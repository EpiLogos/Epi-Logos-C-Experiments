use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use super::metadata::TunableValue;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum Actor {
    User,
    AnamnesisProposer,
    AletheiaDriftDetection,
    UserRollback,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TripletVerdict {
    pub narratrix_articulation: String,
    pub ebm_energy_delta: f32,
    pub verifier_questions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AuditEntry {
    pub timestamp: String,
    pub knob_key: String,
    pub from_value: TunableValue,
    pub to_value: TunableValue,
    pub actor: Actor,
    pub tier: u8,
    pub risk_class: String,
    #[serde(default)]
    pub proposing_evidence: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub triplet_verdict: Option<TripletVerdict>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_disposition: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_disposition_evidence_handle: Option<String>,
    pub rollback_handle: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kairos_snapshot: Option<JsonValue>,
}

pub struct AuditWriter {
    audit_dir: PathBuf,
}

impl AuditWriter {
    pub fn new(audit_dir: PathBuf) -> Self {
        let _ = std::fs::create_dir_all(&audit_dir);
        Self { audit_dir }
    }

    pub fn append(&self, entry: &AuditEntry) -> std::io::Result<()> {
        std::fs::create_dir_all(&self.audit_dir)?;
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.path_for_knob(&entry.knob_key))?;
        let line = serde_json::to_string(entry)
            .map_err(|err| std::io::Error::new(std::io::ErrorKind::InvalidData, err))?;
        writeln!(file, "{line}")?;
        Ok(())
    }

    pub fn read(&self, knob_key: &str) -> std::io::Result<Vec<AuditEntry>> {
        let path = self.path_for_knob(knob_key);
        if !path.exists() {
            return Ok(Vec::new());
        }

        let file = std::fs::File::open(path)?;
        let reader = BufReader::new(file);
        let mut entries = Vec::new();
        for line in reader.lines() {
            let line = line?;
            if line.trim().is_empty() {
                continue;
            }
            let entry = serde_json::from_str(&line)
                .map_err(|err| std::io::Error::new(std::io::ErrorKind::InvalidData, err))?;
            entries.push(entry);
        }
        Ok(entries)
    }

    fn path_for_knob(&self, knob_key: &str) -> PathBuf {
        let safe = knob_key.replace('/', "_");
        self.audit_dir.join(format!("{safe}.jsonl"))
    }
}
