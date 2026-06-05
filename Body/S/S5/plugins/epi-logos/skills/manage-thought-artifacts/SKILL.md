---
name: manage-thought-artifacts
description: "[Cross-Cutting · L4' Structure] — Activates and maintains the Thought artifact field when filesystem persistence is available. Creates or updates the artifact families that actually moved during the run. Not passive filing — live working memory for subagent execution, handoff, and cross-session continuity."
---

# Manage Thought Artifacts

> `using-epi-logos` runs first. If it hasn't been invoked this turn, go there now.

`/Self/Thought/*` is live working memory, not a passive archive. When persistence exists and Thought is active, create or update artifacts for the live run. Do not talk abstractly about artifacts while leaving the field empty. The 12 families constitute the full Square B basin (L1·L4·L4'·L1'), grounded in the two QL units.

If persistence does not exist: keep the artifact model internal, track what would have gone into the field, do not pretend files were created.

## The Twelve Families

**Objective Six (L4' / P Day / (No)Name Unit):**
- `/Self/Thought/Questions/` (P0/Truth) — observations, unknowns, disciplined open questions
- `/Self/Thought/Traces/` (P1/Mind) — hypotheses, trails, candidate explanations
- `/Self/Thought/Challenges/` (P2/Word) — blockers, tensions, method risks
- `/Self/Thought/Patterns/` (P3/Logos) — criteria, recurring structures, evaluative apparatus
- `/Self/Thought/Discovery/` (P4/Son) — execution results, findings, state changes
- `/Self/Thought/Insight/` (P5/Image) — verified synthesis, durable takeaways, compact handoffs

**Subjective Six (L4 / P' Night / Power Unit):**
- `/Self/Thought/Being/` (P0'/Play) — what sort of world or issue is showing up
- `/Self/Thought/Thrownness/` (P1'/Need) — givens, inheritance, factical constraints
- `/Self/Thought/Presence/` (P2'/Sacrifice) — immediate encounter and lived disclosure
- `/Self/Thought/Temporality/` (P3'/Decision) — sequence, timing, urgency, latency, horizon
- `/Self/Thought/Care/` (P4'/Love) — stake, concern, valence, why it matters
- `/Self/Thought/Releasement/` (P5'/Work) — unclenching, reframing, subjective synthesis

## Runtime Sequence

1. Determine whether persistence exists.
2. Determine whether Thought should be active for this run.
3. Choose only the artifact families that actually moved.
4. Create or update notes tied to the task or subtask.
5. Require subagents to leave a usable artifact footprint when persistence exists.

## Naming

- `YYYY-MM-DD-<task-slug>.md` for task-level artifacts
- `YYYY-MM-DD-<task-slug>-<subagent>.md` for subagent artifacts

Inside each file: context, current move, active contradiction or opening, next useful action. Include session metadata: session ID, skill source, timestamp.

## Rules

- Update only the artifact families that actually moved
- For klein topology: paired subjective and objective notes are often right
- For lemniscatic: record what changed at each recursive fold
- Use artifacts to support handoff, not to dump raw token residue
- When nearing completion, invoke `compress-thought-artifacts`

## Vault Linking (when filesystem access exists)

When this skill persists an artifact (Thought entry, plan, summary, oracle reading, design note), include wikilinks to the World/Types psychoid web at `Idea/Bimba/World/Types/`. Canonical vocabulary:

- Raw psychoid wells: `[[Psychoid-0|#0]]` … `[[Psychoid-5|#5]]`
- Position coordinates: `[[P0]]`…`[[P5]]` / `[[P0']]`…`[[P5']]`
- Lens coordinates: `[[L0]]`…`[[L5]]` / `[[L0']]`…`[[L5']]`
- Klein V₄ Squares: `[[Square A]]` / `[[Square B]]` / `[[Square C]]`
- Relation families: `[[Family A — Adjacent-Identity]]`, `[[Family B — Offset-Transition]]`, `[[Family C — Converse-Mirror]]`, `[[Family D1 — Same-Position Cross]]`, `[[Family D2-Transform]]`, `[[Family D2-Require]]`, `[[Family D2-Complete]]`, `[[Family D3 — Helix-Invariance]]`
- Symbolic systems: `[[Tarot]]` · `[[I-Ching]]` · `[[Codon]]` · `[[Nucleotide]]` · `[[QL Music]]`
- Language objects: `[[OracleFrame]]` · `[[ReadingPosition]]` · `[[TranscriptionalClockPacket]]` · `[[SymbolicProtein]]` · `[[NaraDeckContext]]` · `[[PatternPacket]]`

Hen residency: target [[Hen]] / S1' write methods when available; direct filesystem writes are transitional fallback. See `Idea/Empty/Present/03-06-2026/HEN-INTEGRATION-DESIGN-PSYCHOID-WEB-2026-06-03.md` for the gateway design and `PSYCHOID-WEB-CANON-EXTRACT-2026-06-03.md` for the canonical wikilink vocabulary in full.
