use crate::ffi::tagged;
use crate::ffi::{self, EpiLib};
use clap::Subcommand;

pub mod overlay;
pub mod write_gate;

#[derive(Subcommand)]
pub enum CoreCmd {
    /// Inspect a coordinate (psychoid, family, CF root, weave)
    Inspect {
        /// Coordinate to inspect (e.g. #0, P3, CF(012), W0.5)
        coordinate: String,
    },
    /// Verify all 18 BIMBA entities — boot check
    Verify,
    /// Dump all .rodata bedrock
    Dump,
    /// List all 7 Context Frame roots
    Cf,
    /// Show the operator table with tagged pointer bits
    Operators,
    /// Interactive TUI dashboard
    Dashboard,
    /// Run a torus walk
    Walk {
        /// Number of steps (default: 6 for one full cycle)
        #[arg(short, long, default_value = "6")]
        steps: u32,
    },
    /// Apply # inversion to a mutable copy of a coordinate
    Hash {
        /// Coordinate to invert (e.g. #0, #3)
        coordinate: String,
    },
    /// Interactive torus walk TUI (step-by-step with space/r/c keys)
    WalkTui,
    /// Family explorer — browse all 36 family coordinates (6 families × 6 positions)
    Families,
    /// M5 (Epii) holographic integration — Logos FSM, QV lookup
    M5,
    /// Look up a coordinate's quintessential self-knowledge (M5 self-API)
    Knowing {
        /// Coordinate to look up (e.g. M0, S3, C4, P2, L5, T1)
        coordinate: Option<String>,

        /// List all available coordinates in a family (C, P, L, S, T, M)
        #[arg(long)]
        family: Option<String>,

        /// Update a coordinate's pithy in the JSON overlay (write-gated)
        #[arg(long)]
        update: Option<String>,

        /// Show QV coverage report
        #[arg(long)]
        coverage: bool,

        /// Export all QV data as JSON
        #[arg(long)]
        export: bool,

        /// Bake overlay data into C source (write-gated, generates src/qv_data.c)
        #[arg(long)]
        bake: bool,
    },
}

pub fn dispatch(cmd: &CoreCmd, epi: &EpiLib, json: bool) -> color_eyre::Result<()> {
    match cmd {
        CoreCmd::Inspect { coordinate } => inspect(epi, coordinate, json),
        CoreCmd::Verify => verify(epi, json),
        CoreCmd::Dump => dump(epi, json),
        CoreCmd::Cf => cf_roots(epi, json),
        CoreCmd::Operators => operators(json),
        CoreCmd::Dashboard => crate::tui::run_dashboard(epi),
        CoreCmd::Walk { steps } => walk(epi, *steps, json),
        CoreCmd::Hash { coordinate } => hash(epi, coordinate, json),
        CoreCmd::WalkTui => crate::tui::run_walk(epi),
        CoreCmd::Families => crate::tui::run_families(epi),
        CoreCmd::M5 => crate::tui::run_m5(epi),
        CoreCmd::Knowing { coordinate, family, update, coverage, export, bake } =>
            knowing(epi, coordinate.as_deref(), family.as_deref(),
                    update.as_deref(), *coverage, *export, *bake, json),
    }
}

/// Resolve a coordinate query string to a pointer
fn resolve_coord(epi: &EpiLib, query: &str) -> Option<(*const ffi::HolographicCoordinate, String)> {
    let q = query.trim();
    // Psychoids: #0..#5, #, #hash
    if q == "#" || q.eq_ignore_ascii_case("#hash") {
        return Some((epi.psychoid_hash, "Psychoid_Hash (#)".into()));
    }
    if let Some(rest) = q.strip_prefix('#') {
        if let Ok(n) = rest.parse::<u8>() {
            if let Some(p) = epi.psychoid(n) {
                return Some((p, format!("Psychoid_{}", n)));
            }
        }
    }
    // Weaves: W0.0, W0.5, W5.0, W5.5
    if q.eq_ignore_ascii_case("W0.0") {
        return Some((epi.weave_0_0, "Weave_0_0".into()));
    }
    if q.eq_ignore_ascii_case("W0.5") {
        return Some((epi.weave_0_5, "Weave_0_5".into()));
    }
    if q.eq_ignore_ascii_case("W5.0") {
        return Some((epi.weave_5_0, "Weave_5_0".into()));
    }
    if q.eq_ignore_ascii_case("W5.5") {
        return Some((epi.weave_5_5, "Weave_5_5".into()));
    }
    // CF roots: CF(0000), CF(01), etc.
    if let Some(inner) = q.strip_prefix("CF(").and_then(|s| s.strip_suffix(')')) {
        return match inner {
            "0000" => Some((epi.cf_0000, "CF_0000".into())),
            "01" => Some((epi.cf_01, "CF_01".into())),
            "012" => Some((epi.cf_012, "CF_012".into())),
            "0123" => Some((epi.cf_0123, "CF_0123".into())),
            "4x" => Some((epi.cf_4x, "CF_4x".into())),
            "450" => Some((epi.cf_450, "CF_450".into())),
            "50" => Some((epi.cf_50, "CF_50".into())),
            _ => None,
        };
    }
    None
}

