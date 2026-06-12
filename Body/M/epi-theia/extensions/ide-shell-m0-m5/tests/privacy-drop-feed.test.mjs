import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrivacyDropFeed } from '../lib/browser/services/privacy-drop-feed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_ROOT = resolve(__dirname, '..', 'src', 'browser');
const OMNIPANEL_ROOT = resolve(__dirname, '..', '..', 'omnipanel-shell', 'src', 'browser');

test('PrivacyDropFeed aggregates by widget, class, and total', () => {
    const feed = new PrivacyDropFeed();
    feed.record('widget-a', 'private', 10);
    feed.record('widget-a', 'private-profile', 11);
    feed.record('widget-b', 'private', 12);

    assert.deepEqual(feed.aggregate.byWidget, {
        'widget-a': 2,
        'widget-b': 1
    });
    assert.deepEqual(feed.aggregate.byClass, {
        private: 2,
        'private-profile': 1
    });
    assert.equal(feed.aggregate.total, 3);
});

test('PrivacyDropFeed onDrop fires the recorded event', () => {
    const feed = new PrivacyDropFeed();
    const received = [];
    const disposable = feed.onDrop(event => received.push(event));

    feed.record('widget-a', 'restricted-graphiti-body', 42);
    disposable.dispose();
    feed.record('widget-b', 'private', 43);

    assert.deepEqual(received, [
        {
            widgetId: 'widget-a',
            privacyClass: 'restricted-graphiti-body',
            droppedAt: 42
        }
    ]);
});

test('eight privacy-gated ide-shell widgets publish drops through PrivacyDropFeed', () => {
    const publisherFiles = [
        'bimba-graph-viewer-widget.tsx',
        'coordinate-tree-widget.tsx',
        'logos-atelier-widget.tsx',
        'evidence-pane-widget.tsx',
        'review-pane-widget.tsx',
        'autoresearch-pane-widget.tsx',
        'canon-studio-widget.tsx',
        'backend-studio/backend-studio-widget.tsx'
    ];

    for (const fileName of publisherFiles) {
        const source = readFileSync(resolve(SOURCE_ROOT, fileName), 'utf8');
        assert.match(source, /PrivacyDropFeed/, `${fileName} injects the feed`);
        assert.match(source, /privacyDropFeed\.record/, `${fileName} records refused privacy classes`);
    }
});

test('OmniPanel Diagnostics tab subscribes to and renders PrivacyDropFeed aggregate', () => {
    const widgetSource = readFileSync(resolve(OMNIPANEL_ROOT, 'omnipanel-widget.tsx'), 'utf8');
    const panelSource = readFileSync(
        resolve(OMNIPANEL_ROOT, 'components', 'omni', 'panels', 'PrivacyDropDiagnosticsPanel.tsx'),
        'utf8'
    );
    const omniPanelSource = readFileSync(resolve(OMNIPANEL_ROOT, 'components', 'OmniPanel.tsx'), 'utf8');

    assert.match(widgetSource, /privacyDropFeed\.onDrop/);
    assert.match(widgetSource, /privacyDropAggregate/);
    assert.match(omniPanelSource, /case 'diagnostics'/);
    assert.match(panelSource, /omnipanel-privacy-drop-total/);
    assert.match(panelSource, /omnipanel-privacy-drop-by-widget/);
    assert.match(panelSource, /omnipanel-privacy-drop-by-class/);
});
