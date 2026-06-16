# Track 43 — End-of-Cycle-3 Audit Protocol

Repo-hygiene + code-header/API-navigability + legacy-file removal, as the **hygiene complement to Track 14's no-orphan audit**. Where Track 14 asks "is every canonical surface owned?", this track asks "is the repo *navigable* — does its physical shape match the coordinate mental-map, are module interfaces narrow and declared, and is dead/legacy material out of the agent's traversal path?"

Posture: **anti-greenfield throughout** — normalise headers, untrack build artifacts, and remove superseded files; never rebuild. Grounded in the "Architecting Codebases for AI Navigability and Deep Modules" principles already partially embodied by the coordinate system: deep modules behind a narrow *declared* interface; directory = mental map (the S/M coordinate tree IS this); types-first discoverability; tests as guardrails; arrest drift (implementation leaking into headers, duplication, and a fragmented API-header convention). The coordinate system makes modularity *implicit*; this track makes the **interface contract that exposes it** uniform and maintained, with Hen (S1') as the durable owner so it does not drift again.

## Discipline

Every row follows the same shape:
- **Scope**: the file(s)/surface to normalise or remove
- **Current state** (cited): the drift or staleness found
- **Target**: the narrow-interface / clean-tree end state
- **Blast radius**: consumers affected (use `gitnexus impact` per moved symbol; low when a re-export façade or prototype preserves the public API)
- **Verification**: `grep` / `cargo check` / `make test` command proving the change landed without widening any boundary
- **Deliverable** (when a document): `plan.runs/<task-id>-audit.md`, matching the existing `canon-audit-*.md` pattern

## Source

- Loose-file + orphan forensics (root config vs `Body/S/` migration), 2026-06-16 audit session
- S0 C-header surface audit (`Body/S/S0/epi-lib/include/*.h`) — deep-module / info-hiding findings
- S/S'→M' module-boundary audit (Rust crates + `Body/M/epi-theia/extensions/*`)
- Legacy/deprecated inventory (quarantine, build artifacts, migration sources)
- NotebookLM: "Architecting Codebases for AI Navigability and Deep Modules" (principles + anti-drift)

## Tranches

1. **43.1 — Repo-hygiene sweep: immediate fixes + gated legacy removal** *(repo-hygiene)*

   **Immediate hygiene — DONE in the 2026-06-16 audit session** (recorded here for audit completeness; no further work):
   (a) `.clangd` include paths repointed to `Body/S/S0/epi-lib/include` + `Body/S/S0/vendor/blake3` (were pre-migration `epi-lib/include` / `vendor/blake3`, resolving nowhere — broke LSP for the whole C tree).
   (b) `.gitignore` migration-lag patterns added (`Body/**/test/bin/`, `Body/**/*.app/`); `git rm -r --cached` untracked the committed `target/` (3,743 files, 2.0 GB), 21 `Body/S/S0/epi-lib/test/bin/` Mach-O binaries, and the `Body/S/S3/epi-app/EpiLogos-Dev.app/` bundle.
   (c) Root spec-seed `epi_logos.{c,h}` (orphaned original blueprint, zero inbound refs, superseded by `Body/S/S0/epi-lib/` + `include/ontology.h`) quarantined to `Body/_quarantine/root-spec-seed/`; local `./epi_logos` binary deleted.
   (d) `chmod 644 Body/S/S0/epi-lib/include/m0_calculus.h` (was `0600`, the only header unreadable to a non-owner UID — latent CI/container build break).
   (e) `.env.graph-dev` stale absolute paths repointed to `Body/S/S3/redis-context/scripts/redisvl_cache_service/…` (the live graph never read this file — it self-computes via `SemanticCacheConfig::for_local_dev()`; no graph re-bootstrap needed).
   (f) Filesystem-only clutter deleted from working tree (all gitignored): `Idea/.smart-env/` (261 MB), `vendor/legacy/epi-tauri/` (383 MB), `Body/S/S3/epi-app/{dist,node_modules}` (~800 MB), the two `vendors/**/depwire-output.json` blobs; quarantine scratch `Body/_quarantine/{tmp-taonta-analysis,epi-cli-dot-epi-runtime/session.json}` `git rm`'d.

   **Gated legacy removal — each bound to its in-cycle-3 closing track (nothing deferred "beyond"):**
   - `Body/S/S3/epi-app/` tracked source (208 files) — labeled "migration source only"; remove once **Track 11** (Theia-shell parity) closes.
   - `extensions/MIGRATION-SOURCES.md` + ~148 stale `epi-tauri` references (epi-tauri already deleted from disk) — remove with **Track 11** close.
   - `m1-paramasiva-played-torus` vs `m1-paramasiva` duplicate disposition — resolve under **Track 02** (M1 reconciliation) + **DR-M1-2** (the played-K² Bevy/wgpu surface is the *canonical* one per DR-M1-2; confirm the loser).
   - `Body/S/S4/ta-onta/S4-2p-pleroma/staged/` vs active `plugins/pleroma/` — promote-or-quarantine under **Track 12** (agentic S4↔S5).

   KEEP-list (do NOT sweep): `Idea/Bimba/Seeds/**/Legacy` (the canon doc archive, governed by `LEGACY-DOCS-MIGRATION-MANIFEST.json`); `Body/S/S4/pi-agent/` (still live-referenced; retire only when claw-rust lands); declared `.gitmodules` vendors.

   Verification: `git ls-files | grep -E 'epi-app/|epi-tauri' | wc -l` → 0 after gates close; `git ls-files target/ Body/S/S0/epi-lib/test/bin | wc -l` → 0 (already).
   Deliverable: `plan.runs/43.T43.1-audit.md` (full inventory + disposition ledger).

2. **43.2 — Unified "Coordinate Header" convention (define + hand to Hen)** *(doc-ahead-landing; Depends: DR-HYGIENE-1)*

   The audit found the API-header intent is uniform everywhere (coordinate + responsibility + narrow surface + explicit non-ownership) but expressed in **three unaligned media** — Rust `Cargo.toml description`, S4/S5 `CONTRACT.md`, and the M-stack JSON contract — so an agent traversing S0→S4→M' must learn three places to look, and the natural Rust `//!` module-doc is present in only ~18% of crates.

   Define ONE logical schema, dual-rendered: a mandatory `//!` (Rust) / top-JSDoc (TS) block — `Coordinate` · `Residency` (physical path, flagged when ≠ conceptual, per the Track 17 substrate-residency note) · `Position (#n)` · `Actualises` · `Public surface` · `Does NOT own` · `Contract:` link — plus the proven ta-onta/epi-kbase `CONTRACT.md` body for crates with a real seam. Register the convention as repo ontology via **Track 40** (bimba-canon-update-ledger) and a CCT closure so Hen (S1') compiles/validates it, not a one-off habit.

   Exemplars to codify (already correct): `include/ontology.h`, `include/m5.h` (C); `epi-kernel-contract/src/lib.rs`, `epi-spacetime-module/src/lib.rs`, `epii-autoresearch-core/src/lib.rs` (Rust); `S4/ta-onta/*/CONTRACT.md`, `S5/epi-kbase/CONTRACT.md` (seam contracts).
   Verification: convention doc exists + referenced by Track 40 intake. Deliverable: `plan.runs/43.T43.2-convention.md`.

3. **43.3 — Apply the convention across S/S'→M'** *(code-cleanup-refactor; Depends: 43.2)*

   Add the `//!` header to the ~14 Rust crates missing it (worst-first: `Body/S/S5/epi-kbase-core/src/lib.rs` — 6-line bare `pub mod` wall). Add the 4 missing `Cargo.toml description`s (`gemini-embedding`, `settings`, `epii-review-core`, `epii-agent-core`). Add JSDoc headers to empty TS barrels — **note**: `logos-atelier` / `canon-studio` disposition is governed by **DR-LIB-ATELIER-1** (Library + Atelier are Theia *projections/lensings*, not standalone extensions), so they may take a projection-header, not a full extension barrel; reconcile rather than assume.

   Blast radius: nil (additive doc + metadata; no symbol moves). Verification: the 43.5 lint passes; `cargo check` across the workspace clean.

4. **43.4 — C-header information-hiding remediation** *(code-cleanup-refactor; cross-links Track 17)*

   The doc-header convention held in the C tree, but implementation leaked into the public surface. Move `static inline` *bodies* (algorithms, not 1-line accessors) and `static const` LUTs out of headers into their `.c`, leaving prototypes:
   - **`m3.h`** (worst — 55 inline bodies incl. `m3_tarot_rotation` with trig+LUT, `m3_compute_charges`; it even declares `m3_compute_charges_ffi` "Definition in m3.c" beside the inlined copy) → move bodies to `m3.c`.
   - **`m1.h`** (853 LOC > its own `m1.c` 436 LOC; 23 inline bodies + 7 LUTs incl. `RING_QUATERNION_LUT`, `CL42_BASIS`, `QL_TRIG_TABLE`) → relocate LUTs to `m1.c` with `extern`/accessor prototypes.
   - `m2.h` / `engine.h` on watch (lower volume; `engine.h` pulls `<math.h>` into a public header only to feed inlines).
   Template: `m5.h` / `ontology.h`. Permitted inline exceptions: one-expression accessors and `_Static_assert`-required constant maps (e.g. `m_canonical.h`).

   Blast radius: run `gitnexus impact` per moved symbol BEFORE moving (CLAUDE.md invariant). Verification: `make test` green; **invariant** — no header larger than its sibling `.c` (`for h in Body/S/S0/epi-lib/include/m*.h; do c=${...}; done`).

5. **43.5 — Enforced boundaries + drift guardrails** *(preflight-contract; Depends: DR-HYGIENE-2)*

   (a) A `forbidden-imports` check for the Rust S-stack, mirroring the M-stack's `forbiddenDirectImports` in `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` (the strongest, CI-checkable boundary in the repo) — e.g. S0 must not depend on S3.
   (b) Extend the existing lint discipline (`swarmvault lint` / CI) to fail when: a `lib.rs`/barrel lacks the 43.2 header; a crate lacks a `Cargo.toml description`; or a C header exceeds its sibling `.c` (the 43.4 invariant). Turns the convention into an invariant, not a habit.
   Verification: the lint runs in CI and fails a deliberately-broken fixture. Feeds release gate **G12**.

6. **43.6 — Make navigability first-class for the agents** *(doc-ahead-landing)*

   (a) A rule block in `CLAUDE.md` + `AGENTS.md`: every module declares its coordinate header; headers/`lib.rs` *declare*, `.c`/`.rs` *define*; respect `forbidden-imports`; read types/contract before implementation; apply taste at boundaries (do not outsource interface design to the agent).
   (b) A `coordinate-header` skill (author + validate a module's header against the 43.2 schema), sibling to `bimba-vault-validate`.
   The notebook's own caveat is respected: structure (43.2–43.5) is the primary lever; these agent rules reinforce it.
   Deliverable: the rule block + skill; cross-link from generated M-stack barrels to the JSON contract so a code reader discovers the enforced boundary exists.

## Release-gate hook

This track's closure feeds a NEW gate in [`14-no-orphan-audit-and-release-gates.md`](14-no-orphan-audit-and-release-gates.md):

- **G12 — Repo-hygiene & navigability audit passes.** 43.1 immediate fixes landed; 43.1 gated removals closed with their parent tracks (11/02/12); the 43.2 convention is registered with Hen (Track 40); 43.3 applied; 43.4 C-header invariant holds (`make test` green, no header > its `.c`); 43.5 lint runs in CI; DR-HYGIENE-1/2/3 VALIDATED. Cycle 3 does not close while G12 is open.

## Decisions (route to [`13-decision-register.md`](13-decision-register.md))

This is execution work, not a contradiction, so its home is this track — but three genuine policy choices it surfaces require a DR row (per G7/G11: no tranche works an unvalidated decision):
- **DR-HYGIENE-1** — the mandated unified Coordinate Header schema (gates 43.2/43.3).
- **DR-HYGIENE-2** — the Rust S-stack forbidden-imports policy: which S-layers may import which (gates 43.5).
- **DR-HYGIENE-3** — disposition of undeclared `vendor/legacy/*` clones (externalize vs delete; gates the 43.1 KEEP/remove edge cases).

## Verification Commands

```bash
PLAN=Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation
# Re-index so the assessor picks up Track 43 as a tranche-bearing file (43.T43.x)
node .codex/scripts/m-dev-plan-assess.mjs --write --json "$PLAN"
# 43.1 — build artifacts untracked
git ls-files target/ Body/S/S0/epi-lib/test/bin | wc -l        # → 0
git ls-files epi_logos.c epi_logos.h | wc -l                   # → 0 (quarantined)
# 43.4 — no C header larger than its sibling .c
for h in Body/S/S0/epi-lib/include/m{0,1,2,3,4,5}.h; do c=${h/include/src}; c=${c%.h}.c; \
  echo "$(wc -l < "$h") $(wc -l < "$c" 2>/dev/null) $h"; done
# G4 — new DR rows present
grep -c "^## DR-HYGIENE-" "$PLAN/13-decision-register.md"      # → 3
```