fn inspect(epi: &EpiLib, coord: &str, json: bool) -> color_eyre::Result<()> {
    let (ptr, name) = resolve_coord(epi, coord)
        .ok_or_else(|| color_eyre::eyre::eyre!("Unknown coordinate: {}", coord))?;

    let snap = ffi::read_coord(ptr)
        .ok_or_else(|| color_eyre::eyre::eyre!("Null pointer for {}", coord))?;

    if json {
        println!("{}", serde_json::to_string_pretty(&snap)?);
        return Ok(());
    }

    println!("┌─ {} ─────────────────────────────────────┐", name);
    println!(
        "│ ql_position:    0x{:02X} ({})",
        snap.ql_position,
        position_name(snap.ql_position)
    );
    println!(
        "│ family:         {} ({})",
        snap.family as u8,
        snap.family.name()
    );
    println!(
        "│ inversion:      {}",
        if snap.inversion_state == 0 {
            "normal"
        } else {
            "inverted ('"
        }
    );
    println!(
        "│ flags:          0x{:02X} [{}]",
        snap.flags,
        tagged::flags_description(snap.flags)
    );
    println!("│ weave_state:    {:.2}", snap.weave_state);
    println!(
        "│ invoke_process: {}",
        if snap.has_invoke { "yes" } else { "none" }
    );
    println!("│");
    println!("│ ── Pointer Web (12-fold Intra-Openness) ──");
    println!("│  Base:");
    println!("│   .c   = {}", snap.c.display());
    println!("│   .p   = {}", snap.p.display());
    println!("│   .l   = {}", snap.l.display());
    println!("│   .s   = {}", snap.s.display());
    println!("│   .t   = {}", snap.t.display());
    println!("│   .m   = {}", snap.m.display());
    println!("│  Reflective:");
    println!("│   .cpf = {}", snap.cpf.display());
    println!("│   .ct  = {}", snap.ct.display());
    println!("│   .cp  = {}", snap.cp.display());
    println!("│   .cf  = {}", snap.cf.display());
    println!("│   .cfp = {}", snap.cfp.display());
    println!("│   .cs  = {}", snap.cs.display());
    println!("└──────────────────────────────────────────────┘");
    Ok(())
}

fn verify(epi: &EpiLib, json: bool) -> color_eyre::Result<()> {
    let mut checks: Vec<(&str, bool)> = Vec::new();

    // Core wiring
    unsafe {
        checks.push((
            "#0.c == &Psychoid_0 (self-ref)",
            tagged::get_ptr((*epi.psychoid_0).c as *const _) == epi.psychoid_0,
        ));
        checks.push((
            "#5.c == &Psychoid_0 (Möbius)",
            tagged::get_ptr((*epi.psychoid_5).c as *const _) == epi.psychoid_0,
        ));
        checks.push((
            "#4.cf == &Psychoid_4 (Lemniscate)",
            tagged::get_ptr((*epi.psychoid_4).cf as *const _) == epi.psychoid_4,
        ));
        checks.push((
            "#3.cf == &Psychoid_4",
            tagged::get_ptr((*epi.psychoid_3).cf as *const _) == epi.psychoid_4,
        ));
        checks.push((
            "Psychoid_Hash.ql_position == 0xFF",
            (*epi.psychoid_hash).ql_position == 0xFF,
        ));
        checks.push((
            "Psychoid_Hash.cf == &Psychoid_4",
            tagged::get_ptr((*epi.psychoid_hash).cf as *const _) == epi.psychoid_4,
        ));

        // CF roots
        let cf_roots: &[(&str, *const ffi::HolographicCoordinate)] = &[
            ("CF_0000", epi.cf_0000),
            ("CF_01", epi.cf_01),
            ("CF_012", epi.cf_012),
            ("CF_0123", epi.cf_0123),
            ("CF_4x", epi.cf_4x),
            ("CF_450", epi.cf_450),
            ("CF_50", epi.cf_50),
        ];
        for (name, ptr) in cf_roots {
            let ok = tagged::get_ptr((**ptr).cf as *const _) == epi.psychoid_4;
            checks.push(("CF.cf == &Psychoid_4", ok));
            let _ = name; // used for context
        }

        // BIMBA flags
        for (name, ptr) in &epi.all_bimba() {
            let ok = (**ptr).flags & tagged::FLAG_BIMBA != 0;
            checks.push(("BIMBA flag set", ok));
            let _ = name;
        }
    }

    let passed = checks.iter().filter(|(_, ok)| *ok).count();
    let total = checks.len();

    if json {
        #[derive(serde::Serialize)]
        struct VerifyResult {
            passed: usize,
            total: usize,
            all_ok: bool,
        }
        println!(
            "{}",
            serde_json::to_string_pretty(&VerifyResult {
                passed,
                total,
                all_ok: passed == total
            })?
        );
        return Ok(());
    }

    println!("=== epi core verify — Boot Verification ===\n");
    // Show key structural checks
    let labels = [
        "#0.c self-reference (Ground)",
        "#5.c Möbius return → #0",
        "#4.cf Lemniscate self-fold",
        "#3.cf → #4 anchor",
        "Psychoid_Hash position = 0xFF",
        "Psychoid_Hash.cf → #4",
    ];
    for (i, label) in labels.iter().enumerate() {
        let ok = checks[i].1;
        println!("  {} {}", if ok { "✓" } else { "✗" }, label);
    }
    println!();
    println!(
        "  7 CF roots anchored to #4: {}",
        if checks[6..13].iter().all(|c| c.1) {
            "✓ all OK"
        } else {
            "✗ FAILED"
        }
    );
    println!(
        "  18 BIMBA flags:            {}",
        if checks[13..].iter().all(|c| c.1) {
            "✓ all OK"
        } else {
            "✗ FAILED"
        }
    );
    println!(
        "\n  Result: {}/{} checks passed {}",
        passed,
        total,
        if passed == total {
            "— ALL OK"
        } else {
            "— FAILURES DETECTED"
        }
    );
    Ok(())
}

fn dump(epi: &EpiLib, json: bool) -> color_eyre::Result<()> {
    let entities = epi.all_bimba();

    if json {
        let snaps: Vec<_> = entities
            .iter()
            .filter_map(|(name, ptr)| {
                ffi::read_coord(*ptr).map(|s| serde_json::json!({ "name": name, "data": s }))
            })
            .collect();
        println!("{}", serde_json::to_string_pretty(&snaps)?);
        return Ok(());
    }

    println!("=== epi core dump — 18 BIMBA Entities ===\n");
    println!(
        "{:<20} {:>4} {:>8} {:>6} {:>8} {:>6}",
        "Name", "Pos", "Family", "Flags", "Weave", "Inv"
    );
    println!("{}", "─".repeat(60));
    for (name, ptr) in &entities {
        if let Some(s) = ffi::read_coord(*ptr) {
            println!(
                "{:<20} 0x{:02X} {:>8} 0x{:02X}   {:>6.2} {:>5}",
                name,
                s.ql_position,
                s.family.letter(),
                s.flags,
                s.weave_state,
                if s.inversion_state == 0 { " " } else { "'" },
            );
        }
    }
    Ok(())
}

