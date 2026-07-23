# m-dev handoff — Track 27 OmniPanel tabs (paste as new-session prompt)

Continue `/m-dev` on the cycle-3 full rerun. Track 27 has landed **code-ahead** (committed, tested, UNMOUNTED). Finish integration + closes, then keep developing along m-dev lines.

## State (committed — do NOT rebuild)
- **27.3 Dispatch Trace — DONE.** Mounted (`App.tsx omniDispatchTrace → DispatchTracePanel`), full components, UF-proven.
- **27.4 Tool Stream — core, UNMOUNTED.** `ToolStreamPanel.tsx` (+ tests): temporal fold of the same pi→subagent genealogy, live/pause, actor/event-kind/time/tool-name filters, no-payload-leak. Commits `5fc3025e`, `bac8a664`.
- **27.5 Evidence pane — core, UNMOUNTED.** `EvidencePanel/EvidencePacketList/EvidencePacketView/PrivacyClassBadge/DispatchTraceMiniGraph` (+ tests): schema-backed on `MediatedRunEvidencePacket`, protected-body non-leak, filters, honest-empty. Commits `9d3f8dc8`, `57122669`.
- Tri-directional **15.11 cross-fold** (Dispatch↔Tools↔Evidence) wired.

## Remaining moves (in order)
1. **Mount 27.4** — `App.tsx omniLogs → ToolStreamPanel` + tool-stream styles. DESIGN CALL: ToolStreamPanel folds the dispatch genealogy (empty without subagent sessions), so do NOT drop the raw-log `LogsPane` wholesale (regression). COMPOSE it (genealogy stream primary + raw log subordinate — mirror the 27.3 `<details open>` composition pattern) or get Architect sign-off to replace. Then claim → close 27.4 (UF gate).
2. **Mount 27.5** — `App.tsx omniEvidence → EvidencePanel` + `omnipanelRuntime.ts` dispatch-trace-style manifest `landed:true` + styles. Renders honest-empty until a packet feed lands. Then claim → review/close 27.5.
3. **Feed-gated 27.5 pieces — build ONLY when the feed/schema exists; do NOT invent interfaces:** EvidenceDepositForm (`RunEvidenceEnvelope` was SUPERSEDED — no schema; needs `s5.epii.deposit`), DecisionRegisterEntries (`s5'.decision_register.list_for_packet`), VerifierRVirtueWitnessVector (`contemplate.fetch_wisdom_delta` + `VIRTUE_LUT[9]`), and a real packet feed.
4. **27.7 Gateway / 27.8 Diagnostics tabs** — feed-gated (status/telemetry); build when feeds land.

## Why the code-ahead stopped
Every remaining piece needs a feed/schema absent from the carrier (building = inventing an interface). Mounts + ledger closes touch `App.tsx`/`styles.css` (shared) which a concurrent worker held.

## Known flake (not a defect)
`pratibimba-consent.spec.ts:274` fails under full app-ui-flow parallel load, passes 1/1 in isolation. Close UF tranches via the flake-judgment: `verify-tranche <id> --owner <verifier> --only honesty-lint` (PASS record) + `--mark done` with a receipt citing the tranche's OWN UF spec. verifier ≠ closer.

## Housekeeping
GitNexus index stale (last `dfae704`); run `npx gitnexus analyze --embeddings` when quiet.

## Then continue m-dev normally
`node .codex/scripts/m-dev-plan-assess.mjs --route --write --json --require-now` → claim → build (TDD) → verify (verifier≠closer) → `--mark` → commit per tranche.
