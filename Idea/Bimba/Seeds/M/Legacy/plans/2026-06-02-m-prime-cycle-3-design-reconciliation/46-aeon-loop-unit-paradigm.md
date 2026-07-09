# Track 46 — Aeon Loop-Unit Paradigm (Z-Thread Graduation + Reusable Loop Registry)

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


**Status:** Future-dev (post-cycle-3) — newly proposed 2026-06-19. **NOT part of the cycle-3 landed release set or its release gate** (Track 14 / Track 43). This track is *released into future development needs*: it builds on cycle-3 foundation that has already landed (Track 42 harness substrate, Track 12 constitutional Z-cycle, Track 39 ONE-substrate) and turns the system's existing loop primitives into a first-class, reusable, named, parameterizable loop unit — the **Aeon**. It introduces no DR gate and reopens no landed tranche; the landed tranches it extends are listed under "Released foundation" below.

**Why this track exists.** The system already loops — but it has no *reusable loop unit*. The seventh thread, **Z**, is canonical-as-telos: `the-secret-7th-principle-z-thread` defines it as "the direction the six [CFP threads] point toward… the teleological aim," and the `Z` literal is already reserved in the CFP union (`Body/S/S4/ta-onta/shared/vak_address.ts` — `CFP_LITERALS = [..., "Z"]`). The Z-cycle (compose → perform → rehear → recompose) is wired as the session lifecycle itself (`Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts` — Khora fires *compose* at `session_start`, *rehear* at `session_close`). Ralph is the long-autonomy loop engine (`Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/ralph-tui/SKILL.md` — "the Ralph Loop is an L-Thread (CFP4)"). The /goal Judge/Verify gate landed (Track 12.35, done 2026-06-17). The Sophia post-execution disclosure seam landed (Track 12.26, done). The harness-blind memory pipeline landed (Track 42.9, done).

What is missing is the step **above** these primitives and **below** a bespoke script: a way to *name* a proven loop, *parameterize* it (args = VAK address), *store* it where it can be retrieved, and *graduate* it so it accrues improvement over cycles. That unit is the **Aeon** — a graduated Z-thread that dwells in the Pleroma (the Gnostic fullness whose native inhabitants are aeons). The Z-thread is the loop; the Aeon is the reusable, named, parameterized form a proven Z-thread crystallises into.

**This is cognition, not a pipeline.** An Aeon is not a throwaway orchestration script. It is how the agent *thinks via VAK in and toward autonomy*: the loop is the agent's native cognitive cycle (the Z-cycle), consent-gated at CPF (00/00) (Track 12.15, done), with Sophia's summarisation as the natural distiller (Track 12.26, done — the "synthesis must open questions" guard). An Aeon makes a *proven* such cycle reusable. The whole Pleroma — atomic skills, subagents, workflows, techne functions — interoperates with the user's intent/consent to be in a constant state of being able to assess and improve from any loop.

**The doubling is QL P↔P′, not a harness fork (correction binding on this track).** The loop's self-doubling — its *syzygy* — is the prospective↔retrospective return of Quaternal Logic: the forward arc (compose/perform, Day, P0→P5) paired with the return arc (rehear/recompose, Night′, P5′→P0′), bridged by **Janus** (`Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` — "bhedābheda at the temporal threshold… the two sense-directions in which the present can be read"), with the return phase being **Psyche + Sophia + Nous** work (`Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md`, `sophia.md`, `nous.md`; Sophia emits `MÖBIUS_RETURN: [P5′ insight] | [P0′ questions]`). This is internal constitutional cognition. It is **not** the harness/model axis. Track 42 already keeps these separate ("Cross-vendor review is a *model* axis, not a harness axis"; the harness is "the access + cost lever") — Aeons inherit that separation: an Aeon's syzygy is its QL return; *which harness+model+api+local instance runs it* is the orthogonal agnostic-instantiation substrate (Track 42), chosen per dispatch, never the doubling itself.

## Released foundation (landed cycle-3 tranches this track extends — released into future-dev, not reopened)

