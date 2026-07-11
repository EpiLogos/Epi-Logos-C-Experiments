/**
 * Coordinate: M' M5-0' (Library projection lens — Track 16.T16.19)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: CCT-19's Library ACTIVATION — a pure coordinate-overlay LENS
 *   over vault entries (the existing file tree IS the Library; this only
 *   re-organises what is already there by coordinate ancestry, resolved
 *   from the frontmatter `coordinate:` key). Entries without a coordinate
 *   group under the honest `uncoordinated` shelf — nothing is invented.
 * Does NOT own: the file tree pane, vault IO, coordinate semantics.
 */

export interface LibraryEntry {
    readonly path: string;
    readonly coordinate: string | null;
}

export interface LibraryShelf {
    /** Coordinate family root (e.g. `C2`, `M5`, `S3'`) or `uncoordinated`. */
    readonly shelf: string;
    readonly entries: readonly LibraryEntry[];
}

/** The coordinate ancestry root an entry shelves under: the first
 *  coordinate segment (`C2-1` → `C2`, `M5-4.2` → `M5`, `S3'` → `S3'`). */
export function shelfFor(coordinate: string | null): string {
    const Some = coordinate?.trim();
    if (!Some || Some.length === 0) {
        return 'uncoordinated';
    }
    let root = Some.split('/')[0];
    root = root.split('.')[0];
    root = root.split('-')[0];
    return root;
}

/** Fold entries into coordinate-organised shelves, coordinate-sorted with
 *  `uncoordinated` always last; entries path-sorted within a shelf. */
export function buildLibraryProjection(entries: readonly LibraryEntry[]): LibraryShelf[] {
    const shelves = new Map<string, LibraryEntry[]>();
    for (const entry of entries) {
        const shelf = shelfFor(entry.coordinate);
        const bucket = shelves.get(shelf) ?? [];
        bucket.push(entry);
        shelves.set(shelf, bucket);
    }
    return [...shelves.entries()]
        .sort(([a], [b]) => {
            if (a === 'uncoordinated') {
                return 1;
            }
            if (b === 'uncoordinated') {
                return -1;
            }
            return a.localeCompare(b);
        })
        .map(([shelf, bucket]) => ({
            shelf,
            entries: [...bucket].sort((a, b) => a.path.localeCompare(b.path))
        }));
}
