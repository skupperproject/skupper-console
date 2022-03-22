/**
 * Get a text and return it Capitalized.
 */
export function capitalizeFirstLetter(string: string): string {
  return string.trim().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Get a text and return it Capitalized for all the words.
 */
export function capitalizeAllFirstLetters(string: string): string {
  return string.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}
