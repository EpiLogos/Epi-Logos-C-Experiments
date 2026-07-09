---
coordinate: "M'"
authority: "Cycle-3 canon-update ledger; aggregator of bimba-canon mutation proposals across the M-prime corpus. Distinct from DR register (Track 13 — design contradictions) and CCT register (Track 16 — cross-cutting closures): the ledger holds *additive* canon proposals (new identities, new entities, new typed relations, new vocabulary, new canonical forms, new cross-references) that surface from exploration sessions and must route through ratification to landing. Designed 2026-06-15 by Plan subagent + parent-agent refinement; seeded with Phase-J five identities surfacing the canonical α-rasa ↔ transcriptional-bridge ↔ holographic-128-byte connective tissue."
status: "active"
created: "2026-06-15"
cycle: 3
phase: "J"
governed_by: ["DR-M3-6", "DR-Q-1", "DR-S5-ONE-1", "DR-VAK-7", "CCT-14", "CCT-14b"]
upstream_intake_flows:
  - "Sophia disclosure q_proposal envelope (Tranche 12.26 — buildSophiaDisclosure)"
  - "Hen entity-candidate lifecycle (CCT-14) — CU-ENTITY rows enter via Empty/Present orphan capture"
  - "ARENA promotion intake (Tranche 41.11) — warm Vama Shakti threshold crossings enter as CU-ENTITY rows with vama_shakti_class provenance"
  - "Manual edit during sessions (default for working-session surfacing)"
  - "CLI: epi bimba propose <category> <claim> (NEW per Tranche 40.1)"
  - "Sub-agent surfacing via epi-claw-gateway → Sophia envelope as if q_proposals"
downstream_landing_sites:
  - "Idea/Bimba/Seeds/M/* (canonical spec edits)"
  - "Idea/Bimba/World/Types/Coordinates/C*/* (new typed entities, per CCT-14/CCT-15)"
  - "Idea/Bimba/World/{Name}.md (flat World graduation per DR-WORLD-1)"
  - "13-decision-register.md (when proposal escalates to DR; only CU-FORM and CU-REL escalate)"
  - "Body/S/S2/graph-schema/src/lib.rs (when new relation type or property family)"
release_gate_dependency: "Track 40 closure feeds Tranche 14 release gates G7-G14; cycle-3 release does not pass until every CU row is either status≥validated OR explicitly status:refused/deferred."
distinct_from:
  - "Track 13 DR register: contradictions, not additive proposals"
  - "Track 16 CCT register: cross-cutting closures, not single-coordinate proposals"
  - "SwarmVault dev-vault: dev memory (tasks, sources, candidates), never writes into Idea/"
---

# Track 40 — Bimba Canon Update Ledger

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


The trackable aggregator for bimba-canon mutation proposals across the M-prime corpus. Holds **additive** canon proposals (identities, entities, typed relations, vocabulary, canonical forms, cross-references) that surface during exploration sessions and must route through ratification to landing.

## Why this exists

Cycle 3 has accumulated significant bimba-canon implications across the spec corpus that are **stated in one place but not aggregated into trackable canon updates**. Example: the Phase-J synthesis surfaced FIVE new arithmetic identities connecting the canonical α-rasa bridge (`Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`), the canonical transcriptional bridge (`Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md`), the canonical Third Spanda Equation (DR-M3-6 + `ql_m0_m3_third_spanda_integral_quilting_v2.md`), and the canonical 128-byte holographic-coordinate struct (`Idea/Bimba/Seeds/M/M5'/Legacy/specs/M/M5-epii-holographic-integration.md`). These are NEW identities — algebraically clean, mutually-derivable from canon, but floating in exploration rather than typed into a canonical structure.

Track 40 is the aggregator that makes such surfaces trackable as first-class canon-update candidates with lifecycle, provenance, target-landing discipline, and cross-reference enforcement.

## Boundary discipline

- **Additive only.** Contradictions go to Track 13 (DR register). Cross-cutting closures go to Track 16 (CCT register). Dev-memory tasks go to SwarmVault. Code-implementation tranches go to existing cycle-3 plan tracks (01-39).
- **DR escalation discipline.** Only CU-FORM (new canonical form added to an enumerated set) and CU-REL (new typed relation or schema family) rows MAY escalate to a DR row. CU-IDENTITY / CU-XREF / CU-VOCAB / CU-ENTITY rows never become DRs; they ratify via batch user validation (default) or via Hen entity-candidate lifecycle (for CU-ENTITY, per CCT-14).
- **Landed entries carry a marker.** When a CU row reaches `status: landed`, the target file MUST carry an inline marker `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->` adjacent to the affected paragraph AND the target file's frontmatter MUST carry `canon_updates_landed: ["CU-*@YYYY-MM-DD", ...]` (whole-file index). Enforced by lint test (per §Verification below).

## Entry schema

