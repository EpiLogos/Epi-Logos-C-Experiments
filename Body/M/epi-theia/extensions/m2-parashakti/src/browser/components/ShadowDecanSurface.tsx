import * as React from 'react';
import {
    allDecanFaces,
    decanFaceAt,
    decanPrimaryIndexFromAddress,
    M2DecanFaceRow,
    primaryDecanFaces,
    shadowDecanFaces
} from '../../common/decan-lut';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import {
    M2_TREE_LEAF_PROVENANCE_FIELD,
    ProvenanceBadge,
    type ProvenanceReadinessVariant
} from './ProvenanceBadge';

export const PENDING_SHADOW_DECAN_GRAPH = 'pending-shadow-decan-graph';
export const PENDING_TAROT_REVERSED_MEANING = 'pending-tarot-reversed-meaning';

export type ShadowDecanCellKind = 'primary' | 'light' | 'shadow-proper';

export interface ShadowDecanGraphDescriptor {
    readonly decanIndex: number;
    readonly coordinate: string;
    readonly label: string;
    readonly body: string;
    readonly sourceHandle: string;
}

export interface TarotReversedMeaningCrossReference {
    readonly decanIndex: number;
    readonly coordinate: '#3-4';
    readonly reversedMeaning: string;
    readonly sourceHandle: string;
}

export interface ShadowDecanGraphPayload {
    readonly coordinate: '#2-3';
    readonly primaryDescriptors?: readonly ShadowDecanGraphDescriptor[];
    readonly shadowProperDescriptors?: readonly ShadowDecanGraphDescriptor[];
    readonly tarotReversedMeanings?: readonly TarotReversedMeaningCrossReference[];
}

export interface ShadowDecanCell {
    readonly key: string;
    readonly kind: ShadowDecanCellKind;
    readonly decanIndex: number;
    readonly row: M2DecanFaceRow;
    readonly graphDescriptor: ShadowDecanGraphDescriptor | null;
    readonly tarotReversedMeaning: TarotReversedMeaningCrossReference | null;
}

export interface ShadowDecanSurfaceModel {
    readonly selectedDecanIndex: number | null;
    readonly primaryCells: readonly ShadowDecanCell[];
    readonly lightCells: readonly ShadowDecanCell[];
    readonly shadowProperCells: readonly ShadowDecanCell[];
    readonly pendingBadges: readonly string[];
    readonly visibleCellCount: number;
}

export interface ShadowDecanSurfaceProps {
    readonly selectedAddress72?: number | null;
    readonly expanded?: boolean;
    readonly graphPayload?: ShadowDecanGraphPayload | null;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}

export function ShadowDecanSurface(props: ShadowDecanSurfaceProps): React.ReactElement | null {
    const model = buildShadowDecanSurfaceModel({
        selectedAddress72: props.selectedAddress72 ?? null,
        expanded: props.expanded ?? false,
        graphPayload: props.graphPayload ?? null
    });

    if (!props.expanded && props.selectedAddress72 === null && props.selectedAddress72 === undefined) {
        return null;
    }

    return (
        <section
            className="m2-shadow-decan-surface"
            aria-label="Shadow decan surface"
            data-shadow-decan-surface
            data-visible-cell-count={model.visibleCellCount}
            data-selected-decan={model.selectedDecanIndex ?? ''}
        >
            <header>
                <h4>Shadow decan surface</h4>
                <span>108 = 36 x 3</span>
            </header>
            {model.pendingBadges.length > 0 && (
                <div className="m2-shadow-decan-surface__badges" aria-label="Pending authorities">
                    {model.pendingBadges.map(badge => (
                        <span key={badge} className="m2-pending-badge" data-pending-field={badge}>
                            {badge}
                        </span>
                    ))}
                </div>
            )}
            <div className="m2-shadow-decan-surface__columns">
                <ShadowDecanColumn
                    title="Primary decans"
                    kind="primary"
                    cells={model.primaryCells}
                    packet={props.packet}
                    readiness={props.readiness}
                />
                <ShadowDecanColumn
                    title="Light decans"
                    kind="light"
                    cells={model.lightCells}
                    packet={props.packet}
                    readiness={props.readiness}
                />
                <ShadowDecanColumn
                    title="Shadow decans"
                    kind="shadow-proper"
                    cells={model.shadowProperCells}
                    packet={props.packet}
                    readiness={props.readiness}
                />
            </div>
        </section>
    );
}

