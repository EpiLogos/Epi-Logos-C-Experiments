---
coordinate: "Seeds"
status: "active-protocol"
created: "2026-07-01"
updated: "2026-07-01"
purpose: "Subagent protocol for scoping and harmonising plan-resident design content back into the coordinate-designating seed specs"
---

# Seed Harmonisation Protocol (v1)

> **Mode note (2026-07-02, Architect):** harmonisation runs **as-we-go** — each build sprint carries its own spec write-back tasks against the owning specs it touches, following the Law and gate below. The one-shot subagent fan-out over the initial worklist is deferred; the worklist remains the backlog and shrinks as sprints absorb it.

Why this exists: the 2026-07-01 cycle-3 audit proved that design commitments accumulated in plan folders, decision registers, and auxiliary research docs while the coordinate-designating specs went stale — and that several claimed "spec write-backs" were fabricated (see `Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/2026-06-16-deferral-lie-overturned.md`). This protocol makes the seeds the enforced source of truth again. It is deliberately simple: one unit of work, six steps, one adversarial gate.

## Law

1. **The owning coordinate spec is the single authority for its coordinate.** Owning specs are the coordinate designators: `Seeds/M/Mn'/Mn'-SPEC.md`, `Seeds/M/M'-SYSTEM-SPEC.md`, `Seeds/M/M'-PORTAL-SPEC.md`, the `M'-*-SPEC.md` runtime set, `Seeds/S/Sn/Sn-SPEC.md` (+ `S4'/S4'-SPEC.md`), and their `*-ARCHITECTURE.md` siblings. Everything else — plan tracks, `plan.runs/` artifacts, decision registers, dated design docs, `m*-prime-*` research files — is **feeder material**.
2. **A design commitment exists only if it is in the owning spec.** If it lives only in a plan or aux doc, it is *proposed*, not canon — regardless of what any ledger says.
3. **Contradictions are surfaced, never silently resolved.** Where plan and spec (or two specs) disagree, the harmoniser writes an explicit `OPEN —` block into the owning spec naming both positions and stops. The Architect ratifies. (Per [[CLAUDE.md]] Code Navigability rule 5: agents do not decide interface/canon shape.)
4. **Feeder material is demoted after absorption.** Absorbed content gets a header line `> Harmonised into [[<owning-spec>]] on <date>; this file is feeder material, not authority.` Fully-absorbed plan docs move to the owning `Legacy/`.
5. **No ledger string is evidence.** The only completion evidence is the grep-verifiable presence of the commitment in the owning spec, checked by a *different* agent than the one who wrote it.

## Unit of work

One owning spec per harmonisation task. Never "harmonise everything"; never more than one owning spec per subagent run.

## Inputs per unit

For owning spec `X`:

- `X` itself, in full.
- `Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` — filter to DR rows naming X's coordinate. Treat `PROPOSED` rows as proposals; treat rows whose cited Action was never executed (see overturn doc) as **unlanded**.
- The wave reconciliation matrix for X's coordinate in `plan.runs/` (e.g. `wave-a-m4-nara-...-matrix.md`).
- The plan tracks that touch X (grep the plan folder for the coordinate).
- X's sibling auxiliary docs in the same folder.
- `plan.runs/2026-06-16-deferral-lie-overturned.md` — the 16 reset tasks are the confirmed "never landed" set.
- Do NOT trust `plan.runs/spec-gap-register-2026-06-13.md` closures without grep-verifying each one — several were proven fabricated.

## The pass (six steps)

1. **Census.** List every design commitment in the feeder material relevant to X. One line each: commitment, source path, date.
2. **Classify** each: `IN-SPEC` (grep-verified in X, cite line) / `MISSING` / `CONTRADICTS` (quote both sides) / `DEAD` (superseded — say by what).
3. **Write back** every `MISSING` commitment into X, in X's own voice and structure (not pasted plan prose), each with a provenance line: `(absorbed from <path>, <date>)`. Write every `CONTRADICTS` as an `OPEN —` block per Law 3.
4. **Demote** absorbed feeder docs per Law 4.
5. **Re-index.** Update X's frontmatter `updated:` date and `depends_on`, and the folder's index (`M-SYSTEM-INDEX.md` or `S-SYSTEM-INDEX`) if the file set changed.
6. **Hand off for adversarial verification** (below). The harmoniser may not verify its own pass.

