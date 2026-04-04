# BimbaNode Apportionment Schema Context

Read this before apportioning any node content.
This defines what each coordinate-forward property key MEANS.
Apportionment is a semantic judgment — assign content to the slot
whose meaning most faithfully matches what that content IS.

---

## The Naming Convention

All property keys follow `{family}_{n}[_{sub_n}]*_{semantic}` where:
- `family` ∈ {c, p, l, s, t, m} — coordinate family
- `n` ∈ {0, 1, 2, 3, 4, 5} — QL position
- `sub_n` ∈ {0, 1, 2, 3, 4, 5} — optional sub-position (repeatable), mirrors the coordinate system's own nesting depth
- `semantic` — snake_case descriptor of what this specific property holds

**Sub-numbering** gives organisational freedom within a coordinate position without inventing new families. Use it when a position genuinely contains distinct sub-domains that deserve their own address:

| Example | Meaning |
|---------|---------|
| `c_0_essence` | C0 ground — flat (no sub-position needed) |
| `c_0_0_void_ground` | C0·0 — the most foundational aspect of ground |
| `c_0_1_languification` | C0·1 — the Anuttara-language encoding of ground |
| `m_3_2_pairing_matrix` | M3·2 — the pairing-matrix sub-domain of M3 |
| `m_0_2_3_ananda_row` | M0·2·3 — deep nesting when the dataset structure warrants it |

Sub-numbers follow the same QL semantics as their parent position. `c_0_0_*` is more ground-ward than `c_0_5_*` within the C0 family. Use this coherently — sub-numbers are not just sequence indices.

`coordinate` is the single exempt key (the Bimba address itself, not a property).
Computed fields (c_2_uuid, c_4_family, c_4_ql_position, c_4_layer, c_4_topo_mode)
are filled by enrich.py — do NOT assign these from content.
If enrich.py returns null for any computed field (e.g. c_4_ql_position is null for
the bare `#` root node), omit that field from the generated Cypher SET block entirely
— do not write `SET n.prop = null`.

---

## C-Family Positions (ontological default — universal across all nodes)

| Key prefix | Position meaning | Apportion content that IS... |
|------------|-----------------|------------------------------|
| `c_0_*`    | Ground / Source / Bimba | The essential nature; what this coordinate IS at its most fundamental; ground-state descriptions; void/origin content |
| `c_1_*`    | Form / Definition / Manifestation | How it structurally presents; its essential form; how it manifests; what it IS as a defined thing |
| `c_2_*`    | Entity / Instance / Atomic | Specific identifiers, unique properties, instance-level facts; what makes THIS node THIS node |
| `c_3_*`    | Process / Temporal / Operational | How it functions; its operations; temporal aspects; sequences; developmental stages; what it DOES |
| `c_4_*`    | Type / Context / Category | How it is categorized; typological information; what context it operates in; classifications |
| `c_5_*`    | Integration / Reflection / Resonance | Cross-system connections; resonances with other traditions; how it integrates with the whole; what it reflects |

---

## Canonical Core Property Slots (every BimbaNode must have these)

```
c_0_essence              The distilled ground nature (1-3 sentences max)
c_1_name                 Human-readable label
c_1_description          Extended descriptive prose
c_1_form                 How it structurally manifests (internalStructure content)
c_3_updated_at           ISO 8601 timestamp (take latest of all timestamp variants)
c_3_context_frame        Canonical context frame string e.g. "(0/1/2/3)"
c_4_access_level         Who/what can access this coordinate
c_4_ql_category          "implicate" | "explicate" | "both"
c_4_ql_operator_types    list[string] — always a list
c_5_resonances           list[string] — cross-tradition resonances, always a list
```

---

## Harmonizable Slots (appear across multiple subsystems — assign when content is present)

```
c_0_consciousness_structure    How consciousness operates at this coordinate
c_0_anuttara_languification    The Anuttara void-grammar encoding of this coordinate
c_1_key_principles             list[string] — core principles, always a list
c_1_architectural_function     Role/function in the system architecture
c_1_operational_symbolics      Symbolic representations and their operational meaning
c_1_void_grammar_structure     The void-grammar (QL operator) structure
c_3_practical_applications     list[string] — use cases, always a list
c_3_related_coordinates        Which other coordinates this interfaces with
c_3_developmental_stages       list[string] — evolutionary/developmental stages, always a list
c_3_void_relationship          How this coordinate relates to the void/Anuttara
```

---

## Subsystem-Specific Slots (M-family, assign only when content genuinely belongs here)

### M0 (Anuttara — Void ground)
```
m_0_lacanian_mapping       Lacanian-Vedantic triadic synthesis for this node
m_0_resonance_traditions   Specific traditions beyond c_5_resonances
```

### M1 (Paramasiva — Logical structure)
```
m_1_clifford_signature     Clifford Cl(4,2) algebraic encoding
m_1_spanda_tick            tick12 value (0-11)
m_1_trigram_basis          Spinor/trigram correspondence
m_1_ananda_matrix_row      Which Ananda matrix row governs this node
```

### M2 (Parashakti — Vibrational dynamics)
```
m_2_decan_signature        Degree/decan structural signature
m_2_tattva_mapping         Tattva descent/ascent map
m_2_vibrational_ratio      Core vibrational ratio (e.g. "36×2=72")
m_2_trinity_operations     The three operative relations (+, ×, /)
m_2_absent_operation       The operation structurally absent at this position
m_2_name_matrix            Divine name matrix reference
m_2_void_query             The specific void-question this node holds
```

