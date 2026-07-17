import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { agora_vendor_skill, agora_verify_skill } from "./agora-vendoring.ts";

test("Agora vendors an upstream skill tree without regenerating its content", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-vendor-"));
  const upstream = join(root, "upstream");
  const source = join(upstream, "skills/mlops/huggingface-hub");
  await mkdir(join(source, "references"), { recursive: true });
  await writeFile(join(source, "SKILL.md"), "---\nname: huggingface-hub\ndescription: Official upstream skill\n---\n\n# HuggingFace Hub\n\nHuggingFace\n", "utf8");
  await writeFile(join(source, "references", "commands.md"), "hf download org/model\n", "utf8");

  await agora_vendor_skill({
    name: "huggingface-hub",
    upstreamRoot: upstream,
    upstreamCommit: "0123456789abcdef",
    repoRoot: root,
    timestamp: "2026-07-17T00:00:00.000Z",
  });

  assert.equal(
    await readFile(join(root, "Body/S/S4/pi-agent/skills/hermes/huggingface-hub/references/commands.md"), "utf8"),
    "hf download org/model\n",
  );
  const verified = await agora_verify_skill({ name: "huggingface-hub", repoRoot: root });
  assert.equal(verified.valid, true, verified.errors.join("; "));
});

test("the priority-13 catalog verifies every committed Hermes copy", async () => {
  for (const name of [
    "huggingface-hub",
    "huggingface-accelerate",
    "peft-fine-tuning",
    "unsloth",
    "fine-tuning-with-trl",
    "simpo-training",
    "weights-and-biases",
    "pytorch-lightning",
    "nemo-curator",
    "serving-llms-vllm",
    "llama-cpp",
    "evaluating-llms-harness",
    "dspy",
  ]) {
    const verified = await agora_verify_skill({ name, repoRoot: process.cwd() });
    assert.equal(verified.valid, true, `${name}: ${verified.errors.join("; ")}`);
  }
});
