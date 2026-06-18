import * as React from 'react';

export const PUBLIC_BRIDGE_CONSENTS_KEY = 'c_4_atlas_sync_consents';
export const PUBLIC_BRIDGE_PASU_SET_METHOD = 'nara.pasu.set';

export type PrivacyClass = 'protected_local' | 'protected_local_handle_only' | 'public_current';
export type PublicBridgeConsentAction =
    | 'nara.voice-corpus.include'
    | 'nara.graphiti.body.inspect'
    | 'nara.shared-archetype.publish';
export type PublicBridgeConsentScope = 'single-artifact' | 'single-day' | 'adapter-corpus';

export interface PublicBridgeConsentRecord {
    readonly action: PublicBridgeConsentAction;
    readonly scope: PublicBridgeConsentScope;
    readonly pressureFree: boolean;
    readonly inspectable: boolean;
    readonly artifactHandle: string;
    readonly timestamp: string;

    /** Cross-link to the 25.14 PASU consent shape. */
    readonly subjectHandle: string;
    readonly consented: true;
    readonly consentedAt: string;
}

export interface PrivacyCrossingRequest {
    readonly artifactHandle: string;
    readonly artifactSummary: string;
    readonly description: string;
    readonly action: PublicBridgeConsentAction;
    readonly scope: PublicBridgeConsentScope;
    readonly fromPrivacyClass: PrivacyClass;
    readonly toPrivacyClass: PrivacyClass;
    readonly pressureFree: boolean;
    readonly inspectable: boolean;
}

export interface PrivacyOptInDialogProps {
    readonly request: PrivacyCrossingRequest;
    readonly consentChecked: boolean;
    readonly busy?: boolean;
    readonly errorMessage?: string | null;
    readonly onConsentCheckedChange: (checked: boolean) => void;
    readonly onConfirmPublicCrossing: () => void;
    readonly onStayProtectedLocal: () => void;
}

export interface GatewayRpcBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export interface ShowPrivacyOptInDialogOptions {
    readonly request: PrivacyCrossingRequest;
    readonly bridge: GatewayRpcBridge;
    readonly document?: DocumentLike;
    readonly mount?: ElementLike | string | null;
    readonly now?: () => string;
    readonly onConfirm?: (record: PublicBridgeConsentRecord) => void;
    readonly onStayProtectedLocal?: () => void;
    readonly onError?: (error: unknown) => void;
}

export interface PrivacyOptInHandle {
    readonly request: PrivacyCrossingRequest;
    dispose(): void;
}

interface EventTargetLike {
    addEventListener(type: string, listener: (event: unknown) => void): void;
}

interface ElementLike extends EventTargetLike {
    className: string;
    textContent: string | null;
    checked?: boolean;
    disabled?: boolean;
    type?: string;
    ownerDocument?: DocumentLike | null;
    appendChild(child: ElementLike): ElementLike;
    remove(): void;
    setAttribute(name: string, value: string): void;
}

interface DocumentLike {
    readonly body: ElementLike;
    createElement(tagName: string): ElementLike;
    querySelector(selector: string): ElementLike | null;
}

const PRIVACY_CLASS_RANK: Readonly<Record<PrivacyClass, number>> = Object.freeze({
    protected_local: 0,
    protected_local_handle_only: 1,
    public_current: 2
});

const DEFAULT_TIMESTAMP = (): string => new Date().toISOString();

