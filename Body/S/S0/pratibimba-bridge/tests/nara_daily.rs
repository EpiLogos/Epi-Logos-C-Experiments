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
    let root = std::env::temp_dir().join(format!("epi-nara-{label}-{nonce}"));
    fs::create_dir_all(&root).unwrap();
    root
}

fn context_file(root: &Path) -> PathBuf {
    let path = root.join("nara-context.json");
    fs::write(
        &path,
        serde_json::to_vec_pretty(&json!({
            "identityRef": "epi:nara:identity:local-test",
            "personalFieldRef": "epi:nara:personal-field:local-test",
            "dayId": "2026-08-19",
            "nowPath": "DAY/2026-08-19/NOW/00",
            "sessionKey": "nara-local-test",
            "privacyClass": "protected-local",
            "sourceClass": "human-authored",
            "sourceRef": "central:control:user:test"
        }))
        .unwrap(),
    )
    .unwrap();
    path
}

fn run(root: &Path, context: Option<&Path>, operation: &str, stdin: Option<Value>) -> Output {
    let mut command = Command::new(env!("CARGO_BIN_EXE_epi-pratibimba-bridge"));
    command
        .arg("--operation")
        .arg(operation)
        .arg("--timestamp-ms")
        .arg("0")
        .arg("--generation")
        .arg("7")
        .arg("--vault-root")
        .arg(root);
    if let Some(context) = context {
        command.arg("--nara-context").arg(context);
    }
    if stdin.is_some() {
        command.stdin(Stdio::piped());
    }
    command.stdout(Stdio::piped()).stderr(Stdio::piped());
    let mut child = command.spawn().unwrap();
    if let Some(stdin) = stdin {
        let mut pipe = child.stdin.take().unwrap();
        pipe.write_all(serde_json::to_string(&stdin).unwrap().as_bytes())
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
    assert!(output.stderr.is_empty(), "successful Nara operation leaked to stderr");
    serde_json::from_slice(&output.stdout).unwrap()
}

#[test]
fn protected_daily_episode_survives_restart_with_real_profile_and_stable_identity() {
    let root = temp_root("restart");
    let context = context_file(&root);

    let written = parse_ok(run(
        &root,
        Some(&context),
        "nara-write",
        Some(json!({"body": "Morning α note about L4 and #-4."})),
    ));
    assert_eq!(written["schema"], "epi.nara-daily-surface/v1");
    assert_eq!(written["providerContract"], "epi.nara-daily-provider/v1");
    assert_eq!(written["privacyClass"], "protected-local-body");
    assert_eq!(written["sourceClass"], "human-authored");
    assert_eq!(written["episodeRevision"], 1);
    assert_eq!(written["livedContext"]["dayId"], "2026-08-19");
    assert_eq!(written["livedContext"]["tick12"], 0);
    assert!(written["livedContext"]["qlAddress"]
        .as_str()
        .unwrap()
        .starts_with("qladdr:"));
    assert!(written["livedContext"]["profileRef"]
        .as_str()
        .unwrap()
        .starts_with("epi:matheme-harmonic-profile:"));
    assert_eq!(written["livedContext"]["coordinateRef"], "epi:bimba:#-4/M4'");

    let reread = parse_ok(run(&root, Some(&context), "nara-read", None));
    assert_eq!(reread["episodeRef"], written["episodeRef"]);
    assert_eq!(reread["dayRef"], written["dayRef"]);
    assert_eq!(reread["episodeRevision"], 1);
    assert_eq!(reread["body"], "Morning α note about L4 and #-4.");

    let record_path = root
        .join("Pratibimba")
        .join("Nara")
        .join("2026-08-19")
        .join("daily-note.episode.json");
    let record = fs::read_to_string(&record_path).unwrap();
    assert!(!record.contains("Morning α note"));
    assert!(record.contains("protected-local-body"));
    assert!(record.contains("protected-local-derived"));

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let body_mode = fs::metadata(
            root.join("Pratibimba/Nara/2026-08-19/daily-note.md"),
        )
        .unwrap()
        .permissions()
        .mode()
            & 0o777;
        let record_mode = fs::metadata(&record_path).unwrap().permissions().mode() & 0o777;
        assert_eq!(body_mode, 0o600);
        assert_eq!(record_mode, 0o600);
    }
}

#[test]
fn selection_is_revision_bound_and_discloses_only_the_selected_context_packet() {
    let root = temp_root("selection");
    let context = context_file(&root);
    let body = "Before α after";
    let written = parse_ok(run(
        &root,
        Some(&context),
        "nara-write",
        Some(json!({"body": body})),
    ));
    let start = body.find('α').unwrap();
    let end = start + 'α'.len_utf8();

    let selection = parse_ok(run(
        &root,
        Some(&context),
        "nara-select",
        Some(json!({
            "episodeRef": written["episodeRef"],
            "revision": written["episodeRevision"],
            "startByte": start,
            "endByte": end
        })),
    ));
    assert_eq!(selection["schema"], "epi.nara-selection/v1");
    assert_eq!(selection["actionRef"], "epi.action.nara.selection.sendoff");
    assert_eq!(selection["selectedText"], "α");
    assert_eq!(selection["privacyClass"], "protected-local-selected-disclosure");
    let encoded = serde_json::to_string(&selection).unwrap();
    assert!(!encoded.contains("local-test\""));
    assert!(!encoded.contains("Before α after"));
    assert!(encoded.contains("selected-text"));
    assert!(encoded.contains("episode-ref"));
    assert!(encoded.contains("harmonic-profile-ref"));

    let stale = run(
        &root,
        Some(&context),
        "nara-select",
        Some(json!({
            "episodeRef": written["episodeRef"],
            "revision": 0,
            "startByte": start,
            "endByte": end
        })),
    );
    assert!(!stale.status.success());
    assert!(String::from_utf8_lossy(&stale.stderr).contains("selection revision is stale"));
}

#[test]
fn nara_store_fails_closed_without_protected_prompt_a_context() {
    let root = temp_root("closed");
    let output = run(&root, None, "nara-read", None);
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("protected Prompt-A Nara context handoff"));
}