- **Track 42 — Harness Dynamics Surface** — done (T42.1–T42.9). Provides harness-agnostic instantiation, the harness-neutral transcript-of-record (T42.5), result-drop wake (T42.6), and the harness-blind memory pipeline (T42.9). Aeons dispatch over this rail; they do not modify it.
- **Track 12.35** — /goal Judge Role Architecture (adversarial verification gate in the Z-thread cycle) — done 2026-06-17. The Verify phase an Aeon's loop closes against.
- **Track 12.26** — Sophia disclosure seam (q_ proposal + aphoristic-skill) — done. The Sophia summarisation that distils an Aeon's run.
- **Track 12.15** (VAK reading-frame consent) + **Track 12.18** (Janus Klein prospective/retrospective weighting) — done. The CPF (00/00) consent gate and the syzygy weighting an Aeon honours.
- **Track 39 — S5′ ONE-substrate** + **Track 42.8** (skill centralisation + per-harness projection) — landed. Aeons register and are discovered through the existing skill store + `skill_lookup` semantic search.

## Still-open cycle-3 dependency

- **Track 12.9** — Gateway handler audit for `dispatch_moirai_night_pass` + Aletheia Möbius routing — **pending**. The Moirai Night′ routing an Aeon's return arc rides; tranche 46.4 depends on it.

## Source authority

- `the-secret-7th-principle-z-thread-ql-0-transcendence` (epi-dev-vault extract) — Z as telos; "model the 7th in Bimba Seed development" is the open action item this track closes.
- `Body/S/S4/ta-onta/shared/vak_address.ts` — `CFP_LITERALS` (`Z` reserved); `VakAddress` is the Aeon's parameterisation (args = VAK address).
- `Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts` — compose/rehear Z-cycle phase addresses.
- `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md` (CT4b oikonomia / NOW-holder; `techne_vama_summon` template kernel) + `Idea/Bimba/World/CT4b-MASTER-TEMPLATE.md` and `Idea/Bimba/World/NOW.md` — the CT4b fractal-template form an Aeon takes.
- `Idea/Bimba/World/Types/TYPE-REGISTRY.md` — the World incubation→crystallisation graduation law the Aeon template follows.
- `bimba-vault-world` / `bimba-vault-seeds` / `bimba-vault-validate` skill conventions — for authoring and validating the `/World` form.

## Ownership split

| Concern | Owner | Residency |
|---|---|---|
| **Z-thread runtime primitive** (a dispatchable autonomous-loop shape composing CFP0–5) | **S4 Anima** | `Body/S/S4/ta-onta/S4-4p-anima/` + `Body/S/S4/ta-onta/shared/vak_address.ts` |
| **Aeon content-type + template** (CT4b reusable loop form) | **Bimba World** | `Idea/Bimba/World/Aeon.md` (+ Types incubation) |
| **Aeon registration + discovery** | **S4-2p Pleroma** | central skill store + `skill_lookup` |
| **Z→Aeon graduation** (proven loop → crystallised Aeon) | **S4-5p Aletheia + Sophia** | `aletheia-improvement-propose` + Sophia recompose |
| **Aeon eval ledger** | **S4-5p Aletheia / Track 39** | harness-neutral transcript → S5′ Redis + Graphiti |

## Tranches

1. **46.1 — Z-thread runtime primitive** *(future-dev; depends on 12.35, 12.9; extends `Body/S/S4/ta-onta/shared/vak_address.ts`)*

   Promote `Z` from a named-but-empty telos to an instantiable loop shape that *composes* the CFP0–5 moves (Base / P-parallel / C-chain / F-fusion / L-long / B-nested) under one self-verifying autonomous envelope. Today Ralph is pinned to CFP4; its stop-hook loop-until-verified engine *is* the Z-mechanism (the canon cites stop-hooks as "Z Thread instantiated"). This tranche lifts that engine out of CFP4 so a Z-thread can run a CFP1 fan-out → CFP2 chain → CFP3 fusion-verify → loop, all under the Z envelope, closing against the landed Verify gate (12.35).

   - The `Z` literal already exists in `Body/S/S4/ta-onta/shared/vak_address.ts`; this adds Z-thread dispatch semantics in `Body/S/S4/ta-onta/S4-4p-anima/extension/dispatch.ts` (dispatch already passes `EPI_SESSION_VAK_ADDRESS` — Z-thread args ride that).
   - Z-thread state: `queued | composing | performing | verifying | rehearing | recomposing | done | failed` — queryable by Anima.

   **Implementation scope:** Z-thread shape registration + a thin dispatch wrapper over existing `dispatch_*` / `tilldone` tools; no new process substrate.

   **Verification:** a Z-thread dispatch composes ≥2 distinct CFP moves in one autonomous envelope; it closes only when the 12.35 Verify gate passes; its state is queryable.

