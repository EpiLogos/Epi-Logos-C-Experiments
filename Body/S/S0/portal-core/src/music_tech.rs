//! Coordinate: S0 M2' (music-tech emitter -- Track 03.T3.7)
//! Residency: Body/S/S0/portal-core/src
//! Position (#n): #2 -- operation: compiled maqam interval patterns become
//!   interoperable MPE, MIDI Tuning Standard, and Scala representations.
//! Actualises: deterministic M2 maqam emission over the 72 compiled 24-TET
//!   interval patterns mirrored from [[M2_MAQAM_DESC]].
//! Public surface: MAQAM_*, MpeNote, quarter_tone_to_mpe,
//!   mts_single_note_tuning, mts_bulk_tuning_dump, scala_scl,
//!   maqam_family_for_mode, mode_in_family.
//! Does NOT own: maqam interval genesis ([[epi-lib]] `M2_MAQAM_DESC`), MIDI
//!   device I/O, gateway dispatch, renderer audio, or personal tuning policy.
//! Contract: [[M2'-SPEC]] + [[M2-ARCHITECTURE]] + 03.T3.7.
//!
//! M2_MAQAM_DESC[72] interval patterns (24-TET quarter-tone units) live in
//! epi-lib's `m2.c` as .rodata. This module mirrors the compiled patterns and
//! emits them in three standard music-technology interchange formats.
//!
//! ## Formats
//!
//! - **MPE** (MIDI Polyphonic Expression): per-note 14-bit pitch-bend messages.
//!   Each note in a maqam scale gets a bend that snaps its 12-TET MIDI note to the
//!   correct 24-TET microtone.
//!
//! - **MTS-ESP** (MIDI Tuning Standard, ESP flavour): a bulk tuning Sysex message
//!   that loads a full 72-note tuning table into a compatible soft-synth (Pianoteq,
//!   Kontakt MTS-ESP client, etc.).
//!
//! - **Scala** (.scl): the standard plain-text microtonal-scale format.  Each maqam
//!   family produces a 7-note (plus octave) `.scl` file.

// ──────────────────────────────────────────────
//  §1 — Mirror of M2_MAQAM_DESC[72] interval patterns
// ──────────────────────────────────────────────

/// Number of maqam modes (9 families × variable sizes = 72).
pub const MAQAM_COUNT: usize = 72;

/// Number of interval steps per maqam mode (7-note diatonic scaffold).
pub const MAQAM_STEPS: usize = 7;

/// 24-TET quarter-tone units per octave.
pub const QUARTER_TONES_PER_OCTAVE: u16 = 24;

/// MIDI note range for MTS-ESP tuning table.
pub const MTS_TUNING_TABLE_SIZE: usize = 128;

/// Family names in display order.
pub const MAQAM_FAMILY_NAMES: [&str; 10] = [
    "Independent",
    "Rast",
    "Bayati",
    "Sikah",
    "Hijaz",
    "Nahawand",
    "Ajam",
    "Kurd",
    "Saba",
    "Nawa Athar",
];

/// Family start indices into MAQAM_MODES (matches C MAQAM_RANGES).
pub const MAQAM_FAMILY_STARTS: [usize; 10] = [0, 9, 17, 25, 30, 37, 45, 51, 58, 67];

/// Family lengths.
pub const MAQAM_FAMILY_LENGTHS: [usize; 10] = [9, 8, 8, 5, 7, 8, 6, 7, 9, 5];

