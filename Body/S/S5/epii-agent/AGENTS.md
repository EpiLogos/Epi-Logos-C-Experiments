# AGENTS.md — epii-agent

## Purpose
Contract + ledger directory for the Epii pi_agent: `agent-contract.json` declares `agent_id: "epii"`, coordinate `S5/S5'`, `agent_kind: pi_agent`, peer to Anima.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `agent-contract.json` — Epii agent contract: gateway methods (`s5'.epii.*`, `s5'.review.*`, `s5'.improve.*`), spines (`autoresearch`, `review_inbox`), inbox/autoresearch contracts, authority/forbidden-authority, entitlement (resource package `epi-logos`).
- `contract-ledger/` — Track 09 (Agentic Mediation) preflight ledger: `track-09-preflight.json` (machine-readable surface inventory + readiness blockers), `track-09-preflight.md` (orientation), `evidence/` (CLI VAK baselines + verification summary).
- Does NOT own runtime code: the Epii access core is `epii-agent-core/` (crate `epi-s5-epii-agent-core`); the spines are backed by `epii-autoresearch-core/` / `epii-review-core/`; plugin/skill registry lives at `Body/S/S5/plugins/`. This directory holds only the contract declaration and its preflight ledger.

## Local Contracts
- `agent-contract.json` — the binding Epii pi_agent interface (gateway methods, deposit/request boundaries, entitlement; entitlement parsed by `ta-onta/shared/entitlement-loader.ts`).
- `contract-ledger/track-09-preflight.json` — frozen Track 09 contract surface inventory (owner / readiness / privacy_gate per field).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]]; parent [[S-SYSTEM-INDEX]]. No code Coordinate Header here (no `src/`).

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- Layer contract test (consumes `agent-contract.json`): `python3 -m unittest Body/S/S5/tests/test_epii_agent_contract.py`.
- Ledger re-run (per `track-09-preflight.md`): `~/.cargo/bin/epi agent vak evaluate "<task>" --json` and `~/.cargo/bin/epi agent roster list --json`.

## Child DOX Index
- (leaf)
