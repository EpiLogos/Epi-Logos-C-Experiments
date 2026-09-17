/**
 * Coordinate: M' (markdown editor pane, plan T2.2; Canon Studio read half, 28.T28.4)
 * Actualises: file editing over the vault service — CodeMirror 6 markdown,
 *   debounced write-back where the S1 write scope permits, honest read-only
 *   banner elsewhere. Provenance state is worn, never hidden.
 *   28.T28.4 deepens it into the Canon Studio read half declared by
 *   CHROME-CONTRACT §2: inline QL/bimba decoration, `[[` completion answered by
 *   the live S1 semantic surface, the DR-S1-5 C-layer typology receipt over the
 *   frontmatter fold, the PASU identity route, and the governed-write handoff to
 *   the Logos Atelier (CHROME-CONTRACT §4 — this surface never mutates canon).
 *   32.T32.7 routes the `vault_read` refusal through the shared inline error
 *   surface: a failed read is a runtime substrate call failure like any other,
 *   and it is the one this carrier can reach deterministically (open a path the
 *   vault does not hold). The `editor-error` test id and the verbatim
 *   "cannot open <path>: <reason>" message are unchanged; retry re-issues the
 *   read against a nonce, so a file that appears later opens on the retry
 *   rather than needing the tab closed and reopened.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { invokeCommand } from '../bridge/tauri';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, type IntentPrivacyClass } from '../commands/crossLayoutIntent';
import { useSessionStore, useTickStore } from '../state/stores';
import { InlineErrorSurface } from '../ui/InlineErrorSurface';
import { createDebouncedSaver, DebouncedSaver } from './debouncedSaver';
import {
    canonCompletionExtension,
    canonDecorationExtension,
    type SemanticCompletionState
} from './canonEditorExtensions';
import {
    CLAYER_TYPOLOGY_METHOD,
    isPasuNote,
    parseCLayerTypology,
    type CLayerTypology
} from './canonStudio';

interface VaultFile {
    path: string;
    content: string;
    readOnly: boolean;
}

/** Frontmatter never shows in the writing surface — it is typed metadata,
 *  not prose. Split on load, reassemble on save (byte-preserving). */
export function splitFrontmatter(content: string): { frontmatter: string | null; body: string } {
    if (content.startsWith('---\n')) {
        const end = content.indexOf('\n---\n', 4);
        if (end !== -1) {
            return { frontmatter: content.slice(0, end + 5), body: content.slice(end + 5) };
        }
    }
    return { frontmatter: null, body: content };
}

