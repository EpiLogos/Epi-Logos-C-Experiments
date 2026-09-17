import { injectable } from '@theia/core/shared/inversify';
import { Command, CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { useEpiClawGatewayStore } from './stores/epiClawGatewayStore';
import { OPEN_OMNIPANEL } from './omnipanel-contribution';

/**
 * Open the OmniPanel directly on the Dispatch Trace tab, which renders the
 * Pi → Anima → Aletheia techne-guardian dispatch genealogy for the active
 * session (falling back to the canonical reference topology).
 */
export const OPEN_DISPATCH_TRACE: Command = {
    id: 'pratibimba.omnipanel.dispatchTrace.open',
    label: 'Pratibimba: Open Dispatch Trace'
};

@injectable()
export class DispatchTracePanelContribution implements CommandContribution {
    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(OPEN_DISPATCH_TRACE, {
            execute: async () => {
                useEpiClawGatewayStore.getState().setActivePanel('dispatch-trace');
                await registry.executeCommand(OPEN_OMNIPANEL.id);
            }
        });
    }
}
