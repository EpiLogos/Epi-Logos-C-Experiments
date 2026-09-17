// Coordinate Header (convention:coordinate-header:v1)
// Coordinate:     C5 / CS — the Theia surface of the BasesView reflection
// Residency:      Body/M/epi-theia/extensions/bases-view/src/browser
// Position (#5):  Integration — ReactWidget + AbstractViewContribution (personal-cymatic-field pattern)
// Actualises:     Track 48 §13.D — BasesViewWidget / BasesViewContribution / basesModelFromRecords surface
// Public surface: BasesView, BasesViewWidget, BasesViewContribution
// Does NOT own:   data fetching (bases-data-source.ts), render-model math (common/bases-view.ts)
// Contract:       @inject(SHARED_BRIDGE_ADAPTER); all data over invokeGatewayRpc — no Body/S/** import (43.5)

import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    BaseViewConfig,
    BasesDataSource,
    BasesRecord,
    BasesRenderModel,
    BasesViewMode,
    basesModelFromRecords,
    BASES_VIEW_LABEL,
    BASES_VIEW_OPEN_COMMAND_ID,
    BASES_VIEW_WIDGET_ID,
    EXTENSION_ID
} from '../common';
import { createBasesDataSource } from './bases-data-source';

export const DEFAULT_BASE_VIEW_CONFIG: BaseViewConfig = Object.freeze({
    source: 'dynamic',
    coordinateScope: '',
    filter: Object.freeze([]),
    view: 'table' as BasesViewMode,
    columns: Object.freeze(['coordinate', 'title', 'c_4_artifact_role']),
    sort: Object.freeze([{ property: 'coordinate', direction: 'ASC' as const }])
});

export type BasesLoadStatus = 'pending' | 'loading' | 'ready' | 'error';

export interface BasesViewProps {
    readonly model: BasesRenderModel;
    readonly status: BasesLoadStatus;
    readonly image?: string;
    readonly selectedCoordinate: string | null;
    readonly errorMessage?: string | null;
    readonly onSelect?: (coordinate: string) => void;
}

/**
 * Pure presentational component. Renders one `BasesRenderModel` in the
 * configured view mode. Rows / cards click-dispatch `onSelect(coordinate)` so a
 * host can cross-filter the shared `CoordinateContext`.
 */
export const BasesView: React.FC<BasesViewProps> = ({
    model,
    status,
    image,
    selectedCoordinate,
    errorMessage,
    onSelect
}) => (
    <section
        className="bases-view"
        data-test="bases-view"
        data-track="TRACK_48"
        data-view-id={BASES_VIEW_WIDGET_ID}
        data-view-mode={model.view}
        data-load-status={status}
        data-row-count={model.rowCount}
        data-group-count={model.groups.length}
        data-column-count={model.columns.length}
        data-pending-fields={model.pendingFields.join(' ')}
        aria-label="Bimba coordinate bases view"
    >
        <header className="bases-view-header">
            <span className="bases-view-mode" data-test="bases-view-mode">{model.view}</span>
            <span className="bases-view-count">{model.rowCount} rows · {model.groups.length} groups</span>
            {model.pendingFields.length > 0 ? (
                <span className="bases-view-pending" data-test="bases-view-pending">
                    {model.pendingFields[0]}
                </span>
            ) : null}
        </header>
        {errorMessage ? (
            <p className="bases-view-error" data-test="bases-view-error">{errorMessage}</p>
        ) : null}
        {model.groups.map(group => (
            <section
                key={group.key || '__all__'}
                className="bases-view-group"
                data-test="bases-view-group"
                data-group-key={group.key}
            >
                {group.key ? <h4 className="bases-view-group-label">{group.key}</h4> : null}
                <BasesViewBody
                    view={model.view}
                    columns={model.columns}
                    rows={group.rows}
                    image={image}
                    selectedCoordinate={selectedCoordinate}
                    onSelect={onSelect}
                />
            </section>
        ))}
    </section>
);

const BasesViewBody: React.FC<{
    readonly view: BasesViewMode;
    readonly columns: readonly string[];
    readonly rows: readonly BasesRecord[];
    readonly image?: string;
    readonly selectedCoordinate: string | null;
    readonly onSelect?: (coordinate: string) => void;
}> = ({ view, columns, rows, image, selectedCoordinate, onSelect }) => {
    switch (view) {
        case 'cards':
            return <BasesCards rows={rows} columns={columns} image={image} selectedCoordinate={selectedCoordinate} onSelect={onSelect} />;
        case 'list':
            return <BasesList rows={rows} columns={columns} selectedCoordinate={selectedCoordinate} onSelect={onSelect} />;
        case 'image':
            return <BasesImageGrid rows={rows} image={image} selectedCoordinate={selectedCoordinate} onSelect={onSelect} />;
        case 'table':
        default:
            return <BasesTable rows={rows} columns={columns} selectedCoordinate={selectedCoordinate} onSelect={onSelect} />;
    }
};

