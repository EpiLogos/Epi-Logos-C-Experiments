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

export const M4_NARA_EMPTY_STATE_VIEW_ID = 'm4-nara.primary';

export interface M4NaraEmptyStateProps extends EmptyStateProps {
    readonly onStartSession?: () => void;
}

function pasuIncomplete(snapshot: MExtensionReadinessSnapshot): boolean {
    return snapshot.state === 'privacy_blocked' || snapshot.blockerIds.some(id => id.includes('pasu'));
}

export const M4NaraEmptyState: React.FC<M4NaraEmptyStateProps> = ({
    snapshot,
    missingContributors = [],
    onStartSession
}) => {
    const grammar = readinessGrammarOf(snapshot.state);
    const flavour = flavourOf(snapshot.state, snapshot);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : null;
    return (
        <section className={`m-extension-empty-state m4-nara-empty-state ${grammar.cssClass} ${flavourGrammar?.cssClass ?? ''}`}>
            <header>
                <h2>Day not yet begun.</h2>
                <span>{grammar.uxResponse.label}</span>
            </header>
            {pasuIncomplete(snapshot) && (
                <p className="pasu-incomplete-warning">PASU not configured — kairos defaulting to neutral</p>
            )}
            <p>
                Today&apos;s day folder is fresh. No NOW.md, no inscriptions, no oracle. Begin where you are.
            </p>
            <button type="button" onClick={onStartSession}>Start session</button>
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
export class M4NaraEmptyStateWidget extends ReactWidget {
    static readonly ID = M4_NARA_EMPTY_STATE_VIEW_ID;
    static readonly LABEL = 'M4 Nara Empty State';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected snapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscription?: Disposable;

    @postConstruct()
    protected init(): void {
        this.id = M4NaraEmptyStateWidget.ID;
        this.title.label = M4NaraEmptyStateWidget.LABEL;
        this.title.caption = M4NaraEmptyStateWidget.LABEL;
        this.addClass('m-extension-empty-state-widget');
        this.addClass('m4-nara-empty-state-widget');
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
        return <M4NaraEmptyState snapshot={this.snapshot} />;
    }
}
