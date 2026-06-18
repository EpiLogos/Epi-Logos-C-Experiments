import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
  PiAgentRegistry,
  VamaShaktiRegistrationRefused,
  type RupaSpecializationHandle,
  type VamaShaktiHandle,
  type VamaShaktiLifecycleMode,
} from "../lib/agent-registry.ts";
import {
  DIALOGUE_EMISSION_PRIMITIVE,
  DIALOGUE_ONLY_CAPABILITY_PROFILE,
  VamaShaktiDispatchRefused,
} from "../lib/dispatch-guard.ts";

// ── Fixtures ────────────────────────────────────────────────────────────────

function hash(seed: number): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = (seed + i * 7) & 0xff;
  return bytes;
}

function hex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function handle(seed: number): VamaShaktiHandle {
  const quintessence_hash = hash(seed);
  return {
    identity_handle: hex(quintessence_hash),
    quintessence_hash,
    vama_shakti_class: "egregore",
    entity_coordinate: "#5-2-1",
  };
}

function rupa(seed: number): RupaSpecializationHandle {
  return {
    handle: `protected://nara/vama/rupa/egregore/${hex(hash(seed))}`,
    vama_shakti_class: "egregore",
    psyche_template_revision: hash(seed + 1),
    specialization_hash: hash(seed + 2),
  };
}

function register(
  reg: PiAgentRegistry,
  seed: number,
  scene_key: string,
  lifecycle_mode: VamaShaktiLifecycleMode = "ephemeral",
  capability_profile?: unknown,
) {
  return reg.registerVamaShakti({
    handle: handle(seed),
    rupa_specialization_handle: rupa(seed),
    parent_arena_scene_key: scene_key,
    registered_at_ms: 1_000 + seed,
    lifecycle_mode,
    capability_profile,
  });
}

// ── Registration: dialogue-only is structural ────────────────────────────────

describe("registerVamaShakti — dialogue-only capability is frozen", () => {
  it("stores the canonical frozen dialogue-only profile, never the input", () => {
    const reg = new PiAgentRegistry();
    const lease = register(reg, 1, "arena:alpha");
    const stored = reg.getByLease(lease);
    assert.ok(stored);
    assert.equal(stored.capability_profile, DIALOGUE_ONLY_CAPABILITY_PROFILE);
    assert.equal(stored.capability_profile.dialogue_only, true);
    assert.equal(stored.capability_profile.vault_write, false);
    assert.equal(stored.capability_profile.subagent_dispatch, false);
    assert.equal(stored.capability_profile.terminal_authority, false);
    assert.equal(stored.capability_profile.system_tools_granted.length, 0);
    assert.ok(Object.isFrozen(stored.capability_profile));
  });

  it("accepts a presented profile only if it is already dialogue-only", () => {
    const reg = new PiAgentRegistry();
    const lease = register(reg, 2, "arena:alpha", "ephemeral", {
      dialogue_only: true,
      system_tools_granted: [],
      vault_write: false,
      subagent_dispatch: false,
      terminal_authority: false,
    });
    assert.ok(reg.getByLease(lease));
  });

  it("refuses a widened capability profile at registration (DR-VAMA-5)", () => {
    const reg = new PiAgentRegistry();
    assert.throws(
      () =>
        register(reg, 3, "arena:alpha", "ephemeral", {
          dialogue_only: true,
          system_tools_granted: ["bash"],
          vault_write: true,
          subagent_dispatch: false,
          terminal_authority: false,
        }),
      (err: unknown) =>
        err instanceof VamaShaktiRegistrationRefused &&
        err.code === "DR-VAMA-5/profile-tampered",
    );
    assert.equal(reg.size(), 0);
  });

  it("refuses a registration with no identity handle", () => {
    const reg = new PiAgentRegistry();
    assert.throws(
      () =>
        reg.registerVamaShakti({
          handle: { ...handle(4), identity_handle: "" },
          rupa_specialization_handle: rupa(4),
          parent_arena_scene_key: "arena:alpha",
          registered_at_ms: 1,
        }),
      (err: unknown) =>
        err instanceof VamaShaktiRegistrationRefused &&
        err.code === "DR-VAMA-5/missing-handle",
    );
  });
});

// ── Dispatch: every non-dialogue tool invocation is refused ───────────────────

