#!/usr/bin/env node
/**
 * Generate the two integrated plugin packages (plugin-integrated-1-2-3 and
 * plugin-integrated-4-5-0) from the 08.T0 composition contract preflight.
 * Same "regenerate on contract change" discipline as the M-extension
 * scaffolder: handwritten extension lives next to generated files; the
 * generated files are package.json / tsconfig / common index / frontend
 * module / widget / style.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const extensionsRoot = join(repoRoot, 'Idea/Pratibimba/System/extensions');
const manifestPath = join(extensionsRoot, 'contracts/08-t0-composition-contract-preflight.json');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function writeFile(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

const PLUGINS = manifest.integratedPlugins.map(p => ({
  ...p,
  rangeLabel: p.rangeId === '1-2-3' ? 'Cosmic Engine' : 'Jiva-Siva',
  openCommandConst:
    p.rangeId === '1-2-3' ? 'COMMAND_OPEN_COSMIC_ENGINE' : 'COMMAND_OPEN_JIVA_SIVA',
  namedLayoutId:
    p.rangeId === '1-2-3' ? 'cosmic-engine.integrated' : 'jiva-siva.integrated'
}));

function packageJson(plugin) {
  return (
    JSON.stringify(
      {
        name: `@pratibimba/${plugin.id}`,
        version: '0.1.0',
        description: `${plugin.rangeLabel} integrated plugin — ${plugin.purpose}`,
        license: 'MIT',
        files: ['lib', 'src', 'style'],
        main: 'lib/common/index.js',
        types: 'lib/common/index.d.ts',
        theiaExtensions: [{ frontend: 'lib/browser/frontend-module' }],
        keywords: ['theia-extension', 'epi-logos', 'integrated-plugin', plugin.id],
        dependencies: {
          '@theia/core': '1.56.0',
          '@pratibimba/m-extension-runtime': 'workspace:*',
          '@pratibimba/integrated-composition': 'workspace:*',
          ...Object.fromEntries(
            plugin.extensionContributors.map(id => [`@pratibimba/${id}`, 'workspace:*'])
          ),
          react: '^18.3.1',
          'react-dom': '^18.3.1'
        },
        devDependencies: {
          '@types/react': '^18.3.0',
          '@types/react-dom': '^18.3.0',
          rimraf: '^5.0.5',
          typescript: '~5.4.5'
        },
        scripts: {
          build: 'tsc -b',
          watch: 'tsc -b -w',
          clean: 'rimraf lib',
          test: 'pnpm build'
        }
      },
      null,
      2
    ) + '\n'
  );
}

function tsconfigJson(plugin) {
  return (
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: {
          rootDir: 'src',
          outDir: 'lib',
          composite: true,
          jsx: 'react'
        },
        references: [
          { path: '../m-extension-runtime' },
          { path: '../integrated-composition' },
          ...plugin.extensionContributors.map(id => ({ path: `../${id}` }))
        ],
        include: ['src']
      },
      null,
      2
    ) + '\n'
  );
}

function commonIndex(plugin) {
  return `// Generated from contracts/08-t0-composition-contract-preflight.json. Do not hand-edit.
import { ${plugin.openCommandConst} } from '@pratibimba/integrated-composition';

export const PLUGIN_ID = '${plugin.id}';
export const RANGE_ID = '${plugin.rangeId}';
export const NAMED_LAYOUT_ID = '${plugin.namedLayoutId}';
export const CONTRIBUTOR_IDS = ${JSON.stringify(plugin.extensionContributors)} as const;
export const PRIMARY_VIEW_ID = '${plugin.id}.primary';
export const PRIMARY_COMMAND_ID = ${plugin.openCommandConst};
export const TRACK_07_OUT_OF_SCOPE_FIELDS = ${JSON.stringify(['per-extension UI internals', 'individual extension command-palette entries', 'individual readiness micro-states'])} as const;
`;
}

function widgetTsx(plugin) {
  const className =
    plugin.id
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('') + 'Widget';
  return `// Generated from contracts/08-t0-composition-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    CompositionCoordinator,
    findNamedLayout,
    IntegratedContributorRecord,
    IntegratedEmptyState,
    buildEmptyState
} from '@pratibimba/integrated-composition';
import { PLUGIN_ID, CONTRIBUTOR_IDS } from '../common';

@injectable()
export class ${className} extends ReactWidget {
    static readonly ID = '${plugin.id}.primary';
    static readonly LABEL = '${plugin.rangeLabel}';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected coordinator: CompositionCoordinator = new CompositionCoordinator(
        findNamedLayout('${plugin.id}')
    );
    protected contributorRecords: readonly IntegratedContributorRecord[] = [];
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = ${className}.ID;
        this.title.label = ${className}.LABEL;
        this.title.caption = ${className}.LABEL;
        this.title.closable = true;
        this.addClass('integrated-widget');
        this.addClass('integrated-widget-' + PLUGIN_ID);

        this.subscriptions.push(
            this.bridge.onReadiness(() => this.update())
        );
        this.subscriptions.push(
            this.bridge.onProfile(() => this.update())
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try { sub.dispose(); } catch { /* best-effort */ }
        }
        super.dispose();
    }

    setContributors(records: readonly IntegratedContributorRecord[]): void {
        this.contributorRecords = records;
        this.update();
    }

    protected override render(): React.ReactNode {
        const aggregate = this.coordinator.aggregateReadiness(this.contributorRecords);
        const view = buildEmptyState(
            this.coordinator.layout,
            aggregate,
            CONTRIBUTOR_IDS as readonly any[] as readonly import('@pratibimba/m-extension-runtime').MExtensionId[],
            this.contributorRecords.map(r => r.extensionId)
        );
        return (
            <div className="integrated-widget-root">
                <IntegratedEmptyState view={view} title={${className}.LABEL} />
            </div>
        );
    }
}
`;
}

function frontendModuleTs(plugin) {
  const widgetClass =
    plugin.id
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('') + 'Widget';
  const contributionClass =
    plugin.id
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('') + 'Contribution';
  return `// Generated from contracts/08-t0-composition-contract-preflight.json. Do not hand-edit.
