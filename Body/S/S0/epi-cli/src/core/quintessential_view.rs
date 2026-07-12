// S0 ADAPTER: Body/S/S0/epi-lib — CLI view over the C kernel's quintessential knowing surface; law lives in epi-lib (m4/m5), this file only parses coords and renders.
use crate::ffi::EpiLib;

use super::{knowing, overlay, write_gate};

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
    /// Sub-branch coordinate: #2-1, #0-3-2, M2-1 (= #2-1), etc.
    SubBranch { raw: String },
}

pub(crate) const FAMILY_LETTERS: [&str; 6] = ["C", "P", "L", "S", "T", "M"];
pub(crate) const FAMILY_NAMES: [&str; 6] = [
    "Category",
    "Position",
    "Lens",
    "Stack",
    "Thought",
    "Map/Subsystem",
];

const PSYCHOID_NAMES: [&str; 6] = [
    "Ground",
    "Definition",
    "Operation",
    "Pattern",
    "Context",
    "Integration",
];

const CF_DATA: [(&str, &str, &str); 7] = [
    ("CF(0000)", "Receptive Dynamism", "(00/00) Mod %"),
    ("CF(01)", "Non-Dual Binary", "(0/1) Mod 2"),
    ("CF(012)", "The Trika", "(0/1/2) Mod 3"),
    ("CF(0123)", "Three-Plus-One", "(0/1/2/3) Mod 4"),
    ("CF(4x)", "Fractal Doubling", "(4.0/1-4.4/5) Mod 4/6"),
    ("CF(450)", "Mobius Synthesis", "(4.5/0)"),
    ("CF(50)", "Total Synthesis", "(5/0) Mod 6"),
];

const WEAVE_DATA: [(&str, &str); 4] = [
    ("W0.0", "Pure Ground — #0 implicate"),
    ("W0.5", "Ground reaching Instance"),
    ("W5.0", "Instance reaching Ground"),
    ("W5.5", "Pure Instance — #5 implicate"),
];

pub(crate) const RELATION_PITHYS: [[&str; 6]; 6] = [
    ["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"],
    [
        "Ground",
        "Definition",
        "Operation",
        "Pattern",
        "Context",
        "Integration",
    ],
    [
        "Literal",
        "Functional",
        "Structural",
        "Archetypal",
        "Paradigmatic",
        "Integral",
    ],
    [
        "Terminal",
        "Obsidian",
        "Neo4j",
        "PAI Gateway",
        "Claude/PI",
        "Notion/n8n",
    ],
    ["Seed", "Spec", "Form", "Process", "Pattern", "Insight"],
    [
        "Anuttara",
        "Paramasiva",
        "Parashakti",
        "Mahamaya",
        "Nara",
        "Epii",
    ],
];

fn family_char_to_id(c: char) -> Option<u8> {
    match c.to_ascii_uppercase() {
        'C' => Some(0),
        'P' => Some(1),
        'L' => Some(2),
        'S' => Some(3),
        'T' => Some(4),
        'M' => Some(5),
        _ => None,
    }
}

/// Parse any coordinate string into a ParsedCoord
fn parse_coordinate(input: &str) -> Option<ParsedCoord> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // # operator
    if s == "#" {
        return Some(ParsedCoord::Hash);
    }

    // Psychoids: #0..#5, or sub-branches: #2-1, #0-3-0/1, #1-3-4.(0000), etc.
    if let Some(rest) = s.strip_prefix('#') {
        if let Ok(n) = rest.parse::<u8>() {
            if n <= 5 {
                return Some(ParsedCoord::Psychoid { pos: n });
            }
        }
        // Sub-branch: #N-... or #N.… where N is 0-5
        if rest.len() >= 2 {
            let first_char = rest.chars().next()?;
            if first_char.is_ascii_digit() {
                let root = first_char.to_digit(10)? as u8;
                if root <= 5 {
                    let after = &rest[1..];
                    if after.starts_with('-') || after.starts_with('.') {
                        // Normalize () nesting: #1-3-4.(0000) -> #1-3-4.0000
                        let normalized = format!("#{}", rest)
                            .replace(".(", ".")
                            .replace("-(", "-")
                            .replace(')', "");
                        return Some(ParsedCoord::SubBranch { raw: normalized });
                    }
                }
            }
        }
        return None;
    }

    // Context frames: CF(...)
    if let Some(inner) = s.strip_prefix("CF(").and_then(|r| r.strip_suffix(')')) {
        let valid = ["0000", "01", "012", "0123", "4x", "450", "50"];
        if valid.contains(&inner) {
            return Some(ParsedCoord::ContextFrame {
                label: format!("CF({})", inner),
            });
        }
        return None;
    }

    // Weaves: W0.0, W0.5, W5.0, W5.5
    if s.starts_with('W') || s.starts_with('w') {
        let rest = &s[1..];
        let valid = ["0.0", "0.5", "5.0", "5.5"];
        if valid.contains(&rest) {
            return Some(ParsedCoord::Weave {
                label: format!("W{}", rest),
            });
        }
        return None;
    }

    // Family coordinates: M0, S3, C4', P2i, etc.
    // Also sub-branches: M2-1 (= #2-1), S3-2 (= #3-2), etc.
    let first = s.chars().next()?;
    let family = family_char_to_id(first)?;
    let rest = &s[1..];

    // Check for sub-branch: <FAM><N>-<rest> or <FAM><N>.<rest>
    // e.g. M2-1, M0-3-2, M4.1-0
    if rest.len() >= 3 {
        let first_digit = rest.chars().next()?;
        if first_digit.is_ascii_digit() {
            let root = first_digit.to_digit(10)? as u8;
            if root <= 5 {
                let after = &rest[1..];
                if after.starts_with('-') || after.starts_with('.') {
                    // Map family coordinate to raw psychoid: M2-1 -> #2-1
                    // Normalize () nesting: M1-3-4.(0000) -> #1-3-4.0000
                    let normalized = format!("#{}{}", root, after)
                        .replace(".(", ".")
                        .replace("-(", "-")
                        .replace(')', "");
                    return Some(ParsedCoord::SubBranch { raw: normalized });
                }
            }
        }
    }

    // Check for inversion suffix: ' or i
    let (pos_str, inverted) = if rest.ends_with('\'') || rest.ends_with('i') || rest.ends_with('I')
    {
        (&rest[..rest.len() - 1], true)
    } else {
        (rest, false)
    };

    let pos: u8 = pos_str.parse().ok()?;
    if pos > 5 {
        return None;
    }

    Some(ParsedCoord::Family {
        family,
        pos,
        inverted,
    })
}

