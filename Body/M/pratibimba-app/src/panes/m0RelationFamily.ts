/**
 * Coordinate: M' M0-2' (relation-field two-family discrimination, rerun 01.T1.9 / DR-IG-1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the M0-2' relation-field consumption of the schema-level
 *   `c_1_relation_family` discriminator (DR-IG-1, landed in graph-schema
 *   RELATIONSHIP_PROPERTY_SPECS). M0' chrome groups graph edges by their
 *   graph-sourced relation family so structural and correspondential edges
 *   never collapse into one undifferentiated relation surface. Per the tranche,
 *   the carrier NEVER locally infers an edge's family: the family is read only
 *   from the `c_1_relation_family` property. An edge without it (or with an
 *   out-of-enum value) is `unclassified` with `absent` provenance — surfaced,
 *   never guessed from the relation type or shape.
 * Public surface: M0_RELATION_FAMILY_PROPERTY, M0_RELATION_FAMILIES,
 *   M0RelationFamily, M0RelationEdge, M0RelationFamilyProjection,
 *   buildM0RelationFamilyProjection.
 * Does NOT own: the schema enum authority (Body/S/S2/graph-schema
 *   relationships/rel.rs RELATION_FAMILY_VALUES — mirrored here, kept in sync by
 *   the enum test), edge classification (S2 dataset_import + sync_coordinator),
 *   the rendered React relation panel (Track 21 / 23 frontend-deep).
 */

/** Schema relation-family discriminator property (graph-schema rel.rs). */
export const M0_RELATION_FAMILY_PROPERTY = 'c_1_relation_family' as const;

/** The six schema-canonical relation families (mirror of RELATION_FAMILY_VALUES). */
export const M0_RELATION_FAMILIES = [
    'structural',
    'correspondential',
    'kernel_core',
    'inferred',
    'sync',
    'compatibility'
] as const;

export type M0RelationFamily = (typeof M0_RELATION_FAMILIES)[number];
/** An edge the graph did not classify — never locally inferred. */
export type M0RelationFamilyKey = M0RelationFamily | 'unclassified';

export interface M0RelationEdge {
    readonly source: string;
    readonly target: string;
    readonly relationType: string;
    readonly family: M0RelationFamilyKey;
    /** `graph` = read from c_1_relation_family; `absent` = unclassified, NOT inferred. */
    readonly familyProvenance: 'graph' | 'absent';
}

export interface M0RelationFamilyGroup {
    readonly family: M0RelationFamilyKey;
    readonly edges: readonly M0RelationEdge[];
}

export interface M0RelationFamilyProjection {
    readonly groups: readonly M0RelationFamilyGroup[];
    readonly edges: readonly M0RelationEdge[];
    /** Edges the graph left unclassified — surfaced honestly, never guessed. */
    readonly unclassifiedCount: number;
    /** Invariant marker: the carrier never derives family locally. */
    readonly locallyInferred: false;
}

const FAMILY_SET: ReadonlySet<string> = new Set(M0_RELATION_FAMILIES);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function asString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Group raw graph edges by their graph-sourced relation family. The family is
 * read strictly from `c_1_relation_family`; relationType/shape is NEVER used to
 * derive one. Absent or out-of-enum → `unclassified` / `absent`.
 */
export function buildM0RelationFamilyProjection(rawEdges: readonly unknown[]): M0RelationFamilyProjection {
    const edges: readonly M0RelationEdge[] = Object.freeze(
        (Array.isArray(rawEdges) ? rawEdges : []).map(raw => {
            const row = isRecord(raw) ? raw : {};
            const familyRaw = asString(row[M0_RELATION_FAMILY_PROPERTY]);
            const classified = familyRaw !== null && FAMILY_SET.has(familyRaw);
            return Object.freeze({
                source: asString(row.source) ?? asString(row.c_0_source_coordinate) ?? '',
                target: asString(row.target) ?? asString(row.c_0_target_coordinate) ?? '',
                relationType:
                    asString(row.relationType) ?? asString(row.type) ?? asString(row.c_2_relation_type) ?? '',
                family: (classified ? (familyRaw as M0RelationFamily) : 'unclassified') as M0RelationFamilyKey,
                familyProvenance: (classified ? 'graph' : 'absent') as 'graph' | 'absent'
            });
        })
    );

    const order: readonly M0RelationFamilyKey[] = [...M0_RELATION_FAMILIES, 'unclassified'];
    const groups: readonly M0RelationFamilyGroup[] = Object.freeze(
        order
            .map(family => Object.freeze({ family, edges: Object.freeze(edges.filter(e => e.family === family)) }))
            .filter(group => group.edges.length > 0)
    );

    return Object.freeze({
        groups,
        edges,
        unclassifiedCount: edges.filter(e => e.family === 'unclassified').length,
        locallyInferred: false as const
    });
}
