use std::env;
use std::path::PathBuf;

/// Resolve the path to kbase.sh.
///
/// Search order:
///   1. $EPI_KBASE_SCRIPT (explicit override)
///   2. Next to the running binary: <exe_dir>/../scripts/kbase.sh
///   3. Next to the running binary: <exe_dir>/scripts/kbase.sh (flat install)
///   4. S5 epi-kbase scripts dir (CARGO_MANIFEST_DIR-relative)
///   5. Original epi-claw location: ~/.epi-claw/workspace/skills/kbase/scripts/kbase.sh
pub fn resolve_kbase_script() -> Option<PathBuf> {
    if let Ok(p) = env::var("EPI_KBASE_SCRIPT") {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Some(pb);
        }
    }

    if let Ok(exe) = env::current_exe() {
        if let Some(bin_dir) = exe.parent() {
            let candidate = bin_dir.join("../scripts/kbase.sh");
            if candidate.exists() {
                return Some(candidate);
            }
            let candidate = bin_dir.join("scripts/kbase.sh");
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }

    // S5 epi-kbase canonical location
    let s5_candidate = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("scripts/kbase.sh");
    if s5_candidate.exists() {
        return Some(s5_candidate);
    }

    if let Some(home) = dirs::home_dir() {
        let epi_claw = home.join(".epi-claw/workspace/skills/kbase/scripts/kbase.sh");
        if epi_claw.exists() {
            return Some(epi_claw);
        }
    }

    None
}

/// Resolve the vimarsa script path (accepts EPI_VIMARSA_SCRIPT override,
/// falls back to the shared kbase.sh resolution).
pub fn resolve_vimarsa_script() -> Option<PathBuf> {
    if let Ok(p) = env::var("EPI_VIMARSA_SCRIPT") {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Some(pb);
        }
    }

    resolve_kbase_script()
}
