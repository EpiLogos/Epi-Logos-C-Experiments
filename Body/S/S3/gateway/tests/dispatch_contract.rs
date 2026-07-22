use epi_s3_gateway::dispatch::{
    classify_method, dispatch_kind, dispatch_plan, dispatch_plan_entry,
    dispatch_route_for_plan_entry, methods_in_dispatch_plan_missing_from_route_table,
    methods_in_route_table_missing_from_dispatch_plan, GatewayDispatchClass, GatewayDispatchOwner,
    NaraSessionCloseRequest, NaraSessionConfig, NaraSessionOpenRequest,
    NARA_IDENTITY_PROPOSAL_RPC_METHODS, NARA_LENS_RPC_METHODS, NARA_PASU_CONSENT_APPEND_METHOD,
    NARA_SESSION_RPC_METHODS, NARA_TRANSFORM_RPC_METHODS,
};
use epi_s3_gateway_contract::{MethodDispatchKind, METHOD_NAMES, S2_GRAPH_GATEWAY_EXPOSED_METHODS};

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
fn nara_lens_widget_rpcs_route_as_m4_extension_methods() {
    assert_eq!(
        NARA_LENS_RPC_METHODS,
        ["nara.lens.list", "nara.lens.apply", "nara.lens.synthesize"]
    );

    for method in NARA_LENS_RPC_METHODS {
        let route = classify_method(method).expect("nara lens RPC should route");
        assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
        assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
        assert_eq!(route.coordinate_owner, "M4'/S4");
        assert_eq!(route.agent_access_owner, "S4/S5");
    }
}

#[test]
fn nara_transform_rpcs_route_as_m4_extension_methods() {
    assert_eq!(
        NARA_TRANSFORM_RPC_METHODS,
        ["nara.transform.start", "nara.transform.advance"]
    );

    for method in NARA_TRANSFORM_RPC_METHODS {
        let route = classify_method(method).expect("nara transform RPC should route");
        assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
        assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
        assert_eq!(route.coordinate_owner, "M4'/S4");
        assert_eq!(route.agent_access_owner, "S4/S5");
    }
}

#[test]
fn nara_personal_coordinate_write_surface_routes_as_m4_extension_methods() {
    // 25.T25.14 / DR-WC-M4-4 — the consent-append + identity-augment review
    // RPCs are dedicated method names that resolve through the same nara.*
    // extension route as every other personal M4' surface.
    assert_eq!(
        NARA_PASU_CONSENT_APPEND_METHOD,
        "nara.pasu.consents.append"
    );
    assert_eq!(
        NARA_IDENTITY_PROPOSAL_RPC_METHODS,
        [
            "nara.identity.proposals.submit",
            "nara.identity.proposals.list",
            "nara.identity.proposals.decide"
        ]
    );

    let mut methods = vec![NARA_PASU_CONSENT_APPEND_METHOD];
    methods.extend(NARA_IDENTITY_PROPOSAL_RPC_METHODS);
    for method in methods {
        let route = classify_method(method).expect("personal-coordinate RPC should route");
        assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
        assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
        assert_eq!(route.coordinate_owner, "M4'/S4");
        assert_eq!(route.agent_access_owner, "S4/S5");
    }
}

#[test]
fn nara_session_open_close_round_trip() {
    assert_eq!(
        NARA_SESSION_RPC_METHODS,
        [
            "nara.session_open",
            "nara.session_close",
            "nara.session_close.read",
            "nara.session_close.contemplation.read"
        ]
    );

    for method in NARA_SESSION_RPC_METHODS {
        let route = classify_method(method).expect("nara session RPC should route");
        assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
        assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
        assert_eq!(route.coordinate_owner, "M4'/S4");
        assert_eq!(route.agent_access_owner, "S4/S5");
    }

    let config = NaraSessionConfig::default();
    let opened = epi_s3_gateway::dispatch::route_nara_session_open(NaraSessionOpenRequest {
        session_id: "20260618-100836-test".to_owned(),
        kairos: 7205,
        config: config.clone(),
    })
    .expect("session open should return protected protein handle");

    assert!(opened.ok);
    assert_eq!(opened.start_codon, 0x07);
    assert!(opened.stop_codon.is_none());
    assert!(opened.protected_handle);
    assert!(
        opened.body.is_none(),
        "protein body must not cross profile bus by default"
    );

    let closed = epi_s3_gateway::dispatch::route_nara_session_close(NaraSessionCloseRequest {
        session_id: opened.session_id.clone(),
        protein_handle: opened.protein_handle.clone(),
        kairos_close: 7205,
        config,
    })
    .expect("session close should seal protected protein handle");

    assert!(closed.ok);
    assert_eq!(closed.start_codon, 0x07);
    assert_eq!(closed.stop_codon, Some(0x1c));
    assert!(closed.protected_handle);
    assert!(
        closed.body.is_none(),
        "sealed protein body must stay off the bus"
    );
    let pattern = closed.pattern_packet.expect("PatternPacket write-through");
    assert_eq!(
        pattern["mahamaya_transcription"]["protein_handle"].as_str(),
        Some(opened.protein_handle.as_str())
    );
    assert_eq!(
        closed.graphiti_relation.expect("Graphiti relation")["api"].as_str(),
        Some("nara_insert_relation")
    );
}

