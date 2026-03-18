import { spawnSync } from "node:child_process";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { epiRoutes, registerTool as getRoute } from "./ta-onta/anima/S4/epi-citta.ts";

type EpiRouteName =
  | "epi_core_inspect"
  | "epi_core_verify"
  | "epi_vault_read"
  | "epi_graph_query"
  | "epi_agent_help";

declare global {
  var __epiCittaRegistered: boolean | undefined;
}

function runEpi(args: string[]) {
  const result = spawnSync("epi", args, {
    encoding: "utf8",
    cwd: process.env.EPI_REPO_ROOT || process.cwd(),
  });

  return {
    content: [{ type: "text" as const, text: result.stdout || result.stderr || "" }],
    isError: result.status !== 0,
  };
}

function registerRouteTool(api: ExtensionAPI, name: EpiRouteName) {
  const route = getRoute(name);
  api.registerTool({
    name: route.name,
    description: `Run ${route.command.join(" ")} via the sovereign epi CLI substrate.`,
    parameters: Type.Object({
      coordinate: Type.Optional(Type.String({ description: "Coordinate or subject identifier." })),
      path: Type.Optional(Type.String({ description: "Filesystem path argument." })),
      query: Type.Optional(Type.String({ description: "Free-form trailing argument." })),
    }),
    async execute(_toolCallId, params) {
      const args = [...route.command.slice(1)];
      const extra = params.coordinate ?? params.path ?? params.query;
      if (extra) {
        args.push(extra);
      }
      return runEpi(args);
    },
  });
}

export async function main(api: ExtensionAPI) {
  if (globalThis.__epiCittaRegistered) {
    return;
  }
  globalThis.__epiCittaRegistered = true;

  for (const route of epiRoutes) {
    registerRouteTool(api, route.name as EpiRouteName);
  }
}

export default async function epiCittaExtension(api: ExtensionAPI) {
  await main(api);
}