/// Interval patterns in quarter-tone units (24-TET).
/// Copied verbatim from `Body/S/S0/epi-lib/src/m2.c:430-513`.
#[rustfmt::skip]
pub const MAQAM_MODES: [[u8; MAQAM_STEPS]; MAQAM_COUNT] = [
    // Family 0 — Independent (9)
    [4, 3, 3, 4, 3, 3, 4],
    [3, 4, 3, 3, 4, 3, 4],
    [4, 3, 4, 3, 3, 4, 3],
    [3, 3, 4, 4, 3, 3, 4],
    [4, 4, 3, 3, 4, 3, 3],
    [3, 4, 4, 3, 3, 4, 3],
    [4, 3, 3, 4, 4, 3, 3],
    [3, 3, 4, 3, 4, 4, 3],
    [3, 4, 3, 4, 3, 4, 3],
    // Family 1 — Rast (8)
    [4, 3, 3, 4, 4, 3, 3],
    [3, 3, 4, 4, 3, 3, 4],
    [3, 4, 4, 3, 3, 4, 3],
    [4, 4, 3, 3, 4, 3, 3],
    [4, 3, 3, 4, 3, 3, 4],
    [3, 3, 4, 3, 3, 4, 4],
    [3, 4, 3, 3, 4, 4, 3],
    [4, 3, 3, 4, 4, 3, 3],
    // Family 2 — Bayati (8)
    [3, 3, 4, 4, 3, 4, 3],
    [3, 4, 4, 3, 4, 3, 3],
    [4, 4, 3, 4, 3, 3, 3],
    [4, 3, 4, 3, 3, 3, 4],
    [3, 4, 3, 3, 3, 4, 4],
    [4, 3, 3, 3, 4, 4, 3],
    [3, 3, 3, 4, 4, 3, 4],
    [3, 3, 4, 4, 3, 4, 3],
    // Family 3 — Sikah (5)
    [3, 4, 3, 4, 3, 4, 3],
    [4, 3, 4, 3, 4, 3, 3],
    [3, 4, 3, 4, 3, 3, 4],
    [4, 3, 4, 3, 3, 4, 3],
    [3, 4, 3, 3, 4, 3, 4],
    // Family 4 — Hijaz (7)
    [2, 6, 2, 4, 2, 6, 2],
    [6, 2, 4, 2, 6, 2, 2],
    [2, 4, 2, 6, 2, 2, 6],
    [4, 2, 6, 2, 2, 6, 2],
    [2, 6, 2, 2, 6, 2, 4],
    [6, 2, 2, 6, 2, 4, 2],
    [2, 2, 6, 2, 4, 2, 6],
    // Family 5 — Nahawand (8)
    [4, 2, 4, 4, 2, 4, 4],
    [2, 4, 4, 2, 4, 4, 4],
    [4, 4, 2, 4, 4, 4, 2],
    [4, 2, 4, 4, 4, 2, 4],
    [2, 4, 4, 4, 2, 4, 4],
    [4, 4, 4, 2, 4, 4, 2],
    [4, 4, 2, 4, 4, 2, 4],
    [4, 2, 4, 4, 2, 4, 4],
    // Family 6 — Ajam (6)
    [4, 4, 2, 4, 4, 4, 2],
    [4, 2, 4, 4, 4, 2, 4],
    [2, 4, 4, 4, 2, 4, 4],
    [4, 4, 4, 2, 4, 4, 2],
    [4, 4, 2, 4, 4, 2, 4],
    [4, 2, 4, 4, 2, 4, 4],
    // Family 7 — Kurd (7)
    [2, 4, 4, 4, 2, 4, 4],
    [4, 4, 4, 2, 4, 4, 2],
    [4, 4, 2, 4, 4, 2, 4],
    [4, 2, 4, 4, 2, 4, 4],
    [2, 4, 4, 2, 4, 4, 4],
    [4, 4, 2, 4, 4, 4, 2],
    [4, 2, 4, 4, 4, 2, 4],
    // Family 8 — Saba (9)
    [3, 3, 2, 6, 2, 4, 4],
    [3, 2, 6, 2, 4, 4, 3],
    [2, 6, 2, 4, 4, 3, 3],
    [6, 2, 4, 4, 3, 3, 2],
    [2, 4, 4, 3, 3, 2, 6],
    [4, 4, 3, 3, 2, 6, 2],
    [4, 3, 3, 2, 6, 2, 4],
    [3, 3, 2, 6, 2, 4, 4],
    [3, 2, 6, 2, 4, 4, 3],
    // Family 9 — Nawa Athar (5)
    [2, 6, 2, 4, 2, 6, 2],
    [6, 2, 4, 2, 6, 2, 2],
    [2, 4, 2, 6, 2, 2, 6],
    [4, 2, 6, 2, 2, 6, 2],
    [2, 6, 2, 2, 6, 2, 4],
];

// ──────────────────────────────────────────────
//  §2 — Interval helpers
// ──────────────────────────────────────────────

/// Cumulative quarter-tone position for each step in a mode (0 → octave).
pub fn cumulative_positions(mode: &[u8; MAQAM_STEPS]) -> [u16; MAQAM_STEPS + 1] {
    let mut pos = [0u16; MAQAM_STEPS + 1];
    let mut acc: u16 = 0;
    for i in 0..MAQAM_STEPS {
        acc += mode[i] as u16;
        pos[i + 1] = acc;
    }
    pos
}

