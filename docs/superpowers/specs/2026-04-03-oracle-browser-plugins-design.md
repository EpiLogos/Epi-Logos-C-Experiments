# Oracle Browser Plugins — I Ching Hexagram & Tarot Card TUI Browsers

**Status:** Approved Design
**Date:** 2026-04-03
**Purpose:** Two full-screen TUI plugins for browsing, displaying, and interacting with I Ching hexagrams and Thoth Tarot cards
**Approach:** RWS public domain images → ASCII art + Thoth names/meanings

---

## Overview

Two new portal plugins that serve as visual encyclopedias and future oracle-draw interfaces:

1. **M4HexagramPlugin** — Browse all 64 I Ching hexagrams with programmatic trigram-stack pictograms, names, keywords, judgements, and body zone data from existing `HEXAGRAM_BODY_DYNAMICS`.

2. **M4TarotPlugin** — Browse all 78 Tarot cards with ASCII art (converted from 1909 Rider-Waite-Smith public domain images), Thoth deck names, titles, keywords, and upright/reversed meanings.

Both are full-screen plugins (modal, not tiled alongside others), composable via public selection methods and `SharedClockState` integration. They form the visual foundation for oracle draw logic developed alongside the cosmic clock.

---

## Data Layer

### Hexagram Data — `epi-cli/src/nara/hexagram_data.rs`

New module with 64 static entries:

```rust
pub struct HexagramInfo {
    pub number: u8,                // 1-64 (King Wen order)
    pub name_en: &'static str,     // "The Creative"
    pub name_pinyin: &'static str, // "Qián"
    pub trigram_upper: u8,         // 0-7 (index into M3 trigram system)
    pub trigram_lower: u8,         // 0-7
    pub keyword: &'static str,     // "Strength, Creativity"
    pub judgement: &'static str,   // 1-2 sentence meaning
    pub image: &'static str,       // "Heaven above Heaven"
}

pub static HEXAGRAM_INFO: [HexagramInfo; 64] = [ /* all 64 entries */ ];
```

**Indexing:** `HEXAGRAM_INFO[n]` where `n = hexagram_number - 1` (0-indexed). Links to existing `HEXAGRAM_BODY_DYNAMICS[64]` via same index.

**Pictogram rendering** — programmatic, not static art:

```rust
pub fn render_hexagram_lines(line_pattern: u8) -> [&'static str; 6] {
    // bit=1 → "━━━━━━━━━"  (yang/solid)
    // bit=0 → "━━━  ━━━ "  (yin/broken)
    // Bottom line (bit 0) rendered at index 5 (visual bottom)
}
```

Trigram names from existing C library data (Qian, Kun, Zhen, Xun, Kan, Li, Gen, Dui).

**Data source:** Standard I Ching — King Wen sequence, Wilhelm/Baynes English names, pinyin romanization. All public domain traditional text.

### Tarot Data — `epi-cli/src/nara/tarot_data.rs`

New module with 78 static entries:

```rust
pub struct ThothCardInfo {
    pub card_id: u8,                  // 0-77 (matches existing oracle.rs encoding)
    pub name: &'static str,           // "The Fool", "Two of Cups"
    pub thoth_title: &'static str,    // "The Spirit of Ether" / "Love"
    pub keyword: &'static str,        // "Beginnings" / "Union"
    pub meaning_upright: &'static str,  // 1-2 sentences
    pub meaning_reversed: &'static str, // 1-2 sentences
    pub ascii_art: &'static str,      // Pre-rendered ASCII (RWS image → ascii-image-converter)
}

pub static THOTH_CARDS: [ThothCardInfo; 78] = [ /* all 78 entries */ ];
```

**Card ID encoding** (matches existing `oracle.rs`):
- 0–21: Major Arcana
- 22–35: Cups (Ace=22, 2-10=23-31, Princess=32, Prince=33, Queen=34, Knight=35)
- 36–49: Wands
- 50–63: Pentacles
- 64–77: Swords

