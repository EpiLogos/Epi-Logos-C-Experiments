/// VAK Evaluation — assigns 6-layer coordinates to a task
/// CPF / CT / CP / CF / CFP / CS
///
/// Heuristic keyword-based evaluator for CLI use. The canonical LLM-driven
/// evaluation is done by the VAK eval skill in anima/S4'/skills/vak-evaluate/.
/// This provides a deterministic baseline that all tests verify against.

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct VakCoordinates {
    pub cpf: Option<String>, // Category-Position-Frame
    pub ct: Option<String>,  // Context-Time
    pub cp: Option<String>,  // Context-Position
    pub cf: Option<String>,  // Context-Frame
    pub cfp: Option<String>, // Context-Frame-Position
    pub cs: Option<String>,  // Context-System
    pub rationale: Option<String>,
}

/// Heuristic VAK evaluation — keyword-based baseline.
/// The PI skill (vak-evaluate SKILL.md) provides the full LLM-driven evaluation.
pub fn evaluate_vak(task: &str) -> VakCoordinates {
    let task_lower = task.to_lowercase();

    // CF assignment heuristics
    let cf = if task_lower.contains("overview")
        || task_lower.contains("architecture")
        || task_lower.contains("design")
    {
        "(4/5/0)" // Psyche — session subject
    } else if task_lower.contains("question")
        || task_lower.contains("what")
        || task_lower.contains("why")
    {
        "(0/1)" // Logos — binary/formal
    } else if task_lower.contains("test")
        || task_lower.contains("debug")
        || task_lower.contains("fix")
    {
        "(0/1/2)" // Eros — dialectical synthesis
    } else if task_lower.contains("pattern")
        || task_lower.contains("refactor")
        || task_lower.contains("structure")
    {
        "(0/1/2/3)" // Mythos — narrative/pattern
    } else if task_lower.contains("review")
        || task_lower.contains("reflect")
        || task_lower.contains("summarize")
    {
        "(5/0)" // Sophia — Möbius review
    } else {
        "(4/5/0)" // Default to Psyche
    };

    // CFP (thread type) heuristics
    let cfp = if task_lower.contains("parallel") || task_lower.contains("multiple") {
        "CFP1" // P-Thread: parallel dispatch
    } else if task_lower.contains("chain")
        || task_lower.contains("sequential")
        || task_lower.contains("step")
    {
        "CFP2" // C-Thread: sequential pipeline
    } else if task_lower.contains("background")
        || task_lower.contains("async")
        || task_lower.contains("long")
    {
        "CFP4" // L-Thread: background subagent
    } else {
        "CFP0" // Base Thread: direct single-agent
    };

    VakCoordinates {
        cpf: Some("C2".to_string()),
        ct: Some("CT4b".to_string()),
        cp: Some("CP4".to_string()),
        cf: Some(cf.to_string()),
        cfp: Some(cfp.to_string()),
        cs: Some("Day".to_string()),
        rationale: Some(format!(
            "heuristic: task keywords matched cf={cf} cfp={cfp}"
        )),
    }
}

/// Map CF code to constitutional agent name
pub fn cf_to_agent(cf: &str) -> &'static str {
    match cf {
        "(0/1)" => "logos",
        "(0/1/2)" => "eros",
        "(0/1/2/3)" => "mythos",
        "(4.0/1-4.4/5)" => "anima",
        "(4/5/0)" => "psyche",
        "(5/0)" => "sophia",
        "(00/00)" => "nous",
        _ => "psyche",
    }
}
