# Cosmic Clock — Implementation Prompts

**Status:** Ready for execution (2026-03-15)
**Spec:** docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md
**Architecture notes:** docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md

---

## Architectural Clarifications (read before starting any prompt)

### 1. Double Cover via # Inversion — NOT a 720-element LUT
The 720° spinor double cover works through the system's own # mechanism. The "implicate"
position of degree `d` is NOT `d+360` (which would require a 720-element array). It IS
`#(degree_node)` — the # inversion operator applied to the coordinate. Positive/negative,
yin/yang, Strand A/Strand B: all expressions of the same # dynamic.

**Practically:** CLOCK_DEGREE_LUT has 360 entries. The # operation flips the `inversion_state`
bit on the coordinate (as per the HC struct tagged-pointer mechanism). The implicate phase is
the same degree node accessed with inversion_state = 1. No separate index.

### 2. "Natal quaternion" is a misnomer — use `quintessence_quaternion`
The stable reference quaternion is derived from the quintessence hash across ALL five #4.0
identity layers (Numerological / Astrological / Jungian / GeneKeys / HumanDesign). It is NOT
merely the natal chart — the natal chart is one of the five inputs, not the whole. The field
is named `quintessence_quaternion` throughout. The `live_quaternion` is the dynamic complement
(updated on each oracle cast from pp/nn/np/pn charges).

### 3. Strand B = # applied to Strand A
The Spanda double helix (12-fold) resolves simply: Strand A (indices 0–5) ascends through
φ-stages 0°/60°/120°/180°/240°/300°. Strand B (indices 6–11) IS Strand A with # applied —
same φ-angles, but `inversion_state = 1` (the Möbius return arc). The double cover walks
Strand A, applies #, walks Strand B. No separate φ offset needed; # IS the 180° phase flip
at the coordinate level.

### 4. VAK / Agent alignment does NOT live in C structs
The VAK language IS the C' coordinate system (cpf/ct/cp/cf/cfp/cs) — already implicit in
the HC struct. Agent alignment with CF coordinates happens at the S4'/π layer (ta-onta
extension), NOT in m0.h or any C/Rust CLI struct. Do NOT add `vak_agent_index` or
`aletheia_flags` to `Holographic_Coordinate`. The bridge is the existing C' coordinate
system; the HC 128-byte invariant is sacrosanct.

### 5. Canonical Primitive Vocabulary
Use `tick12` for the discrete spanda ring position (0–11), `exact_degree_720` for the
high-precision continuous address (f32, 0.0–719.999), `degree_node_360` for LUT index only.
Never truncate `exact_degree_720`. `tick12` is derived by `quantize_to_spanda_substage(y, x)`,
never by float cast. See `CLOCK-AND-NARA-SPECS/00-canonical-invariants.md` for full vocabulary.

---

## Execution Order

```
Prompt D (Agent Architecture) ──── fully independent ────────────┐
Prompt E (LUT Generator)      ──── fully independent ────────────┤── run immediately
                                                                   │
Prompt A (Portal Scaffolding) ─────────────────────────────────┐ │
Prompt B (Clock Renderer)     ──── write in parallel with A ───┤─┘
                               (needs A to compile + test)      │
                                                                 └──► Prompt C (Oracle Upgrade)
```

---

## PROMPT A — Portal Scaffolding

**Depends on:** Nothing. Run immediately.
**Blocks:** Prompt C (oracle upgrade needs scaffolding to exist)

