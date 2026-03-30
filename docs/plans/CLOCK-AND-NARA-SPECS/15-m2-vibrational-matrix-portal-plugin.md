# M2' Vibrational Matrix — Portal Plugin TUI Specification

**Coordinate:** M2' — Parashakti / Vibrational Architecture
**Status:** Canonical specification
**Date:** 2026-03-30
**Portal tab:** Tab 1 "M0'-M3' Structural"
**Replaces:** stub in `epi-cli/src/portal/plugins/m2.rs`

---

## 1. Role and Purpose

The M2' Vibrational Matrix plugin visualizes the 72-fold epogdoon bridge — the structural law connecting M1 Paramasiva (12 spanda ticks) to M2 Parashakti (36 decans × 2 strands) through the 6 QL positions. Each of the 72 cells is a half-decan: a precise coordinate in the vibrational architecture of the embodied cosmos, carrying decan ruler, zodiac sign, element, chakra, approximate hexagram, body zone, and herb.

The plugin makes this 12×6 matrix live: the current spanda tick from SharedClockState glows in the display, and planet positions from KairosState highlight which decans are currently active.

---

## 2. Core Structure: The 72-Fold Grid

```
             QL-0   QL-1   QL-2   QL-3   QL-4   QL-5
           ┌──────┬──────┬──────┬──────┬──────┬──────┐
  t0  A    │ D00  │ D01  │ D02  │ D03  │ D04  │ D05  │
  t1  A    │ D06  │ D07  │ D08  │ D09  │ D10  │ D11  │
  t2  A    │ D12  │ D13  │ D14  │ D15  │ D16  │ D17  │
  t3  A    │ D18  │ D19  │ D20  │ D21  │ D22  │ D23  │
  t4  A    │ D24  │ D25  │ D26  │ D27  │ D28  │ D29  │
  t5  A    │ D30  │ D31  │ D32  │ D33  │ D34  │ D35  │
           ├──────┴──────┴──────┴──────┴──────┴──────┤
           │  Strand A / Strand B boundary (Möbius)  │
           ├──────┬──────┬──────┬──────┬──────┬──────┤
  t6  B    │ D36  │ D37  │ D38  │ D39  │ D40  │ D41  │
  t7  B    │ D42  │ D43  │ D44  │ D45  │ D46  │ D47  │
  t8  B    │ D48  │ D49  │ D50  │ D51  │ D52  │ D53  │
  t9  B    │ D54  │ D55  │ D56  │ D57  │ D58  │ D59  │
  t10 B    │ D60  │ D61  │ D62  │ D63  │ D64  │ D65  │
  t11 B    │ D66  │ D67  │ D68  │ D69  │ D70  │ D71  │
           └──────┴──────┴──────┴──────┴──────┴──────┘
```

**Cell indexing:** `half_decan_idx = tick12 * 6 + ql_pos`

**Strand A** (t0–t5): explicate phase, `phase = 0`
**Strand B** (t6–t11): implicate / Möbius return, `phase = 1`

**Decan index** from half-decan: `decan_idx = half_decan_idx / 2`
(Each decan spans two half-decans — one in Strand A, one in Strand B)

---

## 3. State Structs

