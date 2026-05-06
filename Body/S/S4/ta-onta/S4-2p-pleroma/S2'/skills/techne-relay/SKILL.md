---
name: techne-relay
description: Retrieve structured output from an active or completed workshop window.
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-relay

Use this skill after `techne-spawn` to capture stdout or file-backed results from a workshop window. Wait for completion up to the configured timeout, then return the captured payload and status.
