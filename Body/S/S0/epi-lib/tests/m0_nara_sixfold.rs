// Tranche 01.T1.16 — M# person-grammar + # kinship-grammar as 6-fold kernel LUTs
// + the #↔trigram bridge. Chirality is read off the coordinate, never additive.
use std::ffi::CStr;
use std::os::raw::c_char;

const NARA_POLARITY_YIN: u8 = 0;
const NARA_POLARITY_YANG: u8 = 1;
const NARA_POLARITY_BOTH: u8 = 2;

const NARA_DOM_MATRIX: u8 = 0;
const NARA_DOM_DOMINANT: u8 = 1;
const NARA_DOM_SUBDOMINANT: u8 = 2;
const NARA_DOM_INTEGRATIVE: u8 = 3;

#[repr(C)]
struct NaraEntry {
    frame_position: u8,
    polarity: u8,
    dominant_val: u8,
    archetype_role: u8,
    dominance_mode: u8,
    coordinate: *const c_char,
}

#[repr(C)]
struct MsharpPersonEntry {
    position: u8,
    polarity: u8,
    dominance_mode: u8,
    name: *const c_char,
    coordinate: *const c_char,
    description: *const c_char,
}

#[repr(C)]
struct NaraTrigramBridge {
    nara_position: u8,
    trigram_seed: u8,
    trigram_count: u8,
    trigram_ids: [u8; 3],
}

#[repr(C)]
struct M3Trigram {
    id: u8,
    binary: u8,
    earlier_heaven: u8,
    later_heaven: u8,
    element: u8,
    family_role: u8,
    degree_anchor: u16,
}

#[link(name = "epilogos", kind = "static")]
extern "C" {
    static NARA_MSHARP_LUT: [NaraEntry; 6];
    static MSHARP_PERSON_LUT: [MsharpPersonEntry; 6];
    static NARA_TO_TRIGRAM: [NaraTrigramBridge; 6];
    static M3_TRIGRAM_LUT: [M3Trigram; 8];
}

fn cstr(ptr: *const c_char) -> &'static str {
    assert!(!ptr.is_null(), "LUT string field must not be null");
    unsafe { CStr::from_ptr(ptr) }.to_str().unwrap()
}

#[test]
fn m0_nara_sixfold_kinship_grammar() {
    // {##, Daughter, Father, Son, Mother, Tao} at positions 0-5;
    // dominance read off the chiral coordinate string.
    let expected: [(&str, u8, u8); 6] = [
        ("0/1", NARA_POLARITY_BOTH, NARA_DOM_MATRIX), // ## kinship ground
        ("1/1-", NARA_POLARITY_YIN, NARA_DOM_SUBDOMINANT), // Daughter
        ("2-/2", NARA_POLARITY_YANG, NARA_DOM_DOMINANT), // Father
        ("3/3-", NARA_POLARITY_YANG, NARA_DOM_SUBDOMINANT), // Son
        ("4./4", NARA_POLARITY_YIN, NARA_DOM_INTEGRATIVE), // Mother
        ("5-/5", NARA_POLARITY_BOTH, NARA_DOM_DOMINANT), // Tao — synthesis pole
    ];

    unsafe {
        assert_eq!(NARA_MSHARP_LUT.len(), 6);
        for (i, (coord, polarity, dominance)) in expected.iter().enumerate() {
            let e = &NARA_MSHARP_LUT[i];
            assert_eq!(e.frame_position, i as u8, "position {i}");
            assert_eq!(cstr(e.coordinate), *coord, "chiral coordinate at {i}");
            assert_eq!(e.polarity, *polarity, "polarity at {i}");
            assert_eq!(e.dominance_mode, *dominance, "dominance at {i}");
        }
        // Tao is a real 6th node: dominant synthesis pole at position 5,
        // not collapsed by the (5/0) Möbius return.
        let tao = &NARA_MSHARP_LUT[5];
        assert_eq!(cstr(tao.coordinate), "5-/5");
        assert_eq!(tao.dominance_mode, NARA_DOM_DOMINANT);
        assert_eq!(tao.polarity, NARA_POLARITY_BOTH);
    }
}

