import * as React from 'react';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { OMNIPANEL_WIDGET_ID, OMNIPANEL_WIDGET_LABEL } from '../common';
import { OmniPanel } from './components/OmniPanel';

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

    protected omniState: 'hidden' | 'minimal' | 'fullscreen' = 'fullscreen';

    @postConstruct()
    protected init(): void {
        this.id = OmniPanelWidget.ID;
        this.title.label = OmniPanelWidget.LABEL;
        this.title.caption = OmniPanelWidget.LABEL;
        this.title.closable = true;
        this.addClass('pratibimba-omnipanel');
        this.update();
    }

    protected handleClose = (): void => {
        // In Theia we don't actually close — Theia owns widget lifecycle. This
        // just collapses the panel into minimal mode for the React component's
        // internal layout. Concrete dismiss is via Theia's tab close button.
        this.omniState = this.omniState === 'fullscreen' ? 'minimal' : 'fullscreen';
        this.update();
    };

    protected render(): React.ReactNode {
        return (
            <OmniPanel state={this.omniState} onClose={this.handleClose} />
        );
    }
}
