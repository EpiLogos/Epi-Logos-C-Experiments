# Track 40 — Bimba Canon Update Ledger (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 40). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 40) — build/verify HERE, never epi-theia:** MIXED — Bimba canon-update ledger (s5'.canon_update.*, epi bimba propose|land|refuse, lint test) SUBSTRATE; CARRIER: CU review surface (combine with 48 bases view). §2 track 40.

1. **T0 — Absorb and retarget: 40-bimba-canon-update-ledger.md (law-only source)**

   Brief: read `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md` IN FULL. It carries binding law/design with no tranche list. Enumerate its unbuilt commitments against the current carrier (register §2 track 40 lists known gaps) as new numbered tranches appended to THIS file, then close this task with the enumeration as evidence.
   Depends on Track 00 Tranche 3.
   Verify: new tranches parse into the ledger (re-run the assess script and show the new task ids); each cites its original section.

---

## Enumerated tranches (T0 output — PROPOSED, Architect review pending)

*Enumerated from the source law (`../2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md`) against [[2026-07-03-cycle-3-recapture-register]] §2 track 40 (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:88-89`). Each tranche cites its originating source section; substrate seams (gateway/CLI/lint/Hen) carry unchanged per `CHARTER.md`, the review surface lands as a `Body/M/pratibimba-app` carrier. Confirmed unbuilt on the current carrier as of 2026-07-10 (grep receipts in each Brief).*

2. **T40.1 — Gateway s5'.canon_update.* five methods + epi bimba propose|list|show|land|refuse CLI parity**

   Brief: source §Tranches 40.1 (`../2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md:144-160`) + §Surface routing tier-2 (`:126`) in full. Register SEAMS: `s5'.canon_update.*`, `epi bimba propose|land|refuse`. Register-confirmed UNBUILT (2026-07-10: 0 `canon_update` refs under `Body/S/S3/`; no `Body/S/S0/epi-cli/src/bimba.rs`). Land the five gateway methods (`propose/status/list/land/refuse`) under `s5'.canon_update.*` plus the `epi bimba` CLI twins. Substrate work — carries unchanged per `CHARTER.md`. Source-noted upstream dep: Tranche 12.2 EXPANDED `s5'.gnostic.*` registration.
   Depends on Track 00 Tranche 3.
   Verify: `grep -nE "s5'.canon_update\." Body/S/S3/gateway-contract/src/lib.rs` returns ≥5 registrations; `grep -nE "epi bimba propose|epi bimba list|epi bimba land" Body/S/S0/epi-cli/src/bimba.rs` returns the CLI bindings; `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml s5_canon_update_round_trip` (gateway crate is workspace-excluded — `-p` never resolves; runtime round-trip is the K-class substrate proof, the "W-class" label is superseded by the K classification in `plan.runs/verification-classes.json` since the family is runtime/CLI-driven not over-the-wire per the m4.arena carve-out); verifier ≠ closer.

3. **T40.2 — Lint test canon_update_landed_xref_consistency enforcing the landing invariant**

   Brief: source §Tranches 40.2 (`../2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md:162-164`) + §Cross-reference discipline (c) (`:138`) in full. Land `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test canon_update_landed_xref_consistency`: for each `status: landed` CU row, assert the `target_landing_site.path` carries the matching `<!-- canon-update: CU-* -->` inline marker AND the target file's `canon_updates_landed` frontmatter array includes the row id; mismatch is build-fail. Register-confirmed UNBUILT (2026-07-10: no `canon_update` test under `Body/`). Substrate work — carries unchanged per `CHARTER.md`.
   Depends on Track 00 Tranche 3.
   Verify: `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test canon_update_landed_xref_consistency` passes green over the five landed Phase-J rows (requires T40.3's frontmatter-array completion); verifier ≠ closer; evidence = fresh command output.

4. **T40.3 — Complete and verify the Phase-J landing invariant across the three target canon files + DR-M3-6 amendment**

   Brief: source §Tranches 40.3 (`../2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md:166-168`) + §Cross-reference discipline (a)-(b) (`:134-136`) + the CU-IDENTITY-1..4 / CU-FORM-1 `target_landing_site` fields (`:199, :232, :267-269, :304, :343-345`). Verified 2026-07-10: inline `<!-- canon-update: CU-* -->` markers ARE present in `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md` (CU-IDENTITY-1/2/4), `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md` (CU-IDENTITY-1/2/3/4 + CU-FORM-1), and `Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md` (CU-IDENTITY-3 + CU-FORM-1), and DR-M3-6 carries the Phase-J sixth-form amendment (`../2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:754`). GAP: the whole-file `canon_updates_landed` frontmatter array (invariant b) exists only in `ql_m0_m3_third_spanda_integral_quilting_v2.md:22`; MISSING in `alpha_rasa_bridge_ql.md` and `m3-prime-ql-transcriptional-bridge.md`. Add the missing frontmatter arrays so the invariant holds — canon edit, routes through Hen per canon-write law, NOT a substrate crate.
   Depends on Track 00 Tranche 3.
   Verify: each of the three target files carries BOTH inline marker(s) AND a `canon_updates_landed` entry per landed row; T40.2's lint passes green (`cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test canon_update_landed_xref_consistency`); verifier ≠ closer.

5. **T40.4 — Hen promotion-time refusal of orphan canon-update markers (ledger is the only legal source of markers)**

   Brief: source §Cross-reference discipline (d) (`../2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md:140`) + register §1 canon governance (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:51`) in full. Hen verification at promotion time MUST refuse any `Idea/Bimba/World/Types/` write or canonical-spec edit that adds a `<!-- canon-update: CU-* -->` marker without a corresponding ledger row at `status: validated` or higher. Register-confirmed UNBUILT (2026-07-10: 0 canon-update refs under `.pi/extensions/ta-onta/hen/`). Substrate work (Hen / S1') — carries unchanged per `CHARTER.md`.
   Depends on Track 00 Tranche 3.
   Verify: a Hen promotion test where an orphan marker (no validated ledger row) is refused, and one with a validated row passes; verifier ≠ closer; evidence = fresh command output.

6. **T40.5 — CU-ledger review surface as a pratibimba-app carrier pane (combined with the Track-48 bases view)**

   Brief: register §2 track 40 CARRIER (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:89`) + source §Integration Track-39 S5' substrate row (`../2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md:117`) + `downstream_landing_sites` (`:16-21`). Land a `Body/M/pratibimba-app` pane that lists/inspects CU-ledger rows over `s5'.canon_update.list` (status filter; per-row provenance, derivation, target-landing-site), reusing the Track-48 coordinate-keyed bases-view carrier. Theia contract surfaces are LAW; build natively per `CHARTER.md` retarget rule 2 — never epi-theia.
   Depends on Track 00 Tranche 3.
   Verify: pane mounts and renders live CU rows from a spawned gateway's `s5'.canon_update.list` (Playwright / UF-class per Track 00); verifier ≠ closer.
