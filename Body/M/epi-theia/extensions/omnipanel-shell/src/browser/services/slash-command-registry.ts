import { injectable } from '@theia/core/shared/inversify';
import { Disposable } from '@theia/core/lib/common/disposable';
import {
    dispatchGuard,
    parseTranslateForms,
    type SlashCommand
} from './slash-command-parser';

export type SlashCommandResultKind = 'inline' | 'rejected' | 'navigation';

export interface SlashCommandResult {
    readonly kind: SlashCommandResultKind;
    readonly message: string;
    readonly payload?: unknown;
}

export interface SlashCommandHandlerContext {
    readonly sessionKey?: string;
    readonly dayId?: string;
    readonly invokeGatewayRpc?: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    readonly activateTab?: (tabId: string, payload?: Record<string, unknown>) => unknown;
    readonly sendPiMessage?: (message: string, options?: { sessionKey?: string }) => Promise<unknown>;
}

export type SlashCommandHandler = (
    command: SlashCommand,
    context: SlashCommandHandlerContext
) => Promise<SlashCommandResult> | SlashCommandResult;

export interface SlashCommandDescriptor {
    readonly verb: string;
    readonly description: string;
    readonly allowedTargets?: readonly string[];
}

const DESCRIPTORS: readonly SlashCommandDescriptor[] = Object.freeze([
    {
        verb: 'aletheia',
        description: 'Crystallise an Aletheia intent through Anima.',
        allowedTargets: Object.freeze(['crystallise'])
    },
    {
        verb: 'cast',
        description: 'Cast a single-shot oracle.',
        allowedTargets: Object.freeze(['iching', 'tarot', 'quintessence'])
    },
    {
        verb: 'cron',
        description: 'Open cron gateway facets.',
        allowedTargets: Object.freeze(['list'])
    },
    {
        verb: 'dispatch',
        description: 'Dispatch Anima with a single constitutional sub-agent envelope.'
    },
    {
        verb: 'session',
        description: 'Start or resume a Khora session.',
        allowedTargets: Object.freeze(['resume', 'start'])
    },
    {
        verb: 'skills',
        description: 'Open skill gateway facets.',
        allowedTargets: Object.freeze(['list'])
    },
    {
        verb: 'translate',
        description: 'Translate Pi axioms between supported notation forms.',
        allowedTargets: Object.freeze(['philosophical-english', 'formal-notation', 'owl', 'shacl'])
    }
] as const);

@injectable()
export class SlashCommandRegistry {
    protected readonly handlers = new Map<string, SlashCommandHandler>();
    protected readonly descriptors = new Map<string, SlashCommandDescriptor>(
        DESCRIPTORS.map((descriptor) => [descriptor.verb, descriptor])
    );

    register(verb: string, handler: SlashCommandHandler): Disposable {
        const normalized = verb.trim().toLowerCase();
        if (!normalized) {
            throw new Error('SlashCommandRegistry.register requires a verb.');
        }
        this.handlers.set(normalized, handler);
        return Disposable.create(() => {
            if (this.handlers.get(normalized) === handler) {
                this.handlers.delete(normalized);
            }
        });
    }

    resolve(command: SlashCommand): SlashCommandHandler | undefined {
        return this.handlers.get(command.verb.toLowerCase());
    }

    listVerbs(): readonly SlashCommandDescriptor[] {
        return [...this.descriptors.values()].sort((a, b) => a.verb.localeCompare(b.verb));
    }
}

export function createDefaultSlashCommandRegistry(context: SlashCommandHandlerContext = {}): SlashCommandRegistry {
    const registry = new SlashCommandRegistry();
    registerDefaultSlashCommands(registry, context);
    return registry;
}

export function registerDefaultSlashCommands(
    registry: SlashCommandRegistry,
    boundContext: SlashCommandHandlerContext = {}
): readonly Disposable[] {
    const bind = (handler: SlashCommandHandler): SlashCommandHandler => {
        return (command, context) => handler(command, { ...boundContext, ...context });
    };

    return [
        registry.register('dispatch', bind(handleDispatch)),
        registry.register('cast', bind(handleCast)),
        registry.register('translate', bind(handleTranslate)),
        registry.register('aletheia', bind(handleAletheia)),
        registry.register('session', bind(handleSession)),
        registry.register('skills', bind(handleSkills)),
        registry.register('cron', bind(handleCron))
    ];
}

