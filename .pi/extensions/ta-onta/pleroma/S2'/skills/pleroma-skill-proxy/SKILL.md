---
name: pleroma-skill-proxy
description: Configure claude-code, gemini-cli, or codex as constitutional progeny by attaching canonical skills and CF identity.
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# pleroma-skill-proxy

Provider forks:

- `claude-code`: point Claude skill loading at canonical ta-onta skill directories and append `CF_IDENTITY`.
- `gemini-cli`: write `skills.json` and export `CF_IDENTITY`.
- `codex`: register canonical skill directories and export `CF_IDENTITY`.

All three branches finish by registering the session with OneContext so the external worker remains available to Night' extraction.
