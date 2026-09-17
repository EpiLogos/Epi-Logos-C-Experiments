/**
 * Coordinate: M' (shared chrome action contribution policy -- rerun 31.T31.11)
 * Residency: Body/M/pratibimba-app/src/commands
 * Position (#n): #4 -- Context/Type
 * Actualises: [[CHROME-CONTRACT]] section 10's three action-surface laws.
 * Public surface: ActionSurfaceContribution, assertActionSurfaceContribution,
 *   isPaletteCommand.
 * Does NOT own: pane selection state, artifact identity, button rendering, or
 *   command execution.
 * Contract: [[CHROME-CONTRACT]] section 10.
 */

export type ActionSurface = 'toolbar' | 'context-menu' | 'inline';

export type ActionSubject = 'active-widget' | 'selection' | 'artifact';

/** A command contribution bound to exactly one rendered action surface. */
export interface ActionSurfaceContribution {
    readonly surface: ActionSurface;
    readonly subject: ActionSubject;
}

type SurfacePolicy = Readonly<Record<ActionSurface, ActionSubject>>;

const SUBJECT_BY_SURFACE: SurfacePolicy = Object.freeze({
    toolbar: 'active-widget',
    'context-menu': 'selection',
    inline: 'artifact'
});

/** Reject a contribution whose declared subject would make its UI misleading. */
export function assertActionSurfaceContribution(contribution: ActionSurfaceContribution): void {
    const expectedSubject = SUBJECT_BY_SURFACE[contribution.surface];
    if (contribution.subject !== expectedSubject) {
        throw new Error(
            `${contribution.surface} actions require ${expectedSubject} scope; received ${contribution.subject}`
        );
    }
}

/**
 * The command palette is global. A command bound to a toolbar, selection menu,
 * or artifact must be rendered at that binding rather than leaking into it.
 */
export function isPaletteCommand(command: { readonly actionSurface?: ActionSurfaceContribution }): boolean {
    return command.actionSurface === undefined;
}
