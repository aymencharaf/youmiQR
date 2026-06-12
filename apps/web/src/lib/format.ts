// Format prices in Algerian Dinar (DZD)
export function formatDZD(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-DZ').format(value)
}