export const PrivacyOptInDialog: React.FC<PrivacyOptInDialogProps> = props => {
    const { request, consentChecked, busy, errorMessage } = props;
    const confirmDisabled = busy === true
        || !consentChecked
        || !canConfirmPublicCrossing(request);

    return (
        <section
            className="mext-privacy-opt-in-dialog"
            role="dialog"
            aria-modal={false}
            aria-live="polite"
            data-privacy-crossing={`${request.fromPrivacyClass}->${request.toPrivacyClass}`}
            data-artifact-handle={request.artifactHandle}
            data-pressure-free={String(request.pressureFree)}
            data-inspectable={String(request.inspectable)}
        >
            <header className="mext-privacy-opt-in-header">
                <h3>Public bridge opt-in</h3>
                <span className="mext-privacy-opt-in-class">{request.toPrivacyClass}</span>
            </header>
            <dl className="mext-privacy-opt-in-artifact">
                <dt>Artifact handle</dt>
                <dd>{request.artifactHandle}</dd>
                <dt>Summary</dt>
                <dd>{request.artifactSummary}</dd>
            </dl>
            <p className="mext-privacy-opt-in-description">{request.description}</p>
            <div className="mext-privacy-opt-in-flags" aria-label="Consent flags">
                <span data-flag="pressureFree">{`pressureFree=${request.pressureFree}`}</span>
                <span data-flag="inspectable">{`inspectable=${request.inspectable}`}</span>
            </div>
            {errorMessage ? (
                <p className="mext-privacy-opt-in-error" role="alert">{errorMessage}</p>
            ) : null}
            <label className="mext-privacy-opt-in-consent">
                <input
                    type="checkbox"
                    checked={consentChecked}
                    disabled={busy}
                    onChange={event => props.onConsentCheckedChange(event.currentTarget.checked)}
                />
                <span>I consent to this single artifact crossing to the public bridge.</span>
            </label>
            <footer className="mext-privacy-opt-in-actions">
                <button
                    type="button"
                    className="theia-button secondary mext-privacy-stay-protected-local"
                    disabled={busy}
                    onClick={props.onStayProtectedLocal}
                >
                    Stay protected-local
                </button>
                <button
                    type="button"
                    className="theia-button mext-privacy-confirm-public-crossing"
                    disabled={confirmDisabled}
                    onClick={props.onConfirmPublicCrossing}
                >
                    Confirm public crossing
                </button>
            </footer>
        </section>
    );
};

export function selectedPrivacyClassWithinCeiling(
    userPreference: PrivacyClass,
    extensionMaximum: PrivacyClass
): PrivacyClass {
    return PRIVACY_CLASS_RANK[userPreference] <= PRIVACY_CLASS_RANK[extensionMaximum]
        ? userPreference
        : extensionMaximum;
}

export function isProtectedToPublicCrossing(
    fromPrivacyClass: PrivacyClass,
    toPrivacyClass: PrivacyClass
): boolean {
    return fromPrivacyClass !== 'public_current' && toPrivacyClass === 'public_current';
}

export function canConfirmPublicCrossing(request: PrivacyCrossingRequest): boolean {
    return isProtectedToPublicCrossing(request.fromPrivacyClass, request.toPrivacyClass)
        && request.artifactHandle.trim().length > 0
        && request.pressureFree
        && request.inspectable;
}

export function buildPublicBridgeConsentRecord(
    request: PrivacyCrossingRequest,
    timestamp = DEFAULT_TIMESTAMP()
): PublicBridgeConsentRecord {
    if (!canConfirmPublicCrossing(request)) {
        throw new Error('Public crossing requires a protected-local source, pressureFree consent, and inspectable action.');
    }
    const artifactHandle = request.artifactHandle.trim();
    return Object.freeze({
        action: request.action,
        scope: request.scope,
        pressureFree: request.pressureFree,
        inspectable: request.inspectable,
        artifactHandle,
        timestamp,
        subjectHandle: artifactHandle,
        consented: true,
        consentedAt: timestamp
    });
}

export function hasPerArtifactPublicConsent(
    records: readonly PublicBridgeConsentRecord[],
    request: Pick<PrivacyCrossingRequest, 'artifactHandle' | 'action' | 'scope'>
): boolean {
    const artifactHandle = request.artifactHandle.trim();
    return records.some(record =>
        record.artifactHandle === artifactHandle
        && record.action === request.action
        && record.scope === request.scope
        && record.consented === true
        && record.pressureFree
        && record.inspectable
    );
}

