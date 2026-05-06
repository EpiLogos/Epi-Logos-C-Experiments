# Oracle Browser Plugins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two full-screen TUI plugins — a 64-hexagram I Ching browser and a 78-card Thoth Tarot browser — with static data, programmatic pictograms, and RWS-derived ASCII art.

**Architecture:** Two new data modules (`hexagram_data.rs`, `tarot_data.rs`) provide static lookup tables. Two new plugin files (`hexagram.rs`, `tarot.rs`) implement the `HypertilePlugin` trait with list+detail split layouts. A one-time Python script fetches RWS images and converts them to ASCII art embedded in the Rust source. Both plugins wire into `SharedClockState` for oracle cast integration.

**Tech Stack:** Rust, ratatui 0.30, ratatui-hypertile, ratatui_hypertile_extras (HypertilePlugin trait), Python 3 + ascii-image-converter (asset pipeline only)

**Spec:** `docs/superpowers/specs/2026-04-03-oracle-browser-plugins-design.md`

---

## File Structure

| File | Responsibility | New/Edit |
|------|---------------|----------|
| `epi-cli/src/nara/hexagram_data.rs` | Static `HEXAGRAM_INFO[64]` + `render_hexagram_lines()` | New |
| `epi-cli/src/nara/tarot_data.rs` | Static `THOTH_CARDS[78]` with ASCII art strings | New |
| `epi-cli/src/nara/mod.rs` | Add `pub mod hexagram_data; pub mod tarot_data;` | Edit |
| `epi-cli/src/portal/plugins/hexagram.rs` | `M4HexagramPlugin` — full-screen hexagram browser | New |
| `epi-cli/src/portal/plugins/tarot.rs` | `M4TarotPlugin` — full-screen tarot browser | New |
| `epi-cli/src/portal/plugins/mod.rs` | Add `pub mod hexagram; pub mod tarot;` | Edit |
| `epi-cli/src/portal/mod.rs` | Register `m4.hexagram` and `m4.tarot` plugin types | Edit |
| `epi-cli/src/portal/registry.rs` | Add new plugins to expected list in test | Edit |
| `tools/build_tarot_ascii.py` | Fetch RWS images → ASCII → Rust source generator | New |

---

### Task 1: Hexagram Data Module

**Files:**
- Create: `epi-cli/src/nara/hexagram_data.rs`
- Modify: `epi-cli/src/nara/mod.rs`

- [ ] **Step 1: Write the failing test**

Add to the bottom of `epi-cli/src/nara/hexagram_data.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hexagram_info_has_64_entries() {
        assert_eq!(HEXAGRAM_INFO.len(), 64);
    }

    #[test]
    fn hexagram_numbers_are_sequential() {
        for (i, h) in HEXAGRAM_INFO.iter().enumerate() {
            assert_eq!(
                h.number,
                (i + 1) as u8,
                "HEXAGRAM_INFO[{}] should have number {}, got {}",
                i,
                i + 1,
                h.number
            );
        }
    }

    #[test]
    fn trigram_indices_are_valid() {
        for (i, h) in HEXAGRAM_INFO.iter().enumerate() {
            assert!(h.trigram_upper < 8, "Hex {} upper trigram {} >= 8", i + 1, h.trigram_upper);
            assert!(h.trigram_lower < 8, "Hex {} lower trigram {} >= 8", i + 1, h.trigram_lower);
        }
    }

    #[test]
    fn no_empty_names() {
        for (i, h) in HEXAGRAM_INFO.iter().enumerate() {
            assert!(!h.name_en.is_empty(), "Hex {} has empty name_en", i + 1);
            assert!(!h.name_pinyin.is_empty(), "Hex {} has empty name_pinyin", i + 1);
            assert!(!h.keyword.is_empty(), "Hex {} has empty keyword", i + 1);
            assert!(!h.judgement.is_empty(), "Hex {} has empty judgement", i + 1);
        }
    }

    #[test]
    fn render_hexagram_lines_all_yang() {
        let lines = render_hexagram_lines(0b111111);
        for line in &lines {
            assert_eq!(*line, YANG_LINE);
        }
    }

    #[test]
    fn render_hexagram_lines_all_yin() {
        let lines = render_hexagram_lines(0b000000);
        for line in &lines {
            assert_eq!(*line, YIN_LINE);
        }
    }

    #[test]
    fn render_hexagram_lines_bit_order() {
        // Hexagram with only bottom line (bit 0) as yang, rest yin
        let lines = render_hexagram_lines(0b000001);
        // lines[0] = top (bit 5), lines[5] = bottom (bit 0)
        assert_eq!(lines[5], YANG_LINE, "Bottom line should be yang");
        assert_eq!(lines[0], YIN_LINE, "Top line should be yin");
    }

    #[test]
    fn trigram_name_lookup_all_valid() {
        for i in 0..8u8 {
            let name = trigram_name(i);
            assert!(!name.is_empty(), "Trigram {} has empty name", i);
        }
    }

    #[test]
    fn mini_glyph_is_6_chars() {
        for pattern in 0..64u8 {
            let g = mini_glyph(pattern);
            assert_eq!(g.chars().count(), 6, "mini_glyph(0b{:06b}) should be 6 chars", pattern);
        }
    }
}
```

- [ ] **Step 2: Write the struct, constants, and render functions**

Create `epi-cli/src/nara/hexagram_data.rs` with the struct, line constants, trigram names, render function, and mini glyph:

```rust
//! I Ching Hexagram reference data — 64 hexagrams with names, trigrams, and meanings.
//!
//! All data from the traditional King Wen sequence (public domain).
//! Index: HEXAGRAM_INFO[n] where n = hexagram_number - 1.
//! Links to HEXAGRAM_BODY_DYNAMICS[64] in oracle.rs via same index.

/// Static info for one of the 64 I Ching hexagrams.
pub struct HexagramInfo {
    /// 1-64 (King Wen order)
    pub number: u8,
    /// English name ("The Creative")
    pub name_en: &'static str,
    /// Pinyin romanization ("Qián")
    pub name_pinyin: &'static str,
    /// Upper trigram index (0-7)
    pub trigram_upper: u8,
    /// Lower trigram index (0-7)
    pub trigram_lower: u8,
    /// Brief keyword(s) ("Strength, Creativity")
    pub keyword: &'static str,
    /// 1-2 sentence judgement/meaning
    pub judgement: &'static str,
    /// Image text ("Heaven above Heaven")
    pub image: &'static str,
}

pub const YANG_LINE: &str = "━━━━━━━━━";
pub const YIN_LINE: &str  = "━━━  ━━━ ";

/// Trigram names indexed 0-7.
/// Order: Qian(0), Kun(1), Zhen(2), Xun(3), Kan(4), Li(5), Gen(6), Dui(7)
pub const TRIGRAM_NAMES: [&str; 8] = [
    "Qian", "Kun", "Zhen", "Xun", "Kan", "Li", "Gen", "Dui",
];
pub const TRIGRAM_ENGLISH: [&str; 8] = [
    "Heaven", "Earth", "Thunder", "Wind", "Water", "Fire", "Mountain", "Lake",
];

/// Return the trigram name for index 0-7 (empty string for out of range).
pub fn trigram_name(idx: u8) -> &'static str {
    TRIGRAM_NAMES.get(idx as usize).copied().unwrap_or("")
}

/// Render a hexagram as 6 lines from the 6-bit line_pattern.
/// bit 0 = bottom line, bit 5 = top line.
/// Returns array where index 0 = top visual line, index 5 = bottom visual line.
pub fn render_hexagram_lines(line_pattern: u8) -> [&'static str; 6] {
    let mut lines = [YIN_LINE; 6];
    for bit in 0..6 {
        if line_pattern & (1 << bit) != 0 {
            // bit 0 (bottom) → visual index 5, bit 5 (top) → visual index 0
            lines[5 - bit] = YANG_LINE;
        }
    }
    lines
}

/// Compact 6-char glyph for list view. '█' = yang, '▪' = yin. Bottom line first (left to right).
pub fn mini_glyph(line_pattern: u8) -> String {
    let mut s = String::with_capacity(6);
    for bit in (0..6).rev() {
        if line_pattern & (1 << bit) != 0 {
            s.push('█');
        } else {
            s.push('▪');
        }
    }
    s
}
```

- [ ] **Step 3: Write all 64 HEXAGRAM_INFO entries**

Add to the same file the full static array. All 64 entries with King Wen sequence data. Here are the first 8 and last 2 as reference — the full file must contain all 64:

```rust
/// All 64 hexagrams in King Wen order. Index 0 = hexagram 1.
pub static HEXAGRAM_INFO: [HexagramInfo; 64] = [
    // 1. Qián — The Creative
    HexagramInfo {
        number: 1, name_en: "The Creative", name_pinyin: "Qián",
        trigram_upper: 0, trigram_lower: 0,  // Qian / Qian
        keyword: "Strength, Creativity",
        judgement: "The Creative works sublime success, furthering through perseverance.",
        image: "Heaven above Heaven",
    },
    // 2. Kūn — The Receptive
    HexagramInfo {
        number: 2, name_en: "The Receptive", name_pinyin: "Kūn",
        trigram_upper: 1, trigram_lower: 1,  // Kun / Kun
        keyword: "Devotion, Receptivity",
        judgement: "The Receptive brings sublime success, furthering through the perseverance of a mare.",
        image: "Earth above Earth",
    },
    // 3. Zhūn — Difficulty at the Beginning
    HexagramInfo {
        number: 3, name_en: "Difficulty at the Beginning", name_pinyin: "Zhūn",
        trigram_upper: 4, trigram_lower: 2,  // Kan / Zhen
        keyword: "Initial Difficulty, Sprouting",
        judgement: "Difficulty at the beginning works supreme success through perseverance. Helpers should be appointed.",
        image: "Water above Thunder",
    },
    // 4. Méng — Youthful Folly
    HexagramInfo {
        number: 4, name_en: "Youthful Folly", name_pinyin: "Méng",
        trigram_upper: 6, trigram_lower: 4,  // Gen / Kan
        keyword: "Inexperience, Learning",
        judgement: "Youthful Folly has success. It is not I who seek the young fool; the young fool seeks me.",
        image: "Mountain above Water",
    },
    // 5. Xū — Waiting
    HexagramInfo {
        number: 5, name_en: "Waiting", name_pinyin: "Xū",
        trigram_upper: 4, trigram_lower: 0,  // Kan / Qian
        keyword: "Patience, Nourishment",
        judgement: "Waiting. With sincerity there is brilliant success. Perseverance brings good fortune.",
        image: "Water above Heaven",
    },
    // 6. Sòng — Conflict
    HexagramInfo {
        number: 6, name_en: "Conflict", name_pinyin: "Sòng",
        trigram_upper: 0, trigram_lower: 4,  // Qian / Kan
        keyword: "Dispute, Litigation",
        judgement: "Conflict. You are sincere and are being obstructed. Seek the great person; do not cross the great water.",
        image: "Heaven above Water",
    },
    // 7. Shī — The Army
    HexagramInfo {
        number: 7, name_en: "The Army", name_pinyin: "Shī",
        trigram_upper: 1, trigram_lower: 4,  // Kun / Kan
        keyword: "Discipline, Leadership",
        judgement: "The Army needs perseverance and a strong leader. Good fortune without blame.",
        image: "Earth above Water",
    },
    // 8. Bǐ — Holding Together
    HexagramInfo {
        number: 8, name_en: "Holding Together", name_pinyin: "Bǐ",
        trigram_upper: 4, trigram_lower: 1,  // Kan / Kun
        keyword: "Union, Alliance",
        judgement: "Holding Together brings good fortune. Examine the oracle once again: does one have constancy?",
        image: "Water above Earth",
    },
    // ... hexagrams 9-62 follow the same pattern ...
    // (ALL 64 entries must be present — no placeholders)

    // 63. Jì Jì — After Completion
    HexagramInfo {
        number: 63, name_en: "After Completion", name_pinyin: "Jì Jì",
        trigram_upper: 4, trigram_lower: 5,  // Kan / Li
        keyword: "Completion, Transition",
        judgement: "After Completion. Success in small matters. Perseverance furthers. Good fortune at the beginning, disorder at the end.",
        image: "Water above Fire",
    },
    // 64. Wèi Jì — Before Completion
    HexagramInfo {
        number: 64, name_en: "Before Completion", name_pinyin: "Wèi Jì",
        trigram_upper: 5, trigram_lower: 4,  // Li / Kan
        keyword: "Incompletion, Potential",
        judgement: "Before Completion. Success. The little fox has almost crossed the water, but gets its tail wet. Nothing that would further.",
        image: "Fire above Water",
    },
];
```

