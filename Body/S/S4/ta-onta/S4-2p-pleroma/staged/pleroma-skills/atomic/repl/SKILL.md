---
name: repl
description: "The Structural Gaze (Darshana). A REPL-style document navigator that scouts topology (Headers, QL P0-P5 structures) and surgically reads sections without loading the full file. True port from upstream epi-claw repl skill."
port_type: true-port
ct: CT1, CT3
cp: "4.0"
agent_affinity: nous, mythos
requires:
  os: ["darwin", "linux"]
---

# The REPL (Darshana)

The Structural Gaze. The Power of Seeing.

**Common Name:** REPL (Unix)
**Formal Power:** Darshana (Shakti)
**Paradigm:** Quaternal Logic (P0-P5) | **Role:** Document Navigator

Use this tool to surgically explore large Markdown files or structured knowledge bases without overwhelming the context window.

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

## QL Support

Detects `P0`-`P5` and Inverse `P0'`-`P5'` in:
- Frontmatter (e.g., `level: P2`)
- Headers (e.g., `# P2: The Concept`)
