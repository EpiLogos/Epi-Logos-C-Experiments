export function formatIdeaDisplayPath(
  fullPath: string,
  ideaRoot?: string,
  pathSeparator = '/'
): string {
  const normalizedFullPath = normalizePath(fullPath, pathSeparator);
  const normalizedIdeaRoot = ideaRoot
    ? normalizePath(ideaRoot, pathSeparator).replace(/\/+$/, '')
    : findIdeaRoot(normalizedFullPath);

  if (!normalizedIdeaRoot) {
    return normalizedFullPath;
  }

  if (
    normalizedFullPath === normalizedIdeaRoot ||
    normalizedFullPath.startsWith(`${normalizedIdeaRoot}/`)
  ) {
    const suffix = normalizedFullPath.slice(normalizedIdeaRoot.length);
    return suffix ? `/Idea${suffix}` : '/Idea';
  }

  return normalizedFullPath;
}

function normalizePath(value: string, pathSeparator: string): string {
  const escapedSeparator = pathSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return value.replace(new RegExp(escapedSeparator, 'g'), '/');
}

function findIdeaRoot(normalizedFullPath: string): string | null {
  const ideaIndex = normalizedFullPath.indexOf('/Idea');
  if (ideaIndex === -1) {
    return null;
  }

  const trailing = normalizedFullPath.slice(ideaIndex + '/Idea'.length);
  return `${normalizedFullPath.slice(0, ideaIndex)}/Idea${trailing.startsWith('/') ? '' : ''}`;
}
