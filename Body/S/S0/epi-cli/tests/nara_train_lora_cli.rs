use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

struct TempTree(PathBuf);

impl TempTree {
    fn new() -> Self {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock after epoch")
            .as_nanos();
        let path =
            std::env::temp_dir().join(format!("epi-nara-lora-{}-{nonce}", std::process::id()));
        fs::create_dir_all(&path).expect("create temp tree");
        Self(path)
    }

    fn path(&self) -> &Path {
        &self.0
    }
}

impl Drop for TempTree {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

#[test]
fn nara_train_lora_cli_runs_real_local_pipeline() {
    let tmp = TempTree::new();
    let journal = tmp.path().join("journal.md");
    let dream = tmp.path().join("dream.md");
    let phone = tmp.path().join("phone.txt");
    fs::write(&journal, "Journal body").expect("write journal");
    fs::write(&dream, "Dream body").expect("write dream");
    fs::write(&phone, "Phone body").expect("write phone writing");

    let config = tmp.path().join("config.json");
    fs::write(
        &config,
        serde_json::to_vec_pretty(&json!({
            "privacy_class": "local-only",
            "model_version_key": "local-test-model",
            "checkpoint_version": "voice-cli-v1",
            "checkpoint_dir": tmp.path().join("checkpoints"),
            "corpus": {
                "journal": [journal],
                "dream": [dream],
                "phone_writings": [phone]
            }
        }))
        .expect("serialize config"),
    )
    .expect("write config");

    let output = Command::new(env!("CARGO_BIN_EXE_epi"))
        .env(
            "EPI_REPO_ROOT",
            env!("CARGO_MANIFEST_DIR").replace("Body/S/S0/epi-cli", ""),
        )
        .args(["nara", "train-lora", "--config"])
        .arg(&config)
        .arg("--dry-run")
        .output()
        .expect("run epi nara train-lora");

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let payload: Value = serde_json::from_slice(&output.stdout).expect("CLI emits JSON");
    assert_eq!(payload["privacy_class"], "local-only");
    assert_eq!(payload["checkpoint"]["version"], "voice-cli-v1");
    assert_eq!(
        fs::read_to_string(tmp.path().join("checkpoints/voice-cli-v1/corpus.jsonl"))
            .expect("pipeline writes corpus"),
        "{\"kind\": \"journal\", \"text\": \"Journal body\"}\n{\"kind\": \"dream\", \"text\": \"Dream body\"}\n{\"kind\": \"phone_writing\", \"text\": \"Phone body\"}\n"
    );
}