pub(super) fn knowing(
    epi: &EpiLib,
    coordinate: Option<&str>,
    operation: Option<&str>,
    family: Option<&str>,
    update: Option<&str>,
    coverage: bool,
    export: bool,
    bake: bool,
    open: Option<usize>,
    glow: Option<usize>,
    project: Option<&str>,
    limit: usize,
    refresh: bool,
    quick: bool,
    tui: bool,
    json: bool,
) -> color_eyre::Result<()> {
    if tui && json {
        return Err(color_eyre::eyre::eyre!(
            "--tui and --json cannot be used together"
        ));
    }
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
            color_eyre::eyre::eyre!(
                "Provide a coordinate to update: epi core knowing M0 --update \"pithy text\""
            )
        })?;
        write_gate::require_auth().map_err(|e| color_eyre::eyre::eyre!(e))?;
        return knowing_update(coord, new_pithy, json);
    }

    // No coordinate — first-contact orientation (C-4)
    let coord_str = match coordinate {
        Some(c) => c,
        None => return knowing_first_contact(json),
    };

    let parsed = parse_coordinate(coord_str).ok_or_else(|| {
        color_eyre::eyre::eyre!(
            "Invalid coordinate '{}'. Examples: M0, S3', #4, CF(012), W0.5, M2-1, #2-1-0",
            coord_str
        )
    })?;

    match parsed {
        ParsedCoord::Family {
            family,
            pos,
            inverted,
        } => knowing_family_coord(
            epi, family, pos, inverted, coord_str, open, glow, project, limit, refresh, quick, tui,
            json,
        ),
        ParsedCoord::Psychoid { pos } => knowing_psychoid(pos, json),
        ParsedCoord::Hash => knowing_hash_subop(operation, json),
        ParsedCoord::ContextFrame { ref label } => knowing_cf(label, json),
        ParsedCoord::Weave { ref label } => knowing_weave(label, json),
        ParsedCoord::SubBranch { ref raw } => knowing_subbranch(raw, json),
    }
}

pub(crate) fn branch_for_family(family: u8, inverted: bool) -> (&'static str, &'static str) {
    match (family, inverted) {
        (5, false) => ("5-0", "M+M' integral identity"),
        (5, true) => ("5-0", "M+M' integral identity"),
        (2, _) | (1, _) => ("5-1", "L+P+L'+P' theory topology"),
        (3, false) => ("5-2", "S+S' full stack"),
        (3, true) => ("5-2", "S+S' full stack"),
        (4, _) | (0, _) => ("5-5", "T+C+T'+C' Logos cycle"),
        _ => ("?", "unknown"),
    }
}

fn knowing_family_coord(
    _epi: &EpiLib,
    family: u8,
    pos: u8,
    inverted: bool,
    _coord_str: &str,
    open: Option<usize>,
    glow: Option<usize>,
    project: Option<&str>,
    limit: usize,
    refresh: bool,
    quick: bool,
    tui: bool,
    json: bool,
) -> color_eyre::Result<()> {
    let mode = if quick {
        knowing::DossierMode::Quick
    } else {
        knowing::DossierMode::Full
    };
    let dossier =
        knowing::build_family_dossier_with_mode(family, pos, inverted, project, limit, mode);

    if refresh {
        knowing::persist_dossier_snapshot(&dossier, project)?;
    }

    if tui {
        return crate::tui::knowing::run_knowing(
            dossier,
            crate::tui::knowing::FamilyRefreshSpec::new(
                family,
                pos,
                inverted,
                project.map(str::to_string),
                limit,
            ),
        );
    }

    if let Some(selection) = open {
        return execute_vimarsa_open(&dossier.vimarsa_field, selection);
    }
    if let Some(selection) = glow {
        return execute_vimarsa_glow(&dossier.vimarsa_field, selection);
    }

    if json {
        println!("{}", knowing::render::render_json(&dossier)?);
    } else {
        println!("{}", knowing::render::render_text(&dossier));
    }
    Ok(())
}

fn execute_vimarsa_open(
    vimarsa_field: &knowing::types::VimarsaFieldFacet,
    selection: usize,
) -> color_eyre::Result<()> {
    let selection_index = selection
        .checked_sub(1)
        .ok_or_else(|| color_eyre::eyre::eyre!("Selection is 1-based; received {}", selection))?;
    let path = knowing::vimarsa::selected_item_path(vimarsa_field, selection_index)
        .ok_or_else(|| color_eyre::eyre::eyre!("No Vimarsa hit at selection {}", selection))?;

    let status = std::process::Command::new("open")
        .arg(path)
        .status()
        .map_err(|e| color_eyre::eyre::eyre!("Failed to run open: {}", e))?;
    if !status.success() {
        return Err(color_eyre::eyre::eyre!(
            "open exited with status {:?}",
            status.code()
        ));
    }
    Ok(())
}

fn execute_vimarsa_glow(
    vimarsa_field: &knowing::types::VimarsaFieldFacet,
    selection: usize,
) -> color_eyre::Result<()> {
    let selection_index = selection
        .checked_sub(1)
        .ok_or_else(|| color_eyre::eyre::eyre!("Selection is 1-based; received {}", selection))?;
    let path = knowing::vimarsa::selected_item_path(vimarsa_field, selection_index)
        .ok_or_else(|| color_eyre::eyre::eyre!("No Vimarsa hit at selection {}", selection))?;

    if !(path.ends_with(".md") || path.ends_with(".markdown")) {
        return Err(color_eyre::eyre::eyre!(
            "Selection {} is not a markdown path usable with glow: {}",
            selection,
            path
        ));
    }

    let status = std::process::Command::new("glow")
        .arg(path)
        .status()
        .map_err(|e| color_eyre::eyre::eyre!("Failed to run glow: {}", e))?;
    if !status.success() {
        return Err(color_eyre::eyre::eyre!(
            "glow exited with status {:?}",
            status.code()
        ));
    }
    Ok(())
}

fn knowing_psychoid(pos: u8, json: bool) -> color_eyre::Result<()> {
    let key = format!("#{}", pos);
    let pithy = overlay::overlay_pithy(&key).unwrap_or_else(|| {
        format!(
            "{} -- raw archetype (Layer 1 .rodata)",
            PSYCHOID_NAMES[pos as usize]
        )
    });

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
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "coord": key,
                "type": "psychoid",
                "position": pos,
                "quintessence": pithy,
                "manifests_as": manifests,
            }))?
        );
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

/// C-4: First-contact orientation when `epi core knowing` is called with no coordinate.
fn knowing_first_contact(json: bool) -> color_eyre::Result<()> {
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "type": "first_contact",
                "usage": "epi core knowing <COORD>",
                "examples": ["M0", "S3'", "#4", "CF(012)", "W0.5", "M2-1"],
                "hash_portal": "epi core knowing # [essence|comms|map|navigate]",
                "families": "epi core knowing --family <C|P|L|S|T|M>",
                "hint": "The coordinate space has 6 families × 6 positions + reflective layer. Try 'epi core knowing # map' for an overview.",
            }))?
        );
    } else {
        println!("epi core knowing — Coordinate Knowledge Portal");
        println!();
        println!("Usage:");
        println!("  epi core knowing <COORD>          Look up any coordinate");
        println!("  epi core knowing # [sub-op]       # node portal (see below)");
        println!("  epi core knowing --family <FAM>   Browse a coordinate family");
        println!();
        println!("Coordinate examples:");
        println!("  M0  M4  S3'  C2  L5  P1  T3  #4  CF(012)  W0.5  M2-1");
        println!();
        println!("# Portal sub-operations:");
        println!("  epi core knowing #              — # node data (inversion act)");
        println!("  epi core knowing # essence      — Doctrine of Vibration");
        println!("  epi core knowing # comms        — Communications seed-phrases");
        println!("  epi core knowing # map          — Six families at a glance");
        println!("  epi core knowing # navigate     — Navigation guide");
        println!();
        println!(
            "Families: C (Category)  P (Position)  L (Lens)  S (Stack)  T (Thought)  M (Subsystem)"
        );
    }
    Ok(())
}

