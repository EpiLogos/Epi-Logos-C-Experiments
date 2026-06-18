import * as React from 'react';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { CommandRegistry } from '@theia/core/lib/common';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    PrivacyDropFeed,
    type PrivacyDropAggregate
} from '@pratibimba/ide-shell-m0-m5/lib/browser/services/privacy-drop-feed';
import {
    PENDING_M_READINESS,
    type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime/lib/common/readiness';
import { OMNIPANEL_WIDGET_ID, OMNIPANEL_WIDGET_LABEL } from '../common';
import { OmniPanel } from './components/OmniPanel';
import {
    OMNIPANEL_RUNTIME_SERVICE,
    OmniPanelRuntimeService,
    type OmniPanelProfileTickTelemetry
} from './services/omnipanel-runtime-service';

/**
 * Theia widget that hosts the wholesale-ported OmniPanel React tree.
 *
 * Source migration (Track 05 T2):
 * - `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` (960 LOC) → `components/OmniPanel.tsx`
 * - `Body/S/S3/epi-app/renderer/components/omni/{chat,contracts,layout,panels,ui}/`
 *   (26 files, 3429 LOC) → `components/omni/...`
 * - `Body/S/S3/epi-app/renderer/stores/{epiClawGatewayStore,epiClawStore,domainStore}.ts`
 *   (1414 LOC) → `stores/...`
 * - `Body/S/S3/epi-app/renderer/controllers/epi-claw/{controllers,gateway-client,types}.ts`
 *   (2127 LOC) → `controllers/epi-claw/...`
 * - `Body/S/S3/epi-app/renderer/{theme/resolveTheme.ts,domain/configPanelDomain.ts}`
 *   → `theme/`, `domain/`
 *
 * The React tree is preserved adapted-not-rewritten per the migration inventory.
 * Tauri-invoke calls in the source-A slim port (`Body/M/epi-tauri/src/components/OmniPanel.tsx`)
 * are superseded by this source-B port. Electron IPC calls in the source-B tree
 * become Theia frontend↔backend module pattern in T3+ when the kernel-bridge
 * extension lands; until then the existing GatewayClient WebSocket path works
 * unchanged because the Theia browser bundle can reach the same gateway URL.
 */
@injectable()
export class OmniPanelWidget extends ReactWidget {
    static readonly ID = OMNIPANEL_WIDGET_ID;
    static readonly LABEL = OMNIPANEL_WIDGET_LABEL;

    @inject(CommandRegistry)
    protected readonly commands!: CommandRegistry;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    @inject(OMNIPANEL_RUNTIME_SERVICE)
    protected readonly runtime!: OmniPanelRuntimeService;

    protected omniState: 'hidden' | 'minimal' | 'fullscreen' = 'fullscreen';
    protected readinessSnapshot: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profileTickTelemetry: OmniPanelProfileTickTelemetry = {
        subscriberCount: 0,
        tickHistory: [],
        lastTickProcessedAt: null,
        laggingSubscribers: []
    };
    protected privacyDropAggregate: PrivacyDropAggregate = {
        byWidget: {},
        byClass: {},
        total: 0
    };
    protected privacyDropSubscription: { dispose(): void } | null = null;
    protected readinessSubscription: { dispose(): void } | null = null;
    protected profileTickSubscription: { dispose(): void } | null = null;

    @postConstruct()
    protected init(): void {
        this.id = OmniPanelWidget.ID;
        this.title.label = OmniPanelWidget.LABEL;
        this.title.caption = OmniPanelWidget.LABEL;
        this.title.closable = true;
        this.addClass('pratibimba-omnipanel');
        this.privacyDropAggregate = this.privacyDropFeed.aggregate;
        this.readinessSnapshot = this.runtime.getCurrentReadiness() ?? PENDING_M_READINESS;
        this.profileTickTelemetry = this.runtime.getProfileTickTelemetry();
        this.privacyDropSubscription = this.privacyDropFeed.onDrop(() => {
            this.privacyDropAggregate = this.privacyDropFeed.aggregate;
            this.update();
        });
        this.readinessSubscription = this.runtime.useReadiness(snapshot => {
            this.readinessSnapshot = snapshot;
            this.update();
        });
        this.profileTickSubscription = this.runtime.useProfileTick(() => {
            this.profileTickTelemetry = this.runtime.getProfileTickTelemetry();
            this.update();
        });
        this.update();
    }

    override dispose(): void {
        this.privacyDropSubscription?.dispose();
        this.privacyDropSubscription = null;
        this.readinessSubscription?.dispose();
        this.readinessSubscription = null;
        this.profileTickSubscription?.dispose();
        this.profileTickSubscription = null;
        super.dispose();
    }

    protected handleClose = (): void => {
        // In Theia we don't actually close — Theia owns widget lifecycle. This
        // just collapses the panel into minimal mode for the React component's
        // internal layout. Concrete dismiss is via Theia's tab close button.
        this.omniState = this.omniState === 'fullscreen' ? 'minimal' : 'fullscreen';
        this.update();
    };

    protected handleOpenSource = (coordinate: string, sourceAnchor: string): Promise<unknown> => {
        return this.commands.executeCommand('backend-studio.openSource', {
            coordinate,
            sourceAnchor
        });
    };

    protected render(): React.ReactNode {
        return (
            <OmniPanel
                state={this.omniState}
                onClose={this.handleClose}
                onOpenSource={this.handleOpenSource}
                readinessSnapshot={this.readinessSnapshot}
                profileTickTelemetry={this.profileTickTelemetry as any}
                onInvokeGatewayRpc={(method, params) => this.runtime.invokeGatewayRpc(method, params)}
                privacyDropAggregate={this.privacyDropAggregate}
            />
        );
    }
}
