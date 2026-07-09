import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  CANONICAL_HARNESSES,
  HarnessExecutorRegistry,
  type HarnessRegistryEntry,
} from "./harness_registry.ts";

describe("42.2 HarnessExecutor registry", () => {
  it("resolves each canonical harness to a backing kind + launch profile", () => {
    const registry = new HarnessExecutorRegistry();
    const expectations: Array<[string, string, string]> = [
      ["pi", "native-cli", "pi"],
      ["claude-native", "native-cli", "claude"],
      ["codex-native", "native-cli", "codex"],
      ["hermes-acp", "acp", "hermes"],
    ];
    for (const [id, backing, binary] of expectations) {
      const entry = registry.resolve(id);
      assert.equal(entry.backing, backing);
      assert.equal(entry.launch_profile.binary, binary);
      assert.ok(entry.launch_profile.permission_profile, `${id} names a permission profile`);
      assert.ok(entry.model_families.length > 0, `${id} names model families`);
      assert.equal(typeof entry.subscription, "boolean");
    }
    assert.equal(registry.resolve("hermes-acp").acp_adapter, "vendors/hermes-agent");
    assert.deepEqual(registry.resolve("claude-native").launch_profile.args, ["--permission-mode", "auto"]);
    assert.deepEqual(registry.resolve("codex-native").launch_profile.args, ["--yolo"]);
  });

  it("fails loud on an unregistered harness id", () => {
    const registry = new HarnessExecutorRegistry();
    assert.throws(() => registry.resolve("gemini-native"), /unregistered harness 'gemini-native'/);
  });

  it("roster preflight drops an unavailable harness from the routable set and surfaces it", () => {
    const registry = new HarnessExecutorRegistry();
    const preflight = registry.rosterPreflight((binary) => binary !== "codex");

    assert.ok(preflight.available.includes("pi"));
    assert.ok(preflight.available.includes("claude-native"));
    assert.ok(!preflight.available.includes("codex-native"));

    const routableIds = registry.routable(preflight).map((entry) => entry.harness_id);
    assert.ok(!routableIds.includes("codex-native"), "unavailable lane is not routable");

    const miss = preflight.missing.find((m) => m.harness_id === "codex-native");
    assert.ok(miss, "missing harness is surfaced");
    assert.match(miss?.message ?? "", /install the codex CLI to enable the codex-native lane/);
  });

  it("adding a harness is a registry entry only: a stub harness dispatches a no-op turn with zero dispatch-path edits", async () => {
    const registry = new HarnessExecutorRegistry();
    const stub: HarnessRegistryEntry = {
      harness_id: "stub-harness",
      backing: "native-cli",
      launch_profile: {
        binary: "stub",
        args: [],
        env: {},
        sandbox: "none",
        permission_profile: "noop",
      },
      model_families: ["stub"],
      subscription: false,
    };
    registry.register(stub);

    const preflight = registry.rosterPreflight((binary) => binary === "stub");
    assert.deepEqual(preflight.available, ["stub-harness"]);

    const seen: string[] = [];
    const output = await registry.dispatchTurn(
      "stub-harness",
      "no-op turn",
      async (entry, task) => {
        seen.push(`${entry.harness_id}:${entry.launch_profile.binary}:${task}`);
        return "ok";
      },
      preflight,
    );
    assert.equal(output, "ok");
    assert.deepEqual(seen, ["stub-harness:stub:no-op turn"]);
  });

  it("refuses to dispatch through a lane the preflight dropped, with the install message", async () => {
    const registry = new HarnessExecutorRegistry();
    const preflight = registry.rosterPreflight(() => false);
    await assert.rejects(
      registry.dispatchTurn("claude-native", "hello", async () => "never", preflight),
      /install the claude CLI to enable the claude-native lane/,
    );
  });

  it("projects to the gateway-contract wire registry shape (thin Rust resolver seam)", () => {
    const registry = new HarnessExecutorRegistry();
    const wire = registry.toGatewayRegistry();
    assert.equal(wire.entries.length, CANONICAL_HARNESSES.length);
    for (const entry of wire.entries) {
      assert.ok(entry.harnessId, "camelCase harnessId key");
      assert.ok(entry.backing === "native-cli" || entry.backing === "acp", "kebab-case backing kind");
    }
  });

  it("register validates backing kind, id, and binary", () => {
    const registry = new HarnessExecutorRegistry();
    assert.throws(
      () => registry.register({
        harness_id: "bad",
        backing: "webhook" as never,
        launch_profile: { binary: "x", args: [], env: {}, sandbox: "none", permission_profile: "p" },
        model_families: [],
        subscription: false,
      }),
      /backing must be 'native-cli' or 'acp'/,
    );
    assert.throws(
      () => registry.register({
        harness_id: "no-binary",
        backing: "native-cli",
        launch_profile: { binary: " ", args: [], env: {}, sandbox: "none", permission_profile: "p" },
        model_families: [],
        subscription: false,
      }),
      /requires a binary/,
    );
  });
});
