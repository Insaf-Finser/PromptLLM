/**
 * Replaces {{variable}} placeholders with concrete values.
 * Pairs with extractVariableNames in validators.ts — that extracts the
 * names, this fills them in. Missing values are left as-is rather than
 * silently blanked, so a bug here is visible in the raw output instead
 * of quietly corrupting the prompt sent to the model.
 */
export function interpolateTemplate(
  templateText: string,
  values: Record<string, string>
): string {
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, name) => {
    return name in values ? values[name] : match;
  });
}

/**
 * Returns the names declared by the template that have no matching
 * entry in values — used by the eval runner to skip a test case with
 * a clear reason instead of silently sending a half-filled prompt.
 */
export function findMissingVariables(
  declaredVariables: string[],
  values: Record<string, string>
): string[] {
  return declaredVariables.filter((name) => !(name in values));
}
