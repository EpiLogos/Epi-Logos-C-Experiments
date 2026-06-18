import * as React from 'react';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    EmptyStateProps,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    SHARED_BRIDGE_ADAPTER,
    SharedBridgeAdapter,
    flavourOf,
    readinessFlavourGrammarOf,
    readinessGrammarOf
} from '@pratibimba/m-extension-runtime';

export const M2_PARASHAKTI_EMPTY_STATE_VIEW_ID = 'm2-parashakti.primary';

export const M2ParashaktiEmptyState: React.FC<EmptyStateProps> = ({
    snapshot,
    missingContributors = []
}) => {
    const grammar = readinessGrammarOf(snapshot.state);
    const flavour = flavourOf(snapshot.state, snapshot);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : null;
    return (
        <section className={`m-extension-empty-state m2-parashakti-empty-state ${grammar.cssClass} ${flavourGrammar?.cssClass ?? ''}`}>
            <header>
                <h2>Cymatic surface unmodulated — awaiting M1 profile.</h2>
                <span>{grammar.uxResponse.label}</span>
            </header>
            <p>
                Readiness chain: <a href="command:omnipanel.openTab?diagnostics">M1 → audio_bus → cymatic_field</a>.
            </p>
            {snapshot.missingDataset && (
                <p className="pending-dataset-chip">pending-dataset: {snapshot.missingDataset}</p>
            )}
            <section className="missing-contributors">
                <h3>Missing contributors</h3>
                <ul>{missingContributors.map(id => <li key={id}>{id}</li>)}</ul>
            </section>
            <section className="reasons-table">
                <h3>Blocking reasons</h3>
                <table>
                    <tbody>
                        {snapshot.blockerIds.map(id => (
                            <tr key={id}>
                                <td>{snapshot.state}</td>
                                <td>{id}</td>
                            </tr>
                        ))}
                        <tr>
                            <td>detail</td>
                            <td>{snapshot.reason}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </section>
    );
};

@injectable()
export class M2ParashaktiEmptyStateWidget extends ReactWidget {
    static readonly ID = M2_PARASHAKTI_EMPTY_STATE_VIEW_ID;
    static readonly LABEL = 'M2 Parashakti Empty State';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected snapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscription?: Disposable;

    @postConstruct()
    protected init(): void {
        this.id = M2ParashaktiEmptyStateWidget.ID;
        this.title.label = M2ParashaktiEmptyStateWidget.LABEL;
        this.title.caption = M2ParashaktiEmptyStateWidget.LABEL;
        this.addClass('m-extension-empty-state-widget');
        this.addClass('m2-parashakti-empty-state-widget');
        this.subscription = this.bridge.onReadiness(snapshot => {
            this.snapshot = snapshot;
            this.update();
        });
    }

    override dispose(): void {
        this.subscription?.dispose();
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return <M2ParashaktiEmptyState snapshot={this.snapshot} />;
    }
}
