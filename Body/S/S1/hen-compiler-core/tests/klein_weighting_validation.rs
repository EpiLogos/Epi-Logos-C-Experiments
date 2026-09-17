// Track 05.T5.19 — c_3_klein_weighting value validation.
//
// The NOW-frontmatter Klein-weighting split names the two senses of sight
// (prospective forward into what is forming / retrospective back across what has
// gathered). Per the spec it carries two weights, each in [0.0, 1.0], summing to
// 1.0 (canvas-spec §3.1 complementarity). Before this the validator accepted ANY
// mapping for the key; the acceptance criterion is that out-of-range / non-summing
// values are REJECTED, not rendered.

use epi_s1_hen_compiler_core::validate_frontmatter;
use serde_yaml::Value;

fn errors_of(yaml: &str) -> Vec<String> {
    let value: Value = serde_yaml::from_str(yaml).expect("test yaml parses");
    validate_frontmatter(&value).errors
}

#[test]
fn balanced_klein_weighting_is_accepted() {
    let errors = errors_of(
        "coordinate: \"C0\"\nc_3_klein_weighting:\n  prospective: 0.5\n  retrospective: 0.5\n",
    );
    assert!(errors.is_empty(), "balanced 0.5/0.5 must pass: {errors:?}");
}

#[test]
fn asymmetric_but_summing_klein_weighting_is_accepted() {
    let errors = errors_of(
        "coordinate: \"C0\"\nc_3_klein_weighting:\n  prospective: 0.7\n  retrospective: 0.3\n",
    );
    assert!(errors.is_empty(), "0.7/0.3 sums to 1.0 and must pass: {errors:?}");
}

#[test]
fn klein_weighting_not_summing_to_one_is_rejected() {
    let errors = errors_of(
        "coordinate: \"C0\"\nc_3_klein_weighting:\n  prospective: 0.5\n  retrospective: 0.9\n",
    );
    assert!(
        errors
            .iter()
            .any(|e| e.contains("c_3_klein_weighting") && e.contains("sum")),
        "sum 1.4 must be rejected: {errors:?}"
    );
}

#[test]
fn klein_weighting_out_of_range_is_rejected() {
    let errors = errors_of(
        "coordinate: \"C0\"\nc_3_klein_weighting:\n  prospective: 1.5\n  retrospective: -0.5\n",
    );
    assert!(
        errors
            .iter()
            .any(|e| e.contains("c_3_klein_weighting") && e.contains("range")),
        "1.5 / -0.5 out of [0,1] must be rejected: {errors:?}"
    );
}

#[test]
fn klein_weighting_missing_a_weight_is_rejected() {
    let errors = errors_of(
        "coordinate: \"C0\"\nc_3_klein_weighting:\n  prospective: 1.0\n",
    );
    assert!(
        errors.iter().any(|e| e.contains("c_3_klein_weighting")),
        "a mapping missing retrospective must be rejected: {errors:?}"
    );
}

#[test]
fn klein_weighting_scalar_is_rejected() {
    let errors = errors_of("coordinate: \"C0\"\nc_3_klein_weighting: \"balanced\"\n");
    assert!(
        errors.iter().any(|e| e.contains("c_3_klein_weighting")),
        "a scalar klein_weighting must be rejected: {errors:?}"
    );
}
