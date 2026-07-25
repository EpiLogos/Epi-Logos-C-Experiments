import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type HarnessBacking = "native-cli" | "acp";
export type HarnessWriteAuthority = "khora_write";

export interface TmuxLeaseBinding {
  readonly lease_id?: string;
  readonly lease_owner?: string;
  readonly lease_purpose?: string;
  readonly lease_expires_at_ms?: number | string;
  readonly session_name?: string;
  readonly pane_id?: string;
  readonly live?: boolean;
}

export interface AcpEndpointBinding {
  readonly socket_path: string;
  readonly endpoint_id?: string;
}

export interface HarnessBinding {
  readonly harness_id: string;
  readonly model_slot: string;
  readonly backing: HarnessBacking;
  readonly tmux_lease?: TmuxLeaseBinding;
  readonly acp_endpoint?: AcpEndpointBinding;
  readonly permission_profile: string;
  readonly cf_identity: string;
  readonly parent_session_key?: string;
}

export type ResultArtifactPurpose = "implement" | "review" | "explore" | "search" | "converse";
export type ResultDropDefaultTarget = "now" | "day";

export interface ResultDropBinding {
  readonly now_dir: string;
  readonly day_dir?: string;
  readonly parent_now_path?: string;
  readonly default_target: ResultDropDefaultTarget;
  readonly artifact_suffix: ".result.md";
  readonly purposes: readonly ResultArtifactPurpose[];
  readonly wake_event: "khora.result.wake";
}

export interface GatewaySessionProjection {
  readonly canonicalKey?: string;
  readonly canonical_key?: string;
  readonly sessionId?: string;
  readonly session_id?: string;
  readonly dayId?: string;
  readonly day_id?: string;
  readonly vaultNowPath?: string;
  readonly vault_now_path?: string;
  readonly runtimeCwd?: string;
  readonly runtime_cwd?: string;
  readonly providerOverride?: string;
  readonly provider_override?: string;
  readonly modelOverride?: string;
  readonly model_override?: string;
  readonly resultDropDir?: string;
  readonly result_drop_dir?: string;
  readonly resultDayDir?: string;
  readonly result_day_dir?: string;
  readonly resultParentNowPath?: string;
  readonly result_parent_now_path?: string;
  readonly parentSessionKey?: string;
  readonly parent_session_key?: string;
  readonly activeAgentId?: string;
  readonly active_agent_id?: string;
  readonly subagentLineage?: readonly string[];
  readonly subagent_lineage?: readonly string[];
  readonly terminalBinding?: {
    readonly tmuxPaneId?: string;
    readonly tmux_pane_id?: string;
    readonly lease?: Record<string, unknown>;
  };
  readonly terminal_binding?: {
    readonly tmuxPaneId?: string;
    readonly tmux_pane_id?: string;
    readonly lease?: Record<string, unknown>;
  };
}

export interface SessionWorkspace {
  readonly session_key: string;
  readonly session_id: string;
  readonly day_id?: string;
  readonly now_path?: string;
  readonly runtime_cwd?: string;
  readonly subagent_lineage: readonly string[];
  readonly harness: HarnessBinding;
  readonly result_drop?: ResultDropBinding;
  readonly updated_at: string;
}

export interface BindHarnessInput {
  readonly gateStateRoot: string;
  readonly session: GatewaySessionProjection;
  readonly harnessId: string;
  readonly backing: HarnessBacking;
  readonly permissionProfile: string;
  readonly cfIdentity: string;
  readonly acpEndpoint?: AcpEndpointBinding;
  readonly authority: HarnessWriteAuthority | string;
  readonly now?: Date;
}

export interface ProjectHarnessInput {
  readonly session: GatewaySessionProjection;
  readonly harnessId: string;
  readonly backing: HarnessBacking;
  readonly permissionProfile: string;
  readonly cfIdentity: string;
  readonly acpEndpoint?: AcpEndpointBinding;
}

