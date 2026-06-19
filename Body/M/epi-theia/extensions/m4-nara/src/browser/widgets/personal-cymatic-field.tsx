import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    MExtensionMiniMode,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';
import {
    DEFAULT_TIME_AXIS_MODE,
    TIME_AXIS_FOREGROUND_EVENT_TYPE,
    TimeAxisMode,
    buildTimeAxisState,
    handlesFromProfile,
    normalizeTimeAxisMode
} from './time-axis-switcher';

export const PERSONAL_CYMATIC_FIELD_VIEW_ID = 'm4.nara.personalField';
export const PERSONAL_CYMATIC_FIELD_LABEL = 'M4 Personal Cymatic Field';
export const M4_PERSONAL_CYMATIC_FIELD_EXPORT = 'M4PersonalCymaticField' as const;
export const PERSONAL_CYMATIC_FIELD_RPC_METHOD = 'nara.field.handle';
export const PERSONAL_CYMATIC_FIELD_OPEN_COMMAND_ID = `${EXTENSION_ID}.openPersonalCymaticField`;
export const PERSONAL_CYMATIC_FIELD_PRIVACY_CHROME = 'mext-privacy-protected-local-handle-only';

export type PersonalCymaticRendererStatus = 'pending' | 'requesting' | 'attached' | 'fallback' | 'error';
export type DipyramidNodeId =
    | 'P5'
    | 'P1'
    | 'P2'
    | 'P3'
    | 'P4'
    | 'P0'
    | "P0'"
    | "P1'"
    | "P2'"
    | "P3'"
    | "P4'"
    | "P5'";

export interface DipyramidNode {
    readonly id: DipyramidNodeId;
    readonly role: 'apex' | 'top-base' | 'axis' | 'inverted-base';
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

export interface HopfToricLink {
    readonly id: string;
    readonly linkGroup: 'day' | 'night';
    readonly majorRadius: number;
    readonly minorRadius: number;
    readonly phaseTurn: number;
    readonly windsApexAxis: true;
}

export interface PersonalCymaticScene {
    readonly law: 'DR-IG-6';
    readonly nodes: readonly DipyramidNode[];
    readonly toricLinks: readonly HopfToricLink[];
}

export interface PersonalCymaticFieldModel {
    readonly sessionKey: string;
    readonly foregroundedHandle: string;
    readonly rendererStatus: PersonalCymaticRendererStatus;
    readonly scene: PersonalCymaticScene;
    readonly errorMessage?: string | null;
}

export type PersonalCymaticFieldRpcParams = Readonly<Record<'sessionKey' | 'foregroundedHandle', string>>;

export interface M4PersonalCymaticFieldProps {
    readonly model: PersonalCymaticFieldModel;
    readonly mode?: MExtensionMiniMode;
    readonly canvasRef?: (canvas: HTMLCanvasElement | null) => void;
}

interface RendererAttachResult {
    readonly attached: boolean;
    readonly dispose: () => void;
}

type RendererCanvasMethod = (
    canvas: HTMLCanvasElement,
    params: PersonalCymaticFieldRpcParams
) => unknown;

type RendererUpdateMethod = (paramsOrHandle: PersonalCymaticFieldRpcParams | string) => unknown;

export const DR_IG_6_DIPYRAMID_NODES: readonly DipyramidNode[] = Object.freeze([
    freezeNode('P5', 'apex', 0, -1, 1),
    freezeNode('P1', 'top-base', Math.SQRT1_2, -0.34, 0.34),
    freezeNode('P2', 'top-base', 0, -0.34, 0.78),
    freezeNode('P3', 'top-base', -Math.SQRT1_2, -0.34, 0.34),
    freezeNode('P4', 'top-base', 0, -0.34, -0.78),
    freezeNode('P0', 'axis', 0, 0, 0.08),
    freezeNode("P0'", 'axis', 0, 0, -0.08),
    freezeNode("P1'", 'inverted-base', 0, 0.34, 0.78),
    freezeNode("P2'", 'inverted-base', -Math.SQRT1_2, 0.34, 0.34),
    freezeNode("P3'", 'inverted-base', 0, 0.34, -0.78),
    freezeNode("P4'", 'inverted-base', Math.SQRT1_2, 0.34, 0.34),
    freezeNode("P5'", 'apex', 0, 1, -1)
]);

export const HOPF_LINKED_TORI: readonly HopfToricLink[] = Object.freeze([
    Object.freeze({
        id: 'hopf-torus-day',
        linkGroup: 'day',
        majorRadius: 0.62,
        minorRadius: 0.16,
        phaseTurn: 0,
        windsApexAxis: true as const
    }),
    Object.freeze({
        id: 'hopf-torus-night',
        linkGroup: 'night',
        majorRadius: 0.62,
        minorRadius: 0.16,
        phaseTurn: 0.25,
        windsApexAxis: true as const
    })
]);

export const M4PersonalCymaticField: React.FC<M4PersonalCymaticFieldProps> = ({
    model,
    mode = 'compact-card',
    canvasRef
}) => (
    <section
        className={`m4-personal-cymatic-field ${privacyChromeClass('protected_local')} ${PERSONAL_CYMATIC_FIELD_PRIVACY_CHROME}`}
        data-test="m4-personal-cymatic-field"
        data-track="TRACK_08"
        data-export={M4_PERSONAL_CYMATIC_FIELD_EXPORT}
        data-view-id={PERSONAL_CYMATIC_FIELD_VIEW_ID}
        data-mode={mode}
        data-session-key={model.sessionKey}
        data-foregrounded-handle={model.foregroundedHandle}
        data-renderer-status={model.rendererStatus}
        data-node-count={model.scene.nodes.length}
        data-toric-link-count={model.scene.toricLinks.length}
        data-privacy-class="protected_local_handle_only"
        aria-label="Personal cymatic field"
    >
        <canvas
            ref={canvasRef}
            className="m4-personal-cymatic-canvas"
            data-test="m4-personal-cymatic-canvas"
            data-geometry-law={model.scene.law}
            data-node-count={model.scene.nodes.length}
            data-toric-link-count={model.scene.toricLinks.length}
            aria-label="DR-IG-6 dipyramid and Hopf-linked personal cymatic field"
            width={960}
            height={640}
        />
        {model.errorMessage ? (
            <span className="m4-personal-cymatic-error" data-test="m4-personal-cymatic-error">
                {model.errorMessage}
            </span>
        ) : null}
    </section>
);

@injectable()
export class PersonalCymaticFieldWidget extends ReactWidget {
    static readonly ID = PERSONAL_CYMATIC_FIELD_VIEW_ID;
    static readonly LABEL = PERSONAL_CYMATIC_FIELD_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    public readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected mode: TimeAxisMode = DEFAULT_TIME_AXIS_MODE;
    protected foregroundedHandle: string | null = null;
    protected rendererStatus: PersonalCymaticRendererStatus = 'pending';
    protected rendererHandle: unknown = null;
    protected rendererAttachment: RendererAttachResult | null = null;
    protected canvas: HTMLCanvasElement | null = null;
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];
    protected requestSerial = 0;

