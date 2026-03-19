---
name: techne-close
description: Gracefully end a workshop window, capture final state, and persist a OneContext milestone.
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-close

Signal completion, run `oc_commit` when appropriate, capture final output, and close the workshop window. Force mode is allowed for hung sessions, but graceful shutdown is preferred.
