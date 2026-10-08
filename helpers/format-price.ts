// Вставляем пробел перед каждой группой из трёх цифр справа: 24000 → 24 000.
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const [integer, fraction] = String(value).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped}${fraction ? `,${fraction}` : ""} ₽`;
}
