//! Coordinate: #5/S0 M1-3' (spanda phase anchor — rerun 02.T2.12, SPANDA-T1)
//! Actualises: [[M1-3-SPANDA-TRANSPORT-ARCHITECTURE]] §2 / DR-M1-5 — the spanda
//!   cycle phase as ENGINE-OWNED, lazily-evaluated state. The anchor is a few
//!   numbers `(epoch_ms, phase0, rate_hz, mode, direction)`; phase-at-instant is
//!   COMPUTED ON READ at whatever grain the reader needs (audio at sample rate,
//!   UI at 60 fps, the portal heartbeat at 1 Hz, agents on demand). No loop at
//!   any frequency, anywhere. The gateway heartbeat SAMPLES this anchor
//!   (derived-from, never 1:1 — the portal stays a portal); `tick12` is always
//!   `spanda::tick12_readout(phase)`, never a wall-clock dice.
//! Rate law: the cited conserved-delta band names felt periodic PULSES, and the
//!   ring's periodic events are its twelve epogdoon-steps — so `rate_hz` is the
//!   STEP rate (beat = step). A cycle-rate reading would put the felt pulse at
//!   12× the band and the config loader would refuse it; beat = step is derived
//!   from the citation, not chosen. Cycle rate = rate_hz / intrinsic_twelvefold.
//! Involution law (T2.11): every `#` names which involution it means —
//!   `apply_reflection` (11−n, traversal-reversal, SU(2) antipode) and
//!   `apply_half_turn` (n+6 mod 12, antiphase pole-swap) are distinct named
//!   acts; `direction: Reflected` is continuous traversal-reversal (flow read
//!   backwards), the flow-form of the reflection.
//! Does NOT own: the oscillation mathematics (C ground `m1.c`, mirrored in
//!   `spanda.rs` — this module only evaluates it); the gateway transport
//!   methods (02.T2.13); the wire block (02.T2.14); the world-owned kairos sky
//!   (never held); the portal's `generation` counter (emission bookkeeping,
//!   advances while held).

use crate::spanda;

/// Transport mode of the one organism's phase. `Walking` is the transient
/// while a walk_to lands; it parks as `Held` (release resumes `Flowing`).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SpandaTransportMode {
    Flowing,
    Held,
    Walking,
}

/// Traversal direction of the flow. `Reflected` IS the reflection involution
/// as continuous motion — the `1/0` return-switch, phase decreasing.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SpandaDirection {
    Forward,
    Reflected,
}

/// The engine-owned phase anchor. All fields are plain numbers so the wire
/// block (02.T2.14) can ship the anchor itself — clients evaluate locally.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct SpandaPhaseAnchor {
    /// Wall-clock ms at which (phase0, mode, direction) were set. Wall time
    /// is used ONLY to evaluate elapsed flow; it never dices the tick.
    pub epoch_ms: u64,
    /// Cycle phase (radians, unwrapped) at the epoch. One 2π = one full
    /// twelve-step traversal (C readout convention, `m1.c::spanda_tick12_readout`).
    pub phase0: f64,
    /// STEP rate in Hz from the cited conserved-delta band (config-driven,
    /// band-refused by `SpandaHkbParams::from_ml_config`; see rate law above).
    pub rate_hz: f64,
    pub mode: SpandaTransportMode,
    pub direction: SpandaDirection,
}

impl SpandaPhaseAnchor {
    /// A flowing anchor starting at phase 0 (tick 0) at `epoch_ms`, stepping
    /// at the band-checked `rate_hz`.
    pub fn flowing(epoch_ms: u64, rate_hz: f64) -> Self {
        Self {
            epoch_ms,
            phase0: 0.0,
            rate_hz,
            mode: SpandaTransportMode::Flowing,
            direction: SpandaDirection::Forward,
        }
    }

    /// Radians the flow advances per second: steps/sec × (2π / twelvefold).
    /// The twelvefold divisor comes from the C ground, never a literal 12.
    fn radians_per_second(&self) -> f64 {
        let twelvefold = f64::from(spanda::intrinsic_twelvefold().max(1));
        self.rate_hz * std::f64::consts::TAU / twelvefold
    }

