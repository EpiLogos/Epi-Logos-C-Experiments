// @vitest-environment node
/**
 * Coordinate: M' (privacy-drop feed unit test — rerun 28.T28.16)
 * Residency: Body/M/pratibimba-app/src/services
 * Actualises: the 28.16 verification — the federated feed aggregates drops by
 *   surface, by class, and in total, and fans every drop out to `onDrop`
 *   subscribers (with working unsubscribe). Deterministic: every record()
 *   passes an explicit droppedAt stamp.
 */

import { describe, expect, it } from 'vitest';
import { PrivacyDropFeed, privacyDropFeed } from './privacyDropFeed';

describe('28.16 PrivacyDropFeed — aggregate', () => {
    it('populates byWidget, byClass, and total from recorded drops', () => {
        const feed = new PrivacyDropFeed();
        feed.record('journal-entry', 'protected', 1);
        feed.record('journal-entry', 'protected-local', 2);
        feed.record('kairos-strip', 'protected', 3);

        const aggregate = feed.aggregate;
        expect(aggregate.total).toBe(3);
        expect(aggregate.byWidget).toEqual({ 'journal-entry': 2, 'kairos-strip': 1 });
        expect(aggregate.byClass).toEqual({ protected: 2, 'protected-local': 1 });
    });

    it('starts empty', () => {
        const feed = new PrivacyDropFeed();
        expect(feed.aggregate).toEqual({ byWidget: {}, byClass: {}, total: 0 });
    });

    it('aggregate is a fresh snapshot each read (recording after a read does not mutate the prior snapshot)', () => {
        const feed = new PrivacyDropFeed();
        feed.record('a', 'protected', 1);
        const first = feed.aggregate;
        feed.record('a', 'protected', 2);
        expect(first.total).toBe(1);
        expect(feed.aggregate.total).toBe(2);
    });
});

describe('28.16 PrivacyDropFeed — onDrop subscription', () => {
    it('fires the exact recorded event to every subscriber', () => {
        const feed = new PrivacyDropFeed();
        const seen: unknown[] = [];
        feed.onDrop(event => seen.push(event));
        feed.onDrop(event => seen.push(event));

        feed.record('journal-entry', 'protected', 42);

        expect(seen).toEqual([
            { widgetId: 'journal-entry', privacyClass: 'protected', droppedAt: 42 },
            { widgetId: 'journal-entry', privacyClass: 'protected', droppedAt: 42 }
        ]);
    });

    it('unsubscribe stops delivery', () => {
        const feed = new PrivacyDropFeed();
        const seen: unknown[] = [];
        const off = feed.onDrop(event => seen.push(event));
        feed.record('a', 'protected', 1);
        off();
        feed.record('b', 'protected', 2);
        expect(seen).toEqual([{ widgetId: 'a', privacyClass: 'protected', droppedAt: 1 }]);
    });

    it('defaults droppedAt to a real stamp when omitted (frozen-contract parity)', () => {
        const feed = new PrivacyDropFeed();
        let stamp = -1;
        feed.onDrop(event => (stamp = event.droppedAt));
        const t0 = Date.now();
        feed.record('a', 'protected');
        expect(stamp).toBeGreaterThanOrEqual(t0);
    });
});

describe('28.16 PrivacyDropFeed — shared singleton', () => {
    it('exports a shared PrivacyDropFeed instance', () => {
        expect(privacyDropFeed).toBeInstanceOf(PrivacyDropFeed);
    });
});
