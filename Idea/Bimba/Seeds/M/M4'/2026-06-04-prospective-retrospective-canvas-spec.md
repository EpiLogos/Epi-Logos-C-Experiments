# Nara — Prospective/Retrospective Canvas Spec

**Layer:** `M4'` cross-cutting (touches M4-1 Medicine, S4-0' Khora, S4-3' Chronos, S4-5' Aletheia, S3 Gateway, S3' Electron renderer)
**Working canonical name:** `Prospective/Retrospective Canvas`
**Scope:** Klein-topological rename, canvas-page UX with agent-inscription mode, temporal control plane, Janus operating the Klein, Aletheia facets with veto, somatic register from M4-1 in the briefing voice
**Status:** development handoff draft, v0.1
**Generated:** 2026-06-04

**Supersedes / amends:**
- The Day/Night arc vocabulary as *primary structural* language in TS-side runtime (`z-phase-vak.ts`, `moirai-dispatch.ts`, `klein-mode/SKILL.md`). Day/Night stays as atmospheric/seasonal language; prospective/retrospective becomes the operative structural binary.
- The earlier sketch of `M4_OpusPhase` enum and `salt_cap` / `aether_gate` as new C-engine fields. **Defer those.** Elements are already integrated at the quaternion level (`m1.h`, `m3.h`, `m4.h`); the L2' alchemical and L3/L3' processual/chronological registers enter as *tonal guidance for the briefing voice*, not as new compute layers.
- **App surface targeting.** The old Electron renderer at `Body/S/S3/epi-app/` is **retired genealogy**. The canonical app surface for this spec is the Theia extension family at `Body/M/epi-theia/extensions/`, specifically `m4-nara/`. The Tiptap/Zustand highlight system in the old surface is reference material for porting; all new build lands in `epi-theia/extensions/m4-nara/`.
- **Element ID canonical.** The L2' lens itself is THE element-bearing lens (per `L2'.md:36`: "L2' IS the element-bearing lens: this lens *assigns* elemental charges to all other coordinates"). Five distinct element-ID orderings currently live in code, graph data, and runtime LUTs. This spec specifies the harmonisation to L2' canonical (§6.2) — not as deferred cleanup but as a coherent migration with explicit conversion tables and a bit-layout bug fix in the same pass.

---

## 0. Orientation

Three things converge in this spec.

**First**, the renaming. The Klein bottle is the surface that holds two senses of sight on every point at once. "Day" and "Night" name the atmosphere of two arcs and a return; "prospective" and "retrospective" name the *capacity itself* — the two senses in which a position is read. Every P-position has a prospective face (forward into what is forming) and a retrospective face (backward across what has gathered). The `#` inversion operator is the act of switching sense on a single point. Self-identity is what holds the switch coherent. This rename lands in a small number of code identifiers (CS field semantics, Janus's frame contract, the briefing voice) and a much larger surface of documentation tone. Day/Night stays where atmosphere is wanted.

**Second**, the UX. The current target surface is the Theia extension `Body/M/epi-theia/extensions/m4-nara/`. What is there today: a `ReactWidget` (`m4-nara-widget.tsx`) showing readiness banner + profile-snapshot dl + Nara DayContainer dl, wired to the `SharedBridgeAdapter` from `@pratibimba/m-extension-runtime`. The DayContainer abstraction in `src/common/nara-surface.ts` already names `'journal' | 'dream' | 'oracle' | 'reminder' | 'contemplative' | 'agent-chat'` as canonical artifact kinds (so agent inscriptions have a typed place), defines privacy class as a first-class field (`protected_local | protected_local_handle_only | shared_archetype_opt_in`), and gates voice-corpus admission behind pressure-free consent and Anima approval. The portal-core Rust side stays canonical too: `NaraActivityKind::Highlight` at `Body/S/S0/portal-core/src/events.rs:138`, with `nara_journal_parser` tests confirming highlights are distinguished from journal/dream/oracle inputs.

