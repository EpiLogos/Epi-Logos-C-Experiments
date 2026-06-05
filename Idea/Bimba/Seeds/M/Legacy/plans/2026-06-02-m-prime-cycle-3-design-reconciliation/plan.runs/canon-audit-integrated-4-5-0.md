# Canon Audit: integrated-4-5-0-recognition

**Auditor scope:** Tranche 08 (integrated 4-5-0 recognition architecture) — six tranche rows (8.1–8.6) plus the load-bearing "Total-Shape Architecture (Phase A)" preamble framing the composition over M4 (psychoid cymatic field) + M5 (Logos Atelier / Epii review) + M0 (Bimba graph backdrop / Möbius write-back); special attention to DR-IG-6 (dipyramid 6+6), DR-M4-3 (PersonalPoleProjection strict invariant), DR-M5-3 (library-pane left-sidebar placement).
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (both pages, 669 lines)
- `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` (839 lines, both pages)
- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` (1157 lines, both pages)
- `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md` (§§0–6, §13)
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/08-integrated-4-5-0-recognition-reconciliation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md`
- `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md` (both pages — substrate-citation input only, per audit discipline)
- `Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md` (page 1 — substrate-citation input only)

## Per-row audit

### 08-PRE-1 — INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md is named as the canonical composition-architecture document
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:1-50` (`status: canonical-architecture-spec`; `authority_relation: Domain authority for the integrated 4-5-0 personal-stratum composition surface`)
- **Current framing in tranche:** "Canonical composition-architecture document: `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` (838 lines)."
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** The document's own front matter declares the authority relation; tranche's pointer is faithful.

### 08-PRE-2 — Profile-bus projections named: `PsychoidFieldProjection` + `CanonRecognitionStream` per Tranche 10.IG
- **Status:** WRONG-FRAMING
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:264-340` (defines `PsychoidFieldProjection` + `CanonRecognitionEvent` — singular `Event`, NOT `Stream`) and `13-decision-register.md:424-434` (DR-M4-3: PersonalPoleProjection strict invariant, opaque handles only)
- **Current framing in tranche:** Two profile-bus projections `PsychoidFieldProjection` + `CanonRecognitionStream` to be added to `MathemeHarmonicProfile`.
- **Canon framing (if not ALIGNED):** The INTEGRATED doc §4.3.2 names the type `CanonRecognitionEvent` (single event per emission carrying `bimba_coordinate`, `pattern_packet_handle`, `atelier_scent_path`, `recognition_degree720`, `write_back_state`, `recognized_at_ms`), referred to in the field name as `canon_recognition_stream` (the bus field is a *stream of CanonRecognitionEvents*, not a struct named `CanonRecognitionStream`) — cited `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:305-340`. Crucially, per DR-M4-3 (`13-decision-register.md:424-434`) the personal-pole bus surface MUST be `PersonalPoleProjection` with strict opaque-handle invariant (raw `q_personal`/Vāma classifier NEVER cross the bus; only handles + scalar resonance metric). The proper composition is: `personal_pole: Option<PersonalPoleProjection>` (DR-M4-3 owner) which *contains* `psychoid_field` and `pattern_packet_handle`; `canon_recognition_stream` is a *separate* event-stream field.
- **Recommendation:** REWRITE
- **Recommendation detail:** Replace "`PsychoidFieldProjection` + `CanonRecognitionStream` per Tranche 10.IG" with "`PersonalPoleProjection` (per DR-M4-3, owner Tranche 10.M4) carrying opaque psychoid-field handle + bioquaternion + resonance + pattern_packet_handle; plus `canon_recognition_stream: Vec<CanonRecognitionEvent>` per INTEGRATED §4.3.2". Cite DR-M4-3 as authority for strict-invariant opacity.

