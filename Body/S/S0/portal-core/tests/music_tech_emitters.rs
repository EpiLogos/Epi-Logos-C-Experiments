//! 03.T3.7 -- production M2 maqam emitters over every compiled mode.

use portal_core::music_tech::{
    mts_bulk_tuning_dump, quarter_tone_to_mpe, scala_scl, MpeNote, MAQAM_COUNT,
    MTS_PROGRAM_NAME_MAX,
};

const ROOT_MIDI: u8 = 60;
const ROOT_HZ: f64 = 261.625_565;

fn mts_frequency_at(dump: &[u8], note: usize) -> f64 {
    let table_start = 6 + MTS_PROGRAM_NAME_MAX;
    let offset = table_start + note * 3;
    let coarse = dump[offset] as f64;
    let fine = ((dump[offset + 1] as u16) << 7 | dump[offset + 2] as u16) as f64;
    let midi = coarse + fine / 16_384.0;
    440.0 * 2f64.powf((midi - 69.0) / 12.0)
}

#[test]
fn every_compiled_maqam_mode_emits_distinct_member_channels_and_a_complete_scala_octave() {
    for mode in 0..MAQAM_COUNT {
        let notes = MpeNote::maqam_octave(ROOT_MIDI, mode, 100);
        assert_eq!(notes.len(), 8, "mode {mode}");
        assert_eq!(
            notes.iter().map(|note| note.channel).collect::<Vec<_>>(),
            (1..=8).collect::<Vec<_>>(),
            "mode {mode} must give each sounding note its own MPE member channel"
        );
        assert!(notes.iter().all(|note| note.pitch_bend <= 16_383));

        let scl = scala_scl(mode);
        let entries = scl
            .lines()
            .filter(|line| !line.is_empty() && !line.starts_with('!'))
            .collect::<Vec<_>>();
        assert_eq!(entries[0].trim(), "7", "mode {mode}");
        assert_eq!(
            entries.len(),
            8,
            "mode {mode} must include its octave entry"
        );
        assert_eq!(entries[7].trim(), "1200.000000", "mode {mode}");
    }
}

#[test]
fn quarter_tone_mpe_bends_respect_the_declared_member_range() {
    assert_eq!(quarter_tone_to_mpe(ROOT_MIDI, 1), (ROOT_MIDI, 8_277));
    assert_eq!(quarter_tone_to_mpe(ROOT_MIDI, 3), (ROOT_MIDI + 1, 8_277));
}

#[test]
fn mts_dump_is_a_128_key_table_and_repeats_the_selected_scale_each_octave() {
    let dump = mts_bulk_tuning_dump(0, 0, "Rast", ROOT_MIDI, ROOT_HZ, 9);
    assert_eq!(dump[0..6], [0xF0, 0x7E, 0x00, 0x08, 0x01, 0x00]);
    assert_eq!(dump.len(), 6 + MTS_PROGRAM_NAME_MAX + 128 * 3 + 1);
    assert_eq!(dump[dump.len() - 1], 0xF7);
    assert!((mts_frequency_at(&dump, ROOT_MIDI as usize) - ROOT_HZ).abs() < 0.03);
    assert!((mts_frequency_at(&dump, ROOT_MIDI as usize + 12) - ROOT_HZ * 2.0).abs() < 0.06);
}
