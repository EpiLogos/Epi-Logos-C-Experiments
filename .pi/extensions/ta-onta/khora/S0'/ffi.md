# Khora FFI Surface

- Session lifecycle reads M5 session depth through the Rust FFI layer when available.
- Session metadata exposed to PI agents is documented in `session-state.d.ts`.
- C-backed state remains authoritative when epi-lib is loaded; Rust persists workspace session state as the operational fallback.
