/**
 * Coordinate: M' (federated privacy-drop feed — rerun 28.T28.16)
 * Residency: Body/M/pratibimba-app/src/services/privacyDropFeed.ts
 * Position (#n): #5 — Integration (the one feed every privacy refusal folds into)
 * Actualises: the PrivacyDropFeed contract from 28.16 — a single federated
 *   sink that records every per-surface privacy-drop (a block whose privacy
 *   gate refused before render) and aggregates it by surface, by class, and
 *   in total. The OmniPanel Diagnostics tab (27.8, not yet landed) is the
 *   consumer: it subscribes via `onDrop` and renders `aggregate`.
 * Provenance: ports the frozen contract at
 *   Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/services/privacy-drop-feed.ts
 *   as PLAIN TS — the DEAD Theia plumbing (`@injectable`, `@theia/core`
 *   `Emitter`/`Event`) is replaced by a lightweight listener set. Per
 *   CHROME-CONTRACT.md the frozen `widgetId` is retargeted to the carrier's
 *   by-surface producer: the refusing block's `type` (there are no Theia
 *   widgets in the carrier — the block host is the privacy producer).
 * Public surface: PrivacyDropEvent, PrivacyDropAggregate, PrivacyDropFeed,
 *   privacyDropFeed (shared singleton).
 * Does NOT own: the producer (blocks/BlockHost.tsx privacy-refused branch),
 *   the Diagnostics render body (27.8), the privacy vocabulary
 *   (blocks/blockContract.ts BlockPrivacyClass).
 */

export interface PrivacyDropEvent {
    /** The surface that refused — in the carrier, the refusing block's `type`. */
    readonly widgetId: string;
    /** The block's privacy class (public / protected / protected-local). */
    readonly privacyClass: string;
    /** Epoch ms the drop was recorded. */
    readonly droppedAt: number;
}

export interface PrivacyDropAggregate {
    /** Drop count keyed by surface (block type). */
    readonly byWidget: Record<string, number>;
    /** Drop count keyed by privacy class. */
    readonly byClass: Record<string, number>;
    /** Total drops recorded. */
    readonly total: number;
}

type PrivacyDropListener = (event: PrivacyDropEvent) => void;

/**
 * A federated sink for privacy-drop events. `record` appends and fans out to
 * every `onDrop` subscriber; `aggregate` is computed on read (cheap — the
 * carrier only drops on a real privacy refusal, never per-render).
 */
export class PrivacyDropFeed {
    private readonly events: PrivacyDropEvent[] = [];
    private readonly listeners = new Set<PrivacyDropListener>();

    /**
     * Record a privacy drop. Returns nothing; the event is retained for
     * aggregation and fired to every subscriber.
     * @param widgetId the refusing surface (carrier: block type)
     * @param privacyClass the refused block's privacy class
     * @param droppedAt epoch ms; defaults to `Date.now()` per the frozen
     *   contract. Tests pass an explicit stamp for determinism.
     */
    record(widgetId: string, privacyClass: string, droppedAt: number = Date.now()): void {
        const event: PrivacyDropEvent = { widgetId, privacyClass, droppedAt };
        this.events.push(event);
        for (const listener of this.listeners) {
            listener(event);
        }
    }

    /** Subscribe to drops. Returns an unsubscribe function. */
    onDrop(listener: PrivacyDropListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /** The current aggregate, computed from the recorded events. */
    get aggregate(): PrivacyDropAggregate {
        const byWidget: Record<string, number> = {};
        const byClass: Record<string, number> = {};
        for (const event of this.events) {
            byWidget[event.widgetId] = (byWidget[event.widgetId] ?? 0) + 1;
            byClass[event.privacyClass] = (byClass[event.privacyClass] ?? 0) + 1;
        }
        return { byWidget, byClass, total: this.events.length };
    }
}

/** The shared carrier feed — the default sink the block host records into. */
export const privacyDropFeed = new PrivacyDropFeed();
