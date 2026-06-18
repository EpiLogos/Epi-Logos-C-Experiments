use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

const PASU_RELATIVE: &str = "Pratibimba/Self/PASU.md";

/// Frontmatter keys the Tranche 25.4 PASU identity wizard is allowed to write,
/// in step order (birth-date → birth-location → natal-chart-path → jungian →
/// gene-keys → human-design). These are the ONLY keys `nara.pasu.set` may mutate
/// — the canonical write path the wizard routes through (DR-WC-M4-3). Note
/// `c_0_natal_chart_path` is a **path string**: the raw natal-chart body never
/// lives in PASU.md frontmatter, so the record is handle-only by construction.
pub const PASU_EDITABLE_KEYS: [&str; 6] = [
    "c_0_birth_date",
    "c_0_birth_location",
    "c_0_natal_chart_path",
    "c_2_jungian",
    "c_3_gene_keys",
    "c_4_human_design",
];

/// Derived, read-only PASU keys. They are surfaced by `nara.pasu.show`/25.5 but
/// MUST NOT be written by the wizard — they are computed (oracle charges → unit
/// quaternion → clock position → BLAKE3) elsewhere. `pasu_set_key` rejects them.
pub const PASU_DERIVED_KEYS: [&str; 2] = ["c_5_quintessence_hash", "c_5_quintessence_clock"];

/// Typed PASU profile returned by the `nara.pasu.show` gateway RPC. Every field
/// is **handle-only**: `c_0_natal_chart_path` carries the path string to the
/// natal-chart JSON, never its contents. The derived `c_5_*` fields are
/// read-only reflections of the quintessence computation. Empty strings denote
/// unset frontmatter values (the wizard renders these as incomplete steps).
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct PasuRecord {
    #[serde(default)]
    pub c_0_birth_date: String,
    #[serde(default)]
    pub c_0_birth_location: String,
    /// Path string only — the raw natal-chart body stays local and never
    /// transits this record (protected-local handle-only invariant).
    #[serde(default)]
    pub c_0_natal_chart_path: String,
    #[serde(default)]
    pub c_2_jungian: String,
    #[serde(default)]
    pub c_3_gene_keys: String,
    #[serde(default)]
    pub c_4_human_design: String,
    /// Derived, read-only (25.5 surfaces it; the wizard never edits it).
    #[serde(default)]
    pub c_5_quintessence_hash: String,
    /// Derived, read-only.
    #[serde(default)]
    pub c_5_quintessence_clock: String,
}

impl PasuRecord {
    /// Completion ratio (0.0–1.0) over the six wizard-editable fields. Drives
    /// the `M4PasuWizardBadge` badge-mode percentage.
    pub fn completion_ratio(&self) -> f32 {
        let filled = self
            .editable_values()
            .iter()
            .filter(|value| !value.trim().is_empty())
            .count();
        filled as f32 / PASU_EDITABLE_KEYS.len() as f32
    }

    fn editable_values(&self) -> [&str; 6] {
        [
            &self.c_0_birth_date,
            &self.c_0_birth_location,
            &self.c_0_natal_chart_path,
            &self.c_2_jungian,
            &self.c_3_gene_keys,
            &self.c_4_human_design,
        ]
    }
}

pub fn pasu_path(vault_root: &Path) -> PathBuf {
    vault_root.join(PASU_RELATIVE)
}

pub fn pasu_show(vault_root: &Path) -> Result<String, String> {
    let path = pasu_path(vault_root);
    if !path.exists() {
        return Err(format!("PASU.md not found at {}", path.display()));
    }
    fs::read_to_string(&path).map_err(|e| format!("failed to read PASU.md: {e}"))
}

pub fn pasu_get(vault_root: &Path, field: &str) -> Result<String, String> {
    let key = field_to_key(field)?;
    let content = pasu_show(vault_root)?;
    extract_frontmatter_value(&content, &key)
        .ok_or_else(|| format!("key '{key}' not found in PASU.md frontmatter"))
}

