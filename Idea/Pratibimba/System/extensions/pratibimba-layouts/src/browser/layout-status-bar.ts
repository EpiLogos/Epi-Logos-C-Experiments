import { injectable, inject } from '@theia/core/shared/inversify';
import { CommandRegistry } from '@theia/core/lib/common';
import { FrontendApplicationContribution, StatusBar, StatusBarAlignment } from '@theia/core/lib/browser';
import { Disposable } from '@theia/core/lib/common/disposable';
import {
    PRATIBIMBA_LAYOUT_IDE_DEEP,
    PratibimbaLayoutId
} from '../common/layout-types';
import { LAYOUT_SWITCHER } from './tokens';
import type { PratibimbaLayoutSwitcher } from './layout-switcher';
import { TOGGLE_LAYOUT } from './layout-commands';

const STATUS_BAR_ID = 'pratibimba.layout.indicator';

/**
 * Status-bar indicator showing the active workspace layout.
 *
 * Always-visible affordance for T5: clicking the indicator toggles between
 * 0/1 daily and deep IDE layouts. Complements the Pratibimba menubar and
 * gives headless tests a stable DOM target.
 */
@injectable()
export class LayoutStatusBarContribution implements FrontendApplicationContribution {
    @inject(LAYOUT_SWITCHER) protected readonly switcher!: PratibimbaLayoutSwitcher;
    @inject(StatusBar) protected readonly statusBar!: StatusBar;
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;

    protected subscription: Disposable | undefined;

    async onStart(): Promise<void> {
        this.update(this.switcher.currentLayout);
        this.subscription = {
            dispose: this.switcher.onLayoutChange.length
                ? () => undefined
                : () => undefined
        };
        // Listen for layout changes and refresh the status indicator.
        const subscription = this.switcher.onLayoutChange(change => this.update(change.currentLayout));
        this.subscription = subscription;
    }

    onStop(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        this.statusBar.removeElement(STATUS_BAR_ID);
    }

    protected update(layout: PratibimbaLayoutId): void {
        const icon = layout === PRATIBIMBA_LAYOUT_IDE_DEEP ? '$(layout)' : '$(eye)';
        const label = layout === PRATIBIMBA_LAYOUT_IDE_DEEP ? 'Deep IDE' : '0/1 Daily';
        const otherLabel = layout === PRATIBIMBA_LAYOUT_IDE_DEEP ? '0/1 Daily' : 'Deep IDE';
        this.statusBar.setElement(STATUS_BAR_ID, {
            text: `${icon} layout: ${label}`,
            tooltip: `Pratibimba workspace layout: ${label}\nClick to switch to ${otherLabel}`,
            alignment: StatusBarAlignment.LEFT,
            priority: 220,
            command: TOGGLE_LAYOUT.id
        });
        // Add a stable data attribute so headless tests can verify the layout
        // mode via DOM inspection without depending on label text.
        setTimeout(() => {
            const elements = document.querySelectorAll(
                '#theia-statusBar .element'
            );
            for (const el of Array.from(elements)) {
                if (el.textContent && el.textContent.includes('layout:')) {
                    (el as HTMLElement).setAttribute('data-pratibimba-layout', layout);
                }
            }
        }, 50);
    }
}
