import { injectable, inject } from '@theia/core/shared/inversify';
import { CommandRegistry, Command, CommandContribution } from '@theia/core/lib/common';
import {
    CrossLayoutIntent,
    intentTargetCommandId,
    WELL_KNOWN_INTENT_KINDS,
    WellKnownIntentKind,
    layoutOnlyIntent
} from '../common/cross-layout-intent';
import {
    PRATIBIMBA_LAYOUT_DAILY_0_1,
    PRATIBIMBA_LAYOUT_IDE_DEEP
} from '../common/layout-types';
import { LAYOUT_SWITCHER } from './tokens';
import type { PratibimbaLayoutSwitcher } from './layout-switcher';
import { PratibimbaSessionStateService } from './session-state-service';

/** Token for the dispatcher service. */
export const CROSS_LAYOUT_INTENT_DISPATCHER = Symbol('PratibimbaCrossLayoutIntentDispatcher');

/** The single command that everyone calls to dispatch an intent. */
export const DISPATCH_INTENT_COMMAND: Command = {
    id: 'pratibimba.intent.dispatch',
    label: 'Pratibimba: Dispatch Intent (advanced)'
};

/** Convenience commands for the seven well-known intent kinds (T5 deliverable). */
const WELL_KNOWN_COMMANDS: Record<WellKnownIntentKind, Command> = {
    'open-deep-ide': {
        id: 'pratibimba.intent.open-deep-ide',
        label: 'Pratibimba: Open Deep IDE Layout'
    },
    'return-to-daily-layout': {
        id: 'pratibimba.intent.return-to-daily-layout',
        label: 'Pratibimba: Return to 0/1 Daily Layout'
    },
    'open-review-item': {
        id: 'pratibimba.intent.open-review-item',
        label: 'Pratibimba: Open Review Item'
    },
    'open-graph-node': {
        id: 'pratibimba.intent.open-graph-node',
        label: 'Pratibimba: Open Graph Node'
    },
    'open-canon-studio-file': {
        id: 'pratibimba.intent.open-canon-studio-file',
        label: 'Pratibimba: Open Canon Studio File'
    },
    'start-journal-entry': {
        id: 'pratibimba.intent.start-journal-entry',
        label: 'Pratibimba: Start Journal Entry'
    },
    'deposit-review-evidence': {
        id: 'pratibimba.intent.deposit-review-evidence',
        label: 'Pratibimba: Deposit Review Evidence'
    }
};

/**
 * Cross-layout intent dispatcher — Track 05 T5 canonical command-membrane router.
 *
 * Dispatch flow:
 *   1. Caller fires `pratibimba.intent.dispatch` with a `CrossLayoutIntent`.
 *   2. The dispatcher materialises the requested layout via `PratibimbaLayoutSwitcher`
 *      with the current `PratibimbaSessionState` snapshotted into `PreservedLayoutState`.
 *   3. After the layout transition completes (one tick of onLayoutChange), the
 *      dispatcher invokes the target command id derived from the intent.
 *   4. If no target id is set (layout-only intent), dispatch ends after step 2.
 *
 * The dispatcher does NOT mutate session state — consumers update via
 * `PratibimbaSessionStateService` directly. State preservation across the
 * layout transition is guaranteed because the session-state service is
 * process-scoped and not torn down by layout switching.
 *
 * Receivers register their command id as `pratibimba.{extensionId}.{contributionId}.open`
 * via the standard Theia `CommandContribution`.
 */
