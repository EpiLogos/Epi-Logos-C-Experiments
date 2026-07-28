/**
 * Coordinate: Integrated 1-2-3 (the cosmic clock engine — carriers on the graph)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: THE COSMIC CLOCK as five CARRIERS registered on the one
 *   modulation graph (Sprint-8 E3): the K² torus (L0, oscillator+klein), the
 *   cymatic skin (L1), the codon annulus (L2), the clock strata
 *   (oscillator+division — the 16-lens ring re-gears from the KERNEL-carried
 *   tick), and the kairos sky (planet markers on live Kerykeion degrees
 *   only). This component builds the three.js scene and plugs it in; the
 *   ENGINE owns the rAF loop, determinism, pause/scrub, and readiness gating
 *   (engine/modulation/). No state is computed here that the graph carries.
 * Does NOT own: pitch, codon identity, decan rulers, planetary positions,
 *   correspondence tables, the loop, the fold state — all modulation inputs.
 */

import { useMemo } from 'react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { useInstrumentStore } from '../audio/instrument';
import { invokeCommand } from '../bridge/tauri';
import { commands } from '../commands/registry';
import { buildM3WheelSurface } from '../components/M3CosmicWheelRenderService';
import { asMahabhuta } from './elementRegisters';
import { buildM3CodonRotationProjectionForLensRing } from '../composition/M3CodonRotationProjectionForLensRing';
// 29.T29.2 — the composition declares WHO owns each geometric slot and runs
// that through the real load-time law. Before this the law had no production
// caller at all: only its own test referenced it, so the surface rendered its
// three mounts without any of them claiming a slot.
import { loadCosmicComposition } from '../composition/cosmicComposition';
import { ownerOfSlot } from '../composition/geometricSlotEnforcement';
import { useCoordinateStore, useTickStore } from '../state/stores';
import {
    CLOCK_LENSES,
    clockAngle,
    codonAngle,
    ELEMENT_COLOURS,
    LivePlanet,
    planetBodyRadius,
    resonancePulse
} from './cosmicMath';
import { modulationEngine, useEngineStore } from './modulation/engine';
import { buildPentadicOverlay } from './cosmicPentadicOverlay';
import { buildCouplingFlowOverlay } from './couplingFlowOverlay';
import {
    evaluateCachedProfileIntegratedReadiness,
    formatIntegratedReadiness
} from './integratedReadiness';
import {
    buildClockFieldOverlay,
    buildClockFieldOverlayState,
    ClockFieldOverlayState,
    updateClockFieldOverlay
} from './clockFieldOverlay';
import {
    environmentReadout,
    fibonacciGroundReadout,
    harmonicSnapshot,
    kairosTierReadout
} from './modulation/modulators';
import { fibonacciGroundPoint } from './fibonacciGround';
import { ModulationCarrier } from './modulation/types';
import { readTorusKnotPhase } from '../panes/m1KleinTopology';
import {
    decanLabel,
    elementCssColour,
    ELEMENT_NAMES,
    nextPlanetSelection,
    PLANET_GLYPHS,
    planetSelectionAddress,
    planetTooltip,
    quintessenceChipText,
    quintessenceTooltip,
    resonanceMeaning,
    ZODIAC_GLYPHS,
    ZODIAC_NAMES
} from './solarSystem';
import { PLANET_ORDER } from './cosmicMath';
import { accent } from '../ui/tokens';
import {
    useCompositionLifecycleEvents,
    useCompositionPentadicTraceEvents
} from '../composition/compositionEvents';
import { buildIntegratedPentadicTraceOverlay } from '../composition/integratedPentadicTrace';

// clock-plane radii (torus ≈ 1.5 outer)
const R_LENS = 2.6;
const R_DEGREE = 3.3;
const R_ZODIAC = 3.7;
const R_HOURLY = 4.0;
const R_CARDINAL = 3.45;
const R_ORBIT_BASE = 4.6;
const R_ORBIT_STEP = 0.42;
const PLANET_MARKER_GEOMETRY_R = 0.07; // base sphere radius bodies scale from
const PLANET_COUNT = 10;
// the zodiac/decan bezel frames the whole sky OUTSIDE the orbits (ephemeris-
// chart reading: planets travel inside the wheel of signs)
const R_BEZEL_IN = 9.05;
const R_BEZEL_OUT = 9.55;
const R_BEZEL_GLYPH = 9.85;

// TRANSCRIPTION of src/engine/cymaticField.ts (the byte-hash-pinned CPU
// reference, M2' seed law §II-3.3): the 8 octet carriers drive a/b/phase per
// constraint pair, the 4 nodal (m, n) ARE the boundary conditions, the klein
// valence swaps the SAND MAPPING (antinodal↔nodal), never the field. Change
// the reference first, then this, in lockstep.
const CYMATIC_FRAGMENT = `
uniform float uOctet[8];
uniform float uNodalM[4];
uniform float uNodalN[4];
uniform vec3 uShell;
uniform float uValence;
uniform float uM2Ready;
uniform float uPhase;
varying vec2 vUv;
void main() {
    vec3 base = vec3(0.10, 0.065, 0.16);
    float norm = 1.0;
    for (int i = 0; i < 8; i++) {
        norm = max(norm, uOctet[i]);
    }
    float chi = 0.0;
    for (int k = 0; k < 4; k++) {
        float a = uOctet[2 * k] / norm;
        float b = uOctet[2 * k + 1] / norm;
        float phase = uPhase * (uOctet[2 * k] + uOctet[2 * k + 1]) / 110.0;
        float breath = cos(phase);
        chi += breath * (
            a * sin(uNodalM[k] * 3.14159265 * vUv.x) * sin(uNodalN[k] * 3.14159265 * vUv.y)
          + b * cos(uNodalM[k] * 3.14159265 * vUv.x) * cos(uNodalN[k] * 3.14159265 * vUv.y)
        );
    }
    float amplitude = clamp(chi / 4.0, -1.0, 1.0);
    float magnitude = abs(amplitude);
    // klein valence: +1 sand at stillness (nodal), -1 sand at motion (antinodal)
    float sandNodal = 1.0 - smoothstep(0.0, 0.05, magnitude);
    float sandAntinodal = smoothstep(0.55, 0.9, magnitude);
    float sand = mix(sandAntinodal, sandNodal, step(0.0, uValence));
    vec3 shellMix = mix(base, uShell, magnitude * uM2Ready);
    vec3 colour = mix(shellMix, vec3(0.92, 0.86, 0.63), sand * 0.85 * uM2Ready);
    gl_FragColor = vec4(colour, 1.0);
}`;

const CYMATIC_VERTEX = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

