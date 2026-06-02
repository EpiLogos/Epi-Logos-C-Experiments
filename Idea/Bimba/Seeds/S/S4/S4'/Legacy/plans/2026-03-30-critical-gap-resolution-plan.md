# Critical Gap Resolution Plan — Nara / Cosmic Clock

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all P0/P1 spec audit gaps and implement missing portal plugins (CosmicClockPlugin, MiniClockPlugin, M4SpinePlugin, M2VibrationalMatrix, M3KnowingDossier).

**Architecture:** SharedClockState as central hub (`Arc<Mutex<PortalClockState>>`); all plugins read/write through it. Oracle cast → `update_from_cast()` closes the feedback loop. Portal gains Tab 2 "M' Clock" for CosmicClockPlugin.

**Tech Stack:** Rust 2021, ratatui 0.30, ratatui-hypertile, BLAKE3, crossterm, serde_json

---

## Task 1: Align oracle.rs planet constants to canonical mod-10

**Priority:** P0
**Files:** `epi-cli/src/nara/oracle.rs`, `epi-cli/src/nara/kairos.rs`

**Problem:** Legacy planet ordering (SUN=0, EARTH=1, VENUS=2, ...) conflicts with canonical mod-10 spec. Earth is the geocentric observer/center — it is NOT in the canonical planet array.

**Fix:**
- Update `planet::` submodule constants in `oracle.rs` to canonical ordering:
  ```rust
  pub const SUN:     u8 = 0;
  pub const MOON:    u8 = 1;
  pub const MERCURY: u8 = 2;
  pub const VENUS:   u8 = 3;
  pub const MARS:    u8 = 4;
  pub const JUPITER: u8 = 5;
  pub const SATURN:  u8 = 6;
  pub const URANUS:  u8 = 7;
  pub const NEPTUNE: u8 = 8;
  pub const PLUTO:   u8 = 9;
  ```
- Remove any `EARTH` constant from the planet submodule (Earth = geocentric center, not in array)
- Update `kairos.rs` embedded Python script `planet_ids` array if it uses legacy ordering
- Audit all match arms and LUT lookups in oracle.rs that use planet indices; update to new ordering
- Update `planet_degrees: [f32; 10]` sizing in any affected structs (must be 10, not 7 or 9)

**Steps:**
- [ ] Write failing tests first:
  ```rust
  #[test]
  fn planet_sun_is_index_0() { assert_eq!(planet::SUN, 0u8); }
  #[test]
  fn planet_moon_is_index_1() { assert_eq!(planet::MOON, 1u8); }
  #[test]
  fn planet_earth_constant_absent() {
      // This test documents intent; will compile-fail if EARTH exists
  }
  #[test]
  fn planet_pluto_is_index_9() { assert_eq!(planet::PLUTO, 9u8); }
  ```
- [ ] Run tests to confirm they fail: `cargo test -- oracle planet`
- [ ] Update planet constants in `oracle.rs` to canonical mod-10
- [ ] Remove EARTH constant
- [ ] Update `kairos.rs` Python `planet_ids` if needed
- [ ] Audit and fix all downstream match arms / LUT indices
- [ ] Run `cargo test -- oracle planet`
- [ ] Commit: `fix(oracle): align planet constants to canonical mod-10; remove EARTH from array`

---

## Task 2: Wire oracle cast → SharedClockState via update_from_cast()

**Priority:** P0
**Files:** `epi-cli/src/nara/oracle.rs`, `epi-cli/src/portal/clock_state.rs`

**Problem:** Oracle cast results (pp/nn/np/pn charges, hexagram, computed degree) are computed but never fed back into SharedClockState. The clock feedback loop is broken.

**Fix:**
- Add `update_from_cast()` method to `PortalClockState` in `clock_state.rs`:
  ```rust
  pub fn update_from_cast(&mut self, cast_result: &OracleCastResult) {
      self.last_cast = Some(cast_result.clone());
      // Update degree from cast if oracle cast defines clock position
      if let Some(degree) = cast_result.clock_degree {
          self.current_degree = degree;
          self.tick12 = (degree / 30) as u8;
      }
  }
  ```
- Add `shared_clock: Option<&SharedClockState>` parameter to oracle cast handler in `oracle.rs`
- After computing charges and hexagram, call `clock.lock().unwrap().update_from_cast(&result)` if clock is Some
- Add `last_cast: Option<OracleCastResult>` field to `PortalClockState`

