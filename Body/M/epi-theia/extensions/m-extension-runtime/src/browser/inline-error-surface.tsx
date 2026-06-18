import * as React from 'react';
import {
    OMNIPANEL_DIAGNOSTICS_TAB_ID,
    OMNIPANEL_OPEN_TAB_COMMAND,
    ReadinessCommandRegistry,
    openReadinessDiagnostics
} from './readiness-banner';

export interface InlineErrorSurfaceProps {
    readonly extensionId: string;
    readonly message: string;
    readonly retry?: () => void;
    readonly commands?: ReadinessCommandRegistry;
    readonly onDismiss?: () => void;
}

export interface ShowInlineErrorOptions {
    readonly extensionId: string;
    readonly error: unknown;
    readonly retry?: () => void;
    readonly commands?: ReadinessCommandRegistry;
    readonly document?: DocumentLike;
    readonly mount?: ElementLike | string | null;
}

export interface InlineErrorHandle {
    dispose(): void;
}

interface EventTargetLike {
    addEventListener(type: string, listener: (event: unknown) => void): void;
}

interface ElementLike extends EventTargetLike {
    className: string;
    textContent: string | null;
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

export function inlineErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }
    if (typeof error === 'string' && error.trim().length > 0) {
        return error;
    }
    try {
        const encoded = JSON.stringify(error);
        return encoded && encoded !== '{}' ? encoded : 'Runtime kernel-bridge call failed.';
    } catch {
        return 'Runtime kernel-bridge call failed.';
    }
}

export const InlineErrorSurface: React.FC<InlineErrorSurfaceProps> = ({
    extensionId,
    message,
    retry,
    commands,
    onDismiss
}) => (
    <section
        className="mext-inline-error-surface"
        data-error-surface="runtime-kernel-bridge"
        data-extension={extensionId}
        role="status"
        aria-live="polite"
    >
        <div className="mext-inline-error-copy">
            <strong>Runtime call failed</strong>
            <p>{message}</p>
        </div>
        <div className="mext-inline-error-actions">
            {retry ? (
                <button
                    type="button"
                    className="theia-button mext-inline-error-retry"
                    onClick={() => retry()}
                >
                    Retry
                </button>
            ) : null}
            <button
                type="button"
                className="theia-button secondary mext-inline-error-diagnostics"
                data-command={OMNIPANEL_OPEN_TAB_COMMAND}
                data-target-tab={OMNIPANEL_DIAGNOSTICS_TAB_ID}
                aria-disabled={commands ? undefined : true}
                onClick={() => {
                    if (commands) {
                        void openReadinessDiagnostics(commands);
                    }
                }}
            >
                Open Diagnostics
            </button>
            <button
                type="button"
                className="theia-button secondary mext-inline-error-dismiss"
                onClick={() => onDismiss?.()}
            >
                Dismiss
            </button>
        </div>
    </section>
);

export function showInlineError(options: ShowInlineErrorOptions): InlineErrorHandle {
    const doc = resolveDocument(options);
    const host = resolveHost(doc, options.mount);
    const surface = doc.createElement('section');
    surface.className = 'mext-inline-error-surface';
    surface.setAttribute('data-error-surface', 'runtime-kernel-bridge');
    surface.setAttribute('data-extension', options.extensionId);
    surface.setAttribute('role', 'status');
    surface.setAttribute('aria-live', 'polite');

    const copy = doc.createElement('div');
    copy.className = 'mext-inline-error-copy';
    const title = doc.createElement('strong');
    title.textContent = 'Runtime call failed';
    const message = doc.createElement('p');
    message.textContent = inlineErrorMessage(options.error);
    copy.appendChild(title);
    copy.appendChild(message);
    surface.appendChild(copy);

    const actions = doc.createElement('div');
    actions.className = 'mext-inline-error-actions';
    if (options.retry) {
        actions.appendChild(createButton(doc, 'Retry', 'theia-button mext-inline-error-retry', () => {
            options.retry?.();
        }));
    }
    const diagnostics = createButton(
        doc,
        'Open Diagnostics',
        'theia-button secondary mext-inline-error-diagnostics',
        () => {
            if (options.commands) {
                void openReadinessDiagnostics(options.commands);
            }
        }
    );
    diagnostics.setAttribute('data-command', OMNIPANEL_OPEN_TAB_COMMAND);
    diagnostics.setAttribute('data-target-tab', OMNIPANEL_DIAGNOSTICS_TAB_ID);
    if (!options.commands) {
        diagnostics.setAttribute('aria-disabled', 'true');
    }
    actions.appendChild(diagnostics);
    actions.appendChild(createButton(doc, 'Dismiss', 'theia-button secondary mext-inline-error-dismiss', () => {
        surface.remove();
    }));
    surface.appendChild(actions);
    host.appendChild(surface);

    return {
        dispose(): void {
            surface.remove();
        }
    };
}

function resolveDocument(options: ShowInlineErrorOptions): DocumentLike {
    if (options.document) {
        return options.document;
    }
    const doc = globalThis.document as unknown as DocumentLike | undefined;
    if (!doc) {
        throw new Error('showInlineError requires a browser document or explicit document option.');
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
    return doc.querySelector('[data-omnipanel-inline-errors]')
        ?? doc.querySelector('.pratibimba-omnipanel')
        ?? doc.querySelector('#theia-right-content-panel')
        ?? doc.body;
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