fn cf_roots(epi: &EpiLib, json: bool) -> color_eyre::Result<()> {
    let roots = [
        (
            "CF(0000)",
            "Receptive Dynamism",
            "(00/00) Mod%",
            epi.cf_0000,
        ),
        ("CF(01)", "Non-Dual Binary", "(0/1) Mod 2", epi.cf_01),
        ("CF(012)", "The Trika", "(0/1/2) Mod 3", epi.cf_012),
        ("CF(0123)", "Three-Plus-One", "(0/1/2/3) Mod 4", epi.cf_0123),
        (
            "CF(4x)",
            "Fractal Doubling",
            "(4.0/1-4.4/5) Mod 4/6",
            epi.cf_4x,
        ),
        ("CF(450)", "Möbius Synthesis", "(4/5/0)", epi.cf_450),
        ("CF(50)", "Total Synthesis", "(5/0) Mod 6", epi.cf_50),
    ];

    if json {
        let data: Vec<_> = roots
            .iter()
            .filter_map(|(name, desc, mode, ptr)| {
                ffi::read_coord(*ptr).map(|s| {
                    serde_json::json!({
                        "name": name, "description": desc, "mode": mode, "data": s
                    })
                })
            })
            .collect();
        println!("{}", serde_json::to_string_pretty(&data)?);
        return Ok(());
    }

    println!("=== Context Frame Roots — 7 Processual Execution Contexts ===\n");
    println!(
        "{:<12} {:<22} {:<24} {:>6}",
        "Name", "Description", "Mode", "Weave"
    );
    println!("{}", "─".repeat(68));
    for (name, desc, mode, ptr) in &roots {
        if let Some(s) = ffi::read_coord(*ptr) {
            println!(
                "{:<12} {:<22} {:<24} {:>6.3}",
                name, desc, mode, s.weave_state
            );
        }
    }
    println!("\nInvariant: ALL .cf → &Psychoid_4 (Lemniscate anchor)");
    Ok(())
}

fn operators(json: bool) -> color_eyre::Result<()> {
    #[derive(serde::Serialize)]
    struct Op {
        symbol: &'static str,
        name: &'static str,
        bit: &'static str,
        function: &'static str,
    }

    let ops = vec![
        Op {
            symbol: "#",
            name: "Inversion",
            bit: "63 FLAG_INVERTED",
            function: "X → X' (phase shift)",
        },
        Op {
            symbol: "' / i",
            name: "Phase Marker",
            bit: "inversion_state field",
            function: "Denotes result of # applied",
        },
        Op {
            symbol: ".",
            name: "Nesting",
            bit: "62 FLAG_NESTING",
            function: "Fractal descent via cf",
        },
        Op {
            symbol: "-",
            name: "Branching",
            bit: "61 FLAG_BRANCHING",
            function: "Lateral relation",
        },
        Op {
            symbol: "()",
            name: "Invocation",
            bit: "60 FLAG_EXECUTING",
            function: "Fires invoke_process",
        },
        Op {
            symbol: "/",
            name: "Path Separator",
            bit: "N/A (notation)",
            function: "Separates CF mode components",
        },
    ];

    if json {
        println!("{}", serde_json::to_string_pretty(&ops)?);
        return Ok(());
    }

    println!("=== Coordinate Operators ===\n");
    println!(
        "{:<8} {:<16} {:<28} {}",
        "Symbol", "Name", "Tagged Pointer Bit", "Function"
    );
    println!("{}", "─".repeat(76));
    for op in &ops {
        println!(
            "{:<8} {:<16} {:<28} {}",
            op.symbol, op.name, op.bit, op.function
        );
    }
    Ok(())
}

fn walk(epi: &EpiLib, steps: u32, json: bool) -> color_eyre::Result<()> {
    let mut ctx = ffi::WalkContext::default();

    // Run the walk
    epi.torus_walk(epi.psychoid_0, &mut ctx, steps);

    if json {
        println!("{}", serde_json::to_string_pretty(&ctx)?);
        return Ok(());
    }

    println!("=== Torus Walk — {} steps ===\n", steps);
    println!("  #0 → #1 → #2 → #3 → #4 ⊸ cf → #5 → #0 (Möbius) ↻");
    println!();
    println!("  Final position: #{}", ctx.current_position);
    println!("  Steps taken:    {}", ctx.step_count);
    println!("  Cycles:         {}", ctx.cycle_count);
    println!(
        "  Covering:       {}",
        if ctx.covering == 0 {
            "Normal"
        } else {
            "Inverted"
        }
    );
    Ok(())
}

fn hash(epi: &EpiLib, coord: &str, json: bool) -> color_eyre::Result<()> {
    let (ptr, name) = resolve_coord(epi, coord)
        .ok_or_else(|| color_eyre::eyre::eyre!("Unknown coordinate: {}", coord))?;

    // Create a mutable copy
    let mut copy: ffi::HolographicCoordinate = unsafe { std::ptr::read(ptr) };
    let before = copy.inversion_state;

    epi.execute_hash(&mut copy);
    let after = copy.inversion_state;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "coordinate": name,
                "before": before,
                "after": after,
            }))?
        );
        return Ok(());
    }

    println!("=== # Inversion Applied to {} ===\n", name);
    println!(
        "  Before: inversion_state = {} ({})",
        before,
        if before == 0 { "normal" } else { "inverted" }
    );
    println!(
        "  After:  inversion_state = {} ({})",
        after,
        if after == 0 { "normal" } else { "inverted" }
    );
    println!("  ## = identity: applying # twice returns to original state");
    Ok(())
}

