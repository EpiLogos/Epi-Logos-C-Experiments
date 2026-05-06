---
name: web-research
description: "Research workflow using web_search (DuckDuckGo) and web_fetch (Jina Reader). Search, select, read, synthesise."
skill_class: research
---

# Web Research

Two tools. Use them in sequence.

## Tools

**`web_search(query)`**
Searches DuckDuckGo. Returns numbered results with title, URL, and snippet. Start here.

**`web_fetch(url)`**
Fetches a URL via Jina Reader and returns clean markdown — boilerplate stripped, actual content preserved. Use after search to read a specific source fully.

---

## Standard Research Flow

1. **Search broadly first** — run `web_search` with a high-level query to get an overview of the landscape
2. **Search specifically** — follow up with narrower queries targeting specific aspects (authors, concepts, dates, controversies)
3. **Fetch the best sources** — for any result worth reading fully, call `web_fetch` with its URL
4. **Synthesise incrementally** — after each fetch, extract the key claims, quotes, and references before moving to the next source
5. **Build the source map** — track what each source contributes: primary argument, key quotes, where it agrees/conflicts with others

## Query Craft

- Combine proper nouns with concept terms: `"Deleuze" "Body without Organs" hermeticism`
- Use year ranges for historical context: `western occultism 1800s 1900s overview`
- Target specific works: `"Anti-Oedipus" alchemy symbolism`
- Find critics and responses: `Deleuze occult criticism scholarly`

## Writing Results to Vault

After research, use `khora_write` to save synthesised notes to the NOW session:
- Save a `## Sources` section listing all fetched URLs with one-line summaries
- Save key quotes with attribution in a `## Raw Material` section
- Save your emerging synthesis in a `## Threads` section — the connections you're noticing

All notes go under `now_path` from the current session context.
