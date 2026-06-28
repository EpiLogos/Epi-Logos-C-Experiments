use serde::{Deserialize, Serialize};

use super::super::note_name;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeDiatonicContext {
    pub degree: u8,
    pub pitch_class: u8,
    pub note: String,
    pub context_frame: String,
    pub context_agent: String,
    pub vak_register: String,
}

impl MathemeDiatonicContext {
    pub(in crate::kernel) fn from_pitch_class(pitch_class: u8) -> Option<Self> {
        let (degree, context_frame, context_agent, vak_register) = match pitch_class {
            0 => (1, "00/00", "Nous", "Para"),
            2 => (2, "0/1", "Logos", "Madhyama-nomos"),
            4 => (3, "0/1/2", "Eros", "Madhyama-chreia"),
            5 => (4, "0/1/2/3", "Mythos", "Pasyanti"),
            7 => (5, "4.0/1-4.4/5", "Anima/Psyche", "Madhyama-oikonomia"),
            9 => (6, "4.5/0", "Psyche", "partial-Aletheia"),
            11 => (7, "5/0", "Sophia", "Spanda-Shakti"),
            _ => return None,
        };
        Some(Self {
            degree,
            pitch_class,
            note: note_name(pitch_class).to_owned(),
            context_frame: context_frame.to_owned(),
            context_agent: context_agent.to_owned(),
            vak_register: vak_register.to_owned(),
        })
    }
}