pub fn position_name(pos: u8) -> &'static str {
    match pos {
        0 => "Ground",
        1 => "Form",
        2 => "Operation",
        3 => "Pattern",
        4 => "Context/Lemniscate",
        5 => "Integration/Möbius",
        0xFF => "Hash (#)",
        _ => "Unknown",
    }
}

/// Parsed coordinate — covers all types in the system
enum ParsedCoord {
    /// Family coordinate: C0, M5, S3', P2i, etc.
    Family { family: u8, pos: u8, inverted: bool },
    /// Raw psychoid: #0 through #5
    Psychoid { pos: u8 },
    /// The # inversion operator itself
    Hash,
    /// Context frame root: CF(012), CF(50), etc.
    ContextFrame { label: String },
    /// Weave interleave: W0.0, W0.5, W5.0, W5.5
    Weave { label: String },
}

const FAMILY_LETTERS: [&str; 6] = ["C", "P", "L", "S", "T", "M"];
const FAMILY_NAMES: [&str; 6] = ["Category", "Position", "Lens", "Stack", "Thought", "Map/Subsystem"];

const PSYCHOID_NAMES: [&str; 6] = ["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"];

const CF_DATA: [(&str, &str, &str); 7] = [
    ("CF(0000)", "Receptive Dynamism", "(00/00) Mod %"),
    ("CF(01)",   "Non-Dual Binary",   "(0/1) Mod 2"),
    ("CF(012)",  "The Trika",         "(0/1/2) Mod 3"),
    ("CF(0123)", "Three-Plus-One",    "(0/1/2/3) Mod 4"),
    ("CF(4x)",   "Fractal Doubling",  "(4.0/1-4.4/5) Mod 4/6"),
    ("CF(450)",  "Mobius Synthesis",   "(4/5/0)"),
    ("CF(50)",   "Total Synthesis",   "(5/0) Mod 6"),
];

const WEAVE_DATA: [(&str, &str); 4] = [
    ("W0.0", "Pure Ground — #0 implicate"),
    ("W0.5", "Ground reaching Instance"),
    ("W5.0", "Instance reaching Ground"),
    ("W5.5", "Pure Instance — #5 implicate"),
];

const RELATION_PITHYS: [[&str; 6]; 6] = [
    ["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"],
    ["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"],
    ["Literal", "Functional", "Structural", "Archetypal", "Paradigmatic", "Integral"],
    ["Terminal", "Obsidian", "Neo4j", "PAI Gateway", "Claude/PI", "Notion/n8n"],
    ["Seed", "Spec", "Form", "Process", "Pattern", "Insight"],
    ["Anuttara", "Paramasiva", "Parashakti", "Mahamaya", "Nara", "Epii"],
];

fn family_char_to_id(c: char) -> Option<u8> {
    match c.to_ascii_uppercase() {
        'C' => Some(0), 'P' => Some(1), 'L' => Some(2),
        'S' => Some(3), 'T' => Some(4), 'M' => Some(5),
        _ => None,
    }
}

/// Parse any coordinate string into a ParsedCoord
fn parse_coordinate(input: &str) -> Option<ParsedCoord> {
    let s = input.trim();
    if s.is_empty() { return None; }

    // # operator
    if s == "#" { return Some(ParsedCoord::Hash); }

    // Psychoids: #0..#5
    if let Some(rest) = s.strip_prefix('#') {
        if let Ok(n) = rest.parse::<u8>() {
            if n <= 5 { return Some(ParsedCoord::Psychoid { pos: n }); }
        }
        return None;
    }

    // Context frames: CF(...)
    if let Some(inner) = s.strip_prefix("CF(").and_then(|r| r.strip_suffix(')')) {
        let valid = ["0000", "01", "012", "0123", "4x", "450", "50"];
        if valid.contains(&inner) {
            return Some(ParsedCoord::ContextFrame { label: format!("CF({})", inner) });
        }
        return None;
    }

    // Weaves: W0.0, W0.5, W5.0, W5.5
    if s.starts_with('W') || s.starts_with('w') {
        let rest = &s[1..];
        let valid = ["0.0", "0.5", "5.0", "5.5"];
        if valid.contains(&rest) {
            return Some(ParsedCoord::Weave { label: format!("W{}", rest) });
        }
        return None;
    }

    // Family coordinates: M0, S3, C4', P2i, etc.
    let first = s.chars().next()?;
    let family = family_char_to_id(first)?;
    let rest = &s[1..];

    // Check for inversion suffix: ' or i
    let (pos_str, inverted) = if rest.ends_with('\'') || rest.ends_with('i') || rest.ends_with('I') {
        (&rest[..rest.len()-1], true)
    } else {
        (rest, false)
    };

    let pos: u8 = pos_str.parse().ok()?;
    if pos > 5 { return None; }

    Some(ParsedCoord::Family { family, pos, inverted })
}

