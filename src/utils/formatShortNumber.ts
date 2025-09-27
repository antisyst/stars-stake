export function formatShortNumber(value: number): string {
  if (value >= 1e6) {
    const v = (value / 1e6).toFixed(1)
    return `${v.replace(/\.0$/, '')}M`
  }
  if (value >= 1e3) {
    const v = (value / 1e3).toFixed(1)
    return `${v.replace(/\.0$/, '')}K`
  }
  return value.toString()
}