export interface BootstrapReadInput {
  readonly gateStateRoot: string;
  readonly sessionKey: string;
  readonly isTmuxLeaseLive?: (lease: TmuxLeaseBinding) => boolean;
}

export interface BootstrapWorkspaceBinding {
  readonly workspace: SessionWorkspace;
  readonly leaseResumed: boolean;
  readonly readBeforeContinuation: true;
}

export function sessionWorkspacePath(gateStateRoot: string, sessionKey: string): string {
  if (!gateStateRoot.trim()) throw new Error("gateStateRoot is required");
  if (!sessionKey.trim()) throw new Error("sessionKey is required");
  return join(gateStateRoot, "sessions", sessionKey, "session-workspace.json");
}

export function assertKhoraWriteAuthority(authority: string): asserts authority is HarnessWriteAuthority {
  if (authority !== "khora_write") {
    throw new Error("Khora write authority required for harness binding");
  }
}

export function projectHarnessBinding(input: ProjectHarnessInput): HarnessBinding {
  const parentSessionKey = field(input.session, "parentSessionKey", "parent_session_key");
  const binding: HarnessBinding = stripUndefined({
    harness_id: input.harnessId,
    model_slot: modelSlot(input.session),
    backing: input.backing,
    tmux_lease: input.backing === "native-cli" ? terminalLease(input.session) : undefined,
    acp_endpoint: input.backing === "acp" ? input.acpEndpoint : undefined,
    permission_profile: input.permissionProfile,
    cf_identity: input.cfIdentity,
    parent_session_key: parentSessionKey,
  });

  if (binding.backing === "native-cli" && !binding.tmux_lease) {
    throw new Error("native-cli harness binding requires a tmux lease");
  }
  if (binding.backing === "acp" && !binding.acp_endpoint) {
    throw new Error("acp harness binding requires an acp_endpoint");
  }

  return binding;
}

export function projectResultDropBinding(session: GatewaySessionProjection): ResultDropBinding | undefined {
  const explicitNowDir = field(session, "resultDropDir", "result_drop_dir");
  const parentNowPath = field(session, "resultParentNowPath", "result_parent_now_path")
    ?? field(session, "vaultNowPath", "vault_now_path");
  const nowDir = explicitNowDir ?? (parentNowPath ? dirname(parentNowPath) : undefined);
  if (!nowDir) return undefined;

  const dayDir = field(session, "resultDayDir", "result_day_dir")
    ?? dayDirForNowPath(parentNowPath ?? join(nowDir, "now.md"));

  return stripUndefined<ResultDropBinding>({
    now_dir: nowDir,
    day_dir: dayDir,
    parent_now_path: parentNowPath,
    default_target: "now",
    artifact_suffix: ".result.md",
    purposes: ["implement", "review", "explore", "search", "converse"],
    wake_event: "khora.result.wake",
  });
}

export function bindHarnessToSessionWorkspace(input: BindHarnessInput): SessionWorkspace {
  assertKhoraWriteAuthority(input.authority);
  const workspace = composeSessionWorkspace(input);
  writeSessionWorkspaceAtomically(
    sessionWorkspacePath(input.gateStateRoot, workspace.session_key),
    workspace,
    input.authority,
  );
  return workspace;
}

export function writeSessionWorkspaceAtomically(
  path: string,
  workspace: SessionWorkspace,
  authority: HarnessWriteAuthority | string,
): void {
  assertKhoraWriteAuthority(authority);
  mkdirSync(dirname(path), { recursive: true });
  const tmpPath = `${path}.tmp`;
  try {
    writeFileSync(tmpPath, `${JSON.stringify(workspace, null, 2)}\n`, "utf8");
    renameSync(tmpPath, path);
  } catch (error) {
    if (existsSync(tmpPath)) unlinkSync(tmpPath);
    throw error;
  }
}

