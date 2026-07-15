/**
 * Coordinate: M' C5/CS MOC-Base read runtime (Track 48).
 * Residency: Body/M/pratibimba-app/src/bases.
 * Actualises: embedded and canvas-hosted Obsidian Bases as evaluated,
 * coordinate-keyed read reflections over the live S1 vault.
 * Public surface: loadMocBaseSections, loadCanvasBaseReflections.
 * Does NOT own: MOC membership law, Base writes, or Hen validation.
 */

import { parse as parseYaml } from 'yaml';

export interface FileSystemEntry {
    readonly path: string;
    readonly isDirectory: boolean;
}

export interface FileSystemLike {
    readText(path: string): Promise<string>;
    list(path: string): Promise<readonly FileSystemEntry[]>;
}

export interface BaseRecord {
    readonly coordinate?: string;
    readonly file: {
        readonly path: string;
        readonly name: string;
    };
    readonly [property: string]: unknown;
}

export interface BaseViewDefinition {
    readonly type: string;
    readonly name: string;
    readonly filters?: unknown;
    readonly [property: string]: unknown;
}

export interface EvaluatedBaseReflection {
    readonly heading: string;
    readonly sourcePath: string;
    readonly views: readonly BaseViewDefinition[];
    readonly rows: readonly BaseRecord[];
}

interface BaseDefinition {
    readonly filters?: unknown;
    readonly views?: readonly BaseViewDefinition[];
    readonly c_3_projected_from?: string;
}

const FENCED_BASE = /```base\s*\n([\s\S]*?)```/g;
const EMBEDDED_BASE_FILE = /!\[\[([^\]]+\.base)\]\]/g;
const STARTS_WITH_PATH = /file\.path\.startsWith\(["']([^"']+)["']\)/;

export async function loadMocBaseSections(
    mocPath: string,
    fileSystem: FileSystemLike
): Promise<readonly EvaluatedBaseReflection[]> {
    const markdown = await fileSystem.readText(mocPath);
    const definitions: Array<{ heading: string; sourcePath: string; definition: BaseDefinition }> = [];

    for (const match of markdown.matchAll(FENCED_BASE)) {
        definitions.push({
            heading: nearestHeading(markdown, match.index ?? 0),
            sourcePath: mocPath,
            definition: parseBaseDefinition(match[1], mocPath)
        });
    }
    for (const match of markdown.matchAll(EMBEDDED_BASE_FILE)) {
        const sourcePath = resolveVaultLink(mocPath, match[1]);
        definitions.push({
            heading: nearestHeading(markdown, match.index ?? 0),
            sourcePath,
            definition: parseBaseDefinition(await fileSystem.readText(sourcePath), sourcePath)
        });
    }

    definitions.sort((a, b) => markdownOrder(markdown, a.heading) - markdownOrder(markdown, b.heading));
    return Promise.all(definitions.map(item => evaluateDefinition(item, fileSystem)));
}

export async function loadCanvasBaseReflections(
    canvasPath: string,
    fileSystem: FileSystemLike
): Promise<readonly EvaluatedBaseReflection[]> {
    const canvas = JSON.parse(await fileSystem.readText(canvasPath)) as {
        nodes?: readonly { type?: string; file?: string }[];
    };
    const basePaths = (canvas.nodes ?? [])
        .filter(node => node.type === 'file' && typeof node.file === 'string' && node.file.endsWith('.base'))
        .map(node => node.file as string);

    return Promise.all(basePaths.map(async sourcePath => evaluateDefinition({
        heading: baseName(sourcePath),
        sourcePath,
        definition: parseBaseDefinition(await fileSystem.readText(sourcePath), sourcePath)
    }, fileSystem)));
}

async function evaluateDefinition(
    item: { heading: string; sourcePath: string; definition: BaseDefinition },
    fileSystem: FileSystemLike
): Promise<EvaluatedBaseReflection> {
    const root = scanRoot(item.definition, item.sourcePath);
    const records = await readVaultRecords(root, fileSystem);
    const rows = records.filter(record => evaluateFilter(item.definition.filters, record));
    return {
        heading: item.heading,
        sourcePath: item.sourcePath,
        views: Object.freeze([...(item.definition.views ?? [])]),
        rows: Object.freeze(sortRows(rows, item.definition.views?.[0]))
    };
}