fn knowing(epi: &EpiLib, coordinate: Option<&str>, family: Option<&str>,
           update: Option<&str>, coverage: bool, export: bool, bake: bool, json: bool) -> color_eyre::Result<()> {
    // Coverage report (no coordinate needed)
    if coverage {
        return knowing_coverage(json);
    }

    // Export (no coordinate needed)
    if export {
        return knowing_export(json);
    }

    // Bake overlay -> C source (write-gated)
    if bake {
        write_gate::require_auth().map_err(|e| color_eyre::eyre::eyre!(e))?;
        return knowing_bake(json);
    }

    // Family listing
    if let Some(fam_str) = family {
        return knowing_family(fam_str, json);
    }

    // Update (write-gated, needs coordinate)
    if let Some(new_pithy) = update {
        let coord = coordinate.ok_or_else(|| {
            color_eyre::eyre::eyre!("Provide a coordinate to update: epi core knowing M0 --update \"pithy text\"")
        })?;
        write_gate::require_auth().map_err(|e| color_eyre::eyre::eyre!(e))?;
        return knowing_update(coord, new_pithy, json);
    }

    let coord_str = coordinate
        .ok_or_else(|| color_eyre::eyre::eyre!(
            "Provide a coordinate (e.g. M0, S3', #4, CF(012), W0.5) or use --family <FAMILY>"
        ))?;

    let parsed = parse_coordinate(coord_str)
        .ok_or_else(|| color_eyre::eyre::eyre!(
            "Invalid coordinate '{}'. Examples: M0, S3', #4, CF(012), W0.5",
            coord_str
        ))?;

    match parsed {
        ParsedCoord::Family { family, pos, inverted } =>
            knowing_family_coord(epi, family, pos, inverted, coord_str, json),
        ParsedCoord::Psychoid { pos } =>
            knowing_psychoid(pos, json),
        ParsedCoord::Hash =>
            knowing_hash_op(json),
        ParsedCoord::ContextFrame { ref label } =>
            knowing_cf(label, json),
        ParsedCoord::Weave { ref label } =>
            knowing_weave(label, json),
    }
}

fn branch_for_family(family: u8, inverted: bool) -> (&'static str, &'static str) {
    match (family, inverted) {
        (5, false) => ("5-0", "M+M' integral identity"),
        (5, true)  => ("5-0", "M+M' integral identity"),
        (2, _) | (1, _) => ("5-1", "L+P+L'+P' theory topology"),
        (3, false) => ("5-2", "S+S' full stack"),
        (3, true)  => ("5-2", "S+S' full stack"),
        (4, _) | (0, _) => ("5-5", "T+C+T'+C' Logos cycle"),
        _ => ("?", "unknown"),
    }
}

fn knowing_family_coord(_epi: &EpiLib, family: u8, pos: u8, inverted: bool,
                         coord_str: &str, json: bool) -> color_eyre::Result<()> {
    let family_letter = FAMILY_LETTERS[family as usize];
    let family_name = FAMILY_NAMES[family as usize];
    let inv_suffix = if inverted { "'" } else { "" };
    let display_coord = format!("{}{}{}", family_letter, pos, inv_suffix);

    // Overlay lookup uses the canonical key form
    let overlay_key = display_coord.clone();
    let pithy = overlay::overlay_pithy(&overlay_key)
        .unwrap_or_else(|| {
            let base = RELATION_PITHYS[family as usize][pos as usize];
            if inverted {
                format!("{} (inverted) -- {}", base, family_name)
            } else {
                format!("{} -- {}", base, family_name)
            }
        });

    let (branch_id, branch_name) = branch_for_family(family, inverted);

    if json {
        let mut relations = serde_json::Map::new();
        for (i, letter) in FAMILY_LETTERS.iter().enumerate() {
            relations.insert(
                letter.to_string(),
                serde_json::json!({
                    "coord": format!("{}{}", letter, pos),
                    "family": FAMILY_NAMES[i],
                    "pithy": RELATION_PITHYS[i][pos as usize],
                }),
            );
        }
        let output = serde_json::json!({
            "coord": display_coord,
            "family": family_name,
            "position": pos,
            "inverted": inverted,
            "quintessence": pithy,
            "branch": { "id": branch_id, "name": branch_name },
            "relations": relations,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else {
        println!("{} — {}{}", display_coord, family_name,
            if inverted { " (inverted phase)" } else { "" });
        println!("  Quintessence: {}", pithy);
        println!("  Branch: #{} ({})", branch_id, branch_name);
        if inverted {
            println!("  Phase: ' (result of # inversion applied to {}{})", family_letter, pos);
        }
        println!("  Relations:");
        for (i, letter) in FAMILY_LETTERS.iter().enumerate() {
            let marker = if *letter == family_letter { ">" } else { " " };
            println!("   {} {}{:<2} {}", marker, letter, pos, RELATION_PITHYS[i][pos as usize]);
        }
    }
    Ok(())
}

fn knowing_psychoid(pos: u8, json: bool) -> color_eyre::Result<()> {
    let key = format!("#{}", pos);
    let pithy = overlay::overlay_pithy(&key)
        .unwrap_or_else(|| format!("{} -- raw archetype (Layer 1 .rodata)", PSYCHOID_NAMES[pos as usize]));

    if json {
        let mut manifests = serde_json::Map::new();
        for (i, letter) in FAMILY_LETTERS.iter().enumerate() {
            manifests.insert(
                letter.to_string(),
                serde_json::json!({
                    "coord": format!("{}{}", letter, pos),
                    "family": FAMILY_NAMES[i],
                    "pithy": RELATION_PITHYS[i][pos as usize],
                }),
            );
        }
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "coord": key,
            "type": "psychoid",
            "position": pos,
            "quintessence": pithy,
            "manifests_as": manifests,
        }))?);
    } else {
        println!("#{} — Raw Archetype (Layer 1 .rodata)", pos);
        println!("  Quintessence: {}", pithy);
        println!("  Manifests as:");
        for (i, letter) in FAMILY_LETTERS.iter().enumerate() {
            println!("    {}{} {}", letter, pos, RELATION_PITHYS[i][pos as usize]);
        }
        if pos == 4 {
            println!("  Invariant: #4.cf == &Psychoid_4 (Lemniscate self-fold)");
        }
        if pos == 0 {
            println!("  Invariant: #0.c == &Psychoid_0 (self-reference)");
        }
        if pos == 5 {
            println!("  Invariant: #5.c == &Psychoid_0 (Mobius return)");
        }
    }
    Ok(())
}

