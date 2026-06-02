import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { dayArc, formatDayArcResult } from "../modules/graphiti-day-arc.ts";

// Per S4-3'-SPEC §"Test Obligations": "Graphiti day arc tests must be non-fatal
// when the sidecar is unavailable." These tests make a REAL fetch to an address
// where nothing is listening — no mock — and assert graceful degradation.
//
// 127.0.0.1:1 is the standard "connection refused" target (port 1, tcpmux, never
// bound). A short timeout keeps the suite fast even if the OS is slow to refuse.
const UNREACHABLE = "http://127.0.0.1:1";

describe("Chronos Graphiti day arc — non-fatal seam", () => {
  it("open degrades non-fatally when the sidecar is unreachable", async () => {
    const r = await dayArc({ action: "open", dayId: "02-06-2026", graphitiBase: UNREACHABLE, timeoutMs: 1500 });
    assert.equal(r.ok, false);
    assert.equal(r.skipped, true);
    assert.equal(r.status, undefined);
    assert.ok(typeof r.reason === "string" && r.reason.length > 0, "carries a reason string");
  });

  it("close degrades non-fatally when the sidecar is unreachable", async () => {
    const r = await dayArc({ action: "close", dayId: "02-06-2026", graphitiBase: UNREACHABLE, timeoutMs: 1500 });
    assert.equal(r.ok, false);
    assert.equal(r.skipped, true);
  });

  it("never rejects — degradation is a resolved value, not a thrown error", async () => {
    await assert.doesNotReject(() =>
      dayArc({ action: "open", dayId: "01-01-2026", graphitiBase: UNREACHABLE, timeoutMs: 1500 }),
    );
  });

  it("formats a skipped result as a 'not reachable — skipped' line", () => {
    const line = formatDayArcResult("open", "02-06-2026", { ok: false, skipped: true, reason: "ConnectError" });
    assert.match(line, /graphiti not reachable/);
    assert.match(line, /skipped/);
  });

  it("formats a reached result with the arc id and body", () => {
    const line = formatDayArcResult("close", "02-06-2026", { ok: true, skipped: false, status: 200, body: "ok" });
    assert.match(line, /day arc closed: day:02-06-2026/);
    assert.match(line, /ok/);
  });
});
