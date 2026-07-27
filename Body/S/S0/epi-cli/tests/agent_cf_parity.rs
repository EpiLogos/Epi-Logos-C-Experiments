//! 50.T50.11 — the Rust half of the CF->agent parity contract.
//!
//! `cf_to_agent` (`src/agent/vak.rs`) and TS `AGENT_CF`
//! (`Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts`) are two
//! independent tables of one law. They agreed by luck; nothing caught a
//! one-sided edit.
//!
//! Both sides read `Body/S/S4/ta-onta/shared/agent_cf.parity.json`. Neither
//! greps the other's source — the discipline `vak_address.parity.json`
//! established in 50.T50.03. Adding a binding to the fixture binds it here and
//! in TS at once; changing one table alone reddens this test.
//!
//! The TS half is `Body/S/S4/ta-onta/S4-4p-anima/tests/agent_cf_parity.test.ts`.

use serde_json::Value;
use std::fs;
use std::path::PathBuf;

fn repo_root() -> PathBuf {
    // tests/ -> epi-cli -> S0 -> S -> Body -> repo root
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("repo root should be four levels above the crate")
        .to_path_buf()
}

fn fixture() -> Value {
    let path = repo_root()
        .join("Body/S/S4/ta-onta/shared/agent_cf.parity.json");
    let body = fs::read_to_string(&path)
        .unwrap_or_else(|err| panic!("parity fixture at {} should be readable: {err}", path.display()));
    serde_json::from_str(&body).expect("parity fixture should be valid JSON")
}

/// The fixture carries `$comment` keys for humans; they are not bindings.
fn bindings(value: &Value) -> Vec<(String, Value)> {
    value
        .as_object()
        .expect("section should be an object")
        .iter()
        .filter(|(key, _)| !key.starts_with('$'))
        .map(|(key, val)| (key.clone(), val.clone()))
        .collect()
}

#[test]
fn cf_to_agent_matches_the_shared_constitutional_roster() {
    let fixture = fixture();
    let mut checked = 0;
    for (agent, cf) in bindings(&fixture["constitutional"]) {
        let cf = cf.as_str().expect("each CF should be a string");
        assert_eq!(
            epi_logos::agent::vak::cf_to_agent(cf),
            agent,
            "cf {cf} should resolve to {agent} in Rust as it does in TS"
        );
        checked += 1;
    }
    assert_eq!(checked, 7, "the constitutional roster is seven-fold");
}

#[test]
fn nous_is_the_ratified_double_zero_spelling() {
    // The divergence 50.T50.11 decided: code's `(00/00)` won over the skills'
    // legacy `(0000)`. If the fixture is ever edited back, this is what refuses.
    let fixture = fixture();
    assert_eq!(fixture["constitutional"]["nous"], "(00/00)");
    assert_eq!(fixture["skillNotation"]["nous"]["canonical"], "(00/00)");
    assert_eq!(epi_logos::agent::vak::cf_to_agent("(00/00)"), "nous");
}

#[test]
fn lachesis_hosts_on_animas_frame() {
    // Canon (S4-ARCHITECTURE.md:178) reads "lachesis->Anima". Rust has no Moirai
    // table, but it owns the CF->agent resolution the host binding depends on:
    // whatever CF the fixture ratifies for Lachesis must resolve to Anima here
    // too, or "inherits its host's CF" means different things in each language.
    let fixture = fixture();
    let cf = fixture["moiraiHost"]["lachesis"]["cf"]
        .as_str()
        .expect("lachesis cf should be a string");
    let host = fixture["moiraiHost"]["lachesis"]["hostAgent"]
        .as_str()
        .expect("lachesis host should be a string");
    assert_eq!(cf, "(4.0/1-4.4/5)");
    assert_eq!(host, "anima");
    assert_eq!(epi_logos::agent::vak::cf_to_agent(cf), host);
    // And it is NOT Psyche's frame — the superseded reading.
    assert_ne!(cf, fixture["constitutional"]["psyche"].as_str().unwrap());
}

#[test]
fn every_moirai_host_cf_is_a_real_constitutional_frame() {
    let fixture = fixture();
    for (agent, entry) in bindings(&fixture["moiraiHost"]) {
        let cf = entry["cf"].as_str().expect("cf should be a string");
        let host = entry["hostAgent"].as_str().expect("host should be a string");
        assert_eq!(
            epi_logos::agent::vak::cf_to_agent(cf),
            host,
            "{agent} inherits {host}, so its CF must resolve to {host}"
        );
    }
}

#[test]
fn the_unknown_cf_fallback_is_the_pinned_divergence() {
    // Rust answers an unknown CF with a fabricated agent; TS says it does not
    // know. Narrowing the Rust signature is a public-surface change beyond this
    // tranche, so the behaviour is PINNED here rather than silently tolerated —
    // and the fixture records both sides so the gap is visible.
    let fixture = fixture();
    let pinned = fixture["rustUnknownCfFallback"]["rust"]
        .as_str()
        .expect("pinned fallback should be a string");
    assert_eq!(epi_logos::agent::vak::cf_to_agent("(9/9)"), pinned);
    assert!(
        fixture["rustUnknownCfFallback"]["typescript"].is_null(),
        "TS returns undefined for an off-roster CF; the fixture must say so"
    );
    // The fallback must not masquerade as a binding: no constitutional agent may
    // be reachable ONLY through it.
    assert_eq!(pinned, "psyche");
    assert_eq!(
        epi_logos::agent::vak::cf_to_agent(
            fixture["constitutional"]["psyche"].as_str().unwrap()
        ),
        "psyche",
        "psyche must be reachable by its own CF, not only as the fallback"
    );
}