#[test]
fn m0_msharp_person_sixfold_grammar() {
    // {I, You, You-and-I, They, We, We-I} with their generating formulas.
    let expected: [(&str, &str); 6] = [
        ("I", "0/1"),
        ("You", "1+1=2"),
        ("You-and-I", "0-3"),
        ("They", "1+2=3"),
        ("We", "4+0"),
        ("We-I", "0/1/4/5"),
    ];

    unsafe {
        assert_eq!(MSHARP_PERSON_LUT.len(), 6);
        for (i, (name, coord)) in expected.iter().enumerate() {
            let e = &MSHARP_PERSON_LUT[i];
            assert_eq!(e.position, i as u8, "position {i}");
            assert_eq!(cstr(e.name), *name, "person name at {i}");
            assert_eq!(cstr(e.coordinate), *coord, "person formula at {i}");
            assert!(!cstr(e.description).is_empty(), "description at {i}");
        }
        // Shared ground: M# "I" reads the same (0/1) binary as #'s ##.
        assert_eq!(
            cstr(MSHARP_PERSON_LUT[0].coordinate),
            cstr(NARA_MSHARP_LUT[0].coordinate)
        );
        // Shared apex: We-I ≡ Tao (both dominant synthesis at position 5).
        assert_eq!(
            MSHARP_PERSON_LUT[5].dominance_mode,
            NARA_MSHARP_LUT[5].dominance_mode
        );
        assert_eq!(MSHARP_PERSON_LUT[5].polarity, NARA_MSHARP_LUT[5].polarity);
    }
}

#[test]
fn nara_trigram_bridge_maps_family_roles() {
    // The trigram family IS the # family materialized:
    // Father↔Qian(111), Mother↔Kun(000), Son→3 sons, Daughter→3 daughters.
    unsafe {
        assert_eq!(NARA_TO_TRIGRAM.len(), 6);
        for (i, b) in NARA_TO_TRIGRAM.iter().enumerate() {
            assert_eq!(b.nara_position, i as u8);
        }

        // ## (ground) and Tao (synthesis) carry no trigram seed.
        for pos in [0usize, 5] {
            assert_eq!(NARA_TO_TRIGRAM[pos].trigram_seed, 0xFF);
            assert_eq!(NARA_TO_TRIGRAM[pos].trigram_count, 0);
            assert_eq!(NARA_TO_TRIGRAM[pos].trigram_ids, [0xFF; 3]);
        }

        // Father (nara 2) ↔ Qian: all-yang 111, family_role Father(0).
        let father = &NARA_TO_TRIGRAM[2];
        assert_eq!(father.trigram_count, 1);
        assert_eq!(father.trigram_seed, 0);
        assert_eq!(M3_TRIGRAM_LUT[0].binary, 0b111);
        assert_eq!(M3_TRIGRAM_LUT[0].family_role, 0);

        // Mother (nara 4) ↔ Kun: all-yin 000, family_role Mother(1).
        let mother = &NARA_TO_TRIGRAM[4];
        assert_eq!(mother.trigram_count, 1);
        assert_eq!(mother.trigram_seed, 1);
        assert_eq!(M3_TRIGRAM_LUT[1].binary, 0b000);
        assert_eq!(M3_TRIGRAM_LUT[1].family_role, 1);

        // Son (nara 3) → the 1→3 differentiation {Zhen, Kan, Gen}:
        // one yang line each; son family_roles are even (2,4,6).
        let son = &NARA_TO_TRIGRAM[3];
        assert_eq!(son.trigram_count, 3);
        assert_eq!(son.trigram_ids, [2, 4, 6]);
        assert_eq!(son.trigram_seed, son.trigram_ids[0]);
        for &id in &son.trigram_ids {
            let t = &M3_TRIGRAM_LUT[id as usize];
            assert_eq!(t.binary.count_ones(), 1, "son trigram {id} has 1 yang line");
            assert!(
                t.family_role >= 2 && t.family_role % 2 == 0,
                "trigram {id} family_role {} is a son role",
                t.family_role
            );
        }

        // Daughter (nara 1) → {Xun, Li, Dui}: one yin line each;
        // daughter family_roles are odd (3,5,7).
        let daughter = &NARA_TO_TRIGRAM[1];
        assert_eq!(daughter.trigram_count, 3);
        assert_eq!(daughter.trigram_ids, [3, 5, 7]);
        assert_eq!(daughter.trigram_seed, daughter.trigram_ids[0]);
        for &id in &daughter.trigram_ids {
            let t = &M3_TRIGRAM_LUT[id as usize];
            assert_eq!(
                t.binary.count_ones(),
                2,
                "daughter trigram {id} has 1 yin line"
            );
            assert!(
                t.family_role >= 3 && t.family_role % 2 == 1,
                "trigram {id} family_role {} is a daughter role",
                t.family_role
            );
        }

        // The bridge covers all 8 trigrams exactly once (2 parents + 3 sons + 3 daughters).
        let mut seen = [false; 8];
        for b in NARA_TO_TRIGRAM.iter() {
            for &id in b.trigram_ids.iter().take(b.trigram_count as usize) {
                assert!(!seen[id as usize], "trigram {id} mapped twice");
                seen[id as usize] = true;
            }
        }
        assert_eq!(seen, [true; 8]);
    }
}
