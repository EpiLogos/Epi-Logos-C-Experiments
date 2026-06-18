use portal_core::transcription::{is_start_codon, is_stop_codon, START_CODON, STOP_CODONS};
use std::os::raw::c_uint;

use epi_lib as _;

const M3_TRANSCRIPT_CLASS_SHARED: c_uint = 0;
const M3_TRANSCRIPT_CLASS_TRANSCRIBABLE: c_uint = 1;
const M3_GOVERNANCE_ROLE_NONE: c_uint = 0;
const M3_GOVERNANCE_ROLE_START: c_uint = 1;
const M3_GOVERNANCE_ROLE_STOP: c_uint = 2;

extern "C" {
    static M3_CODON_ATG_AUG: u8;
    static M3_STOP_CODONS: [u8; 3];

    fn m3_codon_t_count_ffi(codon: u8) -> u8;
    fn m3_codon_transcript_class_ffi(codon: u8) -> c_uint;
    fn m3_codon_governance_role_ffi(codon: u8) -> c_uint;
}

fn expected_t_count(codon: u8) -> u8 {
    let outer = (codon >> 4) & 0x03;
    let middle = (codon >> 2) & 0x03;
    let inner = codon & 0x03;
    u8::from(outer == 1) + u8::from(middle == 1) + u8::from(inner == 1)
}

#[test]
fn transcription_c_rust_parity() {
    assert_eq!(unsafe { M3_CODON_ATG_AUG }, START_CODON);
    assert_eq!(unsafe { M3_STOP_CODONS }, STOP_CODONS);

    let mut shared = 0u8;
    let mut transcribable = 0u8;
    let mut starts = 0u8;
    let mut stops = 0u8;

    for codon in 0u8..64 {
        let t_count = unsafe { m3_codon_t_count_ffi(codon) };
        assert_eq!(
            t_count,
            expected_t_count(codon),
            "t-count drift at codon {codon:#04x}"
        );

        let transcript_class = unsafe { m3_codon_transcript_class_ffi(codon) };
        let expected_class = if t_count == 0 {
            M3_TRANSCRIPT_CLASS_SHARED
        } else {
            M3_TRANSCRIPT_CLASS_TRANSCRIBABLE
        };
        assert_eq!(
            transcript_class, expected_class,
            "transcript class drift at codon {codon:#04x}"
        );

        let governance_role = unsafe { m3_codon_governance_role_ffi(codon) };
        let expected_role = if is_start_codon(codon) {
            M3_GOVERNANCE_ROLE_START
        } else if is_stop_codon(codon) {
            M3_GOVERNANCE_ROLE_STOP
        } else {
            M3_GOVERNANCE_ROLE_NONE
        };
        assert_eq!(
            governance_role, expected_role,
            "governance role drift at codon {codon:#04x}"
        );

        shared += u8::from(transcript_class == M3_TRANSCRIPT_CLASS_SHARED);
        transcribable += u8::from(transcript_class == M3_TRANSCRIPT_CLASS_TRANSCRIBABLE);
        starts += u8::from(governance_role == M3_GOVERNANCE_ROLE_START);
        stops += u8::from(governance_role == M3_GOVERNANCE_ROLE_STOP);
    }

    assert_eq!(shared, 27);
    assert_eq!(transcribable, 37);
    assert_eq!(starts, 1);
    assert_eq!(stops, 3);
}
