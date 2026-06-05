# Canon Audit: S4-agent-runtime

**Auditor scope:** Tranche 12 (agentic layer S4↔S5) + Tranche 17 sub-rows touching S4 substrate, audited against S4-SPEC + S4-{0..5}-SPEC + the ratified DR rows DR-S4-TECHNE, DR-M5-1/B-1, DR-B-2, DR-B-3, DR-VAK-1, and Sn label-correction notes.
**Audit date:** 2026-06-03

## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (offset 0–505 and 506–670, both pages)
- Idea/Bimba/Seeds/S/S4/S4-SPEC.md (full)
- Idea/Bimba/Seeds/S/S4/S4-0-SPEC.md (full)
- Idea/Bimba/Seeds/S/S4/S4-1-SPEC.md (full)
- Idea/Bimba/Seeds/S/S4/S4-2-SPEC.md (full)
- Idea/Bimba/Seeds/S/S4/S4-3-SPEC.md (full)
- Idea/Bimba/Seeds/S/S4/S4-4-SPEC.md (full)
- Idea/Bimba/Seeds/S/S4/S4-5-SPEC.md (full)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md (full)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md (full)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-agentic-layer-matrix.md (full)
- Idea/Bimba/Seeds/S/S4/S4-ARCHITECTURE.md (frontmatter + §0–§11 — input only, NOT authority)

## Per-row audit

### Tranche 12 preamble bullets (architecture framing)

### 12.P.1 — "Pi is the underlying agent harness. One Pi. Runtime gateway, dispatch, capability-parity, axiom-translation (per DR-B-2)."
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:200-212 (DR-M5-1/B-1 cleanup), S4-SPEC.md:39-44 (Pi/PI Agent as harness), S4-SPEC.md:138-140 (S4 is harness-agnostic), 13-decision-register.md:228-236 (DR-B-2)
- **Current framing in tranche:** Pi is the single harness; dispatch, gateway, capability-parity, axiom-translation belong to it.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Canon-aligned. Note: S4-SPEC.md §A says PI is the "primary harness" with Codex/OMX/claw-rust as lanes (line 138-139, 684) — the preamble's "one Pi" is true for the dispatch identity but the harness layer itself has lanes; not a drift but tighten language by mentioning the lanes as carriers of the same dispatch identity.

### 12.P.2 — "Anima is the main dispatching agent. Anima dispatches 6 Aletheia subagent techne-guardians during Aletheia-crystallisation-mode."
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:240-248 (DR-B-3 cleanup — 6 not 7); 13-decision-register.md:200-210 (DR-M5-1 cleanup); S4-SPEC.md:60 ("Anima is the dispatch spine"); S4-SPEC.md:690 ("[[Anima]] is the dispatch function")
- **Current framing in tranche:** Anima is sovereign dispatcher; Aletheia-the-carrier hosts the crystallisation mode; six techne-guardians invoked within mode.
- **Recommendation:** KEEP-AS-IS

### 12.P.3 — "6 Aletheia subagent techne-guardians: Anansi(CF0) / Janus(CF1) / Moirai(CF2) / Mercurius(CF3) / Agora(CF4) / Zeithoven(CF5)."
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:466-474 (DR-S4-TECHNE per-guardian techne enumeration); 13-decision-register.md:240-248 (DR-B-3 final cleanup); S4-1-SPEC.md:40 (Anansi/Moirai/Janus/Mercurius/Agora/Zeithoven explicitly listed as "review/crystallisation specialists, not first-class constitutional CF replacements")
- **Current framing in tranche:** Six named techne-guardians, each stewards a specific techne class within Pleroma-Techne; surface in Pi monitor as dispatch sub-traces under Aletheia, not as peer agents.
- **Recommendation:** KEEP-AS-IS

