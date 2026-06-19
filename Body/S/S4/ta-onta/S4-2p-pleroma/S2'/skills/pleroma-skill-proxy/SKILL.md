---
name: pleroma-skill-proxy
description: Project the central Epi-Logos skill store into native harness skill directories as live symlinks and attach CF identity.
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# pleroma-skill-proxy

`pleroma-skill-proxy` is the launch-time skill projector for constitutional sub-sessions.
Run it before the first turn of any external harness session.

Central store, in first-wins order:

- Pleroma atomic tools: `Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/`
- Anima orchestration skills: `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/`
- Aletheia tools: `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/`
- epi-logos plugin skills: `Body/S/S5/plugins/epi-logos/skills/`

Projection targets:

- `claude-native` -> `<worktree>/.claude/skills/`
- `codex-native` -> `${CODEX_HOME:-<worktree>/.codex}/skills/`
- `hermes-acp` -> `${HERMES_ACP_SKILLS_DIR:-<worktree>/.agents/skills/}`
- `pi` -> native extension skill registration; no symlink projection is needed.

Use symlinks only. Do not copy `SKILL.md`; a central edit must be immediately visible through every projected harness path.

## Launcher Step

From the worktree root:

```bash
node "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/pleroma-skill-proxy/skill-projector.mjs" \
  --repo-root "$PWD" \
  --cf-identity "$CF_IDENTITY" \
  --harness claude-native \
  --harness codex-native \
  --harness hermes-acp \
  --json
```

Each target receives:

- one symlink per central skill directory;
- `.epi-skill-projection.json`, the deterministic projection manifest;
- `.epi-skill-projection.env`, containing `CF_IDENTITY` and `EPI_SKILL_PROJECTION`.

The launcher must export `CF_IDENTITY` into the child process environment. The `.env` file is a handoff artifact for harness launchers that need a sourceable form.

## Conflict Discipline

If a target already has a non-symlink skill with the same name, leave it untouched and report it in `skipped`.
If a target has an old symlink for that name, replace it with the central-store symlink.
Projection is idempotent: rerunning the same command must not change already-correct symlinks.

## Verification

Run:

```bash
node --test "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/pleroma-skill-proxy/skill-projector.test.mjs"
```
