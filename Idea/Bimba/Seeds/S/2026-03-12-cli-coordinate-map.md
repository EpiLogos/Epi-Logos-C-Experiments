---
coordinate: "S0-4"
c_1_ct_type: "CT1"
c_3_created_at: "2026-03-12"
c_4_artifact_role: "reference"
c_4_invocation_profile: "operator_map"
c_0_source_coordinates: ["S0", "S1", "S2", "S3", "S4", "S5", "M0'", "M1'", "M2'", "M3'", "M4'", "M5'"]
---

# CLI Coordinate Map

Canonical reference for the live `epi` command surface after the 2026-03-12
coordinate reorganisation. This file documents what is actually present on
`main`, not merely the target shape imagined by the planning seed.

## Reading Rules

1. `S0-S5` = infrastructure / implementation strata.
2. `M0'-M5'` = consciousness-domain strata surfaced through the CLI.
3. `agent techne` is the coordinate-correct home for craft tooling.
4. Top-level `techne` and top-level `code` still exist as compatibility /
   utility surfaces.
5. `epii` is the canonical M5' surface.
6. `portal` remains the composed M' runtime container.

## Removed / Migrated Surfaces

- `epi vault kairos` is gone; use `epi gate kairos`
- top-level `epi notebook` is gone; use `epi agent techne notebook`
- top-level `epi vimarsa` is gone; use `epi epii vimarsa`
- `epi techne gnosis` is gone; use `epi epii gnosis`

## Top-Level Tree

```text
epi
├─ core
├─ vault
├─ graph
├─ gate
├─ agent
├─ sync
├─ sesh
├─ book
├─ techne            (compatibility / utility surface)
├─ app
├─ up
├─ code              (compatibility / utility surface)
├─ nara
├─ epii
├─ anuttara
├─ paramasiva
├─ parashakti
├─ mahamaya
├─ portal
└─ help
```

## S-Layer Map

### S0 — `epi core`

```text
epi core
├─ inspect <coordinate>
├─ verify
├─ dump
├─ cf
├─ operators
├─ dashboard
├─ walk [--steps]
├─ hash <coordinate>
├─ walk-tui
├─ families
├─ m5
└─ knowing
   ├─ [coordinate]
   ├─ --family <family>
   ├─ --update <text>
   ├─ --coverage
   ├─ --export
   ├─ --bake
   ├─ --open <index>
   ├─ --glow <index>
   ├─ --project <name>
   ├─ --limit <n>
   ├─ --refresh
   ├─ --quick
   └─ --tui
```

### S1 — `epi vault`

```text
epi vault
├─ status
├─ create <note> [-c|--content] [-v|--vault]
├─ read <note> [-v|--vault]
├─ search <query> [-v|--vault]
├─ search-content <query> [-v|--vault]
├─ daily [-v|--vault]
├─ frontmatter-get <note> [--key] [-v|--vault]
├─ frontmatter-set <note> <key> <value> [-v|--vault]
├─ frontmatter-delete <note> <key> [-v|--vault]
├─ frontmatter-validate <note> [-v|--vault]
├─ move <note> <new-path> [-v|--vault]
├─ delete <note> [-v|--vault]
├─ now-read
├─ now-write <content>
├─ set-default <vault-name>
├─ open <note> [-v|--vault]
├─ thought-route --position <0-5> --content <text> [--session-id] [--coordinate] [--now]
├─ template-invoke <template-type> [--coordinate] [--session-id] [--now]
├─ day-init [--now]
├─ now-init --session-id <id> [--now]
├─ archive-day <yyyy-mm-dd> [--plan] [--force]
├─ flow-init [--now]
└─ pasu
   ├─ show
   ├─ get <field>
   └─ set <field> <value>
```

### S2 — `epi graph`

```text
epi graph
├─ init
├─ bootstrap
├─ update
├─ reconcile
├─ bootstrap-dev [--dry-run]
├─ doctor
├─ status
├─ up
├─ down
├─ query <coordinate> [--level] [--depth]
├─ sync [path]
├─ retrieve <coordinate> [--nested]
├─ graphrag <query> [--depth]
├─ hybrid <query> [--top-k]
├─ import [dataset]
└─ redis
   ├─ status
   ├─ flush
   └─ stats
```

### S3 — `epi gate`

```text
epi gate
├─ status
├─ start [--port]
├─ stop
├─ config
│  ├─ show
│  ├─ schema
│  ├─ set <key> <value>
│  ├─ patch <json>
│  ├─ apply [patch]
│  └─ tui
├─ methods
├─ inspect
├─ subscribe
├─ pair
├─ bootstrap
├─ workspace
└─ kairos
   ├─ status
   ├─ fetch [--force]
   └─ show
```

### S4 — `epi agent`

```text
epi agent
├─ plugin validate <path>
├─ plugins list
├─ skill validate <path>
├─ subagent validate <path>
├─ hooks
│  ├─ validate <path>
│  └─ test --event <name> --fixture <file> <path>
├─ install [--agent]
├─ doctor [--agent]
├─ extensions
│  ├─ sync [--agent]
│  ├─ status [--agent]
│  └─ list [--agent]
├─ agents
│  ├─ init
│  ├─ add <id>
│  ├─ list
│  └─ remove <id>
├─ models
│  ├─ status [--agent]
│  └─ add --provider <provider> --model <model> [--agent] [--name]
├─ auth
│  ├─ status [--agent]
│  └─ set --provider <provider> --api-key <key> [--agent] [--base-url]
├─ spawn [--agent] [--plugin-dir ...] [prompt]
├─ attach [--agent] <session-id>
├─ run [--agent] [--plugin-dir ...] <args...>
├─ chat [--agent] [prompt]
├─ session
│  ├─ init [--now] [--random-suffix]
│  ├─ status
│  ├─ continue [session-id]
│  └─ close
├─ techne
│  ├─ ctlg <url> [prompt]
│  ├─ notebook
│  │  ├─ ask <question...>
│  │  ├─ list
│  │  ├─ setup
│  │  └─ raw <args...>
│  ├─ quote <text>
│  ├─ cmux <args...>
│  ├─ code
│  │  ├─ claude <args...>
│  │  ├─ kimi <args...>
│  │  ├─ glm <args...>
│  │  ├─ deepc <args...>
│  │  ├─ codex <args...>
│  │  └─ gemini <args...>
│  └─ wt <args...>
└─ vak evaluate <task> [--json]
```

