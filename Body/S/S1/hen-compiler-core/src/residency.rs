use std::path::PathBuf;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct HenTimestamp {
    pub year: i32,
    pub month: u8,
    pub day: u8,
    pub hour: u8,
    pub minute: u8,
    pub second: u8,
}

impl HenTimestamp {
    pub const fn new(year: i32, month: u8, day: u8, hour: u8, minute: u8, second: u8) -> Self {
        Self {
            year,
            month,
            day,
            hour,
            minute,
            second,
        }
    }

    pub fn canonical_day_id(self) -> String {
        format!("{:02}-{:02}-{:04}", self.day, self.month, self.year)
    }

    pub fn vendor_day_id(self) -> String {
        format!("{:04}-{:02}-{:02}", self.year, self.month, self.day)
    }
}
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CompilerResidencyPlan {
    pub source_path: PathBuf,
    pub compiled_path: PathBuf,
    pub vendor_source_alias: PathBuf,
    pub vendor_knowledge_alias: PathBuf,
    pub thought_lane: String,
    pub day_id: String,
    pub artifact_slug: String,
}
pub fn resolve_compiler_residency(
    vault_root: PathBuf,
    compiler_root: PathBuf,
    now: HenTimestamp,
    thought_lane: String,
    artifact_slug: String,
) -> Result<CompilerResidencyPlan, String> {
    if !matches!(
        thought_lane.as_str(),
        "T0" | "T1" | "T2" | "T3" | "T4" | "T5"
    ) {
        return Err("thought_lane must be T0 through T5".to_owned());
    }
    if artifact_slug.is_empty() {
        return Err("artifact_slug must be non-empty".to_owned());
    }

    let day_id = now.canonical_day_id();
    let source_path = vault_root
        .join("Empty")
        .join("Present")
        .join(&day_id)
        .join("daily-note.md");
    let compiled_path = vault_root
        .join("Pratibimba")
        .join("Self")
        .join("Thought")
        .join("T")
        .join(&thought_lane)
        .join(format!("{artifact_slug}.md"));
    let vendor_source_alias = compiler_root
        .join("daily")
        .join(format!("{}.md", now.vendor_day_id()));
    let vendor_knowledge_alias = compiler_root
        .join("knowledge")
        .join("concepts")
        .join(format!("{artifact_slug}.md"));

    Ok(CompilerResidencyPlan {
        source_path,
        compiled_path,
        vendor_source_alias,
        vendor_knowledge_alias,
        thought_lane,
        day_id,
        artifact_slug,
    })
}
