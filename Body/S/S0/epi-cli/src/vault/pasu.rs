use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

const PASU_RELATIVE: &str = "Pratibimba/Self/PASU.md";

/// Minimal handle-only PASU.md scaffold written when the identity wizard (25.4)
/// establishes a PASU from an empty vault. Mirrors the canonical frontmatter
/// shape (coordinate `PASU`, CT0 seed, empty editable scalars + arrays); the
/// wizard fills each scalar via `pasu_set_key`. No derived/quintessence keys —
/// those are computed downstream, never authored here.
const PASU_SCAFFOLD: &str = "---\ncoordinate: \"PASU\"\nc_4_artifact_role: \"pasu\"\nc_1_ct_type: \"CT0\"\nc_0_birth_date: \"\"\nc_0_birth_location: \"\"\nc_0_natal_chart_path: \"\"\nc_0_source_coordinates: []\nc_4_atlas_sync_consents: []\nc_3_session_history: []\n---\n\n# PASU — Non-Dual Agent-User Field\n\n> The non-dual space where agent and user are not two.\n";

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

/// The atlas-sync consent array key in PASU.md frontmatter (`PASU.md:9`).
/// Consent records are appended here, never through the six-scalar setter.
const PASU_CONSENTS_KEY: &str = "c_4_atlas_sync_consents";

/// A ConsentRecord — the port of the frozen M4' Nara contract shape
/// (`Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts:106`, LAW).
/// Field names match the frozen camelCase surface so the carrier, the gateway
/// RPC, and this frontmatter array agree byte-for-byte. Persisted as one item
/// of the `c_4_atlas_sync_consents` array in PASU.md.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsentRecord {
    pub subject_handle: String,
    pub action: ConsentAction,
    pub consented: bool,
    pub consented_at: String,
    pub scope: ConsentScope,
    pub pressure_free: bool,
    pub inspectable: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revoked_at: Option<String>,
}

/// The three consent actions the frozen contract enumerates (nara-surface.ts:108).
/// Dotted string values; an unknown action fails deserialization (typed guard).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConsentAction {
    #[serde(rename = "nara.voice-corpus.include")]
    VoiceCorpusInclude,
    #[serde(rename = "nara.graphiti.body.inspect")]
    GraphitiBodyInspect,
    #[serde(rename = "nara.shared-archetype.publish")]
    SharedArchetypePublish,
}

/// The three consent scopes the frozen contract enumerates (nara-surface.ts:111).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ConsentScope {
    SingleArtifact,
    SingleDay,
    AdapterCorpus,
}

/// Well-formedness gate for an appended ConsentRecord. The action/scope enums
/// are already validated by serde deserialization; this enforces the remaining
/// non-empty invariants. It is the substrate half of the carrier port of
/// `evaluateVoiceCorpusAdmission` (nara-surface.ts:412) — the append accepts any
/// *well-formed* record (including a `consented:false` withdrawal); admissibility
/// is a downstream read via [`consent_admits_voice_corpus`], never a write gate.
pub fn validate_consent_record(record: &ConsentRecord) -> Result<(), String> {
    if record.subject_handle.trim().is_empty() {
        return Err("consent.subjectHandle is required".to_owned());
    }
    if record.consented_at.trim().is_empty() {
        return Err("consent.consentedAt is required (ISO-8601 timestamp)".to_owned());
    }
    if let Some(revoked) = &record.revoked_at {
        if revoked.trim().is_empty() {
            return Err(
                "consent.revokedAt, when present, must be a non-empty timestamp".to_owned(),
            );
        }
    }
    Ok(())
}

