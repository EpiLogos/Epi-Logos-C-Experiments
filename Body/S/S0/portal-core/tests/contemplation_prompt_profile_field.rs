//! Coordinate: S0 M0 -> M0'
//! Residency: Body/S/S0/portal-core/tests
//! Position (#n): public-current profile projection boundary.
//! Actualises: 21.T21.9 executable projection of the compiled contemplation LUT.
//! Public surface: `cargo test --test contemplation_prompt_profile_field`.
//! Does NOT own: contemplation prompt wording or M0' rendering.
//! Contract: [[S0-SPEC]] -> [[M0'-SPEC]].

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

#[test]
fn profile_projects_the_compiled_twelve_prompt_lut() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, 7));
    let wire = serde_json::to_value(profile).expect("profile serializes");
    let prompts = wire["contemplationPromptLut"]
        .as_array()
        .expect("current profiles carry the contemplation prompt LUT");

    assert_eq!(prompts.len(), 12);
    assert_eq!(prompts[0], "");
    assert_eq!(
        prompts[3],
        "Did your speech articulate identity or just signal? Where did naming become performance?"
    );
    assert_eq!(
        prompts[5],
        "Did unity-multiplicity hold or did one side eat the other? Where was the mercurial crossroads refused?"
    );
    assert_eq!(
        prompts[7],
        "Did the four causes integrate or did one dominate? Which act was missing?"
    );
    assert_eq!(
        prompts[9],
        "Did the cycle complete in wholeness or close prematurely? Which virtue went unwitnessed?"
    );
    assert_eq!(prompts[11], "");
}
