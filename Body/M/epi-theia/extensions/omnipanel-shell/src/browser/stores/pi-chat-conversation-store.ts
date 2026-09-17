import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';

export type PiChatActor = 'Pi' | 'User' | string;
export type PiChatPrivacyClass = 'protected_local' | 'public' | 'internal' | string;

export interface PiChatDispatchGenealogy {
    readonly nodeId: string;
    readonly label: string;
}

export interface PiChatEvidenceReference {
    readonly packetId: string;
    readonly label: string;
}

export interface PiChatConversationMessage {
    readonly id: string;
    readonly actor: PiChatActor;
    readonly text: string;
    readonly timestamp: number;
    readonly dispatchGenealogy?: PiChatDispatchGenealogy;
    readonly evidence?: PiChatEvidenceReference;
    readonly privacyClass?: PiChatPrivacyClass;
}

export interface PiChatConversationSnapshot {
    readonly messages: readonly PiChatConversationMessage[];
}

@injectable()
export class PiChatConversationStore {
    protected messages: PiChatConversationMessage[] = [];
    protected readonly onDidChangeEmitter = new Emitter<readonly PiChatConversationMessage[]>();
    readonly onDidChange: Event<readonly PiChatConversationMessage[]> = this.onDidChangeEmitter.event;

    getMessages(): readonly PiChatConversationMessage[] {
        return this.messages;
    }

    appendMessage(message: PiChatConversationMessage): void {
        this.messages = [...this.messages, Object.freeze({ ...message })];
        this.fire();
    }

    replaceMessages(messages: readonly PiChatConversationMessage[]): void {
        this.messages = messages.map((message) => Object.freeze({ ...message }));
        this.fire();
    }

    clear(): void {
        if (this.messages.length === 0) {
            return;
        }
        this.messages = [];
        this.fire();
    }

    serializeForTabState(): PiChatConversationSnapshot {
        return {
            messages: this.messages.map((message) => ({ ...message }))
        };
    }

    restoreFromTabState(tabState: unknown): void {
        const snapshot = extractPiChatSnapshot(tabState);
        if (!snapshot) {
            return;
        }
        this.replaceMessages(snapshot.messages);
    }

    dispose(): void {
        this.onDidChangeEmitter.dispose();
    }

    protected fire(): void {
        this.onDidChangeEmitter.fire(this.messages);
    }
}

export function extractPiChatSnapshot(tabState: unknown): PiChatConversationSnapshot | null {
    if (!tabState || typeof tabState !== 'object') {
        return null;
    }
    const candidate = tabState as {
        messages?: unknown;
        perTabState?: Record<string, unknown>;
        ['pi-chat']?: unknown;
    };
    if (Array.isArray(candidate.messages)) {
        return { messages: candidate.messages.map(coerceMessage).filter(isMessage) };
    }
    if (candidate.perTabState?.['pi-chat']) {
        return extractPiChatSnapshot(candidate.perTabState['pi-chat']);
    }
    if (candidate['pi-chat']) {
        return extractPiChatSnapshot(candidate['pi-chat']);
    }
    return null;
}

function coerceMessage(value: unknown): PiChatConversationMessage | null {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const raw = value as Partial<PiChatConversationMessage>;
    if (typeof raw.id !== 'string' || typeof raw.actor !== 'string' || typeof raw.text !== 'string') {
        return null;
    }
    return {
        id: raw.id,
        actor: raw.actor,
        text: raw.text,
        timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
        dispatchGenealogy: raw.dispatchGenealogy,
        evidence: raw.evidence,
        privacyClass: raw.privacyClass
    };
}

function isMessage(value: PiChatConversationMessage | null): value is PiChatConversationMessage {
    return value !== null;
}
