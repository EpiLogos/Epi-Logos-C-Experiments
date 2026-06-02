import { injectable, inject } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry,
    Command
} from '@theia/core/lib/common';
import {
    DISPATCH_INTENT_COMMAND,
    PratibimbaSessionStateService,
    SESSION_STATE_SERVICE
} from '@pratibimba/pratibimba-layouts';
import {
    BODY_DEEP_LINK_COMMAND_IDS,
    buildOpenControlRoomIntent,
    buildOpenGraphNodeIntent,
    buildOpenReviewItemIntent,
    buildStartProtectedEntryIntent,
    type OpenControlRoomPayload,
    type OpenGraphNodePayload,
    type OpenReviewItemPayload,
    type StartProtectedEntryPayload
} from '../common';

/**
 * Typed deep-link intent commands — Track 09 T9b.
 *
 * Registers the four `pratibimba.body.*` commands. Each takes a typed
 * payload, projects it into a `CrossLayoutIntent`, then fires the
 * canonical dispatch command `pratibimba.intent.dispatch` on the
 * OmniPanel `CrossLayoutIntentDispatcher` (Track 05 T5).
 *
 * The dispatcher MATERIALISES the requested layout BEFORE invoking the
 * target command — so the deep IDE layout is up and the target
 * contribution (control-room run-flow, m5-epii review, m0-anuttara
 * graph, or m4-nara journal) opens with the full payload context.
 */
@injectable()
export class BodyDeepLinkCommandContribution implements CommandContribution {
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;
    @inject(SESSION_STATE_SERVICE)
    protected readonly sessionState!: PratibimbaSessionStateService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(
            this.cmd(BODY_DEEP_LINK_COMMAND_IDS.OPEN_CONTROL_ROOM, 'Body: Open Control Room'),
            {
                execute: (payload?: OpenControlRoomPayload) =>
                    this.dispatchOpenControlRoom(payload)
            }
        );
        commands.registerCommand(
            this.cmd(BODY_DEEP_LINK_COMMAND_IDS.OPEN_REVIEW_ITEM, 'Body: Open Review Item'),
            {
                execute: (payload?: OpenReviewItemPayload) =>
                    this.dispatchOpenReviewItem(payload)
            }
        );
        commands.registerCommand(
            this.cmd(BODY_DEEP_LINK_COMMAND_IDS.OPEN_GRAPH_NODE, 'Body: Open Graph Node'),
            {
                execute: (payload?: OpenGraphNodePayload) =>
                    this.dispatchOpenGraphNode(payload)
            }
        );
        commands.registerCommand(
            this.cmd(
                BODY_DEEP_LINK_COMMAND_IDS.START_PROTECTED_ENTRY,
                'Body: Start Protected Entry'
            ),
            {
                execute: (payload?: StartProtectedEntryPayload) =>
                    this.dispatchStartProtectedEntry(payload)
            }
        );
    }

    /** Programmatic entry point — dispatch via the canonical Track 05 T5 command. */
    async dispatchOpenControlRoom(payload?: OpenControlRoomPayload): Promise<void> {
        const intent = buildOpenControlRoomIntent(this.withSessionDefaults(payload));
        await this.commands.executeCommand(DISPATCH_INTENT_COMMAND.id, intent);
    }

    async dispatchOpenReviewItem(payload?: OpenReviewItemPayload): Promise<void> {
        const enriched = this.withSessionDefaults(payload);
        const intent = buildOpenReviewItemIntent({
            ...enriched,
            candidateId: payload?.candidateId ?? '',
            humanRequired: payload?.humanRequired ?? false
        } as OpenReviewItemPayload);
        await this.commands.executeCommand(DISPATCH_INTENT_COMMAND.id, intent);
    }

    async dispatchOpenGraphNode(payload?: OpenGraphNodePayload): Promise<void> {
        const enriched = this.withSessionDefaults(payload);
        const intent = buildOpenGraphNodeIntent({
            ...enriched,
            nodeId: payload?.nodeId ?? enriched.coordinate ?? ''
        } as OpenGraphNodePayload);
        await this.commands.executeCommand(DISPATCH_INTENT_COMMAND.id, intent);
    }

    async dispatchStartProtectedEntry(payload?: StartProtectedEntryPayload): Promise<void> {
        const enriched = this.withSessionDefaults(payload);
        const intent = buildStartProtectedEntryIntent({
            ...enriched,
            consentToken: payload?.consentToken ?? null
        } as StartProtectedEntryPayload);
        await this.commands.executeCommand(DISPATCH_INTENT_COMMAND.id, intent);
    }

    /**
     * Fill missing payload fields from the current session state so the
     * full BodyDeepLinkContext is preserved across the layout switch.
     */
    protected withSessionDefaults<T extends Partial<OpenControlRoomPayload> | undefined>(
        payload: T
    ): OpenControlRoomPayload {
        const sess = this.sessionState.state;
        return {
            focusCandidateId: (payload as OpenControlRoomPayload | undefined)?.focusCandidateId ?? null,
            focusRunId: (payload as OpenControlRoomPayload | undefined)?.focusRunId ?? null,
            coordinate: payload?.coordinate ?? sess.selectedCoordinate ?? null,
            artifactUri: payload?.artifactUri ?? sess.artifactUri ?? null,
            reviewId: payload?.reviewId ?? null,
            improvementId: payload?.improvementId ?? null,
            sessionKey: payload?.sessionKey ?? sess.sessionKey ?? null,
            dayNow: payload?.dayNow ?? sess.dayNow ?? null,
            profileGeneration: payload?.profileGeneration ?? sess.profileGeneration ?? null,
            privacyClass: payload?.privacyClass ?? sess.privacyClass ?? 'public'
        };
    }

    protected cmd(id: string, label: string): Command {
        return { id, label };
    }
}