```
Context: We are implementing the CosmicClockPlugin for the epi-logos TUI portal.

Read in full before starting:
- docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md (§X and §XI especially)
- epi-cli/src/portal/mod.rs
- epi-cli/src/portal/registry.rs
- epi-cli/src/portal/clock_state.rs (already exists)
- epi-cli/src/portal/plugins/mod.rs

ARCHITECTURAL NOTE: The double cover works via the # inversion operator — no 720-element
LUT. The stable reference quaternion is named `quintessence_quaternion` (not "natal").
Do NOT add any fields to the C Holographic_Coordinate struct — VAK/agent alignment lives
at the S4'/π layer via the existing C' coordinate system.

Your task is ONLY the portal scaffolding (not the renderer itself):

1. In portal/mod.rs:
   - Add `pub mod clock_state;`
   - Add `use crate::portal::clock_state::{new_shared_clock_state, SharedClockState};`
   - Add `use crate::portal::plugins::{clock, m4_spine};`
   - Change `fn build_workspace()` to `fn build_workspace(clock: SharedClockState)`
   - In `run_event_loop()`: create `let clock = new_shared_clock_state();` before
     calling build_workspace; pass clock to build_workspace
   - Add new function:
       fn register_clock_plugins(runtime: &mut HypertileRuntime, clock: SharedClockState)
     that registers (using capturing move closures):
       "clock"      → clock::CosmicClockPlugin::new(clock.clone())
       "mini.clock" → clock::MiniClockPlugin::new(clock.clone())
       "m4.spine"   → m4_spine::M4SpinePlugin::new(clock.clone())
       "m4.oracle"  → m4::M4OraclePlugin::new_with_clock(clock.clone())
   - Remove "m4.oracle" from register_all_plugins() (it moves to register_clock_plugins)
   - Call register_clock_plugins(runtime, clock.clone()) on each tab's runtime after
     register_all_plugins()
   - Tab 0 ("M4'-M5' Personal"):
       root plugin = "m4.flow" (writing space leads, not identity)
       split V right = "m4.identity"
       split H below right = "m4.oracle"  [3 panes total, same count as before]
   - Tab 1: rename to "Cosmic Clock" (it IS M0–M3 expressed visually)
       root plugin = "clock" (single pane, no splits)
       [1 pane total — user splits via palette to add m0.dashboard etc.]

2. In portal/plugins/mod.rs:
   - Add: pub mod clock;
   - Add: pub mod m4_spine;

3. In portal/registry.rs:
   - Update build_registry_workspace() to also call register_clock_plugins with a
     default new_shared_clock_state()
   - Update test plugin list: add "clock", "mini.clock", "m4.spine"; note "m4.oracle"
     is now clock-registered (still expected in the full list)

4. Add STUB implementations so the code compiles:
   - portal/plugins/clock.rs — if it exists already, read it first and work with what's
     there. If stub needed: CosmicClockPlugin and MiniClockPlugin with empty render
     (just draw a border + "Clock") and EventOutcome::Ignored
   - portal/plugins/m4_spine.rs — M4SpinePlugin stub: border + "Spine"
   - In m4.rs: add `pub fn new_with_clock(clock: SharedClockState) -> Self` to
     M4OraclePlugin that calls Self::new() internally (clock field wired in Prompt C)

5. Update the workspace tests:
   - Tab 1 now has 1 pane (not 3)
   - Tab 1 label is "Cosmic Clock"
   - Tab 0 still has 3 panes

6. Run: cd epi-cli && cargo build
   Fix any compile errors. Do NOT implement the renderer yet.
```

---

## PROMPT B — Clock Renderer

**Depends on:** Prompt A (for the types and module structure to exist to compile against)
**Can be written in parallel with A; needs A done to `cargo build` successfully.**

