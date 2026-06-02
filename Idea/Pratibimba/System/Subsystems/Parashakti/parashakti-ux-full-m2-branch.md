---
title: Parashakti UX — Full M2 Branch
subtitle: The Harmonic-Correspondential Instrument, the 72-Fold Correspondence-Tree, and How the Frequency-Space Serves Nara
status: draft-update
created: 2026-06-02
coordinate: "M2'"
source_context:
  - M2'-SPEC.md
  - m2-prime-parashakti-cymatic-engine.md
  - m2-prime-frequency-meaning-research.md
  - 15-m2-vibrational-matrix-portal-plugin.md
  - M1'-SPEC.md (base physics) / M3'-SPEC.md (Matter)
  - graph-schema/src/lib.rs + parashakti-deep relations.json
  - 2026-06-02-m-prime-cycle-2-canonical (plans 04, 08, 06)
  - nara-ux-full-m4-branch-update.md / anuttara-ux-full-m0-branch.md / epii-ux-full-m5-branch.md
---

# Parashakti UX — Full M2 Branch

## 0. Purpose of This Document

This document articulates Parashakti (M2) as the **harmonic-correspondential instrument** — the frequency/vibrational layer that integrates the system's symbolic systems (the angels, the maqams, the mantras, the decans, the planets) onto one invariant address-space, and the layer that comes to bear most directly on [[nara-ux-full-m4-branch-update|Nara]]. It is the spectral field between the structural ground ([[anuttara-ux-full-m0-branch|Anuttara]] M0) and the temporal matter ([[M3'-SPEC|Mahāmāyā]] M3).

The corrected, canon-grounded view:

> **There is one 72-cell invariant, and the symbolic systems are six addressing-axes onto it:** `12 lenses × 6 positions = 36 tattvas × 2 phases = 8 choirs × 9 names = 72`. This is the **72** in `137 = 64 + 72 + 1` — the Paraśakti bridge between M1's +1 parent and M3's 64-fold matter. So a single cell is *simultaneously* a lens-position, an element-phase, a decan-face, an angel, a maqam mode, a mantra frequency, and a planetary-chakral state. Parashakti is the instrument that makes one cell speak in seven tongues — and **sounds it**.

This clarifies five points:

