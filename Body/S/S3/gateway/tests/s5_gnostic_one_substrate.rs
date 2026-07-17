//! 12.T12.2: the ONE-substrate round trip (DR-S5-ONE-1).
//!
//! One identity tuple `(day, session, turn, coordinate)` must ride every
//! surface of the gnostic substrate coherently:
//!
//!   (a) the gateway route law sends `s5'.gnostic.ingest` (and every named
//!       read) to the production epi-gnostic authority as S5 governance —
//!       dispatching, never duplicating;
//!   (b) the session record's TerminalBinding carries the terminal lease
//!       (Khora session authority; tmux pane backing) and the lease NEVER
//!       inherits into a child session — write authority stays with the
//!       leased session;
//!   (d) the Redis cache key for the same tuple is hierarchical
//!       `{day}:{session}:{turn}:{coordinate}` — byte-pinned always, and
//!       round-tripped against the LIVE local Redis when reachable
//!       (connectivity is an input, never a precondition — t5.10 idiom).
//!
//! The S0 membrane half of (b)/(c) — expired/missing leases refusing a
//! persistent ingest recoverably before any shell — is pinned in
//! `epi-cli::gate::gnostic::lease_gate_tests`.

use epi_s3_gateway_contract::{
    method_dispatch_plan_entry, MethodDispatchKind, TerminalBinding, TerminalLease, TerminalStatus,
};
use epi_s3_redis_context::{
    CacheTier, RedisCache, RedisConfig, RedisKey, GNOSTIC_SUBSTRATE_HIERARCHY,
};

const DAY: &str = "14-07-2026";
const SESSION: &str = "20260714-001500-1a58f7";
const TURN: &str = "t7";
const COORDINATE: &str = "M2-1";

#[tokio::test]
async fn s5_gnostic_one_substrate_round_trip() {
    // ── (a) route law: the full named set dispatches to production epi-gnostic ──
    for method in [
        "s5'.gnostic.ingest",
        "s5'.gnostic.query",
        "s5'.gnostic.notebook",
        "s5'.gnostic.status",
        "s5'.gnostic.resolve",
        "s5'.gnostic.candidates",
        "s5'.gnostic.etymology",
        "s5'.gnostic.list_notebooks",
        "s5'.gnostic.episode_search",
        "s5'.gnostic.evidence_trace",
        "s5'.gnostic.query_with_layers",
    ] {
        let entry = method_dispatch_plan_entry(method)
            .unwrap_or_else(|| panic!("{method} missing from the dispatch plan"));
        assert_eq!(
            entry.kind,
            MethodDispatchKind::S5GovernanceAdapter,
            "{method} must route as S5 governance"
        );
        assert!(
            entry.authority_path.contains("Body/S/S5/epi-gnostic"),
            "{method} must dispatch to production epi-gnostic, got {}",
            entry.authority_path
        );
    }

    // ── (b) session authority: the binding carries the lease; children never inherit it ──
    let binding = TerminalBinding {
        terminal_identifier: Some("iterm2:w0p7".to_owned()),
        session_anchor: Some(format!("{DAY}/{SESSION}")),
        tmux_pane_id: Some("%7".to_owned()),
        attached_session_key: Some(SESSION.to_owned()),
        terminal_status: Some(TerminalStatus::Attached),
        lease: Some(TerminalLease {
            lease_owner: Some(SESSION.to_owned()),
            lease_purpose: Some("gnostic-ingest".to_owned()),
            lease_expires_at_ms: Some(u128::MAX),
        }),
        capture_policy: None,
    };
    assert!(
        binding.lease.is_some(),
        "persistent ingest runs under a lease"
    );

    let inherited = binding.safe_inherited_metadata();
    assert!(
        inherited.lease.is_none(),
        "a terminal lease must NEVER inherit into a child session"
    );
    assert!(inherited.tmux_pane_id.is_none());
    assert!(inherited.attached_session_key.is_none());
    assert_eq!(
        inherited.session_anchor.as_deref(),
        Some(format!("{DAY}/{SESSION}").as_str()),
        "the day/session anchor survives inheritance — identity flows, authority does not"
    );

    // ── (d) hierarchical Redis: same tuple, mandated layout, byte-pinned ──
    assert_eq!(
        GNOSTIC_SUBSTRATE_HIERARCHY,
        "{day}:{session}:{turn}:{coordinate}"
    );
    let receipt_key = RedisKey::gnostic_substrate(
        CacheTier::Warm,
        DAY,
        SESSION,
        TURN,
        COORDINATE,
        "ingest-receipt",
    );
    assert_eq!(
        receipt_key.as_str(),
        "cache:warm:s5:gnostic:14-07-2026:20260714-001500-1a58f7:t7:M2-1:ingest-receipt"
    );
    let snapshot_key =
        RedisKey::coordinate_lookup_snapshot("graph-rev-17", DAY, SESSION, TURN, COORDINATE);
    assert!(
        snapshot_key
            .as_str()
            .contains(&format!("{DAY}:{SESSION}:{TURN}:{COORDINATE}")),
        "the coordinate snapshot rides the SAME hierarchy as the receipt: {}",
        snapshot_key.as_str()
    );

    // ── live leg: real SET/GET round trip when the local Redis answers ──
    let uri = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_owned());
    match RedisCache::connect(&RedisConfig { uri }).await {
        Ok(mut cache) => {
            let receipt = format!("{{\"day\":\"{DAY}\",\"session\":\"{SESSION}\",\"turn\":\"{TURN}\",\"coordinate\":\"{COORDINATE}\"}}");
            cache
                .set_key(&receipt_key, &receipt)
                .await
                .expect("live Redis SET under the hierarchical key");
            let read = cache
                .get_key(&receipt_key)
                .await
                .expect("live Redis GET under the hierarchical key");
            assert_eq!(read.as_deref(), Some(receipt.as_str()));
        }
        Err(err) => {
            // Graceful offline degrade (t5.10 idiom): every logical assertion
            // above already ran; the live round trip simply reports itself.
            eprintln!("[s5_gnostic_one_substrate_round_trip] live Redis unreachable ({err}) — logical assertions all held");
        }
    }
}