### M3 (Mahamaya — Symbolic transcription)
```
m_3_quaternionic_signature  Quaternionic formula (q = a + bi + cj + dk form)
m_3_matrix_symmetry         SU(3)/gauge symmetry description
m_3_rotational_dynamics     SU(2)/spinorial rotational structure
m_3_non_dual_anchors        Integer count of palindromic/invariant codons
m_3_seed_ratio              Prime seed ratio (e.g. "41:43")
m_3_core_ratio              Structural ratio (e.g. "64:8:40")
m_3_harmonic_ratio          Harmonic ratio (e.g. "360:40:9")
m_3_universal_grammar       Quaternionic mathematical grammar description
m_3_prime_stabilization     How Euler primes prevent rotational drift
m_3_axiological_framework   Embedded value/ethical systems in symbolic relations
m_3_environmental_conducting Epigenetic/environmental input structure
```

### M4 (Nara — Personal interface)
```
m_4_eve_numbers_path        Eve numbers (3-5-7) cosmic pathway description
m_4_eve_numbers_dynamic     Eve number dynamic operation
m_4_archetypal_family       Father/Mother/Son/Daughter/Family structure
m_4_oceanic_metaphor        Siva-Shakti-Nara oceanic dynamics
m_4_siva_shakti_dynamics    list[string] — hardware-software unity dynamics
m_4_two_stroke_doctrine     Outer stroke → Inner stroke pattern description
m_4_dialogical_containers   Bohmian / TalkingCircle / Diamond container description
m_4_temporal_layer          Temporal intelligence layer description
m_4_epistemic_separation    Operations vs. interpretation boundary description
m_4_nara_coordinate_system  Nested coordinate addressing description
m_4_transformational_tech   list[string] — transformation technology categories
m_4_personal_pratibimba     Personal Pratibimba three-layer architecture
m_4_spanda_coordinate_entry Spanda coordinate notation entry description
```

### M5 (Epii — Synthetic integration)
```
m_5_logos_cycle             6-stage logos cycle structure
m_5_logos_grounding         Philosophical grounding of logos cycle
m_5_archaeology_method      Etymological archaeology method description
m_5_archaeology_namespaces  list[string] — required knowledge namespaces
m_5_contemplative_modes     list[string] — contemplative synthesis modes
m_5_geometric_epistemology  Geometric epistemology paradigm shift description
m_5_conscire_structure      CON-SCIRE dialogical restoration description
m_5_lacanian_interface      Lacanian public interface description
m_5_whitehead_lacanian      Whitehead-Lacanian synthesis
m_5_next_evolution          list[string] — next evolutionary phases
m_5_namespaces              list[string] — active knowledge namespace references
```

---

## Apportionment Rules

1. **Read all content first** before assigning any slot. The full picture matters.
2. **Assign to the most semantically honest slot** — not the most convenient.
3. **Split prose when needed** — if one source property contains content for two slots, split it. Do not force-fit both into one slot.
4. **Use sub-numbers for organisational freedom** — when a position has distinct sub-domains, use `{family}_{n}_{sub_n}_{semantic}`. Sub-numbers follow QL semantics: `_0_` is more ground-ward, `_5_` is more integrative. Never use sub-numbers as arbitrary sequence indices.
5. **Lists are always lists** — any slot ending in a documented list type must be a JSON array even if the source is a string.
6. **Propose new slots cautiously** — only if content genuinely has no existing slot. Use `{family}_{n}[_{sub_n}]*_{semantic}` convention. Mark with `// PROPOSED` comment in Cypher for human review.
7. **Do not fabricate** — if content is absent for a slot, omit it. Empty strings and empty lists are noise.
8. **Computed fields are off-limits** — do not assign c_2_uuid, c_4_family, c_4_ql_position, c_4_layer, c_4_topo_mode. enrich.py handles these.
9. **Drop**: notionPageId, subsystem (int), id (int) — Notion artifacts, not semantic.

---

## Cypher Output Format

For each node, generate a block in this format:

```cypher
// {coordinate} | {c_1_name} | {brief description}
MERGE (n:BimbaNode { coordinate: '{coordinate}' })
// --- Canonical core ---
SET n.c_0_essence           = '{value}'
SET n.c_1_name              = '{value}'
SET n.c_1_description       = '{value}'
SET n.c_1_form              = '{value}'
SET n.c_2_uuid              = '{from enrich.py}'
SET n.c_3_updated_at        = '{value}'
SET n.c_3_context_frame     = '{value}'
SET n.c_4_family            = 'M'
SET n.c_4_ql_position       = {int}
SET n.c_4_layer             = '{from enrich.py}'
SET n.c_4_topo_mode         = '{from enrich.py}'
SET n.c_4_access_level      = '{value}'
SET n.c_4_ql_category       = '{value}'
SET n.c_4_ql_operator_types = {json array}
SET n.c_5_resonances        = {json array}
// --- Extended (harmonizable + subsystem-specific) ---
SET n += {
  key: value,
  key: value
  // PROPOSED: m_3_new_concept: '...'  ← flag for human review
}
ON CREATE SET n.c_3_created_at = datetime()
;
```

Blank line between nodes. One file per M-branch. Sub-numbered properties appear in the extended block in QL order (lower sub-numbers first within each position).
