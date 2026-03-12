use crate::core::knowing::{
    self, render,
    DossierMode,
};

pub fn dispatch(
    coordinate: &str,
    project: Option<&str>,
    limit: usize,
    refresh: bool,
    quick: bool,
    json: bool,
) -> Result<String, String> {
    let (family, position, inverted) = parse_family_coordinate(coordinate)
        .ok_or_else(|| format!("unsupported epii knowing coordinate: {coordinate}"))?;
    let mut dossier = knowing::build_family_dossier_with_mode(
        family,
        position,
        inverted,
        project,
        limit,
        if quick {
            DossierMode::Quick
        } else {
            DossierMode::Full
        },
    );
    if let Some(q_summary) = load_q_metadata_summary(coordinate)? {
        let existing = dossier.latest_snapshot.text.take().unwrap_or_default();
        dossier.latest_snapshot.text = Some(if existing.is_empty() {
            q_summary
        } else {
            format!("{existing}\n{q_summary}")
        });
    }
    if refresh {
        knowing::persist_dossier_snapshot(&dossier, project).map_err(|err| err.to_string())?;
    }
    if json {
        render::render_json(&dossier).map_err(|err| err.to_string())
    } else {
        Ok(render::render_text(&dossier))
    }
}

fn parse_family_coordinate(coordinate: &str) -> Option<(u8, u8, bool)> {
    let mut chars = coordinate.chars();
    let family = chars.next()?.to_ascii_uppercase();
    let family_idx = match family {
        'C' => 0,
        'P' => 1,
        'L' => 2,
        'S' => 3,
        'T' => 4,
        'M' => 5,
        _ => return None,
    };
    let rest = chars.as_str();
    let inverted = rest.ends_with('\'');
    let digits = rest.trim_end_matches('\'');
    let position = digits.parse::<u8>().ok()?;
    if position > 5 {
        return None;
    }
    Some((family_idx, position, inverted))
}

fn load_q_metadata_summary(coordinate: &str) -> Result<Option<String>, String> {
    let vault_root = match std::env::var("EPILOGOS_VAULT") {
        Ok(path) => std::path::PathBuf::from(path),
        Err(_) => return Ok(None),
    };
    let note = find_note_with_coordinate(&vault_root, coordinate)?;
    let Some(note) = note else {
        return Ok(None);
    };

    let content = std::fs::read_to_string(&note).map_err(|err| err.to_string())?;
    let Some(frontmatter) = crate::graph::parse_yaml_frontmatter(&content) else {
        return Ok(None);
    };

    let mut lines = Vec::new();
    for (key, label) in [
        ("q_essence", "Q essence"),
        ("q_correspondence", "Q correspondence"),
        ("q_vimarsa_field", "Q vimarsa field"),
        ("q_relational_field", "Q relational field"),
        ("q_notebook_pulse", "Q notebook pulse"),
        ("q_latest_snapshot", "Q latest snapshot"),
    ] {
        if let Some(value) = frontmatter.get(key).and_then(|value| value.as_str()) {
            if !value.trim().is_empty() {
                lines.push(format!("{label}: {value}"));
            }
        }
    }

    if lines.is_empty() {
        Ok(None)
    } else {
        Ok(Some(lines.join("\n")))
    }
}

fn find_note_with_coordinate(
    dir: &std::path::Path,
    coordinate: &str,
) -> Result<Option<std::path::PathBuf>, String> {
    if !dir.exists() {
        return Ok(None);
    }

    for entry in std::fs::read_dir(dir).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            if let Some(found) = find_note_with_coordinate(&path, coordinate)? {
                return Ok(Some(found));
            }
            continue;
        }
        if path.extension().and_then(|ext| ext.to_str()) != Some("md") {
            continue;
        }
        let content = match std::fs::read_to_string(&path) {
            Ok(content) => content,
            Err(_) => continue,
        };
        let Some(frontmatter) = crate::graph::parse_yaml_frontmatter(&content) else {
            continue;
        };
        if frontmatter
            .get("coordinate")
            .and_then(|value| value.as_str())
            == Some(coordinate)
        {
            return Ok(Some(path));
        }
    }

    Ok(None)
}
