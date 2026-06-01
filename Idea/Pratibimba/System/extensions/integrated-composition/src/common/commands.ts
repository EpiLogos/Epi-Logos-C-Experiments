/**
 * The five integrated commands declared by 08.T1. They are exported as
 * literals so plugin packages and tests reference the same string IDs.
 *
 * Naming follows the `epi.integrated.<verb>` pattern from the task body —
 * not the per-extension `mN.*` namespace.
 */
export const COMMAND_OPEN_COSMIC_ENGINE = 'epi.integrated.openCosmicEngine';
export const COMMAND_OPEN_JIVA_SIVA = 'epi.integrated.openJivaSiva';
export const COMMAND_TOGGLE_MINI_INSPECTORS = 'epi.integrated.toggleMiniInspectors';
export const COMMAND_OPEN_EVIDENCE_PANEL = 'epi.integrated.openEvidencePanel';
export const COMMAND_COPY_EVIDENCE_HANDLE = 'epi.integrated.copyEvidenceHandle';

export const ALL_INTEGRATED_COMMANDS = Object.freeze([
    COMMAND_OPEN_COSMIC_ENGINE,
    COMMAND_OPEN_JIVA_SIVA,
    COMMAND_TOGGLE_MINI_INSPECTORS,
    COMMAND_OPEN_EVIDENCE_PANEL,
    COMMAND_COPY_EVIDENCE_HANDLE
] as const);
