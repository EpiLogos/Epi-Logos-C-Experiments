use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use epi_s3_gateway_contract::{ChatRunRegistry, GatewayEvent, RunContext, RunSnapshot};
use tokio::sync::mpsc::{self, UnboundedReceiver, UnboundedSender};
use tokio::sync::Mutex as AsyncMutex;

#[derive(Clone, Default)]
pub struct GatewayRuntimeState {
    inner: Arc<GatewayRuntimeInner>,
}

#[derive(Default)]
struct GatewayRuntimeInner {
    runs: Mutex<HashMap<String, RunContext>>,
    seq_by_run: Mutex<HashMap<String, u64>>,
    snapshots: Mutex<HashMap<String, RunSnapshot>>,
    listeners: Mutex<HashMap<u64, UnboundedSender<GatewayEvent>>>,
    next_listener_id: AtomicU64,
    chat_runs: Mutex<ChatRunRegistry>,
    chat_processes: Mutex<HashMap<String, Arc<AsyncMutex<tokio::process::Child>>>>,
    aborted_chat_runs: Mutex<HashSet<String>>,
    subscriptions: Mutex<HashMap<String, GatewaySubscriptionRecord>>,
}

/// Per-gateway record of an active live subscription (s3'.temporal.subscribe or
/// s3'.spacetime.subscribe). Keys the auth-bound subscription identity so
/// lifecycle/delta events emitted onto the shared GatewayEvent broadcast can be
/// correlated by consumers and replayed/reaped per session or agent.
///
/// `source` distinguishes `websocket-multiplex` (the canonical client-facing
/// single-WS path) from `http-sql-fallback` (the explicit degraded mode named
/// in 03.T2 deliverable 5). `privacy_class` carries the M5-4 stream-metadata
/// privacy gate downstream consumers must honour.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct GatewaySubscriptionRecord {
    pub subscription_id: String,
    pub method: String,
    pub connection_id: u64,
    pub session_key: String,
    pub agent_id: String,
    pub scope: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_id: Option<String>,
    pub privacy_class: String,
    pub source: String,
    pub day_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vault_now_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub graphiti_namespace_ref: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub graphiti_arc_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub projection_source: Option<String>,
    pub opened_at_ms: u64,
}

pub struct GatewayEventSubscription {
    id: u64,
    receiver: UnboundedReceiver<GatewayEvent>,
}

impl GatewayEventSubscription {
    pub fn id(&self) -> u64 {
        self.id
    }

    pub async fn recv(&mut self) -> Option<GatewayEvent> {
        self.receiver.recv().await
    }
}

impl GatewayRuntimeState {
    pub fn register_run(&self, context: RunContext) {
        self.inner
            .runs
            .lock()
            .expect("gateway runtime runs lock should not poison")
            .insert(context.run_id.clone(), context);
    }

    pub fn run_context(&self, run_id: &str) -> Option<RunContext> {
        self.inner
            .runs
            .lock()
            .expect("gateway runtime runs lock should not poison")
            .get(run_id)
            .cloned()
    }

    pub fn session_key_for_run(&self, run_id: &str) -> Option<String> {
        self.run_context(run_id).map(|context| context.session_key)
    }

    pub fn next_seq(&self, run_id: &str) -> u64 {
        let mut seq_by_run = self
            .inner
            .seq_by_run
            .lock()
            .expect("gateway runtime seq lock should not poison");
        let next = seq_by_run.get(run_id).copied().unwrap_or(0) + 1;
        seq_by_run.insert(run_id.to_owned(), next);
        next
    }

    pub fn cache_snapshot(&self, snapshot: RunSnapshot) {
        self.inner
            .snapshots
            .lock()
            .expect("gateway runtime snapshots lock should not poison")
            .insert(snapshot.run_id.clone(), snapshot);
    }

    pub fn snapshot(&self, run_id: &str) -> Option<RunSnapshot> {
        self.inner
            .snapshots
            .lock()
            .expect("gateway runtime snapshots lock should not poison")
            .get(run_id)
            .cloned()
    }

    pub fn snapshots_for_session(&self, session_key: &str) -> Vec<RunSnapshot> {
        let mut snapshots = self
            .inner
            .snapshots
            .lock()
            .expect("gateway runtime snapshots lock should not poison")
            .values()
            .filter(|snapshot| snapshot.session_key == session_key)
            .cloned()
            .collect::<Vec<_>>();
        snapshots.sort_by(|left, right| {
            left.started_at_ms
                .cmp(&right.started_at_ms)
                .then_with(|| left.run_id.cmp(&right.run_id))
        });
        snapshots
    }

    pub fn subscribe(&self) -> GatewayEventSubscription {
        let id = self.inner.next_listener_id.fetch_add(1, Ordering::Relaxed) + 1;
        let (sender, receiver) = mpsc::unbounded_channel();
        self.inner
            .listeners
            .lock()
            .expect("gateway runtime listeners lock should not poison")
            .insert(id, sender);
        GatewayEventSubscription { id, receiver }
    }

