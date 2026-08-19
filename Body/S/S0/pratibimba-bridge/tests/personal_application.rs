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
    let root = std::env::temp_dir().join(format!("epi-personal-application-{label}-{nonce}"));
    fs::create_dir_all(&root).unwrap();
    root
}

fn context_file(root: &Path) -> PathBuf {
    let path = root.join("nara-context.json");
    fs::write(
        &path,
        serde_json::to_vec_pretty(&json!({
            "identityRef": "epi:nara:identity:private-test-only",
            "personalFieldRef": "central:project:test:now",
            "dayId": "2026-08-19",
            "nowPath": "ProjectCentral/now/day/2026-08-19",
            "sessionKey": "nara-parent-test",
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
        .arg("12")
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
    serde_json::from_slice(&output.stdout).unwrap()
}

#[test]
fn personal_450_is_one_body_free_subject_with_native_activity_and_deep_open_contracts() {
    let root = temp_root("parent");
    let context = context_file(&root);
    let body = "private journal body that must not appear in the parent application descriptor";
    let written = parse_ok(run(
        &root,
        &context,
        "nara-write",
        Some(json!({"body": body})),
    ));

    let app = parse_ok(run(&root, &context, "personal-application", None));
    assert_eq!(app["schema"], "epi.personal-450-application/v1");
    assert_eq!(app["productId"], "epi.personal.450");
    assert_eq!(app["nativeOwner"], "epi");
    assert_eq!(app["subject"]["subjectRef"], written["episodeRef"]);
    assert_eq!(app["subject"]["episodeRef"], written["episodeRef"]);
    assert_eq!(app["subject"]["episodeRevision"], written["episodeRevision"]);
    assert_eq!(app["subject"]["dayId"], written["livedContext"]["dayId"]);
    assert_eq!(app["subject"]["nowPath"], written["livedContext"]["nowPath"]);
    assert_eq!(app["subject"]["coordinateRef"], written["livedContext"]["coordinateRef"]);
    assert_eq!(app["subject"]["profileRef"], written["livedContext"]["profileRef"]);
    assert_eq!(app["subject"]["protectedBodyDisclosed"], false);

    let encoded = serde_json::to_string(&app).unwrap();
    assert!(!encoded.contains(body));
    assert!(!encoded.contains("private-test-only"));
    assert!(!encoded.contains("EpiiRuntime"));

    let activities = app["activities"].as_array().unwrap();
    assert!(activities.iter().any(|activity| {
        activity["activityRef"] == "epi.personal.450.activity.journal"
            && activity["readiness"] == "ready"
            && activity["subjectRef"] == written["episodeRef"]
    }));
    assert!(activities.iter().any(|activity| {
        activity["activityRef"] == "epi.personal.450.activity.dialogue"
            && activity["canonicalAgentRef"] == "epi:agent:epii"
            && activity["readiness"] == "host-binding-required"
    }));
    assert!(activities.iter().any(|activity| {
        activity["activityRef"] == "epi.personal.450.activity.bimba"
            && activity["nativeActionRefs"]
                .as_array()
                .unwrap()
                .iter()
                .any(|value| value == "epi.action.anuttara.ground")
    }));
    assert!(activities.iter().any(|activity| {
        activity["activityRef"] == "epi.personal.450.activity.return"
            && activity["nativeActionRefs"]
                .as_array()
                .unwrap()
                .iter()
                .any(|value| value == "projectcentral.now.return")
    }));

    assert_eq!(app["authority"]["selectionIsAgentContextDisclosure"], false);
    assert_eq!(app["authority"]["proposalIsAdoptedHumanSource"], false);
    assert_eq!(app["authority"]["canonicalEpiiAgentRef"], "epi:agent:epii");
    assert_eq!(app["authority"]["durableReturnOwner"], "Central NOW/DAY");

    let boundaries = app["boundaries"].as_array().unwrap();
    assert_eq!(boundaries.len(), 3);
    assert!(boundaries.iter().any(|boundary| {
        boundary["groundCoordinate"] == "M4-0'"
            && boundary["returnCoordinate"] == "M4-5'"
            && boundary["groundRef"] == written["episodeRef"]
    }));
    assert!(boundaries.iter().any(|boundary| {
        boundary["groundCoordinate"] == "M5-0'" && boundary["returnCoordinate"] == "M5-5'"
    }));
    assert!(boundaries.iter().any(|boundary| {
        boundary["groundCoordinate"] == "M0-0'" && boundary["returnCoordinate"] == "M0-5'"
    }));

    let deep = app["deepOpen"].as_array().unwrap();
    for product in ["epi.deep.m0", "epi.deep.m4", "epi.deep.m5"] {
        let descriptor = deep.iter().find(|entry| entry["productId"] == product).unwrap();
        assert_eq!(descriptor["subjectRef"], written["episodeRef"]);
        assert_eq!(descriptor["preservesSubjectIdentity"], true);
        assert_eq!(descriptor["presentationOwnedByHost"], true);
        assert_eq!(descriptor["readiness"], "declared-product-no-current-deep-body");
        assert!(descriptor.get("surfaceRef").is_none());
    }

    assert_eq!(app["eventBinding"]["subjectRef"], written["episodeRef"]);
    assert_eq!(app["eventBinding"]["bindableToEventRef"], true);
    assert_eq!(app["eventBinding"]["parallelPersonalEventState"], false);
    assert!(app["eventBinding"].get("eventRef").is_none());
}

#[test]
fn parent_descriptor_tracks_current_episode_revision_without_changing_subject_identity() {
    let root = temp_root("revision");
    let context = context_file(&root);
    let first = parse_ok(run(
        &root,
        &context,
        "nara-write",
        Some(json!({"body": "first revision"})),
    ));
    let app1 = parse_ok(run(&root, &context, "personal-application", None));
    let second = parse_ok(run(
        &root,
        &context,
        "nara-write",
        Some(json!({"body": "second revision"})),
    ));
    let app2 = parse_ok(run(&root, &context, "personal-application", None));

    assert_eq!(first["episodeRef"], second["episodeRef"]);
    assert_eq!(app1["subject"]["subjectRef"], app2["subject"]["subjectRef"]);
    assert_eq!(app1["subject"]["episodeRevision"], first["episodeRevision"]);
    assert_eq!(app2["subject"]["episodeRevision"], second["episodeRevision"]);
    assert_ne!(app1["subject"]["episodeRevision"], app2["subject"]["episodeRevision"]);
}