Each ledger row carries the following typed envelope:

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `CU-{CATEGORY}-{N}` | yes | E.g., `CU-IDENTITY-1`, `CU-FORM-1`, `CU-ENTITY-1`. N is sequential within category. |
| `title` | one-line phrase | yes | Verb-nominal ("Sixth canonical form of Third Spanda: 137 = 64 + 73"). |
| `category` | enum (see §Categories) | yes | One of IDENTITY / FORM / ENTITY / REL / VOCAB / XREF / FORM-EXEC-TRACE. |
| `status` | enum (see §Lifecycle) | yes | One of surfaced / designed / reviewed / validated / landed / refused / deferred / superseded. |
| `claim_statement` | prose | yes | Single declarative sentence stating the proposed canon update. |
| `mathematical_form` | LaTeX/symbolic | when applicable | E.g., `$137 = 64 + 73$`. Empty for entity/vocab/xref categories. |
| `derivation` | prose + cites | yes for IDENTITY/FORM | How it follows from existing canon. Cite `file.md:line` per cycle-3 evidence discipline. |
| `target_landing_site` | typed object | yes | `{kind: "spec-edit" \| "new-entity" \| "new-relation" \| "new-form" \| "xref-add" \| "exec-trace-extend", path: "...", anchor: "§N or :line"}` |
| `depends_on` | `[CU-*, DR-*, CCT-*]` | optional | Strict ordering before this row may land. |
| `blocks` | `[CU-*, Tranche, DR-*]` | optional | What stalls if this never lands. |
| `supersedes` | `[CU-*]` | optional | Prior proposal replaced. |
| `originating_session` | `{date, agent, conversation_id}` | yes | Provenance — primary key for surfacing. |
| `provenance_audit` | bullet list | yes | Files read + line ranges that ground the claim. Mirrors DR "Adjudication evidence" pattern. |
| `ratification_path` | enum | yes | One of: `XREF paragraph (doc-ahead-landing)`, `IDENTITY addition`, `FORM-EXEC-TRACE addition`, `Entity-candidate lifecycle (CCT-14)`, `DR escalation`, `Vocabulary law extension (DR-S1-6)`. |
| `c_5_birth_codon_provisional` | u8 (0..63) | optional | When CCT-14b lands, ledger entries themselves become birth-codon carriers (per CCT-14b at `16-cross-cutting-closures.md:124-127`). |
| `qm_witness` | `{session_id, content_hash, tick, vak_address?}` | optional | Hooks into Sophia disclosure `qm_witness_*` provenance per Tranche 12.26 envelope. |
| `vak_address` | VakAddress | optional | One VAK address per row, derived from `(coordinate, category, id)`; enables `s5'.gnostic.episode_search` retrieval by coordinate. |
| `vama_shakti_class` | `egregore \| sprite \| daemon \| mantra` | when `intake_flow: "arena-promotion"` | Provenance classifier for warm [[Vama Shakti]] promotion rows per DR-VAMA-6. |
| `augmentation_target` | `form_text \| element_signature` | when `intake_flow: "arena-promotion"` | Class-specific patch target: egregore/sprite/daemon append Form text; mantra merges an element-axis signature. |
| `landed_marker` | `{file, line, date}` | yes when status=landed | Records the inline `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->` location on landing. |
| `notes` | prose | optional | |

## Categories

| Code | Examples | Routes to |
|---|---|---|
| `IDENTITY` | New arithmetic identity over existing canon constants (e.g., `128 = 101 + 27`). | XREF paragraph (doc-ahead-landing) |
| `FORM` | New canonical *form* of an existing equation (e.g., sixth form of Third Spanda). Distinct from IDENTITY: a FORM enters a privileged enumerated set in the spec. | **DR escalation** (FORM additions to enumerated canonical sets touch DR-validated canon) |
| `ENTITY` | Coordinate-native entity proposal (e.g., the `37` as a typed C2 node; an α-coupling-bridge as a typed Form). | Entity-candidate lifecycle (CCT-14) → Hen promotion → World/Types/ |
| `REL` | Typed-relation proposal (new edge type or `c_1_relation_family` member). | **DR escalation** (DR-IG-1 schema) + S2 graph-schema PR |
| `VOCAB` | New `q_` / `qm_` / `c_*` / `s_*` / `t_*` / `m_*` / `l_*` family key. | Vocabulary law extension (DR-S1-6) |
| `XREF` | Cross-reference paragraph proposed at a target site (smallest unit; typically closes IDENTITY rows). | XREF paragraph (doc-ahead-landing) |
| `FORM-EXEC-TRACE` | New execution-trace identity extending the DR-M3-6 trace family (`64+72=136 → −9 → 127 → +1 → 128 → +9 → 137 → +δ`). | FORM-EXEC-TRACE addition (extends DR-M3-6 trace; sub-row under existing DR) |

## Lifecycle

```
surfaced  →  designed  →  reviewed  →  validated  →  landed
   ↓            ↓             ↓                          ↑
 refused    deferred      refused                  superseded
```

