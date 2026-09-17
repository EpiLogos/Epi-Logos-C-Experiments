use epi_s2_graph_schema::{
    label_spec, GNOSTIC_CORPUS_LABEL, GNOSTIC_ETYMOLOGY_LABEL, GNOSTIC_LABEL,
    GNOSTIC_NOTEBOOK_LABEL, GNOSTIC_SKILLS_LABEL,
};

#[test]
fn gnostic_label_promotion() {
    assert_eq!(GNOSTIC_LABEL, "Gnostic");
    assert_eq!(GNOSTIC_CORPUS_LABEL, "Gnostic:Corpus");
    assert_eq!(GNOSTIC_NOTEBOOK_LABEL, "Gnostic:Notebook");
    assert_eq!(GNOSTIC_ETYMOLOGY_LABEL, "Gnostic:Etymology");
    assert_eq!(GNOSTIC_SKILLS_LABEL, "Gnostic:Skills");

    for label in [
        GNOSTIC_LABEL,
        GNOSTIC_CORPUS_LABEL,
        GNOSTIC_NOTEBOOK_LABEL,
        GNOSTIC_ETYMOLOGY_LABEL,
        GNOSTIC_SKILLS_LABEL,
    ] {
        let spec = label_spec(label).unwrap_or_else(|| panic!("{label} missing"));
        assert_eq!(spec.source_family, "gnostic");
        assert!(!spec.compatibility, "{label} must be canonical");
    }
}
