#!/usr/bin/env node
/**
 * Generate per-package scaffolding for the six M-extensions from the canonical
 * 07.T0 contract manifest. Idempotent: rewrites only the generated files so a
 * `node scripts/scaffold-m-extensions.mjs` after a manifest edit refreshes the
 * scaffolds. Human edits to widget bodies live alongside under
 * `src/browser/<id>-extension-body.tsx` (not regenerated).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const extensionsRoot = join(repoRoot, 'Body/M/epi-theia/extensions');
const manifestPath = join(extensionsRoot, 'contracts/07-t0-extension-contract-preflight.json');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function writeFile(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function packageJson(entry) {
  return (
    JSON.stringify(
      {
        name: `@pratibimba/${entry.id}`,
        version: '0.1.0',
        description: `${entry.id} M-extension scaffold. First-slice priority: ${entry.firstSlicePriority}`,
        license: 'MIT',
        files: ['lib', 'src', 'style'],
        main: 'lib/common/index.js',
        types: 'lib/common/index.d.ts',
        theiaExtensions: [{ frontend: 'lib/browser/frontend-module' }],
        keywords: ['theia-extension', 'epi-logos', 'm-extension', entry.id],
        dependencies: {
          '@theia/core': '1.56.0',
          '@pratibimba/m-extension-runtime': 'workspace:*',
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

function tsconfigJson() {
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
        references: [{ path: '../m-extension-runtime' }],
        include: ['src']
      },
      null,
      2
    ) + '\n'
  );
}

function commonIndex(entry) {
  const primaryView = entry.viewIds[0];
  const miniModesByExtension = {
    'm0-anuttara': ['compact-card', 'mini-view', 'inspector'],
    'm1-paramasiva': ['compact-card', 'mini-view'],
    'm2-parashakti': ['compact-card', 'mini-view'],
    'm3-mahamaya': ['badge', 'mini-view'],
    'm4-nara': ['badge', 'compact-card', 'inspector'],
    'm5-epii': ['badge', 'compact-card', 'inspector']
  };
  const routeContractsByExtension = {
    'm0-anuttara': ['m0.coordinate-to-m1.walk'],
    'm1-paramasiva': ['m1.walk-to-m2.meaning-packet'],
    'm2-parashakti': ['m2.det-evidence-to-m3.codon-projection'],
    'm3-mahamaya': ['m3.scalar-oracle-to-m4.artifact-inspector'],
    'm4-nara': ['m4.reviewed-insight-to-m5.review-item'],
    'm5-epii': []
  };
  const eventRequiredFields =
    "REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS";
  const miniModes = miniModesByExtension[entry.id] ?? ['compact-card'];
  const routeIds = routeContractsByExtension[entry.id] ?? [];
  const selectionExport = entry.track08Exports.find(name => name.endsWith('Handler')) ?? `${entry.id}SelectionHandler`;
  const compactExports = entry.track08Exports.filter(name => name !== selectionExport);
  const compactViews = compactExports.map((exportName, index) => ({
    exportName,
    viewId: entry.viewIds[index] ?? primaryView,
    miniModes,
    requiredSelectors: ['currentProfile', 'readiness', 'coordinateContext']
  }));
  const evidenceKind = `${entry.id}.evidence`;
  const evidenceRequiredHandles = entry.id === 'm4-nara'
    ? ['protectedArtifactHandle', 'dayNowSessionHandle']
    : entry.id === 'm5-epii'
      ? ['reviewItemHandle', 'provenanceHandle']
      : ['coordinateContext', 'provenanceHandle'];
  const compactViewsTs = compactViews
    .map(view => `Object.freeze({
            exportName: '${view.exportName}',
            viewId: '${view.viewId}',
            miniModes: Object.freeze(${JSON.stringify(view.miniModes)}) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(${JSON.stringify(view.requiredSelectors)})
        })`)
    .join(',\n        ');
  const routePredicate = routeIds.length > 0
    ? `${JSON.stringify(routeIds)}.includes(contract.id)`
    : 'false';
  return `// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = '${entry.id}';
export const PRIMARY_VIEW_ID = '${primaryView}';
export const ALL_VIEW_IDS = ${JSON.stringify(entry.viewIds)} as const;
export const OPEN_COMMAND_ID = '${entry.command.open}';
export const READ_ONLY_COMMAND_ID = '${entry.command.readOnly}';
export const DEPOSIT_ONLY_COMMAND_ID = '${entry.command.depositOnly}';
export const ROUTE_PATH = '${entry.routePath}';
export const PRIVACY_CLASS = '${entry.privacyClass}';
export const OBSERVABILITY_EVENT_TYPES = ${JSON.stringify(entry.observabilityEventTypes)} as const;
export const DECLARED_BLOCKERS = ${JSON.stringify(entry.blockers)} as const;
export const TRACK_08_EXPORTS = ${JSON.stringify(entry.track08Exports)} as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        ${compactViewsTs}
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: '${selectionExport}',
            inputKind: '${entry.id}.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: '${entry.id}.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: '${entry.id}.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: '${entry.id}.evidenceSerializer',
            evidenceKind: '${evidenceKind}',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(${JSON.stringify(evidenceRequiredHandles)})
        })
    ]),
    miniModes: Object.freeze(${JSON.stringify(miniModes)}) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            ${routePredicate}
        )
    ),
    observabilityEvents: Object.freeze(
        OBSERVABILITY_EVENT_TYPES.map(type =>
            Object.freeze({
                type,
                sourceExtensionId: EXTENSION_ID,
                requiredFields: ${eventRequiredFields},
                privacyClass: PRIVACY_CLASS,
                evidenceHandleRequired: true,
                provenanceHandleRequired: true
            })
        )
    ),
    compositionBoundary: Object.freeze({
        track07Owns: Object.freeze([
            'individual extension commands',
            'stand-alone compact contributions',
            'bridge-mediated current-state selectors',
            'extension-owned evidence serializers'
        ]),
        track08Owns: Object.freeze([
            'integrated screen real estate',
            'multi-extension choreography',
            'plugin-level inhibition policy',
            'mini-mode placement and arbitration'
        ]),
        forbiddenImports: Object.freeze(${JSON.stringify(entry.bridge.forbiddenDirectImports)}),
        bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
    })
});
`;
}

function widgetTsx(entry) {
  const className =
    entry.id
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('') + 'Widget';
  const label = `M${entry.id[1]} — ${entry.id
    .split('-')
    .slice(1)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join(' ')}`;
  return `// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    SharedBridgeAdapter,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    MathemeHarmonicProfileBoundary,
    CoordinateContext,
    EMPTY_COORDINATE_CONTEXT,
    Disposable,
    ReadinessBanner,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIMARY_VIEW_ID,
    DECLARED_BLOCKERS,
    PRIVACY_CLASS
} from '../common';

@injectable()
export class ${className} extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = '${label}';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = ${className}.ID;
        this.title.label = ${className}.LABEL;
        this.title.caption = ${className}.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);

        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => {
                this.readiness = snapshot;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.update();
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const provenance = \`privacy=\${PRIVACY_CLASS} | generation=\${this.context.profileGeneration ?? '—'} | pointer=\${this.context.pointerAnchor ?? '—'}\`;
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={${className}.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>Profile snapshot</h3>
                    {this.profile ? (
                        <dl>
                            <dt>Generation</dt>
                            <dd>{this.profile.generation}</dd>
                            <dt>Capabilities</dt>
                            <dd>{this.profile.capabilities.join(', ') || '—'}</dd>
                            <dt>Pointer anchor</dt>
                            <dd>{this.profile.pointerAnchor ?? '—'}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            No MathemeHarmonicProfile available yet. The kernel-bridge is the
                            sole owner of this payload; this view will populate when the
                            shared adapter receives a generation update.
                        </p>
                    )}
                </section>
            </div>
        );
    }
}
`;
}

function frontendModuleTs(entry) {
  const className =
    entry.id
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('') + 'Widget';
  const contributionClass =
    entry.id
      .split('-')
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join('') + 'Contribution';
  return `// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    MObservabilityPublisher,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER,
    parseExtensionRoute
} from '@pratibimba/m-extension-runtime';
import { ${className} } from './${entry.id}-widget';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';

export const ${entry.id.replace(/-/g, '_').toUpperCase()}_PUBLISHER = Symbol(
    '${entry.id}.observabilityPublisher'
);

@injectable()
export class ${contributionClass}
    extends AbstractViewContribution<${className}>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: ${className}.ID,
            widgetName: ${className}.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // M-extensions register without auto-opening; the user (or a deep link)
        // triggers the view via OPEN_COMMAND_ID.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: OPEN_COMMAND_ID, label: \`\${EXTENSION_ID}: open primary view\` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: READ_ONLY_COMMAND_ID, label: \`\${EXTENSION_ID}: open read-only\` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: DEPOSIT_ONLY_COMMAND_ID, label: \`\${EXTENSION_ID}: open deposit-only\` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        // Route handler: deep links of the form epi-logos://ide${entry.routePath}?...
        commands.registerCommand(
            { id: \`\${EXTENSION_ID}.handleRoute\`, label: \`\${EXTENSION_ID}: handle route\` },
            {
                execute: (raw: string) => {
                    const route = parseExtensionRoute(raw);
                    if (!route || route.extensionId !== EXTENSION_ID) {
                        return undefined;
                    }
                    return this.openView({ activate: true, reveal: true });
                }
            }
        );
    }
}

@injectable()
class ${contributionClass.replace('Contribution', 'Publisher')} implements MObservabilityPublisher {
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    publish(event: { type: string; extensionId: string; emittedAt: number; payload: Readonly<Record<string, unknown>> }): void {
        if (!OBSERVABILITY_EVENT_TYPES.includes(event.type as (typeof OBSERVABILITY_EVENT_TYPES)[number])) {
            throw new Error(
                \`\${EXTENSION_ID} cannot publish unlisted observability event type: \${event.type}\`
            );
        }
        if (event.extensionId !== EXTENSION_ID) {
            throw new Error(
                \`\${EXTENSION_ID} publisher refusing event from foreign extensionId \${event.extensionId}\`
            );
        }
        this.bridge.publish(event);
    }
}

export default new ContainerModule(bind => {
    bind(${className}).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: ${className}.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, ${contributionClass});
    bind(FrontendApplicationContribution).toService(${contributionClass});

    bind(${contributionClass.replace('Contribution', 'Publisher')}).toSelf().inSingletonScope();
    bind(${entry.id.replace(/-/g, '_').toUpperCase()}_PUBLISHER).toService(
        ${contributionClass.replace('Contribution', 'Publisher')}
    );

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
});

function createWidget(container: interfaces.Container): ${className} {
    const child = container.createChild();
    child.bind(${className}).toSelf();
    return child.get(${className});
}
`;
}

function styleCss(entry) {
  return `.mext-widget-${entry.id} .mext-widget-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 12px 16px;
    overflow: auto;
    color: var(--theia-foreground);
    background-color: var(--theia-editor-background);
    font-family: var(--theia-ui-font-family);
}

.mext-widget-${entry.id} .mext-widget-detail {
    margin-top: 4px;
}

.mext-widget-${entry.id} .mext-widget-detail h3 {
    margin: 0 0 8px;
    font-size: var(--theia-ui-font-size1);
    font-weight: 600;
    color: var(--theia-descriptionForeground);
}

.mext-widget-${entry.id} .mext-widget-detail dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 12px;
    row-gap: 4px;
    margin: 0;
    font-size: var(--theia-ui-font-size1);
}

.mext-widget-${entry.id} .mext-widget-detail dt {
    color: var(--theia-descriptionForeground);
}

.mext-widget-${entry.id} .mext-widget-detail dd {
    margin: 0;
    word-break: break-word;
}

.mext-widget-${entry.id} .mext-widget-empty {
    margin: 0;
    color: var(--theia-descriptionForeground);
    font-style: italic;
}
`;
}

for (const entry of manifest.extensions) {
  const root = join(extensionsRoot, entry.id);
  writeFile(join(root, 'package.json'), packageJson(entry));
  writeFile(join(root, 'tsconfig.json'), tsconfigJson());
  writeFile(join(root, 'src/common/index.ts'), commonIndex(entry));
  writeFile(join(root, `src/browser/${entry.id}-widget.tsx`), widgetTsx(entry));
  writeFile(join(root, 'src/browser/frontend-module.ts'), frontendModuleTs(entry));
  writeFile(join(root, 'style/index.css'), styleCss(entry));
  if (!existsSync(join(root, 'README.md'))) {
    writeFile(
      join(root, 'README.md'),
      `# @pratibimba/${entry.id}\n\nGenerated scaffold for the ${entry.id} M-extension.\nFirst-slice priority: ${entry.firstSlicePriority}\n`
    );
  }
}

console.log(`scaffolded ${manifest.extensions.length} M-extensions`);