    @postConstruct()
    public init(): void {
        this.id = PersonalCymaticFieldWidget.ID;
        this.title.label = PersonalCymaticFieldWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-personal-cymatic-field');
        this.addClass(privacyChromeClass('protected_local'));
        this.addClass(PERSONAL_CYMATIC_FIELD_PRIVACY_CHROME);

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.mode = readProfileTimeAxisMode(profile) ?? this.mode;
                this.foregroundedHandle = this.currentForegroundedHandle();
                this.update();
                void this.requestRendererHandle();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.foregroundedHandle = this.currentForegroundedHandle();
                this.update();
                void this.requestRendererHandle();
            })
        );
        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => {
                this.handleObservabilityEvent(event);
            })
        );

        this.foregroundedHandle = this.currentForegroundedHandle();
        void this.requestRendererHandle();
    }

    override dispose(): void {
        this.detachRenderer();
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')} ${PERSONAL_CYMATIC_FIELD_PRIVACY_CHROME}`}
                data-test="m4-personal-cymatic-root"
            >
                <M4PersonalCymaticField
                    model={this.model()}
                    mode="inspector"
                    canvasRef={canvas => this.setCanvas(canvas)}
                />
            </div>
        );
    }

    protected model(): PersonalCymaticFieldModel {
        return Object.freeze({
            sessionKey: this.currentSessionKey(),
            foregroundedHandle: this.foregroundedHandle ?? this.currentForegroundedHandle(),
            rendererStatus: this.rendererStatus,
            scene: buildPersonalCymaticScene(),
            errorMessage: this.errorMessage
        });
    }

    protected setCanvas(canvas: HTMLCanvasElement | null): void {
        if (this.canvas === canvas) {
            return;
        }
        this.canvas = canvas;
        this.detachRenderer();
        if (canvas) {
            drawDipyramidCanvasGuide(canvas, buildPersonalCymaticScene());
            if (this.rendererHandle) {
                this.attachRenderer();
            }
        }
    }

    protected async requestRendererHandle(): Promise<void> {
        const serial = ++this.requestSerial;
        const params = buildPersonalFieldRpcParams({
            sessionKey: this.currentSessionKey(),
            foregroundedHandle: this.foregroundedHandle ?? this.currentForegroundedHandle()
        });
        this.rendererStatus = 'requesting';
        this.errorMessage = null;
        this.update();
        try {
            const handle = await this.bridge.invokeGatewayRpc(PERSONAL_CYMATIC_FIELD_RPC_METHOD, params);
            if (serial !== this.requestSerial) {
                return;
            }
            this.rendererHandle = handle;
            this.rendererStatus = this.attachRenderer() ? 'attached' : 'fallback';
            this.errorMessage = null;
        } catch (error) {
            if (serial !== this.requestSerial) {
                return;
            }
            this.rendererHandle = null;
            this.detachRenderer();
            this.rendererStatus = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        const payload = objectRecord(event.payload);
        if (!payload || event.type !== TIME_AXIS_FOREGROUND_EVENT_TYPE) {
            return;
        }
        const sessionKey = stringValue(payload.sessionKey);
        if (sessionKey && sessionKey !== this.currentSessionKey()) {
            return;
        }
        const mode = normalizeTimeAxisMode(payload.mode);
        const foregroundedHandle = stringValue(payload.foregroundedHandle);
        if (mode) {
            this.mode = mode;
        }
        if (foregroundedHandle) {
            this.foregroundedHandle = foregroundedHandle;
            updateOpaqueRendererForeground(this.rendererHandle, foregroundedHandle, buildPersonalFieldRpcParams({
                sessionKey: this.currentSessionKey(),
                foregroundedHandle
            }));
            void this.requestRendererHandle();
        }
        this.update();
    }

    protected attachRenderer(): boolean {
        if (!this.canvas || !this.rendererHandle) {
            return false;
        }
        this.detachRenderer();
        this.rendererAttachment = attachOpaqueRendererHandle(
            this.rendererHandle,
            this.canvas,
            buildPersonalFieldRpcParams({
                sessionKey: this.currentSessionKey(),
                foregroundedHandle: this.foregroundedHandle ?? this.currentForegroundedHandle()
            })
        );
        return this.rendererAttachment.attached;
    }

    protected detachRenderer(): void {
        if (!this.rendererAttachment) {
            return;
        }
        try {
            this.rendererAttachment.dispose();
        } catch {
            // best-effort
        }
        this.rendererAttachment = null;
    }

    protected currentForegroundedHandle(): string {
        return buildTimeAxisState({
            sessionKey: this.currentSessionKey(),
            mode: this.mode,
            handles: handlesFromProfile(this.profile, this.context)
        }).foregroundedHandle;
    }

    protected currentSessionKey(): string {
        return sessionKeyFromContext(this.context);
    }
}