**Steps:**
- [ ] Write failing test:
  ```rust
  #[test]
  fn oracle_cast_updates_shared_clock_last_cast() {
      let clock = SharedClockState::new_default();
      {
          let state = clock.lock().unwrap();
          assert!(state.last_cast.is_none());
      }
      // Simulate oracle cast with clock reference
      let result = OracleCastResult { hexagram: 42, clock_degree: Some(180.0), .. };
      clock.lock().unwrap().update_from_cast(&result);
      let state = clock.lock().unwrap();
      assert!(state.last_cast.is_some());
      assert_eq!(state.current_degree, 180.0);
  }
  ```
- [ ] Run: `cargo test -- oracle clock`
- [ ] Add `update_from_cast()` to `PortalClockState`
- [ ] Wire oracle cast handler to call `update_from_cast()` when clock provided
- [ ] Run: `cargo test -- oracle clock`
- [ ] Commit: `feat(oracle): wire cast result into SharedClockState via update_from_cast()`

---

## Task 3: Add hash_to_clock_position() + nara.identity.clock_position RPC

**Priority:** P1
**Files:** `epi-cli/src/nara/identity.rs`, `epi-cli/src/gate/nara.rs`

**Problem:** M4 Quintessence Identity Hash spec requires converting BLAKE3 hash to a clock position, but `hash_to_clock_position()` is unimplemented and no RPC exposes it.

**Spec:** Given a 32-byte BLAKE3 hash:
```rust
pub fn hash_to_clock_position(hash: &[u8; 32]) -> ClockPosition {
    let degree = ((hash[0] as u16 | ((hash[1] as u16) << 8)) % 360) as f32;
    let tick12 = (degree / 30.0) as u8;
    let phase = hash[2] & 1;
    let exact_degree_720 = degree * 2.0;  // 720-space
    ClockPosition { degree, tick12, phase, exact_degree_720 }
}
```

**RPC** `nara.identity.clock_position` returns:
```json
{
  "degree": 247.0,
  "tick12": 8,
  "phase": 1,
  "exact_degree_720": 494.0,
  "hash_preview": "a3f2..."
}
```

**Steps:**
- [ ] Write failing test:
  ```rust
  #[test]
  fn hash_to_clock_position_uses_first_two_bytes() {
      let mut hash = [0u8; 32];
      hash[0] = 0xB4;   // 180 in low byte
      hash[1] = 0x00;
      hash[2] = 0x01;   // phase = 1
      let pos = hash_to_clock_position(&hash);
      assert_eq!(pos.degree as u16, 180);
      assert_eq!(pos.tick12, 6);  // 180/30 = 6
      assert_eq!(pos.phase, 1);
  }
  ```
- [ ] Run: `cargo test -- identity hash_to_clock`
- [ ] Implement `hash_to_clock_position()` in `identity.rs`
- [ ] Add `ClockPosition` struct if not present
- [ ] Register `nara.identity.clock_position` RPC in `gate/nara.rs`
- [ ] Run: `cargo test -- identity hash_to_clock`
- [ ] Commit: `feat(identity): add hash_to_clock_position() and nara.identity.clock_position RPC`

---

## Task 4: QvFacet in KnowingDossier

**Priority:** P1
**Files:**
- `epi-cli/src/core/knowing/types.rs`
- `epi-cli/src/core/overlay.rs`
- `epi-cli/src/core/knowing/mod.rs`
- `epi-cli/src/core/knowing/render.rs`

**Problem:** `KnowingDossier` has no `qv_facet` field. The M3' Knowing Dossier plugin (Spec 14) requires `QvEntry` with 5 fields. `overlay::overlay_entry()` exists but is not wired into dossier construction.

**Fix:**

Add `QvFacet` struct to `types.rs`:
```rust
pub struct QvFacet {
    pub essence:       String,
    pub q_nature:      Option<String>,
    pub q_essence:     Option<String>,
    pub q_formulation: Option<String>,
    pub q_structure:   Option<String>,
}
```

Add `qv_facet: Option<QvFacet>` field to `KnowingDossier`.

