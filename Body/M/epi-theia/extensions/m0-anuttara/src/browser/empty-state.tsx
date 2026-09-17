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

export const M0_ANUTTARA_EMPTY_STATE_VIEW_ID = 'm0-anuttara.primary';

function readinessRows(snapshot: MExtensionReadinessSnapshot): readonly string[] {
    return snapshot.blockerIds.length > 0 ? snapshot.blockerIds : [snapshot.reason];
}

export const M0AnuttaraEmptyState: React.FC<EmptyStateProps> = ({
    snapshot,
    missingContributors = []
}) => {
    const grammar = readinessGrammarOf(snapshot.state);
    const flavour = flavourOf(snapshot.state, snapshot);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : null;
    return (
        <section className={`m-extension-empty-state m0-anuttara-empty-state ${grammar.cssClass} ${flavourGrammar?.cssClass ?? ''}`}>
            <header>
                <h2>Anuttara waits — the implicate ground.</h2>
                <span>{grammar.uxResponse.label}</span>
            </header>
            <p>
                The language map is not yet populated. The bimba graph is still binding. Onboarding hint: begin a session to thread the first inscription into Anuttara&apos;s quiet.
            </p>
            <section className="missing-contributors">
                <h3>Missing contributors</h3>
                <ul>
                    {missingContributors.map(id => <li key={id}>{id}</li>)}
                </ul>
            </section>
            <section className="reasons-table">
                <h3>Blocking reasons</h3>
                <table>
                    <tbody>
                        {readinessRows(snapshot).map(reason => (
                            <tr key={reason}>
                                <td>{snapshot.state}</td>
                                <td>{reason}</td>
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
export class M0AnuttaraEmptyStateWidget extends ReactWidget {
    static readonly ID = M0_ANUTTARA_EMPTY_STATE_VIEW_ID;
    static readonly LABEL = 'M0 Anuttara Empty State';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected snapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscription?: Disposable;

    @postConstruct()
    protected init(): void {
        this.id = M0AnuttaraEmptyStateWidget.ID;
        this.title.label = M0AnuttaraEmptyStateWidget.LABEL;
        this.title.caption = M0AnuttaraEmptyStateWidget.LABEL;
        this.addClass('m-extension-empty-state-widget');
        this.addClass('m0-anuttara-empty-state-widget');
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
        return <M0AnuttaraEmptyState snapshot={this.snapshot} />;
    }
}
