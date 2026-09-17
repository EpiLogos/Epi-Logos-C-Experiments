# §0 — Handoff Context (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 33). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 33) — build/verify HERE, never epi-theia:** SUBSTRATE — harmonic energy channel handoff (kernel_energy_evaluate E4 personal / E5 harmonic [user data NEVER enters E5] / E6 verifier, 4:5:6 weighting; oracle codon-charge FFI fix — m3_compute_charges has zero Rust callers). CARRIER: the 4-5-0 engine is its consumption point. Expected-red owner. §2 track 33 + §5.1/§5.3.

1. **T0 — Absorb and retarget: 33-harmonic-energy-channel-handoff.md (law-only source)**

   Brief: read `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md` IN FULL. It carries binding law/design with no tranche list. Enumerate its unbuilt commitments against the current carrier (register §2 track 33 lists known gaps) as new numbered tranches appended to THIS file, then close this task with the enumeration as evidence.
   Depends on Track 00 Tranche 3, 12.T12.24 (Stream C), and 05.T5.22 (Stream F).
   Verify: new tranches parse into the ledger (re-run the assess script and show the new task ids); each cites its original section.

---

## Enumerated tranches (T0 output — Track-33-owned energy substrate + carrier)

*Enumerated from the source law (`../2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md`, read in full) against [[2026-07-03-cycle-3-recapture-register]] §2 track 33 + §5.1/§5.3 (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:109-110,165,167`). The handoff's eight planning STREAMS (A–H, source §2.1–§2.8) are delegated into other tracks' tranches (04-m3 4.13, 05-m4, 06-m5 6.8/6.10/6.11, 12-agentic 12.20/12.23/12.24/12.25, 17-s-stack) and are NOT re-enumerated here. These rows capture only the commitments the register attributes to Track 33 itself — the kernel-side energy-law closure, the codon-charge data-spine unification (co-owned 33/4.13), and the energy-decomposition carrier surface. Each row grounded with a 2026-07-10 grep receipt.*

2. **T33.1 — Close the E₅/E₆ energy channels beyond stub-zero (kernel-truth 4:5:6 expected-red)**

   Brief: source §1.1 kernel-spec E₄/E₅/E₆ amendment (`../2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md:85-104`) + §2.2 Stream B energy restructure (`:231-251`) in full. The `EnergyDecomposition` struct + `kernel_energy_evaluate(e_4, e_5, e_6)` signature and the 4:5:6 `total_energy` have LANDED (`Body/S/S0/portal-core/src/kernel.rs:352-353,653-670`), but `E5HarmonicInputs`/`E6VerifierInputs` are fed `::default()` stub-zeros — E₅ (multi-channel harmonic over `MathemeHarmonicProfile`) and E₆ (R-virtue verifier) carry no real content, so the canonical 4:5:6 law is unproven. Wire the real E₅ channel (consuming Stream C's N-channel EBM head) and the E₆ verifier scalar into `kernel_energy_evaluate`, keeping `user data NEVER enters E₅` structural (E₄ personal only). Substrate work — carries unchanged per `CHARTER.md`. Register-grounded UNBUILT (2026-07-10: E5/E6 inputs are `::default()` stubs in kernel.rs; expected-red `kernel_energy_carries_e5_e6_with_456_weighting` per register §5.3).
   Depends on Track 00 Tranche 3.
   Verify: `cargo test -p portal-core kernel_energy_carries_e5_e6_with_456_weighting` passes green (flips the expected-red); E₅/E₆ non-zero for non-default inputs; `user data NEVER enters E₅` asserted; verifier ≠ closer; evidence = fresh command output.

3. **T33.2 — Oracle codon-charge data-spine unification (m3_compute_charges FFI; retire the independent Rust algebra)**

   Brief: source §2.1 Stream A oracle Rust wiring (`../2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md:215-229`) in full; register §5.1 data-spine violation of record (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:165`). The C authority `m3_compute_charges(codon6bit, pp, mm, mp, pn)` (`Body/S/S0/epi-lib/include/m3.h:755-767`) is tested in C but the oracle still reimplements the ±32-per-line charge algebra in Rust (`Body/S/S0/epi-cli/src/nara/oracle_engine.rs` + `oracle_frame.rs`). Bind the oracle path to `m3_compute_charges_ffi`, add the boot assert `sum(pp for codon in 0..64) == 360`, and cross-check all 64 codons against the retired Rust baseline at zero tolerance. Co-owned with Track-04 Tranche 4.13 (register writes "33/4.13"); this row is the kernel-truth closure. Substrate work — carries unchanged. Register-grounded UNBUILT (2026-07-10: 17 charge refs still in `oracle_engine.rs`+`oracle_frame.rs`; expected-red `epi-cli kernel_truth_oracle.rs::oracle_eval4_charges_match_kernel_codon_charge_authority`).
   Depends on Track 00 Tranche 3.
   Verify: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_truth_oracle oracle_eval4_charges_match_kernel_codon_charge_authority` passes green (epi-cli is workspace-excluded package `epi-logos` — `-p epi-cli` never resolves); boot assert `sum(pp)==360` present; 64-codon cross-check at zero tolerance; verifier ≠ closer.

4. **T33.3 — Energy-decomposition carrier surface on the 4-5-0 engine (E₄/E₅/E₆ read-out)**

   Brief: source §1.1 E₄/E₅/E₆ semantics (`../2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md:85-104`) + register §2 track 33 CARRIER note ("no energy-decomposition surface; the 4-5-0 engine is its consumption point", `Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:110`). Land a `Body/M/pratibimba-app` read-out that renders the three energy channels from `EnergyDecomposition` — E₄ personal-resonance, E₅ harmonic-substrate, E₆ verifier — with the 4:5:6 weighting and the `bimba_pratibimba_energy` diagnostic, provenance-stated, on the 4-5-0 recognition engine. Read-only projection over the kernel serialization; no renderer-local energy math. Carrier work per `CHARTER.md`. Register-grounded UNBUILT (2026-07-10: 0 `e_4_personal`/`e_5_harmonic`/`e_6_verifier`/`EnergyDecomposition` refs under `Body/M/pratibimba-app/src`).
   Depends on 33.T33.1.
   Verify: the surface renders live E₄/E₅/E₆ + 4:5:6 total from the kernel serialization (carrier test; UF/app-flow per Track 00 when the 4-5-0 engine mounts it); no local energy computation; verifier ≠ closer.
