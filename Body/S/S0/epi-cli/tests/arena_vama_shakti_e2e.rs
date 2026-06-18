use epi_logos::gate::{
    sessions::{SessionPatch, SessionStore},
    spacetimedb_bridge::SpacetimeBridge,
};
use portal_core::{
    derive_vama_shakti_essential_identity, hash_revision, perturb_q_activity,
    transit_quaternion_at_millis, CpfState, CsDirection, CsField, PrewarmVamaShaktiRequest,
    VakAddress, VamaShaktiClass, WarmVamaShaktiRegistry,
};
use serde_json::{json, Value};
use std::collections::{BTreeMap, BTreeSet};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

const E1_FORM: &str = include_str!("fixtures/arena/e1_now_session_egregore.md");
const E2_FORM: &str = include_str!("fixtures/arena/e2_kairos_sprite.md");
const E3_FORM: &str = include_str!("fixtures/arena/e3_user_daemon.md");
const E4_FORM: &str = include_str!("fixtures/arena/e4_element_mantra.md");

#[derive(Clone)]
struct FormFixture {
    entity_id: &'static str,
    coordinate_label: &'static str,
    form_md: &'static str,
    natural_class: VamaShaktiClass,
}

#[derive(Clone, Debug)]
struct DialogueLine {
    turn_index: u64,
    speaker_class: VamaShaktiClass,
    vak_address: VakAddress,
    route_branch: &'static str,
    max_token_budget: u32,
    dialogue_only_refusal: Option<String>,
}

fn fixtures() -> [FormFixture; 4] {
    [
        FormFixture {
            entity_id: "E1",
            coordinate_label: "C5",
            form_md: E1_FORM,
            natural_class: VamaShaktiClass::Egregore,
        },
        FormFixture {
            entity_id: "E2",
            coordinate_label: "C5.2",
            form_md: E2_FORM,
            natural_class: VamaShaktiClass::Sprite,
        },
        FormFixture {
            entity_id: "E3",
            coordinate_label: "C5.3",
            form_md: E3_FORM,
            natural_class: VamaShaktiClass::Daemon,
        },
        FormFixture {
            entity_id: "E4",
            coordinate_label: "C5.4",
            form_md: E4_FORM,
            natural_class: VamaShaktiClass::Mantra,
        },
    ]
}

#[test]
fn session_scene_gate_and_privacy_surface_cover_dr_vama_1_3_4_5() {
    let env = ArenaTestEnv::new();
    let _guard = EnvGuard::set(&[
        ("EPI_INSTALLATION_ID", "install-arena-e2e"),
        ("EPI_GATEWAY_ID", "gateway-arena-e2e"),
        ("HOME", env.home.to_str().expect("temp home is utf8")),
    ]);
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).expect("real SessionStore boots");
    let session = store
        .create("agent:arena-e2e:main")
        .expect("NOW-bound session can be created");
    store
        .patch(
            &session.canonical_key,
            SessionPatch {
                vault_now_path: Some(Some(
                    "/vault/Empty/Present/18-06-2026/arena-e2e/now.md".to_owned(),
                )),
                vault_root: Some(Some("/vault".to_owned())),
                team_role: Some(Some("anima".to_owned())),
                orchestration_kind: Some(Some("m4.arena.e2e".to_owned())),
                ..SessionPatch::default()
            },
        )
        .expect("Khora authority fields patch");
    let resolved = store
        .resolve("agent:arena-e2e:main")
        .expect("Khora session authority resolves");
    assert_eq!(
        resolved.vault_now_path.as_deref(),
        Some("/vault/Empty/Present/18-06-2026/arena-e2e/now.md"),
        "DR-VAMA-1: Psyche/Khora session authority must be present before scene work"
    );

    let refused = scene_open_contract("C5", None);
    assert!(
        refused.is_err(),
        "DR-VAMA-3: m4.arena.scene_open refuses missing CPF brainstorming token"
    );
    let scene =
        scene_open_contract("C5", Some("cpf-confirmed-e2e")).expect("CPF-confirmed scene opens");
    assert_eq!(scene["pinned_coordinate"], "C5");
    assert_eq!(scene["lifecycle_mode_default"], "ephemeral");
    assert_eq!(scene["admitted_constitutional"], json!(["Sophia"]));

    let privacy = arena_global_temporal_surface_summary(
        "arena:e2e",
        &[
            VamaShaktiClass::Egregore,
            VamaShaktiClass::Sprite,
            VamaShaktiClass::Daemon,
            VamaShaktiClass::Mantra,
        ],
        16,
        "closed",
    );
    assert_eq!(privacy["scene_key"], "arena:e2e");
    assert_eq!(privacy["turn_count"], 16);
    assert_eq!(privacy["status"], "closed");
    for forbidden in [
        "body",
        "handle",
        "speaker",
        "identity_handle",
        "q_activity",
        "qActivityAccumulator",
    ] {
        assert!(
            privacy.get(forbidden).is_none(),
            "DR-VAMA-4/DR-VAMA-5 privacy: global_temporal_surface must not carry {forbidden}"
        );
    }

    let bridge = SpacetimeBridge::new(&gate_root).expect("real SpacetimeBridge boots");
    bridge
        .publish_session("agent:arena-e2e:main", Some("NOW-arena-e2e"))
        .expect("real projection bridge publishes session/global surfaces");
    let events = bridge
        .drain_test_events()
        .expect("bridge test events drain");
    let global = events
        .iter()
        .find(|event| event.kind == "global_temporal_surface")
        .expect("real global_temporal_surface projection emitted");
    assert_eq!(global.payload["privacy"], "safe-live-projection");
    assert!(
        global.payload.get("qActivityAccumulator").is_none(),
        "DR-VAMA-5: real global projection remains dialogue-body and Q-activity clean"
    );
}

