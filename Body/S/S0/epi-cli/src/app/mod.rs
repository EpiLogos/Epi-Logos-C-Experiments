use clap::Subcommand;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Subcommand)]
pub enum AppCmd {
    /// Launch the built Epi-Logos Theia Electron app
    Launch,
    /// Run the Theia Electron app in dev mode (pnpm run dev)
    Dev,
    /// Build and package the Theia Electron app (pnpm run dist:dir)
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
            let status = pnpm_app_command(&source, "dev").status();
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
            let status = pnpm_app_command(&source, "dist:dir").status();
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
    repo_root.join("Idea/Pratibimba/System/electron-app")
}

fn app_bundle_path(repo_root: &Path) -> PathBuf {
    if let Some(path) = std::env::var_os("EPI_APP_BUNDLE_PATH") {
        return PathBuf::from(path);
    }
    let dist_subpath = if cfg!(target_os = "macos") {
        "dist/mac/Pratibimba System.app"
    } else if cfg!(target_os = "linux") {
        "dist/linux-unpacked"
    } else if cfg!(target_os = "windows") {
        "dist/win-unpacked"
    } else {
        "dist"
    };
    app_source_dir(repo_root).join(dist_subpath)
}

fn pnpm_app_command(source_dir: &Path, script: &str) -> Command {
    let mut command = Command::new("pnpm");
    command.arg("run").arg(script).current_dir(source_dir);
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
        pnpm_app_command(&app_source_dir(repo_root), "dev")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn app_source_targets_theia_electron() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let app_source = app_source_dir(repo_root);
        assert!(
            app_source.ends_with("Idea/Pratibimba/System/electron-app"),
            "expected Theia electron-app source, got {}",
            app_source.display()
        );
    }

    #[test]
    fn app_bundle_targets_electron_dist() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let bundle = app_bundle_path(repo_root);
        let expected_tail = if cfg!(target_os = "macos") {
            "dist/mac/Pratibimba System.app"
        } else if cfg!(target_os = "linux") {
            "dist/linux-unpacked"
        } else if cfg!(target_os = "windows") {
            "dist/win-unpacked"
        } else {
            "dist"
        };
        assert!(
            bundle.ends_with(expected_tail),
            "expected electron-builder dist output ending in {}, got {}",
            expected_tail,
            bundle.display()
        );
    }
}
