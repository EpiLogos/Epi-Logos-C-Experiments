use serde_json::{json, Value};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};

const BIMBA_MAP_SOURCE_REVISION: &str = "daa660cbc1b8c5da83828698665a753852cb0287";

fn temp_root(label: &str) -> PathBuf {
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let root = std::env::temp_dir().join(format!("epi-personal-{label}-{nonce}"));
    fs::create_dir_all(&root).unwrap();
    root
}

fn context_file(root: &Path) -> PathBuf {
    let path = root.join("nara-context.json");
    fs::write(
        &path,
        serde_json::to_vec_pretty(&json!({
            "identityRef": "epi:nara:identity:local-personal-test",
            "personalFieldRef": "central:project:test:now",
            "dayId": "2026-08-19",
            "nowPath": "ProjectCentral/now/day/2026-08-19",
            "sessionKey": "nara-personal-test",
            "privacyClass": "protected-local",
            "sourceClass": "human-authored",
            "sourceRef": "central:project:test:human-ground"
        }))
        .unwrap(),
    )
    .unwrap();
    path
}

fn run(root: &Path, context: &Path, operation: &str, stdin: Option<Value>) -> Output {
    let mut command = Command::new(env!("CARGO_BIN_EXE_epi-pratibimba-bridge"));
    command
        .arg("--operation")
        .arg(operation)
        .arg("--timestamp-ms")
        .arg("0")
        .arg("--generation")
        .arg("11")
        .arg("--vault-root")
        .arg(root)
        .arg("--nara-context")
        .arg(context);
    if stdin.is_some() {
        command.stdin(Stdio::piped());
    }
    command.stdout(Stdio::piped()).stderr(Stdio::piped());
    let mut child = command.spawn().unwrap();
    if let Some(stdin) = stdin {
        child
            .stdin
            .take()
            .unwrap()
            .write_all(serde_json::to_string(&stdin).unwrap().as_bytes())
            .unwrap();
    }
    child.wait_with_output().unwrap()
}

