# Epi-Logos Library Packaging & CLI Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Package the C library as a static library compiled into the Rust CLI via `cc` crate, update the Makefile, add M5 QV lookup to the TUI, wire `epi agent` as an interactive chat interface, and define the distribution strategy.

**Architecture:** Replace `libloading` dynamic loading with `cc` crate static compilation in `build.rs`. The C sources compile directly into the Rust binary — single artifact, no `.dylib` to ship. Add a new TUI view for M5 QV lookup and an interactive agent chat mode via `epi agent chat`. The Makefile gets a full overhaul for the C-only development workflow (tests, debug builds).

**Tech Stack:** C11, Rust 2021, clap 4, ratatui 0.29, crossterm 0.28, cc crate (build-time C compilation)

---

### Task 1: Makefile Overhaul

**Files:**
- Modify: `Makefile`

**Context:** The current Makefile references deleted files (`src/archetypes.c`, `test/` directory). It doesn't know about M0-M5, BLAKE3, or vendor/. We need targets for: the main binary, all 9 test suites, a shared library (for standalone C use), debug builds, and `clean`.

**Step 1: Replace the entire Makefile**

```makefile
CC      = clang
CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -Iinclude -Ivendor/blake3
BLAKE3  = -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512
LDFLAGS =
SANFLAGS = -fsanitize=address,undefined -g -O0

# Source groups
PILLAR_SRC = src/psychoid_numbers.c src/engine.c src/arena.c src/families.c
M_SRC      = src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c
BLAKE3_SRC = vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c
LIB_SRC    = $(PILLAR_SRC) $(M_SRC) $(BLAKE3_SRC)
ALL_SRC    = $(LIB_SRC) src/main.c

BIN = epi-logos

# Test suites
TESTS = test_m0_init test_m0_rfactor test_m1 test_m2 test_m3 test_m4 test_m5 test_pillar1 test_vak

.PHONY: all lib test debug clean $(TESTS)

all: $(BIN)

$(BIN): $(ALL_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) -O2 -o $@ $^ $(LDFLAGS)

lib: libepilogos.a

libepilogos.a: $(LIB_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) -O2 -c $(PILLAR_SRC) $(M_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) -O2 -c $(BLAKE3_SRC)
	ar rcs $@ *.o
	rm -f *.o

debug: $(ALL_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $(BIN) $^ $(LDFLAGS)

# Individual test targets
test_m0_init: $(LIB_SRC) src/test_m0_init.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m0_rfactor: $(LIB_SRC) src/test_m0_rfactor.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m1: $(LIB_SRC) src/test_m1.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm && ./$@

test_m2: $(LIB_SRC) src/test_m2.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m3: $(LIB_SRC) src/test_m3.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m4: $(LIB_SRC) src/test_m4.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm && ./$@

test_m5: $(LIB_SRC) src/test_m5.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_pillar1: $(LIB_SRC) src/test_pillar1_gaps.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_vak: $(LIB_SRC) src/test_vak.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

# Run all tests
test: $(TESTS)
	@echo ""
	@echo "=== All test suites passed ==="

clean:
	rm -f $(BIN) libepilogos.a $(TESTS) *.o
```

**Step 2: Verify it builds**

Run: `make clean && make`
Expected: builds `epi-logos` binary, zero warnings

Run: `make test`
Expected: all 9 test suites pass, final line "=== All test suites passed ==="

**Step 3: Commit**

```bash
git add Makefile
git commit -m "build: overhaul Makefile for M0-M5 + BLAKE3 + 9 test suites"
```

---

### Task 2: build.rs — Static C Compilation into Rust Binary

**Files:**
- Create: `epi-cli/build.rs`
- Modify: `epi-cli/Cargo.toml`

**Context:** Currently epi-cli uses `libloading` to dynamically load `libepilogos.so` at runtime. This requires the user to build and place the shared library. Instead, we'll use the `cc` crate to compile all C sources at build time and link them statically into the Rust binary. This means `cargo build` produces a single `epi` binary with everything included.