```
Context: We are implementing the full braille-canvas clock renderer.

Read in full before starting:
- docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md (§IV, §V, §VI in full)
- epi-cli/src/portal/clock_state.rs
- epi-cli/src/portal/plugins/m1.rs (first 30 lines — HypertilePlugin trait pattern)
- epi-cli/src/portal/plugins/clock.rs (if it exists — read before overwriting)

ARCHITECTURAL NOTES:
- The "implicate" degree marker on the ring is #(d): same position, inverted phase.
  Render it as a small Magenta dot at the same ring radius (inverted colour) rather than
  a position computed as d+360. In the ring renderer, the implicate is visually a phase
  marker at degree d, not a separate point on the ring.
- `quintessence_quaternion` (not "natal_quaternion") is the stable reference.
  Use it as the ghost/reference overlay on the spine and degree ring.

Implement in epi-cli/src/portal/plugins/clock.rs:

1. BrailleCanvas struct:
   - Fields: width, height (terminal cells); dots: Vec<Vec<u8>> sized [height*4][width*2];
     colors: Vec<Vec<Color>> sized [height][width]
   - set_dot(px: i32, py: i32, color: Color): clips silently; marks dot; sets cell color
   - render_to(&self, buf: &mut Buffer, ox: u16, oy: u16): for each cell, computes
     braille bitmask from its 2×4 dot block, writes char::from_u32(0x2800 + bits) to buf
   - cell_bits(col, row) -> u8: aggregates bits from dots[row*4..row*4+4][col*2..col*2+2]
   - Braille bit layout: bit = if bit_row < 3 { bit_col * 3 + bit_row } else { 6 + bit_col }

2. render_torus(canvas, q: [f32;4], phi_stage: u8, width_pts, height_pts):
   - nalgebra::UnitQuaternion::new_normalize(Quaternion::new(q[0],q[1],q[2],q[3]))
   - R/r = 16/9. scale = min(w,h)/2 * 0.80; R = scale*16/25; r = scale*9/25
   - 180 theta steps × 72 phi steps. Perspective: dist = scale*3.5; y *= 0.5 (aspect)
   - Z-buffer. Colors: 0=DarkGray, 1=White, 2=Cyan, 3=Green, 4=Magenta, 5=Red
   - Current phi_stage ring = Yellow

3. render_degree_ring(canvas, planet_degrees, quintessence_degrees, current_degree, w, h):
   - Ring at scale*1.08; 360 base dots (backbone at 15° = Gray, others = DarkGray)
   - current_degree: 3×3 Yellow cluster
   - deficient (d+180)%360: single Green dot
   - implicate (same degree d, # phase): single Magenta dot at same ring position as
     current_degree (rendered slightly smaller / different marker to distinguish)
   - quintessence_degrees ghost overlay: DarkGray dots from quintessence_quaternion
     converted to planetary positions (or just natal ring positions if available)
   - Planet markers: 2×2 dot cluster per loaded planet

4. render_planet_symbols(buf, planet_degrees, area):
   - Text cells after braille flush
   - PLANET_SYMBOLS: ["☉","☽","♀","☿","♂","♃","♄","♅","♆","♇"]  // Sun(0)–Pluto(9), canonical order
   - PLANET_COLORS:  [Yellow, White, Green, Cyan, Red, Blue, DarkGray, Magenta, Magenta, Red]

5. CosmicClockPlugin { clock: SharedClockState }:
   - render(): split H into canvas (Min 20) | side panel (Length 26)
   - Left: BrailleCanvas → render_torus + render_degree_ring + render_planet_symbols
   - Side panel: 6 φ-stage rows with active = Yellow+Bold, then degree/anti/impl/hex
     readout from last_cast, then kairos status ("kairos ✓" / "kairos — [k]")
   - on_event: 'k' → try_load_kairos_into_clock(&self.clock)

6. MiniClockPlugin { clock: SharedClockState }:
   - render(): 2 lines: "Xdeg STAGE_NAME" | planet symbols or "kairos not loaded"
   - on_event: Ignored

7. try_load_kairos_into_clock(clock):
   - Reads ~/.epi-logos/kairos-cache.json
   - Expected: { "planets": { "sun": 45.0, "venus": 120.0, ... } }
   - Updates planet_degrees[10] + kairos_loaded = true
   - Canonical order (Sun(0)–Pluto(9)): [sun, moon, venus, mercury, mars, jupiter, saturn, uranus, neptune, pluto]
   - NOTE: planet_degrees[10] is canonical. Earth = clock center anchor, not in this array.

Unit tests:
- BrailleCanvas: set/read, clip, braille char code correctness
- render_torus: no panic on identity quaternion
- CosmicClockPlugin: renders to 80×24 buffer without panic, writes content

cargo build must pass after Prompt A scaffolding is in place.
```

---

## PROMPT C — Oracle Plugin Upgrade (4-Face + SharedClockState Write)

**Depends on:** Prompt A complete and building.