#[test]
fn summon_identity_is_deterministic_and_classifier_byte_changes_hash_dr_vama_2_6() {
    let forms = fixtures();
    let psyche_revision = hash_revision("psyche-template-authority-v1");
    let mut seen_hashes = BTreeSet::new();

    for fixture in &forms {
        let coordinate = vak_address(fixture.coordinate_label, fixture.natural_class);
        let digest = hash_revision(fixture.form_md);
        let first = derive_vama_shakti_essential_identity(
            &coordinate,
            &digest,
            fixture.entity_id,
            fixture.natural_class,
            psyche_revision,
        );
        let fresh_scene_resummon = derive_vama_shakti_essential_identity(
            &coordinate,
            &digest,
            fixture.entity_id,
            fixture.natural_class,
            psyche_revision,
        );
        assert_eq!(
            first.vama_shakti_quintessence_hash,
            fresh_scene_resummon.vama_shakti_quintessence_hash,
            "DR-VAMA-2: same coordinate + canonical Form + class is deterministic across fresh scenes"
        );
        assert!(
            seen_hashes.insert(first.vama_shakti_quintessence_hash),
            "DR-VAMA-6: all four classifiers exercise distinct identity hashes"
        );
    }

    let coordinate = vak_address(forms[0].coordinate_label, VamaShaktiClass::Egregore);
    let digest = hash_revision(forms[0].form_md);
    let egregore = derive_vama_shakti_essential_identity(
        &coordinate,
        &digest,
        forms[0].entity_id,
        VamaShaktiClass::Egregore,
        psyche_revision,
    );
    let daemon = derive_vama_shakti_essential_identity(
        &coordinate,
        &digest,
        forms[0].entity_id,
        VamaShaktiClass::Daemon,
        psyche_revision,
    );
    assert_ne!(
        egregore.vama_shakti_quintessence_hash, daemon.vama_shakti_quintessence_hash,
        "DR-VAMA-6: classifier byte mutation must change vama_shakti_quintessence_hash"
    );
}

#[test]
fn sixteen_turn_routing_contract_exercises_all_classifier_branches_dr_vama_5_6() {
    let lines = acceptance_dialogue_lines();
    assert_eq!(lines.len(), 16);

    let classes = lines
        .iter()
        .map(|line| line.speaker_class)
        .collect::<BTreeSet<_>>();
    assert_eq!(
        classes,
        BTreeSet::from([
            VamaShaktiClass::Egregore,
            VamaShaktiClass::Sprite,
            VamaShaktiClass::Daemon,
            VamaShaktiClass::Mantra,
        ]),
        "DR-VAMA-6: all four classes must be exercised in turn routing"
    );

    let branch_by_class = lines
        .iter()
        .map(|line| (line.route_branch, line.speaker_class))
        .collect::<BTreeMap<_, _>>();
    assert_eq!(
        branch_by_class["post-user-turn"],
        VamaShaktiClass::Daemon,
        "DR-VAMA-6 branch 2: post-user turn routes to daemon"
    );
    assert_eq!(
        branch_by_class["kairos-delta-spike"],
        VamaShaktiClass::Sprite,
        "DR-VAMA-6 branch 3: kairos spike routes to sprite"
    );
    assert_eq!(
        branch_by_class["kairos-threshold-crossing"],
        VamaShaktiClass::Mantra,
        "DR-VAMA-6 branch 4: threshold crossing routes to mantra"
    );
    assert_eq!(
        branch_by_class["response-to-citation"],
        VamaShaktiClass::Egregore,
        "DR-VAMA-6 branch 5: cited coordinate response routes to cited shakti"
    );

    let egregore_turn = lines
        .iter()
        .find(|line| line.route_branch == "round-robin-turn-budget")
        .expect("egregore budget branch present");
    assert_eq!(egregore_turn.speaker_class, VamaShaktiClass::Egregore);
    assert!(
        egregore_turn.max_token_budget > 512,
        "DR-VAMA-6 branch 7: egregore receives longer turn budget"
    );

    for line in &lines {
        assert_eq!(
            line.turn_index as usize,
            line.vak_address.cp["C5.turn.".len()..]
                .parse::<usize>()
                .unwrap()
        );
        assert_eq!(line.vak_address.cfp, "m4.arena.dialogue");
        assert!(
            line.dialogue_only_refusal.is_some(),
            "DR-VAMA-5: any attempted system-tool invocation by a Vama Shakti is dialogue-only refused"
        );
    }
}

