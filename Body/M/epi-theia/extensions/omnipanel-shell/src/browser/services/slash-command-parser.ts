/**
 * Slash-command grammar parser for the Pi Chat membrane (Tranche 27.1).
 *
 * Pi is a conversational membrane: ordinary prose is dispatched through Anima
 * as multi-turn conversation, while a `/`-prefixed line is a single-shot
 * structured command. This module is the PURE grammar layer — no Theia, no
 * Inversify, no React — so it is unit-testable in isolation (node:test).
 *
 * Canonical verbs (registered by `frontend-module.ts` at OmniPanel mount):
 *   /dispatch <agent>            — Anima single sub-agent envelope (anima_self_invoke)
 *   /cast <oracle>               — iching | tarot | quintessence (single-shot, inline)
 *   /translate <from> → <to> ... — Pi axiom-translation (DR-B-2 / 12.7)
 *   /aletheia crystallise <i>    — ONLY path through which Aletheia subagents fan out
 *   /session resume <id>         — s4.khora.session_resume
 *   /session start [topic]       — s4.khora.session_start (writes [[NOW-{session}]])
 *   /skills list                 — opens gateway tab at SkillFacetView
 *   /cron list                   — opens gateway tab at CronFacetView
 *
 * Per DR-B-3: direct `/dispatch <aletheia-subagent>` is REJECTED — Aletheia
 * subagents dispatch only via Anima crystallisation-mode (`/aletheia crystallise`).
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
export type TranslationForm = (typeof TRANSLATION_FORMS)[number];

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

/** The arrow tokens accepted between translation forms. */
const ARROW_TOKENS = new Set(['→', '->', '=>']);

export class SlashCommandParser {
    /**
     * Parse a single input line. Returns null when the line is not a slash
     * command (i.e. ordinary multi-turn prose for Pi). A bare `/` with no verb
     * also returns null.
     */
    parse(input: string): SlashCommand | null {
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
}

/**
 * Decompose a parsed `/translate` command into its from/to/text triple.
 * `/translate philosophical-english → owl <text>` →
 *   { from: 'philosophical-english', to: 'owl', text: '<text>' }
 * Returns null when the command is not a well-formed translate command.
 */
export function parseTranslateForms(
    command: SlashCommand
): { from: string; to: string; text: string } | null {
    if (command.verb !== 'translate') {
        return null;
    }
    // tokens after the verb: [from, arrow, to, ...text]
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
 * DR-B-3 guard. `/dispatch <aletheia-subagent>` is rejected with the canonical
 * explanatory message; every other command passes through unchanged.
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
