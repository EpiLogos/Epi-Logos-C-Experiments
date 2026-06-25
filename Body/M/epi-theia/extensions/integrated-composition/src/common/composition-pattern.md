# Composition Pattern — Composition-over-Juxtaposition Contract

**Status:** spec-ahead-integration  
**Cross-links:** Tranche 07 (integrated-composition extension), Tranche 08 (plugin-integrated extensions), Tranche 15.8 (M1-2 ananda vortex research)  
**Canon ref:** `composition-contract` (see `composition-coordinator.ts`, `composition-load.ts`)

---

## 1. Core Contract

Integrated plugins compose **three M-extensions into one editor surface**. They never produce three side-by-side panes.

This is the composition-over-juxtaposition invariant: the editor area is a single unified surface whose internal structure is the triadic composition of three M-extension widgets, not a three-pane layout where each extension occupies its own independent region.

## 2. Geometric Composition

The triadic composition follows two normative geometries:

### 2.1 Cosmic Composition: 1-2-3 over the K² Torus

M-extensions 1 (Paramaśiva), 2 (Parāśakti), and 3 (Mahāmāyā) compose over the K² torus geometry. The torus is the natural embedding surface for the cosmic triad — its two periodic dimensions (the 72-fold spanda cycle × the 16-fold sacred circle) provide the coordinate manifold. Each extension occupies one of the three toroidal bands; their interaction is governed by the torus's connectivity (genus-1 periodicity), not by rectangular juxtaposition.

### 2.2 Personal Composition: 4-5-0 over the Psychoid Field

M-extensions 4 (Jungian phenomenal), 5 (PASU being-pattern), and 0 (Synthesis/Lemniscate core) compose over the psychoid field. The psychoid field (Jung/Pauli, per QL L4' topology) is the embedding surface for the personal triad — it is non-locally connected, meaning the three extensions share a single phenomenological space rather than occupying adjacent screen regions.

## 3. What Composition Means

- **Composition** = three M-extension widgets rendered into one shared editor surface, their data bindings interleaved through the kernel-bridge, their visual boundaries governed by the geometry (torus or psychoid field), not by CSS grid/box-model adjacency.
- **Juxtaposition** (rejected) = three independent panes with separate scrollbars, separate focus, separate lifecycle — the VS Code split-editor model.

## 4. Composition-Load Enforcement

The `composition-load.ts` module enforces this contract at load time. When an integrated composition is assembled, the load step:

1. Validates that exactly three M-extension widget handles are present
2. Verifies they match the expected triad (1-2-3 or 4-5-0)
3. Rejects any side-by-side widget contribution (a fourth widget handle, a solo widget, a pair) — composition load returns a `CompositionRejection` with reason `'side-by-side-widget-contributions'` and the composition surface renders the honest-pending badge

## 5. The Lemniscate Transition

The 0/1 toggle (Tranche 15.5) transitions between the cosmic and personal compositions via a lemniscate (∞) animation. The lemniscate IS the geometric relationship between the two triads — it is the `#` nesting operator made visible as UI. During the transition, both compositions exist; the visible one is the currently active face of the fold.

## 6. M1-2 Ananda Vortex (Tranche 15.8 Feed)

Subagent research (Tranche 15.8) feeds the M1-2 ananda vortex composition specifics. The ananda vortex is the M1/M2 interface where Paramaśiva (M1) and Parāśakti (M2) meet — it is a vibrational (cymatic) composition, not a spatial one. When Tranche 15.8 lands, the vortex composition specifics are codified here as §6.1–6.N.

## 7. Verification

- `grep -rn 'composition-pattern\|composition-contract' Body/M/epi-theia/extensions/plugin-integrated-{1-2-3,4-5-0}/src/` — confirms integrated plugins reference this contract
- Integrated-composition contract test (in `composition-load.test.ts`, cross-link Tranche 07) asserts side-by-side widget contributions are rejected at composition load with reason `'side-by-side-widget-contributions'`
