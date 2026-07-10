use serde::{Deserialize, Serialize};

use super::MathemeDiatonicContext;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemePlanetaryChakralProjection {
    pub body: String,
    pub chakra_role: String,
    pub element: String,
    pub musical_role: String,
    pub modal_color: String,
    pub provenance: String,
}

impl MathemePlanetaryChakralProjection {
    pub(in crate::kernel) fn from_diatonic(diatonic: Option<&MathemeDiatonicContext>) -> Self {
        let (body, chakra_role, element, musical_role, modal_color) =
            match diatonic.map(|context| context.degree) {
                Some(1) => (
                    "Earth",
                    "Muladhara / grounding center",
                    "Earth",
                    "1/1 tonic",
                    "Rast / stable tonic ground",
                ),
                Some(2) => (
                    "Venus",
                    "Svadhisthana / generative water",
                    "Water",
                    "9/8 epogdoon pulse",
                    "Bayati / living difference",
                ),
                Some(3) => (
                    "Mars",
                    "Manipura / active fire",
                    "Fire",
                    "5/4 major-third fire articulation",
                    "Hijaz / charged action",
                ),
                Some(4) => (
                    "Jupiter",
                    "Anahata / expansive heart",
                    "Air",
                    "4/3 perfect fourth",
                    "Saba / relational opening",
                ),
                Some(5) => (
                    "Saturn",
                    "Vishuddha-Ajna discipline bridge",
                    "Ether/structure",
                    "3/2 perfect fifth",
                    "Kurd / structuring resonance",
                ),
                Some(6) => (
                    "Uranus",
                    "Ajna transpersonal extension",
                    "Light/Air",
                    "5/3 major sixth",
                    "Nahawand / disruptive insight",
                ),
                Some(7) => (
                    "Neptune",
                    "Crown/transpersonal ocean",
                    "Consciousness/Water",
                    "15/8 leading-toward-octave",
                    "Ajam / luminous expansion",
                ),
                _ => (
                    "Pluto",
                    "underworld/transmutation",
                    "Salt/depth",
                    "chromatic shadow pressure",
                    "Locrian/shadow mode pressure",
                ),
            };
        Self {
            body: body.to_owned(),
            chakra_role: chakra_role.to_owned(),
            element: element.to_owned(),
            musical_role: musical_role.to_owned(),
            modal_color: modal_color.to_owned(),
            provenance:
                "initial M2/M' alignment; canonical values must be governed by S2 graph law"
                    .to_owned(),
        }
    }
}