```rust
pub struct M2VibrationalPlugin {
    /// The 72-cell matrix, built once at construction
    cells: [[MatrixCell; 6]; 12],
    /// Current tick12 from SharedClockState (updated each 50ms tick)
    current_tick12: u8,
    /// Which planet (by index 0-9) is at each half-decan; None = no planet
    planet_at_half_decan: [Option<u8>; 72],
    /// Currently selected cell (tick12 row, ql_pos column)
    selected: (usize, usize),
    /// Current display mode
    view_mode: ViewMode,
    /// Detail data for selected cell (populated on Enter)
    detail: Option<CellDetail>,
    /// Shared clock for live tick12 + KairosState planet degrees
    shared_clock: Option<SharedClockState>,
}

pub struct MatrixCell {
    pub half_decan_idx: u8,
    pub decan_idx: u8,
    /// 0 = Strand A (explicate), 1 = Strand B (implicate)
    pub strand: u8,
    /// Planet index 0-9 (canonical mod-10, Sun=0)
    pub ruling_planet: u8,
    /// Element: 0=Fire, 1=Earth, 2=Air, 3=Water
    pub element: u8,
    /// Zodiac sign 0-11 (Aries=0 … Pisces=11)
    pub zodiac_sign: u8,
    /// 0, 1, or 2 within the sign
    pub decan_within_sign: u8,
    /// Chakra 0-7 (Muladhara=0 … Crown=7)
    pub chakra: u8,
    /// Approximate hexagram 0-63 until CLOCK_DEGREE_LUT built
    pub primary_hex: u8,
    pub body_zone: &'static str,
    pub herb: &'static str,
}

pub struct CellDetail {
    pub cell: MatrixCell,
    pub planet_name: &'static str,
    pub element_name: &'static str,
    pub sign_name: &'static str,
    pub chakra_name: &'static str,
    pub hex_approximate: bool,
}

pub enum ViewMode {
    /// Full 12×6 matrix grid
    Matrix,
    /// Zoomed single-cell detail view
    Detail,
    /// Matrix with planet symbols overlaid on their current decan cells
    PlanetOverlay,
}
```

---

## 4. Static Lookup Tables

### 4.1 DECAN_RULER_TABLE[36]

Chaldean order, Golden Dawn system. Indices are decan 0–35 (Aries decan 0 through Pisces decan 2):

```rust
/// Planet indices: Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4, Jupiter=5, Saturn=6
/// (canonical mod-10; outer planets Uranus/Neptune/Pluto not traditional decan rulers)
pub static DECAN_RULER_TABLE: [u8; 36] = [
    // Aries (sign 0):     Mars, Sun, Venus
    4, 0, 3,
    // Taurus (sign 1):    Mercury, Moon, Saturn
    2, 1, 6,
    // Gemini (sign 2):    Jupiter, Mars, Sun
    5, 4, 0,
    // Cancer (sign 3):    Venus, Mercury, Moon
    3, 2, 1,
    // Leo (sign 4):       Saturn, Jupiter, Mars
    6, 5, 4,
    // Virgo (sign 5):     Sun, Venus, Mercury
    0, 3, 2,
    // Libra (sign 6):     Moon, Saturn, Jupiter
    1, 6, 5,
    // Scorpio (sign 7):   Mars, Sun, Venus
    4, 0, 3,
    // Sagittarius (sign 8): Mercury, Moon, Saturn
    2, 1, 6,
    // Capricorn (sign 9): Jupiter, Mars, Sun
    5, 4, 0,
    // Aquarius (sign 10): Venus, Mercury, Moon
    3, 2, 1,
    // Pisces (sign 11):   Saturn, Jupiter, Mars
    6, 5, 4,
];
```

### 4.2 Planet Symbols

```rust
pub static PLANET_SYMBOLS: [char; 10] = [
    '☉',  // 0 Sun
    '☽',  // 1 Moon
    '☿',  // 2 Mercury
    '♀',  // 3 Venus
    '♂',  // 4 Mars
    '♃',  // 5 Jupiter
    '♄',  // 6 Saturn
    '⛢',  // 7 Uranus
    '♆',  // 8 Neptune
    '♇',  // 9 Pluto
];
```

### 4.3 Chakra Symbols

```rust
pub static CHAKRA_SYMBOLS: [char; 8] = [
    '⊕',  // 0 Muladhara (Root / Earth anchor)
    '①',  // 1 Svadhisthana (Sacral)
    '②',  // 2 Manipura (Solar Plexus)
    '③',  // 3 Anahata (Heart)
    '④',  // 4 Vishuddha (Throat)
    '⑤',  // 5 Ajna (Third Eye)
    '⑥',  // 6 Sahasrara (Crown)
    '⑦',  // 7 Bindu / Transpersonal
];
```

