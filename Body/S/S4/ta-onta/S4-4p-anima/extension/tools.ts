// Anima tool registration aggregator. The dispatch family (six tools) lives
// in ./dispatch-tools.ts and nous_disclose in ./nous-disclose.ts (17.10);
// this file keeps the evaluation/prelude surface and preserves the original
// registration order: evaluate/prelude -> orchestrate+dispatch family
// (with nous_disclose registered between arena-orchestrate and the
// parallel-dispatch family, exactly as before the split).

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { runEpi } from "./dispatch.ts";
import { registerAnimaDispatchTools } from "./dispatch-tools.ts";
import { registerNousDiscloseTool } from "./nous-disclose.ts";

export function registerAnimaTools(api: ExtensionAPI) {
  api.registerTool({
    name: "vak_evaluate",
    label: "Vak Evaluate",
    description:
      "Assign 6-layer VAK coordinates (CPF/CT/CP/CF/CFP/CS) to a task. CF code determines constitutional agent routing. CFP determines thread type (CFP0-CFP5).",
    parameters: Type.Object({
      task: Type.String({ description: "Task description to evaluate" }),
      json: Type.Optional(Type.Boolean({ default: false })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["agent", "vak", "evaluate", params.task];
      if (params.json) {
        args.push("--json");
      }
      const result = runEpi(args);
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined, content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  api.registerTool({
    name: "goal_prelude",
    label: "Goal Prelude",
    description:
      "Create the first-pass /goal artifact: a dialogical, NOW-bound GoalPrelude markdown file. This does not start a run, create cron, or resolve review.",
    parameters: Type.Object({
      goal: Type.String({ description: "Raw user goal text, 4,000 characters or fewer" }),
      now_path: Type.Optional(Type.String({ description: "Active NOW.md path; defaults to session environment" })),
      session_key: Type.Optional(Type.String({ description: "Gateway session key to resolve NOW when now_path is absent" })),
      session_id: Type.Optional(Type.String({ description: "Session id override for non-canonical NOW paths" })),
      day_id: Type.Optional(Type.String({ description: "Day id override for non-canonical NOW paths" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["agent", "goal", "prelude", params.goal, "--json"];
      if (params.now_path) args.push("--now-path", params.now_path);
      if (params.session_key) args.push("--session-key", params.session_key);
      if (params.session_id) args.push("--session-id", params.session_id);
      if (params.day_id) args.push("--day-id", params.day_id);
      const result = runEpi(args, 30_000);
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: result.stdout || result.stderr }],
        isError: result.status !== 0,
      };
    },
  });


  registerAnimaDispatchTools(api);
  registerNousDiscloseTool(api);
}
