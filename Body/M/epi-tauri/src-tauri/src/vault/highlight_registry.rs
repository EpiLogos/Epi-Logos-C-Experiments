use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

use crate::error::AppError;

pub type HighlightCategoryId = String;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HighlightCategory {
    pub id: HighlightCategoryId,
    pub display_name: String,
    pub default_color: String,
    pub description: String,
    pub envelope_template: EnvelopeTemplate,
    pub output_target: OutputTarget,
    pub is_custom: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum EnvelopeTemplate {
    Inline { inline_kind: String },
    OracleCall,
    DreamAnalysis,
    DailyNoteAppend { section: String },
    EntryCreate { template: String },
    AnimaInvocation { skill: String },
    AletheiaCrystallise,
    Custom { handler: String },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "target", rename_all = "snake_case")]
pub enum OutputTarget {
    InlineRewrite,
    DailyNoteSection { p: u8 },
    OracleLog,
    DreamLog,
    EntryFolder,
    Inbox,
    External { channel: String },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Highlight {
    pub id: String,
    pub category: HighlightCategoryId,
    pub from: u32,
    pub to: u32,
    pub original_text: String,
    pub label: Option<String>,
    pub color: Option<String>,
    pub timestamp: u64,
    pub provenance: HighlightProvenance,
    pub run_id: Option<String>,
    pub result_path: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HighlightProvenance {
    pub flow_version: u32,
    pub session_id: Option<String>,
    pub day_now_path: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HighlightRegistry {
    categories: HashMap<HighlightCategoryId, HighlightCategory>,
}

impl HighlightRegistry {
    pub fn new() -> Self {
        let mut reg = Self {
            categories: HashMap::new(),
        };
        for cat in canonical_categories() {
            reg.categories.insert(cat.id.clone(), cat);
        }
        reg
    }

    pub fn load_custom(custom_path: &PathBuf) -> Result<Self, AppError> {
        let mut reg = Self::new();
        if custom_path.exists() {
            let data = std::fs::read_to_string(custom_path)?;
            let custom: Vec<HighlightCategory> = serde_json::from_str(&data)
                .map_err(|e| AppError::Config(format!("highlight registry: {e}")))?;
            for mut cat in custom {
                cat.is_custom = true;
                reg.categories.insert(cat.id.clone(), cat);
            }
        }
        Ok(reg)
    }

    pub fn get(&self, id: &str) -> Option<&HighlightCategory> {
        self.categories.get(id)
    }

    pub fn list(&self) -> Vec<&HighlightCategory> {
        self.categories.values().collect()
    }

    pub fn register_custom(&mut self, mut cat: HighlightCategory) -> Result<(), AppError> {
        if !cat.id.starts_with("custom:") {
            return Err(AppError::Config(
                "custom category id must start with 'custom:'".into(),
            ));
        }
        cat.is_custom = true;
        self.categories.insert(cat.id.clone(), cat);
        Ok(())
    }

    pub fn remove_custom(&mut self, id: &str) -> Result<(), AppError> {
        match self.categories.get(id) {
            Some(cat) if cat.is_custom => {
                self.categories.remove(id);
                Ok(())
            }
            Some(_) => Err(AppError::Config("cannot remove canonical category".into())),
            None => Err(AppError::NotFound(format!("category '{id}' not found"))),
        }
    }

    pub fn save_custom(&self, path: &PathBuf) -> Result<(), AppError> {
        let custom: Vec<&HighlightCategory> =
            self.categories.values().filter(|c| c.is_custom).collect();
        let json = serde_json::to_string_pretty(&custom)?;
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, json)?;
        Ok(())
    }
}

fn canonical_categories() -> Vec<HighlightCategory> {
    vec![
        HighlightCategory {
            id: "daily-note".into(),
            display_name: "Daily Note".into(),
            default_color: "#10b981".into(),
            description: "Belongs in the day's daily-note quilt point".into(),
            envelope_template: EnvelopeTemplate::DailyNoteAppend {
                section: "quilt_points".into(),
            },
            output_target: OutputTarget::DailyNoteSection { p: 0 },
            is_custom: false,
        },
        HighlightCategory {
            id: "oracle".into(),
            display_name: "Oracle".into(),
            default_color: "#f59e0b".into(),
            description: "Wants oracle attention — computational lookup or relational analysis"
                .into(),
            envelope_template: EnvelopeTemplate::OracleCall,
            output_target: OutputTarget::OracleLog,
            is_custom: false,
        },
        HighlightCategory {
            id: "dream".into(),
            display_name: "Dream".into(),
            default_color: "#8b5cf6".into(),
            description: "Dream material — surfaces in the Dream Journal panel".into(),
            envelope_template: EnvelopeTemplate::DreamAnalysis,
            output_target: OutputTarget::DreamLog,
            is_custom: false,
        },
        HighlightCategory {
            id: "expand".into(),
            display_name: "Expand".into(),
            default_color: "#06b6d4".into(),
            description: "Wants expansion — anima rewrite/elaboration".into(),
            envelope_template: EnvelopeTemplate::Inline {
                inline_kind: "expand".into(),
            },
            output_target: OutputTarget::InlineRewrite,
            is_custom: false,
        },
        HighlightCategory {
            id: "pattern".into(),
            display_name: "Pattern".into(),
            default_color: "#ec4899".into(),
            description: "Crystallisation candidate — pattern across material".into(),
            envelope_template: EnvelopeTemplate::AletheiaCrystallise,
            output_target: OutputTarget::EntryFolder,
            is_custom: false,
        },
        HighlightCategory {
            id: "question".into(),
            display_name: "Question".into(),
            default_color: "#ef4444".into(),
            description: "Open question — wants clarification or investigation".into(),
            envelope_template: EnvelopeTemplate::AnimaInvocation {
                skill: "investigate".into(),
            },
            output_target: OutputTarget::Inbox,
            is_custom: false,
        },
        HighlightCategory {
            id: "insight".into(),
            display_name: "Insight".into(),
            default_color: "#fbbf24".into(),
            description: "Something worth keeping as standalone insight".into(),
            envelope_template: EnvelopeTemplate::EntryCreate {
                template: "insight".into(),
            },
            output_target: OutputTarget::EntryFolder,
            is_custom: false,
        },
        HighlightCategory {
            id: "task".into(),
            display_name: "Task".into(),
            default_color: "#3b82f6".into(),
            description: "Actionable — belongs in the daily-note task index".into(),
            envelope_template: EnvelopeTemplate::DailyNoteAppend {
                section: "p1_tasks_defined".into(),
            },
            output_target: OutputTarget::DailyNoteSection { p: 1 },
            is_custom: false,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_categories_loaded() {
        let reg = HighlightRegistry::new();
        assert_eq!(reg.list().len(), 8);
        assert!(reg.get("daily-note").is_some());
        assert!(reg.get("oracle").is_some());
        assert!(reg.get("task").is_some());
    }

    #[test]
    fn custom_category_crud() {
        let mut reg = HighlightRegistry::new();
        let cat = HighlightCategory {
            id: "custom:test".into(),
            display_name: "Test".into(),
            default_color: "#000000".into(),
            description: "test".into(),
            envelope_template: EnvelopeTemplate::Inline {
                inline_kind: "test".into(),
            },
            output_target: OutputTarget::Inbox,
            is_custom: false,
        };
        reg.register_custom(cat).unwrap();
        assert_eq!(reg.list().len(), 9);
        assert!(reg.get("custom:test").unwrap().is_custom);
        reg.remove_custom("custom:test").unwrap();
        assert_eq!(reg.list().len(), 8);
    }

    #[test]
    fn cannot_remove_canonical() {
        let mut reg = HighlightRegistry::new();
        assert!(reg.remove_custom("oracle").is_err());
    }

    #[test]
    fn custom_id_must_have_prefix() {
        let mut reg = HighlightRegistry::new();
        let cat = HighlightCategory {
            id: "bad-id".into(),
            display_name: "Bad".into(),
            default_color: "#000".into(),
            description: "".into(),
            envelope_template: EnvelopeTemplate::OracleCall,
            output_target: OutputTarget::Inbox,
            is_custom: false,
        };
        assert!(reg.register_custom(cat).is_err());
    }
}
