//! Nara — The Personal Dialogical Interface (#4)
//!
//! CLI scaffold for all M4 Nara sub-commands:
//! wind, clock, kairos, identity, decan, resonance, project,
//! oracle, medicine, transform, lens, pratibimba, logos, status.

pub mod clock;
pub mod identity;
pub mod kairos;
pub mod lens;
pub mod logos;
pub mod medicine;
pub mod oracle;
pub mod pratibimba;
pub mod transform;
pub mod weights;
pub mod wind;

use clap::Subcommand;

// ─── Top-level NaraCmd ──────────────────────────────────────────────────────

#[derive(Subcommand)]
pub enum NaraCmd {
    /// Wind the Nara identity clock
    Wind {
        #[arg(long)]
        birth_date: Option<String>,
        #[arg(long)]
        birth_time: Option<String>,
        #[arg(long)]
        birth_lat: Option<f32>,
        #[arg(long)]
        birth_lon: Option<f32>,
        #[arg(long)]
        profile: bool,
        #[arg(long)]
        force: bool,
    },
    /// Show M1 torus clock state
    Clock {
        #[arg(long)]
        json: bool,
    },
    /// Kairos temporal state operations
    Kairos {
        #[command(subcommand)]
        cmd: KairosCmd,
    },
    /// Identity matrix operations
    Identity {
        #[command(subcommand)]
        cmd: IdentityCmd,
    },
    /// Show active decan
    Decan {
        #[arg(long)]
        json: bool,
    },
    /// Show resonance state
    Resonance {
        #[arg(long)]
        json: bool,
    },
    /// Show M3 projection
    Project {
        #[arg(long)]
        json: bool,
    },
    /// Oracle operations (consent-gated)
    Oracle {
        #[command(subcommand)]
        cmd: OracleCmd,
    },
    /// Sympathetic medicine operations
    Medicine {
        #[command(subcommand)]
        cmd: MedicineCmd,
    },
    /// Transformation cycle engine
    Transform {
        #[command(subcommand)]
        cmd: TransformCmd,
    },
    /// Wisdom lens operations
    Lens {
        #[command(subcommand)]
        cmd: LensCmd,
    },
    /// Personal Pratibimba subgraph
    Pratibimba {
        #[command(subcommand)]
        cmd: PratibimbaCmd,
    },
    /// Logos cycle synthesis engine
    Logos {
        #[command(subcommand)]
        cmd: LogosCmd,
    },
    /// Tunable resonance weight system
    Weights {
        #[command(subcommand)]
        cmd: WeightsCmd,
    },
    /// Composite Nara status
    Status {
        #[arg(long)]
        json: bool,
    },
}

// ─── Sub-enums ──────────────────────────────────────────────────────────────

#[derive(Subcommand)]
pub enum KairosCmd {
    /// Sync current transits from kerykeion
    Sync,
    /// Show current kairos state
    Show {
        #[arg(long)]
        json: bool,
        #[arg(long)]
        planets: bool,
    },
    /// Show kairos status (freshness, last sync)
    Status {
        #[arg(long)]
        json: bool,
    },
    /// Fetch current transits (alias for sync)
    Fetch,
}

#[derive(Subcommand)]
pub enum IdentityCmd {
    /// Show identity matrix
    Show {
        #[arg(long)]
        json: bool,
    },
    /// Show identity layers
    Layers {
        #[arg(long)]
        json: bool,
    },
    /// Compute quintessence hash
    Compute,
    /// Set a specific layer source
    #[command(name = "layer-set")]
    LayerSet { layer: u8, source: String },
    /// Set an identity layer value
    Set {
        /// Layer key: birth-date, birth-location, jungian, gene-keys, human-design
        key: String,
        /// Value (format depends on key)
        value: String,
    },
    /// Augment identity with additional layer data
    Augment {
        #[arg(long)]
        layer: u8,
        #[arg(long)]
        data: String,
    },
}

#[derive(Subcommand)]
pub enum WeightsCmd {
    /// Show current weights
    Show {
        #[arg(long)]
        json: bool,
    },
    /// Set a specific weight (siblings auto-renormalized)
    Set {
        key: String,
        value: f32,
    },
    /// Reset all weights to defaults
    Reset,
    /// Auto-calibrate oracle weights from identity nucleotide balance
    Calibrate,
}

