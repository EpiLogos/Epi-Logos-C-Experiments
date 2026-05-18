# The Physical-Pole Stack

## Computational Architecture for the 1-2-3 Engine: Torus, Solar-Chakral Field, Codon-Clock — Rendered Polyvalently in Tauri v2

> **Companion document to `epi-logos-kernel-spec.md`.** Where the kernel spec carries the matheme as algebraic operator, this document specifies how the **1-2-3 physical pole** of the second-pass 3:3 becomes concrete computational substrate — the torus (#1-5), solar-and-chakral systems (#2-5), and codon-clock (#3-5) as three real visualisable-computational spaces, driven by the same epogdoon-quantised tick, integrated into the Tauri v2 application shell that holds the mental-pole stack (LLM/EBM/Verifier) as its companion.

---

## §0/1 — Threshold: What This Document Specifies

The kernel spec gave the operator. This document gives the engine. The distinction is structural: the operator is the matheme-as-bioquaternionic-JEPA-EBM running across eight elements per tick; the engine is the three physical substrates (torus, solar-chakral, codon-clock) that *visualise and compute* the operator's state and trajectory in real geometric-harmonic space. Together they form the live system — operator running, engine showing, both pulsing on the same epogdoon-quantised tick.

The challenge is concrete: build an application that renders the kernel's bioquaternionic state across three coupled-but-distinct visualisations, drives all three from one shared tick, and integrates this with the mental-pole stack (LLM/EBM/Verifier) over a graph-database substrate. The application must run on desktop (Linux/macOS/Windows minimally; mobile reachable later through Tauri's mobile path), must perform at 60+ FPS for real-time interaction, must handle audio synthesis as constitutive (not decorative), and must remain mathematically faithful to the kernel's specifications — every harmonic ratio honoured, every tick a real epogdoon-step, every rotation a genuine SU(2) operation.

Three structural commitments hold the threshold. *First:* **Tauri v2 as the application shell** — for cross-platform reach with Rust-native performance, WebView-UI flexibility, and the demonstrated ability to host wgpu-rendered surfaces alongside webview content in the same window. *Second:* **Bevy as the simulation engine** for the three substrates — ECS-architecture for handling many entities (planets, chakras, codons, particles) with deterministic per-tick state-evolution, with Bevy's rendering hooking into the wgpu surface that Tauri exposes. *Third:* **Neo4j embedded or remote** as the bimba-map substrate, accessed from the Rust backend over the Bolt protocol — the same database holding canonical bimba and namespaced graphiti episodic memory, accessed transparently by both the physical-pole engine and the mental-pole stack.

What follows specifies the architecture in concrete detail: the tick-clock that drives everything, the three substrate-visualisations and their mathematical content, the data-flow between bioquaternionic state and visual rendering, the audio synthesis that makes the harmonic-tick literally audible, the cymatic-rendering layer that ties audio to visual, the WebGPU/wgpu compute pipelines that perform the heavy mathematics, and the layered application architecture that holds it all together within Tauri v2's process model.

---

## §1 — The Tick-Clock: The Foundational Pulse

Everything else depends on this. The Paramaśiva tick is not a frame-rate — it is the harmonic step-quantum that drives kernel state-evolution, audio synthesis, and visual animation as one synchronised pulse. The implementation must be precise, jitter-tolerant, and configurable for both real-time interactive operation and offline computational analysis.

### Tick rate specification

The fundamental tick-rate is a configurable parameter, but the *harmonic structure* is fixed. One complete kernel-cycle traverses 12 epogdoon-steps (8 element-positions plus 4 transitional epogdoons that fold the matheme). At a default user-facing tick-rate of 12 ticks per second, one complete kernel-cycle takes exactly 1 second — the kernel's natural breath-rate. This gives:

- **Element-rate**: 8 elements per second (the operator advances through one matheme-position every 125ms)
- **Sub-tick rate**: 12 per second (each epogdoon-step takes 1/12 second = ~83.3ms)
- **Cycle-rate**: 1 cycle per second (one complete tick of the eight-element matheme)

The tick-rate is configurable for three contexts: **interactive** (12 Hz default, slow enough for visual contemplation), **meditative** (slower — e.g., 1 cycle per minute, with each epogdoon taking 5 seconds for deep contemplation), and **computational** (faster — many cycles per second for offline analysis or training). The harmonic structure is always preserved: 12 epogdoons per cycle, 8 elements per cycle, with epogdoon-step proportional to chosen tick-rate.

### Rust implementation

Tokio's `time::interval` provides the foundation. Critically, `Interval` measures time since the last tick — not since the previous tick *completed* — which means missed ticks do not accumulate drift. For the harmonic-faithfulness this matters: the tick must remain phase-locked to its mathematical schedule even when individual tick-handlers run long.

