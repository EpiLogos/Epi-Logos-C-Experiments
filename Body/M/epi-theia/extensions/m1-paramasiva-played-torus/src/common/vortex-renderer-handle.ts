import { PlayedTorusFrame } from './played-torus-surface';

export interface VortexRendererHandle {
    readonly renderer: 'bevy-wgpu';
    mount(canvas: HTMLCanvasElement): void;
    update(frame: PlayedTorusFrame): void;
    dispose(): void;
}

export class BrowserVortexRendererHandle implements VortexRendererHandle {
    readonly renderer = 'bevy-wgpu';
    private canvas: HTMLCanvasElement | null = null;
    private latestFrame: PlayedTorusFrame | null = null;

    mount(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.canvas.dataset.renderer = this.renderer;
        if (this.latestFrame) {
            this.paintContractFrame(this.latestFrame);
        }
    }

    update(frame: PlayedTorusFrame): void {
        this.latestFrame = frame;
        this.paintContractFrame(frame);
    }

    dispose(): void {
        if (this.canvas) {
            delete this.canvas.dataset.renderer;
        }
        this.canvas = null;
        this.latestFrame = null;
    }

    private paintContractFrame(frame: PlayedTorusFrame): void {
        if (!this.canvas) {
            return;
        }
        this.canvas.dataset.surface = frame.topology.surface;
        this.canvas.dataset.boundary = frame.topology.boundary;
        this.canvas.dataset.profileGeneration = String(frame.profileGeneration ?? 'pending');
        this.canvas.dataset.activeCellValueSource = frame.rendererInput.activeCellValueSource ?? 'pending';
    }
}