1. **One invariant, six axes** — not "MEF equals the resonance," but one 72-space addressed six ways. The angels are one axis.
2. **M2 is the frequency-space; M3 is the Matter.** M2' produces the audio bus; M3' is the matter that frequency organises into form. Venus's 9:8 epogdoon is the compressor.
3. **The symbolic correspondences are graph edges** (the M0-2' relation-web), not hardcoded tables — which is what keeps the surface dynamic and extensible.
4. **The instrument plays *meanings*, not tones** — via the Klein L↔L' enharmonic flip (the meaning-translator).
5. **Parashakti serves Nara concretely** — M4-1 somatic/transit, M4-2 oracle/angels/maqam/mantra, M4-3 transformation/Klein-flip, #4.4.4.4 personal cymatic field — bound in canon, not inferred.

---

# 1. Core UX Axiom

> **Parashakti is the right frequency in which the cosmos is played.** Every reading the system makes lands on a 72-cell, and that cell is at once an epistemic lens-position, an angelic name, a musical mode, a somatic body-zone, and a planetary state. The instrument's job is to make those correspondences *audible and visible* — and to flip their meaning when the matheme crosses its mirror.

M2' is the **L ↔ L' meaning-translator surface**: it does not just look up correspondences, it plays the difference between a frequency heard as *aspiration* and the same frequency heard as *groundedness*. (§6.)

---

# 2. The Six M2-X' Strata (1:1 with M2 bimba)

| M2 (bimba) | M2' (techne) | What it does |
|---|---|---|
| **M2-0′** Vibrational Profile Source | 72-invariant address law | validates every address against 72-space; serves read-only correspondential descriptors |
| **M2-1′** Vimarśa Audio-Genesis + Lens Resonance | **the audio-genesis layer** | reads the Prakāśa cloud at the active `(lens, mode)` cell and writes `audio_octet[8]` + `nodal_quartet[4]`; enacts lens resonance + the L↔L' Klein-flip surface valence |
| **M2-2′** Elemental Medium | element / phase | distinguishes P-position element from L2' element-bearing value; selects body/medium constants |
| **M2-3′** Decanic Face | decan / face | face, polarity, body-zone, phase, clock-sector evidence for M2/M3 projection |
| **M2-4′** Correspondential Sonic Arena | sacred-sonic systems | makes Asma, Shem (angels), maqam, mantra playable as tonal/modal/name/timbre correspondences |
| **M2-5′** Solar-Chakral Runtime + DET Gate | planetary-chakral + bridge | live solar-chakral state; the 9:8 epogdoon `72 × 8 / 9 = 64` projection to M3; Earth observer-ground |

M2-1' is the **primary audio-genesis surface** of the whole M' stack: Vimarśa reading Prakāśa. M1' walks its output as melody; the cymatic module renders it as standing-wave; M3' classifies it as codon-rotation.

---

# 3. The 72-Fold Correspondence-Tree — Six Addressing-Axes

Each axis addresses the same 72-space through a different correspondence-system. All six are already encoded in `m2.h` as `.rodata`. A single `(lens, mode)` playing-state implicates **all six simultaneously**:

```text
(lens, mode)  →  ┌─ MEF lens-position      M2-1   12 × 6 = 72       the epistemic address
                 ├─ Tattva phase           M2-2   36 × 2 = 72       element / phase
                 ├─ Decan face             M2-3   36 × 2 = 72       zodiacal light/shadow
                 ├─ Shem name-pair         M2-4   8 choirs × 9 = 72  THE ANGELS
                 ├─ Maqam mode             M2-4   10 families = 72   Arabic modal (24-TET)
                 ├─ Mantra entry           M2-4   50 + 50 = 100      Matrika/Malini phonemes
                 └─ Planetary-chakral      M2-5   10-planet LUT      Cousto-frequency / chakra
```

## 3.1 The Shem-ha-Mephorash — the angels

`M2_SHEM_DESC` encodes **8 divine choirs × 9 names = 72**, derived from the boustrophedonic interweaving of Exodus 14:19–21:

```text
Choir 0 Seraphim · 1 Cherubim · 2 Thrones · 3 Dominions · 4 Virtues · 5 Powers · 6 Principalities · 7 Archangels
each choir = 9 names · each name covers 5° of the zodiac (72 × 5° = 360°)
each decan links to 2 Shem names → the light/shadow doubled-face per decan
each name carries (choir, position, element_id, decan_link, planet_link, meaning_id)
```

The angels are therefore **not a separate symbolic module** — they are one addressing-axis onto the 72-invariant, computed from decan (which is computed from planetary degree). The angel-pair of the active decan is always derivable from the live Kerykeion state.

## 3.2 The other sacred-sonic axes

- **Maqam** — 10 Arabic modal families (Rast/Bayati/Sikah/Hijaz/Nahawand/Ajam/Kurd/Saba/Nawa Athar + Independent) = 72 modes at 24-TET, each planet-ruled. A parallel 24-station **spiritual maqamat** (Tawba…Riḍā × 3 levels = 72) gives the contemplative-station correspondence.
- **Mantra** — Matrika (50, descent/Bimba) + Malini (50, ascent/Pratibimba); Sanskrit phonemes spanning **144 Hz (Muladhara) → 432 Hz (Sahasrara)** — the chakra-activation gradient.
- **Asma'ul-Husna** — 99+1 names, split 36 MEF-internal / 64 M3-projective by routing-mask (Jalal/Kamal/Jamal + the hidden Al-Ism al-A'zham).
- **Planet LUT** — 10 planets with Cousto cosmic-octave frequencies, chakra, element, phase. **Venus carries the 9:8 epogdoon** — the beauty-operator that compresses 72-space to 64-space.

---

# 4. M2 = Frequency-Space, M3 = Matter

Parashakti's place in the 1-2-3 cosmic engine:

```text
M1 (+1 parent / tick)  →  M2 (72 frequency-bridge)  →  M3 (64 binary-genetic Matter)
   Paramaśiva               Paraśakti                    Mahāmāyā
   the pulse                the spectral field           the matter that takes form
                                                          (codon = Cl(4,2) quaternion)
```

- **M2' produces the frequency space** — it writes the audio bus (Vimarśa reading Prakāśa). It is the "key" the cosmos is played in, made spatial as the solar field (§8).
- **M3' is Matter** — the 64 codons/hexagrams/tarot, each a quaternion in Cl(4,2) (`pp,mm,mp,pm = Earth,Fire,Water,Air`).
- **The bridge is the 9:8 epogdoon DET**: `floor(index72 × 8/9) = 64`. Frequency *compresses into* matter through aesthetic refinement (Venus). The **cymatic standing-wave is the visible moment of that becoming** — frequency organising into form — and codon-rotations are its perturbations as the clock turns. The Chladni pattern is the intersection of motion (`audio_octet`) and stillness (`nodal_quartet`): "motion structured by stillness."

