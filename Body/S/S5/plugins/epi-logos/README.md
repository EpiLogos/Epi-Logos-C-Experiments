# Epi-Logos Plugin

This is the plugin bundle. See the repository root README for full context, install instructions, and an overview of the architecture.

## Bundle Contents

```
epi-logos/
├── .claude-plugin/     Claude Code host manifests
├── .codex/             Codex host install notes
├── .pi-agent/          Pi activation manifest and install notes
├── skills/             executable skills
├── commands/           command wrappers
├── resources/          canon summaries, pedagogy, topologicals
│   ├── canon/          primary skill-facing resources
│   ├── vault-schema/   SwarmVault operating schema template
│   ├── pedagogy/       structured teaching materials
│   └── ...             raw research corpus
├── agents/             specialist agent prompts
├── docs/               design specs and notes
├── scripts/            validation and SwarmVault wrapper tooling
└── tests/              scaffold checks
```

## Entry Point

`skills/using-epi-logos` is the bootstrap. Every other skill routes through it.

## SwarmVault Surface

`skills/epi-logos-vault-compiler` is the primary skill for SwarmVault-backed writing work. It uses the repo-root `swarmvault.config.json` and `swarmvault.schema.md`, with generated vault artifacts under `Thought/Vault/`:

- `swarmvault.schema.md`
- `Thought/Vault/raw/`
- `Thought/Vault/wiki/`
- `Thought/Vault/state/`
- `Thought/Vault/agent/`
- `Thought/Vault/inbox/`

Wrapper scripts live in `scripts/vault/`:

```bash
scripts/vault/init-vault.sh
scripts/vault/install-pi-agent.sh
scripts/vault/compile-vault.sh
scripts/vault/lint-vault.sh
scripts/vault/build-context-pack.sh "<goal>"
```

Run these from the repository root. SwarmVault requires Node.js 24 or newer and the `swarmvault` CLI.

## Pi Agent Surface

Pi activation is documented in `.pi-agent/`. SwarmVault's native `--agent pi` path writes repo rules into `AGENTS.md`; Epi-Logos layers plugin activation on top by generating:

- `Thought/Vault/agent/pi-agent.md`
- `Thought/Vault/agent/skill-index.md`
- `Thought/Vault/agent/epi-logos.pi-plugin.json`

The generated skill index points Pi-style agents at each individual `skills/<name>/SKILL.md` directory.

SwarmVault source scope:

- `epi-logos/resources/**` is the primary corpus.
- `epi-logos/skills/**` is the executable surface that should be cross-linked to resources.
- `Thought/Vault/**` is generated runtime state and should not be bulk-ingested as canonical theory.

## Validation

```bash
bash tests/run-scaffold-checks.sh
```