| State | Entry exit-condition |
|---|---|
| `surfaced` | Claim + originating_session recorded. Nothing else mandatory. |
| `designed` | `target_landing_site` + `derivation` + `ratification_path` filled. Provenance audit complete. |
| `reviewed` | Sophia/Epii co-review per DR-M5-1 governance complete. Recorded in `provenance_audit`. |
| `validated` | User ratification (parallels DR Phase-N validation pattern). For IDENTITY / FORM rows, user-validated batch is default cadence. |
| `landed` | Target file carries inline `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->` marker + frontmatter `canon_updates_landed` array entry. Verifier grep passes. |
| `superseded` | Replaced by a later CU-* row. |
| `refused` / `deferred` | Closed. Distinct from superseded — refused means the claim was rejected; deferred means parked pending some dependency. |

A row in `status: surfaced` for >7 days raises a Janus warning surface (parallels CCT-16(ii) stale-queue warning at `16-cross-cutting-closures.md:176`).

**ARENA promotion intake (`intake_flow: "arena-promotion"`).** Warm [[Vama Shakti]] rows from Tranche 41.11 enter Track 40 as `CU-ENTITY` rows only after classifier-specific thresholds emit `promotion_proposal_emitted`. The row MUST carry `vama_shakti_class`, `augmentation_target`, `distilled_vak_address_signature`, citation-coordinate frequency, pairwise resonance summary, and the append-only augmentation patch provenance comment. Hen's CCT-14 path is still the canon-write authority: accept moves the warm row toward `promotion_status: "accepted"` and routes the Form patch; reject archives the proposal under `Idea/Empty/Pratibimba/arena-promotion-archive/{date}-{coord}-{class}-{hash}.md` and records `promotion_status: "rejected"`.

## Integration with existing cycle-3 structure

| Surface | Relation |
|---|---|
| **Track 13 DR register** | Adjacent, not nested. CU-FORM and CU-REL rows MAY escalate to DR; all others ratify via batch user validation. |
| **Track 16 CCT register** | Downstream consumer. CU-ENTITY routes through CCT-14 entity-candidate lifecycle; CU-VOCAB routes through CCT-16 frontmatter-key regex; CU-XREF closes inside CCT-17 wikilink-span-pointer flow. |
| **Track 39 S5' substrate** | Upstream consumer. `s5'.gnostic.candidates` (per Track 39 Surface 1) IS the natural API for surfacing CU-ENTITY rows. `s0'.anuttara.trace` IS the verifier substrate for CU-IDENTITY derivations. |
| **Tranche 12.26 Sophia disclosure** | Sits **upstream** of the ledger. Sophia's envelope carries `q_proposals` per session; on `aletheia_session_promote` HOT→COLD promotion, drafts write to the ledger with `status: designed` (Sophia's `assertOpens()` + VAK routing satisfy the `designed` exit conditions). |
| **CCT-14 entity-candidate lifecycle** | Sits **downstream** for CU-ENTITY rows. CU-ENTITY rows ARE entity-candidate rows; `Idea/Empty/Present/{day}/entities/` files cross-reference the CU-ENTITY id; Hen promotion flips ledger state to `landed`. |
| **bimba-vault-validate / world / seeds skills** | Enforce frontmatter law on TARGET files. The ledger row carries its own frontmatter (per §Entry schema) but lives in plan-track residency, not Form/Type residency — does NOT ratify through these skills. |
| **SwarmVault dev-vault** | Parallel, never merged. SwarmVault holds dev tasks; the ledger holds canon updates. A SwarmVault entry MAY cross-reference a CU id; the reverse is forbidden (per the dev-vault no-write-to-Idea boundary). |

## Surface routing — three-tier intake

1. **Manual edit (default).** Append a row to the index table + section to this file. Use for synchronous surfacing during a working session. Matches how DR rows currently land.
2. **CLI: `epi bimba propose <category> <claim>`** (lands as Tranche 40.1 — see below). Wraps a gateway `s5'.canon_update.propose` route. Generates a draft row with `status: surfaced`, fills `originating_session` + `provenance_audit` from active session context, scaffolds `target_landing_site` from coordinate hint, opens an editor to complete fields.
3. **Sophia disclosure envelope (Tranche 12.26).** Each `q_proposal` in `buildSophiaDisclosure` carries an optional `canon_update_intent: CanonUpdateDraft?` field. When present, on `aletheia_session_promote` HOT→COLD promotion (Track 12 line ~526), the draft writes to the ledger with `status: designed`. Sub-agent surfacing (Codex / other agents) routes via `epi-claw-gateway` → Sophia envelope as if it were a q_proposal (avoids a second intake path).
4. **ARENA promotion intake: `epi nara arena vama propose-promotion <identity_handle>` → `hen_arena_promotion_intake`.** The S0 command delegates proposal-payload generation to S5 `epi_gnostic.arena_promotion`; Hen receives `arena-promotion` payloads, emits a Track 40 `CU-ENTITY` candidate with `vama_shakti_class` provenance, and preserves the class-specific `augmentation_target` (`form_text` or `element_signature`) for review.

