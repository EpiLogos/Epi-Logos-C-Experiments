use epi_s3_gateway::dispatch::{
    classify_method, dispatch_kind, dispatch_plan, dispatch_plan_entry,
    methods_in_dispatch_plan_missing_from_route_table,
    methods_in_route_table_missing_from_dispatch_plan, GatewayDispatchClass, GatewayDispatchOwner,
};
use epi_s3_gateway_contract::{MethodDispatchKind, METHOD_NAMES};

#[test]
fn s3_gateway_owns_session_temporal_and_runtime_routing_contract() {
    let session = classify_method("sessions.list").expect("sessions.list should be routed");
    assert_eq!(session.owner, GatewayDispatchOwner::S3Gateway);
    assert_eq!(session.class, GatewayDispatchClass::SessionRuntime);
    assert_eq!(session.coordinate_owner, "S3");
    assert_eq!(session.agent_access_owner, "S4/S5");

    let temporal =
        classify_method("s3'.temporal.context").expect("temporal context should be routed");
    assert_eq!(temporal.owner, GatewayDispatchOwner::S3TemporalGateway);
    assert_eq!(temporal.class, GatewayDispatchClass::TemporalContext);
    assert_eq!(temporal.coordinate_owner, "S3'");

    let graphiti =
        classify_method("s5.episodic.deposit").expect("graphiti deposit should be routed");
    assert_eq!(graphiti.owner, GatewayDispatchOwner::S3GraphitiRuntime);
    assert_eq!(graphiti.class, GatewayDispatchClass::GraphitiInvocation);
    assert_eq!(graphiti.coordinate_owner, "S3/S5");
    assert_eq!(graphiti.agent_access_owner, "S5");
}

#[test]
fn all_contract_methods_are_classified_by_s3_gateway_route_table() {
    let missing = epi_s3_gateway_contract::method_names()
        .iter()
        .copied()
        .filter(|method| classify_method(method).is_none())
        .collect::<Vec<_>>();

    assert!(
        missing.is_empty(),
        "gateway methods missing S3 route ownership: {missing:?}"
    );
}

#[test]
fn extension_methods_are_explicitly_classified_without_polluting_contract_names() {
    let nara = classify_method("nara.journal.entry").expect("nara extension methods should route");
    assert_eq!(nara.owner, GatewayDispatchOwner::S4S5DomainAdapter);
    assert_eq!(nara.class, GatewayDispatchClass::NaraExtension);

    let epii = classify_method("s5'.epii.kairos.context").expect("epii extension should route");
    assert_eq!(epii.owner, GatewayDispatchOwner::S5EpiiAgent);
    assert_eq!(epii.class, GatewayDispatchClass::EpiiAgentRuntime);

    assert!(classify_method("totally.unknown").is_none());
}

#[test]
fn s0_command_surface_methods_route_through_portal_command_contract() {
    for method in ["s0.command.exec", "s0.command.completion"] {
        let route = classify_method(method).expect("S0' command method should be routed");
        assert_eq!(route.owner, GatewayDispatchOwner::S0ProductAdapter);
        assert_eq!(route.class, GatewayDispatchClass::ConfigurationSurface);
        assert_eq!(route.coordinate_owner, "S0'");
        assert_eq!(route.route_id, "s0-prime.command-surface");
    }
}

#[test]
fn s2_graph_methods_route_to_graph_service_authority() {
    for method in [
        "s2.graph.query",
        "s2.graph.node",
        "s2.graph.traverse",
        "s2.graph.pointer_web.compute",
        "s2.graph.pointer_web.refresh",
        "s2.graph.kernel_resonance.record",
        "s2'.coordinate.resolve",
        "s2'.retrieve",
        "s2'.rerank",
        "s2'.enrich",
    ] {
        let route = classify_method(method).expect("S2 graph method should be routed");
        assert_eq!(route.owner, GatewayDispatchOwner::S2GraphService);
        assert_eq!(route.class, GatewayDispatchClass::GraphService);
        assert_eq!(route.coordinate_owner, "S2/S2'");
        assert_eq!(route.agent_access_owner, "S4/S5");
    }
}

