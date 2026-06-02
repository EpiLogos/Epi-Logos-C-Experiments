# ADR-05-008 — `obsidian-md-vsc` embedded VS Code extension for S1 vault reach

**Status:** ⚠️ SUPERSEDED 2026-06-01 — see Reversal Note below.
**Original decision date:** 2026-06-01 (reversed same day after research surfaced the extension's actual nature).
**Reversal authority:** IOD-18 (Smart Connections via Hen `smart_env.rs`) + IOD-19 (Hen as vault-write gatekeeper) in Track 11 + canon §0.3a / §0.3b / §1.1 + M5'-SPEC.md Sixfold IDE Surface table updates.
**Affected tracks:** 05, 07 (M-extensions that consume vault data)
**Depends on:** [ADR-05-004](./adr-05-004-electron-target.md)

## Reversal Note (2026-06-01)

Research into `willasm.obsidian-md-vsc` surfaced that the extension is **NOT a vault renderer** — it is an Obsidian-app remote-control shim via the `obsidian-advanced-uri` plugin (Vinzent03). It does not:

- Render `[[wikilinks]]`
- Show graph view, render embeds, parse vault structure
- Read `.obsidian/plugins/` (so cannot surface Smart Connections data)
- Operate without a running Obsidian desktop app

It exposes only command-palette + settings actions that send messages (open workspace / bookmark / daily note, create backlink, generate PDF) to a running Obsidian instance. The original ADR misidentified it as a vault renderer.

**Replacement architecture:**

1. **Vault read** = Theia's native filesystem provider against [[/Idea]]. No VS Code extension needed.
2. **Vault write** = routed through Hen via `s1'.vault.*` gateway methods (`write_file`, `move_file`, `rename_file`, `append_block`, `update_frontmatter`). Hen's [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] + the broader hen-compiler-core write surface protect wikilink integrity, path soundness, and rename-safety. Codified as **IOD-19** in Track 11.
3. **Vault semantic-neighbours** = read via `s1'.semantic.*` gateway methods over [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] (`suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse`). The user's existing Obsidian + Smart Connections produces local BGE-micro-v2 embeddings into `<vault>/.smart-env/multi/*.ajson`; Theia reads those off disk via Hen — no Obsidian-runtime IPC, no HTTP server. Codified as **IOD-18** in Track 11.
4. **Markdown rendering** = Theia's native markdown editor + a custom Theia-native Canon Studio extension with QL/bimba-coordinate decorations + wikilink autocompletion that merges explicit outlinks with Smart Connections semantic-neighbour suggestions.

The user's Obsidian app continues to run independently for authoring. Theia and Obsidian coexist via the shared vault filesystem; no IPC needed.

**Net architectural simplification:** drops a VS Code Extension API borrow that didn't earn its place, removes the Obsidian-runtime dependency from Theia, promotes Hen `smart_env.rs` from optional to canonical for vault semantic-index, and makes Hen the explicit write-gatekeeper for vault integrity.

**Below this Reversal Note: the original decision content remains for historical record. Treat as superseded.**

---

## Context

The Tauri inheritance source (`Body/M/epi-tauri/src/services/vaultClient.ts` + `src-tauri/src/vault/*.rs`) provided an Obsidian-vault adapter. The recast canon (§0.1) names `obsidian-md-vsc` as the canonical S1 vault reach — eliminating the parallel TS/Rust adapter.

Theia hosts VS Code extensions natively via its `@theia/plugin` infrastructure (the [`@theia/plugin-ext-vscode`](https://www.npmjs.com/package/@theia/plugin-ext-vscode) and `@theia/plugin-dev` packages). The decision is **how** `obsidian-md-vsc` is bundled and **what surface** it exposes to Theia extensions.

## Decision

**`obsidian-md-vsc` is embedded as a built-in Theia plugin**, not a user-installed marketplace plugin. This guarantees its availability at first launch and pins its version with the workspace.

### Acquisition path

T1 commits the source acquisition strategy:

| Approach | Decision |
|---|---|
| (a) Add as `@pratibimba/obsidian-md-vsc-bundle` workspace package wrapping the upstream extension | **Selected.** Lets us pin a specific commit/version, run our own packaging, and patch if needed without forking upstream. |
| (b) Install via Open VSX at runtime | Rejected — runtime install requires network; we want offline-first first launch. |
| (c) Submodule the upstream repo | Rejected — submodule overhead exceeds benefit for a single embedded plugin. |

T1 deliverable: `Idea/Pratibimba/System/extensions/obsidian-md-vsc-bundle/` with:
- `package.json` declaring it as a Theia plugin (`"theiaPlugin"` activation) or a VS Code extension fragment (depending on `obsidian-md-vsc`'s actual packaging — verified at T1 first build).
- `dist/` or `extension.vsix` carrying the upstream extension content.
- A README pinning the upstream version, commit SHA, and license.

### Activation entry & loading model

- The Theia browser bundle includes a `plugins/` directory at `theia-app/plugins/` (per `theia-app/package.json#scripts.start = "theia start --plugins=local-dir:plugins …"`).
- T1 adds a build step that places the `obsidian-md-vsc` `.vsix` (or unpacked extension dir) into `theia-app/plugins/` during `pnpm build`.
- The Electron build (ADR-05-004) includes `theia-app/plugins/` via `electron-builder`'s `extraResources` or `files` field.

### Acceptance scope

- **What `obsidian-md-vsc` provides:** vault file tree, markdown rendering with wiki-links, backlinks, frontmatter parsing, daily-note conventions — the S1 vault reach.
- **What Theia extensions consume from it:** VS Code-style commands (`obsidian.openLink`, `obsidian.openBacklinks`, etc.) invoked via Theia's `CommandRegistry`. M-extensions and the OmniPanel route file-open intents through these commands rather than implementing parallel vault logic.
- **What gets dropped from the inheritance sources:** `Body/M/epi-tauri/src/services/vaultClient.ts`, all 13 `vault_*` Tauri commands, the entire `Body/M/epi-tauri/src-tauri/src/vault/` Rust module, and the source-B `Body/S/S3/epi-app/renderer/components/BacklinksPanel.tsx`. See [migration-inventory.md](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/migration-inventory.md) for the exhaustive disposition.

### Privacy & boundary discipline

`obsidian-md-vsc` reads from a user-configured vault path. Theia must:

1. Surface the vault path as a Theia preference (`epi-logos.vault.path`).
2. Refuse to start the extension if no path is set; render a one-time setup prompt instead.
3. Never expose raw vault content to gateway envelopes, S2 graph payloads, S5 evidence DTOs, or observability events unless a governed M-extension capability explicitly opens a vault-derived view. This is enforced at the capability-matrix layer (IOD-17), not at the extension layer.

### Verification (T1)

- T1's "obsidian-md-vsc activates inside Theia and is reachable from the command palette" verification line:
  - Run `pnpm --filter @pratibimba/theia-app start` (browser mode).
  - Open the Theia command palette.
  - Search for an `obsidian.*` command (e.g. `obsidian.openLink`).
  - Confirm the command exists and produces the expected dialog/error if no vault path is set.

## Consequences

- T1 commits `extensions/obsidian-md-vsc-bundle/` and the plugin-folder build step.
- T2 drops the source-A `vaultClient.ts` + source-B `BacklinksPanel.tsx` migration; they are superseded.
- T6 M-extension content that previously assumed a TS vault adapter (e.g. M4 Nara's flow/journal views) routes through `obsidian-md-vsc` commands.
- A future ADR (post-T9) may add additional embedded VS Code extensions (Git, Markdown linters, etc.) — case-by-case per canon §0.1.

## Cross-references

- [canon §0.1](../../../Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md) — VS Code extension borrow rule.
- [11-open-architectural-decisions.md#IOD-17](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md) — capability-matrix governance.
- [`obsidian-md-vsc` upstream](https://marketplace.visualstudio.com/items?itemName=YuMianCheng.obsidian-md-vsc) — verify version at T1 first build.
