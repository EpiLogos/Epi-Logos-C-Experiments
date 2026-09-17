import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const originalLoad = Module._load;
Module._load = function loadJournalEntriesTestDependency(request, parent, isMain) {
    if (request === '@theia/core/shared/inversify') {
        return {
            injectable: () => target => target,
            inject: () => () => undefined,
            postConstruct: () => () => undefined
        };
    }
    if (request === '@theia/core/lib/common') {
        return {
            CommandService: Symbol.for('CommandService'),
            CommandRegistry: class CommandRegistry {},
            CommandContribution: Symbol.for('CommandContribution')
        };
    }
    if (request === '@theia/core/lib/browser') {
        return { FrontendApplicationContribution: Symbol.for('FrontendApplicationContribution') };
    }
    if (request === '@theia/core/lib/browser/preferences') {
        return { PreferenceService: Symbol.for('PreferenceService') };
    }
    if (request === '@theia/core/lib/browser/shell/view-contribution') {
        return {
            AbstractViewContribution: class AbstractViewContribution {
                constructor(options) {
                    this.options = options;
                }
                openView() {
                    return Promise.resolve({});
                }
                registerCommands() {
                    return undefined;
                }
            }
        };
    }
    if (request === '@theia/core/lib/browser/widgets/react-widget') {
        return {
            ReactWidget: class ReactWidget {
                title = {};
                addClass() {
                    return undefined;
                }
                update() {
                    return undefined;
                }
                dispose() {
                    return undefined;
                }
            }
        };
    }
    if (request === '@pratibimba/m-extension-runtime') {
        return {
            EMPTY_COORDINATE_CONTEXT: {
                selectedCoordinate: null,
                profileGeneration: null,
                pointerAnchor: null,
                dayNowSessionHandle: null,
                privacyClass: 'public_current',
                provenance: { source: 'test', generation: null, notes: [] }
            },
            SHARED_BRIDGE_ADAPTER: Symbol.for('SHARED_BRIDGE_ADAPTER'),
            CROSS_EXTENSION_ROUTE_CONTRACTS: [],
            REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS: []
        };
    }
    if (request === '@pratibimba/integrated-composition/design-primitives') {
        return {};
    }
    return originalLoad.call(this, request, parent, isMain);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    JOURNAL_ENTRIES_VIEW_ID,
    JOURNAL_TIMELINE_METHOD,
    JOURNAL_TIMELINE_DAY_RANGE,
    JOURNAL_ENTRIES_ACTIVITY_BAR_SLOT,
    JOURNAL_ENTRIES_ACTIVITY_BAR_MODE,
    M4_JOURNAL_TIMELINE_CARD_EXPORT,
    M4JournalTimelineCard,
    normalizeJournalTimeline,
    isJournalEntriesVisibleInLayout,
    shortSessionKey,
    journalArtifactKindIcon
} = require('../m4-nara/lib/browser/widgets/journal-entries-sidebar.js');

const common = require('../m4-nara/lib/common/index.js');

// A 7-day fixture: one NOW.md inscription per day, latest day NOT pre-sorted.
function sevenDayFixture() {
    const days = [
        ['2026-06-12', '08:14', 'aaa', ['journal']],
        ['2026-06-18', '21:02', 'ggg', ['journal', 'oracle', 'dream']],
        ['2026-06-14', '11:30', 'ccc', ['contemplative']],
        ['2026-06-13', '17:45', 'bbb', ['journal', 'agent-chat']],
        ['2026-06-17', '06:20', 'fff', ['reminder']],
        ['2026-06-15', '23:59', 'ddd', ['oracle']],
        ['2026-06-16', '09:05', 'eee', ['journal', 'dream']]
    ];
    return {
        dayRange: 7,
        entries: days.map(([dayId, hhmm, key, kinds]) => ({
            dayId,
            nowHandle: `m4://protected-local/now/${dayId}/${key}`,
            sessionKey: `20260101-${hhmm.replace(':', '')}-${key}`,
            inscribedAt: `${dayId}T${hhmm}:00`,
            artifacts: kinds.map((kind, i) => ({
                artifactHandle: `m4://protected-local/artifact/${dayId}/${kind}/${i}`,
                kind,
                title: `${kind} on ${dayId}`
            }))
        }))
    };
}