    pub fn unsubscribe(&self, id: u64) {
        self.inner
            .listeners
            .lock()
            .expect("gateway runtime listeners lock should not poison")
            .remove(&id);
    }

    pub fn broadcast(&self, event: GatewayEvent) {
        let mut stale = Vec::new();
        {
            let listeners = self
                .inner
                .listeners
                .lock()
                .expect("gateway runtime listeners lock should not poison");
            for (id, sender) in listeners.iter() {
                if sender.send(event.clone()).is_err() {
                    stale.push(*id);
                }
            }
        }

        if stale.is_empty() {
            return;
        }

        let mut listeners = self
            .inner
            .listeners
            .lock()
            .expect("gateway runtime listeners lock should not poison");
        for id in stale {
            listeners.remove(&id);
        }
    }

    pub fn add_chat_run(&self, session_key: &str, run_id: &str) {
        self.inner
            .chat_runs
            .lock()
            .expect("gateway runtime chat registry lock should not poison")
            .add(session_key, run_id);
    }

    pub fn active_chat_runs(&self, session_key: &str) -> Vec<String> {
        self.inner
            .chat_runs
            .lock()
            .expect("gateway runtime chat registry lock should not poison")
            .list(session_key)
    }

    pub fn remove_chat_run(&self, run_id: &str) -> Option<String> {
        self.inner
            .chat_runs
            .lock()
            .expect("gateway runtime chat registry lock should not poison")
            .remove_run(run_id)
    }

    pub fn register_chat_process(
        &self,
        run_id: &str,
        child: Arc<AsyncMutex<tokio::process::Child>>,
    ) {
        self.inner
            .chat_processes
            .lock()
            .expect("gateway runtime chat process lock should not poison")
            .insert(run_id.to_owned(), child);
    }

    pub fn chat_process(&self, run_id: &str) -> Option<Arc<AsyncMutex<tokio::process::Child>>> {
        self.inner
            .chat_processes
            .lock()
            .expect("gateway runtime chat process lock should not poison")
            .get(run_id)
            .cloned()
    }

    pub fn remove_chat_process(
        &self,
        run_id: &str,
    ) -> Option<Arc<AsyncMutex<tokio::process::Child>>> {
        self.inner
            .chat_processes
            .lock()
            .expect("gateway runtime chat process lock should not poison")
            .remove(run_id)
    }

    pub fn mark_chat_aborted(&self, run_id: &str) {
        self.inner
            .aborted_chat_runs
            .lock()
            .expect("gateway runtime aborted chat lock should not poison")
            .insert(run_id.to_owned());
    }

    pub fn take_chat_aborted(&self, run_id: &str) -> bool {
        self.inner
            .aborted_chat_runs
            .lock()
            .expect("gateway runtime aborted chat lock should not poison")
            .remove(run_id)
    }

    /// Register a live subscription record. Returns the previous record under
    /// the same subscription_id, if any (the caller can use this to detect a
    /// resubscribe-on-same-id pattern).
    pub fn register_subscription(
        &self,
        record: GatewaySubscriptionRecord,
    ) -> Option<GatewaySubscriptionRecord> {
        self.inner
            .subscriptions
            .lock()
            .expect("gateway runtime subscriptions lock should not poison")
            .insert(record.subscription_id.clone(), record)
    }

    /// Drop a subscription record. Returns the removed record so consumers can
    /// emit a closed lifecycle event with full identity metadata.
    pub fn unregister_subscription(
        &self,
        subscription_id: &str,
    ) -> Option<GatewaySubscriptionRecord> {
        self.inner
            .subscriptions
            .lock()
            .expect("gateway runtime subscriptions lock should not poison")
            .remove(subscription_id)
    }

    /// All currently-tracked subscription records (any session, any agent,
    /// either source). Order is unspecified; sort externally if needed.
    pub fn active_subscriptions(&self) -> Vec<GatewaySubscriptionRecord> {
        self.inner
            .subscriptions
            .lock()
            .expect("gateway runtime subscriptions lock should not poison")
            .values()
            .cloned()
            .collect()
    }

    /// Subscriptions filtered to a single session, sorted by opened_at_ms.
    pub fn subscriptions_for_session(&self, session_key: &str) -> Vec<GatewaySubscriptionRecord> {
        let mut records = self
            .inner
            .subscriptions
            .lock()
            .expect("gateway runtime subscriptions lock should not poison")
            .values()
            .filter(|record| record.session_key == session_key)
            .cloned()
            .collect::<Vec<_>>();
        records.sort_by(|left, right| left.opened_at_ms.cmp(&right.opened_at_ms));
        records
    }
}
