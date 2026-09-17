import * as React from 'react';
import {
    renderCymaticChladniSurfacePixels,
    type CymaticChladniSurfacePixels,
    type CymaticChladniSurfaceRenderInput
} from '../../common/cymatic-chladni';

export interface CymaticChladniSurfaceProps extends CymaticChladniSurfaceRenderInput {
    readonly className?: string;
}

// Coarse grid used by the deterministic SVG fallback when a 2D canvas context
// is unavailable (SSR, headless render, or a browser that denies the context).
const FALLBACK_GRID = 24;

export function CymaticChladniSurface(props: CymaticChladniSurfaceProps): React.ReactElement {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const [canvasSupported, setCanvasSupported] = React.useState<boolean>(true);
    const rendered = React.useMemo(
        () => renderCymaticChladniSurfacePixels(props),
        [props.frame, props.width, props.height, props.surfaceVariant, props.tick]
    );
    const className = ['m2-cymatic-chladni-surface', props.className].filter(Boolean).join(' ');

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) {
            setCanvasSupported(false);
            return;
        }
        setCanvasSupported(true);

        const image = context.createImageData(rendered.width, rendered.height);
        image.data.set(rendered.rgba);
        context.putImageData(image, 0, 0);
    }, [rendered]);

    return (
        <figure
            className={className}
            data-cymatic-chladni-surface="plate"
            data-surface-variant={props.surfaceVariant ?? 'plate'}
            data-render-mode={canvasSupported ? 'canvas' : 'svg'}
            data-address72={props.frame.address72}
            data-sample-count={props.frame.sampleCount}
            data-canvas-byte-hash={rendered.byteHash}
            data-render-width={rendered.width}
            data-render-height={rendered.height}
        >
            <canvas
                ref={canvasRef}
                width={rendered.width}
                height={rendered.height}
                hidden={!canvasSupported}
                aria-label={`M2 cymatic Chladni plate at 72-address ${props.frame.address72}`}
            />
            {!canvasSupported && (
                <CymaticChladniSurfaceSvgFallback rendered={rendered} address72={props.frame.address72} />
            )}
            <figcaption className="m2-cymatic-chladni-surface__caption">
                <span data-held-tick={props.tick ?? ''}>tick {props.tick ?? 'live'}</span>
                <span>{props.frame.sampleCount} deterministic samples</span>
            </figcaption>
        </figure>
    );
}

// Deterministic SVG mirror of the canvas chi-field. Reuses the exact rgba bytes
// produced by renderCymaticChladniSurfacePixels, downsampled onto a coarse grid
// so the plate's nodal structure survives even without a raster context.
function CymaticChladniSurfaceSvgFallback(props: {
    readonly rendered: CymaticChladniSurfacePixels;
    readonly address72: number;
}): React.ReactElement {
    const { rendered, address72 } = props;
    const cells: React.ReactElement[] = [];
    const stepX = Math.max(1, Math.floor(rendered.width / FALLBACK_GRID));
    const stepY = Math.max(1, Math.floor(rendered.height / FALLBACK_GRID));

    for (let gy = 0; gy < FALLBACK_GRID; gy += 1) {
        const sampleY = Math.min(rendered.height - 1, gy * stepY);
        for (let gx = 0; gx < FALLBACK_GRID; gx += 1) {
            const sampleX = Math.min(rendered.width - 1, gx * stepX);
            const offset = (sampleY * rendered.width + sampleX) * 4;
            const r = rendered.rgba[offset];
            const g = rendered.rgba[offset + 1];
            const b = rendered.rgba[offset + 2];
            cells.push(
                <rect
                    key={`${gx}-${gy}`}
                    x={gx}
                    y={gy}
                    width={1}
                    height={1}
                    fill={`rgb(${r},${g},${b})`}
                />
            );
        }
    }

    return (
        <svg
            className="m2-cymatic-chladni-surface__svg-fallback"
            viewBox={`0 0 ${FALLBACK_GRID} ${FALLBACK_GRID}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`M2 cymatic Chladni plate (SVG fallback) at 72-address ${address72}`}
            shapeRendering="crispEdges"
        >
            {cells}
        </svg>
    );
}

export { renderCymaticChladniSurfacePixels } from '../../common/cymatic-chladni';