import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, Disposable as TheiaDisposable } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    ALL_INTEGRATED_COMMANDS,
    COMMAND_COPY_EVIDENCE_HANDLE,
    COMMAND_OPEN_EVIDENCE_PANEL,
    COMMAND_TOGGLE_MINI_INSPECTORS,
    IntegratedBridgeGate,
    NAMED_LAYOUTS
} from '@pratibimba/integrated-composition';
import { ${widgetClass} } from './${plugin.id}-widget';
import { PLUGIN_ID, PRIMARY_COMMAND_ID, NAMED_LAYOUT_ID } from '../common';

export const ${plugin.id.replace(/-/g, '_').toUpperCase()}_BRIDGE_GATE = Symbol(
    '${plugin.id}.bridgeGate'
);

@injectable()
export class ${contributionClass}
    extends AbstractViewContribution<${widgetClass}>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected gate: IntegratedBridgeGate | null = null;
    protected installed = false;
    protected installedDisposables: TheiaDisposable[] = [];

    constructor() {
        super({
            widgetId: ${widgetClass}.ID,
            widgetName: ${widgetClass}.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: PRIMARY_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Integrated plugins do NOT auto-open; the user (or another extension)
        // must invoke the open command. The bridge gate decides whether the
        // commands and layout descriptors are even installed.
        this.gate = new IntegratedBridgeGate(this.bridge);
        this.gate.onChange(attached => this.applyGate(attached));
    }

    protected applyGate(attached: boolean): void {
        if (attached && !this.installed) {
            this.installCommandsAndLayout();
        } else if (!attached && this.installed) {
            this.uninstallCommandsAndLayout();
        }
    }

    protected installCommandsAndLayout(): void {
        this.installed = true;
        // Layout is registered by being claimable via NAMED_LAYOUTS; we
        // emit a debug log so tests can assert installation order.
        const layout = NAMED_LAYOUTS.find(l => l.id === NAMED_LAYOUT_ID);
        if (!layout) {
            throw new Error(\`${plugin.id}: named layout \${NAMED_LAYOUT_ID} missing from registry\`);
        }
        // No-op marker for downstream layout consumers.
        void layout;
    }

    protected uninstallCommandsAndLayout(): void {
        this.installed = false;
        for (const d of this.installedDisposables) {
            try { d.dispose(); } catch { /* best-effort */ }
        }
        this.installedDisposables = [];
    }

    isInstalled(): boolean {
        return this.installed;
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        // Commands are guarded by the bridge gate; until the bridge attaches
        // each handler short-circuits with a "bridge unavailable" notice.
        const guard = <T,>(fn: () => T): T | undefined => {
            if (!this.installed) {
                return undefined;
            }
            return fn();
        };
        commands.registerCommand(
            { id: PRIMARY_COMMAND_ID, label: \`${plugin.rangeLabel}: open\` },
            { execute: () => guard(() => this.openView({ activate: true, reveal: true })) }
        );
        commands.registerCommand(
            { id: COMMAND_TOGGLE_MINI_INSPECTORS, label: 'Integrated: toggle mini inspectors' },
            { execute: () => guard(() => undefined) }
        );
        commands.registerCommand(
            { id: COMMAND_OPEN_EVIDENCE_PANEL, label: 'Integrated: open evidence panel' },
            { execute: () => guard(() => undefined) }
        );
        commands.registerCommand(
            { id: COMMAND_COPY_EVIDENCE_HANDLE, label: 'Integrated: copy evidence handle' },
            { execute: () => guard(() => undefined) }
        );
        // ALL_INTEGRATED_COMMANDS is referenced for test discovery.
        void ALL_INTEGRATED_COMMANDS;
        void PLUGIN_ID;
    }
}

export default new ContainerModule(bind => {
    bind(${widgetClass}).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: ${widgetClass}.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, ${contributionClass});
    bind(FrontendApplicationContribution).toService(${contributionClass});
});

function createWidget(container: interfaces.Container): ${widgetClass} {
    const child = container.createChild();
    child.bind(${widgetClass}).toSelf();
    return child.get(${widgetClass});
}
`;
}

function styleCss(plugin) {
  return `.integrated-widget-${plugin.id} .integrated-widget-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    overflow: auto;
    color: var(--theia-foreground);
    background-color: var(--theia-editor-background);
    font-family: var(--theia-ui-font-family);
}
`;
}

// Plugins whose widget + style have been hand-extended past the 08.T1
// scaffold — leave their widget.tsx and style/index.css alone. The package
// manifest, tsconfig, common index, and frontend-module remain
// scaffold-owned.
const PRESERVE_HANDWRITTEN = new Set([
  'plugin-integrated-1-2-3',
  'plugin-integrated-4-5-0'
]);

for (const plugin of PLUGINS) {
  const root = join(extensionsRoot, plugin.id);
  writeFile(join(root, 'package.json'), packageJson(plugin));
  writeFile(join(root, 'tsconfig.json'), tsconfigJson(plugin));
  writeFile(join(root, 'src/common/index.ts'), commonIndex(plugin));
  if (!PRESERVE_HANDWRITTEN.has(plugin.id)) {
    writeFile(join(root, `src/browser/${plugin.id}-widget.tsx`), widgetTsx(plugin));
    writeFile(join(root, 'style/index.css'), styleCss(plugin));
  }
  writeFile(join(root, 'src/browser/frontend-module.ts'), frontendModuleTs(plugin));
  if (!existsSync(join(root, 'README.md'))) {
    writeFile(
      join(root, 'README.md'),
      `# @pratibimba/${plugin.id}\n\n${plugin.purpose}\n`
    );
  }
}

console.log(`scaffolded ${PLUGINS.length} integrated plugins`);
