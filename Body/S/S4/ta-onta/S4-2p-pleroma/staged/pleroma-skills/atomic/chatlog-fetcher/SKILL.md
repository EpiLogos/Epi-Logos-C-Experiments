---
name: chatlog-fetcher
description: "Chat log extraction from AI platforms (ChatGPT, Claude, Gemini). Renders page via Playwright, uses local browser cookies, extracts structured conversation history. Fresh design."
port_type: fresh-design
ct: CT1, CT4
cp: "4.0"
agent_affinity: nous, lachesis
requires:
  bins: ["npx"]
  packages: ["playwright"]
---

# chatlog-fetcher -- AI Platform Chat Log Extraction

Extract structured conversation history from AI chat platforms using browser automation. Uses local browser cookies for authentication (no API keys needed for web-based chat history).

## Purpose

When Night' analysis requires reviewing prior AI conversations (ChatGPT, Claude, Gemini web interfaces), this skill fetches the conversation content and formats it as QL-structured markdown for integration into the knowledge base.

## Invocation

```bash
chatlog-fetcher --platform <platform> --url <conversation-url> [--format ql|raw] [--output <path>]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--platform` | Yes | -- | Platform: `chatgpt`, `claude`, `gemini` |
| `--url` | Yes | -- | Full URL to the conversation |
| `--format` | No | `ql` | Output format: `ql` (QL-structured) or `raw` (plain markdown) |
| `--output` | No | stdout | File path for output |

## Platform Support

### ChatGPT

```bash
chatlog-fetcher --platform chatgpt --url "https://chat.openai.com/c/abc123"
```

Extraction targets:
- User messages: `[data-message-author-role="user"]`
- Assistant messages: `[data-message-author-role="assistant"]`
- System messages: detected and labeled

### Claude

```bash
chatlog-fetcher --platform claude --url "https://claude.ai/chat/abc123"
```

Extraction targets:
- Human turns: `.human-turn` elements
- Assistant turns: `.assistant-turn` elements
- Artifact blocks: detected and preserved

### Gemini

```bash
chatlog-fetcher --platform gemini --url "https://gemini.google.com/app/abc123"
```

Extraction targets:
- User prompts and model responses
- Code blocks and structured output

## Browser Cookie Authentication

Uses local browser cookies via Playwright's persistent context:

```bash
# Uses Chrome/Chromium user data directory
BROWSER_USER_DATA="${BROWSER_USER_DATA:-$HOME/Library/Application Support/Google/Chrome}"
```

No API keys are needed -- the skill authenticates using the same session cookies as the user's browser.

## QL-Formatted Output

When `--format ql` is specified, output follows QL structure:

```markdown
---
source_platform: chatgpt
source_url: https://chat.openai.com/c/abc123
extracted_at: 2026-03-08T10:30:00Z
turn_count: 12
ql_positions:
  P0: ground-context
  P1: initial-question
  P2: exploration
  P3: patterns-identified
  P4: contextual-placement
  P5: synthesis
---

# Chat Log: [Conversation Title]

## P0 Ground -- Initial Context

**Human:** [First message establishing context]

**Assistant:** [Response establishing ground]

## P2 Operation -- Core Exchange

**Human:** [Operational questions]

**Assistant:** [Detailed responses]

## P5 Integration -- Synthesis

**Human:** [Final synthesis question]

**Assistant:** [Crystallized response]
```

QL position assignment is heuristic: early turns map to P0-P1, middle turns to P2-P3, late turns to P4-P5.

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `auth_failed` | Browser cookies expired or missing | Prompt user to log in via browser |
| `page_not_found` | Conversation URL invalid | Return error with URL validation |
| `extraction_failed` | DOM structure changed | Return partial content with warning |
| `playwright_missing` | Playwright not installed | Prompt: `npx playwright install chromium` |

## Privacy and Security

- Uses local browser cookies only -- no credentials stored
- Conversation content is written to local filesystem only
- No data sent to external services
- Respects platform rate limits

## Integration with Night' Pass

Chat logs extracted by this skill feed into the Night' analysis pipeline:

1. `chatlog-fetcher` extracts conversation
2. Output written to `/Thought/Traces/` (P1' position)
3. Klotho (Assert) validates traces into knowledge graph
4. Lachesis (Query) can retrieve traces during P4' Discovery