export function buildShadowDecanSurfaceModel(input: {
    readonly selectedAddress72?: number | null;
    readonly expanded?: boolean;
    readonly graphPayload?: ShadowDecanGraphPayload | null;
}): ShadowDecanSurfaceModel {
    const selectedDecanIndex =
        typeof input.selectedAddress72 === 'number'
            ? decanPrimaryIndexFromAddress(input.selectedAddress72)
            : null;
    const graphPayload = input.graphPayload ?? null;
    const primaryDescriptors = descriptorMap(graphPayload?.primaryDescriptors);
    const shadowProperDescriptors = descriptorMap(graphPayload?.shadowProperDescriptors);
    const tarotCrossReferences = tarotMap(graphPayload?.tarotReversedMeanings);

    const primaryCells = primaryDecanFaces().map(row =>
        decanCell('primary', row.primaryIndex, row, primaryDescriptors.get(row.primaryIndex) ?? null, null)
    );
    const lightCells = primaryDecanFaces().map(row =>
        decanCell('light', row.primaryIndex, row, null, tarotCrossReferences.get(row.primaryIndex) ?? null)
    );
    const shadowProperCells = shadowDecanFaces().map(row =>
        decanCell(
            'shadow-proper',
            row.primaryIndex,
            row,
            shadowProperDescriptors.get(row.primaryIndex) ?? null,
            tarotCrossReferences.get(row.primaryIndex) ?? null
        )
    );
    const shadowGraphComplete = shadowProperDescriptors.size === 36;
    const tarotComplete = tarotCrossReferences.size === 36;
    const visibleCellCount = primaryCells.length + lightCells.length + (shadowGraphComplete ? shadowProperCells.length : 0);

    return Object.freeze({
        selectedDecanIndex,
        primaryCells: Object.freeze(primaryCells),
        lightCells: Object.freeze(lightCells),
        shadowProperCells: Object.freeze(shadowProperCells),
        pendingBadges: Object.freeze([
            ...(shadowGraphComplete ? [] : [PENDING_SHADOW_DECAN_GRAPH]),
            ...(tarotComplete ? [] : [PENDING_TAROT_REVERSED_MEANING])
        ]),
        visibleCellCount
    });
}

export function normalizeShadowDecanGraphPayload(value: unknown): ShadowDecanGraphPayload | null {
    const raw = objectRecord(value);
    if (!raw) return null;
    const source = objectRecord(raw.shadowDecanSurface) ?? raw;
    const primaryDescriptors = descriptorArray(
        source.primaryDescriptors ?? source.primary_decans ?? source.primaryDecans
    );
    const shadowProperDescriptors = descriptorArray(
        source.shadowProperDescriptors ?? source.shadow_decans ?? source.shadowDecans
    );
    const tarotReversedMeanings = tarotArray(
        source.tarotReversedMeanings ?? source.tarot_reversed_meanings ?? source.reversedMeanings
    );

    if (primaryDescriptors.length === 0 && shadowProperDescriptors.length === 0 && tarotReversedMeanings.length === 0) {
        return null;
    }

    return Object.freeze({
        coordinate: '#2-3',
        primaryDescriptors: Object.freeze(primaryDescriptors),
        shadowProperDescriptors: Object.freeze(shadowProperDescriptors),
        tarotReversedMeanings: Object.freeze(tarotReversedMeanings)
    });
}

export function allShadowDecanDecodedFaces(): readonly M2DecanFaceRow[] {
    return allDecanFaces();
}

function ShadowDecanColumn({
    title,
    kind,
    cells,
    packet,
    readiness
}: {
    readonly title: string;
    readonly kind: ShadowDecanCellKind;
    readonly cells: readonly ShadowDecanCell[];
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}): React.ReactElement {
    return (
        <div className="m2-shadow-decan-column" data-shadow-decan-column={kind}>
            <h5>{title}</h5>
            <ol>
                {cells.map(cell => (
                    <ShadowDecanCellView key={cell.key} cell={cell} packet={packet} readiness={readiness} />
                ))}
            </ol>
        </div>
    );
}

