# AGENTS.md — ta-onta

## Purpose
Canonical S4' carrier source home: the six ta-onta carrier classes (khora/hen/pleroma/chronos/anima/aletheia), the S4-x custom ML skill carrier, plus the spine that composes their contributions into a single PI extension entry. No crate/package manifest here — it is a TypeScript runtime tree consumed by the parent S4 surface.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]]

## Ownership
- `composite-entry.ts` — PI `ExtensionAPI` entry; registers all six carrier spine contributions and wires the four seams (session_start/shutdown/before_compact + tool loads).
- `spine/compositor.ts` — `SpineCompositor` (injection assembly under char budget, phase-qualified overflow tokens, ledger extract, compiler passes, unified query).
- `spine/types.ts` — `SpineContribution` / `InjectionSlot` (including optional VAK dereference reference) / `LedgerChannel` / `CompilerPass` / `SessionContext` interfaces all carriers implement.
- `shared/` — `vak_address.ts` (VAK address mirror), `coordinate_phase.ts` (phase-preserving coordinate helper), `entitlement*.ts` (entitlement loader/model), `harness_registry.ts` (42.2 [[HarnessExecutor]] registry: harness_id → backing/launch-profile/model-families/subscription for pi / claude-native / codex-native / hermes-acp; `rosterPreflight` command-v availability set; `toGatewayRegistry()` projects the [[S3]] gateway-contract `harness.rs` wire shape — the registry is the single place a harness is added), and their `*.test.ts`.
- `plugin-runtime-bridge.ts` — loads runtime plugins from the registry into the PI session.
- `S4-{0..5}p-*` — the six carrier dirs (each with its own `CONTRACT.md`, `extension.ts`, `spine-contribution.ts`, `tests/`); also exposed via the lowercase symlinks `khora`/`hen`/`pleroma`/`chronos`/`anima`/`aletheia`.
- `S4-x/` — cross-carrier S4 skill surface for local-only [[Nara]] LoRA/corpus skills (`nara-voice-training`, `nara-journal-parser`, `mlx-lora`) serving [[E_4]] personal-energy inputs.
- `S4-x/` — custom ML skill carrier for local-only Nara LoRA skills (`mlx-lora`, `nara-voice-training`, `nara-journal-parser`) per [[M'-ML-SKILL-SURFACE-SPEC]].
- Does NOT own per-carrier domain law — that lives in each `S4-Np-<carrier>/CONTRACT.md` and the owning [[S4-SPEC]], not here.

## Local Contracts
- Spine interface contract: `spine/types.ts` (the `SpineContribution` surface every carrier must satisfy).
- Per-carrier contracts: each `S4-Np-<carrier>/CONTRACT.md`.
- Owning specs: [[S4-SPEC]], [[S4-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- No CONTRACT.md at this ta-onta root — see per-carrier CONTRACT.md + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- `shared/vak_address.ts` is a structural mirror of the canonical cross-repo VakAddress — preserve identical field names / string-literal unions when editing (see its header note).

## Verification
- ta-onta TypeScript test suites: `node --test Body/S/S4/ta-onta/shared/*.test.ts` (entitlement contract/universe + VAK address).
- Phase-preserving spine overflow: `node --test Body/S/S4/ta-onta/tests/spine_phase_overflow.test.ts`.
- No crate manifest here; `make rust-test` does not cover this dir.

## Child DOX Index
- `S4-0p-khora/AGENTS.md` — khora carrier (#0); CONTRACT + spine-contribution + S0/S0' modules.
- `S4-1p-hen/AGENTS.md` — hen carrier (#1); CONTRACT + spine-contribution + S1/S1'/M modules.
- `S4-2p-pleroma/AGENTS.md` — pleroma carrier (#2); CONTRACT + spine-contribution + S2/S2' modules.
- `S4-3p-chronos/AGENTS.md` — chronos carrier (#3); CONTRACT + spine-contribution + S3' modules.
- `S4-4p-anima/AGENTS.md` — anima carrier (#4); CONTRACT + spine-contribution + S4/S4' modules.
- `S4-5p-aletheia/AGENTS.md` — aletheia carrier (#5); CONTRACT + spine-contribution + S5/S5'/clusters/skills.
- `S4-x/AGENTS.md` — cross-carrier local-only [[Nara]] LoRA/corpus skill family for the [[E_4]] personal-energy substrate.
- `S4-x/AGENTS.md` — custom ML skill carrier for local-only Nara LoRA skill family.
