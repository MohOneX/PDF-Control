/** Turn sorted 1-based page numbers into a compact CSV with ranges (e.g. 1-3,5,8-9). */
export function formatPageNumbers(pages: number[]): string {
  if (pages.length === 0) return "";

  const sorted = [...new Set(pages.filter((n) => Number.isFinite(n) && n > 0))]
    .map((n) => Math.floor(n))
    .sort((a, b) => a - b);

  if (sorted.length === 0) return "";

  const parts: string[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const page = sorted[i];
    if (page === rangeEnd + 1) {
      rangeEnd = page;
      continue;
    }
    parts.push(
      rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
    );
    rangeStart = page;
    rangeEnd = page;
  }

  parts.push(
    rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
  );
  return parts.join(",");
}
