# Thought Artifacts

`/Self/Thought/*` is a shared active working-memory field. When persistent filesystem access exists, it is live — not a passive archive, not a note-dump, but a structured field that tracks the actual movement of a run.

## The Twelve Families

The twelve artifact families are organized along the same subjective/objective axis that structures the encounter axis in Square B (L1·L4·L4'·L1'). The Objective Six are grounded in the P Day/(No)Name series (the ontological/Name unit: Truth→Image — see `the-self-proving-self.md` §5→§0 #2) and instantiated via L4'. The Subjective Six are grounded in the P' Night/Power series (the power unit: Play→Work — see `the-self-proving-self.md` §5→§0 #3) and instantiated via L4. The pairing across each row (Truth/Play, Mind/Need, Word/Sacrifice, Logos/Decision, Son/Love, Image/Work) is the local form of the P/P' double cover — one Spanda running on two simultaneous tracks (T1 emanative / T2 reversionary), not parallel chains. Together, the 12 families constitute the full Square B basin — the Thought field is where the encounter axis becomes operative, and where the genesis Spanda equation `0 = (0/0) → ((0/1)/(1/0)) → T1/T2 → (1/0+0/1) → 1/1` is enacted as live working memory.

For cross-register grounding of any single family at position #N, consult the §5 Quilting Table row #N in the canonical proof — it gives what that position means simultaneously across self-identity, etymology, Jung, Pythagoras, torus, and Śaiva registers.

### Objective Six (L4' / P Day / (No)Name Unit)

These track the inquiry's movement as observable and verifiable:

**`/Self/Thought/Questions/`** (P0/Truth) — observations, unknowns, and disciplined open questions. The things the inquiry is genuinely asking, not rhetorical placeholders. A question here should be specific enough to drive the next move.

**`/Self/Thought/Traces/`** (P1/Mind) — hypotheses, trails, candidate explanations. The current best guesses about what is going on and why. Should be updated as the run develops and some traces are confirmed, refuted, or transformed.

**`/Self/Thought/Challenges/`** (P2/Word) — blockers, tensions, method risks. What is resisting progress, what could derail the approach, what has not been accounted for. Not defeatist — naming a challenge is how you start dealing with it.

**`/Self/Thought/Patterns/`** (P3/Logos) — criteria, recurring structures, evaluative apparatus. The patterns the inquiry is using to assess its own moves. For applicative work this includes the success criteria built in the `Build` phase of the `L4'` loop.

**`/Self/Thought/Discovery/`** (P4/Son) — execution results, findings, state changes. What actually happened when the intervention was made. Raw material for verification and synthesis.

**`/Self/Thought/Insight/`** (P5/Image) — verified synthesis, durable takeaways, compact handoffs. The level-5 compression of objective work. What holds and can be carried forward. The target for near-completion compression.

### Subjective Six (L4 / P' Night / Power Unit)

These track the lived encounter with the inquiry:

**`/Self/Thought/Being/`** (P0'/Play) — what sort of world or issue is showing up. The ontological register: how this inquiry is being encountered at the level of what it is, not just what it requires. What kind of situation is this?

**`/Self/Thought/Thrownness/`** (P1'/Need) — givens, inheritance, factical constraints. What is already there before the inquiry begins — the history, the limits that were not chosen, the conditions that shape what is possible.

**`/Self/Thought/Presence/`** (P2'/Sacrifice) — immediate encounter and lived disclosure. How the inquiry is showing up right now — mood, attention, what is foregrounded in the immediate engagement.

**`/Self/Thought/Temporality/`** (P3'/Decision) — sequence, timing, urgency, latency, horizon. How time is shaping the inquiry: what has to happen before what, what is pressing, what is deferred, what the horizon looks like.

**`/Self/Thought/Care/`** (P4'/Love) — stake, concern, valence, why it matters. What is actually at stake in this inquiry for the people inside it. What would be lost if it were handled badly.

**`/Self/Thought/Releasement/`** (P5'/Work) — unclenching, reframing, subjective synthesis. The level-5 compression of subjective work. What can be released, what is seen differently, what the encounter has changed in the knower. The subjective counterpart to `Insight`.

## Operational Rules

**Artifacts are active, not archival.** Create them to support the live run, not to document after the fact. They are most useful when they are being written and read during the work, not as a record produced at the end.

**Use only the families that actually moved.** An artifact in `Traces/` should reflect an actual hypothesis that was active in the run. Populating all twelve families because they exist is not the point — the point is faithful tracking of actual movement.

**For `klein` runs, paired subjective and objective notes are often right.** The doubled encounter of a klein topology typically means both sides of the encounter axis are doing real work, and both sides of the artifact field should be populated.

**For `lemniscatic` runs, record what changed at each recursive fold.** The contextual reframing that happens at `P4` in a lemniscatic run should be legible in the artifacts — what the earlier positions looked like before the fold, and how they look different after it.

**Use artifacts to support handoff, not to dump raw token residue.** Artifacts that exist only to demonstrate work was done are not artifacts — they are noise. Each note should support the next move, whether that next move is in the same session or the next one.

## The /Self/ Folder

The Thought field lives within a broader `/Self/` directory at the session root:

```
/Self/
├── Thought/          (12 artifact families)
│   ├── Questions/    (P0/Truth)
│   ├── Traces/       (P1/Mind)
│   ├── Challenges/   (P2/Word)
│   ├── Patterns/     (P3/Logos)
│   ├── Discovery/    (P4/Son)
│   ├── Insight/      (P5/Image)
│   ├── Being/        (P0'/Play)
│   ├── Thrownness/   (P1'/Need)
│   ├── Presence/     (P2'/Sacrifice)
│   ├── Temporality/  (P3'/Decision)
│   ├── Care/         (P4'/Love)
│   └── Releasement/  (P5'/Work)
├── anu/              (user identity + logs)
│   ├── profile.md    (pithy user identity — weekly Claude memory realignment)
│   └── daily/        (YYYY-MM-DD/ subdirs for user logs)
└── aham/             (agent session logs)
    └── daily/        (YYYY-MM-DD/ subdirs for session logs, reading logs, etc.)
```

The init hook validates this structure at session start and creates any missing directories. `/Self/anu/` tracks the user (anu = atom, the individual); `/Self/aham/` tracks the agent (aham = I-consciousness, the agent's reflective awareness). Both feed back into Thought — especially Insight and Releasement — as the eventual resting place for compressed session and reading artifacts.

## Session Metadata

Every Thought artifact should carry clear, direct metadata:

- **Session ID** — identifies which session produced the artifact
- **Skill source** — which skill was active when the artifact was created
- **Timestamp** — when the artifact was created or last updated

This metadata is genuinely useful for cross-session continuity, not bureaucratic overhead. Keep it simple.

## Persistence Conditions

When filesystem access does not exist: keep the artifact model internal. Track what would have gone into the field. Do not pretend files were created.

When filesystem access exists: create and update artifacts as the run moves. The value is in the active use during the run and the durable handoff at the end.

## The Compression Obligation

Near compaction, handoff, or session completion, the active artifact field should be compressed. Objective work compresses toward `Insight`. Subjective work compresses toward `Releasement`. The goal is a durable handoff, not a preserved pile of notes.

See `session-reflection-and-compression.md` for the compression sequence.
