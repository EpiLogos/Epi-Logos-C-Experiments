import assert from "node:assert/strict";
import test from "node:test";

import { evaluateRatchet } from "../gateway-method-gate.mjs";

const table = (rows) => ({ methods: rows, summary: { probed: rows.length } });

test("a ratcheted method present in the fresh table keeps the gate green", () => {
  const { ok, missing } = evaluateRatchet(
    table([{ method: "chat.send", exists: true }]),
    { expectedPresent: [{ method: "chat.send", claimedBy: "baseline" }] },
  );
  assert.equal(ok, true);
  assert.deepEqual(missing, []);
});

test("a ratcheted method absent from the live gateway fails the gate", () => {
  const { ok, missing } = evaluateRatchet(
    table([
      { method: "chat.send", exists: true },
      { method: "s5'.tune.get", exists: false },
    ]),
    {
      expectedPresent: [
        { method: "chat.send", claimedBy: "baseline" },
        { method: "s5'.tune.get", claimedBy: "track-38 --mark done" },
      ],
    },
  );
  assert.equal(ok, false);
  assert.deepEqual(missing.map((entry) => entry.method), ["s5'.tune.get"]);
});

test("a ratcheted method that timed out (exists null) counts as missing, never a pass", () => {
  const { ok, missing } = evaluateRatchet(
    table([{ method: "nara.oracle.cast", exists: null }]),
    { expectedPresent: [{ method: "nara.oracle.cast", claimedBy: "baseline" }] },
  );
  assert.equal(ok, false);
  assert.equal(missing.length, 1);
});

test("present-but-unclaimed methods surface as unratcheted warnings, not failures", () => {
  const { ok, unratcheted } = evaluateRatchet(
    table([
      { method: "chat.send", exists: true },
      { method: "s1'.base.ensure", exists: true },
    ]),
    { expectedPresent: [{ method: "chat.send", claimedBy: "baseline" }] },
  );
  assert.equal(ok, true);
  assert.deepEqual(unratcheted, ["s1'.base.ensure"]);
});
