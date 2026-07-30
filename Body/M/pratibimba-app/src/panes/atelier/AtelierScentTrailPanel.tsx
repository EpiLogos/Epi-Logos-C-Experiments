/**
 * Coordinate: M' M5-5' (Logos Atelier scent trail — 28.T28.7)
 * Residency: Body/M/pratibimba-app/src/panes/atelier/AtelierScentTrailPanel.tsx
 * Position (#n): #5 — Integration: the M5' crystallisation lens rendered over
 *   the M0' graph host it is declared to be a lens OF
 *   (`ui/dailySurfaceOwnership.ts` — "M5-5' Logos Atelier lens over M0'").
 * Actualises: tranche 28.7 (c) + (d) + (e) as chrome. The six scent-following
 *   stages with their REAL binding keys and readiness, the `etymology://`
 *   namespace verdict per provenance handle, the Aletheia lineage and its
 *   advisory vetoes, and the Möbius write-back button that crystallises a
 *   candidate and routes it to Canon Studio.
 *
 *   IT MOUNTS ONLY ON AN INTENT, AND IT READS NOTHING ON MOUNT. The panel is
 *   rendered by `GraphExplorerPane` only when a `logos-atelier` CrossLayoutIntent
 *   really routed here, and every value it shows is a prop or a declaration.
 *   `bimbaGraph` is the OPENING tab of the cosmic deep model — a surface that
 *   fetched or published on mount would fire on layout entry, on the hidden
 *   face too (THE OPENING-TAB LAW, `ui/deepPaneSet.ts`). So this one does
 *   neither: it acts only from a gesture.
 * Public surface: AtelierScentTrailPanel, AtelierScentTrailPanelProps.
 * Does NOT own: the stage sequence or command bodies (`commands/atelier.ts`),
 *   the surface law (`atelierScentTrail.ts`), the substrate disclosure
 *   (`atelierSeams.ts`), the readiness taxonomy (`ui/bridgeReadiness.ts`), or
 *   the graph read (`GraphExplorerPane`).
 * Contract: [[CHROME-CONTRACT]] §2 + §4 + §5 · rerun tranche [[28.T28.7]].
 */

import { commands } from '../../commands/registry';
import { ALETHEIA_LINEAGE, type AletheiaLineageEntry } from '../../commands/atelier';
import { BridgeReadinessBadge } from '../../ui/BridgeReadinessBadge';
import {
    admitProvenanceHandles,
    ATELIER_MUTATES_GRAPH_CANON,
    ATELIER_STAGE_BINDINGS,
    ATELIER_VETO_BLOCKS_HUMAN_GATE,
    MOBIUS_WRITE_BACK_TARGET,
    type AtelierSubagentVeto
} from './atelierScentTrail';
import { ATELIER_SEAMS } from './atelierSeams';

const MOBIUS_COMMAND = 'atelier.scentFollow';
const AXIOM_SEAM = ATELIER_SEAMS.find(seam => seam.kind === 'intent-target')!;

export interface AtelierScentTrailPanelProps {
    /** The note the `logos-atelier` intent carried, if it carried one. */
    readonly artifactUri?: string | null;
    /** The coordinate the intent carried (the root stage's subject). */
    readonly coordinate?: string | null;
    /** The trail's provenance so far — every handle faces the §5.3 gate. */
    readonly provenanceHandles?: readonly string[];
    /** Advisory Aletheia vetoes; red, recorded, and non-blocking (12.19). */
    readonly vetoes?: readonly AtelierSubagentVeto[];
    /** Injected in tests; production runs the registered Möbius command. */
    readonly onCrystallise?: () => void;
    readonly lineage?: readonly AletheiaLineageEntry[];
}