/// Mirror of `evaluateVoiceCorpusAdmission`'s per-record admissibility predicate
/// (nara-surface.ts:412-420): a voice-corpus admission requires a pressure-free,
/// inspectable, un-revoked, affirmative `nara.voice-corpus.include` consent.
pub fn consent_admits_voice_corpus(record: &ConsentRecord) -> bool {
    record.action == ConsentAction::VoiceCorpusInclude
        && record.consented
        && record.pressure_free
        && record.inspectable
        && record.revoked_at.is_none()
}

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
    /// Atlas-sync consent ledger (25.T25.14). Appended by
    /// `nara.pasu.consents.append` (DR-WC-M4-4), never by the six-scalar setter.
    /// Handle-only: each record carries opaque `subjectHandle` strings, no body.
    #[serde(default)]
    pub c_4_atlas_sync_consents: Vec<ConsentRecord>,
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
        c_4_atlas_sync_consents: read_consents(&content),
    }
}

/// Read the atlas-sync consent ledger from PASU.md frontmatter. Parses the
/// frontmatter block as YAML and deserializes `c_4_atlas_sync_consents` into
/// typed [`ConsentRecord`]s. A malformed or absent array resolves to empty
/// (the surface renders "no consents yet"); this read never rewrites the file.
fn read_consents(content: &str) -> Vec<ConsentRecord> {
    let Some(block) = frontmatter_block(content) else {
        return Vec::new();
    };
    let map: serde_yaml::Value = match serde_yaml::from_str(&block) {
        Ok(value) => value,
        Err(_) => return Vec::new(),
    };
    map.get(PASU_CONSENTS_KEY)
        .and_then(|seq| serde_yaml::from_value::<Vec<ConsentRecord>>(seq.clone()).ok())
        .unwrap_or_default()
}

/// Canonical write path for the `nara.pasu.consents.append` gateway RPC
/// (DR-WC-M4-4, 25.T25.14): validate a [`ConsentRecord`] and append it to the
/// `c_4_atlas_sync_consents` array in PASU.md, returning the full updated
/// ledger. This is the array-append sibling of the six-scalar [`pasu_set_key`];
/// it never touches the scalar keys and preserves their frontmatter lines
/// byte-for-byte (only the consent block is rewritten). The Architect approved
/// this dedicated write-surface rather than overloading the scalar setter, whose
/// `{key,value}` shape cannot carry a typed record array.
pub fn pasu_append_consent(
    vault_root: &Path,
    consent: ConsentRecord,
) -> Result<Vec<ConsentRecord>, String> {
    validate_consent_record(&consent)?;
    let path = pasu_path(vault_root);
    if !path.exists() {
        return Err(format!("PASU.md not found at {}", path.display()));
    }
    let content = fs::read_to_string(&path).map_err(|e| format!("failed to read PASU.md: {e}"))?;
    let mut consents = read_consents(&content);
    consents.push(consent);
    let updated = set_frontmatter_consents(&content, &consents)?;
    fs::write(&path, &updated).map_err(|e| format!("failed to write PASU.md: {e}"))?;
    Ok(consents)
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
    // First-run: scaffold a minimal handle-only PASU.md so the identity wizard
    // (25.4) can establish a new PASU from an empty vault; otherwise read the
    // existing record and patch the one key.
    let content = if path.exists() {
        fs::read_to_string(&path).map_err(|e| format!("failed to read PASU.md: {e}"))?
    } else {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("failed to create PASU directory: {e}"))?;
        }
        PASU_SCAFFOLD.to_string()
    };
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

/// Extract the raw YAML text between the first two `---` fences, or `None` when
/// there is no frontmatter block.
fn frontmatter_block(content: &str) -> Option<String> {
    let lines: Vec<&str> = content.lines().collect();
    let mut start: Option<usize> = None;
    for (i, line) in lines.iter().enumerate() {
        if *line == "---" {
            match start {
                None => start = Some(i),
                Some(s) => return Some(lines[s + 1..i].join("\n")),
            }
        }
    }
    None
}

