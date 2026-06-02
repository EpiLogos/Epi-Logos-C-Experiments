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

## Vault-First Architecture Context

For this repository, Epi-Logos work treats `Idea/` as the living knowledge body, not a passive notes folder.

- `Idea/Bimba/World/` is the crystallised architecture surface: flat definition forms, coordinate synthesis documents, stable CT/P/L forms, and `World/Types/{Type}/{Type}.canvas` MOC/type indexes.
- `Idea/Bimba/Seeds/` is the planning/spec/source surface: architecture packs, S/M shard specs, traceability indexes, promoted planning material, and migration mirrors for load-bearing `/docs/specs` and `/docs/plans` files.
- `/docs/specs`, `/docs/plans`, and `/docs/resources` are legacy/source strata unless a Seed file explicitly cites or mirrors them.

Agents using this plugin should discover architecture through the vault before treating the repository as a flat file tree:

```bash
epi core knowing S1' --json
epi vault search "ARCHITECTURE-DIAGRAM-PACK"
epi vault search-content "World/Types"
epi vault read Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md
epi vault link-suggest Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md --source-coordinate "S1'"
```

The goal is to let wikilinks do real work: plans, specs, diagrams, coordinate definitions, and development goals should become navigable from inside `Idea/` through Hen/S1' law, then graph-promotable through S2 when appropriate.

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