export function parseSessionWorkspace(content: string): SessionWorkspace {
  const parsed = JSON.parse(content) as SessionWorkspace;
  if (!parsed || typeof parsed !== "object") throw new Error("session-workspace.json must be an object");
  if (!parsed.session_key || !parsed.session_id || !parsed.harness) {
    throw new Error("session-workspace.json is missing session_key, session_id, or harness");
  }
  return parsed;
}

export function readSessionWorkspaceForBootstrap(input: BootstrapReadInput): BootstrapWorkspaceBinding | null {
  const path = sessionWorkspacePath(input.gateStateRoot, input.sessionKey);
  if (!existsSync(path)) return null;

  const workspace = parseSessionWorkspace(readFileSync(path, "utf8"));
  const lease = workspace.harness.tmux_lease;
  const leaseResumed = Boolean(
    lease && (input.isTmuxLeaseLive ? input.isTmuxLeaseLive(lease) : lease.live === true),
  );

  return {
    workspace,
    leaseResumed,
    readBeforeContinuation: true,
  };
}

function composeSessionWorkspace(input: BindHarnessInput): SessionWorkspace {
  const sessionKey = field(input.session, "canonicalKey", "canonical_key");
  const sessionId = field(input.session, "sessionId", "session_id") ?? sessionKey;
  if (!sessionKey) throw new Error("session canonical key is required");
  if (!sessionId) throw new Error("session id is required");

  return stripUndefined({
    session_key: sessionKey,
    session_id: sessionId,
    day_id: field(input.session, "dayId", "day_id"),
    now_path: field(input.session, "vaultNowPath", "vault_now_path"),
    runtime_cwd: field(input.session, "runtimeCwd", "runtime_cwd"),
    subagent_lineage: [
      ...(input.session.subagentLineage ?? input.session.subagent_lineage ?? []),
    ],
    harness: projectHarnessBinding(input),
    result_drop: projectResultDropBinding(input.session),
    updated_at: (input.now ?? new Date()).toISOString(),
  });
}

function dayDirForNowPath(nowPath: string): string | undefined {
  if (!nowPath.trim()) return undefined;
  const nowDir = nowPath.endsWith("/now.md") ? dirname(nowPath) : nowPath;
  const dayDir = dirname(nowDir);
  return dayDir && dayDir !== "." && dayDir !== nowDir ? dayDir : undefined;
}

function modelSlot(session: GatewaySessionProjection): string {
  const provider = field(session, "providerOverride", "provider_override");
  const model = field(session, "modelOverride", "model_override");
  if (provider && model) return `${provider}:${model}`;
  if (model) return model;
  if (provider) return provider;
  return "default";
}

function terminalLease(session: GatewaySessionProjection): TmuxLeaseBinding | undefined {
  const binding = session.terminalBinding ?? session.terminal_binding;
  const lease = binding?.lease ?? {};
  const paneId = binding?.tmuxPaneId ?? binding?.tmux_pane_id ?? stringField(lease, "paneId", "pane_id", "tmuxPaneId", "tmux_pane_id");
  const normalized = stripUndefined({
    lease_id: stringField(lease, "leaseId", "lease_id", "leaseOwner", "lease_owner"),
    lease_owner: stringField(lease, "leaseOwner", "lease_owner"),
    lease_purpose: stringField(lease, "leasePurpose", "lease_purpose"),
    lease_expires_at_ms: numberOrStringField(lease, "leaseExpiresAtMs", "lease_expires_at_ms"),
    session_name: stringField(lease, "sessionName", "session_name", "tmuxSessionName", "tmux_session_name"),
    pane_id: paneId,
    live: booleanField(lease, "live"),
  });
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function field(source: GatewaySessionProjection, camel: keyof GatewaySessionProjection, snake: keyof GatewaySessionProjection): string | undefined {
  const value = source[camel] ?? source[snake];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringField(source: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function numberOrStringField(source: Record<string, unknown>, ...keys: string[]): number | string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" || typeof value === "number") return value;
  }
  return undefined;
}

function booleanField(source: Record<string, unknown>, key: string): boolean | undefined {
  return typeof source[key] === "boolean" ? source[key] : undefined;
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}