**IMPORTANT:** The implementing agent MUST write all 64 entries. Use the standard King Wen sequence with Wilhelm/Baynes names and trigram assignments. The trigram index mapping is:
- 0=Qian(☰ Heaven, 111), 1=Kun(☷ Earth, 000), 2=Zhen(☳ Thunder, 001), 3=Xun(☴ Wind, 110)
- 4=Kan(☵ Water, 010), 5=Li(☲ Fire, 101), 6=Gen(☶ Mountain, 100), 7=Dui(☱ Lake, 011)

- [ ] **Step 4: Register the module**

Edit `epi-cli/src/nara/mod.rs` — add after line 11 (`pub mod oracle;`):

```rust
pub mod hexagram_data;
```

- [ ] **Step 5: Run tests to verify**

Run: `cd epi-cli && cargo test hexagram_data -- --nocapture`

Expected: All 10 tests pass (64 entries, sequential numbers, valid trigrams, no empty names, render lines, mini glyph).

- [ ] **Step 6: Commit**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add epi-cli/src/nara/hexagram_data.rs epi-cli/src/nara/mod.rs
git commit -m "feat(nara): add hexagram_data module with 64 I Ching entries and pictogram rendering

Static HEXAGRAM_INFO[64] with King Wen sequence names, trigrams, keywords,
and judgements. render_hexagram_lines() for TUI pictograms, mini_glyph() for
compact list view. Links to existing HEXAGRAM_BODY_DYNAMICS via shared index."
```

---

### Task 2: Tarot Data Module (Structure + Thoth Metadata)

**Files:**
- Create: `epi-cli/src/nara/tarot_data.rs`
- Modify: `epi-cli/src/nara/mod.rs`

- [ ] **Step 1: Write the failing test**

Add to the bottom of `epi-cli/src/nara/tarot_data.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn thoth_cards_has_78_entries() {
        assert_eq!(THOTH_CARDS.len(), 78);
    }

    #[test]
    fn card_ids_are_sequential() {
        for (i, c) in THOTH_CARDS.iter().enumerate() {
            assert_eq!(
                c.card_id,
                i as u8,
                "THOTH_CARDS[{}] should have card_id {}, got {}",
                i, i, c.card_id
            );
        }
    }

    #[test]
    fn no_empty_names() {
        for (i, c) in THOTH_CARDS.iter().enumerate() {
            assert!(!c.name.is_empty(), "Card {} has empty name", i);
            assert!(!c.thoth_title.is_empty(), "Card {} has empty thoth_title", i);
            assert!(!c.keyword.is_empty(), "Card {} has empty keyword", i);
        }
    }

    #[test]
    fn major_arcana_range() {
        for i in 0..22 {
            assert_eq!(THOTH_CARDS[i].suit, Suit::Major, "Card {} should be Major", i);
        }
    }

    #[test]
    fn minor_suits_correct() {
        // Cups: 22-35, Wands: 36-49, Pentacles: 50-63, Swords: 64-77
        for i in 22..36 {
            assert_eq!(THOTH_CARDS[i].suit, Suit::Cups, "Card {} should be Cups", i);
        }
        for i in 36..50 {
            assert_eq!(THOTH_CARDS[i].suit, Suit::Wands, "Card {} should be Wands", i);
        }
        for i in 50..64 {
            assert_eq!(THOTH_CARDS[i].suit, Suit::Pentacles, "Card {} should be Pentacles", i);
        }
        for i in 64..78 {
            assert_eq!(THOTH_CARDS[i].suit, Suit::Swords, "Card {} should be Swords", i);
        }
    }

    #[test]
    fn suit_glyph_returns_char() {
        assert_eq!(suit_glyph(Suit::Major), '✦');
        assert_eq!(suit_glyph(Suit::Cups), '🜄');
        assert_eq!(suit_glyph(Suit::Wands), '🜂');
        assert_eq!(suit_glyph(Suit::Pentacles), '🜃');
        assert_eq!(suit_glyph(Suit::Swords), '🜁');
    }

    #[test]
    fn ascii_art_placeholder_present() {
        // Before asset pipeline runs, every card should have a non-empty placeholder
        for (i, c) in THOTH_CARDS.iter().enumerate() {
            assert!(!c.ascii_art.is_empty(), "Card {} has empty ascii_art", i);
        }
    }
}
```

- [ ] **Step 2: Write the struct and suit enum**

Create `epi-cli/src/nara/tarot_data.rs`:

```rust
//! Thoth Tarot card reference data — 78 cards with names, titles, and meanings.
//!
//! Card ID encoding matches oracle.rs:
//!   0-21: Major Arcana
//!   22-35: Cups (Ace=22, pips 2-10=23-31, Princess=32, Prince=33, Queen=34, Knight=35)
//!   36-49: Wands
//!   50-63: Pentacles
//!   64-77: Swords
//!
//! ASCII art initially contains placeholder frames; replaced by RWS→ASCII pipeline.

/// Suit classification for filtering.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Suit {
    Major,
    Cups,
    Wands,
    Pentacles,
    Swords,
}

/// Static info for one of the 78 Thoth Tarot cards.
pub struct ThothCardInfo {
    /// 0-77 (matches oracle.rs encoding)
    pub card_id: u8,
    /// Display name ("The Fool", "Two of Cups")
    pub name: &'static str,
    /// Crowley's esoteric title ("The Spirit of Ether", "Love")
    pub thoth_title: &'static str,
    /// Single keyword ("Beginnings", "Union")
    pub keyword: &'static str,
    /// 1-2 sentence upright meaning
    pub meaning_upright: &'static str,
    /// 1-2 sentence reversed meaning
    pub meaning_reversed: &'static str,
    /// Suit classification
    pub suit: Suit,
    /// Pre-rendered ASCII art block (RWS image → ascii-image-converter)
    pub ascii_art: &'static str,
}

/// Return the alchemical suit glyph for display.
pub fn suit_glyph(suit: Suit) -> char {
    match suit {
        Suit::Major => '✦',
        Suit::Cups => '🜄',      // Water
        Suit::Wands => '🜂',     // Fire
        Suit::Pentacles => '🜃', // Earth
        Suit::Swords => '🜁',    // Air
    }
}

/// Return the suit for a card_id (0-77).
pub fn suit_for_card(card_id: u8) -> Suit {
    match card_id {
        0..=21 => Suit::Major,
        22..=35 => Suit::Cups,
        36..=49 => Suit::Wands,
        50..=63 => Suit::Pentacles,
        64..=77 => Suit::Swords,
        _ => Suit::Major,
    }
}
```

- [ ] **Step 3: Write all 78 THOTH_CARDS entries**

Add the full static array. All 78 entries. Here are representative samples — the implementing agent MUST write all 78:

```rust
/// Placeholder ASCII art for cards before the RWS image pipeline runs.
/// Simple bordered frame with suit symbol and card name.
fn placeholder_art(suit: char, name: &str) -> String {
    // Not used at compile time — placeholders are inline &'static str below.
    format!("┌─────────────┐\n│  {}          │\n│             │\n│  {}│\n│             │\n│          {}  │\n└─────────────┘", suit, name, suit)
}

// Placeholder: a minimal card frame. Will be replaced by RWS ASCII art in Task 5.
const PLACEHOLDER_MAJOR: &str = "\
┌─────────────┐
│  ✦          │
│             │
│   MAJOR     │
│   ARCANA    │
│             │
│          ✦  │
└─────────────┘";

const PLACEHOLDER_CUPS: &str = "\
┌─────────────┐
│  🜄          │
│             │
│    CUPS     │
│             │
│             │
│          🜄  │
└─────────────┘";

const PLACEHOLDER_WANDS: &str = "\
┌─────────────┐
│  🜂          │
│             │
│   WANDS     │
│             │
│             │
│          🜂  │
└─────────────┘";

const PLACEHOLDER_PENTACLES: &str = "\
┌─────────────┐
│  🜃          │
│             │
│ PENTACLES   │
│             │
│             │
│          🜃  │
└─────────────┘";

const PLACEHOLDER_SWORDS: &str = "\
┌─────────────┐
│  🜁          │
│             │
│  SWORDS     │
│             │
│             │
│          🜁  │
└─────────────┘";