#[test]
fn kernel_resonance_episode_method_routes_to_graphiti_runtime_with_s5_access() {
    for method in [
        "s5.episodic.kernel_resonance.deposit",
        "s5.episodic.kernel_profile_observation.deposit",
    ] {
        let route = classify_method(method).expect("kernel Graphiti deposit should route");
        assert_eq!(route.owner, GatewayDispatchOwner::S3GraphitiRuntime);
        assert_eq!(route.class, GatewayDispatchClass::GraphitiInvocation);
        assert_eq!(route.coordinate_owner, "S3/S5");
        assert_eq!(route.agent_access_owner, "S5");
    }
}

// ======== 13.T2 dispatch-plan contract integration tests ========
//
// These tests assert that the S3-owned executable dispatch-plan contract
// (in `epi_s3_gateway_contract`) and the in-process route table (in
// `dispatch.rs`) agree 1:1 on every method in METHOD_NAMES. Any future
// drift between the two surfaces — including an attempt by S0 to host its
// own parallel route table for a method that the dispatch-plan doesn't
// recognise — must surface here.

#[test]
fn every_method_name_carries_a_dispatch_plan_entry() {
    let missing: Vec<&str> = METHOD_NAMES
        .iter()
        .copied()
        .filter(|method| dispatch_plan_entry(method).is_none())
        .collect();
    assert!(
        missing.is_empty(),
        "gateway methods missing executable dispatch-plan entry: {missing:?}"
    );
}

#[test]
fn dispatch_plan_and_route_table_agree_on_method_set() {
    let drift_a = methods_in_route_table_missing_from_dispatch_plan();
    assert!(
        drift_a.is_empty(),
        "methods classified by route table but absent from dispatch-plan: {drift_a:?}"
    );
    let drift_b = methods_in_dispatch_plan_missing_from_route_table();
    assert!(
        drift_b.is_empty(),
        "methods in dispatch-plan but unrecognised by route table: {drift_b:?}"
    );
}

#[test]
fn dispatch_plan_carries_the_six_canonical_kinds_plus_s1_extension() {
    // The 13.T2 plan body enumerates six dispatch kinds; 03.T6.5 added the
    // S1 Hen vault adapter as a documented extension. The plan-mandated
    // Missing variant must be expressible even if no current row uses it.
    let plan = dispatch_plan();
    let mut kinds = std::collections::HashSet::new();
    for entry in plan {
        kinds.insert(entry.kind);
    }
    assert!(kinds.contains(&MethodDispatchKind::S3NativeHandler));
    assert!(kinds.contains(&MethodDispatchKind::S2GraphServiceAdapter));
    assert!(kinds.contains(&MethodDispatchKind::S4OrchestrationAdapter));
    assert!(kinds.contains(&MethodDispatchKind::S5GovernanceAdapter));
    assert!(kinds.contains(&MethodDispatchKind::S0ProductAdapter));
    assert!(kinds.contains(&MethodDispatchKind::S1HenAdapter));
    // Missing is currently 0 entries; the variant itself is still defined
    // and reachable via construction.
    let _ = MethodDispatchKind::Missing;
}

#[test]
fn dispatch_kind_resolves_concrete_examples() {
    assert_eq!(
        dispatch_kind("sessions.list"),
        Some(MethodDispatchKind::S3NativeHandler),
        "sessions.list is S3 native"
    );
    assert_eq!(
        dispatch_kind("s2.graph.query"),
        Some(MethodDispatchKind::S2GraphServiceAdapter)
    );
    assert_eq!(
        dispatch_kind("s4'.vak.evaluate"),
        Some(MethodDispatchKind::S4OrchestrationAdapter)
    );
    assert_eq!(
        dispatch_kind("s5.episodic.deposit"),
        Some(MethodDispatchKind::S5GovernanceAdapter)
    );
    assert_eq!(
        dispatch_kind("config.get"),
        Some(MethodDispatchKind::S0ProductAdapter)
    );
    assert_eq!(
        dispatch_kind("s1'.vault.read_file"),
        Some(MethodDispatchKind::S1HenAdapter)
    );
    assert_eq!(dispatch_kind("totally.unknown"), None);
}

