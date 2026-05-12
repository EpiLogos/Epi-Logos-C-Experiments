# Installing Epi-Logos for Claude Code

The plugin bundle lives in the `epi-logos/` subdirectory of this repository.

## Local Testing

Run Claude Code pointing at the plugin directory:

```bash
claude --plugin-dir /path/to/repo/epi-logos
```

Inside Claude Code, verify the install:

- run `/help` and confirm plugin commands appear under the `epi-logos` namespace
- try `/epi-logos:diagnose`
- try `/epi-logos:explore`
- try `/epi-logos:apply`
- try `/epi-logos:explain`

While editing the plugin, reload without restarting:

```text
/reload-plugins
```

## Marketplace Distribution

Once this repository is hosted, add it as a marketplace source from inside Claude Code:

```text
/plugin marketplace add <owner-or-repo>
```

The marketplace entry is defined in `.claude-plugin/marketplace.json`.

## Claude Desktop Note

Claude Desktop uses `.mcpb` desktop extensions — a different host surface from Claude Code plugins. If you want Epi-Logos inside the Claude Desktop app, the next step is to build a thin desktop-extension wrapper around this plugin bundle. That wrapper should stay thin and should not redefine the Epi-Logos architecture.

## SwarmVault Writing Vault

For Pi-agent writing and Obsidian-style argument graph work, install Node.js 24 or newer and SwarmVault:

```bash
npm install -g @swarmvaultai/cli
```

From the repository root:

```bash
epi-logos/scripts/vault/init-vault.sh
epi-logos/scripts/vault/install-pi-agent.sh
epi-logos/scripts/vault/compile-vault.sh
```

Generated SwarmVault artifacts live under the runtime field: `Thought/Vault/raw/`, `Thought/Vault/wiki/`, `Thought/Vault/state/`, `Thought/Vault/agent/`, and `Thought/Vault/inbox/`. The activation files `swarmvault.config.json` and `swarmvault.schema.md` live at the repository root.

`install-pi-agent.sh` also writes Pi-readable activation files to `Thought/Vault/agent/pi-agent.md` and `Thought/Vault/agent/skill-index.md`, and links each Epi-Logos skill into `~/.codex/skills/` and `~/.agents/skills/` for hosts that discover skills directly.

After the first successful compile, start with `swarmvault.schema.md`, `Thought/Vault/wiki/index.md` or `Thought/Vault/wiki/INDEX.md`, `Thought/Vault/wiki/graph/report.md`, and `Thought/Vault/agent/skill-index.md` when present before broad raw-source search.
