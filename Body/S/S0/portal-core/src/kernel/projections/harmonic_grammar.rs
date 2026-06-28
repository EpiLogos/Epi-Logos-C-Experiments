use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicGrammarProjection {
    pub position_substance: String,
    pub lens_refraction: String,
    pub harmonic_relation: String,
    pub base_pair: String,
    pub active_lenses: Vec<String>,
    pub primary_anchor: String,
    pub d_face: String,
    pub depth: u8,
    pub families: Vec<MathemeHarmonicFamilyProjection>,
}

impl MathemeHarmonicGrammarProjection {
    pub(in crate::kernel) fn from_tick(tick12: u8, position: u8) -> Self {
        let helix_is_prime = tick12 >= 6;
        let second = if helix_is_prime {
            5 - position
        } else {
            (position + 1) % 6
        };
        let d_face = if helix_is_prime { "D_LEFT" } else { "NONE" };
        let depth = if helix_is_prime { 3 } else { 2 };
        let families = harmonic_families_for_pair(position, second)
            .into_iter()
            .map(MathemeHarmonicFamilyProjection::from_family)
            .collect();

        Self {
            position_substance: "P/P'=0".to_owned(),
            lens_refraction: "L/L'=/".to_owned(),
            harmonic_relation: "A/B/C+D=1".to_owned(),
            base_pair: format!("L{position}/L{second}"),
            active_lenses: if helix_is_prime {
                vec![format!("L{position}'"), format!("L{second}")]
            } else {
                vec![format!("L{position}"), format!("L{second}")]
            },
            primary_anchor: if helix_is_prime { "Night" } else { "Day" }.to_owned(),
            d_face: d_face.to_owned(),
            depth,
            families,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicFamilyProjection {
    pub family: String,
    pub register: String,
    pub relation_type: String,
    pub interval_signature: String,
}

impl MathemeHarmonicFamilyProjection {
    fn from_family(family: HarmonicFamily) -> Self {
        Self {
            family: family.name().to_owned(),
            register: family.register().to_owned(),
            relation_type: family.relation_type().to_owned(),
            interval_signature: family.interval_signature().to_owned(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum HarmonicFamily {
    A,
    B,
    C,
}

impl HarmonicFamily {
    fn name(self) -> &'static str {
        match self {
            Self::A => "A",
            Self::B => "B",
            Self::C => "C",
        }
    }

    fn register(self) -> &'static str {
        match self {
            Self::A => "Being",
            Self::B => "Becoming",
            Self::C => "KnowingUnknowing",
        }
    }

    fn relation_type(self) -> &'static str {
        match self {
            Self::A => "ADJACENTLY_ARTICULATES",
            Self::B => "MIRRORS_COMPLEMENT",
            Self::C => "CROSSES_KNOWING_LIMIT",
        }
    }

    fn interval_signature(self) -> &'static str {
        match self {
            Self::A => "chromatic:whole-tone; fifths:perfect-fourth",
            Self::B => "chromatic:minor-seventh/tritone/whole-tone; fifths:perfect-fifth/minor-third/major-seventh",
            Self::C => "chromatic:whole-tone-with-cycle-close-minor-third; fifths:perfect-fourth-with-cycle-close-minor-second",
        }
    }
}

fn harmonic_families_for_pair(first: u8, second: u8) -> Vec<HarmonicFamily> {
    match (first % 6, second % 6) {
        (0, 1) | (4, 5) => vec![HarmonicFamily::A],
        (2, 3) => vec![HarmonicFamily::A, HarmonicFamily::B],
        (0, 5) | (1, 4) => vec![HarmonicFamily::B],
        (1, 2) | (3, 4) | (5, 0) => vec![HarmonicFamily::C],
        _ => Vec::new(),
    }
}