**Thoth-specific naming:**
- Major Arcana: Crowley titles (The Magus, The Priestess, The Empress, The Emperor, The Hierophant, The Lovers, The Chariot, Adjustment, The Hermit, Fortune, Lust, The Hanged Man, Death, Art, The Devil, The Tower, The Star, The Moon, The Sun, The Aeon, The Universe)
- Court Cards: Princess/Prince/Queen/Knight (Golden Dawn order, matching existing `COURT_SIGN_MAP`)
- Minor Arcana pips: Crowley titles (Dominion, Love, Abundance, Completion, Strife, etc.)

**ASCII art field:** Each card's `ascii_art` is a pre-converted string block (~40 cols × ~50 rows), generated once from RWS images and embedded as static data. Zero runtime image dependency.

---

## Asset Pipeline

One-time generation process, not part of the runtime build.

### Step 1: Fetch RWS Images

Source: `metabismuth/tarot-json` on GitHub (MIT license, public domain 1909 images). 78 JPGs at 350×600px.

### Step 2: Map RWS Filenames → Card IDs

Script in `tools/build_tarot_ascii.py` (or `.sh`):
- Maps each RWS filename to our 0-77 `card_id` encoding
- Handles RWS→Thoth court card reordering (RWS Page→Thoth Princess, RWS Knight→Thoth Prince)

### Step 3: Convert to ASCII

Run `ascii-image-converter` on each image:
- Target: ~40 columns × ~50 rows
- Mode: braille or block characters (whichever reads better — test both)
- Output: raw text string per card

### Step 4: Embed in Rust

Generate `tarot_data.rs` with all 78 `ThothCardInfo` entries including the ASCII art strings as `&'static str`. The script outputs the complete Rust source file.

### Step 5: Review & Tweak

Visual review of all 78 ASCII conversions in the TUI. Hand-edit any that convert poorly (very dark/light cards, cards with fine detail that becomes noise).

---

## Plugin Architecture

### M4HexagramPlugin — `epi-cli/src/portal/plugins/hexagram.rs`

**Layout:** Vertical split — left 30% scrollable list, right 70% detail panel.

**List view (left):**
- Each row: `[number] [mini-glyph] [name_en]`
- Mini-glyph: compact 1-line representation of the 6-line pattern (e.g., using block characters ▐█▌ vs ▐ ▌)
- Scroll with Up/Down, selected row highlighted
- If current oracle cast matches a hexagram, mark with accent indicator

**Detail panel (right):**
- Large pictogram: 6 lines rendered at full width with trigram labels and visual gap between upper and lower trigrams (gap is cosmetic, not a 7th line)
  ```
  ━━━━━━━━━   ─ Xun (Wind)
  ━━━━━━━━━
  ━━━  ━━━
              ← visual gap (not a line)
  ━━━━━━━━━   ─ Qian (Heaven)
  ━━━━━━━━━
  ━━━━━━━━━
  ```
- Name: English + Pinyin, number
- Keyword line
- Judgement text (wrapped)
- Image text
- Body data section: primary/secondary chakra, body zones, dynamics (from existing `HEXAGRAM_BODY_DYNAMICS`)
- Separator between trigram label section and meaning section

**Key bindings:**
- Up/Down: Navigate list
- Enter: Select hexagram (for composability — sets `selected_hexagram`)
- `c`: Cast oracle (triggers I Ching cast, updates `SharedClockState`)
- `q`/Esc: Return to layout mode

**SharedClockState integration:**
- Reads `primary_hex` to highlight the current oracle hexagram in the list
- After cast via `c`, updates clock state with new `OraclePayload`

### M4TarotPlugin — `epi-cli/src/portal/plugins/tarot.rs`

**Layout:** Top bar (suit filter tabs) + vertical split — left 30% card list, right 70% detail panel.

**Suit filter tabs (top):**
```
[All] [✦ Major] [🜂 Wands] [🜁 Swords] [🜄 Cups] [🜃 Pentacles]
```
- Tab/Shift-Tab to switch between suit filters
- Filters the card list below

**List view (left):**
- Each row: `[id] [suit-glyph] [Thoth name]`
- Scroll with Up/Down
- Last-drawn cards highlighted if `SharedClockState` has recent tarot draw