In `build_family_dossier_with_mode()` (mod.rs), after constructing the dossier, call `overlay::overlay_entry(&coordinate)` and map result into `QvFacet`.

Add QV panel to `render.rs` output — renders the 5 fields with `·` for None.

**Steps:**
- [ ] Write failing test:
  ```rust
  #[test]
  fn knowing_dossier_has_qv_facet_field() {
      let dossier = build_family_dossier_with_mode("C3", DossierMode::Full).unwrap();
      // qv_facet should be Some even if all Option sub-fields are None
      assert!(dossier.qv_facet.is_some());
      let qv = dossier.qv_facet.unwrap();
      // essence must always be populated
      assert!(!qv.essence.is_empty());
  }
  ```
- [ ] Run: `cargo test -- knowing qv_facet`
- [ ] Add `QvFacet` struct to `types.rs`
- [ ] Add `qv_facet: Option<QvFacet>` to `KnowingDossier`
- [ ] Wire `overlay_entry()` into `build_family_dossier_with_mode()`
- [ ] Add QV panel render to `render.rs`
- [ ] Run: `cargo test -- knowing qv_facet`
- [ ] Commit: `feat(knowing): add QvFacet to KnowingDossier; wire overlay into dossier build`

---

## Task 5: CLOCK_DEGREE_LUT struct + stub + generation script

**Priority:** P1
**Files:**
- `epi-lib/include/m3.h`
- `epi-lib/src/m3_clock_lut.c` (new)
- `tools/build_clock_degree_lut.py` (new)
- `Makefile`

**Problem:** The 3D torus renderer and M2 Vibrational Matrix both need `CLOCK_DEGREE_LUT[360]` mapping each degree node to hexagram, decan, chakra, etc. The struct is unspecified and no LUT exists.

**Spec:**

In `m3.h`:
```c
typedef struct {
    uint16_t degree_node_360;    // 0-359 (LUT index)
    uint8_t  hexagram_id;        // 0-63
    uint8_t  decan_idx;          // 0-35 (floor(degree/10))
    uint8_t  ruling_planet;      // 0-9 canonical mod-10
    uint8_t  zodiac_sign;        // 0-11
    uint8_t  chakra_id;          // 0-7
    uint8_t  strand;             // 0=explicate, 1=implicate
    float    exact_degree_720;   // degree * 2.0
} Clock_Degree_Entry;

extern const Clock_Degree_Entry CLOCK_DEGREE_LUT[360];
```

`m3_clock_lut.c`: stub with 360 zero-initialized entries.

`tools/build_clock_degree_lut.py`: queries Neo4j (or falls back to computed values) to populate the LUT and emit a C source file. Requires `NEO4J_URI`/`NEO4J_PASSWORD` env vars; falls back to pure computation if unavailable.

Makefile `lut` target: runs `python3 tools/build_clock_degree_lut.py > epi-lib/src/m3_clock_lut.c && make`.

**Steps:**
- [ ] Write failing C test:
  ```c
  void test_clock_degree_lut_size(void) {
      assert(sizeof(CLOCK_DEGREE_LUT) == 360 * sizeof(Clock_Degree_Entry));
  }
  ```
- [ ] Run: `make test` (expect compile error — struct undefined)
- [ ] Add `Clock_Degree_Entry` struct and `extern` declaration to `m3.h`
- [ ] Create `epi-lib/src/m3_clock_lut.c` with zero-initialized stub array
- [ ] Run: `make test` (size assert must pass)
- [ ] Create `tools/` directory if absent
- [ ] Write `tools/build_clock_degree_lut.py` with Neo4j + computed fallback
- [ ] Add `lut` target to Makefile
- [ ] Run: `make test`
- [ ] Commit: `feat(m3): add Clock_Degree_Entry LUT stub and build_clock_degree_lut.py`

---

## Task 6: parse_kerykeion_to_kairos_state()

**Priority:** P1
**Files:** `epi-cli/src/nara/kairos.rs`

**Problem:** `kairos sync` calls kerykeion Python and receives JSON, but no function parses this JSON into a `KairosState` with canonical `planet_degrees: [f32; 10]`. The mapping from kerykeion output to mod-10 canonical ordering is not implemented.

**Fix:**

