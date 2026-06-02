import { invoke } from './invoke';
import type {
  GraphData,
  GraphNode,
  GraphWalkResult,
  WalkKind,
  BimbaPosition,
  SubGraphGeometry,
  GeometryClass,
} from './types';

export const graphClient = {
  connect: () => invoke<void>('graph_connect'),
  disconnect: () => invoke<void>('graph_disconnect'),
  getGraph: () => invoke<GraphData>('graph_get_full'),
  getNode: (id: string) => invoke<GraphNode | null>('graph_get_node', { id }),
  getByCoordinate: (coordinate: string) =>
    invoke<GraphNode | null>('graph_get_by_coordinate', { coordinate }),
  walk: (start: string, kind: WalkKind, depth?: number) =>
    invoke<GraphWalkResult>('graph_walk', { start, kind, depth }),
  queryRaw: (cypher: string, params?: unknown) =>
    invoke<unknown>('graph_query_raw', { cypher, params }),
  hexagonalPosition: (coordinate: string) =>
    invoke<BimbaPosition>('graph_hexagonal_position', { coordinate }),
  batchPositions: (coordinates: string[]) =>
    invoke<[string, BimbaPosition][]>('graph_batch_positions', { coordinates }),
  geometryFor: (coordinate: string) =>
    invoke<SubGraphGeometry>('graph_geometry_for', { coordinate }),
  setGeometryOverride: (coordinate: string, geometryClass: GeometryClass) =>
    invoke<SubGraphGeometry>('graph_set_geometry_override', { coordinate, class: geometryClass }),
};
