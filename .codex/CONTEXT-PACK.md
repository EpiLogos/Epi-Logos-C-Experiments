# Epi-Logos Builder Context Pack — Cycle 3 M' Development
# Generated 2026-06-13 by Hermes-Nara
# Load this BEFORE exploring the repo. Eliminates 80% of discovery tokens.

## Repository Map
- Code: Body/S/ (S-stack: S0 kernel, S1 hen, S2 graph, S3 gateway, S4 ta-onta, S5 epii)
- Code: Body/M/epi-theia/extensions/ (M' Theia extensions)
- Specs: Idea/Bimba/Seeds/M/M{N}'/M{N}'-SPEC.md + M{N}-ARCHITECTURE.md
- Plans: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/
- Bimba Map: Idea/Bimba/Map/datasets/ (coordinate-level canonical dataset)
- World: Idea/Bimba/World/ (crystallised forms, NOW.md)
- World/Types: Idea/Bimba/World/Types/Coordinates/ (MOCs, type canvases)

## M' Extension Map (Body/M/epi-theia/extensions/)
| Extension | Package | Purpose |
|---|---|---|
| m0-anuttara | @pratibimba/m0-anuttara | Anuttara witness-axis, 0/1 toggle, provenance pills |
| m1-paramasiva | @pratibimba/m1-paramasiva | Paramasiva ring, spine reader, Kaprekar display |
| m2-parashakti | @pratibimba/m2-parashakti | Parashakti planet/chakra cards, audio visual |
| m3-mahamaya | @pratibimba/m3-mahamaya | Mahamaya codon wheel, pentadic inspector |
| m4-nara | @pratibimba/m4-nara | Nara daily surface, kairos display, Mercurius relay |
| m5-epii | @pratibimba/m5-epii | Epii governance, ACR, operational capacities |
| ide-shell-m0-m5 | @pratibimba/ide-shell-m0-m5 | IDE chrome: activity bar, status bar, review/evidence panes |
| omnipanel-shell | @pratibimba/omnipanel-shell | OmniPanel: Pi Chat, Sessions, Dispatch Trace, Tool Stream, Evidence, Review, Gateway, Diagnostics tabs |
| integrated-composition | @pratibimba/integrated-composition | Shared composition substrate: events, readiness, deep-links, design primitives |
| plugin-integrated-1-2-3 | @pratibimba/plugin-integrated-1-2-3 | Cosmic composition engine (1-2-3 = Paramasiva/Parashakti/Mahamaya) |
| plugin-integrated-4-5-0 | @pratibimba/plugin-integrated-4-5-0 | Personal recognition engine (4-5-0 = Nara/Epii/Anuttara) |
| m-extension-runtime | @pratibimba/m-extension-runtime | Onboarding, readiness banners, shell runtime |
| acceptance-harness | @pratibimba/acceptance-harness | Visual regression, IOD-17 parity tests, topology tests |
| agentic-control-room | @pratibimba/agentic-control-room | REPURPOSED as Pi-runtime monitoring surface (DR-M5-1) |

## Inversify DI Pattern (used by ALL Theia extensions)
```typescript
// frontend-module.ts
import { ContainerModule } from 'inversify';
export default new ContainerModule((bind) => {
    bind(SomeService).toSelf().inSingletonScope();
    bind(SomeWidget).toSelf().inTransientScope();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        createWidget: () => ctx.container.get(SomeWidget)
    }));
});
// Common tokens: SHARED_BRIDGE_ADAPTER, KERNEL_BRIDGE_API, REVIEW_LANDING_SERVICE
// Import convention: do NOT import from browser barrels; use deep paths
```

## SharedBridgeAdapter (cross-extension observability)
```typescript
subscribeObservability({kind: string}): Observable<any>
publishObservability(kind: string, payload: any): void
// Common kinds: 'mercurius.kairos.delta', 'review.inbox.advance', 'evidence.packet.created'
```

## S-Layer Map (Body/S/)
| Crate | Path | Purpose |
|---|---|---|
| epi-lib | S0/epi-lib/ | C kernel: m0-m5 headers, LUTs, codon engine, tarot |
| portal-core | S0/portal-core/ | Rust kernel mirror: MathemeHarmonicProfile, KernelProjection |
| hen-compiler-core | S1/hen-compiler-core/ | Graph promotion, coordinate classification |
| graph-schema | S2/graph-schema/ | S2 schema validation, property constants |
| graph-services | S2/graph-services/ | Coordinate parsing, graph operations |
| gateway | S3/gateway/ | RPC gateway, spacetime, contemplation endpoint |
| gateway-contract | S3/gateway-contract/ | Gateway type contracts |
| ta-onta | S4/ta-onta/ | Extension carriers: Khora(Hen/Pleroma/Chronos/Anima/Aletheia) |

## Key Invariant Files (always read before kernel work)
- Body/S/S0/epi-lib/include/m3.h (1034 LOC — codon, tarot, hexagram, archetype LUTs)
- Body/S/S0/epi-lib/src/m3.c (1123 LOC — implementation + M3_TAROT_CODON_MAP)
- Body/S/S0/epi-lib/include/m0.h (M0 verifier + Anuttara grounding)
- Body/S/S0/portal-core/src/kernel.rs (MathemeHarmonicProfile + KernelProjection)
- Body/S/S0/portal-core/src/codon.rs (codon types + nucleotide arithmetic)

## Decision Register (DRs — all VALIDATED)
Path: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md
Key standing invariants:
- DR-M5-1: Pi=harness, Anima=dispatcher, 6 Aletheia subagent techne-guardians (NOT 7 peers)
- DR-M5-2: +1 parent = M1-5 (Paramasiva), not M0
- DR-MP-1: 4'-5'-0' = LLM(Nara)/EBM(Epii)/Verifier(Anuttara)
- DR-S4-TECHNE: Pleroma has two faces (VAK + Techne); Aletheia subagents are techne-guardians
- DR-M3-6: Third Spanda Equation as canonical matheme spine (137=64+72+1)

## Anti-Patterns (NEVER do these)
- NO new extensions without Frank's explicit approval
- NO greenfield rewrites of existing modules
- NO modals/dialogs for review surfaces (15.2 invariant)
- NO stub/fabricated data — data must come from C .rodata or real S2 graph
- NO importing from browser barrel files (use deep paths)
- DO NOT reimplement: enforceHumanGate, assertCapabilityParity (they're in omnipanel-runtime)
