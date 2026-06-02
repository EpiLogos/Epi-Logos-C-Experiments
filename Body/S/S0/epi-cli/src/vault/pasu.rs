use std::fs;
use std::path::{Path, PathBuf};

const PASU_RELATIVE: &str = "Pratibimba/Self/PASU.md";

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

fn field_to_key(field: &str) -> Result<String, String> {
    match field {
        "birth-date" => Ok("c_0_birth_date".to_string()),
        "birth-location" => Ok("c_0_birth_location".to_string()),
        "natal-chart-path" => Ok("c_0_natal_chart_path".to_string()),
        _ => Err(format!(
            "unknown PASU field '{field}'. Valid: birth-date, birth-location, natal-chart-path"
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
}
