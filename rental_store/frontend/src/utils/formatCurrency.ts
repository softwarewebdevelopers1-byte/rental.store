export function formatCurrency(amount: number, currency = "KES"): string {
  const formatted = amount.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${currency} ${formatted}`;
}
