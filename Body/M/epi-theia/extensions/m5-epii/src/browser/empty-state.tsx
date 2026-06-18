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

export const M5_EPII_EMPTY_STATE_VIEW_ID = 'm5-epii.primary';

export const M5EpiiEmptyState: React.FC<EmptyStateProps> = ({
    snapshot,
    missingContributors = []
}) => {
    const grammar = readinessGrammarOf(snapshot.state);
    const flavour = flavourOf(snapshot.state, snapshot);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : null;
    return (
        <section className={`m-extension-empty-state m5-epii-empty-state ${grammar.cssClass} ${flavourGrammar?.cssClass ?? ''}`}>
            <header>
                <h2>Atelier quiet.</h2>
                <span>{grammar.uxResponse.label}</span>
            </header>
            <p>dispatch-history-empty: no prior dispatch entries are available.</p>
            <p>review-queue-empty: no review queue payload has arrived.</p>
            <p>No pending review. No dispatch in flight. The atelier listens.</p>
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
export class M5EpiiEmptyStateWidget extends ReactWidget {
    static readonly ID = M5_EPII_EMPTY_STATE_VIEW_ID;
    static readonly LABEL = 'M5 Epii Empty State';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected snapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscription?: Disposable;

    @postConstruct()
    protected init(): void {
        this.id = M5EpiiEmptyStateWidget.ID;
        this.title.label = M5EpiiEmptyStateWidget.LABEL;
        this.title.caption = M5EpiiEmptyStateWidget.LABEL;
        this.addClass('m-extension-empty-state-widget');
        this.addClass('m5-epii-empty-state-widget');
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
        return <M5EpiiEmptyState snapshot={this.snapshot} />;
    }
}
