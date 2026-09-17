/**
 * agent-registry.ts — Ad-hoc Vama Shakti registration for the PI Agent runtime
 * (Tranche 41.4).
 *
 * A Vama Shakti is the active animating descent of a /World entity into dialogue
 * (summoned via `techne_vama_summon`, classified egregore/sprite/daemon/mantra —
 * see [[S4-SPEC]] DR-VAMA-3/5/6). This module lets the PI runtime accept those
 * summons as *ad-hoc* registrations and binds every registration to the FROZEN
 * dialogue-only capability profile from {@link ./dispatch-guard.ts}.
 *
 * Two invariants are load-bearing here:
 *  1. **Dialogue-only at registration.** No registration may widen capability.
 *     Any profile that is not the canonical dialogue-only shape is refused at
 *     `registerVamaShakti` time, and the stored profile is always the frozen
 *     canonical singleton — there is no configuration that loosens it (DR-VAMA-5).
 *  2. **Dialogue-only at every dispatch site.** {@link PiAgentRegistry.guardSpeakerDispatch}
 *     resolves the speaker by quintessence hash and runs the structural
 *     dispatch guard before ANY tool invocation. Any tool other than the
 *     dialogue-emission primitive is refused with a typed error.
 *
 * Lifecycle mirrors the Rust warm-shakti registry in
 * `Body/S/S0/portal-core/src/vama_shakti.rs` and the gateway runtime in
 * `Body/S/S3/gateway/src/m4_arena.rs`. On `arena.scene_close`:
 *  - ephemeral entities are released outright;
 *  - warm entities persist to `WarmVamaShakti` (handed off — Tranche 41.10);
 *  - promoted entities flow back to Hen (handed off — Tranche 41.11).
 *
 * Canon: [[S4-SPEC]] -> Vama Shakti summon law (DR-VAMA-5/6); [[S4-2p-pleroma]]
 * `techne_vama_summon`.
 */

import {
  DIALOGUE_ONLY_CAPABILITY_PROFILE,
  guardVamaShaktiDispatch,
  isDialogueOnlyProfile,
  VamaShaktiDispatchRefused,
  type DialogueOnlyCapabilityProfile,
  type VamaShaktiClass,
} from "./dispatch-guard.ts";

export {
  DIALOGUE_EMISSION_PRIMITIVE,
  DIALOGUE_ONLY_CAPABILITY_PROFILE,
  guardVamaShaktiDispatch,
  isDialogueOnlyProfile,
  isVamaShaktiDispatchPermitted,
  VamaShaktiDispatchRefused,
  type DialogueOnlyCapabilityProfile,
  type VamaShaktiClass,
  type VamaShaktiDispatchRefusalCode,
} from "./dispatch-guard.ts";

/**
 * Essential identity of a summoned Vama Shakti. Mirrors the Rust
 * `VamaShaktiEssentialIdentity` projected over the wire: the quintessence hash
 * is the canonical 32-byte BLAKE3 identity, `identity_handle` is its hex digest
 * (the key used everywhere a string handle is needed).
 */
export interface VamaShaktiHandle {
  /** Hex digest of {@link quintessence_hash} — the canonical string handle. */
  readonly identity_handle: string;
  /** 32-byte BLAKE3 quintessence hash (essential identity). */
  readonly quintessence_hash: Uint8Array;
  /** Closed classifier set per DR-VAMA-6. */
  readonly vama_shakti_class: VamaShaktiClass;
  /** The :World entity coordinate this descent animates (DR-WORLD-1). */
  readonly entity_coordinate: string;
}

/**
 * Rupa (form) specialization handle. Mirrors the Rust `RupaSpecializationHandle`:
 * a `protected://nara/vama/rupa/...` handle plus the hashes that pin the psyche
 * template + entity form revision it was derived from.
 */
export interface RupaSpecializationHandle {
  /** `protected://nara/vama/rupa/{class}/{specialization_hex}` handle. */
  readonly handle: string;
  readonly vama_shakti_class: VamaShaktiClass;
  /** 32-byte revision of the psyche template the rupa was specialized against. */
  readonly psyche_template_revision: Uint8Array;
  /** 32-byte BLAKE3 of (psyche template + entity form + coordinate + class). */
  readonly specialization_hash: Uint8Array;
}

