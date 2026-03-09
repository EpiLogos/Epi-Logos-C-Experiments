---
name: notebooklm
description: "Notebook query and source management. Query NotebookLM notebooks, add/remove sources, list available notebooks. Port-and-refine from upstream."
port_type: port-and-refine
ct: CT1, CT5
cp: "4.4"
agent_affinity: psyche, sophia
---

# notebooklm -- Notebook Query and Source Management

Interface for querying NotebookLM notebooks and managing their sources. Provides a thin wrapper for notebook listing, querying, and source add/remove operations.

## Commands

### list

List available notebooks:

```bash
notebooklm list [--format json|table]
```

Returns notebook names, source counts, and last-modified timestamps.

### query

Query a notebook for information:

```bash
notebooklm query --notebook "<notebook-name>" --question "<question>" [--sources <n>]
```

#### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--notebook` | Yes | -- | Notebook name or ID |
| `--question` | Yes | -- | Natural language question |
| `--sources` | No | `3` | Number of source citations to return |

#### Return Value

```json
{
  "answer": "The synthesized answer from NotebookLM",
  "sources": [
    {"title": "Source document title", "excerpt": "Relevant excerpt..."}
  ],
  "confidence": "high"
}
```

### source-add

Add a source to a notebook:

```bash
notebooklm source-add --notebook "<notebook-name>" --path "<file-path>"
```

Supports: PDF, Markdown, text files, URLs.

### source-remove

Remove a source from a notebook:

```bash
notebooklm source-remove --notebook "<notebook-name>" --source "<source-id>"
```

### source-list

List all sources in a notebook:

```bash
notebooklm source-list --notebook "<notebook-name>"
```

## Integration with VAK

- **CT1 Definitional**: Querying notebooks for definitional content
- **CT5 Integrative**: Synthesizing across multiple notebook sources
- **Night' P4' Discovery**: NotebookLM queries serve as source discovery during Night' passes

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `notebook_not_found` | Notebook name does not match | List available notebooks |
| `source_not_found` | Source ID not in notebook | List notebook sources |
| `query_failed` | NotebookLM service error | Return error with retry suggestion |
| `auth_required` | Authentication not configured | Prompt for auth setup |
