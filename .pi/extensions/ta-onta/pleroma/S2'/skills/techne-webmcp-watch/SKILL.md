---
name: techne-webmcp-watch
description: Subscribe to renderer context changes and reactively update session context without polling.
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-webmcp-watch

Subscribe to file changes, navigation, selection, and note-switch events. Debounce updates and write the new active context back into the session runtime rather than polling the renderer repeatedly.