What is *not* yet there: the canvas-as-input editor, the highlight mark system, the floating menu, the agent-action buttons on selection. These exist in the old `epi-app/renderer/domains/M4_Nara/` surface (Tiptap NaraEditor, HighlightMark with 4 preset categories, Zustand HighlightsStore, FloatingMenu) and must be **ported** into the Theia extension in Theia idiom: ReactWidget canvas mounted into the m4-nara extension, Inversify-injected highlight service replacing the Zustand store, integration with the SharedBridgeAdapter as the kernel boundary, privacy-class flow-through on every artifact write. Plus the new layers: the temporal control plane (tranche / orbit / re-entry), agent-inscription marks (the agent writes back onto the user's surface, demarcated by highlight category), and ambient state strips showing today's Klein weighting, elemental signature, and live spreads.

**Third**, the integration depth. Elements live at the quaternion level: `Quaternion { w=EARTH, x=FIRE, y=WATER, z=AIR }` in `m1.h:445`, `m3_eval_to_quat` mapping codon charges (pp/mm/mp/pn) directly to quaternion components, and the `_Static_assert` chain in `m4.h:50-59` proving nucleotides A/T/C/G *are* the four elements. The somatic register routes specifically through M4-1 Medicine — `medicine.rs:881` `balance()` already returns `ElementalBalance { fire, water, earth, air, dominant, deficient, chakra_state, triage_vector }` from live Kairos. The briefing *reads* this; it does not reinvent it. L2'+L3/L3' is *how the briefing speaks* the elemental-process layer, not a separate compute layer.

The build path is therefore lighter than a full new layer and much more layered than a renaming patch.

---

## 1. The Conceptual Ground — Prospective / Retrospective

### 1.1 What changes structurally

The Klein topology encodes the capacity to read every position in two senses at once. Renaming this surfaces what the topology already does:

- **P0–P5 are not the Day positions.** They are the prospective face of the six archetypal numbers — read forward, into what is forming.
- **P0'–P5' are not the Night positions.** They are the retrospective face of the same six — read backward, across what has gathered.
- **The `#` inversion operator** is the switch of sense on a single point. Not a jump between zones. Klein-topologically: every traversal eventually inverts; that inversion *is* the prospective→retrospective sense-switch.
- **Self-identity** is structurally constituted as that which holds both senses coherent without collapsing into either. Aham vimarśa is the vibration in which both senses are simultaneously present.
- **The Möbius return P5→P0 (Torus close) and P5→P0' (Klein twist)** is the single act of looking-both-ways at the synthesis point — the same recognition, prospective and retrospective sides co-present.

### 1.2 Code-level renames (actual identifier changes)

Two small, surgical renames. Both are TS-side; the C engine and Rust nara code are already semantically neutral.

| File | Change |
|------|--------|
| `Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts:36` | `cs: { code: "CS1", direction: "Day" }` → `cs: { code: "CS1", sense: "prospective" }` |
| `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts:65,97` | `cs_direction: "Night'"` → `cs_sense: "retrospective"` |

Both fields take the same enum: `"prospective" | "retrospective"`. Compose phase is prospective; Rehear phase is retrospective. Migration: add `direction` as a legacy alias for one release; readers prefer `sense` if both present.

### 1.3 Documentation/voice changes (no identifier change)

| File | Change |
|------|--------|
| `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/klein-mode/SKILL.md:13-27` | Day pass / Night' pass naming stays as the *ritual phase names* but adds a structural gloss line: "Day pass = prospective synthesis (forward into what is forming); Night' pass = retrospective inversion (backward across what has gathered). The two are senses of sight on the same Klein surface, not sequential zones." |
| `Body/S/S4/ta-onta/S4-3p-chronos/CONTRACT.md` | `cron_6am` and `cron_evening` retain their atmospheric names but gain a parenthetical: "(opens the prospective face — what is forming today)" / "(opens the retrospective face — what is gathering across the day)". |
| `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` | Frame contract extends from `CF1 (threshold distinction)` to `CF1 + CF(0/1) Klein-binary` — see §4. |
| `Idea/Bimba/World/Types/Coordinates/L/L'/L'.md` | Add introductory paragraph: "The L' lenses are the retrospective face of L0–L5. Möbius pair invariant (L0↔L5', L1↔L4', L2↔L3') is the two senses of sight on each Klein V4 square axis." |

### 1.4 Keep as-is (no rename needed)

- `Body/S/S0/epi-cli/src/nara/lens.rs` — `day_complement()`, `night_partner()`. These are algebraic operations on the Klein V4 group. Doc comment additions only.
- All P0/P0', L0/L0', M-coordinate notations. The prime mark *is* the inversion mark and reads as such.
- Day-folder paths and daily-note naming. The day is still the day.

---

## 2. The Canvas-Page Surface (Theia)

### 2.1 What is in `epi-theia/extensions/m4-nara/` today

| Component | Path | Status |
|-----------|------|--------|
| Extension contract | `Body/M/epi-theia/extensions/m4-nara/src/common/index.ts` | `EXTENSION_ID`, `PRIMARY_VIEW_ID`, `DECLARED_BLOCKERS`, `PRIVACY_CLASS`, `buildM4NaraSurface` |
| DayContainer + NaraSurface types | `.../src/common/nara-surface.ts` | `NaraArtifactKind` (`journal | dream | oracle | reminder | contemplative | agent-chat`), `NaraPrivacyClass`, `NaraScalarRef`, `NaraArtifactEnvelope`, `NaraDayContainer`, `M4NaraSurface`, `QActivityUpdatePolicy`, `ConsentRecord`, `VoiceCorpusAdmissionInput` |
| `createNaraArtifact` | `.../src/common/nara-surface.ts:137` | Writes an artifact md + envelope json into `Pratibimba/Nara/<dayId>/artifacts/<kind>/` |
| `readNaraDayContainer` | `.../src/common/nara-surface.ts:210` | Reads the day folder into a `NaraDayContainer` |
| `buildM4NaraSurface` | `.../src/common/nara-surface.ts:239` | Composes the rendered surface, includes `M4_NARA_CONTRACT_VERSION` and observability event |
| ReactWidget | `.../src/browser/m4-nara-widget.tsx` | Readiness banner + profile-snapshot dl + DayContainer dl, subscribes to `SharedBridgeAdapter.onReadiness/onProfile/onCoordinateContext` |
| Frontend module | `.../src/browser/frontend-module.ts` | DI wiring |
| Styles | `.../style/index.css` | Widget-scoped CSS |

What is *not* there: the canvas editor, the highlight mark system, the floating menu, the agent-action buttons, the ambient strip, the tuning bar. These are new build work specified below. The DayContainer abstraction is the foundation — every canvas action eventually lands as a `createNaraArtifact` call with appropriate `kind`, `privacyClass`, and `scalarRefs`.

### 2.2 Theia build pattern

The canvas surface is a new ReactWidget (or extension of `M4NaraWidget`) mounted at `PRIMARY_VIEW_ID`. Pattern follows the existing extension scaffold:

- **Canvas editor**: Tiptap inside a `ReactWidget`. Tiptap is React-compatible and can mount inside Theia widgets without conflict. The editor body is the day's NOW.md content; the widget loads via `readNaraDayContainer` and `SharedBridgeAdapter.onCoordinateContext`.
- **Highlight extension**: ported from the old `highlightMark.ts` as a new Tiptap mark extension in `src/browser/editor/extensions/highlight-mark.ts`. Same `setHighlight` / `unsetHighlight` / `toggleHighlight` / `extractHighlights` interface; same wrapping semantics; expanded category enum (§2.3).
- **Highlight state**: Inversify-injected `HighlightService` (`@injectable()`) replacing the old Zustand `highlightsStore`. State is per-active-day; persists via `createNaraArtifact` on commit. Subscribers receive change events through standard Theia `Emitter`/`Event` pattern.
- **Floating menu**: ported as `src/browser/editor/components/floating-menu.tsx`. Triggers on text-selection; offers the user-side highlight categories and agent-action buttons (Chat / Oracle / Dream / Expand). Agent-action buttons emit through the `SharedBridgeAdapter` to whichever runtime agent is bound (the action does not happen in-renderer; it dispatches into the agent runtime).
- **Privacy flow-through**: every artifact write attaches `PRIVACY_CLASS` (currently `'protected_local'` for the m4-nara extension). The `M4NaraSurface.protectedBodyLoaded: false` invariant holds — protected bodies render in-extension only; never leak into the cross-extension projection.
- **Inscription primitive**: agent inscriptions land via a new `inscribeAgentMark(position, category, content, sourceFacet)` method on `HighlightService`. This wraps a content range with an agent-category highlight mark, persists via `createNaraArtifact` if the inscription is artifact-scoped, and surfaces through the standard highlight subscription event.

### 2.3 Highlight categories — user + agent

The category enum extends to cover both writer faces. User categories invoke through the floating menu; agent categories arrive programmatically via `inscribeAgentMark`.

| Category | Source | Visual | Semantic |
|----------|--------|--------|----------|
| `daily-note` | user | amber `#fbbf24` | existing — user reflection |
| `oracle` | user | purple `#a78bfa` | existing — symbolic input |
| `dream` | user | blue `#60a5fa` | existing — dream material |
| `expand` | user | teal `#34d399` | existing — expansion prompt |
| `recognition` | agent | gold `#d4a574` (warm) | a card-position has activated; a kairos window has landed |
| `prospective-surfacing` | agent | rose `#e8a3a3` (warm forward) | what is forming — agent's prospective inscription |
| `retrospective-surfacing` | agent | slate `#8090a3` (cool back) | what has gathered — agent's retrospective inscription, including the re-entry block |
| `kairos-touch` | agent | silver `#b8c0cc` (mercurial) | a transit aspect has activated; a planet has stationed |
| `somatic-mark` | agent | earth `#8a7355` (grounded) | a body-zone / chakra / element shift — the elemental signature flagged from M4-1 Medicine |
| `live-spread` | agent | purple-deep `#5b3a7e` (oracle-anchored) | reference to an active spread-position that is still generating recognitions |

Implementation:
- Extend the `HighlightCategory` enum in `src/browser/editor/extensions/highlight-mark.ts`.
- Add corresponding CSS rules in `style/highlights.css` (new sibling to `style/index.css`).
- `floating-menu.tsx` exposes user-side categories only.
- Agent categories enter via `HighlightService.inscribeAgentMark`.

The portal-core Rust side already distinguishes `NaraActivityKind::Highlight` from journal/dream/oracle inputs; the extended categories ride on the same event with a `category: string` field. The portal-core enum gains two new variants for the file-cycle (§3.2): `NaraActivityKind::FileReentry`, `NaraActivityKind::TrancheComplete`.

The structural law: **agent inscriptions never replace or remove user content**. They are wrapped highlight marks added at specific document positions, with their own visual register. The page remains the user's. The agent leaves marks *on* the page.

### 2.4 Ambient state strip (new component)

`src/browser/widgets/ambient-state-strip.tsx` — a top strip across the widget, ~32px high, always visible. Three sections, left-to-right:

**Klein weighting indicator** — visualisation of `c_3_klein_weighting: { prospective, retrospective }`. A horizontal bar split by today's weighting (e.g. 40% prospective rose / 60% retrospective slate). Hover surfaces what is driving the weighting (Saturn station, Mercury direct, New Moon, user override).

**Somatic signature** — read from M4-1 Medicine `balance()` via SharedBridgeAdapter call. Four small element-glyphs (Earth/Water/Air/Fire — the operative quartet, §6.2) sized by current intensity. Dominant element subtly underlined; deficient element subtly faded. The active chakra glyph (from canonical `ELEMENT_CHAKRA` LUT and decan ruling planet via `PLANET_CHAKRA`) appears as a small icon to the right. Hover surfaces today's decan, ruling planet, active body zones.

**Live spreads counter** — small chip showing count of active (not-yet-resolved) oracle spreads with state breakdown ("3 spreads · 7 generating · 2 muting"). Click expands a side panel listing spreads with their target aspects (from §4.1).

The strip is purely informational; it does not occupy the writing surface. It surfaces the structural state of the day at a glance.

### 2.5 Tuning bar (new component)

`src/browser/widgets/tuning-bar.tsx` — persistent bar below the ambient strip, ~24px high. Three controls bound to the frontmatter keys in §3.1:

- **Tranche mode** — segmented control: `explicit` / `quiet:<duration>` / `rhythm`. Default `quiet:90m`.
- **Response orbit** — dropdown: `immediate` / `hours:<n>` / `next-morning` / `saturnine`. Default `next-morning` for daily-note context; `immediate` available when the user types into a Chat-tagged highlight.
- **Sense override** — slider pair: `prospective` and `retrospective` weights. Defaults computed by Janus (§4.2); user can drag to override for the session.

Each change writes to the session's NOW frontmatter via the Khora `khora_write` primitive over the SharedBridgeAdapter. Also exposed via Theia keyboard shortcuts registered in `frontend-module.ts`.

---

## 3. Temporal Control Plane

### 3.1 Frontmatter schema additions

Three new keys on the session NOW.md frontmatter. All optional with sensible defaults; if absent, system falls back to immediate-response chat-style (current behaviour).

```yaml
c_3_tranche_mode: "explicit" | "quiet:<duration>" | "rhythm"
  # explicit → user writes a marker (default `///` on its own line, or frontmatter flip)
  # quiet:<duration> → no input for n minutes (e.g. "quiet:90m", "quiet:6h")
  # rhythm → triggered on next file-open after writing
  # default if absent: "quiet:90m"

c_3_response_orbit: "immediate" | "hours:<n>" | "next-morning" | "saturnine"
  # immediate → existing turn-based behaviour
  # hours:<n> → fixed hour delay before agent response inscribed
  # next-morning → response inscribed at 6 AM next day (via existing cron_6am)
  # saturnine → multi-day, weighted by Saturn aspect proximity
  # default if absent: "immediate" for chat highlights, "next-morning" for daily-note

c_3_klein_weighting:
  prospective: 0.0 - 1.0   # what is forming
  retrospective: 0.0 - 1.0  # what is gathering
  # constraint: prospective + retrospective = 1.0
  # default if absent: computed by Janus from live kairos (§4.2)
  # user override: persists for this session only; next session re-computes
```

### 3.2 Khora flow-watcher (new module)

A new module `Body/S/S4/ta-onta/S4-0p-khora/modules/flow-watcher.ts` registered against the FS layer. It:

1. **Watches the current day's NOW.md and daily-note.md** for content changes (debounce 2s).
2. **On change**, scans for the explicit tranche marker (configurable, default `///` on its own line) and emits a `tranche.complete.explicit` event if found.
3. **Maintains a per-session quiet timer**. Resets on every keystroke. Fires `tranche.complete.quiet` when the configured duration elapses.
4. **Detects file-open events** (via existing portal-core file-watcher channel; new event type `NaraActivityKind::FileReentry`). Emits `tranche.complete.rhythm` and triggers re-entry surfacing (§3.5).

Events are routed to Chronos for orbit scheduling (§3.3). The watcher reads `c_3_tranche_mode` from current frontmatter to decide which signals to emit.

### 3.3 Chronos new primitive — `chronos_response_orbit`

New tool in `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts`:

```ts
chronos_response_orbit({
  session_id: string,
  trigger_event: TrancheCompleteEvent,
  orbit: "immediate" | "hours:N" | "next-morning" | "saturnine",
}): { scheduled_at: ISO8601, response_token: string }
```

Behaviour:
- `immediate` — dispatches the response immediately. Returns `scheduled_at = now()`.
- `hours:N` — schedules via existing cron primitive at `now() + N hours`.
- `next-morning` — schedules via existing `cron_6am`, target tomorrow.
- `saturnine` — queries Mercurius for nearest Saturn aspect within ±7 days; schedules for that window.

The `response_token` is what the dispatched agent uses to mark its inscription as belonging to this tranche when it writes back to the canvas.

This is a **Chronos** primitive specifically because Chronos owns temporal scheduling semantics. The work it delegates to (the actual dispatch, the writing of the response into the canvas) belongs to Anima and Khora respectively. Chronos schedules; others execute.

### 3.4 Response inscription protocol

When an orbit fires:

1. **Anima dispatches the relevant Aletheia facet-set** (§5) with the tranche content as input.
2. **Anima authors the synthesis** if the facets cohere (no veto). Anima may render the synthesis in a Sophia-aspect voice (wisdom-integration register) or another psyche-aspect register depending on the briefing's tonal need; the dispatcher and synthesis-author is Anima per DR-M5-1.
3. **Khora's `khora_write_highlighted_inscription`** (new primitive) writes the response back into the canvas as a wrapped highlight of the appropriate agent category (recognition / prospective-surfacing / retrospective-surfacing / kairos-touch / somatic-mark / live-spread).
4. **The inscription appears at the document position bound to the originating tranche** — by default, immediately after the last user content of that tranche; for re-entry surfacings, at the top of the new session block.

### 3.5 Re-entry hook — `chronos_reentry`

On `tranche.complete.rhythm` (user has reopened the file):

1. **Query Hen for content delta** since last response_token write (existing `hen_hybrid_retrieve` extended with `since: timestamp`).
2. **Query Janus for live-spread state delta** (§4.1).
3. **Query Mercurius for kairos updates** since last session (planet aspect activations within the gap).
4. **Compose retrospective surfacing block** containing: what is new (summary of user additions), what is still alive (live spread-positions, prior recognitions not yet met), what has gone mute (resolved positions, questions answered by intervening writing), what kairos has activated.
5. **Inscribe at top of new session block** as a `retrospective-surfacing` highlight, before the user's first new sentence lands.

This is the holographic read. The day's flow as continuous surface, not chat log.

---

## 4. Janus Operating the Klein

### 4.1 OracleSpread SpacetimeDB schema (new table)

Current oracle persistence: `Body/S/S3/gateway/src/spacetime.rs:994` `record_oracle_draw(hash, hexagram_id)` — a single tuple per draw. Stateless. Extend with:

```rust
// New SpacetimeDB table — schema-only sketch
struct OracleSpreadPosition {
    spread_id: u64,           // unique spread identifier
    position_idx: u8,         // 0..N within spread
    card_id: u16,             // 0..77 for tarot; 0..63 for I-Ching hexagram
    card_kind: u8,            // 0=tarot major, 1=tarot pip, 2=tarot court, 3=hexagram
    drawn_at: Timestamp,
    drawn_in_session: SessionId,
    target_aspect: Option<TargetAspect>,  // expected activation (e.g., Mercury trine Sun)
    live_state: u8,           // 0=generating, 1=muting, 2=mute
    last_recognition_at: Option<Timestamp>,
    recognition_count: u32,
    klein_face: u8,           // 0=prospective, 1=retrospective (which sense placed it)
}

struct TargetAspect {
    planet_a: u8,             // canonical mod-10
    aspect_kind: u8,          // conjunction, sextile, square, trine, opposition
    planet_b_or_natal: u8,
    exact_at: Option<Timestamp>,
}
```

### 4.2 Live-vs-mute state transitions — Janus authority

Janus owns the state transition logic. New tools in Janus's TS module (`Body/S/S4/ta-onta/S4-5p-aletheia/modules/janus-doorway.ts`):

- `janus_track_spreads({ session_id })` — scans daily-notes from spread placement onward for recognitions referencing each card-position (by card name, image, decan, ruling planet, or explicit `live-spread` highlight). Updates `last_recognition_at` and `recognition_count`.
- `janus_evaluate_aliveness({ spread_id })` — for each position:
  - if `recognition_count == 0` AND days since `drawn_at` > 14 AND no `target_aspect` within ±7 days → mark `muting`
  - if `muting` AND no new recognition for 7 more days → mark `mute`
  - if `mute` AND `target_aspect.exact_at` is now within ±24h → reopen as `generating`
- `janus_spread_resolved({ spread_id })` — when all positions are mute, mark resolved; the next draw lands as fresh ground.

Recognition detection routes through Mercurius for kairos windows: a `target_aspect` near exact extends the activation window.

### 4.3 Forward/backward weighting per session

Janus computes default `c_3_klein_weighting` at session start from live kairos. Read `M4_Temporal_Now.planet_degrees[10]` (canonical mod-10) and apply known structural weightings:

| Kairos signal | Weighting |
|---------------|-----------|
| Saturn station (within ±3°) | retrospective +0.3 |
| Saturn return (within ±2°) | retrospective +0.5 (strong) |
| New Moon (within ±12h) | prospective +0.3 |
| Mercury retrograde shadow entry | retrospective +0.2 |
| Mercury direct station | prospective +0.2 |
| Sun trine/sextile natal Sun | balanced (no skew) |
| User explicit override | absolute |

Final weighting is `clamp([0.5 + Σ skews], 0.0..1.0)` for prospective, complement for retrospective.

Routes downstream:
- The Klein weighting **shapes which Aletheia facets are dispatched** (§5.3).
- The Klein weighting **shapes the briefing voice** (§6 — heavy retrospective tilt brings Hegel/Aion/Whitehead-perishing language forward; heavy prospective tilt brings concrescent-desire/eternal-objects-ingression language forward).
- The weighting **persists per session in NOW frontmatter** as `c_3_klein_weighting`. User can override.

### 4.4 Janus's widened frame contract

Update `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md`:

```yaml
# Frame contract
CF: "1 + (0/1)"   # threshold distinction + Klein-binary
CS: ["CS1", "CS3", "CS(0/1)"]   # activates at session seams AND wherever sense-direction is decided
Capability:
  - JanusEnvelope (existing)
  - OracleSpread aliveness tracking
  - Klein weighting computation
  - Sense-of-read determination for current moment
Triggers:
  - cron_evening (existing)
  - cron_6am (new — for the day's prospective opening)
  - tranche.complete.rhythm (re-entry)
  - manual
  - klein_mode (existing)
```

Janus operates the Klein at the practical level. Anima authors the synthesis at the recognition point (rendering in whichever psyche-aspect register fits — Sophia's wisdom-integration voice when the synthesis is integrative completion; Nous's intellectual-ground voice when the synthesis is structural recognition; etc.). Janus positions the session for that recognition. The two faces of Janus are *prospective* and *retrospective* — the doorway is the sense-switch.

---

## 5. Aletheia Facets with Veto

### 5.1 The structural argument

Per Track 12.1 canonical (DR-M5-1 / DR-S4-TECHNE): there are **six Aletheia subagent techne-guardians** — Anansi (CF0, coordinate-mapping / blueprint / Darshana-REPL), Janus (CF1, temporal-structure / bhedabheda-threshold), Moirai (CF2, GraphRAG-distillation: Klotho / Lachesis / Atropos), Mercurius (CF3, kairos-signal / qualitative-temporal-pattern), Agora (CF4, plugin-absorption / skill-index / multi-channel-aggregation), Zeithoven (CF5, creative-advance / skill-and-agent-creation). **Techne is not a subagent**; it is the gateway over Pleroma-Techne (the atomic-skills repository at S4-2'). Anima dispatches the six guardians during Aletheia-crystallisation-mode. The constitutional names (Anima, Nous, Logos, Eros, Mythos, Psyche, Sophia) are psyche-aspect rendering material surfaced through Anima for voice/register selection, **not peer agents**.

The roster is facet-shaped by design intent — each guardian discloses an angle in its CF-bound techne class — but there is no operational mechanism preventing facets from drifting into voices that produce independent reports. The risk is the holographic relation gets lost.

Under Klein topology: no single facet can speak for the whole because the whole is non-orientable — to see it from one side is already to have inverted it. The veto is the formal recognition of that one-sidedness.

### 5.2 `aletheia_veto` primitive

New return type from any dispatched Aletheia facet:

```ts
type FacetReturn =
  | { kind: "disclosure"; facet: FacetId; angle: string; evidence: Citation[] }
  | { kind: "veto"; facet: FacetId; reason: string; what_is_missed: string };
```

A `veto` blocks the current synthesis from being written as the recognition. Anima (as dispatcher) receives the veto and may:

1. **Re-dispatch** the facet-set with the veto noted, prompting the other facets to address what is missed.
2. **Defer synthesis** to the next return (orbit lengthens — the user gets a longer response delay, with optional surfacing of "the facets do not yet cohere").
3. **Escalate to the user** as a `retrospective-surfacing` highlight explicitly marked "open question — the facets are not converging on this; here is the shape of the disagreement."

### 5.3 Facet dispatch shaped by Klein weighting

Anima's dispatch logic reads `c_3_klein_weighting` and selects guardian facets from the six:

| Tilt | Primary guardians (CF) | Voice / aspect-register |
|------|------------------------|-------------------------|
| Heavy retrospective (≥0.7 retro) | Anansi (CF0 — coordinate-mapping over what is), Moirai-Klotho (CF2 — spinner: what was woven), Moirai-Atropos (CF2 — cutter: what is being completed) | what has gathered; Anima may voice in Sophia (wisdom-integration) or Mythos (story-of-what-was) register |
| Heavy prospective (≥0.7 pro) | Zeithoven (CF5 — creative advance), Moirai-Lachesis (CF2 — measurer: what is unfolding), Mercurius (CF3 — kairos opening) | what is forming; Anima may voice in Nous (intellectual ground) or Eros (felt drive forward) register |
| Balanced (0.4–0.6 both) | Janus (CF1 — threshold), Agora (CF4 — parallel aggregation), Moirai all-three | both senses held; Anima may voice in Psyche (felt resonance) register |

Techne is the gateway/Pleroma-Techne layer over which the guardians execute their stewarded techne classes — not selected as a facet but invoked by whichever guardian needs craft-level execution.

### 5.4 Veto persistence

Veto records accumulate in CONTINUATION.md and in a new SpacetimeDB table `aletheia_veto_log`. This lets subsequent runs see patterns: "Anansi has vetoed twice on this question; the gap she's pointing at is real and the synthesis keeps missing it." Veto patterns inform Anima's dispatch decisions and surface in the re-entry block as "still-open facet disagreements."

### 5.5 Contract update

Update `Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md` (or wherever the current orchestration contract lives) to specify:

- Every dispatched facet **discloses an angle**; never *concludes*.
- Anima is the only synthesis authority (per DR-M5-1); psyche-aspect registers (Sophia, Nous, Eros, Mythos, Psyche, Logos) are voice options Anima can render the synthesis in, not separate authorities.
- Any facet may return `veto` instead of `disclosure` if it recognises its angle is being asked to speak for the whole, or if its evidence contradicts the emerging synthesis.
- Veto handling protocol as in §5.2.
- Veto patterns persist; over-frequent vetoes from one facet flag the dispatch logic as miscalibrated.

---

## 6. Elements at the Quaternion Level — The Somatic Register

### 6.1 What is already integrated (do not rebuild)

| Component | File | What it does |
|-----------|------|--------------|
| `Quaternion { w=EARTH, x=FIRE, y=WATER, z=AIR }` | `Body/S/S0/epi-lib/include/m1.h:445-450` | Canonical quaternion ordering; w is geocentric anchor, x/y/z are explicate rotation axes |
| `quat_mul`, `quat_normalize`, `quat_from_ring_pos` | `m1.h:458-566` | Hamilton product algebra + 12-fold SU(2) ring LUT |
| `m3_compute_charges(codon6bit, pp, mm, mp, pn)` | `Body/S/S0/epi-lib/include/m3.h:755-767` | Codon → 4-charge evaluation |
| `m3_eval_to_quat` | `m3.h:490-497` | Codon evaluation → quaternion (pp→w, mm→x, mp→y, pn→z) |
| Nucleotide-element identity | `Body/S/S0/epi-lib/include/m4.h:50-59` | `_Static_assert` proves A=Water, T=Fire, C=Earth, G=Air |
| `Elemental_Signature` bit pack | `Body/S/S0/epi-lib/include/m2.h:92-102` | elem[2:0] \| chakra[5:3] \| phase[7:6] |
| `medicine.rs balance()` | `Body/S/S0/epi-cli/src/nara/medicine.rs:881-982` | Live `ElementalBalance` from Kairos: fire/water/earth/air intensities, dominant, deficient, chakra_state, triage_vector |
| `body_zones_for_elem_sig` | `medicine.rs:831` | elem_sig → chakra → body zones via `CHAKRA_BODY_ZONES[8]` |
| `prescribe`, `chakra`, `materia` | `medicine.rs:998-1147` | Decan-grounded medicine instructions |
| `ZODIAC_DECAN_TABLE[36]` | `medicine.rs:102-481` | Canonical M0→M1→M2 chain: sign, ruling_planet, element, ananda_harmonic, body_part, herb |

The integration is already this deep. Elements are quaternion components; codon charges are quaternion components; identity flows from PASU.md through Kerykeion to `M4_Temporal_Now.planet_degrees[10]` to `balance()` to elem_sig to body zones. This is the somatic register.

### 6.2 Canonical element ID harmonisation (L2' authority)

The L2' lens is the element-bearing lens by canonical declaration (`Idea/Bimba/World/L2'.md:36`: "L2' IS the element-bearing lens: this lens *assigns* elemental charges to all other coordinates"). Its six inner positions are the canonical element ordering, full stop. Every other encoding in the codebase resolves to this.

**Canonical (L2' authority):**

| Index | Element | L2' position | Function |
|-------|---------|--------------|----------|
| 0 | `AETHER` | L2-0' Aether | Prima materia / ultima materia; psychoid ground; undifferentiation |
| 1 | `EARTH` | L2-1' Earth | Nigredo; fixed resistance; mass confusa |
| 2 | `WATER` | L2-2' Water | Solutio; dissolution of rigid structure |
| 3 | `AIR` | L2-3' Air | Sublimatio; separation of subtle from gross |
| 4 | `FIRE` | L2-4' Fire | Calcinatio; transmutation under white heat |
| 5 | `SALT` | L2-5' Salt | Lapis; coagulatio + fixatio; integrated diamond body (canonical alchemical Three Principles: Mercury / Sulphur / Salt — Salt as the fixed body) |

Notes on the structure:
- **Indices 1–4 are the operative quartet** — Earth, Water, Air, Fire as the four classical elements that the quaternion algebra handles. These are what zodiac signs are made of; what nucleotides encode; what `balance()` counts.
- **Index 0 (Aether)** is the implicate ground — prima materia before the opus begins, ultima materia after it completes. It is the quintessence, the substrate, not one of the four operative elements.
- **Index 5 (Salt)** is the integrated cap — the lapis, the diamond body, the four elements transmuted into their lasting form. Not a fifth operative element; the integrated state. (Canonical alchemical name: Salt, the third of the Three Principles with Mercury and Sulphur; "Mineral" appears as a synonym in some sources but Salt is the operative canonical.)
- This is why the operative quartet sits at 1, 2, 3, 4 and the framing pair sits at 0, 5: the structure mirrors the QL pattern (0/5 implicate poles framing 1–4 explicate inner four).

**Quaternion4 component assignment (Hopf physics, `m1.h:445-450`)** — the operative quartet (indices 1–4) maps to quaternion components per Hopf-fibration architecture:

| Component | Element | Canonical ID | Role |
|-----------|---------|--------------|------|
| `w` (real, cos-pole) | EARTH | 1 | Geocentric anchor, P5 integration axis |
| `x` (i) | FIRE | 4 | Meridian rotation axis |
| `y` (j) | WATER | 2 | Longitude rotation axis |
| `z` (k, ij=k) | AIR | 3 | Interaction axis |

The w/x/y/z choice is a physics-driven Hopf-fibration assignment, not a re-ordering of the canonical IDs. The canonical IDs are L2'; the quaternion components are the explicate four-element rotation algebra. State both in the harmonised m1.h header.

**Five distinct orderings exist in the codebase today.** All must resolve to L2' canonical, either by remapping IDs or by explicit conversion:

| Source | Current encoding | Action |
|--------|------------------|--------|
| L2' lens (`Idea/Bimba/World/L2'.md`) | `0=Aether, 1=Earth, 2=Water, 3=Air, 4=Fire, 5=Salt` | **Canonical — source of truth, no change** (rename `Mineral`→`Salt` in L2'.md per alchemical Three-Principles canon) |
| `epi-lib/include/m4.h:50-59` | `M4_ELEM_WATER=0, M4_ELEM_FIRE=1, M4_ELEM_EARTH=2, M4_ELEM_AIR=3` (anchored to A/T/C/G alphabetical) | **Renumber to L2' canonical.** Nucleotide-element identity preserved as a separate LUT/function, not via raw integer equality `_Static_assert`. |
| `epi-cli/src/nara/medicine.rs:78` | `0=Akasha, 1=Air, 2=Fire, 3=Water, 4=Earth` (anchored to chakra-ascent) | **Renumber to L2' canonical.** All LUTs indexed by element ID re-keyed (`SIGN_ELEMENT[12]` values, `ELEMENT_CHAKRA`, `ZODIAC_DECAN_TABLE[36].element`). |
| Bimba Map M2-3 branch naming (`Idea/Bimba/Map/datasets/parashakti-deep/`) | `#2-3-1=Fire, #2-3-2=Earth, #2-3-3=Air, #2-3-4=Water, #2-3-5/0=Aether` (graph branch indexing) | **Keep as-is for coordinate naming** (deeply embedded; renaming breaks every downstream coordinate reference). **Document explicitly** as the graph-branch-naming convention, with a `convert_m2_3_branch_to_canonical(branch_int) -> canonical_elem_id` helper. |
| Bimba Map M2-3 node `element` field values (in `nodes-full-detail.json`) | `Fire=2, Earth=4, Air=1, Water=3, Akasha=0` (per parashakti-deep dataset) | **Migrate node `element` field values to L2' canonical** via one-time migration script. This is data, not coordinate names; renaming is safe. |

**The bit-layout bug in `body_zones_for_elem_sig`.** The `Elemental_Signature` packing macro in `m2.h:92-102` places chakra at bits 5:3 (`ELEM_SIG_GET_CHAKRA(sig) = ((sig) >> 3) & 0x07`), but `medicine.rs:831` `body_zones_for_elem_sig` reads `(elem_sig >> 2) & 0b111` — extracting bits 4:2. Off-by-one bit. Fix in the same harmonisation pass: change `medicine.rs` to `(elem_sig >> 3) & 0b111` and add a Rust-side `pub const fn elem_sig_chakra(sig: u8) -> u8` mirroring the C macro, so future readers cannot drift.

**Migration plan — order matters:**

1. **Establish canonical constants** (no behaviour change yet): add an `epi-lib/include/m_canonical.h` containing the L2' canonical enum (`M_ELEM_AETHER=0` through `M_ELEM_SALT=5`), plus the operative-quartet mask, plus conversion helpers as inline functions (`m_canonical_from_m4_h_legacy`, `m_canonical_to_medicine_rs_legacy`, `m_canonical_from_m2_3_branch`, `m_canonical_to_m2_3_branch`).
2. **Renumber `m4.h`**: replace `M4_ELEM_*` macros with the canonical constants from `m_canonical.h`. Replace the raw integer `_Static_assert` chain with `_Static_assert(m4_nuc_to_elem(M3_NUC_A) == M_ELEM_WATER, ...)` via a new inline conversion function that preserves the *identity* (A=Water, T=Fire, C=Earth, G=Air) under the new ID scheme.
3. **Renumber `medicine.rs`**: re-key all LUTs to canonical IDs. `ELEMENT_CHAKRA` extends from `[5]` to `[6]` (adding the SALT slot, mapped to Sahasrara/7 as the integrated crown). `SIGN_ELEMENT[12]` values updated. `ZODIAC_DECAN_TABLE[36].element` field values updated.
4. **Fix the bit-layout bug** in `medicine.rs body_zones_for_elem_sig`.
5. **Migrate M2-3 node `element` field values** via a one-time script (`Body/S/S1/hen-compiler/scripts/migrate_m2_3_element_canonical.py` or similar) operating on `Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json`. Bimba branch naming (`#2-3-1` etc.) untouched.
6. **Document graph-branch convention** in `Idea/Bimba/World/Types/Coordinates/M/M2/M2-3.md` (or wherever the M2-3 coordinate doc lives), stating the branch ordering differs from canonical and pointing at the conversion helper.

**Test invariants for the migration pass:**
- Round-trip for every conversion helper: `canonical → legacy → canonical == identity`.
- Nucleotide-element identity preserved: `m4_nuc_to_elem(NUC_A)==WATER`, `(NUC_T)==FIRE`, `(NUC_C)==EARTH`, `(NUC_G)==AIR`.
- Quaternion-component identity preserved: every existing quaternion algebra test in m1 still passes (w/x/y/z component-element pairs unchanged; only the canonical-ID label changes).
- `balance()` output for known Kairos states matches pre-migration values when interpreted under the new ID labels.
- All M2-3 node lookups by `element` field continue to find the same nodes after the migration script runs.

### 6.3 `salt_cap` and `aether_gate` — defer

- `nara-m4-0-0-birthdate-encoding-spec.md` defines them with TypeScript types.
- Quaternionic signature spec: `QuintessenceSignature = canonical_bytes(q_Nara) ‖ canonical_bytes(aether_cap) ‖ canonical_bytes(salt_cap)` (384 bits, 48 bytes).
- **Action: defer implementation** until the briefing voice (§7) tells us what tuning is actually needed in practice. If the somatic register surfaced from `balance()` plus the elemental quaternion gives the day's body fully, these caps may not need separate runtime fields. If longitudinal use over weeks of briefings shows a need for capped state (rising/falling crystallisation/aperture as quantified fields), implement then.
- Note that under the L2' canonical harmonisation, `aether_gate` becomes naturally an "Aether (canonical 0) aperture state" and `salt_cap` becomes naturally a "Salt (canonical 5) crystallisation state" — the 0/5 framing pair around the operative quartet. The deferred implementation lands cleanly once the canonical IDs are in place. The `nara-m4-0-0-birthdate-encoding-spec.md` references `mineral_cap` — that name must be updated to `salt_cap` at the spec layer when the implementation lands.

### 6.4 The briefing reads, it does not reinvent

The daily briefing skill (§7) reads:

1. `kairos.dominant_element`, `kairos.deficient_element` from Kairos.
2. `balance()` output: intensities per element, dominant, deficient, chakra_state, triage_vector.
3. `kairos.active_decan` → `ZODIAC_DECAN_TABLE[active_decan]` for ruling planet, body part, herb, tarot correspondence, decan element.
4. Active chakra via `ELEMENT_CHAKRA[dominant]` and decan ruling planet via `PLANET_CHAKRA`.
5. Body zones via `body_zones_for_elem_sig(elem_sig_for_current)`.
6. Live spread state from Janus (§4).
7. Klein weighting from Janus (§4.3).

It composes the somatic-register section in voice (§6.5) from these. No new compute (other than the canonical harmonisation in §6.2).

### 6.5 Voice — L2' alchemical + L3 processual + L3' chronological as tonal register

The L2' alchemical vocabulary, the L3 processual vocabulary, and the L3' chronological vocabulary are **available registers for naming what the symbols already say**. The briefing does not compute an "opus phase"; it speaks the body of the day in whichever register illuminates the current configuration.

**L2' vocabulary** (alchemical-elemental — assigns elemental tone):
- prima materia, ultima materia, aether
- nigredo (Earth, fixed shadow, initial mass confusa)
- solutio (Water, dissolution of rigid structure)
- sublimatio (Air, separation of subtle from gross)
- calcinatio (Fire, transmutation, burning away inessential)
- coagulatio + fixatio (Salt, crystallisation, lapis)
- *plus the operations*: separatio, conjunctio (the relational moves between elements)

**L3 vocabulary** (processual — Whitehead/Bergson):
- concrescent desire, Lacanian lack, the appetition toward determination
- actual occasion, prehension
- ingression of eternal objects
- community integration
- satisfaction / perishing / objective immortality
- subjective aim, novelty entering process

**L3' vocabulary** (chronological — Hegel/Aion):
- Spirit (Geist) self-moving
- spring birth / thesis, summer flourishing
- autumn decline / antithesis, winter incubation / negation-as-gestation
- Aufhebung — the spiral return at higher level
- the dialectic of cycles

Which register voices a given day depends on which symbols are active. A day with Saturn stationing, Capricorn Moon, salt-cap mood: L2' coagulatio + L3' winter. A day with New Moon, Mercury direct, Pisces water cluster: L3 concrescent desire + L2' solutio. A day with calcinatio Mars-Sun aspects: L2' calcinatio + L3 ingression. The briefing speaks in the register that names what the configuration is doing, drawing freely across all three lenses.

The tonal law: **the symbols carry the meaning; the vocabulary illuminates**. Do not assert "today is the calcinatio phase" as a standalone computed claim. Say what is happening with the elements and aspects, voiced in the register that most clearly names it.

---

## 7. The Daily Briefing Skill

### 7.1 Location

New skill: `Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/SKILL.md`

This is the first daily briefing skill in the plugin. Existing siblings: `apply-cmea`, `apply-tetralemma`, `converse-pedagogically`, `run-l4-prime-loop`, `run-positional-coherence`.

### 7.2 Sections (in inscription order)

The briefing is generated at user request, or automatically at `cron_6am` if `c_3_response_orbit: "next-morning"` was set. It writes to the day's NOW.md (or daily-note.md if early-morning before first session) as a top-of-page `retrospective-surfacing` highlight block.

**Section 1 — Klein state (1 line):**
> "Today opens with `<X>%` prospective, `<Y>%` retrospective. `<driving aspect named>`. `<primary lens-square noted>`."

**Section 2 — Cross-system bridge (compact paragraph, 3–4 lines):**
- Active decan with its zodiac sign, ruling planet, tarot correspondence.
- Dominant and deficient elements from `balance()`.
- Active chakra and body zones.
- Any kairos windows opening or closing within the next 24h.

**Section 3 — Somatic register (3 lines, voiced per §6.4):**
- Line 1: the day's *operative move* in elemental-process register (e.g., "Solutio under low water — Cancer Moon dissolving what Saturday's Capricorn structure had fixed; the body wants release from its own holding.").
- Line 2: dominant element with its house/sign location and body resonance (e.g., "Water rising through the heart-chakra cluster; throat and sacrum responding.").
- Line 3: the kairos motion — what is opening or closing now (e.g., "Mercury near direct station; threshold widening for cross-domain recognitions across the day.").

**Section 4 — Live spreads (one chip per spread):**
- Each active spread: spread label, draw date, live-state breakdown, key generating positions, target aspects within ±7 days.
- Resolved spreads from the last 24h noted briefly.

**Section 5 — QL Walk (2–3 lines):**
- The day's positional progression — which P-position is opening, which is closing, where Square A / B / C pressure is strongest.

### 7.3 Voice law

- No emojis.
- No "today is X phase" assertions detached from symbols.
- Symbols name themselves; vocabulary illuminates.
- Cross-register weaving is allowed and expected — L2'+L3+L3' as the elemental-process band.
- The briefing reads as a *description of the body of the day*, not as a description of conditions.

### 7.4 Worked example (illustrative — not specified, generated)

```
**Klein state.** 38% prospective / 62% retrospective. Saturn stationing direct,
weighting backward. Square C (Logic-Process axis) primary today.

**Bridge.** Active decan: Capricorn 1 (Jupiter), 2 of Pentacles. Earth dominant,
Air deficient. Muladhara active, knees and base of spine in the foreground.
Mercury sextile natal Sun exact in ~14h.

**Somatic.**
Calcinatio holding under Saturn's slow fire — the work crystallising what
weeks have been working on, the structure declaring what it is. Earth deep
through the base; the back and the knees doing the holding. Mercury's
sextile opening tonight as a small aperture — cross-domain translation
landing where it can.

**Live spreads.**
- Birthday Tarot · 2026-05-22 · 5 generating / 2 muting · Magus at #5 still
  waiting on Mercury direct.
- Saturn Return Reading · 2026-04-30 · 1 generating / 6 mute · likely
  resolving by week's end.

**QL Walk.** P3 (pattern) opening prospectively against P3' (hidden pattern)
gathering — the recurring shape becoming visible from both sides at once.
Square C under Saturn's slow heat.
```

### 7.5 Implementation

The briefing skill is a markdown skill that drives an inscription routine:

1. **Inputs gathered**: kairos state, `balance()` output, active decan + decan record, live spreads from Janus, Klein weighting, recent user content from past 24h via Hen.
2. **Compose sections** per the voice law and tonal register guidance in §6.4.
3. **Write via `khora_write_highlighted_inscription`** as a `retrospective-surfacing` highlight at top of current day's NOW.md.
4. **Tag with `c_3_briefing_emitted: <ISO>`** in frontmatter to prevent duplicate emission.

---

## 8. File-Level Change Inventory

### 8.1 Code changes

**TS runtime (S4 ta-onta):**

| Path | Change | Type | Section |
|------|--------|------|---------|
| `Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts:36` | `direction: "Day"` → `sense: "prospective"` (alias `direction` kept for 1 release) | Rename | §1.2 |
| `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts:65,97` | `cs_direction: "Night'"` → `cs_sense: "retrospective"` (alias kept) | Rename | §1.2 |
| `Body/S/S4/ta-onta/S4-0p-khora/modules/flow-watcher.ts` | New module — tranche-complete detection (explicit marker, quiet timer, file-open rhythm) | New | §3.2 |
| `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` | Add `khora_write_highlighted_inscription` primitive; wire `chronos_reentry` hook | Extension | §3.4, §3.5 |
| `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts` | Add `chronos_response_orbit` and `chronos_reentry` primitives | Extension | §3.3, §3.5 |
| `Body/S/S4/ta-onta/S4-5p-aletheia/modules/janus-doorway.ts` | Add `janus_track_spreads`, `janus_evaluate_aliveness`, `janus_spread_resolved`, `janus_weight_session` | Extension | §4.2, §4.3 |

**Gateway + SpacetimeDB (S3):**

| Path | Change | Type | Section |
|------|--------|------|---------|
| `Body/S/S3/gateway/src/spacetime.rs` | Add `OracleSpreadPosition` table, `record_oracle_spread`, `update_position_state` | New schema | §4.1 |
| `Body/S/S3/gateway/src/spacetime.rs` | Add `aletheia_veto_log` table | New schema | §5.4 |

**Theia canvas surface (S3' UI in epi-theia m4-nara extension):**

| Path | Change | Type | Section |
|------|--------|------|---------|
| `Body/M/epi-theia/extensions/m4-nara/src/browser/canvas-editor.tsx` | New ReactWidget canvas-as-input — Tiptap mount, day-NOW binding, SharedBridgeAdapter wiring | New | §2.2 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/editor/extensions/highlight-mark.ts` | Port from old `highlightMark.ts`. Tiptap mark extension; `HighlightCategory` enum with 10 categories (4 user + 6 agent); `setHighlight` / `unsetHighlight` / `toggleHighlight` / `extractHighlights` | New (ported) | §2.2, §2.3 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/editor/components/floating-menu.tsx` | Port from old `FloatingMenu.tsx`. Selection-triggered; user categories only; agent-action buttons dispatching via SharedBridgeAdapter | New (ported) | §2.2 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/services/highlight-service.ts` | New Inversify `@injectable()` service — replaces old Zustand `highlightsStore`. Emitter/Event pattern; `inscribeAgentMark(position, category, content, sourceFacet)` | New | §2.2 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/ambient-state-strip.tsx` | New component — Klein weighting + somatic signature + live spreads count | New | §2.4 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/tuning-bar.tsx` | New component — tranche / orbit / sense override; persists to NOW frontmatter | New | §2.5 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/m4-nara-widget.tsx` | Extend or compose to mount AmbientStateStrip, TuningBar, and CanvasEditor under the existing ReadinessBanner | Extension | §2.2, §2.4, §2.5 |
| `Body/M/epi-theia/extensions/m4-nara/src/browser/frontend-module.ts` | DI bindings for `HighlightService`; keyboard shortcut registrations for TuningBar controls | Extension | §2.2, §2.5 |
| `Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` | Optional addition: extend `NaraArtifactKind` with `'agent-inscription'` if `'agent-chat'` is judged too narrow; otherwise reuse `agent-chat` | Optional | §2.2 |
| `Body/M/epi-theia/extensions/m4-nara/style/highlights.css` | New stylesheet — left-border accent bar + tint per category (4 user + 6 agent); CSS custom property scheme matches old surface | New | §2.3 |

**Portal-core (Rust):**

| Path | Change | Type | Section |
|------|--------|------|---------|
| `Body/S/S0/portal-core/src/events.rs` | Add `NaraActivityKind::FileReentry`, `NaraActivityKind::TrancheComplete`; extend `Highlight` payload with `category: String` | Extension | §2.3, §3.2 |
| `Body/S/S0/portal-core/tests/nara_journal_parser.rs` | Extend `dream_oracle_and_highlight_inputs_remain_distinguished` test with the new agent categories | Test | §2.3 |

**Canonical element harmonisation (C + Rust):**

| Path | Change | Type | Section |
|------|--------|------|---------|
| `Body/S/S0/epi-lib/include/m_canonical.h` | New header — `M_ELEM_AETHER=0 … M_ELEM_SALT=5`; operative-quartet mask; inline conversion helpers (`m_canonical_from_m4_h_legacy`, `m_canonical_to_medicine_rs_legacy`, `m_canonical_from_m2_3_branch`, `m_canonical_to_m2_3_branch`, `m4_nuc_to_elem`) | New | §6.2 |
| `Body/S/S0/epi-lib/include/m4.h:50-59` | Replace `M4_ELEM_*` with the canonical constants from `m_canonical.h`; rewrite `_Static_assert` chain to use `m4_nuc_to_elem(...)` rather than raw integer equality | Renumber | §6.2 |
| `Body/S/S0/epi-cli/src/nara/medicine.rs:78` | Renumber `ELEMENT_AKASHA…ELEMENT_EARTH` constants to canonical IDs (`M_ELEM_AETHER=0 … M_ELEM_SALT=5`); re-key `ELEMENT_CHAKRA` from `[5]` to `[6]` (adding `SALT → Sahasrara`); update `SIGN_ELEMENT[12]` values; update `ZODIAC_DECAN_TABLE[36].element` field values | Renumber | §6.2 |
| `Body/S/S0/epi-cli/src/nara/medicine.rs:831` | Fix `body_zones_for_elem_sig` bit-extract: `(elem_sig >> 2) & 0b111` → `(elem_sig >> 3) & 0b111` matching `ELEM_SIG_GET_CHAKRA` in m2.h | Bug fix | §6.2 |
| `Body/S/S0/epi-cli/src/nara/mod.rs` | Add Rust-side `pub const fn elem_sig_chakra(sig: u8) -> u8` mirroring `m2.h` macro to prevent future drift; add Rust-side conversion helpers wrapping `m_canonical.h` | New | §6.2 |
| `Body/S/S1/hen-compiler/scripts/migrate_m2_3_element_canonical.py` | New one-shot script — read `parashakti-deep/nodes-full-detail.json`, remap each node's `element` field from dataset encoding to L2' canonical, write back | New (migration) | §6.2 |
| `Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json` | Migrated by script — element field values updated; branch coordinate names unchanged | Data migration | §6.2 |

### 8.2 Documentation / contract changes (no code)

| Path | Change | Section |
|------|--------|---------|
| `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/klein-mode/SKILL.md` | Add prospective/retrospective structural gloss | §1.3 |
| `Body/S/S4/ta-onta/S4-3p-chronos/CONTRACT.md` | Add prospective/retrospective parentheticals to cron docs | §1.3 |
| `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` | Widen frame contract to CF1 + CF(0/1); add new capabilities | §4.4 |
| `Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md` | Add veto primitive contract, weighting-based dispatch, synthesis authority | §5 |
| `Idea/Bimba/World/Types/Coordinates/L/L'/L'.md` | Add prospective/retrospective explanatory paragraph | §1.3 |
| `Idea/Bimba/World/NOW.md` | Add `c_3_tranche_mode`, `c_3_response_orbit`, `c_3_klein_weighting` to optional frontmatter section | §3.1 |
| `Idea/Bimba/World/Types/Coordinates/M/M2/M2-3.md` (or current canonical M2-3 doc location) | Document the graph-branch naming convention (`#2-3-1=Fire`, etc.) as distinct from L2' canonical element IDs; reference conversion helpers in `m_canonical.h` | §6.2 |
| `Idea/Bimba/World/L2'.md` | Add explicit "Canonical Element IDs" section pointing at the L2' inner-position ordering as the authoritative source; index table for cross-reference | §6.2 |

### 8.3 New skill

| Path | Type | Section |
|------|------|---------|
| `Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/SKILL.md` | New skill | §7 |

---

## 9. Build Order

The spec composes; not every section depends on every other. Suggested order:

1. **Canonical element harmonisation** (§6.2) — `m_canonical.h` + renumber `m4.h` + renumber `medicine.rs` + fix `body_zones_for_elem_sig` bit bug + M2-3 node migration script. Lands first because every downstream layer (Janus weighting, briefing, ambient state strip) reads element IDs and we want one source of truth before they're consumed. Test invariants in §6.2 must all pass before next step.
2. **Rename** (§1.2) — small surgical change, no downstream blockers. Run in parallel with #1.
3. **OracleSpread schema + Janus aliveness** (§4.1, §4.2) — independent of UX, gives the data the briefing needs.
4. **Klein weighting computation in Janus** (§4.3) — depends on #3.
5. **Janus contract widening** (§4.4) — documentation.
6. **Theia canvas port — minimum viable** (§2.2 ported HighlightMark + HighlightService + canvas-editor mounted in widget) — UI-only; user can write and mark with the 4 existing user categories.
7. **Theia canvas — agent inscription categories** (§2.3) — extends the enum, CSS, and adds `inscribeAgentMark`.
8. **`khora_write_highlighted_inscription`** (§3.4) — gives agent the inscription primitive over the SharedBridgeAdapter.
9. **Aletheia veto primitive + contract** (§5.2, §5.5) — independent.
10. **Daily briefing skill** (§7) — depends on #1, #3, #4, #8.
11. **Ambient state strip** (§2.4) — depends on #1, #4.
12. **Tuning bar + frontmatter schema** (§2.5, §3.1).
13. **Khora flow-watcher** (§3.2) — depends on #12.
14. **`chronos_response_orbit` and `chronos_reentry`** (§3.3, §3.5) — depends on #13.

Each step ends on a working artifact. The user can write on the canvas with the 4 user-side highlight categories after step 6. The agent can begin inscribing back onto the canvas after step 8. The daily briefing lands after step 10. Orbits and re-entry come online after step 14.

**Critical path note**: step 1 unblocks everything that reads element IDs. Skipping or deferring it forces every downstream consumer to thread element-ID-conversion logic explicitly, which leaks the disagreement into UI code. Land it first.

---

## 10. Open Questions

- **Tranche marker glyph.** `///` on its own line is the suggested explicit marker. Alternatives: a TipTap-native "ready" button, or a specific highlight type. Decide before §3.2 ships.
- **Re-entry block placement.** Top of new session block by default. But: should the re-entry block stay collapsed by default and expand on click? UX trial needed.
- **Saturnine orbit calibration.** "Multi-day delay weighted to Saturn aspect proximity" needs a concrete algorithm — current sketch is "schedule for next exact Saturn aspect within ±7 days; else fall back to next-morning."
- **Salt_cap / aether_gate runtime.** Per §6.3, defer until briefing usage shows the need. Under the L2' canonical harmonisation in §6.2, these slot cleanly into the 0/5 framing pair around the operative quartet — implementation lands naturally once usage justifies it. Re-evaluate after 4 weeks of daily briefings.
- **`agent-chat` artifact-kind reuse vs new kind.** The DayContainer already names `'agent-chat'` as a canonical artifact kind in `nara-surface.ts`. Decide whether agent inscriptions all flow under this kind (with `category` distinguishing) or whether to add `'agent-inscription'` as a sibling kind. Probably reuse `agent-chat` and let the highlight category carry the semantic; add the sibling only if Graphiti episode relations need to differ.
- **Canonical harmonisation rollout risk.** The M2-3 node `element` field migration is one-shot and irreversible on the dataset. Build a `dry_run` mode into `migrate_m2_3_element_canonical.py` that emits a diff for review before applying. Confirm with a passing round-trip test before flipping the legacy `m4.h` macros.
- **Theia widget privacy boundary.** Highlight content is part of the user's flow body — privacy class `protected_local`. Confirm `extractHighlights` results never enter `buildPublicProfilePayload` or `buildS2CanonicalProjection` (per `nara-surface.ts:287, 297` — both already specify `protectedBodiesIncluded: false`, `bodyFields: []`). Add a runtime assertion in the projection builders.
- **Veto-frequency thresholds.** Per §5.4, "over-frequent vetoes from one facet flag the dispatch logic as miscalibrated" — needs a concrete threshold (3 vetoes per facet per session? per week?).
- **Tuning bar persistence model.** Frontmatter is the source of truth, but does the bar also persist user preferences across sessions in PASU? Likely yes — `c_4_response_orbit_preference` as a PASU-level default that NOW frontmatter overrides per-session.

---

*Document v0.3 — 2026-06-04. Authored under the Klein topology bootstrap; spec composes across M4-1, S4-0', S4-3', S4-5', S3, and S3' (Theia surface in `epi-theia/extensions/m4-nara`). Ground reads from `m1.h` quaternion, `m3.h` charges, `m4.h` nucleotide-element identity (harmonised to L2' canonical per §6.2), `medicine.rs` balance — already runtime. The added layers are: canonical element-ID harmonisation (§6.2), temporal control plane (§3), Theia canvas with highlight system port + agent-inscription categories (§2), Janus widening for Klein operation (§4), Aletheia facets with veto (§5), and the briefing voice (§7).*

*Revision history:*
- *v0.1 → v0.2: (a) app surface corrected from retired `epi-app/renderer` to `epi-theia/extensions/m4-nara`; (b) element-ID disagreement upgraded from deferred cleanup to first-step canonical harmonisation with explicit migration plan and test invariants.*
- *v0.2 → v0.3: (a) L2-5' renamed Mineral → Salt across the document per canonical alchemical Three Principles (Mercury / Sulphur / Salt — Salt as the fixed body); (b) Aletheia roster corrected to **six** subagent techne-guardians per Track 12 canonical (DR-M5-1) — Anansi (CF0), Janus (CF1), Moirai (CF2), Mercurius (CF3), Agora (CF4), Zeithoven (CF5) — Techne is the gateway over Pleroma-Techne, not a subagent; (c) Sophia and other constitutional names (Nous, Logos, Eros, Mythos, Psyche) corrected from "peer dispatchers/synthesis authority" to "psyche-aspect rendering registers surfaced through Anima" — Anima is the sole dispatcher and synthesis authority per DR-M5-1; (d) integrated as new tranches in m-dev cycle-3 — **Track 05** gains 5.15-5.19 (sense rename, L2' canonical harmonisation, OracleSpread aliveness, daily briefing skill, NOW frontmatter schema), **Track 11** gains 11.10-11.12 (Theia canvas port, agent-inscription categories, ambient strip + tuning bar), **Track 12** gains 12.18-12.19 (Janus Klein operation, Aletheia veto primitive), **Track 19** gains 19.11-19.12 (temporal control plane, kairos populator closing the prior Open Follow-Up), plus a Mineral→Salt amendment to existing 19.10(c); plan.index.json and plan.state.json updated with 12 new pending tasks; track checksums for 05/11/12/19 invalidated for m-dev regen.*
