# Track 11 - Consumed S Substrate Closure: S0 / S1 / S2

This is **not** a rebuild track. It exists only to close the real M' integration gaps in the already-landed `S0/S1/S2` substrate.

## Source Specs

- `Idea/Bimba/Seeds/S/S0/S0-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0'/S0'-SPEC.md`
- `Idea/Bimba/Seeds/S/S1/S1-SPEC.md`
- `Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2'/S2'-SPEC.md`

## Tranches

1. **T0 - S0 Consumed Contract Closure For Shell And OmniPanel**

   Canonical source: `Idea/Bimba/Seeds/S/S0/S0-SPEC.md`, `Idea/Bimba/Seeds/S/S0/S0'/S0'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 command/readiness/profile surfaces already landed in `Body/S/S0`.

   Dependencies:

   - `01.T0` Electron / Theia runtime boundary must be locked so this track stays subordinate to actual M' consumption.

   Deliverables:

   - Close only the S0 contracts the M' shell actually consumes: profile, readiness, command dispatch, bridge status, bounded execution.
   - Distinguish shell `1` flow-input commands from `/` operator/debug commands in the S0 mirror and route table.
   - Record any still-missing shell-breaking gaps explicitly.

   Verification:

   - shell/OmniPanel contract tests against S0 routes
   - negative tests prove operator/debug commands do not masquerade as Nara flow artifacts

2. **T1 - S1 / Hen Full Public Surface Closure**

   Canonical source: `Idea/Bimba/Seeds/S/S1/S1-SPEC.md`, `Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 `s1'.vault.*`, `s1'.semantic.*`, and Track 13 Hen write-gate work.

   Deliverables:

   - Close the M' integration of the full Hen public surface: frontmatter, residency, compile, ledger, query, injection, semantic neighbors/search/by-block, wikilink edge cases.
   - Explicitly include `artifact_evidence`, `graph_promotion`, `relation_inference`, and `property_intelligence` surfaces where M5 and editors depend on them.
   - Close architecture-as-documentation residency: seed-level diagram packs in `Idea/Bimba/Seeds/**`, flat World definition forms in `Idea/Bimba/World/{Name}.md`, type/MOC canvases in `Idea/Bimba/World/Types/{Type}/{Type}.canvas`, and no permanent `World/Forms/` revival.
   - Close agent discovery guidance: M-dev/Anima/Epii/Hen agents must use `epi core knowing` plus `epi vault read/search/search-content/link-suggest` before raw grep for architecture/spec context.

   Verification:

   - Hen public surface tests through shell/editor/agent consumers
   - real fixture-vault tests create or update a valid Obsidian canvas/MOC, preserve wikilinks/frontmatter, and prove the flat World form plus Type canvas relationship
   - protocol tests or docs checks prove the M-dev and Hen/Pleroma/Epi-Logos guidance names vault CLI discovery commands and the World-vs-Seeds residency split

3. **T2 - CT0-CT5 Artifact Intake, T0-T5 Family Inference, Vault Bridge, Smart Connections Sidebar**

   Canonical source: `Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md`, `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 Day/NOW thought-route work and semantic surfaces already landed.

   Deliverables:

   - Close the CT0-CT5 artifact intake pipeline through Hen for M4/M5/review flows.
   - Treat `Idea/Bimba/World/FLOW.md` as the CT0 free-writing template and `Idea/Bimba/World/Daily-Note.md` as the CT4b day-parent organizer for shell `1` flow capture.
   - Ensure flow-originated prompt/chat, task/reminder/calendar capture, highlight sendoff, and review/pedagogy entry become real vault/session artifacts with DAY/NOW provenance.
   - Close T0-T5 thought family inference where M' surfaces depend on it.
   - Close the vault-bridge + Smart Connections sidebar integration as a product-facing consumer of S1'.
   - Route diagram/MOC production through the same CT intake and graduation path: FLOW/Present evidence to Seeds architecture pack, World definition, Type MOC canvas, then S2/S5 promotion where applicable.

   Verification:

   - intake tests
   - real fixture-vault tests for FLOW-to-daily-note/task/review artifacts
   - thought-route tests
   - sidebar/semantic neighbor integration tests
   - intake tests cover architecture-diagram-pack and MOC canvas artifacts as real files, not mocked placeholders

4. **T3 - S2 Consumed Contract Closure For Graph Viewers And Retrieval**

   Canonical source: `Idea/Bimba/Seeds/S/S2/S2-SPEC.md`, `Idea/Bimba/Seeds/S/S2/S2'/S2'-SPEC.md`
   Cycle 1 substrate inheritance: consumes cycle 1 graph schema, graph services, and graph consumer contracts already landed.

   Deliverables:

   - Close only the S2 graph/retrieval surfaces the M0/M5/extensions/plugins actually consume.
   - Record any still-missing graph consumer contracts as explicit integration gaps, not general S2 rebuild work.

   Verification:

   - M0/M5/graph viewer consumer tests

5. **T4 - Pi-Agent Relation-Inference Relay And No-New-S-Rebuild Guardrail**

   Canonical source: `Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md`, `Idea/Bimba/Seeds/S/S2/S2'/S2'-SPEC.md`
   Cycle 1 substrate inheritance: cycle 1 landed pieces of this behavior but never foregrounded the relay explicitly.

   Deliverables:

   - Close the relation-inference relay where M5/agents consume S1/S2 inference output.
   - Add a cycle-2 guardrail: no tranche here may reopen generic S0/S1/S2 implementation unless it is a real M' integration blocker.
   - Add a legacy-to-seed promotion guardrail: load-bearing `/docs/specs`, `/docs/plans`, and `/docs/resources` material must gain a Seed-side mirror, pointer, or traceability entry before being treated as canonical.

   Verification:

   - relation-inference relay tests
   - negative fixture/guardrail tests
   - migration guardrail fails when a tranche cites `/docs/**` as authority without an owning `Idea/Bimba/Seeds/**` wikilink or traceability entry
