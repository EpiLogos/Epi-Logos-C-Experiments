import { existsSync } from "node:fs";
import { join } from "node:path";

const CHILD_EXTENSIONS_ENV = "PI_AGENT_CHILD_EXTENSIONS";
const CHILD_SKILLS_ENV = "EPI_GATE_SKILLS_PATHS";
const PROMPT_FILE = "epi-system.md";

function splitList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function splitSkillRoots(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(":")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function defaultChildExtensions(): string[] {
  const agentDir = process.env.EPI_AGENT_DIR || process.env.PI_CODING_AGENT_DIR;
  if (!agentDir) {
    return [];
  }

  const candidates = [
    join(agentDir, "composite-entry.ts"),
    join(agentDir, "extensions", "epi-citta.ts"),
  ];

  return candidates.filter((candidate) => existsSync(candidate));
}

export function childExtensionsFromEnv(): string[] {
  const configured = splitList(process.env[CHILD_EXTENSIONS_ENV]);
  const fallback = configured.length > 0 ? configured : defaultChildExtensions();
  return Array.from(new Set(fallback.filter((entry) => existsSync(entry))));
}

export function childSkillRootsFromEnv(): string[] {
  const configured = splitSkillRoots(process.env[CHILD_SKILLS_ENV]);
  return Array.from(new Set(configured.filter((entry) => existsSync(entry))));
}

export function childPiRuntimeArgs(): string[] {
  const args = ["--no-extensions"];

  for (const extensionPath of childExtensionsFromEnv()) {
    args.push("--extension", extensionPath);
  }

  const promptsDir = process.env.EPI_AGENT_PROMPTS_DIR;
  if (promptsDir) {
    const promptPath = join(promptsDir, PROMPT_FILE);
    if (existsSync(promptPath)) {
      args.push("--system-prompt", promptPath);
    }
  }

  args.push("--no-skills");
  for (const skillRoot of childSkillRootsFromEnv()) {
    args.push("--skill", skillRoot);
  }

  return args;
}
