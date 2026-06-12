use portal_core::{kernel_tick_from_epogdoon, KleinFlipEvent, MathemeHarmonicProfile, Valence};
use serde_json::Value;

#[test]
fn klein_flip_event_union_matches_all_variants_exhaustively() {
    let variants = [
        KleinFlipEvent::M1TritoneCrossing {
            tick12: 6,
            lens_pair: (0, 6),
        },
        KleinFlipEvent::M2CymaticValenceInvert {
            valence_before: Valence::Primary,
            valence_after: Valence::Inverted,
        },
        KleinFlipEvent::M3CodonRotationCross {
            codon_before: 41,
            codon_after: 42,
        },
    ];

    let mut kinds = Vec::new();
    for event in variants {
        kinds.push(exhaustive_subscriber_branch(&event));
        let value = serde_json::to_value(&event).expect("event serializes");
        assert_eq!(
            value
                .get("kind")
                .and_then(Value::as_str)
                .expect("tagged event kind"),
            exhaustive_subscriber_branch(&event)
        );
    }

    assert_eq!(
        kinds,
        [
            "m1TritoneCrossing",
            "m2CymaticValenceInvert",
            "m3CodonRotationCross"
        ]
    );
}

#[test]
fn matheme_profile_emits_klein_flip_union_and_not_legacy_state() {
    let profiles = [
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6)),
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 7)),
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 8)),
    ];

    let mut kinds = Vec::new();
    for profile in profiles {
        let value = serde_json::to_value(profile).expect("profile serializes");
        assert!(
            value.get("kleinFlipState").is_none(),
            "legacy kleinFlipState must not remain on the public profile"
        );
        kinds.push(
            value
                .get("kleinFlip")
                .and_then(|event| event.get("kind"))
                .and_then(Value::as_str)
                .expect("profile carries tagged kleinFlip event")
                .to_owned(),
        );
    }

    assert_eq!(
        kinds,
        [
            "m1TritoneCrossing",
            "m2CymaticValenceInvert",
            "m3CodonRotationCross"
        ]
    );
}

fn exhaustive_subscriber_branch(event: &KleinFlipEvent) -> &'static str {
    match event {
        KleinFlipEvent::M1TritoneCrossing { tick12, lens_pair } => {
            assert_eq!((*tick12, *lens_pair), (6, (0, 6)));
            "m1TritoneCrossing"
        }
        KleinFlipEvent::M2CymaticValenceInvert {
            valence_before,
            valence_after,
        } => {
            assert_eq!(
                (*valence_before, *valence_after),
                (Valence::Primary, Valence::Inverted)
            );
            "m2CymaticValenceInvert"
        }
        KleinFlipEvent::M3CodonRotationCross {
            codon_before,
            codon_after,
        } => {
            assert_eq!((*codon_before, *codon_after), (41, 42));
            "m3CodonRotationCross"
        }
    }
}
