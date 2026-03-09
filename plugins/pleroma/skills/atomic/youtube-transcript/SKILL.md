---
name: youtube-transcript
description: "YouTube transcript fetcher. Fetch transcript from URL without API key, output QL-formatted markdown with timestamps. Fresh design."
port_type: fresh-design
ct: CT1, CT4
cp: "4.0"
agent_affinity: nous, lachesis
---

# youtube-transcript -- YouTube Transcript Fetcher

Fetch YouTube video transcripts without requiring an API key. Outputs QL-formatted markdown with timestamps for integration into the knowledge base.

## Invocation

```bash
youtube-transcript --url <youtube-url> [--format ql|raw|srt] [--output <path>] [--lang <code>]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--url` | Yes | -- | YouTube video URL |
| `--format` | No | `ql` | Output format: `ql`, `raw`, or `srt` |
| `--output` | No | stdout | File path for output |
| `--lang` | No | `en` | Language code for transcript |

## Transcript Extraction

Uses the YouTube transcript API (no API key required) to fetch auto-generated or manual captions:

```bash
# Extract video ID from URL
video_id=$(echo "$url" | grep -oP '(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})')

# Fetch transcript via yt-dlp or youtube-transcript-api
yt-dlp --write-auto-sub --sub-lang "$lang" --skip-download --sub-format json3 -o "transcript" "$url"
```

Fallback chain:
1. Manual captions (highest quality)
2. Auto-generated captions
3. Error if no captions available

## Output Formats

### QL Format (default)

```markdown
---
source_type: youtube-transcript
source_url: https://www.youtube.com/watch?v=abc123
video_title: "Example Video Title"
channel: "Channel Name"
duration: "45:23"
extracted_at: 2026-03-08T10:30:00Z
language: en
---

# Transcript: Example Video Title

## P0 Ground -- Opening Context [00:00-05:00]

[00:00] Opening remarks establishing the topic...
[01:23] Key context point...
[03:45] Foundation laid for main argument...

## P2 Operation -- Core Content [05:00-30:00]

[05:12] Main argument begins...
[12:34] Supporting evidence presented...
[20:00] Key demonstration...

## P5 Integration -- Synthesis [30:00-45:23]

[30:15] Summary begins...
[40:00] Final synthesis...
[44:00] Closing remarks...
```

QL position assignment is based on temporal position: first 15% maps to P0-P1, middle 60% to P2-P3, final 25% to P4-P5.

### Raw Format

Plain text transcript with timestamps:

```
[00:00] First line of transcript...
[00:05] Second line...
```

### SRT Format

Standard SubRip subtitle format for compatibility with video tools.

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `no_captions` | Video has no captions | Return error with suggestion |
| `invalid_url` | URL is not a valid YouTube URL | Return error with URL format guide |
| `language_unavailable` | Requested language not available | List available languages |
| `video_private` | Video is private or age-restricted | Return error |

## Integration with Knowledge Base

Transcripts feed into the knowledge pipeline:

1. Fetch transcript via this skill
2. Write to `/Thought/Discovery/` (P4' position) or `/Thought/Traces/` (P1')
3. Klotho can assert key claims into the knowledge graph
4. Lachesis can query transcript content during source discovery
