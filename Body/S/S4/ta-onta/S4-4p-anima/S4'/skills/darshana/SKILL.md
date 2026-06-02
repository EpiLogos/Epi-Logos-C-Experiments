---
name: darshana
description: "The Structural Gaze (Darshana). An atomic REPL-style document navigator that scouts topology (Headers, QL P0-P5 structures) and surgically reads sections without loading the full file. Pre-ingestion structural analysis for the Gnosis pipeline and surgical source introspection during task execution. True port from upstream epi-claw repl/darshana skill."
port_type: true-port
skill_class: vak
ct: CT1, CT3
cp: "4.0"
agent_affinity: nous, mythos
requires:
  os: ["darwin", "linux"]
---

# Darshana — The Structural Gaze

*The Power of Seeing.*

**Common Name:** REPL (Unix) | **Formal Power:** Darshana (Shakti)
**Paradigm:** Quaternal Logic (P0-P5) | **Role:** Document Navigator

Use this tool to surgically explore large Markdown files or structured knowledge bases without overwhelming the context window. Darshana is the **pre-ingestion structural analysis** tool for the Gnosis pipeline (scout topology, map coordinate-relevant sections, guide chunking) and the interactive REPL for surgical section extraction during task execution.

## Usage

### 1. Scout (The Map)
Get the high-level topology: Frontmatter (YAML), QL Levels, and Header Tree.
```bash
./darshana.py scout "/absolute/path/to/file.md"
```

### 2. Read (The Lens)
Extract a specific section by its Header name or Line number.
```bash
# Read by Header (fuzzy match)
./darshana.py read "/absolute/path/to/file.md" --section "2.1 The Concept"

# Read by QL Marker (finds headers containing [P1])
./darshana.py read "/absolute/path/to/file.md" --ql "P1"
```

### 3. Threads (The Weave)
Extract all `[[Wikilinks]]` from the file (or a specific section) to find connections.
```bash
./darshana.py threads "/absolute/path/to/file.md"
```

## Role in the Gnosis Pipeline

Before a document enters the Gnosis pipeline, darshana can:

1. **Scout** the document to extract its structural topology (headers, QL markers, frontmatter)
2. **Map** coordinate-relevant sections (finds P0-P5/#0-#5 references, wikilinks)
3. **Guide chunking** — the structural map informs section-aware chunking boundaries

Structural metadata feeds ingestion: `section_heading` from the header tree, coordinate tags from QL detection, wikilink targets as `RELATES_TO_COORDINATE` edges.

## QL Support
Detects `P0`-`P5` and Inverse `P0'`-`P5'` in:
- Frontmatter (e.g., `level: P2`)
- Headers (e.g., `# P2: The Concept`)
