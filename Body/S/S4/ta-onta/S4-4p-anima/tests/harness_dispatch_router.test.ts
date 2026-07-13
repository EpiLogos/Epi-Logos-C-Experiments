/**
 * Coordinate: S4-4' (Anima two-axis delegation router tests — Tranche 42.7)
 * Actualises: the spec's four verification legs over `resolveHarnessDispatch`
 *   (dispatch-policy.ts): review routes to a different model family than the
 *   implementer; given two authed subscriptions the flat-cost lane beats
 *   metered API; explore routes to a cheap family; an unavailable harness is
 *   never selected. Family-for-task composes with cheapest-harness-for-family.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  resolveHarnessDispatch,
  type HarnessDispatchRequest,
  type HarnessRosterEntry,
} from "../modules/dispatch-policy.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const vak: VakAddress = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT2"],
  cp: "CP4.3",
  cf: "(5/0)",
  cfp: "CFP3",
  cs: { code: "CS0", direction: "Day" },
};

const MODEL_SLOT_BY_FAMILY: Record<string, string> = {
  claude: "slot.claude.default",
  gpt: "slot.gpt.default",
  local: "slot.local.default",
};

const COST_CLASS: Record<string, string> = {
  claude: "strong",
  gpt: "strong",
  local: "cheap",
};

function roster(entries: Partial<HarnessRosterEntry>[]): HarnessRosterEntry[] {
  return entries.map((entry, index) => ({
    harness_id: entry.harness_id ?? `harness-${index}`,
    available: entry.available ?? true,
    authenticated: entry.authenticated ?? true,
    model_families: entry.model_families ?? ["claude"],
    subscription: entry.subscription,
  }));
}

function request(overrides: Partial<HarnessDispatchRequest>): HarnessDispatchRequest {
  return {
    purpose: "implement",
    roster: roster([{ harness_id: "claude-native", model_families: ["claude"] }]),
    model_slot_by_family: MODEL_SLOT_BY_FAMILY,
    vak_frame: vak,
    config: { subscription: {}, cost_class: COST_CLASS },
    ...overrides,
  };
}

describe("42.7 two-axis delegation router", () => {
  it("routes a review task to a different model family than the implementer", () => {
    const dispatch = resolveHarnessDispatch(
      request({
        purpose: "review",
        implementer_model_family: "claude",
        roster: roster([
          { harness_id: "claude-native", model_families: ["claude"] },
          { harness_id: "codex-native", model_families: ["gpt"] },
        ]),
      }),
    );
    assert.notEqual(dispatch.model_family, "claude", "review must escape implementer self-bias");
    assert.equal(dispatch.model_family, "gpt");
    assert.equal(dispatch.harness_id, "codex-native");
    assert.equal(dispatch.model_slot, "slot.gpt.default");
  });

  it("prefers the subscription-backed flat-cost lane over metered API for the same family", () => {
    const dispatch = resolveHarnessDispatch(
      request({
        roster: roster([
          { harness_id: "api-metered", model_families: ["claude"] },
          {
            harness_id: "claude-native",
            model_families: ["claude"],
            subscription: "claude-max",
          },
        ]),
      }),
    );
    assert.equal(dispatch.harness_id, "claude-native", "flat subscription lane wins over metered");
    assert.equal(dispatch.subscription, "claude-max");
  });

  it("routes an explore task to a cheap model family", () => {
    const dispatch = resolveHarnessDispatch(
      request({
        purpose: "explore",
        roster: roster([
          { harness_id: "claude-native", model_families: ["claude"] },
          { harness_id: "ollama-local", model_families: ["local"] },
        ]),
      }),
    );
    assert.equal(dispatch.model_family, "local", "explore rides the cheap cost class");
    assert.equal(dispatch.cost_class, "cheap");
    assert.equal(dispatch.harness_id, "ollama-local");
  });

  it("never selects an unavailable or unauthenticated harness", () => {
    const dispatch = resolveHarnessDispatch(
      request({
        roster: roster([
          { harness_id: "dead-lane", model_families: ["claude"], available: false },
          { harness_id: "unauthed-lane", model_families: ["claude"], authenticated: false },
          { harness_id: "live-lane", model_families: ["claude"] },
        ]),
      }),
    );
    assert.equal(dispatch.harness_id, "live-lane");

    assert.throws(
      () =>
        resolveHarnessDispatch(
          request({
            roster: roster([
              { harness_id: "dead-lane", model_families: ["claude"], available: false },
            ]),
          }),
        ),
      /No authenticated available harness/,
      "a roster with no routable harness refuses instead of selecting a dead lane",
    );
  });

  it("composes strongest-family-for-implement with cheapest-harness-for-that-family", () => {
    const dispatch = resolveHarnessDispatch(
      request({
        purpose: "implement",
        roster: roster([
          { harness_id: "ollama-local", model_families: ["local"] },
          { harness_id: "api-metered", model_families: ["claude"] },
          { harness_id: "claude-native", model_families: ["claude"], subscription: "claude-max" },
        ]),
      }),
    );
    assert.equal(dispatch.model_family, "claude", "implement takes the strong family, not the cheap one");
    assert.equal(dispatch.harness_id, "claude-native", "then the cheapest authed harness for it");
    assert.match(dispatch.selection_rationale, /selected claude for implement task/);
  });
});