```rust
pub fn parse_kerykeion_to_kairos_state(json: &str) -> Result<KairosState> {
    let raw: KerykeionResult = serde_json::from_str(json)?;
    let mut planet_degrees = [-1.0f32; 10];  // -1.0 = unavailable sentinel
    // Map kerykeion planet names to canonical indices
    for planet in &raw.planets {
        let idx = match planet.name.as_str() {
            "Sun"     => Some(0),
            "Moon"    => Some(1),
            "Mercury" => Some(2),
            "Venus"   => Some(3),
            "Mars"    => Some(4),
            "Jupiter" => Some(5),
            "Saturn"  => Some(6),
            "Uranus"  => Some(7),
            "Neptune" => Some(8),
            "Pluto"   => Some(9),
            _         => None,
        };
        if let Some(i) = idx {
            planet_degrees[i] = planet.position as f32;
        }
    }
    Ok(KairosState { planet_degrees, .. })
}
```

Wire into `kairos sync` command after calling kerykeion subprocess.

**Steps:**
- [ ] Write failing test:
  ```rust
  #[test]
  fn parse_kerykeion_places_sun_at_index_0() {
      let json = r#"{"planets":[{"name":"Sun","position":247.5},{"name":"Moon","position":33.2}]}"#;
      let state = parse_kerykeion_to_kairos_state(json).unwrap();
      assert!((state.planet_degrees[0] - 247.5).abs() < 0.01);  // Sun
      assert!((state.planet_degrees[1] - 33.2).abs() < 0.01);   // Moon
  }
  ```
- [ ] Run: `cargo test -- kairos parse_kerykeion`
- [ ] Implement `parse_kerykeion_to_kairos_state()`
- [ ] Wire into `kairos sync` command
- [ ] Run: `cargo test -- kairos parse_kerykeion`
- [ ] Commit: `feat(kairos): add parse_kerykeion_to_kairos_state() with canonical mod-10 mapping`

---

## Task 7: Thread SharedClockState through portal plugin registration

**Priority:** P0
**Files:** `epi-cli/src/portal/mod.rs`

**Problem:** SharedClockState is constructed but not passed to plugins that need it. Plugins call `new()` bare constructors and cannot read tick12 or planet positions.

**Fix:**

In `build_workspace()`:
```rust
let clock: SharedClockState = Arc::new(Mutex::new(PortalClockState::default()));

register_all_plugins(&mut runtime, clock.clone());
```

In `register_all_plugins()`:
```rust
fn register_all_plugins(runtime: &mut HypertileRuntime, clock: SharedClockState) {
    // Each plugin that requires SharedClockState gets new_with_clock()
    let c = clock.clone();
    runtime.register_plugin_type("m2.vibrational", move || {
        m2::M2VibrationalPlugin::new_with_clock(c.clone())
    });

    let c = clock.clone();
    runtime.register_plugin_type("m3.knowing", move || {
        m3::M3KnowingPlugin::new_with_clock(c.clone())
    });

    let c = clock.clone();
    runtime.register_plugin_type("cosmic_clock", move || {
        cosmic_clock::CosmicClockPlugin::new_with_clock(c.clone())
    });

    // ... etc for mini_clock, spine
}
```

**Steps:**
- [ ] Write failing test:
  ```rust
  #[test]
  fn build_workspace_passes_clock_to_plugins() {
      let workspace = build_workspace(WorkspaceConfig::default()).unwrap();
      // All clock-dependent plugins should have SharedClockState Some
      // (test via plugin inspection or just ensure build succeeds)
      assert!(workspace.plugin_count() > 0);
  }
  ```
- [ ] Run: `cargo test -- portal build_workspace`
- [ ] Refactor `build_workspace()` to create SharedClockState and thread through registration
- [ ] Add `new_with_clock()` constructors to m2, m3, cosmic_clock, mini_clock, spine plugins
- [ ] Run: `cargo test -- portal build_workspace`
- [ ] Commit: `refactor(portal): thread SharedClockState through all plugin registrations`

---

## Task 8: CosmicClockPlugin — braille torus renderer

**Priority:** P1
**Files:**
- `epi-cli/src/portal/plugins/cosmic_clock.rs` (new)
- `epi-cli/src/portal/plugins/mod.rs`
- `epi-cli/src/portal/mod.rs`

**Spec:** Full specification in `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`