**Step 1: Add cc dependency to Cargo.toml**

Add to `[build-dependencies]` section (create it if missing), and remove `libloading` from `[dependencies]`:

In `epi-cli/Cargo.toml`, change:
```toml
[dependencies]
clap = { version = "4", features = ["derive"] }
ratatui = "0.29"
crossterm = "0.28"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
dirs = "5"
libc = "0.2"
color-eyre = "0.6"

[build-dependencies]
cc = "1"
```

(Note: `libloading` removed from `[dependencies]`)

**Step 2: Create build.rs**

```rust
fn main() {
    let mut build = cc::Build::new();

    build
        .std("c11")
        .warnings(true)
        .extra_warnings(true)
        .include("../include")
        .include("../vendor/blake3")
        .define("BLAKE3_NO_SSE2", None)
        .define("BLAKE3_NO_SSE41", None)
        .define("BLAKE3_NO_AVX2", None)
        .define("BLAKE3_NO_AVX512", None)
        // Pillar I
        .file("../src/psychoid_numbers.c")
        .file("../src/engine.c")
        .file("../src/arena.c")
        .file("../src/families.c")
        // M-branches
        .file("../src/m0.c")
        .file("../src/m1.c")
        .file("../src/m2.c")
        .file("../src/m3.c")
        .file("../src/m4.c")
        .file("../src/m5.c")
        // BLAKE3
        .file("../vendor/blake3/blake3.c")
        .file("../vendor/blake3/blake3_dispatch.c")
        .file("../vendor/blake3/blake3_portable.c");

    // Suppress -Werror for vendored BLAKE3 code
    build.flag_if_supported("-Wno-unused-parameter");

    build.compile("epilogos");

    println!("cargo:rerun-if-changed=../src/");
    println!("cargo:rerun-if-changed=../include/");
    println!("cargo:rerun-if-changed=../vendor/blake3/");
}
```

**Step 3: Verify it compiles**

Run: `cd epi-cli && cargo build 2>&1`
Expected: Compiles C sources, links into Rust binary. May have warnings from BLAKE3 vendor code but should succeed.

**Step 4: Commit**

```bash
git add epi-cli/build.rs epi-cli/Cargo.toml
git commit -m "build: add cc crate build.rs to compile C sources into Rust binary"
```

---

### Task 3: FFI Rewrite — From libloading to Static Linking

**Files:**
- Modify: `epi-cli/src/ffi/mod.rs`
- Modify: `epi-cli/src/main.rs`

**Context:** With static linking via `build.rs`, we no longer need `libloading` to load symbols at runtime. Instead, we declare C functions and statics via `extern "C"` blocks and call them directly. This eliminates the `find_lib()` function, the `--lib` CLI arg, and the `EpiLib` wrapper struct in its current form.

**Step 1: Rewrite ffi/mod.rs**

Replace the `EpiLib` struct and its `load()` method with direct `extern "C"` declarations and a simpler wrapper. The key change: instead of loading symbols from a `.so`, we declare them as `extern "C"` and the linker resolves them from the static library built by `build.rs`.

The `extern "C"` block should declare:

