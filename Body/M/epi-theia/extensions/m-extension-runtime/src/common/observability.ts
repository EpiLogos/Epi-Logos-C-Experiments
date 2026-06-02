/**
 * Observability event base shape. Each M-extension emits typed events whose
 * `type` strings are listed in
 * `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json`
 * under each extension's `observabilityEventTypes`.
 *
 * The canonical event schema is owned by the kernel-bridge / S5 contract
 * (IOD-12); this base lives here only so the six extensions emit a single
 * shape into the shared publisher.
 */
export interface MObservabilityEvent {
    readonly type: string;
    readonly extensionId: string;
    readonly emittedAt: number;
    readonly payload: Readonly<Record<string, unknown>>;
}

export interface MObservabilityPublisher {
    publish(event: MObservabilityEvent): void;
}
