/**
 * Coordinate: M' `/` membrane (Pi slash-command grammar — Tranche 27.T27.1)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the Pi Chat single-shot grammar layer — ordinary prose is
 *   multi-turn conversation dispatched through Anima; a `/`-prefixed line is
 *   a single-shot structured command. Pure law: no React, no wire.
 * Provenance: ported 2026-07-14 from the frozen
 *   Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/slash-command-parser.ts
 *   (already Theia-free; re-tested here — cribbed code counts as new code).
 * Does NOT own: dispatch execution (gateway chat.send / anima seams), the
 *   live capability list (`s4'.mediation.capabilities.list`, gated on 12.10 —
 *   LOCAL_CAPABILITY_FALLBACK is the named interim registry per the spec).
 */

export interface SlashCommand {
    readonly verb: string;                  // 'dispatch', 'cast', 'translate', 'aletheia', 'session', 'cron', 'skills'
    readonly target?: string;               // 'nous', 'iching', 'crystallise', 'resume', 'list'
    readonly args: readonly string[];
    readonly raw: string;
}

/** Translation forms recognised by `/translate` per DR-B-2 / 12.7. */
export const TRANSLATION_FORMS = [
    'philosophical-english',
    'formal-notation',
    'owl',
    'shacl'
] as const;

/**
 * Aletheia subagents (S4-5'). Per DR-B-3 these NEVER accept a direct
 * `/dispatch` — they only ever fan out through Anima crystallisation-mode.
 */
export const ALETHEIA_SUBAGENTS = [
    'techne',
    'anansi',
    'moirai',
    'janus',
    'mercurius',
    'agora',
    'zeithoven'
] as const;

const ARROW_TOKENS = new Set(['→', '->', '=>']);

/**
 * Parse a single input line. Returns null when the line is not a slash
 * command (ordinary multi-turn prose for Pi). A bare `/` returns null.
 */
export function parseSlashCommand(input: string): SlashCommand | null {
    if (typeof input !== 'string') {
        return null;
    }
    const raw = input;
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) {
        return null;
    }
    const body = trimmed.slice(1);
    if (body.length === 0) {
        return null;
    }
    const tokens = body.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) {
        return null;
    }
    const verb = tokens[0].toLowerCase();
    const target = tokens.length > 1 ? tokens[1] : undefined;
    const args = tokens.slice(2);
    return { verb, target, args, raw };
}

/** Decompose `/translate <from> → <to> <text>` into its triple, or null. */
export function parseTranslateForms(
    command: SlashCommand
): { from: string; to: string; text: string } | null {
    if (command.verb !== 'translate') {
        return null;
    }
    const body = command.raw.trim().slice(1).split(/\s+/).filter(t => t.length > 0).slice(1);
    if (body.length < 3) {
        return null;
    }
    const from = body[0];
    const arrowIndex = body.findIndex(t => ARROW_TOKENS.has(t));
    if (arrowIndex < 1 || arrowIndex + 1 >= body.length) {
        return null;
    }
    const to = body[arrowIndex + 1];
    const text = body.slice(arrowIndex + 2).join(' ');
    return { from, to, text };
}

export interface SlashCommandGuardResult {
    readonly rejected: boolean;
    readonly message?: string;
}

/**
 * DR-B-3 guard: `/dispatch <aletheia-subagent>` is rejected with the
 * canonical message; every other command passes through unchanged.
 */
export function dispatchGuard(command: SlashCommand): SlashCommandGuardResult {
    if (command.verb === 'dispatch' && command.target) {
        const target = command.target.toLowerCase();
        if ((ALETHEIA_SUBAGENTS as readonly string[]).includes(target)) {
            return {
                rejected: true,
                message:
                    'Aletheia subagents dispatch only via Anima crystallisation-mode. ' +
                    'Try `/aletheia crystallise <intent>`.'
            };
        }
    }
    return { rejected: false };
}

/** True when the input line should be treated as a slash command. */
export function isSlashCommandLine(input: string): boolean {
    return typeof input === 'string' && input.trimStart().startsWith('/');
}

export interface CapabilityCompletion {
    readonly command: string;
    readonly hint: string;
}

/**
 * The local capability registry — the spec-named fallback until the live
 * `s4'.mediation.capabilities.list` seam lands (12.10). One row per
 * canonical verb form; the completion provider filters by prefix.
 */
export const LOCAL_CAPABILITY_FALLBACK: readonly CapabilityCompletion[] = Object.freeze([
    { command: '/dispatch <agent>', hint: 'Anima single sub-agent envelope' },
    { command: '/cast <iching|tarot|quintessence>', hint: 'single-shot oracle cast, inline' },
    { command: '/translate <from> → <to> <text>', hint: 'Pi axiom-translation (DR-B-2)' },
    { command: '/aletheia crystallise <intent>', hint: 'the ONLY path to Aletheia subagent fan-out' },
    { command: '/session resume <id>', hint: 'khora session_resume' },
    { command: '/session start [topic]', hint: 'khora session_start — writes [[NOW-{session}]]' },
    { command: '/skills list', hint: 'skill facet inventory' },
    { command: '/cron list', hint: 'cron facet inventory' }
]);

/** Filter the capability registry by the current slash prefix. */
export function completionsFor(input: string): readonly CapabilityCompletion[] {
    if (!isSlashCommandLine(input)) {
        return Object.freeze([]);
    }
    const prefix = input.trimStart().toLowerCase();
    if (prefix === '/') {
        return LOCAL_CAPABILITY_FALLBACK;
    }
    return Object.freeze(
        LOCAL_CAPABILITY_FALLBACK.filter(entry => entry.command.toLowerCase().startsWith(prefix.split(/\s+/)[0]))
    );
}