#[test]
fn s0_only_method_injected_into_route_table_would_be_rejected_by_dispatch_plan_guard() {
    // Regression guard: this test simulates the failure that occurs when S0
    // tries to dispatch a method that S3's dispatch-plan doesn't recognise.
    // The plan deliverable (line 91) requires: "a new test fails if a
    // method appears in S0 dispatch but is absent from S3 dispatch
    // classification."
    //
    // We model "appears in S0 dispatch" by an injected fake method and
    // verify that `dispatch_plan_entry` rejects it. If a future change
    // accidentally creates an S0-only route, this assertion forces
    // visibility.
    let fake_s0_only_method = "s0.fake.invented_by_server.never_in_contract";
    assert!(
        dispatch_plan_entry(fake_s0_only_method).is_none(),
        "an S0-only method that is not in METHOD_NAMES must be rejected by the dispatch-plan"
    );
    assert!(
        classify_method(fake_s0_only_method).is_none(),
        "an S0-only method that is not in METHOD_NAMES must be rejected by the route table"
    );
}

#[test]
fn s1_hen_adapter_methods_route_through_dispatch_plan() {
    // 03.T6.5 added these vault/semantic methods. The plan-extension
    // S1HenAdapter kind must classify them in the dispatch-plan, even
    // though the original 13.T2 plan body listed only six kinds.
    for method in [
        "s1'.vault.read_file",
        "s1'.vault.write_file",
        "s1'.vault.rename_file",
        "s1'.vault.move_file",
        "s1'.semantic.suggest_links",
    ] {
        let entry = dispatch_plan_entry(method).expect("S1 Hen method should be in dispatch-plan");
        assert_eq!(entry.kind, MethodDispatchKind::S1HenAdapter);
        assert!(entry.authority_path.contains("S1/hen-compiler-core"));
    }
}

// ======== 13.T9 route-ownership cross-walk ========
//
// Per plan body line 225: "Add a route-ownership test that compares
// `epi_s3_gateway_contract::METHOD_NAMES`, `Body/S/S3/gateway/src/dispatch.rs`,
// and S0 executable dispatch coverage."
//
// This cross-walk asserts that the three surfaces agree exactly:
//   (A) every method in `METHOD_NAMES` is classified by S3 (no orphan in
//       the contract that the dispatch table cannot route);
//   (B) every method in `METHOD_NAMES` is dispatched by S0 server.rs
//       OR is a "S3-internal" method that intentionally never reaches
//       S0 (e.g. graph-service / autoresearch / temporal that the
//       gateway services directly);
//   (C) every method dispatched by S0 server.rs (excluded: short-string
//       enum tags from internal state machines that happen to be
//       quoted) is either in METHOD_NAMES or is a known route extension
//       classified by `classify_method` (nara.* / s5'.epii.* extension
//       families).
//
// Drift in any direction surfaces here.

#[cfg(test)]
mod t9_route_ownership_cross_walk {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn workspace_root() -> PathBuf {
        // CARGO_MANIFEST_DIR for this test = .../Body/S/S3/gateway
        // → ancestors().nth(4) = repo root.
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .ancestors()
            .nth(4)
            .expect("workspace root must exist as fifth ancestor")
            .to_path_buf()
    }

    fn s0_server_source() -> String {
        let path = workspace_root().join("Body/S/S0/epi-cli/src/gate/server.rs");
        fs::read_to_string(&path).unwrap_or_else(|e| {
            panic!(
                "T9 cross-walk requires {} to be readable: {e}",
                path.display()
            )
        })
    }