function ShadowDecanCellView({
    cell,
    packet,
    readiness
}: {
    readonly cell: ShadowDecanCell;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}): React.ReactElement {
    const descriptor = cell.graphDescriptor;
    const tarot = cell.tarotReversedMeaning;
    return (
        <li
            data-shadow-decan-cell={cell.kind}
            data-decan-index={cell.decanIndex}
            data-address72={cell.row.address72}
            data-coordinate={cell.kind === 'shadow-proper' ? '#2-3' : cell.row.coordinate}
        >
            <span>{cell.row.signName} D{cell.row.decanNumber}</span>
            <strong>{cell.row.faceName}</strong>
            <span>{cell.row.elementName}</span>
            <span>{cell.row.rulingPlanetName}</span>
            <span>{cell.row.meaningId}</span>
            {descriptor && <span data-s2-shadow-decan-descriptor>{descriptor.label}</span>}
            {tarot && (
                <span data-tarot-reversed-meaning data-coordinate={tarot.coordinate}>
                    {tarot.reversedMeaning}
                </span>
            )}
            {packet && (
                <ProvenanceBadge
                    compact
                    field={M2_TREE_LEAF_PROVENANCE_FIELD}
                    readiness={readiness ?? 'ready_public_current'}
                    provenance={packet.meaningPacketProvenanceFor(M2_TREE_LEAF_PROVENANCE_FIELD)}
                />
            )}
        </li>
    );
}

function decanCell(
    kind: ShadowDecanCellKind,
    decanIndex: number,
    row: M2DecanFaceRow,
    graphDescriptor: ShadowDecanGraphDescriptor | null,
    tarotReversedMeaning: TarotReversedMeaningCrossReference | null
): ShadowDecanCell {
    return Object.freeze({
        key: `${kind}:${decanIndex}`,
        kind,
        decanIndex,
        row,
        graphDescriptor,
        tarotReversedMeaning
    });
}

function descriptorMap(
    descriptors: readonly ShadowDecanGraphDescriptor[] | undefined
): ReadonlyMap<number, ShadowDecanGraphDescriptor> {
    return new Map((descriptors ?? []).map(descriptor => [descriptor.decanIndex, descriptor]));
}

function tarotMap(
    crossReferences: readonly TarotReversedMeaningCrossReference[] | undefined
): ReadonlyMap<number, TarotReversedMeaningCrossReference> {
    return new Map((crossReferences ?? []).map(reference => [reference.decanIndex, reference]));
}

function descriptorArray(value: unknown): ShadowDecanGraphDescriptor[] {
    const raw = Array.isArray(value) ? value : [];
    return raw.map(descriptorFromUnknown).filter((descriptor): descriptor is ShadowDecanGraphDescriptor => descriptor !== null);
}

function tarotArray(value: unknown): TarotReversedMeaningCrossReference[] {
    const raw = Array.isArray(value) ? value : [];
    return raw.map(tarotFromUnknown).filter((reference): reference is TarotReversedMeaningCrossReference => reference !== null);
}

function descriptorFromUnknown(value: unknown): ShadowDecanGraphDescriptor | null {
    const raw = objectRecord(value);
    if (!raw) return null;
    const decanIndex = numberField(raw, 'decanIndex') ?? numberField(raw, 'decan_idx') ?? numberField(raw, 'index');
    if (decanIndex === null || decanIndex < 0 || decanIndex > 35) return null;
    const coordinate = stringField(raw, 'coordinate') ?? decanFaceAt(decanIndex * 2).coordinate;
    return Object.freeze({
        decanIndex,
        coordinate,
        label: stringField(raw, 'label') ?? stringField(raw, 'title') ?? coordinate,
        body: stringField(raw, 'body') ?? stringField(raw, 'meaning') ?? '',
        sourceHandle: stringField(raw, 'sourceHandle') ?? stringField(raw, 'source_handle') ?? 's2:#2-3'
    });
}

function tarotFromUnknown(value: unknown): TarotReversedMeaningCrossReference | null {
    const raw = objectRecord(value);
    if (!raw) return null;
    const decanIndex = numberField(raw, 'decanIndex') ?? numberField(raw, 'decan_idx') ?? numberField(raw, 'index');
    const reversedMeaning = stringField(raw, 'reversedMeaning') ?? stringField(raw, 'reversed_meaning');
    if (decanIndex === null || decanIndex < 0 || decanIndex > 35 || !reversedMeaning) return null;
    return Object.freeze({
        decanIndex,
        coordinate: '#3-4',
        reversedMeaning,
        sourceHandle:
            stringField(raw, 'sourceHandle') ??
            stringField(raw, 'source_handle') ??
            `kernelBridge.m3.tarotReversedMeaning(${decanIndex})`
    });
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function stringField(record: Readonly<Record<string, unknown>>, field: string): string | null {
    const value = record[field];
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberField(record: Readonly<Record<string, unknown>>, field: string): number | null {
    const value = record[field];
    return Number.isInteger(value) ? (value as number) : null;
}
