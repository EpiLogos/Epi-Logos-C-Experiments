// aletheia/modules/agora-vendoring.ts
//
// Agora CF4 vendoring surface for the Track 12.24 Hermes priority catalog.
// Network fetch is intentionally separated from the pure catalog/verification
// logic here: production harnesses may supply a fetcher, while the repo-local
// module can still validate residency, frontmatter, and provenance determinism.

import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type AgoraUpstreamSource = "hermes-priority-13";

export interface HermesCatalogEntry {
  name: string;
  description: string;
  source: AgoraUpstreamSource;
  upstreamPath: string;
  requiredTags: string[];
}

export interface AgoraVendorRequest {
  name: string;
  upstreamRoot: string;
  repoRoot?: string;
  upstreamCommit: string;
  timestamp?: string;
}

export interface AgoraVendorResult {
  name: string;
  skillDir: string;
  skillPath: string;
  provenancePath: string;
  registered: boolean;
}

export interface AgoraVerifyResult {
  name: string;
  valid: boolean;
  errors: string[];
  frontmatter: Record<string, string>;
}

const HERMES_CATALOG: readonly HermesCatalogEntry[] = [
  { name: "huggingface-hub", description: "Model, dataset, and artifact distribution through Hugging Face Hub.", source: "hermes-priority-13", upstreamPath: "skills/mlops/huggingface-hub", requiredTags: ["HuggingFace"] },
  { name: "huggingface-accelerate", description: "Distributed and mixed-device training launch surface via Accelerate.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/accelerate", requiredTags: ["accelerate"] },
  { name: "peft-fine-tuning", description: "LoRA, QLoRA, and other parameter-efficient fine-tuning methods.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/peft", requiredTags: ["PEFT"] },
  { name: "unsloth", description: "Memory-efficient fine-tuning accelerator for supported transformer models.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/training/unsloth", requiredTags: ["Unsloth"] },
  { name: "fine-tuning-with-trl", description: "SFT, DPO, PPO, GRPO, and reward-model training through TRL.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/training/trl-fine-tuning", requiredTags: ["TRL"] },
  { name: "simpo-training", description: "Reference-free preference optimization for Elo-derived preference pairs.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/simpo", requiredTags: ["SimPO"] },
  { name: "weights-and-biases", description: "Experiment tracking, metric lineage, and artifact provenance.", source: "hermes-priority-13", upstreamPath: "skills/mlops/evaluation/weights-and-biases", requiredTags: ["W&B"] },
  { name: "pytorch-lightning", description: "Structured training-loop orchestration for Python-hosted model work.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/pytorch-lightning", requiredTags: ["PyTorch Lightning"] },
  { name: "nemo-curator", description: "Corpus curation, deduplication, PII redaction, and quality filtering.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/nemo-curator", requiredTags: ["NVIDIA"] },
  { name: "serving-llms-vllm", description: "High-throughput LLM serving with adapter-aware inference.", source: "hermes-priority-13", upstreamPath: "skills/mlops/inference/vllm", requiredTags: ["vLLM"] },
  { name: "llama-cpp", description: "GGUF quantization and local inference, including Apple-Silicon paths.", source: "hermes-priority-13", upstreamPath: "skills/mlops/inference/llama-cpp", requiredTags: ["llama.cpp"] },
  { name: "evaluating-llms-harness", description: "lm-eval-harness style benchmark and held-out evaluation workflows.", source: "hermes-priority-13", upstreamPath: "skills/mlops/evaluation/lm-evaluation-harness", requiredTags: ["lm-eval"] },
  { name: "dspy", description: "Declarative LM program and judge-loop optimization workflows.", source: "hermes-priority-13", upstreamPath: "optional-skills/mlops/research/dspy", requiredTags: ["DSPy"] },
];

export function agora_list_upstream(input: { source?: AgoraUpstreamSource } = {}): HermesCatalogEntry[] {
  const source = input.source ?? "hermes-priority-13";
  return HERMES_CATALOG.filter((entry) => entry.source === source).map((entry) => ({ ...entry }));
}

export async function agora_preview_skill(input: { name: string; repoRoot?: string }): Promise<string> {
  const entry = catalogEntry(input.name);
  const repoRoot = input.repoRoot ?? process.cwd();
  return readFile(join(repoRoot, "Body/S/S4/pi-agent/skills/hermes", entry.name, "SKILL.md"), "utf8");
}

