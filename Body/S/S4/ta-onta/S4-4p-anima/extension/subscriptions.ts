import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { animaDefaultTools } from "./capabilities.ts";
import { getCSState, setCSState, sophiaReview } from "./dispatch.ts";

export function registerAnimaSubscriptions(api: ExtensionAPI) {
  api.on("session_start", async () => {
    api.setActiveTools(animaDefaultTools);
  });

  api.on("before_agent_start", async () => {
    setCSState(undefined, { value: "CS0", directionality: "day", cpPosition: "4.0" });

    // Inject the full VAK skill stack so Anima has the coordinate reference,
    // the evaluation protocol, and the dispatch table at session start.
    // Order matters: reference first, evaluation second, dispatch third.
    const VAK_SKILLS = ["vak-coordinate-frame", "vak-evaluate", "anima-orchestration"];
    const skillBlocks: string[] = [];
    for (const name of VAK_SKILLS) {
      const skillPath = new URL(`../S4'/skills/${name}/SKILL.md`, import.meta.url).pathname;
      if (!existsSync(skillPath)) continue;
      const raw = readFileSync(skillPath, "utf-8");
      const body = raw.replace(/^---[\s\S]*?---\n/, "").trim();
      skillBlocks.push(`## ${name}\n\n${body}`);
    }
    if (skillBlocks.length === 0) return {};
    return {
      systemPrompt: `\n\n---\n\n## VAK Operative Skills\n\nThese three skills govern your evaluation and dispatch protocol. For every non-trivial task: first run vak-evaluate to get coordinates, then use anima-orchestration to route to the correct agent.\n\n${skillBlocks.join("\n\n---\n\n")}`,
    };
  });

  api.on("agent_end", async () => {
    // Guard: sub-agents (sophia, logos, etc.) must not trigger their own sophia review,
    // or we get an infinite dispatch chain.
    if (process.env.EPI_AGENT_NAME && process.env.EPI_AGENT_NAME !== "anima") return;
    const currentState = getCSState();
    const result = sophiaReview(
      undefined,
      `Session ended from ${currentState.cpPosition} in ${currentState.directionality} mode.`,
    );
    void result;
  });
}