fn knowing_hash_op(json: bool) -> color_eyre::Result<()> {
    if json {
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "coord": "#",
            "type": "operator",
            "quintessence": "The Inversion Act -- transforms X into X', the fundamental non-dual operation",
            "tagged_pointer_bit": 63,
            "flag": "FLAG_INVERTED",
        }))?);
    } else {
        println!("# — The Inversion Operation");
        println!("  Quintessence: The fundamental mechanism of non-duality");
        println!("  Function: X -> X' (phase shift into complement)");
        println!("  Tagged pointer: bit 63 (FLAG_INVERTED)");
        println!("  Property: ## = identity (applying # twice returns to original)");
    }
    Ok(())
}

fn knowing_cf(label: &str, json: bool) -> color_eyre::Result<()> {
    let pithy = overlay::overlay_pithy(label);
    let data = CF_DATA.iter().find(|(l, _, _)| *l == label);

    let (name, mode) = match data {
        Some((_, n, m)) => (*n, *m),
        None => ("Unknown CF", ""),
    };

    let display_pithy = pithy.unwrap_or_else(|| format!("{} -- {}", name, mode));

    if json {
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "coord": label,
            "type": "context_frame",
            "name": name,
            "mode": mode,
            "quintessence": display_pithy,
        }))?);
    } else {
        println!("{} — Context Frame Root", label);
        println!("  Quintessence: {}", display_pithy);
        println!("  Mode: {}", mode);
        println!("  Invariant: .cf -> &Psychoid_4 (Lemniscate anchor)");
    }
    Ok(())
}

fn knowing_weave(label: &str, json: bool) -> color_eyre::Result<()> {
    let pithy = overlay::overlay_pithy(label);
    let data = WEAVE_DATA.iter().find(|(l, _)| *l == label);

    let desc = match data {
        Some((_, d)) => *d,
        None => "Unknown weave",
    };

    let display_pithy = pithy.unwrap_or_else(|| desc.to_string());

    if json {
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "coord": label,
            "type": "weave",
            "quintessence": display_pithy,
        }))?);
    } else {
        println!("{} — Weave Interleave", label);
        println!("  Quintessence: {}", display_pithy);
    }
    Ok(())
}

fn knowing_family(fam_str: &str, json: bool) -> color_eyre::Result<()> {
    let fam_char = fam_str.trim().chars().next()
        .ok_or_else(|| color_eyre::eyre::eyre!("Empty family string"))?
        .to_ascii_uppercase();

    let (family_name, coords): (&str, Vec<(&str, &str)>) = match fam_char {
        'C' => ("Category", vec![
            ("C0", "Bimba — canonical source"),
            ("C1", "Form — essential nature"),
            ("C2", "Entity — atomic units"),
            ("C3", "Process — canvas workspace"),
            ("C4", "Type — formal pattern"),
            ("C5", "Pratibimba — instance/reflection"),
        ]),
        'P' => ("Position", vec![
            ("P0", "Ground — functional base"),
            ("P1", "Definition — boundary setting"),
            ("P2", "Operation — transformation"),
            ("P3", "Pattern — recurring structure"),
            ("P4", "Context — environmental frame"),
            ("P5", "Integration — synthesis"),
        ]),
        'L' => ("Lens", vec![
            ("L0", "Literal — surface reading"),
            ("L1", "Functional — operational view"),
            ("L2", "Structural — form analysis"),
            ("L3", "Archetypal — deep pattern"),
            ("L4", "Paradigmatic — model-level"),
            ("L5", "Integral — unified view"),
        ]),
        'S' => ("Stack", vec![
            ("S0", "Terminal/CLI — bare metal interface"),
            ("S1", "Obsidian — vault knowledge base"),
            ("S2", "Neo4j/Redis — graph + cache"),
            ("S3", "PAI Gateway — WebSocket relay"),
            ("S4", "Claude/PI — agent orchestration"),
            ("S5", "Notion/n8n — sync + webhooks"),
        ]),
        'T' => ("Thought", vec![
            ("T0", "Seed — originating impulse"),
            ("T1", "Spec — formal specification"),
            ("T2", "Form — structured artifact"),
            ("T3", "Process — workflow/method"),
            ("T4", "Pattern — recurring template"),
            ("T5", "Insight — quintessential understanding"),
        ]),
        'M' => ("Map/Subsystem", vec![
            ("M0", "Anuttara — absolute ground, vimarsa engine"),
            ("M1", "Paramasiva — bliss matrices, spanda engine"),
            ("M2", "Parashakti — 72-invariant, planets, elements"),
            ("M3", "Mahamaya — codons, hexagrams, Gene Keys"),
            ("M4", "Nara — personal dialogical interface, oracle"),
            ("M5", "Epii — holographic integration, Logos FSM"),
        ]),
        '#' => {
            // Pseudo-family: raw psychoids
            let mut items: Vec<(String, String)> = Vec::new();
            items.push(("#".into(), "The Inversion Operation — X -> X'".into()));
            for i in 0..6 {
                let key = format!("#{}", i);
                let pithy = overlay::overlay_pithy(&key)
                    .unwrap_or_else(|| PSYCHOID_NAMES[i].to_string());
                items.push((key, pithy));
            }
            if json {
                let jitems: Vec<_> = items.iter().map(|(c, d)| {
                    serde_json::json!({ "coord": c, "description": d })
                }).collect();
                println!("{}", serde_json::to_string_pretty(&serde_json::json!({
                    "family": "Raw Psychoids",
                    "letter": "#",
                    "coordinates": jitems,
                }))?);
            } else {
                println!("Raw Psychoids (#) — 7 coordinates:\n");
                for (c, d) in &items { println!("  {:<8} {}", c, d); }
            }
            return Ok(());
        }
        _ if fam_str.eq_ignore_ascii_case("CF") => {
            if json {
                let items: Vec<_> = CF_DATA.iter().map(|(l, n, m)| {
                    serde_json::json!({ "coord": l, "name": n, "mode": m })
                }).collect();
                println!("{}", serde_json::to_string_pretty(&serde_json::json!({
                    "family": "Context Frames",
                    "coordinates": items,
                }))?);
            } else {
                println!("Context Frames (CF) — 7 roots:\n");
                for (l, n, m) in &CF_DATA { println!("  {:<12} {:<22} {}", l, n, m); }
            }
            return Ok(());
        }
        _ if fam_str.eq_ignore_ascii_case("W") => {
            if json {
                let items: Vec<_> = WEAVE_DATA.iter().map(|(l, d)| {
                    serde_json::json!({ "coord": l, "description": d })
                }).collect();
                println!("{}", serde_json::to_string_pretty(&serde_json::json!({
                    "family": "Weave Interleaves",
                    "coordinates": items,
                }))?);
            } else {
                println!("Weave Interleaves (W) — 4 coordinates:\n");
                for (l, d) in &WEAVE_DATA { println!("  {:<6} {}", l, d); }
            }
            return Ok(());
        }
        _ => return Err(color_eyre::eyre::eyre!(
            "Unknown family '{}'. Available: C, P, L, S, T, M, #, CF, W", fam_str
        )),
    };

    // For standard families, also list inverted coords
    if json {
        let mut items: Vec<_> = coords.iter().map(|(c, d)| {
            serde_json::json!({ "coord": c, "description": d })
        }).collect();
        // Add inverted
        for i in 0..6 {
            let inv_key = format!("{}{}'", fam_char, i);
            let inv_pithy = overlay::overlay_pithy(&inv_key)
                .unwrap_or_else(|| format!("{} (inverted)", coords[i].1));
            items.push(serde_json::json!({ "coord": inv_key, "description": inv_pithy }));
        }
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "family": family_name,
            "letter": fam_char.to_string(),
            "coordinates": items,
        }))?);
    } else {
        println!("{} ({}) — 12 coordinates (6 base + 6 inverted):\n", family_name, fam_char);
        println!("  Base:");
        for (coord, desc) in &coords {
            println!("    {:<4} {}", coord, desc);
        }
        println!("  Inverted:");
        for i in 0..6 {
            let inv_key = format!("{}{}'", fam_char, i);
            let inv_pithy = overlay::overlay_pithy(&inv_key)
                .unwrap_or_else(|| format!("{} (inverted)", coords[i].1));
            println!("    {:<4} {}", inv_key, inv_pithy);
        }
        println!("\nUsage: epi core knowing <COORD>   (e.g. epi core knowing {}0 or {}0')", fam_char, fam_char);
    }

    Ok(())
}