fn parse_ok(output: Output) -> Value {
    assert!(
        output.status.success(),
        "bridge failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(output.stderr.is_empty());
    serde_json::from_slice(&output.stdout).unwrap()
}

fn selection_request(written: &Value, body: &str, needle: &str) -> Value {
    let start = body.find(needle).unwrap();
    let end = start + needle.len();
    json!({
        "episodeRef": written["episodeRef"],
        "revision": written["episodeRevision"],
        "startByte": start,
        "endByte": end
    })
}

#[test]
fn nara_epii_anuttara_return_preserves_one_subject_and_never_mutates_source() {
    let root = temp_root("loop");
    let context = context_file(&root);
    let body = "I notice a live question about returning this difference without making it truth.";
    let written = parse_ok(run(
        &root,
        &context,
        "nara-write",
        Some(json!({"body": body})),
    ));
    let selection = selection_request(&written, body, "returning this difference");
    let source_before = fs::read(root.join("Pratibimba/Nara/2026-08-19/daily-note.md")).unwrap();

    let review = parse_ok(run(
        &root,
        &context,
        "epii-review",
        Some(json!({"selection": selection, "mode": "review"})),
    ));
    assert_eq!(review["schema"], "epi.personal-epii-review/v1");
    assert_eq!(review["actionRef"], "epi.action.epii.review");
    assert_eq!(review["agent"]["canonicalAgentRef"], "epi:agent:epii");
    assert_eq!(review["agent"]["position"], 5);
    assert_eq!(
        review["agent"]["bridgeRuntime"]
            .as_str()
            .unwrap()
            .starts_with("none"),
        true
    );
    assert_eq!(review["subject"]["episodeRef"], written["episodeRef"]);
    assert_eq!(
        review["subject"]["profileRef"],
        written["livedContext"]["profileRef"]
    );
    assert_eq!(review["subject"]["coordinateRef"], "epi:bimba:#-4/M4'");

    // PRE-D: the same lived object now carries the exact Nara source-conformant
    // M4/M4′ identity already proven by the 44-node implementation floor.
    assert_eq!(
        review["subject"]["coordinateBinding"]["manifestRef"],
        "epi:m-coordinate-manifest:nara-m4:v1"
    );
    assert_eq!(
        review["subject"]["coordinateBinding"]["bimbaSourceRef"],
        "#4.4"
    );
    assert_eq!(
        review["subject"]["coordinateBinding"]["carrierSourceRef"],
        "#4.4.4.4"
    );
    assert_eq!(
        review["subject"]["coordinateBinding"]["reviewSourceRef"],
        "#4.5"
    );

    // Epii review is rooted at the actual M5/M5′ Map domain without claiming
    // that structural existence means the whole M5 application is implemented.
    assert_eq!(review["mapGround"]["sourceRef"], "#5");
    assert_eq!(
        review["mapGround"]["bimbaCoordinateRef"],
        "ql:m-coordinate:bimba:M5"
    );
    assert_eq!(
        review["mapGround"]["pratibimbaCoordinateRef"],
        "ql:m-coordinate:pratibimba:M5"
    );
    assert_eq!(review["mapGround"]["sourceRevision"], BIMBA_MAP_SOURCE_REVISION);
    assert_eq!(review["mapGround"]["sourceRelationAsserted"], false);

    assert!(review["standing"]["authored"].as_array().unwrap().len() > 0);
    assert!(review["standing"]["inferred"].as_array().unwrap().len() > 0);
    assert!(review["standing"]["formal"].as_array().unwrap().len() > 0);

    let selection_again = selection_request(&written, body, "returning this difference");
    let ground = parse_ok(run(
        &root,
        &context,
        "personal-ground",
        Some(json!({
            "selection": selection_again,
            "reviewRef": review["reviewRef"]
        })),
    ));
    assert_eq!(ground["schema"], "epi.personal-ground-orientation/v1");
    assert_eq!(ground["agent"]["canonicalAgentRef"], "epi:agent:anuttara");
    assert_eq!(ground["agent"]["position"], 0);
    assert_eq!(
        ground["subject"]["selectionRef"],
        review["subject"]["selectionRef"]
    );
    assert_eq!(
        ground["subject"]["coordinateBinding"],
        review["subject"]["coordinateBinding"]
    );
    assert_eq!(
        ground["relation"]["fromRef"],
        review["subject"]["selectionRef"]
    );
    assert_eq!(ground["relation"]["viaRef"], review["reviewRef"]);
    assert_eq!(ground["relation"]["relationClass"], "implementation-flow");
    assert_eq!(ground["relation"]["bimbaSourceRelationAsserted"], false);
    assert_eq!(ground["mapGround"]["sourceRef"], "#0");
    assert_eq!(
        ground["mapGround"]["bimbaCoordinateRef"],
        "ql:m-coordinate:bimba:M0"
    );
    assert_eq!(
        ground["mapGround"]["pratibimbaCoordinateRef"],
        "ql:m-coordinate:pratibimba:M0"
    );
    assert_eq!(ground["mapGround"]["sourceRevision"], BIMBA_MAP_SOURCE_REVISION);
    assert_eq!(ground["mapGround"]["sourceRelationAsserted"], false);
    assert_eq!(ground["bimba"]["providerIdentityIsSemanticIdentity"], false);
    assert_eq!(ground["bimba"]["promotion"], "none");
    assert!(ground["sourceAnchors"]
        .as_array()
        .unwrap()
        .iter()
        .any(|value| value.as_str().unwrap().ends_with("anuttara-deep/nodes-full-data.json")));

    let selection_third = selection_request(&written, body, "returning this difference");
    let proposal = parse_ok(run(
        &root,
        &context,
        "personal-proposal",
        Some(json!({
            "selection": selection_third,
            "reviewRef": review["reviewRef"],
            "groundRef": ground["groundRef"],
            "proposedContent": "Keep this as a candidate personal return, subject to human review."
        })),
    ));
    assert_eq!(proposal["schema"], "epi.personal-proposal/v1");
    assert_eq!(proposal["sourceClass"], "proposal");
    assert_eq!(proposal["adoptionState"], "unreviewed");
    assert_eq!(proposal["sourceMutationPerformed"], false);
    assert_eq!(
        proposal["subject"]["selectionRef"],
        review["subject"]["selectionRef"]
    );
    assert_eq!(
        proposal["subject"]["coordinateBinding"],
        review["subject"]["coordinateBinding"]
    );
    assert_eq!(proposal["mapGround"]["sourceRef"], "#5");
    assert_eq!(proposal["mapGround"]["sourceRevision"], BIMBA_MAP_SOURCE_REVISION);
    assert_eq!(proposal["mapGround"]["sourceRelationAsserted"], false);
    assert_eq!(
        proposal["centralReturn"]["actionRef"],
        "projectcentral.now.return"
    );
    assert_eq!(
        proposal["centralReturn"]["durablePromotionActionRef"],
        "projectcentral.now.promote"
    );
    assert_eq!(
        proposal["centralReturn"]["requiresHumanAcceptanceForDurableGround"],
        true
    );
    assert_eq!(
        proposal["provenance"]["bimbaMapSourceRevision"],
        BIMBA_MAP_SOURCE_REVISION
    );

    let source_after = fs::read(root.join("Pratibimba/Nara/2026-08-19/daily-note.md")).unwrap();
    assert_eq!(
        source_before, source_after,
        "review/ground/proposal must not mutate the Nara source"
    );

    let restarted_review = parse_ok(run(
        &root,
        &context,
        "epii-review",
        Some(json!({
            "selection": selection_request(&written, body, "returning this difference"),
            "mode": "review"
        })),
    ));
    assert_eq!(restarted_review["reviewRef"], review["reviewRef"]);
    assert_eq!(
        restarted_review["subject"]["selectionRef"],
        review["subject"]["selectionRef"]
    );
    assert_eq!(
        restarted_review["subject"]["episodeRef"],
        review["subject"]["episodeRef"]
    );
    assert_eq!(
        restarted_review["subject"]["coordinateBinding"],
        review["subject"]["coordinateBinding"]
    );
    assert_eq!(restarted_review["mapGround"], review["mapGround"]);
}

#[test]
fn personal_depth_rejects_stale_or_forged_selection_and_does_not_disclose_ambient_episode() {
    let root = temp_root("privacy");
    let context = context_file(&root);
    let body = "private prefix | bounded phrase | private suffix";
    let written = parse_ok(run(
        &root,
        &context,
        "nara-write",
        Some(json!({"body": body})),
    ));
    let selection = selection_request(&written, body, "bounded phrase");
    let review = parse_ok(run(
        &root,
        &context,
        "epii-review",
        Some(json!({"selection": selection, "mode": "explain"})),
    ));
    let encoded = serde_json::to_string(&review).unwrap();
    assert!(encoded.contains("bounded phrase"));
    assert!(!encoded.contains("private prefix"));
    assert!(!encoded.contains("private suffix"));
    assert!(!encoded.contains("local-personal-test"));
    assert!(encoded.contains("#4.4.4.4"));
    assert!(encoded.contains(BIMBA_MAP_SOURCE_REVISION));

    let stale = run(
        &root,
        &context,
        "personal-ground",
        Some(json!({
            "selection": {
                "episodeRef": written["episodeRef"],
                "revision": 0,
                "startByte": 0,
                "endByte": 1
            }
        })),
    );
    assert!(!stale.status.success());
    assert!(String::from_utf8_lossy(&stale.stderr).contains("selection revision is stale"));
}

#[test]
fn personal_bridge_contains_no_parallel_epii_runtime_or_generic_return_mutator() {
    let source = include_str!("../src/personal.rs");
    assert!(!source.contains("struct EpiiRuntime"));
    assert!(!source.contains("fn return("));
    assert!(source.contains("projectcentral.now.return"));
    assert!(source.contains("projectcentral.now.promote"));
    assert!(source.contains("provider_identity_is_semantic_identity"));
    assert!(source.contains("packet-flow relation != Bimba source relation"));
    assert!(source.contains(BIMBA_MAP_SOURCE_REVISION));
}
