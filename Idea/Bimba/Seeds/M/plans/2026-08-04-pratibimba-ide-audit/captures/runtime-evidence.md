# Runtime Evidence

Date: 2026-08-04
Machine context: local macOS source checkout

## Binary And Saved Configuration

Saved carrier configuration:

```json
{
  "vaultRoot": "/Users/admin/Documents/Epi-Logos C Experiments/Idea",
  "epiBin": "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-cli/target/debug/epi"
}
```

Observed paths:

```text
configured binary: absent
repository shared binary: /Users/admin/Documents/Epi-Logos C Experiments/target/debug/epi
PATH binary: /Users/admin/.cargo/bin/epi
```

The saved path predates the repository-wide shared Cargo target pool.

## Native Development Launch

Procedure:

1. Confirm no listener on gateway port 18794.
2. Launch the real Tauri development command.
3. Wait for the native window.
4. Recheck the port and gateway process record.

Observed:

```text
native window: opened
127.0.0.1:18794: closed
.epi/gate/up/gateway-process.json: absent
```

The carrier UI opened without its minimum organism.

## Native Boot Smoke

Observed receipt:

```text
[tauri-boot-smoke] READY {"face":"1","layout":"daily-0-1","width":1261,"height":715}
[tauri-boot-smoke] PASS native shell committed ...
```

Immediate post-check:

```text
127.0.0.1:18794: closed
.epi/gate/up/gateway-process.json: absent
```

Interpretation: the receipt proves a mounted FlexLayout, not successful native supervision.

## Independent Gateway Smoke

The separate gateway smoke selected the repository shared binary, launched it on test port 18797, and observed profile generations:

```text
2 -> 3 -> 4
```

This proves that the checked-out gateway binary can run and tick. It does not repair or exercise the native supervisor's stale saved path.

## Full Smoke Status

The combined `pnpm smoke` command was attempted but could not acquire the repository gate lane because another verification process held the shared lock. It was stopped rather than interfering with concurrent repository verification.

The two constituent stages above were run separately and expose the disconnected proof boundary.

## Live Renderer Audit

For connected UI captures, the real repository gateway was launched manually on port 18794 and the renderer was opened at 1280x800. The client transitioned from pending to connected and received a live profile generation/tick. Both faces, both layout modes, [[M5']] Ground, and Agentic Control Room were exercised.

## Cleanup

The manually launched gateway, renderer server, and native development process were stopped after capture. Final verification should confirm that no audit-owned listener remains on ports 18794 or 5173.
