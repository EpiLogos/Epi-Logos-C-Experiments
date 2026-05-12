# Installing Epi-Logos For Pi Agents

SwarmVault 3.12.0 supports `--agent pi`, but that install surface writes only to the shared repo-level `AGENTS.md`. It does not install a native Pi plugin, hooks, or skill bundle.

Epi-Logos therefore provides a thin Pi activation bundle in this directory:

- `plugin.json`: Pi-readable manifest for the Epi-Logos plugin surface.
- `../agents/pi-writing-cartographer.md`: role prompt for the Pi writing cartographer.
- `../../Thought/Vault/agent/pi-agent.md`: generated runtime activation prompt.
- `../../Thought/Vault/agent/skill-index.md`: generated skill index.

## Install

From the repository root:

```bash
epi-logos/scripts/vault/init-vault.sh
epi-logos/scripts/vault/install-pi-agent.sh
epi-logos/scripts/vault/compile-vault.sh
```

`install-pi-agent.sh` does four things:

- runs `swarmvault install --agent pi`
- restores the Epi-Logos-specific SwarmVault rules in `AGENTS.md`
- links each individual Epi-Logos skill into host skill discovery directories
- writes `Thought/Vault/agent/pi-agent.md`, `Thought/Vault/agent/skill-index.md`, and `Thought/Vault/agent/epi-logos.pi-plugin.json`

## Pi Activation

For Pi-style agents, use this order:

1. Read `AGENTS.md`.
2. Read `swarmvault.schema.md`.
3. Read `Thought/Vault/agent/pi-agent.md`.
4. Read `Thought/Vault/agent/skill-index.md`.
5. Load `using-epi-logos` first.
6. Route proactively to the specific skill needed by the task.

Treat `epi-logos/resources/**` as the canonical corpus and `epi-logos/skills/**` as the executable skill surface. Do not treat the whole `skills/` directory as one nested mega-skill.
