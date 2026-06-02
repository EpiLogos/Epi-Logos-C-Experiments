# Track 01 - Electron / Theia Shell, 0 / / / 1, And OmniPanel

This track owns the **actual desktop build surface**: Electron-hosted Theia shell, `/body` summon-and-return behavior, `0` structural shell, `1` personal/world-return shell, `/` OmniPanel operator membrane, deep IDE layout, and packaging/release/runtime lifecycle.

## Source Specs

- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`

## Tranches

1. **T0 - Electron / Theia Runtime Boundary**

   Canonical source: `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
   Cycle 1 substrate inheritance: extends `Idea/Pratibimba/System/**` and preserves `Body/M/epi-tauri/**` as migration-source-only evidence.

   Deliverables:

   - Lock Electron-hosted Theia as the actual desktop runtime and `Body/M/epi-tauri` as migration-source-only.
   - Name the process boundary, workspace/package layout, and runtime responsibilities of the shell.
   - Keep a single kernel-bridge and a single gateway/runtime stream across the whole shell.

   Substrate-truth note (2026-06-02):

   - `Idea/Pratibimba/System/README.md` already names the Theia IDE surface as the active executable home for M5-3 and `Idea/Pratibimba/System/electron-app/` is already present.
   - `Body/M/epi-tauri/DEPRECATED.md` already marks the Tauri tree as migration-source-only and explicitly forbids extending it.
   - The genuine remaining gap for this tranche is not shell greenfield. It is the operational lock-in proof: final runtime boundary wording, `epi app`/launch-path rewiring away from the deprecated tree, runnable Electron verification, and explicit proof that one kernel-bridge plus one gateway/runtime authority serve the whole shell.
   - Do not rebuild renderer/domain code from scratch. Port or re-home only what the migration inventory still marks as outstanding.

   Verification:

   - Theia/Electron app build passes in `Idea/Pratibimba/System`
   - shell runtime tests prove one bridge instance and one gateway/runtime authority

2. **T1 - 0 / 1 Daily Layout And Deep IDE Layout**

   Canonical source: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
   Cycle 1 substrate inheritance: extends the cycle 1 layout-mode skeleton and shared bridge fanout.

   Deliverables:

   - Own the `0/1` daily layout, the deep IDE layout, and state-preserving switching between them.
   - Keep shell `0` and shell `1` as parent faces, not mini-subsystem clones.
   - Define exactly what remains visible in the daily shell versus what belongs only in deep IDE.
   - Preserve the surface separation: shell `1` carries the flow-writing universal input, `/` carries operator transparency, and `4+2` carries full subsystem depth.

   Verification:

   - layout persistence tests
   - `/body` vertical slice tests
   - deep IDE summon/return tests

3. **T2 - OmniPanel Command Catalog And Intent Routing**

   Canonical source: `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
   Cycle 1 substrate inheritance: extends the cycle 1 OmniPanel shell and intent-routing work.

   Deliverables:

   - Own the full OmniPanel operator catalog: sessions, direct Pi/agent chat, skills, models, cron, config, logs, debug, nodes/devices, channels, readiness, gateway settings, tool traces, and runtime transparency.
   - Own DAY/NOW/privacy/review/layout deep-link routing through `/` without turning `/` into the primary lived UX.
   - Keep OmniPanel as operator membrane and not hidden backend authority, shell `1` replacement, or pseudo-Agentic Control Room.

   Verification:

   - OmniPanel contract tests
   - deep-link and intent-routing tests
   - command parity tests against gateway/S0 route tables

4. **T3 - Shell `0` Parent Face**

   Canonical source: `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 shell `0`, integrated `1-2-3`, and shared profile/runtime stream work.

   Deliverables:

   - Own shell `0` as the structural/cosmic parent face over M1/M2/M3 outputs.
   - Keep graph/clock/correspondence previews lean and current-coordinate-oriented.
   - Define what shell `0` may preview from M0 without swallowing the full M0 subsystem.

   Verification:

   - shell `0` surface tests against live profile/runtime payloads
   - integrated `1-2-3` preview tests

5. **T4 - Shell `1` Parent Face**

   Canonical source: `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 shell `1`, Nara preview, review alerts, and Epii entry work.

   Deliverables:

   - Own shell `1` as the personal/world-return parent face over M4/M5 with M0 ground-data where needed.
   - Make flow writing the universal input here: journal, prompt/chat initiation, task/reminder capture, calendar/day-note capture, highlight sendoff, and review/pedagogy entry.
   - Keep journal, pedagogy, review alerts, and agent check-in explicit and bounded.
   - Define which protected handles may surface here and which must stay deep-only.

   Verification:

   - shell `1` surface tests
   - flow-writing universal input tests across Nara, Epii entry, task/day-note capture, and highlight sendoff
   - privacy-block and review-notification tests

6. **T5 - `/body` Summon, Return, And Background Lifecycle**

   Canonical source: `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 summon/background lifecycle work and operator runbook evidence.

   Deliverables:

   - Own summon into deep IDE, return to `/body`, backgrounding, wake, reconnect, and status continuity.
   - Define the user-visible lifecycle model for close, quit, sleep, reconnect, and alerts.

   Verification:

   - background lifecycle tests
   - reconnect/resubscribe tests after gateway/runtime restart

7. **T6 - Electron Packaging, Update, And Desktop Release Discipline**

   Canonical source: `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
   Cycle 1 substrate inheritance: cycle 1 built shell/runtime surfaces and alpha gates but did not foreground Electron packaging as an owned track.

   Deliverables:

   - Own Electron packaging, distribution, update channel, build artifact structure, and desktop release discipline.
   - Define how desktop release evidence relates to alpha/beta/production readiness.

   Verification:

   - desktop build/package tests
   - release-gate artifact checks
