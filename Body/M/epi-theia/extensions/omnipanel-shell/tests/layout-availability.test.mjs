import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
    OMNIPANEL_TABS
} = require('../lib/common/omnipanel-types.js');
const {
    collapseOmniPanelManifest,
    filterOmniPanelTabsForLayout
} = require('../lib/common/omnipanel-runtime.js');

test('canonical OmniPanel tabs declare the layouts they can render inside', () => {
    for (const tab of OMNIPANEL_TABS) {
        assert.deepEqual(
            tab.availableInLayouts,
            ['daily-0-1', 'ide-deep'],
            `${tab.id} must be explicit about cross-layout availability`
        );
    }
});

test('OmniPanel manifest filters tabs by the active layout preference value', () => {
    const tabs = [
        ...OMNIPANEL_TABS,
        {
            id: 'deep-shadow',
            label: 'Deep-only Diagnostics Shadow',
            icon: 'activity',
            extensionId: '@pratibimba/kernel-bridge',
            priority: 900,
            availableInLayouts: ['ide-deep']
        }
    ];

    const daily = filterOmniPanelTabsForLayout(tabs, 'daily-0-1');
    const deep = filterOmniPanelTabsForLayout(tabs, 'ide-deep');

    assert.equal(daily.filter(tab => tab.label === 'Deep-only Diagnostics Shadow').length, 0);
    assert.equal(deep.filter(tab => tab.label === 'Deep-only Diagnostics Shadow').length, 1);

    const dailyManifest = collapseOmniPanelManifest(tabs, 'deep-shadow', 'daily-0-1');
    assert.equal(dailyManifest.defaultTab, 'pi-chat');
    assert.deepEqual(
        dailyManifest.tabs.map(tab => tab.id),
        OMNIPANEL_TABS.map(tab => tab.id)
    );
});