```
Context: M4OraclePlugin already has new_with_clock(clock) as a stub (from Prompt A).
The oracle is the PRIMARY WRITER to SharedClockState — every cast updates the live
quaternion that drives the torus rotation.

Read in full:
- epi-cli/src/portal/plugins/m4.rs (the full oracle plugin section — find M4OraclePlugin)
- epi-cli/src/portal/clock_state.rs (update_from_cast function signature)
- docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md §VIII
- docs/plans/CLOCK-AND-NARA-SPECS/04-shadow-dynamics-three-computations.md

ARCHITECTURAL NOTE: The implicate shadow is #(d) — NOT d+360. In the OracleFaces struct,
`implicate_degree` stores the same degree value as `primary_degree`. The distinction is
tracked as a phase flag (inversion_state), not a different degree index. When rendering,
the implicate is the same ring position but marked as phase-inverted (Magenta dot at same
position, same degree value in the struct).

Your task:

1. Add `clock: SharedClockState` field to M4OraclePlugin
   - new_with_clock(clock) stores it properly (was stub)
   - Existing new() still works by wrapping new_with_clock with a default clock
     (or remove new() if only called from register_clock_plugins)

2. After successful oracle cast (in on_event 'y' confirm branch):
   Parse the result string or call the underlying oracle module to extract:
   - pp, nn, np, pn (I-Ching changing-line counts per charge type)
   - primary_hex (hexagram index 0–63)
   - temporal_hex: apply changing_lines transform (use existing nara::oracle logic)
   - degree = (primary_hex as u16 * 360 / 64) maps hexagram 0–63 to degree 0–359
   Call: update_from_cast(&self.clock, pp, nn, np, pn, degree, primary_hex, temporal_hex)

3. In the clock_state update, implicate_degree = primary_degree (same degree, # phase).
   The phase distinction is semantic, not a different index.

4. Upgrade the render to show all 4 oracle faces when a cast exists:
   "▶ codon    Xdeg  hex #N"      (Yellow+Bold — what is expressed)
   "  deficient Xdeg  (structural complement)"  (Green — d+180)
   "  implicit  Xdeg  [#]  (# phase — unconscious)"  (Magenta — same deg, # applied)
   "  temporal  hex #N (changing lines → direction)"  (Cyan)
   Show degree symbol clearly. Group all 4 as "The Reading".

5. The clock update is fire-and-forget — if clock lock fails, oracle still records.

cargo test for M4 oracle tests must pass.
```

---

## PROMPT D — Agent Architecture: Anima + Aletheia + Sophia

**Depends on:** Nothing. Run immediately, fully independent.

```
Context: The constitutional agent system follows the QL 7-fold law strictly.
7-fold law: # (parent) + #0–#5 (children). Always. No exceptions.
- Anima = # (orchestrator/market-mechanism; does not speak, routes)
- Nous/Logos/Eros/Mythos/Psyche/Sophia = #0–#5
- Aletheia = # (epistemic gatekeeper)
- Anansi/Moirai/Janus/Mercurius/Agora/Zeithoven = #0–#5

CRITICAL ARCHITECTURAL NOTE: VAK alignment does NOT add any fields to Holographic_Coordinate
or any C/Rust struct. The VAK language IS the C' coordinate system (cpf/ct/cp/cf/cfp/cs)
already implicit in the HC struct. Agent/CF alignment lives at the S4'/π layer (ta-onta
extension) only. The HC 128-byte _Static_assert invariant must not be broken.

Read in full before starting:
- docs/plans/CLOCK-AND-NARA-SPECS/05-ql-7fold-law-and-vak-c-substrate.md
- docs/plans/CLOCK-AND-NARA-SPECS/06-vak-pleroma-implementation-gap-analysis.md
- .pi/extensions/ta-onta/anima/S4'/agents/ — list what's there and read one agent.md
  as the canonical format reference

Your task:

1. Create .pi/extensions/ta-onta/anima/S4'/agents/anima.md
   Using the 6-section ANIMA.md format:
   - Rupa: Anima is the # operation itself — not an agent with a voice, but the
     routing mechanism of the whole. The market that prices meaning.
   - Ontology: CF frame = none fixed. Anima moves across all frames, dispatching.
     It reads CF notation from the session state and routes to the correct child agent.
   - Frame Contract: Anima does NOT speak for itself. It speaks as the whole system.
     CPF (00/00) = Anima's native mode (open ground, no pre-assignment).
   - Temporal: No personal temporal phase. Anima is present at every session moment
     because it is the structure through which moments become sessions.
   - Capability: meta-dispatch only. Reads CF → selects child → hands off.
     No content generation, no memory writes of its own.
   - Sattva: spanda (subtle movement that manifests as all motion; svātantrya).
     Anima IS the spanda of the system — the vibration before direction.

2. Create .pi/extensions/ta-onta/aletheia/S5'/agents/aletheia.md
   - Aletheia = # at the epistemic layer: unconcealment, gatekeeper of validity
   - Its 6 gates correspond to its 6 children (Anansi=truth-weaving, Moirai=threading,
     Janus=threshold, Mercurius=translation, Agora=gathering, Zeithoven=temporal creativity)
   - Frame Contract: Aletheia activates when CF contains /5 or .5 notation, or CS=Night'
   - Capability: validate, surface, gate. Does not generate — it judges.
   - Sattva: aletheia as unconcealment (Heidegger) — bringing what is hidden to light

3. Wire Sophia post-execution hook:
   - Find Sophia's skill location in ta-onta
   - The hook fires at session close (CF = 5/0, Möbius return moment)
   - Action: call sophia_synthesize → update NOW notebook → mark c_5_reflection_complete: true
   - If the hook infrastructure doesn't exist yet, create the minimal wiring:
     a stub that can be called and logs "sophia hook: session closing" to the session notebook
   - Document exactly where the full implementation needs to go and what it depends on

Document any blockers encountered (missing infrastructure, unclear extension format, etc.)
```