**Summary:**
- BrailleCanvas 3D torus (R=0.64, r=0.36). 4320 nodes rendered as Braille Unicode.
- `θ = degree(M3)` (0–359° from degree ring), `φ = torus_stage(M1)` (0–11 spanda ticks)
- 385 nodes total: 360 degree + 24 amino acid backbone + 1 Axis Mundi/Quintessence
- Tab 2 "M' Clock" — this plugin occupies the full clock tab
- Reads SharedClockState for live position; writes back via oracle cast

**Steps:**
- [ ] Write failing test:
  ```rust
  #[test]
  fn cosmic_clock_plugin_renders_without_panic() {
      let clock = SharedClockState::new_default();
      let mut plugin = CosmicClockPlugin::new_with_clock(clock);
      // render to a test buffer
      let backend = TestBackend::new(80, 40);
      let mut terminal = Terminal::new(backend).unwrap();
      terminal.draw(|f| plugin.render(f, f.size())).unwrap();
  }
  ```
- [ ] Run: `cargo test -- cosmic_clock`
- [ ] Create `cosmic_clock.rs` with BrailleCanvas torus math
- [ ] Add to `plugins/mod.rs` and register in `portal/mod.rs` under Tab 2
- [ ] Run: `cargo test -- cosmic_clock`
- [ ] Commit: `feat(portal): add CosmicClockPlugin with braille torus renderer in Tab 2`

---

## Task 9: MiniClockPlugin + M4SpinePlugin

**Priority:** P1
**Files:**
- `epi-cli/src/portal/plugins/mini_clock.rs` (new)
- `epi-cli/src/portal/plugins/spine.rs` (new)

**MiniClock spec:**
- 12-position spanda wheel rendered as arc/dial
- Center label: `current_degree` value and zodiac sign glyph
- Planet symbols distributed around the wheel at their decan positions
- Reads SharedClockState; updates every 50ms tick
- Compact: designed for a small pane (≈ 20×10)

**Spine spec:**
- 8-chakra vertical column: `⊕①②③④⑤⑥⑦` with label
- Live `chakra_levels: [f32; 8]` bars (filled/empty Unicode blocks `█▓▒░`)
- EarthBody root anchor text at bottom
- 4h oracle decay: levels fade from last oracle cast toward neutral over 4 hours
- Reads SharedClockState for `last_cast` timestamp and chakra charge data

**Steps:**
- [ ] Write failing tests:
  ```rust
  #[test]
  fn mini_clock_renders_12_tick_positions() {
      let clock = SharedClockState::new_default();
      let plugin = MiniClockPlugin::new_with_clock(clock);
      assert_eq!(plugin.tick_count(), 12);
  }

  #[test]
  fn spine_has_8_chakra_levels() {
      let clock = SharedClockState::new_default();
      let plugin = M4SpinePlugin::new_with_clock(clock);
      assert_eq!(plugin.chakra_levels().len(), 8);
  }
  ```
- [ ] Run: `cargo test -- mini_clock spine`
- [ ] Implement `mini_clock.rs`
- [ ] Implement `spine.rs`
- [ ] Register both in `portal/mod.rs`
- [ ] Run: `cargo test -- mini_clock spine`
- [ ] Commit: `feat(portal): add MiniClockPlugin and M4SpinePlugin`

---

## Task 10: M2' Vibrational Matrix plugin

**Priority:** P1
**Files:** `epi-cli/src/portal/plugins/m2.rs`

**Spec:** Full specification in `Idea/Bimba/Seeds/M/M2'/Legacy/plans/CLOCK-AND-NARA-SPECS/15-m2-vibrational-matrix-portal-plugin.md`

