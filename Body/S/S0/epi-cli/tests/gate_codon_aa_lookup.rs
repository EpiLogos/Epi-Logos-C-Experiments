use serde_json::json;

#[test]
fn codon_lookup_uses_the_c_backed_portal_lut_and_refuses_malformed_input() {
    let start = epi_logos::gate::codon::aa_lookup(&json!({ "codon": "AUG" })).expect("AUG lookup");
    assert_eq!(start["aminoAcid"], "Cys");
    assert_eq!(start["isStart"], true);
    assert_eq!(start["isStop"], false);
    assert_eq!(start["authority"], "portal-core::transcription");

    let stop = epi_logos::gate::codon::aa_lookup(&json!({ "codon": "UAA" })).expect("UAA lookup");
    assert_eq!(stop["aminoAcid"], "STOP");
    assert_eq!(stop["isStop"], true);

    assert!(epi_logos::gate::codon::aa_lookup(&json!({ "codon": "AXG" })).is_err());
}
