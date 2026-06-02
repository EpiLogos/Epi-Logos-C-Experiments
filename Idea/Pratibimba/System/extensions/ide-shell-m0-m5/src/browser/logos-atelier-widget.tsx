import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';

/**
 * Logos Atelier — Track 05 T4.
 *
 * Etymology namespace + staged exploration workflow. Per the plan body, the
 * Atelier is "a Theia workspace contribution" — meaning it surfaces a
 * dedicated workspace pane for word-level / sign-level / glyph-level
 * exploration with stage tracking.
 *
 * The exploration stages are derived from the QL ladder: literal-functional-
 * structural-archetypal-paradigmatic-integral (L0..L5). Each stage stores its
 * own notes, references, and provenance handles. Provenance handles are
 * surfaced to the user; nothing carries forward to the gateway except via
 * `KERNEL_BRIDGE_API.invokeCapability`.
 */
const ATELIER_STAGES = [
    { id: 'L0', label: 'L0 Literal' },
    { id: 'L1', label: 'L1 Functional' },
    { id: 'L2', label: 'L2 Structural' },
    { id: 'L3', label: 'L3 Archetypal' },
    { id: 'L4', label: 'L4 Paradigmatic' },
    { id: 'L5', label: 'L5 Integral' }
] as const;

interface AtelierStageState {
    notes: string;
    provenanceHandles: string[];
}

@injectable()
export class LogosAtelierWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.LOGOS_ATELIER;
    static readonly LABEL = 'Logos Atelier';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected currentTerm: string = '';
    protected stages: Record<string, AtelierStageState> = Object.fromEntries(
        ATELIER_STAGES.map(s => [s.id, { notes: '', provenanceHandles: [] }])
    );
    protected privacyDropped: number = 0;
    protected lastError: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = LogosAtelierWidget.ID;
        this.title.label = LogosAtelierWidget.LABEL;
        this.title.caption = LogosAtelierWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-logos-atelier');
    }

    setTerm(term: string): void {
        this.currentTerm = term;
        this.update();
    }

    setStageNotes(stageId: string, notes: string): void {
        if (this.stages[stageId]) {
            this.stages[stageId] = { ...this.stages[stageId], notes };
            this.update();
        }
    }

    /**
     * Attach a gateway provenance handle to a stage. Used when the user adds
     * an autoresearch citation or graph-node reference to the exploration.
     */
    attachProvenance(stageId: string, handle: string, privacyClass?: string): void {
        if (!isPrivacySafe(privacyClass)) {
            this.privacyDropped += 1;
            this.lastError = `Privacy class "${privacyClass}" rejected by Logos Atelier`;
            this.update();
            return;
        }
        const stage = this.stages[stageId];
        if (stage && !stage.provenanceHandles.includes(handle)) {
            stage.provenanceHandles = [...stage.provenanceHandles, handle];
            this.update();
        }
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={LogosAtelierWidget.LABEL}>
                {this.renderAtelier()}
            </IdeShellBridgeGate>
        );
    }

    protected renderAtelier(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="logos-atelier-root">
                <header className="ide-shell-widget-header">
                    <h3>{LogosAtelierWidget.LABEL}</h3>
                </header>
                <section className="ide-shell-widget-detail">
                    <label>
                        Term under exploration:{' '}
                        <input
                            type="text"
                            data-test="logos-atelier-term"
                            value={this.currentTerm}
                            onChange={e => this.setTerm(e.target.value)}
                        />
                    </label>
                    <p data-test="logos-atelier-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </p>
                    {this.lastError !== null && (
                        <p className="ide-shell-error" data-test="logos-atelier-error">
                            {this.lastError}
                        </p>
                    )}
                </section>
                {ATELIER_STAGES.map(stage => (
                    <section
                        key={stage.id}
                        className="ide-shell-widget-detail"
                        data-test={`logos-atelier-stage-${stage.id}`}
                    >
                        <h4>{stage.label}</h4>
                        <textarea
                            value={this.stages[stage.id].notes}
                            onChange={e => this.setStageNotes(stage.id, e.target.value)}
                            rows={3}
                            data-test={`logos-atelier-notes-${stage.id}`}
                        />
                        <p data-test={`logos-atelier-provenance-count-${stage.id}`}>
                            provenance handles: {this.stages[stage.id].provenanceHandles.length}
                        </p>
                        <ul data-test={`logos-atelier-provenance-${stage.id}`}>
                            {this.stages[stage.id].provenanceHandles.map(h => (
                                <li key={h}>
                                    <code>{h}</code>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        );
    }
}
