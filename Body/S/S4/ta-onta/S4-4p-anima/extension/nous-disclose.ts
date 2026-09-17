// 17.10 — nous_disclose isolated into its own module (per S4-ARCHITECTURE §5
// finding 2). Nous dis-closure navigates the S0'/S1'/S2' data-source
// gradations and updates the existing Khora session notebook; it is the only
// anima tool that owns a Gnosis-ingest seam, so it lives apart from the
// dispatch family.

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { spawnSync } from "node:child_process";
import { runEpi } from "./dispatch.ts";

export function registerNousDiscloseTool(api: ExtensionAPI) {
  api.registerTool({
    name: "nous_disclose",
    label: "Nous Disclose",
    description:
      "Nous dis-closure: navigate S0'/S1'/S2' data source gradations (CLI/Vault/Graph) to curate a context package for the current task/NOW. Injects curated source listing + context notes as an UPDATE to the existing Khora session notebook.",
    parameters: Type.Object({
      task: Type.String(),
      session_id: Type.String(),
      now_path: Type.Optional(Type.String()),
      source_coordinates: Type.Optional(Type.Array(Type.String())),
      depth: Type.Optional(Type.Union([
        Type.Literal("s0"),
        Type.Literal("s1"),
        Type.Literal("s2"),
        Type.Literal("full"),
      ])),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const depth = params.depth || "full";
      const coords = params.source_coordinates || [];
      const sources: string[] = [];

      if (depth !== "s1") {
        const cliCtx: string[] = [];
        for (const coord of coords) {
          const result = runEpi(["core", "knowing", coord, "--json"], 30_000);
          if (result.stdout) {
            cliCtx.push(`[S0' epi knowing ${coord}]\n${result.stdout.trim()}`);
          }
        }
        if (cliCtx.length) {
          sources.push("## S0' — CLI Context\n" + cliCtx.join("\n\n"));
        }
      }

      if (depth === "s1" || depth === "full") {
        const vaultSearch = spawnSync("obsidian-cli", ["search", "--query", params.task, "--limit", "5", "--json"], {
          encoding: "utf8",
          timeout: 30_000,
          cwd: process.env.EPI_REPO_ROOT || process.cwd(),
        });
        if (vaultSearch.stdout) {
          sources.push(`## S1' — Vault Context\n${vaultSearch.stdout.trim()}`);
        }
      }

      if (depth === "s2" || depth === "full") {
        const graphCtx: string[] = [];
        for (const coord of coords) {
          const result = runEpi(["--json", "graph", "retrieve", coord, "--nested"], 30_000);
          if (result.stdout) {
            graphCtx.push(`[S2' graph ${coord}]\n${result.stdout.trim()}`);
          }
        }
        if (graphCtx.length) {
          sources.push("## S2' — Graph Context\n" + graphCtx.join("\n\n"));
        }
      }

      const notebookUpdate = [
        `## Nous Dis-closure — ${new Date().toISOString()}`,
        `**Task:** ${params.task}`,
        `**Source coordinates:** ${coords.length ? coords.join(", ") : "none specified"}`,
        `**Depth:** ${depth}`,
        "",
        ...sources,
      ].join("\n");

      const { mkdirSync, writeFileSync } = await import("node:fs");
      const notebookName = `khora-session-${params.session_id}`;
      const tmpDir = `/tmp/nous-disclose-${params.session_id}`;
      mkdirSync(tmpDir, { recursive: true });
      const tmpPath = `${tmpDir}/context.md`;
      writeFileSync(tmpPath, notebookUpdate);

      const createNotebook = runEpi(["techne", "gnosis", "notebook", "create", notebookName], 30_000);
      if (createNotebook.status !== 0) {
        return {
          // pi requires a details payload; this tool returns none.
          details: undefined,
          content: [{ type: "text", text: createNotebook.stderr || createNotebook.stdout || "notebook creation failed" }],
          isError: true,
        };
      }

      const ingest = runEpi(
        // The session context package goes into the RAG corpus, not the local
        // keyword store. `ingest-gnostic` runs RAG-Anything (parse -> chunk ->
        // 3072-dim embed -> Neo4j) and `--notebook` stamps pool membership on
        // the chunks, so `gnosis query --notebook <pool>` is real retrieval over
        // this session's sources. The old `gnosis ingest` arm wrote to a
        // side store the RAG path could not see at all.
        ["techne", "gnosis", "ingest-gnostic", tmpPath, "--notebook", notebookName],
        30_000,
      );

      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [
          {
            type: "text",
            text: ingest.stdout
              ? `nous_disclose: context package injected into session notebook ${params.session_id}\n${ingest.stdout.trim()}`
              : `nous_disclose failed: ${ingest.stderr || ingest.stdout}`,
          },
        ],
        isError: ingest.status !== 0,
      };
    },
  });
}
