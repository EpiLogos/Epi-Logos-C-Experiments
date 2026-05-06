/**
 * S5.2' kbase envelope metadata conventions.
 *
 * Well-known metadata keys for carrying kbase project scope
 * through the QlNativeOrchestrationEnvelope. Child agents inherit
 * these from the parent envelope so the --project scoping is automatic.
 */

export const METADATA_KBASE_PROJECT = "kbaseProject" as const;
export const METADATA_KBASE_PROJECT_FALLBACK = "kbaseProjectFallback" as const;

export type EnvelopeMetadata = Record<string, string | number | boolean | null>;

export function readKbaseProject(
  metadata: EnvelopeMetadata | undefined,
): string | undefined {
  if (!metadata) return undefined;

  const scoped = metadata[METADATA_KBASE_PROJECT];
  if (typeof scoped === "string" && scoped.trim()) {
    return scoped.trim();
  }

  const fallback = metadata[METADATA_KBASE_PROJECT_FALLBACK];
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return undefined;
}

export function setKbaseProject(
  metadata: EnvelopeMetadata,
  project: string,
  fallbackProject?: string,
): void {
  metadata[METADATA_KBASE_PROJECT] = project;
  if (fallbackProject) {
    metadata[METADATA_KBASE_PROJECT_FALLBACK] = fallbackProject;
  }
}

export function propagateKbaseToChild(
  parentMetadata: EnvelopeMetadata | undefined,
  childMetadata: EnvelopeMetadata,
): void {
  if (!parentMetadata) return;

  const project = parentMetadata[METADATA_KBASE_PROJECT];
  if (typeof project === "string" && project.trim()) {
    childMetadata[METADATA_KBASE_PROJECT] = project;
  }

  const fallback = parentMetadata[METADATA_KBASE_PROJECT_FALLBACK];
  if (typeof fallback === "string" && fallback.trim()) {
    childMetadata[METADATA_KBASE_PROJECT_FALLBACK] = fallback;
  }
}
