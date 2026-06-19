import { inject, injectable } from '@theia/core/shared/inversify';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { isPrivacySafe } from '../../common/contract';

export const PI_AXIOM_TRANSLATION_HISTORY_METHOD = "s5'.epii.axiom_translation_history";
export const ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH =
    'Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md';
export const PI_AXIOM_TRANSLATION_SOURCE_COORDINATE =
    'S4.pi-agent.anuttara-symbolic-parse';

export interface AxiomTranslationStep {
    readonly id: string;
    readonly philosophicalEnglish: string;
    readonly formalNotation: string;
    readonly owl: string;
    readonly shacl: string;
    readonly transitionReasoning: string;
    readonly sourceSkillPath: string;
    readonly sourceAnchor: string;
}

export interface PiAxiomTranslationSession {
    readonly id: string;
    readonly initiatingDispatchNodeId: string;
    readonly steps: readonly AxiomTranslationStep[];
    readonly verifiedBy: 'pi' | 'human' | 'pending';
}

export interface PiAxiomTranslationHistoryFilter {
    readonly dispatchNodeId?: string | null;
    readonly sessionId?: string | null;
    readonly question?: string | null;
}

export interface PiAxiomTranslationViewModel {
    readonly sessions: readonly PiAxiomTranslationSession[];
    readonly selectedSessionId: string | null;
    readonly identityNarrative: string;
}

export const PI_AXIOM_TRANSLATION_IDENTITY_NARRATIVE =
    'Pi axiom translation moves a candidate canonical articulation from natural language through formal notation to OWL/SHACL machine-checkable form. Each translation step is a Pi tool invocation; verification is human-final for load-bearing canon (CLAUDE.md ur-process: Human = Vision + Final Validation).';

@injectable()
export class PiAxiomTranslationService {
    @inject(KERNEL_BRIDGE_API)
    public readonly bridge!: KernelBridgeAPI;

    async fetchHistory(
        filter: PiAxiomTranslationHistoryFilter = {}
    ): Promise<readonly PiAxiomTranslationSession[]> {
        const receipt = await this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: 'ide-shell-pi-axiom-translation',
            params: {
                gatewayMethod: PI_AXIOM_TRANSLATION_HISTORY_METHOD,
                dispatchNodeId: filter.dispatchNodeId ?? null,
                sessionId: filter.sessionId ?? null,
                question: filter.question ?? null,
                sourceSkillPath: ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH
            },
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: [ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH],
            vak: null
        });
        if (!isPrivacySafe(receipt.privacyClass)) {
            throw new Error(
                `PiAxiomTranslationInspector refused privacy class "${receipt.privacyClass}"`
            );
        }
        return normalizePiAxiomTranslationSessions(receipt.artifact);
    }
}

export function createPiAxiomTranslationViewModel(
    sessions: readonly PiAxiomTranslationSession[],
    selectedSessionId: string | null = sessions[0]?.id ?? null
): PiAxiomTranslationViewModel {
    return Object.freeze({
        sessions: Object.freeze([...sessions]),
        selectedSessionId,
        identityNarrative: PI_AXIOM_TRANSLATION_IDENTITY_NARRATIVE
    });
}

export function normalizePiAxiomTranslationSessions(
    artifact: unknown
): readonly PiAxiomTranslationSession[] {
    const raw = Array.isArray(artifact)
        ? artifact
        : isRecord(artifact) && Array.isArray(artifact.sessions)
            ? artifact.sessions
            : isRecord(artifact) && Array.isArray(artifact.history)
                ? artifact.history
                : [];
    return Object.freeze(raw.map(normalizeSession).filter((s): s is PiAxiomTranslationSession => s !== null));
}

function normalizeSession(value: unknown): PiAxiomTranslationSession | null {
    if (!isRecord(value)) {
        return null;
    }
    const id = stringField(value, 'id') ?? stringField(value, 'sessionId');
    const initiatingDispatchNodeId =
        stringField(value, 'initiatingDispatchNodeId') ??
        stringField(value, 'dispatchNodeId') ??
        stringField(value, 'initiating_dispatch_node_id');
    const steps = Array.isArray(value.steps)
        ? value.steps.map(normalizeStep).filter((s): s is AxiomTranslationStep => s !== null)
        : [];
    if (!id || !initiatingDispatchNodeId) {
        return null;
    }
    return Object.freeze({
        id,
        initiatingDispatchNodeId,
        steps: Object.freeze(steps),
        verifiedBy: normalizeVerifiedBy(value.verifiedBy)
    });
}

function normalizeStep(value: unknown): AxiomTranslationStep | null {
    if (!isRecord(value)) {
        return null;
    }
    const id = stringField(value, 'id') ?? stringField(value, 'stepId');
    if (!id) {
        return null;
    }
    return Object.freeze({
        id,
        philosophicalEnglish:
            stringField(value, 'philosophicalEnglish') ??
            stringField(value, 'philosophical_english') ??
            '',
        formalNotation:
            stringField(value, 'formalNotation') ??
            stringField(value, 'formal_notation') ??
            '',
        owl: stringField(value, 'owl') ?? '',
        shacl: stringField(value, 'shacl') ?? '',
        transitionReasoning:
            stringField(value, 'transitionReasoning') ??
            stringField(value, 'transition_reasoning') ??
            '',
        sourceSkillPath:
            stringField(value, 'sourceSkillPath') ??
            stringField(value, 'source_skill_path') ??
            ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH,
        sourceAnchor:
            stringField(value, 'sourceAnchor') ??
            stringField(value, 'source_anchor') ??
            'Axiom Translation Surface'
    });
}

function normalizeVerifiedBy(value: unknown): PiAxiomTranslationSession['verifiedBy'] {
    return value === 'human' || value === 'pi' || value === 'pending'
        ? value
        : 'pending';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}

function stringField(value: Record<string, unknown>, field: string): string | null {
    const raw = value[field];
    return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
}