## Adversarial verification gate

A second agent, given ONLY the updated owning spec (not the census), must answer:

- What is the user-facing surface of this coordinate?
- What does it consume, and from whom? What does it NOT own?
- What is implemented vs pending vs open? (X must carry dated implementation-foothold lines.)
- For each of 5 randomly-sampled census commitments (supplied by the orchestrator, not the harmoniser): is it in the spec, and where?

Any unanswerable question ⇒ the pass is incomplete, back to step 3. Banned as evidence anywhere in this protocol: "DR validated — direct close", "design only", "deferred to next cycle", "no code work required", file-existence checks, and any ledger citation without a grep-verified quote.

## Ledger and hand-back

Record the task via `swarmvault task add/update/finish` with changed paths and the census as evidence. End every unit with a short report to the Architect: commitments absorbed (count + list), `OPEN —` blocks raised (these need ratification), feeder docs demoted.

## Initial worklist (from the 2026-07-01 audit)

Priority order; the delta evidence is in the audit conversation and the wave matrices.

| # | Owning spec | Known unlanded content (sample) |
|---|---|---|
| 1 | [[M4'-SPEC]] | DR-M4-1 DayContainer vault path (3-way drift — OPEN block needed), `period_reading` API (DR-M4-2 c4), DR-M4-4 q_/qm_ privacy partition, Vāma-Shakti factory + dialogical arena (DR-VAMA-1..6), psychoid solver detail, block CTX-framing law (DR-PSS-1..6) |
| 2 | [[M5'-SPEC]] | DR-MP-2 EBM 72-fold atom, DR-MP-3 training bootstrap, DR-ELO-1 multi-channel Elo, six operational-capacity surfacing, cross-refs to the four new M'-runtime specs |
| 3 | [[M0'-SPEC]] | DR-VAK-4 (M0 notation = VAK CF value-space), DR-VAK-5 (`recognized=true` closure), DR-VAK-6 (`portal.vak_eval`) |
| 4 | [[M'-SYSTEM-SPEC]] + [[M'-PORTAL-SPEC]] | UI decisions (DR-TS-3/4, DR-TUX-1, DR-UI-3/4/5), tunability surface (DR-TUNE-1..4), stale frontmatter/carrier references (`Idea/Pratibimba/System` → `Body/M/epi-theia`), Theia-carrier status vs [[M'-SURFACE-REENVISIONING-2026-07-01]] |
| 5 | [[M3'-SPEC]] | DR-M3-6 Third Spanda identities (137=64+72+1; 360/384/472) — code exists, spec stale |
| 6 | [[S1-SPEC]] | DR-HYGIENE-1 Coordinate Header convention (currently register+skill only) |
| 7 | [[M1'-SPEC]] + M1/M3 ARCHITECTURE files | stale since 15 Jun; sweep against decision register |
| 8 | S0/S1/S2/S5 SPEC + `Sn-{0..5}-SPEC` sub-shard tier | frozen 2 Jun; drift sweep (unconfirmed — census first) |

Also on the backlog (Architect's own cleanup list, recovered 2026-07-02 from a stray vault-root file, relocated to `Idea/Empty/Present/02-06-2026/temp-cleanup-backlog.md`): docs/dev, docs/prompts, docs/epi-logos-kernel, docs/plans stragglers, and docs/resources/TO-C-Dev-REPO all await sublimation into Seeds; `repo-ontology.md` needs bringing to current state as the canonical path law (and should then refresh CLAUDE.md/AGENTS.md).

Estimated scope: ~60–80 feeder docs into ~15–20 owning specs. The decision register (~90 DR rows: ~15–20 landed, ~10–15 partial, rest plan-only) plus the 10 wave matrices are the highest-signal feeders; replay them against the specs with the overturn doc's 16 reset tasks as the confirmed starting set.