pub static THOTH_CARDS: [ThothCardInfo; 78] = [
    // ── Major Arcana (0-21) ──
    ThothCardInfo {
        card_id: 0, name: "The Fool", thoth_title: "The Spirit of Ether",
        keyword: "Beginnings", suit: Suit::Major,
        meaning_upright: "New beginnings, innocence, spontaneity, free spirit. A leap of faith into the unknown.",
        meaning_reversed: "Recklessness, risk-taking, naivety. Holding back from a necessary leap.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 1, name: "The Magus", thoth_title: "The Magus of Power",
        keyword: "Will", suit: Suit::Major,
        meaning_upright: "Skill, diplomacy, communication, self-confidence. Mastery of all four elements as tools of will.",
        meaning_reversed: "Manipulation, trickery, poor planning. Misuse of gifts and cunning.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 2, name: "The Priestess", thoth_title: "The Priestess of the Silver Star",
        keyword: "Intuition", suit: Suit::Major,
        meaning_upright: "Mystery, higher powers, intuition, the subconscious mind. The Moon's pure reflection.",
        meaning_reversed: "Secrets withheld, withdrawal, silence. Disconnection from inner knowing.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 3, name: "The Empress", thoth_title: "The Daughter of the Mighty Ones",
        keyword: "Love", suit: Suit::Major,
        meaning_upright: "Abundance, nurturing, fertility, beauty. The creative force of nature made manifest.",
        meaning_reversed: "Creative block, dependence, emptiness. Neglect of the body or the natural world.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 4, name: "The Emperor", thoth_title: "Son of the Morning",
        keyword: "Authority", suit: Suit::Major,
        meaning_upright: "Authority, structure, stability, leadership. The power of rational order and law.",
        meaning_reversed: "Tyranny, rigidity, domination. Excessive control or loss of authority.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 5, name: "The Hierophant", thoth_title: "The Magus of the Eternal Gods",
        keyword: "Teaching", suit: Suit::Major,
        meaning_upright: "Tradition, spiritual wisdom, conformity, education. The inner teacher and outer institution.",
        meaning_reversed: "Restriction, challenging the status quo, unorthodoxy. Breaking free from doctrine.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 6, name: "The Lovers", thoth_title: "The Children of the Voice",
        keyword: "Union", suit: Suit::Major,
        meaning_upright: "Love, harmony, relationships, values alignment. The alchemical marriage of opposites.",
        meaning_reversed: "Disharmony, imbalance, misalignment. A choice that divides rather than unites.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 7, name: "The Chariot", thoth_title: "The Child of the Powers of the Waters",
        keyword: "Triumph", suit: Suit::Major,
        meaning_upright: "Willpower, determination, control, victory. Harnessing opposing forces toward a single aim.",
        meaning_reversed: "Aggression, lack of direction, lack of willpower. The charioteer loses the reins.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 8, name: "Adjustment", thoth_title: "The Daughter of the Lords of Truth",
        keyword: "Balance", suit: Suit::Major,
        meaning_upright: "Justice, truth, cause and effect, law. Perfect equilibrium of all forces, karmic adjustment.",
        meaning_reversed: "Unfairness, dishonesty, lack of accountability. The scales tipped by bias.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 9, name: "The Hermit", thoth_title: "The Prophet of the Eternal",
        keyword: "Solitude", suit: Suit::Major,
        meaning_upright: "Soul-searching, introspection, inner guidance, solitude. The lamp that lights the way within.",
        meaning_reversed: "Isolation, loneliness, withdrawal. Solitude that becomes imprisonment.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 10, name: "Fortune", thoth_title: "The Lord of the Forces of Life",
        keyword: "Cycles", suit: Suit::Major,
        meaning_upright: "Change, cycles, destiny, turning point. The wheel turns; nothing is permanent.",
        meaning_reversed: "Bad luck, resistance to change, breaking cycles. Clinging to the rim.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 11, name: "Lust", thoth_title: "The Daughter of the Flaming Sword",
        keyword: "Passion", suit: Suit::Major,
        meaning_upright: "Strength, courage, passion, persuasion. Babalon rides the Beast — ecstasy as power.",
        meaning_reversed: "Self-doubt, weakness, raw emotion. Passion without direction or courage.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 12, name: "The Hanged Man", thoth_title: "The Spirit of the Mighty Waters",
        keyword: "Surrender", suit: Suit::Major,
        meaning_upright: "Suspension, letting go, new perspectives, sacrifice. Reversal of vision grants wisdom.",
        meaning_reversed: "Martyrdom, indecision, delay. Unnecessary suffering without growth.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 13, name: "Death", thoth_title: "The Child of the Great Transformers",
        keyword: "Transformation", suit: Suit::Major,
        meaning_upright: "Endings, change, transformation, transition. The old must die for the new to emerge.",
        meaning_reversed: "Resistance to change, inability to move on. Stagnation from fear of ending.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 14, name: "Art", thoth_title: "The Daughter of the Reconcilers",
        keyword: "Alchemy", suit: Suit::Major,
        meaning_upright: "Balance, moderation, patience, finding meaning. The alchemical Great Work — combining opposites.",
        meaning_reversed: "Imbalance, excess, lack of long-term vision. Alchemy that fails to integrate.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 15, name: "The Devil", thoth_title: "The Lord of the Gates of Matter",
        keyword: "Bondage", suit: Suit::Major,
        meaning_upright: "Bondage, materialism, shadow self, sexuality. Pan — creative energy bound to matter.",
        meaning_reversed: "Releasing limiting beliefs, exploring dark side. Breaking free from attachment.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 16, name: "The Tower", thoth_title: "The Lord of the Hosts of the Mighty",
        keyword: "Destruction", suit: Suit::Major,
        meaning_upright: "Sudden upheaval, broken pride, revelation, disaster. The lightning flash that shatters false structures.",
        meaning_reversed: "Averting disaster, fear of change, delaying the inevitable. Crumbling foundations.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 17, name: "The Star", thoth_title: "The Daughter of the Firmament",
        keyword: "Hope", suit: Suit::Major,
        meaning_upright: "Hope, faith, purpose, renewal, serenity. Nuit pours forth the waters of life.",
        meaning_reversed: "Lack of faith, despair, disconnection. The star dimmed by disbelief.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 18, name: "The Moon", thoth_title: "The Ruler of Flux and Reflux",
        keyword: "Illusion", suit: Suit::Major,
        meaning_upright: "Illusion, fear, anxiety, the subconscious, dreams. The dark night of the soul.",
        meaning_reversed: "Release of fear, repressed emotions surfacing. Clarity emerging from confusion.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 19, name: "The Sun", thoth_title: "The Lord of the Fire of the World",
        keyword: "Joy", suit: Suit::Major,
        meaning_upright: "Joy, success, celebration, positivity, vitality. The radiance of fully realized consciousness.",
        meaning_reversed: "Inner child wounded, over-optimism, temporary setback. The sun behind clouds.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 20, name: "The Aeon", thoth_title: "The Spirit of the Primal Fire",
        keyword: "Judgement", suit: Suit::Major,
        meaning_upright: "Judgement, rebirth, inner calling, absolution. The new aeon dawns — Horus replaces Osiris.",
        meaning_reversed: "Self-doubt, refusal of the call. The trumpet sounds but goes unheard.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    ThothCardInfo {
        card_id: 21, name: "The Universe", thoth_title: "The Great One of the Night of Time",
        keyword: "Completion", suit: Suit::Major,
        meaning_upright: "Completion, integration, accomplishment, wholeness. The cosmic dancer in Saturn's ring.",
        meaning_reversed: "Lack of closure, seeking shortcuts, incompleteness. The dance unfinished.",
        ascii_art: PLACEHOLDER_MAJOR,
    },
    // ── Cups (22-35): Ace, 2-10, Princess, Prince, Queen, Knight ──
    ThothCardInfo {
        card_id: 22, name: "Ace of Cups", thoth_title: "The Root of the Powers of Water",
        keyword: "Emotional seed", suit: Suit::Cups,
        meaning_upright: "New feelings, intuition, intimacy, love. The Holy Grail overflows with spiritual nourishment.",
        meaning_reversed: "Blocked emotions, emptiness, repressed feelings. The cup inverted, waters spilled.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 23, name: "Two of Cups", thoth_title: "Love",
        keyword: "Partnership", suit: Suit::Cups,
        meaning_upright: "Unified love, partnership, mutual attraction, harmony. Two streams become one river.",
        meaning_reversed: "Break-up, imbalance, self-love needed. The streams diverge.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 24, name: "Three of Cups", thoth_title: "Abundance",
        keyword: "Celebration", suit: Suit::Cups,
        meaning_upright: "Celebration, friendship, creativity, collaboration. The overflowing pomegranate of shared joy.",
        meaning_reversed: "Overindulgence, gossip, isolation. Celebration turned hollow.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 25, name: "Four of Cups", thoth_title: "Luxury",
        keyword: "Complacency", suit: Suit::Cups,
        meaning_upright: "Contemplation, apathy, reevaluation. Emotional luxury tending toward stagnation.",
        meaning_reversed: "Motivation renewed, awareness, new possibilities. Seeing the offered cup at last.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 26, name: "Five of Cups", thoth_title: "Disappointment",
        keyword: "Loss", suit: Suit::Cups,
        meaning_upright: "Regret, failure, disappointment, pessimism. Three cups spilled, two remain standing.",
        meaning_reversed: "Acceptance, moving on, forgiveness. Turning to see what remains.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 27, name: "Six of Cups", thoth_title: "Pleasure",
        keyword: "Nostalgia", suit: Suit::Cups,
        meaning_upright: "Harmony, nostalgia, reunion, childhood memories. Emotional equilibrium through simple pleasure.",
        meaning_reversed: "Living in the past, unrealistic expectations. Pleasure that binds rather than frees.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 28, name: "Seven of Cups", thoth_title: "Debauch",
        keyword: "Illusion", suit: Suit::Cups,
        meaning_upright: "Fantasy, illusion, wishful thinking, choices. Emotions corrupted by excess and escapism.",
        meaning_reversed: "Alignment, personal values, clarity. Seeing through the fog of desire.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 29, name: "Eight of Cups", thoth_title: "Indolence",
        keyword: "Withdrawal", suit: Suit::Cups,
        meaning_upright: "Abandonment, withdrawal, disappointment, seeking deeper meaning. Walking away to find truth.",
        meaning_reversed: "Aimless drifting, fear of moving on. Indolence that masquerades as contentment.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 30, name: "Nine of Cups", thoth_title: "Happiness",
        keyword: "Fulfilment", suit: Suit::Cups,
        meaning_upright: "Contentment, satisfaction, gratitude, wish fulfilled. Emotional abundance at its peak.",
        meaning_reversed: "Inner dissatisfaction despite outer success. Happiness sought in wrong places.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 31, name: "Ten of Cups", thoth_title: "Satiety",
        keyword: "Completion", suit: Suit::Cups,
        meaning_upright: "Emotional fulfilment, harmony, alignment. The cups overflow but satiety brings restlessness.",
        meaning_reversed: "Broken family, misalignment, disconnection. The rainbow fades.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 32, name: "Princess of Cups", thoth_title: "The Princess of the Waters",
        keyword: "Dreaminess", suit: Suit::Cups,
        meaning_upright: "Creative opportunities, intuitive messages, new emotional experiences. A tender, dreaming spirit.",
        meaning_reversed: "Emotional immaturity, escapism, seduction. Dreams without grounding.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 33, name: "Prince of Cups", thoth_title: "The Prince of the Chariot of the Waters",
        keyword: "Romance", suit: Suit::Cups,
        meaning_upright: "Romance, charm, imagination, beauty. The poet-warrior riding the waves of feeling.",
        meaning_reversed: "Moodiness, jealousy, emotional manipulation. The chariot of water capsized.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 34, name: "Queen of Cups", thoth_title: "The Queen of the Thrones of the Waters",
        keyword: "Compassion", suit: Suit::Cups,
        meaning_upright: "Compassion, calm, comfort, emotional security. She holds the Grail and reflects all depths.",
        meaning_reversed: "Codependency, inner insecurity, martyrdom. The throne sinks into the depths.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    ThothCardInfo {
        card_id: 35, name: "Knight of Cups", thoth_title: "The Lord of the Waves and the Waters",
        keyword: "Mastery of emotion", suit: Suit::Cups,
        meaning_upright: "Emotional mastery, wisdom, diplomatic counselor. The king of the deep who rules by feeling.",
        meaning_reversed: "Emotional volatility, manipulation, moodiness. The waters rage unchecked.",
        ascii_art: PLACEHOLDER_CUPS,
    },
    // ── Wands (36-49): Ace, 2-10, Princess, Prince, Queen, Knight ──
    ThothCardInfo {
        card_id: 36, name: "Ace of Wands", thoth_title: "The Root of the Powers of Fire",
        keyword: "Inspiration", suit: Suit::Wands,
        meaning_upright: "Creation, willpower, inspiration, desire. The primal fire-bolt of pure creative force.",
        meaning_reversed: "Lack of energy, delays, weighed down. The flame gutters before catching.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 37, name: "Two of Wands", thoth_title: "Dominion",
        keyword: "Vision", suit: Suit::Wands,
        meaning_upright: "Future planning, progress, decisions, discovery. Mars in Aries — bold command of direction.",
        meaning_reversed: "Fear of unknown, lack of planning, playing small. Dominion unclaimed.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 38, name: "Three of Wands", thoth_title: "Virtue",
        keyword: "Foresight", suit: Suit::Wands,
        meaning_upright: "Expansion, foresight, overseas opportunities. Sun in Aries — virtue as integrity of will.",
        meaning_reversed: "Obstacles, delays, frustration. Plans stall at the harbor.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 39, name: "Four of Wands", thoth_title: "Completion",
        keyword: "Celebration", suit: Suit::Wands,
        meaning_upright: "Celebration, harmony, homecoming, relaxation. Venus in Aries — the first cycle completes.",
        meaning_reversed: "Lack of harmony, transition, feeling unwelcome. The garlands wilt.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 40, name: "Five of Wands", thoth_title: "Strife",
        keyword: "Conflict", suit: Suit::Wands,
        meaning_upright: "Competition, conflict, tension, diversity. Saturn in Leo — wills clash and test each other.",
        meaning_reversed: "Avoiding conflict, inner turmoil, compromise. Strife internalized.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 41, name: "Six of Wands", thoth_title: "Victory",
        keyword: "Triumph", suit: Suit::Wands,
        meaning_upright: "Success, public recognition, progress, self-confidence. Jupiter in Leo — the victorious procession.",
        meaning_reversed: "Egotism, fall from grace, lack of recognition. The laurel crown slips.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 42, name: "Seven of Wands", thoth_title: "Valour",
        keyword: "Courage", suit: Suit::Wands,
        meaning_upright: "Challenge, perseverance, standing your ground. Mars in Leo — courage under fire.",
        meaning_reversed: "Overwhelm, giving up, being overpowered. Valour spent on the wrong hill.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 43, name: "Eight of Wands", thoth_title: "Swiftness",
        keyword: "Speed", suit: Suit::Wands,
        meaning_upright: "Movement, speed, swift action, air travel. Mercury in Sagittarius — arrows of light in flight.",
        meaning_reversed: "Delays, frustration, waiting, stalled progress. The arrows fall short.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 44, name: "Nine of Wands", thoth_title: "Strength",
        keyword: "Resilience", suit: Suit::Wands,
        meaning_upright: "Resilience, grit, persistence, last stand. Moon in Sagittarius — wounded but unbroken.",
        meaning_reversed: "Paranoia, exhaustion, chronic defensiveness. The wall becomes a prison.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 45, name: "Ten of Wands", thoth_title: "Oppression",
        keyword: "Burden", suit: Suit::Wands,
        meaning_upright: "Burden, responsibility, hard work, overcommitment. Saturn in Sagittarius — fire crushed by duty.",
        meaning_reversed: "Release of burden, delegating, breakdown. The load finally dropped.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 46, name: "Princess of Wands", thoth_title: "The Princess of the Shining Flame",
        keyword: "Enthusiasm", suit: Suit::Wands,
        meaning_upright: "Enthusiasm, exploration, discovery, free spirit. A spark of creative fire seeking expression.",
        meaning_reversed: "Superficiality, lack of direction, temper tantrums. Flame without fuel.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 47, name: "Prince of Wands", thoth_title: "The Prince of the Chariot of Fire",
        keyword: "Adventure", suit: Suit::Wands,
        meaning_upright: "Energy, passion, adventure, impulsiveness. The fiery prince charges into the unknown.",
        meaning_reversed: "Haste, scattered energy, ruthlessness. The chariot of fire careens off course.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 48, name: "Queen of Wands", thoth_title: "The Queen of the Thrones of Flame",
        keyword: "Confidence", suit: Suit::Wands,
        meaning_upright: "Courage, confidence, independence, social butterfly. She commands fire with grace and warmth.",
        meaning_reversed: "Selfishness, jealousy, demanding nature. The flame that consumes those nearby.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    ThothCardInfo {
        card_id: 49, name: "Knight of Wands", thoth_title: "The Lord of the Flame and the Lightning",
        keyword: "Mastery of fire", suit: Suit::Wands,
        meaning_upright: "Leadership, vision, entrepreneurship, honour. The king who wields fire as a creative force.",
        meaning_reversed: "Impulsiveness, ruthlessness, high expectations. Lightning that strikes without aim.",
        ascii_art: PLACEHOLDER_WANDS,
    },
    // ── Pentacles (50-63): Ace, 2-10, Princess, Prince, Queen, Knight ──
    ThothCardInfo {
        card_id: 50, name: "Ace of Disks", thoth_title: "The Root of the Powers of Earth",
        keyword: "Manifestation", suit: Suit::Pentacles,
        meaning_upright: "New financial or material opportunity, prosperity, abundance. The seed of all earthly power.",
        meaning_reversed: "Lost opportunity, lack of planning, scarcity. The seed falls on barren ground.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 51, name: "Two of Disks", thoth_title: "Change",
        keyword: "Flexibility", suit: Suit::Pentacles,
        meaning_upright: "Balance, adaptability, time management, prioritisation. Jupiter in Capricorn — the dance of yin and yang.",
        meaning_reversed: "Overwhelm, disorganisation, reprioritisation needed. The juggler drops a ball.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 52, name: "Three of Disks", thoth_title: "Works",
        keyword: "Teamwork", suit: Suit::Pentacles,
        meaning_upright: "Teamwork, collaboration, learning, implementation. Mars in Capricorn — skilled labor manifests the plan.",
        meaning_reversed: "Lack of teamwork, disregard for skills, poor work. The craft dishonoured.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 53, name: "Four of Disks", thoth_title: "Power",
        keyword: "Security", suit: Suit::Pentacles,
        meaning_upright: "Security, conservation, control, stability. Sun in Capricorn — the fortress of accumulated power.",
        meaning_reversed: "Greed, materialism, possessiveness. Power that hoards rather than builds.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 54, name: "Five of Disks", thoth_title: "Worry",
        keyword: "Hardship", suit: Suit::Pentacles,
        meaning_upright: "Financial loss, poverty, lack mentality, isolation. Mercury in Taurus — material anxiety spirals.",
        meaning_reversed: "Recovery, overcoming adversity, spiritual poverty. Finding warmth in the cold.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 55, name: "Six of Disks", thoth_title: "Success",
        keyword: "Generosity", suit: Suit::Pentacles,
        meaning_upright: "Generosity, sharing, giving and receiving, prosperity. Moon in Taurus — balanced material exchange.",
        meaning_reversed: "Debt, selfishness, one-sided generosity. Success that breeds entitlement.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 56, name: "Seven of Disks", thoth_title: "Failure",
        keyword: "Patience", suit: Suit::Pentacles,
        meaning_upright: "Perseverance, long-term view, investment, reward delayed. Saturn in Taurus — the crop not yet ripe.",
        meaning_reversed: "Impatience, lack of reward, poor investments. Harvesting too early.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 57, name: "Eight of Disks", thoth_title: "Prudence",
        keyword: "Diligence", suit: Suit::Pentacles,
        meaning_upright: "Apprenticeship, skill development, diligence, craftsmanship. Sun in Virgo — patient mastery of form.",
        meaning_reversed: "Perfectionism, misdirected effort, lack of ambition. Prudence that becomes paralysis.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 58, name: "Nine of Disks", thoth_title: "Gain",
        keyword: "Abundance", suit: Suit::Pentacles,
        meaning_upright: "Luxury, self-sufficiency, financial independence, culmination. Venus in Virgo — the garden in full bloom.",
        meaning_reversed: "Over-investment in work, hustling, material obsession. Gain without enjoyment.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 59, name: "Ten of Disks", thoth_title: "Wealth",
        keyword: "Legacy", suit: Suit::Pentacles,
        meaning_upright: "Wealth, inheritance, family, long-term success. Mercury in Virgo — the estate fully established.",
        meaning_reversed: "Financial failure, loss of stability, broken legacy. Wealth that scatters.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 60, name: "Princess of Disks", thoth_title: "The Princess of the Echoing Hills",
        keyword: "Manifestation", suit: Suit::Pentacles,
        meaning_upright: "Manifestation, financial opportunity, new venture. Earthy practicality pregnant with possibility.",
        meaning_reversed: "Lack of progress, procrastination, learning from failure. The seed dormant.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 61, name: "Prince of Disks", thoth_title: "The Prince of the Chariot of Earth",
        keyword: "Persistence", suit: Suit::Pentacles,
        meaning_upright: "Hard work, routine, conservatism, methodical progress. The bull-drawn chariot advances steadily.",
        meaning_reversed: "Laziness, boredom, feeling stuck. The chariot of earth mired in mud.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 62, name: "Queen of Disks", thoth_title: "The Queen of the Thrones of Earth",
        keyword: "Nurturing", suit: Suit::Pentacles,
        meaning_upright: "Practical, a homebody, generous provider, down-to-earth. She tends the garden that feeds all.",
        meaning_reversed: "Self-centeredness, smothering, work-home imbalance. Earth that refuses to yield.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    ThothCardInfo {
        card_id: 63, name: "Knight of Disks", thoth_title: "The Lord of the Wide and Fertile Land",
        keyword: "Mastery of earth", suit: Suit::Pentacles,
        meaning_upright: "Abundance, prosperity, security, patriarch of wealth. The king whose domain flourishes.",
        meaning_reversed: "Financially inept, obsessed with wealth, stubbornness. The land over-tilled.",
        ascii_art: PLACEHOLDER_PENTACLES,
    },
    // ── Swords (64-77): Ace, 2-10, Princess, Prince, Queen, Knight ──
    ThothCardInfo {
        card_id: 64, name: "Ace of Swords", thoth_title: "The Root of the Powers of Air",
        keyword: "Clarity", suit: Suit::Swords,
        meaning_upright: "Breakthrough, clarity, new ideas, raw truth. The invoked sword cuts through all illusion.",
        meaning_reversed: "Confusion, brutality, chaos, misuse of intellect. The sword turned inward.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 65, name: "Two of Swords", thoth_title: "Peace",
        keyword: "Truce", suit: Suit::Swords,
        meaning_upright: "Stalemate, difficult choices, truce, avoidance. Moon in Libra — peace through balanced denial.",
        meaning_reversed: "Indecision, confusion, information overload. The blindfold removed too soon.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 66, name: "Three of Swords", thoth_title: "Sorrow",
        keyword: "Heartbreak", suit: Suit::Swords,
        meaning_upright: "Heartbreak, emotional pain, grief, sorrow. Saturn in Libra — the mind pierces the heart.",
        meaning_reversed: "Recovery, forgiveness, releasing pain. The swords slowly withdrawn.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 67, name: "Four of Swords", thoth_title: "Truce",
        keyword: "Rest", suit: Suit::Swords,
        meaning_upright: "Rest, restoration, contemplation, passivity. Jupiter in Libra — the warrior rests between battles.",
        meaning_reversed: "Restlessness, burnout, re-entering the fray. Truce broken prematurely.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 68, name: "Five of Swords", thoth_title: "Defeat",
        keyword: "Conflict", suit: Suit::Swords,
        meaning_upright: "Conflict, tension, loss, win at all costs. Venus in Aquarius — a victory that tastes of ash.",
        meaning_reversed: "Reconciliation, past resentment, compromise. Learning from defeat.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 69, name: "Six of Swords", thoth_title: "Science",
        keyword: "Transition", suit: Suit::Swords,
        meaning_upright: "Transition, change, rite of passage, moving on. Mercury in Aquarius — mind navigates troubled waters.",
        meaning_reversed: "Emotional baggage, resistance, unfinished business. The boat that cannot sail.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 70, name: "Seven of Swords", thoth_title: "Futility",
        keyword: "Deception", suit: Suit::Swords,
        meaning_upright: "Deception, trickery, strategy, resourcefulness. Moon in Aquarius — plans that unravel by their own cunning.",
        meaning_reversed: "Conscience, coming clean, rethinking approach. Futility recognized at last.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 71, name: "Eight of Swords", thoth_title: "Interference",
        keyword: "Restriction", suit: Suit::Swords,
        meaning_upright: "Restriction, self-imposed limitation, imprisonment, victim mentality. Jupiter in Gemini — mind trapped by its own walls.",
        meaning_reversed: "Self-acceptance, new perspective, freedom. The blindfold loosens.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 72, name: "Nine of Swords", thoth_title: "Cruelty",
        keyword: "Anxiety", suit: Suit::Swords,
        meaning_upright: "Anxiety, worry, fear, depression, nightmares. Mars in Gemini — the mind tortures itself.",
        meaning_reversed: "Hope, reaching out, overcoming despair. Dawn after the darkest night.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 73, name: "Ten of Swords", thoth_title: "Ruin",
        keyword: "Ending", suit: Suit::Swords,
        meaning_upright: "Painful endings, deep wounds, betrayal, loss, crisis. Sun in Gemini — total destruction of a mental paradigm.",
        meaning_reversed: "Recovery, regeneration, resisting an inevitable end. Ruin as ground for renewal.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 74, name: "Princess of Swords", thoth_title: "The Princess of the Rushing Winds",
        keyword: "Vigilance", suit: Suit::Swords,
        meaning_upright: "New ideas, curiosity, thirst for knowledge, sharp perception. The wind-child cuts through pretence.",
        meaning_reversed: "Scattered energy, cynicism, all talk no action. Winds without direction.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 75, name: "Prince of Swords", thoth_title: "The Prince of the Chariot of the Winds",
        keyword: "Intellect", suit: Suit::Swords,
        meaning_upright: "Ambitious, action-oriented, quick-thinking, driven. The chariot of wind moves with devastating speed.",
        meaning_reversed: "Ruthless, overly hasty, scattered thinking. The chariot of air spins without direction.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 76, name: "Queen of Swords", thoth_title: "The Queen of the Thrones of Air",
        keyword: "Perception", suit: Suit::Swords,
        meaning_upright: "Clear thinking, honest communication, independent woman, direct speech. She sees through all masks.",
        meaning_reversed: "Cold-hearted, cruel, bitter, overly critical. Perception weaponized against others.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
    ThothCardInfo {
        card_id: 77, name: "Knight of Swords", thoth_title: "The Lord of the Winds and Breezes",
        keyword: "Mastery of mind", suit: Suit::Swords,
        meaning_upright: "Intellectual power, authority, truth, ethical judgment. The king whose word is law.",
        meaning_reversed: "Quiet power, inner truth, misuse of authority. The mind that judges too harshly.",
        ascii_art: PLACEHOLDER_SWORDS,
    },
];
```

**IMPORTANT:** The implementing agent MUST write all 78 entries exactly as above. The Thoth names for Pentacles are "Disks" — both `name` and `thoth_title` use "Disks" while `suit` remains `Suit::Pentacles` for consistency with existing `oracle.rs` encoding.

- [ ] **Step 4: Register the module**

Edit `epi-cli/src/nara/mod.rs` — add after the `hexagram_data` line added in Task 1:

```rust
pub mod tarot_data;
```

- [ ] **Step 5: Run tests to verify**

Run: `cd epi-cli && cargo test tarot_data -- --nocapture`

Expected: All 7 tests pass (78 entries, sequential IDs, no empty names, correct suit ranges, suit glyphs, placeholders present).

- [ ] **Step 6: Commit**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add epi-cli/src/nara/tarot_data.rs epi-cli/src/nara/mod.rs
git commit -m "feat(nara): add tarot_data module with 78 Thoth card entries

Static THOTH_CARDS[78] with Crowley names, esoteric titles, keywords,
upright/reversed meanings. Placeholder ASCII art frames per suit.
Suit enum + suit_glyph() + suit_for_card() helpers."
```

---

### Task 3: Hexagram Browser Plugin

**Files:**
- Create: `epi-cli/src/portal/plugins/hexagram.rs`
- Modify: `epi-cli/src/portal/plugins/mod.rs`

- [ ] **Step 1: Write the failing test**

Add to the bottom of `epi-cli/src/portal/plugins/hexagram.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_plugin_defaults() {
        let p = M4HexagramPlugin::new();
        assert_eq!(p.selected, 0);
        assert_eq!(p.scroll_offset, 0);
        assert!(p.selected_hexagram().is_none());
    }

    #[test]
    fn selected_hexagram_after_confirm() {
        let mut p = M4HexagramPlugin::new();
        // Simulate Enter key to confirm selection
        p.confirmed = true;
        assert_eq!(p.selected_hexagram(), Some(0)); // hex index 0 = hexagram 1
    }

    #[test]
    fn navigate_down_wraps() {
        let mut p = M4HexagramPlugin::new();
        p.selected = 63;
        p.navigate_down();
        assert_eq!(p.selected, 0);
    }

    #[test]
    fn navigate_up_wraps() {
        let mut p = M4HexagramPlugin::new();
        p.selected = 0;
        p.navigate_up();
        assert_eq!(p.selected, 63);
    }

    #[test]
    fn new_with_clock_creates_plugin() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let p = M4HexagramPlugin::new_with_clock(clock);
        assert_eq!(p.selected, 0);
    }
}
```

- [ ] **Step 2: Write the plugin struct and methods**

Create `epi-cli/src/portal/plugins/hexagram.rs`:

```rust
use crate::nara::hexagram_data::{
    render_hexagram_lines, mini_glyph, trigram_name, HEXAGRAM_INFO, TRIGRAM_ENGLISH,
};
use crate::nara::oracle::HEXAGRAM_BODY_DYNAMICS;
use crate::portal::clock_state::SharedClockState;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent};
use ratatui_hypertile_extras::HypertilePlugin;

pub struct M4HexagramPlugin {
    selected: usize,
    scroll_offset: usize,
    confirmed: bool,
    shared_clock: Option<SharedClockState>,
    active_hex: Option<u8>,
}

impl M4HexagramPlugin {
    pub fn new() -> Self {
        Self {
            selected: 0,
            scroll_offset: 0,
            confirmed: false,
            shared_clock: None,
            active_hex: None,
        }
    }

    pub fn new_with_clock(clock: SharedClockState) -> Self {
        let mut s = Self::new();
        s.shared_clock = Some(clock);
        s.sync_clock();
        s
    }

    pub fn selected_hexagram(&self) -> Option<u8> {
        if self.confirmed {
            Some(self.selected as u8)
        } else {
            None
        }
    }

    fn sync_clock(&mut self) {
        if let Some(ref clock) = self.shared_clock {
            if let Ok(state) = clock.lock() {
                self.active_hex = Some(state.primary_hex);
            }
        }
    }

    fn navigate_down(&mut self) {
        if self.selected >= 63 {
            self.selected = 0;
        } else {
            self.selected += 1;
        }
    }

    fn navigate_up(&mut self) {
        if self.selected == 0 {
            self.selected = 63;
        } else {
            self.selected -= 1;
        }
    }

    fn render_list(&self, area: Rect, buf: &mut Buffer) {
        let visible_rows = area.height.saturating_sub(2) as usize; // -2 for borders
        // Adjust scroll to keep selected in view
        let scroll = if self.selected < self.scroll_offset {
            self.selected
        } else if self.selected >= self.scroll_offset + visible_rows {
            self.selected.saturating_sub(visible_rows - 1)
        } else {
            self.scroll_offset
        };

        let items: Vec<ListItem> = HEXAGRAM_INFO
            .iter()
            .enumerate()
            .skip(scroll)
            .take(visible_rows)
            .map(|(i, h)| {
                let is_active = self.active_hex.map_or(false, |a| a as usize == i);
                let is_selected = i == self.selected;
                let prefix = if is_active { "◆ " } else { "  " };
                let pattern = (i as u8) & 0x3F; // line pattern = index for King Wen (approx)
                let glyph = mini_glyph(pattern);
                let text = format!("{}{:>2}. {} {}", prefix, h.number, glyph, h.name_en);
                let style = if is_selected {
                    Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)
                } else if is_active {
                    Style::default().fg(Color::Cyan)
                } else {
                    Style::default().fg(Color::White)
                };
                ListItem::new(Line::from(Span::styled(text, style)))
            })
            .collect();

        let list = List::new(items).block(
            Block::default()
                .title(" Hexagrams ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(list, area, buf);
    }

    fn render_detail(&self, area: Rect, buf: &mut Buffer) {
        let h = &HEXAGRAM_INFO[self.selected];
        let body = &HEXAGRAM_BODY_DYNAMICS[self.selected];

        let mut lines: Vec<Line> = Vec::new();

        // Title
        lines.push(Line::from(vec![
            Span::styled(
                format!("  #{} ", h.number),
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                h.name_en,
                Style::default().fg(Color::White).add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                format!("  ({})", h.name_pinyin),
                Style::default().fg(Color::DarkGray),
            ),
        ]));
        lines.push(Line::from(""));

        // Pictogram with trigram labels
        // We need the actual line pattern for this hexagram. For King Wen order,
        // the pattern comes from the upper/lower trigram indices.
        let trigram_bits: [u8; 8] = [0b111, 0b000, 0b001, 0b110, 0b010, 0b101, 0b100, 0b011];
        let upper_bits = trigram_bits[h.trigram_upper as usize];
        let lower_bits = trigram_bits[h.trigram_lower as usize];
        let pattern = (upper_bits << 3) | lower_bits;
        let hex_lines = render_hexagram_lines(pattern);

        let upper_label = format!(
            "  {} ({})",
            trigram_name(h.trigram_upper),
            TRIGRAM_ENGLISH[h.trigram_upper as usize]
        );
        let lower_label = format!(
            "  {} ({})",
            trigram_name(h.trigram_lower),
            TRIGRAM_ENGLISH[h.trigram_lower as usize]
        );

        // Top 3 lines = upper trigram
        for (i, line) in hex_lines[0..3].iter().enumerate() {
            let label = if i == 0 { upper_label.as_str() } else { "" };
            lines.push(Line::from(vec![
                Span::styled(format!("  {}", line), Style::default().fg(Color::Cyan)),
                Span::styled(label.to_string(), Style::default().fg(Color::DarkGray)),
            ]));
        }
        // Visual gap
        lines.push(Line::from(""));
        // Bottom 3 lines = lower trigram
        for (i, line) in hex_lines[3..6].iter().enumerate() {
            let label = if i == 0 { lower_label.as_str() } else { "" };
            lines.push(Line::from(vec![
                Span::styled(format!("  {}", line), Style::default().fg(Color::Cyan)),
                Span::styled(label.to_string(), Style::default().fg(Color::DarkGray)),
            ]));
        }

        lines.push(Line::from(""));

        // Keyword
        lines.push(Line::from(vec![
            Span::styled("  Keyword: ", Style::default().fg(Color::DarkGray)),
            Span::styled(h.keyword, Style::default().fg(Color::Green)),
        ]));

        // Image
        lines.push(Line::from(vec![
            Span::styled("  Image: ", Style::default().fg(Color::DarkGray)),
            Span::styled(h.image, Style::default().fg(Color::White)),
        ]));

        lines.push(Line::from(""));

        // Judgement
        lines.push(Line::from(Span::styled(
            "  Judgement:",
            Style::default().fg(Color::DarkGray),
        )));
        // Word-wrap judgement to fit area
        let wrap_width = area.width.saturating_sub(6) as usize;
        for chunk in h.judgement.as_bytes().chunks(wrap_width) {
            if let Ok(s) = std::str::from_utf8(chunk) {
                lines.push(Line::from(Span::styled(
                    format!("    {}", s),
                    Style::default().fg(Color::White),
                )));
            }
        }

        lines.push(Line::from(""));

        // Body data from HEXAGRAM_BODY_DYNAMICS
        lines.push(Line::from(Span::styled(
            "  Body Dynamics:",
            Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
        )));
        lines.push(Line::from(vec![
            Span::styled("    ", Style::default()),
            Span::styled(body.dynamics, Style::default().fg(Color::White)),
        ]));
        lines.push(Line::from(vec![
            Span::styled(
                format!("    Chakras: {}/{}", body.primary_chakra, body.secondary_chakra),
                Style::default().fg(Color::Cyan),
            ),
        ]));
        if !body.body_zones.is_empty() {
            let zones = body.body_zones.join(", ");
            lines.push(Line::from(vec![
                Span::styled("    Zones: ", Style::default().fg(Color::DarkGray)),
                Span::styled(zones, Style::default().fg(Color::White)),
            ]));
        }

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(" Detail ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(para, area, buf);
    }
}

impl HypertilePlugin for M4HexagramPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let outer_block = Block::default()
            .title(" ☰ I Ching — 64 Hexagrams ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(theme::pane_border(is_focused)));
        let inner = outer_block.inner(area);
        Widget::render(outer_block, area, buf);

        // 30/70 split
        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(30), Constraint::Percentage(70)])
            .split(inner);

        self.render_list(chunks[0], buf);
        self.render_detail(chunks[1], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        match event {
            HypertileEvent::Tick => {
                self.sync_clock();
                EventOutcome::Consumed
            }
            HypertileEvent::Key(key) => {
                use crossterm::event::KeyCode;
                match key.code {
                    KeyCode::Up | KeyCode::Char('k') => {
                        self.navigate_up();
                        EventOutcome::Consumed
                    }
                    KeyCode::Down | KeyCode::Char('j') => {
                        self.navigate_down();
                        EventOutcome::Consumed
                    }
                    KeyCode::Enter => {
                        self.confirmed = true;
                        EventOutcome::Consumed
                    }
                    _ => EventOutcome::Ignored,
                }
            }
            _ => EventOutcome::Ignored,
        }
    }
}
```

- [ ] **Step 3: Register the module**

Edit `epi-cli/src/portal/plugins/mod.rs` — add:

```rust
pub mod hexagram;
```

- [ ] **Step 4: Run tests to verify**

Run: `cd epi-cli && cargo test plugins::hexagram -- --nocapture`

Expected: All 5 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add epi-cli/src/portal/plugins/hexagram.rs epi-cli/src/portal/plugins/mod.rs
git commit -m "feat(portal): add M4HexagramPlugin — full-screen I Ching browser

30/70 split layout with scrollable list and detail panel showing trigram
pictograms, names, keywords, judgement text, and body dynamics from
HEXAGRAM_BODY_DYNAMICS. SharedClockState integration for active hexagram."
```

---

### Task 4: Tarot Browser Plugin

**Files:**
- Create: `epi-cli/src/portal/plugins/tarot.rs`
- Modify: `epi-cli/src/portal/plugins/mod.rs`

- [ ] **Step 1: Write the failing test**

Add to the bottom of `epi-cli/src/portal/plugins/tarot.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::nara::tarot_data::Suit;

    #[test]
    fn new_plugin_defaults() {
        let p = M4TarotPlugin::new();
        assert_eq!(p.selected, 0);
        assert_eq!(p.suit_filter, SuitFilter::All);
        assert!(p.selected_card().is_none());
    }

    #[test]
    fn selected_card_after_confirm() {
        let mut p = M4TarotPlugin::new();
        p.confirmed = true;
        // Default selected=0, filter=All, so card_id=0 (The Fool)
        assert_eq!(p.selected_card(), Some((0, false)));
    }

    #[test]
    fn suit_filter_cycles() {
        let mut p = M4TarotPlugin::new();
        assert_eq!(p.suit_filter, SuitFilter::All);
        p.next_filter();
        assert_eq!(p.suit_filter, SuitFilter::OneSuit(Suit::Major));
        p.next_filter();
        assert_eq!(p.suit_filter, SuitFilter::OneSuit(Suit::Wands));
        p.next_filter();
        assert_eq!(p.suit_filter, SuitFilter::OneSuit(Suit::Cups));
        p.next_filter();
        assert_eq!(p.suit_filter, SuitFilter::OneSuit(Suit::Pentacles));
        p.next_filter();
        assert_eq!(p.suit_filter, SuitFilter::OneSuit(Suit::Swords));
        p.next_filter();
        assert_eq!(p.suit_filter, SuitFilter::All);
    }

    #[test]
    fn filtered_cards_all_returns_78() {
        let p = M4TarotPlugin::new();
        assert_eq!(p.filtered_indices().len(), 78);
    }

    #[test]
    fn filtered_cards_major_returns_22() {
        let mut p = M4TarotPlugin::new();
        p.suit_filter = SuitFilter::OneSuit(Suit::Major);
        assert_eq!(p.filtered_indices().len(), 22);
    }

    #[test]
    fn filtered_cards_suit_returns_14() {
        let mut p = M4TarotPlugin::new();
        p.suit_filter = SuitFilter::OneSuit(Suit::Cups);
        assert_eq!(p.filtered_indices().len(), 14);
        p.suit_filter = SuitFilter::OneSuit(Suit::Wands);
        assert_eq!(p.filtered_indices().len(), 14);
        p.suit_filter = SuitFilter::OneSuit(Suit::Pentacles);
        assert_eq!(p.filtered_indices().len(), 14);
        p.suit_filter = SuitFilter::OneSuit(Suit::Swords);
        assert_eq!(p.filtered_indices().len(), 14);
    }

    #[test]
    fn new_with_clock_creates_plugin() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let p = M4TarotPlugin::new_with_clock(clock);
        assert_eq!(p.selected, 0);
    }
}
```

- [ ] **Step 2: Write the plugin struct and methods**

Create `epi-cli/src/portal/plugins/tarot.rs`:

```rust
use crate::nara::tarot_data::{suit_glyph, Suit, THOTH_CARDS};
use crate::nara::oracle::{
    ace_element_lookup, court_sign_lookup, pip_decan_lookup,
};
use crate::portal::clock_state::SharedClockState;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent};
use ratatui_hypertile_extras::HypertilePlugin;

