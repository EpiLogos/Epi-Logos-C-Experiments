/**
 * Pleroma Bounded Primitive Registry
 *
 * Defines the set of bounded primitives available to the Pleroma executive layer.
 * Each primitive has a name, description, execution mode, and child-extension policy.
 *
 * These primitives are substrate-level — they provide bounded execution surfaces
 * that atomic skills compose over. Skills define behavior; primitives provide machinery.
 */

export interface PrimitiveDef {
  name: string;
  description: string;
  allowChildExtension: boolean;
  executionMode: "bounded" | "interactive" | "background";
}

export const PRIMITIVE_REGISTRY: PrimitiveDef[] = [
  {
    name: "tmux",
    description: "Terminal multiplexer session management — aletheia-workshop substrate",
    allowChildExtension: true,
    executionMode: "interactive",
  },
  {
    name: "cmux",
    description: "Claude-managed terminal multiplexer — semantic window naming and routing",
    allowChildExtension: true,
    executionMode: "interactive",
  },
  {
    name: "mprocs",
    description: "Multi-process workshop manager — agent workshop lifecycle",
    allowChildExtension: true,
    executionMode: "background",
  },
  {
    name: "bkmr_kbase",
    description: "Knowledge base retrieval — bookmark and knowledge search",
    allowChildExtension: false,
    executionMode: "bounded",
  },
  {
    name: "onecontext",
    description: "Session context management — cross-session retrieval and Night' extraction",
    allowChildExtension: false,
    executionMode: "bounded",
  },
  {
    name: "ralph_tui",
    description: "Task orchestration TUI — PRD creation, execution, checkpoint management",
    allowChildExtension: true,
    executionMode: "interactive",
  },
  {
    name: "gitbutler",
    description: "Virtual branch management — lane creation, branch operations",
    allowChildExtension: false,
    executionMode: "bounded",
  },
  {
    name: "worktrunk",
    description: "Worktree lifecycle management — create, verify, cleanup isolated worktrees",
    allowChildExtension: true,
    executionMode: "bounded",
  },
  {
    name: "notebooklm",
    description: "Notebook query and source management — list, query, add/remove sources",
    allowChildExtension: false,
    executionMode: "bounded",
  },
];

export function getPrimitive(name: string): PrimitiveDef | undefined {
  return PRIMITIVE_REGISTRY.find((p) => p.name === name);
}

export function listPrimitives(): string[] {
  return PRIMITIVE_REGISTRY.map((p) => p.name);
}

export function isPrimitiveAllowed(name: string): boolean {
  return PRIMITIVE_REGISTRY.some((p) => p.name === name);
}

export function getAllowedForChildExtension(): string[] {
  return PRIMITIVE_REGISTRY.filter((p) => p.allowChildExtension).map((p) => p.name);
}