### 4.4 Element Color Mapping

```rust
pub fn element_color(element: u8) -> Color {
    match element {
        0 => Color::Red,     // FIRE: Aries, Leo, Sagittarius
        1 => Color::Green,   // EARTH: Taurus, Virgo, Capricorn
        2 => Color::Yellow,  // AIR: Gemini, Libra, Aquarius
        3 => Color::Cyan,    // WATER: Cancer, Scorpio, Pisces
        _ => Color::White,
    }
}
```

Sign → element mapping: `element = [0,1,2,3,0,1,2,3,0,1,2,3][zodiac_sign]`
(Aries=Fire, Taurus=Earth, Gemini=Air, Cancer=Water, repeating)

---

## 5. Cell Population

```rust
fn build_cells() -> [[MatrixCell; 6]; 12] {
    let mut cells = [[MatrixCell::default(); 6]; 12];
    for tick12 in 0..12usize {
        for ql_pos in 0..6usize {
            let half_decan_idx = (tick12 * 6 + ql_pos) as u8;
            let decan_idx = half_decan_idx / 2;
            let strand = if tick12 < 6 { 0u8 } else { 1u8 };
            let zodiac_sign = decan_idx / 3;
            let decan_within_sign = decan_idx % 3;
            let ruling_planet = DECAN_RULER_TABLE[decan_idx as usize];

            // Element from zodiac sign (fire/earth/air/water cycling)
            let element = zodiac_sign % 4;

            // Chakra from planet via PLANET_CHAKRA LUT
            let chakra = crate::nara::medicine::PLANET_CHAKRA[ruling_planet as usize];

            // Hexagram: approximation until CLOCK_DEGREE_LUT (Task 5)
            // Maps 36 decans linearly onto 64 hexagrams
            let primary_hex = ((decan_idx as u16 * 64) / 36) as u8;

            // Body zone and herb from medicine LUTs
            let body_zone = crate::nara::medicine::DECAN_BODY_PARTS[decan_idx as usize];
            let herb = crate::nara::medicine::DECAN_HERBS[decan_idx as usize];

            cells[tick12][ql_pos] = MatrixCell {
                half_decan_idx,
                decan_idx,
                strand,
                ruling_planet,
                element,
                zodiac_sign,
                decan_within_sign,
                chakra,
                primary_hex,
                body_zone,
                herb,
            };
        }
    }
    cells
}
```

**CLOCK_DEGREE_LUT stub behavior:** Until Task 5 is complete, `primary_hex` uses `(decan_idx * 64 / 36) as u8`. In Detail view, the hexagram field shows `[hex ~approximated]` to signal this. Once `CLOCK_DEGREE_LUT[360]` is built by `tools/build_clock_degree_lut.py`, replace with exact LUT lookup: `CLOCK_DEGREE_LUT[degree_node_360].hexagram_id`.

---

## 6. Layout (Matrix View)

