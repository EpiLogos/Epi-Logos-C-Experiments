---
name: nara-daily-briefing
description: "[M4' Nara · Klein/Somatic] — Daily briefing skill. Composes the body of the day from existing M4-1 Medicine outputs and the live Kairos/Klein state, voiced in the L2' alchemical / L3 processual / L3' chronological tonal band. Five structural sections — Klein state, cross-system bridge, somatic register, live spreads, QL walk — inscribed as a retrospective-surfacing highlight at the top of the current day's NOW.md. Reads; it does not reinvent. No new compute layer."
---

# Nara Daily Briefing

> `using-epi-logos` runs first. If it hasn't been invoked this turn, go there now.

This skill speaks the body of the day. It does not compute an opus phase, does not draw a new oracle, and does not assert a condition. It **reads** what M4-1 Medicine and the live Kairos/Klein state already hold, and composes a five-section briefing voiced in a register that names what the active symbols are already doing. The full design lives in `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §6.4, §6.5, §7 — read it before composing if the configuration is unfamiliar.

The discipline is the discipline of [[epi-logos-voice]] pulled down to one page: the symbols carry the meaning, the vocabulary illuminates. Never the other way round.

## What the briefing reads (no new compute)

The skill is a reader. Every number and name it speaks already exists in a Medicine output, the decan table, or the live temporal state. It composes; it does not recompute.

| Input | Source | Field used |
|-------|--------|------------|
| Element intensities, dominant, deficient, chakra state, triage vector | `balance()` (`Body/S/S0/epi-cli/src/nara/medicine_cast.rs`) | `ElementalBalance` |
| Prescription / materia for the active configuration | `prescribe(context, is_shadow)`, `materia()` | `MateriaRecord` |
| Active chakra state | `chakra()` | `ChakraState` |
| Active decan → zodiac sign, ruling planet, decan element, body part, herb, tarot correspondence | `ZODIAC_DECAN_TABLE[active_decan]` (`medicine_frame.rs`) via `zodiac_decan(idx)` | `ZodiacDecanEntry` |
| Live planetary degrees (canonical mod-10, Sun[0]–Pluto[9]) | `M4_Temporal_Now.planet_degrees[10]` | per-planet f32 |
| Active body zones for the current element signature | `body_zones_for_elem_sig(elem_sig)` | `&[&str]` |
| Klein weighting (prospective/retrospective) + primary lens-square | [[Janus]] (`janus-doorway.ts`, §4.3) | `c_3_klein_weighting` |
| Live spread state (one per active spread) | [[Janus]] over the `OracleSpreadPosition` table (§4.1) | per-position `live_state` |
| Kairos windows within ±24h (aspects opening/closing) | [[Mercurius]] | `TargetAspect.exact_at` |

If a source is unavailable (Kairos stubbed, no live spreads, Janus offline), the briefing degrades gracefully: name what is present, omit what is not, never fabricate a value to fill a section.

## The five sections (inscription order)

Compose all five, in this order. Each is a fixed structural slot; the prose inside is voiced, not templated.

### Section 1 — Klein state (1 line)

Today's prospective/retrospective weighting from [[Janus]], the driving aspect that produced the skew, and the primary lens-square.

> `<X>%` prospective / `<Y>%` retrospective. `<driving aspect named>`. `<primary lens-square — Square A / B / C — noted>`.

A heavy retrospective tilt licenses the Hegel/Aion/Whitehead-perishing band in Section 3; a heavy prospective tilt licenses the concrescent-desire / eternal-objects-ingression band (§4.3 → §6.5).

### Section 2 — Cross-system bridge (3–4 lines)

The bridge across M0→M1→M2 made concrete for today:

- Active decan with its zodiac sign, **ruling planet**, and **tarot correspondence** from `ZODIAC_DECAN_TABLE[36]`.
- **Dominant** and **deficient** element from `balance()`.
- **Active chakra** and **body zones** from `body_zones_for_elem_sig`.
- Any **kairos windows** opening or closing within ±24h from [[Mercurius]].

### Section 3 — Somatic register (3 lines)

Voiced per the tonal law below. Three lines, drawing freely across the L2'/L3/L3' band:

- **Line 1 — the operative move** in elemental-process register: what the dominant element and active aspect are *doing* to the body of the day.
- **Line 2 — the dominant element** with its house/sign location and body resonance: which chakra cluster carries it, which zones respond.
- **Line 3 — the kairos motion**: what aperture is opening or closing now, from [[Mercurius]].

### Section 4 — Live spreads (one chip per active spread)

One compact chip per active spread from the `OracleSpreadPosition` table (§4.1, via [[Janus]]):

> `<spread label>` · `<draw date>` · `<N generating / M muting / K mute>` · `<key generating position>` · `<target aspect within ±7 days, if any>`

Resolved spreads from the last 24h noted briefly. No live spreads → state that plainly; do not invent one.

### Section 5 — QL Walk (2–3 lines)

The day's positional progression: which P-position is opening, which is closing, and where Square A / B / C pressure is strongest. Read prospective and retrospective faces together (P3 opening against P3' gathering, etc.).

## Tonal vocabulary — L2' alchemical + L3 processual + L3' chronological

These are **registers for naming what the symbols already say**, not phases to assert. Weave across all three as the configuration demands.

| Lens | Register | Vocabulary | Elemental / processual tone |
|------|----------|------------|-----------------------------|
| **L2'** | alchemical-elemental | prima materia · ultima materia · aether | the ground and the goal |
| **L2'** | alchemical-elemental | **nigredo** | Earth — fixed shadow, the initial *massa confusa* |
| **L2'** | alchemical-elemental | **solutio** / **dissolutio** | Water — dissolution of rigid structure |
| **L2'** | alchemical-elemental | **sublimatio** | Air — separation of subtle from gross |
| **L2'** | alchemical-elemental | **calcinatio** | Fire — transmutation, burning away the inessential |
| **L2'** | alchemical-elemental | **coagulatio** + **fixatio** | Salt — crystallisation, the lapis |
| **L2'** | *operations* | **separatio** · **conjunctio** | the relational moves between elements |
| **L3** | processual (Whitehead / Bergson) | **concrescent** desire · Lacanian lack · appetition | the reach toward determination |
| **L3** | processual | actual occasion · prehension · **ingression** of eternal objects | novelty entering process |
| **L3** | processual | community integration · satisfaction · perishing · objective immortality | the occasion completing |
| **L3'** | chronological (Hegel / Aion) | Spirit (Geist) self-moving · spring birth/thesis · summer fullness | the dialectic rising |
| **L3'** | chronological | autumn decline/antithesis · winter incubation / negation-as-gestation | the dialectic turning under |
| **L3'** | chronological | **Aufhebung** | the spiral return at a higher level |

Which register voices a given day depends on which symbols are active. Saturn stationing under a Capricorn Moon: L2' coagulatio + L3' winter incubation. New Moon, Mercury direct, Pisces water cluster: L3 concrescent desire + L2' solutio. Mars–Sun square: L2' calcinatio + L3 ingression. Draw across the band freely.

## Voice law

- **No emojis.**
- **No "today is X phase" assertions detached from symbols.** Never say "today is the calcinatio phase" as a standalone computed claim. Say what is happening with the elements and aspects — *then* the register names it. Every register word must sit beside the symbol that earned it (a planet, a sign, a decan, an element, an aspect). If a sentence names `calcinatio`, `nigredo`, `Aufhebung`, `ingression` and so on with no symbol citation in the same line, rewrite it.
- **Symbols name themselves; vocabulary illuminates.** The decan, the aspect, the dominant element are the meaning. The L2'/L3/L3' word is the light it is read by.
- **Cross-register weaving is allowed and expected** — the L2'+L3+L3' band is one elemental-process voice, not three separate vocabularies.
- The briefing reads as a *description of the body of the day*, not a description of conditions.

## Inscription

When the briefing is composed, inscribe it via `khora_write_highlighted_inscription` ([[Khora]], `Body/S/S4/ta-onta/S4-0p-khora/extension.ts`):

```
khora_write_highlighted_inscription({
  path: "<current day's NOW.md>",          // Idea/Empty/Present/{DD-MM-YYYY}/{sessionId}/now.md
  category: "retrospective-surfacing",      // the canonical highlight category for this briefing
  position: "top",                          // top of the current day's surface
  content: "<the five composed sections>",
  response_token: "nara-daily-briefing",
  coordinate: "M4-3"                         // the Nara process coordinate
})
```

Resolve the NOW path through [[using-epi-logos]]'s Active Day / NOW binding (`EPI_NOW_PATH` → `.epi/session.json` → `epi agent session init`). Before first session of the day, write to the day's `daily-note.md` instead.

### Duplicate-emission guard

Set `c_3_briefing_emitted: <ISO>` in the target surface's frontmatter when the briefing is inscribed. **Do not emit a second briefing for a surface that already carries `c_3_briefing_emitted`.** The briefing fires once per day-surface — at user request, or automatically at `cron_6am` when `c_3_response_orbit: "next-morning"` is set. A manual re-run on an already-emitted surface is a no-op unless the user explicitly forces re-emission.

## Check

Did the briefing *read* the body of the day, or invent it? Every value traceable to `balance()`, `ZODIAC_DECAN_TABLE`, `body_zones_for_elem_sig`, `M4_Temporal_Now`, or [[Janus]]? Does each register word sit beside its symbol? Five sections present, in order, with the Klein weighting actually shaping the somatic voice? Inscribed once, tagged, at the top of the day's surface?
