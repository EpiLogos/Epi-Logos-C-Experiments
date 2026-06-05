export const CANONICAL_CONTEXT_FRAME_LITERALS = [
  '(00/00)',
  '(0/1)',
  '(0/1/2)',
  '(0/1/2/3)',
  '(4.0/1-4.4/5)',
  '(4.5/0)',
  '(5/0)',
] as const;

const LEGACY_CONTEXT_FRAME_ALIASES = ['(0000)', '(4/5/0)'] as const;

const CONTEXT_FRAME_LITERALS = new Set<string>([
  ...CANONICAL_CONTEXT_FRAME_LITERALS,
  ...LEGACY_CONTEXT_FRAME_ALIASES,
]);

const FAMILY_HEAD_REGEX = /^([CPMSLT])(\d+)/;

export function convertHashToMFamily(coord: string): string {
  if (coord.startsWith('#')) {
    if (coord === '#') {
      return 'M';
    }
    const rest = coord.slice(1);
    const first = rest.charAt(0);
    if (/\d/.test(first) || first === '-' || first === '.') {
      return `M${rest}`;
    }
  }
  return coord;
}

export function isCanonicalCoordinateSyntax(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const body = input.endsWith("'") ? input.slice(0, -1) : input;

  // Bare family root (e.g. M, C, P, L, S, T) is valid
  if (body.length === 1 && /^[CPMSLT]$/.test(body)) {
    return true;
  }

  // Lens coordinate: family root followed by '-' and sub-coordinates (e.g. M-0, M-3)
  if (body.length >= 3 && /^[CPMSLT]-(?:\d+|\([^)]+\))/.test(body)) {
    const parts = body.split('-');
    const headSegment = parts[0];
    if (headSegment && headSegment.length === 1 && /^[CPMSLT]$/.test(headSegment)) {
      // Validate all subsequent segments in lens coordinate
      let index = 2; // start after 'M-'
      while (index < body.length) {
        const separator = body[index];
        if (separator !== '-' && separator !== '.') {
          return false;
        }
        index += 1;
        if (index >= body.length) {
          return false;
        }

        if (body[index] === '(') {
          const end = body.indexOf(')', index + 1);
          if (end === -1) {
            return false;
          }
          const frame = body.slice(index, end + 1);
          if (!CONTEXT_FRAME_LITERALS.has(frame)) {
            return false;
          }
          index = end + 1;
          continue;
        }

        const segmentStart = index;
        while (index < body.length && /\d/.test(body[index] ?? '')) {
          index += 1;
        }
        if (segmentStart === index) {
          return false;
        }
      }
      return true;
    }
  }

  const head = FAMILY_HEAD_REGEX.exec(body);
  if (!head) {
    return false;
  }

  let index = head[0].length;
  let previousSegment = head[2];
  if (!previousSegment) {
    return false;
  }

  while (index < body.length) {
    const separator = body[index];
    if (separator !== '-' && separator !== '.') {
      return false;
    }
    if (separator === '.' && previousSegment !== '4') {
      return false;
    }
    index += 1;
    if (index >= body.length) {
      return false;
    }

    if (body[index] === '(') {
      const end = body.indexOf(')', index + 1);
      if (end === -1) {
        return false;
      }
      const frame = body.slice(index, end + 1);
      if (!CONTEXT_FRAME_LITERALS.has(frame)) {
        return false;
      }
      previousSegment = frame;
      index = end + 1;
      continue;
    }

    const segmentStart = index;
    while (index < body.length && /\d/.test(body[index] ?? '')) {
      index += 1;
    }
    if (segmentStart === index) {
      return false;
    }
    previousSegment = body.slice(segmentStart, index);
  }

  return true;
}