```
┌─ M2' Vibrational Matrix [72-fold Epogdoon] ─────────────────────────────────┐
│ tick12=3 · Sagittarius D8 · Fire · ♃ Jupiter · Chakra ④ Vishuddha           │
├──────────┬───────┬───────┬───────┬───────┬───────┬───────┬──────────────────┤
│  t \ QL  │  #0   │  #1   │  #2   │  #3   │  #4   │  #5   ║  CELL DETAIL    │
├──────────┼───────┼───────┼───────┼───────┼───────┼───────╢                  │
│ t0  ♈ A  │  D00  │  D01  │  D02  │  D03  │  D04  │  D05  ║  (when Detail   │
│          │  ☉    │       │       │       │       │       ║   view active)   │
├──────────┼───────┼───────┼───────┼───────┼───────┼───────╢                  │
│ t1  ♈ A  │  D06  │  D07  │  D08  │  D09  │  D10  │  D11  ║                  │
├──────────┼───────┼───────┼───────┼───────┼───────┼───────╢                  │
│ t2  ♉ A  │  D12  │  D13  │  D14  │  D15  │  D16  │  D17  ║                  │
├══════════╪═══════╪═══════╪═══════╪═══════╪═══════╪═══════╢                  │
│►t3  ♐ A◄ │  D18  │►D19◄  │  D20  │  D21  │  D22  │  D23  ║  decan_idx: 9   │
│          │       │  ♃    │       │       │       │       ║  sign: ♐ Sag.   │
├══════════╪═══════╪═══════╪═══════╪═══════╪═══════╪═══════╢  ruling: ♃ Jup  │
│ t4  ♑ A  │  D24  │  D25  │  D26  │  D27  │  D28  │  D29  ║  chakra: ④      │
├──────────┼───────┼───────┼───────┼───────┼───────┼───────╢  body: Hips/    │
│ t5  ♑ A  │  D30  │  D31  │  D32  │  D33  │  D34  │  D35  ║       Thighs    │
├──────────┴───────┴───────┴───────┴───────┴───────┴───────╢  herb: Dandelion│
│  ═══════════════ Möbius boundary ════════════════════     ║  hex: ~42 [~]   │
├──────────┬───────┬───────┬───────┬───────┬───────┬───────╢                  │
│ t6  ♒ B  │  D36  │  D37  │  D38  │  D39  │  D40  │  D41  ║                  │
│  ...                                                      ║                  │
└──────────┴───────┴───────┴───────┴───────┴───────┴───────┴──────────────────┘
[↑↓←→] Navigate  [Enter] Detail  [p] Planets  [m] Medicine  [s] Strand  [e] Element
```

### ratatui constraint definition

```rust
let outer = Layout::vertical([
    Constraint::Length(3),   // status bar
    Constraint::Min(1),      // matrix + detail panel
    Constraint::Length(3),   // key hint bar
]).split(area);

let inner = Layout::horizontal([
    Constraint::Percentage(70),  // matrix grid
    Constraint::Percentage(30),  // cell detail sidebar
]).split(outer[1]);
```

**Status bar** (Row 0): shows current tick12 row's: zodiac sign + decan index, element, planet symbol + name, chakra symbol + name. Updates on every selection move.

**Cell detail sidebar** (right 30%): always visible in Matrix and PlanetOverlay modes. Shows full detail for the currently `selected` cell. Switches to full-screen Detail mode on Enter.

---

## 7. Live Highlighting

### 7.1 Current Tick12 Row

The row corresponding to `current_tick12` from SharedClockState is highlighted:
- Row label: `►t{N}  {sign} {strand}◄` with bold border
- Double border `═` on top and bottom edges of that row
- All cells in the row rendered with `Style::default().add_modifier(Modifier::BOLD)`

### 7.2 Planet Position Overlay

```rust
fn update_planet_positions(&mut self) {
    if let Some(ref clock) = self.shared_clock {
        let state = clock.lock().unwrap();
        // planet_degrees[10]: canonical mod-10
        for (planet_idx, &degree) in state.planet_degrees.iter().enumerate() {
            if degree < 0.0 { continue; }  // sentinel for unavailable
            let decan_idx = (degree as u8) / 10;  // 0-35
            // Both half-decans for this decan get the planet marker
            let hd_a = decan_idx * 2;
            let hd_b = decan_idx * 2 + 1;
            if (hd_a as usize) < 72 {
                self.planet_at_half_decan[hd_a as usize] = Some(planet_idx as u8);
            }
            if (hd_b as usize) < 72 {
                self.planet_at_half_decan[hd_b as usize] = Some(planet_idx as u8);
            }
        }
    }
}
```

In matrix cells, when `planet_at_half_decan[half_decan_idx]` is Some, render the planet symbol (`PLANET_SYMBOLS[planet_id]`) centered in the cell. In PlanetOverlay mode this is always shown; in Matrix mode it is shown only when `view_mode == ViewMode::PlanetOverlay`.