/// Set a PASU.md frontmatter field via direct `fs::write`.
///
/// **IOD-19 / ADR-05-010 boundary note:** This is a **deprecated-local**
/// frontmatter mutation. The replacement is `s1'.vault.update_frontmatter`
/// (see `crate::gate::s1_hen` module docstring line 24 — DEFERRED until Hen
/// exposes the surface). PASU.md mutation is scoped to the user's own
/// `Pratibimba/Self/PASU.md` and carries no inbound wikilink risk, but it
/// still touches frontmatter and should ultimately route through Hen for
/// frontmatter-shape governance per ADR-05-010 §2 (capability 2). Until
/// then this helper stays direct-FS, used only by the local
/// `epi vault pasu set` operator command.
pub fn pasu_set(vault_root: &Path, field: &str, value: &str) -> Result<String, String> {
    let key = field_to_key(field)?;
    let path = pasu_path(vault_root);
    if !path.exists() {
        return Err(format!("PASU.md not found at {}", path.display()));
    }

    let content = fs::read_to_string(&path).map_err(|e| format!("failed to read PASU.md: {e}"))?;

    let updated = set_frontmatter_value(&content, &key, value);
    fs::write(&path, &updated).map_err(|e| format!("failed to write PASU.md: {e}"))?;

    Ok(format!("set {key} = \"{value}\""))
}

/// Read the full PASU profile as a typed [`PasuRecord`]. Missing frontmatter
/// values (and an entirely absent PASU.md) resolve to empty strings rather than
/// errors, so the wizard can render a partially-complete or never-started
/// profile uniformly. The record is handle-only: the natal-chart raw body is
/// never read here — only its `c_0_natal_chart_path` string.
pub fn pasu_record(vault_root: &Path) -> PasuRecord {
    let content = pasu_show(vault_root).unwrap_or_default();
    let field = |key: &str| extract_frontmatter_value(&content, key).unwrap_or_default();
    PasuRecord {
        c_0_birth_date: field("c_0_birth_date"),
        c_0_birth_location: field("c_0_birth_location"),
        c_0_natal_chart_path: field("c_0_natal_chart_path"),
        c_2_jungian: field("c_2_jungian"),
        c_3_gene_keys: field("c_3_gene_keys"),
        c_4_human_design: field("c_4_human_design"),
        c_5_quintessence_hash: field("c_5_quintessence_hash"),
        c_5_quintessence_clock: field("c_5_quintessence_clock"),
    }
}

/// Canonical write path for the `nara.pasu.set` gateway RPC (DR-WC-M4-3): set a
/// PASU frontmatter value **by its full key** (e.g. `c_2_jungian`). Only the six
/// [`PASU_EDITABLE_KEYS`] are accepted; the derived [`PASU_DERIVED_KEYS`] are
/// read-only and rejected, as is any unknown key. This is the keyed sibling of
/// the kebab-slug operator command [`pasu_set`]; the wizard never shells out to
/// `epi vault pasu set` — it routes `{key, value}` through here.
pub fn pasu_set_key(vault_root: &Path, key: &str, value: &str) -> Result<String, String> {
    if PASU_DERIVED_KEYS.contains(&key) {
        return Err(format!(
            "PASU key '{key}' is derived and read-only; it cannot be set via nara.pasu.set"
        ));
    }
    if !PASU_EDITABLE_KEYS.contains(&key) {
        return Err(format!(
            "unknown PASU key '{key}'. Valid: {}",
            PASU_EDITABLE_KEYS.join(", ")
        ));
    }
    let path = pasu_path(vault_root);
    if !path.exists() {
        return Err(format!("PASU.md not found at {}", path.display()));
    }
    let content = fs::read_to_string(&path).map_err(|e| format!("failed to read PASU.md: {e}"))?;
    let updated = set_frontmatter_value(&content, key, value);
    fs::write(&path, &updated).map_err(|e| format!("failed to write PASU.md: {e}"))?;
    Ok(format!("set {key} = \"{value}\""))
}

fn field_to_key(field: &str) -> Result<String, String> {
    match field {
        "birth-date" => Ok("c_0_birth_date".to_string()),
        "birth-location" => Ok("c_0_birth_location".to_string()),
        "natal-chart-path" => Ok("c_0_natal_chart_path".to_string()),
        "jungian" => Ok("c_2_jungian".to_string()),
        "gene-keys" => Ok("c_3_gene_keys".to_string()),
        "human-design" => Ok("c_4_human_design".to_string()),
        _ => Err(format!(
            "unknown PASU field '{field}'. Valid: birth-date, birth-location, \
             natal-chart-path, jungian, gene-keys, human-design"
        )),
    }
}

fn extract_frontmatter_value(content: &str, key: &str) -> Option<String> {
    let lines: Vec<&str> = content.lines().collect();
    let mut in_frontmatter = false;
    for line in &lines {
        if *line == "---" {
            if in_frontmatter {
                return None; // End of frontmatter, key not found
            }
            in_frontmatter = true;
            continue;
        }
        if in_frontmatter {
            if let Some(rest) = line.strip_prefix(&format!("{key}:")) {
                let val = rest.trim().trim_matches('"');
                return Some(val.to_string());
            }
        }
    }
    None
}