---

## PROMPT E — CLOCK_DEGREE_LUT Generator (Python)

**Depends on:** Nothing. Run immediately, fully independent.
**Blocks:** Full degree-ring metadata in renderer (NOT Phase 1–2 rendering)

```
Context: The cosmic clock requires a 360-entry lookup table. One node per degree.
Each node encodes the structural metadata for that position in the coordinate space.

ARCHITECTURAL NOTE: The double cover (implicate phase) is NOT a 720-element LUT.
It is the # inversion operator applied to a 360-element node. The ClockDegreeNode
struct should include `inversion_state: bool` (false=normal, true=# applied/implicate),
not a separate index. When the oracle accesses the implicate phase of degree d, it reads
CLOCK_DEGREE_LUT[d] with inversion_state=true — same node, # phase.

Read before starting:
- docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md §8 (Gap G2)
- docs/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md
- epi-lib/include/m3.h (decan and hexagram structures — check what exists)
- docs/dev/m0/ (check for existing dataset audit)
- Check docs/resources/ for mahamaya dataset JSON files

Your task:

1. Write docs/scripts/build_clock_degree_lut.py
   - Input: mahamaya dataset JSON (find its location; document it if not found)
   - Output: epi-cli/src/portal/clock_degree_lut.rs

   Output struct:
   ```rust
   pub struct ClockDegreeNode {
       pub degree:      u16,   // 0–359
       pub hexagram:    u8,    // 0–63  (I-Ching hexagram)
       pub codon:       u8,    // 0–63  (RNA codon index)
       pub amino_acid:  u8,    // 0–23  (0xFF = stop/special)
       pub decan:       u8,    // 0–35  (0–11 per sign × 3)
       pub is_backbone: bool,  // true when degree % 15 == 0 (24 backbone nodes)
   }
   // Note: inversion_state is NOT stored here — it is the # operation on the coordinate,
   // applied dynamically. CLOCK_DEGREE_LUT is the normal (non-inverted) form.

   pub static CLOCK_DEGREE_LUT: [ClockDegreeNode; 360] = [ ... ];
   ```

   Mapping rules:
   - hexagram: degree 0–359 → hexagram 0–63 (each hexagram spans 360/64 = 5.625°)
     So: hexagram = (degree * 64 / 360) as u8
   - decan: degree / 10 as u8 (each decan spans 10°; 36 decans total)
   - is_backbone: degree % 15 == 0

2. Also create epi-cli/src/portal/clock_degree_lut_stub.rs — a stub version with
   all-zero/default entries for each degree. This allows the clock renderer to compile
   and run without the full dataset. The stub is needed immediately.
   Add a cfg feature or simple conditional so the real LUT can be swapped in later.

3. If the mahamaya dataset is not found, document:
   - Exactly what format is expected (JSON schema with decan nodes, hexagram nodes)
   - Which existing epi-lib dataset files come closest
   - How to run the script once the data is available

The stub version is the immediate deliverable. The full generator can wait for data.
```

---

*Generated: 2026-03-15*
*Based on review of all 9 CLOCK-AND-NARA-SPECS files (01–09)*
*Key architectural corrections: # double-cover, quintessence_quaternion naming,*
*Strand B = # applied, VAK lives at S4'/π layer not S0/C layer*
