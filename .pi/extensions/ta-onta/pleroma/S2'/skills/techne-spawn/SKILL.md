---
name: techne-spawn
description: Launch an external CLI coding agent in the aletheia-workshop after proxying skills and setting context.
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-spawn

1. Call `pleroma-skill-proxy` first with provider, CF identity, and window name.
2. Set OneContext project state for the workshop.
3. Check `ALETHEIA_WORKSHOP_MAX_WINDOWS`; if at ceiling, queue or escalate through Gate 6.
4. Spawn the window inside `aletheia-workshop`.
5. Return the window handle, CF identity, and session registration.
