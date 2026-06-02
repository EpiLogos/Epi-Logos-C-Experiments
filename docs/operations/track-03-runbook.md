# Track 03 Operator Runbook — Gateway + SpaceTimeDB + Graphiti + S1 Vault Surface

**Status:** Track 03 release gate OPEN as of 2026-06-02 (T1 → T7 complete).
**Scope:** how to run, verify, and operate the S0/S3 gateway, the local
SpaceTimeDB module, the Graphiti compatibility runtime, and the S1 vault
surface that the Theia kernel-bridge consumes.

---

## 1. Local development setup

Three runtimes back the gateway:

| Service | Port | Required | How to start |
|---|---|---|---|
| SpaceTimeDB host | 3000 | yes | `spacetime start --listen-addr 127.0.0.1:3000` |
| Graphiti runtime | 37778 | optional | `docker compose -f docker-compose.epi-s2.yml up -d graphiti` |
| Neo4j + Redis | 7474/7687/6379 | optional (graph-services) | same docker-compose file |

### Install the SpaceTimeDB CLI

```bash
curl -sSf https://install.spacetimedb.com -o /tmp/stdb-install.sh && bash /tmp/stdb-install.sh --yes
export PATH="$HOME/.local/bin:$PATH"
spacetime version install 2.2.0   # matches Body/S/S3/epi-spacetime-module pin
spacetime version use 2.2.0
```

### Publish the module

```bash
cd Body/S/S3/epi-spacetime-module
spacetime build
spacetime publish epi-logos-runtime --server http://127.0.0.1:3000 -y
```

`spacetime publish --delete-data` performs a destructive re-publish; use it
when the schema changes (e.g. between v1 → v2 projection schema).

### Verify the install

```bash
spacetime sql epi-logos-runtime --server http://127.0.0.1:3000 "SELECT * FROM module_version"
```

A single row with the current `clock_protocol_version` /
`kerykeion_version` / `projection_schema_version` / `reducer_abi_version`
confirms the publish landed and matches the host's contract crate.

---

## 2. Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `SPACETIMEDB_URL` | (unset) | Live SpaceTimeDB HTTP endpoint. When unset, gateway uses the explicit-fallback path. |
| `SPACETIMEDB_DATABASE` | `epi-logos-runtime` | Database identifier. |
| `EPI_SPACETIME_SUBSCRIPTION_MODE` | (unset → `http-sql-poll`) | `native-websocket` enables the native subscribe path. |
| `EPI_SPACETIME_SUBSCRIPTION_PROFILE` | `lite` | `full` subscribes to every projection table (14 tables). |
| `EPI_INSTALLATION_ID` | `local` | Installation identity used in reducer payloads. |
| `EPI_GATEWAY_ID` | `gateway-<port>` | Gateway identity used in reducer payloads. |
| `EPI_GATEWAY_ENDPOINT` | `ws://127.0.0.1:<port>` | Gateway WS endpoint advertised on registration. |
| `EPI_WORKSPACE_ROOT_HASH` | computed | Stable hash of the workspace root. |
| `EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK` | `0` | **03.T7 production fallback opt-in.** Set to `1` (or `true`) to allow HTTP SQL polling in production environments. Default refuses production fallback. |
| `EPILOGOS_VAULT` | (unset) | Vault root for `s1'.vault.*` methods when params omit `vaultRoot`. |

---

## 3. Production fallback policy (03.T7)

HTTP SQL polling is the fallback for SpaceTimeDB subscription. It is a
visibly-degraded mode — every subscription that uses it emits a
`fallback-active` lifecycle envelope. The policy:

- **Default (`development-only`)**: HTTP polling is permitted in local
  development. The gateway surfaces `productionFallbackPolicy =
  development-only` on every subscription envelope. Consumers (kernel-bridge,
  M-extensions, alert dashboards) MUST treat any data that crossed a
  `fallback-active` envelope as suspect in production.
- **Operator opt-in (`operator-opt-in`)**: set
  `EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK=1` to permit HTTP polling in a
  production environment. The gateway surfaces
  `productionFallbackPolicy = operator-opt-in` on every envelope so audit
  tools can correlate against the running operator policy.

The gateway never silently falls back: the lifecycle event is always
emitted when the subscription uses HTTP polling. The policy describes
**permission**, not transparency.

---

## 4. Run the verification suite

Track 03 has 5 live release-gate tests in `Body/S/S0/epi-cli/tests/gate_release_gate.rs`:

```bash
# Set up env and run all 5 live tests serially (the env probe is shared).
CARGO_TARGET_DIR=/tmp/epi-cargo-target \
  cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml \
  --test gate_release_gate -- --ignored --test-threads=1 --nocapture
```

Expected output:

```
[T7-lat] p50: 1 ms  p95: 1 ms
test release_gate_bind_kairos_p95_under_100ms ... ok
[T7] tick 1 spread: 0 ms ... tick 5 spread: 0 ms
test release_gate_multi_subscriber_world_clock_within_30ms ... ok
test release_gate_privacy_audit_no_forbidden_fields_anywhere_in_projection ... ok
test release_gate_reconnect_does_not_replay_consumed_deltas ... ok
[T7-canon] median spread: 0 ms / p95: 1 ms
test release_gate_ten_subscriber_canonical_30_tick_soak ... ok
test result: ok. 5 passed
```

Test riders:

- `bind_kairos_p95_under_100ms`: gateway `bind_kairos_surface` → typed
  KairosSurface delta p95 across 30 round-trips must stay under 100 ms.