```rust
extern "C" {
    // .rodata psychoids
    pub static Psychoid_0: HolographicCoordinate;
    pub static Psychoid_1: HolographicCoordinate;
    pub static Psychoid_2: HolographicCoordinate;
    pub static Psychoid_3: HolographicCoordinate;
    pub static Psychoid_4: HolographicCoordinate;
    pub static Psychoid_5: HolographicCoordinate;
    pub static Psychoid_Hash: HolographicCoordinate;
    // .rodata weaves
    pub static Weave_0_0: HolographicCoordinate;
    pub static Weave_0_5: HolographicCoordinate;
    pub static Weave_5_0: HolographicCoordinate;
    pub static Weave_5_5: HolographicCoordinate;
    // .rodata CF roots
    pub static CF_0000: HolographicCoordinate;
    pub static CF_01: HolographicCoordinate;
    pub static CF_012: HolographicCoordinate;
    pub static CF_0123: HolographicCoordinate;
    pub static CF_4x: HolographicCoordinate;
    pub static CF_450: HolographicCoordinate;
    pub static CF_50: HolographicCoordinate;
    // Pillar I functions
    pub fn arena_init(arena: *mut CoordinateArena, cap: u32) -> i32;
    pub fn arena_alloc(arena: *mut CoordinateArena) -> *mut HolographicCoordinate;
    pub fn arena_destroy(arena: *mut CoordinateArena);
    pub fn families_init(arena: *mut CoordinateArena, mirrors: *mut *mut HolographicCoordinate) -> i32;
    pub fn families_crosslink(arena: *mut CoordinateArena) -> i32;
    pub fn families_wire_reflective(arena: *mut CoordinateArena) -> i32;
    pub fn engine_torus_walk(start: *const HolographicCoordinate, ctx: *mut libc::c_void, steps: u32);
    pub fn engine_double_covering(start: *const HolographicCoordinate, ctx: *mut libc::c_void);
    pub fn Execute_Hash(hc: *mut HolographicCoordinate, target: *mut libc::c_void);
    // M5 Logos stage names
    pub static M5_LOGOS_STAGE_NAMES: [*const libc::c_char; 6];
}
```

Then update `EpiLib` to be a zero-cost wrapper that just provides safe method access to these statics:

```rust
pub struct EpiLib;

impl EpiLib {
    pub fn new() -> Self { EpiLib }

    pub fn psychoid(&self, pos: u8) -> Option<*const HolographicCoordinate> {
        unsafe {
            match pos {
                0 => Some(&Psychoid_0),
                1 => Some(&Psychoid_1),
                // ... etc
            }
        }
    }
    // Keep all existing safe wrapper methods, just change them to call
    // the extern functions directly instead of through function pointers
}
```

The existing `read_coord()`, `PtrInfo`, `CoordSnapshot`, `CoordinateFamily` all stay exactly the same — they don't depend on `libloading`.

Update `main.rs`: remove `find_lib()`, remove `--lib` arg, change `EpiLib::load(&lib_path)?` to `EpiLib::new()`.

**Step 2: Verify it compiles and runs**

Run: `cd epi-cli && cargo build && cargo run -- core verify`
Expected: Same output as before, but no `--lib` needed

**Step 3: Commit**

```bash
git add epi-cli/src/ffi/mod.rs epi-cli/src/main.rs
git commit -m "refactor: replace libloading with static extern C linking"
```

---

### Task 4: M5 QV Lookup TUI

**Files:**
- Modify: `epi-cli/src/core/mod.rs` (add `M5` subcommand)
- Modify: `epi-cli/src/tui/mod.rs` (add M5 info TUI view)
- Modify: `epi-cli/src/ffi/mod.rs` (add M5 extern declarations)

**Context:** We want `epi core m5` to open a TUI showing the M5 holographic container state: Logos FSM tick, stage names, sub-branch summary, and quintessential view lookup. This is the self-API in action.

**Step 1: Add M5 C function externs to ffi/mod.rs**

Add to the `extern "C"` block:

```rust
// M5 API
pub fn m5_init(arena: *mut CoordinateArena, hc: *mut HolographicCoordinate) -> *mut libc::c_void;
pub fn m5_teardown(root: *mut libc::c_void);
pub fn m5_verify() -> bool;
pub fn m5_advance_logos(root: *mut libc::c_void) -> M5LogosState;
pub fn m5_lookup(root: *const libc::c_void, coord_id: u16, granularity: u8) -> *const libc::c_char;
```

And a repr(C) mirror of the Unified_Logos_State:

```rust
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M5LogosState {
    pub pipeline_tick: u8,
    pub current_stage: u8,
    pub active_divine_act: u8,
    pub is_implicate: bool,
    pub active_r_factor: u8,
}
```