/// C-2: Route # coordinate with optional sub-operation.
fn knowing_hash_subop(operation: Option<&str>, json: bool) -> color_eyre::Result<()> {
    match operation {
        None => knowing_hash_op(json),
        Some(op) => match op.to_lowercase().as_str() {
            "essence" => knowing_hash_essence(json),
            "comms" => knowing_hash_comms(json),
            "map" => knowing_hash_map(json),
            "navigate" | "nav" => knowing_hash_navigate(json),
            other => Err(color_eyre::eyre::eyre!(
                "Unknown # sub-operation '{}'. Valid: essence | comms | map | navigate",
                other
            )),
        },
    }
}

/// C-2: `epi core knowing # essence` — Doctrine of Vibration.
fn knowing_hash_essence(json: bool) -> color_eyre::Result<()> {
    const DOV: [(&str, &str); 6] = [
        (
            "Spanda",
            "the primordial tremor; all reality is a vibration of Consciousness",
        ),
        (
            "Vimarsa",
            "self-reflective awareness; Siva knows himself through his own light",
        ),
        (
            "Svatantrya",
            "absolute freedom; Consciousness contracts and expands by its own will",
        ),
        (
            "Camatkara",
            "the aesthetic rapture of recognition; wonder as epistemological act",
        ),
        (
            "Pratibimba",
            "the reflection that is not other; image and original are one movement",
        ),
        (
            "Pratyabhijna",
            "recognition; the self remembering itself through apparent forgetting",
        ),
    ];
    if json {
        let arr: Vec<_> = DOV
            .iter()
            .map(|(k, v)| serde_json::json!({"concept": k, "pithy": v}))
            .collect();
        println!(
            "{}",
            serde_json::to_string_pretty(
                &serde_json::json!({"operation": "essence", "doctrine_of_vibration": arr})
            )?
        );
    } else {
        println!("# essence — Doctrine of Vibration (Kashmir Shaivism ground)");
        println!();
        for (i, (concept, pithy)) in DOV.iter().enumerate() {
            println!("  [{}] {:14} {}", i, concept, pithy);
        }
        println!();
        println!("Full text: epi core knowing # essence --json");
    }
    Ok(())
}

/// C-2: `epi core knowing # comms` — communications seed-phrases.
fn knowing_hash_comms(json: bool) -> color_eyre::Result<()> {
    const SEEDS: [&str; 8] = [
        "Write at the level of the seed, not the flower — the depth is in the compression",
        "The personal is the cosmic — every individual node reflects the universal topology",
        "Receptor and transformer: the system receives the world and returns it transfigured",
        "Sympathetic technology: tools that resonate with the user's own inner structure",
        "Persistent homology: the shape that survives all transformations is the real shape",
        "As above, so below — the coordinate map is fractal at every scale of resolution",
        "A living mandala: consciousness recognizes itself through its own technological mirror",
        "The oracle is not prediction but depth-sounding — touching what is already true",
    ];
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(
                &serde_json::json!({"operation": "comms", "seeds": SEEDS})
            )?
        );
    } else {
        println!("# comms — Sympathetic Technology Seed-Phrases");
        println!();
        for (i, s) in SEEDS.iter().enumerate() {
            println!("  [{}] {}", i + 1, s);
        }
        println!();
        println!("Write at the level of the seed, not the flower.");
    }
    Ok(())
}

/// C-5: `epi core knowing # map` — six families at a glance.
/// Uses FAMILY_LETTERS/FAMILY_NAMES/RELATION_PITHYS (already canonical in Rust)
/// enriched by overlay_pithy() for any user-customised coordinates.
fn knowing_hash_map(json: bool) -> color_eyre::Result<()> {
    if json {
        let arr: Vec<_> = FAMILY_LETTERS
            .iter()
            .zip(FAMILY_NAMES.iter())
            .enumerate()
            .map(|(fi, (letter, name))| {
                let positions: Vec<_> = (0..6)
                    .map(|pos| {
                        let coord = format!("{}{}", letter, pos);
                        let pithy = overlay::overlay_pithy(&coord)
                            .unwrap_or_else(|| RELATION_PITHYS[fi][pos].to_string());
                        serde_json::json!({"coord": coord, "pithy": pithy})
                    })
                    .collect();
                serde_json::json!({"letter": letter, "name": name, "positions": positions})
            })
            .collect();
        println!(
            "{}",
            serde_json::to_string_pretty(
                &serde_json::json!({"operation": "map", "families": arr})
            )?
        );
    } else {
        println!("# map — Six Coordinate Families");
        println!();
        for (fi, (letter, name)) in FAMILY_LETTERS.iter().zip(FAMILY_NAMES.iter()).enumerate() {
            println!("  {} ({})", letter, name);
            for pos in 0..6usize {
                let coord = format!("{}{}", letter, pos);
                let label = overlay::overlay_pithy(&coord)
                    .unwrap_or_else(|| RELATION_PITHYS[fi][pos].to_string());
                println!("    {:<3}  {}", coord, label);
            }
            println!();
        }
        println!("Drill in: epi core knowing <COORD>  (e.g. M4, S3', C2)");
    }
    Ok(())
}

/// C-2: `epi core knowing # navigate` — navigation guide.
fn knowing_hash_navigate(json: bool) -> color_eyre::Result<()> {
    const GUIDE: [&str; 6] = [
        "C (Category) -- ontological foundation: Bimba/Form/Entity/Process/Type/Pratibimba",
        "P (Position) -- functional semantics: Ground/Definition/Operation/Pattern/Context/Integration",
        "L (Lens) -- epistemic modes: Literal/Functional/Structural/Archetypal/Paradigmatic/Integral",
        "S (Stack) -- technology layers: Terminal/Obsidian/Neo4j/Gateway/Claude/Notion",
        "T (Thought) -- cognitive artifacts: Seed/Spec/Form/Process/Pattern/Insight",
        "M (Subsystem) -- consciousness domains: Anuttara/Paramasiva/Parashakti/Mahamaya/Nara/Epii",
    ];
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(
                &serde_json::json!({"operation": "navigate", "guide": GUIDE})
            )?
        );
    } else {
        println!("# navigate — Coordinate Navigation Guide");
        println!();
        for line in &GUIDE {
            println!("  {}", line);
        }
        println!();
        println!(
            "Operators: . (nest)  - (branch)  () (invoke)  # (invert)  & (address)  * (deref)"
        );
        println!("Deep dive: epi core knowing # map  |  epi core knowing --family <FAM>");
    }
    Ok(())
}