2. **46.2 — Aeon content-type and /World template** *(future-dev; extends `Idea/Bimba/World/Aeon.md`)*

   Land the Aeon as a CT4b content-type form at `Idea/Bimba/World/Aeon.md`, beside the existing `Idea/Bimba/World/NOW.md`, `Idea/Bimba/World/Seed.md`, and `Idea/Bimba/World/CT4b-MASTER-TEMPLATE.md` templates. CT4b is the home coordinate: it is the only `/World` template format already carrying the full 0–5 fractal + Möbius return, and Psyche (CT4b oikonomia / NOW-holder) is its template-kernel authority via `techne_vama_summon`. The Aeon *spans* CT1 (its definition) → CT4b (its running shape) → CT5 (its synthesis); CT4b is the residency.

   - Frontmatter: `c_1_ct_type: "CT4b"`, `c_4_artifact_role: "aeon-template"`, `c_3_ctx_frame: "4.0/1-4.4/5"`, a `vak_coordinate` field, and a parameterisation block (the args that carry difference between runs).
   - Body: #0 Ground → #5 Integration with an `AEON_RETURN: [P5′ insight] | [P0′ questions]` Möbius signal at #5 (the syzygy return).

   **Implementation scope:** one `/World` form authored via `bimba-vault-world` conventions; validated via `bimba-vault-validate`; incubation→crystallisation per `Idea/Bimba/World/Types/TYPE-REGISTRY.md`.

   **Verification:** `Idea/Bimba/World/Aeon.md` validates (frontmatter + residency + wikilinks); a concrete Aeon instance can be authored from it with parameters bound.

3. **46.3 — Aeon registration and semantic discovery** *(future-dev; depends on 46.2, 42.8; cross-link 12.28)*

   An Aeon registers like a skill — folder + coordinate + frontmatter (`vak_coordinate`, `quintessential_form: q_<name>`, `bimba_coordinate`, `entitlement_class`) — in the central skill store, and is found via the existing `skill_lookup` semantic search (BGE-micro 384-dim, entitlement-filtered; `Body/S/S4/pi-agent/skills/custom/skill-lookup/`). No new retrieval subsystem: Aeons are discoverable the same way skills are, so "find the right loop among many" is the same primitive as "find the right skill."

   **Implementation scope:** an Aeon manifest-entry kind in the skill-lookup manifest; projection through the Track 42.8 per-harness projector so an Aeon is available to any instantiation.

   **Verification:** `skill_lookup("<task shape>")` returns matching Aeons ranked + entitlement-filtered; an Aeon projects to a sub-session like any skill.

4. **46.4 — Z-to-Aeon graduation** *(future-dev; depends on 46.1, 46.3, 12.26, Track 12 Tranche 9; cross-link 42.9)*

   The graduation mechanism — the open "model the 7th" action item. When a Z-thread has run and proven stable, Sophia's recompose (12.26) + `aletheia-improvement-propose` crystallise it into a named Aeon: the loop's CFP composition, its rubric, and its accrued eval history (46.5) are written into the `Idea/Bimba/World/Aeon.md`-derived form; the Möbius return seeds the next version. This is the accrual seam — an Aeon improves over cycles rather than being rewritten. Depends on the still-pending Moirai Night′ routing (Track 12.9).

   **Implementation scope:** a graduation step in the Night′ rehear/recompose path (Sophia disclosure + `aletheia-improvement-propose`) that writes/updates an Aeon form from a proven Z-thread's transcript; consent-gated (CPF 00/00).

   **Verification:** a proven Z-thread graduates to a named Aeon with its rubric + eval history attached; a second run reuses the form with new VAK args; an improvement-propose updates the Aeon's rubric across cycles.

