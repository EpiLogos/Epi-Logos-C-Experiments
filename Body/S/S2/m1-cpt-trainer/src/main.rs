//! M1' Paramaśiva CPT Trainer
//!
//! Reads the M1' CPT spec, loads the held-out canonical-derivation eval corpus,
//! and runs EKSFT (Epistemic Knowledge Supervised Fine-Tuning) with an
//! epistemic-blindfolded teacher per the Phase-I DiscoverAI research synthesis.
//!
//! The trainer is a slot-CLI-invoked binary (Track 12.22) that:
//! 1. Loads the eval corpus manifest and passages
//! 2. Invokes the blindfolded teacher to produce canonical derivations
//! 3. Runs EKSFT loss computation against the student model
//! 4. Evaluates perplexity against the held-out corpus
//! 5. Halts if perplexity rises > halt_threshold (anti-drift discipline)

use anyhow::{Context, Result};
use clap::Parser;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

/// M1' Paramaśiva CPT Trainer — EKSFT distillation
#[derive(Parser, Debug)]
#[command(name = "m1-cpt-train", version = "0.1.0")]
struct Args {
    /// Path to the M1' CPT spec
    #[arg(long, default_value = "Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md")]
    spec: PathBuf,

    /// Path to the eval corpus manifest
    #[arg(long, default_value = "Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/eval-corpus/m1-paramasiva/manifest.json")]
    corpus_manifest: PathBuf,

    /// Output directory for checkpoints
    #[arg(long, default_value = "Body/S/S2/m1-cpt-trainer/checkpoints")]
    output: PathBuf,

    /// Path to blindfolded teacher script
    #[arg(long, default_value = "Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/blindfolded_teacher.py")]
    teacher_script: PathBuf,

    /// Path to EKSFT script
    #[arg(long, default_value = "Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/eksft.py")]
    eksft_script: PathBuf,

    /// Number of training passes
    #[arg(long, default_value = "10")]
    passes: u32,

    /// Halt threshold for perplexity rise (percent)
    #[arg(long, default_value = "10.0")]
    halt_threshold_pct: f64,
}

/// Eval corpus manifest (matches manifest.json)
#[derive(Debug, Deserialize)]
struct EvalCorpusManifest {
    eval_corpus: String,
    version: String,
    description: String,
    halt_threshold: HaltThreshold,
    files: Vec<CorpusFile>,
}

#[derive(Debug, Deserialize)]
struct HaltThreshold {
    metric: String,
    threshold_pct: f64,
    relative_to: String,
}

#[derive(Debug, Deserialize)]
struct CorpusFile {
    name: String,
    passage_count: u32,
    source_file: String,
    registers_covered: Vec<String>,
    derivational_register_classes: Vec<String>,
}

/// Result of a single CPT training pass
#[derive(Debug, Serialize)]
struct TrainingPassResult {
    pass_number: u32,
    perplexity: f64,
    previous_perplexity: Option<f64>,
    perplexity_rise_pct: Option<f64>,
    halted: bool,
    reason: Option<String>,
}