#[derive(Subcommand)]
pub enum OracleCmd {
    /// Cast an oracle reading (consent-gated)
    Cast {
        #[arg(long)]
        system: String,
        #[arg(long)]
        question: String,
        #[arg(short, long)]
        yes: bool,
        #[arg(long)]
        method: Option<String>,
    },
    /// Show active decan context for oracle
    Decan {
        #[arg(long)]
        json: bool,
    },
    /// Show oracle payload
    Payload {
        #[arg(long)]
        cast_id: Option<u32>,
        #[arg(long)]
        json: bool,
    },
    /// Apply oracle payload to target
    #[command(name = "payload-apply")]
    PayloadApply {
        #[arg(long)]
        target: String,
    },
    /// Interpret a previous cast
    Interpret {
        #[arg(long)]
        cast_id: u32,
        #[arg(long)]
        mode: String,
    },
    /// Run oracle hygiene check
    Hygiene {
        #[arg(long)]
        cast_id: Option<u32>,
    },
    /// Show oracle history
    History,
}

#[derive(Subcommand)]
pub enum MedicineCmd {
    /// Show elemental balance
    Balance {
        #[arg(long)]
        json: bool,
    },
    /// Show chakra state
    Chakra {
        #[arg(long)]
        json: bool,
    },
    /// Show materia medica
    Materia {
        #[arg(long)]
        json: bool,
    },
    /// Generate a prescription
    Prescribe {
        #[arg(long, default_value = "general")]
        context: String,
    },
    /// Run safety check
    Safety {
        #[arg(long)]
        practice: Option<String>,
    },
}

#[derive(Subcommand)]
pub enum TransformCmd {
    /// Show transformation status
    Status {
        #[arg(long)]
        json: bool,
    },
    /// Write a transformation note
    Write {
        #[arg(long)]
        note: Option<String>,
    },
    /// Reflect on a cycle
    Reflect {
        #[arg(long)]
        cycle_id: u32,
        #[arg(long)]
        note: Option<String>,
    },
    /// Show decan recipe
    Recipe {
        #[arg(long)]
        json: bool,
    },
    /// Commit an alchemical operation
    Commit {
        #[arg(long)]
        operation: String,
        #[arg(long)]
        note: Option<String>,
    },
    /// Show transformation history
    History {
        #[arg(long)]
        open: bool,
        #[arg(long)]
        json: bool,
    },
}

#[derive(Subcommand)]
pub enum LensCmd {
    /// List available lenses
    List {
        #[arg(long)]
        json: bool,
    },
    /// Apply a specific lens
    Apply {
        #[arg(long)]
        lens: String,
        #[arg(long)]
        target: Option<String>,
    },
    /// Show Jungian lens state
    Jungian {
        #[arg(long)]
        json: bool,
    },
    /// Show Trika lens state
    Trika {
        #[arg(long)]
        json: bool,
    },
    /// Show Phenomenal lens state
    Phenomenal {
        #[arg(long)]
        json: bool,
    },
    /// Synthesize multiple lenses
    Synthesize {
        #[arg(long)]
        lenses: String,
        #[arg(long)]
        target: Option<String>,
    },
}

#[derive(Subcommand)]
pub enum PratibimbaCmd {
    /// Show personal Pratibimba stats
    Stats {
        #[arg(long)]
        json: bool,
    },
    /// Show recent Pratibimba activity
    Recent {
        #[arg(long, default_value_t = 7)]
        days: u32,
        #[arg(long)]
        json: bool,
    },
    /// Record a Pratibimba observation
    Record {
        #[arg(long)]
        cycle_id: u32,
        #[arg(long)]
        lens: Option<String>,
    },
    /// Excavate Pratibimba patterns
    Excavate {
        #[arg(long)]
        term: String,
        #[arg(long)]
        json: bool,
    },
    /// Sync with Atlas (Neo4j)
    #[command(name = "atlas-sync")]
    AtlasSync {
        #[arg(short, long)]
        yes: bool,
    },
    /// Query Atlas subgraph
    #[command(name = "atlas-query")]
    AtlasQuery {
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long)]
        json: bool,
    },
}