pub(super) fn knowing_hash_op(json: bool) -> color_eyre::Result<()> {
    let pithy = overlay::overlay_pithy("#").unwrap_or_else(|| {
        "Epi-Logos -- the inversion act, root of the Bimba map, project self-documentation"
            .to_string()
    });

    // Live `:Bimba` graph is the ONLY source for the `#` node's rich surface and
    // any `#-N` help branches — no static-dataset read. `Err` means Neo4j is
    // unreachable → HONEST-ABSENT (never a file fallback).
    let (graph_unavailable, root_description, root_core_nature, help_topics): (
        Option<String>,
        Option<String>,
        Option<String>,
        Vec<(String, String, String)>,
    ) = match load_graph_hash_portal() {
        Err(msg) => (Some(msg), None, None, Vec::new()),
        Ok(portal) => (
            None,
            portal.description,
            portal.core_nature,
            portal.help_topics,
        ),
    };

    if json {
        let mut obj = serde_json::json!({
            "coord": "#",
            "type": "RootProject",
            "name": "Epi-Logos Project",
            "quintessence": pithy,
            "layer": 0,
            "tagged_pointer_bit": 63,
            "flag": "FLAG_INVERTED",
            "subtitle": "A living mandala where consciousness recognizes itself through technological mirror",
            "graph_available": graph_unavailable.is_none(),
        });
        if let Some(ref status) = graph_unavailable {
            obj["graph_status"] = serde_json::Value::String(status.clone());
        }
        if let Some(ref cn) = root_core_nature {
            obj["coreNature"] = serde_json::Value::String(cn.clone());
        }
        if let Some(ref desc) = root_description {
            obj["description"] = serde_json::Value::String(desc.clone());
        }
        if !help_topics.is_empty() {
            obj["help_topics"] = serde_json::json!(help_topics
                .iter()
                .map(|(c, n, cn)| serde_json::json!({"coord": c, "name": n, "coreNature": cn}))
                .collect::<Vec<_>>());
        }
        println!("{}", serde_json::to_string_pretty(&obj)?);
    } else {
        println!("# — Epi-Logos Project");
        println!("Essence:");
        println!("  {}", pithy);
        println!("  Type: RootProject | Layer: 0 (The Inversion Act)");
        println!(
            "  Subtitle: A living mandala where consciousness recognizes itself through technological mirror"
        );
        if let Some(ref status) = graph_unavailable {
            println!();
            println!("Live Graph:");
            println!("  (unavailable — {status}; no static-file fallback)");
        }
        if let Some(ref cn) = root_core_nature {
            println!();
            println!("Core Nature:");
            println!("  {}", truncate_safe(cn, 200));
        }

        if !help_topics.is_empty() {
            println!();
            println!("Help Topics (epi help <topic>):");
            for (coord, name, cn) in &help_topics {
                println!("  {}  {:<14} {}", coord, name.to_lowercase(), cn);
            }
        }

        println!();
        println!("Operator Properties:");
        println!("  Function: X -> X' (phase shift into complement)");
        println!("  Tagged pointer: bit 63 (FLAG_INVERTED)");
        println!("  Property: ## = identity (double inversion returns to original)");
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
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "coord": label,
                "type": "context_frame",
                "name": name,
                "mode": mode,
                "quintessence": display_pithy,
            }))?
        );
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
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "coord": label,
                "type": "weave",
                "quintessence": display_pithy,
            }))?
        );
    } else {
        println!("{} — Weave Interleave", label);
        println!("  Quintessence: {}", display_pithy);
    }
    Ok(())
}

/// M-branch name for a root position
fn mbranch_name(root: u8) -> &'static str {
    match root {
        0 => "Anuttara",
        1 => "Paramasiva",
        2 => "Parashakti",
        3 => "Mahamaya",
        4 => "Nara",
        5 => "Epii",
        _ => "Unknown",
    }
}

/// Truncate a string to max_chars, safe for multi-byte UTF-8
fn truncate_safe(s: &str, max_chars: usize) -> String {
    let truncated: String = s.chars().take(max_chars).collect();
    if truncated.len() < s.len() {
        format!("{}...", truncated)
    } else {
        truncated
    }
}

pub(super) fn knowing_subbranch(raw: &str, json: bool) -> color_eyre::Result<()> {
    // raw is like "#2-1", "#0-3-0/1", "#4.1-0", or "#-0" through "#-5" (help branches)
    // First check overlay for a pithy
    let pithy = overlay::overlay_pithy(raw);

    // Detect help sub-branches (#-0 through #-5) — root is # itself
    let is_help_branch = raw.starts_with("#-")
        && raw.len() == 3
        && raw.chars().nth(2).map_or(false, |c| c.is_ascii_digit());

    // Extract root position from raw (always #N where N is first digit after #)
    let root: Option<u8> = if is_help_branch {
        None // help branches don't map to a psychoid root
    } else {
        Some(
            raw.chars()
                .nth(1)
                .and_then(|c| c.to_digit(10))
                .ok_or_else(|| color_eyre::eyre::eyre!("Invalid sub-branch: {}", raw))?
                as u8,
        )
    };

    // Live `:Bimba` graph is the ONLY node source. `Err` means Neo4j is
    // unreachable → HONEST-ABSENT; there is deliberately no dataset fallback.
    let lookup = load_graph_subbranch(raw);
    let graph_unavailable: Option<String> = lookup.as_ref().err().cloned();
    let graph_node: Option<GraphSubbranch> = lookup.ok().flatten();

    let node_name = graph_node.as_ref().and_then(|node| node.name.clone());
    let node_essence = graph_node.as_ref().and_then(|node| node.essence.clone());
    let node_core_nature = graph_node.as_ref().and_then(|node| node.core_nature.clone());
    let node_description = graph_node.as_ref().and_then(|node| node.description.clone());
    let children: Vec<(String, String)> = graph_node
        .as_ref()
        .map(|node| node.children.clone())
        .unwrap_or_default();

    let display_name = node_name.as_deref().unwrap_or(if graph_unavailable.is_some() {
        "(graph unavailable)"
    } else {
        "(unknown)"
    });
    let display_coord = graph_node
        .as_ref()
        .map(|node| node.coordinate.as_str())
        .unwrap_or(raw);
    let branch_label = if let Some(r) = root {
        format!("M{} {}", r, mbranch_name(r))
    } else {
        "# Epi-Logos Project".to_string()
    };

    if json {
        let mut obj = serde_json::json!({
            "coord": raw,
            "graph_coord": display_coord,
            "type": if is_help_branch { "help_topic" } else { "sub_branch" },
            "branch": branch_label,
            "name": display_name,
            "graph_available": graph_unavailable.is_none(),
        });
        if let Some(ref status) = graph_unavailable {
            obj["graph_status"] = serde_json::Value::String(status.clone());
        }
        if let Some(r) = root {
            obj["root"] = serde_json::Value::Number(r.into());
        }
        if let Some(ref p) = pithy {
            obj["quintessence"] = serde_json::Value::String(p.clone());
        }
        if let Some(ref e) = node_essence {
            obj["essence"] = serde_json::Value::String(e.clone());
        }
        if let Some(ref cn) = node_core_nature {
            obj["coreNature"] = serde_json::Value::String(cn.clone());
        }
        if let Some(ref desc) = node_description {
            obj["description"] = serde_json::Value::String(desc.clone());
        }
        if !children.is_empty() {
            obj["children"] = serde_json::json!(children
                .iter()
                .map(|(c, n)| serde_json::json!({"coord": c, "name": n}))
                .collect::<Vec<_>>());
        }
        if let Some(ref node) = graph_node {
            if !node.q_props.is_empty() {
                obj["q"] = serde_json::json!(node.q_props);
            }
            if !node.regional_props.is_empty() {
                obj["regional"] = serde_json::json!(node.regional_props);
            }
        }
        println!("{}", serde_json::to_string_pretty(&obj)?);
    } else {
        if is_help_branch {
            println!("{} — {}", display_coord, display_name);
        } else {
            println!("{} — {} sub-branch", display_coord, display_name);
        }
        if let Some(r) = root {
            println!("  Root: {} ({})", branch_label, PSYCHOID_NAMES[r as usize]);
        } else {
            println!("  Root: # (Epi-Logos Project)");
        }
        if let Some(ref p) = pithy {
            println!("  Quintessence: {}", p);
        }
        if let Some(ref cn) = node_core_nature {
            println!("  Core Nature: {}", truncate_safe(cn, 120));
        }
        if let Some(ref e) = node_essence {
            println!("  Essence: {}", truncate_safe(e, 120));
        }
        if is_help_branch {
            if let Some(ref desc) = node_description {
                println!();
                for line in desc.lines() {
                    println!("  {}", line);
                }
            }
        }
        if let Some(ref node) = graph_node {
            if !node.q_props.is_empty() {
                println!("  Quintessential Graph Surface:");
                for (key, value) in &node.q_props {
                    println!("    {}: {}", key, truncate_safe(value, 160));
                }
            }
            if !node.regional_props.is_empty() {
                println!("  Regional Graph Surface:");
                for (key, value) in &node.regional_props {
                    println!("    {}: {}", key, truncate_safe(value, 120));
                }
            }
        }
        if let Some(ref status) = graph_unavailable {
            println!(
                "  (live graph unavailable — {status}; no static-file fallback)"
            );
        } else if node_name.is_none() {
            println!("  (no live :Bimba node for this coordinate)");
        } else if pithy.is_none() && !is_help_branch {
            println!("  (no quintessence yet — use --update to add)");
        }
        if !children.is_empty() {
            println!("  Children ({}):", children.len());
            for (coord, name) in &children {
                let child_pithy = overlay::overlay_pithy(coord);
                let marker = if child_pithy.is_some() { "+" } else { " " };
                println!("    {} {} {}", marker, coord, name);
            }
        }
    }
    Ok(())
}