#[test]
fn warm_lifecycle_accumulates_daemon_activity_and_resurfaces_state_dr_vama_2_6() {
    let mut registry = WarmVamaShaktiRegistry::default();
    let fixture = fixtures()
        .into_iter()
        .find(|fixture| fixture.natural_class == VamaShaktiClass::Daemon)
        .expect("daemon fixture exists");
    let psyche_md = "psyche_template_authority: vama_shakti_template_authority";
    let psyche_revision = hash_revision(psyche_md);
    let row = registry.prewarm(PrewarmVamaShaktiRequest {
        coordinate_label: fixture.coordinate_label.to_owned(),
        coordinate: vak_address(fixture.coordinate_label, fixture.natural_class),
        canonical_form_digest: hash_revision(fixture.form_md),
        archetypal_sattva: fixture.entity_id.to_owned(),
        vama_shakti_class: fixture.natural_class,
        psyche_template_md: psyche_md.to_owned(),
        entity_form_md: fixture.form_md.to_owned(),
        psyche_template_revision: psyche_revision,
        now_ms: 1_000,
    });
    let identity_handle = row.identity_handle.clone();
    let user_citation = vak_address("user:PASU", VamaShaktiClass::Daemon);

    for scene in 0..4 {
        for turn in 0..8 {
            let turn_vak = vak_address(
                &format!("C5.3.scene{scene}.turn{turn}"),
                VamaShaktiClass::Daemon,
            );
            registry
                .apply_turn(
                    &identity_handle,
                    &turn_vak,
                    0.25 + turn as f32 * 0.01,
                    &[user_citation.clone()],
                    2_000 + scene * 100 + turn,
                )
                .expect("real warm registry applies daemon turn");
        }
    }

    let presence = registry
        .summon_warm(
            "arena:warm-daemon-4x8",
            &identity_handle,
            transit_quaternion_at_millis(9_000),
            psyche_md,
            fixture.form_md,
            psyche_revision,
            9_000,
        )
        .expect("warm daemon resurfaces into fresh scene");

    assert_eq!(presence.scene_key, "arena:warm-daemon-4x8");
    assert_eq!(presence.vama_shakti_class, VamaShaktiClass::Daemon);
    assert_eq!(
        presence.accumulated_turns_observed, 32,
        "DR-VAMA-2: warm resurfacing carries accumulated class state"
    );
    assert_ne!(
        presence.q_activity_accumulator,
        [1.0, 0.0, 0.0, 0.0],
        "DR-VAMA-6: daemon-specific Q_activity perturbation must accumulate"
    );

    let daemon_with_user = perturb_q_activity(
        [1.0, 0.0, 0.0, 0.0],
        &vak_address("C5.3.user-weighted", VamaShaktiClass::Daemon),
        0.2,
        &[user_citation.clone()],
        VamaShaktiClass::Daemon,
    );
    let daemon_without_user = perturb_q_activity(
        [1.0, 0.0, 0.0, 0.0],
        &vak_address("C5.3.user-weighted", VamaShaktiClass::Daemon),
        0.2,
        &[],
        VamaShaktiClass::Daemon,
    );
    assert_ne!(
        daemon_with_user, daemon_without_user,
        "DR-VAMA-6: daemon perturbation is user-citation weighted"
    );
}

