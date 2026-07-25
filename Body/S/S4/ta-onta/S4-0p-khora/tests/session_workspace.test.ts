import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  bindHarnessToSessionWorkspace,
  projectHarnessBinding,
  projectResultDropBinding,
  readSessionWorkspaceForBootstrap,
  sessionWorkspacePath,
  type GatewaySessionProjection,
} from "../modules/session-workspace.ts";

/** A canonical key the test genuinely expects to exist. */
function requireKey(key: string | undefined): string {
  if (!key) assert.fail("session projection carried no canonical key");
  return key;
}

describe("Khora session-workspace harness binding", () => {
  let gateRoot: string;

  beforeEach(() => {
    gateRoot = mkdtempSync(join(tmpdir(), "khora-session-workspace-"));
  });

  afterEach(() => {
    rmSync(gateRoot, { recursive: true, force: true });
  });

  it("writes distinct parent and codex-native sub-session harness bindings via khora_write authority", () => {
    const parent: GatewaySessionProjection = {
      canonicalKey: "pi-parent",
      sessionId: "20260619-120000-parent",
      providerOverride: "openai",
      modelOverride: "gpt-5",
      terminalBinding: {
        lease: {
          leaseId: "lease-parent",
          sessionName: "epi-parent",
          paneId: "%1",
          live: true,
        },
      },
      activeAgentId: "anima",
      subagentLineage: [],
    };
    const child: GatewaySessionProjection = {
      canonicalKey: "codex-child",
      sessionId: "20260619-120030-child",
      providerOverride: "openai",
      modelOverride: "gpt-5-codex",
      terminalBinding: {
        lease: {
          leaseId: "lease-child",
          sessionName: "epi-child",
          paneId: "%2",
          live: true,
        },
      },
      parentSessionKey: parent.canonicalKey,
      vaultNowPath: "/vault/Present/19-06-2026/pi-parent/now.md",
      activeAgentId: "eros",
      subagentLineage: ["anima", "eros"],
    };

    const parentWorkspace = bindHarnessToSessionWorkspace({
      gateStateRoot: gateRoot,
      session: parent,
      harnessId: "pi",
      backing: "native-cli",
      permissionProfile: "khora-write-authority",
      cfIdentity: "anima",
      authority: "khora_write",
    });
    const childWorkspace = bindHarnessToSessionWorkspace({
      gateStateRoot: gateRoot,
      session: child,
      harnessId: "codex-native",
      backing: "native-cli",
      permissionProfile: "khora-write-authority",
      cfIdentity: "eros",
      authority: "khora_write",
    });

    assert.equal(parentWorkspace.harness.harness_id, "pi");
    assert.equal(parentWorkspace.harness.model_slot, "openai:gpt-5");
    assert.equal(parentWorkspace.harness.parent_session_key, undefined);
    assert.equal(parentWorkspace.harness.tmux_lease?.lease_id, "lease-parent");

    assert.equal(childWorkspace.harness.harness_id, "codex-native");
    assert.equal(childWorkspace.harness.model_slot, "openai:gpt-5-codex");
    assert.equal(childWorkspace.harness.parent_session_key, "pi-parent");
    assert.deepEqual(childWorkspace.subagent_lineage, ["anima", "eros"]);
    assert.equal(childWorkspace.harness.tmux_lease?.pane_id, "%2");
    assert.equal(childWorkspace.result_drop?.now_dir, "/vault/Present/19-06-2026/pi-parent");
    assert.equal(childWorkspace.result_drop?.day_dir, "/vault/Present/19-06-2026");
    assert.equal(childWorkspace.result_drop?.parent_now_path, "/vault/Present/19-06-2026/pi-parent/now.md");
    assert.deepEqual(childWorkspace.result_drop?.purposes, ["implement", "review", "explore", "search", "converse"]);

    const childPath = sessionWorkspacePath(gateRoot, requireKey(child.canonicalKey));
    const content = JSON.parse(readFileSync(childPath, "utf8"));
    assert.equal(content.harness.harness_id, "codex-native");
    assert.equal(content.harness.permission_profile, "khora-write-authority");
    assert.equal(content.result_drop.wake_event, "khora.result.wake");
    assert.equal(existsSync(`${childPath}.tmp`), false);
  });

  it("rejects harness binding writes that bypass khora_write authority", () => {
    assert.throws(
      () =>
        bindHarnessToSessionWorkspace({
          gateStateRoot: gateRoot,
          session: {
            canonicalKey: "codex-child",
            sessionId: "20260619-120030-child",
            activeAgentId: "eros",
            subagentLineage: ["anima", "eros"],
          },
          harnessId: "codex-native",
          backing: "native-cli",
          permissionProfile: "direct-fs",
          cfIdentity: "eros",
          authority: "direct_fs",
        }),
      /Khora write authority required/,
    );
  });

  it("reads live harness binding on bootstrap before continuation recovery", () => {
    const session: GatewaySessionProjection = {
      canonicalKey: "pi-parent",
      sessionId: "20260619-120000-parent",
      providerOverride: "openai",
      modelOverride: "gpt-5",
      terminalBinding: {
        lease: {
          leaseId: "lease-parent",
          sessionName: "epi-parent",
          paneId: "%1",
          live: true,
        },
      },
      activeAgentId: "anima",
      subagentLineage: [],
    };

    bindHarnessToSessionWorkspace({
      gateStateRoot: gateRoot,
      session,
      harnessId: "pi",
      backing: "native-cli",
      permissionProfile: "khora-write-authority",
      cfIdentity: "anima",
      authority: "khora_write",
    });

    const bootstrap = readSessionWorkspaceForBootstrap({
      gateStateRoot: gateRoot,
      sessionKey: requireKey(session.canonicalKey),
      isTmuxLeaseLive: (lease) => lease.lease_id === "lease-parent",
    });

    assert.equal(bootstrap?.workspace.harness.harness_id, "pi");
    assert.equal(bootstrap?.leaseResumed, true);
    assert.equal(bootstrap?.readBeforeContinuation, true);
  });

  it("projects provider and model overrides from SessionRecord into the durable binding", () => {
    const projected = projectHarnessBinding({
      session: {
        canonicalKey: "pi-parent",
        sessionId: "20260619-120000-parent",
        providerOverride: "anthropic",
        modelOverride: "claude-opus-4",
        terminalBinding: {
          lease: {
            leaseId: "lease-parent",
            paneId: "%1",
            live: true,
          },
        },
        activeAgentId: "anima",
        subagentLineage: [],
      },
      harnessId: "pi",
      backing: "native-cli",
      permissionProfile: "khora-write-authority",
      cfIdentity: "anima",
    });

    assert.equal(projected.model_slot, "anthropic:claude-opus-4");
    assert.equal(projected.harness_id, "pi");
    assert.equal(projected.cf_identity, "anima");
  });

  it("projects explicit launcher result-drop env over derived NOW folders", () => {
    const projected = projectResultDropBinding({
      canonicalKey: "codex-child",
      sessionId: "20260619-120030-child",
      vaultNowPath: "/child/own/now.md",
      resultDropDir: "/parent/session",
      resultDayDir: "/parent",
      resultParentNowPath: "/parent/session/now.md",
    });

    assert.equal(projected?.now_dir, "/parent/session");
    assert.equal(projected?.day_dir, "/parent");
    assert.equal(projected?.parent_now_path, "/parent/session/now.md");
    assert.equal(projected?.default_target, "now");
    assert.equal(projected?.artifact_suffix, ".result.md");
  });
});
