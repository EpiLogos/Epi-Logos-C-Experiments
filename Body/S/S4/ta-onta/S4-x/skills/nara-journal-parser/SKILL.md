---
name: nara-journal-parser
description: Local-only journal parser for Nara corpus handling; produces handle-safe summaries and hashes for Nara voice training and E_4 inputs.
privacy_class: local-only
---

# nara-journal-parser

Use this skill when local journal entries need to be prepared for the Nara voice corpus or inspected as handle-safe summaries. The parser never emits raw private body text.

## Contract

- Accept only local files and `privacy_class = local-only`.
- Refuse cloud routing unconditionally per [[M'-MODEL-SLOT-SPEC]].
- Emit `body_sha256`, source path, detected signals, and `body_rendered = false`.
- Do not mutate PASU or journal sources.

## Entrypoint

```bash
python3 Body/S/S4/ta-onta/S4-x/skills/nara-journal-parser/scripts/parse_journal.py --input journal.md --privacy-class local-only
```

## Verification

```bash
python3 -m unittest Body/S/S4/ta-onta/S4-x/skills/nara-journal-parser/tests/test_journal_parser.py
```