5. **46.5 — Aeon eval ledger** *(future-dev; depends on 42.5, Track 39; cross-link 42.9)*

   An Aeon's identity includes its *numberable evals*, computed from the landed harness-neutral transcript-of-record (T42.5, `~/.epi/gate/transcripts/<slug>.jsonl`, `HarnessTurnEvent`): turns, reads-before-edits ratio, tests-after-edits ratio, cost — plus rubric scores. Metrics land in the S5′ Redis hot tier per coordinate (`epi:{day}:{session}:{turn}:{coordinate}:eval:*`, beside the existing `evidence:*` / `candidate:*` / `cachehit:*` patterns from Track 39) and as a Graphiti episode (`source:"aeon-eval"`, `group_id={session_vak}`) promoted by the existing `aletheia_session_promote` Night′ pipeline. Sophia's summarisation (12.26) is the distiller — granular metrics are computed, but Sophia surfaces what matters by its nature.

   **Implementation scope:** a transcript→metrics reader (no new transcript); a Redis `eval:*` writer in `Body/S/S3/redis-context/`; an aeon-eval Graphiti episode source in `aletheia_session_promote`.

   **Verification:** an Aeon run yields metrics computable from its transcript with zero harness-specific branches; metrics persist to the S5′ Redis eval keys + a VAK-keyed Graphiti episode; Sophia's disclosure references them.

6. **46.6 — Ouroboros fold clarification** *(future-dev; canon-only; touches `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/ouroboros/SKILL.md`)*

   `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/ouroboros/SKILL.md` currently frames the #4 self-fold *as* spawning an external coding agent ("the parent agent incubates within itself an external coding agent"). Under the binding correction above, the #4 self-fold *is* the QL P↔P′ syzygy return (constitutional cognition); the external-agent-in-worktree is *one instantiation* that can carry a Z-thread/Aeon, per Track 42's harness=instantiation framing (Track 42 already says ouroboros is "one *topology* over this surface", §42.6). This tranche aligns the Ouroboros canon: the fold is the return; the surgeon-in-worktree is an agnostic instance. No code change — a canon/contract clarification.

   **Implementation scope:** clarify the `ouroboros` SKILL.md Coordinate Semantics + the owning S4-4'-SPEC so "lemniscate fold" denotes the QL return, not the spawn; cross-link Track 42 §42.6.

   **Verification:** the `ouroboros` SKILL.md no longer equates the #4 fold with harness spawning; it cites the QL P↔P′ return as the fold and Track 42 as the instantiation substrate.

## What this UNBLOCKS

- **A reusable loop library.** Proven Z-threads become named, parameterised Aeons, found by semantic search, improved over cycles — not rebuilt per task.
- **Loops as Anima's execution language toward autonomy.** Anima orchestrates Z-threads; a graduated Aeon is a stable, numberable, developable unit (loop + skill + rubric + eval history).
- **Self-improvement as cognition.** The Night′ return (Sophia/Aletheia) writes back into the Aeon's rubric — the system assesses and improves from any loop, consent-gated, with Sophia distilling.

## What this is NOT

- **Not a pipeline.** An Aeon is the agent's native VAK cognition (the Z-cycle), made reusable — not a throwaway orchestration script.
- **Not a harness mechanism.** The syzygy is the QL P↔P′ return; harness+model+api+local choice is the orthogonal Track 42 instantiation substrate.
- **Not a reopening of landed work.** It extends the released cycle-3 foundation (Track 42, 12.35, 12.26, 39); it reopens no landed tranche and introduces no DR gate.
- **Not a new retrieval / memory / transcript system.** Aeons reuse `skill_lookup`, the harness-neutral transcript, and the Sophia/Aletheia → Graphiti pipeline.