**Detail panel (right):**
- ASCII art block (the pre-rendered RWS image, ~40×50 chars)
- Thoth title + keyword (below art)
- Upright meaning
- Reversed meaning
- Decan/sign/planet attribution (from existing `PIP_DECAN_MAP` / `COURT_SIGN_MAP` / `ACE_ELEMENT_MAP`)
- Element attribution
- If card was reversed in last draw, show `[REVERSED]` indicator with inverted color

**Key bindings:**
- Up/Down: Navigate card list
- Tab/Shift-Tab: Switch suit filter
- `d`: Draw tarot spread (triggers draw, updates `SharedClockState`)
- `r`: Toggle reversed preview
- `q`/Esc: Return to layout mode

**SharedClockState integration:**
- Reads last tarot draw to highlight drawn cards in list
- After draw via `d`, updates clock state with new `OraclePayload`

### Composability Interface

Both plugins expose public methods for cross-plugin data sharing:

```rust
impl M4HexagramPlugin {
    pub fn selected_hexagram(&self) -> Option<u8> { /* 0-63 */ }
}

impl M4TarotPlugin {
    pub fn selected_card(&self) -> Option<(u8, bool)> { /* (card_id, reversed) */ }
}
```

Future mode-composition can pass these selections to clock, medicine, spine, or other plugins. Data also flows through `SharedClockState` after any cast/draw.

---

## Plugin Registration

In `epi-cli/src/portal/mod.rs`, register both new plugins:

```rust
runtime.register_plugin_type("m4.hexagram", || hexagram::M4HexagramPlugin::new());

// With SharedClockState:
{
    let cs = clock_state.clone();
    runtime.register_plugin_type("m4.tarot", move || {
        let plugin = tarot::M4TarotPlugin::new();
        if let Some(ref c) = cs {
            plugin.with_clock_state(c.clone())
        } else {
            plugin
        }
    });
}
```

Similarly wire `M4HexagramPlugin` with `SharedClockState`.

Update `plugins/mod.rs` to `pub mod hexagram;` and `pub mod tarot;`.

---

## File Summary

| File | Purpose | New/Edit |
|------|---------|----------|
| `epi-cli/src/nara/hexagram_data.rs` | 64 hexagram info entries | New |
| `epi-cli/src/nara/tarot_data.rs` | 78 Thoth card info + ASCII art | New |
| `epi-cli/src/nara/mod.rs` | Add `pub mod hexagram_data; pub mod tarot_data;` | Edit |
| `epi-cli/src/portal/plugins/hexagram.rs` | M4HexagramPlugin | New |
| `epi-cli/src/portal/plugins/tarot.rs` | M4TarotPlugin | New |
| `epi-cli/src/portal/plugins/mod.rs` | Add `pub mod hexagram; pub mod tarot;` | Edit |
| `epi-cli/src/portal/mod.rs` | Register both plugins | Edit |
| `tools/build_tarot_ascii.py` | RWS images → ASCII → Rust source | New |

---

## Testing

- **Data completeness:** Assert `HEXAGRAM_INFO.len() == 64`, `THOTH_CARDS.len() == 78`
- **Index consistency:** Assert `HEXAGRAM_INFO[i].number == i as u8 + 1` for all i
- **Card ID consistency:** Assert `THOTH_CARDS[i].card_id == i as u8` for all i
- **Pictogram rendering:** Unit test `render_hexagram_lines()` for known patterns (e.g., hexagram 1 = all yang = 0b111111)
- **Plugin instantiation:** Add both to existing `build_registry_has_all_plugins()` test
- **SharedClockState integration:** Verify cast updates propagate to plugin state

---

## Dependencies

- No new crate dependencies (ratatui 0.30 + ratatui-hypertile already sufficient)
- `ascii-image-converter` CLI needed only during asset generation (not at runtime)
- `metabismuth/tarot-json` images needed only during asset generation

---

## Future Integration Points

- **Oracle draw flow:** Cast from within plugin → result animates on clock → hexagram/card detail auto-selects
- **Clock overlay:** Selected hexagram/card data feeds into cosmic clock degree annotation
- **Medicine bridge:** Selected card → decan → planet → chakra → body zone (chain already exists in `oracle.rs`)
- **Mode composition:** Portal modes can compose hexagram browser + clock + spine as a pre-set "Oracle Mode"
