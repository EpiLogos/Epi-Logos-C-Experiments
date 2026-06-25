import * as React from 'react';
import {
    renderCymaticChladniSurfacePixels,
    type CymaticChladniSurfaceRenderInput
} from '../../common/cymatic-chladni';

export interface CymaticChladniSurfaceProps extends CymaticChladniSurfaceRenderInput {
    readonly className?: string;
}

export function CymaticChladniSurface(props: CymaticChladniSurfaceProps): React.ReactElement {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const rendered = React.useMemo(
        () => renderCymaticChladniSurfacePixels(props),
        [props.frame, props.width, props.height, props.surfaceVariant, props.tick]
    );
    const className = ['m2-cymatic-chladni-surface', props.className].filter(Boolean).join(' ');

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const image = context.createImageData(rendered.width, rendered.height);
        image.data.set(rendered.rgba);
        context.putImageData(image, 0, 0);
    }, [rendered]);

    return (
        <figure
            className={className}
            data-cymatic-chladni-surface="plate"
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
                aria-label={`M2 cymatic Chladni plate at 72-address ${props.frame.address72}`}
            />
            <figcaption className="m2-cymatic-chladni-surface__caption">
                <span data-held-tick={props.tick ?? ''}>tick {props.tick ?? 'live'}</span>
                <span>{props.frame.sampleCount} deterministic samples</span>
            </figcaption>
        </figure>
    );
}

export { renderCymaticChladniSurfacePixels } from '../../common/cymatic-chladni';