**Step 2: Add `M5` subcommand to CoreCmd**

In `core/mod.rs`, add:

```rust
/// M5 (Epii) holographic integration — Logos FSM, QV lookup
M5,
```

And in `dispatch()`:
```rust
CoreCmd::M5 => crate::tui::run_m5(epi),
```

**Step 3: Add run_m5 TUI to tui/mod.rs**

A new TUI view with:
- **Top panel:** "M5 (Epii) — Holographic Integration Layer" with CF_MOBIUS info
- **Left panel:** 6 sub-branches (#5-0 through #5-5) as a selectable list
- **Right panel:** Detail view showing the selected sub-branch's coordinate family views
- **Bottom strip:** Logos FSM live state (current tick, stage name, ascending/descending)
- **Keys:** `↑↓` navigate sub-branches, `l/r` to advance/rewind Logos tick, `q` quit

The Logos stage names come from `M5_LOGOS_STAGE_NAMES` (the extern C static array).

**Step 4: Verify**

Run: `cd epi-cli && cargo run -- core m5`
Expected: TUI opens showing M5 state, sub-branches navigable, Logos tick advanceable

**Step 5: Commit**

```bash
git add epi-cli/src/core/mod.rs epi-cli/src/tui/mod.rs epi-cli/src/ffi/mod.rs
git commit -m "feat: add M5 holographic TUI with Logos FSM + sub-branch explorer"
```

---

### Task 5: Agent Chat Interface

**Files:**
- Modify: `epi-cli/src/agent/mod.rs` (add `Chat` subcommand)
- Create: `epi-cli/src/agent/chat.rs` (interactive chat implementation)

**Context:** We want `epi agent chat` to open an interactive TUI chat interface with the Pi agent. This launches `pi` as a subprocess with stdin/stdout piped, displaying conversation in a ratatui scrollable view with an input line at the bottom. The agent module already has `spawn.rs` that calls `pi` — we extend this with an interactive mode.

**Step 1: Add Chat subcommand to AgentCmd**

In `agent/mod.rs`, add:

```rust
/// Interactive chat with managed PI agent
Chat {
    /// Resolve layout for a named agent
    #[arg(long)]
    agent: Option<String>,
    /// Initial prompt (optional)
    prompt: Option<String>,
},
```

And in `dispatch()`:
```rust
AgentCmd::Chat { agent, prompt } => {
    chat::run(agent.as_deref(), prompt.as_deref())
        .map_err(|e| e.to_string())?;
    Ok(String::new())
}
```

**Step 2: Create agent/chat.rs**

An interactive TUI that:
1. Resolves agent layout via `AgentLayout::resolve()`
2. Spawns `pi` as a child process with `--extension` flags (same as `spawn.rs`) but with stdin/stdout piped
3. Renders a ratatui view with:
   - **Top:** Agent name + status bar
   - **Main area:** Scrollable message history (user messages in green, agent in white)
   - **Bottom:** Input line with cursor
4. Key handling:
   - `Enter` sends the current input to pi's stdin
   - `Esc` / `Ctrl-C` exits
   - Normal typing appends to input buffer
5. Reads agent stdout in a background thread, pushes lines into a shared message buffer

```rust
use crate::agent::AgentLayout;
use crossterm::event::{self, Event, KeyCode, KeyModifiers};
use ratatui::{prelude::*, widgets::*};
use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

pub fn run(agent: Option<&str>, initial_prompt: Option<&str>) -> color_eyre::Result<()> {
    let layout = AgentLayout::resolve(agent).map_err(|e| color_eyre::eyre::eyre!(e))?;

    let mut child = Command::new("pi")
        .args(&[
            "spawn",
            "--extension",
            &layout.composite_entry_path.display().to_string(),
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("PI_CODING_AGENT_DIR", &layout.agent_dir)
        .env("EPI_AGENT_DIR", &layout.agent_dir)
        .spawn()?;

    let stdout = child.stdout.take().unwrap();
    let mut stdin = child.stdin.take().unwrap();

    // Shared message buffer
    let messages: Arc<Mutex<Vec<(String, bool)>>> = Arc::new(Mutex::new(Vec::new()));
    let msgs_clone = messages.clone();

    // Reader thread
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                msgs_clone.lock().unwrap().push((line, false)); // false = agent message
            }
        }
    });

    // Send initial prompt if provided
    if let Some(prompt) = initial_prompt {
        writeln!(stdin, "{}", prompt)?;
        messages.lock().unwrap().push((format!("> {}", prompt), true));
    }

    // TUI event loop
    crossterm::terminal::enable_raw_mode()?;
    let mut terminal = ratatui::Terminal::new(
        ratatui::backend::CrosstermBackend::new(std::io::stderr())
    )?;
    crossterm::execute!(
        std::io::stderr(),
        crossterm::terminal::EnterAlternateScreen
    )?;

    let mut input = String::new();
    let mut scroll: u16 = 0;

    loop {
        terminal.draw(|f| {
            let chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Length(1),  // header
                    Constraint::Min(5),     // messages
                    Constraint::Length(3),  // input
                ])
                .split(f.area());

            // Header
            let header = Paragraph::new(format!(
                " epi agent chat — {} ", layout.agent_id
            )).style(Style::default().bg(Color::DarkGray).fg(Color::White));
            f.render_widget(header, chunks[0]);

            // Messages
            let msgs = messages.lock().unwrap();
            let text: Vec<Line> = msgs.iter().map(|(msg, is_user)| {
                if *is_user {
                    Line::from(Span::styled(msg, Style::default().fg(Color::Green)))
                } else {
                    Line::from(Span::styled(msg, Style::default().fg(Color::White)))
                }
            }).collect();
            let para = Paragraph::new(text)
                .block(Block::default().borders(Borders::ALL).title("Conversation"))
                .scroll((scroll, 0))
                .wrap(Wrap { trim: false });
            f.render_widget(para, chunks[1]);

            // Input
            let input_widget = Paragraph::new(input.as_str())
                .block(Block::default().borders(Borders::ALL).title("Input (Enter to send, Esc to quit)"));
            f.render_widget(input_widget, chunks[2]);
        })?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                match key.code {
                    KeyCode::Esc => break,
                    KeyCode::Char('c') if key.modifiers.contains(KeyModifiers::CONTROL) => break,
                    KeyCode::Enter => {
                        if !input.is_empty() {
                            let msg = input.clone();
                            messages.lock().unwrap().push((format!("> {}", msg), true));
                            writeln!(stdin, "{}", msg)?;
                            input.clear();
                        }
                    }
                    KeyCode::Backspace => { input.pop(); }
                    KeyCode::Char(c) => input.push(c),
                    KeyCode::PageUp => scroll = scroll.saturating_sub(5),
                    KeyCode::PageDown => scroll = scroll.saturating_add(5),
                    _ => {}
                }
            }
        }
    }

    // Cleanup
    crossterm::execute!(
        std::io::stderr(),
        crossterm::terminal::LeaveAlternateScreen
    )?;
    crossterm::terminal::disable_raw_mode()?;
    let _ = child.kill();

    Ok(())
}
```

**Step 3: Add `mod chat;` to agent/mod.rs**

**Step 4: Verify**

Run: `cd epi-cli && cargo build`
Expected: compiles cleanly

Run: `cd epi-cli && cargo run -- agent chat`
Expected: TUI opens (will error if `pi` not installed, but the TUI should render)

**Step 5: Commit**

```bash
git add epi-cli/src/agent/mod.rs epi-cli/src/agent/chat.rs
git commit -m "feat: add interactive agent chat TUI via epi agent chat"
```

---

### Task 6: Distribution Spec & Package Manifest

**Files:**
- Modify: `epi-cli/Cargo.toml` (metadata for crates.io)
- Create: `DISTRIBUTION.md` (packaging strategy doc)

**Context:** Define how the Epi-Logos library + CLI gets distributed. Primary channel: `cargo install epi-logos`. Secondary: GitHub Releases with prebuilt binaries. Tertiary: Homebrew tap.

**Step 1: Update Cargo.toml metadata**

```toml
[package]
name = "epi-logos"
version = "0.1.0"
edition = "2021"
description = "The Master CLI for the Epi-Logos coordinate system — ontology-is-code"
license = "MIT OR Apache-2.0"
repository = "https://github.com/user/epi-logos"
readme = "../README.md"
keywords = ["philosophy", "coordinate-system", "cli", "tui"]
categories = ["command-line-utilities"]

[[bin]]
name = "epi"
path = "src/main.rs"
```

**Step 2: Create DISTRIBUTION.md**

```markdown
# Epi-Logos Distribution Strategy

## Package Identity

- **Binary name:** `epi`
- **Crate name:** `epi-logos`
- **Library:** Statically linked C11 core (compiled via `cc` crate at build time)

## Installation Methods

### 1. From Source (Primary)

```bash
git clone https://github.com/user/epi-logos.git
cd epi-logos/epi-cli
cargo install --path .
```

Requires: Rust toolchain (rustup), C compiler (clang or gcc).

### 2. Cargo Install (After crates.io Publish)

```bash
cargo install epi-logos
```

### 3. GitHub Releases (Prebuilt Binaries)

Prebuilt for:
- macOS arm64 (Apple Silicon)
- macOS x86_64
- Linux x86_64 (glibc)
- Linux aarch64

Download from Releases page, place in PATH.

### 4. Homebrew (macOS)

```bash
brew tap epi-logos/tap
brew install epi
```

## Repository Structure

```
epi-logos/
├── include/          # C headers (ontology.h, m0.h-m5.h, etc.)
├── src/              # C sources (pillar I, M0-M5)
├── vendor/blake3/    # Vendored BLAKE3 (portable C)
├── epi-cli/          # Rust CLI + TUI
│   ├── build.rs      # cc crate: compiles C into Rust binary
│   ├── Cargo.toml
│   └── src/
├── docs/             # Specs, plans, dev references
├── Makefile          # C-only development workflow
└── DISTRIBUTION.md   # This file
```

## What Gets Published

The `epi` binary includes:
- All C code (Pillar I + M0-M5 + BLAKE3) statically compiled
- Rust CLI (clap dispatch, 12 command families)
- Rust TUI (ratatui dashboard, walk, families, M5 viewer, agent chat)
- No runtime dependencies on shared libraries

## CI/CD (GitHub Actions)

Future: `.github/workflows/release.yml` will:
1. Build on push to `main` tag
2. Cross-compile for 4 targets
3. Create GitHub Release with artifacts
4. Publish to crates.io
```

**Step 3: Commit**

```bash
git add epi-cli/Cargo.toml DISTRIBUTION.md
git commit -m "docs: add distribution strategy + update Cargo.toml metadata"
```

---

### Task 7: Verify Full Pipeline

**Files:** None (verification only)

**Step 1: Run C tests**

Run: `make test`
Expected: all 9 suites pass

**Step 2: Build Rust CLI**

Run: `cd epi-cli && cargo build --release`
Expected: clean build, single binary at `target/release/epi`

**Step 3: Test CLI commands**

Run:
```bash
cd epi-cli
cargo run -- core verify
cargo run -- core dump
cargo run -- core m5
cargo run -- agent chat  # will fail gracefully if pi not installed
```
Expected: core commands work, agent chat shows TUI or clean error

**Step 4: Check binary size**

Run: `ls -lh epi-cli/target/release/epi`
Expected: single binary, reasonable size (likely 2-5 MB)

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Epi-Logos Lib v0.1.0 — static C compilation, M5 TUI, agent chat, distribution"
```