async function handleDispatch(command: SlashCommand, context: SlashCommandHandlerContext): Promise<SlashCommandResult> {
    const guard = dispatchGuard(command);
    if (guard.rejected) {
        return {
            kind: 'rejected',
            message: guard.message ?? 'Dispatch rejected.'
        };
    }
    const agent = command.target;
    if (!agent) {
        return { kind: 'rejected', message: 'Usage: /dispatch <agent>' };
    }
    const payload = await invoke(context, "s4'.mediation.route", {
        route: 'anima_self_invoke',
        agent,
        args: command.args,
        sessionKey: context.sessionKey ?? null,
        raw: command.raw
    });
    return {
        kind: 'inline',
        message: `Dispatch trace emitted for Anima → ${agent}.`,
        payload
    };
}

async function handleCast(command: SlashCommand, context: SlashCommandHandlerContext): Promise<SlashCommandResult> {
    const oracle = command.target;
    if (!oracle || !['iching', 'tarot', 'quintessence'].includes(oracle)) {
        return { kind: 'rejected', message: 'Usage: /cast iching|tarot|quintessence' };
    }
    const payload = await invoke(context, 's4.oracle.cast', {
        oracle,
        args: command.args,
        sessionKey: context.sessionKey ?? null
    });
    return { kind: 'inline', message: `Oracle cast returned for ${oracle}.`, payload };
}

async function handleTranslate(command: SlashCommand, context: SlashCommandHandlerContext): Promise<SlashCommandResult> {
    const translation = parseTranslateForms(command);
    if (!translation || !translation.text.trim()) {
        return {
            kind: 'rejected',
            message: 'Usage: /translate <from> → <to> <text>'
        };
    }
    const payload = await invoke(context, "s4'.axiom.translate", {
        ...translation,
        sessionKey: context.sessionKey ?? null,
        evidenceEntryType: 'AxiomTranslationStep'
    });
    return {
        kind: 'inline',
        message: `Axiom translation ${translation.from} → ${translation.to} returned.`,
        payload
    };
}

async function handleAletheia(command: SlashCommand, context: SlashCommandHandlerContext): Promise<SlashCommandResult> {
    if (command.target !== 'crystallise' || command.args.length === 0) {
        return {
            kind: 'rejected',
            message: 'Usage: /aletheia crystallise <intent>'
        };
    }
    const intent = command.args.join(' ');
    const payload = await invoke(context, "s4'.mediation.route", {
        route: 'anima_self_invoke',
        aletheiaCrystallisationMode: true,
        intent,
        sessionKey: context.sessionKey ?? null
    });
    return {
        kind: 'inline',
        message: 'Aletheia crystallisation-mode dispatch trace emitted.',
        payload
    };
}

async function handleSession(command: SlashCommand, context: SlashCommandHandlerContext): Promise<SlashCommandResult> {
    if (command.target === 'resume' && command.args[0]) {
        const sessionId = command.args[0];
        const payload = await invoke(context, 's4.khora.session_resume', { session_id: sessionId });
        return {
            kind: 'inline',
            message: `Session resumed: [[NOW-${sessionId}]].`,
            payload
        };
    }
    if (command.target === 'start') {
        const topic = command.args.join(' ').trim() || undefined;
        const payload = await invoke(context, 's4.khora.session_start', {
            topic,
            day_id: context.dayId ?? null
        });
        return {
            kind: 'inline',
            message: 'Khora session started.',
            payload
        };
    }
    return { kind: 'rejected', message: 'Usage: /session resume <session-id> or /session start [topic]' };
}

function handleSkills(command: SlashCommand, context: SlashCommandHandlerContext): SlashCommandResult {
    if (command.target !== 'list') {
        return { kind: 'rejected', message: 'Usage: /skills list' };
    }
    const payload = context.activateTab?.('gateway', { facet: 'SkillFacetView' });
    return { kind: 'navigation', message: 'Opening gateway skills facet.', payload };
}

function handleCron(command: SlashCommand, context: SlashCommandHandlerContext): SlashCommandResult {
    if (command.target !== 'list') {
        return { kind: 'rejected', message: 'Usage: /cron list' };
    }
    const payload = context.activateTab?.('gateway', { facet: 'CronFacetView' });
    return { kind: 'navigation', message: 'Opening gateway cron facet.', payload };
}

async function invoke(
    context: SlashCommandHandlerContext,
    method: string,
    params: Record<string, unknown>
): Promise<unknown> {
    if (!context.invokeGatewayRpc) {
        return { gatewayMethod: method, params, deferred: true };
    }
    return context.invokeGatewayRpc(method, params);
}
