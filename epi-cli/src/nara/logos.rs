use serde::Serialize;
use std::path::PathBuf;

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