#[derive(Debug, Clone)]
struct GraphSubbranch {
    coordinate: String,
    name: Option<String>,
    essence: Option<String>,
    core_nature: Option<String>,
    description: Option<String>,
    q_props: Vec<(String, String)>,
    regional_props: Vec<(String, String)>,
    children: Vec<(String, String)>,
}

/// Read a coordinate's live `:Bimba` node from the graph through the SAME S2
/// seam the rest of the CLI uses (`Neo4jConfig::from_env` / `Neo4jClient`, see
/// `gate/graph.rs`). This is the only node source for `epi core knowing` sub-
/// branches — there is deliberately NO static-dataset fallback (per the C-first
/// law: JSON under `Idea/Bimba/Map/datasets/**` is a one-way Neo4j seed, never
/// serving truth). Outcomes:
///   * `Err(msg)` — Neo4j unreachable or the query failed. Callers emit
///     HONEST-ABSENT ("graph unavailable"); they must NOT read files instead.
///   * `Ok(None)` — graph reachable but no `:Bimba` node carries this coordinate.
///   * `Ok(Some(node))` — the live node: name / essence / coreNature / description
///     plus every live `q_*` property and its direct children, read as they are.
fn load_graph_subbranch(raw: &str) -> Result<Option<GraphSubbranch>, String> {
    let alternates = graph_coordinate_alternates(raw);
    let quoted = alternates
        .iter()
        .map(|coord| format!("'{}'", escape_cypher_literal(coord)))
        .collect::<Vec<_>>()
        .join(", ");

    // Regional surface = fixed cross-family keys + any M'-projection keys.
    // Collected over a candidate list so absent keys simply drop out (the graph
    // decides what exists, not a hard-coded RETURN list).
    let mut regional_candidates = vec![
        "l_4_mef_condition".to_string(),
        "s_4_function_role".to_string(),
        "t_1_epistemic_function".to_string(),
        "t_5_next_evolution_phase".to_string(),
    ];
    regional_candidates.extend(graph_m_prime_surface_keys(raw));
    let regional_list = regional_candidates
        .iter()
        .map(|key| format!("'{}'", escape_cypher_literal(key)))
        .collect::<Vec<_>>()
        .join(", ");

    // The node itself. `q_*` keys are node-specific (each coordinate carries its
    // own quaternal register slugs), so collect them dynamically from `keys(n)`
    // rather than pinning a fixed set — parallel key/value lists keep order.
    let node_cypher = format!(
        "MATCH (n:Bimba) \
         WHERE n.coordinate IN [{coords}] \
         RETURN n.coordinate AS coordinate, \
                n.c_1_name AS name, \
                n.c_0_essence AS essence, \
                n.c_0_core_nature AS core_nature, \
                n.c_1_description AS description, \
                [k IN keys(n) WHERE k STARTS WITH 'q_' AND n[k] IS NOT NULL] AS q_keys, \
                [k IN keys(n) WHERE k STARTS WITH 'q_' AND n[k] IS NOT NULL | toString(n[k])] AS q_vals, \
                [x IN [{regionals}] WHERE n[x] IS NOT NULL] AS reg_keys, \
                [x IN [{regionals}] WHERE n[x] IS NOT NULL | toString(n[x])] AS reg_vals \
         LIMIT 1",
        coords = quoted,
        regionals = regional_list,
    );

    // Direct children: any coordinate exactly one separator deeper whose
    // remainder carries no further '-' branch (light/shadow and dotted context
    // frames stay inline). Coordinates are stored M-form (e.g. M2-3-1); the '#'
    // alternates are harmless extras that match nothing.
    let child_clauses = alternates
        .iter()
        .flat_map(|alt| {
            ['-', '.'].into_iter().map(move |sep| {
                let prefix = format!("{alt}{sep}");
                let plen = prefix.chars().count();
                format!(
                    "(c.coordinate STARTS WITH '{p}' AND NOT substring(c.coordinate, {plen}) CONTAINS '-')",
                    p = escape_cypher_literal(&prefix),
                    plen = plen,
                )
            })
        })
        .collect::<Vec<_>>()
        .join(" OR ");
    let child_cypher = format!(
        "MATCH (c:Bimba) WHERE {clauses} \
         RETURN c.coordinate AS coordinate, c.c_1_name AS name \
         ORDER BY c.coordinate",
        clauses = child_clauses,
    );

    let fetch = async move {
        let config = crate::graph::client::Neo4jConfig::from_env();
        let client = crate::graph::client::Neo4jClient::connect(&config)
            .map_err(|err| format!("Neo4j connect failed: {err}"))?;

        let rows = client
            .run(&node_cypher)
            .await
            .map_err(|err| format!("Neo4j node query failed: {err}"))?;
        let Some(row) = rows.first() else {
            return Ok::<Option<GraphSubbranch>, String>(None);
        };

        let q_props = zip_graph_pairs(
            row.get::<Vec<String>>("q_keys").unwrap_or_default(),
            row.get::<Vec<String>>("q_vals").unwrap_or_default(),
        );
        let regional_props = zip_graph_pairs(
            row.get::<Vec<String>>("reg_keys").unwrap_or_default(),
            row.get::<Vec<String>>("reg_vals").unwrap_or_default(),
        );

        let child_rows = client
            .run(&child_cypher)
            .await
            .map_err(|err| format!("Neo4j children query failed: {err}"))?;
        let mut children = Vec::new();
        for child in &child_rows {
            if let Ok(coord) = child.get::<String>("coordinate") {
                let name = child.get::<String>("name").unwrap_or_default();
                children.push((coord, name));
            }
        }

        Ok(Some(GraphSubbranch {
            coordinate: row
                .get::<String>("coordinate")
                .map_err(|err| format!("Neo4j row missing coordinate: {err}"))?,
            name: non_empty(row.get::<String>("name").ok()),
            essence: non_empty(row.get::<String>("essence").ok()),
            core_nature: non_empty(row.get::<String>("core_nature").ok()),
            description: non_empty(row.get::<String>("description").ok()),
            q_props,
            regional_props,
            children,
        }))
    };

    block_on_graph(fetch)
}