@injectable()
export class CrossLayoutIntentDispatcher implements CommandContribution {
    @inject(LAYOUT_SWITCHER) protected readonly switcher!: PratibimbaLayoutSwitcher;
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;
    @inject(PratibimbaSessionStateService) protected readonly sessionState!: PratibimbaSessionStateService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(DISPATCH_INTENT_COMMAND, {
            execute: (intent: CrossLayoutIntent) => this.dispatch(intent)
        });
        for (const kind of WELL_KNOWN_INTENT_KINDS) {
            const cmd = WELL_KNOWN_COMMANDS[kind];
            commands.registerCommand(cmd, {
                execute: (arg?: Partial<CrossLayoutIntent>) =>
                    this.dispatch(this.buildWellKnownIntent(kind, arg))
            });
        }
    }

    /** Programmatic entry point — equivalent to firing the dispatch command. */
    async dispatch(intent: CrossLayoutIntent): Promise<void> {
        // 1. Snapshot session state for the layout transition.
        const session = this.sessionState.state;
        const preserved = {
            selectedCoordinate: session.selectedCoordinate,
            sessionKey: session.sessionKey,
            dayNowContext: session.dayNow,
            profileGeneration: session.profileGeneration,
            // bridgeSubscriptionId is owned by kernel-bridge; we don't have
            // direct read access without an injection, so pass null. Track 03
            // wires this once the bridge surfaces its subscription id.
            bridgeSubscriptionId: null
        };

        // 2. Materialise the requested layout (no-op if already active).
        if (this.switcher.currentLayout !== intent.requestedLayout) {
            await this.switcher.switchTo(intent.requestedLayout, preserved);
        }

        // 3. Update session-state from intent fields (coordinate, artifact, etc.).
        // Skip null fields so the intent only positively SETs known context.
        this.sessionState.update({
            ...(intent.coordinate !== null ? { selectedCoordinate: intent.coordinate } : {}),
            ...(intent.artifactUri !== null ? { artifactUri: intent.artifactUri } : {}),
            ...(intent.dayNow !== null ? { dayNow: intent.dayNow } : {}),
            ...(intent.sessionKey !== null ? { sessionKey: intent.sessionKey } : {}),
            ...(intent.profileGeneration !== null
                ? { profileGeneration: intent.profileGeneration }
                : {}),
            ...(intent.privacyClass !== null ? { privacyClass: intent.privacyClass } : {})
        });
        if (intent.reviewId) {
            this.sessionState.pushReview(intent.reviewId);
        }

        // 4. Invoke target command (intra-process — no IPC).
        const targetCommand = intentTargetCommandId(intent);
        if (targetCommand && this.commands.getCommand(targetCommand)) {
            await this.commands.executeCommand(targetCommand, intent);
        }
    }

    /** Map a well-known intent kind to a CrossLayoutIntent shape. */
    protected buildWellKnownIntent(
        kind: WellKnownIntentKind,
        overrides?: Partial<CrossLayoutIntent>
    ): CrossLayoutIntent {
        const sess = this.sessionState.state;
        const base: CrossLayoutIntent = {
            coordinate: sess.selectedCoordinate,
            artifactUri: sess.artifactUri,
            reviewId: null,
            dayNow: sess.dayNow,
            sessionKey: sess.sessionKey,
            profileGeneration: sess.profileGeneration,
            privacyClass: sess.privacyClass,
            requestedLayout: PRATIBIMBA_LAYOUT_IDE_DEEP,
            requestedExtensionId: null,
            requestedContributionId: null,
            reason: `well-known: ${kind}`
        };
        switch (kind) {
            case 'open-deep-ide':
                return { ...base, ...overrides, requestedLayout: PRATIBIMBA_LAYOUT_IDE_DEEP };
            case 'return-to-daily-layout':
                return { ...layoutOnlyIntent(PRATIBIMBA_LAYOUT_DAILY_0_1, 'return-to-daily'), ...overrides };
            case 'open-review-item':
                return {
                    ...base,
                    requestedLayout: PRATIBIMBA_LAYOUT_IDE_DEEP,
                    requestedExtensionId: 'm5-epii',
                    requestedContributionId: 'review',
                    ...overrides
                };
            case 'open-graph-node':
                return {
                    ...base,
                    requestedLayout: PRATIBIMBA_LAYOUT_IDE_DEEP,
                    requestedExtensionId: 'm0-anuttara',
                    requestedContributionId: 'graph',
                    ...overrides
                };
            case 'open-canon-studio-file':
                return {
                    ...base,
                    requestedLayout: PRATIBIMBA_LAYOUT_IDE_DEEP,
                    requestedExtensionId: 'ide-shell-m0-m5',
                    requestedContributionId: 'canon-studio',
                    ...overrides
                };
            case 'start-journal-entry':
                return {
                    ...base,
                    requestedLayout: PRATIBIMBA_LAYOUT_DAILY_0_1,
                    requestedExtensionId: 'm4-nara',
                    requestedContributionId: 'journal',
                    ...overrides
                };
            case 'deposit-review-evidence':
                return {
                    ...base,
                    requestedLayout: PRATIBIMBA_LAYOUT_IDE_DEEP,
                    requestedExtensionId: 'm5-epii',
                    requestedContributionId: 'evidence-deposit',
                    ...overrides
                };
        }
    }
}
