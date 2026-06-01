use serde_json::{json, Value};

use crate::{
    blocked_overlay_payload, graph_contract, kernel_coordinate_anchor_from_parts,
    CoordinateResolution, GraphMethodService, PointerWebRefreshRequest,
};

pub const M5_HANDOFF_CONTRACT_VERSION: &str = "2026-06-01.02-T8";

pub const FORBIDDEN_CLIENT_DERIVATIONS: &[&str] = &[
    "graph_relations",
    "owl_inference",
    "gds_recommendations",
    "codon_mapping",
    "tarot_mapping",
    "planetary_mapping",
    "hash_to_m_resolution",
];

pub fn m5_handoff_consumption_contract() -> Result<Value, String> {
    let node_resolution = GraphMethodService::resolve_coordinate_string("#2")?;
    let pointer_plan = GraphMethodService::pointer_web_refresh_plan(&PointerWebRefreshRequest {
        coordinate: "#2".to_owned(),
        timestamp_ms: 1_779_000_001_555,
    })?;
    let graph_anchor = kernel_coordinate_anchor_from_parts(
        &node_resolution.canonical,
        &node_resolution.input,
        node_resolution.compatibility_property.clone(),
    )?;
    let descriptors = graph_anchor
        .pointer_web
        .harmonic_relation_descriptors
        .clone();
    let gds_overlay = blocked_overlay_payload(
        &node_resolution.canonical,
        "GDS procedures are unavailable in the baseline local topology; consumers must render blocked readiness, not fabricate recommendations.",
    );

    Ok(json!({
        "contractVersion": M5_HANDOFF_CONTRACT_VERSION,
        "publishedBy": "Body/S/S2/graph-services",
        "sourceAnchors": {
            "spec": "docs/specs/S/S2-S2i-GRAPH.md",
            "plan": "docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md#T8",
            "code": "Body/S/S2/graph-services/src/consumption.rs",
            "graphApi": "Body/S/S2/graph-services/src/graph_api.rs",
            "pointerCode": "Body/S/S2/graph-services/src/pointers.rs",
            "tests": ["Body/S/S2/graph-services/tests/m5_handoff_contract.rs"]
        },
        "kernelBridgeGraphClient": {
            "owner": "S2/S2' via S3 gateway/kernel-bridge adapter",
            "canonicalMethods": [
                "s2.graph.query",
                "s2.graph.node",
                "s2.graph.traverse",
                "s2.graph.pointer_web.compute",
                "s2.graph.pointer_web.refresh",
                "s2.graph.kernel_resonance.record",
                "s2'.coordinate.resolve",
                "s2'.retrieve",
                "s2'.rerank",
                "s2'.enrich"
            ],
            "readinessStates": [
                "ready",
                "blocked_no_neo4j",
                "blocked_no_n10s",
                "blocked_no_gds",
                "blocked_no_semantic_cache",
                "blocked_protected_namespace"
            ],
            "forbiddenClientDerivations": FORBIDDEN_CLIENT_DERIVATIONS,
            "rule": "clients render supplied payloads and readiness states; S2/S2' owns graph law, ontology readiness, GDS overlays, pointer descriptors, and legacy # to M resolution"
        },
        "consumerContracts": [
            {
                "surface": "M0'",
                "purpose": "graph view and Anuttara inspector",
                "requiredFixtures": ["m0_node_anuttara_gds"],
                "mustRender": ["node", "relations", "anuttara", "ontologyReadiness", "gdsOverlay", "sourceAnchors"],
                "mustNotDerive": ["owl_inference", "gds_recommendations", "hash_to_m_resolution"]
            },
            {
                "surface": "M1'",
                "purpose": "relation walker",
                "requiredFixtures": ["m1_pointer_relation_walk"],
                "mustRender": ["coordinate_anchor", "pointerWeb", "harmonic_relation_descriptors"],
                "mustNotDerive": ["graph_relations", "codon_mapping"]
            },
            {
                "surface": "M2'",
                "purpose": "correspondence provenance",
                "requiredFixtures": ["m2_correspondence_provenance"],
                "mustRender": ["relationDescriptors", "provenance", "sourceAnchors"],
                "mustNotDerive": ["tarot_mapping", "planetary_mapping", "graph_relations"]
            },
            {
                "surface": "M3'",
                "purpose": "graph/wheel dual surface",
                "requiredFixtures": ["m3_graph_wheel_dual"],
                "mustRender": ["filteredSubgraph", "wheelAnchors", "gdsOverlay"],
                "mustNotDerive": ["gds_recommendations", "codon_mapping"]
            },
            {
                "surface": "M5'",
                "purpose": "graph namespace viewer",
                "requiredFixtures": ["m5_namespace_viewer"],
                "mustRender": ["namespaceBoundaries", "sourceAnchors"],
                "mustNotDerive": ["hash_to_m_resolution", "graph_relations"]
            },
            {
                "surface": "M5-4",
                "purpose": "agentic control room",
                "requiredFixtures": ["m54_agent_context_pool"],
                "mustRender": ["contextPool", "namespaceBoundaries", "agentPermissions"],
                "mustNotDerive": ["owl_inference", "gds_recommendations", "graph_relations"]
            }
        ],
        "sampleResponseFixtures": sample_response_fixtures(
            &node_resolution,
            &pointer_plan.coordinate_anchor,
            &pointer_plan.pointer_web,
            descriptors,
            serde_json::to_value(gds_overlay).map_err(|err| err.to_string())?,
        )
    }))
}

