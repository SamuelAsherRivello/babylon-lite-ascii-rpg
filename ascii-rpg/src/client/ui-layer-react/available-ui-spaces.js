const overlaps = (left, right) => left.left < right.left + right.width
  && left.left + left.width > right.left
  && left.top < right.top + right.height
  && left.top + left.height > right.top;

export function getAvailableUiSpaces({ viewport, size, exclusions = [], margin = 8 }) {
  const width = Math.min(size.width, Math.max(1, viewport.width - margin * 2));
  const height = Math.min(size.height, Math.max(1, viewport.height - margin * 2));
  const candidates = [
    { left: margin, top: margin },
    { left: viewport.width - width - margin, top: margin },
    { left: margin, top: viewport.height - height - margin },
    { left: viewport.width - width - margin, top: viewport.height - height - margin },
    { left: (viewport.width - width) / 2, top: margin },
    { left: (viewport.width - width) / 2, top: viewport.height - height - margin },
  ].map((candidate) => ({ ...candidate, width, height }));
  return candidates.sort((left, right) => {
    const leftOverlaps = exclusions.filter((exclusion) => overlaps(left, exclusion)).length;
    const rightOverlaps = exclusions.filter((exclusion) => overlaps(right, exclusion)).length;
    return leftOverlaps - rightOverlaps;
  });
}

export function getCurrentUiExclusions(root = document) {
  return [...root.querySelectorAll("[data-ui-space-exclusion]")]
    .map((element) => element.getBoundingClientRect())
    .filter(({ width, height }) => width > 0 && height > 0)
    .map(({ left, top, width, height }) => ({ left, top, width, height }));
}