function parseBaseDefinition(source: string, sourcePath: string): BaseDefinition {
    const parsed = parseYaml(source) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Base definition ${sourcePath} must be a YAML mapping`);
    }
    const definition = parsed as BaseDefinition;
    if (!Array.isArray(definition.views) || definition.views.length === 0) {
        throw new Error(`Base definition ${sourcePath} must declare at least one view`);
    }
    return definition;
}

function scanRoot(definition: BaseDefinition, sourcePath: string): string {
    const fromFilter = findStartsWithPath(definition.filters);
    if (fromFilter) {
        return stripIdeaPrefix(fromFilter);
    }
    if (definition.c_3_projected_from) {
        return stripIdeaPrefix(definition.c_3_projected_from);
    }
    return sourcePath.slice(0, Math.max(0, sourcePath.lastIndexOf('/')));
}

function findStartsWithPath(value: unknown): string | null {
    if (typeof value === 'string') {
        return value.match(STARTS_WITH_PATH)?.[1] ?? null;
    }
    if (Array.isArray(value)) {
        for (const child of value) {
            const found = findStartsWithPath(child);
            if (found) return found;
        }
    } else if (value && typeof value === 'object') {
        for (const child of Object.values(value as Record<string, unknown>)) {
            const found = findStartsWithPath(child);
            if (found) return found;
        }
    }
    return null;
}

async function readVaultRecords(root: string, fileSystem: FileSystemLike): Promise<BaseRecord[]> {
    const records: BaseRecord[] = [];
    const pending = [root];
    while (pending.length > 0) {
        const directory = pending.pop() as string;
        for (const entry of await fileSystem.list(directory)) {
            if (entry.isDirectory) {
                pending.push(entry.path);
            } else if (entry.path.endsWith('.md')) {
                const record = recordFromMarkdown(entry.path, await fileSystem.readText(entry.path));
                if (record) {
                    records.push(record);
                }
            }
        }
    }
    return records;
}

function recordFromMarkdown(path: string, markdown: string): BaseRecord | null {
    if (!markdown.startsWith('---\n')) {
        return null;
    }
    const end = markdown.indexOf('\n---', 4);
    if (end < 0) {
        return null;
    }
    const parsed = parseYaml(markdown.slice(4, end)) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
    }
    return {
        ...(parsed as Record<string, unknown>),
        file: { path, name: path.slice(path.lastIndexOf('/') + 1) }
    };
}

function evaluateFilter(filter: unknown, record: BaseRecord): boolean {
    if (filter == null) {
        return true;
    }
    if (typeof filter === 'string') {
        return evaluateExpression(filter, record);
    }
    if (Array.isArray(filter)) {
        return filter.every(child => evaluateFilter(child, record));
    }
    if (typeof filter !== 'object') {
        throw new Error(`Unsupported Base filter: ${String(filter)}`);
    }
    const node = filter as Record<string, unknown>;
    if ('and' in node) {
        return asFilterList(node.and).every(child => evaluateFilter(child, record));
    }
    if ('or' in node) {
        return asFilterList(node.or).some(child => evaluateFilter(child, record));
    }
    throw new Error(`Unsupported Base filter node: ${JSON.stringify(node)}`);
}

function evaluateExpression(expression: string, record: BaseRecord): boolean {
    const startsWith = expression.match(/^([\w.]+)\.startsWith\(["']([^"']*)["']\)$/);
    if (startsWith) {
        const value = propertyValue(record, startsWith[1]);
        return typeof value === 'string' && value.startsWith(startsWith[2]);
    }
    const comparison = expression.match(/^([\w.]+)\s*(==|!=)\s*(.+)$/);
    if (comparison) {
        const left = propertyValue(record, comparison[1]);
        const right = scalarValue(comparison[3]);
        return comparison[2] === '==' ? left === right : left !== right;
    }
    throw new Error(`Unsupported Base expression: ${expression}`);
}

function propertyValue(record: BaseRecord, path: string): unknown {
    return path.split('.').reduce<unknown>((value, key) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        return (value as Record<string, unknown>)[key] ?? null;
    }, record);
}

function scalarValue(raw: string): unknown {
    const value = raw.trim();
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    throw new Error(`Unsupported Base scalar: ${raw}`);
}

function sortRows(rows: readonly BaseRecord[], view?: BaseViewDefinition): BaseRecord[] {
    const sort = Array.isArray(view?.sort) ? view.sort as readonly Record<string, unknown>[] : [];
    return [...rows].sort((a, b) => {
        for (const clause of sort) {
            const property = typeof clause.property === 'string' ? clause.property : 'coordinate';
            const direction = clause.direction === 'DESC' ? -1 : 1;
            const left = String(propertyValue(a, property) ?? '');
            const right = String(propertyValue(b, property) ?? '');
            const order = left.localeCompare(right, undefined, { numeric: true });
            if (order !== 0) return order * direction;
        }
        return String(a.coordinate ?? a.file.path).localeCompare(String(b.coordinate ?? b.file.path), undefined, { numeric: true });
    });
}

function asFilterList(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [value];
}

function nearestHeading(markdown: string, index: number): string {
    const headings = [...markdown.slice(0, index).matchAll(/^##\s+(.+)$/gm)];
    return headings.at(-1)?.[1].trim() ?? 'Base Reflection';
}

function markdownOrder(markdown: string, heading: string): number {
    const index = markdown.indexOf(`## ${heading}`);
    return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}

function resolveVaultLink(sourcePath: string, target: string): string {
    if (target.includes('/')) return stripIdeaPrefix(target);
    const parent = sourcePath.slice(0, Math.max(0, sourcePath.lastIndexOf('/')));
    return `${parent}/${target}`;
}

function stripIdeaPrefix(path: string): string {
    return path.replace(/^Idea\//, '').replace(/^\/+|\/+$/g, '');
}

function baseName(path: string): string {
    return path.slice(path.lastIndexOf('/') + 1).replace(/\.base$/, '');
}
