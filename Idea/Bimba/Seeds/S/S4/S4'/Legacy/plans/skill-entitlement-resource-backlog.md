# Skill-Entitlement Resource Backlog (VAK / Anima / Pleroma)

**Status:** backlog · **Owning coordinate:** S4' (S4-4p-anima skills, S4-2p-pleroma skills)
**Context:** Agent skill entitlement is now a hard-gate (`ta-onta/shared/entitlement.ts`). An
agent's `skills:` frontmatter is the *intended* allowlist; the *effective* set is
`universe ∩ allow − deny`, where the universe = skills actually present in the injectable
roots (`S4-4p-anima/S4'/skills`, `plugins/pleroma/skills`, and for peer pi_agents their own
resource package). A planned-but-not-yet-ported skill stays in the allowlist and simply does
not inject until its resource lands — no error, graceful degradation.

This file tracks the planned skills already declared in agent allowlists whose **resources do
not yet exist in an injectable root**. "Develop the resource" usually means *port* an existing
skill from another repo into the owning ta-onta/pleroma skill root; one is net-new.

## Planned skills → source → target root

**Status update (2026-06-02):** All resources with a real backing SKILL.md have been ported into
the injectable roots. The two aletheia gnosis tools (`gnosis-retrieve`, `thought-distil`) remain
genuinely missing — no real SKILL.md exists in either repo or any source location. The entitlement
universe grew: anima `S4'/skills` 13→14 (+`darshana`), `plugins/pleroma/skills` 15→23 (+8). Both
entitlement tests stay green (`entitlement_universe.test.ts`, `entitlement_contract.test.ts`).

| Skill | Declared on agent(s) | Source used (real SKILL.md) | Landed target root | Status |
|---|---|---|---|---|
| `deepsearch` | logos | `.codex/omx-runtime/skills/deepsearch` (== vendors copy) | `Body/S/S4/plugins/pleroma/skills/deepsearch` | ✅ PORTED |
| `ask-claude` | logos | `.codex/skills/ask-claude` | `Body/S/S4/plugins/pleroma/skills/ask-claude` | ✅ PORTED |
| `ask-gemini` | logos | `.codex/skills/ask-gemini` | `Body/S/S4/plugins/pleroma/skills/ask-gemini` | ✅ PORTED |
| `ai-slop-cleaner` | eros | `.codex/skills/ai-slop-cleaner` | `Body/S/S4/plugins/pleroma/skills/ai-slop-cleaner` | ✅ PORTED |
| `security-review` | eros | `.codex/skills/security-review` | `Body/S/S4/plugins/pleroma/skills/security-review` | ✅ PORTED |
| `analyze` | mythos | `.codex/omx-runtime/skills/analyze` (== vendors copy) | `Body/S/S4/plugins/pleroma/skills/analyze` | ✅ PORTED |
| `ralph` | anima | `.codex/skills/ralph` | `Body/S/S4/plugins/pleroma/skills/ralph` | ✅ PORTED |
| `ultrawork` | anima | `.codex/skills/ultrawork` | `Body/S/S4/plugins/pleroma/skills/ultrawork` | ✅ PORTED |
| `darshana` | anima | PRIOR repo `Epi-Logos/Idea/epi-claw/skills/repl` (the Darshana REPL — ships `darshana.py`) | `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/darshana` (SKILL.md authored as `name: darshana` + `darshana.py`) | ✅ PORTED |
| `repl` (refresh) | anansi (S5') | PRIOR repo `Epi-Logos/Idea/epi-claw/skills/repl/darshana.py` | `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/repl/darshana.py` (added missing script; repo SKILL.md kept) | ✅ REFRESHED |
| `ouroboros` (eval) | anima, psyche | prior `Epi-Logos/Idea/epi-claw/skills/ouroboros` is the OLDER ralph-tui/tmux "Consensual Self-Surgery" conception (16k) | already at `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/ouroboros` (refined `port-and-refine` Lemniscate version, 6.6k) | ⏭️ LEFT AS-IS (existing is the deliberately refined repo-canon; not a thinner version of the same — do not overwrite) |
| `aletheia:gnosis-retrieve` | nous (`gnosis-retrieve`), anansi, moirai | — NONE. No real SKILL.md anywhere. Searched: prior repo `epi-claw/{skills,extensions/pleroma/skills,modules/aletheia/skills}`, this repo `.codex/{skills,omx-runtime/skills}`, `vendors/*/skills`, `S4-2p-pleroma/staged/pleroma-skills/**`, full-repo filename + content grep. Only aspirational references in `CONTRACT.md` (`gnosis-retrieve.md`) and agent specs. | aletheia `S5'/skills/gnosis-retrieve` (backing dir name = colon-suffix) | ❌ NOT FOUND — net-new, needs development (no real resource to port; no stub created) |
| `aletheia:thought-distil` | moirai | — NONE. Same search as above; only `CONTRACT.md` aspirational `thought-distil.md`. | aletheia `S5'/skills/thought-distil` | ❌ NOT FOUND — net-new, needs development (no real resource; no stub created) |

Notes:
- **Namespace resolution:** `aletheia:gnosis-retrieve` / `aletheia:thought-distil` use the `aletheia:`
  namespace prefix (agent-team splits on the first colon). The backing skill-dir names are therefore
  the colon-suffix: `gnosis-retrieve` and `thought-distil`. `repl` (declared bare by anansi) and
  `aletheia:repl` (z-thread) both resolve to the existing dir `repl`.
- `darshana` and `repl` are the SAME upstream artifact (the Darshana REPL, `darshana.py`). Per the
  S4-TA-ONTA-EXTENSION-SPEC, `darshana` is anima's atomic pre-ingestion/structural-gaze skill while
  `repl` is aletheia's (anansi's) document navigator — so the script is landed in BOTH roots with
  role-appropriate SKILL.md.