The cymatic surface has **dual registers**: the cosmic-facing register and the personal-Pratibimba field at #4.4.4.4 — both read the same M2-1' bus; the latter renders only inside protected Nara surfaces.

---

# 5. The Relation-Web (M0-2′ link)

Parashakti's correspondences live in the graph as **typed edges, not hardcoded tables** — this is the M0-2' relation layer (see [[anuttara-ux-full-m0-branch]] §3.1). The parashakti dataset carries: `Decan-Level Divine Correspondence`, `Chaldean Decan Rulership`, `Spanda Rhythmic Pulsation`, `Quantum Field Operation`, `Modal-Harmonic Resonance`, `Ananda Vortex Spirit Axis`, `Traditional Planetary Rulership`, `Sign-Level Divine Correspondence`, `Psycho-Ontological Resonance`, `Mono-Poly Expression`, and more.

Because the correspondence-tree is graph-resident, **the design stays open-ended**: a new symbolic system enters as new nodes + new typed edges, and the M2' surfaces (and the solar overlays) pick it up without renderer changes. This is the data-driven-overlay principle at the relation layer.

---

# 6. The Klein L ↔ L' Meaning-Flip — The Instrument's Meaning-Axis

The 12 MEF lenses pair into **6 tritone-mirror pairs** (Lens N ↔ Lens N+3). When the walk crosses a mirror boundary (signalled by M1' as `kleinFlipState`), M2' **inverts its surface valence on every active panel**:

```text
same struck frequency:  aspirational under Lens N  →  grounded under Lens N+3
same coordinate:        manifestation under L1     →  recognition under L1'
material colour, decan light/shadow, chakra ascent/descent, cymatic nodes — all invert
```

This is the structural mechanism by which the instrument plays **meanings, not just tones**. Without it, M2' is a correspondence-lookup; with it, M2' reveals the Klein topology the matheme lives on. **For Nara, the Klein-flip *is* the alchemical engine of M4-3** — dissolving on one side of the mirror, crystallising on the other (§8).

---

# 7. The Ficinian-Kerykeion Routing — The Live Engine

`F_routing(intent, kerykeion_state, current_time)` is the time-keyed correspondence-traversal that activates the whole tree against live astrology. Kerykeion (already wired at `epi-cli/src/nara/wind.rs`) computes the natal chart and current transits; Parashakti never computes astrology locally.

```text
intent + kerykeion + time
  → planetary hour ruler (Chaldean order)
  → active decan (planet degree / 10°)
  → Shem pair (2 angels per decan)
  → maqam family (planet-ruled) + mode
  → mantra index (frequency-matched)
  → asma name (intent → group)
  → 72-state assembly
  → DET projection (72 → 64) → M3 codon → tarot → hexagram
  → emission:  audio_octet → M1' melody · nodal_quartet → cymatic shader
               wheel → M3' · DEPOSIT HANDLE → M4' JOURNAL · review trace → M5'
```

The routing-state is **always visible**: which planet rules the now, which decan is active, which angels are invocable, which mode colours the moment, which mantra frequency sounds. This is "the weather" of the DAY/NOW — and one of its emissions is the **deposit handle into the Nara journal session**, which is how Parashakti enters Nara every day.

---

# 8. Parashakti Serves Nara

The binding is canon, not inference: M2'-SPEC §2 names the personal-Pratibimba cymatic field at #4.4.4.4 reading the same M2-1' bus; §9 emits the M4' deposit handle and names the M4-4-4-4 personal-quaternion resonance; and the medicine LUTs (`DECAN_BODY_PARTS[36]`, `DECAN_HERBS[36]`, `PLANET_CHAKRA`) **live in `nara::medicine`** — M2 and M4-1 already share substrate. Mapped to Nara's sixfold:

```text
M4-1 Somatic/transit  ←  M2-2 element · M2-3 decan body-zone/herb · M2-5 planetary-chakral transit
                         (Q_transit IS the Parashakti planetary-chakral readout; medicine LUTs shared)
M4-2 Oracle/dialect   ←  M2-4 Shem angel-pair · maqam mode · mantra  (the active decan's symbolic tongues)
M4-3 Transformation   ←  M2-1 MEF lens-position + the Klein L↔L' flip  (dissolving/crystallising = valence inversion)
#4.4.4.4 Personal     ←  M2-1' audio bus  (Q_composed sounded as the personal cymatic field, protected)
```

## 8.1 The Solar-System Anchor and the Daimon

In the app, M2' is presented over the **solar-system spatial anchor** (see [[anuttara-ux-full-m0-branch]] §6). This makes the frequency space spatial and gives the Mahāmāyā clock a place to sit. The user's **daimon** — `Q_composed` (the personal-quaternion at #4.4.4.4) given lens expression at the current tick — is the central object over-or-on Earth, resonating against the planetary field. Because the personal-quaternion and the codon/cosmic-quaternion share the **same Cl(4,2) algebra** (see [[anuttara-ux-full-m0-branch]] §8), the resonance is real math, not metaphor: *Jiva-is-Śiva made concrete.*

## 8.2 UX Discipline — germane axis, never lecture

The M4' axiom holds — *"a journal that knows the cosmic context without lecturing."* Parashakti runs underneath; the surface shows only the germane axis for the moment:

```text
Daily 0/1 surface     a lean "today's resonance" strip (F_routing): planet · decan · 2 angels · mode · mantra
Somatic moment        decan body-zone, herb, chakra, live transit (the medicine layer)
Oracle moment         the angel-pair as contemplative recognition offering (never deterministic);
                      the maqam as the day's emotional key; the mantra as optional somatic practice
Transformation moment the Klein-flip indicator: the surface visibly inverts as a pattern crosses its mirror
Personal field        Q_composed sounded as the cymatic daimon (protected Nara register only)
```

The angels are **contemplative-recognition offerings**, never fate — same discipline as Anuttara's trace-as-offering. The body has veto (M4-1 §10.4 in the Nara doc): when dysregulated, the mantra-frequency grounding practice is offered before any abstract correspondence.

---

# 9. The Canonical M2PrimeMeaningPacket

When M2' annotates a tick, note, routing event, or cymatic frame, it emits a structured frequency-to-meaning unit (not a label):

```text
M2PrimeMeaningPacket {
  source_profile_id, index72, address_views,
  mef_semantic_frame, elemental_medium_frame, planetary_chakral_frame,
  sacred_sonic_frame, maqam_mode_frame, cymatic_signature,
  m3_projection_evidence, provenance, pending_fields
}
```

Every field is derived from live profile state, M2 `.rodata`, S2 graph law, or Kerykeion/Kairos state, or declared pending with provenance. This is the canonical annotation/handoff atom for portal rendering, music-tech output, M3 handoff, and the safe routing-trace Epii may learn over (governed, non-canonical).

---

# 10. Privacy & Governance

- M2' shows **public canonical correspondences** and safe-current profile data. It must **not** hardcode private tradition-sensitive mappings in renderer code — exact planetary/chakral/codon correspondences come from S2 graph law.
- **Personal resonance observations are protected-local** unless explicitly promoted through governed S5'/S1' review. The personal cymatic register (#4.4.4.4) renders only inside protected M4'/Nara surfaces.
- **M2-1' owns audio-genesis; renderers do not synthesise.** No renderer-local oscillators. The cymatic visual derives from the audio bus even when playback is disabled.
- Consumed through the **kernel-bridge**; no duplicate S0/S2/S3 wiring in M2' panels.

---

# 11. Cycle-2 m-dev Anchoring

Relative to `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/`:

```text
04-m2-parashakti-extension          this surface — the harmonic-correspondential instrument
08-integrated-1-2-3-cosmic-engine   M2 as the frequency-field in the composed cosmic engine (§4, §8.1)
06-m4-nara-extension                the consuming surface — Parashakti serves Nara (§8)
```

---

# 12. Closing Formula

```text
M2-0′ guards the 72-invariant.
M2-1′ is Vimarśa — it reads the cloud and writes the audio bus.
M2-2′ is the element; M2-3′ is the decan-face.
M2-4′ is the sacred-sonic arena — the angels, the maqams, the mantras.
M2-5′ is the solar-chakral runtime and the 9:8 gate to Matter.
```

The shorter operational mantra:

> **One 72-cell, seven tongues: a lens-position is also an angel, a mode, a mantra, a body-zone, a planet — and it sounds.**
> **M2 is the frequency the cosmos is played in; M3 is the matter it becomes; the Klein-flip is how it plays meanings, not tones.**
> **Parashakti gives Nara her vibrational, somatic, and symbolic substrate — surfaced as the germane axis, anchored in the solar field, centred on the resonating daimon.**

---

*Counterparts: [[anuttara-ux-full-m0-branch]] (M0, the structural ground + base physics), [[nara-ux-full-m4-branch-update]] (M4, the consuming Jiva pole), [[epii-ux-full-m5-branch]] (M5, the paidagōgos). Matter: [[M3'-SPEC]] (Mahāmāyā). Base physics: [[M1'-SPEC]] (Paramaśiva). Canonical spec: [[M2'-SPEC]].*