/**
 * Lifecycle disposition of an ad-hoc registration — drives `scene_close` routing.
 * Matches the summon request's `lifecycle_mode` in the Pleroma extension.
 */
export type VamaShaktiLifecycleMode = "ephemeral" | "warm" | "promoted";

/** Reasons a lease may be released, aligned with Rust `VamaShaktiReleaseReason`. */
export type VamaShaktiReleaseReason = "scene-close" | "gc" | "promoted";

/**
 * Branded lease id string. A lease is the runtime handle the dispatch path and
 * the arena hold; it is opaque and only ever produced by
 * {@link PiAgentRegistry.registerVamaShakti}.
 */
export type VamaShaktiLeaseId = string & { readonly __brand: "VamaShaktiLeaseId" };

export interface VamaShaktiRegistration {
  handle: VamaShaktiHandle;
  rupa_specialization_handle: RupaSpecializationHandle;
  parent_arena_scene_key: string;
  registered_at_ms: number;
  /** Disposition on scene close. Defaults to `ephemeral` when omitted. */
  lifecycle_mode: VamaShaktiLifecycleMode;
  /** Frozen per DR-VAMA-5 — always the canonical dialogue-only singleton. */
  capability_profile: DialogueOnlyCapabilityProfile;
}

/**
 * Input accepted by {@link PiAgentRegistry.registerVamaShakti}. The
 * `capability_profile` and `lifecycle_mode` are optional on input: profile is
 * always forced to the canonical frozen shape, lifecycle defaults to ephemeral.
 */
export interface VamaShaktiRegistrationInput {
  handle: VamaShaktiHandle;
  rupa_specialization_handle: RupaSpecializationHandle;
  parent_arena_scene_key: string;
  registered_at_ms: number;
  lifecycle_mode?: VamaShaktiLifecycleMode;
  /**
   * Optional; if present it MUST already be the dialogue-only shape or
   * registration is refused. The stored profile is the canonical frozen
   * singleton regardless of what is passed.
   */
  capability_profile?: unknown;
}

export type VamaShaktiRegistrationRefusalCode =
  | "DR-VAMA-5/profile-tampered"
  | "DR-VAMA-5/missing-handle"
  | "DR-VAMA-5/missing-scene-key";

/**
 * Typed refusal raised when an ad-hoc registration violates the dialogue-only
 * registration invariant (DR-VAMA-5). Distinct from {@link VamaShaktiDispatchRefused},
 * which guards the dispatch path.
 */
export class VamaShaktiRegistrationRefused extends Error {
  readonly code: VamaShaktiRegistrationRefusalCode;
  readonly identity_handle: string;

  constructor(
    code: VamaShaktiRegistrationRefusalCode,
    identity_handle: string,
    message: string,
  ) {
    super(message);
    this.name = "VamaShaktiRegistrationRefused";
    this.code = code;
    this.identity_handle = identity_handle;
  }
}

/**
 * Handoff descriptor emitted for warm/promoted entities at scene close. The
 * persistence (WarmVamaShakti, Tranche 41.10) and Hen promotion (Tranche 41.11)
 * paths consume these; this registry only routes — it does not own those stores.
 */
export interface VamaShaktiSceneCloseHandoff {
  lease_id: VamaShaktiLeaseId;
  identity_handle: string;
  scene_key: string;
  /** `warm` => persist to WarmVamaShakti; `promoted` => flow back to Hen. */
  disposition: "warm" | "promoted";
  registration: VamaShaktiRegistration;
}

/** Outcome of closing an arena scene — what was released vs. handed off. */
export interface VamaShaktiSceneCloseResult {
  scene_key: string;
  released_ephemeral: VamaShaktiLeaseId[];
  warmed: VamaShaktiSceneCloseHandoff[];
  promoted: VamaShaktiSceneCloseHandoff[];
}

