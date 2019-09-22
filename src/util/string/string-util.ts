/**
 * Swaps the casing of the given string
 */
export function swapCase(s: string): string {
  return s.replace(/\w/g, ch => {
    const up = ch.toUpperCase()
    return ch === up ? ch.toLowerCase() : up
  })
}
