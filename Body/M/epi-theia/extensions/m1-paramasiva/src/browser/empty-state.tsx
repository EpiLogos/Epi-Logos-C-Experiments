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

export const M1_PARAMASIVA_EMPTY_STATE_VIEW_ID = 'm1-paramasiva.primary';

function coldStartStep(snapshot: MExtensionReadinessSnapshot): string {
    const marker = snapshot.blockerIds.find(id => id.startsWith('cold_start.step.'));
    return marker ? marker.slice('cold_start.step.'.length) : 'unknown';
}

export const M1ParamasivaEmptyState: React.FC<EmptyStateProps> = ({
    snapshot,
    missingContributors = []
}) => {
    const grammar = readinessGrammarOf(snapshot.state);
    const flavour = flavourOf(snapshot.state, snapshot);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : null;
    return (
        <section className={`m-extension-empty-state m1-paramasiva-empty-state ${grammar.cssClass} ${flavourGrammar?.cssClass ?? ''}`}>
            <header>
                <h2>K² torus rests — profile-tick has not fired.</h2>
                <span>{grammar.uxResponse.label}</span>
            </header>
            <p>
                Bridge readiness: <a href="command:omnipanel.openTab?gateway">omnipanel.gateway</a>. The played torus comes alive when the first profile-tick advances. Cold-start orchestrator is at step {coldStartStep(snapshot)}.
            </p>
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
export class M1ParamasivaEmptyStateWidget extends ReactWidget {
    static readonly ID = M1_PARAMASIVA_EMPTY_STATE_VIEW_ID;
    static readonly LABEL = 'M1 Paramasiva Empty State';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected snapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscription?: Disposable;

    @postConstruct()
    protected init(): void {
        this.id = M1ParamasivaEmptyStateWidget.ID;
        this.title.label = M1ParamasivaEmptyStateWidget.LABEL;
        this.title.caption = M1ParamasivaEmptyStateWidget.LABEL;
        this.addClass('m-extension-empty-state-widget');
        this.addClass('m1-paramasiva-empty-state-widget');
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
        return <M1ParamasivaEmptyState snapshot={this.snapshot} />;
    }
}