/// Convert a quarter-tone position (0..24) to a 14-bit MIDI pitch-bend value.
///
/// Maps 24-TET to 12-TET MIDI note + pitch bend.  Each 12-TET semitone spans
/// 2 quarter-tones.  The quarter-tone offset determines the bend amount.
///
/// Returns `(midi_note_offset, pitch_bend_14bit)` where `midi_note_offset` is
/// the number of semitones above the root, and `pitch_bend_14bit` is the bend
/// within that semitone (8192 = centre, 0 = flat, 16383 = sharp).
pub fn quarter_tone_to_mpe(root_midi: u8, qt_position: u16) -> (u8, u16) {
    let semitone_offset = (qt_position / 2) as u8;
    let bend = if qt_position % 2 == 0 {
        MIDI_PITCH_BEND_CENTER
    } else {
        // A quarter-tone is +0.5 semitones from the lower chromatic key. MPE
        // member channels default to a +/-48-semitone bend range.
        MIDI_PITCH_BEND_CENTER + MIDI_PITCH_BEND_CENTER / (2 * MPE_BEND_RANGE_SEMITONES as u16)
    };

    (root_midi.saturating_add(semitone_offset), bend)
}

// ──────────────────────────────────────────────
//  §3 — MPE (MIDI Polyphonic Expression)
// ──────────────────────────────────────────────

/// A single MPE note-on message with per-note pitch bend.
#[derive(Debug, Clone, PartialEq)]
pub struct MpeNote {
    /// MIDI channel (0–15).
    pub channel: u8,
    /// MIDI note number (0–127).
    pub note: u8,
    /// 14-bit pitch bend value (0–16383, centre = 8192).
    pub pitch_bend: u16,
    /// Velocity (0–127).
    pub velocity: u8,
}

/// MPE pitch-bend range in semitones (±48 is the MPE spec default).
pub const MPE_BEND_RANGE_SEMITONES: u8 = 48;

const MIDI_PITCH_BEND_CENTER: u16 = 8_192;

fn normalized_mode_index(mode_index: usize) -> usize {
    mode_index % MAQAM_COUNT
}

impl MpeNote {
    /// Generate MPE note-on + pitch-bend messages for an entire maqam mode
    /// rooted at `root_midi`, cycling up the octave.
    pub fn maqam_octave(root_midi: u8, mode_index: usize, velocity: u8) -> Vec<MpeNote> {
        let mode = &MAQAM_MODES[normalized_mode_index(mode_index)];
        let cumulative = cumulative_positions(mode);

        let mut notes = Vec::with_capacity(MAQAM_STEPS + 1);
        for step in 0..=MAQAM_STEPS {
            let qt = cumulative[step];
            let (note, bend) = quarter_tone_to_mpe(root_midi, qt);
            notes.push(MpeNote {
                // Channel 0 is the MPE manager; every note occupies a member
                // channel so its pitch bend remains independently addressable.
                channel: (step + 1) as u8,
                note,
                pitch_bend: bend,
                velocity,
            });
        }
        notes
    }

    /// Format as a 3-byte MIDI pitch-bend message for Sysex / raw output.
    pub fn to_pitch_bend_bytes(&self) -> [u8; 3] {
        let status = 0xE0 | (self.channel & 0x0F);
        let lsb = (self.pitch_bend & 0x7F) as u8;
        let msb = ((self.pitch_bend >> 7) & 0x7F) as u8;
        [status, lsb, msb]
    }

    /// Format as a 3-byte MIDI note-on message.
    pub fn to_note_on_bytes(&self) -> [u8; 3] {
        let status = 0x90 | (self.channel & 0x0F);
        [status, self.note & 0x7F, self.velocity & 0x7F]
    }
}

// ──────────────────────────────────────────────
//  §4 — MTS-ESP (MIDI Tuning Standard)
// ──────────────────────────────────────────────

/// MTS-ESP tuning program name (max 16 ASCII chars).
pub const MTS_PROGRAM_NAME_MAX: usize = 16;

/// Build a full MTS-ESP single-note tuning change (real-time) Sysex message.
///
/// Format: `F0 7F <device> 08 02 <tuningProgram> <noteCount> [<note> <freqData>]... F7`
/// This is the *Single Note Tuning Change* (sub-ID 02) per MMA RP-018.
pub fn mts_single_note_tuning(
    device_id: u8,
    tuning_program: u8,
    note: u8,
    freq_hz: f64,
) -> Vec<u8> {
    let freq_encoded = mts_encode_frequency(freq_hz);
    vec![
        0xF0,
        0x7F,
        device_id & 0x7F,
        0x08,
        0x02,
        tuning_program & 0x7F,
        1, // one note
        note & 0x7F,
        freq_encoded[0],
        freq_encoded[1],
        freq_encoded[2],
        0xF7,
    ]
}