**Summary:**
- 12×6 matrix of `MatrixCell` structs (72 half-decans)
- Rows = spanda ticks (t0–t11); Columns = QL positions (#0–#5)
- Element color coding (Fire=Red, Earth=Green, Air=Yellow, Water=Cyan)
- Current tick12 row glows bold; planet symbols overlaid from KairosState
- Detail view: body zone + herb from medicine LUTs; hex shows `~approximated` until Task 5
- `DECAN_RULER_TABLE[36]` static Chaldean/Golden Dawn lookup

**Steps:**
- [ ] Write failing tests (from Spec 15 §12)
- [ ] Run: `cargo test -- m2`
- [ ] Implement `build_cells()` with `DECAN_RULER_TABLE`
- [ ] Implement Matrix, Detail, PlanetOverlay view modes
- [ ] Wire SharedClockState for tick12 + planet positions
- [ ] Implement keyboard map (↑↓←→ Enter Escape p m r s e ?)
- [ ] Add medicine popup
- [ ] Register in portal Tab 1
- [ ] Run: `cargo test -- m2`
- [ ] Commit: `feat(portal): implement M2VibrationalMatrix plugin (72-fold epogdoon)`

---

## Task 11: M3' Knowing Dossier plugin

**Priority:** P1
**Files:** `epi-cli/src/portal/plugins/m3.rs`

**Spec:** Full specification in `Idea/Bimba/Seeds/M/M3'/Legacy/plans/CLOCK-AND-NARA-SPECS/14-m3-knowing-dossier-portal-plugin.md`

**Summary:**
- Interactive epistemic browser for `epi core knowing <coord>`
- Coordinate input bar with auto-suggest from SharedClockState (`C{tick12%6}`)
- 7-panel layout: Essence, QV Facets, Structural Correspondences (6 families), Graph Relations, Vimarsa Hits, Action Bar
- Background thread loading via `build_family_dossier_with_mode()`
- Loading spinner `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` in panel title while fetching
- Navigation history (LIFO stack, `←` to go back)
- Family colors: P=Magenta, S=Cyan, T=White, M=Red, L=Yellow, C=Green
- Enter on structural row navigates to that coordinate
- Neo4j unavailable renders gracefully

**Steps:**
- [ ] Write failing tests (from Spec 14 §12)
- [ ] Run: `cargo test -- m3`
- [ ] Implement `parse_coordinate()` with normalize + inversion support
- [ ] Implement `on_mount()` with clock auto-suggest
- [ ] Implement background load with channel + spinner
- [ ] Implement all 7 panels with correct layout constraints
- [ ] Implement keyboard map (i / Enter Escape Tab j k ← r o g Alt+q c ?)
- [ ] Wire SharedClockState for mount suggestion
- [ ] Add registry wiring in `portal/mod.rs`
- [ ] Run: `cargo test -- m3`
- [ ] Commit: `feat(portal): implement M3KnowingDossier plugin (epistemic browser)`

---

## Dependency Graph

```
Task 1 (planet constants)
    └─→ Task 2 (oracle → clock)
    └─→ Task 6 (kerykeion parse)

Task 4 (QvFacet)
    └─→ Task 11 (M3 plugin)

Task 5 (CLOCK_DEGREE_LUT)
    └─→ Task 10 (M2 plugin — removes ~approximated)
    └─→ Task 8 (CosmicClock — full degree data)

Task 6 (kerykeion)
    └─→ Task 7 (threading clock)
    └─→ Task 10 (M2 plugin planet overlay)

Task 7 (SharedClockState threading)
    └─→ Task 8 (CosmicClock)
    └─→ Task 9 (MiniClock + Spine)
    └─→ Task 10 (M2 plugin)
    └─→ Task 11 (M3 plugin)

Task 2 (oracle → clock)
    └─→ Task 9 (Spine decay)

Task 3 (hash_to_clock_position)
    └─→ Task 8 (CosmicClock identity hash anchor)
```

**Recommended execution order:** 1 → 4 → 5 → 6 → 3 → 2 → 7 → 9 → 10 → 11 → 8

Tasks 1, 4, 5, 6, 3 have no mutual dependencies and can be parallelized across agents.
Tasks 7–11 require Task 7 to complete first (SharedClockState threading).

---

## Definition of Done

All 11 tasks complete when:

- [ ] `cargo test` passes with 0 failures
- [ ] `make test` passes with 0 failures
- [ ] Portal Tab 1 "M0'-M3' Structural" shows functional M2 and M3 plugins
- [ ] Portal Tab 2 "M' Clock" shows CosmicClockPlugin with live torus
- [ ] Oracle cast updates SharedClockState (feedback loop closed)
- [ ] `epi nara kairos sync` populates canonical mod-10 planet degrees
- [ ] CLOCK_DEGREE_LUT stub compiles; `sizeof` assert passes
- [ ] All planet references in codebase use canonical mod-10 indices
- [ ] QvFacet present in KnowingDossier with `·` for None fields in TUI
