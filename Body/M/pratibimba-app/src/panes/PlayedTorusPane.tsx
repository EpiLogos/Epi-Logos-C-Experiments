/**
 * Coordinate: M' M1' (played-torus widget body — Track 02.T2.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.playedTorus` editor-area surface — mounts
 *   the three.js played-torus scene (playedTorusScene.ts) and applies each
 *   profile generation's view model (m1PlayedTorus.ts) as it arrives on the
 *   bus. Readiness chrome per the frozen ARCHITECTURE.md: `pending-ananda-vortex`
 *   blocked overlay, `pending-audio-octet` and `pending-klein-flip` badges —
 *   no silent degradation, no local fallback animation. The WebGL mounting
 *   pattern (renderer/controls/resize/dispose) is cribbed-as-new-code from
 *   CosmicEngine.tsx (provenance), re-verified against this pane's tests.
 * Does NOT own: scene construction law (playedTorusScene), view-model law
 *   (m1PlayedTorus), the profile cache, gateway I/O, flexlayout.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTickStore } from '../state/stores';
import { buildPlayedTorusView, PlayedTorusViewModel } from './m1PlayedTorus';
import { buildPlayedTorusScene, updatePlayedTorusScene } from './playedTorusScene';

function faceText(raw: number | null, dr: number | null): string {
    const rawText = raw === null ? '—' : String(raw);
    const drText = dr === null ? '—' : String(dr);
    return `raw ${rawText} · dr ${drText}`;
}

export function PlayedTorusPane() {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [webgl, setWebgl] = useState(true);
    const cached = useTickStore(s => s.profile);

    const view: PlayedTorusViewModel | null = useMemo(() => {
        if (!cached) {
            return null;
        }
        return buildPlayedTorusView({
            payload: (cached.profile as Record<string, unknown> | null) ?? {},
            generation: cached.generation
        });
    }, [cached]);
    const viewRef = useRef<PlayedTorusViewModel | null>(null);
    viewRef.current = view;

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

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
        camera.position.set(0, 3.4, 5.2);
        camera.lookAt(0, 0, 0);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 1.6;
        controls.maxDistance = 24;
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 0.7);
        key.position.set(3, 6, 4);
        scene.add(key);

        const parts = buildPlayedTorusScene();
        scene.add(parts.root);

        const resize = () => {
            const width = host.clientWidth || 1;
            const height = host.clientHeight || 1;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(host);

        let frame = 0;
        const animate = () => {
            frame = requestAnimationFrame(animate);
            const current = viewRef.current;
            if (current) {
                updatePlayedTorusScene(parts, current);
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            controls.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    if (!webgl) {
        return (
            <div className="pane-message" data-testid="m1-played-torus-fallback">
                WebGL unavailable — the played-torus needs a live GPU context.
            </div>
        );
    }

    const vortex = view?.vortex ?? null;
    const state = view?.vortexState ?? 'pending-ananda-vortex';

    return (
        <div
            className="played-torus-pane"
            data-testid="m1-played-torus"
            data-vortex-state={state}
            style={{ position: 'relative', width: '100%', height: '100%' }}
        >
            <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
            <div
                className="played-torus-chrome"
                style={{ position: 'absolute', top: 8, left: 10, pointerEvents: 'none' }}
            >
                {vortex ? (
                    <span data-testid="m1-played-torus-cell">
                        family {vortex.activeMatrixOp} · cell ({vortex.activeCell[0]},
                        {vortex.activeCell[1]}) ·{' '}
                        {faceText(vortex.activeCellValue.rawValue, vortex.activeCellValue.drValue)}
                    </span>
                ) : (
                    <span data-testid="m1-played-torus-blocked">
                        pending-ananda-vortex — the K² renders; the vortex heatmap stays
                        blocked until the bus carries the Tranche 10.10 projection.
                    </span>
                )}
                {view && view.audioOctet === null ? (
                    <span data-testid="m1-played-torus-pending-audio"> · pending-audio-octet</span>
                ) : null}
                {view && !view.kleinFlipReady ? (
                    <span data-testid="m1-played-torus-pending-klein"> · pending-klein-flip</span>
                ) : null}
            </div>
        </div>
    );
}