const ZODIAC_NAMES: [&str; 12] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
const PLANET_NAMES: [&str; 10] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
    "Uranus", "Neptune", "Pluto",
];
const ELEMENT_NAMES: [&str; 5] = ["Akasha", "Air", "Fire", "Water", "Earth"];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SuitFilter {
    All,
    OneSuit(Suit),
}

const FILTER_ORDER: [SuitFilter; 6] = [
    SuitFilter::All,
    SuitFilter::OneSuit(Suit::Major),
    SuitFilter::OneSuit(Suit::Wands),
    SuitFilter::OneSuit(Suit::Cups),
    SuitFilter::OneSuit(Suit::Pentacles),
    SuitFilter::OneSuit(Suit::Swords),
];

pub struct M4TarotPlugin {
    selected: usize,       // index into filtered_indices()
    scroll_offset: usize,
    suit_filter: SuitFilter,
    confirmed: bool,
    show_reversed: bool,
    shared_clock: Option<SharedClockState>,
}

impl M4TarotPlugin {
    pub fn new() -> Self {
        Self {
            selected: 0,
            scroll_offset: 0,
            suit_filter: SuitFilter::All,
            confirmed: false,
            show_reversed: false,
            shared_clock: None,
        }
    }

    pub fn new_with_clock(clock: SharedClockState) -> Self {
        let mut s = Self::new();
        s.shared_clock = Some(clock);
        s
    }

