# Epi-Logos Plugin

Coordinate self-knowledge and development workflow integration for Claude Code, Codex, and PI agent.

**Version:** 0.1.0 (tracks `epi` CLI version)

## Skills

| Skill | Description |
|-------|-------------|
| `epi-knowing` | Coordinate self-knowledge via `epi core knowing` — use during development to ground actions in the QL coordinate system |

## Resources

- `resources/qv/overlay.json` — Default QV overlay shipped with the plugin (59/89 coordinates populated)
- `resources/qv/schema.json` — JSON schema for the overlay format

## Scripts

- `scripts/install.sh` — Install skills and default resources to `~/.epi-logos/`

## Installation

### Claude Code (manual)
```bash
cp skills/*.md ~/.claude/skills/
./scripts/install.sh
```

### PI Agent
```bash
cp skills/*.md /path/to/.pi/skills/
./scripts/install.sh
```

### Prerequisites
- `epi` CLI installed (`cargo install --path epi-cli/`)
- `~/.cargo/bin` in PATH
