use clap::Subcommand;

use crate::agent::harness::{self, CodeHarnessProfile, HarnessProfile};

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

    let result = harness::launch_blocking(
        &HarnessProfile::ClaudeNative(CodeHarnessProfile {
            profile: profile.map(str::to_owned),
            args: args.clone(),
        }),
        false,
    );

    match result {
        Err(e) => {
            eprintln!("epi code: {}", e);
            std::process::exit(1);
        }
        _ => {}
    }
}
