import type { CommandRegistry } from '@theia/core/lib/common';

/**
 * Register a Pratibimba intent target command for an M-extension contribution.
 *
 * Track 05 T5 introduced `CrossLayoutIntentDispatcher` which routes intents
 * to commands shaped `pratibimba.{extensionId}.{contributionId}.open`. The
 * six M-extensions register their well-known intent target ids via this
 * helper so the dispatcher's seven canonical kinds (open-graph-node,
 * open-review-item, open-canon-studio-file, start-journal-entry,
 * deposit-review-evidence, etc.) resolve to real handlers.
 *
 * The dispatcher invokes the command with the CrossLayoutIntent as the
 * argument; the contribution typically opens its view and selects the
 * intent's coordinate / artifactUri / reviewId.
 */
export function registerIntentTarget(
    commands: CommandRegistry,
    extensionId: string,
    contributionId: string,
    label: string,
    executor: (intent: unknown) => unknown | Promise<unknown>
): void {
    const id = `pratibimba.${extensionId}.${contributionId}.open`;
    if (commands.getCommand(id)) {
        // Already registered; do nothing (idempotent).
        return;
    }
    commands.registerCommand(
        { id, label },
        {
            execute: (intent: unknown) => executor(intent)
        }
    );
}
