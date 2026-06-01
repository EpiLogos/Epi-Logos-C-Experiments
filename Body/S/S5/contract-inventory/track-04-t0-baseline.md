# Track 04 T0 Baseline Characterization

This inventory freezes the current S5/S5' public API and persisted JSON state before the typed spine migration in later Track 04 tranches.

## Public APIs

- `ImprovementStore::new(root)` opens a filesystem state root and persists `s5-improvement-state.json`.
- `ImprovementStore::propose(request)` validates target family, coordinate, direction, and baseline path, then creates a `LoopState::Hypothesis` run with an `autoresearch://challenger/{run_id}` challenger.
- `ImprovementStore::evaluate(run_id, evidence)` requires non-empty evidence, validates source refs and advisory kernel evidence, computes weighted scores, and records `ImprovementDecision::Keep` only when the challenger score is higher.
- `ImprovementStore::promote(request)` is dry-run-only; non-dry-run promotion is blocked until review and compiler mutation are wired. Dry runs require a kept run and `approved_review_resolution_id`.
- `ImprovementStore::status()` and `history(limit)` read the same persisted JSON state and report active vectors, decision counts, and kernel evidence count.
- `ReviewStore::new(root)` opens a filesystem state root and persists `s5-review-state.json`.
- `ReviewStore::submit(submission)` validates title, body, object-shaped coordinate context, and advisory-only kernel visibility before creating an open item.
- `ReviewStore::inbox(filter)` filters by status/source, sorts by priority descending and creation time ascending, and applies an optional limit.
- `ReviewStore::resolve(request)` requires rationale and item id. Human-required reviews can be deferred by agents but cannot be approved, rejected, or revised by agents.
- `ReviewStore::history(limit)` returns non-open items plus resolution records from the same persisted JSON state.
- `InboxStore::new(root)` creates the JSONL inbox directory used by the Aletheia handoff.
- `InboxStore::append(entry)` writes one compact JSON line to `{session_id}.jsonl` and returns a deterministic `{session_id}#L{line_index}` id.
- `InboxStore::list_pending()` reads real JSONL files, ignores non-JSONL files and blank lines, and fails on malformed entries instead of dropping them.
- `recompose_pass(store)` reads `InboxStore` entries and emits one `NextComposeHint` per pending entry; every current output defaults to `RecomposeDecision::HumanReview`.
- `EpiiAgentAccess::new(state_root)` reads review state from `s5/epii-review` and improvement state from `s5/epii-autoresearch`.
- `EpiiAgentAccess::snapshot()` exposes real review counts, improvement counts, active vectors, and gateway method names without placeholder state.
- `EpiiAgentAccess::deposit(request)` creates a real review item, optionally creates an improvement run for `ImprovementRequest`, and records the day/NOW/session inbox surface.

## Baseline Fixtures

- `Body/S/S5/fixtures/track-04-t0/s5-improvement-state.json` captures the current `ImprovementState` shape with one kept run and one active hypothesis run.
- `Body/S/S5/fixtures/track-04-t0/s5-review-state.json` captures the current `ReviewState` shape with one human-required open item and one resolved Aletheia item.

## Temporary Implementation Seam

`epii-autoresearch-core/src/lib.rs` still calls `today_hen_timestamp()` during dry-run promotion, and that helper returns `HenTimestamp::new(2026, 5, 3, 0, 0, 0)`. Track 04 Tranche 5 explicitly targets replacing this hard-coded Hen timestamp with caller-supplied or system-derived day/NOW input and deterministic tests.
