use std::env;
use std::path::{Path, PathBuf};
use std::process::Command;

fn run(mut command: Command, what: &str) {
    let status = command.status().unwrap_or_else(|error| {
        panic!("failed to start {what}: {error}");
    });
    if !status.success() {
        panic!("{what} failed with status {status}");
    }
}

fn main() {
    let manifest_dir = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").expect("manifest dir"));
    let s0_dir = manifest_dir.parent().expect("S0 parent");
    let epi_lib = s0_dir.join("epi-lib");
    let include_dir = epi_lib.join("include");
    let kernel_source = epi_lib.join("src/kernel.c");
    let bridge_source = epi_lib.join("src/primitive_bridge.c");
    let out_dir = PathBuf::from(env::var_os("OUT_DIR").expect("OUT_DIR"));

    println!("cargo:rerun-if-changed={}", kernel_source.display());
    println!("cargo:rerun-if-changed={}", bridge_source.display());
    println!("cargo:rerun-if-changed={}", include_dir.join("kernel.h").display());
    println!("cargo:rerun-if-changed={}", include_dir.join("primitive_bridge.h").display());
    println!("cargo:rerun-if-changed={}", include_dir.join("m1.h").display());

    let target_family = env::var("CARGO_CFG_TARGET_FAMILY").unwrap_or_default();
    if target_family == "windows" {
        panic!("epi-pratibimba-bridge currently requires a Unix C toolchain; no C kernel rewrite is substituted on Windows");
    }

    let cc = env::var("CC").unwrap_or_else(|_| "cc".to_owned());
    let ar = env::var("AR").unwrap_or_else(|_| "ar".to_owned());
    let kernel_obj = out_dir.join("epi_kernel.o");
    let bridge_obj = out_dir.join("epi_primitive_bridge.o");
    let archive = out_dir.join("libepi_kernel_bridge.a");

    compile_c(&cc, &include_dir, &kernel_source, &kernel_obj);
    compile_c(&cc, &include_dir, &bridge_source, &bridge_obj);

    let mut archive_command = Command::new(&ar);
    archive_command
        .arg("crus")
        .arg(&archive)
        .arg(&kernel_obj)
        .arg(&bridge_obj);
    run(archive_command, "epi-lib archive step");

    println!("cargo:rustc-link-search=native={}", out_dir.display());
    println!("cargo:rustc-link-lib=static=epi_kernel_bridge");
    println!("cargo:rustc-link-lib=m");

    let repo_root = manifest_dir
        .ancestors()
        .nth(4)
        .unwrap_or_else(|| Path::new("."));
    let revision = Command::new("git")
        .arg("rev-parse")
        .arg("HEAD")
        .current_dir(repo_root)
        .output()
        .ok()
        .filter(|output| output.status.success())
        .and_then(|output| String::from_utf8(output.stdout).ok())
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "unknown-source-revision".to_owned());
    println!("cargo:rustc-env=EPI_SOURCE_REVISION={revision}");
}

fn compile_c(cc: &str, include_dir: &Path, source: &Path, object: &Path) {
    let mut command = Command::new(cc);
    command
        .arg("-std=c11")
        .arg("-O2")
        .arg("-fPIC")
        .arg("-I")
        .arg(include_dir)
        .arg("-c")
        .arg(source)
        .arg("-o")
        .arg(object);
    run(command, &format!("C compilation for {}", source.display()));
}
