export function pluralize(count: number, forms: readonly [string, string, string]): string {
  const value = Math.abs(count) % 100;
  if (value >= 11 && value <= 19) return forms[2];
  const lastDigit = value % 10;
  if (lastDigit === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
  return forms[2];
}
