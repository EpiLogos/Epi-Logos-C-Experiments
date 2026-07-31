//! The structural guard that replaces vigilance (Track 53 T53.11).
//!
//! Documents do not enforce. After the drain, nothing but a test stops the next
//! agent from adding `"s5'.something.new" => …` to `gate/server/dispatch.rs`,
//! because that is still the shortest path from a task to a working method.
//!
//! So the shortest path is made the correct one and the wrong one fails loudly:
//! every coordinate-prefixed method `epi-cli` still serves *directly* is
//! declared below with the reason it has not moved. The test asserts the
//! declaration and the source agree **in both directions** —
//!
//!   * a new arm that is not declared fails (the case this exists for), and
//!   * a declared entry with no arm fails (so the list cannot rot into fiction
//!     as methods finish moving).
//!
//! Pairs with, and fails independently of, `lint-boundaries`. The lint sees the
//! manifest edge; this sees a handler that arrived through the composition
//! root, which no manifest edge would reveal — `epi-logos` is a licensed
//! membrane and may legally depend on every layer.
//!
//! **To add a gateway method, do not add a line here.** Implement the handler in
//! the owning coordinate's crate and register it (see
//! `Body/S/S0/epi-cli/AGENTS.md`). This list is for methods that genuinely
//! cannot live at one coordinate, and it should only ever get shorter.

use std::collections::BTreeSet;
use std::path::PathBuf;

/// Methods `epi-cli` still dispatches directly, each with why.
///
/// Four honest reasons appear here, and no fifth is acceptable:
///   * **composite** — spans coordinates that may not import each other, so it
///     composes at the composition root (the one place licensed to see all of
///     them).
///   * **S0-own** — the law really is S0's (kernel bridge, compiled verifier).
///   * **needs-CLI-state** — needs a type resident in `epi-cli` whose behaviour
///     differs from its coordinate sibling.
///   * **not-yet-drained** — a family a later track moves. Never a resting place.
const DIRECTLY_SERVED: &[(&str, &str)] = &[
    // ---- S0's own law -----------------------------------------------------
    ("s0'.verifier.check_state", "S0-own: the compiled Anuttara verifier is S0/epi-lib law"),
    ("s0'.verifier.emit_query", "S0-own: same verifier"),
    ("s0'.verifier.owl_query", "S0-own: same verifier"),
    ("s0'.verifier.respond_question", "S0-own: loopback-only, persists beneath the gate state root"),
    ("s0'.verifier.validate_membership", "S0-own: 128-registry membership over the compiled verifier"),
    ("s2.graph.ananda_position", "S0-own: portal-core ananda projection, not a graph read"),
    ("s2.codon.aa_lookup", "S0-own: portal-core M3 codon algebra"),
    ("s2.codon.scalar_ref.read", "S0-own: portal-core scalar reference resolution"),
    // ---- genuine cross-coordinate composites ------------------------------
    (
        "s1'.q_articulation.accept",
        "composite: human approval (S5) -> graph verify + sync (S2) -> vault write (S1); no legal single-crate home",
    ),
    (
        "s2.parashaktiCorrespondences",
        "composite: S2 graph + M4 Nara medicine/oracle + the S0 kernel bridge",
    ),
    (
        "s3'.temporal.subscribe",
        "needs-CLI-state: calls ensure() on epi-cli's SessionStore, which injects a create-context from crate::sesh::session; S3's own ensure creates with an empty context",
    ),
    ("s3'.spacetime.subscribe", "needs-CLI-state: same SessionStore seam"),
    ("s5'.epii.status", "composite: techne::gnosis + nara dispatch + graphiti status"),
    ("s5'.epii.runtime.context", "composite: epi-cli sessions + temporal + spacetimedb readiness"),
    ("s5'.epii.user.orientation", "composite: temporal pratibimba surface + nara::kairos"),
    ("s5'.epii.pratibimba.status", "composite: same handler as user.orientation"),
    ("s5'.epii.kairos.context", "composite: same handler as user.orientation"),
    ("s5'.gnosis.context.retrieve", "composite: techne::gnosis config + query"),
    // ---- families a later track drains ------------------------------------
    ("s4.agent.notify", "not-yet-drained: S4 has no Rust crate; the roster is TypeScript"),
    ("s4.agent.query", "not-yet-drained: S4 has no Rust crate"),
    ("s4.agent.status", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.context.assemble", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.mediation.route", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.mediation.capabilities.list", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.orchestrate", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.orchestration.score", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.permission.get", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.psyche.state", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.psyche.update", "not-yet-drained: S4 has no Rust crate"),
    ("s4'.vak.evaluate", "not-yet-drained: S4 has no Rust crate"),
    ("s5.episodic.deposit", "not-yet-drained: graphiti-runtime episodic family"),
    ("s5.episodic.search", "not-yet-drained: graphiti-runtime episodic family"),
    ("s5.episodic.kernel_resonance.deposit", "not-yet-drained: graphiti-runtime episodic family"),
    ("s5.episodic.kernel_profile_observation.deposit", "not-yet-drained: graphiti-runtime episodic family"),
    ("s5.oracle.iching.cast", "not-yet-drained: oracle surface over portal-core + nara"),
    ("s5'.gnostic.status", "not-yet-drained: the gnostic family is techne::gnosis, an epi-cli subsystem"),
    ("s5'.gnostic.query", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.query_with_layers", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.ingest", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.models", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.notebook", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.list_notebooks", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.resolve", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.candidates", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.etymology", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.episode_search", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.evidence_trace", "not-yet-drained: techne::gnosis"),
    ("s5'.gnostic.musical_transcript", "not-yet-drained: techne::gnosis"),
    // 12.T12.13 — the family's only WRITE (mints the cross-namespace
    // MAPS_TO_COORDINATE edge). Same residency as its 13 siblings above: the
    // whole gnostic family is `techne::gnosis`, an epi-cli subsystem, and drains
    // to a coordinate crate as ONE family or not at all. Splitting one member
    // out ahead of the rest would fragment the seam, not drain it.
    ("s5'.gnostic.enrich", "not-yet-drained: techne::gnosis"),
];