    pub fn selected_card(&self) -> Option<(u8, bool)> {
        if self.confirmed {
            let indices = self.filtered_indices();
            indices.get(self.selected).map(|&i| (i as u8, self.show_reversed))
        } else {
            None
        }
    }

    fn filtered_indices(&self) -> Vec<usize> {
        match self.suit_filter {
            SuitFilter::All => (0..78).collect(),
            SuitFilter::OneSuit(suit) => {
                THOTH_CARDS.iter()
                    .enumerate()
                    .filter(|(_, c)| c.suit == suit)
                    .map(|(i, _)| i)
                    .collect()
            }
        }
    }

    fn next_filter(&mut self) {
        let current_idx = FILTER_ORDER.iter().position(|f| *f == self.suit_filter).unwrap_or(0);
        let next_idx = (current_idx + 1) % FILTER_ORDER.len();
        self.suit_filter = FILTER_ORDER[next_idx];
        self.selected = 0;
        self.scroll_offset = 0;
    }

    fn prev_filter(&mut self) {
        let current_idx = FILTER_ORDER.iter().position(|f| *f == self.suit_filter).unwrap_or(0);
        let prev_idx = if current_idx == 0 { FILTER_ORDER.len() - 1 } else { current_idx - 1 };
        self.suit_filter = FILTER_ORDER[prev_idx];
        self.selected = 0;
        self.scroll_offset = 0;
    }

