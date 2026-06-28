use serde::{Deserialize, Serialize};

use super::super::{mirror_square, note_name, pitch_class_for_tick};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeChromaticProfile {
    pub position: u8,
    pub pitch_class: u8,
    pub note: String,
    pub x_prime_pitch_class: u8,
    pub x_prime_note: String,
    pub mirror_position: u8,
    pub mirror_pitch_class: u8,
    pub mirror_note: String,
    pub mirror_square: String,
    pub mirror_span_whole_tones: u8,
    pub mirror_span_semitones: u8,
}

impl MathemeChromaticProfile {
    pub(in crate::kernel) fn from_tick(tick12: u8, position: u8, pitch_class: u8) -> Self {
        let mirror_position = 5 - position;
        let mirror_tick = if tick12 < 6 {
            mirror_position
        } else {
            6 + mirror_position
        };
        let mirror_pitch_class = pitch_class_for_tick(mirror_tick);
        let x_prime_pitch_class = if tick12 < 6 {
            pitch_class + 1
        } else {
            pitch_class - 1
        };
        let mirror_span_whole_tones = match position {
            0 | 5 => 5,
            1 | 4 => 3,
            _ => 1,
        };
        Self {
            position,
            pitch_class,
            note: note_name(pitch_class).to_owned(),
            x_prime_pitch_class,
            x_prime_note: note_name(x_prime_pitch_class).to_owned(),
            mirror_position,
            mirror_pitch_class,
            mirror_note: note_name(mirror_pitch_class).to_owned(),
            mirror_square: mirror_square(position).to_owned(),
            mirror_span_whole_tones,
            mirror_span_semitones: mirror_span_whole_tones * 2,
        }
    }
}
