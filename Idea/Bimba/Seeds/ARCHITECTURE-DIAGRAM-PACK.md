---
coordinate: "S/S'::M'"
c_4_artifact_role: "architecture-diagram-pack"
c_1_ct_type: "CT1"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-06-01"
c_0_source_coordinates:
  - "[[COORDINATE-MAP]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M-M-prime-coordinate-mapping-inaugural]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
  - "[[2026-05-31-theia-ide-shell-and-m-plugin-architecture]]"
  - "[[00-overview-and-sequencing]]"
  - "[[05-tauri-ide-shell-and-pratibimba-system]]"
---

# Architecture Diagram Pack: S/S' and M'

## Status

This is the current wikilinked architecture pack for the full [[S/S']] substrate, the full [[M']] coded expression, and the cross-system coupling between them.

Use it as an agent-first orientation surface before executing implementation work from the M-dev plan set. It is not a replacement for the seed specs. It is a bridge that keeps diagrams tied to the corpus:

- [[S-SYSTEM-INDEX]] remains the S/S' whole-system authority.
- [[S-SOURCE-TRACEABILITY-INDEX]] remains the S/S' source-routing authority.
- [[M'-SYSTEM-SPEC]] remains the M' umbrella authority.
- [[M-M-prime-coordinate-mapping-inaugural]] remains the M versus M' terminology guard.
- [[05-tauri-ide-shell-and-pratibimba-system]] records the active Theia-only recast.

Core invariant: **the coordinate system is the modular system.** [[S0]] is the command membrane and return surface; domain law belongs in its owning coordinate module, not in [[S0]] by convenience.

## Confirmed Current Shape

- [[S0]] / [[S0']] currently provides the `epi` command plane, local execution, kernel/profile bridge surfaces, and typed mirrors.
- [[S1]] / [[S1']] provides [[Idea]] vault residency, [[Hen]] compiler/frontmatter/wikilink law, and governed vault writes.
- [[S2]] / [[S2']] provides `:Bimba` graph, coordinate graph law, retrieval, sync, and semantic cache.
- [[S3]] / [[S3']] provides gateway, sessions, temporal context, Redis temporal state, SpaceTimeDB projection, and [[Graphiti]] runtime.
- [[S4]] / [[S4']] provides PI runtime, [[Anima]], VAK routing, ta-onta modules, and capability governance.
- [[S5]] / [[S5']] provides [[Epii]], review, autoresearch, [[Gnosis]], [[Nara]], kbase, and world-return governance.
- [[M']] currently centers on [[/pratibimba/system]] as one [[Theia]] shell with two layouts, one [[kernel-bridge]], six M extensions, two integrated plugins, and the [[Agentic Control Room]].
- [[Body/M/epi-tauri]] is migration-source-only under the active Theia-only recast; keep it as baseline evidence, not future authority.

## Diagram 1: System Landscape

```mermaid
flowchart TB
  Canon["Canonical coordinate law\nIdea/Bimba/Seeds\nM + S seed canon"]
  BridgeDocs["Living bridge docs\nCOORDINATE-MAP\nS-SYSTEM-INDEX\nM'/S' tracks"]
  Canon --> BridgeDocs

  subgraph SStack["S/S' substrate"]
    S0["S0\nCLI / command membrane\nexec, route, audit, return"]
    S1["S1/S1'\nIdea vault + Hen\nresidency, frontmatter,\nwikilink/compiler law"]
    S2["S2/S2'\nGraph services\nNeo4j :Bimba\nsemantic cache / retrieval"]
    S3["S3/S3'\nGateway runtime\nsessions, temporal context,\nSpaceTimeDB, Graphiti runtime"]
    S4["S4/S4'\nPI runtime + ta-onta\nAnima, VAK, capability matrix"]
    S5["S5/S5'\nEpii, review, autoresearch,\nGnosis, Nara, kbase"]
  end

  subgraph MPrime["M' coded expression"]
    Theia["/pratibimba/system\nsingle Theia shell"]
    Daily["daily-0-1 layout\nlean daily surface"]
    Deep["ide-deep layout\ndeep workbench"]
    KB["kernel-bridge\nfirst-loaded Theia extension"]
    Ext["six M extensions\nm0..m5"]
    Plugins["integrated plugins\n1-2-3 and 4-5-0"]
    ACR["Agentic Control Room\nM5-4 mediation window"]
  end

  subgraph Legacy["Residual / migration surfaces"]
    Tauri["Body/M/epi-tauri\nmigration-source-only"]
    OldBody["older /body React+Tauri\nbaseline tests + port source"]
  end

  BridgeDocs --> SStack
  BridgeDocs --> MPrime

  Theia --> Daily
  Theia --> Deep
  Theia --> KB
  KB --> Ext
  KB --> Plugins
  KB --> ACR

  KB -->|WS / JSON-RPC| S3
  S3 --> S0
  S3 --> S2
  S3 --> S4
  S3 --> S5
  S1 -->|direct read| Theia
  Theia -->|writes via Hen gateway| S3

  Tauri -. obsolete canonically .-> Theia
  Tauri -. migration source .-> OldBody
```

This captures the whole field: [[S/S']] substrate, active [[M']] Theia shell, [[kernel-bridge]], agent mediation, and major store/runtime boundaries. It intentionally omits per-method API lists.

## Diagram 2: S/S' Deep Structure

```mermaid
flowchart TB
  subgraph Authority["Authority layers"]
    Seed["Seed canon\nIdea/Bimba/Seeds/S"]
    Living["Living bridge\nS-SYSTEM-INDEX\ntraceability + residency law"]
    Code["Current code reality\nBody/S/* plus S0 mirrors"]
    Seed --> Living --> Code
  end

  subgraph Pairs["S <-> S' pairings"]
    S0["S0\ncommand membrane\nCLI, process, env,\naudit return"]
    S0p["S0'\nruntime schemas\nkernel/profile bridge\nvalidation contracts"]

    S1["S1\nvault material plane\nIdea files, DAY/NOW"]
    S1p["S1'\nHen compiler law\nfrontmatter, residency,\nwikilinks, semantic writes"]

    S2["S2\ngraph substrate\nNeo4j, Redis semantic cache"]
    S2p["S2'\ncoordinate graph law\nretrieval, sync,\nsource anchors"]

    S3["S3\ngateway control plane\nRPC, sessions, events"]
    S3p["S3'\ntemporal runtime\nRedis temporal context\nSpaceTimeDB, Graphiti runtime"]

    S4["S4\nPI agent runtime\nproviders, auth, spawn"]
    S4p["S4'\nAnima / VAK / ta-onta\nKhora Hen Pleroma\nChronos Anima Aletheia"]

    S5["S5\nworld-return services\nNara, Gnosis, kbase"]
    S5p["S5'\nEpii return law\nreview, autoresearch,\nMEF/QL/pedagogy partial"]
  end

  S0 --- S0p
  S1 --- S1p
  S2 --- S2p
  S3 --- S3p
  S4 --- S4p
  S5 --- S5p

  S0 -->|typed pass-through target| S1
  S0 -->|typed pass-through target| S2
  S0 -->|typed pass-through target| S3
  S0 -->|typed pass-through target| S4
  S0 -->|typed pass-through target| S5

  S1 --> S2 --> S3 --> S4 --> S5 --> S0
```

This diagram makes the modular rule explicit: [[S0]] is the executable command/return membrane, not the hidden home for [[S2]], [[S3]], [[S4]], or [[S5]] domain law.

## Diagram 3: M' Deep Structure

```mermaid
flowchart TB
  subgraph Ground["M / Bimba ground"]
    M["M\nontological coordinate map\ncanonical M0..M5"]
    Hash["legacy # nodes\nrepresent M ground,\nnot M' implementation"]
  end

  subgraph MPrime["M' / Pratibimba expression"]
    M52["M5-2\nfull S/S' substrate"]
    M53["M5-3\nTheia M' shell"]
    M54["M5-4\ngoverned agentic mediation"]
  end

  M --> MPrime
  Hash --> M

  subgraph Shell["/pratibimba/system"]
    Theia["single Theia process"]
    Daily["daily-0-1 layout\n0/1 daily field"]
    Deep["ide-deep layout\nagentic IDE"]
    Layouts["pratibimba-layouts\nstate-preserving switch"]
    Omni["omnipanel-shell\n/ command membrane"]
    Chrome["ide-shell-m0-m5\nM0 + M5 chrome"]
  end

  subgraph Bridge["Bridge + shared runtime"]
    KB["kernel-bridge\nsingleton DI service"]
    Runtime["m-extension-runtime\nshared adapter"]
    ACR["agentic-control-room"]
  end

  subgraph MExt["Six M extensions"]
    M0["m0-anuttara"]
    M1["m1-paramasiva"]
    M2["m2-parashakti"]
    M3["m3-mahamaya"]
    M4["m4-nara"]
    M5["m5-epii"]
  end

  subgraph Integrated["Integrated plugins"]
    P123["1-2-3 cosmic engine\nM1 + M2 + M3"]
    P450["4-5-0 recognition surface\nM4 + M5 + M0"]
  end

  M52 --> KB
  M53 --> Theia
  M54 --> ACR

  Theia --> Daily
  Theia --> Deep
  Theia --> Layouts
  Theia --> Omni
  Theia --> Chrome
  Theia --> KB

  KB --> Runtime
  Runtime --> M0
  Runtime --> M1
  Runtime --> M2
  Runtime --> M3
  Runtime --> M4
  Runtime --> M5

  M1 --> P123
  M2 --> P123
  M3 --> P123
  M4 --> P450
  M5 --> P450
  M0 --> P450
```

This captures [[M']] as one [[Theia]] shell with two layout modes, one bridge, six M extensions, and two integrated plugins. It preserves the [[M]] versus [[M']] inversion guard.

## Diagram 4: Cross-System Coupling

```mermaid
flowchart LR
  subgraph MPrime["M' consumers"]
    Theia["Theia shell"]
    KB["kernel-bridge"]
    Ext["M extensions"]
    Plugins["integrated plugins"]
    ACR["Agentic Control Room"]
    Omni["OmniPanel"]
  end

  subgraph SSubstrate["S/S' substrate providers"]
    S0["S0\ncommand membrane\nprofile/kernel CLI mirror"]
    S1["S1/S1'\nIdea FS read\nHen-governed writes"]
    S2["S2/S2'\n:Bimba graph\nretrieval/cache"]
    S3["S3/S3'\ngateway, sessions,\ntime, SpaceTimeDB"]
    S4["S4/S4'\nAnima, VAK,\ncapabilities"]
    S5["S5/S5'\nreview, improve,\nEpii governance"]
  end

  Theia --> KB
  Omni --> KB
  Ext --> KB
  Plugins --> KB
  ACR --> KB

  KB -->|control + data plane\nWS / JSON-RPC| S3
  KB -->|kernel/profile bridge| S0
  Theia -->|direct read only| S1
  Theia -->|vault write / semantic search\nvia gateway| S3

  S3 -->|graph methods| S2
  S3 -->|agent route / tool bounds| S4
  S3 -->|review / improve DTOs| S5
  S4 -->|deposit review / evidence| S5
  S5 -->|request bounded execution| S4
  S3 -->|temporal projection| KB
  S2 -->|graph payloads| KB
  S5 -->|review state| ACR

  S0 -. should not own .-> S2
  S0 -. should not own .-> S3
  S0 -. should not own .-> S5
```

This focuses only on coupling edges: [[M']] consumes; [[S/S']] provides. The dotted edges mark the cleanup seam where [[S0]] currently carries too much mirrored subsystem logic.

## Diagram 5: Implementation Reality vs Canon

```mermaid
flowchart TB
  subgraph Canon["Intended canon"]
    C1["Coordinate system = module system"]
    C2["S0 is command membrane\nnot domain owner"]
    C3["M = Bimba ontological map"]
    C4["M' = coded Pratibimba expression"]
    C5["M5-2 substrate\nM5-3 Theia shell\nM5-4 mediation"]
    C6["One Theia shell\ntwo layouts\none bridge"]
  end

  subgraph Current["Current implementation"]
    I1["Body/S/S0/epi-cli\nroutes many command families"]
    I2["S2/S3/S5 Body-native crates exist"]
    I3["S2/S3/S4/S5 logic still mirrored\ninside S0 CLI/gateway areas"]
    I4["Idea/Pratibimba/System\nreal Theia workspace + extensions"]
    I5["Body/M/epi-tauri\nstill present as migration baseline"]
    I6["S5 review/autoresearch crates real\nMEF/QL/explain/teach partial"]
  end

  subgraph Gaps["Gaps / stale / unresolved"]
    G1["S0 duplication cleanup\nextract domain law to Sx modules"]
    G2["COORDINATE-MAP partly stale\nS0'/S3'/S5' status lag"]
    G3["M vs M' naming inversion\nlegacy code labels M0..M5 as implementation"]
    G4["Tauri ADRs obsolete\nkept as historical proof"]
    G5["coordinate vs bimbaCoordinate\nnaming drift needs validation"]
    G6["Graphiti runtime vs S5 governance\nmust stay split"]
  end

  C1 --> I1
  C2 --> G1
  C3 --> G3
  C4 --> I4
  C5 --> I4
  C6 --> I4

  I1 --> G1
  I2 --> G1
  I3 --> G1
  I5 --> G4
  I6 --> G2

  G1 --> Target["Target bridge state\nS0 routes through typed contracts\neach coordinate owns its module law"]
```

This diagram separates canon, current implementation, and unresolved seams. It names active migration zones instead of flattening older Tauri plans, current Theia code, and seed canon into one diagram.

## Architecture Centers Of Gravity

### S/S'

The current architectural center of gravity for [[S/S']] is the six-coordinate return circuit with Body-native modules as the target residency law:

```text
S0 -> S1 -> S2 -> S3 -> S4 -> S5 -> S0
```

The highest-priority correction is to preserve [[S0]] as the command membrane and return surface. `epi` commands may mirror all coordinates, but [[S2]] graph law, [[S3]] gateway/temporal law, [[S4]] agentic law, and [[S5]] review/autoresearch law should live in their own coordinate modules.

### M'

The current architectural center of gravity for [[M']] is [[Idea/Pratibimba/System]]: one [[Theia]] shell, two layout modes, one bridge, six M extensions, two integrated plugins, and governed [[M5-4]] mediation.

[[Body/M/epi-tauri]] remains useful as migration inventory, test baseline, and historical proof, but it is not current architectural authority under the Theia-only recast.

## Highest-Risk Ambiguities

- [[M]] versus [[M']]: [[M]] is the ontological [[Bimba]] map; [[M']] is coded [[Pratibimba]] expression. Legacy code labels can invert this.
- [[S0]] versus coordinate-owned modules: [[S0]] must not become the monolith simply because all commands pass through it.
- [[/body]] versus [[/pratibimba/system]]: older Tauri plans and ADRs are historical; current authority is one [[Theia]] shell with two layouts.
- `coordinate` versus `bimbaCoordinate`: naming drift still needs validation across schema/frontmatter/graph assets.
- [[Graphiti]] placement: runtime belongs to [[S3']], invocation and governance belong to [[S5]] / [[S5']].

## Minimum Durable Diagram Set

Keep these five diagrams as durable architecture docs:

1. [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]]
2. [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]]
3. [[ARCHITECTURE-DIAGRAM-PACK#Diagram 3 M Deep Structure]]
4. [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]
5. [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]

## Future Refinement Order

1. Add a dedicated [[S0]] passthrough / Body-native module extraction diagram.
2. Add per-coordinate API ownership diagrams for [[S2]], [[S3]], [[S4]], and [[S5]].
3. Add [[Theia]] extension activation and readiness-state diagrams.
4. Add review/autoresearch governance state-machine diagrams for [[S5']] and [[M5-4]].
5. Update [[COORDINATE-MAP]] so it no longer lags current [[S0']], [[S3']], and [[S5']] reality.