    /// Extract every method name appearing as a quoted match-arm pattern in
    /// the S0 server source. Heuristic: a literal string immediately
    /// followed by ` => ` or ` | ` (the match-arm separators). This may
    /// over-match — internal enum-tag matches (e.g. `"pending"` in retry
    /// state machines) appear too — so the cross-walk filters with a
    /// well-known internal-tag exempt list.
    fn extract_s0_dispatched_methods(src: &str) -> Vec<String> {
        // Crude tokenizer: find every quoted string, check if it's
        // followed (skipping whitespace) by `=>` or `|`.
        let bytes = src.as_bytes();
        let mut out = Vec::new();
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i] == b'"' {
                let start = i + 1;
                let mut j = start;
                while j < bytes.len() && bytes[j] != b'"' {
                    if bytes[j] == b'\\' && j + 1 < bytes.len() {
                        j += 2;
                    } else {
                        j += 1;
                    }
                }
                if j >= bytes.len() {
                    break;
                }
                let raw = &src[start..j];
                // peek ahead — skip whitespace, newlines, and carriage returns
                let mut k = j + 1;
                while k < bytes.len()
                    && (bytes[k] == b' '
                        || bytes[k] == b'\t'
                        || bytes[k] == b'\n'
                        || bytes[k] == b'\r')
                {
                    k += 1;
                }
                let is_match_arm = (k + 1 < bytes.len()
                    && bytes[k] == b'='
                    && bytes[k + 1] == b'>')
                    || (k < bytes.len() && bytes[k] == b'|');
                if is_match_arm
                    && !raw.is_empty()
                    && raw
                        .chars()
                        .next()
                        .map(|c| c.is_ascii_lowercase() || c == '_')
                        .unwrap_or(false)
                {
                    out.push(raw.to_string());
                }
                i = j + 1;
            } else {
                i += 1;
            }
        }
        out.sort();
        out.dedup();
        out
    }

    /// Internal state-machine enum tags that look like methods but are not.
    fn internal_state_tags() -> &'static [&'static str] {
        &[
            "active-retry",
            "pending",
            "pending-retry",
            "retry-active",
            "retry-pending",
            "retrying",
            "shared",
            "shared-archetype",
        ]
    }

    /// Methods that live in METHOD_NAMES but never reach S0 server.rs's
    /// main `match frame.method` table because they are either dispatched
    /// directly by the S3 gateway / S2 graph / S5 autoresearch crates (no
    /// S0 surface) OR handled by an S0 pre-match special path (the
    /// `connect` handshake, recognised by `if frame.method == "connect"`
    /// at the top of `dispatch_rpc`).
    fn s3_only_methods() -> &'static [&'static str] {
        &[
            // Handshake — S0 handles it but outside the main match block,
            // so our cross-walk does not see it as a match arm.
            "connect",
            // S3 gateway runtime delegated to per-method handlers in S3.
            "agent.identity.get",
            "agents.list",
            // S0 portal command surface — routed by S3 to portal-core,
            // not by S0 server.rs.
            "s0.command.completion",
            "s0.command.exec",
            // S2 / S2' graph law — S3 dispatches directly to graph-services.
            "s2'.constraint.list",
            "s2'.constraint.register",
            "s2'.constraint.test",
            "s2'.coordinate.aggregate_resonance",
            "s2'.coordinate.analyse_resonance",
            "s2'.coordinate.cypher",
            "s2'.coordinate.ingest",
            "s2'.coordinate.persist_analysis",
            // S3' kernel envelope — pure S3 temporal gateway surface.
            "s3'.kernel.envelope.publish",
            // S5 autoresearch / anuttara — direct S5 dispatch.
            "s5'.anuttara.diagnose",
            "s5.ebm.export_state",
            "s5.ebm.train",
            "s5.trajectory.verify",
        ]
    }

    /// Route extensions: methods that classify_method handles via prefix /
    /// extension patterns (nara.*, s5'.epii.*) and that are intentionally
    /// not listed in METHOD_NAMES.
    fn is_route_extension(method: &str) -> bool {
        method.starts_with("nara.")
            || matches!(
                method,
                "s5'.epii.kairos.context"
                    | "s5'.epii.user.orientation"
                    | "s5'.epii.pratibimba.status"
            )
    }

    #[test]
    fn route_ownership_cross_walk_method_names_vs_s3_dispatch_vs_s0_dispatch() {
        let method_names: std::collections::BTreeSet<&str> =
            METHOD_NAMES.iter().copied().collect();
        let server_src = s0_server_source();
        let raw_s0 = extract_s0_dispatched_methods(&server_src);
        let internal: std::collections::BTreeSet<&str> =
            internal_state_tags().iter().copied().collect();
        let s3_only: std::collections::BTreeSet<&str> =
            s3_only_methods().iter().copied().collect();

        let s0_dispatched: std::collections::BTreeSet<String> = raw_s0
            .into_iter()
            .filter(|m| !internal.contains(m.as_str()))
            .collect();

        // (A) every METHOD_NAMES entry is classified by S3.
        let unclassified_by_s3: Vec<&str> = method_names
            .iter()
            .copied()
            .filter(|m| classify_method(m).is_none())
            .collect();
        assert!(
            unclassified_by_s3.is_empty(),
            "T9 (A) drift: METHOD_NAMES entries not classified by S3 dispatch table: {:?}",
            unclassified_by_s3
        );

        // (A2) every METHOD_NAMES entry has a dispatch-plan entry.
        let no_plan_entry: Vec<&str> = method_names
            .iter()
            .copied()
            .filter(|m| dispatch_plan_entry(m).is_none())
            .collect();
        assert!(
            no_plan_entry.is_empty(),
            "T9 (A2) drift: METHOD_NAMES entries with no dispatch-plan entry: {:?}",
            no_plan_entry
        );

        // (B) every METHOD_NAMES entry either appears in S0's match arms
        //     OR is explicitly s3-only.
        let mut missing_from_s0: Vec<&str> = Vec::new();
        for m in &method_names {
            if s3_only.contains(m) {
                continue;
            }
            if !s0_dispatched.contains(*m) {
                missing_from_s0.push(*m);
            }
        }
        assert!(
            missing_from_s0.is_empty(),
            "T9 (B) drift: methods in METHOD_NAMES that are neither dispatched \
             by S0 server.rs nor marked s3-only: {:?}. Either add the method \
             to S0's match arms or list it in s3_only_methods() with a \
             justification comment.",
            missing_from_s0
        );

        // (C) every method dispatched by S0 (after filtering internal tags)
        //     is either in METHOD_NAMES or is a known route extension.
        let mut s0_invented: Vec<String> = Vec::new();
        for m in &s0_dispatched {
            if method_names.contains(m.as_str()) {
                continue;
            }
            if is_route_extension(m) {
                continue;
            }
            s0_invented.push(m.clone());
        }
        assert!(
            s0_invented.is_empty(),
            "T9 (C) drift: methods dispatched by S0 server.rs that are neither \
             in METHOD_NAMES nor a known route extension (nara.*, s5'.epii.*): {:?}. \
             S0 must not invent its own routes — either add the method to \
             METHOD_NAMES (and to S3 classify_method) or mark it as a route \
             extension.",
            s0_invented
        );

        // (D) parity counts — for the evidence log: METHOD_NAMES ↔ s3_only ↔
        //     S0 dispatched. The set arithmetic must add up.
        let s0_only_route_extensions: usize = s0_dispatched
            .iter()
            .filter(|m| is_route_extension(m.as_str()))
            .count();
        let s0_in_method_names: usize = s0_dispatched
            .iter()
            .filter(|m| method_names.contains(m.as_str()))
            .count();
        assert_eq!(
            s0_in_method_names + s0_only_route_extensions,
            s0_dispatched.len(),
            "T9 (D) bookkeeping: every S0-dispatched method must be classified \
             (METHOD_NAMES + route extensions). Got {} in METHOD_NAMES + \
             {} route-extensions vs {} total dispatched.",
            s0_in_method_names,
            s0_only_route_extensions,
            s0_dispatched.len()
        );

        // Final invariant: METHOD_NAMES count = (S0 dispatched ∩ METHOD_NAMES) +
        //                                       s3_only_methods
        let s3_only_present_in_contract: usize =
            s3_only.iter().filter(|m| method_names.contains(*m)).count();
        assert_eq!(
            s3_only_present_in_contract,
            s3_only.len(),
            "T9 (D2) bookkeeping: every entry in s3_only_methods() must be in \
             METHOD_NAMES; otherwise the exemption is meaningless"
        );
        assert_eq!(
            s0_in_method_names + s3_only_present_in_contract,
            method_names.len(),
            "T9 (D3) bookkeeping: METHOD_NAMES ({}) must equal \
             (S0-dispatched ∩ METHOD_NAMES) ({}) + s3-only ({})",
            method_names.len(),
            s0_in_method_names,
            s3_only_present_in_contract
        );
    }
}
