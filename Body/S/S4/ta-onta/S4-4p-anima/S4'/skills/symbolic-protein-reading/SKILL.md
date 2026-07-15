---
name: symbolic-protein-reading
description: Mythos-owned in-session symbolic-protein narrative reader over the live M4_Symbolic_Protein codon chain under global M1/M2/M3 cosmic weather.
---

# Symbolic Protein Reading

## Coordinate Header
- Coordinate: `S4-4'` / [[Mythos]]
- Residency: `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/SKILL.md`
- Position (#n): `#4` — Context / archetypal pattern naming
- Actualises: [[S4-SPEC]], [[S4-ARCHITECTURE]], and M4 Tranche 5.27
- Public surface: governed inputs and output law for `modules/symbolic-protein-reader.ts`
- Does NOT own: protected M4 bodies, M3 card-label law, TOML parsing, or gateway persistence
- Contract: `Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md`

## Owner
[[Mythos]] owns this skill as the Paśyantī pattern-naming surface for [[M4_Symbolic_Protein]] in-session codon-chain reading.

Coordinate frame:
- CF `(0/1/2/3)` / [[Mythos]]
- CT3 Pattern
- CP4.3 Pattern
- CFP0 single-pattern reading, CFP3 only if multiple pattern recognizers are explicitly fused

## Inputs
- `symbolic_protein_handle`: read-only opaque handle for the current [[M4_Symbolic_Protein]] chain. Do not dereference protected bodies outside the governed [[M4']] surface.
- `chain_projection`: governed `chain_position` plus `chain_fingerprint`; this is the only chain-derived input admitted into [[Anima]] and contains no codons or protein body.
- `cosmic_weather_snapshot`: global 1-2-3 state from [[MathemeHarmonicProfile]]:
  - M1 spanda tick
  - M2 cymatic phase
  - M3 codon-transcription state grounded in kerykeion live degrees
- `kairos_pulse_ref`: `[[wikilink]]` to the Mercurius kairos pulse that triggered the read.
- `session_ref`: `[[wikilink]]` to the active session.
- `chain_position_ref`: `[[wikilink]]` bookmark for the codon-chain position read.
- `cosmic_weather_snapshot_ref`: `[[wikilink]]` to the weather snapshot artifact.

## Output
Return a `MythosArchetypeReading` payload:

```ts
interface MythosArchetypeReading {
  dominant_chromosome_arcana: MajorArcanaCardRef;
  secondary_pattern_arcanas: MajorArcanaCardRef[];
  narrative_summary: string;
  provenance: {
    session_ref: string;
    chain_position_ref: string;
    cosmic_weather_snapshot_ref: string;
    kairos_pulse_ref: string;
  };
}
```

The read appends to `SymbolicProtein.mythosReadingHistory`. A session-close kairos pulse additionally populates `SymbolicProtein.mythosArchetypeReading` so the sealed [[PatternPacket]] carries the named archetype forward.

## Runtime Surface
The active implementation is `Body/S/S4/ta-onta/S4-4p-anima/modules/symbolic-protein-reader.ts`. It consumes values already parsed and validated by the portal-core tunable registry; TOML parsing and override precedence remain outside [[S4]]. The module is directly importable by governed [[Mythos]] carriers and deliberately does not add a new always-active Anima tool.

## Trigger Law
Mercurius kairos ticks during a session may trigger a read according to `~/.epi-logos/config.toml`:

```toml
[mythos.symbolic_protein_reading]
trigger_mode = "every-mth-kairos-pulse"
utterance_interval_n = 5
kairos_pulse_interval_m = 3
adaptive_floor_seconds = 90
adaptive_ceiling_seconds = 1800
secondary_archetypes_count = 2
voice_template_path = "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/voice-templates/default.md"
reification_guard_strictness = "standard"

[mythos.symbolic_protein_reading.cosmic_weather_weights]
m1 = 0.33
m2 = 0.34
m3 = 0.33
```

Every default is conservative and ML-trainable. The weights and intervals are surfaces for later self-awareness tuning, not hard-coded metaphysics.

## Cosmic-Weather Binding
Never read the codon chain in isolation. The Major Arcana naming is grounded in the current global 1-2-3 weather:
- M1 names the spanda tick pressure.
- M2 names the cymatic phase.
- M3 names the codon-transcription state under live kerykeion-derived degrees.

The same codon chain can name a different dominant arcana when weather weights change. That sensitivity is required.

## Pathology Guard
Reject reified summaries. The voice must remain paraphrasable as:

> this session's codon arc figures archetype X under cosmic-weather Y

Do not write:

> this session is X

The pattern is a named attractor with provenance, not the territory.

## Provenance Law
Every reading must carry these four `[[wikilink]]` refs:
- session ID
- codon chain position bookmark
- cosmic-weather snapshot
- triggering kairos pulse

Per [[Mythos]]: the pattern that has no provenance is not yet Mythos; it is noise.
