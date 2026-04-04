mod common;

use common::{run_epi, TestEnv};
use epi_logos::agent::{
    canonical_pi_agent_dir, managed_epi_agent_dir, AgentLayout,
    runtime::{self, PiLaunchMode},
};

#[test]
fn spawn_plan_uses_native_pi_interactive_mode() {
    let env = TestEnv::repo_with_assets();
    let _guard = env.apply_to_process();

    let plan = runtime::plan_spawn(Some("anima"), &[], Some("hello"))
        .expect("spawn launch plan should resolve");

    assert_eq!(plan.launch_mode, PiLaunchMode::InteractiveInherit);
    assert!(!plan.capture_output);
    assert!(plan.args.contains(&"--no-extensions".to_string()));
    assert!(plan.args.contains(&"--no-skills".to_string()));
    assert!(plan
        .args
        .iter()
        .any(|arg| arg.ends_with("extensions/epi-citta.ts")));
    assert!(plan
        .args
        .iter()
        .any(|arg| arg.ends_with("/skills")));
    assert!(plan
        .args
        .iter()
        .any(|arg| arg.ends_with(".pi/extensions/ta-onta/anima/S4'/skills")));
    assert!(plan
        .args
        .iter()
        .any(|arg| arg.ends_with(".pi/extensions/ta-onta/aletheia/S5'/skills")));
    assert!(plan
        .args
        .iter()
        .any(|arg| arg.ends_with(".pi/extensions/ta-onta/pleroma/S2'/skills")));
}

#[test]
fn prompt_and_verify_plans_keep_their_capture_contracts() {
    let env = TestEnv::repo_with_assets();
    let _guard = env.apply_to_process();

    let prompt_plan = runtime::plan_prompt(Some("anima"), &[], Some("hello"))
        .expect("prompt launch plan should resolve");
    assert_eq!(prompt_plan.launch_mode, PiLaunchMode::CapturedPrompt);
    assert!(prompt_plan.capture_output);

    let verify_plan = runtime::plan_verify_runtime(Some("anima"), &[], Some("probe runtime"))
        .expect("verify launch plan should resolve");
    assert_eq!(verify_plan.launch_mode, PiLaunchMode::IsolatedVerify);
    assert!(verify_plan.capture_output);
}

#[test]
fn chat_and_spawn_share_the_native_interactive_plan() {
    let env = TestEnv::repo_with_assets();
    let _guard = env.apply_to_process();

    let chat_plan = runtime::plan_chat(Some("anima"), &[], Some("hello"))
        .expect("chat launch plan should resolve");
    assert_eq!(chat_plan.launch_mode, PiLaunchMode::InteractiveInherit);

    let spawn_plan = runtime::plan_spawn(Some("anima"), &[], Some("hello"))
        .expect("spawn launch plan should resolve");
    assert_eq!(spawn_plan.launch_mode, PiLaunchMode::InteractiveInherit);
}

#[test]
fn agent_layout_defaults_to_repo_local_managed_home() {
    let env = TestEnv::repo_with_assets();
    let _guard = env.apply_to_process();

    assert_eq!(
        canonical_pi_agent_dir(&env.home),
        env.home.join(".pi/agent")
    );
    assert_eq!(
        managed_epi_agent_dir(&env.repo_root.join(".epi"), "main"),
        env.repo_root.join(".epi/agents/main/agent")
    );

    let layout = AgentLayout::resolve(Some("main")).expect("layout should resolve");
    assert_eq!(layout.epi_home, env.repo_root.join(".epi"));
    assert_eq!(layout.managed_epi_agent_dir, env.repo_root.join(".epi/agents/main/agent"));

    let interactive_plan = runtime::plan_spawn(Some("main"), &[], Some("hello"))
        .expect("interactive launch plan should resolve");
    let verify_plan = runtime::plan_verify_runtime(Some("main"), &[], Some("probe runtime"))
        .expect("verify launch plan should resolve");

    assert_eq!(interactive_plan.agent_dir, env.repo_root.join(".epi/agents/main/agent"));
    assert_ne!(interactive_plan.agent_dir, canonical_pi_agent_dir(&env.home));
    assert_ne!(verify_plan.agent_dir, env.repo_root.join(".epi/agents/main/agent"));
}

#[test]
fn install_and_doctor_report_augmentation_mode() {
    let env = TestEnv::with_fake_pi();

    let install = run_epi(
        ["--json", "agent", "install", "--agent", "main"].as_slice(),
        &env,
    );
    assert!(install.status.success(), "stderr: {}", install.stderr);
    assert!(
        install.stdout.contains("\"canonicalPiAgentDir\":"),
        "stdout: {}",
        install.stdout
    );
    assert!(
        install.stdout.contains("\"managedEpiAgentDir\":"),
        "stdout: {}",
        install.stdout
    );
    assert!(
        install.stdout.contains("\"interactiveLaunchMode\": \"claw\""),
        "stdout: {}",
        install.stdout
    );

    let doctor = run_epi(
        ["--json", "agent", "doctor", "--agent", "main"].as_slice(),
        &env,
    );
    assert!(doctor.status.success(), "stderr: {}", doctor.stderr);
    assert!(
        doctor.stdout.contains("\"canonicalPiAgentDir\":"),
        "stdout: {}",
        doctor.stdout
    );
    assert!(
        doctor.stdout.contains("\"managedEpiAgentDir\":"),
        "stdout: {}",
        doctor.stdout
    );
    assert!(
        doctor.stdout.contains("\"interactiveLaunchMode\": \"claw\""),
        "stdout: {}",
        doctor.stdout
    );
}