export function MarkdownEditorPane({ path }: { path: string }) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [file, setFile] = useState<VaultFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<'clean' | 'dirty' | 'saving' | 'saved' | 'error'>('clean');
    const [fmOpen, setFmOpen] = useState(false);
    const [fm, setFm] = useState<string | null>(null);
    const [typology, setTypology] = useState<CLayerTypology | null>(null);
    const [typologyRefusal, setTypologyRefusal] = useState<string | null>(null);
    const [completion, setCompletion] = useState<SemanticCompletionState | null>(null);
    /** Bumped by the 32.7 retry affordance; the read effect keys on it so a
     *  retry re-issues the REAL `vault_read`, never a cached refusal. */
    const [readAttempt, setReadAttempt] = useState(0);

    const sessionKey = useSessionStore(state => state.sessionKey);
    const dayNow = useSessionStore(state => state.dayNow);
    const privacy = useSessionStore(state => state.privacyClass);
    const generation = useTickStore(state => state.generation);

    useEffect(() => {
        let view: EditorView | null = null;
        let saver: DebouncedSaver | null = null;
        let cancelled = false;

        invokeCommand<VaultFile>('vault_read', { path })
            .then(loaded => {
                if (cancelled || !hostRef.current) {
                    return;
                }
                setFile(loaded);
                const parts = splitFrontmatter(loaded.content);
                setFm(parts.frontmatter);
                saver = createDebouncedSaver(
                    body => invokeCommand<void>('vault_write', { path, content: (parts.frontmatter ?? '') + body }),
                    1500,
                    state => setSaveState(state)
                );
                view = new EditorView({
                    parent: hostRef.current,
                    state: EditorState.create({
                        doc: parts.body,
                        extensions: [
                            basicSetup,
                            markdown(),
                            canonDecorationExtension,
                            canonCompletionExtension({
                                notePath: path,
                                ready: gatewayReady,
                                invoke: (method, params) => gateway().invoke(method, params),
                                onState: state => {
                                    if (!cancelled) {
                                        setCompletion(state);
                                    }
                                }
                            }),
                            EditorView.editable.of(!loaded.readOnly),
                            EditorView.updateListener.of(update => {
                                if (update.docChanged && !loaded.readOnly) {
                                    saver?.schedule(update.state.doc.toString());
                                }
                            }),
                            EditorView.theme({}, { dark: true })
                        ]
                    })
                });
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                }
            });

        return () => {
            cancelled = true;
            void saver?.flush();
            saver?.dispose();
            view?.destroy();
        };
    }, [path, readAttempt]);

    // The C-family typology authority is S1's (DR-S1-5, `s1'.type.classify_c_layer`).
    // The fold reads it; it never re-derives the classification locally.
    // Keyed on the note, NOT on the profile generation: a note's C-layer is a
    // property of the note, and the profile heartbeat pulses once a second —
    // ticking this read would put a classification RPC per second per open tab
    // on the gateway. Profile tick governs re-render, not re-fetch (§7).
    useEffect(() => {
        let cancelled = false;
        setTypology(null);
        setTypologyRefusal(null);
        if (!gatewayReady()) {
            setTypologyRefusal('gateway disconnected — S1 typology unavailable');
            return () => {
                cancelled = true;
            };
        }
        void gateway()
            .invoke(CLAYER_TYPOLOGY_METHOD, { path })
            .then(receipt => parseCLayerTypology(receipt.artifact))
            .then(parsed => {
                if (!cancelled) {
                    setTypology(parsed);
                }
            })
            .catch(cause => {
                if (!cancelled) {
                    setTypologyRefusal(cause instanceof Error ? cause.message : String(cause));
                }
            });
        return () => {
            cancelled = true;
        };
    }, [path]);

    const dispatchIntent = useCallback(
        (requestedContributionId: string) => {
            const privacyClass: IntentPrivacyClass | null =
                privacy === 'public' || privacy === 'protected' || privacy === 'private' ? privacy : null;
            void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: typology?.typeCoordinate ?? null,
                artifactUri: path,
                reviewId: null,
                dayNow,
                sessionKey,
                profileGeneration: generation,
                privacyClass,
                requestedExtensionId: 'ide-shell-m0-m5',
                requestedContributionId
            });
        },
        [typology, path, dayNow, sessionKey, privacy, generation]
    );

    if (error) {
        return (
            <InlineErrorSurface
                testId="editor-error"
                surfaceId={`vault.editor:${path}`}
                message={`cannot open ${path}: ${error}`}
                onRetry={() => {
                    setError(null);
                    setReadAttempt(attempt => attempt + 1);
                }}
            />
        );
    }
    return (
        <div className="editor-pane" data-testid={`editor-${path}`} data-view-id="pratibimba.canon-studio">
            {file?.readOnly ? (
                <div className="editor-banner" data-testid="editor-readonly-banner">
                    read-only — this surface writes only under Empty/Present/ (S1 scope)
                </div>
            ) : (
                <div className="editor-banner editor-banner-live" data-testid="editor-save-state">
                    {saveState === 'clean' ? 'ready' : saveState}
                </div>
            )}
            <div className="editor-governance" data-testid="editor-governance">
                <button
                    type="button"
                    data-testid="editor-open-atelier"
                    onClick={() => dispatchIntent('logos-atelier')}
                >
                    Open in Logos Atelier
                </button>
                {isPasuNote(path) ? (
                    <button
                        type="button"
                        data-testid="editor-open-pasu-wizard"
                        onClick={() => void commands.execute('identity.openWizard')}
                    >
                        Edit identity in the PASU wizard
                    </button>
                ) : null}
                <span className="editor-governance-note">
                    canon writes are governed — this surface reads
                </span>
            </div>
            {fm ? (
                <div className="editor-frontmatter" data-testid="editor-frontmatter">
                    <button type="button" onClick={() => setFmOpen(open => !open)}>
                        {fmOpen ? '▾' : '▸'} frontmatter
                    </button>
                    {fmOpen ? (
                        <>
                            <div className="editor-typology" data-testid="editor-typology">
                                {typology ? (
                                    <dl>
                                        <div>
                                            <dt>C-layer</dt>
                                            <dd data-testid="editor-typology-authority">
                                                {typology.semanticAuthority}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>type</dt>
                                            <dd>{typology.typeFamily}</dd>
                                        </div>
                                        <div>
                                            <dt>coordinate</dt>
                                            <dd>{typology.typeCoordinate}</dd>
                                        </div>
                                        <div>
                                            <dt>state</dt>
                                            <dd>{typology.crystallisationState}</dd>
                                        </div>
                                        <div>
                                            <dt>evidence</dt>
                                            <dd>
                                                {typology.evidenceKind} · {typology.classificationSource}
                                            </dd>
                                        </div>
                                    </dl>
                                ) : (
                                    <p data-testid="editor-typology-refusal">
                                        {typologyRefusal ?? 'reading S1 typology…'}
                                    </p>
                                )}
                                <p className="editor-typology-scope">
                                    key-shape validation is S1 law (`hen-compiler-core::validate_frontmatter`,
                                    reachable as `epi vault frontmatter-validate`); it has no gateway seam yet,
                                    so this fold discloses typology only.
                                </p>
                            </div>
                            <pre>{fm}</pre>
                        </>
                    ) : null}
                </div>
            ) : null}
            {completion ? (
                <div className="editor-completion-state" data-testid="editor-completion-state">
                    {completion.kind === 'ok'
                        ? `smart connections: ${completion.count} · index ${completion.staleness}`
                        : `smart connections unavailable — ${completion.reason}`}
                </div>
            ) : null}
            <div ref={hostRef} className="editor-host" />
        </div>
    );
}