- `systematic-debugging` (logos/mythos) and `executing-plans`/`finishing-a-development-branch`
  (psyche/sophia) are declared but live in the superpowers layer; left there per prior guidance
  (not entitlement-backlog targets).
- The `epi-logos` source repo (`vendors/epi-logos` → `Body/S/S5/plugins/epi-logos/skills`) is the
  prior-project home referenced for resource development; it currently supplies epii's package
  skills (apply-cmea, run-l4-prime-loop, …), not the VAK/anima ones above.

### Additional skills extracted from the VAK/pleroma planning files (audit)
Grepping the planning files (`2026-05-19-vak-musical-execution-z-thread.md`,
`2026-04-04-omx-vak-skill-fork-{plan,handover}.md`, `2026-03-07-s4-prime-pleroma-real-port-plan.md`,
`pleroma-real-port-development-prompt.md`) surfaced every referenced skill. Cross-referenced against
the three injectable roots, the remaining *not-present* names are NOT entitlement-backlog targets and
were intentionally not ported:
- **Atomic pleroma tool skills** (real SKILL.md staged at `S4-2p-pleroma/staged/pleroma-skills/atomic/`,
  not yet promoted, and NOT declared in any active VAK/aletheia agent `skills:` allowlist except
  `techne-helper`): `tmux`, `cmux`, `mprocs`, `worktrunk`, `gitbutler`, `ralph-tui`, `notebooklm`,
  `pleroma-skill-proxy`, `onecontext`, `bkmr`. (`techne-helper` declares `tmux,cmux,worktrunk` — these
  can be promoted later from the staged atomic set if techne-helper is to be entitlement-gated; out of
  scope for this resource pass since the task targeted the entitlement backlog + darshana/repl/ouroboros.)
- **Superpowers-layer skills** already present or layer-resident: `brainstorming`, `using-superpowers`,
  `writing-plans`, `test-driven-development`, `subagent-driven-development`, `dispatching-parallel-agents`,
  `verification-before-completion` (present in roots); `executing-plans`,
  `finishing-a-development-branch`, `requesting-code-review`, `using-git-worktrees` (superpowers layer).
- **Codex-layer**: `omx-setup`, `code-review` (codex runtime, not VAK injectable roots).
- **Not skills**: `fresh-design` / `port-and-refine` / `true-port` are `port_type` frontmatter values;
  `techne-spawn/relay/close/list` exist staged under the `technē-` (macron) names.

## Where this should be referenced
The deep-VAK / anima / pleroma planning files should link this backlog as the canonical list of
skill resources to develop:
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-vak-musical-execution-z-thread.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-omx-vak-skill-fork-plan.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md`

## epii ↔ epi-logos (resolved)
epii is a **peer pi_agent** (JSON contract `Body/S/S5/epii-agent/agent-contract.json`), not a
markdown specialist. The resolver is now open to JSON contracts
(`parseAgentEntitlementFromContract`). epii's `entitlement` block sources its skill universe from
its own resource package (`Body/S/S5/plugins/epi-logos/skills`) with empty allow = inherit the
whole package. **Remaining wire:** the epii persona's runtime activation must compute its effective
set (enumerate `skill_universe_roots` → `resolveEntitlement` with the contract layers) and gate
skill exposure — the same enforcement shape `agent-team.ts:dispatchAgent` uses for dispatched
specialists, applied at the epii pi-runtime entry.