fn sample_response_fixtures(
    node_resolution: &CoordinateResolution,
    coordinate_anchor: &crate::KernelCoordinateAnchor,
    pointer_web: &crate::PointerWeb,
    relation_descriptors: Vec<crate::HarmonicPointerRelationDescriptor>,
    gds_overlay: Value,
) -> Value {
    json!([
        {
            "id": "m0_node_anuttara_gds",
            "capturedFrom": "GraphMethodService::node envelope shape with S2-owned contract metadata",
            "method": "s2.graph.node",
            "payload": {
                "contract": graph_contract("s2.graph.node", Some(node_resolution)),
                "resolution": node_resolution,
                "node": {
                    "coordinate": "M2",
                    "uuid": "s2-fixture:M2",
                    "name": "Paraśakti",
                    "family": "M",
                    "layer": "M2",
                    "ql_position": 2,
                    "anuttara": {
                        "symbol": "@2",
                        "formulation_type": "Anuttara syntax",
                        "complete_formulation": "@2 -- graph-relational operation",
                        "provenance": {
                            "symbol": {
                                "source": "s2.neo4j",
                                "status": "s2_supplied",
                                "property": "c_1_symbol",
                                "ontologyProperty": "epi:hasSymbol"
                            },
                            "formulation_type": {
                                "source": "s2.neo4j",
                                "status": "s2_supplied",
                                "property": "c_1_formulation_type",
                                "ontologyProperty": "epi:hasFormulationType"
                            }
                        }
                    }
                },
                "relations": [
                    {
                        "type": "POS2_DUAL_RELATES",
                        "direction": "outbound",
                        "coordinate": "M3"
                    }
                ],
                "gdsOverlay": gds_overlay
            }
        },
        {
            "id": "m1_pointer_relation_walk",
            "capturedFrom": "GraphMethodService::pointer_web_refresh_plan",
            "method": "s2.graph.pointer_web.refresh",
            "payload": {
                "contract": graph_contract("s2.graph.pointer_web.refresh", Some(node_resolution)),
                "source": node_resolution,
                "coordinate_anchor": coordinate_anchor,
                "pointerWeb": pointer_web,
                "relationWalk": {
                    "source": "S2 pointer descriptors",
                    "steps": relation_descriptors
                }
            }
        },
        {
            "id": "m2_correspondence_provenance",
            "capturedFrom": "S2 pointer descriptors and graph contract source anchors",
            "method": "s2.graph.traverse",
            "payload": {
                "contract": graph_contract("s2.graph.traverse", Some(node_resolution)),
                "relationDescriptors": relation_descriptors,
                "provenance": {
                    "relationLawOwner": "S2/S2'",
                    "sourceAnchor": "Body/S/S2/graph-services/src/pointers.rs::compute_pointer_web",
                    "clientMappingPolicy": "render-only"
                }
            }
        },
        {
            "id": "m3_graph_wheel_dual",
            "capturedFrom": "S2 node/traverse plus Option 1 GDS readiness overlay",
            "method": "s2.graph.traverse",
            "payload": {
                "contract": graph_contract("s2.graph.traverse", Some(node_resolution)),
                "filteredSubgraph": {
                    "nodes": [{"coordinate": "M2"}, {"coordinate": "M3"}],
                    "edges": [{"source": "M2", "target": "M3", "type": "POS2_DUAL_RELATES"}]
                },
                "wheelAnchors": {
                    "coordinate": "M2",
                    "pointerAnchor": coordinate_anchor.harmonic_pointer,
                    "source": "S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract"
                },
                "gdsOverlay": gds_overlay
            }
        },
        {
            "id": "m5_namespace_viewer",
            "capturedFrom": "S2 graph contract namespace policy",
            "method": "s2.graph.query",
            "payload": {
                "contract": graph_contract("s2.graph.query", None),
                "namespaceBoundaries": namespace_boundaries(),
                "sourceAnchors": graph_contract("s2.graph.query", None)["sourceAnchors"].clone()
            }
        },
        {
            "id": "m54_agent_context_pool",
            "capturedFrom": "S2/S2' graph-backed context pool contract",
            "method": "s2'.retrieve",
            "payload": {
                "contract": graph_contract("s2'.retrieve", Some(node_resolution)),
                "contextPool": [
                    {
                        "coordinate": "M2",
                        "namespace": "bimba",
                        "disclosure": "public-coordinate-topology",
                        "source": "neo4j:bimba"
                    },
                    {
                        "coordinate": "M5-0",
                        "namespace": "gnosis",
                        "disclosure": "retrieval-handle",
                        "source": "rag-anything/epi-gnostic"
                    },
                    {
                        "coordinate": "M5-5",
                        "namespace": "etymology",
                        "disclosure": "retrieval-handle",
                        "source": "atelier-etymology"
                    },
                    {
                        "coordinate": "M4-protected-local",
                        "namespace": "protected-local",
                        "disclosure": "opaque-handle-only",
                        "source": "graphiti/nara-redacted"
                    }
                ],
                "namespaceBoundaries": namespace_boundaries(),
                "agentPermissions": {
                    "readContextPool": true,
                    "writeCanonicalGraph": false,
                    "depositEvidence": "S5-governed",
                    "protectedBodyAccess": false
                }
            }
        }
    ])
}

fn namespace_boundaries() -> Value {
    json!({
        "bimba": {
            "owner": "S2/S2'",
            "disclosure": "public-coordinate-topology",
            "bodyAllowed": true
        },
        "gnosis": {
            "owner": "M5-0/S5 governed retrieval",
            "disclosure": "retrieval-handle",
            "bodyAllowed": false
        },
        "etymology": {
            "owner": "M5-5 atelier",
            "disclosure": "retrieval-handle",
            "bodyAllowed": false
        },
        "protected-local": {
            "owner": "Nara/Graphiti protected substrate",
            "disclosure": "opaque-handle-only",
            "bodyAllowed": false
        }
    })
}