fn knowing_update(coord: &str, pithy: &str, json: bool) -> color_eyre::Result<()> {
    let mut ov = overlay::load_overlay();
    let entry = ov.coordinates.entry(coord.to_string()).or_default();
    entry.pithy = Some(pithy.to_string());
    ov.updated_at = chrono::Utc::now().to_rfc3339();
    overlay::save_overlay(&ov).map_err(|e| color_eyre::eyre::eyre!(e))?;

    if json {
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "action": "update",
            "coord": coord,
            "pithy": pithy,
            "overlay_path": overlay::overlay_path().display().to_string(),
        }))?);
    } else {
        println!("Updated {}: \"{}\"", coord, pithy);
        println!("Overlay: {}", overlay::overlay_path().display());
    }
    Ok(())
}

fn knowing_coverage(json: bool) -> color_eyre::Result<()> {
    let ov = overlay::load_overlay();
    let families = ["C", "P", "L", "S", "T", "M"];

    let mut family_stats: Vec<(&str, usize, usize)> = Vec::new();
    for fam in &families {
        let mut base_count = 0usize;
        let mut inv_count = 0usize;
        for pos in 0..6 {
            let base_key = format!("{}{}", fam, pos);
            let inv_key = format!("{}{}'", fam, pos);
            if ov.coordinates.get(&base_key).and_then(|e| e.pithy.as_ref()).is_some() {
                base_count += 1;
            }
            if ov.coordinates.get(&inv_key).and_then(|e| e.pithy.as_ref()).is_some() {
                inv_count += 1;
            }
        }
        family_stats.push((fam, base_count, inv_count));
    }

    let mut psychoid_count = 0usize;
    for i in 0..6 {
        if ov.coordinates.get(&format!("#{}", i)).and_then(|e| e.pithy.as_ref()).is_some() {
            psychoid_count += 1;
        }
    }

    let cf_labels = ["CF(0000)", "CF(01)", "CF(012)", "CF(0123)", "CF(4x)", "CF(450)", "CF(50)"];
    let cf_count = cf_labels.iter()
        .filter(|k| ov.coordinates.get(**k).and_then(|e| e.pithy.as_ref()).is_some())
        .count();

    let w_labels = ["W0.0", "W0.5", "W5.0", "W5.5"];
    let w_count = w_labels.iter()
        .filter(|k| ov.coordinates.get(**k).and_then(|e| e.pithy.as_ref()).is_some())
        .count();

    let total_filled: usize = family_stats.iter().map(|(_, b, i)| b + i).sum::<usize>()
        + psychoid_count + cf_count + w_count;
    let total_possible = 72 + 6 + 7 + 4; // 89

    if json {
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "families": family_stats.iter().map(|(f, b, i)| {
                serde_json::json!({"family": f, "base": b, "inverted": i, "total": 12})
            }).collect::<Vec<_>>(),
            "psychoids": {"filled": psychoid_count, "total": 6},
            "context_frames": {"filled": cf_count, "total": 7},
            "weaves": {"filled": w_count, "total": 4},
            "overall": {"filled": total_filled, "total": total_possible},
        }))?);
    } else {
        println!("QV Coverage Report");
        println!("==================");
        println!("Family Coordinates (72 total):");
        for (fam, base, inv) in &family_stats {
            let pct = ((*base + *inv) as f64 / 12.0 * 100.0) as u32;
            println!("  {}:  {}/6  base  +  {}/6  inverted  = {}%", fam, base, inv, pct);
        }
        println!();
        println!("Raw Psychoids (#0-#5):  {}/6", psychoid_count);
        println!("Context Frames (7):     {}/7", cf_count);
        println!("Weaves (4):             {}/4", w_count);
        println!();
        println!("Overall: {}/{} coordinates populated ({}%)",
            total_filled, total_possible,
            (total_filled as f64 / total_possible as f64 * 100.0) as u32);
    }
    Ok(())
}