@injectable()
export class M4PersonalCymaticFieldContribution
    extends AbstractViewContribution<PersonalCymaticFieldWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: PersonalCymaticFieldWidget.ID,
            widgetName: PersonalCymaticFieldWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: PERSONAL_CYMATIC_FIELD_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: PERSONAL_CYMATIC_FIELD_OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open personal cymatic field` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

export function buildPersonalCymaticScene(): PersonalCymaticScene {
    return Object.freeze({
        law: 'DR-IG-6' as const,
        nodes: DR_IG_6_DIPYRAMID_NODES,
        toricLinks: HOPF_LINKED_TORI
    });
}

export function buildPersonalFieldRpcParams(input: PersonalCymaticFieldRpcParams): PersonalCymaticFieldRpcParams {
    return Object.freeze({
        sessionKey: input.sessionKey,
        foregroundedHandle: input.foregroundedHandle
    });
}

export function attachOpaqueRendererHandle(
    handle: unknown,
    canvas: HTMLCanvasElement,
    params: PersonalCymaticFieldRpcParams
): RendererAttachResult {
    const renderer = objectRecord(handle);
    if (!renderer) {
        return Object.freeze({ attached: false, dispose: () => undefined });
    }

    const mount =
        methodValue<RendererCanvasMethod>(renderer, 'attach') ??
        methodValue<RendererCanvasMethod>(renderer, 'mount') ??
        methodValue<RendererCanvasMethod>(renderer, 'start') ??
        methodValue<RendererCanvasMethod>(renderer, 'render');
    const attached = mount ? mount.call(handle, canvas, params) : null;
    const dispose =
        objectMethod(attached, 'dispose') ??
        methodValue<() => unknown>(renderer, 'dispose') ??
        (() => undefined);

    return Object.freeze({
        attached: Boolean(mount),
        dispose: () => {
            dispose.call(attached ?? handle);
        }
    });
}

function updateOpaqueRendererForeground(
    handle: unknown,
    foregroundedHandle: string,
    params: PersonalCymaticFieldRpcParams
): void {
    const renderer = objectRecord(handle);
    if (!renderer) {
        return;
    }
    const setter =
        methodValue<RendererUpdateMethod>(renderer, 'setForegroundedHandle') ??
        methodValue<RendererUpdateMethod>(renderer, 'updateForegroundedHandle');
    if (setter) {
        setter.call(handle, foregroundedHandle);
        return;
    }
    const update = methodValue<RendererUpdateMethod>(renderer, 'update');
    if (update) {
        update.call(handle, params);
    }
}

function drawDipyramidCanvasGuide(canvas: HTMLCanvasElement, scene: PersonalCymaticScene): void {
    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#081116';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgba(119, 214, 196, 0.34)';
    context.lineWidth = 2;

    for (const link of scene.toricLinks) {
        context.save();
        context.translate(width / 2, height / 2);
        context.rotate(link.linkGroup === 'day' ? -Math.PI / 5 : Math.PI / 5);
        context.strokeStyle = link.linkGroup === 'day'
            ? 'rgba(240, 210, 122, 0.68)'
            : 'rgba(136, 179, 255, 0.68)';
        context.beginPath();
        context.ellipse(
            0,
            0,
            width * link.majorRadius * 0.26,
            height * link.minorRadius * 0.86,
            link.phaseTurn * Math.PI,
            0,
            Math.PI * 2
        );
        context.stroke();
        context.restore();
    }

    const projected = scene.nodes.map(node => ({ node, point: projectNode(node, width, height) }));
    const apexTop = projected.find(item => item.node.id === 'P5');
    const apexBottom = projected.find(item => item.node.id === "P5'");
    if (apexTop && apexBottom) {
        for (const item of projected) {
            if (item.node.role === 'top-base') {
                drawLine(context, apexTop.point, item.point);
            }
            if (item.node.role === 'inverted-base') {
                drawLine(context, apexBottom.point, item.point);
            }
        }
        drawLine(context, apexTop.point, apexBottom.point);
    }

    for (const item of projected) {
        context.fillStyle = item.node.role === 'apex'
            ? '#f0d27a'
            : item.node.role === 'axis'
                ? '#f7f7f2'
                : item.node.role === 'top-base'
                    ? '#77d6c4'
                    : '#88b3ff';
        context.beginPath();
        context.arc(item.point.x, item.point.y, item.node.role === 'axis' ? 5 : 7, 0, Math.PI * 2);
        context.fill();
    }
}

function projectNode(node: DipyramidNode, width: number, height: number): { readonly x: number; readonly y: number } {
    return Object.freeze({
        x: width / 2 + node.x * width * 0.28 + node.z * width * 0.06,
        y: height / 2 + node.y * height * 0.36 - node.z * height * 0.09
    });
}

function drawLine(
    context: CanvasRenderingContext2D,
    from: { readonly x: number; readonly y: number },
    to: { readonly x: number; readonly y: number }
): void {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
}

function freezeNode(
    id: DipyramidNodeId,
    role: DipyramidNode['role'],
    x: number,
    y: number,
    z: number
): DipyramidNode {
    return Object.freeze({ id, role, x, y, z });
}

function readProfileTimeAxisMode(profile: MathemeHarmonicProfileBoundary | null): TimeAxisMode | null {
    return normalizeTimeAxisMode(readNestedString(profile?.payload, [
        'timeAxisMode',
        'session.timeAxisMode',
        'naraSession.timeAxisMode',
        'm4TimeAxis.mode'
    ]));
}

function sessionKeyFromContext(context: CoordinateContext): string {
    if (typeof context.dayNowSessionHandle === 'string' && context.dayNowSessionHandle.trim() !== '') {
        return context.dayNowSessionHandle;
    }
    const generation = context.profileGeneration ?? 'default';
    return `m4-nara:session:${generation}`;
}

function readNestedString(root: unknown, dottedNames: readonly string[]): string | null {
    for (const dotted of dottedNames) {
        let current = root;
        for (const segment of dotted.split('.')) {
            if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
                current = undefined;
                break;
            }
            current = (current as Record<string, unknown>)[segment];
        }
        const value = stringValue(current);
        if (value) {
            return value;
        }
    }
    return null;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value as Readonly<Record<string, unknown>>;
}

function objectMethod(value: unknown, name: string): (() => unknown) | null {
    const record = objectRecord(value);
    return record ? methodValue<() => unknown>(record, name) : null;
}

function methodValue<T extends (...args: never[]) => unknown>(
    record: Readonly<Record<string, unknown>>,
    name: string
): T | null {
    const value = record[name];
    return typeof value === 'function' ? value as T : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

// Keep the imported privacy constant load-bearing for package-level privacy audits.
void PRIVACY_CLASS;
