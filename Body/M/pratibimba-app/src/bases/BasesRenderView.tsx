/**
 * Coordinate: M' C5/CS Bases presentational carrier (Track 48).
 * Residency: Body/M/pratibimba-app/src/bases.
 * Position (#5): table/cards/list/image rendering of a pure BasesRenderModel.
 * Actualises: selectable coordinate rows for shared-context cross-filtering.
 * Public surface: BasesRenderView.
 * Does NOT own: fetching, shared state, filter law, or canon writes.
 * Contract: [[M'-SYSTEM-SPEC]]; Track 48 section 13.D.
 */

import { BasesRecord, BasesRenderModel } from './basesViewModel';

export interface BasesRenderViewProps {
    readonly model: BasesRenderModel;
    readonly selectedCoordinate: string | null;
    readonly image?: string;
    readonly onSelect: (coordinate: string) => void;
}

export function BasesRenderView({ model, selectedCoordinate, image, onSelect }: BasesRenderViewProps) {
    return (
        <div
            className="bases-view"
            data-testid={`bases-view-${model.view}`}
            data-row-count={model.rowCount}
            data-group-count={model.groups.length}
        >
            {model.pendingFields.length > 0 ? (
                <p className="bases-view-pending">{model.pendingFields.join(' | ')}</p>
            ) : null}
            {model.groups.map(group => (
                <section className="bases-view-group" key={group.key || '__all__'}>
                    {group.key ? <h4>{group.key}</h4> : null}
                    {model.view === 'table' ? (
                        <BasesTable rows={group.rows} columns={model.columns} selected={selectedCoordinate} onSelect={onSelect} />
                    ) : null}
                    {model.view === 'cards' ? (
                        <BasesCards rows={group.rows} columns={model.columns} image={image} selected={selectedCoordinate} onSelect={onSelect} />
                    ) : null}
                    {model.view === 'list' ? (
                        <BasesList rows={group.rows} selected={selectedCoordinate} onSelect={onSelect} />
                    ) : null}
                    {model.view === 'image' ? (
                        <BasesImages rows={group.rows} image={image} selected={selectedCoordinate} onSelect={onSelect} />
                    ) : null}
                </section>
            ))}
        </div>
    );
}

interface RowsProps {
    readonly rows: readonly BasesRecord[];
    readonly selected: string | null;
    readonly onSelect: (coordinate: string) => void;
}

function BasesTable({ rows, columns, selected, onSelect }: RowsProps & { readonly columns: readonly string[] }) {
    return (
        <div className="bases-table-scroll">
            <table className="bases-table">
                <thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead>
                <tbody>{rows.map(row => (
                    <tr
                        key={row.coordinate}
                        data-testid={`bases-row-${row.coordinate}`}
                        data-selected={selected === row.coordinate}
                        onClick={() => onSelect(row.coordinate)}
                    >
                        {columns.map(column => <td key={column}>{cellText(row[column])}</td>)}
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}

function BasesList({ rows, selected, onSelect }: RowsProps) {
    return (
        <ul className="bases-list">
            {rows.map(row => (
                <li key={row.coordinate} data-selected={selected === row.coordinate}>
                    <button type="button" onClick={() => onSelect(row.coordinate)}>
                        <code>{row.coordinate}</code><span>{cellText(row.title) || row.coordinate}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

function BasesCards({ rows, columns, image, selected, onSelect }: RowsProps & {
    readonly columns: readonly string[];
    readonly image?: string;
}) {
    return (
        <div className="bases-cards">
            {rows.map(row => (
                <article key={row.coordinate} data-selected={selected === row.coordinate}>
                    {image && imageUrl(row[image]) ? <img src={imageUrl(row[image])!} alt="" /> : null}
                    <button type="button" onClick={() => onSelect(row.coordinate)}>
                        <strong>{cellText(row.title) || row.coordinate}</strong><code>{row.coordinate}</code>
                    </button>
                    <dl>{columns.filter(column => !['coordinate', 'title'].includes(column)).map(column => (
                        <div key={column}><dt>{column}</dt><dd>{cellText(row[column])}</dd></div>
                    ))}</dl>
                </article>
            ))}
        </div>
    );
}

function BasesImages({ rows, image, selected, onSelect }: RowsProps & { readonly image?: string }) {
    return (
        <div className="bases-images">
            {rows.map(row => (
                <button
                    type="button"
                    key={row.coordinate}
                    data-selected={selected === row.coordinate}
                    onClick={() => onSelect(row.coordinate)}
                >
                    {image && imageUrl(row[image])
                        ? <img src={imageUrl(row[image])!} alt="" />
                        : <span className="bases-image-placeholder">{row.coordinate}</span>}
                    <span>{cellText(row.title) || row.coordinate}</span>
                </button>
            ))}
        </div>
    );
}

function cellText(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(cellText).join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function imageUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const wikilink = value.match(/^!\[\[([^\]]+)\]\]$/)?.[1];
    return wikilink ?? (/^(https?:|data:|\/)/.test(value) ? value : null);
}