    /// The phase at `now_ms` — the whole anchor contract in one function.
    /// Held/Walking hold `phase0`; Flowing evaluates elapsed flow with the
    /// direction's sign. Instants before the epoch evaluate AT the epoch
    /// (an anchor never extrapolates into its own past).
    pub fn phase_at(&self, now_ms: u64) -> f64 {
        match self.mode {
            SpandaTransportMode::Held | SpandaTransportMode::Walking => self.phase0,
            SpandaTransportMode::Flowing => {
                let elapsed_s = now_ms.saturating_sub(self.epoch_ms) as f64 / 1_000.0;
                let signed = match self.direction {
                    SpandaDirection::Forward => elapsed_s,
                    SpandaDirection::Reflected => -elapsed_s,
                };
                self.phase0 + signed * self.radians_per_second()
            }
        }
    }

    /// tick12 readout at `now_ms` — always through the C-grounded readout.
    pub fn tick12_at(&self, now_ms: u64) -> u8 {
        spanda::tick12_readout(self.phase_at(now_ms))
    }

    /// (cycle, sub_tick) projection inputs for `KernelTemporalProjection`.
    /// `cycle` counts completed twelve-step traversals (floored, saturating
    /// at 0 for reflected flow past the origin — the count is a clock index,
    /// never negative on the wire).
    pub fn projection_inputs(&self, now_ms: u64) -> (u64, u8) {
        let phase = self.phase_at(now_ms);
        let cycles = (phase / std::f64::consts::TAU).floor();
        let cycle = if cycles.is_sign_negative() {
            0
        } else {
            cycles as u64
        };
        (cycle, spanda::tick12_readout(phase))
    }

    // ── Transport acts (kernel-side; the gateway walk family 02.T2.13
    //    exposes these through the S0 membrane) ──────────────────────────

    /// Freeze the flow at its current phase. Idempotent on a held anchor.
    pub fn hold(&mut self, now_ms: u64) {
        self.phase0 = self.phase_at(now_ms);
        self.epoch_ms = now_ms;
        self.mode = SpandaTransportMode::Held;
    }

    /// Resume flowing from the held phase (re-anchors the epoch).
    pub fn release(&mut self, now_ms: u64) {
        self.phase0 = self.phase_at(now_ms);
        self.epoch_ms = now_ms;
        self.mode = SpandaTransportMode::Flowing;
    }

    /// Walk to the phase whose readout is `tick` (mid-step, so the readout
    /// is stable under evaluation jitter), in the CURRENT cycle. Parks Held.
    pub fn walk_to_tick(&mut self, now_ms: u64, tick: u8) {
        let twelvefold = f64::from(spanda::intrinsic_twelvefold().max(1));
        let phase = self.phase_at(now_ms);
        let cycle_base = (phase / std::f64::consts::TAU).floor() * std::f64::consts::TAU;
        let step = f64::from(tick % spanda::intrinsic_twelvefold().max(1));
        self.phase0 = cycle_base + (step + 0.5) / twelvefold * std::f64::consts::TAU;
        self.epoch_ms = now_ms;
        self.mode = SpandaTransportMode::Held;
    }

    /// Step ±1 epogdoon-step from the current readout and park Held.
    pub fn step(&mut self, now_ms: u64, backward: bool) {
        let twelvefold = spanda::intrinsic_twelvefold().max(1);
        let current = self.tick12_at(now_ms);
        let target = if backward {
            (current + twelvefold - 1) % twelvefold
        } else {
            (current + 1) % twelvefold
        };
        self.walk_to_tick(now_ms, target);
    }

    /// `#` as REFLECTION (named): jump to 11−n — the traversal-reversal
    /// involution, the SU(2) antipode on the ring. Parks Held.
    pub fn apply_reflection(&mut self, now_ms: u64) {
        let target = spanda::spanda_invert(self.tick12_at(now_ms));
        self.walk_to_tick(now_ms, target);
    }

    /// `#` as HALF-TURN (named): jump to (n+6) mod 12 — the antiphase
    /// pole-swap involution. Parks Held.
    pub fn apply_half_turn(&mut self, now_ms: u64) {
        let target = spanda::spanda_half_turn(self.tick12_at(now_ms));
        self.walk_to_tick(now_ms, target);
    }

    /// Set the flow direction (continuous traversal-reversal — the flow-form
    /// of the reflection involution). Re-anchors so the turn is seamless.
    pub fn set_direction(&mut self, now_ms: u64, direction: SpandaDirection) {
        self.phase0 = self.phase_at(now_ms);
        self.epoch_ms = now_ms;
        self.direction = direction;
    }
}