fn dispatch_source() -> String {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("src/gate/server/dispatch.rs");
    std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("the guard must be able to read {}: {e}", path.display()))
}

/// Coordinate-prefixed method literals appearing as match arms.
///
/// A match arm is an 8-space-indented line whose first token is a string
/// literal, optionally after a `|`. Deliberately syntactic: the guard must see a
/// handler the moment someone types one, without needing the crate to compile.
fn directly_dispatched() -> BTreeSet<String> {
    let src = dispatch_source();
    let mut found = BTreeSet::new();
    for line in src.lines() {
        let Some(rest) = line.strip_prefix("        ") else {
            continue;
        };
        let trimmed = rest.trim_start();
        if !(trimmed.starts_with('"') || trimmed.starts_with("| \"")) {
            continue;
        }
        for literal in trimmed.split('"').skip(1).step_by(2) {
            let is_coordinate_method = literal
                .strip_prefix('s')
                .and_then(|r| r.strip_prefix(|c: char| c.is_ascii_digit()))
                .map(|r| r.starts_with('.') || r.starts_with("'."))
                .unwrap_or(false);
            if is_coordinate_method {
                found.insert(literal.to_owned());
            }
        }
    }
    assert!(
        !found.is_empty(),
        "the guard found no coordinate-prefixed arms at all — dispatch.rs moved or changed shape, \
         and finding nothing would silently pass forever"
    );
    found
}

#[test]
fn no_undeclared_coordinate_handler_lives_in_epi_cli() {
    let declared: BTreeSet<String> = DIRECTLY_SERVED.iter().map(|(m, _)| (*m).to_owned()).collect();
    let actual = directly_dispatched();

    let undeclared: Vec<&String> = actual.difference(&declared).collect();
    assert!(
        undeclared.is_empty(),
        "epi-cli is serving coordinate-owned method(s) that nothing declared: {undeclared:?}\n\
         \n\
         epi-cli is the CLI membrane. It may reach every layer, but it may not hold their law.\n\
         To add a gateway method: implement the handler in the owning coordinate's crate, have it\n\
         implement epi_kernel_contract::MethodHandler, add it to that crate's registration table,\n\
         and register it in router() — see Body/S/S0/epi-cli/AGENTS.md.\n\
         \n\
         Only add a line to DIRECTLY_SERVED if the method genuinely cannot live at one coordinate,\n\
         and say which of the four reasons applies. 'It was easier' is how src/gate/ grew from 41\n\
         files to 59 the last time."
    );
}

#[test]
fn the_declaration_does_not_rot_into_fiction() {
    let actual = directly_dispatched();
    let stale: Vec<&str> = DIRECTLY_SERVED
        .iter()
        .map(|(m, _)| *m)
        .filter(|m| !actual.contains(*m))
        .collect();
    assert!(
        stale.is_empty(),
        "DIRECTLY_SERVED declares method(s) epi-cli no longer dispatches: {stale:?}\n\
         They finished moving to their coordinate — delete the entries. A list that keeps naming \
         methods it no longer governs stops being read."
    );
}

#[test]
fn every_entry_states_one_of_the_four_reasons() {
    for (method, reason) in DIRECTLY_SERVED {
        let recognised = ["composite:", "S0-own:", "needs-CLI-state:", "not-yet-drained:"]
            .iter()
            .any(|prefix| reason.starts_with(prefix));
        assert!(
            recognised,
            "{method} is declared with an unrecognised reason {reason:?} — it must begin with \
             'composite:', 'S0-own:', 'needs-CLI-state:' or 'not-yet-drained:'. An unclassified \
             exception is how a permit gets written."
        );
        assert!(
            reason.len() > 20,
            "{method}'s reason is too thin to audit: {reason:?}"
        );
    }
}

#[test]
fn the_drained_families_did_not_come_back() {
    let actual = directly_dispatched();
    // The families Track 53 relocated. Their presence here would mean a handler
    // returned to the membrane, which the file-count ratchet alone could miss if
    // it landed inside a file that already names an S-crate.
    for gone in [
        "s1'.vault.read_file",
        "s1'.base.ensure",
        "s1'.entity.capture",
        "s2.graph.query",
        "s2.graph.node",
        "s2'.retrieve",
        "s3'.temporal.context",
        "s5'.review.submit",
        "s5'.improve.propose",
        "s5'.tune.registry.get",
        "s5'.epii.deposit",
    ] {
        assert!(
            !actual.contains(gone),
            "{gone} is dispatched from epi-cli again — it belongs to its coordinate's registration \
             table (Track 53 T53.04-T53.07)"
        );
    }
}