#[derive(Subcommand)]
pub enum LogosCmd {
    /// Run a Logos cycle
    Run {
        #[arg(long)]
        date: Option<String>,
        #[arg(long)]
        stage: Option<u8>,
        #[arg(long)]
        json: bool,
    },
    /// Show Logos cycle status
    Status {
        #[arg(long)]
        json: bool,
    },
    /// Inspect a specific Logos stage
    Stage {
        #[arg(long)]
        stage: u8,
        #[arg(long)]
        date: Option<String>,
        #[arg(long)]
        json: bool,
    },
    /// Show curriculum
    Curriculum {
        #[arg(long)]
        json: bool,
    },
    /// Export Logos cycle data
    Export {
        #[arg(long)]
        date: Option<String>,
        #[arg(short, long)]
        yes: bool,
    },
    /// Show weekly Logos summary
    Weekly {
        #[arg(long)]
        json: bool,
    },
}

// ─── Dispatch ───────────────────────────────────────────────────────────────

pub fn dispatch(cmd: &NaraCmd, json: bool) -> Result<String, String> {
    match cmd {
        NaraCmd::Wind {
            birth_date,
            birth_time,
            birth_lat,
            birth_lon,
            profile,
            force,
        } => wind::run(
            birth_date.as_deref(),
            birth_time.as_deref(),
            *birth_lat,
            *birth_lon,
            *profile,
            *force,
            json,
        ),
        NaraCmd::Clock { json: j } => clock::show(*j || json),
        NaraCmd::Kairos { cmd: sub } => match sub {
            KairosCmd::Sync => kairos::sync_current(),
            KairosCmd::Fetch => kairos::sync_current(),
            KairosCmd::Show { json: j, planets } => kairos::show(*j || json, *planets),
            KairosCmd::Status { json: j } => {
                let fresh = kairos::is_current_fresh();
                let path = kairos::kairos_dir().join("current.json");
                let last_sync = std::fs::metadata(&path)
                    .ok()
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs());
                if *j || json {
                    Ok(serde_json::json!({
                        "fresh": fresh,
                        "last_sync_epoch": last_sync,
                    })
                    .to_string())
                } else {
                    Ok(format!(
                        "Kairos status: {}\nLast sync: {:?}",
                        if fresh { "fresh" } else { "stale (run sync)" },
                        last_sync
                    ))
                }
            }
        },
        NaraCmd::Identity { cmd: sub } => match sub {
            IdentityCmd::Show { json: j } => identity::show(*j || json),
            IdentityCmd::Layers { json: j } => {
                let _ = *j || json;
                Err("identity layers: not yet implemented".into())
            }
            IdentityCmd::Compute => Err("identity compute: not yet implemented".into()),
            IdentityCmd::LayerSet { layer, source } => {
                let _ = (layer, source);
                Err("identity layer-set: not yet implemented".into())
            }
            IdentityCmd::Set { key, value } => identity::set_layer(key, value),
            IdentityCmd::Augment { layer, data } => identity::augment_layer(*layer, data),
        },
        NaraCmd::Decan { json: j } => {
            let k = kairos::require_temporal_authority()?;
            if *j || json {
                Ok(
                    serde_json::json!({"decan": k.active_decan, "element": k.dominant_element})
                        .to_string(),
                )
            } else {
                Ok(format!(
                    "Active decan: {} (element: {})",
                    k.active_decan, k.dominant_element
                ))
            }
        }
        NaraCmd::Resonance { json: _j } => Ok("Resonance: requires M2 FFI".to_string()),
        NaraCmd::Project { json: _j } => Ok("Project: requires M2→M3 FFI".to_string()),
        NaraCmd::Oracle { cmd: sub } => match sub {
            OracleCmd::Cast {
                system,
                question,
                yes,
                method,
            } => oracle::cast(system, question, *yes, method.as_deref()),
            OracleCmd::Decan { json: _j } => {
                let k = kairos::require_temporal_authority()?;
                Ok(format!(
                    "Oracle Decan: {} (element {})",
                    k.active_decan, k.dominant_element
                ))
            }
            OracleCmd::Payload {
                cast_id: _,
                json: _,
            } => Ok("Payload: canonical tag extraction (Phase 5 follow-on)".to_string()),
            OracleCmd::PayloadApply { target } => {
                Ok(format!("Payload apply to '{}' (deferred)", target))
            }
            OracleCmd::Interpret { cast_id, mode } => Ok(format!(
                "Interpret cast #{} mode={} (requires agent pipeline)",
                cast_id, mode
            )),
            OracleCmd::Hygiene { cast_id } => oracle::show_hygiene(*cast_id),
            OracleCmd::History => oracle::show_history(),
        },
        NaraCmd::Medicine { cmd: sub } => match sub {
            MedicineCmd::Balance { json: j } => medicine::balance(*j || json),
            MedicineCmd::Chakra { json: j } => medicine::chakra(*j || json),
            MedicineCmd::Materia { json: j } => medicine::materia(*j || json),
            MedicineCmd::Prescribe { context } => medicine::prescribe(context),
            MedicineCmd::Safety { practice } => medicine::safety(practice.as_deref()),
        },
        NaraCmd::Transform { cmd: sub } => match sub {
            TransformCmd::Status { json: j } => transform::status(*j || json),
            TransformCmd::Write { note } => transform::write_cycle(note.as_deref()),
            TransformCmd::Reflect { cycle_id, note } => {
                transform::reflect(*cycle_id, note.as_deref())
            }
            TransformCmd::Recipe { json: j } => transform::recipe(*j || json),
            TransformCmd::Commit { operation, note } => {
                transform::commit(operation, note.as_deref())
            }
            TransformCmd::History { open, json: j } => transform::history(*open, *j || json),
        },
        NaraCmd::Lens { cmd: sub } => match sub {
            LensCmd::List { json: j } => lens::list(*j || json),
            LensCmd::Apply { lens: l, target } => lens::apply(l, target.as_deref()),
            LensCmd::Jungian { json: j } => lens::jungian(*j || json),
            LensCmd::Trika { json: j } => lens::trika(*j || json),
            LensCmd::Phenomenal { json: j } => lens::phenomenal(*j || json),
            LensCmd::Synthesize { lenses, target } => lens::synthesize(lenses, target.as_deref()),
        },
        NaraCmd::Pratibimba { cmd: sub } => match sub {
            PratibimbaCmd::Stats { json: j } => pratibimba::stats(*j || json),
            PratibimbaCmd::Recent { days, json: j } => pratibimba::recent(*days, *j || json),
            PratibimbaCmd::Record { cycle_id, lens } => {
                pratibimba::record(*cycle_id, lens.as_deref())
            }
            PratibimbaCmd::Excavate { term, json: j } => pratibimba::excavate(term, *j || json),
            PratibimbaCmd::AtlasSync { yes } => pratibimba::atlas_sync(*yes),
            PratibimbaCmd::AtlasQuery {
                coordinate,
                json: j,
            } => pratibimba::atlas_query(coordinate.as_deref(), *j || json),
        },
        NaraCmd::Logos { cmd: sub } => match sub {
            LogosCmd::Run {
                date,
                stage,
                json: j,
            } => logos::run(date.as_deref(), *stage, *j || json),
            LogosCmd::Status { json: j } => logos::status(*j || json),
            LogosCmd::Stage {
                stage,
                date,
                json: j,
            } => logos::stage(*stage, date.as_deref(), *j || json),
            LogosCmd::Curriculum { json: j } => logos::curriculum(*j || json),
            LogosCmd::Export { date, yes } => logos::export(date.as_deref(), *yes),
            LogosCmd::Weekly { json: j } => logos::weekly(*j || json),
        },
        NaraCmd::Weights { cmd: sub } => match sub {
            WeightsCmd::Show { json: j } => weights::show(*j || json),
            WeightsCmd::Set { key, value } => weights::set_weight(key, *value),
            WeightsCmd::Reset => weights::reset(),
            WeightsCmd::Calibrate => weights::calibrate(),
        },
        NaraCmd::Status { json: j } => {
            let _ = *j || json;
            let mut out = "Nara Status\n".to_string();
            if let Ok(profile) = identity::load_profile() {
                if let Some(p) = profile {
                    out.push_str(&format!(
                        "  Identity: {} layers, hash: {}\n",
                        p.layer_presence_mask.count_ones(),
                        p.hash_preview
                    ));
                } else {
                    out.push_str("  Identity: not initialized\n");
                }
            }
            if let Ok(Some(k)) = kairos::load_current() {
                out.push_str(&format!(
                    "  Kairos: decan={} element={}\n",
                    k.active_decan, k.dominant_element
                ));
            } else {
                out.push_str("  Kairos: unavailable\n");
            }
            Ok(out)
        }
    }
}