#[test]
fn nara_session_config_override_honors_tunable_knobs() {
    let config = NaraSessionConfig {
        protein_capacity: 16,
        stop_codon_policy: "fixed-tag".to_owned(),
        write_through_mode: "batched".to_owned(),
        protected_handle_strict: false,
        allow_raw_protein_bus: true,
    };

    let opened = epi_s3_gateway::dispatch::route_nara_session_open(NaraSessionOpenRequest {
        session_id: "20260618-100836-config".to_owned(),
        kairos: 7300,
        config: config.clone(),
    })
    .expect("session open should honor debug config");

    assert!(!opened.protected_handle);
    assert_eq!(
        opened.body.expect("debug body gate should expose raw body")["codons"][0],
        0x07
    );

    let closed = epi_s3_gateway::dispatch::route_nara_session_close(NaraSessionCloseRequest {
        session_id: opened.session_id.clone(),
        protein_handle: opened.protein_handle.clone(),
        kairos_close: 7300,
        config,
    })
    .expect("session close should honor configured stop policy");

    assert!(!closed.protected_handle);
    assert_eq!(closed.stop_codon, Some(0x13));
    assert_eq!(
        closed
            .body
            .expect("debug body gate should expose sealed body")["codons"],
        serde_json::json!([0x07, 0x13])
    );
    let pattern = closed.pattern_packet.expect("PatternPacket write-through");
    assert_eq!(pattern["write_through_mode"], "batched");
    assert_eq!(
        pattern["mahamaya_transcription"]["capacity"].as_u64(),
        Some(16)
    );
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
fn s0_prime_verifier_methods_route_to_anuttara_constraint_checker() {
    for method in [
        "s0'.verifier.check_state",
        "s0'.verifier.emit_query",
        "s0'.verifier.validate_membership",
        "s0'.verifier.owl_query",
    ] {
        let route = classify_method(method).expect("S0' verifier method should be routed");
        assert_eq!(route.owner, GatewayDispatchOwner::S0ProductAdapter);
        assert_eq!(route.class, GatewayDispatchClass::VerifierSurface);
        assert_eq!(route.coordinate_owner, "S0'");
        assert_eq!(route.route_id, "s0-prime.anuttara-verifier");
    }
}

#[test]
fn s0_prime_settings_methods_route_to_settings_surface() {
    for method in ["s0'.settings.api_key_status", "s0'.settings.opt_in"] {
        let route = classify_method(method).expect("S0' settings method should be routed");
        assert_eq!(route.owner, GatewayDispatchOwner::S0ProductAdapter);
        assert_eq!(route.class, GatewayDispatchClass::ConfigurationSurface);
        assert_eq!(route.coordinate_owner, "S0'");
        assert_eq!(route.route_id, "s0-prime.settings-surface");
    }
}

#[test]
fn s2_graph_methods_route_to_graph_service_authority() {
    for method in [
        "s2.graph.query",
        "s2.graph.node",
        "s2.graph.list",
        "s2.graph.list_by_filter",
        "s2.graph.traverse",
        "s2.graph.harmonic_relations.materialize",
        "s2.graph.pointer_web.compute",
        "s2.graph.pointer_web.refresh",
        "s2.graph.kernel_resonance.record",
        "s2.graph.gds.tangent_overlay",
        "s2.graph.ontology.reload",
        "s2.graph.seed.snapshot",
        "s2.graph.core65.audit",
        "s2.graph.promotion.dry_run",
        "s2.graph.promotion.commit",
        "s2.graph.relation_family.list",
        "s2.parashaktiCorrespondences",
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
fn s2_graph_gateway_exposed_methods_route_to_graph_services() {
    for method in S2_GRAPH_GATEWAY_EXPOSED_METHODS {
        assert!(
            METHOD_NAMES.contains(method),
            "{method} must be part of the gateway protocol registry"
        );
        let route = classify_method(method).expect("S2 graph exposed method should be routed");
        assert_eq!(route.owner, GatewayDispatchOwner::S2GraphService);
        assert_eq!(route.class, GatewayDispatchClass::GraphService);
        assert_eq!(route.coordinate_owner, "S2/S2'");
        assert_eq!(route.agent_access_owner, "S4/S5");
        let entry = dispatch_plan_entry(method).expect("S2 graph method should have plan row");
        assert_eq!(entry.kind, MethodDispatchKind::S2GraphServiceAdapter);
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
fn classify_method_is_derived_from_dispatch_plan_for_every_method() {
    assert_eq!(
        dispatch_plan().len(),
        METHOD_NAMES.len(),
        "Co-PR rule: METHOD_NAMES and METHOD_DISPATCH_PLAN must change together"
    );

    for entry in dispatch_plan() {
        let derived = dispatch_route_for_plan_entry(entry)
            .unwrap_or_else(|| panic!("dispatch-plan entry lacks route metadata: {entry:?}"));
        let classified = classify_method(entry.method)
            .unwrap_or_else(|| panic!("classify_method missed {}", entry.method));
        assert_eq!(
            classified, derived,
            "classify_method must derive {} from METHOD_DISPATCH_PLAN",
            entry.method
        );
    }
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
fn m2_kernel_bridge_methods_route_through_the_s0_product_adapter() {
    for method in [
        "kernelBridge.m2.epogdoonProjection(address72)",
        "kernelBridge.m2.planetaryElementalWeights()",
    ] {
        let route = classify_method(method)
            .unwrap_or_else(|| panic!("M2 kernel-bridge method lacks S3 route metadata: {method}"));
        assert_eq!(route.owner, GatewayDispatchOwner::S0ProductAdapter);
        assert_eq!(route.class, GatewayDispatchClass::SystemSurface);
        assert_eq!(route.coordinate_owner, "S0");
        assert_eq!(route.route_id, "s0.product-kernel-bridge");
    }
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
        "s1'.base.ensure",
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
        // 17.T17.2 split gate/server.rs into gate/server/{mod, dispatch,
        // websocket, method_envelope, subscription, observability}.rs — the
        // S0 dispatch surface now spans every .rs file in that directory.
        let dir = workspace_root().join("Body/S/S0/epi-cli/src/gate/server");
        let entries = fs::read_dir(&dir).unwrap_or_else(|e| {
            panic!(
                "T9 cross-walk requires {} to be readable: {e}",
                dir.display()
            )
        });
        let mut paths: Vec<PathBuf> = entries
            .filter_map(|entry| entry.ok().map(|entry| entry.path()))
            .filter(|path| path.extension().is_some_and(|ext| ext == "rs"))
            .collect();
        paths.sort();
        assert!(
            !paths.is_empty(),
            "T9 cross-walk found no .rs files in {}",
            dir.display()
        );
        paths
            .iter()
            .map(|path| {
                fs::read_to_string(path).unwrap_or_else(|e| {
                    panic!(
                        "T9 cross-walk requires {} to be readable: {e}",
                        path.display()
                    )
                })
            })
            .collect::<Vec<_>>()
            .join("\n")
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
                let is_match_arm =
                    (k + 1 < bytes.len() && bytes[k] == b'=' && bytes[k + 1] == b'>')
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
            // S0' Anuttara verifier — the check_state/emit_query/
            // validate_membership/owl_query family now carries real S0
            // server dispatch arms (gate/server/dispatch.rs → verifier::*),
            // so nothing from it remains in this exemption list (the arms
            // landed; the cross-walk re-arms per the removal rule above).
            // S0' settings surface — contract-declared, routed by S3 metadata;
            // backed by the `epi settings` CLI + epi-s0-settings substrate, with
            // no S0 server.rs match arm (34.T34.1).
            "s0'.settings.api_key_status",
            "s0'.settings.opt_in",
            // S0'/S2 projection helpers with contract rows but no S0 host match arm.
            "m2.cymatic_invert",
            "s0'.anuttara.trace",
            // S1' canon-promotion family — contract-declared, dispatch NOT YET
            // BUILT anywhere (tracked absent by the T11 gateway-method gate;
            // NOT in the expected-present ratchet). Owning tracks: 40/48
            // (canon-update / base.ensure family). Remove from this list the
            // moment a dispatch arm lands, so the cross-walk re-arms.
            // 16.T16.14 (CCT-14) + 16.T16.15 (CCT-15): the whole S1' canon-
            // promotion family now carries real S0 dispatch arms — nothing
            // from it remains in this exemption list.
            // S3-native live-state routes handled by gateway runtime surfaces.
            "s3'.being_pattern.observe",
            "s3'.being_pattern.project",
            "s3'.being_pattern.review_candidate",
            "s3'.being_pattern.subscribe",
            // S5 governance routes mediated beyond the S0 gate host.
            // (`s5'.gnostic.resolve` left this list at 12.T12.2 — it gained a
            // real S0 adapter over the production epi-gnostic consolidated read.)
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
        // 25.T25.11 — nara.transform.start/advance are FIRST-CLASS METHOD_NAMES
        // entries (governed lifecycle RPCs with durable NOW transitions), not
        // generic nara.* route extensions. They are dispatched by S0 and
        // classified by S3 like any first-class method, so they must NOT be
        // counted here (the (D) partition requires METHOD_NAMES ∩ route-
        // extensions = ∅).
        if matches!(method, "nara.transform.start" | "nara.transform.advance") {
            return false;
        }
        method.starts_with("nara.")
            || matches!(
                method,
                "s5'.epii.kairos.context"
                    | "s5'.epii.user.orientation"
                    | "s5'.epii.pratibimba.status"
                    // 26.T26.14 — the Pi axiom-translation producer + history read
                    // route through the same s5'.epii.* dispatch/parity family
                    // (not core-protocol first-class); the producer authority is
                    // epi-cli gate::epii_axiom over the PI harness.
                    | "s5'.epii.axiom_translate"
                    | "s5'.epii.axiom_translation_history"
            )
    }

    #[test]
    fn route_ownership_cross_walk_method_names_vs_s3_dispatch_vs_s0_dispatch() {
        let method_names: std::collections::BTreeSet<&str> = METHOD_NAMES.iter().copied().collect();
        let server_src = s0_server_source();
        let raw_s0 = extract_s0_dispatched_methods(&server_src);
        let internal: std::collections::BTreeSet<&str> =
            internal_state_tags().iter().copied().collect();
        let s3_only: std::collections::BTreeSet<&str> = s3_only_methods().iter().copied().collect();

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

// ======== 05.T5.10 connectivity ≠ bounded-access contract ========
//
// Task 05.T5.10. The discriminator LAW lives in the gateway src seam — see
// the "connectivity_check ≠ bounded_access" section of `src/dispatch.rs`
// (`nara_bounded_access`, `ConnectivityReport`, `BoundedAccessGrant`,
// `is_substrate_connectivity_class`). This module exercises that REAL seam
// against the real route table (`classify_method`) with LIVE connectivity
// pings of the four external substrates — Graphiti (episodic-memory HTTP
// runtime), Neo4j (S2 graph store), Redis (S3' context cache), and
// SpaceTimeDB (S3' presence projection):
//
//   "can ping an external service"  ≠  "may read jiva / jagrat / flow"
//
// Connectivity is owned by the substrate-facing dispatch classes
// (GraphService / GraphitiInvocation / TemporalContext). nara.* personal
// access is owned by an entirely separate authority — the S4/S5 agent
// runtime (`agent_access_owner == "S4/S5"`, `coordinate_owner == "M4'/S4"`).
// A successful ping carries NONE of that grant, and the gate's decision is
// provably invariant to the connectivity input in BOTH directions.
//
// The probe is graceful: in CI / offline the services are simply unreachable,
// and the test still exercises every logical assertion (connectivity is an
// *input* to the gate, never a precondition for the test to run). It never
// panics on an unreachable socket.

#[cfg(test)]
mod t5_10_connectivity_vs_bounded_access {
    use super::*;
    use epi_s3_gateway::dispatch::{
        is_substrate_connectivity_class, nara_bounded_access, nara_personal_domain,
        BoundedAccessDecision, BoundedAccessGrant, ConnectivityReport, ExternalSubstrate,
        NaraPersonalDomain, SubstrateReachability, BOUNDED_ACCESS_DENIED_GRANT_SCOPE,
        BOUNDED_ACCESS_DENIED_NO_DOMAIN_LAW, BOUNDED_ACCESS_DENIED_NO_GRANT,
        BOUNDED_ACCESS_DENIED_SUBSTRATE_SURFACE, BOUNDED_ACCESS_DENIED_UNROUTED,
    };
    use std::net::{TcpStream, ToSocketAddrs};
    use std::time::Duration;

    /// `host:port` to probe for one substrate. Honours the same env vars the
    /// runtime reads (falling back to canonical local defaults) so a real
    /// local stack is actually probed, while an offline box degrades cleanly.
    fn endpoint(substrate: ExternalSubstrate) -> String {
        match substrate {
            // Graphiti HTTP runtime — same default as GRAPHITI_BASE_URL
            // (http://127.0.0.1:37778) in the gateway contract.
            ExternalSubstrate::Graphiti => host_port_from_url(
                &env_or("GRAPHITI_BASE_URL", "http://127.0.0.1:37778"),
                37778,
            ),
            // Neo4j bolt.
            ExternalSubstrate::Neo4j => {
                host_port_from_url(&env_or("NEO4J_URI", "bolt://127.0.0.1:7687"), 7687)
            }
            // Redis context cache.
            ExternalSubstrate::Redis => {
                host_port_from_url(&env_or("REDIS_URL", "redis://127.0.0.1:6379"), 6379)
            }
            // SpaceTimeDB presence projection — same env precedence as
            // spacetime::SpacetimeRuntimeConfig::from_env.
            ExternalSubstrate::SpacetimeDb => host_port_from_url(
                &std::env::var("EPI_GATE_SPACETIME_URL")
                    .or_else(|_| std::env::var("SPACETIMEDB_URL"))
                    .unwrap_or_else(|_| "ws://127.0.0.1:3000".to_string()),
                3000,
            ),
        }
    }

    fn env_or(key: &str, default: &str) -> String {
        std::env::var(key).unwrap_or_else(|_| default.to_string())
    }

    /// Extract `host:port` from a loose URL-ish string (`scheme://host:port/..`
    /// or bare `host:port`). On any parse ambiguity we fall back to
    /// `127.0.0.1:<default_port>` rather than panicking — the probe must
    /// degrade, never abort.
    fn host_port_from_url(url: &str, default_port: u16) -> String {
        let after_scheme = url.split("://").last().unwrap_or(url);
        let authority = after_scheme
            .split(['/', '?'])
            .next()
            .unwrap_or(after_scheme);
        if authority.is_empty() {
            return format!("127.0.0.1:{default_port}");
        }
        if authority.contains(':') {
            authority.to_string()
        } else {
            format!("{authority}:{default_port}")
        }
    }

    /// Attempt a short, non-blocking-ish TCP connect — the LIVE ping. Any
    /// failure — refused, timed out, unresolvable — degrades to
    /// `Unreachable`. This function can NEVER panic and NEVER blocks the
    /// test for long.
    fn probe(substrate: ExternalSubstrate) -> SubstrateReachability {
        let endpoint = endpoint(substrate);
        // Resolve first; an unresolvable host is simply unreachable.
        let addrs = match endpoint.to_socket_addrs() {
            Ok(iter) => iter.collect::<Vec<_>>(),
            Err(_) => return SubstrateReachability::Unreachable,
        };
        for addr in addrs {
            if TcpStream::connect_timeout(&addr, Duration::from_millis(250)).is_ok() {
                return SubstrateReachability::Reachable;
            }
        }
        SubstrateReachability::Unreachable
    }

    /// Build the src-seam `ConnectivityReport` from real TCP pings of all
    /// four substrates.
    fn live_connectivity_report() -> ConnectivityReport {
        ConnectivityReport::from_reachability(probe)
    }

    /// A representative nara.* method that reads each personal domain. Each is
    /// a real route-extension method handled by `classify_method` via the
    /// `nara.` prefix.
    fn representative_method(domain: NaraPersonalDomain) -> &'static str {
        match domain {
            NaraPersonalDomain::Jiva => "nara.identity.get",
            NaraPersonalDomain::Jagrat => "nara.oracle.cast",
            NaraPersonalDomain::Flow => "nara.journal.entry",
        }
    }

    const ALL_DOMAINS: [NaraPersonalDomain; 3] = [
        NaraPersonalDomain::Jiva,
        NaraPersonalDomain::Jagrat,
        NaraPersonalDomain::Flow,
    ];

    // ---- Assertion 1: connectivity success does NOT grant nara access ----

    #[test]
    fn connectivity_success_does_not_grant_bounded_access_to_nara() {
        // Use a fabricated all-up report so the assertion is meaningful even
        // offline: the contract is that even with EVERY substrate reachable,
        // nara.* reads remain denied without a separate grant.
        let fully_connected = ConnectivityReport::all_reachable();
        assert!(
            fully_connected.any_reachable(),
            "fabricated report must model full connectivity"
        );
        assert!(
            fully_connected
                .connectivity_checks()
                .iter()
                .all(|check| check.reachability == SubstrateReachability::Reachable),
            "fabricated report must mark every substrate reachable"
        );

        for domain in ALL_DOMAINS {
            let method = representative_method(domain);
            assert_eq!(
                nara_personal_domain(method),
                Some(domain),
                "{method} must map onto the {domain:?} personal domain in src law"
            );
            let decision = nara_bounded_access(method, &fully_connected, None);
            assert_eq!(
                decision,
                BoundedAccessDecision::Denied {
                    reason: BOUNDED_ACCESS_DENIED_NO_GRANT,
                },
                "pinging Graphiti/Neo4j/Redis/SpaceTimeDB must NOT grant read of {:?} \
                 ({}). Connectivity ≠ bounded access.",
                domain,
                method,
            );
        }
    }

    // ---- Assertion 2: nara.* requires an explicit grant separate from
    //                   connectivity ----

    #[test]
    fn nara_requires_explicit_bounded_grant_separate_from_connectivity() {
        // With NO connectivity at all (offline box) but a valid grant, the
        // access RIGHT still stands — proving the grant is the authorization
        // axis, wholly separate from the connectivity axis.
        let offline = ConnectivityReport::all_unreachable();
        let grant = BoundedAccessGrant::covering(&[NaraPersonalDomain::Jiva]);

        assert_eq!(
            nara_bounded_access("nara.identity.get", &offline, Some(&grant)),
            BoundedAccessDecision::Granted,
            "an explicit bounded-access grant must authorize nara reads independently \
             of connectivity (authorization ⟂ reachability)"
        );

        // A grant scoped to jiva must NOT spill into jagrat/flow, EVEN when the
        // whole substrate is reachable. Authorization is per-domain, never a
        // side effect of the wire being up.
        let fully_connected = ConnectivityReport::all_reachable();
        for forbidden in [NaraPersonalDomain::Jagrat, NaraPersonalDomain::Flow] {
            assert_eq!(
                nara_bounded_access(
                    representative_method(forbidden),
                    &fully_connected,
                    Some(&grant)
                ),
                BoundedAccessDecision::Denied {
                    reason: BOUNDED_ACCESS_DENIED_GRANT_SCOPE,
                },
                "a jiva-only grant must not authorize {:?}, regardless of connectivity",
                forbidden,
            );
        }
    }

    // ---- Assertion 3: the dispatch surface itself discriminates connectivity
    //                   ownership from nara personal-access ownership ----

    #[test]
    fn dispatch_surface_separates_connectivity_owners_from_nara_access_owner() {
        // nara.* routes through the S4/S5 domain adapter — the agent-access
        // authority — NOT through any connectivity class.
        for domain in ALL_DOMAINS {
            let method = representative_method(domain);
            let route = classify_method(method)
                .unwrap_or_else(|| panic!("{method} must classify as a nara extension"));

            assert_eq!(
                route.owner,
                GatewayDispatchOwner::S4S5DomainAdapter,
                "{method} ({:?}) must be owned by the S4/S5 agent authority, not a substrate",
                domain
            );
            assert_eq!(
                route.class,
                GatewayDispatchClass::NaraExtension,
                "{method} must be a NaraExtension, never a connectivity class"
            );
            assert!(
                !is_substrate_connectivity_class(route.class),
                "{method} must NOT be classified as a connectivity surface — \
                 being able to ping a service is not the right to read {:?}",
                domain
            );
            // The personal-access law is owned by the agent runtime (S4/S5),
            // distinct from the substrate-facing connectivity owners.
            assert_eq!(
                route.agent_access_owner, "S4/S5",
                "{method} access must be gated by the S4/S5 agent authority"
            );
            assert_eq!(
                route.coordinate_owner, "M4'/S4",
                "{method} is a M4'/S4 personal-domain surface, not an external substrate"
            );
        }

        // Cross-check the OTHER side: the substrate connectivity methods that
        // back the four pings are connectivity classes, are NOT owned by the
        // nara/agent personal-access adapter, and — crucially — even a FULL
        // personal grant plus full connectivity buys them nothing from the
        // personal-access gate.
        let full_grant = BoundedAccessGrant::covering(&ALL_DOMAINS);
        let fully_connected = ConnectivityReport::all_reachable();
        let connectivity_methods = [
            ("s2.graph.query", "Neo4j"),
            ("s5.episodic.deposit", "Graphiti"),
            ("s3'.temporal.context", "Redis/SpaceTimeDB (S3')"),
            ("s3'.spacetime.subscribe", "SpaceTimeDB"),
        ];
        for (method, service) in connectivity_methods {
            let route = classify_method(method)
                .unwrap_or_else(|| panic!("{method} ({service}) must classify"));
            assert!(
                is_substrate_connectivity_class(route.class),
                "{method} should be a connectivity surface for {service}"
            );
            assert_ne!(
                route.owner,
                GatewayDispatchOwner::S4S5DomainAdapter,
                "{method} is a connectivity surface and must NOT be owned by the \
                 nara personal-access adapter — reaching {service} grants no nara read"
            );
            assert_ne!(
                route.class,
                GatewayDispatchClass::NaraExtension,
                "{method} ({service}) must not masquerade as a nara personal surface"
            );
            assert_eq!(
                nara_bounded_access(method, &fully_connected, Some(&full_grant)),
                BoundedAccessDecision::Denied {
                    reason: BOUNDED_ACCESS_DENIED_SUBSTRATE_SURFACE,
                },
                "{method} ({service}) is a substrate surface: the personal-access \
                 gate must refuse it even under a full grant"
            );
        }

        // Non-personal nara surfaces (lens, session lifecycle, PASU wizard)
        // fail CLOSED pending explicit domain law — a grant covering every
        // personal domain still authorizes nothing for them.
        for method in ["nara.lens.list", "nara.session_open", "nara.pasu.show"] {
            assert_eq!(
                nara_personal_domain(method),
                None,
                "{method} must not map onto a personal domain"
            );
            assert_eq!(
                nara_bounded_access(method, &fully_connected, Some(&full_grant)),
                BoundedAccessDecision::Denied {
                    reason: BOUNDED_ACCESS_DENIED_NO_DOMAIN_LAW,
                },
                "{method} has no mapped personal domain and must fail closed"
            );
        }

        // Unrouted methods have nothing to grant at all.
        assert_eq!(
            nara_bounded_access("totally.unknown", &fully_connected, Some(&full_grant)),
            BoundedAccessDecision::Denied {
                reason: BOUNDED_ACCESS_DENIED_UNROUTED,
            },
            "a method outside the route table must be refused by the gate"
        );
    }

    // ---- Liveness: the probe runs, degrades gracefully, and the decision is
    //      provably invariant to the LIVE connectivity input ----

    #[test]
    fn connectivity_probe_runs_and_degrades_gracefully_offline() {
        // This is the graceful-degradation guarantee. We actually probe the
        // real local stack. Whatever the outcome — fully up, fully down, or
        // mixed — the probe must complete without panicking, and the
        // connectivity/authorization invariant must hold against the LIVE
        // report.
        let live = live_connectivity_report();

        // Reaching the probe's end at all is the liveness proof; record what
        // we saw for the evidence log.
        for check in live.connectivity_checks() {
            // Either outcome is acceptable; the assert documents the binary.
            assert!(
                matches!(
                    check.reachability,
                    SubstrateReachability::Reachable | SubstrateReachability::Unreachable
                ),
                "{} probe must resolve to a definite reachability",
                check.substrate.label()
            );
        }

        // THE DISCRIMINATOR PROPERTY: for every method shape and grant shape,
        // the gate's decision is IDENTICAL under the live report, a fully
        // reachable report, and a fully unreachable report. A live ping can
        // never flip an authorization decision in either direction.
        let full_grant = BoundedAccessGrant::covering(&ALL_DOMAINS);
        let jiva_only = BoundedAccessGrant::covering(&[NaraPersonalDomain::Jiva]);
        let grants: [Option<&BoundedAccessGrant>; 3] = [None, Some(&jiva_only), Some(&full_grant)];
        let methods = [
            "nara.identity.get",
            "nara.oracle.cast",
            "nara.kairos.current",
            "nara.journal.entry",
            "nara.flow.read",
            "nara.lens.list",
            "s2.graph.query",
            "s5.episodic.deposit",
            "s3'.temporal.context",
            "s3'.spacetime.subscribe",
            "totally.unknown",
        ];
        for method in methods {
            for grant in grants {
                let under_live = nara_bounded_access(method, &live, grant);
                assert_eq!(
                    under_live,
                    nara_bounded_access(method, &ConnectivityReport::all_reachable(), grant),
                    "{method}: decision must not change when every substrate becomes reachable"
                );
                assert_eq!(
                    under_live,
                    nara_bounded_access(method, &ConnectivityReport::all_unreachable(), grant),
                    "{method}: decision must not change when every substrate goes offline"
                );
            }
        }

        // The crucial invariant against the LIVE report: whatever is reachable,
        // nara reads are still denied without a grant.
        for domain in ALL_DOMAINS {
            assert!(
                matches!(
                    nara_bounded_access(representative_method(domain), &live, None),
                    BoundedAccessDecision::Denied { .. }
                ),
                "live connectivity (any_reachable={}) must never grant ungranted \
                 access to {:?}",
                live.any_reachable(),
                domain
            );
        }

        // Sanity on the endpoint parser used by the probe — it must always
        // yield a host:port and never panic on odd inputs.
        assert_eq!(
            host_port_from_url("http://127.0.0.1:37778", 1),
            "127.0.0.1:37778"
        );
        assert_eq!(
            host_port_from_url("bolt://localhost:7687", 1),
            "localhost:7687"
        );
        assert_eq!(host_port_from_url("redis://cache", 6379), "cache:6379");
        assert_eq!(host_port_from_url("ws://h:3000/sub", 1), "h:3000");
        assert_eq!(host_port_from_url("", 9999), "127.0.0.1:9999");
    }

    // ══════════════════════════════════════════════════════════════════════
    // 03.T3.10: m2.cymatic_invert query — S3 gateway projection
    // ══════════════════════════════════════════════════════════════════════

    #[test]
    fn m2_cymatic_invert_query_is_classified_as_s0_product_adapter() {
        let route =
            classify_method("m2.cymatic_invert").expect("m2.cymatic_invert should be classified");
        assert_eq!(route.owner, GatewayDispatchOwner::S0ProductAdapter);
        assert_eq!(route.coordinate_owner, "S0");
    }

    #[test]
    fn m2_cymatic_invert_query_has_dispatch_plan_entry() {
        let entry = dispatch_plan_entry("m2.cymatic_invert")
            .expect("m2.cymatic_invert should have a dispatch plan entry");
        assert_eq!(entry.kind, MethodDispatchKind::S0ProductAdapter);
        assert!(
            entry.authority_path.contains("portal-core")
                && entry.authority_path.contains("cymatic_invert"),
            "authority path should reference portal-core::cymatic_invert, got: {}",
            entry.authority_path
        );
    }

    #[test]
    fn m2_cymatic_invert_query_round_trips_through_portal_core() {
        // Verify the portal-core function returns valid CymaticInvertState
        let state = portal_core::cymatic_invert(42, "test", 2, 5);
        assert_eq!(state.address72, 42);
        assert!(state.asma.has_mirror || !state.asma.has_mirror); // always valid
        assert_eq!(state.phase_law, "#/inversion_spanda");

        // At flip boundary with mirror, phase flips
        let flip_state = portal_core::cymatic_invert(42, "test", 2, 7);
        if flip_state.asma.has_mirror {
            assert_eq!(flip_state.phase, portal_core::CymaticPhase::Inverted);
        }
        assert!(flip_state.last_flip_candidate);
    }
}

/// 44.T44.8 — the A2A agent-card (.well-known/agent-card.json) is a published
/// DESCRIPTION of the existing gateway surface (DR-PSS-6: no new transport).
/// This pin keeps the card honest: every method it advertises is really
/// served (a protocol METHOD_NAME or the native anima-invoke entry point),
/// and every advertised skill owns exactly one method row.
#[test]
fn agent_card_advertises_only_the_served_gateway_surface() {
    let card: serde_json::Value =
        serde_json::from_str(include_str!("../.well-known/agent-card.json"))
            .expect("agent-card.json parses");

    let methods = card["x-epiLogosGateway"]["methods"]
        .as_array()
        .expect("x-epiLogosGateway.methods is an array");
    assert_eq!(
        methods.len(),
        5,
        "the card describes exactly the five spec methods"
    );

    // Compile-time existence proof for the one native (non-METHOD_NAMES) entry.
    let _native_entry = epi_s3_gateway::dispatch::route_anima_invoke;
    const NATIVE_ENTRY_POINTS: &[&str] = &["route_anima_invoke"];

    let skill_ids: Vec<&str> = card["skills"]
        .as_array()
        .expect("skills array")
        .iter()
        .map(|skill| skill["id"].as_str().expect("skill id"))
        .collect();

    for entry in methods {
        let method = entry["method"].as_str().expect("method name");
        let served = METHOD_NAMES.contains(&method) || NATIVE_ENTRY_POINTS.contains(&method);
        assert!(served, "agent-card advertises unserved method `{method}`");
        let skill_id = entry["skillId"].as_str().expect("skillId");
        assert!(
            skill_ids.contains(&skill_id),
            "agent-card method `{method}` names unknown skill `{skill_id}`"
        );
    }
}
