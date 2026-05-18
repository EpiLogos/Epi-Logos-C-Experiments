use clap::Subcommand;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Subcommand)]
pub enum AppCmd {
    /// Launch the built Epi-Logos Tauri app
    Launch,
    /// Run the Tauri app in dev mode (cargo tauri dev)
    Dev,
    /// Build the Tauri app (cargo tauri build)
    Build,
}

pub fn dispatch(cmd: &AppCmd) {
    let repo_root = repo_root();

    match cmd {
        AppCmd::Launch => {
            let bundle = app_bundle_path(&repo_root);
            if !bundle.exists() {
                eprintln!("epi app launch: bundle not found at {}", bundle.display());
                eprintln!("  run `epi app build` first");
                std::process::exit(1);
            }
            let status = Command::new("open").arg(&bundle).status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app launch: failed to open bundle: {}", e);
                    std::process::exit(1);
                }
                _ => {}
            }
        }
        AppCmd::Dev => {
            let source = app_source_dir(&repo_root);
            let status = cargo_tauri_command(&source, "dev").status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app dev: failed to start: {}", e);
                    eprintln!("  source dir: {}", source.display());
                    std::process::exit(1);
                }
                _ => {}
            }
        }
        AppCmd::Build => {
            let source = app_source_dir(&repo_root);
            let status = cargo_tauri_command(&source, "build").status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app build: failed: {}", e);
                    eprintln!("  source dir: {}", source.display());
                    std::process::exit(1);
                }
                _ => {}
            }
        }
    }
}

fn repo_root() -> PathBuf {
    if let Some(path) = std::env::var_os("EPI_REPO_ROOT") {
        return PathBuf::from(path);
    }

    let mut current = Path::new(env!("CARGO_MANIFEST_DIR"));
    while let Some(parent) = current.parent() {
        if parent.join("Body/S/S0/epi-cli/Cargo.toml").exists() && parent.join("Idea").exists() {
            return parent.to_path_buf();
        }
        current = parent;
    }

    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap_or_else(|| Path::new("."))
        .to_path_buf()
}

fn app_source_dir(repo_root: &Path) -> PathBuf {
    if let Some(path) = std::env::var_os("EPI_APP_SOURCE_DIR") {
        return PathBuf::from(path);
    }
    repo_root.join("Body/M/epi-tauri")
}

fn app_bundle_path(repo_root: &Path) -> PathBuf {
    app_source_dir(repo_root).join("src-tauri/target/release/bundle/macos/Epi-Logos.app")
}

fn cargo_tauri_command(source_dir: &Path, subcmd: &str) -> Command {
    let mut command = Command::new("cargo");
    command.arg("tauri").arg(subcmd).current_dir(source_dir);
    command
}

/// Used by `epi up` to launch the app as part of full-stack startup.
pub fn launch_command_for_repo(repo_root: &Path) -> Command {
    let bundle = app_bundle_path(repo_root);
    if bundle.exists() {
        let mut cmd = Command::new("open");
        cmd.arg(bundle);
        cmd
    } else {
        cargo_tauri_command(&app_source_dir(repo_root), "dev")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn app_source_targets_epi_tauri() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let app_source = app_source_dir(repo_root);
        assert!(
            app_source.ends_with("Body/M/epi-tauri"),
            "expected epi-tauri source, got {}",
            app_source.display()
        );
    }

    #[test]
    fn app_bundle_targets_tauri_bundle() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let bundle = app_bundle_path(repo_root);
        assert!(
            bundle.ends_with("src-tauri/target/release/bundle/macos/Epi-Logos.app"),
            "expected Tauri macOS bundle, got {}",
            bundle.display()
        );
    }
}