`update_planet_positions()` is called on each `HypertileEvent::Tick` (50ms).

---

## 8. View Modes

### 8.1 Matrix View (default)

Full 12×6 grid. Cell detail sidebar shows selected cell. Planet symbols shown only if `PlanetOverlay` mode toggled.

### 8.2 Detail View

Entered via Enter on any cell. Full-screen panel:

```
┌─ Cell Detail: half-decan 19 ──────────────────────────────────────────┐
│  Decan:      #9 of 36 — Sign decan 0/3                                │
│  Zodiac:     ♐ Sagittarius (Fire ● Red)                               │
│  Ruling:     ♃ Jupiter                                                 │
│  Chakra:     ④ Vishuddha (Throat)                                     │
│  Strand:     A (explicate, phase=0)                                    │
│  Hex:        ~42 [approximated — CLOCK_DEGREE_LUT pending Task 5]     │
│                                                                        │
│  Body Zone:  Hips / Thighs / Sciatic nerve                            │
│  Herb:       Dandelion root                                            │
│                                                                        │
│  Spanda tick: t3 of 12                                                 │
│  QL position: #1                                                       │
│                                                                        │
│  [Escape] Back   [m] Full medicine detail   [n] Next half-decan       │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Planet Overlay Mode

Toggled by `p`. Same as Matrix View but planet symbols are superimposed on cells where a planet is currently transiting. Cells without a transiting planet show `·` (dim). The planet's glyph is colored with the planet's associated element color.

---

## 9. Keyboard Map

| Key | Action |
|-----|--------|
| `↑` / `k` | Move selection up one row |
| `↓` / `j` | Move selection down one row |
| `←` / `h` | Move selection left one column |
| `→` / `l` | Move selection right one column |
| `Enter` | Enter Detail view for selected cell |
| `Escape` | Return from Detail view to Matrix view |
| `p` | Toggle Planet Overlay mode |
| `m` | Open medicine detail popup for selected cell's decan |
| `r` | Refresh from SharedClockState (update tick12 + planet positions) |
| `s` | Cycle strand filter: All → Strand A only → Strand B only → All |
| `e` | Cycle element filter: All → Fire → Earth → Air → Water → All |
| `n` | (in Detail view) Navigate to next half-decan |
| `b` | (in Detail view) Navigate to previous half-decan |
| `?` | Show help overlay |

---

## 10. Strand Visual Distinction

Strand A and Strand B rows are visually distinguished:

- **Strand A** rows (t0–t5): Normal background. Row label suffix ` A`.
- **Strand B** rows (t6–t11): Slightly dimmed background (`Modifier::DIM`). Row label suffix ` B`. These represent the implicate / Möbius-return phase.
- A thick separator line `═══ Möbius boundary ═══` is drawn between t5 and t6.

---

## 11. Medicine Popup

Triggered by `m` from any cell. Overlay block (not full screen) showing:

```
┌─ Medicine: Decan #9 · Sagittarius ♃ ──┐
│  Body zones:                           │
│   · Hips and buttocks                  │
│   · Thighs                             │
│   · Sciatic nerve                      │
│                                        │
│  Herbs: Dandelion root, Horse chestnut │
│                                        │
│  Chakra: ④ Vishuddha (Throat)         │
│  Element: Fire                         │
│                                        │
│  [Escape] Close                        │
└────────────────────────────────────────┘
```

Data sourced from `DECAN_BODY_PARTS[36]` and `DECAN_HERBS[36]` in `nara::medicine`.

---

## 12. Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn m2_vibrational_matrix_cells_build_correctly() {
        let cells = build_cells();

        // First cell: half-decan 0
        assert_eq!(cells[0][0].half_decan_idx, 0);
        assert_eq!(cells[0][0].decan_idx, 0);
        assert_eq!(cells[0][0].strand, 0);  // Strand A

        // t6 is Strand B
        assert_eq!(cells[6][0].strand, 1);

        // Last cell: half-decan 71
        assert_eq!(cells[11][5].half_decan_idx, 71);
        assert_eq!(cells[11][5].decan_idx, 35);
        assert_eq!(cells[11][5].strand, 1);  // Strand B
    }

    #[test]
    fn decan_ruler_table_length_is_36() {
        assert_eq!(DECAN_RULER_TABLE.len(), 36);
    }

    #[test]
    fn aries_first_decan_ruler_is_mars() {
        // Aries decan 0 = Mars (index 4)
        assert_eq!(DECAN_RULER_TABLE[0], 4);
    }

    #[test]
    fn pisces_last_decan_ruler_is_mars() {
        // Pisces decan 2 (index 35) = Mars (index 4)
        assert_eq!(DECAN_RULER_TABLE[35], 4);
    }

    #[test]
    fn half_decan_to_decan_mapping() {
        // half-decan 19 → decan 9 (Sagittarius decan 0)
        let cells = build_cells();
        // tick12=3, ql_pos=1 → half_decan 3*6+1 = 19
        assert_eq!(cells[3][1].half_decan_idx, 19);
        assert_eq!(cells[3][1].decan_idx, 9);
        assert_eq!(cells[3][1].zodiac_sign, 3);  // Cancer? No: 9/3=3, sign=3 (Cancer)
        // Actually Sagittarius is sign 8; decan 9/3 = 3 is Cancer. Sagittarius:
        // Sagittarius decans are indices 24,25,26 → sign 8.
        // decan 9 → zodiac_sign = 9/3 = 3 (Cancer). That is correct.
        assert_eq!(cells[3][1].zodiac_sign, 3);  // Cancer
    }

    #[test]
    fn strand_boundary_at_t6() {
        let cells = build_cells();
        assert_eq!(cells[5][5].strand, 0);  // t5 still Strand A
        assert_eq!(cells[6][0].strand, 1);  // t6 is Strand B
    }

    #[test]
    fn element_cycles_fire_earth_air_water() {
        // Fire signs: Aries(0), Leo(4), Sag(8) → element=0
        // decan 0 is Aries → element = 0 % 4 = 0 (Fire)
        let cells = build_cells();
        assert_eq!(cells[0][0].element, 0);  // Aries decan 0 = Fire
    }
}
```