## Cross-reference discipline (landing invariant)

When a row transitions to `status: landed`:

(a) The target file MUST carry an inline marker `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->` immediately adjacent to the affected paragraph.

(b) The target file's frontmatter MUST carry a `canon_updates_landed: ["CU-*@YYYY-MM-DD", ...]` array entry (whole-file index for query).

(c) **Lint test** at `cargo test -p epi-s2-graph-services --test canon_update_landed_xref_consistency` scans Track 40 for `status: landed` rows, asserts each row's `target_landing_site.path:anchor` contains the matching `canon-update: CU-*` marker AND the target file's `canon_updates_landed` frontmatter array includes the row id. Mismatch is a build-fail.

(d) Hen verification at promotion time additionally refuses any `World/Types/` write or canonical-spec edit that *adds* a canon-update marker without a corresponding ledger row in `status: validated` or higher. **The ledger is the only legal source of canon-update markers.**

## Tranches

40.1 — **CLI `epi bimba propose` + gateway `s5'.canon_update.*` route** *(code-pending-closure; depends on Tranche 12.2 EXPANDED `s5'.gnostic.*` registration; lands the second-tier intake per §Surface routing)*

Land the canon-update intake CLI + gateway routes. Five gateway methods register under `s5'.canon_update.*`:
- `s5'.canon_update.propose(category, claim, target_landing_hint?)` → `CanonUpdateDraftReceipt`
- `s5'.canon_update.status(id)` → `CanonUpdateStatus`
- `s5'.canon_update.list(filter)` → `[CanonUpdateRow]`
- `s5'.canon_update.land(id)` → `CanonUpdateLandConfirmation`
- `s5'.canon_update.refuse(id, reason)` → `CanonUpdateRefusal`

Plus CLI parity:
- `epi bimba propose <category> <claim>` (drafts new row at `status: surfaced`)
- `epi bimba list [--status surfaced|designed|...]`
- `epi bimba show <CU-id>`
- `epi bimba land <CU-id>` (transitions to `status: landed` + writes markers + updates frontmatter)
- `epi bimba refuse <CU-id> <reason>`

**Verification:** `grep -nE "s5'.canon_update\." Body/S/S3/gateway-contract/src/lib.rs` returns ≥5 method registrations; `grep -nE "epi bimba propose|epi bimba list|epi bimba land" Body/S/S0/epi-cli/src/bimba.rs` returns the CLI bindings; `cargo test -p epi-s3-gateway s5_canon_update_round_trip`.

40.2 — **Lint test: canon-update landed-marker consistency** *(code-pending-closure; depends on 40.1)*

Land the lint test `cargo test -p epi-s2-graph-services --test canon_update_landed_xref_consistency` enforcing the landing invariant per §Cross-reference discipline above.

40.3 — **Phase-J seed entries land + DR-M3-6 amendment** *(doc-ahead-landing; landed inline below; closes the cycle-3 first-batch)*

Five seed entries land Phase-J (Plan-subagent-designed + parent-agent-refined 2026-06-15). See entries CU-IDENTITY-1, CU-IDENTITY-2, CU-IDENTITY-3, CU-IDENTITY-4, CU-FORM-1 below.

---

# Index

| ID | Status | Title |
|---|---|---|
| **CU-IDENTITY-1** | landed | 128 = 101 + 27 — α-rasa doubled shell as transcriptional full graph + T-free shared |
| **CU-IDENTITY-2** | landed | 137 = 101 + 36 — Spanda attractor as transcriptional full graph + structural-mātric accounting |
| **CU-IDENTITY-3** | landed | 36 − 27 = 9 = epogdoon, transcriptionally derived |
| **CU-IDENTITY-4** | landed | 73 = 36 + 37 = 72 + 1 — M3-native parent expression as productive asymmetry |
| **CU-FORM-1** | landed | 137 = 64 + 73 — M3-native sixth canonical form of Third Spanda Equation (DR-M3-6 amended Phase-J 2026-06-15) |

---

## CU-IDENTITY-1 — `128 = 101 + 27`

**Status:** landed · **Surfaced:** 2026-06-15 · **Landed:** 2026-06-15 · **By:** user-pair-exploration synthesis session (post-Phase-I cycle-3 spec updates) · **Category:** IDENTITY · **Ratification path:** XREF paragraph (doc-ahead-landing) — user-batch validation

**Claim:** The α-rasa doubled 64-fold Mahāmāyā shell (canonical `128 = 64 × 2` per `alpha_rasa_bridge_ql.md` §3 line ~75) decomposes as the transcriptional full graph (101) plus the T-free shared codons (27). Algebraically: `101 + 27 = 128 ✓`. Interpretively: the 27 T-free shared codons that pass through transcription unchanged ARE the difference between the full transcriptional graph and the doubled-storage shell — the unchanged-self-copy that distinguishes `2 × 64` from `64 + 37`.