export function assertPublicCrossingAllowed(
    request: PrivacyCrossingRequest,
    consentRecords: readonly PublicBridgeConsentRecord[]
): void {
    if (!isProtectedToPublicCrossing(request.fromPrivacyClass, request.toPrivacyClass)) {
        return;
    }
    if (!hasPerArtifactPublicConsent(consentRecords, request)) {
        throw new Error('Public bridge crossing blocked until this artifact has explicit opt-in consent.');
    }
}

export async function persistPublicBridgeConsent(
    bridge: GatewayRpcBridge,
    record: PublicBridgeConsentRecord
): Promise<readonly PublicBridgeConsentRecord[]> {
    const result = await bridge.invokeGatewayRpc(PUBLIC_BRIDGE_PASU_SET_METHOD, {
        key: PUBLIC_BRIDGE_CONSENTS_KEY,
        value: record,
        mode: 'append'
    });
    return normalizeConsentResult(result, record);
}

export function showPrivacyOptInDialog(options: ShowPrivacyOptInDialogOptions): PrivacyOptInHandle {
    const doc = resolveDocument(options);
    const host = resolveHost(doc, options.mount);
    const surface = doc.createElement('section');
    surface.className = 'mext-privacy-opt-in-dialog';
    surface.setAttribute('role', 'dialog');
    surface.setAttribute('aria-modal', 'false');
    surface.setAttribute('aria-live', 'polite');
    surface.setAttribute('data-privacy-crossing', `${options.request.fromPrivacyClass}->${options.request.toPrivacyClass}`);
    surface.setAttribute('data-artifact-handle', options.request.artifactHandle);
    surface.setAttribute('data-pressure-free', String(options.request.pressureFree));
    surface.setAttribute('data-inspectable', String(options.request.inspectable));

    const title = doc.createElement('h3');
    title.textContent = 'Public bridge opt-in';
    surface.appendChild(title);
    appendField(doc, surface, 'Artifact handle', options.request.artifactHandle);
    appendField(doc, surface, 'Summary', options.request.artifactSummary);

    const description = doc.createElement('p');
    description.className = 'mext-privacy-opt-in-description';
    description.textContent = options.request.description;
    surface.appendChild(description);

    const flags = doc.createElement('p');
    flags.className = 'mext-privacy-opt-in-flags';
    flags.textContent = `pressureFree=${options.request.pressureFree} inspectable=${options.request.inspectable}`;
    surface.appendChild(flags);

    const error = doc.createElement('p');
    error.className = 'mext-privacy-opt-in-error';
    error.setAttribute('role', 'alert');

    let consentChecked = false;
    const consent = doc.createElement('input');
    consent.type = 'checkbox';
    consent.setAttribute('aria-label', 'Consent to this single artifact public crossing');
    consent.addEventListener('change', () => {
        consentChecked = consent.checked === true;
        confirm.disabled = !consentChecked || !canConfirmPublicCrossing(options.request);
    });
    surface.appendChild(consent);

    const consentCopy = doc.createElement('span');
    consentCopy.textContent = 'I consent to this single artifact crossing to the public bridge.';
    surface.appendChild(consentCopy);

    const stay = createButton(doc, 'Stay protected-local', 'theia-button secondary mext-privacy-stay-protected-local', () => {
        options.onStayProtectedLocal?.();
        surface.remove();
    });
    surface.appendChild(stay);

    const confirm = createButton(doc, 'Confirm public crossing', 'theia-button mext-privacy-confirm-public-crossing', () => {
        if (!consentChecked) {
            return;
        }
        const record = buildPublicBridgeConsentRecord(options.request, options.now?.() ?? DEFAULT_TIMESTAMP());
        confirm.disabled = true;
        stay.disabled = true;
        void persistPublicBridgeConsent(options.bridge, record)
            .then(() => {
                options.onConfirm?.(record);
                surface.remove();
            })
            .catch(cause => {
                confirm.disabled = false;
                stay.disabled = false;
                error.textContent = cause instanceof Error ? cause.message : String(cause);
                if (!surfaceContains(surface, error)) {
                    surface.appendChild(error);
                }
                options.onError?.(cause);
            });
    });
    confirm.disabled = true;
    surface.appendChild(confirm);
    host.appendChild(surface);

    return {
        request: options.request,
        dispose(): void {
            surface.remove();
        }
    };
}

