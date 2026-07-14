/**
 * Coordinate: S4-5' (harness-blind memory pipeline tests — Tranche 42.9)
 * Actualises: the spec's verification legs — a Codex-run and a Pi-run session
 *   yield VAK-keyed Graphiti episodes through the IDENTICAL summariser path
 *   (same function, asserted structurally identical modulo carried data); a
 *   phase-qualified coordinate (the Night' prime) survives verbatim into the
 *   episode group_id; the session-promote episode builds from the
 *   harness-neutral transcript (42.5 shape), not any harness-specific log.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildTranscriptPromotionEpisode,
  deriveVakGroupId,
  readGatewayTranscript,
  summariseTranscript,
  type GatewayTranscriptEntry,
  type TranscriptVakAddress,
} from "../modules/transcript-summariser.ts";

const NIGHT_PRIME_VAK: TranscriptVakAddress = {
  cpf: "Mechanistic",
  ct: ["CT2"],
  cp: "CP4.3",
  cf: "(5/0)",
  cfp: "CFP3",
  cs: { code: "CS0", direction: "Night'" },
};

function transcriptFor(harnessId: string): GatewayTranscriptEntry[] {
  return [
    {
      kind: "message",
      role: "user",
      message: "walk the coordinate and report",
      timestamp_ms: 1000,
    },
    {
      kind: "harness_turn_event",
      role: "harness",
      message: "tool call requested epi_walk (call-1)",
      run_id: "run-1",
      harness_id: harnessId,
      vak_address: NIGHT_PRIME_VAK,
      event: { kind: "toolCallRequested", callId: "call-1", name: "epi_walk" },
      timestamp_ms: 2000,
    },
    {
      kind: "harness_turn_event",
      role: "harness",
      message: "the coordinate resolves through M4-3",
      run_id: "run-1",
      harness_id: harnessId,
      vak_address: NIGHT_PRIME_VAK,
      event: { kind: "turnComplete", text: "the coordinate resolves through M4-3" },
      timestamp_ms: 3000,
    },
  ];
}

describe("42.9 harness-blind transcript summariser", () => {
  it("a Pi-run and a Codex-run transcript flow through the identical path and differ only in carried harness data", () => {
    const pi = summariseTranscript({
      entries: transcriptFor("pi"),
      sessionKey: "sess-alpha",
      dayId: "14-07-2026",
    });
    const codex = summariseTranscript({
      entries: transcriptFor("codex-native"),
      sessionKey: "sess-alpha",
      dayId: "14-07-2026",
    });

    assert.deepEqual(pi.harness_ids, ["pi"]);
    assert.deepEqual(codex.harness_ids, ["codex-native"]);
    // Identical summariser output shape and content modulo the carried
    // harness provenance — the code path has no harness branch to diverge on.
    const scrub = (value: Record<string, unknown>) =>
      JSON.parse(
        JSON.stringify(value).replaceAll("codex-native", "HARNESS").replaceAll('"pi"', '"HARNESS"').replaceAll("=pi", "=HARNESS"),
      );
    assert.deepEqual(scrub(pi as never), scrub(codex as never));
    assert.equal(pi.group_id, codex.group_id, "the VAK key is harness-independent");
  });

  it("preserves the Night' phase marker verbatim in the episode group_id", () => {
    const group = deriveVakGroupId({
      dayId: "14-07-2026",
      sessionKey: "sess-alpha",
      vak: NIGHT_PRIME_VAK,
    });
    assert.equal(group, "vak:14-07-2026:sess-alpha:CP4.3:CS0:Night'");
    assert.ok(group.includes("Night'"), "phase-qualified coordinate survives, prime included");
  });

  it("reads the gateway jsonl shape off disk and builds the promote episode from it", () => {
    const dir = mkdtempSync(join(tmpdir(), "transcript-42-9-"));
    const path = join(dir, "sess-alpha.jsonl");
    writeFileSync(path, transcriptFor("codex-native").map((entry) => JSON.stringify(entry)).join("\n") + "\n");

    const entries = readGatewayTranscript(path);
    assert.equal(entries.length, 3);

    const summary = summariseTranscript({ entries, sessionKey: "sess-alpha", dayId: "14-07-2026" });
    assert.equal(summary.turn_count, 2);
    assert.equal(summary.tool_call_count, 1);

    const episode = buildTranscriptPromotionEpisode(summary);
    assert.equal(episode.group_id, "vak:14-07-2026:sess-alpha:CP4.3:CS0:Night'");
    assert.equal(episode.cpf, "Mechanistic");
    assert.equal(episode.cp, "CP4.3");
    assert.equal(episode.source, "aletheia-session-promote");
    assert.match(String(episode.content), /the coordinate resolves through M4-3/);
  });

  it("refuses a transcript with no vak_address instead of fabricating a key", () => {
    assert.throws(
      () =>
        summariseTranscript({
          entries: [
            { kind: "message", role: "user", message: "hello", timestamp_ms: 1 },
          ],
          sessionKey: "sess-empty",
          dayId: "14-07-2026",
        }),
      /carries no vak_address/,
    );
  });
});
