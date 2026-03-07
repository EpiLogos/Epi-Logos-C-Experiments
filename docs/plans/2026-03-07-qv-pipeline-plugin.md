# QV Pipeline, Plugin Package & Admin CLI — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the three-tier QV data pipeline (JSON overlay -> C library -> shipped binary), admin CLI commands with satya gate, initial M-branch dataset population, and the Epi-Logos plugin package structure.

**Architecture:** JSON overlay at `~/.epi-logos/qv/overlay.json` is the staging tier between verbose source data and compiled C. The `epi core knowing` command checks overlay first, then C `m5_lookup()`, then static Rust tables. Write operations are satya-gated (session passphrase). The `bake` command generates `src/qv_data.c` with static string arrays that compile into the binary. The plugin package bundles skills, resources, and scripts for cross-agent portability.

**Tech Stack:** Rust (clap CLI, serde_json), C11 (static string arrays, m5.h QV structs), JSON (overlay format), shell (install/populate scripts)

**Design Spec:** `docs/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md`

---

### Task 1: JSON Overlay File — Read/Write Infrastructure

**Files:**
- Create: `epi-cli/src/core/overlay.rs`
- Modify: `epi-cli/src/core/mod.rs` (add `mod overlay;`)

**Step 1: Create the overlay module with types**

Create `epi-cli/src/core/overlay.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct QvOverlay {
    pub version: u32,
    pub updated_at: String,
    pub coordinates: BTreeMap<String, QvEntry>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct QvEntry {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pithy: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_nature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_essence: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_formulation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_structure: Option<String>,
}

/// Returns ~/.epi-logos/qv/overlay.json, creating parent dirs if needed
pub fn overlay_path() -> PathBuf {
    let base = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join(".epi-logos").join("qv");
    std::fs::create_dir_all(&dir).ok();
    dir.join("overlay.json")
}

/// Load overlay from disk, returning empty overlay if file doesn't exist
pub fn load_overlay() -> QvOverlay {
    let path = overlay_path();
    if !path.exists() {
        return QvOverlay {
            version: 1,
            updated_at: String::new(),
            coordinates: BTreeMap::new(),
        };
    }
    match std::fs::read_to_string(&path) {
        Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
        Err(_) => QvOverlay::default(),
    }
}

/// Save overlay to disk
pub fn save_overlay(overlay: &QvOverlay) -> Result<(), String> {
    let path = overlay_path();
    let json = serde_json::to_string_pretty(overlay)
        .map_err(|e| format!("JSON serialize error: {}", e))?;
    std::fs::write(&path, json).map_err(|e| format!("Write error: {}", e))
}

/// Look up a coordinate's pithy from the overlay
pub fn overlay_pithy(coord: &str) -> Option<String> {
    let overlay = load_overlay();
    overlay
        .coordinates
        .get(coord)
        .and_then(|e| e.pithy.clone())
}
```

**Step 2: Add module declaration to mod.rs**

Add `mod overlay;` at the top of `epi-cli/src/core/mod.rs` (after the existing `use` statements, line 3).

**Step 3: Verify it compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | tail -5`
Expected: Compiles with no errors (overlay module may have unused warnings, that's fine).

**Step 4: Commit**

```bash
git add epi-cli/src/core/overlay.rs epi-cli/src/core/mod.rs
git commit -m "feat(qv): add JSON overlay read/write infrastructure"
```

---

### Task 2: Satya Gate — Session-Level Passphrase

**Files:**
- Create: `epi-cli/src/core/satya.rs`
- Modify: `epi-cli/src/core/mod.rs` (add `mod satya;`)

**Step 1: Create the satya gate module**

Create `epi-cli/src/core/satya.rs`:

```rust
use std::io::{self, Write};
use std::sync::atomic::{AtomicBool, Ordering};

/// Session-level gate. Once unlocked, stays unlocked for the process lifetime.
static SATYA_UNLOCKED: AtomicBool = AtomicBool::new(false);

const PASSPHRASE: &str = "satya";

