// 42.2 — HarnessExecutor registry: the S4 semantic authority for what a harness IS.
// The registry maps harness_id → { backing, launch_profile, model_families,
// subscription } and is the single place a new harness is added; the gateway
// side only validates ids/backing kinds against the projected wire registry
// (gateway-contract/src/harness.rs HarnessRegistry — the thin Rust resolver).
// Roster preflight (`command -v` per binary) records the AVAILABLE set per run
// so routing only ever targets a harness whose CLI actually resolved on this
// machine; a missing harness is surfaced to the user, never silently retried.
// Per-provider attributes ride the existing PiProviderProfile contract
// (Body/S/S4/plugins/pleroma/capability-matrix.json provider_profile_contract).

import { spawnSync } from "node:child_process";

export type HarnessBackingKind = "native-cli" | "acp";

export interface HarnessLaunchProfile {
  readonly binary: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly sandbox: "workspace" | "none";
  readonly permission_profile: string;
}

export interface HarnessRegistryEntry {
  readonly harness_id: string;
  readonly backing: HarnessBackingKind;
  readonly launch_profile: HarnessLaunchProfile;
  readonly model_families: readonly string[];
  /** True when the lane bills through a CLI subscription rather than API metering. */
  readonly subscription: boolean;
  /** ACP lanes connect over a socket instead of a leased pane. */
  readonly acp_adapter?: string;
}

/** The four canonical lanes per Track 42.2. */
export const CANONICAL_HARNESSES: readonly HarnessRegistryEntry[] = [
  {
    harness_id: "pi",
    backing: "native-cli",
    launch_profile: {
      binary: "pi",
      args: [],
      env: {},
      sandbox: "workspace",
      permission_profile: "constitutional-full",
    },
    model_families: ["provider-profile"],
    subscription: false,
  },
  {
    harness_id: "claude-native",
    backing: "native-cli",
    launch_profile: {
      binary: "claude",
      args: ["--permission-mode", "auto"],
      env: {},
      sandbox: "workspace",
      permission_profile: "auto-headless",
    },
    model_families: ["anthropic"],
    subscription: true,
  },
  {
    harness_id: "codex-native",
    backing: "native-cli",
    launch_profile: {
      binary: "codex",
      args: ["--yolo"],
      env: {},
      sandbox: "workspace",
      permission_profile: "yolo-headless",
    },
    model_families: ["openai"],
    subscription: true,
  },
  {
    harness_id: "hermes-acp",
    backing: "acp",
    launch_profile: {
      binary: "hermes",
      args: [],
      env: {},
      sandbox: "none",
      permission_profile: "acp-socket",
    },
    model_families: ["openrouter", "portal"],
    subscription: false,
    acp_adapter: "vendors/hermes-agent",
  },
] as const;

export interface HarnessPreflightMiss {
  readonly harness_id: string;
  readonly binary: string;
  /** Surfaced to the user; a missing harness is never silently retried. */
  readonly message: string;
}

export interface HarnessRosterPreflight {
  readonly available: readonly string[];
  readonly missing: readonly HarnessPreflightMiss[];
}

export type BinaryResolver = (binary: string) => boolean;

function commandResolves(binary: string): boolean {
  const result = spawnSync("/bin/sh", ["-lc", `command -v ${binary}`], {
    encoding: "utf8",
    timeout: 10_000,
  });
  return result.status === 0 && Boolean(result.stdout.trim());
}

export type HarnessTurnDispatch = (
  entry: HarnessRegistryEntry,
  task: string,
) => Promise<string>;

export class HarnessExecutorRegistry {
  private readonly entries = new Map<string, HarnessRegistryEntry>();

  constructor(entries: readonly HarnessRegistryEntry[] = CANONICAL_HARNESSES) {
    for (const entry of entries) this.register(entry);
  }

  /** Adding a harness is a registry entry only — no dispatch-path edits. */
  register(entry: HarnessRegistryEntry): HarnessRegistryEntry {
    if (!entry.harness_id.trim()) throw new Error("harness_id must be non-empty");
    if (entry.backing !== "native-cli" && entry.backing !== "acp") {
      throw new Error(`harness '${entry.harness_id}' backing must be 'native-cli' or 'acp'`);
    }
    if (!entry.launch_profile.binary.trim()) {
      throw new Error(`harness '${entry.harness_id}' launch profile requires a binary`);
    }
    this.entries.set(entry.harness_id, entry);
    return entry;
  }

  resolve(harnessId: string): HarnessRegistryEntry {
    const entry = this.entries.get(harnessId);
    if (!entry) {
      throw new Error(
        `unregistered harness '${harnessId}' — the registry is the single place a harness is added`,
      );
    }
    return entry;
  }

  list(): readonly HarnessRegistryEntry[] {
    return [...this.entries.values()];
  }

  /**
   * Roster preflight at orchestration start: `command -v` per binary, recording
   * the AVAILABLE set for this run. Routing only targets available lanes.
   */
  rosterPreflight(resolveBinary: BinaryResolver = commandResolves): HarnessRosterPreflight {
    const available: string[] = [];
    const missing: HarnessPreflightMiss[] = [];
    for (const entry of this.entries.values()) {
      if (resolveBinary(entry.launch_profile.binary)) {
        available.push(entry.harness_id);
      } else {
        missing.push({
          harness_id: entry.harness_id,
          binary: entry.launch_profile.binary,
          message: `install the ${entry.launch_profile.binary} CLI to enable the ${entry.harness_id} lane`,
        });
      }
    }
    return { available, missing };
  }

  routable(preflight: HarnessRosterPreflight): readonly HarnessRegistryEntry[] {
    const set = new Set(preflight.available);
    return this.list().filter((entry) => set.has(entry.harness_id));
  }

  /**
   * Dispatch one turn through a registered, available harness. The dispatch
   * path is registry-driven: it reads only the resolved entry, so a newly
   * registered harness dispatches with zero edits here.
   */
  async dispatchTurn(
    harnessId: string,
    task: string,
    dispatch: HarnessTurnDispatch,
    preflight?: HarnessRosterPreflight,
  ): Promise<string> {
    const entry = this.resolve(harnessId);
    if (preflight && !preflight.available.includes(harnessId)) {
      const miss = preflight.missing.find((m) => m.harness_id === harnessId);
      throw new Error(miss?.message ?? `harness '${harnessId}' is not available on this machine`);
    }
    return dispatch(entry, task);
  }

  /** Project to the gateway-contract wire registry (harness.rs HarnessRegistry serde shape). */
  toGatewayRegistry(): { entries: Array<{ harnessId: string; backing: HarnessBackingKind }> } {
    return {
      entries: this.list().map((entry) => ({
        harnessId: entry.harness_id,
        backing: entry.backing,
      })),
    };
  }
}
