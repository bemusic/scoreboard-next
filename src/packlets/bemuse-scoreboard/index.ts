/**
 * Calculates the accuracy.
 * @param count - The 3-element array containing METICULOUS judgment,
 * PRECISE judgment, and GOOD judgment, respectively.
 * @param total - The total amount of possible judgments that may be given.
 * @returns the accuracy number, from 0 to 1
 */
export function calculateAccuracy(count: number[], total: number) {
  return (count[0] + count[1] * 0.8 + count[2] * 0.5) / total
}

/**
 * Format the accuracy number.
 */
export function formatAccuracy(accuracy: number) {
  return (accuracy * 100).toFixed(2) + '%'
}