### 08-PRE-3 — DR-IG-6 (dipyramid + Hopf-linked tori canonical terminology → CCT-3) flagged as Phase-B PROPOSED
- **Status:** DRIFT (stale status)
- **Cited:** `13-decision-register.md:364-383` (DR-IG-6 VALIDATED with CORRECTED GEOMETRY 2026-06-03; full 6+6 P/P' mapping with 2 poles P5/P5' + 4 base P1-4 + 4 inverted-base P1'-4' + 1 central axis-point P0/P0')
- **Current framing in tranche:** "Phase-B PROPOSED: DR-IG-6 (dipyramid + Hopf-linked tori canonical terminology → CCT-3)."
- **Canon framing (if not ALIGNED):** DR-IG-6 is **VALIDATED with CORRECTED GEOMETRY** as of 2026-06-03, not PROPOSED. The geometry is **full 6+6 = 12 positions**: P5/P5' as the two apex poles, P1-4 + P1'-4' on the octagonal base, P0/P0' as the central axis-point (NOT a base vertex), per `13-decision-register.md:368-374`. The earlier "6 vertices = 6 QL positions" framing is rejected.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Update the preamble to read: "DR-IG-6 VALIDATED (2026-06-03 with CORRECTED GEOMETRY): full 6+6 P/P' mapping — P5/P5' apex poles + P1-4 + P1'-4' on the octagonal base + P0/P0' as the central axis-point projected to both poles. CCT-3 terminology sweep is the corpus-wide enforcement vehicle." Cite `13-decision-register.md:364-383`.

### 08-PRE-4 — Composition contract: M4 protected-local + M5 Logos Atelier + M0-5' pedagogy on three composition slots, opaque handles only
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:60-79` (six sub-coordinates table mapping to composition slots: Nara journal LEFT, psychoid field CENTER, Logos Atelier RIGHT, M0 backdrop, Epii review summonable); `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:240-254` (`JivaSivaFieldName` enum — handles + summaries only); `13-decision-register.md:424-434` (DR-M4-3 opaque-handle invariant)
- **Current framing in tranche:** Composition contract names M4 protected-local + M5 Logos Atelier + M0-5' pedagogy on three composition slots with opaque handles only across boundaries.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Three-slot composition + opaque-handle discipline tracks INTEGRATED §1 + §4.2 + DR-M4-3.

### 08-PRE-5 — PatternPacket chain owner: CCT-7
- **Status:** MISSING-CITATION
- **Cited:** `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md:140-156` (the `mahamaya_transcription` envelope structure inside the M4-3 PatternPacket); `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md:130` (substrate gap: "there is **no `PatternPacket` struct** in `portal-core/src/`"; M4-3' is the logical-intelligence engine; today only the journal parser surface)
- **Current framing in tranche:** "PatternPacket chain owner: CCT-7."
- **Canon framing (if not ALIGNED):** Canon explicitly locates PatternPacket ownership at M4-3' (M4'-SPEC §8.10 / UX §3.4 / M4-ARCHITECTURE §2.4). CCT-7 is named in the tranche without a citation linking the closing-tranche id to the canonical owner. Without a cross-link to M4'-SPEC §6.8 + M4-ARCHITECTURE §9.2 ("Tranche 06.M4-c — M4-3' PatternPacket substrate"), the CCT-7 reference is opaque.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add citation for PatternPacket ownership: `cited: Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md:140-156` + `cited: Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md:710-715` (the M4-3' substrate scope under Tranche 06.M4-c). Confirm CCT-7's scope ratifies this ownership.

### 08-PRE-6 — Möbius write-back to M0 routes via governed-route (DR-M0-1)
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:6-14` (DR-M0-1 VALIDATED: "governed routed-write via M5 atelier"; "M0' inspector retains `mutatesGraphCanon: false`"); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:622-643` (§7.6 — "M0-5' Möbius write-back is the only path... every write goes via review → dry-run → governed-promote path"); `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md` §13.5 (the one-loop)
- **Current framing in tranche:** Möbius write-back routes via governed-route per DR-M0-1.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** DR-M0-1 is ratified; the INTEGRATED doc enforces the path via the review → dry-run → governed-promote chain.

### 08-PRE-7 — "Anti-greenfield throughout" framing
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:716-770` (§9 Anti-Greenfield Audit: 9.1 landed in code; 9.2 pending; 9.3 named-exceptions; 9.4 forbidden)
- **Current framing in tranche:** "Anti-greenfield throughout."
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** INTEGRATED §9 makes the anti-greenfield posture concrete; tranche reflects.

### 08.1 — Privacy-first composition contract (no raw bodies cross plugin)
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:424-434` (DR-M4-3 strict invariant: handles only, raw `q_personal` body and Vāma classifier never cross the bus; scalar resonance metric IS surfaced); `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md:304-314` (§7.6 privacy boundary — `q_personal` never in public S2 graph, never in shared profile, never in Graphiti without governed review); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:238-254` (§4.2 `JivaSivaFieldName` handles-only enum); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:441-451` (§5.7 negative discipline)
- **Current framing in tranche:** "Composition contract asserts: M4 `ProtectedPersonalFieldInput` MUST cross to M5 review surfaces only as opaque handles with provenance-state — never raw quaternions, never audio_octet bodies."
- **Recommendation:** AUGMENT
- **Recommendation detail:** Cross-link this row explicitly to DR-M4-3 (`13-decision-register.md:424-434`) as the ratified DR that authorises the strict invariant — currently the tranche row carries the rule without naming the DR.

### 08.2 — M2 → M4 deposit-handle reception
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:410-420` (DR-M2-3 VALIDATED: `f_routing(intent, kerykeion, t) -> RoutingTrace` owner `Body/S/S0/portal-core/src/parashakti/f_routing.rs`); `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md:534-540` (§7.1 M4↔M2 Vimarśa-window contract: cymatic engine consumed at personal register from `profile.audio_octet[8]` Vimarśa-written; no local synthesis); `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` §6.7 (M4' consumes M2' resonance72/element/decan/chakra/body-zone/correspondential law as context handles + inference priors)
- **Current framing in tranche:** Plugin receives M4' deposit handle emitted by M2 F_routing and routes via `nara_journal::deposit`. Privacy-class verified at handoff.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Aligned with DR-M2-3 (validated) + M4-ARCHITECTURE §7.1 contract.

### 08.3 — M5 recursive-self-review gate consumption
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:84-86` (§M5'.4 six operational capacities including recursive user-final-validation for Epii-on-Epii); `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:114` (review/improvement contract per S5-SPEC: human-required items may be deferred by agents but not approved, rejected, or revised by agents); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:136-149` (§2.4 M5-4 review-core substrate: `DryRunPromotionPlan` with `nonDryRunBlockedReason`)
- **Current framing in tranche:** Plugin surfaces identity-augment proposals through M5 review widget; ACR `enforceHumanGate` extended with `recursiveSelfReview` flag must gate `applied` verdict on user final-validation when actor is `sophia`/`anima`/`pi`/`aletheia`.
- **Recommendation:** AUGMENT
- **Recommendation detail:** The actor list `sophia/anima/pi/aletheia` is correct per DR-M5-1 (`13-decision-register.md:198-212`) — Pi as harness, Anima as dispatcher, Aletheia-the-mode (NOT the six subagent techne-guardians). Add a note that `actor: aletheia` here refers to the mode/carrier, not the individual subagents (per DR-B-3 + DR-S4-TECHNE the 6 subagent techne-guardians surface as Anima-dispatch sub-traces under Aletheia, not as peer review actors).

### 08.4 — M5 → M0 pedagogical return (Möbius write-back)
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:6-14` (DR-M0-1 governed routed-write via M5 atelier); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:153-164` (§2.5 the Möbius write-back as the central architectural commitment beyond cosmic 1-2-3); `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md` §13.5 (the one loop: Nara lives event → Q_activity perturbation → PatternPacket → review → atelier crystallisation → governed write-back → renewed ground feeds back to M4-0 + #4.4.4.4); `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md:131-133` ("M5 language-development and autoresearch actions launched from M0' are route/review actions only and cannot mutate Anuttara node canon directly from the graph view")
- **Current framing in tranche:** Plugin owns the personal → pedagogical return path: recognized patterns crystallize through Logos Atelier into M0' M0-5' pedagogy layer; no canon mutation — read-only contemplative offering anchored to M0 nodes.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Read-only-pedagogy reading aligns with M0'-SPEC §M0'-2; canon mutation goes via DR-M0-1 governed-route only.

### 08.5 — Plugin layout claim against shell-1 (personal) decision
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:276-285` (DR-TS-1 VALIDATED: 0/1 is a single shell with 0 side cosmic + 1 side personal; layout `daily-0-1` carries the toggle; no third layout); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:38-46` (Frame: composition occupies the `daily-0-1` shell's `cmd-period` lemniscate toggle; personal stratum on the personal side); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:676-682` (§8.2 NOT in `ide-deep`; NOT in OmniPanel)
- **Current framing in tranche:** Plugin's `LayoutClaim` for shell-1 personal + flow-writing surface must match DR-TS-1 resolution. If DR-TS-1 ratifies daily-0-1 intra-layout toggle, plugin's contribution must declare its `availableInLayouts` cleanly.
- **Recommendation:** AUGMENT
- **Recommendation detail:** DR-TS-1 is now VALIDATED (not pending). Update conditional language ("If DR-TS-1 ratifies...") to indicative ("Per DR-TS-1 (VALIDATED 2026-06-02)..."). Cite `13-decision-register.md:276-285`.

### 08.6 — 0/1 cymatic polarity consumer (DR-M4-2 clause 5)
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:188` (DR-M4-2 clause 5 VALIDATED: "0 = cosmic, 1 = personal. Always been the case. psychoid-engine reading (1-side personal / 0-side cosmic) IS canonical; any `m5-prime-system-shape §3.2` wording suggesting otherwise is drift to be patched"); `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md:68-83` (§2.1–§2.2 0 side integrated world clock cosmic facing; 1 side personal psychoid field + flow surface)
- **Current framing in tranche:** Plugin consumes the personal-cymatic 0/1 polarity decision from DR-M4-2 (clause 5: psychoid-engine 1-side personal / 0-side cosmic vs m5-prime-system-shape 0-side personal). Wire chosen polarity through `MathemeHarmonicProfile.audio_octet` rendering boundary.
- **Recommendation:** AUGMENT
- **Recommendation detail:** DR-M4-2 clause 5 is now VALIDATED (2026-06-02); reframe from "decision pending" to "consume ratified polarity (0=cosmic, 1=personal)". Note the explicit instruction in `13-decision-register.md:188` that "any `m5-prime-system-shape §3.2` wording suggesting otherwise is drift to be patched" — confirm Track 11.1 inherits the sweep.

### 08-IMPL-1 — Library-pane (M5-0' Gnostic Library) placement at left-sidebar in `ide-deep` (NOT OmniPanel tab) per DR-M5-3
- **Status:** MISSING-CITATION (Tranche 08 silent on library-pane placement; should it be in scope?)
- **Cited:** `13-decision-register.md:438-448` (DR-M5-3 VALIDATED: library-pane is a left-sidebar activity-bar mode in `ide-deep`, NOT an OmniPanel tab; OmniPanel is for agentic dispatch, not corpus browsing); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:677-682` (§8.2 4-5-0 surface placement: NOT in `ide-deep` Mn views; NOT in OmniPanel; activity-bar hosts Coordinate Tree, Bimba Graph Viewer, Canon Studio — none are inside the 4-5-0 plugin's editor area); `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:40` (M5-0' = Library / Bimba Pedagogy / Gnostic Namespace)
- **Current framing in tranche:** Tranche 08 does NOT carry an M5-0' library-pane row. The library-pane placement is out-of-scope for Tranche 08 per §8.2 of the INTEGRATED doc (4-5-0 plugin owns the editor surface; library lives in activity-bar).
- **Canon framing (if not ALIGNED):** The library-pane belongs to M5-0' chrome (Tranche 06.x / 15.3 activity-bar work, NOT Tranche 08). The 4-5-0 plugin consumes M5-0' material only via the M5-5' Logos Atelier drawer (which is summonable per INTEGRATED §5.3) and via the M0 backdrop (§5.4); the library-pane itself does not surface in the 4-5-0 plugin's editor area.
- **Recommendation:** NEW-TRANCHE-ROW (or confirm in tranche-prose that library-pane is out-of-scope here)
- **Recommendation detail:** Add a short note to Tranche 08 preamble: "Library-pane placement (M5-0' chrome) is OUT OF SCOPE for Tranche 08 — owned by Tranches 06.1 / 06.4 / 15.3 per DR-M5-3 (left-sidebar activity-bar mode in `ide-deep`). The 4-5-0 plugin consumes M5-0' only via the summonable M5-5' Logos Atelier drawer and the M0 backdrop." Cite `13-decision-register.md:438-448`.

### 08-IMPL-2 — Dipyramid topology rendered in psychoid field uses corrected DR-IG-6 6+6 geometry
- **Status:** WRONG-FRAMING
- **Cited:** `13-decision-register.md:364-383` (DR-IG-6 corrected geometry: full 6+6 P/P' — 2 apex poles P5/P5' + 4 base P1-4 + 4 inverted-base P1'-4' + 1 central axis-point P0/P0'); `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md:252-262` (§7.1 dipyramid bounding shell: 6 vertices + 8 triangular faces + 12 edges, "12 named QL positions (6+6): #0/#0' at centre... #5/#5' at apexes (quintessence pair)"); `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md:388-389` (§5.3.1 "Square-base dipyramid — 6 vertices... #0/#0' at centre (white/black ground); #1-#4 on top square; #1'-#4' on bottom square mirrored by `x + y' = 5`; #5/#5' at apexes")
- **Current framing in tranche:** Tranche 08 does NOT explicitly enforce DR-IG-6 corrected geometry in its rows; preamble row 08-PRE-3 lists DR-IG-6 as PROPOSED.
- **Canon framing (if not ALIGNED):** Per the corrected geometry: the dipyramid has **6 vertices** at the geometric level (4 equatorial + 2 apex) but maps the **full 6+6 = 12 QL positions** (P5/P5' as the two apex poles, P1-4 + P1'-4' on the octagonal base, P0/P0' as the **central axis-point** projected to both poles — NOT a vertex). The psychoid-engine spec §7.1 still describes the dipyramid as 6 vertices with #0/#0' "at centre" — this is geometrically consistent with DR-IG-6 (P0/P0' is the central axis-point, not a vertex) but the psychoid §7.1 language predates the explicit DR-IG-6 ratification. NAMED-CONFLICT with M4-ARCHITECTURE §5.3.1 which still writes "Square-base dipyramid — 6 vertices (4 equatorial + 2 polar) ... #0/#0' at centre (white/black ground); #1-#4 on top square; #1'-#4' on bottom square" — this looks like 4+4+2=10 positional anchors but is missing the explicit 4 inverted-base positions distinct from the top-square. Sweep required.
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add Tranche 08.7 — "Dipyramid renderer enforces DR-IG-6 corrected 6+6 geometry": the psychoid renderer at M4-5' (per `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:376-381` §5.1 personal-scale Hopf-linked-tori) MUST render P5/P5' as apex poles, P1-4 + P1'-4' on the octagonal base (octagonal, NOT square — eight vertices interleaving base + inverted-base), P0/P0' as central axis-point projected to both poles. Cite DR-IG-6. Sweep psychoid-cymatic-field-engine §7.1 + M4-ARCHITECTURE §5.3.1 to match.

### 08-IMPL-3 — Personal-scale Hopf-linked tori (psychoid field) ride on the dipyramid scaffold, NOT the K² cosmic torus
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:376-381` (§5.1 "A psychoid torus distinct from M1's K² — at the *personal scale*, a smaller-radius torus with Hopf-linked secondary torus"); `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md:593-595` (§7.7 "M4-5' renders the Hopf-linked tori at the PERSONAL scale (heart-bounded), not the cosmic K²"); `13-decision-register.md:370-374` (DR-IG-6 corrected geometry: "Hopf-linked tori ride on this scaffold at the personal scale")
- **Current framing in tranche:** Tranche 08 does not explicitly cite this; INTEGRATED §5.1 covers it.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Aligned via canon document references; no tranche-level change needed.

### 08-IMPL-4 — `last_canon_recognition_event` field surfaces M5 → M0 Möbius write-back per INTEGRATED §2.5 and §4.2
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:156-164` (§2.5 substrate map for Möbius write-back including `last_canon_recognition_event` field; payload key `last_canon_recognition_event` rendered in M5 side pane via `data-test="m5-canon"`); `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:240-254` (§4.2 `JivaSivaFieldName` enum includes `last_canon_recognition_event` as required public-safe payload field)
- **Current framing in tranche:** Not explicitly cited in tranche; canon doc covers.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Canon doc enumeration is sufficient.

### 08-IMPL-5 — PsychoidFieldProjection includes `cymatic_signature[64]` (8 audio_octet × 8 standing-wave modes)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:268-298` (§4.3.1 `PsychoidFieldProjection` proposed addition with `cymatic_signature: [f32; 64]`, "64 floats of energy spectrum across the 8 audio_octet bands × 8 standing-wave modes"); `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md:188-210` (§5 cymatic substrate driven by chakra frequencies + medium tuning from q_personal + coherence from |Q_identity · Q_transit|)
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Anti-greenfield: signature computed in substrate (`personal_identity.rs` extension per Wave-A 5.5); bus surfaces the signature, not the field body. DR-M4-3 invariant honoured.

### 08-IMPL-6 — Pi/Anima/Aletheia conversation lives in OmniPanel, NOT 4-5-0 plugin editor area
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:558-575` (§7.2 OmniPanel hosts Pi Chat / Sessions / Dispatch Trace / Tool Stream / Evidence / Review / Gateway / Diagnostics; 4-5-0 plugin hosts personal stratum composition surface in editor area; no overlap); `13-decision-register.md:198-212` (DR-M5-1: Pi is harness, Anima is dispatcher, six Aletheia subagent techne-guardians dispatched within Aletheia-mode, NOT peer agents); `13-decision-register.md:628-636` (DR-TS-4 DOWNGRADED: OmniPanel job is agentic dispatch; no new tabs added)
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Multi-DR consistency confirmed.

## Drift patterns observed

The dominant drift in Tranche 08 is **stale DR status** — the tranche's preamble carries forward 2026-06-02 PROPOSED-status framing for DR-IG-6 and DR-M4-3 (both VALIDATED on 2026-06-03), and conditional language for DR-TS-1 and DR-M4-2 clause 5 (both VALIDATED on 2026-06-02). This is not "framing drift" in the canon-contradiction sense — the rows align directionally with the ratified resolutions — but the tranche text predates the validation cascade and reads as if the question were still open.

The second pattern is **type-naming mismatch**: the preamble names "PsychoidFieldProjection + CanonRecognitionStream" as the profile-bus pair, but the INTEGRATED architecture and DR-M4-3 specify a richer composition (`PersonalPoleProjection` as the strict-invariant owner, containing psychoid-field handle + bioquaternion + resonance + pattern_packet_handle; plus `canon_recognition_stream` as a separate event-stream field whose element type is `CanonRecognitionEvent`, singular). Reusing the wrong type names risks the implementation losing the DR-M4-3 opacity invariant.

The third pattern is **register-collapse risk in 08.3**: the actor list "sophia/anima/pi/aletheia" is correct, but the row does not flag that "aletheia" here refers to the mode/carrier, not the six subagent techne-guardians (DR-S4-TECHNE + DR-B-3 distinction). Without that note, a reader could later add the six guardians to the gate's actor whitelist, contradicting DR-B-3's "they surface as Anima-dispatch sub-traces under Aletheia, not as first-class actors".

The fourth pattern — already a NEW-TRANCHE proposal — is the **missing dipyramid-geometry enforcement row**: the psychoid renderer is named as a deliverable but the corrected DR-IG-6 6+6 geometry (P5/P5' apex poles, P1-4 + P1'-4' base octagonal, P0/P0' central axis-point) is not pinned in any specific Tranche-08 row. The psychoid-engine source spec still uses "6 vertices" framing which is geometrically compatible but pedagogically liable to slide back into the rejected "6 vertices = 6 QL positions" reading.

Substrate-grounded findings (file:line citations into Body/S, Body/M, LOC counts) are robust throughout the canon architecture doc — no substrate drift detected, only conceptual-status drift.

## Tranche augmentation / removal / addition recommendations

- **ADD 08.7 — Dipyramid renderer enforces DR-IG-6 corrected 6+6 geometry.** The psychoid renderer at M4-5' MUST render the dipyramid as P5/P5' apex poles + P1-4 + P1'-4' interleaving on the octagonal base + P0/P0' as central axis-point projected to both poles (NOT as base-square vertices, NOT as a 6-position mapping). Sweep psychoid-cymatic-field-engine §7.1 and M4-ARCHITECTURE §5.3.1 to match. Cite `13-decision-register.md:364-383`.
- **ADD 08-PRE-note (out-of-scope clarification) — Library-pane placement is OWNED BY Tranches 06.1 / 06.4 / 15.3** per DR-M5-3 (left-sidebar activity-bar mode in `ide-deep`). 4-5-0 plugin consumes M5-0' only via summonable M5-5' Logos Atelier drawer and M0 backdrop. Cite `13-decision-register.md:438-448`.
- **AUGMENT 08-PRE-2** — Rewrite the profile-bus pair to "`PersonalPoleProjection` (per DR-M4-3, owner Tranche 10.M4) + `canon_recognition_stream: Vec<CanonRecognitionEvent>` (per INTEGRATED §4.3.2)". The current naming risks losing the DR-M4-3 strict-invariant. Cite `13-decision-register.md:424-434` + `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md:264-340`.
- **AUGMENT 08-PRE-3** — Mark DR-IG-6 as VALIDATED with CORRECTED GEOMETRY (full 6+6 P/P' mapping, P5/P5' apex + P1-4 + P1'-4' base + P0/P0' central axis-point), not PROPOSED.
- **AUGMENT 08.1** — Add explicit DR-M4-3 citation (`13-decision-register.md:424-434`) as the ratified authority for the strict invariant.
- **AUGMENT 08.3** — Note that "aletheia" in the actor list refers to the mode/carrier (DR-S4-TECHNE register), not the six subagent techne-guardians (which surface as Anima-dispatch sub-traces under the carrier per DR-B-3).
- **AUGMENT 08.5** — Reframe conditional "If DR-TS-1 ratifies..." to indicative "Per DR-TS-1 (VALIDATED)..."; cite `13-decision-register.md:276-285`.
- **AUGMENT 08.6** — Reframe "consumes the personal-cymatic 0/1 polarity decision from DR-M4-2" to "consumes ratified polarity (0=cosmic, 1=personal) per DR-M4-2 clause 5 (VALIDATED 2026-06-02)"; cite `13-decision-register.md:188`; cross-link Track 11.1 sweep instruction.
- **AUGMENT 08-PRE-5** — Cite PatternPacket ownership at M4-3' explicitly: `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md:140-156` + `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md:130, 710-715`.

No REMOVE rows. No NEW-TRANCHE proposal beyond 08.7. The tranche is fundamentally aligned with canon — the work is calibration, not rewrite.

## Open questions for user

- **NAMED-CONFLICT (low-priority pedagogical)** — The psychoid-cymatic-field-engine spec §7.1 (`m4-prime-psychoid-cymatic-field-engine.md:252-262`) and M4-ARCHITECTURE §5.3.1 (`M4-ARCHITECTURE.md:388-389`) both describe the dipyramid using legacy "6 vertices + 4 equatorial + 2 polar + #0/#0' at centre" language. This is geometrically consistent with DR-IG-6 (P0/P0' as central axis-point, not a vertex) but reads as a 6-position mapping where DR-IG-6 wants a 12-position (6+6) mapping made explicit. Question: should the user authorise a doc-patch sweep of these two passages to use the explicit DR-IG-6 "2 apex poles + 4 base + 4 inverted-base + 1 central axis-point" enumeration? CCT-3 (cited at the DR-IG-6 verification line `13-decision-register.md:382`) appears to be the sweep vehicle; confirm scope covers psychoid §7.1 and M4-ARCHITECTURE §5.3.1.