/// Drop a graph string value that is missing or blank.
fn non_empty(value: Option<String>) -> Option<String> {
    value.filter(|text| !text.trim().is_empty())
}

/// Zip parallel key/value lists from a Cypher comprehension into sorted pairs,
/// dropping blanks. The two comprehensions iterate the same `keys(n)` order, so
/// index i of each aligns.
fn zip_graph_pairs(keys: Vec<String>, vals: Vec<String>) -> Vec<(String, String)> {
    let mut pairs: Vec<(String, String)> = keys
        .into_iter()
        .zip(vals)
        .filter(|(_, value)| !value.trim().is_empty())
        .collect();
    pairs.sort_by(|a, b| a.0.cmp(&b.0));
    pairs
}

/// Drive a graph future to completion whether or not we are already inside a
/// tokio runtime, surfacing runtime-construction failure as a graph error
/// (HONEST-ABSENT) rather than a silent `None`.
fn block_on_graph<F, T>(fut: F) -> Result<T, String>
where
    F: std::future::Future<Output = Result<T, String>>,
{
    if let Ok(handle) = tokio::runtime::Handle::try_current() {
        tokio::task::block_in_place(|| handle.block_on(fut))
    } else {
        match tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        {
            Ok(runtime) => runtime.block_on(fut),
            Err(err) => Err(format!("tokio runtime unavailable: {err}")),
        }
    }
}

struct HashPortal {
    core_nature: Option<String>,
    description: Option<String>,
    help_topics: Vec<(String, String, String)>,
}

/// Live-graph read for the `#` root portal: the `#` node's core nature +
/// description, plus any `#-0`..`#-5` help-topic branches the graph carries.
/// Uses the same S2 seam as everything else. `Err` = Neo4j unreachable
/// (HONEST-ABSENT). Help topics are seed-only and legitimately empty when the
/// live graph does not carry them — that absence is reported, never patched from
/// a file.
fn load_graph_hash_portal() -> Result<HashPortal, String> {
    let node_cypher = "MATCH (n:Bimba) WHERE n.coordinate = '#' \
         RETURN n.c_0_core_nature AS core_nature, n.c_1_description AS description LIMIT 1";
    let help_cypher = "MATCH (n:Bimba) \
         WHERE n.coordinate STARTS WITH '#-' AND size(n.coordinate) = 3 \
         RETURN n.coordinate AS coordinate, n.c_1_name AS name, n.c_0_core_nature AS core_nature \
         ORDER BY n.coordinate";

    let fetch = async move {
        let config = crate::graph::client::Neo4jConfig::from_env();
        let client = crate::graph::client::Neo4jClient::connect(&config)
            .map_err(|err| format!("Neo4j connect failed: {err}"))?;

        let node_rows = client
            .run(node_cypher)
            .await
            .map_err(|err| format!("Neo4j '#' node query failed: {err}"))?;
        let (core_nature, description) = match node_rows.first() {
            Some(row) => (
                non_empty(row.get::<String>("core_nature").ok()),
                non_empty(row.get::<String>("description").ok()),
            ),
            None => (None, None),
        };

        let help_rows = client
            .run(help_cypher)
            .await
            .map_err(|err| format!("Neo4j '#' help-topic query failed: {err}"))?;
        let mut help_topics = Vec::new();
        for row in &help_rows {
            if let Ok(coord) = row.get::<String>("coordinate") {
                let name =
                    non_empty(row.get::<String>("name").ok()).unwrap_or_else(|| "?".to_string());
                let core = row.get::<String>("core_nature").ok().unwrap_or_default();
                help_topics.push((coord, name, core));
            }
        }

        Ok::<HashPortal, String>(HashPortal {
            core_nature,
            description,
            help_topics,
        })
    };

    block_on_graph(fetch)
}

fn graph_m_prime_surface_keys(raw: &str) -> Vec<String> {
    let Some(prefix) = graph_m_prime_property_prefix(raw) else {
        return Vec::new();
    };
    [
        "topological_significance",
        "abjad_value",
        "degree",
        "two_stroke_doctrine",
        "lacanian_interface",
        "matrix_constant",
        "consciousness_operation",
        "grammatical_function",
        "processual_topology_role",
        "dhikr_application",
        "rotational_phase",
        "temporal_structure",
        "archaeology_method",
    ]
    .iter()
    .map(|semantic| format!("{prefix}_{semantic}"))
    .collect()
}

fn graph_m_prime_property_prefix(raw: &str) -> Option<String> {
    let normalized = raw
        .strip_prefix('#')
        .map(|rest| format!("M{rest}"))
        .unwrap_or_else(|| raw.to_string());
    let mut chars = normalized.chars();
    if chars.next()? != 'M' {
        return None;
    }
    let root = chars.next()?.to_digit(10)?;
    let mut prefix = format!("m_{root}");
    if chars.next() == Some('-') {
        let slot = chars
            .take_while(|ch| ch.is_ascii_digit())
            .collect::<String>();
        if !slot.is_empty() {
            prefix.push('_');
            prefix.push_str(&slot);
        }
    }
    Some(prefix)
}

fn graph_coordinate_alternates(raw: &str) -> Vec<String> {
    let mut alternates = vec![raw.to_string()];
    if let Some(rest) = raw.strip_prefix('#') {
        alternates.push(format!("M{}", rest));
    }
    alternates.sort();
    alternates.dedup();
    alternates
}