export async function agora_vendor_skill(input: AgoraVendorRequest): Promise<AgoraVendorResult> {
  const entry = catalogEntry(input.name);
  const repoRoot = input.repoRoot ?? process.cwd();
  const upstreamRoot = input.upstreamRoot.trim();
  const upstreamCommit = input.upstreamCommit.trim();
  if (!upstreamRoot || !upstreamCommit) throw new Error("upstreamRoot and upstreamCommit are required to vendor a Hermes skill");
  const upstreamDir = join(upstreamRoot, entry.upstreamPath);
  const upstreamFrontmatter = parseFrontmatter(await readFile(join(upstreamDir, "SKILL.md"), "utf8"));
  if (upstreamFrontmatter.name !== entry.name) throw new Error(`upstream skill at ${entry.upstreamPath} does not declare ${entry.name}`);
  const skillDir = join(repoRoot, "Body/S/S4/pi-agent/skills/hermes", entry.name);
  const skillPath = join(skillDir, "SKILL.md");
  const provenancePath = join(skillDir, "provenance.yaml");
  await mkdir(join(repoRoot, "Body/S/S4/pi-agent/skills/hermes"), { recursive: true });
  await cp(upstreamDir, skillDir, { recursive: true, force: true });
  await writeFile(
    provenancePath,
    [
      `source: ${entry.source}`,
      `name: ${entry.name}`,
      "upstream_repository: https://github.com/NousResearch/hermes-agent.git",
      `upstream_path: ${entry.upstreamPath}`,
      `upstream_commit: ${upstreamCommit}`,
      `vendored_at: ${input.timestamp ?? new Date().toISOString()}`,
      "vendor_agent: agora",
      "vendoring_mode: source-tree-copy",
      "",
    ].join("\n"),
    "utf8",
  );
  await agora_refresh_skill({ name: entry.name, repoRoot });
  return { name: entry.name, skillDir, skillPath, provenancePath, registered: true };
}

export async function agora_verify_skill(input: { name: string; repoRoot?: string }): Promise<AgoraVerifyResult> {
  const entry = catalogEntry(input.name);
  const repoRoot = input.repoRoot ?? process.cwd();
  const skillPath = join(repoRoot, "Body/S/S4/pi-agent/skills/hermes", entry.name, "SKILL.md");
  const text = await readFile(skillPath, "utf8");
  const frontmatter = parseFrontmatter(text);
  const errors: string[] = [];
  for (const key of ["name", "description"]) {
    if (!frontmatter[key]?.trim()) errors.push(`missing frontmatter key ${key}`);
  }
  if (frontmatter.name !== entry.name) errors.push(`frontmatter name ${frontmatter.name} does not match ${entry.name}`);
  for (const tag of entry.requiredTags) {
    if (!text.includes(tag)) errors.push(`missing required upstream marker ${tag}`);
  }
  const provenance = await readFile(join(repoRoot, "Body/S/S4/pi-agent/skills/hermes", entry.name, "provenance.yaml"), "utf8").catch(() => "");
  for (const field of ["upstream_repository", "upstream_path", "upstream_commit"]) {
    if (!provenance.split(/\r?\n/).some((line) => line.startsWith(`${field}: `))) errors.push(`missing provenance field ${field}`);
  }
  return { name: entry.name, valid: errors.length === 0, errors, frontmatter };
}

export async function agora_refresh_skill(input: { name?: string; repoRoot?: string } = {}): Promise<{ indexed: number; names: string[] }> {
  const repoRoot = input.repoRoot ?? process.cwd();
  const hermesRoot = join(repoRoot, "Body/S/S4/pi-agent/skills/hermes");
  const names = input.name ? [input.name] : await listSkillDirs(hermesRoot);
  const records = [];
  for (const name of names) {
    const skillPath = join(hermesRoot, name, "SKILL.md");
    const info = await stat(skillPath).catch(() => undefined);
    if (!info?.isFile()) continue;
    const text = await readFile(skillPath, "utf8");
    const frontmatter = parseFrontmatter(text);
    records.push({
      name,
      source: "vendored",
      residency: `Body/S/S4/pi-agent/skills/hermes/${name}`,
      description: frontmatter.description ?? "",
      frontmatter,
    });
  }
  const indexPath = join(repoRoot, "Body/S/S4/pi-agent/skills/hermes/agora-skill-index.jsonl");
  await writeFile(indexPath, records.map((record) => JSON.stringify(record)).join("\n") + "\n", "utf8");
  return { indexed: records.length, names: records.map((record) => record.name) };
}

function catalogEntry(name: string): HermesCatalogEntry {
  const entry = HERMES_CATALOG.find((candidate) => candidate.name === name);
  if (!entry) throw new Error(`unknown Hermes priority skill ${name}`);
  return entry;
}

async function listSkillDirs(root: string): Promise<string[]> {
  const entries = await readdir(root).catch(() => []);
  const out: string[] = [];
  for (const entry of entries) {
    const info = await stat(join(root, entry)).catch(() => undefined);
    if (info?.isDirectory()) out.push(entry);
  }
  return out.sort();
}

function parseFrontmatter(text: string): Record<string, string> {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", "---\n".length);
  if (end < 0) return {};
  const out: Record<string, string> = {};
  for (const line of text.slice("---\n".length, end).split(/\r?\n/)) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    out[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
  }
  return out;
}
