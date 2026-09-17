use crate::agent::runtime::PiLaunchPlan;
use std::ffi::OsString;
use std::process::Command;

pub fn pi_command_argv(plan: &PiLaunchPlan) -> Vec<String> {
    crate::agent::harness::pi_command_argv(plan)
}

pub fn launch_interactive(plan: &PiLaunchPlan) -> Result<String, String> {
    crate::agent::harness::launch_interactive_pi(plan)
}

pub fn configure_std_command(plan: &PiLaunchPlan) -> Command {
    crate::agent::harness::configure_std_command(plan)
}

pub fn plan_env(plan: &PiLaunchPlan, extra: &[(&str, String)]) -> Vec<(String, OsString)> {
    crate::agent::harness::plan_env(plan, extra)
}

pub fn apply_plan_env(command: &mut Command, plan: &PiLaunchPlan, extra: &[(&str, String)]) {
    crate::agent::harness::apply_plan_env(command, plan, extra);
}

pub fn path_with_current_exe_dir() -> Option<OsString> {
    crate::agent::harness::path_with_current_exe_dir()
}