### S5 — `epi sync`

```text
epi sync
└─ status
```

## Utility / Compatibility Surfaces

These exist at top level but are not the preferred ontological homes when a
coordinate-correct nested surface exists.

### `epi techne`

Compatibility craft surface:

```text
epi techne
├─ ctlg <url> [prompt]
├─ notebook <args...>
├─ quote <text>
├─ cmux <args...>
└─ wt <args...>
```

### `epi code`

Compatibility provider-launch surface:

```text
epi code
├─ claude <args...>
├─ kimi <args...>
├─ glm <args...>
├─ deepc <args...>
├─ codex <args...>
└─ gemini <args...>
```

### Other top-level utilities

```text
epi sesh
├─ launch
├─ kill
├─ killall
└─ banner

epi book
├─ open [file]
├─ zen <file>
├─ ingest <source>
├─ ask <question> [--book]
├─ list
└─ status

epi app
├─ launch
├─ dev
└─ build

epi up [--no-app] [--no-graph] [--no-tmux] [--attach] [--port]

epi portal [--reset] [--tab <personal|structural|0|1>] [--layout <name>]

epi help [mission|architecture|install|cli|coordinates|plugin]
```

## M'-Layer Map

### M4' — `epi nara`

```text
epi nara
├─ wind [--birth-date] [--birth-time] [--birth-lat] [--birth-lon] [--profile] [--force]
├─ clock [--json]
├─ kairos [--json] [--planets]
├─ identity
│  ├─ show [--json]
│  ├─ layers [--json]
│  ├─ compute
│  └─ layer-set <layer> <source>
├─ decan [--json]
├─ resonance [--json]
├─ project [--json]
├─ oracle
│  ├─ cast --system <name> --question <text> [--yes] [--method]
│  ├─ decan [--json]
│  ├─ payload [--cast-id] [--json]
│  ├─ payload-apply --target <target>
│  ├─ interpret --cast-id <id> --mode <mode>
│  ├─ hygiene [--cast-id]
│  └─ history
├─ medicine
│  ├─ balance [--json]
│  ├─ chakra [--json]
│  ├─ materia [--json]
│  ├─ prescribe [--context]
│  └─ safety [--practice]
├─ transform
│  ├─ status [--json]
│  ├─ write [--note]
│  ├─ reflect --cycle-id <id> [--note]
│  ├─ recipe [--json]
│  ├─ commit --operation <name> [--note]
│  └─ history [--open] [--json]
├─ lens
│  ├─ list [--json]
│  ├─ apply --lens <name> [--target]
│  ├─ jungian [--json]
│  ├─ trika [--json]
│  ├─ phenomenal [--json]
│  └─ synthesize --lenses <csv> [--target]
├─ pratibimba
│  ├─ stats [--json]
│  ├─ recent [--days] [--json]
│  ├─ record --cycle-id <id> [--lens]
│  ├─ excavate --term <text> [--json]
│  ├─ atlas-sync [-y|--yes]
│  └─ atlas-query [--coordinate] [--json]
├─ logos
│  ├─ run [--date] [--stage] [--json]
│  ├─ status [--json]
│  ├─ stage --stage <n> [--date] [--json]
│  ├─ curriculum [--json]
│  ├─ export [--date] [-y|--yes]
│  └─ weekly [--json]
└─ status [--json]
```

### M5' — `epi epii`

```text
epi epii
├─ knowing <coordinate> [--project] [--limit] [--refresh] [--quick] [--json]
├─ gnosis
│  ├─ context
│  │  ├─ create <name>
│  │  ├─ list
│  │  └─ delete <name>
│  ├─ ingest <source> [--context] [--source-type]
│  ├─ query <question> [--context] [--top-k]
│  └─ status
├─ vimarsa <existing vimarsa subcommands>
├─ logos <existing logos subcommands>
├─ chat [prompt]
└─ fsm [--json]
```

`epii vimarsa` reuses the existing Vimarsa command set; `epii logos` reuses the
existing Logos command set already present under `nara`.

### M0'-M3' Stub Surfaces

Each of the structural M' domains currently declares the full sixfold sub-shape
but only emits stub identity text.

```text
epi anuttara   ─ ground | form | entity | process | context | synthesis
epi paramasiva ─ ground | form | entity | process | context | synthesis
epi parashakti ─ ground | form | entity | process | context | synthesis
epi mahamaya   ─ ground | form | entity | process | context | synthesis
```

## Canonical Usage Guidance

- Use `epi agent techne ...` for craft operations.
- Use `epi epii gnosis ...` for local ingestion / context / retrieval.
- Use `epi epii vimarsa ...` for reflective knowledge navigation.
- Use `epi gate kairos ...` for temporal authority.
- Treat top-level `techne` and top-level `code` as convenience surfaces, not as
  the final ontological map.