    fn navigate_down(&mut self) {
        let count = self.filtered_indices().len();
        if count == 0 { return; }
        self.selected = (self.selected + 1) % count;
    }

    fn navigate_up(&mut self) {
        let count = self.filtered_indices().len();
        if count == 0 { return; }
        self.selected = if self.selected == 0 { count - 1 } else { self.selected - 1 };
    }

    fn render_filter_tabs(&self, area: Rect, buf: &mut Buffer) {
        let labels = [
            ("All", SuitFilter::All),
            ("✦ Major", SuitFilter::OneSuit(Suit::Major)),
            ("🜂 Wands", SuitFilter::OneSuit(Suit::Wands)),
            ("🜄 Cups", SuitFilter::OneSuit(Suit::Cups)),
            ("🜃 Disks", SuitFilter::OneSuit(Suit::Pentacles)),
            ("🜁 Swords", SuitFilter::OneSuit(Suit::Swords)),
        ];
        let mut spans = Vec::new();
        for (label, filter) in &labels {
            let style = if *filter == self.suit_filter {
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)
            } else {
                Style::default().fg(Color::DarkGray)
            };
            spans.push(Span::styled(format!(" [{}] ", label), style));
        }
        let line = Line::from(spans);
        let para = Paragraph::new(vec![line]);
        Widget::render(para, area, buf);
    }

    fn render_list(&self, area: Rect, buf: &mut Buffer) {
        let indices = self.filtered_indices();
        let visible_rows = area.height.saturating_sub(2) as usize;
        let scroll = if self.selected < self.scroll_offset {
            self.selected
        } else if self.selected >= self.scroll_offset + visible_rows {
            self.selected.saturating_sub(visible_rows - 1)
        } else {
            self.scroll_offset
        };

        let items: Vec<ListItem> = indices.iter()
            .enumerate()
            .skip(scroll)
            .take(visible_rows)
            .map(|(list_idx, &card_idx)| {
                let c = &THOTH_CARDS[card_idx];
                let is_selected = list_idx == self.selected;
                let glyph = suit_glyph(c.suit);
                let text = format!("  {} {}", glyph, c.name);
                let style = if is_selected {
                    Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)
                } else {
                    Style::default().fg(Color::White)
                };
                ListItem::new(Line::from(Span::styled(text, style)))
            })
            .collect();

        let list = List::new(items).block(
            Block::default()
                .title(" Cards ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(list, area, buf);
    }

    fn render_detail(&self, area: Rect, buf: &mut Buffer) {
        let indices = self.filtered_indices();
        if indices.is_empty() { return; }
        let card_idx = indices[self.selected.min(indices.len() - 1)];
        let c = &THOTH_CARDS[card_idx];

        let mut lines: Vec<Line> = Vec::new();

        // ASCII art
        for art_line in c.ascii_art.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", art_line),
                Style::default().fg(Color::White),
            )));
        }
        lines.push(Line::from(""));

        // Title + keyword
        lines.push(Line::from(vec![
            Span::styled(
                format!("  {} ", c.name),
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                format!("— {}", c.thoth_title),
                Style::default().fg(Color::Cyan),
            ),
        ]));
        lines.push(Line::from(vec![
            Span::styled("  Keyword: ", Style::default().fg(Color::DarkGray)),
            Span::styled(c.keyword, Style::default().fg(Color::Green)),
        ]));
        lines.push(Line::from(""));

        // Reversed indicator
        if self.show_reversed {
            lines.push(Line::from(Span::styled(
                "  [REVERSED]",
                Style::default().fg(Color::Red).add_modifier(Modifier::BOLD),
            )));
            lines.push(Line::from(""));
        }

        // Meanings
        let meaning = if self.show_reversed { c.meaning_reversed } else { c.meaning_upright };
        lines.push(Line::from(Span::styled(
            if self.show_reversed { "  Reversed:" } else { "  Upright:" },
            Style::default().fg(Color::DarkGray),
        )));
        let wrap_width = area.width.saturating_sub(6) as usize;
        for chunk in meaning.as_bytes().chunks(wrap_width.max(1)) {
            if let Ok(s) = std::str::from_utf8(chunk) {
                lines.push(Line::from(Span::styled(
                    format!("    {}", s),
                    Style::default().fg(Color::White),
                )));
            }
        }
        lines.push(Line::from(""));

        // Decan/sign/planet attribution (for pips and courts)
        let card_id = c.card_id;
        if card_id >= 22 {
            let suit_idx = ((card_id - 22) / 14) as u8;
            let rank_in_suit = ((card_id - 22) % 14) as u8;

            if rank_in_suit == 0 {
                // Ace
                if let Some(ace) = ace_element_lookup(suit_idx) {
                    lines.push(Line::from(vec![
                        Span::styled("  Element: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(ace.element_name, Style::default().fg(Color::Cyan)),
                    ]));
                }
            } else if rank_in_suit >= 1 && rank_in_suit <= 9 {
                // Pip 2-10 (value = rank_in_suit + 1)
                if let Some(pip) = pip_decan_lookup(suit_idx, rank_in_suit + 1) {
                    let sign = ZODIAC_NAMES.get(pip.zodiac_sign as usize).unwrap_or(&"?");
                    let planet = PLANET_NAMES.get(pip.ruling_planet as usize).unwrap_or(&"?");
                    lines.push(Line::from(vec![
                        Span::styled("  Decan: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(
                            format!("{} decan {} — {}", sign, pip.decan + 1, planet),
                            Style::default().fg(Color::Cyan),
                        ),
                    ]));
                }
            } else if rank_in_suit >= 10 {
                // Court card (10=Princess, 11=Prince, 12=Queen, 13=Knight)
                if let Some(court) = court_sign_lookup(suit_idx, rank_in_suit) {
                    let sign_a = ZODIAC_NAMES.get(court.sign_a as usize).unwrap_or(&"?");
                    if court.sign_b != 0xFF {
                        let sign_b = ZODIAC_NAMES.get(court.sign_b as usize).unwrap_or(&"?");
                        lines.push(Line::from(vec![
                            Span::styled("  Signs: ", Style::default().fg(Color::DarkGray)),
                            Span::styled(
                                format!("{}—{}", sign_a, sign_b),
                                Style::default().fg(Color::Cyan),
                            ),
                        ]));
                    } else {
                        lines.push(Line::from(vec![
                            Span::styled("  Sign: ", Style::default().fg(Color::DarkGray)),
                            Span::styled(sign_a.to_string(), Style::default().fg(Color::Cyan)),
                        ]));
                    }
                }
            }
        }

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(" Detail ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(para, area, buf);
    }
}

