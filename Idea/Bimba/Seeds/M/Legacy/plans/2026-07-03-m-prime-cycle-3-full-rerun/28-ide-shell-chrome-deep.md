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
   Landed (rerun, 2026-07-30) — the six deliverables, sorted by DR-FACE-7 fate:
   (a) **carried.** `EvidenceRecord` never existed here: `panes/omni/evidenceShapes.ts` (26.T26.10) already IS `MediatedRunEvidencePacket`, and `EvidencePanel`/`EvidencePacketList`/`EvidencePacketView` already consume it. Verified against the substrate, not inherited. This tranche NARROWED the schema instead: `GateLanding.iod17Parity`'s three faces went from `string` to the spec's own `Iod17GateFaceState` union (28.9 (a) verbatim) and `validateEvidencePacket` now refuses a half-filled readout off the wire.
   (b) **face-gap → built.** The mediator badge carries `data-mediator` + `data-subagent` and a colour class. The spec's two named colours land as real tokens (`--mediator-pi` purple, `--mediator-anima` gold, both polarities); the six Aletheia guardians are DERIVED from the Aletheia family token by `color-mix` rather than minting a seventh raw hue — a per-subagent palette is a 30-design-language decision, not a pane's.
   (c) **face-gap → built.** `DispatchTraceMiniGraph` is now collapsible and COLLAPSED BY DEFAULT, and each node carries all four fields the spec names — actor, methodOrSkill, `tickAtInvoke`, and the `psycheFacet` badge over the ONE facet vocabulary (`psycheFacet.ts`, 26.8). The collapse is also how one component serves both DR-WC-IS-2 foldings.
   (d) **carried.** The tool-stream cross-link already carried `data-cross-link="omnipanel.tool-stream"` + `data-evidence-id` and activates the fold with the same record; the 27.9 table registers both directions.
   (e) **bounded, disclosed.** The spec's `CrossLayoutIntent` at `ide-shell-m0-m5/axiom-translation-inspector` HAS NO TARGET: `piAxiomTranslation` is mounted (§2, cosmic deep model) but no row of `CROSS_LAYOUT_INTENT_TARGETS` resolves to it and `intentTarget` answers null — the identical gap 28.T28.7 recorded from the Atelier side. Minting a target id is a public-surface change (Architect / 28.T28.14), so the deep fold renders the affordance DISABLED with the target and reason on screen. Compounding it: nothing emits DR-B-2 steps, so `axiomTranslationSteps` is empty for every real packet.
   (f) **carried, with the name corrected.** The spec names `m5-epii/contemplation-object-viewer`; the carrier registers `m5-epii/contemplationObject` → `omniReview`, and `ContemplationObjectViewer` really is mounted inside `ReviewBlocksPane`. The inbound sibling route `m5-epii/contemplation-object-viewer.open` already lands on the Evidence fold, so the pair is bidirectional under the carrier's own names. Recorded in the seam register, not silently substituted.
   **DR-WC-IS-2 → built.** The frozen tree had two evidence widgets; this carrier has one fold plus the deep governance pane, so the two foldings are ONE component with a declared `fold` prop — `abbreviated` in `omniEvidence`, `deep` in a new `acr-evidence-audit` section of `agenticControlRoom` (`ide-deep` only) over the same producer and deposits. Both read and write `perTabState.evidence.selectedPacketId`, which is the bidirectional record identity; there is NO `ide-deep` intent promotion, because `DEPTH_DIFFERENTIATED_COMPONENTS` does not license `agenticControlRoom` (52.T3) — that click-through is disabled and names the missing target.
   **The `iod17Parity` gap is closed.** 26.10 declared the field and nothing ever populated it. `evidencePacketProducer.ts` now fills it from the ACR's live `computeIod17Parity` (DR-WC-IS-1 makes that surface the source of truth, so the law is consumed, never restated) — and ONLY once `s4'.mediation.capabilities.list` has answered, since a readout built from an unloaded matrix renders a red violation that is really a spinner. Per-dispatch capability landings still carry no readout: one observed face plus two blanks would manufacture a violation nobody measured.
   Ratcheted as present for this tranche: `s5'.epii.deposit`, `s5'.epii.deposit.list`, `s4'.mediation.capabilities.list` (all three probed in `Body/S` by the sibling suite). Declared ABSENT and machine-guarded: the `axiom-translation-inspector` target and any `ide-deep`-promoting `evidence-panel` target.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output. UF proof: `tests/e2e/agentic-control-room-deep.spec.ts` second test (real Chromium + spawned gateway; imports a session, anchors the day, crosses into `ide-deep`, files a real anchored deposit through `s5'.epii.deposit`, and audits the composed packet's deep fold + three-face IOD-17 readout).

9. **T28.9 — Review pane: IOD-17 three-way parity matrix + dispatch-genealogy click-through + DR-WC-IS-2 deep-vs-abbreviated split**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md` — Tranche 28.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Landed (rerun, 2026-07-30) — the five deliverables, sorted by DR-FACE-7 fate:
   (a) **spine-gap → built.** There was NO review-item type in the carrier at all — neither `ReviewItemDeep` nor a base `ReviewItem`. The `/` Review fold projected genealogy records into generic Track-44 `Block`s carrying `{runId, actor, method, capability, status, startedAtMs, endedAtMs}`, and the deep ACR queue carried the raw `AcrReviewItem` off `s5'.review.inbox`. `panes/omni/review/reviewItemDeep.ts` is the type and the ONE producer both foldings call. The base is ALIASED to `acrReviewInbox.ts::AcrReviewItem` (28.T28.5's strict wire projection), never re-declared. Two fields are NULLABLE against the spec's literal declaration, because the alternative is fabrication: `iod17Parity` is absent until the capability matrix answers (an all-`unset` readout still computes `inParity: false`, i.e. the red banner, from a measurement nobody took), and `dispatchGenealogyRef` is absent when the surface holds no genealogy (`ReviewInboxItem` carries no genealogy field on the wire — `Body/S/S5/epii-review-core/src/lib.rs`). The other two fields are JOINS over real reads: the packet id is the review item's own id exactly when an anchored `s5'.epii.deposit` backs it (the packet producer composes with `id = deposit.itemId` only when `evidenceAnchors` are present), and the genealogy ref is the session's root dispatch node by the packet producer's own matching rule — the sibling suite asserts the two agree on real data, so the review row and the evidence packet can never name different runs.
   (b) **face-gap → built.** The three-cell matrix marks a cell green only on `human-required`, red on `agent-allowed` AND on `unset` (an unread face is not an agreeing one), carries the aggregate `inParity` line, and raises the spec's verbatim banner as `role="alert"`. The violation string is imported from `acrGovernance.ts` (DR-WC-IS-1's source of truth), never restated.
   (c) **built, with the landing named.** "View dispatch tree →" rides the LIVE 27.9 route `ide-shell-m0-m5/agentic-control-room.select-run`, carrying the genealogy ref as `artifactUri` into the Dispatch fold with the same node identity (15.11). Inside the deep pane the same click needs no hop and selects that pane's own RunTree. What it CANNOT do is open the deep pane from the `/` fold: the `agentic-control-room` target resolves to `omniDispatchTrace` and `DEPTH_DIFFERENTIATED_COMPONENTS` does not license `agenticControlRoom` (52.T3 / 28.T28.14) — the identical gap 28.T28.8 recorded from the evidence side — so the crossing renders DISABLED and names the target.
   (d) **built.** "View evidence →" rides the LIVE route `ide-shell-m0-m5/evidence-pane.select-packet` on `perTabState.evidence.selectedPacketId`, the ONE key both evidence foldings read (28.T28.8), so one click lands the record in the abbreviated fold and the deep audit at once. The reverse route `omnipanel-shell/evidence.open-review` was already live, so the pair is bidirectional.
   (e) **built.** The human-required banner now carries a parity status LINE whose content differs by folding, and the ACR decision control's gate refusal carries one too — the refusal says why THIS operator cannot commit, the line says whether the substrate would accept the transition at all. Two different failures a single sentence used to blur. No modal anywhere (15.2).
   **DR-WC-IS-2 → built, and a real gap closed.** Until this tranche NO carrier surface but the deep ACR read `s5'.review.inbox`. `ReviewBlocksPane` now reads it LIVE (plus `s5'.epii.deposit.list` for the packet identity) and renders the same rows through the same `ReviewItemDeepView` at `fold="abbreviated"`; the deep half is the ACR's `acr-review-queue` at `fold="deep"`. ONE row identity — `perTabState.review.selectedReviewId` — so a row chosen in either surface is the row the other renders. The Track-44 BLOCK rows below the queue are UNCHANGED and still ride the synthetic fixture until track-12's wire→record producer lands; the fold's banner now labels the two sources separately instead of speaking for both.
   Ratcheted as present for this tranche: `s5'.review.inbox`, `s5'.review.resolve`, `s5'.review.submit`, `s5'.epii.deposit.list`, `s4'.mediation.capabilities.list` (probed in `Body/S` by the sibling suite). Declared ABSENT and machine-guarded: `s5'.review.transition`, and any `ide-deep`-promoting `agentic-control-room` target.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output. UF proof: `tests/e2e/agentic-control-room-deep.spec.ts` third test (real Chromium + spawned gateway; submits a real item through `s5'.review.submit`, reads it in the `/` Review fold at `fold="abbreviated"` with the crossing disabled, crosses into `ide-deep`, and reads the SAME row at `fold="deep"` with the three-face IOD-17 matrix populated from the live capability matrix).

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
