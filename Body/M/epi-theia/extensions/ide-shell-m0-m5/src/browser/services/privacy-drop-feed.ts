import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';

export interface PrivacyDropEvent {
    readonly widgetId: string;
    readonly privacyClass: string;
    readonly droppedAt: number;
}

export interface PrivacyDropAggregate {
    readonly byWidget: Record<string, number>;
    readonly byClass: Record<string, number>;
    readonly total: number;
}

@injectable()
export class PrivacyDropFeed {
    protected readonly events: PrivacyDropEvent[] = [];
    protected readonly emitter = new Emitter<PrivacyDropEvent>();
    readonly onDrop: Event<PrivacyDropEvent> = this.emitter.event;

    record(widgetId: string, privacyClass: string, droppedAt: number = Date.now()): void {
        const event = { widgetId, privacyClass, droppedAt };
        this.events.push(event);
        this.emitter.fire(event);
    }

    get aggregate(): PrivacyDropAggregate {
        const byWidget: Record<string, number> = {};
        const byClass: Record<string, number> = {};
        for (const event of this.events) {
            byWidget[event.widgetId] = (byWidget[event.widgetId] ?? 0) + 1;
            byClass[event.privacyClass] = (byClass[event.privacyClass] ?? 0) + 1;
        }
        return {
            byWidget,
            byClass,
            total: this.events.length
        };
    }
}
