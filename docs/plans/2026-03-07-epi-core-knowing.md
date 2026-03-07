# `epi core knowing` + Claude Code Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `epi core knowing <COORD>` as a non-interactive CLI command that surfaces M5's quintessential view self-API, plus a global Claude Code skill that teaches any agent how to use it.

**Architecture:** The `knowing` subcommand calls `m5_lookup()` under the hood but lives at the `epi core` level — M5 is a coordinate to be inspected, not the command namespace. Output follows CT5 5/0 format: quintessence (pithy) + ground (relational tree). A `--family` flag lists available coordinates for tab-completion discovery. The skill file goes to `~/.claude/skills/epi-knowing.md` (global, all projects).

**Tech Stack:** Rust (clap derive, serde_json), C FFI (m5_lookup, M5_COORD_ID), Claude Code skill YAML frontmatter.

---

### Task 1: Add `Knowing` variant to `CoreCmd` enum

**Files:**
- Modify: `epi-cli/src/core/mod.rs:5-39` (CoreCmd enum)

**Step 1: Add the `Knowing` and `KnowingFamily` subcommands to `CoreCmd`**

Add two new variants to the `CoreCmd` enum in `epi-cli/src/core/mod.rs`:

```rust
    /// Look up a coordinate's quintessential self-knowledge (M5 self-API)
    Knowing {
        /// Coordinate to look up (e.g. M0, S3, C4, P2, L5, T1)
        coordinate: Option<String>,

        /// List all available coordinates in a family (C, P, L, S, T, M)
        #[arg(long)]
        family: Option<String>,
    },
```

**Step 2: Add dispatch arm**

In the `dispatch` function, add:

```rust
        CoreCmd::Knowing { coordinate, family } => knowing(epi, coordinate.as_deref(), family.as_deref(), json),
```

