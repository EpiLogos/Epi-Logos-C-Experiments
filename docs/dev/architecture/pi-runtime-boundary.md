# PI Runtime Boundary

This note fixes the S0/S4/S5 responsibility boundary for the managed PI runtime.

## Ownership

- **S0 Rust (`epi agent`)** prepares directories, writes PI-compatible settings/auth files, validates local runtime bundles, exposes adapter commands, and launches PI.
- **PI runtime** owns model discovery, provider invocation, session execution, and runtime model availability.
- **S4 ta-onta** owns embodied extensions, hooks, plugins, constitutional agent surfaces, and runtime behavior.
- **S5 agent/review/autoresearch** owns higher-order agent intelligence.
- **S1 Hen** owns vault parsing, wikilink/frontmatter/body evidence, and graph-promotion intent construction.
- **S2 graph-schema/services** own graph labels, properties, relationship types, compatibility migration, Neo4j CRUD, and sync transactions.

## Hard Rules

- S0 must not hardcode a complete provider/model registry.
- S0 must not reject a default model because it is absent from `models.json`; `settings.json` is a PI runtime preference, and PI decides whether the model is available.
- S0 may write `auth.json` for a provider name, but it must not infer that this proves model availability.
- S0 may delegate model listing to `pi --list-models`, but it must not emulate that list.
- Hen relation inference must call PI/S4 as the runtime boundary, not a direct provider SDK from Hen or S0.
- S4/S5 behavior must not be reimplemented in Rust adapter code.

## File Meaning

- `.epi/agents/<agent>/agent/settings.json`: selected PI default provider/model and runtime preferences.
- `.epi/agents/<agent>/agent/auth.json`: PI provider credentials, ignored by git.
- `.epi/agents/<agent>/agent/auth-profiles.json`: compatibility status metadata only; it must not duplicate secrets.
- `.epi/agents/<agent>/agent/models.json`: optional PI-native custom provider configuration, not the authority for all PI-supported models.

## Test Boundary

Non-network tests should use fake PI binaries to prove that S0 delegates to PI. Live provider tests require explicit approval because they send managed PI prompt/config to an external provider.
