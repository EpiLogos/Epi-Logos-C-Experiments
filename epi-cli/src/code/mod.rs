use clap::Subcommand;
use std::process::Command;

#[derive(Subcommand)]
pub enum CodeCmd {
    /// Launch Claude Code with native Anthropic (default)
    Claude {
        /// Arguments passed to claude
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// Launch Claude Code with Kimi K2.5 (kimi-coding profile)
    Kimi {
        /// Arguments passed to claude
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// Launch Claude Code with GLM 4.7 (Z.AI profile)
    Glm {
        /// Arguments passed to claude
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// Launch Claude Code with DeepSeek
    Deepc {
        /// Arguments passed to claude
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// Launch Claude Code with Codex (OpenAI)
    Codex {
        /// Arguments passed to claude
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// Launch Claude Code with Gemini
    Gemini {
        /// Arguments passed to claude
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
}

pub fn dispatch(cmd: &CodeCmd) {
    let (profile, args) = match cmd {
        CodeCmd::Claude { args } => (None, args),
        CodeCmd::Kimi { args } => (Some("kimi-coding.conf"), args),
        CodeCmd::Glm { args } => (Some("glm.conf"), args),
        CodeCmd::Deepc { args } => (Some("deepseek.conf"), args),
        CodeCmd::Codex { args } => (Some("codex.conf"), args),
        CodeCmd::Gemini { args } => (Some("gemini.conf"), args),
    };

    let status = match profile {
        Some(prof) => {
            // Source api-keys.env + profile, then exec claude
            let args_str = args
                .iter()
                .map(|a| shell_escape(a))
                .collect::<Vec<_>>()
                .join(" ");

            Command::new("bash")
                .args([
                    "-c",
                    &format!(
                        "source ~/.claude/api-keys.env 2>/dev/null; \
                         source ~/.claude/profiles/{}; \
                         exec claude {}",
                        prof, args_str
                    ),
                ])
                .status()
        }
        None => {
            // Native claude — just exec directly
            Command::new("claude").args(args).status()
        }
    };

    match status {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi code: failed to launch claude: {}", e);
            std::process::exit(1);
        }
        _ => {}
    }
}

fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}
