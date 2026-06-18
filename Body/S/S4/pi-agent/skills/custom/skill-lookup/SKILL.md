---
name: skill-lookup
description: Hermes-style semantic lookup over the live skill manifest, filtered by the active agent entitlement contract.
entrypoint: ./index.ts
vak_coordinate: "CPF:(4.0/1-4.4/5);CT:CT2;CP:4.2;CF:(0/1/2);CFP:skill-primitive;CS:S4"
quintessential_form: "q_skill_lookup"
bimba_coordinate: "M5-1"
entitlement_class: allowed-for-current-agent
---

# Skill Lookup

Use this skill whenever the model needs to find a relevant skill for a task.

Primary system-prompt pointer:

> To find skills relevant to your task, call `skill_lookup(query)`. The semantic search ranks skills by relevance to your query against the live skill manifest.

`skill_lookup(query, max_results?)` searches the live manifest produced from the configured skill universe and returns ranked entries already filtered by the active team / agent entitlement contract.

Each result carries `name`, `description`, `when_to_use`, `vak_coordinate`, `quintessential_form`, `bimba_coordinate`, and `entitlement_class`.

If the lookup primitive is unavailable, the runtime falls back to the entitlement-filtered `<available_skills>` XML manifest.