test('view id + RPC wiring are exported and load-bearing', () => {
    assert.equal(JOURNAL_ENTRIES_VIEW_ID, 'm4.nara.journalEntries');
    assert.equal(JOURNAL_TIMELINE_METHOD, 'nara.journal.timeline');
    assert.equal(JOURNAL_TIMELINE_DAY_RANGE, 30);
    assert.equal(M4_JOURNAL_TIMELINE_CARD_EXPORT, 'M4JournalTimelineCard');
    // common/index.ts wiring (grep target).
    assert.ok(common.ALL_VIEW_IDS.includes('m4.nara.journalEntries'));
    assert.equal(common.JOURNAL_TIMELINE_RPC_METHOD, 'nara.journal.timeline');
    assert.equal(common.JOURNAL_ENTRIES_ACTIVITY_BAR_SLOT, 'widget.application-shell-left');
    assert.ok(common.TRACK_08_EXPORTS.includes('M4JournalTimelineCard'));
});

test('activity-bar mode contributes to the daily-0-1 left slot ONLY', () => {
    assert.equal(JOURNAL_ENTRIES_ACTIVITY_BAR_SLOT, 'widget.application-shell-left');
    assert.equal(JOURNAL_ENTRIES_ACTIVITY_BAR_MODE.slot, 'widget.application-shell-left');
    assert.equal(JOURNAL_ENTRIES_ACTIVITY_BAR_MODE.widgetId, 'm4.nara.journalEntries');
    assert.deepEqual([...JOURNAL_ENTRIES_ACTIVITY_BAR_MODE.availableInLayouts], ['daily-0-1']);
    assert.equal(JOURNAL_ENTRIES_ACTIVITY_BAR_MODE.availableInLayouts.length, 1);
});

test('gate: mode is visible in daily-0-1 and hidden in ide-deep (15.3)', () => {
    assert.equal(isJournalEntriesVisibleInLayout('daily-0-1'), true);
    assert.equal(isJournalEntriesVisibleInLayout('ide-deep'), false);
    assert.ok([...JOURNAL_ENTRIES_ACTIVITY_BAR_MODE.hiddenInLayouts].includes('ide-deep'));
});

test('timeline render consumes the 7-day fixture, latest day first', () => {
    const entries = normalizeJournalTimeline(sevenDayFixture());
    assert.equal(entries.length, 7);
    // Sorted descending by inscription time: 18 → 17 → 16 → 15 → 14 → 13 → 12.
    assert.deepEqual(
        entries.map(e => e.dayId),
        ['2026-06-18', '2026-06-17', '2026-06-16', '2026-06-15', '2026-06-14', '2026-06-13', '2026-06-12']
    );
    // The richest day carries its full kind-icon ribbon.
    assert.deepEqual(
        entries[0].artifacts.map(a => a.kind),
        ['journal', 'oracle', 'dream']
    );
    assert.equal(shortSessionKey(entries[0].sessionKey), '20260101'.slice(0, 8));
    assert.equal(journalArtifactKindIcon('oracle'), 'O');
});

test('normalizeJournalTimeline drops malformed rows and unknown artifact kinds', () => {
    const entries = normalizeJournalTimeline({
        entries: [
            { dayId: '2026-06-18', nowHandle: 'h1', artifacts: [{ artifactHandle: 'a', kind: 'journal' }] },
            { dayId: '', nowHandle: 'h2' }, // no dayId
            { nowHandle: 'h3' }, // no dayId
            { dayId: '2026-06-17' }, // no handle
            {
                dayId: '2026-06-16',
                nowHandle: 'h4',
                artifacts: [{ artifactHandle: 'x', kind: 'not-a-kind' }, { artifactHandle: 'y', kind: 'dream' }]
            }
        ]
    });
    assert.deepEqual(entries.map(e => e.dayId), ['2026-06-18', '2026-06-16']);
    assert.deepEqual(entries[1].artifacts.map(a => a.kind), ['dream']);
});

test('M4JournalTimelineCard renders timeline rows, day chips, and kind ribbon', () => {
    const entries = normalizeJournalTimeline(sevenDayFixture());
    const opened = [];
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4JournalTimelineCard, {
            entries,
            dayRange: 7,
            onOpenArtifact: handle => opened.push(handle)
        })
    );
    assert.match(markup, /data-test="M4JournalTimelineCard"/);
    assert.match(markup, /data-track="TRACK_08"/);
    assert.match(markup, /data-view-id="m4\.nara\.journalEntries"/);
    assert.match(markup, /mext-privacy-protected-local/);
    assert.match(markup, /data-test="m4-journal-entry-day-chip"/);
    assert.match(markup, /data-test="m4-journal-artifact-icon"/);
    // 7 timeline rows.
    assert.equal((markup.match(/data-test="m4-journal-entry-row"/g) || []).length, 7);
});

test('empty timeline renders an empty-state, not rows', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4JournalTimelineCard, {
            entries: [],
            dayRange: 30,
            onOpenArtifact: () => undefined
        })
    );
    assert.match(markup, /data-test="m4-journal-entries-empty"/);
    assert.doesNotMatch(markup, /data-test="m4-journal-entry-row"/);
});