/// Check if the gate is already unlocked. If not, prompt for the passphrase.
/// Returns Ok(()) if unlocked, Err with message if denied.
pub fn require_satya() -> Result<(), String> {
    if SATYA_UNLOCKED.load(Ordering::Relaxed) {
        return Ok(());
    }

    eprint!("Enter satya passphrase: ");
    io::stderr().flush().ok();

    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .map_err(|e| format!("Failed to read input: {}", e))?;

    if input.trim() == PASSPHRASE {
        SATYA_UNLOCKED.store(true, Ordering::Relaxed);
        Ok(())
    } else {
        Err("Incorrect passphrase. Write operations require satya authentication.".into())
    }
}
```

**Step 2: Add module declaration**

Add `mod satya;` to `epi-cli/src/core/mod.rs` (after the `mod overlay;` line).

**Step 3: Verify it compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | tail -5`
Expected: Compiles (unused warnings OK).

**Step 4: Commit**

```bash
git add epi-cli/src/core/satya.rs epi-cli/src/core/mod.rs
git commit -m "feat(qv): add satya gate — session-level passphrase for write ops"
```

---

### Task 3: Integrate Overlay into `knowing` — Three-Tier Resolution

**Files:**
- Modify: `epi-cli/src/core/mod.rs:551-661` (the `knowing` function)

This task modifies the existing `knowing` function to check the overlay FIRST, before calling `m5_lookup`.

**Step 1: Update the `knowing` function to check overlay**

In `epi-cli/src/core/mod.rs`, modify the `knowing` function. After `let coord_str = ...` (line 556) and before the M5 init block (line 568), add overlay lookup:

```rust
fn knowing(epi: &EpiLib, coordinate: Option<&str>, family: Option<&str>, json: bool) -> color_eyre::Result<()> {
    if let Some(fam_str) = family {
        return knowing_family(fam_str, json);
    }

    let coord_str = coordinate
        .ok_or_else(|| color_eyre::eyre::eyre!(
            "Provide a coordinate (e.g. M0, S3, C4) or use --family <FAMILY> to list available coords"
        ))?;

    let (fam, pos) = parse_coord_id(coord_str)
        .ok_or_else(|| color_eyre::eyre::eyre!(
            "Invalid coordinate '{}'. Use format: <FAMILY><POS> where FAMILY=C|P|L|S|T|M, POS=0-5",
            coord_str
        ))?;

    // === THREE-TIER QV RESOLUTION ===
    // Tier 1: JSON overlay (fast iteration, no recompile needed)
    let overlay_result = overlay::overlay_pithy(coord_str);

    // Tier 2: C library m5_lookup (compiled-in data)
    let c_result = {
        let mut arena = ffi::CoordinateArena {
            slots: std::ptr::null_mut(),
            capacity: 0,
            count: 0,
        };
        epi.arena_init(&mut arena, 64);
        let hc = epi.arena_alloc(&mut arena);
        unsafe {
            (*hc).ql_position = 5;
            (*hc).family = 7;
        }
        let m5_root = unsafe { ffi::m5_init(&mut arena as *mut _, hc) };
        let result = if !m5_root.is_null() {
            let coord_id = ((fam as u16 & 0x7) << 13) | ((pos as u16 & 0x7) << 10);
            unsafe {
                let ptr = ffi::m5_lookup(m5_root, coord_id, 0);
                if !ptr.is_null() {
                    Some(std::ffi::CStr::from_ptr(ptr).to_str().unwrap_or("(invalid)").to_string())
                } else {
                    None
                }
            }
        } else {
            None
        };
        if !m5_root.is_null() {
            unsafe { ffi::m5_teardown(m5_root) };
        }
        unsafe { ffi::arena_destroy(&mut arena as *mut _) };
        result
    };

    // Tier 3: Static Rust relation tables (always available)
    let relation_pithys: [&[&str; 6]; 6] = [
        &["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"],
        &["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"],
        &["Literal", "Functional", "Structural", "Archetypal", "Paradigmatic", "Integral"],
        &["Terminal", "Obsidian", "Neo4j", "PAI Gateway", "Claude/PI", "Notion/n8n"],
        &["Seed", "Spec", "Form", "Process", "Pattern", "Insight"],
        &["Anuttara", "Paramasiva", "Parashakti", "Mahamaya", "Nara", "Epii"],
    ];

    // Resolve: overlay -> C -> static
    let pithy = overlay_result
        .or(c_result)
        .unwrap_or_else(|| format!("{} — {}", relation_pithys[fam as usize][pos as usize],
            ["Category", "Position", "Lens", "Stack", "Thought", "Map/Subsystem"][fam as usize]));

    let family_letter = ["C", "P", "L", "S", "T", "M"][fam as usize];
    let family_name = ["Category", "Position", "Lens", "Stack", "Thought", "Map/Subsystem"][fam as usize];
    let family_letters = ["C", "P", "L", "S", "T", "M"];
    let family_names = ["Category", "Position", "Lens", "Stack", "Thought", "Subsystem"];

    let (branch_id, branch_name) = match fam {
        5 => ("5-0", "M+M' integral identity"),
        2 | 1 => ("5-1", "L+P+L'+P' theory topology"),
        3 => ("5-2", "S+S' full stack"),
        4 | 0 => ("5-5", "T+C+T'+C' Logos cycle"),
        _ => ("?", "unknown"),
    };

    if json {
        let mut relations = serde_json::Map::new();
        for (i, letter) in family_letters.iter().enumerate() {
            relations.insert(
                letter.to_string(),
                serde_json::json!({
                    "coord": format!("{}{}", letter, pos),
                    "family": family_names[i],
                    "pithy": relation_pithys[i][pos as usize],
                }),
            );
        }
        let output = serde_json::json!({
            "coord": format!("{}{}", family_letter, pos),
            "family": family_name,
            "position": pos,
            "quintessence": pithy,
            "branch": { "id": branch_id, "name": branch_name },
            "relations": relations,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else {
        println!("{}{} — {}", family_letter, pos, family_name);
        println!("  Quintessence: {}", pithy);
        println!("  Branch: #{} ({})", branch_id, branch_name);
        println!("  Relations:");
        for (i, letter) in family_letters.iter().enumerate() {
            let marker = if *letter == family_letter { ">" } else { " " };
            println!("   {} {}{:<2} {}", marker, letter, pos, relation_pithys[i][pos as usize]);
        }
    }

    Ok(())
}
```