fn set_frontmatter_value(content: &str, key: &str, value: &str) -> String {
    let mut lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();
    let mut in_frontmatter = false;
    let mut found = false;
    for line in &mut lines {
        if line.as_str() == "---" {
            if in_frontmatter {
                break; // End of frontmatter
            }
            in_frontmatter = true;
            continue;
        }
        if in_frontmatter && line.starts_with(&format!("{key}:")) {
            *line = format!("{key}: \"{value}\"");
            found = true;
            break;
        }
    }
    if !found {
        // Insert before the closing ---
        let mut in_fm = false;
        for i in 0..lines.len() {
            if lines[i] == "---" {
                if in_fm {
                    lines.insert(i, format!("{key}: \"{value}\""));
                    break;
                }
                in_fm = true;
            }
        }
    }
    lines.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn field_to_key_maps_correctly() {
        assert_eq!(field_to_key("birth-date").unwrap(), "c_0_birth_date");
        assert_eq!(
            field_to_key("birth-location").unwrap(),
            "c_0_birth_location"
        );
        assert_eq!(
            field_to_key("natal-chart-path").unwrap(),
            "c_0_natal_chart_path"
        );
        assert!(field_to_key("unknown").is_err());
    }

    #[test]
    fn extract_and_set_frontmatter() {
        let content = "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"\"\n---\n\n# PASU\n";
        assert_eq!(
            extract_frontmatter_value(content, "c_0_birth_date"),
            Some("".to_string())
        );

        let updated = set_frontmatter_value(content, "c_0_birth_date", "1990-06-15");
        assert!(updated.contains("c_0_birth_date: \"1990-06-15\""));
        assert_eq!(
            extract_frontmatter_value(&updated, "c_0_birth_date"),
            Some("1990-06-15".to_string())
        );
    }

    #[test]
    fn field_to_key_maps_wizard_identity_fields() {
        assert_eq!(field_to_key("jungian").unwrap(), "c_2_jungian");
        assert_eq!(field_to_key("gene-keys").unwrap(), "c_3_gene_keys");
        assert_eq!(field_to_key("human-design").unwrap(), "c_4_human_design");
    }

    #[test]
    fn pasu_set_key_rejects_derived_and_unknown_keys() {
        let tmp = std::env::temp_dir().join(format!("pasu-set-key-{}", std::process::id()));
        let self_dir = tmp.join("Pratibimba").join("Self");
        fs::create_dir_all(&self_dir).unwrap();
        fs::write(
            self_dir.join("PASU.md"),
            "---\ncoordinate: \"PASU\"\nc_2_jungian: \"\"\n---\n\n# PASU\n",
        )
        .unwrap();

        // Editable key writes through.
        assert!(pasu_set_key(&tmp, "c_2_jungian", "INFJ").is_ok());
        assert_eq!(pasu_record(&tmp).c_2_jungian, "INFJ");

        // Derived keys are read-only.
        assert!(pasu_set_key(&tmp, "c_5_quintessence_hash", "deadbeef").is_err());
        // Unknown keys are rejected.
        assert!(pasu_set_key(&tmp, "c_9_made_up", "x").is_err());

        fs::remove_dir_all(&tmp).ok();
    }

    #[test]
    fn pasu_record_is_handle_only_and_reports_completion() {
        let tmp = std::env::temp_dir().join(format!("pasu-record-{}", std::process::id()));
        let self_dir = tmp.join("Pratibimba").join("Self");
        fs::create_dir_all(&self_dir).unwrap();
        fs::write(
            self_dir.join("PASU.md"),
            "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"1990-06-15\"\n\
             c_0_natal_chart_path: \"Pratibimba/Self/natal.json\"\n\
             c_5_quintessence_hash: \"abc123\"\n---\n\n# PASU\n",
        )
        .unwrap();

        let record = pasu_record(&tmp);
        assert_eq!(record.c_0_birth_date, "1990-06-15");
        // Path string only — never the chart body.
        assert_eq!(record.c_0_natal_chart_path, "Pratibimba/Self/natal.json");
        assert_eq!(record.c_5_quintessence_hash, "abc123");
        // 2 of 6 editable fields filled (birth-date + natal-chart-path).
        assert!((record.completion_ratio() - 2.0 / 6.0).abs() < f32::EPSILON);

        fs::remove_dir_all(&tmp).ok();
    }
}