impl HypertilePlugin for M4TarotPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let outer_block = Block::default()
            .title(" ✦ Thoth Tarot — 78 Cards ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(theme::pane_border(is_focused)));
        let inner = outer_block.inner(area);
        Widget::render(outer_block, area, buf);

        // Top 1 row for filter tabs, rest for list+detail
        let vert = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Length(1), Constraint::Min(0)])
            .split(inner);

        self.render_filter_tabs(vert[0], buf);

        // 30/70 split for list and detail
        let horiz = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(30), Constraint::Percentage(70)])
            .split(vert[1]);

        self.render_list(horiz[0], buf);
        self.render_detail(horiz[1], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        match event {
            HypertileEvent::Key(key) => {
                use crossterm::event::KeyCode;
                match key.code {
                    KeyCode::Up | KeyCode::Char('k') => {
                        self.navigate_up();
                        EventOutcome::Consumed
                    }
                    KeyCode::Down | KeyCode::Char('j') => {
                        self.navigate_down();
                        EventOutcome::Consumed
                    }
                    KeyCode::Tab => {
                        self.next_filter();
                        EventOutcome::Consumed
                    }
                    KeyCode::BackTab => {
                        self.prev_filter();
                        EventOutcome::Consumed
                    }
                    KeyCode::Char('r') => {
                        self.show_reversed = !self.show_reversed;
                        EventOutcome::Consumed
                    }
                    KeyCode::Enter => {
                        self.confirmed = true;
                        EventOutcome::Consumed
                    }
                    _ => EventOutcome::Ignored,
                }
            }
            _ => EventOutcome::Ignored,
        }
    }
}
```

- [ ] **Step 3: Register the module**

Edit `epi-cli/src/portal/plugins/mod.rs` — add:

```rust
pub mod tarot;
```

- [ ] **Step 4: Run tests to verify**

Run: `cd epi-cli && cargo test plugins::tarot -- --nocapture`

Expected: All 7 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add epi-cli/src/portal/plugins/tarot.rs epi-cli/src/portal/plugins/mod.rs
git commit -m "feat(portal): add M4TarotPlugin — full-screen Thoth Tarot browser

Suit filter tabs (All/Major/Wands/Cups/Disks/Swords), scrollable card list,
detail panel with ASCII art, Thoth titles, keywords, upright/reversed meanings,
and GD decan/sign/planet attributions. SharedClockState integration."
```

---

### Task 5: Plugin Registration & Registry Tests

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`
- Modify: `epi-cli/src/portal/registry.rs`

- [ ] **Step 1: Register both plugins in `register_all_plugins`**

Edit `epi-cli/src/portal/mod.rs`. In the `register_all_plugins` function, add after the `m4.mini_clock` registration block (around line 270):

```rust
    // M4 Hexagram Browser — wire clock state for active hexagram highlight
    {
        let cs = clock_state.clone();
        runtime.register_plugin_type("m4.hexagram", move || {
            let c = cs.clone().unwrap_or_else(new_shared_clock_state);
            plugins::hexagram::M4HexagramPlugin::new_with_clock(c)
        });
    }

    // M4 Tarot Browser — wire clock state for last-draw highlighting
    {
        let cs = clock_state.clone();
        runtime.register_plugin_type("m4.tarot", move || {
            let c = cs.clone().unwrap_or_else(new_shared_clock_state);
            plugins::tarot::M4TarotPlugin::new_with_clock(c)
        });
    }
```

Also add `hexagram, tarot` to the `use plugins::` import line at the top of `register_all_plugins` (line 185):

```rust
    use plugins::{clock, hexagram, m0, m1, m2, m3, m4, m5, mini_clock, shared, spine, tarot, unified_clock};
```

- [ ] **Step 2: Update the registry test expected list**

Edit `epi-cli/src/portal/registry.rs`. Add the two new plugin names to the `expected` vec in `build_registry_has_all_plugins`:

```rust
        let expected = vec![
            "shared.help",
            "shared.status",
            "m0.dashboard",
            "m0.families",
            "m1.walk",
            "m2.vibrational",
            "m3.knowing",
            "m4.identity",
            "m4.flow",
            "m4.oracle",
            "m4.medicine",
            "m4.transform",
            "m4.lens",
            "m4.pratibimba",
            "m4.hexagram",
            "m4.tarot",
            "m5.logos",
            "m5.chat",
            "m5.fsm",
        ];
```

- [ ] **Step 3: Run all portal tests**

Run: `cd epi-cli && cargo test portal -- --nocapture`

Expected: All existing tests pass plus the new registry test includes both plugins. `can_instantiate_all_plugins` should also pass for both new plugins.

- [ ] **Step 4: Commit**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add epi-cli/src/portal/mod.rs epi-cli/src/portal/registry.rs
git commit -m "feat(portal): register m4.hexagram and m4.tarot plugins

Both wired with SharedClockState. Registry test updated to expect 19 plugins."
```

---

### Task 6: Asset Pipeline — RWS Image Fetch & ASCII Conversion

**Files:**
- Create: `tools/build_tarot_ascii.py`