**Mathematical form:** $128 = 101 + 27 = (64+37) + 27 = 2 \times 64$

**Derivation:**
- α-rasa: $128 = 64 \times 2 = $ doubled Mahāmāyā shell (`Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md` §3 line ~75).
- Transcriptional bridge: $101 = 64 + 37$ (`Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md` §2 line 59).
- Transcriptional bridge: $64 = 27 + 37$ (T-free shared + T-containing transformable, `m3-prime-ql-transcriptional-bridge.md` §2.1).
- Therefore: $128 = 2 \times 64 = (27 + 37) + (27 + 37) = 27 + (37 + 27 + 37) = 27 + (27 + 74) = ...$ — multiple algebraic paths; the direct route is $101 + 27 = (64+37) + 27 = 64 + (37 + 27) = 64 + 64 = 128$.
- Interpretive: the unchanged-self-copy reading.

**Target landing site:** `{kind: "xref-add", path: "Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md", anchor: "§3 after the 128=64×2 paragraph"}`

**Depends on:** DR-M3-6 (Third Spanda canon, ratified); `m3-prime-ql-transcriptional-bridge.md` 27/37/101 canon (ratified at §2 line 59-68).

**Blocks:** CU-IDENTITY-3 (epogdoon-derivation depends on this decomposition); CU-FORM-1 (sixth canonical form's derivation chain consumes this).

**Provenance audit:**
- `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md:74-83` — canonical `128 = 64 × 2 = doubled Mahāmāyā shell`.
- `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md:55-68` — canonical 27/37/101 decomposition.
- Plan-subagent synthesis 2026-06-15 + parent-agent review.

**Originating session:** `{date: "2026-06-15", agent: "claude-opus-4-7[1m]+user-pair", conversation_id: "phase-J-canon-update-synthesis"}`

**qm_witness:** `{session_id: "phase-J-2026-06-15", content_hash: "<sha-on-land>", tick: <tick-on-land>, vak_address: "(CPF: 0/1, CT: CT5, CP: 3, CF: CF2, CFP: CFP0, CS: day)"}`

**Notes:** This decomposition routes α-rasa's high-energy doubled shell through transcriptional structure; the 27 T-free shared codons that pass unchanged are exactly what makes $128 = 2 \times 64$ rather than $101$.

---

## CU-IDENTITY-2 — `137 = 101 + 36`

**Status:** landed · **Surfaced:** 2026-06-15 · **Landed:** 2026-06-15 · **By:** user-pair-exploration synthesis session · **Category:** IDENTITY · **Ratification path:** XREF paragraph (doc-ahead-landing) — user-batch validation

**Claim:** The α-rasa Spanda attractor (canonical $137$ per `alpha_rasa_bridge_ql.md` §3) decomposes as the transcriptional full graph (101) plus the sixfold-squared structural-mātric accounting (36). The 137 low-energy atomic appearance IS the full transcriptional graph dressed in structural accounting.

**Mathematical form:** $137 = 101 + 36 = (64+37) + 36$

**Derivation:**
- α-rasa: $36 = 6^2$ = structural-mātric accounting (`alpha_rasa_bridge_ql.md` §3 line ~58: "$36 = 6^2$: the sixfold squared, the structural/mātric accounting of a full QL field").
- Transcriptional bridge: $101 = 64 + 37$.
- Direct verification: $101 + 36 = 137 ✓$.
- Canonical $137 = 64 + 72 + 1 = (64+36) + 36 + 1$ is preserved: $101 + 36 = (64+37) + 36 = 64 + 37 + 36 = 64 + 73 = 64 + 72 + 1 ✓$.

**Target landing site:** `{kind: "xref-add", path: "Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md", anchor: "§3 adjacent to the 137 = 64+72+1 derivation"}`

**Depends on:** CU-IDENTITY-1; DR-M3-6.

**Blocks:** CU-IDENTITY-3 (epogdoon-derivation as 36-27=9); CU-FORM-1.

**Provenance audit:**
- `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md:54-83` — canonical 137 forms.
- `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md:55-68` — canonical 101.
- Plan-subagent synthesis 2026-06-15.

**Originating session:** `{date: "2026-06-15", agent: "claude-opus-4-7[1m]+user-pair", conversation_id: "phase-J-canon-update-synthesis"}`

**qm_witness:** `{session_id: "phase-J-2026-06-15", content_hash: "<sha-on-land>", tick: <tick-on-land>, vak_address: "(CPF: 0/1, CT: CT5, CP: 3, CF: CF2, CFP: CFP0, CS: day)"}`

**Notes:** Pair-companion to CU-IDENTITY-1; together they form the storage/expression dialectic: 128 (storage shell as full graph + unchanged) ↔ 137 (atomic appearance as full graph + structural accounting). The 9-gap between them (CU-IDENTITY-3) IS the epogdoon tick that bridges them.

---

## CU-IDENTITY-3 — `36 − 27 = 9 = epogdoon, transcriptionally derived`

**Status:** landed · **Surfaced:** 2026-06-15 · **Landed:** 2026-06-15 · **By:** user-pair-exploration synthesis session · **Category:** IDENTITY · **Ratification path:** FORM-EXEC-TRACE addition (extends DR-M3-6 execution trace; sub-row under DR-M3-6 in DR register; user-batch validation)

**Claim:** The canonical epogdoon-9 (per `EPOGDOON_NUM = 9u` at `Body/S/S0/epi-lib/include/m1.h:788` and per the Third Spanda execution trace `128 + 9 = 137` at `ql_m0_m3_third_spanda_integral_quilting_v2.md:71`) is *transcriptionally derived* as $36 - 27$ — the difference between the structural-mātric accounting (36) and the T-free shared codons (27). Same epogdoon-9, two derivation paths through different sub-structures of M3.

**Mathematical form:** $36 - 27 = 9 = $ epogdoon

**Derivation:**
- Canonical: $137 - 128 = 9$ (third Spanda execution trace `ql_m0_m3_third_spanda_integral_quilting_v2.md:71`); $9 = $ "wholeness / expansion / epogdoon tick" per the same trace's commentary.
- Canonical: `EPOGDOON_NUM = 9u, EPOGDOON_DEN = 8u` at `Body/S/S0/epi-lib/include/m1.h:788-789`.
- Transcriptional: $36 = 6^2$ structural-mātric accounting; $27 = 3^3$ T-free shared codons (`m3-prime-ql-transcriptional-bridge.md` §2).
- Identity: $36 - 27 = 9 ✓$.
- Combined: $(137) - (128) = (101 + 36) - (101 + 27) = 36 - 27 = 9$ (algebraically derives the epogdoon through CU-IDENTITY-1 + CU-IDENTITY-2 paired).
- The matheme converging on itself: the epogdoon emerges from BOTH the external 128↔137 gap AND the internal structural-mātric vs T-free-shared partition. Same 9, two paths.

**Target landing sites (two; this is a multi-site landing):**
1. `{kind: "exec-trace-extend", path: "Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md", anchor: "§execution-trace block at :71-72"}` — extend with the transcriptional-derivation note.
2. `{kind: "xref-add", path: "Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md", anchor: "§2 table at :74-81"}` — add `36 - 27 = 9 = epogdoon` row as sibling to existing `37 - 27 = 10` row.

**Depends on:** CU-IDENTITY-1; CU-IDENTITY-2; DR-M3-6; DR-IG-7 (`9_M2 = 8_M3 + 1_M1` ratified canonical translation law).

**Blocks:** CU-IDENTITY-4 (the 73 = 36+37 derivation references this transcriptional-derivation of 9); CU-FORM-1.

**Provenance audit:**
- `Body/S/S0/epi-lib/include/m1.h:783-791` — canonical EPOGDOON constants.
- `Body/S/S0/epi-lib/include/m3.h:337-357` — `apply_epogdoon_compression` 9:8 M2↔M3 bridge.
- `Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md:69-73, 388-401` — canonical execution trace.
- `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md:55-93` — canonical 27/37 partition.

**Originating session:** `{date: "2026-06-15", agent: "claude-opus-4-7[1m]+user-pair", conversation_id: "phase-J-canon-update-synthesis"}`

**qm_witness:** `{session_id: "phase-J-2026-06-15", content_hash: "<sha-on-land>", tick: <tick-on-land>, vak_address: "(CPF: 0/1, CT: CT5, CP: 3, CF: CF2, CFP: CFP0, CS: day)"}`

**Notes:** The matheme converging on itself — same canonical 9 emerges from BOTH the 128↔137 external gap AND the structural-mātric ↔ T-free-shared internal partition. This is the genuinely new derivation path the corpus didn't aggregate before.

---

## CU-IDENTITY-4 — `73 = 36 + 37 = 72 + 1` (M3-native parent expression as productive asymmetry)

**Status:** landed · **Surfaced:** 2026-06-15 · **Landed:** 2026-06-15 · **By:** user-pair-exploration synthesis session · **Category:** IDENTITY · **Ratification path:** IDENTITY addition (extends `m3-prime-ql-transcriptional-bridge.md` §2 table) — user-batch validation

**Claim:** The M-stack view of $137 = M_3(64) + M_2(72) + M_1(1)$ (canonical DR-M3-6 form) has an M3-native re-expression: $M_2(72) + M_1(1) = 73 = 36 + 37$, where the M2's $72 = 36 \times 2$ doubled-bimba/pratibimba PLUS the M1 $+1$ appears as $36 + 37$ — and the $+1$ is supplied by the **productive asymmetry** $37 - 36 = 1$ between the T-containing-transformable count (37) and the structural-mātric square (36). The parent enters the transcriptional register not as a separate sealed term but as the asymmetry of the partition.

**Mathematical form:** $73 = 36 + 37 = 72 + 1$

**Derivation:**
- $72 = 2 \times 36 = $ M2 paraśakti doubled (canonical, α-rasa §3 line ~62: "$36 \times 2 = 72$: the bimba/pratibimba, Day/Night, Name/Power, jñāna/kriyā double articulation").
- $1 = $ M1-5 Hopf parent (DR-M1-1 ratified: +1 attribution is M1-5's K² topological-necessity).
- $72 + 1 = 73 ✓$ (canonical M-stack view).
- $36 + 37 = 73 ✓$ (transcriptional partition: structural-mātric + T-containing transformable).
- $37 - 36 = 1 = $ the productive asymmetry — the $+1$ IS the excess of the transcriptional-transformable count over the structural-mātric square. The parent is not a sealed term added to 72; it is the asymmetry IN the 73-as-36+37 partition.

**Target landing site:** `{kind: "spec-edit", path: "Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md", anchor: "§2 add identity row to table at :74-81"}`. Also: XREF paragraph in `alpha_rasa_bridge_ql.md` §3 linking the canonical 72+1 parent expression to its M3-native expansion as 36+37.

**Depends on:** CU-IDENTITY-1; CU-IDENTITY-2; CU-IDENTITY-3; DR-M3-6; DR-M1-1 (M1-5 +1 attribution).

**Blocks:** CU-FORM-1.

**Provenance audit:**
- `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md:60-69` — canonical 72 = 36×2; canonical +1 = parent.
- `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md:55-68` — canonical 27/37 partition.
- DR-M1-1 (validated 2026-06-02): +1 parent attribution is M1-5.
- `Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md:54-55, 392` — M-stack view `137 = M_3(64) + M_2(72) + M_1(1)`.

**Originating session:** `{date: "2026-06-15", agent: "claude-opus-4-7[1m]+user-pair", conversation_id: "phase-J-canon-update-synthesis"}`

**qm_witness:** `{session_id: "phase-J-2026-06-15", content_hash: "<sha-on-land>", tick: <tick-on-land>, vak_address: "(CPF: 0/1, CT: CT5, CP: 3, CF: CF2, CFP: CFP0, CS: day)"}`

**Notes:** The "productive parent" reading the original exploration named directly. From outside M3 (M1→M2→M3), the +1 is the Möbius parent / 0/1 hinge. From inside M3's transcriptional machinery, the same +1 appears as the asymmetry $37 - 36 = 1$ within the 73 partition. **The parent generates 37 new entities; it doesn't just hold the field together — it produces.**

---

## CU-FORM-1 — `137 = 64 + 73` (M3-native sixth canonical form of Third Spanda Equation)

**Status:** landed · **Surfaced:** 2026-06-15 · **Landed:** 2026-06-15 · **By:** user-pair-exploration synthesis session · **Category:** FORM · **Ratification path:** **DR escalation required** — adds a sixth canonical form to the five-form canonical set at DR-M3-6; amends DR-M3-6 with sub-block citing CU-FORM-1; user validation per Phase-N pattern.

**Claim:** A sixth canonical form of the Third Spanda Equation: $137 = 64 + 73 = M_3 + (M_2/2 + 37)$ where $73 = 36 + 37 = 72 + 1$ per CU-IDENTITY-4. The **M3-native** expression of the canonical $137$ as (Mahāmāya hexagram core 64) + (M3-native parent expression 73). Distinct from the existing five canonical forms (Mersenne / Binary / Octave-field / Spanda-bridge / M-stack) because it expresses the +1 parent NOT as a sealed external term but as the productive asymmetry INTERNAL to the 73 = 36+37 transcriptional partition.

**Mathematical form:** $137 = 64 + 73$

**Derivation:**
- Canonical Third Spanda forms (DR-M3-6 ratified) at `ql_m0_m3_third_spanda_integral_quilting_v2.md:14-18, 388-392`:
  - Mersenne: $137 = (2^7 - 1) + 1 + 9$
  - Binary: $137 = 2^7 + 9$
  - Octave-field: $137 = 8(8+9) + 1$
  - Spanda-bridge: $137 = 64 + 2(36) + 1$
  - M-stack: $137 = M_3(64) + M_2(72) + M_1(1)$
- Proposed sixth form: $137 = 64 + 73$ — proven via $64 + 73 = 64 + (72+1) = 137 ✓$.
- Internal structure of 73 per CU-IDENTITY-4: $73 = 36 + 37 = 72 + 1$; the +1 is the productive asymmetry $37 - 36$.
- The sixth form is distinct from the M-stack view because the M-stack view names $M_1(1)$ as a sealed term; the M3-native view derives the same +1 from internal transcriptional asymmetry — the parent is productive, not sealed.

**Target landing sites (multi-site; DR escalation):**
1. `{kind: "new-form", path: "Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md", anchor: "extend the canonical-forms enumeration at :14-18 + :388-392 + :993 + :1087"}` — add `transcriptional_internal_view: "137 = 64 + 73 = M_3 + (M_2/2 + 37)"` as a sixth form.
2. `{kind: "spec-edit", path: "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md", anchor: "DR-M3-6 amendment block"}` — amend DR-M3-6's Resolution section with a `**Amended (Phase-J 2026-06-15):**` sub-block citing CU-FORM-1 and naming the sixth canonical form.

**Depends on:** CU-IDENTITY-4 (whose `73 = 36+37` derivation is load-bearing); DR-M3-6 (the canonical-five-form set being extended); DR-M1-1 (the +1 attribution).

**Blocks:** Future canonical-form additions (the sixth is the precedent for amendment-via-CU-FORM).

**Provenance audit:**
- `Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md:14-18, 388-392` — the existing five canonical forms.
- DR-M3-6 (validated 2026-06-04) at `13-decision-register.md` — ratifies the five-form canon.
- CU-IDENTITY-4 — establishes the $73 = 36 + 37 = 72 + 1$ productive-asymmetry derivation.

**Originating session:** `{date: "2026-06-15", agent: "claude-opus-4-7[1m]+user-pair", conversation_id: "phase-J-canon-update-synthesis"}`

**qm_witness:** `{session_id: "phase-J-2026-06-15", content_hash: "<sha-on-land>", tick: <tick-on-land>, vak_address: "(CPF: 0/1, CT: CT5, CP: 3, CF: CF2, CFP: CFP0, CS: day)"}`

**Notes:** **The DR-amendment pattern this row forces** is itself architecturally significant. DR-M3-6 was ratified with five forms; adding a sixth requires either (a) a new DR row that supersedes-extends DR-M3-6, OR (b) an amendment sub-block within DR-M3-6's existing entry. Pattern (b) is chosen per parent-agent decision: the amendment sub-block parallels the 2026-06-03 cleanup amendments to DR-M5-1 + DR-B-3 (see existing patterns at `13-decision-register.md:213-228, 255-262`). DR-M3-6 amendment lands on validation of this CU-FORM-1 row.

---

## Verification (release-gate G14)

- `grep -n "CU-IDENTITY-\|CU-FORM-\|CU-ENTITY-\|CU-REL-\|CU-VOCAB-\|CU-XREF-\|CU-FORM-EXEC-TRACE-" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md` returns ≥5 rows (Phase-J seed).
- `cargo test -p epi-s2-graph-services --test canon_update_landed_xref_consistency` — landing invariant lint passes (Tranche 40.2).
- `grep -nE "s5'.canon_update\." Body/S/S3/gateway-contract/src/lib.rs` returns ≥5 method registrations (Tranche 40.1).
- `grep -nE "epi bimba propose|epi bimba list|epi bimba land" Body/S/S0/epi-cli/src/bimba.rs` returns the CLI bindings (Tranche 40.1).
- `cargo test -p epi-s3-gateway s5_canon_update_round_trip` — end-to-end intake / status / landing round-trip.
- For every row in `status: landed`: target file contains both inline marker AND frontmatter `canon_updates_landed` entry (lint-enforced per §Cross-reference discipline).

## Risks watched

1. **DR/ledger boundary leak** — only CU-FORM and CU-REL escalate to DR (strict rule).
2. **Provenance drift** — entries in `status: surfaced` >7 days raise Janus warning.
3. **Cross-reference rot at landing** — lint test makes inline marker + frontmatter array mandatory.
4. **Sophia disclosure ↔ ledger double-write** — `qm_witness.content_hash` deduplicates.
5. **Codon collisions** (when CCT-14b lands) — warn-and-allow policy per CCT-14b default.
6. **VAK address discipline** — one VAK address per row, derived from `(coordinate, category, id)`; enables coordinate-anchored retrieval via `s5'.gnostic.episode_search`.
7. **Sub-agent surfacing** — routes via `epi-claw-gateway` → Sophia envelope as q_proposals (no second intake path).
8. **DR amendment pattern** — sub-block within validated DR's Resolution section; matches DR-M5-1 / DR-B-3 cleanup precedent.

## Cross-references

- DR-M3-6 (Third Spanda canon — extended by CU-FORM-1)
- DR-Q-1 (q_ general convention — informs `qm_witness` field naming)
- DR-S5-ONE-1 (S5' substrate — provides `s5'.canon_update.*` route family)
- DR-VAK-7 (VAK four-expression — provides VAK address discipline per row)
- DR-IG-7 (`9_M2 = 8_M3 + 1_M1` translation rule — informs CU-IDENTITY-3 epogdoon derivation)
- CCT-14 / CCT-14b (entity-candidate lifecycle — downstream consumer for CU-ENTITY rows)
- CCT-17 (compress_through_VAK — orchestrates VAK-addressed ledger row retrieval)
- Tranche 12.26 (Sophia disclosure — upstream intake)
- Track 39 (S5' substrate — provides `s5'.canon_update.*` gateway home)
- Track 13 (DR register — sibling registry; CU-FORM / CU-REL escalate here)
- Track 16 (CCT register — sibling registry; CU-VOCAB / CU-ENTITY route through CCT-14 / CCT-16)