function normalizeConsentResult(
    result: unknown,
    fallback: PublicBridgeConsentRecord
): readonly PublicBridgeConsentRecord[] {
    const value = objectRecord(result)?.value ?? result;
    if (!Array.isArray(value)) {
        return Object.freeze([fallback]);
    }
    return Object.freeze(value.map(normalizeConsentRecord).filter((record): record is PublicBridgeConsentRecord => record !== null));
}

function normalizeConsentRecord(value: unknown): PublicBridgeConsentRecord | null {
    const record = objectRecord(value);
    if (!record) {
        return null;
    }
    const action = record.action;
    const scope = record.scope;
    const artifactHandle = stringValue(record.artifactHandle, stringValue(record.subjectHandle, ''));
    const timestamp = stringValue(record.timestamp, stringValue(record.consentedAt, ''));
    if (!isConsentAction(action) || !isConsentScope(scope) || artifactHandle === '' || timestamp === '') {
        return null;
    }
    return Object.freeze({
        action,
        scope,
        pressureFree: record.pressureFree === true,
        inspectable: record.inspectable === true,
        artifactHandle,
        timestamp,
        subjectHandle: stringValue(record.subjectHandle, artifactHandle),
        consented: true,
        consentedAt: stringValue(record.consentedAt, timestamp)
    });
}

function resolveDocument(options: ShowPrivacyOptInDialogOptions): DocumentLike {
    if (options.document) {
        return options.document;
    }
    const doc = globalThis.document as unknown as DocumentLike | undefined;
    if (!doc) {
        throw new Error('showPrivacyOptInDialog requires a browser document or explicit document option.');
    }
    return doc;
}

function resolveHost(doc: DocumentLike, mount: ElementLike | string | null | undefined): ElementLike {
    if (typeof mount === 'string') {
        return doc.querySelector(mount) ?? doc.body;
    }
    if (mount) {
        return mount;
    }
    return doc.querySelector('[data-omnipanel-inline-privacy]')
        ?? doc.querySelector('.pratibimba-omnipanel')
        ?? doc.querySelector('#theia-right-content-panel')
        ?? doc.body;
}

function appendField(doc: DocumentLike, surface: ElementLike, label: string, value: string): void {
    const row = doc.createElement('p');
    row.className = 'mext-privacy-opt-in-field';
    row.textContent = `${label}: ${value}`;
    surface.appendChild(row);
}

function createButton(
    doc: DocumentLike,
    label: string,
    className: string,
    onClick: () => void
): ElementLike {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', event => {
        const preventDefault = (event as { preventDefault?: () => void }).preventDefault;
        preventDefault?.();
        onClick();
    });
    return button;
}

function surfaceContains(surface: ElementLike, child: ElementLike): boolean {
    const children = (surface as { readonly children?: readonly ElementLike[] }).children;
    return Array.isArray(children) && children.includes(child);
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' ? value as Readonly<Record<string, unknown>> : null;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function isConsentAction(value: unknown): value is PublicBridgeConsentAction {
    return value === 'nara.voice-corpus.include'
        || value === 'nara.graphiti.body.inspect'
        || value === 'nara.shared-archetype.publish';
}

function isConsentScope(value: unknown): value is PublicBridgeConsentScope {
    return value === 'single-artifact'
        || value === 'single-day'
        || value === 'adapter-corpus';
}