fn knowing_export(_json: bool) -> color_eyre::Result<()> {
    let ov = overlay::load_overlay();
    println!("{}", serde_json::to_string_pretty(&ov)?);
    Ok(())
}

/// Detect project root by walking up from cwd
fn project_root() -> Option<std::path::PathBuf> {
    let mut dir = std::env::current_dir().ok()?;
    for _ in 0..5 {
        if dir.join("src").join("m5.c").exists() {
            return Some(dir);
        }
        if dir.join("epi-cli").join("Cargo.toml").exists() {
            return Some(dir);
        }
        dir = dir.parent()?.to_path_buf();
    }
    None
}

fn knowing_bake(json: bool) -> color_eyre::Result<()> {
    let root = project_root()
        .ok_or_else(|| color_eyre::eyre::eyre!("Cannot find project root (looking for src/m5.c)"))?;
    let qv_path = root.join("src").join("qv_data.c");

    let ov = overlay::load_overlay();
    let families = [("C", "C"), ("P", "P"), ("L", "L"), ("S", "S"), ("T", "T"), ("M", "M")];

    let mut lines = Vec::new();
    lines.push("/**".to_string());
    lines.push(" * qv_data.c — GENERATED by 'epi core knowing --bake'".to_string());
    lines.push(format!(" * Generated at: {}", chrono::Utc::now().to_rfc3339()));
    lines.push(" * Do not edit manually. Update via 'epi core knowing <COORD> --update \"pithy\"'.".to_string());
    lines.push(" */".to_string());
    lines.push(String::new());
    lines.push("#include \"m5.h\"".to_string());
    lines.push(String::new());

    for (fam_letter, array_suffix) in &families {
        // Base array
        lines.push(format!("const char* QV_PITHY_{}[6] = {{", array_suffix));
        for pos in 0..6usize {
            let key = format!("{}{}", fam_letter, pos);
            let val = ov.coordinates.get(&key).and_then(|e| e.pithy.as_ref());
            let comma = if pos < 5 { "," } else { "" };
            match val {
                Some(p) => lines.push(format!("    \"{}\"{}", p.replace('"', "\\\""), comma)),
                None => lines.push(format!("    NULL{}", comma)),
            }
        }
        lines.push("};".to_string());

        // Inverted array
        lines.push(format!("const char* QV_PITHY_{}_INV[6] = {{", array_suffix));
        for pos in 0..6usize {
            let key = format!("{}{}'", fam_letter, pos);
            let val = ov.coordinates.get(&key).and_then(|e| e.pithy.as_ref());
            let comma = if pos < 5 { "," } else { "" };
            match val {
                Some(p) => lines.push(format!("    \"{}\"{}", p.replace('"', "\\\""), comma)),
                None => lines.push(format!("    NULL{}", comma)),
            }
        }
        lines.push("};".to_string());
        lines.push(String::new());
    }

    // Psychoids
    lines.push("const char* QV_PITHY_PSYCHOID[6] = {".to_string());
    for i in 0..6usize {
        let key = format!("#{}", i);
        let val = ov.coordinates.get(&key).and_then(|e| e.pithy.as_ref());
        let comma = if i < 5 { "," } else { "" };
        match val {
            Some(p) => lines.push(format!("    \"{}\"{}", p.replace('"', "\\\""), comma)),
            None => lines.push(format!("    NULL{}", comma)),
        }
    }
    lines.push("};".to_string());
    lines.push(String::new());

    // CF roots
    let cf_keys = ["CF(0000)", "CF(01)", "CF(012)", "CF(0123)", "CF(4x)", "CF(450)", "CF(50)"];
    lines.push("const char* QV_PITHY_CF[7] = {".to_string());
    for (i, key) in cf_keys.iter().enumerate() {
        let val = ov.coordinates.get(*key).and_then(|e| e.pithy.as_ref());
        let comma = if i < 6 { "," } else { "" };
        match val {
            Some(p) => lines.push(format!("    \"{}\"{}", p.replace('"', "\\\""), comma)),
            None => lines.push(format!("    NULL{}", comma)),
        }
    }
    lines.push("};".to_string());
    lines.push(String::new());

    // Weaves
    let w_keys = ["W0.0", "W0.5", "W5.0", "W5.5"];
    lines.push("const char* QV_PITHY_WEAVE[4] = {".to_string());
    for (i, key) in w_keys.iter().enumerate() {
        let val = ov.coordinates.get(*key).and_then(|e| e.pithy.as_ref());
        let comma = if i < 3 { "," } else { "" };
        match val {
            Some(p) => lines.push(format!("    \"{}\"{}", p.replace('"', "\\\""), comma)),
            None => lines.push(format!("    NULL{}", comma)),
        }
    }
    lines.push("};".to_string());

    let content = lines.join("\n") + "\n";
    std::fs::write(&qv_path, &content)
        .map_err(|e| color_eyre::eyre::eyre!("Failed to write {}: {}", qv_path.display(), e))?;

    let filled = ov.coordinates.values()
        .filter(|e| e.pithy.is_some())
        .count();

    if json {
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "action": "bake",
            "output": qv_path.display().to_string(),
            "coordinates_baked": filled,
        }))?);
    } else {
        println!("Baked {} coordinates to {}", filled, qv_path.display());
        println!("Run 'cargo install --path epi-cli/ --force' to compile into binary.");
    }
    Ok(())
}
