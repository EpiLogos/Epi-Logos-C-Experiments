use serde_json::{json, Value};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};

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
    assert_eq!(review["agent"]["bridgeRuntime"].as_str().unwrap().starts_with("none"), true);
    assert_eq!(review["subject"]["episodeRef"], written["episodeRef"]);
    assert_eq!(review["subject"]["profileRef"], written["livedContext"]["profileRef"]);
    assert_eq!(review["subject"]["coordinateRef"], "epi:bimba:#-4/M4'");
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
    assert_eq!(ground["subject"]["selectionRef"], review["subject"]["selectionRef"]);
    assert_eq!(ground["relation"]["fromRef"], review["subject"]["selectionRef"]);
    assert_eq!(ground["relation"]["viaRef"], review["reviewRef"]);
    assert_eq!(ground["bimba"]["providerIdentityIsSemanticIdentity"], false);
    assert_eq!(ground["bimba"]["promotion"], "none");
    assert!(ground["sourceAnchors"]
        .as_array()
        .unwrap()
        .iter()
        .any(|value| value.as_str().unwrap().ends_with("M0'/M0'-SPEC.md")));

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
    assert_eq!(proposal["subject"]["selectionRef"], review["subject"]["selectionRef"]);
    assert_eq!(proposal["centralReturn"]["actionRef"], "projectcentral.now.return");
    assert_eq!(proposal["centralReturn"]["durablePromotionActionRef"], "projectcentral.now.promote");
    assert_eq!(proposal["centralReturn"]["requiresHumanAcceptanceForDurableGround"], true);

    let source_after = fs::read(root.join("Pratibimba/Nara/2026-08-19/daily-note.md")).unwrap();
    assert_eq!(source_before, source_after, "review/ground/proposal must not mutate the Nara source");

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
    assert_eq!(restarted_review["subject"]["selectionRef"], review["subject"]["selectionRef"]);
    assert_eq!(restarted_review["subject"]["episodeRef"], review["subject"]["episodeRef"]);
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
}
