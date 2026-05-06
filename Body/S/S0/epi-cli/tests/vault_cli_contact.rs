mod common;

use common::{read_to_string, run_epi, write_executable, TestEnv};

fn env_with_dual_obsidian_binaries() -> TestEnv {
    let env = TestEnv::repo_with_assets();
    let bin_dir = env.root.join("bin");
    std::fs::create_dir_all(&bin_dir).unwrap();
    let log_path = env.root.join("obsidian-contact.log");

    write_executable(
        bin_dir.join("obsidian"),
        &format!(
            "#!/bin/sh\nprintf 'obsidian\\n' >> \"{}\"\nif [ \"$1\" = \"print-default\" ]; then printf 'GUI Vault\\n'; fi\n",
            log_path.display()
        ),
    );
    write_executable(
        bin_dir.join("obsidian-cli"),
        &format!(
            "#!/bin/sh\nprintf 'obsidian-cli\\n' >> \"{}\"\nif [ \"$1\" = \"print-default\" ]; then printf 'Main Vault\\n'; fi\n",
            log_path.display()
        ),
    );

    let existing = std::env::var("PATH").unwrap_or_default();
    env.with_env("PATH", format!("{}:{existing}", bin_dir.display()))
}

#[test]
fn vault_commands_prefer_obsidian_cli_even_when_obsidian_exists() {
    let env = env_with_dual_obsidian_binaries();

    let out = run_epi(["vault", "status"].as_slice(), &env);
    assert!(out.status.success(), "stderr: {}", out.stderr);

    let log = read_to_string(env.root.join("obsidian-contact.log"));
    assert!(!log.contains("obsidian\n"), "log: {}", log);
    assert!(log.contains("obsidian-cli\n"), "log: {}", log);
}
