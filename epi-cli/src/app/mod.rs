use clap::Subcommand;
use std::process::Command;

const APP_LAUNCHER: &str = concat!(
    env!("HOME"),
    "/Documents/Epi-Logos/EpiLogos-Dev.app/Contents/MacOS/launcher"
);
const APP_SOURCE: &str = concat!(
    env!("HOME"),
    "/Documents/Epi-Logos/Idea/Pratibimba/System/src"
);

#[derive(Subcommand)]
pub enum AppCmd {
    /// Launch the EpiLogos Electron app
    Launch,
    /// Run the app in dev mode from source (npm run dev)
    Dev,
    /// Build the app from source (npm run build)
    Build,
}

pub fn dispatch(cmd: &AppCmd) {
    match cmd {
        AppCmd::Launch => {
            let status = Command::new("open")
                .arg("-a")
                .arg(concat!(
                    env!("HOME"),
                    "/Documents/Epi-Logos/EpiLogos-Dev.app"
                ))
                .status();
            match status {
                Ok(s) if !s.success() => {
                    // Fallback: try the launcher binary directly
                    match Command::new(APP_LAUNCHER).status() {
                        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                        Err(e) => {
                            eprintln!("epi app: failed to launch: {}", e);
                            eprintln!("  expected: {}", APP_LAUNCHER);
                            std::process::exit(1);
                        }
                        _ => {}
                    }
                }
                Err(e) => {
                    eprintln!("epi app: failed to launch: {}", e);
                    std::process::exit(1);
                }
                _ => {}
            }
        }
        AppCmd::Dev => {
            let status = Command::new("npm")
                .arg("run")
                .arg("dev")
                .current_dir(APP_SOURCE)
                .status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app dev: failed to start: {}", e);
                    eprintln!("  source dir: {}", APP_SOURCE);
                    std::process::exit(1);
                }
                _ => {}
            }
        }
        AppCmd::Build => {
            let status = Command::new("npm")
                .arg("run")
                .arg("build")
                .current_dir(APP_SOURCE)
                .status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app build: failed: {}", e);
                    eprintln!("  source dir: {}", APP_SOURCE);
                    std::process::exit(1);
                }
                _ => {}
            }
        }
    }
}
