export * from './bases-view';

export const EXTENSION_ID = 'bases-view';
export const BASES_VIEW_WIDGET_ID = 'bases.view.panel';
export const BASES_VIEW_LABEL = 'Bimba Bases View';
export const BASES_VIEW_OPEN_COMMAND_ID = 'bases.view.open';

/** Default `.base` snapshot path for the static source — beside the Map projection. */
export const BASES_SNAPSHOT_ROOT = 'Idea/Bimba/Map/snapshots';

/** Gateway RPC method names the data adapters dispatch over the shared bridge. */
export const BASES_RPC = {
    staticRead: "s1'.vault.read_file",
    dynamicListByFilter: 's2.graph.list_by_filter',
    dynamicQuery: 's2.graph.query',
    dynamicRetrieve: "s2'.retrieve"
} as const;