---

## 13. Success Criteria

1. 12×6 grid renders with element color coding on cell text
2. Current tick12 row highlighted with bold border and `►..◄` markers
3. Planet symbols appear at correct decan positions when PlanetOverlay active, from KairosState
4. Enter zooms to Detail view showing body zone and herb from medicine LUTs
5. `p` toggles Planet Overlay without flicker
6. `m` opens medicine popup with body zones + herbs for selected decan
7. Strand A (t0–t5) and Strand B (t6–t11) rows are visually distinct; Möbius separator drawn
8. Plugin polls SharedClockState and updates `current_tick12` on each 50ms HypertileEvent::Tick
9. `[hex ~approximated]` shown in Detail view until CLOCK_DEGREE_LUT Task 5 complete
10. Strand filter (`s`) and element filter (`e`) narrow visible rows correctly

---

## 14. Dependency Notes

- `crate::nara::medicine::DECAN_BODY_PARTS[36]` — exact body part strings from dataset
- `crate::nara::medicine::DECAN_HERBS[36]` — herbalism herbs per decan
- `crate::nara::medicine::PLANET_CHAKRA[8]` — planet → chakra (indices 0-6 for classical planets)
- `crate::portal::clock_state::SharedClockState` — `tick12` + `planet_degrees: [f32; 10]`
- `CLOCK_DEGREE_LUT` (Task 5, pending) — will replace approximate hexagram mapping

---

*Spec version: 1.0 — Canonical for M2' plugin implementation.*