const BasesTable: React.FC<{
    readonly rows: readonly BasesRecord[];
    readonly columns: readonly string[];
    readonly selectedCoordinate: string | null;
    readonly onSelect?: (coordinate: string) => void;
}> = ({ rows, columns, selectedCoordinate, onSelect }) => (
    <table className="bases-view-table" data-test="bases-view-table">
        <thead>
            <tr>
                {columns.map(column => (
                    <th key={column} scope="col">{column}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {rows.map(row => (
                <tr
                    key={row.coordinate}
                    data-coordinate={row.coordinate}
                    data-selected={row.coordinate === selectedCoordinate ? 'true' : 'false'}
                    className={row.coordinate === selectedCoordinate ? 'bases-view-row is-selected' : 'bases-view-row'}
                    onClick={() => onSelect?.(row.coordinate)}
                >
                    {columns.map(column => (
                        <td key={column} data-column={column}>{cellText(row[column])}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

const BasesList: React.FC<{
    readonly rows: readonly BasesRecord[];
    readonly columns: readonly string[];
    readonly selectedCoordinate: string | null;
    readonly onSelect?: (coordinate: string) => void;
}> = ({ rows, columns, selectedCoordinate, onSelect }) => (
    <ul className="bases-view-list" data-test="bases-view-list">
        {rows.map(row => (
            <li
                key={row.coordinate}
                data-coordinate={row.coordinate}
                data-selected={row.coordinate === selectedCoordinate ? 'true' : 'false'}
                className={row.coordinate === selectedCoordinate ? 'bases-view-list-item is-selected' : 'bases-view-list-item'}
                onClick={() => onSelect?.(row.coordinate)}
            >
                <span className="bases-view-list-coordinate">{row.coordinate}</span>
                <span className="bases-view-list-detail">{listDetail(row, columns)}</span>
            </li>
        ))}
    </ul>
);

const BasesCards: React.FC<{
    readonly rows: readonly BasesRecord[];
    readonly columns: readonly string[];
    readonly image?: string;
    readonly selectedCoordinate: string | null;
    readonly onSelect?: (coordinate: string) => void;
}> = ({ rows, columns, image, selectedCoordinate, onSelect }) => (
    <div className="bases-view-cards" data-test="bases-view-cards">
        {rows.map(row => (
            <article
                key={row.coordinate}
                data-coordinate={row.coordinate}
                data-selected={row.coordinate === selectedCoordinate ? 'true' : 'false'}
                className={row.coordinate === selectedCoordinate ? 'bases-view-card is-selected' : 'bases-view-card'}
                onClick={() => onSelect?.(row.coordinate)}
            >
                {image && coverUrl(row[image]) ? (
                    <img className="bases-view-card-cover" src={coverUrl(row[image])!} alt={`${row.coordinate} cover`} />
                ) : null}
                <h5 className="bases-view-card-title">{cellText(row.title) || row.coordinate}</h5>
                <code className="bases-view-card-coordinate">{row.coordinate}</code>
                <dl className="bases-view-card-fields">
                    {columns.filter(column => column !== 'coordinate' && column !== 'title').map(column => (
                        <React.Fragment key={column}>
                            <dt>{column}</dt>
                            <dd>{cellText(row[column])}</dd>
                        </React.Fragment>
                    ))}
                </dl>
            </article>
        ))}
    </div>
);

const BasesImageGrid: React.FC<{
    readonly rows: readonly BasesRecord[];
    readonly image?: string;
    readonly selectedCoordinate: string | null;
    readonly onSelect?: (coordinate: string) => void;
}> = ({ rows, image, selectedCoordinate, onSelect }) => (
    <div className="bases-view-image-grid" data-test="bases-view-image-grid">
        {rows.map(row => {
            const url = image ? coverUrl(row[image]) : null;
            return (
                <figure
                    key={row.coordinate}
                    data-coordinate={row.coordinate}
                    data-selected={row.coordinate === selectedCoordinate ? 'true' : 'false'}
                    className={row.coordinate === selectedCoordinate ? 'bases-view-tile is-selected' : 'bases-view-tile'}
                    onClick={() => onSelect?.(row.coordinate)}
                >
                    {url ? (
                        <img src={url} alt={`${row.coordinate} cover`} />
                    ) : (
                        <span className="bases-view-tile-placeholder" data-test="bases-view-tile-placeholder">
                            {row.coordinate}
                        </span>
                    )}
                    <figcaption>{cellText(row.title) || row.coordinate}</figcaption>
                </figure>
            );
        })}
    </div>
);

@injectable()
export class BasesViewWidget extends ReactWidget {
    static readonly ID = BASES_VIEW_WIDGET_ID;
    static readonly LABEL = BASES_VIEW_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    public readonly bridge!: SharedBridgeAdapter;

    protected config: BaseViewConfig = DEFAULT_BASE_VIEW_CONFIG;
    protected records: readonly BasesRecord[] = Object.freeze([]);
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected status: BasesLoadStatus = 'pending';
    protected errorMessage: string | null = null;
    protected dataSource: BasesDataSource | null = null;
    protected subscriptions: Disposable[] = [];
    protected fetchSerial = 0;

    @postConstruct()
    public init(): void {
        this.id = BasesViewWidget.ID;
        this.title.label = BasesViewWidget.LABEL;
        this.title.caption = 'Coordinate-keyed Bimba bases view (C5/CS reflection)';
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('bases-view-widget');

        this.dataSource = createBasesDataSource(this.bridge, this.config.source);

        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                if (this.config.source === 'dynamic') {
                    void this.refresh();
                } else {
                    this.update();
                }
            })
        );
        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => this.handleObservabilityEvent(event))
        );

        void this.refresh();
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        this.subscriptions = [];
        super.dispose();
    }

    /** Re-point the view at a new config (source / scope / mode / columns). */
    public configure(config: Partial<BaseViewConfig>): void {
        this.config = Object.freeze({ ...this.config, ...config });
        this.dataSource = createBasesDataSource(this.bridge, this.config.source);
        void this.refresh();
    }

    public model(): BasesRenderModel {
        return basesModelFromRecords([...this.records], this.config);
    }

    protected override render(): React.ReactNode {
        return (
            <div className="mext-widget-root bases-view-widget-root" data-test="bases-view-root">
                <BasesView
                    model={this.model()}
                    status={this.status}
                    image={this.config.image}
                    selectedCoordinate={this.context.selectedCoordinate}
                    errorMessage={this.errorMessage}
                    onSelect={coordinate => this.selectCoordinate(coordinate)}
                />
            </div>
        );
    }

    protected async refresh(): Promise<void> {
        const source = this.dataSource;
        if (!source) {
            return;
        }
        const serial = ++this.fetchSerial;
        this.status = 'loading';
        this.errorMessage = null;
        this.update();
        try {
            const records = await source.fetch(this.config);
            if (serial !== this.fetchSerial) {
                return;
            }
            this.records = records;
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            if (serial !== this.fetchSerial) {
                return;
            }
            this.records = Object.freeze([]);
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected selectCoordinate(coordinate: string): void {
        // Cross-filter: publish the selection into the shared CoordinateContext so
        // sibling panels react. Preserve the rest of the context (provenance, etc.).
        this.bridge.updateCoordinateContext(Object.freeze({
            ...this.context,
            selectedCoordinate: coordinate
        }));
    }

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        if (this.config.source !== 'dynamic') {
            return;
        }
        // Any vault / graph mutation event re-fires the live query so the
        // reflection stays current.
        if (typeof event.type === 'string' && /vault|graph|coordinate|projection/i.test(event.type)) {
            void this.refresh();
        }
    }
}

@injectable()
export class BasesViewContribution
    extends AbstractViewContribution<BasesViewWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: BasesViewWidget.ID,
            widgetName: BasesViewWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: BASES_VIEW_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Command-opened; the bases view does not seize the workbench on startup.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: BASES_VIEW_OPEN_COMMAND_ID, label: 'Bases View: Open Coordinate Bases' },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

function cellText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }
    if (Array.isArray(value)) {
        return value.map(item => cellText(item)).filter(Boolean).join(', ');
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function listDetail(row: BasesRecord, columns: readonly string[]): string {
    const detailColumn = columns.find(column => column !== 'coordinate' && row[column] !== undefined);
    return detailColumn ? cellText(row[detailColumn]) : '';
}

function coverUrl(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() === '') {
        return null;
    }
    // Accept an embedded `![[asset]]` wikilink or a bare path / URL.
    const embed = /!\[\[([^\]]+)\]\]/.exec(value);
    return embed ? embed[1] : value;
}
