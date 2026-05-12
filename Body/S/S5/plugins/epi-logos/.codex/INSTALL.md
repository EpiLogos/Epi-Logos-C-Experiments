# Installing Epi-Logos for Codex

Enable Epi-Logos through Codex native skill discovery.

## Installation

1. Clone this repository.

2. Install the agent surface and skill links:

```bash
cd /path/to/repo
epi-logos/scripts/vault/install-pi-agent.sh
```

This links each child skill directory directly into both `~/.codex/skills/` and `~/.agents/skills/`, because skill discovery expects paths like `~/.codex/skills/using-epi-logos/SKILL.md`.

3. Restart Codex.

## Verify

```bash
ls -la ~/.codex/skills/using-epi-logos
ls -la ~/.agents/skills/using-epi-logos
```

You should see symlinks pointing at individual directories under `epi-logos/skills/`.

## Notes

- Canonical resources are in `epi-logos/resources/`.
- `Thought/` artifacts are active only when filesystem access is available in the current session or workspace. The `Thought/` directory lives at the repo root, not inside the plugin bundle.
- The bootstrap skill is `using-epi-logos`. Everything else in the plugin routes through it.
- For SwarmVault-backed writing work, install Node.js 24 or newer and the SwarmVault CLI:

```bash
npm install -g @swarmvaultai/cli
```

From the repository root:

```bash
epi-logos/scripts/vault/init-vault.sh
epi-logos/scripts/vault/install-pi-agent.sh
epi-logos/scripts/vault/compile-vault.sh
```

After the first compile, read `swarmvault.schema.md`, `Thought/Vault/wiki/index.md` or `Thought/Vault/wiki/INDEX.md`, `Thought/Vault/wiki/graph/report.md`, and `Thought/Vault/agent/skill-index.md` when present before broad raw-source search.
