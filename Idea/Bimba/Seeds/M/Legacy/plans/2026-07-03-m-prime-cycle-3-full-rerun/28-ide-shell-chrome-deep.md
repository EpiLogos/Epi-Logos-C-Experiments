# Track 28 — `ide-shell-m0-m5` Chrome Deep UX (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 28). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 28) — build/verify HERE, never epi-theia:** CARRIER: IDE chrome partitions (M0' reads / M5' governance / shared) + governed-write flow (Atelier Mobius write-back -> s1'.entity.capture Hen candidate -> Canon Studio; aletheia_* = agent tools via s4'.mediation.route, NOT a pane gateway method — see 28.7 CORRECTION); CrossLayoutIntent envelope; nine-id readiness inline. §2 track 28.

1. **T28.1 — Chrome contract doc-ahead-landing + M0/M5 ownership partition**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Landed (rerun, 2026-07-12): carrier contract at `Body/M/pratibimba-app/CHROME-CONTRACT.md` (§1–§9 remapped onto the live flexlayout registry; DR-WC-IS-1/2 RESOLVED in §5); validator `Body/M/pratibimba-app/src/chromeContract.test.ts` (vitest; live registry via `OMNIPANEL_TABS` import + App.tsx AST walk ⇄ contract table, both directions + pending-flip ratchet + nine-id §6 check). 28.3+ tranches cite the CARRIER contract by section number.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T28.2 — Left-sidebar activity-bar system contribution**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T28.3 — Bimba Graph Viewer: two-rendering audit + neighbor graph + relation-family filter**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

4. **T28.4 — Canon Studio: Monaco upgrade + QL/bimba decoration + Smart Connections autocomplete + PASU.md edit flow**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Landed (rerun, 2026-07-27) — the five deliverables, sorted by DR-FACE-7 fate:
   (a) **carried.** "Monaco upgrade" was a Theia-stack instruction; the carrier's editor was already a real one — `MarkdownEditorPane` runs CodeMirror 6 with markdown mode, an editable gate, and a debounced S1-scoped save. Porting Monaco would have been the deprecated widget-port, not the function. The two Monaco APIs the spec actually names land as their CodeMirror equivalents: `IModelDeltaDecoration` → `Decoration.mark`, `CompletionItemProvider` → `CompletionSource` (`src/panes/canonEditorExtensions.ts`).
   (b) **face-gap → built.** Inline QL/bimba decoration over the whole document (`ql-coordinate` / `bimba-wikilink`, tokens `--canon-coordinate` / `--canon-wikilink` in `styles.css`). Coordinate validity stays `ui/tokens.ts::coordinateFamilyGrade` — the scanner decides token boundaries only; wikilinks win over nested coordinates so `RangeSetBuilder` never sees an overlap. `frontmatter-key` is NOT a third inline kind: this carrier splits frontmatter out of the writing surface, so key law is disclosed in the fold instead.
   (c) **face-gap → built, against the live method.** The spec's `s1'.semantic.suggest` never landed and is `unimplemented` in the live probe; the note-scoped `s1'.semantic.suggest_links` IS live (28.T28.12 rides the same one). `[[` completion asks it for this note's neighbours, gates every candidate through `isPrivacySafe`, orders by S1's score, and discloses index staleness. Disconnected gateway and S1 error both refuse honestly — no suggestions, no throw.
   (d) **partly carried, partly bounded.** The C-family typology authority per DR-S1-5 is `s1'.type.classify_c_layer` (live, VALIDATED); the frontmatter fold reads its receipt and renders nothing it derived itself. `C_FAMILY_SCHEMA` in `@pratibimba/m-extension-runtime` — the module the spec names — never existed even in the frozen tree. Frontmatter **key-shape** law is S1's `hen-compiler-core::validate_frontmatter`, reachable only as the CLI `epi vault frontmatter-validate`; it has **no gateway seam**, and adding one is a public-surface change that belongs to the Architect, so the fold DISCLOSES the gap rather than duplicating S1 law in the carrier. Proposed seam, not landed: a read-only `s1'.vault.frontmatter_validate` wrapping the existing `validate_frontmatter`. PASU: the identity note routes to the LIVE PASU wizard (`identity.openWizard`, 25.T25.4, writes via `nara.pasu.set`) instead of growing a second identity editor.
   (e) **face-gap → built.** "Open in Logos Atelier" emits a real `CrossLayoutIntent` to `ide-shell-m0-m5/logos-atelier` carrying the note as `artifactUri` and the S1-resolved coordinate; the write-scope refusal is the carrier's existing read-only banner (S1 Present scope, `src-tauri/vault.rs`), and `mutatesGraphCanon: false` holds — this surface reads.
   Ratcheted as present for this tranche: `s1'.semantic.suggest_links`, `s1'.type.classify_c_layer`.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output. UF proof: `tests/e2e/canon-studio.spec.ts` (real Chromium + spawned gateway + real temp vault).

5. **T28.5 — Agentic Control Room: T8 contents + DR-M5-1 roster collapse + Pi-monitor reframe + Aletheia subagent trace**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

6. **T28.6 — Coordinate Tree: family colouring + active-coordinate highlight + CRUD-vs-governed-route toggle + per-family expand/collapse**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

7. **T28.7 — Logos Atelier: scent-following retrofit + Aletheia tools + Möbius write-back to Canon Studio**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.7 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

8. **T28.8 — Evidence pane: `MediatedRunEvidencePacket` + dispatch-trace mini-graph + DR-WC-IS-2 deep-vs-abbreviated split**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.8 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

9. **T28.9 — Review pane: IOD-17 three-way parity matrix + dispatch-genealogy click-through + DR-WC-IS-2 deep-vs-abbreviated split**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

10. **T28.10 — Autoresearch pane: autoresearch-as-concept frame + Möbius-pass ribbon + per-capacity filter + dry-run + requires_human disclosure**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.10 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

11. **T28.11 — Bridge-gate: nine-id readiness taxonomy + per-binding inline rendering + shared readiness primitive in `m-extension-runtime`**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.11 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

12. **T28.12 — Smart-Connections semantic sidebar carrier**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.12 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Production retarget: replace the obsolete placeholder-only scope with a real `pratibimba-app` sidebar over the existing `s1'.semantic.suggest_links` governed command, strict suggestion/provenance parsing, current-note/selection binding, and honest unavailable/empty states. No dependency on nonexistent `03.T6.5`, no mock suggestions, and no frozen-Theia receiver.
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Depends on 28.T28.11 and 28.T28.13.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

13. **T28.13 — Backend Studio: LSP slot + coordinate-aware navigation**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.13 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

14. **T28.14 — Cross-layout intent target registration for the four un-registered widgets**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.14 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

15. **T28.15 — Autoresearch pane orphan-against-layout fill**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.15 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

16. **T28.16 — Federated `PrivacyDropFeed` (OmniPanel Diagnostics tab feed)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.16 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

17. **T28.17 — Profile-tick re-render contract per widget**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.17 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

18. **T28.18 — Status-bar consumption audit (no own-state for shared fields)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.18 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

19. **T28.19 — Acceptance-harness state-identity assertion per ide-shell widget**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.19 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

20. **T28.20 — Surface→extension→contract ledger contribution (ide-shell rows)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.20 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.
