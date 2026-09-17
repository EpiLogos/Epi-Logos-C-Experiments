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

export const M3_MAHAMAYA_EMPTY_STATE_VIEW_ID = 'm3-mahamaya.primary';

export const M3MahamayaEmptyState: React.FC<EmptyStateProps> = ({
    snapshot,
    missingContributors = []
}) => {
    const grammar = readinessGrammarOf(snapshot.state);
    const flavour = flavourOf(snapshot.state, snapshot);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : null;
    return (
        <section className={`m-extension-empty-state m3-mahamaya-empty-state ${grammar.cssClass} ${flavourGrammar?.cssClass ?? ''}`}>
            <header>
                <h2>Cosmic clock at noon — awaiting first tick.</h2>
                <span>{grammar.uxResponse.label}</span>
            </header>
            <p>
                Readiness link: <a href="command:omnipanel.openTab?diagnostics">readiness.ledger</a>. The wheel begins to rotate when M1 first advances. 64 codons stand waiting.
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
export class M3MahamayaEmptyStateWidget extends ReactWidget {
    static readonly ID = M3_MAHAMAYA_EMPTY_STATE_VIEW_ID;
    static readonly LABEL = 'M3 Mahamaya Empty State';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected snapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscription?: Disposable;

    @postConstruct()
    protected init(): void {
        this.id = M3MahamayaEmptyStateWidget.ID;
        this.title.label = M3MahamayaEmptyStateWidget.LABEL;
        this.title.caption = M3MahamayaEmptyStateWidget.LABEL;
        this.addClass('m-extension-empty-state-widget');
        this.addClass('m3-mahamaya-empty-state-widget');
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
        return <M3MahamayaEmptyState snapshot={this.snapshot} />;
    }
}