This task creates the one-shot build script. Running it is a separate manual step.

- [ ] **Step 1: Write the asset pipeline script**

Create `tools/build_tarot_ascii.py`:

```python
#!/usr/bin/env python3
"""
Fetch Rider-Waite-Smith tarot card images from metabismuth/tarot-json
and convert each to ASCII art using ascii-image-converter.

Outputs a Rust source fragment (tarot_ascii_art.rs) with 78 const &str blocks.

Prerequisites:
  - git (to clone the image repo)
  - ascii-image-converter (https://github.com/TheZoraworX/ascii-image-converter)
    Install: brew install ascii-image-converter  (macOS)

Usage:
  python3 tools/build_tarot_ascii.py [--width 40] [--braille]
"""

import argparse
import os
import subprocess
import sys
import tempfile
import json

# RWS card filenames from metabismuth/tarot-json map to our card_id encoding.
# metabismuth uses: major/ar{NN}.jpg, cups/cu{NN}.jpg, wands/wa{NN}.jpg,
#                    pentacles/pe{NN}.jpg, swords/sw{NN}.jpg
# Our encoding: 0-21 Major, 22-35 Cups, 36-49 Wands, 50-63 Pentacles, 64-77 Swords
# Within each minor suit: Ace=0, 2-10=1-9, Page(Princess)=10, Knight(Prince)=11, Queen=12, King=13

REPO_URL = "https://github.com/metabismuth/tarot-json.git"

def card_id_to_path(card_id: int) -> str:
    """Map our 0-77 card_id to the expected image path in the cloned repo."""
    if card_id < 22:
        # Major Arcana: cards/major/ar{NN}.jpg where NN is 01-22
        # card_id 0 = The Fool = ar01 (or ar00 in some sets)
        return f"cards/major/ar{card_id:02d}.jpg"
    else:
        suits = [("cups", "cu"), ("wands", "wa"), ("pentacles", "pe"), ("swords", "sw")]
        suit_idx = (card_id - 22) // 14
        rank = (card_id - 22) % 14
        suit_dir, suit_prefix = suits[suit_idx]
        # Ace=01, 2=02, ..., 10=10, Page=11, Knight=12, Queen=13, King=14
        rws_num = rank + 1
        return f"cards/{suit_dir}/{suit_prefix}{rws_num:02d}.jpg"


def convert_image(image_path: str, width: int, braille: bool) -> str:
    """Convert an image to ASCII art string using ascii-image-converter."""
    cmd = ["ascii-image-converter", image_path, "-W", str(width)]
    if braille:
        cmd.append("-b")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  WARNING: Failed to convert {image_path}: {result.stderr.strip()}", file=sys.stderr)
        return f"(conversion failed for {os.path.basename(image_path)})"
    return result.stdout.rstrip()


def escape_rust_str(s: str) -> str:
    """Escape a string for embedding in Rust source as a raw string literal."""
    # Use raw string if no backslashes, otherwise escape
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main():
    parser = argparse.ArgumentParser(description="Generate Tarot ASCII art Rust source")
    parser.add_argument("--width", type=int, default=40, help="ASCII art width in columns")
    parser.add_argument("--braille", action="store_true", help="Use braille character mode")
    parser.add_argument("--output", default="epi-cli/src/nara/tarot_ascii_art.rs",
                        help="Output Rust file path")
    parser.add_argument("--repo-dir", default=None,
                        help="Path to already-cloned metabismuth/tarot-json repo")
    args = parser.parse_args()

    # Clone or use existing repo
    if args.repo_dir:
        repo_dir = args.repo_dir
    else:
        repo_dir = os.path.join(tempfile.gettempdir(), "tarot-json")
        if not os.path.exists(repo_dir):
            print(f"Cloning {REPO_URL} to {repo_dir}...")
            subprocess.run(["git", "clone", "--depth", "1", REPO_URL, repo_dir], check=True)
        else:
            print(f"Using cached repo at {repo_dir}")

    # Check ascii-image-converter exists
    if subprocess.run(["which", "ascii-image-converter"], capture_output=True).returncode != 0:
        print("ERROR: ascii-image-converter not found. Install with: brew install ascii-image-converter",
              file=sys.stderr)
        sys.exit(1)

    # Convert all 78 cards
    art_blocks = []
    for card_id in range(78):
        rel_path = card_id_to_path(card_id)
        img_path = os.path.join(repo_dir, rel_path)

        if not os.path.exists(img_path):
            print(f"  Card {card_id}: image not found at {img_path}, using placeholder")
            art_blocks.append(f"(image not found: {rel_path})")
            continue

        print(f"  Converting card {card_id}: {rel_path}...")
        ascii_art = convert_image(img_path, args.width, args.braille)
        art_blocks.append(ascii_art)

    # Generate Rust source
    print(f"\nWriting {args.output}...")
    with open(args.output, "w") as f:
        f.write("//! Auto-generated Tarot ASCII art from RWS public domain images.\n")
        f.write("//! Generated by tools/build_tarot_ascii.py — do not edit manually.\n\n")

        for card_id, art in enumerate(art_blocks):
            f.write(f'pub const CARD_{card_id:02d}_ART: &str = r#"\n')
            f.write(art)
            f.write('\n"#;\n\n')

        # Generate the lookup array
        f.write("/// ASCII art for all 78 cards, indexed by card_id.\n")
        f.write("pub static TAROT_ASCII_ART: [&str; 78] = [\n")
        for card_id in range(78):
            f.write(f"    CARD_{card_id:02d}_ART,\n")
        f.write("];\n")

    print(f"Done! {len(art_blocks)} cards written to {args.output}")
    print(f"\nNext steps:")
    print(f"  1. Review the generated art visually")
    print(f"  2. Update tarot_data.rs to use TAROT_ASCII_ART[card_id] instead of placeholders")
    print(f"  3. Add 'pub mod tarot_ascii_art;' to nara/mod.rs")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify the script syntax**

Run: `python3 -c "import ast; ast.parse(open('tools/build_tarot_ascii.py').read()); print('OK')"`

Expected: `OK`

- [ ] **Step 3: Commit the pipeline script**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add tools/build_tarot_ascii.py
git commit -m "feat(tools): add RWS tarot image → ASCII art build script

One-shot pipeline: clones metabismuth/tarot-json, converts 78 public domain
RWS card images to ASCII via ascii-image-converter, outputs Rust source with
static &str art blocks. Run manually, not part of cargo build."
```

---

### Task 7: Run Asset Pipeline & Integrate ASCII Art

**Files:**
- Create: `epi-cli/src/nara/tarot_ascii_art.rs` (auto-generated)
- Modify: `epi-cli/src/nara/tarot_data.rs`
- Modify: `epi-cli/src/nara/mod.rs`

This task is manual — requires `ascii-image-converter` installed and network access.

- [ ] **Step 1: Install ascii-image-converter if needed**

Run: `brew install ascii-image-converter` (or check `which ascii-image-converter`)

- [ ] **Step 2: Run the build script**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments && python3 tools/build_tarot_ascii.py --width 40`

Expected: 78 cards converted, output written to `epi-cli/src/nara/tarot_ascii_art.rs`

If braille mode looks better: `python3 tools/build_tarot_ascii.py --width 40 --braille`

- [ ] **Step 3: Register the generated module**

Edit `epi-cli/src/nara/mod.rs` — add:

```rust
pub mod tarot_ascii_art;
```

- [ ] **Step 4: Wire ASCII art into tarot_data.rs**

Edit `epi-cli/src/nara/tarot_data.rs`. Replace each card's `ascii_art: PLACEHOLDER_*` with:

```rust
    ascii_art: crate::nara::tarot_ascii_art::TAROT_ASCII_ART[0],  // The Fool
```

Or more cleanly, change the `THOTH_CARDS` static to reference the generated art array. Add at the top of the file:

```rust
use crate::nara::tarot_ascii_art::TAROT_ASCII_ART;
```

Then for each entry, replace `ascii_art: PLACEHOLDER_MAJOR` (etc.) with `ascii_art: TAROT_ASCII_ART[N]` where N is the card_id.

**Note:** Since `static` arrays can't index another `static` array at compile time, the simplest approach is to replace each placeholder constant reference with the corresponding generated constant:

```rust
    ascii_art: crate::nara::tarot_ascii_art::CARD_00_ART,  // card 0
    ascii_art: crate::nara::tarot_ascii_art::CARD_01_ART,  // card 1
    // etc.
```

- [ ] **Step 5: Run tests**

Run: `cd epi-cli && cargo test tarot -- --nocapture`

Expected: All tarot tests pass, including `ascii_art_placeholder_present` (now has real art).

- [ ] **Step 6: Visual review**

Run the portal and open the tarot plugin to visually inspect all 78 cards. Note any that need manual adjustment (too dark, too noisy, lost detail).

- [ ] **Step 7: Commit**

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments
git add epi-cli/src/nara/tarot_ascii_art.rs epi-cli/src/nara/tarot_data.rs epi-cli/src/nara/mod.rs
git commit -m "feat(nara): integrate RWS ASCII art into 78 Thoth card entries

Auto-generated from public domain 1909 Rider-Waite-Smith card images via
ascii-image-converter. Each card now has a ~40x50 char ASCII art block."
```

---

### Task 8: Full Integration Test

**Files:**
- No new files — just run existing + new tests together

- [ ] **Step 1: Run the full test suite**

Run: `cd epi-cli && cargo test -- --nocapture 2>&1 | tail -30`

Expected: All tests pass including:
- `hexagram_data::tests::*` (10 tests)
- `tarot_data::tests::*` (7 tests)
- `plugins::hexagram::tests::*` (5 tests)
- `plugins::tarot::tests::*` (7 tests)
- `portal::registry::tests::build_registry_has_all_plugins` (19 plugins)
- `portal::registry::tests::can_instantiate_all_plugins`
- All pre-existing tests

- [ ] **Step 2: Quick smoke test in portal**

Run: `cd epi-cli && cargo run -- portal --reset`

Then:
1. Press `Alt+p` to open command palette
2. Type `m4.hexagram` → Enter → verify hexagram browser renders
3. Press `Alt+p` again, type `m4.tarot` → verify tarot browser renders
4. Navigate with Up/Down, Tab for suit filter, `r` for reversed toggle
5. `q` to quit

- [ ] **Step 3: Final commit (if any tweaks needed)**

```bash
git add -A
git commit -m "fix(portal): integration adjustments for oracle browser plugins"
```

---

## Task Dependency Graph

```
Task 1 (hexagram_data) ─────────────────────────────┐
                                                      ├─→ Task 5 (registration) ─→ Task 8 (integration)
Task 2 (tarot_data) ──→ Task 6 (pipeline) ──→ Task 7 │
                                                      │
Task 3 (hexagram plugin) ────────────────────────────┘
                                                      │
Task 4 (tarot plugin) ───────────────────────────────┘
```

Tasks 1-4 can be parallelized: Tasks 1+2 (data modules) are independent, and Tasks 3+4 (plugins) depend only on their respective data module. Task 5 (registration) depends on Tasks 3+4. Task 6 (pipeline script) depends on nothing. Task 7 (ASCII integration) depends on Tasks 2+6. Task 8 depends on all.