fn escape_cypher_literal(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

fn knowing_family(fam_str: &str, json: bool) -> color_eyre::Result<()> {
    let fam_char = fam_str
        .trim()
        .chars()
        .next()
        .ok_or_else(|| color_eyre::eyre::eyre!("Empty family string"))?
        .to_ascii_uppercase();

    let (family_name, coords): (&str, Vec<(&str, &str)>) = match fam_char {
        'C' => (
            "Category",
            vec![
                ("C0", "Bimba — canonical source"),
                ("C1", "Form — essential nature"),
                ("C2", "Entity — atomic units"),
                ("C3", "Process — canvas workspace"),
                ("C4", "Type — formal pattern"),
                ("C5", "Pratibimba — instance/reflection"),
            ],
        ),
        'P' => (
            "Position",
            vec![
                ("P0", "Ground — functional base"),
                ("P1", "Definition — boundary setting"),
                ("P2", "Operation — transformation"),
                ("P3", "Pattern — recurring structure"),
                ("P4", "Context — environmental frame"),
                ("P5", "Integration — synthesis"),
            ],
        ),
        'L' => (
            "Lens",
            vec![
                ("L0", "Literal — surface reading"),
                ("L1", "Functional — operational view"),
                ("L2", "Structural — form analysis"),
                ("L3", "Archetypal — deep pattern"),
                ("L4", "Paradigmatic — model-level"),
                ("L5", "Integral — unified view"),
            ],
        ),
        'S' => (
            "Stack",
            vec![
                ("S0", "Terminal/CLI — bare metal interface"),
                ("S1", "Obsidian — vault knowledge base"),
                ("S2", "Neo4j/Redis — graph + cache"),
                ("S3", "PAI Gateway — WebSocket relay"),
                ("S4", "Claude/PI — agent orchestration"),
                ("S5", "Notion/n8n — sync + webhooks"),
            ],
        ),
        'T' => (
            "Thought",
            vec![
                ("T0", "Seed — originating impulse"),
                ("T1", "Spec — formal specification"),
                ("T2", "Form — structured artifact"),
                ("T3", "Process — workflow/method"),
                ("T4", "Pattern — recurring template"),
                ("T5", "Insight — quintessential understanding"),
            ],
        ),
        'M' => (
            "Map/Subsystem",
            vec![
                ("M0", "Anuttara — absolute ground, vimarsa engine"),
                ("M1", "Paramasiva — bliss matrices, spanda engine"),
                ("M2", "Parashakti — 72-invariant, planets, elements"),
                ("M3", "Mahamaya — codons, hexagrams, Gene Keys"),
                ("M4", "Nara — personal dialogical interface, oracle"),
                ("M5", "Epii — holographic integration, Logos FSM"),
            ],
        ),
        '#' => {
            // Pseudo-family: raw psychoids
            let mut items: Vec<(String, String)> = Vec::new();
            items.push(("#".into(), "The Inversion Operation — X -> X'".into()));
            for i in 0..6 {
                let key = format!("#{}", i);
                let pithy =
                    overlay::overlay_pithy(&key).unwrap_or_else(|| PSYCHOID_NAMES[i].to_string());
                items.push((key, pithy));
            }
            if json {
                let jitems: Vec<_> = items
                    .iter()
                    .map(|(c, d)| serde_json::json!({ "coord": c, "description": d }))
                    .collect();
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "family": "Raw Psychoids",
                        "letter": "#",
                        "coordinates": jitems,
                    }))?
                );
            } else {
                println!("Raw Psychoids (#) — 7 coordinates:\n");
                for (c, d) in &items {
                    println!("  {:<8} {}", c, d);
                }
            }
            return Ok(());
        }
        _ if fam_str.eq_ignore_ascii_case("CF") => {
            if json {
                let items: Vec<_> = CF_DATA
                    .iter()
                    .map(|(l, n, m)| serde_json::json!({ "coord": l, "name": n, "mode": m }))
                    .collect();
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "family": "Context Frames",
                        "coordinates": items,
                    }))?
                );
            } else {
                println!("Context Frames (CF) — 7 roots:\n");
                for (l, n, m) in &CF_DATA {
                    println!("  {:<12} {:<22} {}", l, n, m);
                }
            }
            return Ok(());
        }
        _ if fam_str.eq_ignore_ascii_case("VAK") || fam_str.eq_ignore_ascii_case("R") => {
            let vak_data: [(&str, &str); 6] = [
                (
                    "CPF",
                    "Category-Position-Frame — cross-coordinate context mapping",
                ),
                ("CT", "Context-Time — temporal frame operations"),
                ("CP", "Context-Position — positional frame instantiation"),
                (
                    "CF_R",
                    "Context-Frame — #4 Lemniscate anchor, primary nesting",
                ),
                ("CFP", "Context-Frame-Position — nested frame operations"),
                ("CS", "Context-System — system-wide contextual state"),
            ];
            if json {
                let items: Vec<_> = vak_data
                    .iter()
                    .map(|(l, d)| {
                        let key = l.to_string();
                        let pithy = overlay::overlay_pithy(&key).unwrap_or_else(|| d.to_string());
                        serde_json::json!({ "coord": l, "description": pithy })
                    })
                    .collect();
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "family": "VAK Reflective Coordinates",
                        "coordinates": items,
                    }))?
                );
            } else {
                println!("VAK Reflective Coordinates — 6 coordinates:\n");
                for (l, d) in &vak_data {
                    let key = l.to_string();
                    let pithy = overlay::overlay_pithy(&key).unwrap_or_else(|| d.to_string());
                    println!("  {:<6} {}", l, pithy);
                }
            }
            return Ok(());
        }
        _ if fam_str.eq_ignore_ascii_case("W") => {
            if json {
                let items: Vec<_> = WEAVE_DATA
                    .iter()
                    .map(|(l, d)| serde_json::json!({ "coord": l, "description": d }))
                    .collect();
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "family": "Weave Interleaves",
                        "coordinates": items,
                    }))?
                );
            } else {
                println!("Weave Interleaves (W) — 4 coordinates:\n");
                for (l, d) in &WEAVE_DATA {
                    println!("  {:<6} {}", l, d);
                }
            }
            return Ok(());
        }
        _ => {
            return Err(color_eyre::eyre::eyre!(
                "Unknown family '{}'. Available: C, P, L, S, T, M, #, CF, W, VAK",
                fam_str
            ))
        }
    };

    // For standard families, also list inverted coords
    if json {
        let mut items: Vec<_> = coords
            .iter()
            .map(|(c, d)| serde_json::json!({ "coord": c, "description": d }))
            .collect();
        // Add inverted
        for i in 0..6 {
            let inv_key = format!("{}{}'", fam_char, i);
            let inv_pithy = overlay::overlay_pithy(&inv_key)
                .unwrap_or_else(|| format!("{} (inverted)", coords[i].1));
            items.push(serde_json::json!({ "coord": inv_key, "description": inv_pithy }));
        }
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "family": family_name,
                "letter": fam_char.to_string(),
                "coordinates": items,
            }))?
        );
    } else {
        println!(
            "{} ({}) — 12 coordinates (6 base + 6 inverted):\n",
            family_name, fam_char
        );
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
        println!(
            "\nUsage: epi core knowing <COORD>   (e.g. epi core knowing {}0 or {}0')",
            fam_char, fam_char
        );
    }

    Ok(())
}