function hexDigest(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Registry of ad-hoc Vama Shakti registrations for one PI runtime.
 *
 * Indices:
 *  - `byLease`     lease id              -> registration (source of truth)
 *  - `bySpeaker`   quintessence hex      -> ordered active lease ids
 *  - `byArena`     scene key             -> set of active lease ids
 *
 * All public methods preserve the dialogue-only invariant. There is no method
 * that mutates a stored `capability_profile`.
 */
export class PiAgentRegistry {
  readonly #byLease = new Map<VamaShaktiLeaseId, VamaShaktiRegistration>();
  readonly #bySpeaker = new Map<string, VamaShaktiLeaseId[]>();
  readonly #byArena = new Map<string, Set<VamaShaktiLeaseId>>();
  #seq = 0;

  /**
   * Register an ad-hoc Vama Shakti. The capability profile is forced to the
   * canonical frozen dialogue-only singleton (DR-VAMA-5); a non-dialogue-only
   * profile presented on input is refused. Returns the opaque lease id.
   */
  registerVamaShakti(reg: VamaShaktiRegistrationInput): VamaShaktiLeaseId {
    const identity_handle = reg.handle?.identity_handle ?? "";
    if (!reg.handle || identity_handle.length === 0) {
      throw new VamaShaktiRegistrationRefused(
        "DR-VAMA-5/missing-handle",
        identity_handle,
        "Refused: ad-hoc Vama Shakti registration requires a handle with a non-empty identity_handle.",
      );
    }
    if (!reg.parent_arena_scene_key || reg.parent_arena_scene_key.length === 0) {
      throw new VamaShaktiRegistrationRefused(
        "DR-VAMA-5/missing-scene-key",
        identity_handle,
        "Refused: ad-hoc Vama Shakti registration requires a parent_arena_scene_key.",
      );
    }
    // DR-VAMA-5: if a profile is presented, it must already be dialogue-only.
    if (
      Object.prototype.hasOwnProperty.call(reg, "capability_profile") &&
      reg.capability_profile !== undefined &&
      !isDialogueOnlyProfile(reg.capability_profile)
    ) {
      throw new VamaShaktiRegistrationRefused(
        "DR-VAMA-5/profile-tampered",
        identity_handle,
        `Refused per DR-VAMA-5: Vama Shakti ${identity_handle} carries a frozen dialogue-only capability profile; the profile presented at registration widens capability and is rejected.`,
      );
    }

    const lease_id = this.#mintLease(reg.parent_arena_scene_key, reg.handle.quintessence_hash);
    const registration: VamaShaktiRegistration = {
      handle: reg.handle,
      rupa_specialization_handle: reg.rupa_specialization_handle,
      parent_arena_scene_key: reg.parent_arena_scene_key,
      registered_at_ms: reg.registered_at_ms,
      lifecycle_mode: reg.lifecycle_mode ?? "ephemeral",
      // Structural: always store the canonical frozen singleton, never the input.
      capability_profile: DIALOGUE_ONLY_CAPABILITY_PROFILE,
    };
    Object.freeze(registration);

    this.#byLease.set(lease_id, registration);

    const speakerKey = hexDigest(reg.handle.quintessence_hash);
    const speakers = this.#bySpeaker.get(speakerKey);
    if (speakers) {
      speakers.push(lease_id);
    } else {
      this.#bySpeaker.set(speakerKey, [lease_id]);
    }

    const arena = this.#byArena.get(reg.parent_arena_scene_key);
    if (arena) {
      arena.add(lease_id);
    } else {
      this.#byArena.set(reg.parent_arena_scene_key, new Set([lease_id]));
    }

    return lease_id;
  }

  /**
   * Resolve the active speaker registration for a quintessence hash. Returns the
   * most recently registered active registration for that identity, or `null`
   * if none is currently registered.
   */
  resolveSpeaker(quintessence_hash: Uint8Array): VamaShaktiRegistration | null {
    const speakers = this.#bySpeaker.get(hexDigest(quintessence_hash));
    if (!speakers) return null;
    for (let i = speakers.length - 1; i >= 0; i--) {
      const reg = this.#byLease.get(speakers[i]);
      if (reg) return reg;
    }
    return null;
  }

  /** Look up a registration by lease id (active only). */
  getByLease(lease_id: VamaShaktiLeaseId): VamaShaktiRegistration | null {
    return this.#byLease.get(lease_id) ?? null;
  }

  /** All active registrations bound to an arena scene, registration order. */
  listByArena(scene_key: string): VamaShaktiRegistration[] {
    const leases = this.#byArena.get(scene_key);
    if (!leases) return [];
    const out: VamaShaktiRegistration[] = [];
    for (const lease_id of leases) {
      const reg = this.#byLease.get(lease_id);
      if (reg) out.push(reg);
    }
    return out;
  }

  /**
   * Release a single lease. Removes it from every index. `reason` records why
   * (scene-close / gc / promoted) for the lifecycle caller; the registry holds
   * no tombstone — release is removal.
   */
  releaseVamaShakti(
    lease_id: VamaShaktiLeaseId,
    _reason: VamaShaktiReleaseReason,
  ): void {
    const reg = this.#byLease.get(lease_id);
    if (!reg) return;
    this.#byLease.delete(lease_id);

    const speakerKey = hexDigest(reg.handle.quintessence_hash);
    const speakers = this.#bySpeaker.get(speakerKey);
    if (speakers) {
      const next = speakers.filter((id) => id !== lease_id);
      if (next.length === 0) this.#bySpeaker.delete(speakerKey);
      else this.#bySpeaker.set(speakerKey, next);
    }

    const arena = this.#byArena.get(reg.parent_arena_scene_key);
    if (arena) {
      arena.delete(lease_id);
      if (arena.size === 0) this.#byArena.delete(reg.parent_arena_scene_key);
    }
  }

  /**
   * Lifecycle entry for `arena.scene_close`. Ephemeral registrations are
   * released outright; warm + promoted registrations are released from the live
   * registry and returned as handoff descriptors for the WarmVamaShakti store
   * (Tranche 41.10) and Hen promotion (Tranche 41.11) respectively.
   */
  closeScene(scene_key: string): VamaShaktiSceneCloseResult {
    const result: VamaShaktiSceneCloseResult = {
      scene_key,
      released_ephemeral: [],
      warmed: [],
      promoted: [],
    };
    const leases = this.#byArena.get(scene_key);
    if (!leases) return result;

    // Snapshot lease ids first — release() mutates the backing set.
    for (const lease_id of [...leases]) {
      const reg = this.#byLease.get(lease_id);
      if (!reg) continue;
      switch (reg.lifecycle_mode) {
        case "warm":
          result.warmed.push({
            lease_id,
            identity_handle: reg.handle.identity_handle,
            scene_key,
            disposition: "warm",
            registration: reg,
          });
          this.releaseVamaShakti(lease_id, "gc");
          break;
        case "promoted":
          result.promoted.push({
            lease_id,
            identity_handle: reg.handle.identity_handle,
            scene_key,
            disposition: "promoted",
            registration: reg,
          });
          this.releaseVamaShakti(lease_id, "promoted");
          break;
        case "ephemeral":
        default:
          result.released_ephemeral.push(lease_id);
          this.releaseVamaShakti(lease_id, "scene-close");
          break;
      }
    }
    return result;
  }

  /**
   * Dispatch-site enforcement: resolve the speaker by quintessence hash and run
   * the structural dialogue-only guard BEFORE any tool invocation. Throws
   * {@link VamaShaktiDispatchRefused} for any non-dialogue tool, and for an
   * unregistered speaker (a Vama Shakti that is not registered cannot dispatch).
   */
  guardSpeakerDispatch(quintessence_hash: Uint8Array, tool_name: string): void {
    const reg = this.resolveSpeaker(quintessence_hash);
    if (!reg) {
      throw new VamaShaktiDispatchRefused(
        "DR-VAMA-5/profile-tampered",
        tool_name,
        hexDigest(quintessence_hash),
        `Refused per DR-VAMA-5: no registered Vama Shakti for quintessence ${hexDigest(quintessence_hash)}; an unregistered speaker carries no capability and cannot dispatch.`,
      );
    }
    guardVamaShaktiDispatch({
      identity_handle: reg.handle.identity_handle,
      capability_profile: reg.capability_profile,
      tool_name,
    });
  }

  /** Count of active registrations (all arenas). */
  size(): number {
    return this.#byLease.size;
  }

  #mintLease(scene_key: string, quintessence_hash: Uint8Array): VamaShaktiLeaseId {
    const seq = this.#seq++;
    return `lease://nara/vama/${scene_key}/${hexDigest(quintessence_hash)}#${seq}` as VamaShaktiLeaseId;
  }
}