```rust
use tokio::time::{interval, Duration, MissedTickBehavior};

pub struct ParamashivaTick {
    interval: tokio::time::Interval,
    cycle_count: u64,
    tick_in_cycle: u8, // 0..11 across the 12 epogdoons
}

impl ParamashivaTick {
    pub fn new(ticks_per_second: f64) -> Self {
        let period = Duration::from_secs_f64(1.0 / ticks_per_second);
        let mut interval = interval(period);
        // Skip missed ticks rather than burst — preserves harmonic phase
        interval.set_missed_tick_behavior(MissedTickBehavior::Skip);
        Self { interval, cycle_count: 0, tick_in_cycle: 0 }
    }

    pub async fn next_tick(&mut self) -> TickEvent {
        self.interval.tick().await;
        let event = TickEvent {
            cycle: self.cycle_count,
            sub_tick: self.tick_in_cycle,
            element: self.tick_in_cycle / 2, // approximate element-mapping
            phase: TickPhase::from_sub_tick(self.tick_in_cycle),
        };
        self.tick_in_cycle = (self.tick_in_cycle + 1) % 12;
        if self.tick_in_cycle == 0 { self.cycle_count += 1; }
        event
    }
}
```

The `TickPhase` enum encodes which matheme-element is active and which transitional epogdoon is being traversed — passed downstream so every consumer (kernel, audio, visual) knows exactly where in the matheme the system currently is. Channel-based broadcast (Tokio's `broadcast::channel`) distributes tick events to all consumers simultaneously, ensuring synchronised pulse across the whole engine.

### Phase-locked synchronisation

The audio thread is the most timing-sensitive consumer. Audio buffers must be filled ahead of playback; missing a buffer causes audible glitches. The pattern is **audio-pulled tick**: the audio callback (running on its own real-time thread, scheduled by the OS audio subsystem) drives the master clock, and other consumers (visual rendering, kernel computation) synchronise to audio timing. This inverts the naive "tick drives everything" pattern but is necessary for audio integrity.

The audio thread provides a `current_sample_position` that all other consumers can query; the tick-event broadcast is generated by an audio-callback-side scheduler that fires at the appropriate sample-positions. Visual frames render at whatever rate the display supports (typically 60-144Hz), interpolating between epogdoon-quantised kernel states for smooth visual flow.

---

## §2 — Substrate #1-5: The Torus

The torus is the geometric-topological substrate. It is the surface on which the entire matheme-cycle traces a continuous curve, with each tick advancing the curve by one epogdoon along the toroidal coordinates. The torus is at #1-5 because it is the *visualisation pole* of the Paramaśiva subsystem — where the 4+2 topology becomes literally seeable as the genus-1 surface that lets six positions circulate with the required Möbius twist.

### Mathematical content

The torus is parametrised by two angular coordinates:

- **θ (theta)** ∈ [0, 2π) — the *poloidal* angle, traversing the small circle of the torus. Maps to the **6-position cycle within one matheme pass** (descent or ascent helix's six positions).
- **φ (phi)** ∈ [0, 2π) — the *toroidal* angle, traversing the large circle. Maps to the **12-position double-cover** of one complete cycle (descent + ascent together).

A point on the torus is given by:

```
x = (R + r·cos(θ)) · cos(φ)
y = (R + r·cos(θ)) · sin(φ)
z = r · sin(θ)
```

where R is the major radius (distance from torus centre to small-circle centre) and r is the minor radius. The aspect ratio R/r is structurally significant: setting R/r = φ (the golden ratio, ~1.618) produces the *Clifford-symmetric torus* whose intrinsic geometry is closest to flat; setting R/r = 9/8 (the epogdoon!) produces a torus whose geometric proportions literally encode the kernel's tick-quantum.

### The bioquaternionic state on the torus

A unit quaternion lives on $S^3$ — the 3-sphere — which fibres over $S^2$ via the Hopf fibration. Each pair of unit quaternions $(q_b, q_p) \in S^3 \times S^3$ projects to a pair of points on $S^2$ via the Hopf map. The torus is the 2D surface where we visualise this projection: we map the bioquaternionic state to a single point on the torus, with the position determined by the Hopf projection.

In practical terms: the **bimba quaternion $q_b$ determines φ** (the toroidal coordinate, the slow circulation around the major axis), and the **pratibimba quaternion $q_p$ determines θ** (the poloidal coordinate, the fast circulation around the minor axis). Each tick advances both coordinates by their respective epogdoon-amounts; the trajectory traces a curve on the torus that closes (over a complete cycle) into a (p, q)-torus knot if the ratios of advancement form rational fractions, or into a dense torus-filling spiral if they form irrationals.

The **whole-tone scale doubling** appears geometrically as the trajectory's 2:1 winding ratio — for every full toroidal-circle (one complete φ-revolution), the curve completes two poloidal-circles (two complete θ-revolutions). This is the topological-geometric signature of the kernel's double-cover.

### Rendering specification

The torus is rendered via Bevy + wgpu compute shaders:

- **Mesh**: a high-resolution toroidal mesh (typically 128×64 vertices for the small/large circles, giving 8192 vertex positions) generated procedurally on initialisation.
- **Trajectory ribbon**: a strip of triangles following the trajectory curve, retained for the previous N seconds (configurable; 8-12 seconds is comfortable for visual contemplation). The ribbon is shaded with a temporal-fade gradient (newer points brighter), giving the trajectory persistence-of-vision.
- **Current point**: a glowing sphere at the current (θ, φ) position, emitting bloom in the HDR pass.
- **Lens-coloured texture**: the torus surface is shaded by a fragment shader that samples the active MEF lens-state — different lenses produce different colour-palettes and surface textures (Causal lens shades the surface in earth-tones with topographic-style relief; Logical lens renders crystalline; Processual lens flows; Vāk lens shimmers). The lens-blending is a weighted-sum across active lenses, with the EBM's lens-weightings $w_\ell$ as the weights.

The compute shader for trajectory advancement runs once per epogdoon-tick:

```wgsl
// trajectory_step.wgsl — runs once per epogdoon-tick
@group(0) @binding(0) var<uniform> kernel_state: KernelState;
@group(0) @binding(1) var<storage, read_write> trajectory: array<vec3<f32>>;
@group(0) @binding(2) var<uniform> torus_params: TorusParams;

@compute @workgroup_size(1)
fn advance_trajectory() {
    // Compute current point on torus from bioquaternionic state
    let theta = hopf_project_polar(kernel_state.q_p);
    let phi = hopf_project_polar(kernel_state.q_b);

    let R = torus_params.major_radius;
    let r = torus_params.minor_radius;
    let pos = vec3<f32>(
        (R + r * cos(theta)) * cos(phi),
        (R + r * cos(theta)) * sin(phi),
        r * sin(theta)
    );

    // Shift trajectory buffer; insert new point at head
    for (var i = arrayLength(&trajectory) - 1u; i > 0u; i = i - 1u) {
        trajectory[i] = trajectory[i - 1u];
    }
    trajectory[0] = pos;
}
```

The trajectory buffer is then rendered as a triangle strip in the regular rendering pipeline. Bevy's ECS handles the entity-component organisation; the wgpu compute is invoked via Bevy's render-graph customisation.

---

## §3 — Substrate #2-5: The Solar-and-Chakral System

The solar system as embodied harmonic field. The kernel's harmonic structure manifests visibly as the *gravitational-orbital geometry* of the solar bodies, mapped onto the chakra system via the elemental correspondences that the Parashakti subsystem holds. This is where the matheme becomes *cosmologically* legible — the body-microcosm and the cosmos-macrocosm rendered as one harmonic field, with the 9 planets plus Earth-as-centre giving the 10-body structure that doubles as the 7-chakra-plus-eighth.

### The 9+1 / 7+1 correspondence

You've specified: **9 planets plus Earth in centre, the base of the 7 chakras counting as their 8th**. Let me lay this structurally:

- **Sun**: the sahasrara-equivalent, the crown beyond the body, the source-illumination. (Chakra position: above the 7, the "8th" of the system *from above*.)
- **Mercury, Venus**: the manipura-and-svadhisthana correspondence (Mercury as the mental-fire of solar plexus, Venus as the relational-water of sacral).
- **Earth**: the muladhara-equivalent, the grounding chakra, the base on which the body stands. (Chakra position: the 1st, the foundation.)
- **Mars**: the manipura-warrior, the active-fire centre.
- **Jupiter**: the anahata-expansive, the heart's generous opening.
- **Saturn**: the ajna-disciplinarian, the third-eye structuring.
- **Uranus, Neptune, Pluto**: the outer planets as transpersonal extensions, beyond the 7 chakras into the **8th-and-beyond** that mirrors the Sun's above-the-7 position from below.

The 9 planets + Earth-in-centre gives 10 bodies. The 7 chakras + Earth-as-8th-base + Sun-as-crown-beyond gives 9 chakra-equivalent positions, with Earth as the unifying centre that is simultaneously the body's base and the cosmic centre. **The 10/9 difference is the epogdoon-residue at solar-cosmic scale** — 10:9 is structurally near 9:8, the same kind of one-step difference that the kernel's totality holds open. The solar-chakral system is the kernel's harmonic structure made cosmically embodied.

### Mathematical content: orbital mechanics as harmonic ratios

Each planet's orbital period gives it a fundamental frequency. The frequency-ratios between planetary orbits are mathematical facts:

- Mercury : Venus ≈ 1 : 2.55 (close to the major sixth, 5/3)
- Venus : Earth ≈ 1 : 1.625 (close to the major sixth again)
- Earth : Mars ≈ 1 : 1.88 (close to 15/8, a major seventh)
- Mars : Jupiter ≈ 1 : 6.31 (close to two octaves plus a major sixth)
- Jupiter : Saturn ≈ 1 : 2.48 (close to the major sixth)
- Saturn : Uranus ≈ 1 : 2.85 (between major sixth and minor seventh)
- Uranus : Neptune ≈ 1 : 1.96 (close to the octave 2:1)
- Neptune : Pluto ≈ 1 : 1.50 (close to the perfect fifth 3:2)

These ratios — actually observed in our solar system — encode a harmonic spectrum that has been investigated by Kepler (*Harmonices Mundi*) and many others since. The kernel's harmonic structure does not impose ratios on the solar system; the solar system *already exhibits* harmonic ratios, and the kernel reads them as the cosmic-scale instantiation of its own structure.

### Maqam musical mapping

The 7 maqamat (modal scales of Arabic-Turkish-Persian music) provide a 7-fold tonal architecture that maps onto the 7 chakras. Each maqam has a characteristic melodic-modal feeling and a specific intervallic structure. The mapping is configurable but a working default:

| Chakra | Element | Maqam | Planet | Frequency-ratio |
|---|---|---|---|---|
| Muladhara | Earth | Rast | Earth (centre) | 1/1 (tonic) |
| Svadhisthana | Water | Bayati | Venus | 9/8 (epogdoon!) |
| Manipura | Fire | Hijaz | Mars | 5/4 (major third) |
| Anahata | Air | Saba | Jupiter | 4/3 (perfect fourth) |
| Vishuddha | Ether | Kurd | Saturn | 3/2 (perfect fifth) |
| Ajna | Light | Nahawand | Uranus | 5/3 (major sixth) |
| Sahasrara | Consciousness | Ajam | Neptune+Pluto+Sun | 15/8 (major seventh) or 2/1 (octave) |

The **epogdoon at the svadhisthana** (sacral-Venus-water) is structurally significant: the second chakra is where the system's living-difference manifests as embodied creative-generative pulse. The 9/8 ratio that the kernel runs as its tick-quantum lives bodily at the svadhisthana.

The 4-element associations (Earth/Water/Fire/Air, with Ether as the fifth-akāśa-norm) correspond to the bioquaternionic basis. As the kernel ticks, the *active basis-component* of the current quaternionic state lights up the corresponding chakra-planet pair in the visualisation — the body and the cosmos pulse together with the kernel's tick.

### Rendering specification

A dual visualisation: **chakral column** (a vertical 7+1 stack of glowing spheres, each pulsing at its mapped frequency) and **planetary orbits** (Earth at centre, planets orbiting at their true relative speeds and positions). Both visualisations are *driven by the same underlying harmonic state* — when the kernel's tick-state highlights a particular element (say, the $\mathbf{i}$-component is currently dominant in the bioquaternion's pratibimba face), both the corresponding chakra (manipura-fire) and the corresponding planet (Mars) light up synchronously.

The connection between chakral and orbital views is visualised as **resonance-lines**: thin glowing arcs that connect each chakra to its planet, brightening when that body's harmonic is active and dimming when it is not. The lines do not represent literal connection in space; they represent harmonic-resonant-correspondence — same frequency in different registers.

Bevy implementation: each chakra and each planet is an ECS entity with a `HarmonicState` component carrying its frequency, amplitude, and current phase. A `TickAdvancer` system advances all phases by one epogdoon per tick. A `ResonanceRenderer` system draws the resonance-lines based on the EBM's current lens-weightings and the bioquaternionic state's active components.

---

## §4 — Substrate #3-5: The Codon-Clock

The genetic code as harmonic-temporal clock. The 64 codons (4 bases cubed) are the cubed-quaternionic combinatorial space; the I-Ching's 64 hexagrams are the same combinatorial space rendered as binary toggles. The codon-clock unifies these: a 64-position circular clock-face where each position carries simultaneously a codon, a hexagram, and a mathematical-musical state derived from the kernel's current rotation.

### The 64-fold structure

A codon is three base-selections from {A, T, G, C}. Three positions × four choices = 4³ = 64 codons. The I-Ching hexagram is six binary positions (yin/yang, 0/1). Six positions × two choices = 2⁶ = 64 hexagrams. Both spaces have cardinality 64, and a structural mapping exists (Martin Schönberger, Katya Walter, and others have explored this) where each codon corresponds to a specific hexagram via base-to-trigram-line correspondence.

The kernel's mapping uses this: as the bioquaternionic state rotates in $S^3 \times S^3$, its projection to the 64-fold codon-hexagram space gives a discrete current-position on the codon-clock. The mapping is a **discretisation of the continuous bioquaternionic state** into the 64-cell partition of the manifold — analogous to how the continuous-pitch space gets discretised into the 12 chromatic semitones for traditional Western music.

### The clock structure

64 = 8 × 8. The codon-clock is arranged as an 8×8 grid (the King Wen square arrangement is one canonical layout), or equivalently as a 64-position circular dial. As the kernel ticks, the current codon-hexagram position advances; over many ticks, the trajectory traces a path through the 64-cell space, with frequent transitions revealing the harmonic-structural-patterns the bioquaternionic state is currently moving through.

The clock advances in real time, but not by one cell per epogdoon — the advance rate is determined by the kernel's rotational speed in the bioquaternionic latent space, with one epogdoon corresponding to a specific quantum of rotation. Over one complete kernel-cycle (12 epogdoons), the codon-clock may advance through several cells (if rotation is fast) or remain near one cell (if rotation is slow), depending on the current trajectory.

### Mythic-symbolic mapping

Each codon-hexagram carries layered correspondences: the hexagram's traditional name and judgment (from the *I Ching*), the codon's amino acid (or stop codon), and a tarot-mythic correspondence (each of the 64 cells corresponds to a tarot trump-and-suit combination via a configurable mapping). The codon-clock thus serves as a **divinatory-cum-genetic visualisation** — the current state reads both as a momentary genetic-coding event and as a momentary mythic-symbolic configuration.

This is where the system's MEF #3 (Mahamaya, symbolic transcription) lens becomes most visible — the symbolic systems converge on a single combinatorial-harmonic space and the kernel's bioquaternionic rotation traces meaningful patterns through them.

### Rendering specification

A 2D-rendered clock-face overlaid on the 3D scene (or rendered as a floating UI panel within the Bevy scene). Each of the 64 cells is rendered with:

- The hexagram (six horizontal lines, broken or unbroken)
- The codon (three letters A/T/G/C in a stack)
- The amino acid (single letter)
- The associated tarot-mythic symbol (small icon)
- A pulse-glow when the trajectory is currently passing through this cell

The current-position cell pulses at full intensity; recently-visited cells glow with fading intensity; unvisited cells are dim but legible. A trajectory-trail (a thin line connecting recent positions) shows the path the kernel has traced through the 64-cell space.

Bevy implementation: a `CodonGrid` resource holds the 64-cell state. A `KernelToCodonProjection` system reads the bioquaternionic state once per tick and computes the current cell. Each cell is an ECS entity with its content components. A rendering system updates pulse-intensities and renders the trail.

---

## §5 — Cymatic Rendering: Audio-Visual Unity

This is what binds the three substrates: the **cymatic layer** that takes the kernel's audio synthesis as input and renders Chladni-like patterns simultaneously on the torus surface, the chakral spheres, and the codon-clock cells. The cymatic rendering is what makes the visualisation *audibly-driven* — every surface deforms or particles redistribute according to the live audio waveform.

### Audio synthesis specification

The kernel's harmonic-rhythmic state is rendered as continuous audio at a configurable sample rate (44.1 kHz or 48 kHz typical). Each tick produces a *chord-progression-event* — the active harmonic intervals (4/3, 3/4, 2/3, 3/2, with the epogdoon 9/8 as connective tissue) are sounded at the appropriate frequencies, with the active MEF lenses contributing as timbre-shaping (different lenses produce different waveform-envelopes).

The audio thread uses **cpal** (Rust audio library) for cross-platform audio I/O. Synthesis happens via custom DSP code — additive synthesis for the harmonic-foundational tones, with the four basis-components of the current pratibimba quaternion mapped to four oscillator amplitudes, and the bimba-pratibimba energy mapped to a low-pass filter cutoff (high energy = brighter sound, low energy = mellower).

```rust
// pseudo-code for audio callback
fn audio_callback(buffer: &mut [f32], kernel_state: &KernelState, harmonics: &HarmonicState) {
    for sample in buffer.iter_mut() {
        let t = harmonics.time;
        // Four basis-components as four oscillators
        let osc_i = (2.0 * PI * harmonics.freq_i * t).sin() * kernel_state.q_p.i;
        let osc_j = (2.0 * PI * harmonics.freq_j * t).sin() * kernel_state.q_p.j;
        let osc_k = (2.0 * PI * harmonics.freq_k * t).sin() * kernel_state.q_p.k;
        let osc_s = (2.0 * PI * harmonics.freq_s * t).sin() * kernel_state.q_p.scalar;

        let raw = (osc_i + osc_j + osc_k + osc_s) * 0.25;
        // Energy-driven low-pass
        let filtered = harmonics.lowpass(raw, kernel_state.energy);
        *sample = filtered;
        harmonics.time += 1.0 / harmonics.sample_rate;
    }
}
```

The audio frequencies for the four basis-components are configurable but a working default uses the **maqam-mapped frequencies** from §3 — Earth's tonic plus the chakra-mapped intervals — so that the audio is harmonically consistent with the chakral visualisation.

### Chladni-like pattern rendering

Cymatic patterns emerge when a vibrating surface forces a fluid or particulate to redistribute according to the standing-wave nodes. We render this *digitally* by computing the wave-equation's nodal patterns at the current audio frequency and using them to displace mesh vertices or position particles.

For the **torus surface**: a compute shader runs at frame-rate (60-144 Hz) that takes the current audio FFT (computed by the audio thread and shared via a lock-free ring buffer) and computes a wave-pattern over the torus surface. The pattern displaces vertices radially (in the surface-normal direction), giving the torus a *breathing-and-rippling* surface that responds to the audio in real time.

For the **chakral spheres**: each sphere's surface is treated as a separate vibrating membrane; particles distributed on the sphere migrate to nodal lines (low-displacement regions) under the influence of the chakra's mapped frequency. This is implemented as a particle-system compute shader with up to 5000 particles per chakra.

For the **codon-clock cells**: each currently-highlighted cell renders a small 2D Chladni pattern internally — a tiny grid of sand-particle-equivalents redistributing according to the cell's associated frequency. This makes the codon-clock not just a static dial but a living harmonic-pattern-display.

The **mathematical Chladni equation** for a square plate:

```
χ(x, y) = a·sin(mπx/L)·sin(nπy/L) + b·cos(mπx/L)·cos(nπy/L)
```

with (m, n) integer mode-numbers and (a, b) coefficients. For non-square surfaces (torus, sphere) the appropriate generalisation uses spherical harmonics ($Y_l^m$) for spheres and double-Fourier-series for tori. The active mode-numbers are derived from the kernel's bioquaternionic state — the four basis-coefficients map to (a, b, m, n) parameters.

### WebGPU/wgpu compute pipelines

The compute pipelines run as wgpu compute shaders, invoked from the Bevy render-graph. Performance budget: each substrate's cymatic computation must complete within ~5ms per frame to maintain 60+ FPS. With modern GPUs (Apple M-series, NVIDIA RTX, modern integrated GPUs) handling Chladni-pattern computation over 10⁵ particles in under 1ms each, this is comfortable.

---

## §6 — Application Architecture: Tauri v2 Integration

The application is structured in three coordinated processes/threads, all within one Tauri v2 application:

### Process model

**Main process (Rust)** holds:
- The Tauri runtime and window management
- The Tokio runtime hosting the kernel computation
- The audio thread (real-time priority via OS scheduling)
- The Neo4j connection pool (via the `bolt-client` or `neo4rs` crate)
- The HTTP/IPC bridge to the WebView frontend

**Bevy render thread (Rust)** holds:
- The wgpu rendering context
- The ECS world holding all visualisation entities
- The compute pipelines for trajectory advancement and cymatic patterns
- The render-graph that produces final framebuffer output to a Tauri-managed surface

**WebView frontend (TypeScript/React)** holds:
- The UI chrome (panels, controls, settings, conversation interface)
- The LLM-Nara conversation surface
- The MEF-lens-selection controls
- The bimba-coordinate navigator
- Communication with the Rust backend via Tauri commands

### Tauri's multi-surface capability

Tauri v2 supports multiple "surfaces" in the same window — webview overlays plus native GPU-rendered surfaces. The pattern is: the webview UI renders on top with transparent backgrounds where the GPU surface should show through; the wgpu surface renders the 3D scene; events flow between them via Tauri's IPC bridge.

The implementation follows the `clearlysid/tauri-wgpu-cam` and `FabianLars/tauri-v2-wgpu` patterns (referenced in the research):

```rust
// pseudo-code for surface setup
let window = tauri::WebviewWindowBuilder::new(app, "main", ...)
    .transparent(true)
    .build()?;

let surface = wgpu_setup(&window)?;
let bevy_app = setup_bevy_app(surface);

// Bevy runs in its own thread, receiving tick-events from main
tokio::spawn(async move {
    bevy_app.run();
});

// Tauri webview overlays the wgpu surface
```

### IPC patterns

Communication between Rust backend, Bevy render thread, and WebView frontend uses three patterns:

1. **Broadcast channels** (Tokio): the kernel publishes `TickEvent` and `KernelStateUpdate` events; Bevy and the webview subscribe.
2. **Tauri commands**: the webview invokes Rust functions (start session, change lens-weighting, query bimba coordinate); responses return via Promise.
3. **Tauri events**: the Rust backend pushes state-updates to the webview (`emit_all("kernel-state", state)`).

### Frontend stack

The WebView frontend uses **React** for component-based UI, **Tailwind CSS** for styling, and **Three.js** for any additional 3D visualisation that lives in HTML (e.g., a smaller-scale bimba-map navigator panel). The primary 3D scene is rendered by Bevy (in Rust), not by Three.js — but Three.js handles auxiliary visualisations within the webview's DOM.

For the **bimba-map navigator**: a force-directed graph rendered via Three.js shows the Neo4j-stored bimba coordinates as nodes and their relationships as edges. Clicking a node sets the kernel's engaged-coordinate and triggers the appropriate response across all three substrates.

For the **LLM conversation interface**: a standard chat UI showing user messages and Nara-responses, with the LLM accessing the kernel state and bimba map via the backend's Tauri-command bridge.

---

## §7 — The Mental-Pole Stack Integration

The physical-pole engine specified above couples to the mental-pole stack (LLM/EBM/Verifier) over the same Neo4j substrate. The coupling specification:

### LLM (Nara) integration

The LLM runs as a service — either local (via `llama.cpp` Rust bindings, `mistral.rs`, or `candle` for inference) or remote (OpenAI/Anthropic/etc. API calls). The Tauri backend exposes a `nara_invoke` command that the webview frontend calls; the backend formulates the prompt with the current bimba context (queried from Neo4j), invokes the LLM, and returns the response.

For local inference, **candle** (Hugging Face's Rust ML framework) is the most natural choice — pure-Rust, runs efficiently on CPU and GPU, integrates cleanly with the rest of the Tauri-Rust backend. Local inference avoids latency, preserves privacy, and keeps the system fully self-contained.

### EBM (Epii) integration

The EBM is the energy-function evaluator. It runs as a candle-based neural module: a learned scalar function over the bioquaternionic embedding space, with separate "heads" producing per-lens energies that compose into total energy. The EBM trains offline on accumulated session-trajectories (deposited in graphiti); at runtime it provides forward-pass evaluation in milliseconds.

The EBM module exposes:

- `evaluate(state: BioQuaternion, lens_weights: [f32; 12]) -> Energy` — returns total energy and per-lens components
- `gradient(state: BioQuaternion, lens_weights: [f32; 12]) -> BioQuaternion` — returns the energy-gradient for the descent step

The kernel invokes these once per element per tick. With candle's efficient inference, the full per-tick EBM evaluation should complete in under 5ms on modern hardware, well within the per-element budget.

### Verifier (Anuttara) integration

The Verifier is initially a constraint-checker over the bimba graph. Implementation: a set of Cypher queries that verify specific R-virtue invariants over the just-completed tick's state and trajectory. Each query returns either a coherence-attestation or a violation-report; the kernel aggregates these into an R-energy contribution.

Mature implementation (future): formal proof verification via a Lean integration. The Verifier produces proof-objects that the Anuttara axiom system certifies; only certified trajectories are admitted as concrescence-events. This is post-MVP work but the interface is forward-compatible.

### Neo4j substrate

A single Neo4j instance (embedded for desktop deployment, or a remote instance for shared deployment) holds:

- **Canonical bimba namespace**: the QL/MEF/Anuttara coordinate content, populated from the existing Cypher scripts in the project knowledge base
- **Graphiti episodic namespace**: per-user session trajectories, linked into the canonical bimba at #4.4.4.4

The Rust backend connects via `neo4rs` (Rust Neo4j driver). Queries are templated and parameterised; common queries (load coordinate content, load lens-articulations, query relationships) are cached in-process for performance.

### Layered build sequence

The implementation proceeds in five layers, each independently testable:

1. **Tick + Tokio runtime**: just the clock, producing tick-events. Verify harmonic precision and channel-broadcast latency.
2. **Bevy + wgpu scene**: empty 3D scene with the tick driving a placeholder rotation. Verify rendering performance and tick-synchronisation.
3. **Three substrates**: torus, solar-chakral, codon-clock all rendering. Verify visual coherence and per-tick state-updates.
4. **Audio + cymatic layer**: synthesis driving Chladni patterns across all substrates. Verify audio-visual sync and acceptable latency.
5. **Mental-pole integration**: LLM, EBM, Verifier, Neo4j all live. Verify end-to-end concrescence-cycle.

Each layer is a milestone; the system is usable (though increasingly less so) at each layer's completion.

---

## §8 — Performance and Polyvalence

### Performance budget

For 60 FPS sustained interactive operation (worst case 144 FPS for high-refresh displays):

- **Per-frame budget**: 16.67ms (60Hz) or 6.94ms (144Hz)
- **Per-tick budget at 12 ticks/sec**: 83.3ms — well above per-frame, so kernel computation happens between frames
- **Per-frame visual rendering**: ~10ms target (torus + solar + codon + UI overlay)
- **Per-tick kernel computation**: ~20-30ms target (EBM eval, gradient step, Verifier check)
- **Audio latency**: ~10-30ms acceptable (low enough that audio-visual sync feels tight)

These budgets are comfortable on modern hardware. Apple M-series, NVIDIA RTX 30-series and later, and modern integrated GPUs from AMD/Intel all meet them with headroom. Older hardware (5+ years old) may need reduced particle counts or simplified shaders but should still run at 30+ FPS.

### Polyvalent rendering

The "polyvalent" requirement — multiple complementary readings of the same underlying state — is structurally honoured by the three-substrate architecture: torus / solar-chakral / codon-clock are *three readings of one bioquaternionic state*. The MEF-lens shading on each substrate provides 12-fold additional polyvalence within each reading. The audio synthesis provides a fourth modality (sonic-harmonic). The codon-clock's mythic-symbolic overlay provides a fifth (divinatory-archetypal).

The user can foreground any substrate, background the others, and the kernel's state remains coherent across all viewings. This is exactly the polyvalence the QL framework demands — same operation seen through structurally-distinct lenses-and-substrates, with no privileged view.

---

## §∞ — Build Roadmap and Decision Points

### Concrete next steps

1. **Initialise Tauri v2 project** with wgpu integration (use `FabianLars/tauri-v2-wgpu` as starting reference).
2. **Add Bevy integration** with surface-rendering into Tauri's wgpu context.
3. **Implement the tick-clock** with Tokio intervals and channel-broadcast.
4. **Render the torus** (Bevy mesh, trajectory ribbon, basic shader).
5. **Add the solar-chakral substrate** (planets + chakra-spheres + resonance lines).
6. **Add the codon-clock substrate** (64-cell grid with hexagram-codon-amino-tarot overlay).
7. **Integrate audio** (cpal-based synthesis, FFT for cymatic input).
8. **Add cymatic rendering** (Chladni-pattern shaders on each substrate).
9. **Integrate Neo4j** (canonical bimba schema population, graphiti namespace setup).
10. **Add LLM-Nara conversation interface** (candle local inference or remote API).
11. **Implement EBM-Epii energy module** (candle-trained scalar with lens-heads).
12. **Implement Verifier-Anuttara** (Cypher-based constraint checking).

### Key decision points

- **Local vs remote LLM**: local (candle/mistral.rs) for self-contained deployment; remote (OpenAI/Anthropic) for state-of-the-art response quality. Recommend local for the prototype to preserve full system self-containment.

- **Neo4j embedded vs remote**: embedded for single-user desktop deployment (no server needed); remote for multi-user shared bimba evolution. Recommend embedded for prototype; remote for production with shared bimba.

- **Bevy version**: 0.17 is the latest stable as of 2026; the API has historically been moving but is stabilising. Pin to a specific minor version and update deliberately rather than tracking head.

- **WebView UI framework**: React/Tailwind for ecosystem maturity; alternatives include Svelte, SolidJS, or Vue. The choice has low structural impact (any modern framework will integrate with Tauri's IPC) but high developer-experience impact.

- **Audio library**: `cpal` for cross-platform I/O; `fundsp` or custom DSP for synthesis. `cpal` is canonical for Rust audio applications.

### Risks and mitigations

- **wgpu+Tauri integration complexity**: the integration pattern is established (existing GitHub examples) but each Tauri version may introduce subtle changes. Mitigation: pin Tauri version, test integration early.

- **Audio-visual synchronisation drift**: real-time audio threads can drift relative to visual frame timing. Mitigation: use audio thread as master clock, synchronise visuals to audio sample-positions rather than wall-clock.

- **Bevy API instability**: Bevy releases breaking changes regularly. Mitigation: pin version, allocate time per upgrade, encapsulate Bevy-specific code behind internal abstractions where feasible.

- **LLM inference latency**: local inference can be slow on weak hardware. Mitigation: use small efficient models (Phi-3, Llama 3.2 1B-3B variants); offload to remote API as fallback option.

- **Neo4j schema evolution**: as the bimba map evolves, schema migrations are needed. Mitigation: version the schema; provide migration scripts; treat the bimba map's evolution as a first-class concern.

---

## Closing Recognition

The physical-pole engine is a real engineering project — Tauri v2 + Bevy + wgpu + Tokio + cpal + candle + Neo4j as the concrete technical stack, with the three substrates (torus, solar-chakral, codon-clock) as three coupled visualisations driven by the same epogdoon-quantised tick. The matheme's harmonic structure provides every quantitative parameter; no magic numbers, no hyperparameter-tuning, just the kernel's algebra made into rendered geometry, audible sound, and verifiable computation.

What this document does not specify but is buildable from it: the specific Bevy entity-component-system schemas for each substrate, the exact compute shader implementations, the Neo4j Cypher query templates, the LLM prompt structures, the EBM neural architecture specifics. These are implementation details that can be specified document-by-document as each layer comes online.

What this document does specify: the *shape* of the buildable system. From here, the engineering work is concrete enough that any competent Rust/Bevy/Tauri developer can begin implementing — and the matheme-faithfulness is preserved throughout because the harmonic ratios, the tick-quantum, the three-substrate-mapping, and the lens-shading rules are all derived from the kernel spec's algebra rather than chosen by implementation taste.

The engine is the body. The kernel is the breath. The bimba map is the score. Together they make the instrument that the matheme has always been waiting to be played as.

---

*Document status: Engineering Architecture Specification — open to refinement through build-discovery.*

*Companion document: `epi-logos-kernel-spec.md` (the operator across the matheme).*

*Next: bevy-ecs-schemas.md (the per-substrate component definitions); neo4j-bimba-schema.md (the database structure); tauri-bevy-integration.md (the specific wiring patterns).*
