/**
 * S5.2' kbase project scoping.
 *
 * Manages the bkmr --project hierarchy that bounds resource context
 * for DAY/NOW agent runs. This is the NotebookLM-type scoping layer:
 * each run gets a bounded resource field instead of the full corpus.
 *
 * Hierarchy:
 *   epi-logos                            (full corpus / fallback)
 *   epi-logos:{day_id}                   (day-bounded)
 *   epi-logos:{day_id}:{session_id}      (run-bounded)
 *   epi-logos:skills                     (Agora CF4a skill index)
 */

export const DEFAULT_KBASE_PROJECT = "epi-logos";

export interface KbaseProjectBinding {
  project: string;
  fallbackProject: string;
  scopeReason: string;
  boundAt: string;
}

export function buildRunScopedProject(
  dayId: string,
  sessionId: string,
  baseProject?: string,
): string {
  const base = baseProject || process.env.BKMR_PROJECT || DEFAULT_KBASE_PROJECT;
  return `${base}:${dayId}:${sessionId}`;
}

export function buildDayScopedProject(
  dayId: string,
  baseProject?: string,
): string {
  const base = baseProject || process.env.BKMR_PROJECT || DEFAULT_KBASE_PROJECT;
  return `${base}:${dayId}`;
}

export function resolveEffectiveProject(
  override?: string,
): string {
  return override || process.env.BKMR_PROJECT || DEFAULT_KBASE_PROJECT;
}

export function bindKbaseProject(
  dayId: string,
  sessionId: string,
  baseProject?: string,
): KbaseProjectBinding {
  const fallbackProject = resolveEffectiveProject(baseProject);
  return {
    project: buildRunScopedProject(dayId, sessionId, fallbackProject),
    fallbackProject,
    scopeReason: `DAY/NOW run: ${dayId}/${sessionId}`,
    boundAt: new Date().toISOString(),
  };
}
