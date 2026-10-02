/**
 * Comparison key for category names: normalize Unicode compatibility forms,
 * collapse every JavaScript whitespace run (including tabs and line breaks),
 * trim, then compare case-insensitively using the application's pt-BR locale.
 * This is only a comparison key; callers must preserve stored ticket values.
 */
export function normalizeCategoryName(name: string): string {
  return name.normalize("NFKC").replace(/\s+/gu, " ").trim().toLocaleLowerCase("pt-BR");
}

export function isSameCategoryName(left: string, right: string): boolean {
  return normalizeCategoryName(left) === normalizeCategoryName(right);
}

/** Return the persisted historical value when an update is only formatting. */
export function preserveUnchangedTicketCategory(
  existing: unknown,
  requested: unknown,
): { changed: boolean; value: string } {
  const oldValue = typeof existing === "string" ? existing : "";
  const newValue = typeof requested === "string" ? requested.trim() : "";
  if (oldValue && newValue && isSameCategoryName(oldValue, newValue)) {
    return { changed: false, value: oldValue };
  }
  return { changed: true, value: newValue };
}