- `multi_subscriber_world_clock_within_30ms`: 4 simultaneous subscribers see
  every world_clock tick within ±30 ms median (CI-friendly).
- `ten_subscriber_canonical_30_tick_soak`: 10 subscribers × 30 ticks at
  1 Hz; median spread under ±30 ms, p95 under 100 ms.
- `privacy_audit_no_forbidden_fields_anywhere_in_projection`: scans every
  public table for the `PRIVACY_FORBIDDEN_FIELD_NAMES` list (see
  `Body/S/S3/gateway-contract/src/lib.rs`); any hit closes the gate.
- `reconnect_does_not_replay_consumed_deltas`: drop the subscription,
  re-subscribe, and verify the recovered `InitialSubscription` carries
  only the *latest* state — no replay of consumed intermediate ticks.

The CI-friendly counterpart of the canonical 10-subscriber soak runs by
default (`release_gate_multi_subscriber_world_clock_within_30ms`); the
canonical 10-subscriber × 30-tick variant runs only with `--ignored`.

---

## 5. Privacy audit

The privacy audit (03.T7) scans every public SpaceTimeDB row for forbidden
field names. The forbidden list (in `gateway-contract`) covers:

- Graphiti episode bodies: `episode_id`, `episode`, `episode_body`,
  `memory_body`, `protected_payload`, `journal_text`, `dream_body`,
  `raw_episode`.
- Alpha-spec Nara invariants: `raw_birth_data`, `birth_data`,
  `dream_content`, `profile_hash_preview`, `layer_mask`,
  `personal_nexus_body`, `personal_nexus`, `personalnexus_body`.
- Raw identity: `raw_identity`, `raw_quaternionic_bytes`.

To run the audit ad-hoc against a live database without `cargo test`:

```bash
for table in session_surface kairos_surface global_temporal_surface \
             pratibimba_presence shared_archetype_event coincidence \
             world_clock world_clock_tick coincidence_tick module_version; do
  echo "=== $table ==="
  spacetime sql epi-logos-runtime --server http://127.0.0.1:3000 \
    "SELECT * FROM $table" | grep -E "(episode_body|raw_birth|journal_text|dream_|personal_nexus|raw_identity)" || echo "clean"
done
```

If anything other than `clean` appears, file a privacy regression issue
immediately — the offending reducer is leaking protected data.

---

## 6. Common operational tasks

### Restart everything

```bash
# Kill the gateway.
pkill -f "epi --json gate start" || true
# Kill the local SpaceTimeDB.
pkill -f "spacetime start" || true
# Restart SpaceTimeDB.
nohup spacetime start --listen-addr 127.0.0.1:3000 > /tmp/stdb.log 2>&1 &
# Restart the gateway (use the same port as your client).
nohup epi --json gate start --port 18794 > /tmp/gate.log 2>&1 &
```

### Verify gateway readiness

```bash
epi --json gate status                # local status (filesystem)
epi --json gate methods | python3 -c '
import json, sys
print([m for m in json.load(sys.stdin) if m.startswith("s3'\''") or m.startswith("s1'\''")])'
```

### Re-publish the module (destructive — drops all rows)

```bash
cd Body/S/S3/epi-spacetime-module
spacetime publish epi-logos-runtime --server http://127.0.0.1:3000 --delete-data -y
```

### Inspect lifecycle events on a session

```bash
# Future: epi gate subscribe --method 's3'\''.subscription.lifecycle' --session-key ...
# Currently: connect via WS and listen for `s3'.subscription.lifecycle` events.
```

---

## 7. First hosted deployment checklist

When promoting from local to hosted:

1. **Set the operator opt-in env var explicitly**: either
   `EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK=1` (you've accepted degraded
   mode) or leave it unset (you require native-WS or the gateway refuses
   to serve subscriptions).
2. **Run the privacy audit** against the hosted SpaceTimeDB before exposing
   it to any client.
3. **Run the 10-subscriber canonical soak** against the hosted gateway to
   characterise spread under network conditions different from local.
4. **Confirm `module_version` row matches the gateway's
   `projection_schema_version` / `reducer_abi_version` /
   `clock_protocol_version`** constants. Mismatch surfaces as
   `KernelBridgeProtocolMismatch` to the kernel-bridge and consumers
   refuse to render.
5. **Confirm the Graphiti runtime is reachable** if any agent depends on
   `s5.episodic.*`. `GraphitiRuntimeStatus` is surfaced on every
   subscription envelope (`available` / `degraded` / `unavailable`).

---

## 8. Track 03 release-gate report

The machine-readable shape of the gate (see
`Track03ReleaseGateReport` in `gateway-contract`):

```json
{
  "multiSubscriberClockWithinTolerance": true,
  "bindKairosP95Under100ms": true,
  "reconnectRecoversLatestState": true,
  "privacyAuditNoForbiddenFields": true,
  "productionFallbackPolicy": "development-only",
  "graphitiRuntimeStatus": "available",
  "projectionSchemaVersion": "2026-06-02.s3-projection-v2",
  "reducerAbiVersion": "2026-06-02.s3-reducer-v2",
  "clockProtocolVersion": "2026-06-01.s3-clock-v1"
}
```

The gate is **open** when every pass/fail criterion is true. The
`productionFallbackPolicy` and `graphitiRuntimeStatus` are operator
context, not pass/fail criteria — they describe the operating environment
the gate opened in.
