/**
 * 51.T51.1 — the context pack is the injection, not a report about it.
 *
 * The tranche exists because `composite-entry.ts` assembled a session-context
 * injection that nothing could see, and had in fact been discarded entirely
 * for an unknown period with no way to notice. These tests hold the two
 * properties that make that class of silence impossible: there is ONE
 * assembler, and the published pack carries the very bytes the live
 * `before_agent_start` seam hands the model.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SpineCompositor } from "../spine/compositor.ts";
import {
  contextPackPath,
  publishContextPack,
  readContextPack,
  slugSessionKey,
} from "../spine/context-pack-store.ts";
import {
  assembleAndPublishSessionContext,
  registerTaOntaSpine,
  SESSION_CONTEXT_HEADING,
} from "../composite-entry.ts";
import type { SpineContribution, InjectionSlot, SessionContext } from "../spine/types.ts";

function contribution(
  coordinate: string,
  content: string,
  cost: InjectionSlot["cost"] = "hot",
  throws = false,
): SpineContribution {
  return {
    coordinate,
    async injectionSlot() {
      if (throws) throw new Error(`carrier ${coordinate} exploded`);
      return { coordinate, cost, content, charEstimate: content.length };
    },
    ledgerChannel() {
      return {
        coordinate,
        ledgerDir: "test",
        async extract(_ctx: SessionContext) {
          return null;
        },
      };
    },
    compilerPass() {
      return {
        coordinate,
        schedule: "cold",
        async compile() {},
        async readCompiled() {
          return "";
        },
      };
    },
    queryHandler() {
      return {
        coordinate,
        async query() {
          return "";
        },
      };
    },
  };
}

describe("context pack — one assembler", () => {
  it("assembleInjection returns exactly the pack's injection bytes", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S0/S0'", "ground"));
    compositor.register(contribution("S1/S1'", "vault", "warm"));

    const pack = await compositor.assembleContextPack("proof");
    const injection = await compositor.assembleInjection();

    assert.equal(injection, pack.injection);
  });

  it("every included block's rendered text is a substring of the injection", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S0/S0'", "ground state"));
    compositor.register(contribution("S3'/Temporal", "clock", "warm"));

    const pack = await compositor.assembleContextPack("proof");
    const included = pack.blocks.filter(b => b.status === "included");

    assert.equal(included.length, 2);
    for (const block of included) {
      assert.ok(block.rendered !== null, `${block.coordinate} included without rendered text`);
      assert.ok(
        pack.injection.includes(block.rendered as string),
        `${block.coordinate}'s rendered block is absent from the injection it claims to be in`,
      );
    }
  });

  it("concatenating the included blocks reproduces the injection exactly", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S0/S0'", "a"));
    compositor.register(contribution("S1/S1'", "b"));
    compositor.register(contribution("S4/S4'", "c", "warm"));

    const pack = await compositor.assembleContextPack("proof");
    const reconstructed = pack.blocks
      .filter(b => b.status === "included")
      .map(b => b.rendered as string)
      .join("\n\n---\n\n");

    assert.equal(reconstructed, pack.injection);
  });
});

describe("context pack — provenance the old string could not carry", () => {
  it("records a failed carrier instead of silently dropping it", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S0/S0'", "ground"));
    compositor.register(contribution("S2/S3", "broken", "hot", true));

    const pack = await compositor.assembleContextPack("proof");
    const failed = pack.blocks.find(b => b.coordinate === "S2/S3");

    assert.ok(failed, "the exploding carrier vanished from the pack");
    assert.equal(failed?.status, "failed");
    assert.match(failed?.error ?? "", /exploded/);
    assert.ok(
      !pack.injection.includes("S2/S3"),
      "a failed carrier must not appear in the injected text",
    );
  });

  it("marks over-budget carriers as overflowed and keeps their dereference token", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S4", "hot".repeat(100)));
    compositor.register(contribution("C3'", "x".repeat(20_000), "warm"));

    const pack = await compositor.assembleContextPack("proof");
    const overflowed = pack.blocks.find(b => b.coordinate === "C3'");

    assert.equal(overflowed?.status, "overflowed");
    assert.equal(overflowed?.rendered, null);
    assert.match(overflowed?.vakToken ?? "", /s5'\.gnostic\.resolve\(C3'\)/);
    assert.ok(pack.injection.includes(overflowed?.vakToken as string));
    assert.ok(pack.budget.usedChars <= pack.budget.limitChars);
  });

  it("carries per-carrier byte size and freshness", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S1/S1'", "café"));

    const pack = await compositor.assembleContextPack("proof");
    const block = pack.blocks[0];

    // "café" is 4 chars but 5 UTF-8 bytes — the pack reports bytes, and the
    // budget is spent in the carrier's own char estimate. Both are visible.
    assert.equal(block.bytes, 5);
    assert.equal(block.charEstimate, 4);
    assert.ok(block.producedAtMs >= pack.assembledAtMs);
  });
});

describe("context pack — publication round-trip", () => {
  it("publishes to the gate-state path the Rust adapter reads and preserves the injection byte-for-byte", async () => {
    const stateRoot = mkdtempSync(join(tmpdir(), "ta-onta-context-pack-"));
    const compositor = new SpineCompositor();
    compositor.register(contribution("S0/S0'", "ground"));
    compositor.register(contribution("S5/S5'", "world", "warm"));

    const pack = await compositor.assembleContextPack("agent:anima:main");
    const path = publishContextPack(pack, stateRoot);

    assert.equal(path, contextPackPath(stateRoot, "agent:anima:main"));
    assert.equal(
      path,
      join(stateRoot, "s4", "context-pack", "agent_anima_main.json"),
      "the published path must match the Rust slug law (non [A-Za-z0-9_-] -> _)",
    );

    const onDisk = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(onDisk.injection, pack.injection);

    const readBack = readContextPack(stateRoot, "agent:anima:main");
    assert.equal(readBack?.injection, pack.injection);
    assert.deepEqual(readBack?.blocks, pack.blocks);
  });

  it("returns null rather than a fabricated pack when a session never assembled one", () => {
    const stateRoot = mkdtempSync(join(tmpdir(), "ta-onta-context-pack-empty-"));
    assert.equal(readContextPack(stateRoot, "never-ran"), null);
  });

  it("slugs session keys exactly as the Rust adapter does", () => {
    assert.equal(slugSessionKey("agent:anima:main"), "agent_anima_main");
    assert.equal(slugSessionKey("main"), "main");
    assert.equal(slugSessionKey("a/b c.d"), "a_b_c_d");
    assert.equal(slugSessionKey("keep-_"), "keep-_");
  });
});

describe("context pack — the live before_agent_start seam", () => {
  it("publishes exactly the bytes it injects", async () => {
    const stateRoot = mkdtempSync(join(tmpdir(), "ta-onta-context-pack-live-"));
    const priorRoot = process.env.EPI_GATE_STATE_ROOT;
    const priorSession = process.env.EPI_SESSION_ID;
    process.env.EPI_GATE_STATE_ROOT = stateRoot;
    process.env.EPI_SESSION_ID = "seam-proof";

    try {
      // The module singleton is what the seam assembles from; register the six
      // real carriers exactly as `taOntaCompositeEntry` does.
      registerTaOntaSpine();

      // The very function `api.on("before_agent_start", …)` receives.
      const result = await assembleAndPublishSessionContext();

      const published = readContextPack(stateRoot, "seam-proof");
      assert.ok(published, "the live seam injected without publishing a pack");
      assert.equal(
        result.systemPrompt,
        `${SESSION_CONTEXT_HEADING}${published?.injection}`,
        "the injected system prompt is not the published pack's injection",
      );
      assert.equal(published?.sessionKey, "seam-proof");
      assert.equal(published?.blocks.length, 6, "all six ta-onta carriers must appear in the pack");
      assert.deepEqual(
        published?.blocks.map(b => b.coordinate).sort(),
        ["S0/S0'", "S1/S1'", "S2/S3", "S3'/Temporal", "S4/S4'", "S5/S5'"].sort(),
      );
    } finally {
      if (priorRoot === undefined) delete process.env.EPI_GATE_STATE_ROOT;
      else process.env.EPI_GATE_STATE_ROOT = priorRoot;
      if (priorSession === undefined) delete process.env.EPI_SESSION_ID;
      else process.env.EPI_SESSION_ID = priorSession;
    }
  });
});
