use std::fs;
use std::path::Path;

/// Read PASU.md and extract a frontmatter field value
fn read_pasu_field(vault_root: &Path, field: &str) -> Option<String> {
    let pasu_path = vault_root.join("Pratibimba/Self/PASU.md");
    let content = fs::read_to_string(&pasu_path).ok()?;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with(&format!("{field}:")) {
            let val = trimmed
                .strip_prefix(&format!("{field}:"))
                .unwrap_or("")
                .trim()
                .trim_matches('"');
            if val.is_empty() {
                return None;
            }
            return Some(val.to_string());
        }
    }
    None
}

pub fn kairos_status(vault_root: &Path) -> Result<String, String> {
    let birth_date = read_pasu_field(vault_root, "c_0_birth_date");
    let birth_location = read_pasu_field(vault_root, "c_0_birth_location");
    let chart_path_field = read_pasu_field(vault_root, "c_0_natal_chart_path");

    // Check if chart file exists
    let chart_exists = chart_path_field
        .as_ref()
        .map(|p| vault_root.join(p).exists())
        .unwrap_or(false);

    if chart_exists {
        let chart_path = chart_path_field.as_deref().unwrap_or("");
        let chart_content = fs::read_to_string(vault_root.join(chart_path))
            .unwrap_or_default();
        // Parse planet_valid from chart JSON
        let planet_valid = chart_content
            .find("\"planet_valid\":")
            .and_then(|i| {
                let rest = &chart_content[i + 15..];
                let end = rest.find(|c: char| !c.is_ascii_digit()).unwrap_or(rest.len());
                rest[..end].trim().parse::<u8>().ok()
            })
            .unwrap_or(0);
        Ok(format!(
            "mode: natal\nplanet_valid: {:#04x}\nchart_path: {chart_path}",
            planet_valid
        ))
    } else if birth_date.is_some() && birth_location.is_some() {
        // Birth data available but no chart computed yet
        Ok(format!(
            "mode: stub\nplanet_valid: 0x00\nbirth_date: {}\nbirth_location: {}\nhint: run `epi vault kairos fetch` to compute chart",
            birth_date.unwrap(),
            birth_location.unwrap()
        ))
    } else {
        Ok("mode: stub\nplanet_valid: 0x00\nno birth data in PASU.md".to_string())
    }
}

pub fn kairos_fetch(vault_root: &Path, force: bool) -> Result<String, String> {
    let birth_date = read_pasu_field(vault_root, "c_0_birth_date")
        .ok_or("c_0_birth_date not set in PASU.md — run `epi vault pasu set birth-date`")?;
    let birth_location = read_pasu_field(vault_root, "c_0_birth_location")
        .ok_or("c_0_birth_location not set in PASU.md — run `epi vault pasu set birth-location`")?;
    let chart_path = read_pasu_field(vault_root, "c_0_natal_chart_path")
        .unwrap_or_else(|| "Pratibimba/Self/natal-chart.json".to_string());

    let full_chart_path = vault_root.join(&chart_path);
    if full_chart_path.exists() && !force {
        return Ok(format!("chart already exists at {chart_path} — use --force to recompute"));
    }

    // Invoke kerykeion via Python
    let py_script = format!(
        r#"
import json, sys
try:
    from kerykeion import AstrologicalSubject
    parts = "{birth_date}".split("-")
    year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
    subject = AstrologicalSubject("User", year, month, day, 12, 0, "{birth_location}")
    result = {{
        "sun_degree": round(subject.sun.abs_pos * 2, 2),
        "moon_degree": round(subject.moon.abs_pos * 2, 2),
        "planet_degrees": [round(p.abs_pos * 2, 2) for p in [subject.sun, subject.moon, subject.mercury, subject.venus, subject.mars, subject.jupiter, subject.saturn]],
        "planet_valid": 127
    }}
    print(json.dumps(result))
except ImportError:
    print("ERROR: kerykeion not installed — run: pip3 install kerykeion", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {{e}}", file=sys.stderr)
    sys.exit(1)
"#
    );

    let output = std::process::Command::new("python3")
        .args(["-c", &py_script])
        .output()
        .map_err(|e| format!("failed to invoke python3: {e}"))?;

    if !output.status.success() {
        return Err(format!(
            "python3 failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();

    // Write chart JSON
    if let Some(parent) = full_chart_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create {}: {e}", parent.display()))?;
    }
    fs::write(&full_chart_path, &stdout)
        .map_err(|e| format!("failed to write {}: {e}", full_chart_path.display()))?;

    Ok(format!("chart written to {chart_path}\n{stdout}"))
}

pub fn kairos_show(vault_root: &Path) -> Result<String, String> {
    let chart_path = read_pasu_field(vault_root, "c_0_natal_chart_path")
        .unwrap_or_else(|| "Pratibimba/Self/natal-chart.json".to_string());
    let full_path = vault_root.join(&chart_path);
    fs::read_to_string(&full_path)
        .map_err(|_| format!("no chart at {} — run `epi vault kairos fetch`", full_path.display()))
}