export function AtelierScentTrailPanel({
    artifactUri = null,
    coordinate = null,
    provenanceHandles = [],
    vetoes = [],
    onCrystallise,
    lineage = ALETHEIA_LINEAGE
}: AtelierScentTrailPanelProps) {
    const verdicts = admitProvenanceHandles(provenanceHandles);
    const crystallise =
        onCrystallise ?? (() => void commands.execute(MOBIUS_COMMAND).catch(() => undefined));
    // The Möbius stage needs a note to crystallise AND a live registered
    // command; without either the button refuses rather than pretending.
    const mobiusEnabled = artifactUri !== null && commands.isEnabled(MOBIUS_COMMAND);

    return (
        <section
            className="atelier-scent-trail"
            data-testid="atelier-scent-trail"
            data-view-id="pratibimba.logos-atelier"
            data-artifact-uri={artifactUri ?? undefined}
            data-coordinate={coordinate ?? undefined}
            data-mutates-graph-canon={String(ATELIER_MUTATES_GRAPH_CANON)}
        >
            <header className="atelier-scent-trail-header">
                <h3>Logos Atelier — scent trail</h3>
                <span className="atelier-governance-note" data-testid="atelier-governance-note">
                    {`mutatesGraphCanon: ${ATELIER_MUTATES_GRAPH_CANON} — the Atelier crystallises a candidate; `}
                    {`Canon Studio and Hen govern the write.`}
                </span>
            </header>

            <ol className="atelier-stages" data-testid="atelier-stages">
                {ATELIER_STAGE_BINDINGS.map(binding => (
                    <li
                        key={binding.stage.id}
                        className={`atelier-stage${binding.dispatched ? '' : ' atelier-stage-blocked'}`}
                        data-testid={`atelier-stage-${binding.stage.id}`}
                        data-method={binding.bindingKey ?? 'local'}
                        data-dispatched={String(binding.dispatched)}
                    >
                        <span className="atelier-stage-label">{binding.stage.label}</span>
                        <span className="atelier-stage-purpose">{binding.stage.purpose}</span>
                        {binding.bindingKey === null ? (
                            <span className="atelier-stage-method" data-testid={`atelier-stage-local-${binding.stage.id}`}>
                                local synthesis — no substrate call
                            </span>
                        ) : (
                            <>
                                <code className="atelier-stage-method">{binding.bindingKey}</code>
                                {binding.dispatched ? (
                                    <BridgeReadinessBadge bindingKey={binding.bindingKey} />
                                ) : null}
                            </>
                        )}
                        {binding.dispatched ? null : (
                            <span
                                className="atelier-stage-seam"
                                data-testid={`atelier-stage-blocked-${binding.stage.id}`}
                            >
                                {`disabled — \`${binding.bindingKey}\` ${binding.seam?.reason ?? 'is not dispatched anywhere in Body/S'}`}
                            </span>
                        )}
                    </li>
                ))}
            </ol>

            <div className="atelier-provenance" data-testid="atelier-provenance">
                <span className="atelier-subhead">Provenance — `etymology://` only (UX §5.3)</span>
                {verdicts.length === 0 ? (
                    <span data-testid="atelier-provenance-empty">
                        no handles on this trail yet
                    </span>
                ) : (
                    <ul>
                        {verdicts.map((verdict, index) => (
                            <li
                                key={`${verdict.handle}-${index}`}
                                data-testid={`atelier-provenance-${index}`}
                                data-admitted={String(verdict.admitted)}
                                data-scheme={verdict.scheme || undefined}
                                className={
                                    verdict.admitted
                                        ? 'atelier-provenance-handle'
                                        : 'atelier-provenance-handle atelier-provenance-refused'
                                }
                            >
                                <code>{verdict.handle}</code>
                                {verdict.reason ? <span>{verdict.reason}</span> : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="atelier-lineage" data-testid="atelier-lineage">
                <span className="atelier-subhead">
                    Aletheia lineage — evidence, never an invocation
                </span>
                {lineage.map(entry => (
                    <span
                        key={entry.subagent}
                        className="atelier-lineage-badge"
                        data-testid={`atelier-lineage-${entry.subagent}`}
                        title={entry.role}
                    >
                        {entry.subagent}
                    </span>
                ))}
            </div>

            {vetoes.map(veto => (
                <div
                    key={veto.subagent}
                    className="atelier-veto"
                    role="status"
                    data-testid={`atelier-veto-${veto.subagent}`}
                    data-blocking={String(ATELIER_VETO_BLOCKS_HUMAN_GATE)}
                >
                    {`Aletheia subagent ${veto.subagent} veto — ${veto.reason}`}
                    <span className="atelier-veto-note">
                        advisory: the human gate stays open (12.19)
                    </span>
                </div>
            ))}

            <div className="atelier-writeback" data-testid="atelier-writeback">
                <button
                    type="button"
                    data-testid="atelier-crystallise"
                    data-target={`${MOBIUS_WRITE_BACK_TARGET.requestedExtensionId}/${MOBIUS_WRITE_BACK_TARGET.requestedContributionId}`}
                    disabled={!mobiusEnabled}
                    onClick={crystallise}
                >
                    Crystallise + Send to Canon Studio
                </button>
                <button
                    type="button"
                    data-testid="atelier-axiom-crosslink"
                    disabled
                    title={AXIOM_SEAM.reason}
                >
                    Open axiom translation (26.14)
                </button>
                <span className="atelier-stage-seam" data-testid="atelier-axiom-crosslink-seam">
                    {`disabled — \`${AXIOM_SEAM.name}\` ${AXIOM_SEAM.reason}`}
                </span>
            </div>
        </section>
    );
}
