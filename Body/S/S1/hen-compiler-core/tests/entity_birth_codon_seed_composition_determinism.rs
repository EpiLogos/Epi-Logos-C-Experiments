use epi_s1_hen_compiler_core::birth_codon::{
    derive_birth_codon, derive_birth_codon_with_composition, BirthCodonRecord, BirthCodonSeed,
    DerivationPolicy, SEED_COMPOSITION_DEFAULT,
};

fn seed() -> BirthCodonSeed {
    BirthCodonSeed {
        content_hash: "sha256:abc123".to_owned(),
        kairos: "2026-07-10T12:00:00Z".to_owned(),
        creator_identity: "hen".to_owned(),
        coordinate_path: "C2|Idea/Empty/Present/10-07-2026/entities/anima.md".to_owned(),
    }
}

#[test]
fn same_seed_components_produce_the_same_codon_across_runs() {
    for policy in [
        DerivationPolicy::Blake3First6Bits,
        DerivationPolicy::Blake3Modulo64,
        DerivationPolicy::Blake3XorFold,
    ] {
        let first = derive_birth_codon(&seed(), policy);
        for _ in 0..64 {
            assert_eq!(derive_birth_codon(&seed(), policy), first);
        }
        assert!(first < 64);
    }
}

#[test]
fn full_record_derivation_is_deterministic() {
    let record_a = BirthCodonRecord::derive(&seed(), DerivationPolicy::default());
    let record_b = BirthCodonRecord::derive(&seed(), DerivationPolicy::default());
    assert_eq!(record_a, record_b);
}

#[test]
fn changing_any_seed_component_is_reflected_in_the_composed_seed() {
    let base = seed();
    let composed = base.compose(&SEED_COMPOSITION_DEFAULT);
    for mutated in [
        BirthCodonSeed {
            content_hash: "sha256:other".to_owned(),
            ..base.clone()
        },
        BirthCodonSeed {
            kairos: "2026-07-11T00:00:00Z".to_owned(),
            ..base.clone()
        },
        BirthCodonSeed {
            creator_identity: "user".to_owned(),
            ..base.clone()
        },
        BirthCodonSeed {
            coordinate_path: "C3|elsewhere.md".to_owned(),
            ..base.clone()
        },
    ] {
        assert_ne!(mutated.compose(&SEED_COMPOSITION_DEFAULT), composed);
    }
}

#[test]
fn composition_is_length_prefixed_against_concatenation_collisions() {
    // "ab" + "c" must not compose identically to "a" + "bc".
    let left = BirthCodonSeed {
        content_hash: "ab".to_owned(),
        kairos: "c".to_owned(),
        creator_identity: String::new(),
        coordinate_path: String::new(),
    };
    let right = BirthCodonSeed {
        content_hash: "a".to_owned(),
        kairos: "bc".to_owned(),
        creator_identity: String::new(),
        coordinate_path: String::new(),
    };
    assert_ne!(
        left.compose(&SEED_COMPOSITION_DEFAULT),
        right.compose(&SEED_COMPOSITION_DEFAULT)
    );
}

#[test]
fn reordering_the_composition_changes_determinism_behaviour_but_stays_deterministic() {
    let reordered = ["coordinate_path", "content_hash", "kairos", "creator_identity"];
    let a = derive_birth_codon_with_composition(&seed(), DerivationPolicy::default(), &reordered);
    let b = derive_birth_codon_with_composition(&seed(), DerivationPolicy::default(), &reordered);
    assert_eq!(a, b);
    assert!(a < 64);
    // The reordered composition composes a different seed string than the
    // default (the codon itself may or may not collide in 6-bit space).
    assert_ne!(
        seed().compose(&reordered),
        seed().compose(&SEED_COMPOSITION_DEFAULT)
    );
}

#[test]
fn all_policies_stay_inside_the_6_bit_codon_space() {
    for variant in 0..=255u8 {
        let seed = BirthCodonSeed {
            content_hash: format!("hash-{variant}"),
            kairos: String::new(),
            creator_identity: "hen".to_owned(),
            coordinate_path: "C2|x.md".to_owned(),
        };
        for policy in [
            DerivationPolicy::Blake3First6Bits,
            DerivationPolicy::Blake3Modulo64,
            DerivationPolicy::Blake3XorFold,
        ] {
            assert!(derive_birth_codon(&seed, policy) < 64);
        }
    }
}
