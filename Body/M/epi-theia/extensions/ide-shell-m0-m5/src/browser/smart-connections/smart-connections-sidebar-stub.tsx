import * as React from 'react';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    ReadinessBanner,
    type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';

const CODE_PENDING_READINESS = Object.freeze({
    fetchedAt: 0,
    state: 'code-pending',
    reason: 'pending-extension',
    profileGeneration: null,
    bridgeReachable: false,
    blockerIds: Object.freeze(['pending-extension'])
}) as unknown as MExtensionReadinessSnapshot;

@injectable()
export class SmartConnectionsSidebarStub extends ReactWidget {
    static readonly ID = 'pratibimba.smart-connections-sidebar';
    static readonly LABEL = 'Smart Connections';

    @postConstruct()
    protected init(): void {
        this.id = SmartConnectionsSidebarStub.ID;
        this.title.label = SmartConnectionsSidebarStub.LABEL;
        this.title.caption = SmartConnectionsSidebarStub.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-smart-connections-stub');
    }

    protected override render(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="smart-connections-stub">
                <ReadinessBanner
                    extensionId={SmartConnectionsSidebarStub.ID}
                    extensionLabel={SmartConnectionsSidebarStub.LABEL}
                    snapshot={CODE_PENDING_READINESS}
                    declaredBlockers={['pending-extension', 'track_03_t6_5']}
                    provenance="MIGRATION-SOURCES.md"
                />
                <section className="ide-shell-widget-detail">
                    <p>
                        Smart Connections sidebar — pending extension scaffold at Track 03 T6.5.
                        This stub satisfies the ide-shell layout-claim; the real extension arrives
                        at Track 17/18.
                    </p>
                    <p>
                        Migration context: <code>MIGRATION-SOURCES.md</code>.
                    </p>
                    <p
                        className="ide-shell-widget-empty"
                        title="Awaiting Track 03 T6.5"
                        data-test="smart-connections-progress"
                    >
                        pending-extension
                    </p>
                </section>
            </div>
        );
    }
}

export const SMART_CONNECTIONS_ACTIVITY_BAR_MODE = Object.freeze({
    id: 'smart-connections',
    label: SmartConnectionsSidebarStub.LABEL,
    iconClass: 'codicon-link',
    widgetId: SmartConnectionsSidebarStub.ID,
    availableInLayouts: Object.freeze(['ide-deep']),
    codePendingMarker: 'track_03_t6_5'
});

@injectable()
export class SmartConnectionsSidebarStubContribution
    extends AbstractViewContribution<SmartConnectionsSidebarStub>
{
    constructor() {
        super({
            widgetId: SmartConnectionsSidebarStub.ID,
            widgetName: SmartConnectionsSidebarStub.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: 'pratibimba.ide-shell-m0-m5.smart-connections-sidebar.toggle'
        });
    }

    async onStart(): Promise<void> { /* layout opens this pending surface on demand */ }
}
