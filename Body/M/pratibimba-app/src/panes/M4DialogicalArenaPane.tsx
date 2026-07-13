/**
 * Coordinate: M' M4' (dialogical arena pane — Tranche 41.7 rerun carrier)
 * Actualises: the M4' Dia-logical Arena surface in pratibimba-app — scene
 *   strip, scene detail (classifier-glyph chips, Trika-0 marker, kairos ring,
 *   turn scrollback, utterance input), warm right rail, and the non-modal
 *   scene-setup wizard behind the CPF (00/00) Anima-brainstorm gate.
 * Provenance: ported from the frozen epi-theia m4-nara `dialogical-arena.tsx`
 *   presentational structure; RPC seam corrected to the landed eight-route
 *   `m4.arena.*` family (see src/panes/m4DialogicalArena.ts header).
 * Does NOT own: arena runtime state (gateway m4_arena.rs), summon identity
 *   law (portal-core), the ws dispatch seam (renders `pending-wire` honestly
 *   while the family answers `unimplemented`).
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore } from '../state/stores';
import {
    ARENA_LIST_RPC,
    ARENA_PRIVACY_MANIFEST,
    ARENA_SCENE_OPEN_RPC,
    ARENA_SUBSCRIBE_RPC,
    ARENA_SUMMON_RPC,
    ARENA_TURN_ADVANCE_RPC,
    ARENA_WARM_LIST_RPC,
    ARENA_WARM_RELEASE_RPC,
    ARENA_WIRE_PENDING_NOTE,
    ArenaSceneSummary,
    ArenaTurnEntry,
    ArenaVamaShakti,
    ArenaWireState,
    CLASSIFIER_GLYPHS,
    CONSTITUTIONAL_AGENTS,
    ClassDistribution,
    DIALOGICAL_ARENA_VIEW_ID,
    SceneSetupState,
    VAMA_SHAKTI_CLASSES,
    VamaShaktiClass,
    WarmVamaShaktiRow,
    buildSceneOpenPlan,
    classDistribution,
    classifyWireError,
    evaluateSceneSetupGate,
    glyphForClass,
    initialSceneSetupState,
    normalizeSceneHandleList,
    normalizeVamaShaktiHandle,
    normalizeWarmRows,
    suggestVamaShaktiClass,
    turnEntryFromReceipt
} from './m4DialogicalArena';

interface Fixture {
    readonly scenes?: readonly ArenaSceneSummary[];
    readonly roster?: readonly ArenaVamaShakti[];
    readonly turns?: readonly ArenaTurnEntry[];
    readonly warm?: readonly WarmVamaShaktiRow[];
}

export interface M4DialogicalArenaPaneProps {
    /** Test seam: fixture state rendered instead of the (unwired) live seam. */
    readonly fixture?: Fixture;
}

