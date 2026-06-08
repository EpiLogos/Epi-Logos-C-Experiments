# Hermes-Nara Feature Alignment Index

Last sweep: 2026-06-07 (S0, S0' — archived; protocol revised to feature-level v2.0)
Protocol: hermes-nara-feature-alignment skill (v2.0)

## Feature Status

| # | Feature | Last Aligned | Verdict | Doc |
|---|---|---|---|---|
| F1 | First-run / onboarding | — | pending | — |
| F2 | CLI discoverability | — | pending | — |
| F3 | Config management | — | pending | — |
| F4 | Tool/plugin lifecycle | — | pending | — |
| F5 | Session continuity | — | pending | — |
| F6 | Error/diagnostic surface | — | pending | — |
| F7 | Agent delegation UX | — | pending | — |
| F8 | Multi-profile/context isolation | — | pending | — |
| F9 | Background/scheduled work | — | pending | — |
| F10 | Security/approval UX | — | pending | — |
| F11 | Memory/persistence UX | — | pending | — |
| F12 | Desktop app parity (M' Theia ↔ Hermes) | — | pending | — |

## Archived (S-layer protocol v1)
- [S0-hermes-alignment.md](S0-hermes-alignment.md) — Kernel / CLI / Portal
- [S0prime-hermes-alignment.md](S0prime-hermes-alignment.md) — Kernel inverse

## Recommended Order
1. F12 (Desktop parity) — the richest comparison, largest design surface
2. F1 (Onboarding) — highest gap, most immediate UX value
3. F4 (Tool/plugin lifecycle) — skills are the most proven Hermes pattern
4. Then continue F2 → F3 → F5 → F6 → F7 → F8 → F9 → F10 → F11
