/**
 * Sorts an array of day abbreviations (M, T, W, TH, FR, SA, SU)
 * into their standard weekly order.
 * @param arr - Array of day abbreviations.
 * @returns Sorted array of day abbreviations.
 */
export function customSortDays(arr: string[]): string[] {
  const order: string[] = ["M", "T", "W", "TH", "FR", "SA", "SU"];
  const orderMap: Map<string, number> = new Map(
    order.map((day, index) => [day, index]),
  );

  const validDays: string[] = arr.filter((day) => orderMap.has(day));

  return validDays.sort(
    (a, b) => (orderMap.get(a) ?? -1) - (orderMap.get(b) ?? -1),
  );
}

/**
 * Generates a unique ID string.
 * @returns A unique string identifier.
 */
export function generateUniqueId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
