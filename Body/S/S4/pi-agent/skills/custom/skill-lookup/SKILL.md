---
name: skill-lookup
description: Hermes-style semantic lookup over the live skill/Aeon manifest, filtered by the active agent entitlement contract.
entrypoint: ./index.ts
vak_coordinate: "CPF:(4.0/1-4.4/5);CT:CT2;CP:4.2;CF:(0/1/2);CFP:skill-primitive;CS:S4"
quintessential_form: "q_skill_lookup"
bimba_coordinate: "M5-1"
entitlement_class: allowed-for-current-agent
---

# Skill Lookup

Use this skill whenever the model needs to find a relevant skill or Aeon loop for a task.

Primary system-prompt pointer:

> To find skills or Aeons relevant to your task, call `skill_lookup(query)`. The semantic search ranks entries by relevance to your query against the live skill manifest.

`skill_lookup(query, max_results?)` searches the live manifest produced from the configured skill universe and returns ranked skill and Aeon entries already filtered by the active team / agent entitlement contract.

Each result carries `kind` (`skill` or `aeon`), `name`, `description`, `when_to_use`, `vak_coordinate`, `quintessential_form`, `bimba_coordinate`, and `entitlement_class`.

Aeons register in the same central store shape as skills: a folder containing `SKILL.md` with frontmatter including `kind: aeon`, `vak_coordinate`, `quintessential_form: q_<name>`, `bimba_coordinate`, and the entitlement class declared for the owning team. The lookup service still computes the effective entitlement filter at runtime; frontmatter never grants access by itself.

If the lookup primitive is unavailable, the runtime falls back to the entitlement-filtered `<available_skills>` XML manifest.
