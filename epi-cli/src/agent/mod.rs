use clap::Subcommand;
use std::process::Command;

#[derive(Subcommand)]
pub enum AgentCmd {
    /// Install PI agent locally
    Install,
    /// Show PI version and status
    Status,
    /// List installed extensions
    #[command(name = "extensions-list")]
    ExtensionsList,
    /// Spawn a new PI agent session
    Spawn { prompt: Option<String> },
    /// Attach to existing session
    Attach { session_id: String },
    /// Run PI command directly
    Run { args: Vec<String> },
}

fn pi_cli(args: &[&str]) -> Result<String, String> {
    let output = Command::new("pi")
        .args(args)
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(String::from_utf8_lossy(&out.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        }
        Err(e) => Err(format!("Failed to execute pi: {}", e)),
    }
}

pub fn dispatch(cmd: &AgentCmd) -> Result<String, String> {
    match cmd {
        AgentCmd::Install => {
            let output = Command::new("npm")
                .args(["install", "-g", "@mariozechner/pi"])
                .output();

            match output {
                Ok(out) if out.status.success() => {
                    Ok(String::from_utf8_lossy(&out.stdout).to_string())
                }
                Ok(out) => {
                    Err(format!("Install failed: {}",
                        String::from_utf8_lossy(&out.stderr)))
                }
                Err(e) => Err(format!("Failed to run npm: {}", e)),
            }
        }

        AgentCmd::Status => pi_cli(&["--version"]),

        AgentCmd::ExtensionsList => pi_cli(&["extensions", "list"]),

        AgentCmd::Spawn { prompt } => {
            if let Some(p) = prompt {
                pi_cli(&["spawn", "--prompt", p.as_str()])
            } else {
                pi_cli(&["spawn"])
            }
        }

        AgentCmd::Attach { session_id } => {
            pi_cli(&["attach", session_id.as_str()])
        }

        AgentCmd::Run { args } => {
            let arg_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
            pi_cli(&arg_refs)
        }
    }
}
