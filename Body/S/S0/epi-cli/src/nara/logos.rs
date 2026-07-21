use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize)]
pub struct LogosStage {
    pub index: u8,
    pub name: &'static str,
    pub input_sources: &'static str,
    pub task: &'static str,
    pub output_contract: &'static str,
}

pub static LOGOS_STAGES: [LogosStage; 6] = [
    LogosStage {
        index: 0,
        name: "A-Logos",
        input_sources: "raw daily note (unedited), all oracle draws for today",
        task: "Identify what is not yet spoken — the felt sense before words. \
               Do NOT interpret. Find pre-linguistic images or sensations.",
        output_contract: "1-3 pre-linguistic images/sensations (e.g. 'cloud', 'knot in chest')",
    },
    LogosStage {
        index: 1,
        name: "Pro-Logos",
        input_sources: "Stage 0 output, outer-stroke journal excerpts from today",
        task: "Find the theme wanting to emerge — not yet stated directly. \
               Produce one orienting question.",
        output_contract: "One orienting question (e.g. 'what is asking to be seen about control?')",
    },
    LogosStage {
        index: 2,
        name: "Dia-Logos",
        input_sources: "Stage 1 orienting question, active lens interpretations",
        task: "Run the question through the germane lens(es). Let the traditions speak. \
               Do not conclude — find where multiple lenses converge.",
        output_contract: "Convergences across 2+ lenses, tensions noted",
    },
    LogosStage {
        index: 3,
        name: "Logos",
        input_sources: "Stage 2 convergences",
        task: "State what has been metabolized and owned. \
               Use first-person statements about the person's actual experience.",
        output_contract: "1-3 clear integration statements",
    },
    LogosStage {
        index: 4,
        name: "Epi-Logos",
        input_sources: "Stage 3 + yesterday's Epi-Logos output (if exists)",
        task: "See this integration in the larger arc. What pattern recurs across days/weeks?",
        output_contract: "Pattern statement + trajectory (e.g. '3rd time this month...')",
    },
    LogosStage {
        index: 5,
        name: "An-a-Logos",
        input_sources: "Stage 4 output",
        task: "Release the integration back to groundlessness. The day completes, not concludes.",
        output_contract: "Closing statement + kairos coordinate. \
                          Triggers: pratibimba.record for this cycle.",
    },
];

fn logos_dir() -> PathBuf {
    super::identity::nara_home().join("logos")
}

/// epi nara logos status
pub fn status(json: bool) -> Result<String, String> {
    let dir = logos_dir();
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    let mut completed = Vec::new();
    for i in 0..6u8 {
        let path = dir.join(format!("{}-stage-{}.md", today, i));
        if path.exists() {
            completed.push(i);
        }
    }

    if json {
        Ok(serde_json::json!({
            "date": today,
            "completed_stages": completed,
            "total": 6,
            "next_stage": completed.last().map(|s| s + 1).unwrap_or(0),
        })
        .to_string())
    } else {
        let mut out = format!("Logos Cycle Status ({})\n", today);
        for stage in &LOGOS_STAGES {
            let done = completed.contains(&stage.index);
            let marker = if done { "+" } else { "o" };
            out.push_str(&format!("  {} [{}] {}\n", marker, stage.index, stage.name));
        }
        Ok(out)
    }
}

/// epi nara logos stage --stage N
pub fn stage(stage_idx: u8, date: Option<&str>, json: bool) -> Result<String, String> {
    if stage_idx > 5 {
        return Err("Stage must be 0-5".to_string());
    }

    let today_str = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let date_str = date.unwrap_or(&today_str);
    let path = logos_dir().join(format!("{}-stage-{}.md", date_str, stage_idx));

    if path.exists() {
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        if json {
            Ok(serde_json::json!({
                "stage": stage_idx,
                "name": LOGOS_STAGES[stage_idx as usize].name,
                "date": date_str,
                "content": content,
            })
            .to_string())
        } else {
            Ok(format!(
                "[{}] {} — {}\n\n{}",
                stage_idx, LOGOS_STAGES[stage_idx as usize].name, date_str, content
            ))
        }
    } else {
        Err(format!(
            "Stage {} not yet completed for {}",
            stage_idx, date_str
        ))
    }
}