fn main() -> Result<()> {
    env_logger::init();
    let args = Args::parse();

    log::info!("M1' CPT Trainer starting");
    log::info!("Spec: {:?}", args.spec);
    log::info!("Corpus manifest: {:?}", args.corpus_manifest);
    log::info!("Output: {:?}", args.output);

    // 1. Load eval corpus manifest
    let manifest_path = resolve_repo_root().join(&args.corpus_manifest);
    let manifest: EvalCorpusManifest = serde_json::from_reader(
        std::fs::File::open(&manifest_path)
            .with_context(|| format!("Failed to open corpus manifest: {:?}", manifest_path))?
    )?;
    log::info!("Loaded eval corpus: {} v{}", manifest.eval_corpus, manifest.version);
    log::info!("  Files: {}", manifest.files.len());
    for f in &manifest.files {
        log::info!("    {} ({} passages) from {}", f.name, f.passage_count, f.source_file);
    }

    // 2. Verify spec exists
    let spec_path = resolve_repo_root().join(&args.spec);
    if !spec_path.exists() {
        log::warn!("Spec not found at {:?} — continuing with corpus-only distillation", spec_path);
    }

    // 3. Training loop
    let halt_threshold = args.halt_threshold_pct;
    let mut previous_perplexity: Option<f64> = None;
    let mut results: Vec<TrainingPassResult> = Vec::new();

    for pass in 1..=args.passes {
        log::info!("=== Pass {}/{} ===", pass, args.passes);

        // 3a. Invoke blindfolded teacher — produces canonical derivations from spec
        log::info!("Invoking blindfolded teacher...");
        let teacher_path = resolve_repo_root().join(&args.teacher_script);
        let teacher_output = Command::new("python3")
            .arg(&teacher_path)
            .arg("--spec")
            .arg(&spec_path)
            .arg("--corpus-manifest")
            .arg(&manifest_path)
            .arg("--pass")
            .arg(pass.to_string())
            .output()
            .with_context(|| "Failed to invoke blindfolded teacher")?;

        if !teacher_output.status.success() {
            let stderr = String::from_utf8_lossy(&teacher_output.stderr);
            log::error!("Blindfolded teacher failed: {}", stderr);
            // Continue — teacher failure is not fatal; use corpus-only eval
        } else {
            log::info!("Blindfolded teacher produced derivations");
        }

        // 3b. Compute EKSFT loss
        log::info!("Computing EKSFT loss...");
        let eksft_path = resolve_repo_root().join(&args.eksft_script);
        let eksft_output = Command::new("python3")
            .arg(&eksft_path)
            .arg("--corpus-manifest")
            .arg(&manifest_path)
            .arg("--pass")
            .arg(pass.to_string())
            .output()
            .with_context(|| "Failed to invoke EKSFT")?;

        if !eksft_output.status.success() {
            let stderr = String::from_utf8_lossy(&eksft_output.stderr);
            log::error!("EKSFT failed: {}", stderr);
            continue;
        }

        // 3c. Parse perplexity from EKSFT output
        // The EKSFT script outputs a JSON line with perplexity
        let stdout = String::from_utf8_lossy(&eksft_output.stdout);
        let perplexity: f64 = stdout
            .lines()
            .filter_map(|line| serde_json::from_str::<serde_json::Value>(line).ok())
            .find_map(|v| v.get("perplexity").and_then(|p| p.as_f64()))
            .unwrap_or(f64::NAN);

        // 3d. Check anti-drift halt condition
        let perplexity_rise_pct = previous_perplexity.map(|prev| {
            ((perplexity - prev) / prev) * 100.0
        });

        let halted = perplexity_rise_pct.map_or(false, |rise| rise > halt_threshold);
        let reason = if halted {
            Some(format!(
                "Perplexity rose {:.2}% (threshold: {:.2}%) — anti-drift halt",
                perplexity_rise_pct.unwrap(),
                halt_threshold
            ))
        } else {
            None
        };

        let result = TrainingPassResult {
            pass_number: pass,
            perplexity,
            previous_perplexity,
            perplexity_rise_pct,
            halted,
            reason: reason.clone(),
        };
        log::info!("  Perplexity: {:.4} (rise: {:?}%)", perplexity, perplexity_rise_pct);

        results.push(result);
        previous_perplexity = Some(perplexity);

        if halted {
            log::warn!("HALTED: {}", reason.unwrap());
            break;
        }
    }

    // 4. Write results
    let output_dir = resolve_repo_root().join(&args.output);
    std::fs::create_dir_all(&output_dir)?;
    let results_path = output_dir.join("training_results.json");
    serde_json::to_writer_pretty(
        std::fs::File::create(&results_path)?,
        &results,
    )?;
    log::info!("Results written to {:?}", results_path);

    Ok(())
}

/// Resolve paths relative to the Epi-Logos repo root
fn resolve_repo_root() -> PathBuf {
    // The trainer runs from the repo root by convention
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}
