---
name: get-details
description: Fetch lean, citation-dense details from the repo on a specific topic, coordinate, concept, or named structure. Dispatches a focused Explore subagent under strict output constraints — file:line citations required, "not found" stated explicitly, no invention, capped at ~500 words. Use when you need ground truth from the codebase fast without flooding context, or want to fan out 2+ independent retrievals in parallel.
---

# Get Details

> `using-epi-logos` runs first if topology/lens/paradox work is downstream.

A precision retrieval skill. You hand it a target (concept, coordinate, code area, dataset, or named structure) and one focal question. It dispatches an `Explore` subagent with a strict lean-output template and returns ground truth.

## When to use

- You need actual file:line evidence before forming a claim.
- You want structural enumerations (LUTs, enums, named constants, dataset rows) from the codebase.
- You want to verify whether a concept is canonically documented vs. oral tradition.
- You want to fan out 2+ independent retrievals in parallel without burning context.

Do not use for: open-ended research without a focal question (use `deep-research`), or edits/writes (retrieval only).

## Dispatch Template

For each target, send an `Explore` subagent with this prompt shape:

```
Search /Users/admin/Documents/Epi-Logos C Experiments/ for ground truth on:

FOCAL QUESTION: <one sentence>

Find with file:line citations:
1. <specific structural element — LUT / enum / constant / function>
2. <specific document, seed file, or spec — and what it actually says>
3. <specific coordinate or namespace — what lives at it>
4. <optional: numerical signature, factor, or named event — does it appear, where>

Output rules:
- Tight list. Each finding = file:line + one-sentence why-it-matters.
- Under 500 words total. No preamble. No closing summary.
- If a target is not found, say "not found" explicitly — do not invent.
- Quote canonical text directly when the user is checking a phrase or definition.

Preferred search roots:
- Body/S/S0/epi-lib/{include,src}/                (C kernel)
- Body/S/S0/portal-core/src/                      (Rust portal)
- Body/S/S{0..5}/                                  (S-layer code + plugins)
- Idea/Bimba/Seeds/M/{M0,M1,M2,M3,M4,M5}'/        (M-coordinate seeds)
- Idea/Bimba/Seeds/M/Legacy/plans/CLOCK-AND-NARA-SPECS/
- Idea/Bimba/Map/datasets/{anuttara,paramasiva,parashakti,mahamaya}-deep/
- Idea/Bimba/World/Types/Coordinates/
```

Adapt the bracketed slots to the actual target. Keep the output rules verbatim.

## Calibration

- **Lean, not detail-poor.** Cap ~500 words. Findings should be dense, not sparse — every line carries a citation or a clean negative.
- **One focal question per dispatch.** Multiple questions → multiple dispatches in parallel.
- **Parallel by default.** If you have 2+ independent targets, send them in a single message with multiple Agent tool uses.
- **Negative findings are findings.** "X not found in M3 code or seeds" is load-bearing — it tells the main loop where to stop pattern-matching.

## Anti-patterns

- Vague targets produce vague output. Name the LUT, the function, the coordinate, the file.
- Don't request synthesis from the subagent — synthesis is the main loop's job.
- Don't ask for >700 words — split into more dispatches instead.
- Don't ask for prose summaries — request structured findings with citations.

## Output Handling

The subagent returns its lean list. The main loop reads it, synthesizes against live context, and decides next moves. The skill itself is just the dispatch discipline — the value is in the precision of the focal question and the strictness of the output template.