/// epi nara logos run
pub fn run(date: Option<&str>, stage_override: Option<u8>, json: bool) -> Result<String, String> {
    let today_str = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let date_str = date.unwrap_or(&today_str);
    let dir = logos_dir();
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    // Determine which stage to run
    let start_stage = stage_override.unwrap_or_else(|| {
        for i in 0..6u8 {
            let path = dir.join(format!("{}-stage-{}.md", date_str, i));
            if !path.exists() {
                return i;
            }
        }
        6 // All done
    });

    if start_stage > 5 {
        return Ok("All 6 logos stages complete for today.".to_string());
    }

    let stage_def = &LOGOS_STAGES[start_stage as usize];

    // Write stage placeholder (agent pipeline dispatch deferred to Phase 6)
    let output = format!(
        "# {} (Stage {})\n\n**Input:** {}\n\n**Task:** {}\n\n**Output contract:** {}\n\n---\n\n*(Agent pipeline required for full synthesis)*\n",
        stage_def.name, stage_def.index, stage_def.input_sources, stage_def.task, stage_def.output_contract
    );

    let path = dir.join(format!("{}-stage-{}.md", date_str, start_stage));
    std::fs::write(&path, &output).map_err(|e| e.to_string())?;

    // Stage 5 auto-triggers pratibimba record
    if start_stage == 5 {
        eprintln!("Stage 5 complete — pratibimba.record triggered (deferred to Neo4j connection)");
    }

    if json {
        Ok(serde_json::json!({
            "stage": start_stage,
            "name": stage_def.name,
            "date": date_str,
            "path": path.display().to_string(),
        })
        .to_string())
    } else {
        Ok(format!(
            "Logos stage {} ({}) written to {}",
            start_stage,
            stage_def.name,
            path.display()
        ))
    }
}

/// The cursor position for a date's cycle: the sorted list of completed stage
/// indices and the next incomplete stage (6 when all six are complete).
fn cursor(dir: &Path, date: &str) -> (Vec<u8>, u8) {
    let mut completed = Vec::new();
    for i in 0..6u8 {
        if dir.join(format!("{}-stage-{}.md", date, i)).exists() {
            completed.push(i);
        }
    }
    let next = (0..6u8)
        .find(|i| !completed.contains(i))
        .unwrap_or(6);
    (completed, next)
}

/// Render one contemplative transition artifact for a logos stage. `stage_from`
/// / `stage_to` record the cursor movement (-1 = the pre-cycle ground); a
/// regression additionally carries the explicit `c_4_regression: true` flag so a
/// backward move is never mistaken for forward integration.
fn stage_artifact(stage_idx: u8, stage_from: i16, stage_to: i16, created: &str, regression: bool) -> String {
    let stage_def = &LOGOS_STAGES[stage_idx as usize];
    let mut front = format!(
        "---\nc_3_created_at: \"{}\"\nc_3_stage_from: {}\nc_3_stage_to: {}\nc_4_artifact_role: \"logos-transition\"\n",
        created, stage_from, stage_to
    );
    if regression {
        front.push_str("c_4_regression: true\n");
    }
    front.push_str("---\n\n");
    format!(
        "{}# {} (Stage {})\n\n**Input:** {}\n\n**Task:** {}\n\n**Output contract:** {}\n\n---\n\n*(Agent pipeline required for full synthesis)*\n",
        front, stage_def.name, stage_def.index, stage_def.input_sources, stage_def.task, stage_def.output_contract
    )
}

fn transition_json(date: &str, dir: &Path, transitioned: u8, direction: &str, regression: bool, artifact: &Path) -> String {
    let (completed, next) = cursor(dir, date);
    serde_json::json!({
        "date": date,
        "completed_stages": completed,
        "next_stage": next,
        "total": 6,
        "transitioned_stage": transitioned,
        "direction": direction,
        "regression": regression,
        "artifact_path": artifact.display().to_string(),
    })
    .to_string()
}

fn advance_in(dir: &Path, date: &str, created: &str, json: bool) -> Result<String, String> {
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let (_, next) = cursor(dir, date);
    if next > 5 {
        return Err(format!("All 6 logos stages already complete for {}.", date));
    }
    let stage_from = next as i16 - 1; // -1 = pre-cycle ground when entering stage 0
    let artifact = dir.join(format!("{}-stage-{}.md", date, next));
    std::fs::write(&artifact, stage_artifact(next, stage_from, next as i16, created, false))
        .map_err(|e| e.to_string())?;
    if json {
        Ok(transition_json(date, dir, next, "advance", false, &artifact))
    } else {
        Ok(format!(
            "Logos advanced to stage {} ({}) — {}",
            next,
            LOGOS_STAGES[next as usize].name,
            artifact.display()
        ))
    }
}

fn regress_in(dir: &Path, date: &str, created: &str, json: bool) -> Result<String, String> {
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let (completed, _) = cursor(dir, date);
    let Some(&last) = completed.last() else {
        return Err(format!("No completed logos stage to regress for {}.", date));
    };
    // Record the regression as its own contemplative artifact, then step the
    // cursor back by removing the highest completed stage file.
    let artifact = dir.join(format!("{}-regress-{}.md", date, last));
    std::fs::write(
        &artifact,
        stage_artifact(last, last as i16, last as i16 - 1, created, true),
    )
    .map_err(|e| e.to_string())?;
    std::fs::remove_file(dir.join(format!("{}-stage-{}.md", date, last)))
        .map_err(|e| e.to_string())?;
    if json {
        Ok(transition_json(date, dir, last, "regress", true, &artifact))
    } else {
        Ok(format!(
            "Logos regressed from stage {} ({}) — {}",
            last,
            LOGOS_STAGES[last as usize].name,
            artifact.display()
        ))
    }
}

/// epi nara logos advance — forward transition; writes the next stage as a
/// contemplative artifact carrying its `c_3_stage_from`/`c_3_stage_to`.
pub fn advance(date: Option<&str>, json: bool) -> Result<String, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let created = chrono::Utc::now().to_rfc3339();
    advance_in(&logos_dir(), date.unwrap_or(&today), &created, json)
}

