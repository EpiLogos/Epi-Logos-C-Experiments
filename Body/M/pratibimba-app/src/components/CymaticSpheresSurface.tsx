/**
 * Coordinate: M' M2-5' (daily-0-1 solar-chakral cymatic anchor)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): third Layer C cymatic surface.
 * Actualises: eight concentric chakra spheres with profile-resolved spherical
 *   harmonic modes around the Earth-Sun pair and active planetary-hour ruler.
 * Public surface: CymaticSpheresSurface, parseCymaticSpheresProjection,
 *   buildCymaticSpheresScene.
 * Does NOT own: chakra/planet identities, active-ruler routing, Kerykeion,
 *   generation timing, or correspondence LUTs.
 * Contract: [[M2-ARCHITECTURE]] §5.3.2; [[M2'-SPEC]] §9.5; [[DR-M2-1]].
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type {
    CymaticPlanetAnchorBoundary,
    CymaticSphereChakraBoundary,
    CymaticSphereHarmonicBoundary,
    CymaticSpheresProjectionBoundary
} from '../bridge/types';
import { ELEMENT_COLOURS } from '../engine/cosmicMath';

export type CymaticSphereHarmonic = CymaticSphereHarmonicBoundary;
export type CymaticSphereChakra = CymaticSphereChakraBoundary;
export type CymaticPlanetAnchor = CymaticPlanetAnchorBoundary;
export type CymaticSpheresProjection = CymaticSpheresProjectionBoundary;

interface CymaticSpheresSurfaceProps {
    readonly profile: Readonly<Record<string, unknown>> | null;
    readonly generation: number | null;
}

const EXPECTED_CHAKRA_PROVENANCE =
    'M2_CHAKRA_LUT[8] + profile audioOctet/nodalQuartet';
const EXPECTED_PLANET_PROVENANCE = 'M2_PLANET_LUT[10] + Kerykeion live sky';

function recordOrNull(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function finite(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function integerIn(value: unknown, min: number, max: number): value is number {
    return finite(value) && Number.isInteger(value) && value >= min && value <= max;
}

function parsePlanet(value: unknown): CymaticPlanetAnchor | null {
    const row = recordOrNull(value);
    if (
        !row ||
        !integerIn(row.planetId, 0, 9) ||
        typeof row.name !== 'string' ||
        row.name.length === 0 ||
        !finite(row.degree) ||
        row.degree < 0 ||
        row.degree >= 360 ||
        typeof row.retrograde !== 'boolean' ||
        !integerIn(row.elementId, 0, 4) || // [[M2-2]] Mahābhūta register (M2_PLANET_LUT mirror)
        row.provenance !== EXPECTED_PLANET_PROVENANCE
    ) {
        return null;
    }
    return row as unknown as CymaticPlanetAnchor;
}

export function parseCymaticSpheresProjection(
    profile: Readonly<Record<string, unknown>> | null
): CymaticSpheresProjection | null {
    const harmonicProfile = recordOrNull(profile?.harmonicProfile) ?? profile;
    const raw = recordOrNull(harmonicProfile?.cymaticSpheres);
    const earth = recordOrNull(raw?.earthObserver);
    const chakraRows = Array.isArray(raw?.chakras) ? raw.chakras : null;
    const sun = parsePlanet(raw?.sun);
    const activePlanet = parsePlanet(raw?.activePlanet);
    if (
        !raw ||
        !chakraRows ||
        chakraRows.length !== 8 ||
        !earth ||
        earth.ordinal !== 10 ||
        earth.name !== 'Earth' ||
        earth.role !== 'observer-centre' ||
        !Array.isArray(earth.position) ||
        earth.position.length !== 3 ||
        earth.position.some(value => value !== 0) ||
        typeof earth.provenance !== 'string' ||
        sun?.planetId !== 0 ||
        !activePlanet ||
        raw.epogdoonRatio !== '9:8' ||
        typeof raw.provenance !== 'string'
    ) {
        return null;
    }

    const chakras: CymaticSphereChakra[] = [];
    for (let index = 0; index < chakraRows.length; index += 1) {
        const row = recordOrNull(chakraRows[index]);
        const harmonic = recordOrNull(row?.harmonic);
        if (
            !row ||
            row.chakraId !== index ||
            typeof row.name !== 'string' ||
            row.name.length === 0 ||
            // [[M2-2]] Mahābhūta register — the chakra↔tattva body
            // (M2_CHAKRA_LUT mirror; null = 0xff for Ajna/Sahasrara).
            !(row.elementId === null || integerIn(row.elementId, 0, 4)) ||
            !(row.tattvaIndex === null || integerIn(row.tattvaIndex, 0, 35)) ||
            row.meaningId !== 0x0380 + index ||
            row.provenance !== EXPECTED_CHAKRA_PROVENANCE ||
            !harmonic ||
            !integerIn(harmonic.degree, 1, 16) ||
            !integerIn(harmonic.order, 0, harmonic.degree) ||
            !finite(harmonic.amplitudeHz) ||
            harmonic.amplitudeHz <= 0 ||
            !integerIn(harmonic.qlPosition, 0, 5) ||
            (harmonic.helix !== 'bimba' && harmonic.helix !== 'pratibimba')
        ) {
            return null;
        }
        chakras.push(row as unknown as CymaticSphereChakra);
    }

    return {
        chakras,
        earthObserver: earth as unknown as CymaticSpheresProjection['earthObserver'],
        sun,
        activePlanet,
        epogdoonRatio: '9:8',
        provenance: raw.provenance as string
    };
}

function factorial(value: number): number {
    let result = 1;
    for (let i = 2; i <= value; i += 1) {
        result *= i;
    }
    return result;
}

function associatedLegendre(degree: number, order: number, x: number): number {
    let pmm = 1;
    if (order > 0) {
        const root = Math.sqrt(Math.max(0, 1 - x * x));
        let factor = 1;
        for (let i = 1; i <= order; i += 1) {
            pmm *= -factor * root;
            factor += 2;
        }
    }
    if (degree === order) {
        return pmm;
    }
    let previous = pmm;
    let current = x * (2 * order + 1) * pmm;
    if (degree === order + 1) {
        return current;
    }
    for (let l = order + 2; l <= degree; l += 1) {
        const next =
            ((2 * l - 1) * x * current - (l + order - 1) * previous) /
            (l - order);
        previous = current;
        current = next;
    }
    return current;
}

function realSphericalHarmonic(
    degree: number,
    order: number,
    theta: number,
    phi: number
): number {
    const normalization = Math.sqrt(
        ((2 * degree + 1) / (4 * Math.PI)) *
            (factorial(degree - order) / factorial(degree + order))
    );
    const legendre = associatedLegendre(degree, order, Math.cos(theta));
    return normalization * legendre * Math.cos(order * phi);
}

function deformedSphere(
    radius: number,
    harmonic: CymaticSphereHarmonic
): THREE.SphereGeometry {
    const geometry = new THREE.SphereGeometry(radius, 48, 32);
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const amplitude = 0.06 + Math.min(0.14, harmonic.amplitudeHz / 2400);
    const point = new THREE.Vector3();
    for (let index = 0; index < position.count; index += 1) {
        point.fromBufferAttribute(position, index);
        const length = point.length() || 1;
        const theta = Math.acos(THREE.MathUtils.clamp(point.y / length, -1, 1));
        const phi = Math.atan2(point.z, point.x);
        const mode = realSphericalHarmonic(
            harmonic.degree,
            harmonic.order,
            theta,
            phi
        );
        point.multiplyScalar((radius * (1 + amplitude * mode)) / length);
        position.setXYZ(index, point.x, point.y, point.z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
}

function anchorPosition(degree: number, radius: number): THREE.Vector3 {
    const angle = THREE.MathUtils.degToRad(90 - degree);
    return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
}

function anchorBody(
    radius: number,
    color: number,
    position: THREE.Vector3,
    name: string
): THREE.Mesh {
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 24),
        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.18,
            roughness: 0.38,
            metalness: 0.08
        })
    );
    body.name = name;
    body.position.copy(position);
    return body;
}

function connection(to: THREE.Vector3, color: number): THREE.Line {
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), to]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.62 })
    );
}

export function buildCymaticSpheresScene(
    projection: CymaticSpheresProjection
): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0d);
    scene.add(new THREE.HemisphereLight(0xf4efe5, 0x18213a, 1.45));
    const key = new THREE.DirectionalLight(0xffd39b, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);

    const sphereGroup = new THREE.Group();
    sphereGroup.name = 'chakra-spheres';
    projection.chakras.forEach((chakra, index) => {
        const color =
            chakra.elementId === null
                ? index === 0
                    ? 0xe6e2d8
                    : 0xd4af67
                : (ELEMENT_COLOURS[chakra.elementId] ?? 0xb8bec9);
        const mesh = new THREE.Mesh(
            deformedSphere(0.52 + index * 0.24, chakra.harmonic),
            new THREE.MeshPhysicalMaterial({
                color,
                transparent: true,
                opacity: 0.12 + index * 0.018,
                side: THREE.DoubleSide,
                wireframe: index % 2 === 1,
                roughness: 0.52,
                metalness: 0.08,
                depthWrite: false
            })
        );
        mesh.name = `chakra-sphere-${chakra.chakraId}`;
        mesh.userData = {
            chakraId: chakra.chakraId,
            harmonicDegree: chakra.harmonic.degree,
            harmonicOrder: chakra.harmonic.order,
            provenance: chakra.provenance
        };
        sphereGroup.add(mesh);
    });
    scene.add(sphereGroup);

    const earthPosition = new THREE.Vector3(...projection.earthObserver.position);
    const sunPosition = anchorPosition(projection.sun.degree, 0.34);
    const activePosition = anchorPosition(
        projection.activePlanet.degree,
        2.72
    );
    scene.add(anchorBody(0.13, 0x89a8bd, earthPosition, 'earth-observer-centre'));
    scene.add(anchorBody(0.1, 0xffcf66, sunPosition, 'sun-anchor'));
    const activeColor =
        ELEMENT_COLOURS[projection.activePlanet.elementId] ?? 0xf2f0ea;
    const activeBody = anchorBody(
        0.12,
        activeColor,
        activePosition,
        `active-planet-${projection.activePlanet.planetId}`
    );
    activeBody.userData = {
        planetId: projection.activePlanet.planetId,
        provenance: projection.activePlanet.provenance
    };
    scene.add(activeBody);
    scene.add(connection(sunPosition, 0xffcf66));
    scene.add(connection(activePosition, activeColor));
    return scene;
}

function disposeScene(scene: THREE.Scene): void {
    scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
            materials.forEach(material => material.dispose());
        }
    });
}

export function CymaticSpheresSurface({
    profile,
    generation
}: CymaticSpheresSurfaceProps) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const [webglBlocked, setWebglBlocked] = useState(false);
    const projection = useMemo(
        () => parseCymaticSpheresProjection(profile),
        [profile]
    );
    const projectionReady = projection !== null && generation !== null;

    useEffect(() => {
        const host = hostRef.current;
        if (!host || !projectionReady) {
            return;
        }
        let renderer: THREE.WebGLRenderer | null = null;
        let resize: (() => void) | null = null;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: true
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            host.replaceChildren(renderer.domElement);
            const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
            camera.position.set(0, 1.05, 7.3);
            camera.lookAt(0, 0, 0);
            rendererRef.current = renderer;
            cameraRef.current = camera;
            resize = () => {
                const scene = sceneRef.current;
                if (!renderer || !scene) {
                    return;
                }
                const width = Math.max(1, host.clientWidth);
                const height = Math.max(1, host.clientHeight);
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
            };
            window.addEventListener('resize', resize);
            setWebglBlocked(false);
        } catch {
            setWebglBlocked(true);
        }
        return () => {
            if (resize) {
                window.removeEventListener('resize', resize);
            }
            if (renderer) {
                renderer.dispose();
                renderer.domElement.remove();
            }
            rendererRef.current = null;
            cameraRef.current = null;
        };
    }, [projectionReady]);

    useEffect(() => {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        const host = hostRef.current;
        if (!renderer || !camera || !host || !projection || generation === null) {
            return;
        }
        const scene = buildCymaticSpheresScene(projection);
        sceneRef.current = scene;
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        return () => {
            if (sceneRef.current === scene) {
                sceneRef.current = null;
            }
            disposeScene(scene);
        };
    }, [generation, projection]);

    if (!projection || generation === null) {
        return (
            <div
                className="m2-cymatic-spheres-state"
                data-testid="cymatic-spheres-blocked"
                data-state="blocked"
                data-provenance="profile.harmonicProfile.cymaticSpheres"
            >
                <strong>solar-chakral projection blocked</strong>
                <span>
                    awaiting eight M2_CHAKRA_LUT rows, Earth observer centre,
                    and the F_routing planetary-hour ruler
                </span>
            </div>
        );
    }

    return (
        <section
            className="m2-cymatic-spheres"
            data-testid="cymatic-spheres"
            data-surface-variant="spheres"
            data-generation={generation}
            data-active-planet-id={projection.activePlanet.planetId}
            data-active-planet={projection.activePlanet.name}
            data-provenance={projection.provenance}
            data-state={webglBlocked ? 'blocked-webgl' : 'ready'}
        >
            <div
                ref={hostRef}
                className="m2-cymatic-spheres-canvas"
                data-testid="cymatic-spheres-canvas"
            />
            {webglBlocked ? (
                <div
                    className="m2-cymatic-spheres-webgl"
                    data-testid="cymatic-spheres-webgl-blocked"
                >
                    WebGL unavailable; the canonical projection is present but
                    its 3D carrier is blocked.
                </div>
            ) : null}
            <header className="m2-cymatic-spheres-readout">
                <strong>Earth / Sun / {projection.activePlanet.name}</strong>
                <span>
                    generation {generation} · active planetary hour ·{' '}
                    {projection.epogdoonRatio}
                </span>
            </header>
            <ol className="m2-cymatic-spheres-legend" aria-label="chakra spheres">
                {projection.chakras.map(chakra => (
                    <li
                        key={chakra.chakraId}
                        data-testid="cymatic-chakra-sphere"
                        data-chakra-id={chakra.chakraId}
                        data-harmonic={`${chakra.harmonic.degree}:${chakra.harmonic.order}`}
                    >
                        <span>{chakra.name}</span>
                        <small>
                            Y{chakra.harmonic.degree},{chakra.harmonic.order} ·{' '}
                            {chakra.harmonic.amplitudeHz.toFixed(1)} Hz
                        </small>
                    </li>
                ))}
            </ol>
        </section>
    );
}