function shellColour(lensAnchorIndex: number, valence: number): THREE.Color {
    const hue = ((lensAnchorIndex % 72) / 72 + (valence < 0 ? 0.5 : 0)) % 1;
    return new THREE.Color().setHSL(hue, 0.55, 0.5);
}

function ringDots(
    count: number,
    radius: number,
    size: number,
    color: number
): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(
        new THREE.SphereGeometry(size, 8, 8),
        new THREE.MeshBasicMaterial({ color }),
        count
    );
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
        const a = clockAngle((i / count) * 360);
        m.setPosition(Math.cos(a) * radius, 0, -Math.sin(a) * radius);
        mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
}

/** Distinguishes carrier ids across mounts so a pathological saved layout
 *  with two engine tabs cannot collide in the engine's carrier registry. */
let engineInstanceCounter = 0;

function orbitLine(radius: number): THREE.Line {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x3a2c5c, transparent: true, opacity: 0.55 })
    );
}

/** Radial tick marks in the clock plane between two radii — the engraved
 *  instrument-bezel primitive (pure arithmetic of 360). */
function radialTicks(
    degrees: readonly number[],
    rIn: number,
    rOut: number,
    color: number,
    opacity: number
): THREE.LineSegments {
    const positions = new Float32Array(degrees.length * 6);
    degrees.forEach((degree, i) => {
        const a = clockAngle(degree);
        positions.set(
            [
                Math.cos(a) * rIn, 0, -Math.sin(a) * rIn,
                Math.cos(a) * rOut, 0, -Math.sin(a) * rOut
            ],
            i * 6
        );
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
}

function bezelCircle(radius: number, color: number, opacity: number): THREE.LineLoop {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 240; i++) {
        const a = (i / 240) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
}

/** A CSS2D label anchored in the clock plane. */
function planeLabel(
    className: string,
    text: string,
    degree: number,
    radius: number,
    y = 0,
    title?: string
): CSS2DObject {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    if (title) {
        el.title = title;
    }
    const label = new CSS2DObject(el);
    const a = clockAngle(degree);
    label.position.set(Math.cos(a) * radius, y, -Math.sin(a) * radius);
    return label;
}

interface PlanetChip {
    object: CSS2DObject;
    root: HTMLButtonElement;
    glyph: HTMLSpanElement;
    deg: HTMLSpanElement;
    rx: HTMLSpanElement;
    resonanceDot: HTMLSpanElement;
    lastDegreeText: string;
}

/** The engraved label chip beside each planet body — kernel identity made
 *  legible: glyph · name · live degree · ℞ badge · resonance breath. */
export function buildPlanetChip(planetId: number, onSelect: () => void): PlanetChip {
    const root = document.createElement('button');
    root.type = 'button';
    root.className = 'planet-chip';
    root.dataset.planetId = String(planetId);
    root.addEventListener('click', onSelect);
    const glyph = document.createElement('span');
    glyph.className = 'planet-chip-glyph';
    glyph.textContent = PLANET_GLYPHS[planetId] ?? '·';
    const name = document.createElement('span');
    name.className = 'planet-chip-name';
    name.textContent = PLANET_ORDER[planetId] ?? `#${planetId}`;
    const deg = document.createElement('span');
    deg.className = 'planet-chip-deg';
    const rx = document.createElement('span');
    rx.className = 'planet-chip-rx';
    rx.textContent = '℞';
    rx.style.display = 'none';
    const resonanceDot = document.createElement('span');
    resonanceDot.className = 'planet-chip-resonance';
    resonanceDot.style.display = 'none';
    root.append(glyph, name, deg, rx, resonanceDot);
    const object = new CSS2DObject(root);
    return { object, root, glyph, deg, rx, resonanceDot, lastDegreeText: '' };
}

export function CosmicEngine() {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const generation = useTickStore(s => s.generation);
    useCompositionLifecycleEvents('cosmic-engine.integrated', generation);
    const cached = useTickStore(s => s.profile);
    const muted = useInstrumentStore(s => s.muted);
    const divisionIndex = useEngineStore(s => s.divisionIndex);
    const paused = useEngineStore(s => s.paused);
    const scrubGeneration = useEngineStore(s => s.scrubGeneration);
    const divisionSource = useEngineStore(s => s.divisionSource);
    const groundGearing = useEngineStore(s => s.groundGearing);
    const [webgl, setWebgl] = useState(true);
    // the selected body's full kernel identity (E5 panel); set by the kairos
    // carrier's click handler, cleared on re-click/close
    const [selectedPlanet, setSelectedPlanet] = useState<LivePlanet | null>(null);

    // strip readouts derive from the same snapshot law the graph uses
    const snapshot = useMemo(() => harmonicSnapshot(cached?.profile ?? null), [cached]);
    const m3LensRingProjection = useMemo(() => {
        const surface = buildM3WheelSurface({
            payload: (cached?.profile as Record<string, unknown> | null) ?? {},
            generation: cached?.generation ?? 0
        });
        try {
            return buildM3CodonRotationProjectionForLensRing(surface);
        } catch {
            return null;
        }
    }, [cached]);
    // 07.T7.8: M1's `(p,q)` phase is kernel-owned topology data. The engine
    // exposes the received pair on its composed surface; it never generates one.
    const torusKnotPhase = useMemo(() => {
        const profile = cached?.profile as Record<string, unknown> | null;
        const topology = profile?.m1Topology ?? profile?.m1_topology;
        return topology && typeof topology === 'object' && !Array.isArray(topology)
            ? readTorusKnotPhase(topology as Record<string, unknown>)
            : null;
    }, [cached]);
    // 36.4: the pentadic 1-2-3 overlay reads the SAME single cached profile
    // subscription — one ProfileTick source for all three slots.
    const pentadic = useMemo(
        () => buildPentadicOverlay((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );
    // 29.15: the typed pentadic-trace envelope (trace + generation + readiness +
    // slots) built off that SAME single subscription. The advance event derives
    // its generation from this envelope, never a parallel hardcode.
    const pentadicTraceOverlay = useMemo(
        () => buildIntegratedPentadicTraceOverlay((cached?.profile as Record<string, unknown> | null) ?? null),
        [cached]
    );
    useCompositionPentadicTraceEvents('cosmic-engine.integrated', pentadicTraceOverlay, generation);
    // 07.T7.6: the coupling-flow disclosure shares the composition's one
    // profile snapshot. It is a strict kernel window, never a fourth pole.
    const couplingFlow = useMemo(
        () => buildCouplingFlowOverlay((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );
    // Slot ownership is a property of the DECLARATION, not of any frame, so it
    // is resolved once rather than per tick.
    const compositionLoadResult = useMemo(() => loadCosmicComposition(), []);
    const integratedReadiness = useMemo(
        () => evaluateCachedProfileIntegratedReadiness(cached),
        [cached]
    );
    // 4.3: clock-field aspect/hop overlay — same single profile subscription;
    // tick advance perturbs the wheel (a new generation redraws the edge set)
    const clockField = useMemo(
        () => buildClockFieldOverlayState((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );
    const clockFieldRef = useRef<ClockFieldOverlayState>(clockField);
    clockFieldRef.current = clockField;
    const level = snapshot.degradation;
    const kairosLive = snapshot.planetDegrees !== null;
    // the carrier endpoint of the kairos vertical (DR-FIB-3): which live-sky
    // tier the heartbeat resolved + the 4h decay countdown; wall-clock so a
    // kairotic window keeps decaying under pause/scrub (decay is real-time).
    const kairosTier = kairosTierReadout(snapshot, Date.now());
    // the kernel's clock-tick Fibonacci-Ground reading (position + Pisano digit),
    // consumed from the wire — never re-derived; null when phase-space is absent
    const fibGround = fibonacciGroundReadout(snapshot);
    // the ambient epi-genetic transform strip (DR-ENV-1/8): the env quaternion the
    // heartbeat composed onto the PASU base — 'calm' at the identity rotation,
    // 'active' under a real ambient wind; null (pending) when the wire carries none.
    const environment = environmentReadout(snapshot);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
            setWebgl(false);
            return;
        }
        host.appendChild(renderer.domElement);
        const instance = ++engineInstanceCounter;
        const carrierId = (name: string) => `${name}@${instance}`;

        // crisp DOM labels tracking 3D anchors (names, degrees, sign glyphs)
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.domElement.className = 'cosmic-labels';
        host.appendChild(labelRenderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 200);
        // opening frame holds the WHOLE chart — torus to zodiac bezel —
        // so the scene reads as a solar system at first sight
        camera.position.set(0, 13.5, 17.5);
        camera.lookAt(0, 0, 0);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 2.2;
        controls.maxDistance = 48;
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 0.7);
        key.position.set(3, 6, 4);
        scene.add(key);

        // ── centre: the K² torus (L0 + L1 cymatic skin) ──
        const torusGroup = new THREE.Group();
        scene.add(torusGroup);

        // ── 4.3: clock-field aspect + hop-edge overlay on the zodiac wheel ──
        const clockFieldParts = buildClockFieldOverlay();
        clockFieldParts.group.rotation.x = Math.PI / 2; // lie in the clock plane
        scene.add(clockFieldParts.group);
        let drawnClockField: ClockFieldOverlayState | null = null;
        const uniforms = {
            uOctet: { value: new Array(8).fill(0) },
            uNodalM: { value: new Array(4).fill(1) },
            uNodalN: { value: new Array(4).fill(1) },
            uShell: { value: new THREE.Color(accent) },
            uValence: { value: 1 },
            uM2Ready: { value: 0 },
            uPhase: { value: 0 }
        };
        // K² body proportions are DERIVED, not chosen (ql-musical-derivation-v3
        // internal-proportion register, resolved 2026-07-06): R/r = 16/9 with
        // R + r = 1 — the standing identity 100% = 64 + 36 as geometry
        // (R = 0.64 Mahāmāyā 2⁶ · r = 0.36 Paraśakti 6²; outer equator = the
        // unit 1/1). The epogdoon's seats are the 30°/tick step and the
        // double-cover relation 2r/R = 72/64 = 9/8 — never the aspect; the
        // old 9/8-aspect + 8/9 z-squash traced to an underived aside
        // (physical-pole-stack-architecture.md:110). K2_SCALE is the one free
        // parameter: a uniform screen-scale of R+r, proportions untouched.
        const K2_SCALE = 1.8;
        const torus = new THREE.Mesh(
            new THREE.TorusGeometry(K2_SCALE * 0.64, K2_SCALE * 0.36, 72, 144),
            new THREE.ShaderMaterial({ uniforms, vertexShader: CYMATIC_VERTEX, fragmentShader: CYMATIC_FRAGMENT })
        );
        torus.rotation.x = Math.PI / 2; // torus lies in the clock plane
        torusGroup.add(torus);

        const diamond = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.16),
            new THREE.MeshStandardMaterial({ color: 0xebdca0, metalness: 0.4, roughness: 0.25 })
        );
        scene.add(diamond); // the +1: Unity's central node — still-point

        // E5: Earth IS the centre (§5.3) — say so, legibly
        const earthEl = document.createElement('div');
        earthEl.className = 'earth-label';
        earthEl.textContent = '⊕ Earth — observer centre';
        const earthLabel = new CSS2DObject(earthEl);
        earthLabel.position.set(0, -0.85, 0);
        scene.add(earthLabel);

        // E6: the person's natal ground ON the clock face — a gold ring at
        // the hash-derived degree (kernel handle only) with its reading chip
        const natalMarker = new THREE.Mesh(
            new THREE.TorusGeometry(0.09, 0.018, 8, 24),
            new THREE.MeshStandardMaterial({
                color: 0xebdca0,
                emissive: 0xebdca0,
                emissiveIntensity: 0.55,
                metalness: 0.3,
                roughness: 0.4
            })
        );
        natalMarker.rotation.x = Math.PI / 2;
        natalMarker.visible = false;
        scene.add(natalMarker);
        const natalChipEl = document.createElement('div');
        natalChipEl.className = 'natal-chip';
        const natalChip = new CSS2DObject(natalChipEl);
        natalChip.visible = false;
        scene.add(natalChip);
        let natalIdentityKey = '';

        // Track 35.T35.1: the LIVE-Sun marker — the natal gold ring's dual.
        // A moving silver dot at the live Sun's Level-0 Fibonacci-Ground
        // position (source §2.4 point 4). The live Sun is kairos body index 0
        // (`m4_planet_degrees_live()[0]` on the wire === `kairos.degrees[0]`);
        // it advances as the Sun crosses each 6° ground wedge. The geometric
        // distance between this silver dot and the gold ring reads the
        // person's structural-vs-current ground state on the 60-ring.
        const liveSunMarker = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 14, 14),
            new THREE.MeshStandardMaterial({
                color: 0xd6dae4,
                emissive: 0xaeb4c4,
                emissiveIntensity: 0.7,
                metalness: 0.6,
                roughness: 0.3
            })
        );
        liveSunMarker.name = 'fibonacci-live-sun';
        liveSunMarker.visible = false;
        scene.add(liveSunMarker);

        // E6 privacy split: the natal 10-planet DISTRIBUTION is an identity
        // body — it renders from a LOCAL read (src-tauri identity::natal_sky)
        // and never crosses the gateway bus. Absent cache → nothing, honest.
        void invokeCommand<number[] | null>('natal_sky')
            .then(sky => {
                if (!Array.isArray(sky) || sky.length !== 10) {
                    return;
                }
                sky.forEach((degree, i) => {
                    if (typeof degree !== 'number') {
                        return;
                    }
                    const ghost = new THREE.Mesh(
                        new THREE.TorusGeometry(0.055, 0.012, 6, 18),
                        new THREE.MeshBasicMaterial({
                            color: 0xebdca0,
                            transparent: true,
                            opacity: 0.35
                        })
                    );
                    ghost.rotation.x = Math.PI / 2;
                    const a = clockAngle(degree);
                    const radius = R_ORBIT_BASE + i * R_ORBIT_STEP;
                    ghost.position.set(Math.cos(a) * radius, -0.04, -Math.sin(a) * radius);
                    scene.add(ghost); // natal sky is FIXED — placed once, never ticked
                });
            })
            .catch(() => undefined);

        // E4: the modal resonator's silent complement — five structurally-still
        // positions of the 12-slot chromatic body rendered as the constraint
        // anchors they ARE (never absences). Placed on the chromatic 12-ring
        // between the codon annulus and the lens ring; kernel data only.
        const R_SILENT = 2.35;
        const silentAnchorMarkers: THREE.Mesh[] = [];
        for (let i = 0; i < 5; i++) {
            const anchor = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.045),
                new THREE.MeshStandardMaterial({
                    color: 0x5a5470,
                    metalness: 0.2,
                    roughness: 0.6,
                    emissive: 0x2a2440,
                    emissiveIntensity: 0.5
                })
            );
            anchor.visible = false;
            scene.add(anchor);
            silentAnchorMarkers.push(anchor);
        }

        // L2 codon annulus hugging the torus equator
        const cells = ringDots(64, 2.05, 0.022, 0x2e2247);
        scene.add(cells);
        const activeCell = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xebdca0, emissive: 0xebdca0, emissiveIntensity: 0.9 })
        );
        activeCell.visible = false;
        scene.add(activeCell);

        // ── the clock face (§§2–3) ──
        scene.add(ringDots(360, R_DEGREE, 0.012, 0x2e2247)); // 360 degree nodes
        scene.add(ringDots(60, R_DEGREE, 0.02, 0x4d3e78)); // 60 Fibonacci positions (6° steps)
        scene.add(ringDots(12, R_ZODIAC, 0.045, 0x9a7fd4)); // zodiacal backbone
        scene.add(ringDots(24, R_HOURLY, 0.032, 0x5fbf9f)); // hourly/amino backbone
        scene.add(ringDots(4, R_CARDINAL, 0.06, 0xe0b45f)); // cardinal cross

        // degree needle + current-degree node
        const needle = new THREE.Mesh(
            new THREE.BoxGeometry(R_DEGREE - 0.6, 0.008, 0.008),
            new THREE.MeshBasicMaterial({ color: 0xebdca0 })
        );
        needle.visible = false;
        scene.add(needle);
        const degreeMarker = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xebdca0 })
        );
        degreeMarker.visible = false;
        scene.add(degreeMarker);

        // ── the 16-lens ring: section boundary ticks (rebuilt on division change) ──
        const lensGroup = new THREE.Group();
        scene.add(lensGroup);
        let builtDivision = -1;
        const rebuildDivision = (index: number) => {
            lensGroup.clear();
            const lens = CLOCK_LENSES[index % CLOCK_LENSES.length];
            for (let sect = 0; sect < lens.sections; sect++) {
                const a = clockAngle(sect * lens.slice);
                const tick = new THREE.Mesh(
                    new THREE.BoxGeometry(0.16, 0.01, 0.014),
                    new THREE.MeshBasicMaterial({ color: 0x9a8fb8 })
                );
                tick.position.set(Math.cos(a) * R_LENS, 0, -Math.sin(a) * R_LENS);
                tick.rotation.y = a;
                lensGroup.add(tick);
            }
            builtDivision = index;
        };
        const lensSegmentMarker = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xd48a9a })
        );
        lensSegmentMarker.visible = false;
        scene.add(lensSegmentMarker);

        // ── planet orbits (§5) — structure always; markers only with live data ──
        const latestSky: { live: (LivePlanet | undefined)[] } = { live: [] };
        const planetMarkers: THREE.Mesh[] = [];
        const planetChips: PlanetChip[] = [];
        for (let i = 0; i < PLANET_COUNT; i++) {
            const radius = R_ORBIT_BASE + i * R_ORBIT_STEP;
            scene.add(orbitLine(radius));
            // 30°-spaced degree ticks make each orbit a readable dial track
            scene.add(
                radialTicks(
                    Array.from({ length: 12 }, (_, k) => k * 30),
                    radius - 0.03,
                    radius + 0.03,
                    0x3a2c5c,
                    0.6
                )
            );
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(PLANET_MARKER_GEOMETRY_R, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xd0c69f, emissive: 0x8a7c4a, emissiveIntensity: 0.4 })
            );
            marker.visible = false;
            scene.add(marker);
            planetMarkers.push(marker);
            // the label chip: click publishes the selection, hover carries the
            // full kernel identity (E5 — meaning surfaced, never a bare dot)
            const chip = buildPlanetChip(i, () => {
                const live = latestSky.live[i];
                if (!live) {
                    return;
                }
                setSelectedPlanet(current => nextPlanetSelection(current, live));
                useCoordinateStore.getState().setSelected(planetSelectionAddress(i));
            });
            chip.object.visible = false;
            scene.add(chip.object);
            planetChips.push(chip);
        }

        // ── the zodiac/decan bezel (E5) — the wheel of signs framing the sky ──
        scene.add(bezelCircle(R_BEZEL_IN, 0x4d3e78, 0.85));
        scene.add(bezelCircle(R_BEZEL_OUT, 0x4d3e78, 0.5));
        scene.add(
            radialTicks(
                Array.from({ length: 360 }, (_, d) => d).filter(d => d % 10 !== 0),
                R_BEZEL_IN,
                R_BEZEL_IN + 0.12,
                0x2e2247,
                0.9
            )
        ); // 360 fine degree ticks
        scene.add(
            radialTicks(
                Array.from({ length: 36 }, (_, k) => k * 10).filter(d => d % 30 !== 0),
                R_BEZEL_IN,
                R_BEZEL_IN + 0.28,
                0x4d3e78,
                0.95
            )
        ); // 36 decan boundaries
        scene.add(
            radialTicks(
                Array.from({ length: 12 }, (_, k) => k * 30),
                R_BEZEL_IN,
                R_BEZEL_OUT,
                0x9a7fd4,
                0.9
            )
        ); // 12 sign cusps
        scene.add(radialTicks([0, 90, 180, 270], R_BEZEL_OUT, R_BEZEL_OUT + 0.24, 0xe0b45f, 0.9)); // cardinal cross
        for (let s = 0; s < 12; s++) {
            scene.add(
                planeLabel(
                    'zodiac-glyph',
                    ZODIAC_GLYPHS[s],
                    s * 30 + 15,
                    R_BEZEL_GLYPH,
                    0,
                    `${ZODIAC_NAMES[s]} — ${s * 30}°–${s * 30 + 30}°, decans ${s * 3}–${s * 3 + 2}`
                )
            );
        }

        // ── the carriers: this scene plugged into the ONE modulation graph ──

        const torusCarrier: ModulationCarrier = {
            id: carrierId('k2-torus'),
            layer: 'L0-base',
            requiredInputs: ['oscillator', 'klein'],
            onFrame(frame) {
                // torus orientation: the single primitive, straight off the graph
                torusGroup.rotation.z = frame.oscillator.sweepAngle;
                diamond.rotation.y = frame.oscillator.sweepAngle / 12;
                const fold = frame.klein.foldProgress;
                torusGroup.scale.y = fold <= 1 ? 1 - Math.sin(Math.PI * fold) * 0.85 : 1;
            }
        };

        const cymaticCarrier: ModulationCarrier = {
            id: carrierId('cymatic-skin'),
            layer: 'L1-cymatic',
            // DR-IG-5: the skin parameterises the K² torus, never a plate.
            surface: 'torus',
            requiredInputs: ['cymatic', 'oscillator', 'klein'],
            onFrame(frame) {
                if (!frame.cymatic) {
                    return;
                }
                uniforms.uM2Ready.value = 1;
                for (let i = 0; i < 8; i++) {
                    uniforms.uOctet.value[i] = frame.cymatic.octet[i] ?? 0;
                }
                for (let k = 0; k < 4; k++) {
                    uniforms.uNodalM.value[k] = frame.cymatic.quartet[k]?.m ?? 1;
                    uniforms.uNodalN.value[k] = frame.cymatic.quartet[k]?.n ?? 1;
                }
                uniforms.uValence.value = frame.klein.valence;
                uniforms.uPhase.value = frame.oscillator.sweepAngle / 2;
                uniforms.uShell.value = shellColour(frame.cymatic.lensAnchorIndex, frame.klein.valence);
                // the five silent constraint anchors on the chromatic 12-ring
                const anchors = frame.cymatic.silentAnchors;
                silentAnchorMarkers.forEach((marker, i) => {
                    const anchor = anchors?.[i];
                    marker.visible = anchor !== undefined;
                    if (anchor) {
                        const a = clockAngle((anchor.pitchClass / 12) * 360);
                        marker.position.set(Math.cos(a) * R_SILENT, 0, -Math.sin(a) * R_SILENT);
                    }
                });
            },
            onUnready() {
                uniforms.uM2Ready.value = 0; // §5.6 inline degradation, honestly
                silentAnchorMarkers.forEach(marker => {
                    marker.visible = false;
                });
            }
        };

        const codonCarrier: ModulationCarrier = {
            id: carrierId('codon-annulus'),
            layer: 'L2-codon',
            requiredInputs: ['codon', 'klein'],
            onFrame(frame) {
                if (!frame.codon) {
                    return;
                }
                activeCell.visible = true;
                const cAngle = codonAngle(frame.codon.codonId, frame.klein.axisFlipped);
                activeCell.position.set(Math.cos(cAngle) * 2.05, 0, Math.sin(cAngle) * 2.05);
            },
            onUnready() {
                activeCell.visible = false;
            }
        };

        const clockCarrier: ModulationCarrier = {
            id: carrierId('clock-strata'),
            requiredInputs: ['oscillator', 'division'],
            onFrame(frame) {
                const degree = frame.oscillator.degree360;
                if (degree === null || frame.division.segment === null) {
                    return;
                }
                needle.visible = true;
                degreeMarker.visible = true;
                lensSegmentMarker.visible = true;
                const a = clockAngle(degree);
                needle.rotation.y = a;
                needle.position.set(
                    Math.cos(a) * ((R_DEGREE - 0.6) / 2 + 0.6),
                    0,
                    -Math.sin(a) * ((R_DEGREE - 0.6) / 2 + 0.6)
                );
                degreeMarker.position.set(Math.cos(a) * R_DEGREE, 0, -Math.sin(a) * R_DEGREE);
                // the division re-gears the rendered ring (E2 engine half)
                if (builtDivision !== frame.division.index) {
                    rebuildDivision(frame.division.index);
                }
                // segment marker mid-segment — the KERNEL-carried tick when present
                const mid = clockAngle(
                    frame.division.segment * frame.division.slice + frame.division.slice / 2
                );
                lensSegmentMarker.position.set(Math.cos(mid) * R_LENS, 0, -Math.sin(mid) * R_LENS);
            },
            onUnready() {
                needle.visible = false;
                degreeMarker.visible = false;
                lensSegmentMarker.visible = false;
            }
        };

        const planetsCarrier: ModulationCarrier = {
            id: carrierId('kairos-sky'),
            requiredInputs: ['kairos'],
            onFrame(frame) {
                if (!frame.kairos) {
                    return;
                }
                // live degrees only, never invented; identity from the kernel
                // projection (element id, Keplerian velocity, §5.2 resonance)
                const { degrees, livePlanets } = frame.kairos;
                latestSky.live = livePlanets ?? [];

                // Track 35.T35.1: the live-Sun silver dot at its Level-0
                // Fibonacci-Ground position. Body 0 IS the Sun (PLANET_ORDER);
                // its degree is quantised to the 60-fold ground and placed on
                // the same R_DEGREE ring the natal gold ring rides — advancing
                // as the live Sun crosses each 6° wedge (dual of the gold ring).
                const sunGroundPosition = livePlanets?.find(
                    planet => planet.planetId === 0
                )?.fibonacciPosition;
                if (
                    typeof sunGroundPosition === 'number' &&
                    Number.isInteger(sunGroundPosition)
                ) {
                    const p = fibonacciGroundPoint(sunGroundPosition, R_DEGREE);
                    liveSunMarker.position.set(p.x, 0.08, p.z);
                    liveSunMarker.visible = true;
                } else {
                    liveSunMarker.visible = false;
                }
                planetMarkers.forEach((marker, i) => {
                    const d = degrees[i];
                    const chip = planetChips[i];
                    marker.visible = typeof d === 'number';
                    chip.object.visible = typeof d === 'number';
                    if (typeof d !== 'number') {
                        return;
                    }
                    const a = clockAngle(d);
                    const radius = R_ORBIT_BASE + i * R_ORBIT_STEP;
                    marker.position.set(Math.cos(a) * radius, 0, -Math.sin(a) * radius);
                    // the chip floats just outside its body along the same ray
                    chip.object.position.set(
                        Math.cos(a) * (radius + 0.32),
                        0.12,
                        -Math.sin(a) * (radius + 0.32)
                    );
                    const live = livePlanets?.[i];
                    // identity refresh only when the SKY moved (kairos cadence,
                    // never per animation frame) — the chip is engraved, not
                    // repainted. The gate key carries the flags too so an ℞
                    // flip at a station (body near-motionless) never goes
                    // stale behind the 0.1° text (E5 verifier finding).
                    const identityKey = `${d.toFixed(1)}°|${live?.retrograde ? 1 : 0}|${live?.isResonance ? 1 : 0}`;
                    if (chip.lastDegreeText !== identityKey) {
                        chip.lastDegreeText = identityKey;
                        chip.deg.textContent = `${d.toFixed(1)}°`;
                        if (live) {
                            const edge = elementCssColour(live.elementId);
                            chip.root.style.borderLeftColor = edge;
                            chip.glyph.style.color = edge;
                            chip.rx.style.display = live.retrograde ? '' : 'none';
                            chip.resonanceDot.style.display = live.isResonance ? '' : 'none';
                            chip.root.title = planetTooltip(live);
                        }
                    }
                    if (live) {
                        const material = marker.material as THREE.MeshStandardMaterial;
                        // explicit crossing into the [[M2-2]] Mahābhūta register
                        const mahabhuta = asMahabhuta(live.elementId);
                        const hue =
                            mahabhuta === null ? undefined : ELEMENT_COLOURS[mahabhuta];
                        if (typeof hue === 'number') {
                            material.color.setHex(hue);
                            material.emissive.setHex(hue);
                        }
                        const body =
                            planetBodyRadius(live.keplerianVel ?? 0) / PLANET_MARKER_GEOMETRY_R;
                        // the breath SUSPENDS while scrubbing/paused — a frozen
                        // frame shows a still body, never a wall-clock pulse
                        // (E5 verifier finding: nowMs advances under pause)
                        const pulse =
                            live.isResonance && frame.oscillator.live
                                ? resonancePulse(frame.nowMs)
                                : 1;
                        marker.scale.setScalar(body * pulse);
                        material.emissiveIntensity = live.isResonance
                            ? 0.4 + 0.5 * (pulse - 1) // §5.2: "at home" glows with the swell
                            : 0.35;
                        if (live.isResonance) {
                            chip.resonanceDot.style.opacity = String(
                                0.35 + (0.65 * (pulse - 1)) / 0.35
                            );
                        }
                    }
                });
            },
            onUnready() {
                latestSky.live = [];
                liveSunMarker.visible = false; // no live sky → no live-Sun dot
                planetMarkers.forEach(marker => {
                    marker.visible = false;
                });
                planetChips.forEach(chip => {
                    chip.object.visible = false;
                });
                setSelectedPlanet(null);
                // a dead sky also retires a published planet selection —
                // never leave a stale provisional address in the store
                const store = useCoordinateStore.getState();
                if (store.selected?.startsWith('planet:')) {
                    store.setSelected(null);
                }
            }
        };

        const quintessenceCarrier: ModulationCarrier = {
            id: carrierId('quintessence-ground'),
            requiredInputs: ['quintessence'],
            onFrame(frame) {
                if (!frame.quintessence) {
                    return;
                }
                const identity = frame.quintessence.identity;
                const natalGroundPosition = identity.natalFibonacciPosition;
                if (
                    typeof natalGroundPosition !== 'number' ||
                    !Number.isInteger(natalGroundPosition)
                ) {
                    natalMarker.visible = false;
                    natalChip.visible = false;
                    return;
                }
                natalMarker.visible = true;
                natalChip.visible = true;
                // Track 35.T35.1: the natal gold ring reads its STRUCTURAL
                // ground-position — the natal Sun degree folded onto its Level-0
                // Fibonacci-Ground wedge via the SAME fibonacciGroundPoint
                // projection the live-Sun silver dot rides (source §2.4 point 4).
                // Both Suns sit at their Fibonacci-positions; they coincide when
                // they share a 6° ground wedge — the distance is the reading.
                const natalPoint = fibonacciGroundPoint(natalGroundPosition, R_DEGREE);
                natalMarker.position.set(natalPoint.x, 0.05, natalPoint.z);
                const natalChipPoint = fibonacciGroundPoint(
                    natalGroundPosition,
                    R_DEGREE + 0.42
                );
                natalChip.position.set(natalChipPoint.x, 0.2, natalChipPoint.z);
                // engraved, not repainted: reading refreshes only when the
                // identity or the kernel resonance scalar moves
                const key = `${identity.natalDegree}|${identity.quintessenceWeight}|${identity.layerCount}|${frame.quintessence.resonance ?? 'pending'}`;
                if (natalIdentityKey !== key) {
                    natalIdentityKey = key;
                    natalChipEl.textContent = quintessenceChipText(identity);
                    natalChipEl.title = quintessenceTooltip(frame.quintessence);
                }
            },
            onUnready() {
                natalMarker.visible = false;
                natalChip.visible = false;
            }
        };

        rebuildDivision(modulationEngine.divisionIndex);

        let lastW = 0;
        let lastH = 0;
        const disposers = [
            modulationEngine.register(torusCarrier),
            modulationEngine.register(cymaticCarrier),
            modulationEngine.register(codonCarrier),
            modulationEngine.register(clockCarrier),
            modulationEngine.register(planetsCarrier),
            modulationEngine.register(quintessenceCarrier),
            modulationEngine.addRenderHook(() => {
                // 4.3: redraw the clock-field overlay only when a new
                // generation's state arrives (tick advance = perturbation)
                if (clockFieldRef.current !== drawnClockField) {
                    drawnClockField = clockFieldRef.current;
                    updateClockFieldOverlay(clockFieldParts, drawnClockField, R_ZODIAC);
                }
                const width = host.clientWidth;
                const height = host.clientHeight;
                if (width !== lastW || height !== lastH) {
                    renderer.setSize(width, height, false);
                    labelRenderer.setSize(width, height);
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    lastW = width;
                    lastH = height;
                }
                controls.update();
                renderer.render(scene, camera);
                labelRenderer.render(scene, camera);
            })
        ];
        // burn-nothing law: hidden pane skips carriers AND rendering
        modulationEngine.setVisibilityGate(() => host.clientWidth > 0 && host.clientHeight > 0);
        modulationEngine.start();

        return () => {
            disposers.forEach(dispose => dispose());
            modulationEngine.setVisibilityGate(null);
            modulationEngine.stop();
            controls.dispose();
            // release every GPU resource the scene created, not just the torus
            scene.traverse(obj => {
                const mesh = obj as Partial<THREE.Mesh & THREE.Line>;
                if (mesh.geometry) {
                    mesh.geometry.dispose();
                }
                if (mesh.material) {
                    for (const material of Array.isArray(mesh.material)
                        ? mesh.material
                        : [mesh.material]) {
                        material.dispose();
                    }
                }
            });
            renderer.dispose();
            if (renderer.domElement.parentElement === host) {
                host.removeChild(renderer.domElement);
            }
            if (labelRenderer.domElement.parentElement === host) {
                host.removeChild(labelRenderer.domElement);
            }
        };
    }, []);

    if (!webgl) {
        return (
            <div
                className="pane-message"
                data-testid="cosmic-engine-fallback"
                data-composition-mounted={compositionLoadResult.mounted ? 'true' : 'false'}
                data-surface-owner={ownerOfSlot(compositionLoadResult, 'surface')}
                data-texture-owner={ownerOfSlot(compositionLoadResult, 'texture')}
                data-cell-state-owner={ownerOfSlot(compositionLoadResult, 'cell-state')}
                data-composition-rejection={
                    compositionLoadResult.mounted ? '' : compositionLoadResult.rejection.reason
                }
            >
                WebGL unavailable — the cosmic clock needs a GPU surface.
                <span
                    data-testid="engine-integrated-readiness"
                    data-state={integratedReadiness.state}
                    data-blockers={integratedReadiness.blockerIds.join(',')}
                    data-conditional={integratedReadiness.conditionalPending.map(marker => marker.marker).join(',')}
                >
                    {formatIntegratedReadiness(integratedReadiness)}
                </span>
            </div>
        );
    }
    return (
        <div
            className="cosmic-engine"
            data-testid="cosmic-engine"
            data-level={level}
            data-m3-lens-ring-contract={m3LensRingProjection?.contractVersion ?? 'pending'}
            data-m3-lens-ring-generation={m3LensRingProjection?.profileGeneration ?? 'pending'}
            data-m3-lens-ring-cell={m3LensRingProjection?.cells[0]?.cellIndex ?? 'pending'}
            data-torus-knot-phase-p={torusKnotPhase?.p ?? 'pending-m1-topology'}
            data-torus-knot-phase-q={torusKnotPhase?.q ?? 'pending-m1-topology'}
            data-composition-mounted={compositionLoadResult.mounted ? 'true' : 'false'}
            data-surface-owner={ownerOfSlot(compositionLoadResult, 'surface')}
            data-texture-owner={ownerOfSlot(compositionLoadResult, 'texture')}
            data-cell-state-owner={ownerOfSlot(compositionLoadResult, 'cell-state')}
            data-composition-rejection={
                compositionLoadResult.mounted ? '' : compositionLoadResult.rejection.reason
            }
        >
            <div ref={hostRef} className="cosmic-engine-canvas" />
            {selectedPlanet ? (
                <aside className="planet-panel" data-testid="planet-panel">
                    <header>
                        <span
                            className="planet-panel-glyph"
                            style={{ color: elementCssColour(selectedPlanet.elementId) }}
                        >
                            {PLANET_GLYPHS[selectedPlanet.planetId ?? -1] ?? '·'}
                        </span>
                        <h3>{PLANET_ORDER[selectedPlanet.planetId ?? -1] ?? '—'}</h3>
                        {selectedPlanet.retrograde ? (
                            <span className="planet-panel-rx" title="retrograde">℞</span>
                        ) : null}
                        <button
                            type="button"
                            className="planet-panel-close"
                            data-testid="planet-panel-close"
                            onClick={() => setSelectedPlanet(null)}
                        >
                            ×
                        </button>
                    </header>
                    <dl>
                        <dt>degree</dt>
                        <dd>{(selectedPlanet.degree ?? 0).toFixed(3)}°</dd>
                        <dt>decan</dt>
                        <dd>
                            {typeof selectedPlanet.decan36 === 'number'
                                ? `${decanLabel(selectedPlanet.decan36)} (${selectedPlanet.decan36})`
                                : '—'}
                        </dd>
                        <dt>ruler</dt>
                        <dd>{PLANET_ORDER[selectedPlanet.decanRuler ?? -1] ?? '—'}</dd>
                        <dt>element</dt>
                        <dd>{ELEMENT_NAMES[selectedPlanet.elementId ?? -1] ?? '—'}</dd>
                        <dt>keplerian</dt>
                        <dd>{selectedPlanet.keplerianVel ?? '—'}</dd>
                    </dl>
                    {selectedPlanet.isResonance ? (
                        <p className="planet-panel-resonance">{resonanceMeaning(selectedPlanet)}</p>
                    ) : null}
                </aside>
            ) : null}
            <div className="cosmic-engine-strip">
                <span data-testid="engine-generation">⟳ {generation ?? '—'}</span>
                <span
                    data-testid="engine-integrated-readiness"
                    data-state={integratedReadiness.state}
                    data-blockers={integratedReadiness.blockerIds.join(',')}
                    data-conditional={integratedReadiness.conditionalPending.map(marker => marker.marker).join(',')}
                    title="Wave-A readiness against the live cached kernel profile; performance-event markers remain conditional until that stream is present"
                >
                    {formatIntegratedReadiness(integratedReadiness)}
                </span>
                <span>
                    {snapshot.chromatic?.note ?? '—'} · {snapshot.chromatic?.xPrimeNote ?? '—'} ·{' '}
                    {snapshot.chromatic?.mirrorNote ?? '—'}
                </span>
                <span
                    data-testid="engine-tonality"
                    title="the 84-state (lens, mode) tonality address — kernel labels, 12 lens-anchorings × 7 CF-modes"
                >
                    ♪{' '}
                    {snapshot.lensMode
                        ? `${snapshot.modeName ?? `CF${snapshot.lensMode.mode + 1}`} @ ${snapshot.chromatic?.note ?? snapshot.lensLabel ?? '—'} · 84:${snapshot.lensModeIndex ?? '—'}`
                        : '—'}
                </span>
                <span
                    data-testid="engine-clock-field"
                    data-aspect-edges={clockField.aspectEdges.length}
                    data-hop={clockField.hopEdge ? `${clockField.hopEdge.fromHexagram}>${clockField.hopEdge.toHexagram}` : 'pending'}
                    title="4.3 clock-field overlay: kernel aspect law (m2_aspect_between port) over bussed planet degrees + the 384 line-change hop edge (hexagram ⊕ line)"
                >
                    ⌁ {clockField.aspectEdges.length} aspects
                    {clockField.hopEdge ? ` · hop ${clockField.hopEdge.fromHexagram}→${clockField.hopEdge.toHexagram}` : ' · hop pending'}
                </span>
                <span
                    data-testid="engine-pentadic-overlay"
                    data-state={pentadic.state}
                    title="pentadic 0/1→5 hinge riding the 1-2-3 composition: M1 K² hinge+substrate · M2 72-index+5° quantum · M3 64-address+codon · 9₍M2₎=8₍M3₎+1₍M1₎ (Tranche 36.4; kernel trace, one generation, no local 72/64 conversion)"
                >
                    {pentadic.state === 'ready' && pentadic.m1 && pentadic.m2 && pentadic.m3
                        ? `⟠ M1 ${pentadic.m1.degree720}°→${pentadic.m1.advancementAddress64} · M2 72:${pentadic.m2.address72} phase ${pentadic.epogdoon?.blockPhase}/9 · M3 DET ${pentadic.m3.detReceptionAddress64} clock ${pentadic.m3.worldClockAddress64} ${pentadic.m3.codon} · loss ${pentadic.epogdoon?.roundTripLoss}`
                        : pentadic.state === 'stale-trace-generation'
                          ? '⟠ stale trace generation — rejected'
                          : '⟠ pending-anuttara-pentadic-trace'}
                </span>
                <details
                    className="engine-coupling-flow"
                    data-testid="engine-coupling-flow-overlay"
                    data-state={couplingFlow.state}
                >
                    <summary
                        title="Source-warranted coupling-flow evidence carried by the profile bus; the renderer computes no physics constants."
                    >
                        {couplingFlow.state === 'ready'
                            ? `⋈ ${couplingFlow.symbolicSkeletons[0]} · ${couplingFlow.measurementFaces[0]}`
                            : '⋈ pending-coupling-flow-alignment'}
                    </summary>
                    {couplingFlow.state === 'ready' ? (
                        <div className="engine-coupling-flow-detail">
                            <span data-testid="engine-coupling-symbolic">
                                symbolic skeleton: {couplingFlow.symbolicSkeletons.join(' · ')}
                            </span>
                            <span data-testid="engine-coupling-physics">
                                physics reference: {couplingFlow.physicsDescent.join(' → ')}
                            </span>
                            <span data-testid="engine-coupling-measurement">
                                measurement-face: {couplingFlow.measurementFaces.join(' · ')}
                            </span>
                            <span data-testid="engine-coupling-warrant">
                                source-warrant: {couplingFlow.recognitionWarrant}
                            </span>
                            <span data-testid="engine-coupling-caveat">
                                {couplingFlow.caveats.join(' · ')}
                            </span>
                        </div>
                    ) : null}
                </details>
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="engine-lens"
                    title={`cycle the 16 clock division apertures — carried tick source: ${divisionSource ?? 'awaiting profile'}`}
                    onClick={() => void commands.execute('engine.cycleDivision')}
                >
                    ⌖ {CLOCK_LENSES[divisionIndex].name} ({CLOCK_LENSES[divisionIndex].sections})
                    {divisionSource === 'local' ? ' ·local' : ''}
                </button>
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="engine-ground-gearing"
                    data-pisano-digit={fibGround ? fibGround.digit : ''}
                    data-ground-position={fibGround ? fibGround.position : ''}
                    title={
                        fibGround
                            ? `Fibonacci Ground gearing — the +1 Level-0 aperture as 60-fold rhythm (never a 17th lens). Kernel tick ground: position ${fibGround.position}/60, Pisano digit φ${fibGround.digit} (phase_space.rs pisano60_digit, consumed off the wire).`
                            : 'Fibonacci Ground gearing — the +1 Level-0 aperture as 60-fold rhythm (never a 17th lens)'
                    }
                    onClick={() => void commands.execute('engine.toggleGroundGearing')}
                >
                    {groundGearing ? '⌗ ground ×60' : '⌗ ground'}
                    {fibGround ? ` · ${fibGround.label}` : ''}
                </button>
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="engine-pause"
                    title="pause / resume the choreography (space) — the kernel tick keeps recording"
                    onClick={() => void commands.execute('engine.pauseToggle')}
                >
                    {paused ? '▶ resume' : '⏸ pause'}
                </button>
                {paused ? (
                    <span data-testid="engine-scrub">
                        <button
                            type="button"
                            className="instrument-toggle"
                            data-testid="engine-step-back"
                            onClick={() => void commands.execute('engine.stepBack')}
                        >
                            ◂
                        </button>
                        {' '}⟳ {scrubGeneration ?? '—'}{' '}
                        <button
                            type="button"
                            className="instrument-toggle"
                            data-testid="engine-step-forward"
                            onClick={() => void commands.execute('engine.stepForward')}
                        >
                            ▸
                        </button>
                    </span>
                ) : null}
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="engine-instrument-toggle"
                    onClick={() => void commands.execute('instrument.toggleMute')}
                >
                    {muted ? '𝄽 unmute' : '♪ sounding'}
                </button>
                {kairosTier.label ? (
                    <span
                        data-testid="engine-kairos-mode"
                        data-mode={kairosTier.mode ?? 'pending'}
                        title="the live-sky tier the S3 heartbeat resolved — kairotic > realtime precedence (kernel m4_planet_degrees_live). A kairotic oracle-consultation capture (epi nara kairos capture) preempts the daily transit for 4h, then decays back to realtime."
                    >
                        {kairosTier.label}
                    </span>
                ) : null}
                {!kairosLive ? <span className="engine-degradation">kairos pending — orbits structural</span> : null}
                {environment ? (
                    <span
                        data-testid="engine-environment"
                        data-state={environment.state}
                        title="the ambient environmental transform (DR-ENV-1/8) the S3 heartbeat composed onto the PASU base — the collective sky's slow forces aspected against the natal invariant. 'calm' is the identity rotation (no ambient influence); an ambient wind rotates the base without ever becoming q_identity (no collapse)."
                    >
                        {environment.label}
                    </span>
                ) : (
                    <span className="engine-degradation" data-testid="engine-environment-pending">
                        environment pending
                    </span>
                )}
                {level !== 'ready_full' ? (
                    <span className="engine-degradation" data-testid="engine-degradation">
                        {level.replace(/_/g, ' ')}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