/// Build a full MTS bulk tuning dump Sysex message (sub-ID 01).
///
/// Writes all 128 MIDI notes with their frequencies. Notes not in the maqam
/// scale are tuned to 12-TET. Maqam notes are tuned to the 24-TET intervals
/// relative to the given root frequency.
pub fn mts_bulk_tuning_dump(
    device_id: u8,
    tuning_program: u8,
    tuning_name: &str,
    root_midi: u8,
    root_freq_hz: f64,
    mode_index: usize,
) -> Vec<u8> {
    let mode = &MAQAM_MODES[normalized_mode_index(mode_index)];
    let cumulative = cumulative_positions(mode);

    // Build a 128-entry frequency table
    let mut freq_table: [f64; 128] = [0.0; 128];
    for midi_note in 0u8..128 {
        let requested_qt = (i32::from(midi_note) - i32::from(root_midi)) * 2;
        let scale_qt = nearest_scale_position(&cumulative, requested_qt);
        freq_table[midi_note as usize] = root_freq_hz * 2f64.powf(scale_qt as f64 / 24.0);
    }

    let mut msg = vec![
        0xF0,
        0x7E,
        device_id & 0x7F,
        0x08,
        0x01,
        tuning_program & 0x7F,
    ];

    // Tuning name (16 chars max)
    let name_bytes: Vec<u8> = tuning_name
        .chars()
        .take(MTS_PROGRAM_NAME_MAX)
        .map(|c| if c.is_ascii() { c as u8 } else { b'?' })
        .collect();
    let name_padded = {
        let mut n = name_bytes;
        n.resize(MTS_PROGRAM_NAME_MAX, 0x20); // space-pad
        n
    };
    msg.extend_from_slice(&name_padded);

    // 128 key-based tuning values (3 bytes each). The key index is implicit
    // in table order for an MTS bulk dump.
    for midi_note in 0u8..128 {
        let freq_encoded = mts_encode_frequency(freq_table[midi_note as usize]);
        msg.extend_from_slice(&freq_encoded);
    }
    msg.push(0xF7);

    msg
}

/// Encode a frequency (Hz) into 3-byte MTS format per RP-018 §3.
///
/// Byte 0: coarse (MIDI note number equivalent)
/// Byte 1-2: fine (fraction within semitone, 14-bit)
fn mts_encode_frequency(freq_hz: f64) -> [u8; 3] {
    if freq_hz <= 0.0 {
        return [0, 0, 0];
    }
    // Compute MIDI note number (floating point)
    let midi_float = 69.0 + 12.0 * (freq_hz / 440.0).log2();
    let coarse = (midi_float.floor() as i32).clamp(0, 127) as u8;
    let fraction = midi_float - midi_float.floor();
    // 14-bit fraction: 0 = 0 cents, 16383 = 100 cents
    let fine = (fraction * 16384.0) as u16;
    [coarse, ((fine >> 7) & 0x7F) as u8, (fine & 0x7F) as u8]
}

// ──────────────────────────────────────────────
//  §5 — Scala (.scl) format
// ──────────────────────────────────────────────

/// Produce the text content of a Scala `.scl` file for a maqam mode.
///
/// Scala format: first line is a description, second line is the number of notes,
/// then each line is a ratio or cents value, including the octave entry.
pub fn scala_scl(mode_index: usize) -> String {
    let mode_index = normalized_mode_index(mode_index);
    let mode = &MAQAM_MODES[mode_index];
    let cumulative = cumulative_positions(mode);
    let family_index = maqam_family_for_mode(mode_index);
    let family_name = MAQAM_FAMILY_NAMES[family_index];
    let mode_in_family = mode_index - MAQAM_FAMILY_STARTS[family_index];

    let mut scl = format!(
        "! Maqam {} — {} mode {}\n! 24-TET quarter-tone intervals\n {}\n!\n",
        family_name,
        family_name,
        mode_in_family + 1,
        MAQAM_STEPS,
    );

    // Scala lists every non-unison scale degree, including the octave.
    for i in 1..=MAQAM_STEPS {
        let qt = cumulative[i];
        let cents = (qt as f64 * 100.0) / 2.0; // 24-TET: each quarter-tone = 50 cents
        scl.push_str(&format!("  {:.6}\n", cents));
    }

    scl
}