**Step 2: Verify it compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | tail -5`
Expected: Compiles without errors.

**Step 3: Test manually**

Run: `~/.cargo/bin/epi core knowing M0`
Expected: Shows Tier 3 fallback (static table: "Anuttara — Map/Subsystem") since overlay and C are both empty.

**Step 4: Commit**

```bash
git add epi-cli/src/core/mod.rs
git commit -m "feat(qv): three-tier resolution — overlay -> C -> static tables"
```

---

### Task 4: Admin CLI — `update` and `coverage` Subcommands

**Files:**
- Modify: `epi-cli/src/core/mod.rs` (expand `CoreCmd::Knowing` enum, add dispatch, add handler functions)

**Step 1: Expand the Knowing command to support subcommands**

Replace the `Knowing` variant in the `CoreCmd` enum (lines 40-47 of `epi-cli/src/core/mod.rs`) and add `Update` and `Coverage`:

```rust
    /// Look up a coordinate's quintessential self-knowledge (M5 self-API)
    Knowing {
        /// Coordinate to look up (e.g. M0, S3, C4, P2, L5, T1)
        coordinate: Option<String>,

        /// List all available coordinates in a family (C, P, L, S, T, M)
        #[arg(long)]
        family: Option<String>,

        /// Update a coordinate's pithy in the JSON overlay (satya-gated)
        #[arg(long)]
        update: Option<String>,

        /// Show QV coverage report
        #[arg(long)]
        coverage: bool,

        /// Export all QV data as JSON
        #[arg(long)]
        export: bool,
    },