/// epi nara logos regress — backward transition; writes a regression artifact
/// (`c_4_regression: true`) and steps the cursor back one stage.
pub fn regress(date: Option<&str>, json: bool) -> Result<String, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let created = chrono::Utc::now().to_rfc3339();
    regress_in(&logos_dir(), date.unwrap_or(&today), &created, json)
}

/// epi nara logos curriculum
pub fn curriculum(json: bool) -> Result<String, String> {
    if json {
        Ok(serde_json::json!({
            "curriculum": "derived from logos outputs + gene keys + torus position",
            "note": "requires agent pipeline for full derivation"
        })
        .to_string())
    } else {
        Ok(
            "Logos Curriculum\n  (Requires agent pipeline for full curriculum derivation)"
                .to_string(),
        )
    }
}

/// epi nara logos export
pub fn export(date: Option<&str>, yes: bool) -> Result<String, String> {
    if !yes {
        return Err("logos export requires explicit consent (--yes)".to_string());
    }
    let today_str = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let date_str = date.unwrap_or(&today_str);
    Ok(format!(
        "Logos export for {} — pratibimba.record triggered",
        date_str
    ))
}

/// epi nara logos weekly
pub fn weekly(json: bool) -> Result<String, String> {
    if json {
        Ok(serde_json::json!({
            "synthesis": "weekly logos cycle analysis",
            "note": "requires agent pipeline"
        })
        .to_string())
    } else {
        Ok("Logos Weekly Synthesis\n  (Requires agent pipeline for weekly analysis)".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const CREATED: &str = "2026-07-21T00:00:00Z";
    const DATE: &str = "2026-07-21";

    fn test_dir(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("epi-logos-test-{}-{}", tag, std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        dir
    }

    #[test]
    fn advance_cycles_through_six_stages_then_refuses() {
        let dir = test_dir("advance-cycle");
        for expected in 0..6u8 {
            let out = advance_in(&dir, DATE, CREATED, true).unwrap();
            let v: serde_json::Value = serde_json::from_str(&out).unwrap();
            assert_eq!(v["transitioned_stage"].as_u64().unwrap(), expected as u64);
            assert_eq!(v["direction"].as_str().unwrap(), "advance");
            assert!(!v["regression"].as_bool().unwrap());
            assert!(dir.join(format!("{}-stage-{}.md", DATE, expected)).exists());
        }
        assert_eq!(cursor(&dir, DATE).1, 6, "all six stages complete");
        // A seventh advance has nowhere to go and refuses.
        assert!(advance_in(&dir, DATE, CREATED, true).is_err());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn advance_artifact_carries_stage_from_to_and_never_the_regression_flag() {
        let dir = test_dir("advance-artifact");
        advance_in(&dir, DATE, CREATED, true).unwrap(); // stage 0
        advance_in(&dir, DATE, CREATED, true).unwrap(); // stage 1
        let stage0 = std::fs::read_to_string(dir.join(format!("{}-stage-0.md", DATE))).unwrap();
        assert!(stage0.contains("c_3_stage_from: -1"), "stage 0 comes from the pre-cycle ground");
        assert!(stage0.contains("c_3_stage_to: 0"));
        let stage1 = std::fs::read_to_string(dir.join(format!("{}-stage-1.md", DATE))).unwrap();
        assert!(stage1.contains("c_3_stage_from: 0"));
        assert!(stage1.contains("c_3_stage_to: 1"));
        assert!(!stage0.contains("c_4_regression"), "advance never writes the regression flag");
        assert!(!stage1.contains("c_4_regression"), "advance never writes the regression flag");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn regress_steps_the_cursor_back_and_writes_a_regression_artifact() {
        let dir = test_dir("regress");
        for _ in 0..3 {
            advance_in(&dir, DATE, CREATED, true).unwrap(); // stages 0, 1, 2
        }
        assert_eq!(cursor(&dir, DATE).1, 3);
        let out = regress_in(&dir, DATE, CREATED, true).unwrap();
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert_eq!(v["direction"].as_str().unwrap(), "regress");
        assert!(v["regression"].as_bool().unwrap());
        assert_eq!(v["transitioned_stage"].as_u64().unwrap(), 2);
        assert_eq!(v["next_stage"].as_u64().unwrap(), 2, "cursor stepped back to 2");
        assert!(!dir.join(format!("{}-stage-2.md", DATE)).exists(), "the top stage file is removed");
        let regressed = std::fs::read_to_string(dir.join(format!("{}-regress-2.md", DATE))).unwrap();
        assert!(regressed.contains("c_4_regression: true"), "regress writes the explicit flag");
        assert!(regressed.contains("c_3_stage_from: 2"));
        assert!(regressed.contains("c_3_stage_to: 1"));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn regress_with_no_completed_stage_refuses() {
        let dir = test_dir("regress-empty");
        assert!(regress_in(&dir, DATE, CREATED, true).is_err());
        let _ = std::fs::remove_dir_all(&dir);
    }
}