/// Return the maqam family index (0–9) for a given mode index (0–71).
pub fn maqam_family_for_mode(mode_index: usize) -> usize {
    let mode_index = normalized_mode_index(mode_index);
    for (i, &start) in MAQAM_FAMILY_STARTS.iter().enumerate().rev() {
        if mode_index >= start {
            return i;
        }
    }
    0
}

/// Return the mode-within-family index (0-based).
pub fn mode_in_family(mode_index: usize) -> usize {
    let mode_index = normalized_mode_index(mode_index);
    let family = maqam_family_for_mode(mode_index);
    mode_index - MAQAM_FAMILY_STARTS[family]
}

fn nearest_scale_position(cumulative: &[u16; MAQAM_STEPS + 1], requested_qt: i32) -> i32 {
    let octave = requested_qt.div_euclid(i32::from(QUARTER_TONES_PER_OCTAVE));
    let within_octave = requested_qt.rem_euclid(i32::from(QUARTER_TONES_PER_OCTAVE));
    let nearest = cumulative
        .iter()
        .copied()
        .min_by_key(|position| (i32::from(*position) - within_octave).abs())
        .expect("a maqam octave always has its root");
    octave * i32::from(QUARTER_TONES_PER_OCTAVE) + i32::from(nearest)
}

// ──────────────────────────────────────────────
//  §6 — Tests
// ──────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cumulative_sums_to_24() {
        for mode_idx in 0..MAQAM_COUNT {
            let cumulative = cumulative_positions(&MAQAM_MODES[mode_idx]);
            assert_eq!(
                cumulative[MAQAM_STEPS], 24,
                "Mode {} does not sum to 24 quarter-tones (octave invariant)",
                mode_idx
            );
        }
    }

    #[test]
    fn rast_rooted_at_c4_mpe() {
        let notes = MpeNote::maqam_octave(60, 9, 100); // Rast mode 1 (index 9 = family 1, mode 0)
        assert_eq!(notes.len(), 8);
        assert_eq!(notes[0].note, 60);
        assert_eq!(notes[0].pitch_bend, 8192);
        // Rast interval[0] = 4 qt = 2 semitones → note 62, centre bend
        assert_eq!(notes[1].note, 62);
        assert_eq!(notes[1].pitch_bend, 8192);
    }

    #[test]
    fn hijaz_quarter_flat() {
        // Hijaz mode 0 (index 30): intervals [2,6,2,4,2,6,2]
        // Step 1: 2 qt = 1 semitone, no bend
        // Step 2: cumulative 8 qt = 4 semitones, no bend
        let notes = MpeNote::maqam_octave(60, 30, 100);
        assert_eq!(notes[2].note, 64); // 4 semitones up = E4
        assert_eq!(notes[2].pitch_bend, 8192);
    }

    #[test]
    fn scl_format() {
        let scl = scala_scl(9); // Rast
        assert!(scl.contains("Rast — Rast mode 1"));
        assert!(scl.contains("7"));
    }

    #[test]
    fn mts_bulk_contains_all_128_notes() {
        let dump = mts_bulk_tuning_dump(0, 0, "Rast", 60, 261.63, 9);
        // F0 7E 00 08 01 00 [16-byte name] [128×3 tuning values] F7.
        let expected_len = 1 + 1 + 1 + 1 + 1 + 1 + 16 + 128 * 3 + 1;
        assert_eq!(dump.len(), expected_len);
        assert_eq!(dump[0], 0xF0);
        // The last byte before F7 is checksum
        assert_eq!(dump[dump.len() - 1], 0xF7);
    }

    #[test]
    fn freq_encode_a440() {
        let encoded = mts_encode_frequency(440.0);
        assert_eq!(encoded[0], 69); // MIDI note 69 = A4
    }

    #[test]
    fn family_index_ranges() {
        assert_eq!(maqam_family_for_mode(0), 0);
        assert_eq!(maqam_family_for_mode(8), 0);
        assert_eq!(maqam_family_for_mode(9), 1);
        assert_eq!(maqam_family_for_mode(16), 1);
        assert_eq!(maqam_family_for_mode(71), 9);
    }

    #[test]
    fn mode_in_family_values() {
        assert_eq!(mode_in_family(0), 0);
        assert_eq!(mode_in_family(9), 0); // first Rast
        assert_eq!(mode_in_family(16), 7); // last Rast
        assert_eq!(mode_in_family(71), 4); // last Nawa Athar
    }
}
