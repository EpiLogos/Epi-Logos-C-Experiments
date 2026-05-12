use crate::agent::{extensions, plugins, AgentLayout};
use crate::gate::parity;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PiLaunchMode {
    InteractiveInherit,
    CapturedPrompt,
    IsolatedVerify,
}

#[derive(Debug, Clone)]
pub struct PiLaunchPlan {
    pub launch_mode: PiLaunchMode,
    pub capture_output: bool,
    pub agent_id: String,
    pub role: Option<String>,
    pub args: Vec<String>,
    pub repo_root: PathBuf,
    pub agent_dir: PathBuf,
    pub prompts_dir: PathBuf,
    pub plugin_runtime_path: PathBuf,
    pub epi_home: PathBuf,
    pub gate_state_root: PathBuf,
    pub gateway_port: u16,
    pub gateway_url: String,
    pub codex_home: PathBuf,
    pub skill_roots: Vec<PathBuf>,
    pub runtime_root: Option<PathBuf>,
    pub working_dir: Option<PathBuf>,
    pub home_override: Option<PathBuf>,
}

#[derive(Debug, Clone)]
struct PreparedLayout {
    layout: AgentLayout,
    skill_roots: Vec<PathBuf>,
}

pub fn plan_spawn(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<PiLaunchPlan, String> {
    let prepared = prepare_layout(agent, plugin_dirs)?;
    validate_role(&prepared.layout.agent_id, role)?;
    let mut args = base_pi_args(&prepared.layout, &prepared.skill_roots);
    if let Some(prompt) = prompt {
        args.push(prompt.to_owned());
    }
    Ok(plan_from_prepared(
        &prepared,
        PiLaunchMode::InteractiveInherit,
        false,
        role,
        prepared.layout.agent_dir.clone(),
        args,
    ))
}

pub fn plan_chat(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<PiLaunchPlan, String> {
    plan_spawn(agent, role, plugin_dirs, prompt)
}

pub fn plan_prompt(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<PiLaunchPlan, String> {
    let prepared = prepare_layout(agent, plugin_dirs)?;
    validate_role(&prepared.layout.agent_id, role)?;
    let mut args = vec!["-p".to_owned()];
    args.extend(base_pi_args(&prepared.layout, &prepared.skill_roots));
    if let Some(prompt) = prompt {
        args.push(prompt.to_owned());
    }
    Ok(plan_from_prepared(
        &prepared,
        PiLaunchMode::CapturedPrompt,
        true,
        role,
        prepared.layout.agent_dir.clone(),
        args,
    ))
}

pub fn plan_attach(agent: Option<&str>, session_id: &str) -> Result<PiLaunchPlan, String> {
    let prepared = prepare_layout(agent, &[])?;
    let layout = &prepared.layout;
    let mut args = vec!["--session".to_owned(), session_id.to_owned()];
    args.extend(base_pi_args(layout, &prepared.skill_roots));

    Ok(plan_from_prepared(
        &prepared,
        PiLaunchMode::InteractiveInherit,
        false,
        None,
        layout.agent_dir.clone(),
        args,
    ))
}

pub fn plan_run(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[PathBuf],
    args: &[String],
) -> Result<PiLaunchPlan, String> {
    let prepared = prepare_layout(agent, plugin_dirs)?;
    validate_role(&prepared.layout.agent_id, role)?;
    let mut pi_args = base_pi_args(&prepared.layout, &prepared.skill_roots);
    pi_args.extend(args.iter().cloned());
    Ok(plan_from_prepared(
        &prepared,
        PiLaunchMode::InteractiveInherit,
        false,
        role,
        prepared.layout.agent_dir.clone(),
        pi_args,
    ))
}

pub fn plan_verify_runtime(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<PiLaunchPlan, String> {
    let prepared = prepare_isolated_layout(agent, plugin_dirs)?;
    validate_role(&prepared.layout.agent_id, role)?;
    let layout = &prepared.layout;
    let runtime_root = layout
        .epi_home
        .parent()
        .ok_or_else(|| "unable to resolve isolated runtime root".to_owned())?
        .to_path_buf();
    let home_path = runtime_root.join("home");
    let cwd = runtime_root.join("cwd");
    fs::create_dir_all(&home_path).map_err(|err| err.to_string())?;
    fs::create_dir_all(&cwd).map_err(|err| err.to_string())?;

    let mut args = vec!["-p".to_owned()];
    args.extend(base_pi_args(layout, &prepared.skill_roots));
    args.extend(minimal_verification_args());
    args.push(
        prompt
            .unwrap_or("Reply with a single line confirming runtime verification.")
            .to_owned(),
    );

    let mut plan = plan_from_prepared(
        &prepared,
        PiLaunchMode::IsolatedVerify,
        true,
        role,
        layout.agent_dir.clone(),
        args,
    );
    plan.runtime_root = Some(runtime_root);
    plan.working_dir = Some(cwd);
    plan.home_override = Some(home_path);
    Ok(plan)
}

fn prepare_layout(agent: Option<&str>, plugin_dirs: &[PathBuf]) -> Result<PreparedLayout, String> {
    let layout = AgentLayout::resolve(agent)?;
    prepare_layout_from_resolved(layout, plugin_dirs)
}

fn prepare_isolated_layout(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
) -> Result<PreparedLayout, String> {
    let repo_root = AgentLayout::resolve(agent)?.repo_root;
    let runtime_root = repo_root
        .join(".tmp-real-pi-verify")
        .join(unique_runtime_suffix("runtime"));
    let epi_home = runtime_root.join(".epi");
    let layout = AgentLayout::resolve_for_epi_home(agent, epi_home)?;
    prepare_layout_from_resolved(layout, plugin_dirs)
}

fn prepare_layout_from_resolved(
    layout: AgentLayout,
    plugin_dirs: &[PathBuf],
) -> Result<PreparedLayout, String> {
    extensions::sync_layout(&layout)?;
    let runtime_plugin_dirs =
        plugins::resolve_runtime_plugin_dirs(&layout.repo_root, &layout.agent_id, plugin_dirs)?;
    plugins::prepare_runtime(&layout, &runtime_plugin_dirs)?;
    let skill_roots = collect_skill_roots(&layout, &runtime_plugin_dirs);
    Ok(PreparedLayout {
        layout,
        skill_roots,
    })
}

fn plan_from_prepared(
    prepared: &PreparedLayout,
    launch_mode: PiLaunchMode,
    capture_output: bool,
    role: Option<&str>,
    agent_dir: PathBuf,
    args: Vec<String>,
) -> PiLaunchPlan {
    let gateway_port = gateway_port_from_env();
    PiLaunchPlan {
        launch_mode,
        capture_output,
        agent_id: prepared.layout.agent_id.clone(),
        role: role.map(str::to_owned),
        args,
        repo_root: prepared.layout.repo_root.clone(),
        agent_dir,
        prompts_dir: prepared.layout.prompts_dir.clone(),
        plugin_runtime_path: prepared.layout.plugin_runtime_path.clone(),
        epi_home: prepared.layout.epi_home.clone(),
        gate_state_root: prepared.layout.gate_state_root.clone(),
        gateway_port,
        gateway_url: format!("ws://127.0.0.1:{gateway_port}"),
        codex_home: prepared.layout.codex_home.clone(),
        skill_roots: prepared.skill_roots.clone(),
        runtime_root: None,
        working_dir: None,
        home_override: None,
    }
}

fn validate_role(agent_id: &str, role: Option<&str>) -> Result<(), String> {
    let Some(role) = role else {
        return Ok(());
    };
    let allowed = match agent_id {
        "anima" | "main" => &[
            "anima",
            "nous",
            "logos",
            "eros",
            "mythos",
            "psyche",
            "sophia",
            "techne-helper",
        ][..],
        "aletheia" => &[
            "aletheia",
            "agora",
            "anansi",
            "janus",
            "mercurius",
            "moirai",
            "zeithoven",
        ][..],
        "epii" => &[
            "epii",
            "mef-diagnostician",
            "pi-writing-cartographer",
            "ql-cartographer",
        ][..],
        _ => &[][..],
    };

    if allowed.contains(&role) {
        Ok(())
    } else {
        Err(format!(
            "unknown role `{role}` for agent `{agent_id}`; run `epi agent roster list`"
        ))
    }
}

fn base_pi_args(layout: &AgentLayout, skill_roots: &[PathBuf]) -> Vec<String> {
    let mut args = vec![
        "--no-extensions".to_owned(),
        "--extension".to_owned(),
        layout.composite_entry_path.display().to_string(),
        "--extension".to_owned(),
        layout
            .extensions_dir
            .join("epi-citta.ts")
            .display()
            .to_string(),
        "--system-prompt".to_owned(),
        layout
            .prompts_dir
            .join("epi-system.md")
            .display()
            .to_string(),
        "--no-skills".to_owned(),
    ];
    for root in skill_roots {
        args.push("--skill".to_owned());
        args.push(root.display().to_string());
    }
    args
}

fn minimal_verification_args() -> Vec<String> {
    vec!["--no-prompt-templates".to_owned(), "--no-themes".to_owned()]
}

fn unique_runtime_suffix(prefix: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    format!("{prefix}-{}-{nanos}", std::process::id())
}

fn collect_skill_roots(layout: &AgentLayout, runtime_plugin_dirs: &[PathBuf]) -> Vec<PathBuf> {
    let mut roots = layout.repo_skill_roots();
    for plugin_dir in runtime_plugin_dirs {
        let skills_dir = plugin_dir.join("skills");
        if skills_dir.exists() {
            roots.push(skills_dir);
        }
    }
    roots
}

pub fn gateway_port_from_env() -> u16 {
    std::env::var("EPI_AGENT_GATEWAY_PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(parity::DEFAULT_GATEWAY_PORT)
}