```

**Step 2: Update dispatch in the `knowing` function**

Modify the `knowing` function signature and add routing for new flags. Add at the top of the `knowing` function, before the family check:

```rust
fn knowing(epi: &EpiLib, coordinate: Option<&str>, family: Option<&str>,
           update: Option<&str>, coverage: bool, export: bool, json: bool) -> color_eyre::Result<()> {
    // Coverage report
    if coverage {
        return knowing_coverage(json);
    }

    // Export
    if export {
        return knowing_export(json);
    }

    // Update (satya-gated)
    if let Some(new_pithy) = update {
        let coord = coordinate.ok_or_else(|| {
            color_eyre::eyre::eyre!("Provide a coordinate to update: epi core knowing M0 --update \"pithy text\"")
        })?;
        satya::require_satya().map_err(|e| color_eyre::eyre::eyre!(e))?;
        return knowing_update(coord, new_pithy, json);
    }

    // ... rest of existing knowing logic (family listing, coordinate lookup)
```

Update the dispatch match arm too (line 63):

```rust
CoreCmd::Knowing { coordinate, family, update, coverage, export } =>
    knowing(epi, coordinate.as_deref(), family.as_deref(),
            update.as_deref(), *coverage, *export, json),
```

**Step 3: Implement `knowing_update`**

Add to `epi-cli/src/core/mod.rs`:

```rust
fn knowing_update(coord: &str, pithy: &str, json: bool) -> color_eyre::Result<()> {
    let mut ov = overlay::load_overlay();
    let entry = ov.coordinates.entry(coord.to_string()).or_default();
    entry.pithy = Some(pithy.to_string());
    ov.updated_at = chrono::Utc::now().to_rfc3339();
    overlay::save_overlay(&ov).map_err(|e| color_eyre::eyre::eyre!(e))?;

    if json {
        println!("{}", serde_json::json!({
            "action": "update",
            "coord": coord,
            "pithy": pithy,
            "overlay_path": overlay::overlay_path().display().to_string(),
        }));
    } else {
        println!("Updated {}: \"{}\"", coord, pithy);
        println!("Overlay: {}", overlay::overlay_path().display());
    }
    Ok(())
}
```

**Step 4: Implement `knowing_coverage`**

```rust
fn knowing_coverage(json: bool) -> color_eyre::Result<()> {
    let ov = overlay::load_overlay();
    let families = ["C", "P", "L", "S", "T", "M"];

    let mut family_stats: Vec<(String, usize, usize)> = Vec::new();
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
        family_stats.push((fam.to_string(), base_count, inv_count));
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
```

**Step 5: Implement `knowing_export`**

```rust
fn knowing_export(_json: bool) -> color_eyre::Result<()> {
    let ov = overlay::load_overlay();
    println!("{}", serde_json::to_string_pretty(&ov)?);
    Ok(())
}
```

**Step 6: Verify it compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | tail -10`
Expected: Compiles.

**Step 7: Install and test the update + coverage flow**

Run:
```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo install --path . --force 2>&1 | tail -3
~/.cargo/bin/epi core knowing --coverage
~/.cargo/bin/epi core knowing M0 --update "Anuttara -- absolute ground, vimarsa engine"
~/.cargo/bin/epi core knowing --coverage
~/.cargo/bin/epi core knowing M0
```

Expected:
1. Coverage shows 0% initially
2. Update prompts for satya passphrase, then writes overlay
3. Coverage shows M base 1/6
4. M0 lookup returns the overlay pithy

**Step 8: Commit**

```bash
git add epi-cli/src/core/mod.rs
git commit -m "feat(qv): add update (satya-gated), coverage, export admin commands"
```

---

### Task 5: Generate `src/qv_data.c` — The Bake Command

**Files:**
- Modify: `epi-cli/src/core/mod.rs` (add `Bake` flag to Knowing, bake handler)
- Create: `src/qv_data.c` (generated output — initially empty placeholder)
- Modify: `epi-cli/build.rs` (include qv_data.c in compilation)

**Step 1: Add bake flag to the Knowing enum**

Add to the `Knowing` variant in `CoreCmd`:

```rust
        /// Bake overlay data into C source (satya-gated, modifies src/qv_data.c)
        #[arg(long)]
        bake: bool,
```

Update dispatch to pass `*bake` and add routing in `knowing()`.

**Step 2: Create initial empty `src/qv_data.c`**

Create `src/qv_data.c`:

```c
/**
 * qv_data.c — GENERATED by 'epi core knowing --bake'
 * Do not edit manually. Update via 'epi core knowing <COORD> --update "pithy"'.
 *
 * Contains static QV pithy string arrays for all coordinate types.
 * Included by m5.c during initialization.
 */

#include "m5.h"

/* M-family pithys (M0-M5) */
const char* QV_PITHY_M[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* M-family inverted pithys (M0'-M5') */
const char* QV_PITHY_M_INV[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* S-family pithys */
const char* QV_PITHY_S[6] = {NULL, NULL, NULL, NULL, NULL, NULL};
const char* QV_PITHY_S_INV[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* C-family pithys */
const char* QV_PITHY_C[6] = {NULL, NULL, NULL, NULL, NULL, NULL};
const char* QV_PITHY_C_INV[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* P-family pithys */
const char* QV_PITHY_P[6] = {NULL, NULL, NULL, NULL, NULL, NULL};
const char* QV_PITHY_P_INV[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* L-family pithys */
const char* QV_PITHY_L[6] = {NULL, NULL, NULL, NULL, NULL, NULL};
const char* QV_PITHY_L_INV[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* T-family pithys */
const char* QV_PITHY_T[6] = {NULL, NULL, NULL, NULL, NULL, NULL};
const char* QV_PITHY_T_INV[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* Raw psychoid pithys (#0-#5) */
const char* QV_PITHY_PSYCHOID[6] = {NULL, NULL, NULL, NULL, NULL, NULL};

/* Context frame pithys (7 roots) */
const char* QV_PITHY_CF[7] = {NULL, NULL, NULL, NULL, NULL, NULL, NULL};

/* Weave pithys (4 interleaves) */
const char* QV_PITHY_WEAVE[4] = {NULL, NULL, NULL, NULL};
```

**Step 3: Add qv_data.c to build.rs**

Read `epi-cli/build.rs` first, then add `"../src/qv_data.c"` to the list of C source files compiled by the `cc` crate.

**Step 4: Implement `knowing_bake` function**

Add to `epi-cli/src/core/mod.rs`:

```rust
fn knowing_bake(json: bool) -> color_eyre::Result<()> {
    satya::require_satya().map_err(|e| color_eyre::eyre::eyre!(e))?;

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

    // Family arrays
    for (fam_letter, array_suffix) in &families {
        // Base
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

        // Inverted
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

    // Write to src/qv_data.c (relative to project root)
    let qv_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap_or(std::path::Path::new("."))
        .join("src")
        .join("qv_data.c");

    let content = lines.join("\n") + "\n";
    std::fs::write(&qv_path, &content)
        .map_err(|e| color_eyre::eyre::eyre!("Failed to write {}: {}", qv_path.display(), e))?;

    if json {
        println!("{}", serde_json::json!({
            "action": "bake",
            "output": qv_path.display().to_string(),
            "coordinates_baked": ov.coordinates.len(),
        }));
    } else {
        println!("Baked {} coordinates to {}", ov.coordinates.len(), qv_path.display());
        println!("Run 'cargo install --path epi-cli/ --force' to compile into binary.");
    }
    Ok(())
}
```

**Note:** The `env!("CARGO_MANIFEST_DIR")` macro resolves to the epi-cli directory at compile time. We need to use a runtime path instead. Replace `env!("CARGO_MANIFEST_DIR")` with a path computed from the current executable or a hardcoded project path. Simplest approach: use a relative path from the working directory, or accept a `--project-root` argument. For now, hardcode the project root detection:

```rust
// Detect project root: walk up from cwd looking for Cargo.toml in epi-cli/
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
```

Use `project_root().ok_or(...)?.join("src").join("qv_data.c")` for the output path.

**Step 5: Verify it compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | tail -10`

**Step 6: Test the full bake flow**

```bash
# Add a few entries, then bake
~/.cargo/bin/epi core knowing M0 --update "Anuttara -- absolute ground, vimarsa engine"
~/.cargo/bin/epi core knowing M5 --update "Epii -- holographic integration, recursive self-API"
~/.cargo/bin/epi core knowing --bake
cat src/qv_data.c | head -20
```

Expected: `src/qv_data.c` contains the M0 and M5 pithys as string literals, rest NULL.

**Step 7: Rebuild with baked data**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo install --path . --force 2>&1 | tail -3
```

**Step 8: Commit**

```bash
git add epi-cli/src/core/mod.rs epi-cli/build.rs src/qv_data.c
git commit -m "feat(qv): add bake command — generates src/qv_data.c from overlay"
```

---

### Task 6: Initial M-Branch Dataset Extraction

**Files:**
- Read: `docs/datasets/nodes_anuttara.json` through `nodes_epii.json` (6 files)
- Modify: `~/.epi-logos/qv/overlay.json` (via `epi core knowing --update`)

This task populates the overlay with initial pithys extracted from the dataset files. Can be done manually or via a script. The pithys are compressed from the verbose `description`/`essence` fields.

**Step 1: Extract M0-M5 root pithys from datasets**

The root-level nodes in each dataset (`#0`, `#1`, ..., `#5`) map to M0-M5. Extract the `name` and compress the `essence` field into a pithy one-liner. Use these canonical pithys:

```bash
~/.cargo/bin/epi core knowing M0 --update "Anuttara -- absolute ground, vimarsa engine, void arithmetic"
~/.cargo/bin/epi core knowing M1 --update "Paramasiva -- structural logos, quaternal logic flowering"
~/.cargo/bin/epi core knowing M2 --update "Parashakti -- vibrational matrix, 72 invariants, DET/MEF"
~/.cargo/bin/epi core knowing M3 --update "Mahamaya -- symbolic codec, codons/hexagrams/Gene Keys"
~/.cargo/bin/epi core knowing M4 --update "Nara -- personal dialogical interface, oracle engine"
~/.cargo/bin/epi core knowing M5 --update "Epii -- holographic integration, recursive self-API"
```

(Enter `satya` on first prompt.)

**Step 2: Populate psychoid pithys**

```bash
~/.cargo/bin/epi core knowing '#0' --update "Ground -- absolute source, pre-categorical bedrock"
~/.cargo/bin/epi core knowing '#1' --update "Definition -- form, boundary, logical structure"
~/.cargo/bin/epi core knowing '#2' --update "Operation -- entity, transformation, vibrational"
~/.cargo/bin/epi core knowing '#3' --update "Pattern -- process, recurring structure, symbolic"
~/.cargo/bin/epi core knowing '#4' --update "Context -- type, lemniscate anchor, frame"
~/.cargo/bin/epi core knowing '#5' --update "Integration -- synthesis, Mobius return, holographic"
```

**Step 3: Populate S-family pithys**

```bash
~/.cargo/bin/epi core knowing S0 --update "Terminal -- bare-metal CLI, process I/O"
~/.cargo/bin/epi core knowing S1 --update "Obsidian -- vault knowledge base, markdown"
~/.cargo/bin/epi core knowing S2 --update "Neo4j/Redis -- graph + cache, GraphRAG"
~/.cargo/bin/epi core knowing S3 --update "PAI Gateway -- WebSocket relay, epi-claw"
~/.cargo/bin/epi core knowing S4 --update "Claude/PI -- agent orchestration, LLM"
~/.cargo/bin/epi core knowing S5 --update "Notion/n8n -- sync, webhooks, external"
```

**Step 4: Populate CF and weave pithys**

```bash
~/.cargo/bin/epi core knowing 'CF(0000)' --update "Receptive Dynamism -- Mod %, absolute ground"
~/.cargo/bin/epi core knowing 'CF(01)' --update "Non-Dual Binary -- Mod 2, essence of implicate"
~/.cargo/bin/epi core knowing 'CF(012)' --update "The Trika -- Mod 3, User/Agent/Code"
~/.cargo/bin/epi core knowing 'CF(0123)' --update "Three-Plus-One -- Mod 4, media/medium/method"
~/.cargo/bin/epi core knowing 'CF(4x)' --update "Fractal Doubling -- Mod 4/6, Jung quaternity"
~/.cargo/bin/epi core knowing 'CF(450)' --update "Mobius Synthesis -- (4/5/0), app triad"
~/.cargo/bin/epi core knowing 'CF(50)' --update "Total Synthesis -- Mod 6, Mobius return"
~/.cargo/bin/epi core knowing W0.0 --update "Pure Ground -- #0 implicate, 0-sphere"
~/.cargo/bin/epi core knowing W0.5 --update "Ground reaching Instance -- transitional"
~/.cargo/bin/epi core knowing W5.0 --update "Instance reaching Ground -- return"
~/.cargo/bin/epi core knowing W5.5 --update "Pure Instance -- #5 implicate, integration"
```

**Step 5: Run coverage report**

Run: `~/.cargo/bin/epi core knowing --coverage`
Expected: Shows M 6/6, S 6/6, psychoids 6/6, CF 7/7, weaves 4/4. Other families at 0/6.

**Step 6: Bake and rebuild**

```bash
~/.cargo/bin/epi core knowing --bake
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo install --path . --force 2>&1 | tail -3
```

**Step 7: Verify baked data works**

```bash
~/.cargo/bin/epi core knowing M0
~/.cargo/bin/epi core knowing --coverage
```

Expected: M0 shows "Anuttara -- absolute ground, vimarsa engine, void arithmetic" from compiled C.

**Step 8: Commit overlay and baked data**

```bash
git add src/qv_data.c
git commit -m "feat(qv): populate M0-M5, S0-S5, psychoids, CF, weaves — initial dataset"
```

---

### Task 7: Plugin Package Structure

**Files:**
- Create: `epi-logos-plugin/README.md`
- Create: `epi-logos-plugin/skills/epi-knowing.md` (copy from `~/.claude/skills/epi-knowing.md`)
- Create: `epi-logos-plugin/resources/qv/schema.json`
- Create: `epi-logos-plugin/scripts/install.sh`

**Step 1: Create the plugin directory structure**

```bash
mkdir -p "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/skills"
mkdir -p "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/resources/qv"
mkdir -p "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/scripts"
mkdir -p "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/lib"
mkdir -p "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/hooks"
```

**Step 2: Copy the existing epi-knowing skill**

```bash
cp ~/.claude/skills/epi-knowing.md "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/skills/"
```

**Step 3: Create README.md**

Create `epi-logos-plugin/README.md`:

```markdown
# Epi-Logos Plugin

Coordinate self-knowledge and development workflow integration for Claude Code, Codex, and PI agent.

## Skills

- `epi-knowing` — Coordinate self-knowledge via `epi core knowing`. Use during development to ground actions in the QL coordinate system.

## Resources

- `resources/qv/overlay.json` — Default QV overlay shipped with the plugin
- `resources/qv/schema.json` — JSON schema for the overlay format

## Scripts

- `scripts/install.sh` — Install the epi CLI and copy resources to `~/.epi-logos/`

## Installation

### Claude Code
```bash
# Future: via marketplace
/plugin marketplace add epi-logos/epi-logos-marketplace
/plugin install epi-logos@epi-logos-marketplace

# Manual: copy skills to ~/.claude/skills/
cp skills/*.md ~/.claude/skills/
```

### Manual Setup
```bash
./scripts/install.sh
```

## Version

Tracks the `epi` CLI version. Currently 0.1.0.
```

**Step 4: Create schema.json**

Create `epi-logos-plugin/resources/qv/schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "QV Overlay",
  "description": "Quintessential View overlay for epi core knowing",
  "type": "object",
  "properties": {
    "version": { "type": "integer", "const": 1 },
    "updated_at": { "type": "string", "format": "date-time" },
    "coordinates": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "pithy": { "type": "string", "maxLength": 128 },
          "q_nature": { "type": "string" },
          "q_essence": { "type": "string" },
          "q_formulation": { "type": "string" },
          "q_structure": { "type": "string" }
        }
      }
    }
  },
  "required": ["version", "coordinates"]
}
```

**Step 5: Create install.sh**

Create `epi-logos-plugin/scripts/install.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Epi-Logos Plugin Installer ==="

# 1. Copy skills to ~/.claude/skills/
SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"
cp "$PLUGIN_DIR/skills/"*.md "$SKILLS_DIR/"
echo "Skills installed to $SKILLS_DIR"

# 2. Copy default overlay if none exists
QV_DIR="$HOME/.epi-logos/qv"
mkdir -p "$QV_DIR"
if [ -f "$PLUGIN_DIR/resources/qv/overlay.json" ] && [ ! -f "$QV_DIR/overlay.json" ]; then
    cp "$PLUGIN_DIR/resources/qv/overlay.json" "$QV_DIR/"
    echo "Default overlay installed to $QV_DIR"
else
    echo "Overlay already exists at $QV_DIR/overlay.json — skipping"
fi

# 3. Check if epi CLI is installed
if command -v epi &>/dev/null; then
    echo "epi CLI found: $(which epi)"
else
    echo "epi CLI not found. Install with: cargo install --path epi-cli/"
fi

echo "=== Done ==="
```

```bash
chmod +x "/Users/admin/Documents/Epi-Logos C Experiments/epi-logos-plugin/scripts/install.sh"
```

**Step 6: Commit**

```bash
git add epi-logos-plugin/
git commit -m "feat: add epi-logos plugin package — skills, resources, scripts"
```

---

### Task 8: Update Documentation

**Files:**
- Modify: `docs/dev/S0'/README.md` (add QV admin commands, overlay, bake)
- Modify: `docs/specs/S/S0-S0i-CLI-CORE.md` (add QV pipeline section)
- Update: `~/.claude/skills/epi-knowing.md` (add update/coverage/bake examples)

**Step 1: Update `docs/dev/S0'/README.md` changelog**

Add to the changelog section (after the existing v0.1.0 entry):

```markdown
### v0.2.0 — 2026-03-07

**QV Pipeline, Admin CLI, Plugin Package**

- **Three-tier QV resolution** — JSON overlay -> C library -> static Rust tables
- `epi core knowing <coord> --update "pithy"` — satya-gated overlay writes
- `epi core knowing --coverage` — QV population coverage report
- `epi core knowing --bake` — generates `src/qv_data.c` from overlay
- `epi core knowing --export` — export all QV data as JSON
- **Satya gate** — session-level passphrase for write operations
- **JSON overlay** at `~/.epi-logos/qv/overlay.json` — fast iteration without recompile
- **Plugin package** — `epi-logos-plugin/` with skills, resources, scripts
- **Initial data** — M0-M5, S0-S5, #0-#5, 7 CF roots, 4 weaves populated
```

**Step 2: Update the command reference section**

Add the new admin commands to the `epi core` command reference:

```markdown
epi core knowing <coord> --update "text"   # Update pithy in overlay (satya-gated)
epi core knowing --coverage                # QV coverage report
epi core knowing --bake                    # Bake overlay -> src/qv_data.c
epi core knowing --export                  # Export all QV data as JSON
```

**Step 3: Update the "What's Live" table**

Add row: `epi core knowing --update/--coverage/--bake` | **Live** | Satya-gated writes

**Step 4: Update the epi-knowing.md skill**

Add admin command examples to `~/.claude/skills/epi-knowing.md`:

```markdown
## Admin Commands (satya-gated writes)

```bash
# Update a coordinate's pithy (prompts for 'satya' passphrase on first use)
epi core knowing M0 --update "Anuttara -- absolute ground, vimarsa engine"

# Check what coordinates have QV data
epi core knowing --coverage

# Bake overlay data into C source for shipping
epi core knowing --bake

# Export all QV data
epi core knowing --export
```
```

**Step 5: Commit**

```bash
git add docs/dev/S0\'/README.md docs/specs/S/S0-S0i-CLI-CORE.md ~/.claude/skills/epi-knowing.md
git commit -m "docs: update README, spec, and skill with QV admin commands"
```

---

## Dependency Graph

```
Task 1 (overlay module) ──┬──> Task 3 (three-tier resolution)
Task 2 (satya gate) ──────┤
                           ├──> Task 4 (update/coverage CLI)
                           │         │
                           │         ▼
                           ├──> Task 5 (bake command)
                           │         │
                           │         ▼
                           └──> Task 6 (dataset population)
                                     │
                                     ▼
                               Task 7 (plugin package)
                                     │
                                     ▼
                               Task 8 (documentation)
```

Tasks 1 and 2 are independent and can run in parallel. Tasks 3-4 depend on both. Task 5 depends on 4. Task 6 depends on 5. Task 7 is independent of 3-6 but benefits from having data. Task 8 is last.
