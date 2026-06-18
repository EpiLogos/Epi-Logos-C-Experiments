use portal_core::{
    AnuttaraWitnessBandBalance, AnuttaraWitnessPalindromeState, AnuttaraWitnessProjection,
    AnuttaraWitnessRFactorBand, AnuttaraWitnessRFactorPathStep, MathemeHarmonicProfile,
};
use serde_json::json;

fn witness_projection() -> AnuttaraWitnessProjection {
    AnuttaraWitnessProjection {
        virtue_witness_vector: 0b101_010_101,
        syntax_witness_vector: 0b1011,
        rfactor_path: vec![
            AnuttaraWitnessRFactorPathStep {
                r_factor: 1,
                base_route: "O#".to_owned(),
                band: AnuttaraWitnessRFactorBand::Pravritti,
                position: 0,
                is_turn: false,
            },
            AnuttaraWitnessRFactorPathStep {
                r_factor: 2,
                base_route: "Shakti".to_owned(),
                band: AnuttaraWitnessRFactorBand::Pravritti,
                position: 5,
                is_turn: true,
            },
            AnuttaraWitnessRFactorPathStep {
                r_factor: 3,
                base_route: "Shakti".to_owned(),
                band: AnuttaraWitnessRFactorBand::Nivritti,
                position: 0,
                is_turn: false,
            },
            AnuttaraWitnessRFactorPathStep {
                r_factor: 0xFF,
                base_route: "Siva".to_owned(),
                band: AnuttaraWitnessRFactorBand::Nivritti,
                position: 5,
                is_turn: false,
            },
        ],
        band_balance: AnuttaraWitnessBandBalance {
            pravritti_depth: 2,
            nivritti_depth: 2,
            reached_turn: true,
            returned: true,
        },
        palindrome_state: AnuttaraWitnessPalindromeState {
            normal_form_symmetric: true,
            mirror_normal_form: "R1@O#/0|(@#)|R3@Shakti/0".to_owned(),
        },
        open_questions: vec!["Law-6:R2@Shakti:turn?".to_owned()],
        coherence_score: 0.875,
    }
}

#[test]
fn anuttara_witness_projection_serializes_as_emit_only_profile_edge() {
    let profile = MathemeHarmonicProfile::with_anuttara_witness(
        portal_core::kernel_tick_from_epogdoon(4, 5),
        witness_projection(),
    );

    let value = serde_json::to_value(&profile).expect("profile serializes");
    let witness = &value["anuttaraWitness"];
    assert_eq!(witness["virtueWitnessVector"], json!(0b101_010_101));
    assert_eq!(witness["syntaxWitnessVector"], json!(0b1011));
    assert_eq!(witness["rfactorPath"][0]["band"], "pravritti");
    assert_eq!(witness["rfactorPath"][2]["band"], "nivritti");
    assert_eq!(witness["rfactorPath"][1]["isTurn"], true);
    assert_eq!(witness["rfactorPath"][3]["rFactor"], 0xFF);
    assert_eq!(witness["bandBalance"]["reachedTurn"], true);
    assert_eq!(witness["bandBalance"]["returned"], true);
    assert_eq!(
        witness["palindromeState"]["mirrorNormalForm"],
        "R1@O#/0|(@#)|R3@Shakti/0"
    );
    assert_eq!(witness["openQuestions"][0], "Law-6:R2@Shakti:turn?");
    assert_eq!(witness["coherenceScore"], json!(0.875));

    let decoded: MathemeHarmonicProfile =
        serde_json::from_value(value).expect("profile deserializes");
    let decoded_witness = decoded
        .anuttara_witness
        .expect("anuttara witness survives round trip");
    assert_eq!(decoded_witness.virtue_witness_vector, 0b101_010_101);
    assert_eq!(decoded_witness.syntax_witness_vector, 0b1011);
    assert_eq!(
        decoded_witness.rfactor_path[2].band,
        AnuttaraWitnessRFactorBand::Nivritti
    );
    assert!(decoded_witness.rfactor_path[1].is_turn);
}
