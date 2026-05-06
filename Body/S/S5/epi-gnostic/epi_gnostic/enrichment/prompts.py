"""Prompt templates for Bimba coordinate resonance classification."""

COORDINATE_TAXONOMY = """The Epi-Logos coordinate system has 6 families, each with positions 0-5:

**M (Subsystem/Consciousness):**
- M0 Anuttara: absolute ground, void, language architecture
- M1 Paramasiva: spanda vibration, torus topology, 12-fold cycle
- M2 Parashakti: energy/chakra/body, decan system, planetary resonance
- M3 Mahamaya: symbolic transcription, I-Ching hexagrams, tarot, codons
- M4 Nara: personal interface, identity, oracle, medicine, transformation
- M5 Epii: integration, logos FSM, pratibimba reflection

**P (Position/Function):**
- P0 Ground, P1 Definition, P2 Operation, P3 Pattern, P4 Context, P5 Integration

**S (Stack/Technology):**
- S0 Terminal, S1 Obsidian, S2 Neo4j, S3 PAI, S4 Claude, S5 Notion

**T (Thought/Artifact):**
- T0 Seed, T1 Spec, T2 Form, T3 Process, T4 Pattern, T5 Insight

**L (Lens/Epistemic):**
- L0 Literal, L1 Functional, L2 Structural, L3 Archetypal, L4 Paradigmatic, L5 Integral

**C (Category/Ontological):**
- C0 Bimba/Source, C1 Form, C2 Entity, C3 Process, C4 Type, C5 Pratibimba/Instance
"""

RESONANCE_CLASSIFICATION_PROMPT = """Given the following entity extracted from a knowledge graph, classify its resonance with the Epi-Logos coordinate system.

{taxonomy}

**Entity:**
- Name: {entity_name}
- Description: {entity_description}
- Source: {source_context}

**Instructions:**
Return a JSON object with:
- "resonances": array of coordinate strings this entity resonates with (e.g. ["M3", "P2", "C5"]), ranked by relevance. Maximum 5.
- "confidence": array of float confidence scores (0.0-1.0) corresponding to each resonance.
- "primary_family": the single most relevant family letter ("M", "S", "P", "T", "L", "C"), or "#" if unclear.
- "reasoning": one sentence explaining the classification.

Return ONLY valid JSON, no markdown fences.
"""