export function M4DialogicalArenaPane({ fixture }: M4DialogicalArenaPaneProps) {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [wireState, setWireState] = useState<ArenaWireState>(fixture ? 'live' : 'pending-wire');
    const [scenes, setScenes] = useState<readonly ArenaSceneSummary[]>(fixture?.scenes ?? []);
    const [activeSceneKey, setActiveSceneKey] = useState<string | null>(
        fixture?.scenes?.[0]?.sceneKey ?? null
    );
    const [roster, setRoster] = useState<readonly ArenaVamaShakti[]>(fixture?.roster ?? []);
    const [turns, setTurns] = useState<readonly ArenaTurnEntry[]>(fixture?.turns ?? []);
    const [warm, setWarm] = useState<readonly WarmVamaShaktiRow[]>(fixture?.warm ?? []);
    const [warmFilter, setWarmFilter] = useState<VamaShaktiClass | 'all'>('all');
    const [setup, setSetup] = useState<SceneSetupState>(initialSceneSetupState());

    const refresh = useCallback(() => {
        if (fixture || !connected) {
            return;
        }
        gateway()
            .invoke(ARENA_LIST_RPC, { status: 'open' })
            .then(receipt => {
                setScenes(normalizeSceneHandleList(receipt.artifact));
                setWireState('live');
            })
            .catch(err => setWireState(classifyWireError(err)));
        gateway()
            .invoke(ARENA_WARM_LIST_RPC, {})
            .then(receipt => setWarm(normalizeWarmRows(receipt.artifact)))
            .catch(() => {
                /* wireState already carries the seam verdict from list */
            });
    }, [fixture, connected]);

    useEffect(refresh, [refresh]);

    const activeScene = scenes.find(scene => scene.sceneKey === activeSceneKey) ?? null;
    const distribution = classDistribution(roster);

    const submitUtterance = (line: string) => {
        if (!activeSceneKey) {
            return;
        }
        if (fixture) {
            setTurns(prev => [
                ...prev,
                {
                    key: `local:${prev.length}`,
                    speakerKind: 'user',
                    speakerName: 'You',
                    vamaShaktiClass: null,
                    vakAddress: null,
                    kairosDelta: null,
                    line
                }
            ]);
            return;
        }
        gateway()
            .invoke(ARENA_TURN_ADVANCE_RPC, {
                sceneKey: activeSceneKey,
                speakerHandle: 'user',
                intent: line
            })
            .then(receipt => setTurns(prev => [...prev, turnEntryFromReceipt(receipt.artifact, line)]))
            .catch(err => setWireState(classifyWireError(err)));
    };

    const releaseWarm = (identityHandle: string) => {
        if (fixture) {
            setWarm(prev => prev.filter(row => row.identityHandle !== identityHandle));
            return;
        }
        gateway()
            .invoke(ARENA_WARM_RELEASE_RPC, { identityHandle, reason: 'gc' })
            .then(refresh)
            .catch(err => setWireState(classifyWireError(err)));
    };

    /** Warm admission stages the voice into the wizard — every summon passes
     *  the CPF gate; there is no direct-admit path (anti-leak, 41.7). */
    const stageWarmAdmission = (row: WarmVamaShaktiRow) => {
        setSetup(prev => {
            const base = prev.active ? prev : { ...initialSceneSetupState(), active: true };
            if (base.admissions.some(a => a.identityHandle === row.identityHandle)) {
                return {
                    ...base,
                    admissions: base.admissions.filter(a => a.identityHandle !== row.identityHandle)
                };
            }
            return {
                ...base,
                admissions: [
                    ...base.admissions,
                    {
                        identityHandle: row.identityHandle,
                        name: row.coordinateLabel,
                        entityCoordinate: row.coordinateLabel,
                        vamaShaktiClass: row.vamaShaktiClass,
                        classOverridden: false
                    }
                ]
            };
        });
    };

    const openScene = () => {
        // buildSceneOpenPlan throws unless the CPF (00/00) gate has cleared —
        // the pane never invokes scene_open (or summon) outside this path.
        let plan;
        const sceneKey = `arena:${(setup.pinnedCoordinate ?? 'scene').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        try {
            plan = buildSceneOpenPlan(setup, sceneKey);
        } catch {
            return; // gate not cleared; the disabled button already says why
        }
        if (fixture) {
            setScenes(prev => [
                ...prev,
                {
                    sceneKey,
                    status: 'open',
                    pinnedCoordinate: plan.open.pinnedCoordinate,
                    admittedConstitutional: plan.open.admittedConstitutional,
                    vamaShaktiCount: plan.summons.length,
                    turnCount: 0
                }
            ]);
            setRoster(
                plan.summons.map((s, i) => ({
                    key: `fixture:${i}`,
                    name: s.entityCoordinate,
                    vamaShaktiClass: s.vamaShaktiClass,
                    vakAddress: s.entityCoordinate
                }))
            );
            setActiveSceneKey(sceneKey);
            setSetup(initialSceneSetupState());
            return;
        }
        gateway()
            .invoke(ARENA_SCENE_OPEN_RPC, { ...plan.open })
            .then(async () => {
                const admitted: ArenaVamaShakti[] = [];
                for (const summon of plan.summons) {
                    const receipt = await gateway().invoke(ARENA_SUMMON_RPC, { ...summon });
                    admitted.push(normalizeVamaShaktiHandle(receipt.artifact));
                }
                setRoster(admitted);
                setActiveSceneKey(sceneKey);
                setSetup(initialSceneSetupState());
                await gateway().invoke(ARENA_SUBSCRIBE_RPC, { sceneKey }).catch(() => undefined);
                refresh();
            })
            .catch(err => setWireState(classifyWireError(err)));
    };

    if (!connected && !fixture) {
        return <div className="pane-message">Gateway disconnected.</div>;
    }

    const gate = evaluateSceneSetupGate(setup);
    const visibleWarm = warm.filter(row => warmFilter === 'all' || row.vamaShaktiClass === warmFilter);

    return (
        <div
            className="m4-arena-root"
            data-testid="m4-arena-root"
            data-view-id={DIALOGICAL_ARENA_VIEW_ID}
            data-privacy-class={ARENA_PRIVACY_MANIFEST.privacyClass}
            data-protected-bodies-projected={ARENA_PRIVACY_MANIFEST.protectedBodiesProjected ? 'true' : 'false'}
        >
            <div className="pane-toolbar m4-arena-toolbar" data-testid="m4-arena-toolbar">
                <button
                    type="button"
                    data-testid="m4-arena-new-scene"
                    onClick={() => setSetup({ ...initialSceneSetupState(), active: true })}
                >
                    New scene…
                </button>
                <span className="m4-arena-kairos-ring" data-testid="m4-arena-kairos-ring" data-connected={connected ? 'true' : 'false'}>
                    ☿ kairos {connected ? 'linked' : 'unlinked'}
                </span>
            </div>

            {wireState === 'pending-wire' ? (
                <p className="pane-message m4-arena-pending" data-testid="m4-arena-pending-wire">
                    {ARENA_WIRE_PENDING_NOTE}
                </p>
            ) : null}

            {setup.active ? (
                <section
                    className="m4-arena-wizard"
                    data-testid="m4-arena-wizard"
                    data-context="cpf-00-00"
                    data-brainstorm-confirmed={setup.brainstormConfirmed ? 'true' : 'false'}
                    data-can-open={gate.canOpen ? 'true' : 'false'}
                >
                    <header>
                        <h3>Set up a dialogical scene</h3>
                        <p className="m4-arena-wizard-cpf">Anima brainstorm · CPF (00/00)</p>
                    </header>
                    <ol className="m4-arena-wizard-steps">
                        <li>
                            <button
                                type="button"
                                data-testid="m4-arena-wizard-confirm-brainstorm"
                                data-confirmed={setup.brainstormConfirmed ? 'true' : 'false'}
                                onClick={() => setSetup(prev => ({ ...prev, brainstormConfirmed: true }))}
                            >
                                {setup.brainstormConfirmed ? 'Brainstorm confirmed ✓' : 'Confirm brainstorm with Anima'}
                            </button>
                        </li>
                        <li>
                            <input
                                type="text"
                                data-testid="m4-arena-wizard-coordinate"
                                placeholder="Pin a coordinate, e.g. M4-3"
                                defaultValue={setup.pinnedCoordinate ?? ''}
                                onChange={event => {
                                    const trimmed = event.currentTarget.value.trim();
                                    setSetup(prev => ({ ...prev, pinnedCoordinate: trimmed || null }));
                                }}
                            />
                            <span className="m4-arena-wizard-hint" data-testid="m4-arena-wizard-suggested-class">
                                suggested: {CLASSIFIER_GLYPHS[suggestVamaShaktiClass(setup.pinnedCoordinate)]}{' '}
                                {suggestVamaShaktiClass(setup.pinnedCoordinate)}
                            </span>
                        </li>
                        <li>
                            <ul className="m4-arena-wizard-admissions" data-testid="m4-arena-wizard-admissions">
                                {setup.admissions.length === 0 ? (
                                    <li className="pane-message">No voices staged — admit from the warm rail.</li>
                                ) : (
                                    setup.admissions.map(a => (
                                        <li key={a.identityHandle} data-testid="m4-arena-wizard-admission">
                                            <span aria-hidden="true">{glyphForClass(a.vamaShaktiClass)}</span> {a.name}
                                            <select
                                                data-testid="m4-arena-wizard-class"
                                                value={a.vamaShaktiClass}
                                                onChange={event =>
                                                    setSetup(prev => ({
                                                        ...prev,
                                                        admissions: prev.admissions.map(x =>
                                                            x.identityHandle === a.identityHandle
                                                                ? {
                                                                      ...x,
                                                                      vamaShaktiClass: event.currentTarget
                                                                          .value as VamaShaktiClass,
                                                                      classOverridden: true
                                                                  }
                                                                : x
                                                        )
                                                    }))
                                                }
                                            >
                                                {VAMA_SHAKTI_CLASSES.map(cls => (
                                                    <option key={cls} value={cls}>
                                                        {CLASSIFIER_GLYPHS[cls]} {cls}
                                                    </option>
                                                ))}
                                            </select>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </li>
                        <li>
                            <ul className="m4-arena-wizard-agents">
                                {CONSTITUTIONAL_AGENTS.map(agent => (
                                    <li key={agent.key}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                data-testid="m4-arena-wizard-agent"
                                                data-agent-key={agent.key}
                                                checked={setup.constitutionalParticipation.includes(agent.key)}
                                                onChange={() =>
                                                    setSetup(prev => ({
                                                        ...prev,
                                                        constitutionalParticipation:
                                                            prev.constitutionalParticipation.includes(agent.key)
                                                                ? prev.constitutionalParticipation.filter(
                                                                      key => key !== agent.key
                                                                  )
                                                                : [...prev.constitutionalParticipation, agent.key]
                                                    }))
                                                }
                                            />
                                            {agent.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ol>
                    <footer>
                        <button
                            type="button"
                            data-testid="m4-arena-wizard-cancel"
                            onClick={() => setSetup(initialSceneSetupState())}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            data-testid="m4-arena-wizard-open"
                            disabled={!gate.canOpen}
                            data-gate-reason={gate.reason}
                            onClick={gate.canOpen ? openScene : undefined}
                        >
                            Open scene
                        </button>
                    </footer>
                </section>
            ) : null}

            <nav className="m4-arena-scene-strip" data-testid="m4-arena-scene-strip">
                {scenes.length === 0 ? (
                    <span className="pane-message" data-testid="m4-arena-scene-strip-empty">
                        No open scenes
                    </span>
                ) : (
                    scenes.map(scene => (
                        <button
                            key={scene.sceneKey}
                            type="button"
                            data-testid="m4-arena-scene-tab"
                            data-scene-key={scene.sceneKey}
                            data-active={scene.sceneKey === activeSceneKey ? 'true' : 'false'}
                            onClick={() => setActiveSceneKey(scene.sceneKey)}
                        >
                            {scene.sceneKey} · {scene.vamaShaktiCount}
                        </button>
                    ))
                )}
            </nav>

            <div className="m4-arena-body">
                <div className="m4-arena-detail" data-testid="m4-arena-detail">
                    {activeScene ? (
                        <>
                            <header className="m4-arena-detail-header">
                                {activeScene.pinnedCoordinate ? (
                                    <span
                                        className="m4-arena-pinned"
                                        data-testid="m4-arena-pinned"
                                        data-coordinate={activeScene.pinnedCoordinate}
                                    >
                                        📌 {activeScene.pinnedCoordinate}
                                    </span>
                                ) : (
                                    <span data-testid="m4-arena-unpinned">unpinned</span>
                                )}
                            </header>
                            <div className="m4-arena-roster" data-testid="m4-arena-roster">
                                <span className="m4-arena-chip m4-arena-trika0" data-testid="m4-arena-trika0">
                                    <span aria-hidden="true">◉</span> You <em>Trika-0</em>
                                </span>
                                {roster.map(vama => (
                                    <span
                                        key={vama.key}
                                        className={`m4-arena-chip m4-arena-vama-${vama.vamaShaktiClass}`}
                                        data-testid="m4-arena-vama-chip"
                                        data-vama-shakti-class={vama.vamaShaktiClass}
                                        data-glyph={glyphForClass(vama.vamaShaktiClass)}
                                    >
                                        <span data-testid="m4-arena-classifier-glyph" aria-hidden="true">
                                            {glyphForClass(vama.vamaShaktiClass)}
                                        </span>{' '}
                                        {vama.name}
                                        {vama.vakAddress ? (
                                            <span className="m4-arena-vak" data-testid="m4-arena-chip-vak">
                                                {vama.vakAddress}
                                            </span>
                                        ) : null}
                                    </span>
                                ))}
                                {activeScene.admittedConstitutional.map(name => (
                                    <span
                                        key={name}
                                        className="m4-arena-chip m4-arena-constitutional-chip"
                                        data-testid="m4-arena-constitutional-chip"
                                    >
                                        <span aria-hidden="true">✶</span> {name}
                                    </span>
                                ))}
                            </div>
                            <ClassDistributionStrip distribution={distribution} />
                            <ol className="m4-arena-scrollback" data-testid="m4-arena-scrollback">
                                {turns.map(turn => (
                                    <li
                                        key={turn.key}
                                        className={`m4-arena-turn m4-arena-turn-${turn.speakerKind}`}
                                        data-testid="m4-arena-turn"
                                        data-speaker-kind={turn.speakerKind}
                                        data-vama-shakti-class={turn.vamaShaktiClass ?? ''}
                                    >
                                        <span data-testid="m4-arena-turn-speaker">
                                            <span aria-hidden="true">
                                                {turn.speakerKind === 'vama_shakti'
                                                    ? glyphForClass(turn.vamaShaktiClass)
                                                    : turn.speakerKind === 'user'
                                                      ? '◉'
                                                      : '✶'}
                                            </span>{' '}
                                            {turn.speakerName}
                                        </span>
                                        {turn.vakAddress ? (
                                            <span data-testid="m4-arena-turn-vak">{turn.vakAddress}</span>
                                        ) : null}
                                        {turn.kairosDelta ? (
                                            <span data-testid="m4-arena-turn-kairos">{turn.kairosDelta}</span>
                                        ) : null}
                                        <span data-testid="m4-arena-turn-line">
                                            {turn.line ?? '«dialogue body held at the protected-local surface»'}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <UtteranceInput onSubmit={submitUtterance} />
                        </>
                    ) : (
                        <p className="pane-message" data-testid="m4-arena-detail-empty">
                            Select an open scene, or set up a new one through the Anima brainstorm.
                        </p>
                    )}
                </div>

                <aside className="m4-arena-warm-strip" data-testid="m4-arena-warm-strip">
                    <header>
                        <h4>Warm Vama Shakti</h4>
                        <select
                            data-testid="m4-arena-warm-filter"
                            value={warmFilter}
                            onChange={event => setWarmFilter(event.currentTarget.value as VamaShaktiClass | 'all')}
                        >
                            <option value="all">All classes</option>
                            {VAMA_SHAKTI_CLASSES.map(cls => (
                                <option key={cls} value={cls}>
                                    {CLASSIFIER_GLYPHS[cls]} {cls}
                                </option>
                            ))}
                        </select>
                    </header>
                    <ul data-testid="m4-arena-warm-list">
                        {visibleWarm.length === 0 ? (
                            <li className="pane-message" data-testid="m4-arena-warm-empty">
                                No warm voices
                            </li>
                        ) : (
                            visibleWarm.map(row => (
                                <li
                                    key={row.identityHandle}
                                    data-testid="m4-arena-warm-item"
                                    data-vama-shakti-class={row.vamaShaktiClass}
                                    data-glyph={glyphForClass(row.vamaShaktiClass)}
                                >
                                    <span aria-hidden="true">{glyphForClass(row.vamaShaktiClass)}</span>{' '}
                                    {row.coordinateLabel}
                                    <span className="m4-arena-warm-actions">
                                        <button
                                            type="button"
                                            data-testid="m4-arena-warm-admit"
                                            title="Stages this voice into the CPF-gated scene-setup wizard"
                                            onClick={() => stageWarmAdmission(row)}
                                        >
                                            Admit
                                        </button>
                                        <button
                                            type="button"
                                            data-testid="m4-arena-warm-release"
                                            onClick={() => releaseWarm(row.identityHandle)}
                                        >
                                            Release
                                        </button>
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </aside>
            </div>
        </div>
    );
}

function ClassDistributionStrip({ distribution }: { readonly distribution: ClassDistribution }) {
    return (
        <span className="m4-arena-class-distribution" data-testid="m4-arena-class-distribution">
            {VAMA_SHAKTI_CLASSES.filter(cls => distribution[cls] > 0).map(cls => (
                <span key={cls} data-testid="m4-arena-class-count" data-vama-shakti-class={cls}>
                    {CLASSIFIER_GLYPHS[cls]} {distribution[cls]}
                </span>
            ))}
        </span>
    );
}

function UtteranceInput({ onSubmit }: { readonly onSubmit: (line: string) => void }) {
    const [draft, setDraft] = useState('');
    return (
        <form
            className="m4-arena-input"
            data-testid="m4-arena-input"
            onSubmit={event => {
                event.preventDefault();
                const trimmed = draft.trim();
                if (!trimmed) {
                    return;
                }
                onSubmit(trimmed);
                setDraft('');
            }}
        >
            <textarea
                data-testid="m4-arena-input-field"
                placeholder="Speak as Trika-0…"
                value={draft}
                rows={2}
                onChange={event => setDraft(event.currentTarget.value)}
            />
            <button type="submit" data-testid="m4-arena-input-send">
                Speak
            </button>
        </form>
    );
}