### 12.P.4 — "Pleroma-Techne (S4-2') is the atomic-skills substrate the 6 guardians steward. Pleroma has TWO faces: VAK capability membrane (canonical) + Techne atomic-skills repository."
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:458-486 (DR-S4-TECHNE full resolution); S4-SPEC.md:58 (Pleroma as Anima's executive capability membrane); S4-SPEC.md:118 (S4.2 carries "Techne helper roles" — note S4-SPEC §A still uses the older "helper" wording, see drift row 12.P.7); S4-2-SPEC.md:18 (skills/plugins/tools/permission as P2/CT2 operation layer)
- **Current framing in tranche:** Pleroma is the atomic-skills substrate; Techne is one of Pleroma's two faces, not a peer subagent.
- **Recommendation:** KEEP-AS-IS

### 12.P.5 — "Six ta-onta carriers (Khora, Hen, Pleroma, Chronos, Anima-carrier, Aletheia-carrier) are system/service routing infrastructure, NOT agents."
- **Status:** ALIGNED
- **Cited:** S4-SPEC.md:43-56 (the six S4' carriers tabled); S4-SPEC.md:399-407 (carriers as internal S4' carriers with S-family analogies); 13-decision-register.md:200 (DR-M5-1 final cleanup: "six ta-onta carriers … are system/service routing infrastructure — NOT agents.")
- **Current framing in tranche:** Carriers are routing infrastructure; Aletheia-the-carrier hosts the mode; Anima dispatches.
- **Recommendation:** KEEP-AS-IS

### 12.P.6 — "ACR substrate is tangent-development drift; repurpose as Pi runtime monitoring surface."
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:202-208 (DR-M5-1 ACR repurpose); 12-agentic-layer-s4-s5.md:108-117 (Tranche 12.14 repurpose execution)
- **Current framing in tranche:** ACR is not "constitutional-agents review panel"; reframed as Pi-monitor surface.
- **Recommendation:** KEEP-AS-IS

### 12.P.7 — "`constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]` either documented as psyche-aspect rendering material or deprecated."
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:200-211 (DR-M5-1 cleanup — "psyche-aspect rendering material … NOT separate agents"); S4-SPEC.md:76 (capability-matrix names them as constitutional_agents — the spec-side substrate text); S4-1-SPEC.md:39 ("Constitutional agents [[Nous]], [[Logos]], [[Eros]], [[Mythos]], [[Psyche]], and [[Sophia]] as CF-bound functions") — note the seed-level shard SPEC still treats them as CF-bound functions, which is consistent with "psyche-aspect rendering" rather than peer agents
- **Current framing in tranche:** Audit-and-dispose option, not a peer-agent ontology.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche 12.3 audit must read the S4-1-SPEC framing of CF-bound functions as supporting "psyche-aspect rendering material" not as supporting "peer constitutional agents". The audit should NOT delete the .md profiles at `S4-4p-anima/S4'/agents/` — they are the CF-bound function prompts the dispatch uses (see S4-ARCHITECTURE.md §10.1 resolving O-B-1).

### Tranche 12.1 — Pi+Anima+subagents architecture audit (replaces ACR-actor parity)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:200-212 (DR-M5-1); 13-decision-register.md:240-248 (DR-B-3); 13-decision-register.md:458-486 (DR-S4-TECHNE)
- **Current framing in tranche:** Audit report mapping ACR actor union to Pi / Anima / 6 techne-guardians / carriers categories; rewrite M5'-SPEC §M5-4' around canonical architecture.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.2 — `s5'.gnostic.*` gateway-endpoint registration
- **Status:** ALIGNED
- **Cited:** wave-b-agentic-layer-matrix.md:25 (row B3 SPEC-AHEAD); wave-b-agentic-layer-matrix.md:63 (CP-B-1); S4-SPEC.md:142-143 (S5/S5' owns Gnosis, RAG-Anything, Vimarsa, Epii); S4-5-SPEC.md:29-31 (Aletheia exposes gnosis ingest/query/notebook tools)
- **Current framing in tranche:** Register `s5'.gnostic.{ingest,query,notebook,status}` in S3 gateway routing to `epi-gnostic/`; anti-greenfield (production Python landed).
- **Recommendation:** KEEP-AS-IS

### Tranche 12.3 — `constitutional_agents` array audit and disposition
- **Status:** ALIGNED with augmentation
- **Cited:** 13-decision-register.md:202-208 (DR-M5-1 disposition); S4-ARCHITECTURE.md §10.1 (resolves O-B-1 — profiles exist at `S4-4p-anima/S4'/agents/`); S4-1-SPEC.md:39-40 (CF-bound functions)
- **Current framing in tranche:** Audit each name as psyche-aspect rendering material OR deprecate.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit note: the seven .md profiles at `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia,anima}.md` already exist as CF-bound function prompts. The audit must NOT propose deletion — these are the dispatch-prompt assets the Anima orchestrator reads. Document as psyche-aspect rendering material per DR-M5-1.

### Tranche 12.4 — Recursive-self-review gate (relocated from ACR to Pi)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:200-210 (DR-M5-1 ACR repurpose); wave-b-agentic-layer-matrix.md:39 (B17 CODE-PENDING — recursive-self-review classifier missing); S4-SPEC.md:60 ("Epii is not a subagent of Anima") — supports the recursive-review boundary
- **Current framing in tranche:** Pi enforces recursive-self-review gate; lives at `Body/S/S4/pi-agent/lib/`, not in ACR.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.5 — Six operational-capacity views (audit; possibly Pi-monitoring repurpose)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:628-636 (DR-TS-4 downgraded — "Tranche 12.5 (six per-capacity panes over `capacity_workflows.rs`) remains valid as M5-4 `agentic-control-room` surface work, NOT as OmniPanel tabs."); wave-b-agentic-layer-matrix.md:37 (B15 SPEC-AHEAD)
- **Current framing in tranche:** Six panes valid as Pi-monitor views OR deferred; capacity_workflows.rs substrate is canonical.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.6 — `MediatedRunEvidencePacket` field-parity closure
- **Status:** ALIGNED
- **Cited:** wave-b-agentic-layer-matrix.md:38 (B16 DOC-AHEAD/SPEC-AHEAD); S4-SPEC.md:81 ("evidence envelope shape" — S4 produces, S5 owns receipt); S4-SPEC.md:80-81 (mediated_run_evidence_bridge.packet_required_fields authority)
- **Current framing in tranche:** Extend `RunEvidenceEnvelope` to all 16 spec fields; transport canonical regardless of ACR fate.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.7 — Pi axiom-translation tooling (DR-B-2 land)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:228-236 (DR-B-2 VALIDATED — land at `Body/S/S4/pi-agent/lib/axiom-translate.ts`)
- **Current framing in tranche:** Implement axiom-translate.ts consuming epi-gnostic; land in Pi capability list.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.8 — DEPRECATED (was: Pi-as-ACR-role decision)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:200-212 (DR-M5-1 supersedes — there is no separate ACR-governance vs constitutional roster ontology)
- **Current framing in tranche:** Deprecated; resolved by DR-M5-1.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.9 — Gateway handler audit for `dispatch_moirai_night_pass` + Aletheia Möbius routing
- **Status:** ALIGNED
- **Cited:** S4-3-SPEC.md:31 (`moirai_night_pass.test.ts` and CFP3 fusion semantics); S4-5-SPEC.md:44 ("Moirai Night' dispatch remains an Anima dispatch path, not direct Aletheia self-spawn"); 13-decision-register.md:240-248 (DR-B-3 — Moirai is one of the 6 guardians, Anima-dispatched)
- **Current framing in tranche:** Audit gateway routing + chain into `aletheia/modules/moirai-rehear.ts` per Aletheia CONTRACT.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.10 — Capability-parity live-assertion wiring (Pi gateway)
- **Status:** ALIGNED
- **Cited:** wave-b-agentic-layer-matrix.md:42 (B20 SPEC-AHEAD — parity asserter exists; gateway-side `s4'.mediation.capabilities.list` endpoint pending); S4-SPEC.md:78 (capability-matrix is IOD-17 authority)
- **Current framing in tranche:** Register gateway endpoint; wire parity assertion at Pi startup (not ACR).
- **Recommendation:** KEEP-AS-IS

### Tranche 12.11 — TillDone substrate residency audit
- **Status:** ALIGNED with note
- **Cited:** wave-b-agentic-layer-matrix.md:43 (B21 CODE-PENDING audit); S4-ARCHITECTURE.md §2.4.1 lines 148-149 + §8.1 line 564 (verified — `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts` EXISTS, resolving 12.11 to ALIGNED already)
- **Current framing in tranche:** Verify TillDone path; if missing, copy or downgrade.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Per S4-ARCHITECTURE.md §8.1 and §2.4.1, the file exists at `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts`. Tranche should be DOWNGRADED to "doc-confirmation" — note "TillDone present per S4-ARCHITECTURE.md §8.1 verification; tranche records the confirmation, no code change needed."

### Tranche 12.12 — DEPRECATED (was: Aletheia-subagents-in-ACR-AgenticActor decision)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:240-248 (DR-B-3 — collapsed union to pi + anima + 6 techne-guardians, NOT seven); 13-decision-register.md:458-486 (DR-S4-TECHNE — Techne NOT in union)
- **Current framing in tranche:** Deprecated; `AgenticActor` collapses to pi + anima + 6 guardians; Techne excluded.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.13 — S4↔S5 shared-intelligence seam runtime audit
- **Status:** ALIGNED
- **Cited:** wave-b-agentic-layer-matrix.md:29 (B7 CODE-PENDING — `resonance72` shared tuning fork); wave-b-agentic-layer-matrix.md:64 (CP-B-2); S4-5-SPEC.md:30 (Gnosis ingest/query/notebook surface, episodic record/search/arc tools)
- **Current framing in tranche:** Verify 3072-dim end-to-end Bimba+Gnosis; `RELATES_TO_COORDINATE` edges; `resonance72` consumed by Aletheia gnosis-RAG via Pi.
- **Recommendation:** KEEP-AS-IS

### Tranche 12.14 (NEW) — ACR extension repurpose decision and execution
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:202-212 (DR-M5-1 ACR repurpose); 13-decision-register.md:206 ("M5'-SPEC §M5-4' (Agentic Control Room) is rewritten around Pi+Anima+subagents")
- **Current framing in tranche:** Repurpose as Pi-runtime monitoring surface OR deprecate; recommendation (a).
- **Recommendation:** KEEP-AS-IS

### Tranche 12.15 — VAK reading-frame evaluator for OracleFrame / SymbolicProtein
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:150-160 (DR-VAK-1 PROPOSED — VAK field order CPF/CT/CP/CF/CFP/CS; reading_frame.positions[] authority); S4-SPEC.md:97-102 (S4 VAK Gate names CPF/CT/CP/CF/CFP/CS); S4-SPEC.md:411-443 (canonical `S4PrimeVakEvaluateRequest/Response` shape with `cp_position`, `cpf`, etc.); S4-SPEC.md:580 (`c_4_topological_mode` populated by Anima — supports reading-frame topology); S4-4-SPEC.md:38 (canonical VAK frontmatter law); S4-5-SPEC.md:34-37 (handoff envelope carrying VAK address)
- **Current framing in tranche:** Extend Anima/Psyche VAK evaluation for Tarot/I-Ching/Mahāmāyā reading frames; reading_frame.positions[] is authoritative; CPF consent + CP set required.
- **Recommendation:** KEEP-AS-IS

### Tranche 17 sub-rows touching S4

### Tranche 17.9 — Split `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` (1,114 LOC)
- **Status:** ALIGNED
- **Cited:** S4-ARCHITECTURE.md §5.1 (line 333-347 — file-split proposal mirroring Anima `S4/` pattern); S4-5-SPEC.md:28-29 (current substrate at extension.ts + modules); S4-SPEC.md (no normative ban on split)
- **Current framing in tranche:** Split into `S5'/tools/{gnosis,thought,episodic,seed}-tools.ts` mirroring Anima `S4/agent-team.ts` pattern; carrier surface unchanged.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate-grounded refactor; honors anti-greenfield (re-export façade preserves API). The path of split matches S4-ARCHITECTURE.md §5.1 exactly.

### Tranche 17.10 — Split `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` (761 LOC)
- **Status:** ALIGNED
- **Cited:** S4-ARCHITECTURE.md §5.2 (line 351-359); S4-SPEC.md:153 ("`.pi/extensions/ta-onta/anima/S4/` contains `agent-team.ts`, `agent-chain.ts`, `subagent-widget.ts`" — extraction continues the pattern)
- **Current framing in tranche:** Extract `S4'/tools/dispatch-tools.ts` (6 dispatch tools); isolate `nous_disclose` into its own module.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** `nous_disclose` isolation per S4-ARCHITECTURE.md §5.7 (and S4-SPEC.md:167) is load-bearing for the future `s4'.context.assemble` landing (S4-SPEC.md:480-490).

### Tranche 17.24 — Pi-agent symlink fragility (`pi-agent/extensions/ta-onta -> ../../ta-onta` → explicit import)
- **Status:** ALIGNED
- **Cited:** S4-ARCHITECTURE.md §5.8 (line 425-435 — symlink documented as fragile); S4-SPEC.md:202 ("Body-native plugin package discovery"); S4-SPEC.md:215 (`.pi/extensions/ta-onta/` registered as source — preserved as compatibility evidence)
- **Current framing in tranche:** Replace symlink with explicit `../ta-onta/composite-entry.ts` import; update `epi agent extensions sync`.
- **Recommendation:** KEEP-AS-IS

### Tranche 17.25 — Capability matrix schema co-location
- **Status:** ALIGNED
- **Cited:** S4-ARCHITECTURE.md §5.6 (line 397-407) and §10.6 (line 630-632 — needs schema); S4-SPEC.md:64 ("`Body/S/S4/plugins/pleroma/capability-matrix.json` … single source of truth"); S4-SPEC.md:76 (matrix authority for ACR/Anima/e2e parity)
- **Current framing in tranche:** Co-locate `capability-matrix.schema.ts` next to `capability-matrix.json`; Anima loader + ACR parser + e2e parity all consume one schema.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Natural co-tranche with 12.6 per S4-ARCHITECTURE.md §10.6 — consider cross-link.

## Drift patterns observed

Tranche 12 is unusually clean. The Wave-B fan-out captured the cycle-2 substrate accurately, and the user-validated DR cleanups on 2026-06-03 (DR-S4-TECHNE, DR-M5-1, DR-B-3) already swept through the tranche text. The remaining drift is shallow:

1. **Stale matrix preamble vs ratified text.** `wave-b-agentic-layer-matrix.md` (the input ledger Tranche 12 references) still carries the "seven constitutional agents (Anima/Eros/Logos/Mythos/Nous/Psyche/Sophia + Pi as fourth constitutional per UX)" framing at line 4 — this is the exact mis-framing the ratified DRs (DR-M5-1, DR-B-3, DR-S4-TECHNE) corrected. The downstream tranche text is clean; the upstream matrix is stale evidence. Worth a one-line note on the matrix doc pointing forward to the cleanup.

2. **S4-SPEC §A still uses "Techne helper roles" / `s_4_helper_roles`.** S4-SPEC.md:118 ("Techne helper roles") and S4-SPEC.md:318 (`s_4_helper_roles` envelope field producer is `[[Pleroma]] / helper definitions`) carry the pre-DR-S4-TECHNE framing. Per DR-S4-TECHNE these are NOT "helper roles" — Techne IS Pleroma's atomic-skills second face. The seed-level SPEC needs the same patch DR-S4-TECHNE applies to S4-ARCHITECTURE.md §2.4. Surfaced as ADD row below.

3. **Tranche 12.11 is over-cautious.** S4-ARCHITECTURE.md §2.4.1 (line 148) and §8.1 (line 564) BOTH confirm TillDone exists at `Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts`. Tranche 12.11 should be downgraded to doc-confirmation rather than left as code-pending-closure.

4. **Tranche 12.3 should explicitly forbid profile deletion.** The seven CF-bound .md profiles at `S4-4p-anima/S4'/agents/` are dispatch-prompt assets (S4-ARCHITECTURE.md §10.1 resolves O-B-1 as ALIGNED). The "audit and possibly deprecate" framing risks an over-eager sweep; the canon framing is "document as psyche-aspect rendering material; do not delete."

5. **Tranche 17 substrate-grounded refactors are intact.** 17.9/17.10/17.24/17.25 all cite real LOC counts and pattern-mirror existing structure. No drift.

## Tranche augmentation / removal / addition recommendations

- **AUGMENT 12.3:** Add explicit non-deletion clause for `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia,anima}.md`. Cite S4-1-SPEC.md:39 (CF-bound functions) + S4-ARCHITECTURE.md §10.1 (O-B-1 resolved).
- **AUGMENT 12.11:** Downgrade from `code-pending-closure` to `doc-confirmation`. Cite S4-ARCHITECTURE.md §2.4.1 line 148 + §8.1 line 564 (file already verified present).
- **AUGMENT 12.5:** Cite DR-TS-4 explicitly (13-decision-register.md:628-636) — current rationale is correct but doesn't name the ratified DR that authorises "six panes valid as ACR/Pi-monitor surface, NOT as OmniPanel tabs."
- **AUGMENT 12.15:** Cite DR-VAK-1 explicitly (13-decision-register.md:150-160) — the tranche already obeys the field-order discipline but should call out DR-VAK-1 as the binding decision.
- **ADD (new sub-tranche under 12 — "12.16 S4-SPEC §A patch for DR-S4-TECHNE alignment"):** Patch S4-SPEC.md §A line 118 ("Techne helper roles") and line 318 (`s_4_helper_roles`) to align with DR-S4-TECHNE — rename to "Pleroma-Techne atomic skills" / `s_4_pleroma_techne_*`. Doc-ahead-landing tranche, low blast radius. Cite 13-decision-register.md:458-486 (DR-S4-TECHNE action item 3 explicitly demands "Patch S4-SPEC §14-Agent Roster" but the §A surface needs parallel cleanup).
- **ADD (new sub-tranche under 12 — "12.17 Aletheia tool-guardian carrier contract verify"):** Per user memory + wave-b-agentic-layer-matrix.md:41 (B19 ALIGNED). Verify `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md` carries the "carrier IS the contract; no separate `aletheia-agent/agent-contract.json`" invariant explicitly. Doc-confirmation tranche. Cite S4-5-SPEC.md:28-29 (current contract) + user memory invariant.
- **REMOVE:** None. Tranche 12 has no rows that contradict ratified DRs after the 2026-06-03 cleanup.

## Open questions for user

- **OQ-1 (S4-SPEC §A patch scope):** DR-S4-TECHNE action 3 names patches to "§14-Agent Roster" specifically. The seed-level S4-SPEC.md §A lines 118 + 318 use "Techne helper roles" / `s_4_helper_roles` — should these be folded into the same DR-S4-TECHNE sweep, or treated as separate doc cleanup? Canon-silent at the DR row. Citation: 13-decision-register.md:476-482 (DR-S4-TECHNE action list scope).
- **OQ-2 (`agent_capability_gates.sophia.role_restrictions`):** S4-SPEC §M' Shell Consumed Contract Closure cites "constitutional actor set surfaced to M' is the canonical Pleroma membrane (`anima, aletheia, pi, sophia, epii, human`)" (S4-SPEC.md:83). That's a six-tuple distinct from the seven-tuple `constitutional_agents` in capability-matrix.json (S4-SPEC.md:76). Is this a "review-surface roster" vs "dispatch-roster" intentional split, or does DR-M5-1's "constitutional_agents is psyche-aspect rendering material" disposition apply uniformly? Citation: S4-SPEC.md:76 + S4-SPEC.md:83 (two distinct rosters in adjacent §s).
- **OQ-3 (Tranche 17.10 isolation of `nous_disclose` vs S4-SPEC §A current-state "context smuggling through helper workflow" gap):** Tranche 17.10 isolates the file but doesn't propose the canonical `s4'.context.assemble` landing. Does this audit add a pointer-tranche from 17.10 → a new 12.x context-assemble landing tranche (per S4-SPEC.md:167 / S4-ARCHITECTURE.md §5.7), or is the isolation alone the cycle-3 deliverable with the API landing deferred to cycle-4? Citation: S4-SPEC.md:167-168 (gap named); S4-ARCHITECTURE.md §5.7 (refactor proposal).