fn knowing_update(coord: &str, pithy: &str, json: bool) -> color_eyre::Result<()> {
    let mut ov = overlay::load_overlay();
    let entry = ov.coordinates.entry(coord.to_string()).or_default();
    entry.essence = Some(pithy.to_string());
    ov.updated_at = chrono::Utc::now().to_rfc3339();
    overlay::save_overlay(&ov).map_err(|e| color_eyre::eyre::eyre!(e))?;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "action": "update",
                "coord": coord,
                "pithy": pithy,
                "overlay_path": overlay::overlay_path().display().to_string(),
            }))?
        );
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
            if ov
                .coordinates
                .get(&base_key)
                .and_then(|e| e.essence.as_ref())
                .is_some()
            {
                base_count += 1;
            }
            if ov
                .coordinates
                .get(&inv_key)
                .and_then(|e| e.essence.as_ref())
                .is_some()
            {
                inv_count += 1;
            }
        }
        family_stats.push((fam, base_count, inv_count));
    }

    let mut psychoid_count = 0usize;
    // Count # (the inversion operation itself)
    if ov
        .coordinates
        .get("#")
        .and_then(|e| e.essence.as_ref())
        .is_some()
    {
        psychoid_count += 1;
    }
    for i in 0..6 {
        if ov
            .coordinates
            .get(&format!("#{}", i))
            .and_then(|e| e.essence.as_ref())
            .is_some()
        {
            psychoid_count += 1;
        }
    }

    let vak_labels = ["CPF", "CT", "CP", "CF_R", "CFP", "CS"];
    let vak_count = vak_labels
        .iter()
        .filter(|k| {
            ov.coordinates
                .get(**k)
                .and_then(|e| e.essence.as_ref())
                .is_some()
        })
        .count();

    let cf_labels = [
        "CF(0000)", "CF(01)", "CF(012)", "CF(0123)", "CF(4x)", "CF(450)", "CF(50)",
    ];
    let cf_count = cf_labels
        .iter()
        .filter(|k| {
            ov.coordinates
                .get(**k)
                .and_then(|e| e.essence.as_ref())
                .is_some()
        })
        .count();

    let w_labels = ["W0.0", "W0.5", "W5.0", "W5.5"];
    let w_count = w_labels
        .iter()
        .filter(|k| {
            ov.coordinates
                .get(**k)
                .and_then(|e| e.essence.as_ref())
                .is_some()
        })
        .count();

    let total_filled: usize = family_stats.iter().map(|(_, b, i)| b + i).sum::<usize>()
        + psychoid_count
        + cf_count
        + w_count
        + vak_count;
    let total_possible = 72 + 7 + 7 + 4 + 6; // 96: 72 family, 7 psychoid-class (#,#0-#5), 7 CF, 4 weave, 6 VAK

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "families": family_stats.iter().map(|(f, b, i)| {
                    serde_json::json!({"family": f, "base": b, "inverted": i, "total": 12})
                }).collect::<Vec<_>>(),
                "psychoids": {"filled": psychoid_count, "total": 7},
                "context_frames": {"filled": cf_count, "total": 7},
                "weaves": {"filled": w_count, "total": 4},
                "vak": {"filled": vak_count, "total": 6},
                "overall": {"filled": total_filled, "total": total_possible},
            }))?
        );
    } else {
        println!("QV Coverage Report");
        println!("==================");
        println!("Family Coordinates (72 total):");
        for (fam, base, inv) in &family_stats {
            let pct = ((*base + *inv) as f64 / 12.0 * 100.0) as u32;
            println!(
                "  {}:  {}/6  base  +  {}/6  inverted  = {}%",
                fam, base, inv, pct
            );
        }
        println!();
        println!("Raw Psychoids (#,#0-#5): {}/7", psychoid_count);
        println!("Context Frames (7):      {}/7", cf_count);
        println!("Weaves (4):              {}/4", w_count);
        println!("VAK Reflective (6):      {}/6", vak_count);
        println!();
        println!(
            "Overall: {}/{} coordinates populated ({}%)",
            total_filled,
            total_possible,
            (total_filled as f64 / total_possible as f64 * 100.0) as u32
        );
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
    let root = project_root().ok_or_else(|| {
        color_eyre::eyre::eyre!("Cannot find project root (looking for src/m5.c)")
    })?;
    let qv_path = root.join("src").join("qv_data.c");

    let ov = overlay::load_overlay();
    let families = [
        ("C", "C"),
        ("P", "P"),
        ("L", "L"),
        ("S", "S"),
        ("T", "T"),
        ("M", "M"),
    ];

    let mut lines = Vec::new();
    lines.push("/**".to_string());
    lines.push(" * qv_data.c — GENERATED by 'epi core knowing --bake'".to_string());
    lines.push(format!(
        " * Generated at: {}",
        chrono::Utc::now().to_rfc3339()
    ));
    lines.push(
        " * Do not edit manually. Update via 'epi core knowing <COORD> --update \"pithy\"'."
            .to_string(),
    );
    lines.push(" */".to_string());
    lines.push(String::new());
    lines.push("#include \"m5.h\"".to_string());
    lines.push(String::new());

    for (fam_letter, array_suffix) in &families {
        // Base array
        lines.push(format!("const char* QV_PITHY_{}[6] = {{", array_suffix));
        for pos in 0..6usize {
            let key = format!("{}{}", fam_letter, pos);
            let val = ov.coordinates.get(&key).and_then(|e| e.essence.as_ref());
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
            let val = ov.coordinates.get(&key).and_then(|e| e.essence.as_ref());
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
        let val = ov.coordinates.get(&key).and_then(|e| e.essence.as_ref());
        let comma = if i < 5 { "," } else { "" };
        match val {
            Some(p) => lines.push(format!("    \"{}\"{}", p.replace('"', "\\\""), comma)),
            None => lines.push(format!("    NULL{}", comma)),
        }
    }
    lines.push("};".to_string());
    lines.push(String::new());

    // CF roots
    let cf_keys = [
        "CF(0000)", "CF(01)", "CF(012)", "CF(0123)", "CF(4x)", "CF(450)", "CF(50)",
    ];
    lines.push("const char* QV_PITHY_CF[7] = {".to_string());
    for (i, key) in cf_keys.iter().enumerate() {
        let val = ov.coordinates.get(*key).and_then(|e| e.essence.as_ref());
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
        let val = ov.coordinates.get(*key).and_then(|e| e.essence.as_ref());
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

    let filled = ov
        .coordinates
        .values()
        .filter(|e| e.essence.is_some())
        .count();

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "action": "bake",
                "output": qv_path.display().to_string(),
                "coordinates_baked": filled,
            }))?
        );
    } else {
        println!("Baked {} coordinates to {}", filled, qv_path.display());
        println!("Run 'cargo install --path epi-cli/ --force' to compile into binary.");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn graph_coordinate_alternates_include_m_family_for_hash_subbranches() {
        assert_eq!(
            graph_coordinate_alternates("#5-1"),
            vec!["#5-1".to_string(), "M5-1".to_string()]
        );
        assert_eq!(
            graph_coordinate_alternates("M5-1"),
            vec!["M5-1".to_string()]
        );
    }

    #[test]
    fn cypher_literal_escape_covers_deep_multiline_prose() {
        assert_eq!(
            escape_cypher_literal("Sophia's\nLogos\tbridge"),
            "Sophia\\'s\\nLogos\\tbridge"
        );
    }

    #[test]
    fn non_empty_drops_blank_and_missing_graph_values() {
        assert_eq!(non_empty(None), None);
        assert_eq!(non_empty(Some("   ".to_string())), None);
        assert_eq!(non_empty(Some("\n\t".to_string())), None);
        assert_eq!(
            non_empty(Some("Decans System".to_string())),
            Some("Decans System".to_string())
        );
    }

    #[test]
    fn zip_graph_pairs_sorts_by_key_and_drops_blank_values() {
        // Cypher returns q_keys/q_vals as parallel lists in keys(n) order; the
        // helper must pair them, drop blanks, and sort deterministically.
        let keys = vec![
            "q_3_four_three_three_two_nesting".to_string(),
            "q_0_uncut_zodiacal_circle".to_string(),
            "q_9_blank".to_string(),
        ];
        let vals = vec![
            "nested product 4*3*3*2 = 72".to_string(),
            "undivided 360 circle".to_string(),
            "   ".to_string(),
        ];
        let pairs = zip_graph_pairs(keys, vals);
        assert_eq!(
            pairs,
            vec![
                (
                    "q_0_uncut_zodiacal_circle".to_string(),
                    "undivided 360 circle".to_string()
                ),
                (
                    "q_3_four_three_three_two_nesting".to_string(),
                    "nested product 4*3*3*2 = 72".to_string()
                ),
            ]
        );
    }

    #[test]
    fn zip_graph_pairs_tolerates_ragged_key_value_lengths() {
        // A value list shorter than the key list must not panic; zip truncates.
        let pairs = zip_graph_pairs(
            vec!["q_1_a".to_string(), "q_2_b".to_string()],
            vec!["only-one".to_string()],
        );
        assert_eq!(pairs, vec![("q_1_a".to_string(), "only-one".to_string())]);
    }
}