/// Serialize the consent ledger into a YAML block for `c_4_atlas_sync_consents`
/// and splice it into the frontmatter, replacing ONLY that key's value/block and
/// leaving every other line byte-identical (so the six scalar keys keep their
/// exact quoting). An empty ledger collapses to the inline `[]` form.
fn set_frontmatter_consents(content: &str, consents: &[ConsentRecord]) -> Result<String, String> {
    let block = if consents.is_empty() {
        format!("{PASU_CONSENTS_KEY}: []")
    } else {
        let seq = serde_yaml::to_string(consents)
            .map_err(|e| format!("failed to serialize consents: {e}"))?;
        // `seq` is a top-level YAML sequence ("- key: val\n  key2: val2\n…");
        // indent every line two spaces so it nests under the key.
        let indented = seq
            .lines()
            .map(|line| format!("  {line}"))
            .collect::<Vec<_>>()
            .join("\n");
        format!("{PASU_CONSENTS_KEY}:\n{indented}")
    };
    replace_frontmatter_key_block(content, PASU_CONSENTS_KEY, &block)
}

/// Replace a single frontmatter key's value/block with `block`, preserving all
/// other lines exactly. The key's extent is its line plus any following
/// whitespace-indented continuation lines (block-style values). When the key is
/// absent the block is inserted before the closing `---`.
fn replace_frontmatter_key_block(content: &str, key: &str, block: &str) -> Result<String, String> {
    let lines: Vec<&str> = content.lines().collect();
    let mut fm_start: Option<usize> = None;
    let mut fm_end: Option<usize> = None;
    for (i, line) in lines.iter().enumerate() {
        if *line == "---" {
            match fm_start {
                None => fm_start = Some(i),
                Some(_) => {
                    fm_end = Some(i);
                    break;
                }
            }
        }
    }
    let (start, end) = match (fm_start, fm_end) {
        (Some(s), Some(e)) => (s, e),
        _ => return Err("PASU.md has no frontmatter block".to_owned()),
    };

    let key_prefix = format!("{key}:");
    let key_line = (start + 1..end).find(|&i| lines[i].starts_with(&key_prefix));

    let mut out: Vec<String> = Vec::new();
    match key_line {
        Some(k) => {
            // Consume the key line plus any whitespace-indented continuation
            // lines (the old block-style value), stopping at the next top-level
            // key or the closing fence.
            let mut tail = k + 1;
            while tail < end && lines[tail].starts_with(char::is_whitespace) {
                tail += 1;
            }
            out.extend(lines[..k].iter().map(|s| s.to_string()));
            out.extend(block.lines().map(|s| s.to_string()));
            out.extend(lines[tail..].iter().map(|s| s.to_string()));
        }
        None => {
            out.extend(lines[..end].iter().map(|s| s.to_string()));
            out.extend(block.lines().map(|s| s.to_string()));
            out.extend(lines[end..].iter().map(|s| s.to_string()));
        }
    }

    let mut result = out.join("\n");
    if content.ends_with('\n') && !result.ends_with('\n') {
        result.push('\n');
    }
    Ok(result)
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
    fn pasu_set_key_scaffolds_pasu_from_an_empty_vault_and_round_trips() {
        let tmp = std::env::temp_dir().join(format!("pasu-scaffold-{}", std::process::id()));
        // A truly empty vault — no PASU.md, no Self directory (first-run wizard).
        assert!(!pasu_path(&tmp).exists());

        // The wizard sets each editable scalar via nara.pasu.set → pasu_set_key.
        assert!(pasu_set_key(&tmp, "c_0_birth_date", "1991-02-03").is_ok());
        assert!(pasu_path(&tmp).exists()); // scaffolded on the first write
        assert!(pasu_set_key(&tmp, "c_2_jungian", "INTP").is_ok());
        assert!(pasu_set_key(&tmp, "c_4_human_design", "Projector 1/3").is_ok());

        // …and every value reads back through the handle-only record.
        let record = pasu_record(&tmp);
        assert_eq!(record.c_0_birth_date, "1991-02-03");
        assert_eq!(record.c_2_jungian, "INTP");
        assert_eq!(record.c_4_human_design, "Projector 1/3");

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

    fn sample_consent() -> ConsentRecord {
        ConsentRecord {
            subject_handle: "nara://voice/adapter-corpus".to_owned(),
            action: ConsentAction::VoiceCorpusInclude,
            consented: true,
            consented_at: "2026-07-22T09:00:00.000Z".to_owned(),
            scope: ConsentScope::AdapterCorpus,
            pressure_free: true,
            inspectable: true,
            revoked_at: None,
        }
    }

    #[test]
    fn consent_record_serde_matches_frozen_camelcase_contract() {
        let json = serde_json::to_string(&sample_consent()).unwrap();
        // Frozen field + enum-value names (nara-surface.ts:106-115) — LAW.
        assert!(json.contains("\"subjectHandle\""));
        assert!(json.contains("\"consentedAt\""));
        assert!(json.contains("\"pressureFree\""));
        assert!(json.contains("\"nara.voice-corpus.include\""));
        assert!(json.contains("\"adapter-corpus\""));
        // Absent revocation must NOT serialize a null.
        assert!(!json.contains("revokedAt"));
        // Unknown action string is rejected by the typed guard.
        let bad = r#"{"subjectHandle":"x","action":"nara.bogus","consented":true,"consentedAt":"t","scope":"single-day","pressureFree":true,"inspectable":true}"#;
        assert!(serde_json::from_str::<ConsentRecord>(bad).is_err());
    }

    #[test]
    fn validate_consent_record_requires_non_empty_handle_and_timestamp() {
        assert!(validate_consent_record(&sample_consent()).is_ok());
        let mut empty_handle = sample_consent();
        empty_handle.subject_handle = "  ".to_owned();
        assert!(validate_consent_record(&empty_handle).is_err());
        let mut empty_at = sample_consent();
        empty_at.consented_at = String::new();
        assert!(validate_consent_record(&empty_at).is_err());
    }

    #[test]
    fn consent_admits_voice_corpus_mirrors_frozen_predicate() {
        assert!(consent_admits_voice_corpus(&sample_consent()));
        let mut revoked = sample_consent();
        revoked.revoked_at = Some("2026-07-23T00:00:00Z".to_owned());
        assert!(!consent_admits_voice_corpus(&revoked));
        let mut pressured = sample_consent();
        pressured.pressure_free = false;
        assert!(!consent_admits_voice_corpus(&pressured));
        let mut other_action = sample_consent();
        other_action.action = ConsentAction::SharedArchetypePublish;
        assert!(!consent_admits_voice_corpus(&other_action));
    }

    #[test]
    fn pasu_append_consent_array_appends_and_preserves_scalar_keys() {
        let tmp = std::env::temp_dir().join(format!("pasu-consent-{}", std::process::id()));
        let self_dir = tmp.join("Pratibimba").join("Self");
        fs::create_dir_all(&self_dir).unwrap();
        fs::write(
            self_dir.join("PASU.md"),
            "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"1990-06-15\"\n\
             c_4_atlas_sync_consents: []\n---\n\n# PASU\n\nbody stays.\n",
        )
        .unwrap();

        // First append: [] → one record.
        let after_one = pasu_append_consent(&tmp, sample_consent()).unwrap();
        assert_eq!(after_one.len(), 1);

        // Second append: array-append semantics (grows, keeps the first).
        let mut second = sample_consent();
        second.action = ConsentAction::GraphitiBodyInspect;
        second.scope = ConsentScope::SingleDay;
        let after_two = pasu_append_consent(&tmp, second).unwrap();
        assert_eq!(after_two.len(), 2);
        assert_eq!(after_two[0], sample_consent());
        assert_eq!(after_two[1].action, ConsentAction::GraphitiBodyInspect);

        // The read-back record agrees, AND the scalar key survived byte-intact.
        let record = pasu_record(&tmp);
        assert_eq!(record.c_4_atlas_sync_consents.len(), 2);
        assert_eq!(record.c_0_birth_date, "1990-06-15");
        // The markdown body below the frontmatter is untouched.
        let raw = fs::read_to_string(self_dir.join("PASU.md")).unwrap();
        assert!(raw.contains("body stays."));

        fs::remove_dir_all(&tmp).ok();
    }
}