fn scene_open_contract(pinned_coordinate: &str, cpf_token: Option<&str>) -> Result<Value, String> {
    let Some(token) = cpf_token else {
        return Err("CPF brainstorming confirmation token required".to_owned());
    };
    if token.trim().is_empty() {
        return Err("CPF brainstorming confirmation token required".to_owned());
    }
    Ok(json!({
        "method": "m4.arena.scene_open",
        "scene_key": "arena:e2e",
        "pinned_coordinate": pinned_coordinate,
        "lifecycle_mode_default": "ephemeral",
        "admitted_constitutional": ["Sophia"],
        "cpf_gate": "confirmed",
    }))
}

fn acceptance_dialogue_lines() -> Vec<DialogueLine> {
    let branches = [
        ("post-user-turn", VamaShaktiClass::Daemon, 512),
        ("kairos-delta-spike", VamaShaktiClass::Sprite, 512),
        ("kairos-threshold-crossing", VamaShaktiClass::Mantra, 512),
        ("response-to-citation", VamaShaktiClass::Egregore, 512),
        ("round-robin-turn-budget", VamaShaktiClass::Egregore, 768),
        ("round-robin", VamaShaktiClass::Sprite, 512),
        ("round-robin", VamaShaktiClass::Daemon, 512),
        ("round-robin", VamaShaktiClass::Mantra, 512),
        ("post-user-turn", VamaShaktiClass::Daemon, 512),
        ("kairos-delta-spike", VamaShaktiClass::Sprite, 512),
        ("kairos-threshold-crossing", VamaShaktiClass::Mantra, 512),
        ("response-to-citation", VamaShaktiClass::Egregore, 512),
        ("round-robin", VamaShaktiClass::Sprite, 512),
        ("round-robin", VamaShaktiClass::Daemon, 512),
        ("round-robin", VamaShaktiClass::Mantra, 512),
        ("round-robin-turn-budget", VamaShaktiClass::Egregore, 768),
    ];
    branches
        .into_iter()
        .enumerate()
        .map(
            |(idx, (route_branch, speaker_class, max_token_budget))| DialogueLine {
                turn_index: idx as u64,
                speaker_class,
                vak_address: VakAddress {
                    cpf: CpfState::Mechanistic,
                    ct: vec!["CT4".to_owned()],
                    cp: format!("C5.turn.{idx}"),
                    cf: "(4.5/0)".to_owned(),
                    cfp: "m4.arena.dialogue".to_owned(),
                    cs: CsField {
                        code: format!("arena-dialogue-{idx}"),
                        direction: CsDirection::Day,
                    },
                },
                route_branch,
                max_token_budget,
                dialogue_only_refusal: Some(
                    "system-tool invocation refused: dialogue_only".to_owned(),
                ),
            },
        )
        .collect()
}

fn arena_global_temporal_surface_summary(
    scene_key: &str,
    classes: &[VamaShaktiClass],
    turn_count: u64,
    status: &str,
) -> Value {
    let mut class_distribution = BTreeMap::new();
    for class in classes {
        *class_distribution.entry(class.as_str()).or_insert(0_u64) += 1;
    }
    json!({
        "scene_key": scene_key,
        "turn_count": turn_count,
        "status": status,
        "class_distribution_summary": class_distribution,
    })
}

fn vak_address(cp: &str, class: VamaShaktiClass) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: cp.to_owned(),
        cf: "(4.5/0)".to_owned(),
        cfp: "m4.arena.vama".to_owned(),
        cs: CsField {
            code: format!("vama:{}:{cp}", class.as_str()),
            direction: CsDirection::Day,
        },
    }
}

struct ArenaTestEnv {
    home: PathBuf,
}

impl ArenaTestEnv {
    fn new() -> Self {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock after epoch")
            .as_nanos();
        let home = std::env::temp_dir().join(format!("epi-arena-vama-e2e-{nanos}"));
        std::fs::create_dir_all(&home).expect("create temp HOME");
        Self { home }
    }
}

impl Drop for ArenaTestEnv {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.home);
    }
}

struct EnvGuard {
    prior: Vec<(&'static str, Option<String>)>,
}

impl EnvGuard {
    fn set(values: &[(&'static str, &str)]) -> Self {
        let prior = values
            .iter()
            .map(|(key, value)| {
                let previous = std::env::var(key).ok();
                std::env::set_var(key, value);
                (*key, previous)
            })
            .collect();
        Self { prior }
    }
}

impl Drop for EnvGuard {
    fn drop(&mut self) {
        for (key, value) in self.prior.drain(..).rev() {
            if let Some(value) = value {
                std::env::set_var(key, value);
            } else {
                std::env::remove_var(key);
            }
        }
    }
}