**Step 3: Verify it compiles (will fail on missing `knowing` function)**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | head -20`
Expected: Error about `knowing` function not found — confirms enum + dispatch wired correctly.

---

### Task 2: Implement the `knowing()` function — coordinate parsing + m5_lookup

**Files:**
- Modify: `epi-cli/src/core/mod.rs` (add `knowing` function at bottom)

**Step 1: Add helper to parse coordinate strings to (family_u8, position_u8)**

Add this function to `epi-cli/src/core/mod.rs`:

```rust
/// Parse a coordinate string like "M0", "S3", "C4" into (family_enum_value, position)
fn parse_coord_id(coord: &str) -> Option<(u8, u8)> {
    let coord = coord.trim();
    if coord.len() < 2 || coord.len() > 3 {
        return None;
    }
    let family_char = coord.chars().next()?.to_ascii_uppercase();
    let pos_str = &coord[1..];
    let pos: u8 = pos_str.parse().ok()?;
    if pos > 5 {
        return None;
    }
    let family = match family_char {
        'C' => 0u8,
        'P' => 1,
        'L' => 2,
        'S' => 3,
        'T' => 4,
        'M' => 5,
        _ => return None,
    };
    Some((family, pos))
}
```

**Step 2: Add the `knowing` function with CT5 5/0 output**

```rust
fn knowing(epi: &EpiLib, coordinate: Option<&str>, family: Option<&str>, json: bool) -> color_eyre::Result<()> {
    // Handle --family flag: list available coordinates
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

    // Initialize M5 for lookup
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

    if m5_root.is_null() {
        unsafe { ffi::arena_destroy(&mut arena as *mut _) };
        return Err(color_eyre::eyre::eyre!("Failed to initialize M5 root"));
    }

    // Pack coord_id: family(3 bits @ 13) | position(3 bits @ 10)
    let coord_id = ((fam as u16 & 0x7) << 13) | ((pos as u16 & 0x7) << 10);

    let pithy = unsafe {
        let ptr = ffi::m5_lookup(m5_root, coord_id, 0);
        if !ptr.is_null() {
            std::ffi::CStr::from_ptr(ptr).to_str().unwrap_or("(invalid)").to_string()
        } else {
            "(no quintessential view)".to_string()
        }
    };

    let family_letter = ["C", "P", "L", "S", "T", "M"][fam as usize];
    let family_name = ["Category", "Position", "Lens", "Stack", "Thought", "Map/Subsystem"][fam as usize];

    // Determine which M5 sub-branch owns this family
    let (branch_id, branch_name) = match fam {
        5 => ("5-0", "M+M' integral identity"),
        2 | 1 => ("5-1", "L+P+L'+P' theory topology"),
        3 => ("5-2", "S+S' full stack"),
        // M' UI is branch 5-3 but only for inverted M
        // Agents is branch 5-4 but only for S4
        4 | 0 => ("5-5", "T+C+T'+C' Logos cycle"),
        _ => ("?", "unknown"),
    };

    // Build cross-coordinate relation names
    let relation_families: [(&str, &str, &str); 6] = [
        ("C", "Category", ["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"][pos as usize]),
        ("P", "Position", ["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"][pos as usize]),
        ("L", "Lens", ["Literal", "Functional", "Structural", "Archetypal", "Paradigmatic", "Integral"][pos as usize]),
        ("S", "Stack", ["Terminal", "Obsidian", "Neo4j", "PAI Gateway", "Claude/PI", "Notion/n8n"][pos as usize]),
        ("T", "Thought", ["Seed", "Spec", "Form", "Process", "Pattern", "Insight"][pos as usize]),
        ("M", "Subsystem", ["Anuttara", "Paramasiva", "Parashakti", "Mahamaya", "Nara", "Epii"][pos as usize]),
    ];

    if json {
        let mut relations = serde_json::Map::new();
        for (letter, fam_name, pithy_rel) in &relation_families {
            relations.insert(
                letter.to_string(),
                serde_json::json!({
                    "coord": format!("{}{}", letter, pos),
                    "family": fam_name,
                    "pithy": pithy_rel,
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
        for (letter, _fam_name, pithy_rel) in &relation_families {
            let marker = if *letter == family_letter { ">" } else { " " };
            println!("   {} {}{:<2} {}", marker, letter, pos, pithy_rel);
        }
    }

    // Cleanup
    unsafe {
        ffi::m5_teardown(m5_root);
        ffi::arena_destroy(&mut arena as *mut _);
    }

    Ok(())
}
```

**Step 3: Add the `knowing_family` helper for `--family` listing**

```rust
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
        _ => return Err(color_eyre::eyre::eyre!(
            "Unknown family '{}'. Available: C, P, L, S, T, M", fam_str
        )),
    };

    if json {
        let items: Vec<_> = coords.iter().map(|(c, d)| {
            serde_json::json!({ "coord": c, "description": d })
        }).collect();
        println!("{}", serde_json::to_string_pretty(&serde_json::json!({
            "family": family_name,
            "letter": fam_char.to_string(),
            "coordinates": items,
        }))?);
    } else {
        println!("{} ({}) — 6 coordinates:\n", family_name, fam_char);
        for (coord, desc) in &coords {
            println!("  {:<4} {}", coord, desc);
        }
        println!("\nUsage: epi core knowing <COORD>   (e.g. epi core knowing {}0)", fam_char);
    }

    Ok(())
}
```

**Step 4: Verify it compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check 2>&1 | tail -5`
Expected: Compiles without errors.

**Step 5: Commit**

```bash
git add epi-cli/src/core/mod.rs
git commit -m "feat: add epi core knowing — M5 self-API as top-level CLI command"
```

---

### Task 3: Build and verify `epi core knowing` works end-to-end

**Files:**
- None new (testing Task 2 output)

**Step 1: Build the binary**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -5`
Expected: Build succeeds.

**Step 2: Test `--family` listing**

Run: `./target/debug/epi core knowing --family M`
Expected: Lists M0-M5 with pithy descriptions.

**Step 3: Test single coordinate lookup**

Run: `./target/debug/epi core knowing M0`
Expected: Shows "M0 — Map/Subsystem", quintessence, branch info, 6 cross-coordinate relations.

**Step 4: Test JSON output**

Run: `./target/debug/epi core knowing M0 --json`
Expected: Valid JSON with coord, family, position, quintessence, branch, relations keys.

**Step 5: Test `--family` JSON**

Run: `./target/debug/epi core knowing --family S --json`
Expected: JSON array of S0-S5 with descriptions.

**Step 6: Test error cases**

Run: `./target/debug/epi core knowing X9 2>&1`
Expected: Error message about invalid coordinate.

Run: `./target/debug/epi core knowing --family Z 2>&1`
Expected: Error about unknown family.

**Step 7: Test `epi core knowing` with no args**

Run: `./target/debug/epi core knowing 2>&1`
Expected: Error message telling user to provide a coordinate or use --family.

---

### Task 4: Verify C tests still pass

**Files:**
- None (regression check)

**Step 1: Run all C test suites**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make test 2>&1 | tail -10`
Expected: All test suites pass (2290+ tests, 0 failures).

**Step 2: Run Rust build with release profile**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build --release 2>&1 | tail -5`
Expected: Release build succeeds.

---

### Task 5: Create the global Claude Code skill at `~/.claude/skills/epi-knowing.md`

**Files:**
- Create: `~/.claude/skills/epi-knowing.md`

**Step 1: Write the skill file**

Create `~/.claude/skills/epi-knowing.md` with this content:

```markdown
---
type: skill
name: epi-knowing
description: "Coordinate system self-knowledge via epi core knowing — USE when inspecting, understanding, or navigating QL coordinates during development"
proactive: true
triggers:
  - coordinate lookup
  - understanding coordinates
  - what is M0
  - what does S3 do
  - system self-knowledge
  - quintessential view
  - navigating the coordinate system
  - before modifying M-branch code
  - architectural context for any coordinate
---

# epi core knowing — Coordinate Self-Knowledge

> The system knows itself. Every coordinate has a quintessential view — a pithy self-description plus its full relational context across all 6 families. Use this before, during, and after development work to ground actions in the coordinate system.

## Quick Reference

```bash
# Look up any coordinate
epi core knowing M0              # Human-readable CT5 5/0 output
epi core knowing S3 --json       # Structured JSON for agent pipelines

# Discover available coordinates in a family
epi core knowing --family M      # Lists M0-M5 with descriptions
epi core knowing --family C      # Lists C0-C5
epi core knowing --family S --json  # JSON listing

# All 6 families: C (Category), P (Position), L (Lens), S (Stack), T (Thought), M (Subsystem)
# Each has positions 0-5, giving 36 total coordinates
```

## Coordinate Syntax

`<FAMILY><POSITION>` where:
- **Family:** C, P, L, S, T, M (one letter)
- **Position:** 0-5 (one digit)
- Examples: `M0`, `S3`, `C4`, `P2`, `L5`, `T1`

## CT5 5/0 Output Format

Every `epi core knowing` response has two layers:

1. **Quintessence (5):** Pithy one-liner — what this coordinate IS
2. **Ground (0):** Relational tree — the same position across all 6 families

Example:
```
M0 — Map/Subsystem
  Quintessence: Anuttara — absolute ground, vimarsa engine
  Branch: #5-0 (M+M' integral identity)
  Relations:
   > M0  Anuttara
     C0  Bimba
     P0  Ground
     L0  Literal
     S0  Terminal
     T0  Seed
```

The `>` marker shows which family you queried. All 6 lines share the same position — this IS the holographic structure: every coordinate contains the whole, viewed through its family's lens.

## When to Use

### Before modifying code
```bash
# Understand the coordinate you're touching
epi core knowing M4   # Before editing m4.c or m4.h
epi core knowing S2   # Before editing graph/ module
```

### During design work
```bash
# Understand relationships
epi core knowing C0   # What is Bimba in each family?
epi core knowing --family L  # What lens modes are available?
```

### For deeper granularity
The `epi core knowing` command gives S0' (pithy C-level) output. For deeper layers:
- **S1' (Obsidian):** `epi vault read <note>` — markdown knowledge
- **S2' (Neo4j):** `epi graph query <coordinate>` — graph relationships

### Verification after changes
```bash
epi core verify    # Boot-check all 18 BIMBA entities
epi core knowing M0 --json | jq .quintessence  # Confirm self-knowledge intact
```

## JSON Schema (--json)

```json
{
  "coord": "M0",
  "family": "Map/Subsystem",
  "position": 0,
  "quintessence": "Anuttara — absolute ground, vimarsa engine",
  "branch": { "id": "5-0", "name": "M+M' integral identity" },
  "relations": {
    "C": { "coord": "C0", "family": "Category", "pithy": "Bimba" },
    "P": { "coord": "P0", "family": "Position", "pithy": "Ground" },
    "L": { "coord": "L0", "family": "Lens", "pithy": "Literal" },
    "S": { "coord": "S0", "family": "Stack", "pithy": "Terminal" },
    "T": { "coord": "T0", "family": "Thought", "pithy": "Seed" },
    "M": { "coord": "M0", "family": "Subsystem", "pithy": "Anuttara" }
  }
}
```

## M5 Sub-Branch Map

Each family is holographically contained in an M5 sub-branch:

| Branch | Families | Domain |
|--------|----------|--------|
| #5-0 | M+M' | Integral identity — M0-M5 mirror |
| #5-1 | L+P+L'+P' | Theory topology — understanding |
| #5-2 | S+S' | Full stack — objective + project |
| #5-3 | M' UI | Electron app — WebMCP hooks |
| #5-4 | S4/S4' | Agent rosters — Anima + Aletheia |
| #5-5 | T+C+T'+C' | Logos cycle — cadence of immanence |

## Integration Patterns

### In Claude Code sessions
Use `epi core knowing` to orient before any architectural decision. The coordinate system IS the codebase map.

### In CI/CD or scripts
```bash
# Verify the coordinate system is intact
epi core verify --json | jq '.all_ok'

# Query specific coordinates programmatically
PITHY=$(epi core knowing M5 --json | jq -r '.quintessence')
```

### Chaining with other epi commands
```bash
epi core knowing S1                  # What is S1?
epi vault status                     # Check S1' implementation
epi core knowing S4                  # What is S4?
epi agent doctor                     # Check S4' implementation
```
```

**Step 2: Verify the skill file exists and is well-formed**

Run: `head -15 ~/.claude/skills/epi-knowing.md`
Expected: Shows YAML frontmatter with type, name, description, triggers.

**Step 3: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add -f ~/.claude/skills/epi-knowing.md
```

Note: The skill file is outside the repo. It does NOT need to be committed to this repo — it's a global user-level install at `~/.claude/skills/`. No git action needed for it.

---

### Task 6: Update the S0' CLI README

**Files:**
- Modify: `docs/dev/S0'/README.md`

**Step 1: Add `knowing` to the command reference and live/stub table**

In `docs/dev/S0'/README.md`, add the following to the `epi core` command reference section (after the `epi core m5` line):

```markdown
epi core knowing <coord>                 # Coordinate self-knowledge (CT5 5/0)
epi core knowing <coord> --json          # JSON output for agents
epi core knowing --family <FAM>          # List coordinates in a family
```

**Step 2: Add to the "What's Live" table**

Add row:
```markdown
| `epi core knowing` — coordinate self-knowledge | **Live** | M5 self-API, all 36 coords |
```

**Step 3: Update the Architecture tree**

Add `knowing/` or note `knowing` as a core subcommand in the source tree diagram.

**Step 4: Commit**

```bash
git add "docs/dev/S0'/README.md"
git commit -m "docs: update S0' README with epi core knowing command"
```

---

### Task 7: Install binary and final end-to-end verification

**Files:**
- None (verification only)

**Step 1: Install the binary**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo install --path . 2>&1 | tail -5`
Expected: Installs to `~/.cargo/bin/epi`.

**Step 2: Verify installed binary has `knowing`**

Run: `epi core knowing --help`
Expected: Shows help text for the knowing subcommand.

**Step 3: Test all 6 families**

Run: `for fam in C P L S T M; do echo "--- $fam ---"; epi core knowing --family $fam | head -3; done`
Expected: Each family lists its 6 coordinates.

**Step 4: Test a coordinate from each family**

Run: `for coord in C0 P1 L2 S3 T4 M5; do echo "=== $coord ==="; epi core knowing $coord; echo; done`
Expected: Each shows quintessence + branch + relations.

**Step 5: Test JSON pipeline**

Run: `epi core knowing M0 --json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['coord'], d['quintessence'])"`
Expected: Prints `M0` followed by the quintessence string.

**Step 6: Verify skill is loadable**

Run: `ls -la ~/.claude/skills/epi-knowing.md`
Expected: File exists with reasonable size.

**Step 7: Run C tests one final time**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make test 2>&1 | tail -5`
Expected: All tests pass.

**Step 8: Final commit message**

```bash
git commit --allow-empty -m "feat: epi core knowing — coordinate self-knowledge CLI + global Claude Code skill

- epi core knowing <COORD> — CT5 5/0 output (quintessence + relational tree)
- epi core knowing --family <FAM> — lists available coordinates for discovery
- --json flag for agent/pipeline consumption
- ~/.claude/skills/epi-knowing.md — global skill for Claude Code + Codex
- S0' README updated with new command reference"
```

(Only use `--allow-empty` if all files were already committed in prior tasks. Otherwise `git add` the remaining files first.)