describe("guardSpeakerDispatch — dialogue-only at every dispatch site", () => {
  it("permits ONLY the dialogue-emission primitive", () => {
    const reg = new PiAgentRegistry();
    register(reg, 10, "arena:beta");
    assert.doesNotThrow(() =>
      reg.guardSpeakerDispatch(hash(10), DIALOGUE_EMISSION_PRIMITIVE),
    );
  });

  it("refuses every non-dialogue tool with a typed error", () => {
    const reg = new PiAgentRegistry();
    register(reg, 11, "arena:beta");
    const forbidden = [
      "bash",
      "khora_write",
      "dispatch_agent",
      "techne_gateway_start",
      "vault_write",
      "subagent_create",
    ];
    for (const tool of forbidden) {
      assert.throws(
        () => reg.guardSpeakerDispatch(hash(11), tool),
        (err: unknown) =>
          err instanceof VamaShaktiDispatchRefused &&
          err.code === "DR-VAMA-5/non-dialogue-tool" &&
          err.tool_name === tool,
        `tool "${tool}" must be refused`,
      );
    }
  });

  it("refuses dispatch from an unregistered speaker", () => {
    const reg = new PiAgentRegistry();
    assert.throws(
      () => reg.guardSpeakerDispatch(hash(999), DIALOGUE_EMISSION_PRIMITIVE),
      (err: unknown) => err instanceof VamaShaktiDispatchRefused,
    );
  });
});

// ── Resolution + arena indexing ───────────────────────────────────────────────

describe("resolveSpeaker / listByArena", () => {
  it("resolves the active registration by quintessence hash", () => {
    const reg = new PiAgentRegistry();
    register(reg, 20, "arena:gamma");
    const resolved = reg.resolveSpeaker(hash(20));
    assert.ok(resolved);
    assert.equal(resolved.handle.identity_handle, hex(hash(20)));
  });

  it("returns null for an unknown quintessence hash", () => {
    const reg = new PiAgentRegistry();
    assert.equal(reg.resolveSpeaker(hash(404)), null);
  });

  it("lists only the registrations bound to a given arena", () => {
    const reg = new PiAgentRegistry();
    register(reg, 30, "arena:one");
    register(reg, 31, "arena:one");
    register(reg, 32, "arena:two");
    assert.equal(reg.listByArena("arena:one").length, 2);
    assert.equal(reg.listByArena("arena:two").length, 1);
    assert.equal(reg.listByArena("arena:none").length, 0);
  });
});

// ── Lifecycle: scene_close releases ephemeral, preserves warm/promoted ────────

describe("closeScene — lifecycle routing on arena.scene_close", () => {
  it("releases ephemeral, hands off warm to WarmVamaShakti, promoted to Hen", () => {
    const reg = new PiAgentRegistry();
    register(reg, 40, "arena:close", "ephemeral");
    register(reg, 41, "arena:close", "warm");
    register(reg, 42, "arena:close", "promoted");
    register(reg, 43, "arena:other", "ephemeral");

    const result = reg.closeScene("arena:close");

    assert.equal(result.scene_key, "arena:close");
    assert.equal(result.released_ephemeral.length, 1);
    assert.equal(result.warmed.length, 1);
    assert.equal(result.promoted.length, 1);

    // Warm handoff carries the full registration for the WarmVamaShakti store.
    assert.equal(result.warmed[0].disposition, "warm");
    assert.equal(result.warmed[0].identity_handle, hex(hash(41)));
    assert.ok(result.warmed[0].registration);

    // Promoted handoff flows back to Hen.
    assert.equal(result.promoted[0].disposition, "promoted");
    assert.equal(result.promoted[0].identity_handle, hex(hash(42)));

    // The closed scene is emptied; the untouched arena survives.
    assert.equal(reg.listByArena("arena:close").length, 0);
    assert.equal(reg.listByArena("arena:other").length, 1);
  });

  it("releasing a lease removes it from speaker + arena indices", () => {
    const reg = new PiAgentRegistry();
    const lease = register(reg, 50, "arena:rel");
    assert.ok(reg.resolveSpeaker(hash(50)));
    reg.releaseVamaShakti(lease, "gc");
    assert.equal(reg.resolveSpeaker(hash(50)), null);
    assert.equal(reg.listByArena("arena:rel").length, 0);
    assert.equal(reg.getByLease(lease), null);
  });

  it("closeScene on an empty/unknown scene is a no-op", () => {
    const reg = new PiAgentRegistry();
    const result = reg.closeScene("arena:ghost");
    assert.equal(result.released_ephemeral.length, 0);
    assert.equal(result.warmed.length, 0);
    assert.equal(result.promoted.length, 0);
  });
});
